import vm from "vm"
import { assert } from "../../../index.js"
import { ensureAssertionErrorWithMessage } from "../../ensureAssertionErrorWithMessage.js"

try {
  const actual = vm.runInNewContext("new Error()")
  const expected = new Error()
  // have to do this because source-maps-support install prepareStackTrace on Error
  actual.constructor.prepareStackTrace = Error.prepareStackTrace
  assert({ actual, expected })
} catch (e) {
  throw new Error(`should not throw`)
}

try {
  const actual = new Error()
  const expected = vm.runInNewContext("new Error()")
  expected.constructor.prepareStackTrace = Error.prepareStackTrace
  assert({ actual, expected })
} catch (e) {
  throw new Error(`should not throw`)
}

try {
  const actual = vm.runInNewContext("new Error()")
  const expected = vm.runInNewContext("new Error()")
  assert({ actual, expected })
} catch (e) {
  throw new Error(`should not throw`)
}

try {
  const actual = new Error()
  const expected = new TypeError()
  assert({ actual, expected })
} catch (e) {
  ensureAssertionErrorWithMessage(
    e,
    `unequal prototypes.
--- prototype found ---
global.Error.prototype
--- prototype expected ---
global.TypeError.prototype
--- at ---
value[[Prototype]]`,
  )
}

// beware test below because depending on node version
// Object.keys(Object.getPrototypeOf(new TypeError()))
// might differ. For instance node 8.5 returns name before constructor
// and node 8.9.0 returns constructor before name
try {
  const actual = new Error()
  const expected = vm.runInNewContext("new TypeError()")
  expected.constructor.prepareStackTrace = Error.prepareStackTrace
  assert({ actual, expected })
} catch (e) {
  ensureAssertionErrorWithMessage(
    e,
    `unequal prototypes.
--- prototype found ---
global.Error.prototype
--- prototype expected ---
TypeError({
  "constructor": function () {/* hidden */},
  "name": "TypeError",
  "message": "",
  "toString": () => {/* hidden */}
})
--- at ---
value[[Prototype]]`,
  )
}
