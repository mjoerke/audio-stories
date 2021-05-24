//      

import * as React from "react";
import { useDrag } from "react-dnd";

                                                             
import { DEFAULT_CARD_SIZE } from "../model/CardData";
                                                 
import { uniqueIdAsString } from "../util/UniqueId";

import "./BaseCard.css";

                            
                
                                  
                                    
                                    
                  
                          
                 
                       
                 
                        
  

              
                  
                                   
                      
  

export default function BaseCard({
  id,
  isDrawingNewLinkFrom,
  onCreateLink,
  onFinishLink,
  height = DEFAULT_CARD_SIZE,
  linkButtonText = "▶",
  title = "Card",
  width = DEFAULT_CARD_SIZE,
  type,
  children = null,
}       )                     {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type,
      item: { id, height, width, type },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [type]
  );

  let containerClass = "BaseCard-container";
  if (isDragging) {
    containerClass += " BaseCard-containerBeingDragged";
  }
  return (
    <div
      ref={drag}
      className={containerClass}
      style={{
        height,
        width,
      }}
    >
      <div>
        {title}{" "}
        {id != null ? <span>{`(id: ${uniqueIdAsString(id)})`}</span> : null}
      </div>
      {children}
      {onCreateLink && onFinishLink && id != null ? (
        <button
          className="BaseCard-linkHandle"
          onClick={(_e) => {
            if (isDrawingNewLinkFrom != null) {
              onFinishLink(id);
            } else {
              onCreateLink(id);
            }
          }}
          style={{ top: height / 2 }}
          type="button"
        >
          {linkButtonText}
        </button>
      ) : null}
    </div>
  );
}
