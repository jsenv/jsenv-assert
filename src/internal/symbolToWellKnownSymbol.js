import { inspect } from "@jsenv/inspect"
import { propertyToAccessorString } from "./propertyToAccessorString.js"

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#Well-known_symbols
export const symbolToWellKnownSymbol = (symbol) => {
  const wellKnownSymbolName = Object.getOwnPropertyNames(Symbol).find(
    (name) => symbol === Symbol[name],
  )
  if (wellKnownSymbolName) {
    return `Symbol${propertyToAccessorString(wellKnownSymbolName)}`
  }

  const description = symbolToDescription(symbol)
  if (description) {
    const key = Symbol.keyFor(symbol)
    if (key) {
      return `Symbol.for(${inspect(description)})`
    }
    return `Symbol(${inspect(description)})`
  }
  return `Symbol()`
}

const symbolToDescription = (symbol) => {
  const toStringResult = symbol.toString()
  const openingParenthesisIndex = toStringResult.indexOf("(")
  const closingParenthesisIndex = toStringResult.indexOf(")")
  return toStringResult.slice(openingParenthesisIndex + 1, closingParenthesisIndex)
  // return symbol.description // does not work on node
}
