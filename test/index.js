import "@default-js/defaultjs-extdom";
import HTMLTypeaheadElement from "../src/HTMLTypeaheadElement";


describe("test", () => {
	
	it("init tests", async () => {
        const element =	create(`<input type="text" is="d-typeahead">`).first();
        document.body.append(element);
        await element.ready;
		expect(element instanceof HTMLTypeaheadElement).toBe(true);
		expect(element.ready.resolved).toBe(true);
		
        element.remove();
	});
	
});
