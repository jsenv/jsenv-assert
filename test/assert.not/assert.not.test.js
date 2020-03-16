import { assert } from "../../index.js"
import { ensureAssertionErrorWithMessage } from "../ensureAssertionErrorWithMessage.js"

{
  const actual = 41
  const expected = assert.not(42)
  assert({ actual, expected })
}

{
  const actual = 42
  const expected = assert.not(42)
  try {
    assert({ actual, expected })
  } catch (e) {
    ensureAssertionErrorWithMessage(
      e,
      `unexpected value.
--- found ---
42
--- expected ---
an other value
--- at ---
value`,
    )
  }
}
