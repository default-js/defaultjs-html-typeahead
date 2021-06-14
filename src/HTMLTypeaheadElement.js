import { createUID } from "@default-js/defaultjs-html-components/src/Component";
import { toNodeName, define } from "@default-js/defaultjs-html-components/src/utils/DefineComponentHelper";
import { componentEventname } from "@default-js/defaultjs-html-components/src/utils/EventHelper";
import { privateProperty } from "@default-js/defaultjs-common-utils/src/PrivateProperty";
import Renderer from "@default-js/defaultjs-template-language/src/Renderer";
import Template from "@default-js/defaultjs-template-language/src/Template";
import ExpressionResolver from "@default-js/defaultjs-expression-language/src/ExpressionResolver";
import {lazyPromise} from "@default-js/defaultjs-common-utils/src/PromiseUtils";

const NODENAME = toNodeName("typeahead");
const PRIVATE_READY = "ready";
const PRIVATE_SUGGESTION_BOX = "suggestionBox"


const DEFAULT_TEMPLATE = Template.load(
	`<jstl jstl-foreach="\${suggestions}" jstl-foreach-var="suggestion">
	<option value="\${suggestion.value}">\${suggestion.text}</option>
</jstl>`, false);

const EVENT_LOAD_SUGGESTION = componentEventname("load-suggestion", NODENAME);
const EVENT_SHOW_SUGGESTION = componentEventname("show-suggestion", NODENAME);
const TIMEOUT_INTERVAL = 100;

const ATTRIBUTES = [];


const initSuggestionBox = (input) => {
	const id = createUID("id-", "");
	const box = create(`<datalist id="${id}"></datalist>`).first();

	input.after(box);
	input.attr("list", id)

	return box;
};

class HTMLTypeaheadElement extends HTMLInputElement {
	static get observedAttributes() {
		return ATTRIBUTES;
	}

	static get NODENAME() {
		return NODENAME;
	}

	constructor() {
		super();
		privateProperty(this, PRIVATE_READY, lazyPromise());

	}

	get ready() {
		return privateProperty(this, PRIVATE_READY);
	}

	async init() {
		const { ready } = this;

		const suggestionBox = initSuggestionBox(this);
		privateProperty(this, PRIVATE_SUGGESTION_BOX, suggestionBox);


		if (!ready.resolved) {
			let inputTimeout = null;
			this.on("input change focus", (event) => {
				suggestionBox.empty();
				
				if (inputTimeout)
					clearTimeout(inputTimeout);

				const value = this.value;
				inputTimeout = setTimeout(async () => {
					if (value == this.value)
						this.trigger(EVENT_LOAD_SUGGESTION, value);
				}, TIMEOUT_INTERVAL);
			});

			let showTimeout = null;
			this.on(EVENT_SHOW_SUGGESTION, (event) => {
				if (showTimeout)
					clearTimeout(inputTimeout);

				const data = event.detail;
				showTimeout = setTimeout(async () => {
					this.suggestions(data);
				}, TIMEOUT_INTERVAL);
			});
		}
	}

	async suggestions(suggestions) {
		await this.ready;
		const suggestionBox = privateProperty(this, PRIVATE_SUGGESTION_BOX);
		
		if (suggestions) {
			await Renderer.render({
				container: suggestionBox,
				template: await DEFAULT_TEMPLATE,
				data: { suggestions }

			})
		}
	}

	async destroy() {
		if (this.ready.resolved){
			privateProperty(this, PRIVATE_READY, lazyPromise());
			privateProperty(this, PRIVATE_SUGGESTION_BOX, null);
		}
	}

	connectedCallback() {
		if (this.ownerDocument == document) (async () => {
			await this.init(this);
			this.ready.resolve();
		})();
	}

	adoptedCallback() {
		this.connectedCallback();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue != newValue && this.isConnected) {
			this.trigger(triggerTimeout, attributeChangeEventname(name, this));
			this.trigger(triggerTimeout, componentEventname("change", this));
		}
	}

	disconnectedCallback() {
		this.destroy();
	}
};

define(HTMLTypeaheadElement, { extends: "input" })

export default HTMLTypeaheadElement;