import { inspect } from "@jsenv/inspect"
import { symbolToWellKnownSymbol } from "./symbolToWellKnownSymbol.js"
import { propertyNameToDotNotationAllowed } from "./propertyNameToDotNotationAllowed.js"

export const propertyToAccessorString = (property) => {
  if (typeof property === "number") {
    return `[${inspect(property)}]`
  }
  if (typeof property === "string") {
    const dotNotationAllowedForProperty = propertyNameToDotNotationAllowed(property)
    if (dotNotationAllowedForProperty) {
      return `.${property}`
    }
    return `[${inspect(property)}]`
  }

  return `[${symbolToWellKnownSymbol(property)}]`
}
