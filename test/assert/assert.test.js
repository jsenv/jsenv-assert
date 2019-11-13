import { assert } from "../../index.js"
import { ensureErrorWithMessage } from "../ensureErrorWithMessage.js"

try {
  assert()
  throw new Error("should throw")
} catch (e) {
  if (e.message === "should throw") throw e
  ensureErrorWithMessage(e, `assert must be called with exactly 1 argument, received 0 arguments`)
}

try {
  assert(true, false)
  throw new Error("should throw")
} catch (e) {
  if (e.message === "should throw") throw e
  ensureErrorWithMessage(e, `assert must be called with exactly 1 argument, received 2 arguments`)
}

try {
  assert(null)
  throw new Error("should throw")
} catch (e) {
  if (e.message === "should throw") throw e
  ensureErrorWithMessage(e, `assert first argument must be an object, received null`)
}

try {
  assert({ expected: undefined })
  throw new Error("should throw")
} catch (e) {
  if (e.message === "should throw") throw e
  ensureErrorWithMessage(e, `assert first argument must have an actual property`)
}

try {
  assert({ actual: undefined })
  throw new Error("should throw")
} catch (e) {
  if (e.message === "should throw") throw e
  ensureErrorWithMessage(e, `assert first argument must have an expected property`)
}
