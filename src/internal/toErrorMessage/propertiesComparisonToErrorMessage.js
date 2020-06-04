import { inspect } from "@jsenv/inspect"
import { createDetailedMessage } from "./createDetailedMessage.js"
import { comparisonToPath } from "../comparisonToPath.js"

export const propertiesComparisonToErrorMessage = (comparison) => {
  if (comparison.type !== "properties") return undefined

  const path = comparisonToPath(comparison.parent)
  const missing = comparison.actual.missing
  const extra = comparison.actual.extra
  const missingCount = missing.length
  const extraCount = extra.length
  const unexpectedProperties = {}
  extra.forEach((propertyName) => {
    unexpectedProperties[propertyName] = comparison.parent.actual[propertyName]
  })
  const missingProperties = {}
  missing.forEach((propertyName) => {
    missingProperties[propertyName] = comparison.parent.expected[propertyName]
  })

  if (missingCount === 1 && extraCount === 0) {
    return createDetailedMessage("1 missing property.", {
      "missing property": inspect(missingProperties),
      "at": path,
    })
  }

  if (missingCount > 1 && extraCount === 0) {
    return createDetailedMessage(`${missing} missing properties.`, {
      "missing properties": inspect(unexpectedProperties),
      "at": path,
    })
  }

  if (missingCount === 0 && extraCount === 1) {
    return createDetailedMessage(`1 unexpected property.`, {
      "unexpected property": inspect(unexpectedProperties),
      "at": path,
    })
  }

  if (missingCount === 0 && extraCount > 1) {
    return createDetailedMessage(`${extraCount} unexpected properties.`, {
      "unexpected properties": inspect(unexpectedProperties),
      "at": path,
    })
  }

  let message = ""
  if (missingCount === 1) {
    message += `1 missing property`
  } else {
    message += `${missingCount} missing properties`
  }
  if (extraCount === 1) {
    message += ` and 1 unexpected property.`
  } else {
    message += ` and ${extraCount} unexpected properties.`
  }
  return createDetailedMessage(message, {
    [missingCount === 1 ? "missing property" : "missing properties"]: inspect(missingProperties),
    [extraCount === 1 ? "unexpected property" : "unexpected properties"]: inspect(
      unexpectedProperties,
    ),
    at: path,
  })
}
