import { assert } from "../../index.js"
import { ensureAssertionErrorWithMessage } from "../ensureAssertionErrorWithMessage.js"

{
  const actual = (() => () => {})()
  const expected = (() => () => {})()
  assert({ actual, expected })
}

{
  const actual = () => {}
  const expected = () => {}
  try {
    assert({ actual, expected })
  } catch (e) {
    ensureAssertionErrorWithMessage(
      e,
      `unequal values.
--- found ---
"${actual.name}"
--- expected ---
"${expected.name}"
--- at ---
value.name`,
    )
  }
}
