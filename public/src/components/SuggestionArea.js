const React   = require('react');
const _       = require('lodash');

import { request } from 'graphql-request'



import './SuggestionArea.css'
import Suggestion from './Suggestion'


class SuggestionArea extends React.Component {

  constructor(props) {
    super(props);
    this.state = {suggestions:[]}
  }

  componentDidMount(){

    let self = this;
    let state = this.state;

    let {title, number, year} = this.props.issue;

    getSuggestions(title, number, year).then(suggestions =>{

        state = {suggestions: suggestions.suggestion};
        self.setState(state);
    }, err =>{
        console.log( `Error getting suggestions: ${err.message}`)
    })

  }

  render() {

    let {suggestions} = this.state;
    let key = JSON.stringify(this.props.issue);

    let rows = suggestions.map(suggestion =>{
      return <Suggestion key={key} record={suggestion}></Suggestion>
    })

    return <div className='pane'>
            {rows}
          </div>

  }


}

/*
 Get all queued comics from the download directory
 */
function getSuggestions(name, issue_number, year){

	const endpoint = '/graphql';
	const query = `query getSuggestions($name:String, $issue_number:Int, $year:Int) {
			suggestion(name:$name, issue_number:$issue_number, year:$year){
				name
				description
				url
        image
        store_date
        issue_number
				series{
					name
					id
					count
					location
				}
			}

	}`

	const variables = {name: _.trim(name), issue_number: _.toNumber(issue_number), year: _.toNumber(year)};

	return request(endpoint, query, variables);
}


export default SuggestionArea;
