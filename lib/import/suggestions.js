
const _ 			= require('lodash');
const jsonata = require("jsonata");

const {data} 		= require('./metadata');

module.exports = {suggestions};

/*
 Return a list of suggestions for a given archive waiting to be filed
 */
 async function suggestions(issue_number, year, volume_name){

 	let issues = await data(issue_number, year);

	issues = issues.filter(issue =>{
		return _.includes(issue.volume.name, volume_name);
	})

 	let map_expr 	 = ["$.({",
						"'id' : id,",
						"'volume' : volume.name,",
					    "'volume_id' : volume.id,",
					    "'image' : image.medium_url,",
					    "'name' : name,",
					    "'description' : description,",
					    "'store_date': store_date,",
					    "'url' : site_detail_url",
						"})"]
	let mapping = map_expr.join('');
 	
 	let results = jsonata(mapping).evaluate(issues);

 	return results;

 }