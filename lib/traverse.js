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

 	let resources = await traverse(directory);

 	debugger;

 	//Filter out hidden files/directories
 	resources = resources.filter(resource =>{
 		let basename = path.basename(resource.fPath);
 		let hidden = basename.startsWith('.');
 		return !hidden;
 	})

 	let files = resources.filter(resource =>{
		 let type = (resource.type === 'FILE');
		 let archive = _.endsWith(resource.fPath, 'cbz') || _.endsWith(resource.fPath, 'cbr')
		 return type && archive;
	})

	files = files.map(file =>{
		return file.fPath;
	})

	let folders = resources.filter(resource =>{
		let type = resource.type === 'DIRECTORY';
		let basename = path.basename(resource.fPath);
		return type;
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

	if ( directory.includes('Calvin') ){
		debugger;
	}

	await yield();		//Pause while the socket gets a chance to update..
	
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

const YEILD_DURATION = 1; 	//MS to pause while socket messages are being processed

async function yield() {

	return new Promise(function(resolve, reject) {
		setTimeout(function() {
			resolve();
		}, YEILD_DURATION);
	});

}

module.exports = {traverse, scan: scan_directory};