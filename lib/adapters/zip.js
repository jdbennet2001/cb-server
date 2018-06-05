const admZip = require('adm-zip');
const path    = require('path');
const _       = require('lodash');

function zip(filename){

var zip = new admZip(filename);
var zip_entries = [];
try {
  zip_entries = zip.getEntries();
  zip_entries = _.filter(zip_entries, zip_entry => {
    return _.startsWith(zip_entry.entryName, '__') || zip_entry.isDirectory;
  });
} catch (err) {
  console.error(`Error opening ${filename}, ${err.message}`);
}


this.cover = function(){
  let zip_entry = _.head(zip_entries);
  return zip_entry.getData();
}

this.pages = function(){
  return zip_entries.length;
}

this.page = function(index){
	let zip_entry = zip_entries[index];
	return zip_entry.getData();
}

}

module.exports = zip;
