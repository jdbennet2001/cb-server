const React   = require('react');

import { request } from 'graphql-request'



import './SuggestionArea.css'

 
class SuggestionArea extends React.Component {

  constructor(props) {
    super(props);
    this.setState({suggestions:[]});
  }

  componentDidMount(){

    debugger;
    let self = this;

    let {title, number, year} = this.props.issue;
    title = 'Blue';

    getSuggestions(title, number, year).then(suggestions =>{
        self.setState({suggestions});
    }, err =>{
        console.log( `Error getting suggestions: ${err.message}`)
    })
    
  }

  render() {

    return <div className='pane'>Suggestion Here...</div>
    
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
				series{
					name
					id
					count
					location
				}
			}
		
	}`

	const variables = {name, issue_number, year};

	return request(endpoint, query, variables);
}


export default SuggestionArea;