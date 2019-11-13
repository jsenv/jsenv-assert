import { inspect } from "@jsenv/inspect"
import { comparisonToPath } from "../comparisonToPath.js"

export const propertiesComparisonToErrorMessage = (comparison) => {
  if (comparison.type !== "properties") return undefined

  const path = comparisonToPath(comparison)
  const extra = comparison.actual.extra
  const missing = comparison.actual.missing
  const hasExtra = extra.length > 0
  const hasMissing = missing.length > 0

  if (hasExtra && !hasMissing) {
    return createUnexpectedPropertiesMessage({
      path,
      unexpectedProperties: propertyNameArrayToString(extra),
    })
  }

  if (!hasExtra && hasMissing) {
    return createMissingPropertiesMessage({
      path,
      missingProperties: propertyNameArrayToString(missing),
    })
  }

  return createUnexpectedAndMissingPropertiesMessage({
    path,
    unexpectedProperties: propertyNameArrayToString(extra),
    missingProperties: propertyNameArrayToString(missing),
  })
}

const createUnexpectedPropertiesMessage = ({
  path,
  unexpectedProperties,
}) => `unexpected properties.
--- unexpected property names ---
${unexpectedProperties.join(`
`)}
--- at ---
${path}`

const createMissingPropertiesMessage = ({ path, missingProperties }) => `missing properties.
--- missing property names ---
${missingProperties.join(`
`)}
--- at ---
${path}`

const createUnexpectedAndMissingPropertiesMessage = ({
  path,
  unexpectedProperties,
  missingProperties,
}) => `unexpected and missing properties.
--- unexpected property names ---
${unexpectedProperties.join(`
`)}
--- missing property names ---
${missingProperties.join(`
`)}
--- at ---
${path}`

const propertyNameArrayToString = (propertyNameArray) => {
  return propertyNameArray.map((propertyName) => inspect(propertyName))
}
