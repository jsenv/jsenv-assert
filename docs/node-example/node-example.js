// eslint-disable-next-line import/no-unresolved
const { assert } = require("../../dist/commonjs/main.js")

const actual = { foo: false }
const expected = { foo: true }
assert({ actual, expected })
