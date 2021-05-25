// @flow

import * as React from "react";

import Draggables from "../constants/Draggables";
import type { ClassifierLink } from "../model/CardData";
import type { UniqueId } from "../util/UniqueId";
import { uniqueIdAsString } from "../util/UniqueId";
import type { ExposedProps as CardProps } from "./BaseCard";
import BaseCard from "./BaseCard";
import ClassifierCardDialog from "./ClassifierCardDialog";

type Props = {
  ...CardProps,
  links: Array<ClassifierLink>,
  newClassifierLinkInProgressData?: ?{ label: string, threshold: number },
  setNewClassifierLinkInProgressData?: (
    ((
      ?{ label: string, threshold: number }
    ) => ?{ label: string, threshold: number })
  ) => void,
  updateClassifierLinks?: (UniqueId, Array<ClassifierLink>) => void,
  validateClassifierLinks?: (Array<ClassifierLink>) => boolean,
};

export default function ClassifierCard({
  links,
  newClassifierLinkInProgressData,
  setNewClassifierLinkInProgressData,
  updateClassifierLinks,
  validateClassifierLinks,
  // base props
  id,
  ...otherProps
}: Props): React.MixedElement {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  return (
    <BaseCard
      title="Classifier"
      type={Draggables.CLASSIFIER_CARD}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...otherProps}
      id={id}
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
      {updateClassifierLinks && validateClassifierLinks && id != null ? (
        <ClassifierCardDialog
          closeDialog={() => setIsDialogOpen(false)}
          id={id}
          isOpen={isDialogOpen}
          initialLinks={links}
          updateClassifierLinks={updateClassifierLinks}
          validateClassifierLinks={validateClassifierLinks}
        />
      ) : null}
    </BaseCard>
  );
}
