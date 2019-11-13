import { assert } from "../../../index.js"
import { ensureAssertionErrorWithMessage } from "../../ensureAssertionErrorWithMessage.js"

try {
  const actual = new Error()
  const expected = new Error()
  assert({ actual, expected })
} catch (e) {
  throw new Error(`should not throw`)
}

try {
  const actual = new Error("foo")
  const expected = new Error("bar")
  assert({ actual, expected })
} catch (e) {
  ensureAssertionErrorWithMessage(
    e,
    `unequal values.
--- found ---
"foo"
--- expected ---
"bar"
--- at ---
value.message`,
  )
}
