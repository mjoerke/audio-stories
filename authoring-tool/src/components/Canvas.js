// @flow

import * as React from "react";
import { useDrop } from "react-dnd";

import type { CardData } from "../model/CardData";
import type { UniqueId } from "../util/UniqueId";
import Card from "./Card";
import Draggables from "../constants/Draggables";
import { calculateDropPosition } from "../util/DropTargetMonitorHelper";
import makeUniqueId from "../util/UniqueId";

import "./Canvas.css";

type Props = $ReadOnly<{
  addCard: (CardData) => void,
  cards: Map<UniqueId, CardData>,
  moveCard: (CardData) => void,
}>;

function Canvas({ addCard, cards, moveCard }: Props): React.MixedElement {
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: [Draggables.NEW_CARD, Draggables.CARD],
      drop: (item, monitor) => {
        const dropPos = calculateDropPosition(monitor);
        if (dropPos == null) {
          console.error("Tried to drop a new card that wasn't being dragged!");
        } else if (item.type === Draggables.NEW_CARD) {
          addCard({
            id: makeUniqueId(),
            x: dropPos.x,
            y: dropPos.y,
          });
        } else if (item.type === Draggables.CARD) {
          const currentCard = cards.get(item.id);
          if (currentCard == null) {
            console.error(`Couldn't find card with id: ${item.id}!`);
          } else {
            moveCard({
              ...currentCard,
              x: dropPos.x,
              y: dropPos.y,
            });
          }
        }
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [addCard, cards, moveCard]
  );

  const containerClass = `Canvas-container${
    isOver ? " Canvas-containerDropping" : ""
  }`;
  return (
    <div ref={drop} className={containerClass}>
      {Array.from(cards).map(([id, card]) => (
        <div
          style={{
            position: "absolute",
            left: card.x,
            top: card.y,
          }}
        >
          <Card id={id} />
        </div>
      ))}
    </div>
  );
}

export default Canvas;
