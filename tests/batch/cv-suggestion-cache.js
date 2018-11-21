const assert = require('chai').assert;
const _ = require('lodash');

const {
	data
} = require('../../lib/import/metadata');


describe('Suggestions', function() {


	it('..can pre-populate the cache', async () => {

		for (var year = 2018; year > 2001; year--) {
			for (var issue = 1; issue < 52; issue++) {
				let issues = await data(issue, year);
				assert.isNotEmpty(issues);
			}
		}

	});

});