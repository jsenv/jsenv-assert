import { assert } from "../../index.js"
import { ensureAssertionErrorWithMessage } from "../ensureAssertionErrorWithMessage.js"
import { executeInNewContext } from "../executeInNewContext.js"

{
  const actual = /a/
  const expected = /a/
  assert({ actual, expected })
}

{
  const actual = await executeInNewContext("/a/")
  const expected = /a/
  assert({ actual, expected })
}

{
  const actual = /a/
  const expected = /b/
  try {
    assert({ actual, expected })
  } catch (e) {
    ensureAssertionErrorWithMessage(
      e,
      `unequal values.
--- found ---
"/a/"
--- expected ---
"/b/"
--- at ---
value.toString()`,
    )
  }
}

{
  const actual = await executeInNewContext("/a/")
  const expected = /b/
  try {
    assert({ actual, expected })
  } catch (e) {
    ensureAssertionErrorWithMessage(
      e,
      `unequal values.
--- found ---
"/a/"
--- expected ---
"/b/"
--- at ---
value.toString()`,
    )
  }
}
