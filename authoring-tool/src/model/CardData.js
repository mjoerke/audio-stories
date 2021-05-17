// @flow

import type { UniqueId } from "../util/UniqueId";

export const DEFAULT_CARD_SIZE = 200;

export type CardData = $ReadOnly<{
  id: UniqueId,
  height: number,
  type: "audio_card" | "card",
  width: number,
  x: number,
  y: number,
}>;

export type AudioCardData = {
  ...CardData,
  type: "audio_card",
};
