// @flow

import type { CardData } from "../model/CardData";
import type { UniqueId } from "./UniqueId";

type AudioCardSchema = $ReadOnly<{
  audio_text: string,
  next: number,
  type: "audio",
}>;

type ClassifierCardSchema = $ReadOnly<{
  labels: { [string]: number },
  thresholds: { [string]: number },
  type: "classifier",
}>;

export type JsonSchema = $ReadOnly<{
  //  story_id: string,
  nodes: { [string]: AudioCardSchema | ClassifierCardSchema },
}>;

export function exportAsObject(cards: Map<UniqueId, CardData>): JsonSchema {
  const nodes = {};
  Array.from(cards).forEach(([_id, card]) => {
    switch (card.type) {
      case "audio_card":
        // $FlowExpectedError cast id as number for serialization
        nodes[card.id] = {
          type: "audio",
          next: card.links.next,
          audio_text: card.text,
        };
        break;
      case "classifier_card": {
        const labels = {};
        const thresholds = {};
        card.links.links.forEach((link) => {
          labels[link.label] = link.next;
          thresholds[link.label] = link.threshold;
        });
        // $FlowExpectedError cast id as number for serialization
        nodes[card.id] = {
          type: "classifier",
          labels,
          thresholds,
        };
        break;
      }
      default:
        throw new Error(`exportAsObject: unrecognized card type: ${card.type}`);
    }
  });

  let startID;
  const storyIDNode = document.querySelector("textarea[id=story-id]");
  if (storyIDNode && storyIDNode instanceof HTMLTextAreaElement) {
    startID = storyIDNode.value ? storyIDNode.value : startID;
  }
  let storyName = "story_demo_test";
  const storyNameNode = document.querySelector("textarea[id=story-name]");
  if (storyNameNode && storyNameNode instanceof HTMLTextAreaElement) {
    storyName = storyNameNode.value ? storyNameNode.value : storyName;
  }
  return { story_id: storyName, start_id: startID, nodes };
}

/* TODO: in an ideal world, this would output what's wrong */
export function validate(obj: JsonSchema): boolean {
  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(obj.nodes)) {
    const node = obj.nodes[key];
    switch (node.type) {
      case "audio":
        if (node.audio_text != null && node.audio_text.length === 0) {
          return false;
        }
        break;
      case "classifier":
        // check if empty
        if (
          Object.keys(node.labels).length === 0 ||
          Object.keys(node.thresholds).length === 0
        ) {
          return false;
        }
        break;
      default:
        return false;
    }
  }
  return true;
}

// export function deserialize(payload: string): ?Map<UniqueId, CardData> {
//   const obj = JSON.parse(payload);
//   try {
//     const cards = new Map<UniqueId, CardData>();

//     return cards;
//   } catch (e) {
//     console.error("Unable to deserialize payload:");
//     console.error(payload);
//     console.error(JSON.stringify(JSON.parse(payload), null, 2));
//     return null;
//   }
// }
