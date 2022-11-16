import React from 'react';

import { Map, Marker } from './lib';
import './App.css'

import markerIcon from './assets/smth.svg';

function App() {
  return (
    <div className="App">
      <Map>
        <Marker src={markerIcon} coords={[4071043.9470975567, 6545824.047756359]} name="Test" id="56" onClick={() => console.log('1')} />
        <Marker src={markerIcon} coords={[4071243.9470975567, 6545824.047756359]} name="asdha" id="87" onClick={() => console.log('2')} />
      </Map>
    </div>
  );
}

export default App;
