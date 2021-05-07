// @flow

import * as React from "react";
import { useDrag } from "react-dnd";

import type { DraggableType } from "../constants/Draggables";
import type { UniqueId } from "../util/UniqueId";
import Draggables from "../constants/Draggables";

import "./Card.css";

type Props = {
  id?: UniqueId,
  type?: DraggableType,
};

export default function Card({
  id,
  type = Draggables.CARD,
}: Props): React.MixedElement {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type,
      item: { id, type },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [type]
  );

  const containerClass = `Card-container${
    isDragging ? " Card-containerBeingDragged" : ""
  }`;
  return (
    <div ref={drag} className={containerClass}>
      Card
    </div>
  );
}
