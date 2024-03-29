const _ 			      = require('lodash');
const rp       		  = require('request-promise');
const appendQuery 	= require('append-query');
const nconf 	      = require('nconf');
const jsonata       = require('jsonata');
const path          = require('path');
const jsonfile      = require('jsonfile');
const {ensureDir,
       move, copy,
       pathExists}  = require('fs-extra')
const {pages}       = require('../archive');
const fs            = require('fs');


async function queueComic(from, to){

    let cache_path = path.join(__dirname, `../../data/import-queue.json`);

    let data = fs.existsSync(cache_path) ? jsonfile.readFileSync(cache_path) : [];
    let length = await pages(from);

        data.push({length, from, to});

    jsonfile.writeFileSync(cache_path, data, {spaces: 4});

}

/*
 Import a comic into the catalog
 */
 async function importComic(from, to){

  let comic = path.basename(from);

  if ( !fs.existsSync(from) ){
    console.log(`Skipping: ${comic}, not found.`)
    return;
  }

   //Count the pages
   let page_count = 0;
   try{
      page_count = await pages(from);
    }catch(err){
      console.log(`Error processing page count for ${comic}, ${err.message}`);
    }

   //Load the index
   let model_location      = path.join(__dirname, '../../data/model.json');
   let {folders, archives} = jsonfile.readFileSync(model_location);

   //And, the stuff that's waiting
   let cache_path = path.join(__dirname, `../../data/import-queue.json`);
   let data = fs.existsSync(cache_path) ? jsonfile.readFileSync(cache_path) : [];


   //Add the new entry
   let target_dir = path.join(to, '..');
   let entry = {directory:target_dir, location: to, name: path.basename(from), length: page_count};

    try {

      await ensureDir(target_dir);
      await move(from, to,  { overwrite: true });

      console.log(`Moved ${comic}`)

      archives.push(entry);
      folders.push(target_dir);
      folders = _.uniq(folders);

      data = data.filter(datum =>{
        return (datum.from != from);
      })

      jsonfile.writeFileSync(model_location, {folders, archives}, {spaces: 4});
      jsonfile.writeFileSync(cache_path, data, {spaces: 4});

    } catch (err) {
      console.log(`Error importing comic ${comic}, ${err.message}`);
    }

   return page_count;
 }

 function getImportQueue(){
    let cache_path = path.join(__dirname, `../../data/import-queue.json`);
    let data = fs.existsSync(cache_path) ? jsonfile.readFileSync(cache_path) : [];
    return data;
 }

 module.exports = {queueComic, getImportQueue, importComic};
