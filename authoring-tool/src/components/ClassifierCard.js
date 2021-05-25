// @flow

import * as React from "react";

import Draggables from "../constants/Draggables";
import type { ClassifierCardData, ClassifierLink } from "../model/CardData";
import { uniqueIdAsString } from "../util/UniqueId";
import type { ExposedProps as CardProps } from "./BaseCard";
import BaseCard from "./BaseCard";
import ClassifierCardDialog from "./ClassifierCardDialog";

type Props = {
  ...CardProps,
  addClassifierLink?: (ClassifierCardData, ClassifierLink) => void,
  links: Array<ClassifierLink>,
  newClassifierLinkInProgressData?: ?{ label: string, threshold: number },
  setNewClassifierLinkInProgressData?: (
    ((
      ?{ label: string, threshold: number }
    ) => ?{ label: string, threshold: number })
  ) => void,
};

export default function ClassifierCard({
  addClassifierLink,
  links,
  newClassifierLinkInProgressData,
  setNewClassifierLinkInProgressData,
  ...otherProps
}: Props): React.MixedElement {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  return (
    <BaseCard
      title="Classifier"
      type={Draggables.CLASSIFIER_CARD}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...otherProps}
    >
      {links.map((link) => {
        const description = `${link.label} > ${
          link.threshold
        } ? go to ${uniqueIdAsString(link.next)}`;
        return <div key={description}>{description}</div>;
      })}
      <button
        disabled={
          setNewClassifierLinkInProgressData == null ||
          newClassifierLinkInProgressData != null
        }
        onClick={(_e) => {
          if (setNewClassifierLinkInProgressData != null) {
            setIsDialogOpen(true);
          }
        }}
        type="button"
      >
        Add transition
      </button>
      {addClassifierLink ? (
        <ClassifierCardDialog
          addClassifierLink={addClassifierLink}
          closeDialog={() => setIsDialogOpen(false)}
          isOpen={isDialogOpen}
          initialLinks={links}
        />
      ) : null}
    </BaseCard>
  );
}
