import { assert } from "../../index.js"
import { ensureAssertionErrorWithMessage } from "../ensureAssertionErrorWithMessage.js"

try {
  const actual = {
    foo: true,
    bar: true,
  }
  const expected = {
    foo: true,
    bar: true,
  }
  assert({ actual, expected })
} catch (e) {
  throw new Error(`should not throw`)
}

try {
  const actual = {
    a: true,
  }
  const expected = {}
  assert({ actual, expected })
} catch (e) {
  ensureAssertionErrorWithMessage(
    e,
    `unexpected properties.
--- unexpected property names ---
"a"
--- at ---
value`,
  )
}

try {
  const actual = {}
  const expected = {
    a: true,
  }
  assert({ actual, expected })
} catch (e) {
  ensureAssertionErrorWithMessage(
    e,
    `missing properties.
--- missing property names ---
"a"
--- at ---
value`,
  )
}

try {
  const actual = {
    a: true,
    d: true,
    e: true,
  }
  const expected = {
    a: true,
    b: true,
    c: true,
  }
  assert({ actual, expected })
} catch (e) {
  ensureAssertionErrorWithMessage(
    e,
    `unexpected and missing properties.
--- unexpected property names ---
"d"
"e"
--- missing property names ---
"b"
"c"
--- at ---
value`,
  )
}

// ensure unequal properties is checked before unexpected property
// (because it gives more helpful error message)
try {
  const actual = {
    a: true,
  }
  const expected = {
    a: false,
    b: true,
  }
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
value.a`,
  )
}
