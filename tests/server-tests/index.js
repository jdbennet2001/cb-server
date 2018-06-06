const assert = require('chai').assert;

const path    	= require('path');
const _       	= require('lodash');
const jsonfile 	= require('jsonfile')
const S  		= require('string');

const {	index } = require('../..//lib/library')


describe('Library code', function() {

	this.timeout(0);

	debugger;
	it('can scan a source directory.', function(){
		let archive_folder = path.join(__dirname, '../archives');
		let model = index(archive_folder);
		return model;
	});

	

});
