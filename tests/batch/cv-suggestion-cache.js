const assert = require('chai').assert;

const {data} = require('../../lib/import/metadata');


describe('Suggestions', function() {


	it('..can pre-populate the cache', async () => {

		let counter = 0;

		for ( let year = 2018; year > 2010; year--){
			for (let issue = 1; issue < 52; issue++){
				debugger;
				let results = await data(issue, year);
				counter += results.length;
				console.log( `Total cached: ${counter} results.`);
			}
		}

	});



});
