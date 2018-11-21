const assert = require('chai').assert;

const {volume_info} = require('../../lib/import/volume');


describe('Volumes', function() {

	debugger;
	it('.. can return information for Flash #091', async () => {
		let {name, publisher, start_year, directory} = await volume_info('3790');
		assert.isDefined(name);
	});



});
