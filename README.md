# defaultjs-html-typeahead

- [defaultjs-html-typeahead](#defaultjs-html-typeahead)
  - [How install](#how-install)
  - [How to use](#how-to-use)
  - [Dom Events](#dom-events)
    - [d-typeahead:load-suggestion](#d-typeaheadload-suggestion)
    - [d-typeahead:show-suggestion](#d-typeaheadshow-suggestion)
    - [d-typeahead:selected-suggestion](#d-typeaheadselected-suggestion)
  - [Javascript API](#javascript-api)

## How install

```console
npm install @default-js/defaultjs-html-typeahead
```

## How to use declarative?

The `defaultjs-html-typeahad` provide multiple ways to achieve the solution:

### 1. Solution
There is a service available, there a suggestion provide and the response is a json array with the folowing stucture:

```javascript
[
  {
    "text" : "[string]",
    "value" : "[String]", //optional
  },
  ...
]
```

`defaultjs-html-typeahead` can be used as follow:

```html
<input type="text" is="d-typeahead" request="/request/to/suggestion/data.json">
```

The value would be set as value of input field.

### 2. Solution
There is a service available, there provide a suggestion data, but the structure does not meet the required specification:

```html
<input type="text" is="d-typeahead" 
  request="/request/to/suggestion/data.json" 
  response-suggestions="[expression to select the array with suggestions]" 
  suggestion-text="[expression to select and/or build the suggestion text]" 
  suggestion-value="[expression to select and/or build the suggestion value]">
```

The expression for `response-suggestions`, `suggestion-text` and `suggestion-value` uses the expression language `@default-js/defaultjs-expression-language`.

## How to use programmatically?

```html
<input type="text" is="d-typeahead" self-handle-selection>
```

```javascript
//main.js
const input = document.queryElement("input");
input.on("d-typeahead:load-suggestion", (event) => {
  event.stopPropagation();
  const suugestions = [
    {
      title: "suggestion title one", //required
      value: "suggestion value one", //optional
      data: {name: "suggestion data one"}  //optional
    },
    {
      title: "suggestion title two", //required
      value: "suggestion value two", //optional
      data: {name: "suggestion data two"}  //optional
    },
    {
      title: "suggestion title three", //required
      value: "suggestion value three", //optional
      data: {name: "suggestion data three"}  //optional
    }
  ];

  input.trigger("d-typeahead:show-suggestion", suggestions);
});

input.on("d-typeahead:selected-suggestion", (event) => {
  event.stopPropagation();
  const data = event.details;
  //by self-handle-selection, the value of input field must set manually!
  input.value = data.name;

  //do somethings
});
```

## Dom Events

### d-typeahead:load-suggestion

### d-typeahead:show-suggestion

### d-typeahead:selected-suggestion

## Javascript API
