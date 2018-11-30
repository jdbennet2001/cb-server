const React 	= require('react');
const ReactDOM 	= require('react-dom');

import './Header.css'

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {message: ''};
  }

  componentDidMount(){
    let self = this;
    window.bus.on('message', message =>{
      self.setState({message: JSON.stringify(message)})
    })
  }

  downloadMetadata(){
    window.bus.emit('downloadMetadata');
  }

  refreshCatalog(){
    window.bus.emit('refreshCatalog')
  }

  fileComics(){
    window.bus.emit('fileComics')
  }

  render() {
    let {count} = this.props;
    let {message} = this.state;
    return <div className='header'>
	        <span>CB-Web</span>
	        <img src="./icons/update.png" data-tip='Update Catalog' onClick={this.refreshCatalog} height="32px"></img>
	        <img src="./icons/filing.png" data-tip='File queued comics' onClick={this.fileComics} height="32px"></img>
          <img src="./icons/download.svg" data-tip='Download Metadata' onClick={this.downloadMetadata} height="32px"></img>
	        <div className='spacer'>{message}</div>
          <div className='count'>{count}</div>
    	</div>
  }
}

export default Header;
