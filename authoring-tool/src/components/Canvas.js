// @flow

import produce from "immer";
import * as React from "react";
import { useDrop } from "react-dnd";

import type {
  AudioCardData,
  CardData,
  ClassifierCardData,
  ClassifierLink,
} from "../model/CardData";
import type { UniqueId } from "../util/UniqueId";
import AudioCard from "./AudioCard";
import ClassifierCard from "./ClassifierCard";
import Draggables from "../constants/Draggables";
import { DEFAULT_CARD_SIZE } from "../model/CardData";
import { calculateDropPosition } from "../util/DropTargetMonitorHelper";
import makeUniqueId, { uniqueIdAsString } from "../util/UniqueId";

import "./Canvas.css";
import getAdjacentCardIds from "../util/CardDataUtils";

type Props = $ReadOnly<{
  addCard: (CardData) => void,
  addClassifierLink: (ClassifierCardData, ClassifierLink) => void,
  addSimpleLink: (AudioCardData, UniqueId) => void,
  cards: Map<UniqueId, CardData>,
  updateCard: (CardData) => void,
  removeCard: (UniqueId) => void,
  removeLink: (UniqueId, UniqueId) => void,
  updateClassifierLinks: (UniqueId, Array<ClassifierLink>) => void,
}>;

function Canvas({
  addCard,
  addClassifierLink,
  addSimpleLink,
  cards,
  updateCard,
  removeCard,
  removeLink,
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

  const [
    isDrawingNewLinkFrom,
    setisDrawingNewLinkFrom,
  ] = React.useState<?UniqueId>(null);
  const [
    newClassifierLinkInProgressData,
    setNewClassifierLinkInProgressData,
  ] = React.useState<?{ label: string, threshold: number }>(null);

  const canvasRef = React.useRef<?HTMLCanvasElement>(null);
  const cardLinkStartCoords = React.useRef<?{ x: number, y: number }>(null);
  const mouseCoords = React.useRef<?{ x: number, y: number }>(null);

  const draw = (ctx, _frameCount) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // eslint-disable-next-line no-undef
    ctx.canvas.width = window.innerWidth;
    // eslint-disable-next-line no-undef
    ctx.canvas.height = window.innerHeight;
    Array.from(cards).forEach(([from, fromCard]) => {
      ctx.beginPath();
      const tos = getAdjacentCardIds(cards, from);
      tos.forEach((to) => {
        const toCard = cards.get(to);
        if (toCard == null) {
          console.error(
            // $FlowExpectedError coerce to string for error logging
            `No card found with id ${toCard.id} when trying to draw link to card!`
          );
        } else {
          /* Card coords are absolute relative to window, so we need to
           * offset by the size of the side panel */
          ctx.moveTo(
            fromCard.x + fromCard.width - 200,
            fromCard.y + fromCard.height / 2
          );
          ctx.lineTo(toCard.x - 200, toCard.y + toCard.height / 2);
          ctx.stroke();
        }
      });
    });

    if (isDrawingNewLinkFrom != null) {
      ctx.beginPath();
      if (cardLinkStartCoords.current == null) {
        return;
      }
      ctx.moveTo(cardLinkStartCoords.current.x, cardLinkStartCoords.current.y);
      if (mouseCoords.current == null) {
        return;
      }
      ctx.lineTo(mouseCoords.current.x, mouseCoords.current.y);
      ctx.stroke();
    }
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas == null) {
      return () => {};
    }
    const context = canvas.getContext("2d");
    let frameCount = 0;
    let animationFrameId;

    const render = () => {
      frameCount += 1;
      draw(context, frameCount);
      // eslint-disable-next-line
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      // eslint-disable-next-line
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw, isDrawingNewLinkFrom]);

  const saveMousePosition = (e) => {
    const canvas = canvasRef.current;
    if (canvas == null) {
      mouseCoords.current = null;
      return;
    }
    mouseCoords.current = {
      x: e.clientX - canvas.offsetLeft,
      y: e.clientY - canvas.offsetTop,
    };
  };

  const validateClassifierLinks = (links) => {
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
    return result;
  };

  const startLinkFromCard = (id) => {
    if (id != null) {
      setisDrawingNewLinkFrom((_) => id);
      const card = cards.get(id);

      if (card != null) {
        /* Card coords are absolute relative to window, so we need to
         * offset by the size of the side panel */
        cardLinkStartCoords.current = {
          x: card.x + card.width - /* panel size */ 200,
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
    /* Render stop button if clicking the button represents a cancellation
     * or deletion */
    const linkButtonText =
      isDrawingNewLinkFrom === id ||
      (existingEndsForNewLink != null && existingEndsForNewLink.includes(id))
        ? "x"
        : "+";
    const onFinishLink = (to) => {
      if (isDrawingNewLinkFrom != null) {
        if (isDrawingNewLinkFrom !== to) {
          if (
            existingEndsForNewLink != null &&
            existingEndsForNewLink.includes(to)
          ) {
            removeLink(isDrawingNewLinkFrom, to);
          } else {
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
                addSimpleLink(fromCard, to);
                break;
              case "classifier_card":
                if (newClassifierLinkInProgressData == null) {
                  console.error(
                    // $FlowExpectedError coerce id for the sake of logging
                    `onFinishLink: cannot add new classifier link if labels and threshold haven't been assigned for card id: ${isDrawingNewLinkFrom}`
                  );
                  setisDrawingNewLinkFrom((_) => null);
                  return;
                }
                addClassifierLink(fromCard, {
                  next: to,
                  label: newClassifierLinkInProgressData.label,
                  threshold: newClassifierLinkInProgressData.threshold,
                });
                setNewClassifierLinkInProgressData((_) => null);
                break;
              default:
                throw new Error(
                  `onFinishLink: unrecognized card type: ${fromCard.type}`
                );
            }
          }
        }
        setisDrawingNewLinkFrom((_) => null);
      }
    };

    let cardComponent = null;
    switch (card.type) {
      case "audio_card":
        cardComponent = (
          <AudioCard
            key={uniqueIdAsString(id)}
            id={id}
            isDrawingNewLinkFrom={isDrawingNewLinkFrom}
            linkButtonText={linkButtonText}
            onCreateLink={startLinkFromCard}
            onDelete={() => removeCard(id)}
            onFinishLink={onFinishLink}
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
            key={uniqueIdAsString(id)}
            id={id}
            isDrawingNewLinkFrom={isDrawingNewLinkFrom}
            links={card.links.links}
            linkButtonText={linkButtonText}
            newClassifierLinkInProgressData={newClassifierLinkInProgressData}
            onCreateLink={startLinkFromCard}
            onDelete={() => removeCard(id)}
            onFinishLink={onFinishLink}
            setNewClassifierLinkInProgressData={
              setNewClassifierLinkInProgressData
            }
            updateClassifierLinks={updateClassifierLinks}
            validateClassifierLinks={validateClassifierLinks}
          />
        );
        break;

      default:
        throw new Error(`Unrecognized card type: ${card.type}`);
    }

    return (
      <div
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
        onMouseMove={saveMousePosition}
      />
      {Array.from(cards).map(([id, card]) => renderCard(id, card))}
    </div>
  );
}

export default Canvas;
