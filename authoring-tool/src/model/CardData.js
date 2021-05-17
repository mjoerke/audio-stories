// @flow

import type { UniqueId } from "../util/UniqueId";

export const DEFAULT_CARD_SIZE = 200;

type BaseCardData = $ReadOnly<{
  id: UniqueId,
  height: number,
  type: "audio_card" | "classifier_card",
  width: number,
  x: number,
  y: number,
  ...
}>;

export type AudioCardData = $ReadOnly<{
  ...BaseCardData,
  text: string,
  type: "audio_card",
}>;

export type ClassifierCardData = $ReadOnly<{
  ...BaseCardData,
  type: "classifier_card",
}>;

export type CardData = AudioCardData | ClassifierCardData;
