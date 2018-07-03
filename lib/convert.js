const path  	= require('path');
const execa 	= require('execa');
const fsx 		= require('fs-extra')
const fs 		= require('fs');
const archiver 	= require('archiver');
const _ 		= require('lodash');
const util 		= require('util');
const readChunk = require('read-chunk');
const archiveType = require('archive-type');

const local_tmp_dir  = path.join(__dirname, './tmp');

module.exports.convert =function(input, tmp_dir=local_tmp_dir){

	let archive_name = path.basename(input);
	let output = _.trimEnd(input, 'cbr') + 'cbz';

	if (fs.existsSync(output)){
		console.log( `Output file found ${output}, skipping archive.`);
		fs.unlinkSync(input);
		return Promise.resolve(output);
	}

	let type = get_type(input);
	if ( type === 'zip'){
		console.log(`Input file (${input})is zip archive, rename`);
		fs.renameSync(input, output);
		return Promise.resolve(input);
	}


	return fsx.ensureDir(tmp_dir).then( () =>{
		return fsx.emptyDir(tmp_dir);
	}).then( () =>{
		console.log(`Extracting ${input}`)
		let action =  execa('unrar', ['e', '-y', input, tmp_dir]);
		action.stdout.pipe(process.stdout);
		return action;
	}).then( () =>{

		let files = fs.readdirSync(tmp_dir);
		console.log(`Zipping.. ${_.size(files)} files`);

		//Getting file list
		var target = fs.createWriteStream(output);
		var archive = archiver('zip', {
		  zlib: { level: 9 }
		});

		archive.pipe(target);
		
		archive.directory(`${tmp_dir}/`, false);
		
		archive.finalize();

		return new Promise(function(resolve, reject){
			archive.on('close', () =>{
				resolve(archive)
			})
			archive.on('error', (err) =>{
				reject(err);
			})
			archive.on('finish', () =>{
				resolve(archive);
			})
			archive.on('progress', (status) =>{
				let entries = status.entries;
				console.log(`.. ${archive_name} ${util.inspect(entries)}`);
			})
			archive.on('warning', function(err) {
				console.error(`Archive warning: ${err}`);
			});
			// setTimeout(function(){
			// 	archive.abort();
			// 	console.error(`Timeout archiving file ${input}`);
			// 	reject(input);
			//  }, 30000);

		})

	}).then( () =>{
		let input_stats  = fs.statSync(input);
		let output_stats  = fs.statSync(output);
		let delta = (input_stats.size - output_stats.size) / input_stats.size;
		console.log( `Delta (size) is ${(delta*100).toFixed(2)}%`)

		if (Math.abs(delta) < 0.1){
			console.log( `Unlinking ${input}, replacement good.`);
			fs.unlinkSync(input);
			return Promise.resolve(output);
		}else{
			console.error( `Delta greater than expected, skip...`);
			fs.unlinkSync(output);
			return Promise.resolve(input);
		}
	}).catch( err =>{
		//Rename file to prevent it from causing issues next run
		fs.renameSync(input, output);
		return Promise.resolve(err);
	})

}

function get_type(archive){

    const buffer = readChunk.sync(archive, 0, 262);

    let type = archiveType(buffer);
    return _.get(type, 'ext');
}
