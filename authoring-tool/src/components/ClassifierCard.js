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
  const [newLinkInProgressData, setNewLinkInProgressData] = React.useState(
    null
  );

  return (
    <BaseCard
      title="Classifier"
      type={Draggables.CLASSIFIER_CARD}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...otherProps}
    >
      {/* <select multiple>
        <option>Test</option>
        <option>Test2</option>
      </select> */}
      <button
        disabled={newLinkInProgressData != null}
        onClick={(_e) => {
          const label = prompt("Label?");
          if (label != null) {
            const threshold = parseFloat(prompt("Threshold?"));
            if (threshold != null) {
              setNewLinkInProgressData((_) => ({ label, threshold }));
            }
          }
        }}
        type="button"
      >
        Add transition
      </button>
    </BaseCard>
  );
}
