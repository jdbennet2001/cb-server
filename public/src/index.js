import React 	  from'react';
import ReactDOM from'react-dom';
import Filing 	from './components/Filing'

/* Add browser level messaging support */
import  nanobus from 'nanobus';
window.bus = new nanobus();

class MainCanvas extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <Filing></Filing>
  }
}

let domContainer = document.querySelector('#canvas');
ReactDOM.render(<MainCanvas/>, domContainer);
