// @flow

import type { UniqueId } from "../util/UniqueId";

export type SimpleLink = $ReadOnly<{
  next: ?UniqueId,
  type: "simple_link",
}>;

export type ClassifierLink = $ReadOnly<{
  next: UniqueId,
  label: string,
  threshold: number,
  type: "complete_classifier_link",
}>;

/* intermediate state representation for when the user is creating their
 * classifier */
export type DraftClassifierLink = $ReadOnly<{
  next: ?UniqueId,
  label: ?string,
  threshold: number,
  type: "incomplete_classifier_link",
}>;

export type ClassifierLinks = $ReadOnly<{
  links: Array<ClassifierLink | DraftClassifierLink>,
  type: "classifier_links",
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
  links: ClassifierLinks,
  type: "classifier_card",
}>;

export type CardData = AudioCardData | ClassifierCardData;
