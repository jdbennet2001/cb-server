const express 		= require('express')
const cors 				= require('cors')
const nconf 			= require('nconf');
const path 				= require('path');
const _ 					= require('lodash');
const http        = require('http');
const socketIO    = require('socket.io');

const config 	= path.join(__dirname, './config/app.json')
nconf.file({ file: config } );

const app 		= express()
app.use(express.static('public'))
app.use(cors())

let {cover, model} = require('./lib/library');
let {page} 				  = require('./lib/archive');

/* Get catalog details (For cb-reader) */
app.get('/model', function(req, res) {

	let source_dir = nconf.get('source_dir');
	let data = _.assign({}, model(), {source_dir});
	res.json(data);
});

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


/* Return the page for a given issue */
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



var graphqlHTTP = require('express-graphql');
const {	schema,	root} = require('./schema');
app.use('/graphql', graphqlHTTP({
	schema: schema,
	rootValue: root,
	graphiql: true,
}));

const server = require('http').createServer(app);
const io = require('socket.io')(server);

process.on('info', message =>{
	console.log( `Info: ${message}`)
	let sockets = _.values(io.sockets.sockets);
	sockets.forEach(socket =>{
		socket.emit('message', message)	
	})
	
})

server.listen(2002);

// app.listen(2002, () => console.log('CORS-enabled web server listening on port 2002'))
