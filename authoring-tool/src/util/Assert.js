// @flow

import type { CardData } from "../model/CardData";
import type { UniqueId } from "./UniqueId";

/* Checks to make sure that invariants aren't violated in our data.
 * Returns the argument if no violations, otherwise raises an error.
 * Turns into a no-op on prod. */
// eslint-disable-next-line import/prefer-default-export
export function assertCardsValid(
  cards: Map<UniqueId, CardData>
): Map<UniqueId, CardData> {
  Array.from(cards).forEach(([id, card]) => {
    switch (card.type) {
      case "audio_card":
        break;
      case "classifier_card":
        break;
      default:
        throw new Error(
          // $FlowExpectedError coerce id to string for error logging
          `assertCardsValid: Unrecognized card type ${card.type} for id ${id}`
        );
    }
    switch (card.links.type) {
      case "simple_link": {
        const dest = card.links.next;
        if (dest != null && cards.get(dest) == null) {
          throw new Error(
            // $FlowExpectedError coerce id to string for error logging
            `assertCardsValid: SimpleLink destination id ${card.links.next} for card id ${id} does not exist`
          );
        }
        break;
      }
      case "classifier_links":
        card.links.links.forEach((link) => {
          if (cards.get(link.next) == null) {
            throw new Error(
              // $FlowExpectedError coerce id to string for error logging
              `assertCardsValid: ClassifierLink destination id ${link.next} for card id ${id} does not exist`
            );
          }
        });
        break;
      default:
        throw new Error(
          // $FlowExpectedError coerce id to string for error logging
          `assertCardsValid: Unrecognized link type ${card.links.type} for id ${id}`
        );
    }
  });
  return cards;
}
