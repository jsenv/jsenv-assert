import { assert } from "../../index.js"
import { ensureAssertionErrorWithMessage } from "../ensureAssertionErrorWithMessage.js"

{
  const actual = {
    foo: true,
    bar: true,
  }
  const expected = {
    foo: true,
    bar: true,
  }
  assert({ actual, expected })
}

{
  const actual = {
    foo: true,
    bar: true,
  }
  const expected = {
    bar: true,
    foo: true,
  }
  try {
    assert({ actual, expected, comparePropertyOrder: true })
  } catch (e) {
    ensureAssertionErrorWithMessage(
      e,
      `unexpected properties order.
--- properties order found ---
"foo"
"bar"
--- properties order expected ---
"bar"
"foo"
--- at ---
value`,
    )
  }
}
