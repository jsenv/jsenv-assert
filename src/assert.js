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

  return _assert(...args)
}

/*
 * anyOrder is not documented because ../readme.md#Why-opinionated-
 * but I feel like the property order comparison might be too strict
 * and if we cannot find a proper alternative, being able to disable it
 * might be useful
 *
 * Documentation suggest to take the object and reorder manually
 *
 * const value = { bar: true, foo: true }
 * const actual = { foo: value.foo, bar: value.bar }
 * const expected = { foo: true, bar: true }
 *
 * An other good alternative could be an helper that would sort properties
 *
 * const value = sortProperties(value)
 * const expected = sortProperties({ foo: true, bar: true })
 s*
 */
const _assert = ({ actual, expected, message, anyOrder = false }) => {
  const expectation = {
    actual,
    expected,
  }

  const comparison = compare(expectation, { anyOrder })
  if (comparison.failed) {
    const error = createAssertionError(message || comparisonToErrorMessage(comparison))
    if (Error.captureStackTrace) Error.captureStackTrace(error, assert)
    throw error
  }
}
