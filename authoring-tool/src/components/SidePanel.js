// @flow

import * as React from "react";

import AudioCard from "./AudioCard";
import Card from "./Card";
import Draggables from "../constants/Draggables";

import "./SidePanel.css";

function SidePanel(): React.MixedElement {
  return (
    <div className="SidePanel-container">
      <AudioCard isDrawingNewLinkFrom={null} type={Draggables.NEW_AUDIO_CARD} />
      <Card isDrawingNewLinkFrom={null} type={Draggables.NEW_CARD} />
    </div>
  );
}

export default SidePanel;
