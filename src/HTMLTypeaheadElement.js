import { createUUID, componentBaseOf } from "@default-js/defaultjs-html-components/src/Component";
import { toNodeName, define } from "@default-js/defaultjs-html-components/src/utils/DefineComponentHelper";
import { componentEventname } from "@default-js/defaultjs-html-components/src/utils/EventHelper";
import { privatePropertyAccessor } from "@default-js/defaultjs-common-utils/src/PrivateProperty";
import Renderer from "@default-js/defaultjs-template-language/src/Renderer";
import Template from "@default-js/defaultjs-template-language/src/Template";
import ExpressionResolver from "@default-js/defaultjs-expression-language/src/ExpressionResolver";
import HTMLRequestElement from "@default-js/defaultjs-html-request/src/HTMLRequestElement";

const NODENAME = toNodeName("typeahead");
const _suggestionBox = privatePropertyAccessor("suggestionBox");
const _request = privatePropertyAccessor("request");
const _suggestionMap = privatePropertyAccessor("suugestionMap");

const DEFAULT_TEMPLATE = Template.load(
	`<jstl jstl-foreach="\${suggestions}" jstl-foreach-var="suggestion">
	<option value="\${suggestion.value}">\${suggestion.text}</option>
</jstl>`,
	false,
);

const EVENT_LOAD_SUGGESTION = componentEventname("load-suggestion", NODENAME);
const EVENT_SHOW_SUGGESTION = componentEventname("show-suggestion", NODENAME);
const EVENT_SELECTED_SUGGESTION = componentEventname("selected-suggestion", NODENAME);
const TIMEOUT_INTERVAL = 100;

const ATTRIBUTE_SELF_HANDLE_SELECTION = "self-handle-selection";
const ATTRIBUTE_MIN_INPUT_SIZE = "min-input-size";
const ATTRIBUTE_REQUEST = "request";
const ATTRIBUTE_RESPONSE_SUGGESTIONS = "response-suggestions";
const ATTRIBUTE_SUGGESTION_VALUE = "suggestion-value";
const ATTRIBUTE_SUGGESTION_TEXT = "suggestion-text";
const ATTRIBUTES = [];

const toSuggestionMap = (input, suggestions) => {
	const map = new Map();
	if (suggestions) {
		for (let suggestion of suggestions) map.set(suggestion.value, suggestion);
	}
	_suggestionMap(input, map);
};

const getSuggestionData = (input, value) => {
	const map = _suggestionMap(input);
	const suggestion = map.get(value);
	if (!suggestion) return null;

	return suggestion.data || value;
};

const initSuggestionBox = (input) => {
	const id = createUUID("id-", "");
	const box = create(`<datalist id="${id}"></datalist>`).first();

	input.after(box);
	input.attr("list", id);

	_suggestionBox(input, box);
};

const initInputHandle = (input) => {
	let inputTimeout = null;
	input.on("input focus", (event) => {
		if (inputTimeout) clearTimeout(inputTimeout);

		if (event.type == "input" && (!event.inputType || event.inputType == "insertReplacementText")) {
			if (input.selfHandleSelection) {
				event.preventDefault();
				event.stopPropagation();
			}
			input.trigger(EVENT_SELECTED_SUGGESTION, getSuggestionData(input, input.value));

			return;
		}
		const value = input.value || "";
		if (value.length >= input.minInputSize) {
			inputTimeout = setTimeout(async () => {
				if (value == input.value) input.trigger(EVENT_LOAD_SUGGESTION, value);
			}, TIMEOUT_INTERVAL);
		}
	});
};

const initHandleSuggestions = (input) => {
	let showTimeout = null;
	input.on(EVENT_SHOW_SUGGESTION, (event) => {
		if (showTimeout) clearTimeout(showTimeout);

		const data = event.detail;
		showTimeout = setTimeout(async () => {
			input.suggestions(data);
		}, TIMEOUT_INTERVAL);
	});
};

const getRequestElement = (selector) => {
	try {
		let request = find(selector).first();
		if (request instanceof HTMLRequestElement) return request;
	} catch (e) {
		//ignore
	}

	return null;
};

const getRequest = (input) => {
	let request = _request(input);
	if (!request) {
		const value = input.attr(ATTRIBUTE_REQUEST);
		request = getRequestElement(value) || value;
		_request(input, request);
	}

	return request;
};

const executeRequest = async (input, value) => {
	let request = getRequest(input);
	const context = { value, input };

	if (request instanceof HTMLRequestElement) return request.execute(context);
	else if (typeof request === "string") {
		request = await ExpressionResolver.resolveText(request, context);
		const url = new URL(request, location);

		return fetch(url.toString());
	}
};

const handleResponse = async (input, response) => {
	if (input.hasAttribute(ATTRIBUTE_RESPONSE_SUGGESTIONS)) response = await ExpressionResolver.resolve(input.attr(ATTRIBUTE_RESPONSE_SUGGESTIONS), response, []);

	const textSelector = input.attr(ATTRIBUTE_SUGGESTION_TEXT) || "text";
	const valueSelector = input.attr(ATTRIBUTE_SUGGESTION_VALUE) || "value";

	const result = [];
	for (let item of response) {
		const type = typeof item;
		let text = null;
		let value = null;

		if (type === "string" || type === "number") value = text = item;
		else {
			text = await ExpressionResolver.resolveText(textSelector, item, null);
			value = await ExpressionResolver.resolveText(valueSelector, item, null);
		}

		result.push({
			text: text ? text : value,
			value: value ? value : text,
		});
	}

	input.trigger(EVENT_SHOW_SUGGESTION, result);
};

const initHandleRequest = (input) => {
	input.on(EVENT_LOAD_SUGGESTION, (event) => {
		event.stopPropagation();

		const value = event.detail;
		(async () => {
			let response = await executeRequest(input, value);
			response = await response.json();
			response = await handleResponse(input, response);
		})();
	});
};

class HTMLTypeaheadElement extends componentBaseOf(HTMLInputElement) {
	static get observedAttributes() {
		return ATTRIBUTES;
	}

	static get NODENAME() {
		return NODENAME;
	}

	#initialized = false;

	constructor() {
		super();
	}

	get selfHandleSelection() {
		return this.hasAttribute(ATTRIBUTE_SELF_HANDLE_SELECTION);
	}

	set selfHandleSelection(value) {
		if (value) this.attr(ATTRIBUTE_SELF_HANDLE_SELECTION, "");
		else this.attr(ATTRIBUTE_SELF_HANDLE_SELECTION, null);
	}

	async init() {
		await super.init();

		if (!this.#initialized) {
			initSuggestionBox(this);
			initInputHandle(this);
			initHandleSuggestions(this);
			this.minInputSize = parseInt(this.attr(ATTRIBUTE_MIN_INPUT_SIZE) || "0");

			if (this.hasAttribute(ATTRIBUTE_REQUEST)) initHandleRequest(this);

			this.#initialized = true;
		}
	}

	async suggestions(suggestions) {
		await this.ready;
		toSuggestionMap(this, suggestions);
		const suggestionBox = _suggestionBox(this);
		if (suggestions) {
			await Renderer.render({
				container: suggestionBox,
				template: await DEFAULT_TEMPLATE,
				data: { suggestions },
			});
		}
	}

	async destroy() {
		if (this.ready.resolved) {
			_suggestionBox(this, null);
			_request(this, null);
		}
	}
}

define(HTMLTypeaheadElement, { extends: "input" });

export default HTMLTypeaheadElement;
