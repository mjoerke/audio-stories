// @flow

import * as React from "react";
import Draggables from "../constants/Draggables";
import type { ExposedProps as CardProps } from "./BaseCard";
import BaseCard from "./BaseCard";
import "./AudioCard.css";

type Props = {
  ...CardProps,
  onTextChange?: (string) => void,
  text?: string,
};

export default function AudioCard({
  onTextChange,
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
