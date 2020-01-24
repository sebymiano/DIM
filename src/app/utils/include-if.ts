/**
 * inline shortcut to optionally return @elements for spreading if @condition
 * or an empty array/object otherwise.
 * call this function with a spread operator in front of it.
 * and be careful, strings can be spread.
 */
export default function includeIf(condition, elements) {
  return condition
    ? (elements !== null && typeof elements[Symbol.iterator] === 'function') ||
      typeof elements === 'object'
      ? elements
      : [elements]
    : Array.isArray(elements) || !(typeof elements === 'object' && elements !== null)
    ? []
    : {};
}

// export default function includeIf<T>(condition, elements:T):[]|T
// export default function includeIf<T>(condition, elements:T[]):[]|T[] {
//   return condition
//     ? (elements !== null && typeof elements[Symbol.iterator] === 'function') ||
//       typeof elements === 'object'
//       ? elements
//       : [elements]
//     : Array.isArray(elements) || !(typeof elements === 'object' && elements !== null)
//     ? []
//     : {};
// }
/*
export default function includeIf(condition, elements: []): [];
export default function includeIf(condition, elements: object): object {
  return condition
    ? elements
    : Array.isArray(elements)
    ? []
    : elements instanceof Object
    ? {}
    : elements;
}
*/

/*
export default function includeIf<T>(condition, elements: T[]): T[] | [];
export default function includeIf(condition, elements: any): object {
  return condition ? elements : Array.isArray(elements) ? [] : {};
}
*/

/*
export default function includeIf(condition, elements:[]):[]
export default function includeIf(condition, elements:object):object
export default function includeIf<T>(condition, elements:T):T[] {
  return condition
    ? (elements !== null && typeof elements[Symbol.iterator] === 'function') ||
      typeof elements === 'object'
      ? elements
      : [elements]
    : Array.isArray(elements) || !(typeof elements === 'object' && elements !== null)
    ? []
    : {};
}

/*export default function includeIf<T>(condition, elements:T):T {
  condition = (Boolean(condition));
  const failure = Array.isArray(elements) ? []: elements instanceof {} ? {};
  return condition?elements:failure;
}*/
