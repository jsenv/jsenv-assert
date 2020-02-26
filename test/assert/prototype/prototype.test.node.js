import vm from "vm"
import { assert } from "../../../index.js"
import { ensureAssertionErrorWithMessage } from "../../ensureAssertionErrorWithMessage.js"

{
  const actual = vm.runInNewContext("[]")
  const expected = []
  assert({ actual, expected })
}

{
  const actual = {}
  const expected = Object.create(null)
  try {
    assert({ actual, expected })
  } catch (e) {
    ensureAssertionErrorWithMessage(
      e,
      `unequal prototypes.
--- prototype found ---
global.Object.prototype
--- prototype expected ---
null
--- at ---
value[[Prototype]]`,
    )
  }
}

try {
  const actual = {
    value: Object.create(null),
  }
  const expected = {
    value: {},
  }
  assert({ actual, expected })
} catch (e) {
  ensureAssertionErrorWithMessage(
    e,
    `unequal prototypes.
--- prototype found ---
null
--- prototype expected ---
global.Object.prototype
--- at ---
value.value[[Prototype]]`,
  )
}

try {
  const prototype = {}
  const actual = prototype
  const expected = Object.create(prototype)
  assert({ actual, expected })
} catch (e) {
  ensureAssertionErrorWithMessage(
    e,
    `unequal prototypes.
--- prototype found ---
global.Object.prototype
--- prototype expected ---
actual
--- at ---
value[[Prototype]]`,
  )
}

try {
  const prototype = {}
  const actual = Object.create(prototype)
  const expected = prototype
  assert({ actual, expected })
} catch (e) {
  ensureAssertionErrorWithMessage(
    e,
    `unequal prototypes.
--- prototype found ---
expected
--- prototype expected ---
global.Object.prototype
--- at ---
value[[Prototype]]`,
  )
}

try {
  const prototype = null
  const actual = {}
  const expected = Object.create(prototype)
  assert({ actual, expected })
} catch (e) {
  ensureAssertionErrorWithMessage(
    e,
    `unequal prototypes.
--- prototype found ---
global.Object.prototype
--- prototype expected ---
null
--- at ---
value[[Prototype]]`,
  )
}
