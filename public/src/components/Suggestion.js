const React   = require('react');

import { request } from 'graphql-request'



import './Suggestion.css'

 
class Suggestion extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount(){

  }

  createMarkup() {
    let {description} = this.props.record;
    return {__html: description};
  }


  render() {
    debugger;
    let {image, name, description, store_date} = this.props.record;

    return <div className='pane suggestion'>
              <div className='left'>
                <img src={image}></img>
              </div>
              <div className='right'>
                <div className='name'>{name}</div>
                <div dangerouslySetInnerHTML={this.createMarkup()} ></div>
                <div>{store_date}</div>
              </div>
           </div>
    
  }
}



export default Suggestion;