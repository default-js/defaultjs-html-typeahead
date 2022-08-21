import "@default-js/defaultjs-extdom";
import GLOBAL from "@default-js/defaultjs-common-utils/src/Global";
import HTMLTypeaheadElement from "./src/HTMLTypeaheadElement";

GLOBAL.defaultjs = GLOBAL.defaultjs || {};
GLOBAL.defaultjs.html = GLOBAL.defaultjs.html || {};
GLOBAL.defaultjs.html.HTMLTypeaheadElement = GLOBAL.defaultjs.html.HTMLTypeaheadElement || HTMLTypeaheadElement;

export {HTMLTypeaheadElement};
