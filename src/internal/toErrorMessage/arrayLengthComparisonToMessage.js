import { comparisonToPath } from "../comparisonToPath.js"
import { isArray } from "../object-subtype.js"

export const arrayLengthComparisonToMessage = (comparison) => {
  if (comparison.type !== "identity") return undefined
  const parentComparison = comparison.parent
  if (parentComparison.type !== "property-value") return undefined
  if (parentComparison.data !== "length") return undefined
  const grandParentComparison = parentComparison.parent
  if (!isArray(grandParentComparison.actual)) return undefined

  if (comparison.actual > comparison.expected) return createBiggerThanExpectedMessage(comparison)
  return createSmallerThanExpectedMessage(comparison)
}

const createBiggerThanExpectedMessage = (comparison) => `an array is bigger than expected.
--- array length found ---
${comparison.actual}
--- array length expected ---
${comparison.expected}
--- at ---
${comparisonToPath(comparison.parent.parent)}`

const createSmallerThanExpectedMessage = (comparison) => `an array is smaller than expected.
--- array length found ---
${comparison.actual}
--- array length expected ---
${comparison.expected}
--- at ---
${comparisonToPath(comparison.parent.parent)}`
