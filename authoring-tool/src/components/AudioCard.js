// @flow

import * as React from "react";
import Draggables from "../constants/Draggables";
import type { ExposedProps as CardProps } from "./BaseCard";
import BaseCard from "./BaseCard";
import "./AudioCard.css";
import {
  DEFAULT_CARD_HEIGHT,
  DEFAULT_CARD_SIZE,
  LINK_BUTTON_HEIGHT,
} from "../constants/Constants";
import CardLinkButton from "./CardLinkButton";

type Props = {
  ...CardProps,
  // linkButtonType?: LinkButtonType,
  // onCreateLink?: (UniqueId) => void,
  // onTextChange?: (string) => void,
  // removeLink?: () => void,
  text?: string,
};

export default function AudioCard({
  linkButtonType,
  onCreateLink,
  onTextChange,
  removeLink,
  text,
  ...otherProps
}: Props): React.MixedElement {
  return (
    <BaseCard
      title="Audio"
      type={Draggables.AUDIO_CARD}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...otherProps}
      allowSelfLoops={false}
      headerColor="#c0ecfd"
      linkButtons={
        onCreateLink && otherProps.id != null ? (
          <CardLinkButton
            id={otherProps.id}
            isDrawingNewLinkFrom={otherProps.isDrawingNewLinkFrom}
            linkButtonType={linkButtonType}
            onCreateLink={onCreateLink}
            removeLink={removeLink}
            topOffset={DEFAULT_CARD_HEIGHT / 2 - LINK_BUTTON_HEIGHT / 2}
          />
        ) : null
      }
    >
      <textarea
        className="AudioCard-textarea"
        onChange={
          onTextChange != null ? (e) => onTextChange(e.target.value) : undefined
        }
        placeholder="Type..."
        readOnly={text == null || onTextChange == null}
        value={text}
      />
    </BaseCard>
  );
}
