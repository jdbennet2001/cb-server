const fs 		= require("fs");
const _ 		= require('lodash');
const path 		= require('path'); 

/*
 Return fully qualified paths for all  useful files in a directory
 {
 	files: []
	folders: []
 }
 */
function scan_directory(directory){

	let catalog_model = fs.readdirSync( directory );

	console.log(`Scanning folder: ${directory}`);

	//Remove system generated directories / thumbnails
	catalog_model = catalog_model.filter(entry => {
		return !_.startsWith(entry,'.') && !_.startsWith(entry, '_');
	})

	//Map basename to fully qualified path names
	catalog_model = catalog_model.map( entry => {
		return path.join(directory, entry);
	})

	//Seperate out files and folders
	let files = catalog_model.filter(entry => {
			return fs.statSync(entry).isFile();
	})


	let folders = catalog_model.filter(entry => {
			return fs.statSync(entry).isDirectory();
	})

	_.forEach(folders, folder =>{
		let results = scan_directory(folder);
		files = _.concat(files, results.files);
		folders = _.concat(folders, results.folders);
	})

	return {files, folders};

}

module.exports = {scan_directory}