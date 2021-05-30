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
  initialLinks: Array<ClassifierLink>,
  newDraftClassifierLink: ?DraftClassifierLink,
  updateClassifierLinks: (UniqueId, Array<ClassifierLink>) => void,
  validateClassifierLinks: (
    Array<DraftClassifierLink>
  ) => Array<ClassifierLink>,
};

export default function ClassifierCardDialog({
  closeDialog,
  id,
  isOpen,
  initialLinks,
  newDraftClassifierLink,
  updateClassifierLinks,
  validateClassifierLinks,
}: Props): React.MixedElement {
  const [draftLinks, setDraftLinks] =
    // $FlowExpectedError safe type-cast
    React.useState<Array<DraftClassifierLink>>(initialLinks);
  // repopulate links if initialLinks is updated
  React.useEffect(() => {
    if (initialLinks.length > 0) {
      setDraftLinks(
        produce(initialLinks, (draftState) => {
          draftState.map((link) => ({
            ...link,
            // TODO: i would prefer not to do this conversion
            threshold: link.threshold * 100,
          }));
          if (newDraftClassifierLink != null) {
            draftState.push({
              ...newDraftClassifierLink,
              threshold: newDraftClassifierLink.threshold * 100,
            });
          }
        })
      );
    } else if (newDraftClassifierLink != null) {
      /* if no existing links but user triggered the dialog by starting a new
       * link, then that new draft link should be the only classifier listed */
      setDraftLinks([
        {
          ...newDraftClassifierLink,
          threshold: newDraftClassifierLink.threshold * 100,
        },
      ]);
    } else {
      // if no links, then put an empty one so the form isn't blank
      setDraftLinks([{ next: null, label: null, threshold: 50 }]);
    }
  }, [setDraftLinks, initialLinks, newDraftClassifierLink]);

  const addNewClassifier = () => {
    setDraftLinks((baseState) =>
      produce(baseState, (draftState) => {
        draftState.push({
          next: null,
          label: null,
          threshold: DEFAULT_CLASSIFIER_THRESHOLD * 100,
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
          onClick={() => adjustThreshold(idx, link, 10)}
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
          <h2>Classifier Options</h2>
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
            // TODO: i would prefer not to do this conversion
            updateClassifierLinks(
              id,
              validateClassifierLinks(draftLinks).map((link) => ({
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
