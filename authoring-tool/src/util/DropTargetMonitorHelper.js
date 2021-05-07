// @flow

import type { DropTargetMonitor, XYCoord } from "react-dnd";

/* Calculates the drop position of an dragged item. Returns null if the item
 * is not being dragged. */
// eslint-disable-next-line import/prefer-default-export
export function calculateDropPosition(
  monitor: DropTargetMonitor<>
): XYCoord | null {
  const nodeStartXY = monitor.getInitialSourceClientOffset();
  const pointerStartXY = monitor.getInitialClientOffset();
  const pointerEndXY = monitor.getClientOffset();
  if (nodeStartXY == null || pointerStartXY == null || pointerEndXY == null) {
    return null;
  }
  return {
    /* x and y correspond to the top-left coordinates of the item.
     * However, we typically drag items from somewhere inside the item,
     * rather than from exactly the top-left corner. In order to correct
     * for this discrepancy, we need to calculate the distance between the
     * initial node position and the initial pointer pos, and then subtract
     * that from the final position pos. */
    x: pointerEndXY.x - (pointerStartXY.x - nodeStartXY.x),
    y: pointerEndXY.y - (pointerStartXY.y - nodeStartXY.y),
  };
}
