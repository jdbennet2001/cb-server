const React 	= require('react');
const _       = require('lodash');

import './Filing.css'

import CoverArea      from './CoverArea';
import SuggestionArea from './SuggestionArea';
import Header         from './Header';

import Archive        from '../utils/archive';

/*
 Comic book filing:
 State:

  type FILE {
    name : String
    location : String
  }

  type ISSUE{
    name: String
    location: String
    title: String
    number: Int
    year: Int
  }

  type TARGET{
    location: String
  }

  type state{
    unfiled: [FILE]  #Pending comics
    issue:    ISSUE   #Archive being filed
    target:   TARGET
  }

 */
class Filing extends React.Component {
  constructor(props) {
    super(props);

    this.state = {unfiled: [], issue: {} };

  }

  componentDidMount(){

    let self = this;

    //Load state from disk
    get_comics().then(comics =>{
      let state = {unfiled: comics.data.unfiled_comics, issue:{} };
      self.setState(state);
      self.next();
    })

    //Use an internal message bus to communicate between components
    // -- Redux would be a better choice, but this is a learning excercise --
    window.bus.on('next', () =>{
        self.next();
    });

    window.bus.on('file', data =>{
        let {location} = data;
        self.next();
    });

    window.bus.on('issue', update =>{
      let state = self.state;
      let {name, value} = update;
      let {issue} = state;
        issue = _.set(issue, name, value);
      state = _.assign(state, {issue});
      self.setState(state);
    })

    window.bus.on('target', target =>{
      let state = self.state;
          state = _.assign(state, {target});
      self.setState(state);

    })

  }

  next(){
    let state = this.state;
    let {unfiled} = state;
    let unfiled_item = unfiled.pop();
    let {name, location} = unfiled_item;
    let archive  = new Archive(unfiled_item);
    let {title, year, number} = archive;

    let issue = {name, location, title, year, number};
        state = {unfiled, issue};

    this.setState(state);
  }

  target(args){
    let {name, value} = args.target;
    window.bus.emit('target-dir', value);
  }

  onChangeTarget(args){
      let {name, value} = args.target;
      let state = this.state;
      state.target = value;
      this.setState(state);
  }

  render() {

    let {issue} = this.state;

    let {target} = this.state;

    let next   = this.next.bind(this);
    let onChangeTarget   = this.onChangeTarget.bind(this);

    if ( _.isEmpty(issue)){
      return <div>Loading...</div>
    }

    let key = JSON.stringify(issue);

    return <div className='filing'>

        <Header className='controlArea'>
        </Header>

        <div key={key} className='contentArea'>
          <CoverArea className='pane'  issue={issue}></CoverArea>
          <SuggestionArea className='pane' issue={issue}></SuggestionArea>
        </div>

        <div className='actionArea controlArea'>
          <div className='stretch'>
              <input type="text" onChange={onChangeTarget} name="target" value={target}/>
          </div>
          <div className='button' onClick={next}>Skip</div>
          <div className='button' onClick={next}>File</div>
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
