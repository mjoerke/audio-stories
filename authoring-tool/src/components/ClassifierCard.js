// @flow

import * as React from "react";

import Draggables from "../constants/Draggables";
import type { ClassifierLink, DraftClassifierLink } from "../model/CardData";
import type { UniqueId } from "../util/UniqueId";
import { uniqueIdAsString } from "../util/UniqueId";
import type { ExposedProps as CardProps } from "./BaseCard";
import BaseCard from "./BaseCard";
import ClassifierCardDialog from "./ClassifierCardDialog";

type Props = {
  ...CardProps,
  isDialogOpen: boolean,
  links: Array<ClassifierLink>,
  newDraftClassifierLink: ?DraftClassifierLink,
  setIsDialogOpen?: (boolean) => void,
  updateClassifierLinks?: (UniqueId, Array<ClassifierLink>) => void,
  validateClassifierLinks?: (
    Array<DraftClassifierLink>
  ) => Array<ClassifierLink>,
};

export default function ClassifierCard({
  isDialogOpen,
  links,
  newDraftClassifierLink,
  setIsDialogOpen,
  updateClassifierLinks,
  validateClassifierLinks,
  // base props
  id,
  ...otherProps
}: Props): React.MixedElement {
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
        Add transition
      </button>
      {updateClassifierLinks &&
      setIsDialogOpen &&
      validateClassifierLinks &&
      id != null ? (
        <ClassifierCardDialog
          closeDialog={() => setIsDialogOpen(false)}
          id={id}
          isOpen={isDialogOpen}
          initialLinks={links}
          newDraftClassifierLink={newDraftClassifierLink}
          updateClassifierLinks={updateClassifierLinks}
          validateClassifierLinks={validateClassifierLinks}
        />
      ) : null}
    </BaseCard>
  );
}
