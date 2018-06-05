const fs      = require("fs");
const unrar   = require("node-unrar-js");
const path    = require('path');
const _       = require('lodash');

const image_extensions = ['.gif', '.jpg', '.jpeg', '.tiff', '.bmp'];

function rar(filename){
  const path_to_tmp_dir = path.join(process.cwd(), './tmp');
  var extractor = unrar.createExtractorFromFile(filename, path_to_tmp_dir);
  var list = extractor.getFileList();

  var list_entries = [];
  try{
     list_entries = _.last(list).fileHeaders;
  }catch(err){
    console.error(`Error parsing ${filename}, ${err.message}`);
  }

  var files = this.files = _.filter(list_entries, entry => {
    if ( entry.packSize === 0 ){
      return false; //Directory
    }
    let extension = path.extname(entry.name).toLowerCase();
    return _.includes( image_extensions, extension );
  })

  files = _.sortBy(files, file => {return file.name});

  this.cover = function(){
    let page = _.head(files);
    let result = extractor.extractFiles([page.name]);
    let image = path.join(process.cwd(), 'tmp', page.name);
    let data = fs.readFileSync(image);
    fs.unlink(image);
    return data;
  }

  this.pages = function(){
    return files.length;
  }

  this.page = function(index){
    let page = files[index];
    let result = extractor.extractFiles([page.name]);
    let image = path.join(process.cwd(), 'tmp', page.name);
    let data = fs.readFileSync(image);
    fs.unlink(image);
    return data;
  }
}

module.exports = rar;
