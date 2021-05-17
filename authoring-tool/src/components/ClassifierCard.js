// @flow

import * as React from "react";
import Draggables from "../constants/Draggables";
import type { ClassifierLink } from "../model/CardData";
import { uniqueIdAsString } from "../util/UniqueId";
import type { ExposedProps as CardProps } from "./BaseCard";
import BaseCard from "./BaseCard";

type Props = {
  ...CardProps,
  links: Array<ClassifierLink>,
  newClassifierLinkInProgressData?: ?{ label: string, threshold: number },
  setNewClassifierLinkInProgressData?: (
    ((
      ?{ label: string, threshold: number }
    ) => ?{ label: string, threshold: number })
  ) => void,
};

export default function ClassifierCard({
  links,
  newClassifierLinkInProgressData,
  setNewClassifierLinkInProgressData,
  ...otherProps
}: Props): React.MixedElement {
  return (
    <BaseCard
      title="Classifier"
      type={Draggables.CLASSIFIER_CARD}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...otherProps}
    >
      {links.map((link) => (
        <div>
          {`${link.label} > ${link.threshold} ? go to ${uniqueIdAsString(
            link.next
          )}`}
        </div>
      ))}
      <button
        disabled={
          setNewClassifierLinkInProgressData == null ||
          newClassifierLinkInProgressData != null
        }
        onClick={(_e) => {
          if (setNewClassifierLinkInProgressData != null) {
            const label = prompt("Label?");
            if (label != null) {
              const threshold = parseFloat(prompt("Threshold?"));
              if (threshold != null) {
                setNewClassifierLinkInProgressData((_) => ({
                  label,
                  threshold,
                }));
              }
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
