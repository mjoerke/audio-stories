// @flow

import * as React from "react";

import Canvas from "./components/Canvas";
import SidePanel from "./components/SidePanel";

import "./App.css";

function App(): React.MixedElement {
  return (
    <div className="App-container">
      <SidePanel />
      <Canvas />
    </div>
  );
}

export default App;
