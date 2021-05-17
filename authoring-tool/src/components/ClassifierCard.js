// @flow

import * as React from "react";
import type { Props as CardProps } from "./Card";
import Card from "./Card";

type Props = {
  ...CardProps,
};

export default function ClassifierCard({
  ...otherProps
}: Props): React.MixedElement {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Card title="Classifier" {...otherProps}>
      Test
    </Card>
  );
}
