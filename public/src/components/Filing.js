const React 	= require('react');
const _       = require('lodash');

import './Filing.css'

import CoverArea      from './CoverArea';
import SuggestionArea from './SuggestionArea';
import Header         from './Header';

import Archive        from '../utils/archive';
 
class Filing extends React.Component {
  constructor(props) {
    super(props);

    this.state = {unfiled: [], issue: {} };
  }

  componentDidMount(){

    let self = this;

    get_comics().then(comics =>{
      let state = {unfiled: comics.data.unfiled_comics, issue:{} };
      self.next(state);
    })
    
  }

  next(state){
    let {unfiled} = state || this.state;
    let unfiled_item = unfiled.pop();
    let {name, location} = unfiled_item;
    let archive  = new Archive(unfiled_item);
    let {title, year, number} = archive;

    let issue = {name, location, title, year, number};
        state = {unfiled, issue};

    this.setState(state);
  }

  refresh(issue){
    let state = this.state;
        state = _.assign({}, state, {issue});
    this.setState(issue);
  }

  render() {
    
    let {issue} = this.state;
    let next = this.next.bind(this);
    let refresh = this.refresh.bind(this);

    if ( _.isEmpty(issue)){
      return <div>Loading...</div>
    }

    return <div className='filing'>
          
        <Header className='controlArea'>
        </Header>
            
        <div className='contentArea'>
          <CoverArea className='pane' issue={issue}></CoverArea>
          <SuggestionArea className='pane'></SuggestionArea>
        </div>

        <div className='controlArea right-align'>
          <div className='button'>Skip</div> 
          <div className='button'>File</div> 
        </div>
          
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