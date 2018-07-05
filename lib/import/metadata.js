const jsonfile 		= require('jsonfile');
const path 			= require('path');
const _ 			= require('lodash');
const rp       		= require('request-promise');
const appendQuery 	= require('append-query');
const moment        = require('moment');
const fs            = require('fs');



const QUERY_LIMIT = 100;
const QUERY_INTERVAL=5000;


module.exports.data = function(issue, year){

    let data  = get_data(issue);
    let weeks = get_weeks(year);
        weeks = _.difference(weeks, data.weeks);

    if ( _.isEmpty(weeks) ){
        return Promise.resolve(data)
    }

    let queries = _.reduce(weeks, function(promise_chain, current_week, index) {
        return promise_chain.then( () =>{
            console.log( `Checking issue ${issue} for ${current_week}, ${index} of ${_.size(weeks)}`);
            return get_issues(issue, current_week).then(results =>{
                data.items = _.concat(data.items, results);
                data.weeks = _.concat(data.weeks, current_week);
                console.log(`.. ${_.size(results)} issues returned, ${_.size(data.items)} total`);
                write_data(issue, data)
            })
        });
    }, Promise.resolve() );

    return queries.then(() =>{
        return get_data(issue);
    })


}

function get_data(issue_number){
    let cache_path = path.join(__dirname, `../../data/comic-info/${_.padStart(issue_number, 3, '0')}.json`);

    let cache_data  = {items:[], weeks:[]}
    if ( fs.existsSync(cache_path) ){
        cache_data = jsonfile.readFileSync(cache_path);
    }
    return cache_data;
}

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


function get_issues(issue, range, offset=0){

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

    let issues = [];

    return wait(QUERY_INTERVAL).then( () =>{
        return rp(options);
    }).then(response =>{
        issues = _.concat(issues, response.results);

        if (response.number_of_page_results === QUERY_LIMIT){
            return get_issues(issue, range, offset + QUERY_LIMIT);
        }else{
            return []
        }
    }).then( results =>{
        return _.concat(issues, results);
    }).catch(err =>{
        console.error(`Error calling cv: ${err.message}`);
    });


}


function wait(ms=QUERY_INTERVAL){
    return new Promise(function(resolve){
        setTimeout(function() {
            resolve()
        }, ms);
    })
}