const path  	= require('path');
const execa 	= require('execa');
const fsx 		= require('fs-extra')
const fs 		= require('fs');
const archiver 	= require('archiver');
const _ 		= require('lodash');
const util 		= require('util');

const local_tmp_dir  = path.join(__dirname, './tmp');

module.exports.convert =function(input, output, tmp_dir=local_tmp_dir){

	let archive_name = path.basename(input);

	return fsx.ensureDir(tmp_dir).then( () =>{
		return fsx.emptyDir(tmp_dir);
	}).then( () =>{
		console.log(`Extracting ${input}`)
		let action =  execa('unrar', ['e', input, tmp_dir]);
		action.stdout.pipe(process.stdout);
		return action;
	}).then( () =>{

		let files = fs.readdirSync(tmp_dir);
		console.log(`Zipping.. ${_.size(files)} files`);

		//Getting file list
		var target = fs.createWriteStream(output);
		var archive = archiver('zip', {
		  zlib: { level: 0 } // Sets the compression level.
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
		})

	}).then(data =>{
		let input_stats  = fs.statSync(input);
		let output_stats  = fs.statSync(output);
		let delta = (input_stats.size - output_stats.size) / input_stats.size;
		console.log( `Delta (size) is ${(delta*100).toFixed(2)}%`)
		console.log(`.. done.`);
	}).catch(err =>{
		console.error(`${err.message}`)
	})

}
