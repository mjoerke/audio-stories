// @flow

import * as React from "react";
import { useDrag } from "react-dnd";

import type { DraggableType } from "../constants/Draggables";
import { DEFAULT_CARD_SIZE } from "../constants/Constants";
import type { UniqueId } from "../util/UniqueId";
import { uniqueIdAsString } from "../util/UniqueId";

import "css.gg/icons/css/add.css";
import "css.gg/icons/css/close.css";
import "css.gg/icons/css/close-o.css";
import "./BaseCard.css";

export type ExposedProps = {
  canDeleteLinkTo: boolean,
  id?: UniqueId,
  isDrawingNewLinkFrom: ?UniqueId,
  onCreateLink?: (UniqueId) => void,
  onDelete?: () => void,
  onFinishLink?: (UniqueId) => void,
  onMouseMove?: (MouseEvent) => void,
  height?: number,
  linkButtonText?: string,
  title?: string,
  type?: DraggableType,
  width?: number,
  children?: React.Node,
};

type Props = {
  ...ExposedProps,
  // Provided by the rendering card
  type: DraggableType,
};

export default function BaseCard({
  canDeleteLinkTo,
  id,
  isDrawingNewLinkFrom,
  onCreateLink,
  onDelete,
  onFinishLink,
  onMouseMove,
  height = DEFAULT_CARD_SIZE,
  linkButtonText = "+",
  title = "Card",
  width = DEFAULT_CARD_SIZE,
  type,
  children = null,
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
  const [isMouseOver, setIsMouseOver] = React.useState(false);

  let overlayClass = "BaseCard-canLinkOverlay";
  if (canDeleteLinkTo) {
    overlayClass += " BaseCard-canLinkOverlayDisconnect";
  } else {
    overlayClass += " BaseCard-canLinkOverlayConnect";
  }
  const overlay =
    isDrawingNewLinkFrom != null &&
    isDrawingNewLinkFrom !== id &&
    isMouseOver ? (
      <div className={overlayClass}>
        {canDeleteLinkTo ? "Disconnect" : "Connect"}
      </div>
    ) : null;

  let containerClass = "BaseCard-container";
  if (isDragging) {
    containerClass += " BaseCard-containerBeingDragged";
  }
  return (
    // TODO: ignore a11y concerns for now
    // eslint-disable-next-line
    <div
      ref={drag}
      className={containerClass}
      onClick={(_e) => {
        if (
          isDrawingNewLinkFrom != null &&
          onFinishLink != null &&
          id != null
        ) {
          onFinishLink(id);
        }
      }}
      onMouseEnter={(_) => setIsMouseOver(true)}
      onMouseLeave={(_) => setIsMouseOver(false)}
      onMouseMove={onMouseMove}
      style={{
        height,
        width,
      }}
    >
      <div>
        {title}{" "}
        {id != null ? <span>{`(id: ${uniqueIdAsString(id)})`}</span> : null}
      </div>
      {children}
      {onCreateLink && onFinishLink && id != null ? (
        <button
          className="BaseCard-linkHandle"
          onClick={(_e) => {
            if (isDrawingNewLinkFrom != null) {
              onFinishLink(id);
            } else {
              onCreateLink(id);
            }
          }}
          /* offset by half button height to center */
          style={{ top: height / 2 - 11 }}
          type="button"
        >
          {/* TODO: hacky, should change */}
          {linkButtonText === "+" ? (
            <i className="gg-add" />
          ) : (
            <i className="gg-close-o" />
          )}
        </button>
      ) : null}
      {onDelete && id != null ? (
        <button
          className="BaseCard-deleteButton"
          type="button"
          onClick={(_e) => onDelete()}
        >
          <i className="gg-close" />
        </button>
      ) : null}
      {overlay}
    </div>
  );
}
