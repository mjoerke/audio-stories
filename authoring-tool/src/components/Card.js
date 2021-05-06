// @flow

import * as React from "react";
import { useDrag } from "react-dnd";

import Draggables from "../constants/Draggables";

import "./Card.css";

export default function Card(): React.MixedElement {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: Draggables.CARD,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const containerClass = `Card-container${
    isDragging ? " Card-containerBeingDragged" : ""
  }`;
  return (
    <div ref={drag} className={containerClass}>
      Card
    </div>
  );
}
