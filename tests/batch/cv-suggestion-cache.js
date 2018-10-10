const assert = require('chai').assert;
const _ 		 = require('lodash');

const {data} = require('../../lib/import/metadata');


describe('Suggestions', function() {


	it('..can pre-populate the cache', async () => {

		for ( let year = 2018; year > 2010; year--){
			for (let issue = 1; issue < 26; issue++){
				let results = await data(issue, year);
				console.log( `Total cached: ${_.size(results)} results.`);
			}
		}

	});



});
