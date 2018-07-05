const express 	= require('express')
const cors 		= require('cors')
const nconf 	= require('nconf');
const path 		= require('path');
const _ 		= require('lodash');

const config 	= path.join(__dirname, './config/app.json')
nconf.file(
	{ file: config }
);

const app 		= express()
app.use(express.static('public'))
app.use(cors())

let {cover, model, index} = require('./lib/library');
let {page} 				  = require('./lib/archive');

/* Get catalog details */
app.get('/model', function(req, res) {

	let source_dir = nconf.get('source_dir');
	let data = _.assign({}, model(), {source_dir});

	res.json(data);
});

/* Scan the catalog */
app.post('/index', function(req, res){

	let source_dir = nconf.get('source_dir');
	console.log( `Indexing ${source_dir}`)
	index(source_dir).then(data =>{
		res.json(data);
	})
})

/*
Return the cover for a given issue.
@input the issue name (No path, example 'Spider-Man 01.cbr')
*/
app.get("/cover/:name", function(req, res) {
	let name = decodeURIComponent(req.params.name);
	cover(name).then(data => {
		res.contentType('image/jpeg');
		res.end(data, 'binary');
	}, () => {
		const path_to_balloon = process.cwd() + '/public/speech_balloon.png'
		res.sendFile(path_to_balloon);
	})

});


/*
 */
app.get("/page", function(req, res) {

	let archive = decodeURIComponent(req.query.archive);
	page(archive, req.query.number).then(data => {
		res.contentType('image/jpeg');
		res.end(data, 'binary');
	}).catch(err => {
		const path_to_balloon = process.cwd() + '/public/speech_balloon.png'
		res.sendFile(path_to_balloon);

	})

});

const {suggestions} = require('./lib/import/suggestions');

/*
 Return a list of suggestions for a new issue
 @param: issue_number
 @param: year
 @volume_name
 @response
    [{
        "description": "<p><em>“THE ROAD TO FLASH WAR!” Wally West is overwhelmed by fragments from his past! With his protégé’s psyche falling apart, Barry Allen races around the DCU calling in every favor possible to save his shattered family. Meanwhile, Hunter Zolomon’s sinister machinations tip over the first domino in what might prove to be the end of everything for The Flash!</em></p><h4>List of covers and their creators:</h4><table data-max-width=\"true\"><thead><tr><th scope=\"col\">Cover</th><th scope=\"col\">Name</th><th scope=\"col\">Creator(s)</th><th scope=\"col\">Sidebar Location</th></tr></thead><tbody><tr><td>Reg</td><td>Regular Cover</td><td>Dan Panosian</td><td>1</td></tr><tr><td>Var</td><td>Variant Cover</td><td>Francesco Mattina</td><td>2</td></tr></tbody></table>",
        "id": 669430,
        "cover_date": "2018-07-01",
        "issue_number": "46",
        "site_detail_url": "https://comicvine.gamespot.com/the-flash-46-road-to-flash-war/4000-669430/",
        "image_url": "https://comicvine.gamespot.com/api/image/scale_small/6425116-46.jpg",
        "volume_name": "The Flash",
        "volume_id": 91750
    }]
 */
app.get('/suggestions', function(req, res){
	let issue_number = _.toNumber(req.query.issue_number);
	let year 		 = _.toNumber(req.query.year);
	let volume_name  = req.query.volume_name;
	suggestions(issue_number, year, volume_name).then(data =>{
		return res.json(data);
	})
})

app.listen(2002, () => console.log('CORS-enabled web server listening on port 2002'))