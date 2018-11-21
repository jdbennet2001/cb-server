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

  file(){
    let {name:series_name, id, count, location} = this.props.record.series;
    let {name:summary, issue_number, store_date} = this.props.record;

    let basename = `${series_name}`;
        basename = (issue_number) ? `${basename} #${_.padStart(issue_number, 3, '0')}` : basename;
        basename = (store_date) ? `${basename} (${store_date})` : basename;
        basename = (summary) ? `${basename} - ${summary}` : basename;
        basename = `${basename}.cbr`;

    getSeriesLocation(id).then(data =>{
      let {directory,name, publisher, start_year} = data.volume
      window.bus.emit('target', `${directory}/${basename}`);
    }, err =>{

    })
  }

  render() {

    let {image, name, store_date, url} = this.props.record;
    let {name:series_name, id, count, location} = this.props.record.series;
    let exists = _.isNumber(count) && count > 0;

    let component_classes = ``;

    let file = this.file.bind(this);

    return <div onClick={file} className={`pane suggestion exists_${exists}`}>
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

/*
 Get all queued comics from the download directory
 */
function getSeriesLocation(id){

	const endpoint = '/graphql';
	const query = `query getVolume($id:String) {
			volume(id:$id){
        name
        publisher
        start_year
        directory
			}
	}`

	const variables = {id};

	return request(endpoint, query, variables);
}



export default Suggestion;
