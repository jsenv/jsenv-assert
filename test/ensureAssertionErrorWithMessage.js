import { isAssertionError } from "../index.js"

export const ensureAssertionErrorWithMessage = (value, message) => {
  if (!isAssertionError(value)) {
    throw new Error(`assertionError expected, got ${value.stack}`)
  }
  if (value.message !== message) {
    throw new Error(`unequal assertionError message.
--- message ---
${value.message}
--- expected message ---
${message}`)
  }
}
