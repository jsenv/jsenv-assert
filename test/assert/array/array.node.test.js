import { assert } from "../../../index.js"
import { ensureAssertionErrorWithMessage } from "../../ensureAssertionErrorWithMessage.js"

try {
  const actual = {}
  const expected = []
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
