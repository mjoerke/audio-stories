// @flow

const Draggables = Object.freeze({
  AUDIO_CARD: "audio_card",
  CARD: "card",
  NEW_AUDIO_CARD: "new_audio_card",
  NEW_CARD: "new_card",
});

export type DraggableType =
  | "audio_card"
  | "card"
  | "new_audio_card"
  | "new_card";

export default Draggables;
