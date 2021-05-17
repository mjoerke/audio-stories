// @flow

import * as React from "react";

import AudioCard from "./AudioCard";
import ClassifierCard from "./ClassifierCard";
import Draggables from "../constants/Draggables";

import "./SidePanel.css";

function SidePanel(): React.MixedElement {
  return (
    <div className="SidePanel-container">
      <AudioCard isDrawingNewLinkFrom={null} type={Draggables.NEW_AUDIO_CARD} />
      <ClassifierCard
        isDrawingNewLinkFrom={null}
        type={Draggables.NEW_CLASSIFIER_CARD}
      />
    </div>
  );
}

export default SidePanel;
