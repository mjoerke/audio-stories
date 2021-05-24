//      

                                                  
                                           

export default function getAdjacentCardIds(
  cards                         ,
  from          
)                  {
  const fromCard = cards.get(from);
  if (fromCard == null) {
    console.error(
      // $FlowExpectedError coerce to string for error logging
      `getAdjacentCardIds: could not find card with id ${from}`
    );
    return [];
  }
  switch (fromCard.links.type) {
    case "simple_link": {
      const to = fromCard.links.next;
      if (to == null) {
        return [];
      }
      return [to];
    }
    case "classifier_links": {
      return fromCard.links.links.map((link) => link.next);
    }
    default:
      throw new Error(
        `getAdjacentCardIds: unrecognized link type: ${fromCard.links.type}`
      );
  }
}
