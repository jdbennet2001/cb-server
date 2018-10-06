const jsonfile 		= require('jsonfile');
const path 			= require('path');
const _ 			= require('lodash');
const rp       		= require('request-promise');
const appendQuery 	= require('append-query');
const moment        = require('moment');
const fs            = require('fs');

const QUERY_INTERVAL =   5000;

module.exports = {data}

/*
 Returns a list of all comics published for given year / number
 */
async function data(issue, year){

    //Get pre-computed data
    let cache_data = get_data(issue);

    //Which weeks are missing?
    let weeks = get_weeks(year);
        weeks = _.difference(weeks, cache_data.weeks);

    //Got 'em all? Return the data
    if ( _.isEmpty(weeks) ){
        return Promise.resolve(cache_data.items)
    }

    for ( const week of weeks){
        let results = await get_issues(issue, week);

        cache_data.items = _.concat(cache_data.items,results);
        cache_data.weeks = _.concat(cache_data.weeks, week);

        write_data(issue, cache_data);      
    }  

    return cache_data.items;
}

/* 
 Load cached data (array of items and processed weeks) from disk
 */
function get_data(issue_number){
    let cache_path = path.join(__dirname, `../../data/comic-info/${_.padStart(issue_number, 3, '0')}.json`);

    let cache_data  = {items:[], weeks:[]}
    if ( fs.existsSync(cache_path) ){
        cache_data = jsonfile.readFileSync(cache_path);
    }
    return cache_data;
}

/*
 Save JSON to disk
 */
function write_data(issue_number, data){

    let cache_path = path.join(__dirname, `../../data/comic-info/${_.padStart(issue_number, 3, '0')}.json`);
    jsonfile.writeFileSync(cache_path, data, {spaces:4});
}

function get_weeks(year){

    let weeks = _.range(0, 52);

    weeks = _.map(weeks, week =>{
        let start =  moment().year(year).week(week).day(1).format('YYYY-MM-DD');
        let end =  moment().year(year).week(week).day(7).format('YYYY-MM-DD');
        let today = moment().format('YYYY-MM-DD');
        
        if ( start < today ){
            return `${start}|${end}`;    
        }
        
    })

    return _.compact(weeks);
}


async function get_issues(issue, range, offset=0){

    let params = {
        api_key :'fc5d9ab899fadd849e4cc3305a73bd3b99a3ba1d',
        resources: 'issue',
        format: 'json',
        filter: `issue_number:${issue},store_date:${range}`,
        offset
    }

    let url = appendQuery('http://comicvine.gamespot.com/api/issues/', params);

    let options = {
        url,
        headers: {
            'User-Agent': 'request'
        },
        json: true
    };


    let data = await rp(options);
    console.log( `CV - #${issue} for range ${range} .. ${_.size(data.results)} results`);
    await wait(QUERY_INTERVAL);
    return data.results;

}


async function wait(ms=QUERY_INTERVAL){
    return new Promise(function(resolve){
        setTimeout(function() {
            resolve()
        }, ms);
    })
}