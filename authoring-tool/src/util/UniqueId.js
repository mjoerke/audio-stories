// @flow

let counter = 0;

export opaque type UniqueId = number;

export default function makeUniqueId(): UniqueId {
  counter += 1;
  return counter;
}
