import { assert } from "../../index.js"
import { ensureAssertionErrorWithMessage } from "../ensureAssertionErrorWithMessage.js"

{
  const actual = 10
  const expected = 10
  assert({ actual, expected })
}

{
  const actual = Infinity
  const expected = Infinity
  assert({ actual, expected })
}

{
  const actual = -0
  const expected = -0
  assert({ actual, expected })
}

{
  const actual = 1
  const expected = 10
  try {
    assert({ actual, expected })
  } catch (e) {
    ensureAssertionErrorWithMessage(
      e,
      `unequal values.
--- found ---
1
--- expected ---
10
--- at ---
value`,
    )
  }
}

{
  const actual = Infinity
  const expected = 1
  try {
    assert({ actual, expected })
  } catch (e) {
    ensureAssertionErrorWithMessage(
      e,
      `unequal values.
--- found ---
Infinity
--- expected ---
1
--- at ---
value`,
    )
  }
}

{
  const actual = NaN
  const expected = 1
  try {
    assert({ actual, expected })
  } catch (e) {
    ensureAssertionErrorWithMessage(
      e,
      `unequal values.
--- found ---
NaN
--- expected ---
1
--- at ---
value`,
    )
  }
}

{
  const actual = -0
  const expected = 0
  try {
    assert({ actual, expected })
  } catch (e) {
    ensureAssertionErrorWithMessage(
      e,
      `unequal values.
--- found ---
-0
--- expected ---
0
--- at ---
value`,
    )
  }
}

{
  const actual = 0
  const expected = -0
  try {
    assert({ actual, expected })
  } catch (e) {
    ensureAssertionErrorWithMessage(
      e,
      `unequal values.
--- found ---
0
--- expected ---
-0
--- at ---
value`,
    )
  }
}

{
  const actual = 1
  const expected = -1
  try {
    assert({ actual, expected })
  } catch (e) {
    ensureAssertionErrorWithMessage(
      e,
      `unequal values.
--- found ---
1
--- expected ---
-1
--- at ---
value`,
    )
  }
}
