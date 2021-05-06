// @flow

import * as React from "react";

import Card from "./Card";

import "./SidePanel.css";

function SidePanel(): React.MixedElement {
  return (
    <div className="SidePanel-container">
      <Card />
    </div>
  );
}

export default SidePanel;
