// @flow

import * as React from "react";
import { LINK_BUTTON_HEIGHT } from "../constants/Constants";

import "./CardLinkButton.css";

type Props = {
  id: UniqueId,
  isDrawingNewLinkFrom: ?UniqueId,
  linkButtonType: LinkButtonType,
  onCreateLink: (UniqueId) => void,
  removeLink: () => void,
  topOffset: number,
};

export default function CardLinkButton({
  id,
  isDrawingNewLinkFrom,
  linkButtonType,
  onCreateLink,
  removeLink,
  topOffset,
}: Props): React.MixedElement {
  return (
    <button
      className="CardLinkButton-container"
      onClick={(_e) => {
        switch (linkButtonType) {
          case "add":
            if (isDrawingNewLinkFrom == null) {
              onCreateLink(id, topOffset + LINK_BUTTON_HEIGHT / 2);
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
      style={{ top: topOffset }}
      type="button"
    >
      {linkButtonType === "add" ? (
        <i className="gg-add" />
      ) : (
        <i className="gg-close-o CardLinkButton-closeButton" />
      )}
    </button>
  );
}
