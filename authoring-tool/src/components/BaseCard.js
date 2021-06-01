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

export type LinkButtonType = "add" | "close";

export type ExposedProps = {
  id?: UniqueId,
  isDrawingNewLinkFrom: ?UniqueId,
  onCreateLink?: (UniqueId) => void,
  onDelete?: () => void,
  onFinishLink?: (UniqueId) => void,
  onMouseMove?: (MouseEvent) => void,
  height?: number,
  isHovered: boolean,
  linkButtonType?: LinkButtonType,
  removeLink?: () => void,
  setHoveredCardId?: (?UniqueId) => void,
  title?: string,
  type?: DraggableType,
  width?: number,
  children?: React.Node,
};

type Props = {
  ...ExposedProps,
  allowSelfLoops?: boolean,
  headerColor: string,
  // Provided by the rendering card
  type: DraggableType,
};

export default function BaseCard({
  id,
  isDrawingNewLinkFrom,
  onCreateLink,
  onDelete,
  onFinishLink,
  onMouseMove,
  headerColor,
  height = DEFAULT_CARD_SIZE,
  isHovered,
  linkButtonType = "add",
  removeLink,
  setHoveredCardId,
  title = "Card",
  width = DEFAULT_CARD_SIZE,
  type,
  children = null,
  allowSelfLoops = true,
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

  const illegalSelfLoop = isDrawingNewLinkFrom === id && !allowSelfLoops;
  const overlay =
    isDrawingNewLinkFrom != null && !illegalSelfLoop && isHovered ? (
      <div className="BaseCard-canLinkOverlay" />
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
      onMouseEnter={(_) => {
        if (setHoveredCardId) {
          setHoveredCardId(id);
        }
      }}
      onMouseLeave={(_) => {
        if (setHoveredCardId) {
          setHoveredCardId(null);
        }
      }}
      onMouseMove={onMouseMove}
      style={{
        height,
        width,
      }}
    >
      <div className="BaseCard-header" style={{ backgroundColor: headerColor }}>
        {title}{" "}
        {id != null ? <span>{`(id: ${uniqueIdAsString(id)})`}</span> : null}
      </div>
      <div className="BaseCard-content">{children}</div>
      {onCreateLink && onFinishLink && id != null ? (
        <button
          className="BaseCard-linkHandle"
          onClick={(_e) => {
            switch (linkButtonType) {
              case "add":
                if (isDrawingNewLinkFrom != null) {
                  onFinishLink(id);
                } else {
                  onCreateLink(id);
                }
                break;
              case "close":
                if (removeLink != null) {
                  removeLink();
                }
                break;
              default:
                console.error(
                  `link button onClick: unrecognized link button type ${linkButtonType}`
                );
            }
          }}
          /* offset by half button height to center */
          style={{ top: height / 2 - 11 }}
          type="button"
        >
          {linkButtonType === "add" ? (
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
