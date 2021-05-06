// @flow

const Draggables = Object.freeze({
  CARD: "card",
});

// eslint-disable-next-line no-undef
export opaque type DraggableType = $Values<typeof Draggables>;

export default Draggables;
