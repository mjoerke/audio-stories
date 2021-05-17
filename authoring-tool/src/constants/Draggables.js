// @flow

const Draggables = Object.freeze({
  AUDIO_CARD: "audio_card",
  CARD: "card",
  CLASSIFIER_CARD: "classifier_card",
  NEW_AUDIO_CARD: "new_audio_card",
  NEW_CARD: "new_card",
  NEW_CLASSIFIER_CARD: "new_classifier_card",
});

export type DraggableType =
  | "audio_card"
  | "classifier_card"
  | "card"
  | "new_audio_card"
  | "new_card"
  | "new_classifier_card";

export default Draggables;
