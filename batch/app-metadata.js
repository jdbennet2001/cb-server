const jsonfile 		= require('jsonfile');
const path 			= require('path');
const _ 			= require('lodash');
const rp       		= require('request-promise');
const appendQuery 	= require('append-query');


let cache_path = path.join(__dirname, '../data/model.json');
let cache_data  = jsonfile.readFileSync(cache_path);

let metadata_path = path.join(__dirname, './app-metadata.json');
let metadata  	= jsonfile.readFileSync(metadata_path);

//Find archives with volume IDs in the parent folder
let archives = cache_data.archives.filter(archive =>{
	let directory  = path.basename(archive.directory);
	return _.includes(directory, '(') && _.includes(directory, ')');
})

//And, the archive should have an issue number
archives = archives.filter(archive =>{
	return _.includes(archive.name, '#');
})

//And, the archive shouldn't already have been parsed
archives = archives.filter(archive =>{
	let exists = _.find(metadata, entry =>{
		return entry.name === archive.name;
	})
	return !exists;
})

//Extract the volume number
archives = archives.map(archive =>{
	let directory  = path.basename(archive.directory);
	let start = directory.indexOf('(')+1;
	let end = directory.indexOf(')');
	let volume = directory.substring(start, end);
	return _.assign(archive, {volume})
})

//Extract issue number
archives = archives.map(archive =>{
	let tokens = _.split(archive.name, ' ');
	let issue  = _.find(tokens, token => {return _.startsWith(token, '#')});
		issue  = _.replace(issue, '#', '');
		issue  = parseInt(issue);
	return _.assign(archive,{issue});
})

console.log(`Processing ${archives.length} archives`);

let params = {
    api_key :'fc5d9ab899fadd849e4cc3305a73bd3b99a3ba1d',
    resources: 'issue',
    format: 'json',
}

setInterval(function() {

	let {length, name, volume, issue} = archives.pop();
	let query = _.assign({}, params, {filter: `volume:${volume},issue_number:${issue}`});
	
    let url = appendQuery('http://comicvine.gamespot.com/api/issues/', query);

    var options = {
        url: url,
        headers: {
            'User-Agent': 'request'
        },
        json: true
    };

    rp(options).then(response =>{
        let summary = _.head(response.results);
        let description = _.get(summary, 'description');
        let archive = {length, name, summary};
        metadata.push(archive);
        jsonfile.writeFileSync(metadata_path, metadata, {spaces:4})

        console.log( `${archives.length} of ${archives.length + metadata.length} : ${name} -> ${description}`)
    }, err =>{
        console.error(`Error calling CV ${err.message}`);
    })

    if ( archives.length === 0 ){
        process.exit(0);
    }

}, 2500);



// console.log( util.inspect(archives) );
