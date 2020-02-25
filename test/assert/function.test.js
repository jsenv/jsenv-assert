import { assert } from "../../index.js"
import { ensureAssertionErrorWithMessage } from "../ensureAssertionErrorWithMessage.js"

{
  const actual = (() => () => {})()
  const expected = (() => () => {})()
  assert({ actual, expected })
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
