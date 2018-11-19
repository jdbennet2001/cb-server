/*
 Return CBR metadata about a given volume
 */

 const _ 			      = require('lodash');
 const rp       		= require('request-promise');
 const appendQuery 	= require('append-query');
 const nconf 	      = require('nconf');
 const jsonata      = require('jsonata');
 const path         = require('path');
 const jsonfile     = require('jsonfile');

 const config 	= path.join(__dirname, '../../config/app.json')
 nconf.file(
 	{ file: config }
 );


 const mapping      = "{'name':  name, 'start_year' : start_year, 'publisher' : (publisher.name = 'DC Comics' or publisher.name = 'Marvel' ) ? publisher.name : 'Other', 'icon' : image.icon_url, 'description' : description }";

 async function volume_info( id ){
   let params = {
       api_key :'fc5d9ab899fadd849e4cc3305a73bd3b99a3ba1d',
       format: 'json',
       filter: `id:${id}`
   }

   let url = appendQuery('http://comicvine.gamespot.com/api/volumes/', params);

   let options = {
       url,
       headers: {
           'User-Agent': 'request'
       },
       json: true
   };

   let data = await rp(options);
   let {results} = data;
   let [result] = results;

   let {name, start_year, publisher, icon, description}  = jsonata(mapping).evaluate(result);
   let source_dir = nconf.get('source_dir');
   let series_directory  = group(name, `${source_dir}/${publisher}`);
   let {location} = folder(id);
   directory = (location) ? location : `${series_directory}/${name} ${start_year} (${id})`;
   return {name, start_year, publisher, icon, description, directory};

 }

 /*
  Return information about a given series (by number)
  */
 function folder(volume_number){

   let cache_path = path.join(__dirname, `../../data/model.json`);
   let cache_data = jsonfile.readFileSync(cache_path);

   let {archives, folders} = cache_data;
   let entries = archives.filter(archive =>{
     return _.includes(archive.directory, `(${volume_number})`)
   })

   let location = folders.find(folder =>{
     return  _.endsWith(folder, `(${volume_number})`)
   })

   let count = _.size(entries);

   return {count, location};
 }
 /*
  Is there an existing folder we can slot this into?
  */
 function group(name, publisher_directory){

   let cache_path = path.join(__dirname, `../../data/model.json`);
   let cache_data = jsonfile.readFileSync(cache_path);
   let {folders} = cache_data;

   let location = folders.find(folder =>{
     let parent = path.join(folder, '..');
     let basename = path.basename(folder);
     let match =  (parent === publisher_directory) && (_.includes(name, basename));
     return match;
   })

   return location || publisher_directory;

 }

module.exports = {volume_info, folder};
