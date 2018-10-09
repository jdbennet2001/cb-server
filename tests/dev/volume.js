const assert = require('chai').assert;

const {volume} = require('../../lib/import/suggestions');


describe('Volumes', function() {

	debugger;
	it('.. can return information for Flash #091', async () => {
		let {count, location} = volume('3790');
		assert.isNumber(count);
		assert.isString(location);
	});



});
