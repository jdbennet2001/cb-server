const React   = require('react');

import { request } from 'graphql-request'



import './SuggestionArea.css'

 
class SuggestionArea extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount(){

  getSuggestions();
    
  }

  render() {

    return <div className='pane'>Suggestion Here...</div>
    
  }
}

/*
 Get all queued comics from the download directory
 */
function getSuggestions(name, issue){
  
	const endpoint = '/graphql';
	const query = `{
			suggestion(name:"Flash", issue_number:1, year:2018){
				name
				description
				url
				series{
					name
					id
					count
					location
				}
			}
		}`

	const variables = {name: 'The Flash ', issue_number:91, year:1994};

	request(endpoint, query).then(data=>{
		debugger;
	}, err =>{
		debugger;
	})
}


export default SuggestionArea;