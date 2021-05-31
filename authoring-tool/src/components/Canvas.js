// @flow

import produce from "immer";
import * as React from "react";
import { useDrop } from "react-dnd";

import type {
  AudioCardData,
  CardData,
  ClassifierCardData,
  ClassifierLink,
  DraftClassifierLink,
} from "../model/CardData";
import type { UniqueId } from "../util/UniqueId";
import AudioCard from "./AudioCard";
import ClassifierCard from "./ClassifierCard";
import ClassifierCardDialog from "./ClassifierCardDialog";
import Draggables from "../constants/Draggables";
import {
  DEFAULT_CARD_SIZE,
  DEFAULT_CLASSIFIER_THRESHOLD,
  SIDE_PANEL_WIDTH,
} from "../constants/Constants";
import getAdjacentCardIds from "../util/CardDataUtils";
import { calculateDropPosition } from "../util/DropTargetMonitorHelper";
import makeUniqueId, { uniqueIdAsString } from "../util/UniqueId";
import { drawExistingLinks, drawLink } from "./CanvasDrawHandler";

import "./Canvas.css";

type Props = $ReadOnly<{
  addCard: (CardData) => void,
  addSimpleLink: (AudioCardData, UniqueId) => void,
  cards: Map<UniqueId, CardData>,
  draftLinks: Map<UniqueId, Array<ClassifierLink>>,
  updateCard: (CardData) => void,
  removeCard: (UniqueId) => void,
  removeLink: (UniqueId, UniqueId) => void,
  setDraftLinks: (UniqueId, Array<DraftClassifierLink>) => void,
  updateClassifierLinks: (UniqueId, Array<ClassifierLink>) => void,
}>;

