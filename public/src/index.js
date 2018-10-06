import React 	from'react';
import ReactDOM from'react-dom';
 
import Filing 	from './components/Filing'

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