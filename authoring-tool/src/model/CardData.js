// @flow

import type { UniqueId } from "../util/UniqueId";

export const DEFAULT_CARD_SIZE = 200;

export type SimpleLink = $ReadOnly<{
  next: UniqueId,
  type: "simple",
}>;

export type ClassifierLinks = $ReadOnly<{
  // link destinations by label
  labels: { [string]: UniqueId },
  thresholds: { [string]: number },
}>;

type BaseCardData = $ReadOnly<{
  id: UniqueId,
  height: number,
  links: SimpleLink | ClassifierLinks,
  type: "audio_card" | "classifier_card",
  width: number,
  x: number,
  y: number,
  ...
}>;

export type AudioCardData = $ReadOnly<{
  ...BaseCardData,
  links: SimpleLink,
  text: string,
  type: "audio_card",
}>;

export type ClassifierCardData = $ReadOnly<{
  ...BaseCardData,
  // TODO: change to ClassifierLinks
  links: SimpleLink,
  type: "classifier_card",
}>;

export type CardData = AudioCardData | ClassifierCardData;
