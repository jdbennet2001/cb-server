const assert = require('chai').assert;

const {importComic} = require('../../lib/import/importComic');


describe('Import', function() {

	let from ="/Users/jdbennet@ca.ibm.com/Documents/comics/X-Men Blue 034 (2018) (Digital) (Zone-Empire).cbr";
	let to ="/Users/jdbennet@ca.ibm.com/projects/tmp/comics/Marvel/X-Men/X-Men Blue 2017 (100712)/X-Men: Blue #034 (2018-08-29) - Surviving the Experience Part Two"

	it('.. can import a new comic', async () => {
		let status = importComic(from, to);
		assert.isDefined(status);
	});



});
