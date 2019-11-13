/* eslint-disable no-use-before-define */
import { compare } from "./internal/compare.js"
import { comparisonToErrorMessage } from "./internal/toErrorMessage/comparisonToErrorMessage.js"
import { createAssertionError } from "./assertionError.js"

export const assert = (...args) => {
  if (args.length !== 1) {
    throw new Error(
      `assert must be called with exactly 1 argument, received ${args.length} arguments`,
    )
  }
  const firstArg = args[0]
  if (typeof firstArg !== "object" || firstArg === null) {
    throw new Error(`assert first argument must be an object, received ${firstArg}`)
  }
  if ("actual" in firstArg === false) {
    throw new Error(`assert first argument must have an actual property`)
  }
  if ("expected" in firstArg === false) {
    throw new Error(`assert first argument must have an expected property`)
  }

  const { actual, expected } = firstArg

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
