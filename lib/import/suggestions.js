
const _ 			  = require('lodash');
const path      = require('path');
const jsonata   = require("jsonata");
const jsonfile  = require('jsonfile')
const fs        = require('fs');

const {folder}  = require('./volume');





module.exports = {suggestions, folder};

/*
 Return a list of suggestions for a given archive waiting to be filed
 */
 async function suggestions(issue_number, year, volume_name){

   //Data is in the form <week> - list of issues
   let weeks = get_data(issue_number, year);
   let keys = _.keys(weeks);
       keys = _.filter(keys, key =>{ return _.startsWith(key, year); })

   //Get all the issues in the given year
   let issues = _.reduce(keys, function(results, key) {
      let entries =  weeks[key];
      return _.concat(results, entries);
   }, []);

  //Filter by comic name
	issues = issues.filter(issue =>{

    let tokens = _.words(volume_name);
    let match = _.every(tokens, token =>{
      return _.includes(issue.volume.name, token);
    })
    return match;
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


 	let results = jsonata(mapping).evaluate(issues);

  results = results.map(result =>{
    let {count, location} = folder(result.volume_id);
    let {volume:name, volume_id:id} = result;
    let series = {name , id, count, location};
    return _.assign({}, result, {series});
  })

 	return results;

 }

 function get_data(issue_number, year){

   let cache_path = path.join(__dirname, `../../data/comic-info/${_.padStart(issue_number, 3, '0')}.json`);
   let data = fs.existsSync(cache_path) ? jsonfile.readFileSync(cache_path) : [];
   return data;


 }
