// @flow

import * as React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import Canvas from "./components/Canvas";
import SidePanel from "./components/SidePanel";

import "./App.css";

function App(): React.MixedElement {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App-container">
        <SidePanel />
        <Canvas />
      </div>
    </DndProvider>
  );
}

export default App;
