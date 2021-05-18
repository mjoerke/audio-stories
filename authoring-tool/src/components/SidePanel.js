// @flow

import * as React from "react";

import AudioCard from "./AudioCard";
import ClassifierCard from "./ClassifierCard";
import Draggables from "../constants/Draggables";

import "./SidePanel.css";

type Props = {
  onUploadStart: () => {},
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
      <button onClick={onUploadStart} type="button">
        Upload
      </button>
    </div>
  );
}

export default SidePanel;
