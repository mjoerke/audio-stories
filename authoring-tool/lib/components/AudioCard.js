//      

import * as React from "react";
import Draggables from "../constants/Draggables";
                                                            
import BaseCard from "./BaseCard";

              
               
                                  
                
  

export default function AudioCard({
  onTextChange,
  text,
  ...otherProps
}       )                     {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BaseCard title="Audio" type={Draggables.AUDIO_CARD} {...otherProps}>
      <textarea
        onChange={
          onTextChange != null ? (e) => onTextChange(e.target.value) : undefined
        }
        readOnly={text == null || onTextChange == null}
        value={text}
      />
    </BaseCard>
  );
}
