const React 	= require('react');
const append_query 	= require('append-query')

const _       = require('lodash');

import './CoverArea.css'


class CoverArea extends React.Component {

  constructor(props) {
    super(props);
    this.state = this.props.issue;
  }

  update(args){
    let {name, value} = args.target;
    let state = this.state;
    state[name] = value;
    this.setState(state);
  }

  blur(args){
    let {name, value} = args.target;
    window.bus.emit('issue', {name, value});

  }


  render() {

	  let {location, name, year, number, title} = this.state;
    
  	let cover = append_query( `/page`, {archive: location, number: 0} );

    let update = this.update.bind(this);
    let blur = this.blur.bind(this);

    return <div className='coverArea pane'>
    	<img src={cover}></img>

    	<div>
    		<div className='row'>
    			<label> Title:  </label> <input type="text" onChange={update} onBlur={blur} name="title" value={title} />
    		</div>
    		<div className='row'>
    			<label> Issue: </label> <input type="text" onChange={update} onBlur={blur}  name="number" value={number}/>
    		</div>
    		<div className='row'>
    			<label> Year:  </label> <input type="text" onChange={update} onBlur={blur} name="year" value={year}/>
    		</div>
    	</div>

    </div>

  }





}


export default CoverArea;
