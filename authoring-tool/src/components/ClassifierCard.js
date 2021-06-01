// @flow

import * as React from "react";
import { LINK_BUTTON_HEIGHT } from "../constants/Constants";

import Draggables from "../constants/Draggables";
import type { ClassifierLink } from "../model/CardData";
import { getClassifierCardRowLinkPosition } from "../util/LayoutUtils";
import type { UniqueId } from "../util/UniqueId";
import { uniqueIdAsString } from "../util/UniqueId";
import type { ExposedProps as CardProps } from "./BaseCard";
import BaseCard from "./BaseCard";
import CardLinkButton from "./CardLinkButton";

import "./ClassifierCard.css";

type Props = {
  ...CardProps,
  links: Array<ClassifierLink>,
  setIsDialogOpen?: (boolean) => void,
};

export default function ClassifierCard({
  links,
  linkButtonType,
  onCreateLink,
  removeLink,
  setIsDialogOpen,
  // base props
  ...otherProps
}: Props): React.MixedElement {
  let linkButtons;
  if (onCreateLink && otherProps.id != null) {
    if (links.length === 0) {
      linkButtons = (
        <CardLinkButton
          id={otherProps.id}
          isDrawingNewLinkFrom={otherProps.isDrawingNewLinkFrom}
          linkButtonType="add"
          onCreateLink={onCreateLink}
          removeLink={removeLink}
          topOffset={otherProps.height / 2 - LINK_BUTTON_HEIGHT / 2}
        />
      );
    } else {
      linkButtons = links.map((link, idx) => (
        <CardLinkButton
          key={link.label + link.threshold + link.next}
          id={otherProps.id}
          isDrawingNewLinkFrom={otherProps.isDrawingNewLinkFrom}
          linkButtonType="close"
          onCreateLink={onCreateLink}
          removeLink={() => removeLink(idx)}
          topOffset={
            getClassifierCardRowLinkPosition(idx) - LINK_BUTTON_HEIGHT / 2
          }
        />
      ));
      linkButtons.push(
        <CardLinkButton
          key="new-link-button"
          id={otherProps.id}
          isDrawingNewLinkFrom={otherProps.isDrawingNewLinkFrom}
          linkButtonType="add"
          onCreateLink={onCreateLink}
          // removeLink={() => removeLink(idx)}
          topOffset={
            getClassifierCardRowLinkPosition(links.length) -
            LINK_BUTTON_HEIGHT / 2
          }
        />
      );
    }
  }

  return (
    <BaseCard
      title="Classifier"
      type={Draggables.CLASSIFIER_CARD}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...otherProps}
      headerColor="#cbc8ff"
      linkButtons={linkButtons}
    >
      {links.map((link) => (
        <div
          key={link.label + link.threshold + link.next}
          className="ClassifierCard-classifierRow"
        >
          <div className="ClassifierCard-classifierLabel">{link.label}</div>
          <div className="ClassifierCard-classifierDetails">
            {`(Threshold: ${link.threshold}) → card ${uniqueIdAsString(
              link.next
            )}`}
          </div>
        </div>
      ))}
      {
        /* placeholder for adding a new link */
        links.length > 0 ? (
          <div className="ClassifierCard-classifierRow">
            Add new classifier →
          </div>
        ) : null
      }
      <button
        className="ClassifierCard-editClassifiersButton"
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
