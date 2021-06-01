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
      headerColor="#c0ecfd"
      title="Audio"
      type={Draggables.AUDIO_CARD}
      allowSelfLoops={false}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...otherProps}
    >
      <textarea
        className="AudioCard-textarea"
        onChange={
          onTextChange != null ? (e) => onTextChange(e.target.value) : undefined
        }
        readOnly={text == null || onTextChange == null}
        value={text}
      />
    </BaseCard>
  );
}
