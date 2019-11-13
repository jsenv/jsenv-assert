import { assert } from "../../index.js"
import { ensureAssertionErrorWithMessage } from "../ensureAssertionErrorWithMessage.js"

try {
  const symbola = Symbol("a")
  const symbolb = Symbol("b")

  const actual = {
    [symbola]: true,
    [symbolb]: true,
  }
  const expected = {
    [symbola]: true,
    [symbolb]: true,
  }
  assert({ actual, expected })
} catch (e) {
  throw new Error(`should not throw`)
}

try {
  const symbola = Symbol("a")
  const symbolb = Symbol("b")

  const actual = {
    [symbolb]: true,
    [symbola]: true,
  }
  const expected = {
    [symbola]: true,
    [symbolb]: true,
  }
  assert({ actual, expected })
} catch (e) {
  ensureAssertionErrorWithMessage(
    e,
    `unexpected symbols order.
--- symbols order found ---
Symbol("b")
Symbol("a")
--- symbols order expected ---
Symbol("a")
Symbol("b")
--- at ---
value`,
  )
}
