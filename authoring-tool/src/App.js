// @flow

import produce from "immer";
import * as React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import type { CardData, AudioCardData } from "./model/CardData";
import type { UniqueId } from "./util/UniqueId";
import Canvas from "./components/Canvas";
import SidePanel from "./components/SidePanel";

import "./App.css";

function App(): React.MixedElement {
  const [cards, setCards] = React.useState(() => new Map<UniqueId, CardData>());
  const [links, setLinks] = React.useState(
    () => new Map<UniqueId, Set<UniqueId>>()
  );
  const addCard = (newCard: CardData) => {
    setCards((baseState) =>
      produce(baseState, (draftState) => {
        draftState.set(newCard.id, newCard);
      })
    );
  };
  const updateCard = (editedCard: CardData) => {
    setCards((baseState) => {
      const foundCard = baseState.get(editedCard.id);
      if (foundCard == null) {
        console.error(
          // $FlowExpectedError coerce id for the sake of logging
          `updateCard called with unrecognized card id: ${editedCard.id}`
        );
        return baseState;
      }
      return produce(baseState, (draftState) => {
        draftState.set(editedCard.id, editedCard);
      });
    });
  };
  // const editAudioCardText = (editedCardUncasted: CardData) => {
  //   if (
  //     editedCardUncasted.type !== "audio_card" ||
  //     editedCardUncasted.text === undefined
  //   ) {
  //     console.error(
  //       // $FlowExpectedError coerce id for the sake of logging
  //       `editAudioCardText called with non-AudioCard id: ${editedCardUncasted.id}`
  //     );
  //     return;
  //   }
  //   const editedCard: AudioCardData = editedCardUncasted;
  // };
  const addLink = (from: UniqueId, to: UniqueId) => {
    setLinks((baseState) =>
      produce(baseState, (draftState) => {
        const ends = draftState.get(from);
        if (ends == null) {
          draftState.set(from, new Set([to]));
        } else {
          ends.add(to);
        }
      })
    );
  };
  const removeLink = (from: UniqueId, to: UniqueId) => {
    setLinks((baseState) =>
      produce(baseState, (draftState) => {
        const ends = draftState.get(from);
        if (ends == null) {
          console.error(
            // $FlowExpectedError coerce id for the sake of logging
            `removeLink called but card ${from} has no outgoing links!`
          );
        } else {
          ends.delete(to);
        }
      })
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App-container">
        <SidePanel />
        <Canvas
          addCard={addCard}
          addLink={addLink}
          cards={cards}
          links={links}
          updateCard={updateCard}
          removeLink={removeLink}
        />
      </div>
    </DndProvider>
  );
}

export default App;
