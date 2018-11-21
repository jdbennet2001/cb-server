const React 	      = require('react');
const _             = require('lodash');
const sequential    = require('promise-sequential');

import './Filing.css'

import CoverArea      from './CoverArea';
import SuggestionArea from './SuggestionArea';
import Header         from './Header';

import Archive        from '../utils/archive';
import { request }    from 'graphql-request'
import ReactTooltip   from 'react-tooltip'

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
    let updateIndex = updateIndexTables.bind(this);

    //Load state from disk
    get_comics().then(comics =>{
      let {unfiled_comics:unfiled} = comics;
      return self.setState({unfiled})
    }).then( () =>{
        return self.next();      
    })

    window.bus.once('downloadMetadata', () =>{
      let issues = self.state.unfiled;
       updateIndex(issues);
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
    let {name, location,size} = unfiled_item;
    let archive  = new Archive(unfiled_item);
    let {title, year, number} = archive;

    let issue = {name, location, title, year, number, size};
        state = {unfiled, issue, target: undefined};

    this.setState(state);
  }

  importComic(args){

    let self = this;
    let {target} = this.state;
    let {location:source} = this.state.issue;
    if ( _.isEmpty(source) || _.isEmpty(target)){
      return;     //Sanity check code...
    }
    doImport(source, target).then(done =>{
      self.next();
    }, err=>{
      alert(`${err.message}`);
    })
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

    let {issue, target, unfiled, queued} = this.state;

    let next   = this.next.bind(this);
    let importComic = this.importComic.bind(this);

    let onChangeTarget   = this.onChangeTarget.bind(this);

    if ( _.isEmpty(issue)){
      return <div>Loading...</div>
    }

    let key = JSON.stringify(issue);

    return <div className='filing'>
        <ReactTooltip />
        <Header className='controlArea' count={`${_.size(unfiled)}`}>
        </Header>

        <div key={key} className='contentArea'>
          <CoverArea className='pane'  issue={issue}></CoverArea>
          <SuggestionArea className='pane' issue={issue}></SuggestionArea>
        </div>

        <div className='actionArea controlArea'>
          <div className='stretch'>
              <input type="text" onChange={onChangeTarget} key={target} name="target" value={target}/>
          </div>
          <div className='button' onClick={next}>Skip</div>
          <div className='button' onClick={importComic}>File</div>
        </div>

      </div>
  }
}

function updateIndexTables(issues){

  let updates = _.reduce(issues, function(promise_chain, issue, count){

    return promise_chain.then( data =>{

      let archive  = new Archive(issue);
      let {title, year, number} = archive;
      window.bus.emit('message', `Indexing: ${title} - ${year} - ${number}, (Item #${_.padStart(count, 3, '0')})`);
      return doDownloadIndex(title, year, number);
    })
  
  }, Promise.resolve() );
  
  return updates.then( () =>{
      window.bus.emit('message', ``);    
  })

}


/*
 Get all queued comics from the download directory
 */
function get_comics(){

  const endpoint = '/graphql';
  const query = `{ unfiled_comics{name location, size} }`
  return request(endpoint,query);
}

function doImport(from, to){

	const endpoint = '/graphql';
	const mutation = `mutation importIssue($from:String, $to:String) {
			import(from:$from, to:$to)
	}`
	const variables = {from, to};

	return request(endpoint, mutation, variables);
}

function doDownloadIndex(title, year, issue){


    const endpoint = '/graphql';
    const mutation = `mutation downloadIndex($year:Int, $issue:Int) {
        download_index(year:$year, issue:$issue)
    }`
    const variables = {issue, year};

    return request(endpoint, mutation, variables).then(data =>{
      return Promise.resolve(data);
    }, err =>{
      return Promise.resolve(err);
    })
}



export default Filing;
