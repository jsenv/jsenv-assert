/* eslint-disable no-use-before-define */
import { compare } from "./internal/compare.js"
import { comparisonToErrorMessage } from "./internal/toErrorMessage/comparisonToErrorMessage.js"
import { createAssertionError } from "./assertionError.js"

export const assert = ({ message, actual, expected }) => {
  const expectation = {
    actual,
    expected,
  }

  const comparison = compare(expectation)
  if (comparison.failed) {
    const error = createAssertionError(message || comparisonToErrorMessage(comparison))
    if (Error.captureStackTrace) Error.captureStackTrace(error, assert)
    throw error
  }
}
