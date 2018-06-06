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
app.use(cors())

let {cover, model, index} = require('./lib/library');
// let {page} = require('./lib/archive');

/* Get catalog details */
app.get('/model', function(req, res) {

	let source_dir = nconf.get('source_dir');
	let data = _.assign({}, model(), {source_dir});

	res.json(data);
});

/* Scan the catalog */
app.post('/index', function(req, res){

	let source_dir = nconf.get('source_dir');
	index(source_dir).then(data =>{
		res.json(data);
	})
})

/*
Return the cover for a given issue.
@input the issue name (No path, example 'Spider-Man 01.cbr')
*/
app.get("/cover/:name", function(req, res) {
	debugger;
	let name = decodeURIComponent(req.params.name);
	cover(name).then(data => {
		res.contentType('image/jpeg');
		res.end(data, 'binary');
	}, err => {
		const path_to_balloon = process.cwd() + '/public/speech_balloon.png'
		res.sendFile(path_to_balloon);
	})

});


/*
 */
// app.get("/page", function(req, res) {

// 	let archive = decodeURIComponent(req.query.archive);
// 	page(archive, req.query.number).then(data => {
// 		res.contentType('image/jpeg');
// 		res.end(data, 'binary');
// 	}).catch(err => {
// 		const path_to_balloon = process.cwd() + '/public/icons/balloon.png'
// 		res.sendFile(path_to_balloon);

// 	})

// });

app.listen(2002, () => console.log('CORS-enabled web server listening on port 2002'))