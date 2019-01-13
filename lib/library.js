const path      = require('path');
const PouchDB   = require('pouchdb');
const _         = require('lodash');
const fs        = require('fs-extra')
const jsonfile	= require('jsonfile');
const util 		  = require('util');
const each 		  = require('promise-each');
const walk      = require('walk');
const nconf 		= require('nconf');
const {scan}    = require('./traverse')

const db  = new PouchDB('covers');

db.info().then(function (info) {
  console.log(`Covers db data is ${JSON.stringify(info)}`);
})


const {cover, pages, page}   = require('./archive');

let path_to_model = path.join(__dirname, '../data/model.json');

let path_to_cache = path.join(__dirname, '../data/cache.json');
let cache = jsonfile.readFileSync(path_to_cache);

/*
 Return a list of all libraries on the system
 */
module.exports.model = function(){
  let data = fs.existsSync(path_to_model) ?jsonfile.readFileSync(path_to_model): {folders:[], archives:[]};
  return data;
}

module.exports.cover = function(name){
	return db.getAttachment(name, 'cover.jpg')
}


module.exports.index = index;

async function index(directory){

  process.emit(`'Scanning directory ${directory}`)
	//let {files, folders} = await scan(directory);
  let {files, folders} = await scan(directory);

  jsonfile.writeFileSync('./scan_results.json', {files, folders}, {spaces:4});

  process.emit('info', 'Indexing files');
	let archives = files.map(file =>  index_file(file));

	//Filter out empty responses..
  archives = _.compact(archives)

	//Write data to disk
	jsonfile.writeFileSync(path_to_model, {folders, archives}, {spaces: 4} );

  process.emit('info', 'Indexing covers.')

	let covers =  await index_covers( files );

  return process.emit('info', 'Indexing complete...')
  
}



async function duplicate(files){

  let cloud_dir = nconf.get('cloud_dir');
  if ( !fs.existsSync(cloud_dir) ){
    return process.emit('info', `Duplication failed. ${cloud_dir} not found`);
  }


  process.emit('info', 'Duplicating archvies');


  let updates = _.filter(files, file =>{
    let relative_path = _.trimStart(file, directory);
    let cloud_path = path.join(cloud_dir, relative_path);
    let exists = fs.existsSync(cloud_path);
    return !exists;
  })

  while( updates.length > 0 ){
    let update = updates.pop();
    process.emit('info', `Copying ${update}`)
    let relative_path = _.trimStart(file, directory);
    let cloud_path = path.join(cloud_dir, relative_path);
    // await fs.copy(update, cloud_path);
    console.log(`Copying ${upate} to ${cloud_path}`);
  }

  process.emit('info', 'Duplication complete');

}


/*
 Return information about a given file on the system.
 */
function index_file(file){
	console.log(`Indexing file: ${file}`);

	let name 	 = path.basename(file);
	let length = cache[name];
	let location = file;
	let directory = path.dirname(file);

	try{

		if ( _.isUndefined(length) ){
			length = pages(file);
			cache[name] = length;
			jsonfile.writeFileSync(path_to_cache, cache, {spaces: 4});
		}

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

  console.log(`Indexing cover for: ${file}`)

	let key = path.basename(file);
 	return page(file, COVER_PAGE, THUMBNAIL_SIZE).then(data =>{
 		return db.putAttachment(key, 'cover.jpg', data, 'test/jpg');
 	}).catch(err =>{
    console.error(`Error storing cover for ${key}, ${err.message}, storing placeholder instead.`);

    if ( err.message === 'Document update conflict' ){
      return;
    }

    let image = path.join(__dirname, '../public/speech_balloon.png');
    let data = fs.readFileSync(image);
    return db.putAttachment(key, 'cover.jpg', data, 'test/jpg');
 	});


 }

/*
 Return fully qualified paths for all  useful files in a directory
 {
 	files: []
	folders: []
 }
 */
async function scan_directory(directory){

  let walker = walk.walk(directory);

  let folders = [];
  let files   = [];


  walker.on("file", function (root, fileStats, next) {
      let {name} = fileStats;
      let file = path.join(root, fileStats.name);
      let system  = _.startsWith(name, '.') || _.startsWith(name, '-');
      let archive = _.endsWith(name, 'cbr') || _.endsWith(name, 'cbz');
      if (archive && !system){
        files.push(file);
        folders.push(root);
      }
      next();
  });

  walker.on("directories", function (root, dirStatsArray, next) {
    folders.push(root);
    process.emit('info', `Scanning ${root}`)
    next();
  });

  return new Promise(function(resolve, reject){
    walker.on("end", function () {
        folders = _.uniq(folders).sort();
        resolve({folders, files});
    });
  })

}
