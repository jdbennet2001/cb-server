const path      = require('path');

const input     = path.join(__dirname, "../tests/archives/comics/Chew/Chew #005 (2009-11-27) - Taster's Choice, Part. 5 of 5.cbr");
const tmp_dir   = path.join(__dirname, './tmp');
const output    = path.join(__dirname, './out.zip');


const {convert}     = require('../lib/convert');

debugger;

convert(input, output, tmp_dir).then( () =>{
    console.log('converted');
}, err => {
    console.error(`conversion error: ${err.message}`)
})

