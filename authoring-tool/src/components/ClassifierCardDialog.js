// @flow

import produce from "immer";
import * as React from "react";
import Modal from "react-modal";

import type { ClassifierLink } from "../model/CardData";
import type { UniqueId } from "../util/UniqueId";

import "./ClassifierCardDialog.css";

type Props = {
  closeDialog: () => void,
  id: UniqueId,
  isOpen: boolean,
  initialLinks: Array<ClassifierLink>,
  updateClassifierLinks: (UniqueId, Array<ClassifierLink>) => void,
  validateClassifierLinks: (Array<ClassifierLink>) => boolean,
};

export default function ClassifierCardDialog({
  closeDialog,
  id,
  isOpen,
  initialLinks,
  updateClassifierLinks,
  validateClassifierLinks,
}: Props): React.MixedElement {
  const [draftLinks, setDraftLinks] = React.useState(initialLinks);
  // repopulate links if initialLinks is updated
  React.useEffect(() => {
    if (initialLinks.length > 0) {
      // TODO: i would prefer not to do this conversion
      setDraftLinks(
        initialLinks.map((link) => ({
          ...link,
          threshold: link.threshold * 100,
        }))
      );
    } else {
      // if no links, then put an empty one so the form isn't blank
      setDraftLinks([{ next: null, label: null, threshold: 50 }]);
    }
  }, [setDraftLinks, initialLinks]);

  const addNewClassifier = () => {
    setDraftLinks((baseState) =>
      produce(baseState, (draftState) => {
        draftState.push({
          next: null,
          label: null,
          threshold: 50,
        });
      })
    );
  };

  const removeClassifier = (linkToRemove) => {
    setDraftLinks((baseState) =>
      // $FlowFixMe fix types
      baseState.filter((link) => link !== linkToRemove)
    );
  };

  const updateDraftLink = (idx, updatedLink) => {
    setDraftLinks((baseState) =>
      produce(baseState, (draftState) => {
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

  const classifierRows = draftLinks.map((link, idx) => (
    <tr className="ClassifierCardDialog-classifierRow">
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
      </td>
      <td>
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
      </td>
      <td>
        <button
          type="button"
          className="ClassifierCardDialog-thresholdButton"
          onClick={() => adjustThreshold(idx, link, 10)}
        >
          &gt;
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
          <h2>Classifier Options</h2>
          <button
            type="button"
            className="ClassifierCardDialog-closeButton"
            onClick={closeDialog}
          >
            X
          </button>
        </div>
        <table>
          <tr>
            <th>Destination</th>
            <th>Classifier Label</th>
            <th />
            <th>Threshold</th>
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
          disabled={!validateClassifierLinks(draftLinks)}
          onClick={() => {
            // TODO: i would prefer not to do this conversion
            updateClassifierLinks(
              id,
              draftLinks.map((link) => ({
                ...link,
                threshold: link.threshold / 100,
              }))
            );
            closeDialog();
          }}
        >
          Save Classifiers
        </button>
      </div>
    </Modal>
  );
}