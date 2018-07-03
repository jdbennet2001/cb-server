const jsonfile 		= require('jsonfile');
const path 			= require('path');
const _ 			= require('lodash');
const rp       		= require('request-promise');
const appendQuery 	= require('append-query');


let cache_path = path.join(__dirname, '../data/model.json');
let cache_data  = jsonfile.readFileSync(cache_path);

let metadata_path = path.join(__dirname, './volume-metadata.json');
let metadata  	= jsonfile.readFileSync(metadata_path);

//Extract the volume number
let folder_metadata = cache_data.folders.map(folder =>{
	let start = folder.indexOf('(')+1;
	let end = folder.indexOf(')');
	let volume = folder.substring(start, end);
	return parseInt(volume);
})

//Remove duplicates
let folder_volumes = _.uniq(folder_metadata);

let existing_volumes = metadata.map(entry =>{
    return entry.id;
})

let volumes = _.differenceWith(folder_volumes, existing_volumes);


console.log(`Processing ${volumes.length} volumes`);

let params = {
    api_key :'fc5d9ab899fadd849e4cc3305a73bd3b99a3ba1d',
    format: 'json',
}

setInterval(function() {


	let volume = volumes.pop();
	let query = _.assign({}, params, {filter: `id:${volume},`});
	
    let url = appendQuery('http://comicvine.gamespot.com/api/volumes/', query);

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
        metadata.push(summary);
        jsonfile.writeFileSync(metadata_path, metadata, {spaces:4})

        console.log( `${volumes.length} of ${volumes.length + metadata.length} : ${volume} -> ${description}`)
    }, err =>{
        console.error(`Error calling CV ${err.message}`);
    })

    if ( volumes.length === 0 ){
        process.exit(0);
    }

}, 2500);



// console.log( util.inspect(archives) );
