// @flow

import * as React from "react";

import AudioCard from "./AudioCard";
import ClassifierCard from "./ClassifierCard";
import Draggables from "../constants/Draggables";

import "./SidePanel.css";

type Props = {
  onUploadStart: () => Promise<void>,
};

function SidePanel({ onUploadStart }: Props): React.MixedElement {
  return (
    <div className="SidePanel-container">
      <AudioCard isDrawingNewLinkFrom={null} type={Draggables.NEW_AUDIO_CARD} />
      <ClassifierCard
        isDrawingNewLinkFrom={null}
        links={[]}
        type={Draggables.NEW_CLASSIFIER_CARD}
      />
      <p> What is the id of the first node in your story? </p>
      <div id="id-div">
        <textarea id="story-id" cols="30" rows="1" />
      </div>
      <p> Add a story name! </p>
      <div id="submit-div">
        <textarea id="story-name" cols="30" rows="1" />
        <button onClick={onUploadStart} type="button" id="upload-button">
          Save
        </button>
      </div>
    </div>
  );
}

export default SidePanel;
