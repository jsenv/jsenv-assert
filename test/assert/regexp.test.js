import { assert } from "@jsenv/assert"
import { ensureAssertionErrorWithMessage } from "@jsenv/assert/test/ensureAssertionErrorWithMessage.js"
import { executeInNewContext } from "@jsenv/assert/test/executeInNewContext.js"

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
