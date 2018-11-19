
const _ 			  = require('lodash');
const path      = require('path');
const jsonata   = require("jsonata");
const jsonfile  = require('jsonfile')

const {data} 		= require('./metadata');





module.exports = {suggestions, volume};

/*
 Return a list of suggestions for a given archive waiting to be filed
 */
 async function suggestions(issue_number, year, volume_name){

  debugger;

 	let issues = await data(issue_number, year);

	issues = issues.filter(issue =>{
		return _.includes(issue.volume.name, volume_name);
	})

 	let map_expr 	 = ["$append([],$.({",
						"'id' : id,",
						"'volume' : volume.name,",
					    "'volume_id' : volume.id,",
					    "'image' : image.small_url,",
					    "'name' : name,",
					    "'description' : description,",
					    "'store_date': store_date,",
					    "'url' : site_detail_url",
						"}))"]
	let mapping = map_expr.join('');

 	let results = jsonata(mapping).evaluate(issues);

  results = results.map(result =>{
    let {count, location} = volume(result.volume_id);
    let {volume:name, volume_id:id} = result;
    let series = {name , id, count, location};
    return _.assign({}, result, {series});
  })

 	return results;

 }

 /*
  Return information about a given series (by number)
  */
 function volume(volume_number){

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
