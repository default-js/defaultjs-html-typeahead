const body = document.body;





body.on("d-typeahead:load-suggestion", (event) => {
	console.log(event);
	const value = event.detail;
	if (value) {

		const suggestions = [];
		for (let i = 0; i < 10; i++) {
			suggestions.push({
				value: `${value}-${i}`,
				text: `${value}-${i}`
			});
		}

		event.target.trigger("d-typeahead:show-suggestion", suggestions);
	}
});


body.on("d-typeahead:selected-suggestion", (event) => {
	console.log(event);
	const value = event.detail;
	
	event.target.value = value;
	
	
});