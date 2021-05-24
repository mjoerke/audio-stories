// @flow

let counter = 0;

export opaque type UniqueId = number;

export default function makeUniqueId(): UniqueId {
  const c = counter;
  counter += 1;
  return c;
}

export function uniqueIdAsString(id: UniqueId): string {
  return String(id);
}
