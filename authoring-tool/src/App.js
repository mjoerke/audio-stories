// @flow

import produce from "immer";
import * as React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import type { CardData } from "./model/CardData";
import Canvas from "./components/Canvas";
import SidePanel from "./components/SidePanel";

import "./App.css";

function App(): React.MixedElement {
  const [cards, setCards] = React.useState(() => new Map());
  const addCard = (newCard: CardData) => {
    setCards((baseState) =>
      produce(baseState, (draftState) => {
        draftState.set(newCard.id, newCard);
      })
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App-container">
        <SidePanel />
        <Canvas addCard={addCard} cards={cards} />
      </div>
    </DndProvider>
  );
}

export default App;
