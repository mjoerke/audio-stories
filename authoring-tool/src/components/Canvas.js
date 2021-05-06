// @flow

import * as React from "react";
import { useDrop } from "react-dnd";

import type { CardData } from "../model/CardData";
import type { UniqueId } from "../util/UniqueId";
import Card from "./Card";
import Draggables from "../constants/Draggables";
import makeUniqueId from "../util/UniqueId";

import "./Canvas.css";

type Props = $ReadOnly<{
  addCard: (CardData) => void,
  cards: Map<UniqueId, CardData>,
}>;

function Canvas({ addCard, cards }: Props): React.MixedElement {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: Draggables.CARD,
    drop: (_item, monitor) => {
      const {
        // $FlowExpectedError[incompatible-use] skip null check bc we know item is dragged
        x: xNodeStart,
        // $FlowExpectedError[incompatible-use] skip null check bc we know item is dragged
        y: yNodeStart,
      } = monitor.getInitialSourceClientOffset();
      const {
        // $FlowExpectedError[incompatible-use] skip null check bc we know item is dragged
        x: xPointerStart,
        // $FlowExpectedError[incompatible-use] skip null check bc we know item is dragged
        y: yPointerStart,
      } = monitor.getInitialClientOffset();
      // $FlowExpectedError[incompatible-use] skip null check bc we know item is dragged
      const {
        // $FlowExpectedError[incompatible-use] skip null check bc we know item is dragged
        x: xPointerEnd,
        // $FlowExpectedError[incompatible-use] skip null check bc we know item is dragged
        y: yPointerEnd,
      } = monitor.getClientOffset();

      addCard({
        id: makeUniqueId(),
        /* x and y correspond to the top-left coordinates of the item.
         * However, we typically drag items from somewhere inside the item,
         * rather than from exactly the top-left corner. In order to correct
         * for this discrepancy, we need to calculate the distance between the
         * initial node position and the initial pointer pos, and then subtract
         * that from the final position pos. */
        x: xPointerEnd - (xPointerStart - xNodeStart),
        y: yPointerEnd - (yPointerStart - yNodeStart),
      });
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const containerClass = `Canvas-container${
    isOver ? " Canvas-containerDropping" : ""
  }`;
  return (
    <div ref={drop} className={containerClass}>
      {Array.from(cards).map(([_id, card]) => (
        <div
          style={{
            position: "absolute",
            left: card.x,
            top: card.y,
          }}
        >
          <Card />
        </div>
      ))}
    </div>
  );
}

export default Canvas;
