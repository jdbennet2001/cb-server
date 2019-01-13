const fs 	= require('fs');
const path 	= require('path');
const _ 	= require('lodash')


/*
 Return all files and directories in a given location, in the form:
 {
	files: [String],
	folder: [String]
 }
 */

 async function scan_directory(directory){

 	let data = await traverse(directory);

 	let files = data.filter(resource =>{
		 let type = (resource.type === 'FILE');
		 let basename = path.basename(resource.fPath);
		 let hidden = basename.startsWith('.');
		 let archive = _.endsWith(resource.fPath, 'cbz') || _.endsWith(resource.fPath, 'cbr')
		 return type && archive && !hidden;
	})

	files = files.map(file =>{
		return file.fPath;
	})

	let folders = data.filter(resource =>{
		let type = resource.type === 'DIRECTORY';
		let basename = path.basename(resource.fPath);
		let hidden = basename.startsWith('.');
		return type && !hidden;
	})


	folders = folders.map(folder =>{
		return folder.fPath;
	})

	return {files, folders}
 }


/*
 Async function to recursively traverse a directory structure
 */
async function traverse(directory){


	//Sanity check, don't return hidden directories
	let base = path.basename(directory);
	if ( _.startsWith(base, '.' ) ){
		return [];
	}

	process.emit('info', `Scanning ${directory}`)
	
	let resources = fs.readdirSync(directory);
	let results = resources.map(resource =>{

        // builds full path of file
        const fPath = path.resolve(directory, resource);

        // prepare stats obj
        const fileStats = { resource, path: fPath };

        //Classify the object
        const type = fs.statSync(fPath).isDirectory() ? 'DIRECTORY' : 'FILE';

        return {fPath, type};
	})

	let children = results.filter(resource =>{
		return resource.type === 'DIRECTORY';
	})

	while( children.length > 0 ){
		let child = children.pop();
		let tmp = await traverse(child.fPath);
		results = results.concat(tmp);
	}

    return results;
}

module.exports = {traverse, scan: scan_directory};