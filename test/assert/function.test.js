import { assert } from "../../index.js"
import { ensureAssertionErrorWithMessage } from "../ensureAssertionErrorWithMessage.js"

try {
  const actual = (() => () => {})()
  const expected = (() => () => {})()
  assert({ actual, expected })
} catch (e) {
  throw new Error(`should not throw`)
}

try {
  const actual = () => {}
  const expected = () => {}
  assert({ actual, expected })
} catch (e) {
  ensureAssertionErrorWithMessage(
    e,
    `unequal values.
--- found ---
"actual"
--- expected ---
"expected"
--- at ---
value.name`,
  )
}
