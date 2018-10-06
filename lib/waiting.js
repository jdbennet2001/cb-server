const {scan_directory} 		= require('./utils/fs');
const nconf     			= require('nconf');
const path 					= require('path');
const _ 					= require('lodash'); 

const pending_dir 			= nconf.get('pending_dir');

/*
 Walk the download directory returning all unfiled archives

 type File{
	name: String
	location: String
 }

 return [File]
 */
function waiting(){

	let {files} = scan_directory(pending_dir);
	let comics = _.map(files, file =>{
		return { name: path.basename(file),	location: file}		
	})
	return comics;
}

module.exports = {waiting};