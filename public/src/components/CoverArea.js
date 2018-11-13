const React 	= require('react');
const append_query 	= require('append-query')



import './CoverArea.css'

 
class CoverArea extends React.Component {

  constructor(props) {
    super(props);
  }


  render() {

	let {location, name, year, number, title} = this.props.issue;
  	let cover = append_query( `/page`, {archive: location, number: 0} );
  	
  	debugger;
    return <div className='coverArea pane'>
    	<img src={cover}></img>

    	<div>
    		<div className='row'>
    			<label> Title:  </label> <input type="text" name="title" value={title} /> 
    		</div>
    		<div className='row'>
    			<label> Issue: </label> <input type="text" name="issue" value={number}/> 
    		</div>
    		<div className='row'>
    			<label> Year:  </label> <input type="text" name="year" value={year}/>
    		</div>
    	</div>

    </div>
    
  }





}


export default CoverArea;