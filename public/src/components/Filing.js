const React 	= require('react');

import './Filing.css'

import Header from './Header';
 
class Filing extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount(){

    get_comics().then(comics =>{
     console.log(comics);
    })
    
  }

  render() {
    return <div className='filing'>
            <Header></Header>
          </div>
  }
}

/*
 Get all queued comics from the download directory
 */
function get_comics(){
  
  return fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(
          {query: "{ unfiled_comics{name location} }"}
        )
      })
      .then(r => r.json());
}

export default Filing;