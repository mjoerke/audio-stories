// @flow

import type { UniqueId } from "../util/UniqueId";

export type CardData = $ReadOnly<{
  id: UniqueId,
  x: number,
  y: number,
}>;
