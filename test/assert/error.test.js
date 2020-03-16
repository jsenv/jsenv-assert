import { assert } from "../../index.js"
import { ensureAssertionErrorWithMessage } from "../ensureAssertionErrorWithMessage.js"
import { executeInNewContext } from "../executeInNewContext.js"

{
  const actual = new Error()
  const expected = new Error()
  assert({ actual, expected })
}

{
  const actual = await executeInNewContext("new Error()")
  const expected = await executeInNewContext("new Error()")
  assert({ actual, expected })
}

{
  const actual = await executeInNewContext("new Error()")
  const expected = new Error()
  // have to do this because source-maps-support install prepareStackTrace on Error
  if (Error.captureStackTrace) {
    actual.constructor.prepareStackTrace = Error.prepareStackTrace
  }
  // webkit adds this property for error coming from iframe
  if (actual.sourceURL) {
    delete actual.sourceURL
  }
  assert({ actual, expected })
}

{
  const actual = new Error()
  const expected = await executeInNewContext("new Error()")
  if (Error.captureStackTrace) {
    expected.constructor.prepareStackTrace = Error.prepareStackTrace
  }
  // webkit adds this property for error coming from iframe
  if (expected.sourceURL) {
    delete expected.sourceURL
  }
  assert({ actual, expected })
}

{
  const actual = new Error("foo")
  const expected = new Error("bar")
  try {
    assert({ actual, expected })
  } catch (e) {
    ensureAssertionErrorWithMessage(
      e,
      `unequal values.
--- found ---
"foo"
--- expected ---
"bar"
--- at ---
value.message`,
    )
  }
}

if (typeof global === "object") {
  const actual = new Error()
  const expected = new TypeError()
  try {
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
}

// beware test below because depending on node version
// Object.keys(Object.getPrototypeOf(new TypeError()))
// might differ. For instance node 8.5 returns name before constructor
// and node 8.9.0 returns constructor before name
if (typeof global === "object") {
  const actual = new Error()
  const expected = await executeInNewContext("new TypeError()")
  if (Error.captureStackTrace) {
    expected.constructor.prepareStackTrace = Error.prepareStackTrace
  }
  try {
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
}
