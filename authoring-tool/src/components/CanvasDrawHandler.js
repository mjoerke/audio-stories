// @flow

import type { CardData } from "../model/CardData";
import type { UniqueId } from "../util/UniqueId";
import { SIDE_PANEL_WIDTH } from "../constants/Constants";
import { getAdjacentCardIds } from "../util/CardDataUtils";
import { getClassifierCardRowLinkPosition } from "../util/LayoutUtils";

const ARROWHEAD_LENGTH = 16;

export function drawLink(
  ctx: CanvasRenderingContext2D,
  startCoords: { x: number, y: number },
  endCoords: { x: number, y: number },
  color?: string,
  lineWidth?: number
) {
  const prevColor = ctx.strokeStyle;
  if (color != null) {
    ctx.strokeStyle = color;
  }
  const prevLineWidth = ctx.lineWidth;
  if (lineWidth != null) {
    ctx.lineWidth = lineWidth;
  }
  let angle = 0;
  if (startCoords.x < endCoords.x) {
    angle = Math.atan2(
      endCoords.y - startCoords.y,
      endCoords.x - startCoords.x
    );
    ctx.beginPath();
    ctx.moveTo(startCoords.x, startCoords.y);
    ctx.lineTo(endCoords.x, endCoords.y);
  } else if (startCoords.y < endCoords.y) {
    ctx.beginPath();
    ctx.moveTo(startCoords.x, startCoords.y);

    ctx.bezierCurveTo(
      startCoords.x + 200,
      startCoords.y,
      endCoords.x + 300,
      endCoords.y + 130,
      endCoords.x + 100,
      endCoords.y + 130
    );

    ctx.bezierCurveTo(
      endCoords.x - 70,
      endCoords.y + 130,
      endCoords.x - 200,
      endCoords.y,
      endCoords.x,
      endCoords.y
    );
  } else {
    ctx.beginPath();
    ctx.moveTo(startCoords.x, startCoords.y);
    ctx.bezierCurveTo(
      startCoords.x + 200,
      startCoords.y,
      endCoords.x + 300,
      endCoords.y - 130,
      endCoords.x + 100,
      endCoords.y - 130
    );

    ctx.bezierCurveTo(
      endCoords.x - 70,
      endCoords.y - 130,
      endCoords.x - 200,
      endCoords.y,
      endCoords.x,
      endCoords.y
    );
  }

  ctx.lineTo(
    endCoords.x - ARROWHEAD_LENGTH * Math.cos(angle - Math.PI / 6),
    endCoords.y - ARROWHEAD_LENGTH * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(endCoords.x, endCoords.y);
  ctx.lineTo(
    endCoords.x - ARROWHEAD_LENGTH * Math.cos(angle + Math.PI / 6),
    endCoords.y - ARROWHEAD_LENGTH * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
  ctx.strokeStyle = prevColor;
  ctx.lineWidth = prevLineWidth;
}

export function drawSelfLink(
  ctx: CanvasRenderingContext2D,
  startCoords: { x: number, y: number },
  endCoords: { x: number, y: number },
  color?: string,
  lineWidth?: number
) {
  const prevColor = ctx.strokeStyle;
  if (color != null) {
    ctx.strokeStyle = color;
  }
  const prevLineWidth = ctx.lineWidth;
  if (lineWidth != null) {
    ctx.lineWidth = lineWidth;
  }
  const angle = 0;
  ctx.beginPath();
  ctx.moveTo(startCoords.x, startCoords.y);
  ctx.bezierCurveTo(
    startCoords.x + 200,
    startCoords.y,
    (startCoords.x + endCoords.x) / 2 + 200,
    (startCoords.y + endCoords.y) / 2 + 200,
    (startCoords.x + endCoords.x) / 2,
    (startCoords.y + endCoords.y) / 2 + 200
  );

  ctx.bezierCurveTo(
    (startCoords.x + endCoords.x) / 2 - 200,
    (startCoords.y + endCoords.y) / 2 + 200,
    endCoords.x - 200,
    endCoords.y,
    endCoords.x,
    endCoords.y
  );

  // ctx.lineTo(endCoords.x, endCoords.y);
  ctx.lineTo(
    endCoords.x - ARROWHEAD_LENGTH * Math.cos(angle - Math.PI / 6),
    endCoords.y - ARROWHEAD_LENGTH * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(endCoords.x, endCoords.y);
  ctx.lineTo(
    endCoords.x - ARROWHEAD_LENGTH * Math.cos(angle + Math.PI / 6),
    endCoords.y - ARROWHEAD_LENGTH * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
  ctx.strokeStyle = prevColor;
  ctx.lineWidth = prevLineWidth;
}

export function drawExistingLinks(
  ctx: CanvasRenderingContext2D,
  cards: Map<UniqueId, CardData>,
  highlightLinksForId: ?UniqueId
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  // eslint-disable-next-line no-undef
  ctx.canvas.width = Math.max(ctx.canvas.width, window.innerWidth);
  // eslint-disable-next-line no-undef
  ctx.canvas.height = Math.max(ctx.canvas.height, window.innerHeight);
  Array.from(cards).forEach(([from, fromCard]) => {
    ctx.beginPath();
    const tos = getAdjacentCardIds(cards, from);
    tos.forEach((to, idx) => {
      const toCard = cards.get(to);
      if (toCard == null) {
        console.error(
          // $FlowExpectedError coerce to string for error logging
          `No card found with id ${toCard.id} when trying to draw link to card!`
        );
      } else {
        const draw = toCard.id === fromCard.id ? drawSelfLink : drawLink;
        const startYOffset =
          fromCard.type === "classifier_card"
            ? getClassifierCardRowLinkPosition(idx)
            : fromCard.height / 2;
        /* Card coords are absolute relative to window, so we need to
         * offset by the size of the side panel */
        draw(
          ctx,
          {
            x: fromCard.x + fromCard.width - SIDE_PANEL_WIDTH,
            y: fromCard.y + startYOffset,
          },
          {
            x: toCard.x - SIDE_PANEL_WIDTH,
            y: toCard.y + toCard.height / 2,
          },
          fromCard.id === highlightLinksForId ? "blue" : undefined,
          fromCard.id === highlightLinksForId ? 3 : undefined
        );
      }
    });
  });
}
