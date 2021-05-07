// @flow

import * as React from "react";

import Card from "./Card";
import Draggables from "../constants/Draggables";

import "./SidePanel.css";

function SidePanel(): React.MixedElement {
  return (
    <div className="SidePanel-container">
      <Card type={Draggables.NEW_CARD} />
    </div>
  );
}

export default SidePanel;
