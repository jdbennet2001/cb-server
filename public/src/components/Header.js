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
      self.setState({message})
    })
  }

  render() {
    let {count} = this.props;
    let {message} = this.state;
    return <div className='header'>
	        <span>CB-Web</span>
	        <img src="./icons/update.png" title='Update Catalog' height="32px"></img>
	        <img src="./icons/filing.png" title='File queued comics' height="32px"></img>
          <img src="./icons/download.svg" title='Download Metadata' height="32px"></img>
	        <div className='spacer'>{message}</div>
          <div className='count'>{count}</div>
    	</div>
  }
}

export default Header;
