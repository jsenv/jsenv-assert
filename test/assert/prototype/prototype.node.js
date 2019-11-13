import vm from "vm"
import { assert } from "../../../index.js"
import { ensureAssertionErrorWithMessage } from "../../ensureAssertionErrorWithMessage.js"

try {
  const actual = vm.runInNewContext("[]")
  const expected = []
  assert({ actual, expected })
} catch (e) {
  throw new Error(`should not throw`)
}

try {
  const actual = {}
  const expected = {}
  assert({ actual, expected })
} catch (e) {
  throw new Error(`should not throw`)
}

try {
  const actual = {}
  const expected = Object.create(null)
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

try {
  const ancestorPrototype = { ancestor: true }
  const directPrototype = Object.create(ancestorPrototype)
  directPrototype.direct = true

  const actual = Object.create(ancestorPrototype)
  const expected = Object.create(directPrototype)
  assert({ actual, expected })
} catch (e) {
  ensureAssertionErrorWithMessage(
    e,
    `unequal prototypes.
--- prototype found ---
{
  "ancestor": true
}
--- prototype expected ---
{
  "direct": true
}
--- at ---
value[[Prototype]]`,
  )
}

try {
  const ancestorAPrototype = { ancestorA: true }
  const ancestorBPrototype = { ancestorB: true }
  const childAPrototype = Object.create(ancestorAPrototype)
  childAPrototype.parentA = true
  const childBPrototype = Object.create(ancestorBPrototype)
  childBPrototype.parentB = true

  const actual = Object.create(childAPrototype)
  const expected = Object.create(childBPrototype)
  assert({ actual, expected })
} catch (e) {
  ensureAssertionErrorWithMessage(
    e,
    `unequal prototypes.
--- prototype found ---
{
  "parentA": true
}
--- prototype expected ---
{
  "parentB": true
}
--- at ---
value[[Prototype]]`,
  )
}
