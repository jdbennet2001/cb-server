const jsonfile 		= require('jsonfile');
const path 			= require('path');
const _ 			= require('lodash');
const rp       		= require('request-promise');
const appendQuery 	= require('append-query');
const moment        = require('moment');
const fs            = require('fs');

const {data} 		= require('./metadata');

/*
 Return a list of suggestions for a given archive waiting to be filed
 */
 module.exports.suggestions =function(issue_number, year, volume_name){
 	return data(issue_number, year).then(data =>{
 		let issues = _.map(data.items, item =>{
 			let issue_data = _.pick(item, ['description', 'id', 'cover_date', 'issue_number', 'site_detail_url'])
 			let image_url = _.get(item, 'image.small_url') || _.get('image.original_url');
			return _.assign(issue_data, {image_url}, 
				{
					volume_name: item.volume.name,
					volume_id: item.volume.id
				});
		})

 		issues = _.filter(issues, issue =>{
 			return _.includes( _.toLower(issue.volume_name), _.toLower(volume_name) );
 		})
 		return issues;

 	}, err =>{
 		return Promise.resolve({err: err.message})
 	})
 }