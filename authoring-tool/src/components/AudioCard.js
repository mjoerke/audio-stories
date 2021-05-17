// @flow

import * as React from "react";
import type { Props as CardProps } from "./Card";
import Card from "./Card";

type Props = {
  ...CardProps,
};

export default function AudioCard({ ...props }: Props): React.MixedElement {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Card title="Audio" {...props}>
      <textarea />
    </Card>
  );
}
