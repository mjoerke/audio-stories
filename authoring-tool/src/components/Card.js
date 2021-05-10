// @flow

import * as React from "react";
import { useDrag } from "react-dnd";

import type { DraggableType } from "../constants/Draggables";
import type { UniqueId } from "../util/UniqueId";
import Draggables from "../constants/Draggables";

import "./Card.css";

type Props = {
  id?: UniqueId,
  size?: number,
  type?: DraggableType,
};

export default function Card({
  id,
  size = 200,
  type = Draggables.CARD,
}: Props): React.MixedElement {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type,
      item: { id, size, type },
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
    <div
      ref={drag}
      className={containerClass}
      style={{
        height: size,
        width: size,
      }}
    >
      Card
    </div>
  );
}
