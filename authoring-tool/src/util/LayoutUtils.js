// @flow

import {
  CARD_HEADER_HEIGHT,
  CARD_HEADER_MARGIN,
  CLASSIFIER_CARD_ROW_HEIGHT,
  DEFAULT_CARD_HEIGHT,
} from "../constants/Constants";
import type { ClassifierLink } from "../model/CardData";

// eslint-disable-next-line import/prefer-default-export
export function getClassifierCardHeight(links: Array<ClassifierLink>): number {
  return links.length > 3
    ? DEFAULT_CARD_HEIGHT + CLASSIFIER_CARD_ROW_HEIGHT * (links.length - 3)
    : DEFAULT_CARD_HEIGHT;
}

export function getClassifierCardRowLinkPosition(idx: number): number {
  return (
    CARD_HEADER_HEIGHT +
    CARD_HEADER_MARGIN +
    idx * CLASSIFIER_CARD_ROW_HEIGHT +
    0.5 * CLASSIFIER_CARD_ROW_HEIGHT
  );
}
