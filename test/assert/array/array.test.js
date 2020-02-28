import { assert } from "../../../index.js"
import { ensureAssertionErrorWithMessage } from "../../ensureAssertionErrorWithMessage.js"

{
  const actual = []
  const expected = []
  assert({ actual, expected })
}

{
  const actual = [0]
  const expected = [0]
  assert({ actual, expected })
}

{
  const actual = {
    range: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  }
  const expected = {
    range: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  }
  assert({ actual, expected })
}

{
  const actual = []
  const expected = [0, 1]
  try {
    assert({ actual, expected })
  } catch (e) {
    ensureAssertionErrorWithMessage(
      e,
      `an array is smaller than expected.
--- array length found ---
0
--- array length expected ---
2
--- at ---
value`,
    )
  }
}

{
  const actual = [0, 1]
  const expected = []
  try {
    assert({ actual, expected })
  } catch (e) {
    ensureAssertionErrorWithMessage(
      e,
      `an array is bigger than expected.
--- array length found ---
2
--- array length expected ---
0
--- at ---
value`,
    )
  }
}

// ensure an object that looks like an array
// does not produce an array smaller/bigger than expected message
{
  const actual = { length: 0 }
  const expected = { length: 1 }
  try {
    assert({ actual, expected })
  } catch (e) {
    ensureAssertionErrorWithMessage(
      e,
      `unequal values.
--- found ---
0
--- expected ---
1
--- at ---
value.length`,
    )
  }
}

{
  const actual = ["a"]
  const expected = ["b"]
  try {
    assert({ actual, expected })
  } catch (e) {
    ensureAssertionErrorWithMessage(
      e,
      `unequal values.
--- found ---
"a"
--- expected ---
"b"
--- at ---
value[0]`,
    )
  }
}

{
  const actual = []
  actual.foo = true
  const expected = []
  expected.foo = false
  try {
    assert({ actual, expected })
  } catch (e) {
    ensureAssertionErrorWithMessage(
      e,
      `unequal values.
--- found ---
true
--- expected ---
false
--- at ---
value.foo`,
    )
  }
}

{
  const symbol = Symbol()
  const actual = []
  actual[symbol] = true
  const expected = []
  expected[symbol] = false
  try {
    assert({ actual, expected })
  } catch (e) {
    ensureAssertionErrorWithMessage(
      e,
      `unequal values.
--- found ---
true
--- expected ---
false
--- at ---
value[Symbol()]`,
    )
  }
}
