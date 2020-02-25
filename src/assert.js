/* eslint-disable no-use-before-define */
import { compare } from "./internal/compare.js"
import { comparisonToErrorMessage } from "./internal/toErrorMessage/comparisonToErrorMessage.js"
import { createAssertionError } from "./assertionError.js"

export const assert = (...args) => {
  if (args.length === 0) {
    throw new Error(`assert must be called with { actual, expected }, missing first argument`)
  }
  if (args.length > 1) {
    throw new Error(`assert must be called with { actual, expected }, received too much arguments`)
  }
  const firstArg = args[0]
  if (typeof firstArg !== "object" || firstArg === null) {
    throw new Error(
      `assert must be called with { actual, expected }, received ${firstArg} as first argument instead of object`,
    )
  }
  if ("actual" in firstArg === false) {
    throw new Error(
      `assert must be called with { actual, expected }, missing actual property on first argument`,
    )
  }
  if ("expected" in firstArg === false) {
    throw new Error(
      `assert must be called with { actual, expected }, missing expected property on first argument`,
    )
  }

  const {
    actual,
    expected,
    message,
    comparePropertyOrder = false,
    compareSymbolOrder = false,
  } = firstArg

  const expectation = {
    actual,
    expected,
  }

  const comparison = compare(expectation, { comparePropertyOrder, compareSymbolOrder })
  if (comparison.failed) {
    const error = createAssertionError(message || comparisonToErrorMessage(comparison))
    if (Error.captureStackTrace) Error.captureStackTrace(error, assert)
    throw error
  }
}
