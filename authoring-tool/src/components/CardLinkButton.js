// @flow

import * as React from "react";

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
      className="BaseCard-linkHandle"
      onClick={(_e) => {
        switch (linkButtonType) {
          case "add":
            if (isDrawingNewLinkFrom == null) {
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
      style={{ top: topOffset }}
      type="button"
    >
      {linkButtonType === "add" ? (
        <i className="gg-add" />
      ) : (
        <i className="gg-close-o" />
      )}
    </button>
  );
}
