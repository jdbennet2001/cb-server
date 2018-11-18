const React 	= require('react');
const append_query 	= require('append-query')

const _       = require('lodash');

import './CoverArea.css'

 
class CoverArea extends React.Component {

  constructor(props) {
    super(props);
  }

  update(args){
    let {name, value} = args.target;
    window.bus.emit('issue', {name, value});
  }


  render() {

	  let {location, name, year, number, title} = this.props.issue;
  	let cover = append_query( `/page`, {archive: location, number: 0} );

    let update = this.update.bind(this);
  	
    return <div className='coverArea pane'>
    	<img src={cover}></img>

    	<div>
    		<div className='row'>
    			<label> Title:  </label> <input type="text" onChange={update} name="title" value={title} /> 
    		</div>
    		<div className='row'>
    			<label> Issue: </label> <input type="text" onChange={update} name="number" value={number}/> 
    		</div>
    		<div className='row'>
    			<label> Year:  </label> <input type="text" onChange={update} name="year" value={year}/>
    		</div>
    	</div>

    </div>
    
  }





}


export default CoverArea;