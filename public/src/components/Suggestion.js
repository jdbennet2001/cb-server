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

    let {image, name, store_date, url} = this.props.record;

    return <div className='pane suggestion'>
              <div className='left'>
                <a href={url} target="_blank">
                  <img src={image}></img>
                </a>
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