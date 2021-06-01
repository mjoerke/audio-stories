// @flow

import produce from "immer";
import * as React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import type {
  AudioCardData,
  CardData,
  ClassifierCardData,
  ClassifierLink,
  DraftClassifierLink,
} from "./model/CardData";
import type { UniqueId } from "./util/UniqueId";
import Canvas from "./components/Canvas";
import SidePanel from "./components/SidePanel";
import { assertCardsValid } from "./util/Assert";
import { exportAsObject, validate } from "./util/Serializer";

import "./App.css";

function App(): React.MixedElement {
  const [cards, setCards] = React.useState(() => new Map<UniqueId, CardData>());

  // On dev, validate state after every update
  React.useEffect(() => {
    // eslint-disable-next-line no-constant-condition
    if (process.env.NODE_ENV || "development") {
      assertCardsValid(cards);
    }
  }, [assertCardsValid, cards]);

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

  const removeCard = (idToDelete: UniqueId) => {
    setCards((baseState) =>
      produce(baseState, (draftState) => {
        baseState.forEach((card, id) => {
          switch (card.links.type) {
            case "simple_link": {
              if (card.links.next === idToDelete) {
                draftState.set(id, {
                  ...card,
                  links: {
                    ...card.links,
                    next: null,
                  },
                });
              }
              break;
            }
            case "classifier_links": {
              const newLinks = card.links.links.filter(
                (link) => link.next !== idToDelete
              );
              draftState.set(id, {
                ...card,
                links: { ...card.links, links: newLinks },
              });
              break;
            }
            default:
              throw new Error(
                `deleteCard: unrecognized link type: ${card.links.type}`
              );
          }
        });

        const didDelete = draftState.delete(idToDelete);
        if (!didDelete) {
          console.error(
            // $FlowExpectedError coerce id for the sake of logging
            `deleteCard called with unrecognized card id: ${idToDelete}`
          );
        }
      })
    );
  };

  const addSimpleLink = (
    fromCard: AudioCardData | ClassifierCardData,
    to: UniqueId
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
    fromCard: ClassifierCardData,
    link: ClassifierLink
  ) => {
    updateCard(
      produce(fromCard, (draftState) => {
        // eslint-disable-next-line no-param-reassign
        draftState.links.links.push(link);
      })
    );
  };

  const updateClassifierLinks = (
    id: UniqueId,
    links: Array<ClassifierLink | DraftClassifierLink>
  ) => {
    setCards((baseState) => {
      const foundCard = baseState.get(id);
      if (foundCard == null) {
        console.error(
          // $FlowExpectedError coerce id for the sake of logging
          `updateClassifierLinks called with unrecognized card id: ${id}`
        );
        return baseState;
      }
      // TODO: confirm that it's a classifier card
      const editedCard = {
        ...foundCard,
        links: {
          ...foundCard.links,
          links,
        },
      };
      return produce(baseState, (draftState) => {
        draftState.set(editedCard.id, editedCard);
      });
    });
  };

  const removeLink = (from: UniqueId, to: UniqueId) => {
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

  const onUploadStart = async () => {
    const obj = exportAsObject(cards);
    console.log(JSON.stringify(obj, null, 2));
    if (validate(obj)) {
      // eslint-disable-next-line no-undef
      const response = await fetch(
        "https://anelise-lambda.csail.mit.edu:5000/save-audio-story",
        {
          method: "POST",
          // pretty print JSON
          body: JSON.stringify(obj, null, 2),
        }
      );
      const result = await response.text();
      console.log("result:", result);
    } else {
      console.error("Failed to validate story JSON");
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App-container">
        <SidePanel onUploadStart={onUploadStart} />
        <Canvas
          addCard={addCard}
          addClassifierLink={addClassifierLink}
          addSimpleLink={addSimpleLink}
          cards={cards}
          updateCard={updateCard}
          removeCard={removeCard}
          removeLink={removeLink}
          updateClassifierLinks={updateClassifierLinks}
        />
      </div>
    </DndProvider>
  );
}

export default App;
