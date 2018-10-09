const assert = require('chai').assert;

const {suggestions} = require('../../lib/import/suggestions');


describe('Suggestions', function() {

	debugger;
	it('can return information for Spiderman #004, 2018', async () => {
		let results = await suggestions(4, 2018, "Spider-Man");
		assert.isNotEmpty(results);
	});

	

});
