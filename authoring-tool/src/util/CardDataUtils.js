// @flow

import type { CardData } from "../model/CardData";
import type { UniqueId } from "./UniqueId";

export default function getAdjacentCardIds(
  cards: Map<UniqueId, CardData>,
  from: UniqueId
): Array<UniqueId> {
  const fromCard = cards.get(from);
  if (fromCard == null) {
    console.error(
      // $FlowExpectedError coerce to string for error logging
      `getAdjacentCardIds: could not find card with id ${from}`
    );
    return [];
  }
  switch (fromCard.links.type) {
    case "simple_link": {
      const to = fromCard.links.next;
      if (to == null) {
        return [];
      }
      return [to];
    }
    default:
      throw new Error(
        `getAdjacentCardIds: unrecognized link type: ${fromCard.links.type}`
      );
  }
}