function Canvas({
  addCard,
  addSimpleLink,
  cards,
  draftLinks,
  updateCard,
  removeCard,
  removeLink,
  setDraftLinks,
  updateClassifierLinks,
}: Props): React.MixedElement {
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: [
        Draggables.NEW_AUDIO_CARD,
        Draggables.NEW_CLASSIFIER_CARD,
        Draggables.AUDIO_CARD,
        Draggables.CLASSIFIER_CARD,
      ],
      drop: (item, monitor) => {
        const dropPos = calculateDropPosition(monitor);
        if (dropPos == null) {
          console.error("Tried to drop a new card that wasn't being dragged!");
        } else if (item.type === Draggables.NEW_AUDIO_CARD) {
          addCard({
            id: makeUniqueId(),
            height: DEFAULT_CARD_SIZE,
            links: {
              next: null,
              type: "simple_link",
            },
            text: "",
            type: "audio_card",
            width: DEFAULT_CARD_SIZE,
            x: dropPos.x,
            y: dropPos.y,
          });
        } else if (item.type === Draggables.NEW_CLASSIFIER_CARD) {
          addCard({
            id: makeUniqueId(),
            height: DEFAULT_CARD_SIZE,
            links: {
              links: [],
              type: "classifier_links",
            },
            type: "classifier_card",
            width: DEFAULT_CARD_SIZE,
            x: dropPos.x,
            y: dropPos.y,
          });
        } else if (
          item.type === Draggables.AUDIO_CARD ||
          item.type === Draggables.CLASSIFIER_CARD
        ) {
          const currentCard = cards.get(item.id);
          if (currentCard == null) {
            console.error(`Couldn't find card with id: ${item.id}!`);
          } else {
            updateCard(
              produce(currentCard, (draftState) => {
                // eslint-disable-next-line no-param-reassign
                draftState.x = dropPos.x;
                // eslint-disable-next-line no-param-reassign
                draftState.y = dropPos.y;
              })
            );
          }
        }
      },
      canDrop: (item, monitor) => {
        let collision = false;
        const xy = calculateDropPosition(monitor);
        if (xy == null) {
          return false;
        }
        const { x, y } = xy;
        cards.forEach((card) => {
          if (card.id !== item.id) {
            // AABB collision detection
            if (
              x < card.x + card.width &&
              x + item.width > card.x &&
              y < card.y + card.height &&
              y + item.height > card.y
            ) {
              collision = true;
            }
          }
        });
        return !collision;
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [addCard, cards, updateCard]
  );

  const [isDrawingNewLinkFrom, setIsDrawingNewLinkFrom] =
    React.useState<?UniqueId>(null);
  // classifier dialog is closed when this is null; open otherwise
  const [classifierDialogOpenId, setClassifierDialogOpenId] =
    React.useState<?UniqueId>(null);
  /* used to keep track of draft link state after selecting "select dest"
   * in the classifier dialog */
  const [currentDraftClassifierIdx, setCurrentDraftClassifierIdx] =
    React.useState<?number>(null);

  const canvasRef = React.useRef<?HTMLCanvasElement>(null);
  const cardLinkStartCoords = React.useRef<?{ x: number, y: number }>(null);
  const mouseCoords = React.useRef<?{ x: number, y: number }>(null);

  /* Draw handler */
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas == null) {
      return () => {};
    }
    const context = canvas.getContext("2d");
    let _frameCount = 0;
    let animationFrameId;

    const render = () => {
      _frameCount += 1;
      drawExistingLinks(context, cards);
      if (
        isDrawingNewLinkFrom != null &&
        cardLinkStartCoords.current != null &&
        mouseCoords.current != null
      ) {
        drawLink(context, cardLinkStartCoords.current, mouseCoords.current);
      }
      // eslint-disable-next-line no-undef
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      // eslint-disable-next-line no-undef
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [isDrawingNewLinkFrom, cards]);

  const saveMousePosition = (e) => {
    const canvas = canvasRef.current;
    if (canvas == null) {
      mouseCoords.current = null;
      return;
    }
    mouseCoords.current = {
      // eslint-disable-next-line no-undef
      x: e.clientX - canvas.offsetLeft + window.scrollX,
      // eslint-disable-next-line no-undef
      y: e.clientY - canvas.offsetTop + window.scrollY,
    };
  };

  const validateClassifierLinks = (
    links: Array<DraftClassifierLink>
  ): Array<ClassifierLink> => {
    let result = true;
    links.forEach((link) => {
      if (link.next == null || cards.get(link.next) == null) {
        result = false;
      } else if (link.label == null || link.label.length === 0) {
        result = false;
      }
      // $FlowFixMe make type of threshold more clear
      else if (link.threshold == null || link.threshold.length === 0) {
        result = false;
      }
    });
    // $FlowExpectedError we've checked it dynamically
    return result ? links : null;
  };

  const startLinkFromCard = (id) => {
    if (id != null) {
      setIsDrawingNewLinkFrom((_) => id);
      const card = cards.get(id);

      if (card != null) {
        /* Card coords are absolute relative to window, so we need to
         * offset by the size of the side panel */
        cardLinkStartCoords.current = {
          x: card.x + card.width - SIDE_PANEL_WIDTH,
          y: card.y + card.height / 2,
        };
      }
    }
  };

  const existingEndsForNewLink =
    isDrawingNewLinkFrom != null
      ? getAdjacentCardIds(cards, isDrawingNewLinkFrom)
      : null;

  const renderCard = (id, card) => {
    const canDeleteLinkTo =
      existingEndsForNewLink != null &&
      existingEndsForNewLink.includes(id) &&
      isDrawingNewLinkFrom != null &&
      cards.get(isDrawingNewLinkFrom).type === "audio_card";
    /* Render stop button if clicking the button represents a cancellation
     * or deletion */
    const linkButtonText =
      isDrawingNewLinkFrom === id || canDeleteLinkTo ? "X" : "+";
    const onFinishLink = (to) => {
      if (isDrawingNewLinkFrom != null) {
        const fromCard = cards.get(isDrawingNewLinkFrom);
        if (fromCard == null) {
          console.error(
            // $FlowExpectedError coerce id for the sake of logging
            `onFinishLink: could not find card with id: ${isDrawingNewLinkFrom}`
          );
          return;
        }
        switch (fromCard.type) {
          case "audio_card":
            if (isDrawingNewLinkFrom === to) {
              return;
            }
            if (
              existingEndsForNewLink != null &&
              existingEndsForNewLink.includes(to)
            ) {
              removeLink(isDrawingNewLinkFrom, to);
            } else {
              addSimpleLink(fromCard, to);
            }
            break;
          case "classifier_card":
            /* If this link was triggered by pressing "select dest" in the
             * classifier dialog, make sure to update the right classifier */
            if (currentDraftClassifierIdx != null) {
              setDraftLinks(
                isDrawingNewLinkFrom,
                produce(draftLinks.get(isDrawingNewLinkFrom), (draftState) => {
                  // eslint-disable-next-line no-param-reassign
                  draftState[currentDraftClassifierIdx].next = to;
                })
              );
            } else {
              // TODO: this is copy and pasted from ClassifierCardDialog
              setDraftLinks(
                isDrawingNewLinkFrom,
                produce(draftLinks.get(isDrawingNewLinkFrom), (draftState) => {
                  draftState.push({
                    next: to,
                    label: null,
                    threshold: DEFAULT_CLASSIFIER_THRESHOLD,
                  });
                })
              );
            }
            setClassifierDialogOpenId(isDrawingNewLinkFrom);
            break;
          default:
            throw new Error(
              `onFinishLink: unrecognized card type: ${fromCard.type}`
            );
        }
        setIsDrawingNewLinkFrom((_) => null);
        setCurrentDraftClassifierIdx(null);
      }
    };

    let cardComponent = null;
    switch (card.type) {
      case "audio_card":
        cardComponent = (
          <AudioCard
            canDeleteLinkTo={canDeleteLinkTo}
            id={id}
            isDrawingNewLinkFrom={isDrawingNewLinkFrom}
            linkButtonText={linkButtonText}
            onCreateLink={startLinkFromCard}
            onDelete={() => removeCard(id)}
            onFinishLink={onFinishLink}
            onMouseMove={saveMousePosition}
            onTextChange={(text) => {
              const audioCard: AudioCardData = card;
              updateCard(
                produce(audioCard, (draftState) => {
                  // eslint-disable-next-line no-param-reassign
                  draftState.text = text;
                })
              );
            }}
            text={card.text}
          />
        );
        break;
      case "classifier_card":
        cardComponent = (
          <ClassifierCard
            canDeleteLinkTo={canDeleteLinkTo}
            id={id}
            isDrawingNewLinkFrom={isDrawingNewLinkFrom}
            links={card.links.links}
            linkButtonText={linkButtonText}
            onCreateLink={startLinkFromCard}
            onDelete={() => removeCard(id)}
            onFinishLink={onFinishLink}
            onMouseMove={saveMousePosition}
            setIsDialogOpen={(state) =>
              setClassifierDialogOpenId(state ? id : null)
            }
          />
        );
        break;

      default:
        throw new Error(`Unrecognized card type: ${card.type}`);
    }

    return (
      <div
        key={uniqueIdAsString(id)}
        style={{
          position: "absolute",
          left: card.x,
          top: card.y,
        }}
      >
        {cardComponent}
      </div>
    );
  };

  const containerClass = `Canvas-container${
    isOver ? " Canvas-containerDropping" : ""
  }`;
  return (
    <div ref={drop} className={containerClass}>
      <canvas
        ref={canvasRef}
        id="Canvas-canvas"
        onClick={(_e) => {
          // TODO: code duplication
          setIsDrawingNewLinkFrom(null);
          setCurrentDraftClassifierIdx(null);
        }}
        onMouseMove={saveMousePosition}
      />
      {Array.from(cards).map(([id, card]) => renderCard(id, card))}

      {classifierDialogOpenId != null ? (
        <ClassifierCardDialog
          closeDialog={() => setClassifierDialogOpenId(null)}
          draftLinks={draftLinks.get(classifierDialogOpenId)}
          id={classifierDialogOpenId}
          isOpen={classifierDialogOpenId != null}
          onSelectDestinationClick={(idx) => {
            startLinkFromCard(classifierDialogOpenId);
            setCurrentDraftClassifierIdx(idx);
            setClassifierDialogOpenId(null);
          }}
          setDraftLinks={(newDraftLinks) =>
            setDraftLinks(classifierDialogOpenId, newDraftLinks)
          }
          updateClassifierLinks={updateClassifierLinks}
          validateClassifierLinks={validateClassifierLinks}
        />
      ) : null}
    </div>
  );
}

export default Canvas;
