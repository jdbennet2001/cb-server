'use strict';

let ActionHeader = import './ActionHeader'

class main extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
   
  }
}

let domContainer = document.querySelector('#like_button_container');
ReactDOM.render(<LikeButton />, domContainer);
