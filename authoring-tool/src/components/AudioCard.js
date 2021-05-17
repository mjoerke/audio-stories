// @flow

import * as React from "react";
import type { Props as CardProps } from "./Card";
import Card from "./Card";

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
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Card title="Audio" {...otherProps}>
      <textarea
        onChange={
          onTextChange != null ? (e) => onTextChange(e.target.value) : undefined
        }
        readOnly={text == null || onTextChange == null}
        value={text}
      />
    </Card>
  );
}
