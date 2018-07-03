const _ 			= require('lodash');
const fs            = require('fs');
const {data} 		= require('../lib/import/metadata');

const UNFILED_DIR	= '/Volumes/VIDEO/comics/unfiled';
let files = fs.readdirSync( UNFILED_DIR );


//Only comic books
let archives = _.filter(files, file =>{
	return (_.endsWith(file, 'cbz') || _.endsWith(file, 'cbr'));
})


//Ones with a year and an issue number
archives = _.filter(archives, archive =>{
	let year = get_year(archive);
	let issue = get_issue(archive);
	return year && issue;
})

let queries = _.reduce(archives, function(promise_chain, archive, index) {
    return promise_chain.then( () =>{
    	console.log( `Indexing file ${archive}, ${index} of ${_.size(archives)}`)
    	return data(get_issue(archive), get_year(archive));
    });
}, Promise.resolve() );

queries.then(() =>{
	console.log( '..done');
})


function get_year(file){

	let years = _.range(1945, 2020);
		years = years.map(year => `(${year})`);

	let tokens = _.split(file, ' ');
	let year = _.find(tokens, token =>{
		return _.includes(years, token);
	});	
	year = _.trimStart(year, '(');
	year = _.trimEnd(year, ')');
	return year;
}


function get_issue(file){
	let tokens = _.split(file, ' ');
	let issue = _.find(tokens, token =>{
		let number = _.toNumber(token);
		return ( !_.isNaN(number) && number >= 1 &&  number <= 750 )
	});	
	return _.toNumber(issue);
}



