const React 	= require('react');
const ReactDOM 	= require('react-dom');

import './Header.css'

class Header extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let {count} = this.props;
    return <div className='header'>
	        <span>CB-Web</span>
	        <img src="./icons/update.png" height="32px"></img>
	        <img src="./icons/filing.png" height="32px"></img>
	        <img src="./icons/read.png" height="32px"></img>
          <div className='spacer'></div>
          <div className='count'>{count}</div>
    	</div>
  }
}

export default Header;
