/* eslint-disable import/max-dependencies */
import { defaultComparisonToErrorMessage } from "./defaultComparisonToErrorMessage.js"
import { referenceComparisonToErrorMessage } from "./referenceComparisonToErrorMessage.js"
import { prototypeComparisonToErrorMessage } from "./prototypeComparisonToErrorMessage.js"
import { propertiesComparisonToErrorMessage } from "./propertiesComparisonToErrorMessage.js"
import { propertiesOrderComparisonToErrorMessage } from "./propertiesOrderComparisonToErrorMessage.js"
import { symbolsComparisonToErrorMessage } from "./symbolsComparisonToErrorMessage.js"
import { symbolsOrderComparisonToErrorMessage } from "./symbolsOrderComparisonToErrorMessage.js"
import { setSizeComparisonToMessage } from "./setSizeComparisonToMessage.js"
import { mapEntryComparisonToErrorMessage } from "./mapEntryComparisonToErrorMessage.js"
import { arrayLengthComparisonToMessage } from "./arrayLengthComparisonToMessage.js"

export const comparisonToErrorMessage = (comparison) => {
  const failedComparison = deepestComparison(comparison)
  return (
    firstFunctionReturningSomething(
      [
        mapEntryComparisonToErrorMessage,
        prototypeComparisonToErrorMessage,
        referenceComparisonToErrorMessage,
        propertiesComparisonToErrorMessage,
        propertiesOrderComparisonToErrorMessage,
        symbolsComparisonToErrorMessage,
        symbolsOrderComparisonToErrorMessage,
        setSizeComparisonToMessage,
        arrayLengthComparisonToMessage,
      ],
      failedComparison,
    ) || defaultComparisonToErrorMessage(failedComparison)
  )
}

const deepestComparison = (comparison) => {
  let current = comparison

  while (current) {
    const { children } = current
    if (children.length === 0) break
    current = children[children.length - 1]
  }

  return current
}

const firstFunctionReturningSomething = (fns, ...args) => {
  let i = 0
  while (i < fns.length) {
    const fn = fns[i]
    const returnValue = fn(...args)
    if (returnValue !== null && returnValue !== undefined) return returnValue
    i++
  }
  return undefined
}
