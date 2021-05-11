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
  isUserCreatingLink?: boolean,
  onCreateLink?: (UniqueId) => void,
  onFinishLink?: (UniqueId) => void,
  size?: number,
  type?: DraggableType,
};

export default function Card({
  id,
  isUserCreatingLink,
  onCreateLink,
  onFinishLink,
  size = DEFAULT_CARD_SIZE,
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

  let containerClass = "Card-container";
  if (isDragging) {
    containerClass += " Card-containerBeingDragged";
  }
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
      {onCreateLink && onFinishLink && id != null ? (
        <button
          className="Card-linkHandle"
          onClick={(_e) => {
            if (isUserCreatingLink) {
              onFinishLink(id);
            } else {
              onCreateLink(id);
            }
          }}
          style={{ top: size / 2 }}
          type="button"
        >
          ▶
        </button>
      ) : null}
    </div>
  );
}
