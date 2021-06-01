// @flow

import * as React from "react";

import Draggables from "../constants/Draggables";
import type { ClassifierLink } from "../model/CardData";
import type { UniqueId } from "../util/UniqueId";
import { uniqueIdAsString } from "../util/UniqueId";
import type { ExposedProps as CardProps } from "./BaseCard";
import BaseCard from "./BaseCard";

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
      {links.map((link) => {
        const description = `${link.label} > ${
          link.threshold
        } ? go to ${uniqueIdAsString(link.next)}`;
        return <div key={description}>{description}</div>;
      })}
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
