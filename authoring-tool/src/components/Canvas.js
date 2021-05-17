// @flow

import * as React from "react";
import { useDrop } from "react-dnd";

import type { CardData } from "../model/CardData";
import type { UniqueId } from "../util/UniqueId";
import Card from "./Card";
import Draggables from "../constants/Draggables";
import { DEFAULT_CARD_SIZE } from "../model/CardData";
import { calculateDropPosition } from "../util/DropTargetMonitorHelper";
import makeUniqueId from "../util/UniqueId";

import "./Canvas.css";

type Props = $ReadOnly<{
  addCard: (CardData) => void,
  addLink: (UniqueId, UniqueId) => void,
  cards: Map<UniqueId, CardData>,
  links: Map<UniqueId, Set<UniqueId>>,
  moveCard: (CardData) => void,
  removeLink: (UniqueId, UniqueId) => void,
}>;

function Canvas({
  addCard,
  addLink,
  cards,
  links,
  moveCard,
  removeLink,
}: Props): React.MixedElement {
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: [Draggables.NEW_CARD, Draggables.CARD],
      drop: (item, monitor) => {
        const dropPos = calculateDropPosition(monitor);
        if (dropPos == null) {
          console.error("Tried to drop a new card that wasn't being dragged!");
        } else if (item.type === Draggables.NEW_CARD) {
          addCard({
            id: makeUniqueId(),
            height: DEFAULT_CARD_SIZE,
            width: DEFAULT_CARD_SIZE,
            x: dropPos.x,
            y: dropPos.y,
          });
        } else if (item.type === Draggables.CARD) {
          const currentCard = cards.get(item.id);
          if (currentCard == null) {
            console.error(`Couldn't find card with id: ${item.id}!`);
          } else {
            moveCard({
              ...currentCard,
              x: dropPos.x,
              y: dropPos.y,
            });
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
    [addCard, cards, moveCard]
  );

  const [
    isDrawingNewLinkFrom,
    setisDrawingNewLinkFrom,
  ] = React.useState<?UniqueId>(null);

  const canvasRef = React.useRef<?HTMLCanvasElement>(null);
  const cardLinkStartCoords = React.useRef<?{ x: number, y: number }>(null);
  const mouseCoords = React.useRef<?{ x: number, y: number }>(null);

  const draw = (ctx, _frameCount) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // eslint-disable-next-line no-undef
    ctx.canvas.width = window.innerWidth;
    // eslint-disable-next-line no-undef
    ctx.canvas.height = window.innerHeight;
    Array.from(links).forEach(([from, tos]) => {
      ctx.beginPath();
      const fromCard = cards.get(from);
      tos.forEach((to) => {
        const toCard = cards.get(to);
        if (fromCard == null) {
          console.error(
            // $FlowExpectedError coerce to string for error logging
            `No card found with id ${from} when trying to draw link from card!`
          );
        } else if (toCard == null) {
          console.error(
            // $FlowExpectedError coerce to string for error logging
            `No card found with id ${to} when trying to draw link to card!`
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
    isDrawingNewLinkFrom != null ? links.get(isDrawingNewLinkFrom) : null;

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
      {Array.from(cards).map(([id, card]) => (
        <div
          style={{
            position: "absolute",
            left: card.x,
            top: card.y,
          }}
        >
          <Card
            id={id}
            isDrawingNewLinkFrom={isDrawingNewLinkFrom}
            /* Render stop button if clicking the button represents a cancellation
             * or deletion */
            linkButtonText={
              isDrawingNewLinkFrom === id ||
              (existingEndsForNewLink != null && existingEndsForNewLink.has(id))
                ? "■"
                : "▶"
            }
            onCreateLink={startLinkFromCard}
            onFinishLink={(to) => {
              if (isDrawingNewLinkFrom != null) {
                if (isDrawingNewLinkFrom !== to) {
                  if (
                    existingEndsForNewLink != null &&
                    existingEndsForNewLink.has(to)
                  ) {
                    removeLink(isDrawingNewLinkFrom, to);
                  } else {
                    addLink(isDrawingNewLinkFrom, to);
                  }
                }
                setisDrawingNewLinkFrom((_) => null);
              }
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default Canvas;
