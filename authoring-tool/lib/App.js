//      

import produce from "immer";
import * as React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

             
                
           
                     
                 
                          
                                                
import Canvas from "./components/Canvas";
import SidePanel from "./components/SidePanel";

import "./App.css";

function App()                     {
  const [cards, setCards] = React.useState(() => new Map                    ());
  const addCard = (newCard          ) => {
    setCards((baseState) =>
      produce(baseState, (draftState) => {
        draftState.set(newCard.id, newCard);
      })
    );
  };
  const updateCard = (editedCard          ) => {
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
  const addSimpleLink = (
    fromCard                                    ,
    to          
  ) => {
    updateCard(
      produce(fromCard, (draftState) => {
        // eslint-disable-next-line no-param-reassign
        draftState.links = {
          next: to,
          type: "simple_link",
        };
      })
    );
  };

  const addClassifierLink = (
    fromCard                    ,
    link                
  ) => {
    updateCard(
      produce(fromCard, (draftState) => {
        // eslint-disable-next-line no-param-reassign
        draftState.links.links.push(link);
      })
    );
  };

  const removeLink = (from          , to          ) => {
    const fromCard = cards.get(from);
    if (fromCard == null) {
      console.error(
        // $FlowExpectedError coerce id for the sake of logging
        `removeLink called with unrecognized card id: ${from}`
      );
      return;
    }
    switch (fromCard.links.type) {
      case "simple_link":
        updateCard(
          produce(fromCard, (draftState) => {
            // eslint-disable-next-line no-param-reassign
            draftState.links = {
              next: null,
              type: "simple_link",
            };
          })
        );
        break;
      case "classifier_links":
        updateCard(
          produce(fromCard, (draftState) => {
            // eslint-disable-next-line no-param-reassign
            draftState.links = {
              links: draftState.links.links.filter((link) => link.next !== to),
              type: "classifier_links",
            };
          })
        );
        break;
      default:
        throw new Error(
          `removeLink: unrecognized link type: ${fromCard.links.type}`
        );
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App-container">
        <SidePanel />
        <Canvas
          addCard={addCard}
          addClassifierLink={addClassifierLink}
          addSimpleLink={addSimpleLink}
          cards={cards}
          updateCard={updateCard}
          removeLink={removeLink}
        />
      </div>
    </DndProvider>
  );
}

export default App;
