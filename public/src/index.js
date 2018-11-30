import React 	  from'react';
import ReactDOM from'react-dom';
import Filing 	from './components/Filing'

/* Add browser level messaging support */
import  nanobus from 'nanobus';
window.bus = new nanobus();

/* Async updates from the server */
import io from 'socket.io-client';

var socket = io();

socket.on('connect', function(){
  console.log('Socket connected');
});

socket.on('message', function(data){
  console.log(`Socket message: ${data}`);
  window.bus.emit('message', data);
});

socket.on('disconnect', function(){
    console.log('Socket disconnected');
});

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
