//      

let counter = 0;

                                     

export default function makeUniqueId()           {
  counter += 1;
  return counter;
}

export function uniqueIdAsString(id          )         {
  return String(id);
}
