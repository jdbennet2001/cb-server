
const _ 			  = require('lodash');
const path      = require('path');
const jsonata   = require("jsonata");
const jsonfile  = require('jsonfile')

const {data} 		= require('./metadata');
const {folder}  = require('./volume');





module.exports = {suggestions, folder};

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
					    "'url' : site_detail_url,",
              "'issue_number' : issue_number",
						"}))"]
	let mapping = map_expr.join('');

  debugger;

 	let results = jsonata(mapping).evaluate(issues);

  results = results.map(result =>{
    let {count, location} = folder(result.volume_id);
    let {volume:name, volume_id:id} = result;
    let series = {name , id, count, location};
    return _.assign({}, result, {series});
  })

 	return results;

 }
