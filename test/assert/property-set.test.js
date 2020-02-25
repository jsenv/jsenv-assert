/* eslint-disable accessor-pairs */
import { assert } from "../../index.js"
import { ensureAssertionErrorWithMessage } from "../ensureAssertionErrorWithMessage.js"

{
  const actual = Object.defineProperty({}, "foo", { set: () => {} })
  const expected = Object.defineProperty({}, "foo", { set: () => {} })
  assert({ actual, expected })
}

try {
  const actual = Object.defineProperty({}, "foo", {})
  const expected = Object.defineProperty({}, "foo", { set: () => {} })
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
value.foo[[Set]]`,
  )
}

try {
  const actual = Object.defineProperty({}, "foo", { set: () => {} })
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
value.foo[[Set]]`,
  )
}

try {
  const actualSetter = () => 1
  const expectedSetter = () => 1
  const actual = Object.defineProperty({}, "foo", { set: actualSetter })
  const expected = Object.defineProperty({}, "foo", { set: expectedSetter })
  assert({ actual, expected })
} catch (e) {
  ensureAssertionErrorWithMessage(
    e,
    `unequal values.
--- found ---
"actualSetter"
--- expected ---
"expectedSetter"
--- at ---
value.foo[[Set]].name`,
  )
}
