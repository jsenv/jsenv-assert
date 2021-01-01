import { assert } from "@jsenv/assert"
import { ensureAssertionErrorWithMessage } from "@jsenv/assert/test/ensureAssertionErrorWithMessage.js"
import { executeInNewContext } from "@jsenv/assert/test/executeInNewContext.js"

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
  const actual = await executeInNewContext("[]")
  const expected = []
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
  const actual = [0]
  const expected = [0, 1]
  try {
    assert({ actual, expected })
  } catch (e) {
    ensureAssertionErrorWithMessage(
      e,
      `an array is smaller than expected.
--- array length found ---
1
--- array length expected ---
2
--- missing values ---
[
  1
]
--- at ---
value`,
    )
  }
}

{
  const actual = [0, 1]
  const expected = [0]
  try {
    assert({ actual, expected })
  } catch (e) {
    ensureAssertionErrorWithMessage(
      e,
      `an array is bigger than expected.
--- array length found ---
2
--- array length expected ---
1
--- extra values ---
[
  1
]
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

if (typeof window === "object") {
  const actual = {}
  const expected = []
  try {
    assert({ actual, expected })
  } catch (e) {
    ensureAssertionErrorWithMessage(
      e,
      `unequal prototypes.
--- prototype found ---
window.Object.prototype
--- prototype expected ---
window.Array.prototype
--- at ---
value[[Prototype]]`,
    )
  }
}

if (typeof global === "object") {
  const actual = {}
  const expected = []
  try {
    assert({ actual, expected })
  } catch (e) {
    ensureAssertionErrorWithMessage(
      e,
      `unequal prototypes.
--- prototype found ---
global.Object.prototype
--- prototype expected ---
global.Array.prototype
--- at ---
value[[Prototype]]`,
    )
  }
}
