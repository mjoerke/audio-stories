// @flow

import * as React from "react";

import Draggables from "../constants/Draggables";
import type { ClassifierLink } from "../model/CardData";
import type { UniqueId } from "../util/UniqueId";
import { uniqueIdAsString } from "../util/UniqueId";
import type { ExposedProps as CardProps } from "./BaseCard";
import BaseCard from "./BaseCard";

import "./ClassifierCard.css";

type Props = {
  ...CardProps,
  links: Array<ClassifierLink>,
  setIsDialogOpen?: (boolean) => void,
};

export default function ClassifierCard({
  links,
  setIsDialogOpen,
  // base props
  ...otherProps
}: Props): React.MixedElement {
  return (
    <BaseCard
      title="Classifier"
      type={Draggables.CLASSIFIER_CARD}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...otherProps}
      headerColor="#cbc8ff"
    >
      {links.map((link) => (
        <div
          key={link.label + link.threshold + link.next}
          className="ClassifierCard-classifierRow"
        >
          <div className="ClassifierCard-classifierLabel">{link.label}</div>
          <div className="ClassifierCard-classifierDetails">
            {`Threshold: ${link.threshold} to card ${uniqueIdAsString(
              link.next
            )}`}
          </div>
        </div>
      ))}
      <button
        disabled={setIsDialogOpen == null}
        onClick={
          setIsDialogOpen != null
            ? (_e) => {
                setIsDialogOpen(true);
              }
            : undefined
        }
        type="button"
      >
        Edit classifiers
      </button>
    </BaseCard>
  );
}
