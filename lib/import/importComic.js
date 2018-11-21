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


async function importComic(from, to){

    let cache_path = path.join(__dirname, `../../data/import-queue.json`);

    let data = fs.existsSync(cache_path) ? jsonfile.readFileSync(cache_path) : [];
    let length = await pages(from);

        data.push({length, from, to});

    jsonfile.writeFileSync(cache_path, data, {spaces: 4});

}

/*
 Import a comic into the catalog
 */
 async function importComicDisk(from, to){

   //Count the pages
   let page_count = await pages(from);

   //Load the index
   let model_location      = path.join(__dirname, '../../data/model.json');
   let {folders, archives} = jsonfile.readFileSync(model_location);

   let target_dir = path.join(to, '..');

   //Add the new entry
   let entry = {directory:target_dir, location: to, name: path.basename(from), length: page_count};
   archives.push(entry);


   let directoryExists = await pathExists(target_dir);
   if ( directoryExists ){
     await copy( from, to);
   }else{
     await ensureDir(target_dir);
     await copy( from, to);
     folders.push(target_dir);
   }

   jsonfile.writeFileSync(model_location, {folders, archives}, {spaces: 4});

   return page_count;


 }

 module.exports = {importComic};
