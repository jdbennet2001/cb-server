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

    let cache_path = path.join(__dirname, `../../data/comic-info/${year} - ${_.padStart(issue, 3, '0')}.json`);
   
    //Load existing data from disk
    let data = fs.existsSync(cache_path) ? jsonfile.readFileSync(cache_path) : {};

    //Which weeks do we need?
    let weeks = get_weeks(year);

    //Make one call / per week
    for ( const week of weeks){

        if ( data[week]){
            console.log(`.. cache data for issue #${_.padStart(issue, 3, '0')} - ${week}`);
        }else{
            let issues =  await get_cv(issue, week);    
            data[week] = issues;
            jsonfile.writeFileSync(cache_path, data, {spaces: 4});
       }
    }

    let values = _.values(data);
    let entries = _.reduce(values, function(result, value){
        return _.concat(result, value);
    }, [])

    console.log( `#${_.padStart(issue, 3, '0')} - ${year} - Total ${_.size(entries)} entries`);

    return _.size(entries);

}



function get_weeks(year){

    if ( year < 2018 ){
        return [`${year}-01-01|${year}-12-30`]
    }

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

        console.log(`.. #${_.padStart(issue, 3, '0')} - ${range}, ${_.size(issues)} total.`)

        //Loop for next page, if necessary
        complete = (offset + number_of_page_results) >= number_of_total_results;
        offset += 100;

        await wait(QUERY_INTERVAL);


    } while( !complete )

    console.log( `CV - #${issue} for range ${range} .. ${_.size(issues)} REST results`);
    return issues;

}


async function wait(ms=QUERY_INTERVAL){
    return new Promise(function(resolve){
        setTimeout(function() {
            resolve()
        }, ms);
    })
}
