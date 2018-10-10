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

    let results = [];

    //Which weeks do we need?
    let weeks = get_weeks(year);

    //Make one call / per week
    for ( const week of weeks){

        let issues = await get_data(issue, week);

        if ( _.isUndefined(issues)){
            issues = await get_cv(issue, week);
        }

        results = _.concat(results, issues);
    }

    return results;

}

/*
 Rest data is saved to disk, load if possible
 */
function get_data(issue_number, key){

    let cache_path = path.join(__dirname, `../../data/comic-info/${_.padStart(issue_number, 3, '0')}.json`);

    if ( !fs.existsSync(cache_path) ){
        return undefined;
    }

    let cache_data = jsonfile.readFileSync(cache_path);
    let value = cache_data[key];
    if ( !_.isUndefined(value) ){
        console.log( `CV - #${issue_number} for range ${key} .. ${_.size(value)} cached results`);
    }

    return value;
}

/*
 Save JSON to disk
 */
function write_data(issue_number, key, value){

    let cache_path = path.join(__dirname, `../../data/comic-info/${_.padStart(issue_number, 3, '0')}.json`);
    let cache_exists = fs.existsSync(cache_path);
    let existing_data = cache_exists ? jsonfile.readFileSync(cache_path) : {};
        existing_data = _.set(existing_data, key, value)
    jsonfile.writeFileSync(cache_path, existing_data, {spaces:4});
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


async function get_cv(issue, range){



    let complete = false;
    let issues = [];
    let offset = 0;

    do {

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

        let data        = await rp(options);
        let {number_of_total_results, number_of_page_results, results} = data;

        issues = _.concat(issues, results);

        //Loop for next page, if necessary
        complete = (offset + number_of_page_results) >= number_of_total_results;
        offset += 100;

        await wait(QUERY_INTERVAL);


    } while( !complete )

    console.log( `CV - #${issue} for range ${range} .. ${_.size(issues)} REST results`);
    write_data(issue, range, issues);
    return issues;

}


async function wait(ms=QUERY_INTERVAL){
    return new Promise(function(resolve){
        setTimeout(function() {
            resolve()
        }, ms);
    })
}
