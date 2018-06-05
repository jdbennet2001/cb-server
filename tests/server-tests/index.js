const assert = require('chai').assert;

const path    	= require('path');
const _       	= require('lodash');
const jsonfile 	= require('jsonfile')
const S  		= require('string');

const {
	archive_name,
	archive_directory,
	parent_directories,
	child_directories,
	child_archives
} = require('../../src/lib/model')

let path_to_model = path.join(__dirname, '../../server/data/model.json')
let json = jsonfile.readFileSync(path_to_model);

//Map existing model to new format.
let model = json.archives.map( archive => {
	return {location: archive.location, length: archive.length};
});

describe('Model (Catalog) tests', function() {

	it('Can extract a file name from model', function(){
		let calvin_and_hobbes = _.head(model);
		let name = archive_name(calvin_and_hobbes.location);
		assert.isString(name);
	});

	it('Can find all parent directories', function(){
		let calvin_and_hobbes = _.head(model);
		let directories = parent_directories(calvin_and_hobbes.location);
		assert.isArray(directories);
	})

	it('Can find all child directories', function(){

		let flash_91 = _.find(model, function(o){
			return S(o.location).contains('Flash #091');
		});

		let flash_series_dir = path.dirname(flash_91.location);
		let flash_dir = path.dirname(flash_series_dir);

		let directory = child_directories(flash_dir, model);
		assert.isArray(directory);

	})

	it('Can find all child archives', function(){

		let flash_91 = _.find(model, function(o){
			return S(o.location).contains('Flash #091');
		});

		debugger;
		let flash_series_dir = path.dirname(flash_91.location);
		
		let files = child_archives(flash_series_dir, model);
		assert.isArray(files);
	})


});
