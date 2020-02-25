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
window.Object.prototype
--- prototype expected ---
window.Array.prototype
--- at ---
value[[Prototype]]`,
  )
}
