//      

import * as React from "react";
import Draggables from "../constants/Draggables";
                                                        
import { uniqueIdAsString } from "../util/UniqueId";
                                                            
import BaseCard from "./BaseCard";

              
               
                               
                                                                          
                                        
      
                                           
                                               
            
  

export default function ClassifierCard({
  links,
  newClassifierLinkInProgressData,
  setNewClassifierLinkInProgressData,
  ...otherProps
}       )                     {
  return (
    <BaseCard
      title="Classifier"
      type={Draggables.CLASSIFIER_CARD}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...otherProps}
    >
      {links.map((link) => (
        <div>
          {`${link.label} > ${link.threshold} ? go to ${uniqueIdAsString(
            link.next
          )}`}
        </div>
      ))}
      <button
        disabled={
          setNewClassifierLinkInProgressData == null ||
          newClassifierLinkInProgressData != null
        }
        onClick={(_e) => {
          if (setNewClassifierLinkInProgressData != null) {
            /* TODO: replace prompts with better dialogs */
            const label = prompt("Label?");
            if (label != null) {
              const threshold = parseFloat(prompt("Threshold?"));
              if (threshold != null) {
                setNewClassifierLinkInProgressData((_) => ({
                  label,
                  threshold,
                }));
              }
            }
          }
        }}
        type="button"
      >
        Add transition
      </button>
    </BaseCard>
  );
}
