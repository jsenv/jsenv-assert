// eslint-disable-next-line import/no-unresolved
const { assert } = require("../../dist/commonjs/main.js")

assert({
  actual: { foo: false },
  expected: { foo: true },
})
