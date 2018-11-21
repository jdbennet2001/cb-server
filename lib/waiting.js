const {scan_directory} 		= require('./utils/fs');
const nconf     					= require('nconf');
const path 								= require('path');
const _ 									= require('lodash');
const fs 									= require("fs");
const jsonfile 						= require('jsonfile');

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
		let {size} = fs.statSync(file);
		return { name: path.basename(file),	location: file, size}
	})

	debugger;

	//Filter out trades
	comics = comics.filter(comic =>{
		return comic.size < 1024 * 1024 * 100;
	})

	//Filter out filed issues;
	let filed = getFiled();

	comics = _.filter(comics, comic =>{
		return !_.includes(filed, comic.location);
	})

	return comics;
}

function getFiled(){
	let cache_path = path.join(__dirname, `../data/import-queue.json`);
	let data = fs.existsSync(cache_path) ? jsonfile.readFileSync(cache_path) : [];
	let list = _.map(data, item =>{
		return item.from;
	})
	return list;
}

module.exports = {waiting};
