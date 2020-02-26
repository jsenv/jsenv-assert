import { assert } from "../../../index.js"
import { ensureAssertionErrorWithMessage } from "../../ensureAssertionErrorWithMessage.js"

{
  const actual = new Error()
  const expected = new Error()
  assert({ actual, expected })
}

{
  const actual = new Error("foo")
  const expected = new Error("bar")
  try {
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
}
