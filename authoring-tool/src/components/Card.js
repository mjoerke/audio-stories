// @flow

import * as React from "react";
import { useDrag } from "react-dnd";

import type { DraggableType } from "../constants/Draggables";
import { DEFAULT_CARD_SIZE } from "../model/CardData";
import type { UniqueId } from "../util/UniqueId";
import Draggables from "../constants/Draggables";

import "./Card.css";

type Props = {
  id?: UniqueId,
  isDrawingNewLinkFrom: ?UniqueId,
  onCreateLink?: (UniqueId) => void,
  onFinishLink?: (UniqueId) => void,
  height?: number,
  linkButtonText?: string,
  type?: DraggableType,
  width?: number,
};

export default function Card({
  id,
  isDrawingNewLinkFrom,
  onCreateLink,
  onFinishLink,
  height = DEFAULT_CARD_SIZE,
  linkButtonText = "▶",
  width = DEFAULT_CARD_SIZE,
  type = Draggables.CARD,
}: Props): React.MixedElement {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type,
      item: { id, height, width, type },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [type]
  );

  let containerClass = "Card-container";
  if (isDragging) {
    containerClass += " Card-containerBeingDragged";
  }
  return (
    <div
      ref={drag}
      className={containerClass}
      style={{
        height,
        width,
      }}
    >
      Card
      {onCreateLink && onFinishLink && id != null ? (
        <button
          className="Card-linkHandle"
          onClick={(_e) => {
            if (isDrawingNewLinkFrom != null) {
              onFinishLink(id);
            } else {
              onCreateLink(id);
            }
          }}
          style={{ top: height / 2 }}
          type="button"
        >
          {linkButtonText}
        </button>
      ) : null}
    </div>
  );
}
