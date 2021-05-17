// @flow

import * as React from "react";
import Draggables from "../constants/Draggables";
import type { ExposedProps as CardProps } from "./BaseCard";
import BaseCard from "./BaseCard";

type Props = {
  ...CardProps,
};

export default function ClassifierCard({
  ...otherProps
}: Props): React.MixedElement {
  return (
    <BaseCard
      title="Classifier"
      type={Draggables.CLASSIFIER_CARD}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...otherProps}
    >
      Test
    </BaseCard>
  );
}
