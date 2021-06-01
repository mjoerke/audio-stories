// @flow

import type {
  CardData,
  ClassifierLink,
  DraftClassifierLink,
} from "../model/CardData";
import type { UniqueId } from "./UniqueId";

export function filterClassifierLinks(
  links: Array<ClassifierLink | DraftClassifierLink>
): Array<ClassifierLink> {
  // $FlowExpectedError: flow doesn't understand this refinement
  return links.filter((link) => link.type === "complete_classifier_link");
}

export function getAdjacentCardIds(
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
    case "classifier_links": {
      return filterClassifierLinks(fromCard.links.links).map(
        (link) => link.next
      );
    }
    default:
      throw new Error(
        `getAdjacentCardIds: unrecognized link type: ${fromCard.links.type}`
      );
  }
}
