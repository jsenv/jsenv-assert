import { assert } from "../../index.js"
import { ensureAssertionErrorWithMessage } from "../ensureAssertionErrorWithMessage.js"

{
  const actual = Object.defineProperty({}, "foo", { get: () => 1 })
  const expected = Object.defineProperty({}, "foo", { get: () => 1 })
  assert({ actual, expected })
}

{
  const actual = Object.defineProperty({}, "foo", {})
  const expected = Object.defineProperty({}, "foo", {
    get() {
      return 1
    },
  })
  try {
    assert({ actual, expected })
  } catch (e) {
    ensureAssertionErrorWithMessage(
      e,
      `unequal values.
--- found ---
undefined
--- expected ---
function get() {/* hidden */}
--- at ---
value.foo[[Get]]`,
    )
  }
}

{
  const actual = Object.defineProperty({}, "foo", {
    get() {
      return 1
    },
  })
  const expected = Object.defineProperty({}, "foo", {})
  try {
    assert({ actual, expected })
  } catch (e) {
    ensureAssertionErrorWithMessage(
      e,
      `unequal values.
--- found ---
function get() {/* hidden */}
--- expected ---
undefined
--- at ---
value.foo[[Get]]`,
    )
  }
}

{
  const actualGetter = () => 1
  const expectedGetter = () => 1
  const actual = Object.defineProperty({}, "foo", { get: actualGetter })
  const expected = Object.defineProperty({}, "foo", { get: expectedGetter })
  try {
    assert({ actual, expected })
  } catch (e) {
    ensureAssertionErrorWithMessage(
      e,
      `unequal values.
--- found ---
"${actualGetter.name}"
--- expected ---
"${expectedGetter.name}"
--- at ---
value.foo[[Get]].name`,
    )
  }
}
