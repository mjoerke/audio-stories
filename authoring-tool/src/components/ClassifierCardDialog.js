// @flow

import produce from "immer";
import * as React from "react";
import Modal from "react-modal";

import type { ClassifierCardData, ClassifierLink } from "../model/CardData";

import "./ClassifierCardDialog.css";

type Props = {
  addClassifierLink: (ClassifierCardData, ClassifierLink) => void,
  closeDialog: () => void,
  isOpen: boolean,
  initialLinks: Array<ClassifierLink>,
};

export default function ClassifierCardDialog({
  addClassifierLink,
  closeDialog,
  isOpen,
  initialLinks,
}: Props): React.MixedElement {
  const [draftLinks, setDraftLinks] = React.useState(initialLinks);
  // repopulate links if initialLinks is updated
  React.useEffect(() => {
    if (initialLinks.length > 0) {
      setDraftLinks(initialLinks);
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

  const classifierRows = draftLinks.map((link) => (
    <tr className="ClassifierCardDialog-classifierRow">
      <td>
        <input type="text" className="ClassifierCardDialog-destinationInput" />
      </td>
      <td>
        <input type="text" className="ClassifierCardDialog-labelInput" />
      </td>
      <td>
        <button type="button" className="ClassifierCardDialog-thresholdButton">
          &lt;
        </button>
      </td>
      <td>
        <input type="text" className="ClassifierCardDialog-thresholdInput" />
      </td>
      <td>
        <button type="button" className="ClassifierCardDialog-thresholdButton">
          &gt;
        </button>
      </td>
      <td>
        <button
          type="button"
          className="ClassifierCardDialog-classifierRowCloseButton"
        >
          X
        </button>
      </td>
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
        <button type="button" className="ClassifierCard-saveButton">
          Save Classifiers
        </button>
      </div>
    </Modal>
  );
}
