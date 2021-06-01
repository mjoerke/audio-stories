// @flow

import produce from "immer";
import * as React from "react";
import Modal from "react-modal";

import type { ClassifierLink, DraftClassifierLink } from "../model/CardData";
import type { UniqueId } from "../util/UniqueId";

import "css.gg/icons/css/close.css";
import "./ClassifierCardDialog.css";
import { DEFAULT_CLASSIFIER_THRESHOLD } from "../constants/Constants";

type Props = {
  closeDialog: () => void,
  id: UniqueId,
  isOpen: boolean,
  links: Array<ClassifierLink | DraftClassifierLink>,
  onSelectDestinationClick: (number) => void,
  updateClassifierLinks: (
    UniqueId,
    Array<ClassifierLink | DraftClassifierLink>
  ) => void,
  validateClassifierLinks: (
    Array<DraftClassifierLink | ClassifierLink>
  ) => Array<DraftClassifierLink | ClassifierLink>,
};

export default function ClassifierCardDialog({
  closeDialog,
  id,
  isOpen,
  links,
  onSelectDestinationClick,
  updateClassifierLinks,
  validateClassifierLinks,
}: Props): React.MixedElement {
  // if no links, then put an empty one so the form isn't blank
  React.useEffect(() => {
    if (links.length === 0) {
      updateClassifierLinks(id, [
        {
          next: null,
          label: null,
          threshold: 90,
          type: "incomplete_classifier_link",
        },
      ]);
    }
  }, [links, updateClassifierLinks]);

  const addNewClassifier = () => {
    updateClassifierLinks(
      id,
      produce(links, (draftState) => {
        draftState.push({
          next: null,
          label: null,
          threshold: DEFAULT_CLASSIFIER_THRESHOLD,
          type: "incomplete_classifier_link",
        });
      })
    );
  };

  const removeClassifier = (linkToRemove) => {
    updateClassifierLinks(
      id,
      // $FlowFixMe fix types
      links.filter((link) => link !== linkToRemove)
    );
  };

  const updateDraftLink = (idx, updatedLink) => {
    updateClassifierLinks(
      id,
      produce(links, (draftState) => {
        // eslint-disable-next-line no-param-reassign
        draftState[idx] = {
          ...updatedLink,
          /* make sure to convert all edited links to draft links because they
           * could now be invalid */
          type: "incomplete_classifier_link",
        };
      })
    );
  };

  const adjustThreshold = (idx, link, delta) => {
    updateDraftLink(idx, {
      ...link,
      threshold: Math.max(Math.min(link.threshold + delta, 100), 0),
    });
  };

  const classifierRows = links.map((link, idx) => (
    <tr className="ClassifierCardDialog-classifierRow">
      <td>
        <input
          type="text"
          className="ClassifierCardDialog-labelInput"
          onChange={(e) => {
            e.persist();
            updateDraftLink(idx, {
              ...link,
              label: e.target.value,
            });
          }}
          value={link.label}
        />
      </td>
      <td>
        <button
          type="button"
          className="ClassifierCardDialog-thresholdButton"
          onClick={() => adjustThreshold(idx, link, -10)}
        >
          &lt;
        </button>
        <input
          type="number"
          className="ClassifierCardDialog-thresholdInput"
          onChange={(e) => {
            e.persist();
            updateDraftLink(idx, {
              ...link,
              threshold:
                e.target.value === "" ? null : parseInt(e.target.value, 10),
            });
          }}
          value={link.threshold}
        />
        <button
          type="button"
          className="ClassifierCardDialog-thresholdButton"
          onClick={() => adjustThreshold(idx, link, 10)}
        >
          &gt;
        </button>
      </td>
      <td>
        <input
          type="number"
          className="ClassifierCardDialog-destinationInput"
          onChange={(e) => {
            e.persist();
            updateDraftLink(idx, {
              ...link,
              next: parseInt(e.target.value, 10),
            });
          }}
          value={link.next}
        />
        <button
          type="button"
          className="ClassifierCardDialog-selectDestinationButton"
          onClick={() => onSelectDestinationClick(idx)}
        >
          Select Destination
        </button>
      </td>
      {idx > 0 ? (
        <td>
          <button
            type="button"
            className="ClassifierCardDialog-classifierRowCloseButton"
            onClick={() => removeClassifier(link)}
          >
            X
          </button>
        </td>
      ) : null}
    </tr>
  ));

  return (
    <Modal
      ariaHideApp={false}
      contentLabel="Classifier Options"
      isOpen={isOpen}
      onAfterClose={() =>
        // commit all completed classifiers
        updateClassifierLinks(id, validateClassifierLinks(links))
      }
      style={{
        content: {
          inset: 100,
        },
      }}
    >
      <div className="ClassifierCardDialog-container">
        <div className="ClassifierCardDialog-headerContainer">
          {/* $FlowFixMe temp hack */}
          <h2>Classifier Options (id: {id})</h2>
          <button
            type="button"
            className="ClassifierCardDialog-closeButton"
            onClick={closeDialog}
          >
            <i className="gg-close" />
          </button>
        </div>
        <table>
          <tr>
            <th>Classifier Label</th>
            <th>Threshold</th>
            <th>Destination (id)</th>
          </tr>
          {classifierRows}
        </table>
        <button
          type="button"
          className="ClassifierCardDialog-addClassifierButton"
          onClick={addNewClassifier}
        >
          Add another label
        </button>
        <button
          type="button"
          className="ClassifierCard-saveButton"
          // disabled={validateClassifierLinks(links) == null}
          onClick={() => {
            closeDialog();
          }}
        >
          Done
        </button>
      </div>
    </Modal>
  );
}
