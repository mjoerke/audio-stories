// @flow

import * as React from "react";
import { useDrop } from "react-dnd";

import Draggables from "../constants/Draggables";

import "./Canvas.css";

function Canvas(): React.MixedElement {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: Draggables.CARD,
    drop: () => {
      /* TODO */
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
      Canvas
    </div>
  );
}

export default Canvas;
