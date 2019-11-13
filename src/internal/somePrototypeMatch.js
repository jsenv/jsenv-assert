export const somePrototypeMatch = (value, predicate) => {
  let prototype = Object.getPrototypeOf(value)
  while (prototype) {
    if (predicate(prototype)) return true
    prototype = Object.getPrototypeOf(prototype)
  }
  return false
}
