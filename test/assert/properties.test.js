import { assert } from "@jsenv/assert"
import { ensureAssertionErrorWithMessage } from "@jsenv/assert/test/ensureAssertionErrorWithMessage.js"

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
    `1 unexpected property.
--- unexpected property ---
{
  "a": true
}
--- at ---
value`,
  )
}

try {
  const actual = {
    a: true,
    b: true,
  }
  const expected = {}
  assert({ actual, expected })
} catch (e) {
  ensureAssertionErrorWithMessage(
    e,
    `2 unexpected properties.
--- unexpected properties ---
{
  "a": true,
  "b": true
}
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
    `1 missing property.
--- missing property ---
{
  "a": true
}
--- at ---
value`,
  )
}

try {
  const actual = {}
  const expected = {
    a: true,
    b: true,
  }
  assert({ actual, expected })
} catch (e) {
  ensureAssertionErrorWithMessage(
    e,
    `2 missing properties.
--- missing properties ---
{
  "a": true,
  "b": true
}
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
    `2 missing properties and 2 unexpected properties.
--- missing properties ---
{
  "b": true,
  "c": true
}
--- unexpected properties ---
{
  "d": true,
  "e": true
}
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
  }
  assert({ actual, expected })
} catch (e) {
  ensureAssertionErrorWithMessage(
    e,
    `1 missing property and 2 unexpected properties.
--- missing property ---
{
  "b": true
}
--- unexpected properties ---
{
  "d": true,
  "e": true
}
--- at ---
value`,
  )
}

try {
  const actual = {
    a: true,
    d: true,
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
    `2 missing properties and 1 unexpected property.
--- missing properties ---
{
  "b": true,
  "c": true
}
--- unexpected property ---
{
  "d": true
}
--- at ---
value`,
  )
}

try {
  const actual = {
    a: true,
    d: true,
  }
  const expected = {
    a: true,
    b: true,
  }
  assert({ actual, expected })
} catch (e) {
  ensureAssertionErrorWithMessage(
    e,
    `1 missing property and 1 unexpected property.
--- missing property ---
{
  "b": true
}
--- unexpected property ---
{
  "d": true
}
--- at ---
value`,
  )
}

// ensure unequal properties is checked before unexpected property
// (because it gives more helpful error message)
try {
  const actual = {
    a: true,
    c: false,
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
