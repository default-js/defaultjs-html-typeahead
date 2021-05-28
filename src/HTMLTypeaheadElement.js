import Component from "@default-js/defaultjs-html-components/src/Component";
import { toNodeName, define } from "@default-js/defaultjs-html-components/src/utils/DefineComponentHelper";
import { componentEventname } from "@default-js/defaultjs-html-components/src/utils/EventHelper";
import { defValue } from "@default-js/defaultjs-common-utils/src/ObjectUtils";
import { privateProperty } from "@default-js/defaultjs-common-utils/src/PrivateProperty";
import Renderer from "@default-js/defaultjs-template-language/src/Renderer";
import Template from "@default-js/defaultjs-template-language/src/Template";
import ExpressionResolver from "@default-js/defaultjs-expression-language/src/ExpressionResolver";

const NODENAME = toNodeName("typeahead");


const SUGGESTIONBOX = `<datalist></datalist>`;
const DEFAULT_TEMPLATE = Template.load( 
`<jstl jstl-foreach="\${suggestions}" jstl-foreach-var="\${suggestion}">
	<option value="\${value}">\${text}</option>
</jstl>`, false);

const EVENT_SHOW_SUGGESTION = componentEventname("show-suggestion", NODENAME);


const ATTRIBUTES = [];

class HTMLTypeaheadElement extends HTMLInputElement{
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
	
	get ready(){
		return privateProperty(this, PRIVATE_READY);
	}

	async init() {
		const ready = this;		
	}
	
	showSuggestion(){
		
	}
	
	hideSuggestion(){
		
	}
	
	
	

	async destroy() {
		if(this.ready.resolved)
			privateProperty(this, PRIVATE_READY, lazyPromise());
	}

	connectedCallback() {
		if (this.ownerDocument == document) init(this);
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

	disconnectedCallback(){
		this.destroy();
	}
};



export default HTMLTypeaheadElement;