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
  draftLinks: Array<DraftClassifierLink>,
  id: UniqueId,
  isOpen: boolean,
  onSelectDestinationClick: (number) => void,
  setDraftLinks: (Array<DraftClassifierLink>) => void,
  updateClassifierLinks: (UniqueId, Array<ClassifierLink>) => void,
  validateClassifierLinks: (
    Array<DraftClassifierLink>
  ) => Array<ClassifierLink>,
};

export default function ClassifierCardDialog({
  closeDialog,
  draftLinks,
  id,
  isOpen,
  onSelectDestinationClick,
  setDraftLinks,
  updateClassifierLinks,
  validateClassifierLinks,
}: Props): React.MixedElement {
  // if no links, then put an empty one so the form isn't blank
  React.useEffect(() => {
    if (draftLinks.length === 0) {
      setDraftLinks([{ next: null, label: null, threshold: 90 }]);
    }
  }, [draftLinks, setDraftLinks]);

  const addNewClassifier = () => {
    setDraftLinks(
      produce(draftLinks, (draftState) => {
        draftState.push({
          next: null,
          label: null,
          threshold: DEFAULT_CLASSIFIER_THRESHOLD,
        });
      })
    );
  };

  const removeClassifier = (linkToRemove) => {
    setDraftLinks(
      // $FlowFixMe fix types
      draftLinks.filter((link) => link !== linkToRemove)
    );
  };

  const updateDraftLink = (idx, updatedLink) => {
    setDraftLinks(
      produce(draftLinks, (draftState) => {
        // eslint-disable-next-line no-param-reassign
        draftState[idx] = updatedLink;
      })
    );
  };

  const adjustThreshold = (idx, link, delta) => {
    updateDraftLink(idx, {
      ...link,
      threshold: Math.max(Math.min(link.threshold + delta, 100), 0),
    });
  };

  // console.log(draftLinks);

  const classifierRows = draftLinks.map((link, idx) => (
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
      </td>
      <td>
        <button
          type="button"
          className="ClassifierCardDialog-selectDestinationButton"
          onClick={() => onSelectDestinationClick(idx)}
        >
          Select Dest.
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
            <th>Destination</th>
          </tr>
          {classifierRows}
        </table>
        <button
          type="button"
          className="ClassifierCardDialog-addClassifierButton"
          onClick={addNewClassifier}
        >
          +
        </button>
        <button
          type="button"
          className="ClassifierCard-saveButton"
          disabled={validateClassifierLinks(draftLinks) == null}
          onClick={() => {
            updateClassifierLinks(id, validateClassifierLinks(draftLinks));
            closeDialog();
          }}
        >
          Save Classifiers
        </button>
      </div>
    </Modal>
  );
}
