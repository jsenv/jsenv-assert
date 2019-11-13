import { assert } from "../../index.js"
import { ensureAssertionErrorWithMessage } from "../ensureAssertionErrorWithMessage.js"

try {
  const actual = Object.defineProperty({}, "foo", { get: () => 1 })
  const expected = Object.defineProperty({}, "foo", { get: () => 1 })
  assert({ actual, expected })
} catch (e) {
  throw new Error(`should not throw`)
}

try {
  const actual = Object.defineProperty({}, "foo", {})
  const expected = Object.defineProperty({}, "foo", { get: () => 1 })
  assert({ actual, expected })
} catch (e) {
  ensureAssertionErrorWithMessage(
    e,
    `unequal values.
--- found ---
undefined
--- expected ---
() => {/* hidden */}
--- at ---
value.foo[[Get]]`,
  )
}

try {
  const actual = Object.defineProperty({}, "foo", { get: () => 1 })
  const expected = Object.defineProperty({}, "foo", {})
  assert({ actual, expected })
} catch (e) {
  ensureAssertionErrorWithMessage(
    e,
    `unequal values.
--- found ---
() => {/* hidden */}
--- expected ---
undefined
--- at ---
value.foo[[Get]]`,
  )
}

try {
  const actualGetter = () => 1
  const expectedGetter = () => 1
  const actual = Object.defineProperty({}, "foo", { get: actualGetter })
  const expected = Object.defineProperty({}, "foo", { get: expectedGetter })
  assert({ actual, expected })
} catch (e) {
  ensureAssertionErrorWithMessage(
    e,
    `unequal values.
--- found ---
"actualGetter"
--- expected ---
"expectedGetter"
--- at ---
value.foo[[Get]].name`,
  )
}
