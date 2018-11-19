const React   = require('react');
const _       = require('lodash');

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
    let {name:series_name, id, count, location} = this.props.record.series;
    let exists = _.isNumber(count) && count > 0;

    let component_classes = ``;

    return <div className={`pane suggestion exists_${exists}`}>
              <div className='left'>
                <a href={url} target="_blank">
                  <img src={image}></img>
                </a>
              </div>
              <div className='right'>
                {series_name && <div className='name'>{series_name}</div>}
                <div className='name'>{name}</div>
                <div dangerouslySetInnerHTML={this.createMarkup()} ></div>
                <div>
                  <div className='date'>{store_date}</div>
                  {exists && <div className='exists'> &#10003;</div>}
                </div>
              </div>
           </div>
    
  }
}



export default Suggestion;