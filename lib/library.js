const walk      = require("walkdir");
const path      = require('path');
const PouchDB   = require('pouchdb');
const nconf     = require('nconf');
const _         = require('lodash');
const fs 		= require("fs");
const jsonfile	= require('jsonfile');
const util 		= require('util');
const each 		= require('promise-each');

const db  = new PouchDB('covers');

db.info().then(function (info) {
  console.log(`Covers db data is ${JSON.stringify(info)}`);
})


const {cover, pages, page}   = require('./archive');

let path_to_model = path.join(__dirname, '../data/model.json');
let model = jsonfile.readFileSync(path_to_model);

/*
 Return a list of all libraries on the system
 */
module.exports.model = function(){
	return model;
}

module.exports.cover = function(name){
	return db.getAttachment(name, 'cover.jpg')
}


module.exports.index = function(directory){

	
	let {files, folders} = scan_directory(directory);
	
	let archives = files.map(file =>  index_file(file));

	//Filter out empty responses..
  	archives = _.filter(archives, archive =>{
		return !_.isEmpty(archive);
	})

	//Write data to disk
	jsonfile.writeFileSync(path_to_model, {folders, archives}, {spaces: 4} );

	//Index covers
	let covers =  index_covers( files );
	return covers.then( ()=> {
		console.log('Indexing complete...');
		return {folders, archives}
	}, err =>{
		console.error(`Error indexing covers ${err.message}`);
		console.error( util.inspect(err) );
		return Promise.reject(err);
	})

}




/*
 Return information about a given file on the system.
 */
function index_file(file){
	console.log(`Indexing file: ${file}`);

	//Return entry from cache, if possible
	let entry = _.find(model.archives, archive =>{
		return archive.location === file;
	})
	if (entry){
		return entry;
	}

	try{
		let length = pages(file);
		let name 	 = path.basename(file);
		let location = file;
		let directory = path.dirname(file);
		return {length, name ,location, directory};
	}catch(err){
		console.error(`Error indexing file: ${err.message} for ${file}`);
	}
}

/*
 Find all new archives, from a list of files, and add their covers to the database
 */
function index_covers(files) {
  //Get all covers currently in database
  return db.allDocs().then(doc => {
    let covers = doc.rows.map(row => row.id);

    let queued = files.filter(file => {
      return !_.includes(covers, path.basename(file));
    });

    return Promise.resolve(queued).then(
      each(val => { return index_cover(val);})
    );

  });
}


/*
 Extract the cover from a given archive and file it in pouchdb
 */
 function index_cover(file){

 	const COVER_PAGE =0;
 	const THUMBNAIL_SIZE = 360;

	let key = path.basename(file);
 	return page(file, COVER_PAGE, THUMBNAIL_SIZE).then(data =>{
 		return db.putAttachment(key, 'cover.jpg', data, 'test/jpg');
 	}).catch(err =>{
 		console.error(`Error storing cover for ${key}`);
 		return Promise.resolve(err);
 	});


 }

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
