# assert

Opinionated test assertion.

[![github package](https://img.shields.io/github/package-json/v/jsenv/jsenv-assert.svg?logo=github&label=package)](https://github.com/jsenv/jsenv-assert/packages)
[![npm package](https://img.shields.io/npm/v/@jsenv/assert.svg?logo=npm&label=package)](https://www.npmjs.com/package/@jsenv/assert)
[![github ci](https://github.com/jsenv/jsenv-assert/workflows/ci/badge.svg)](https://github.com/jsenv/jsenv-assert/actions?workflow=ci)
[![codecov coverage](https://codecov.io/gh/jsenv/jsenv-assert/branch/master/graph/badge.svg)](https://codecov.io/gh/jsenv/jsenv-assert)

# Table of contents

- [Presentation](#Presentation)
- [Installation](#Installation)
  - [Browser usage](#Browser-usage)
  - [Node usage](#Node-usage)
- [How it works](#How-it-works)
- [Successfull comparison examples](#Successfull-comparison-examples)
- [Failing comparison examples](#Failing-comparison-examples)
  - [Failing on value](#Failing-on-value)
  - [Failing on prototype](#Failing-on-prototype)
  - [Failing on property value](#Failing-on-property-value)
  - [Failing on properties order](#Failing-on-properties-order)
  - [Failing on property configurability](#Failing-on-property-configurability)
- [Why opinionated ?](#Why-opinionated-)
  - [Properties order constraint](#Properties-order-constraint)
  - [Flexible assertions](#Flexible-assertions)
    - [Assert any value of a given type](#Assert-any-value-of-a-given-type)
    - [Assert an other value](#Assert-an-other-value)
    - [Assert without property order constraint](Assert-without-property-order-constraint)

# Presentation

`@jsenv/assert` compare two values with extreme accuracy. If values differ, an error is thrown with a readable message.
`@jsenv/assert` helps you to know if the `actual` value produced in a test matches what you `expected`.

```js
import { assert } from "@jsenv/assert"

const actual = { foo: false }
const expected = { foo: true }
assert({ actual, expected })
```

![node terminal screenshot](./docs/node-example/node-terminal-screenshot.png)

# Installation

```console
npm install @jsenv/assert@2.0.2
```

## Browser usage

From a remote server.

```html
<script type="module">
  import { assert } from "https://unpkg.com/@jsenv/assert@latest/dist/esmodule/main.js"
</script>
```

From a remote server with basic script tag.

```html
<script src="https://unpkg.com/@jsenv/assert@latest/dist/global/main.js"></script>
<script>
  const { assert } = window.__jsenv_assert__
</script>
```

From your node_modules.

```html
<script type="module">
  import { assert } from "./node_modules/@jsenv/assert/dist/esmodule/main.js"
</script>
```

From your node_modules with bare specifier.

```js
import { assert } from "@jsenv/assert"
```

You need to execute your code with something capable to consume esmodule and resolve node module bare specifiers. Something that searches at `"./node_modules/@jsenv/assert/index.js"` for `import "@jsenv/assert"'`. rollup or webpack can do this for instance.

— see also https://jsenv.github.io/jsenv-assert/browser-interactive-example/browser-interactive-example.html.

## Node usage

```js
import { assert } from "@jsenv/assert"
```

Or for node < 13

```js
const { assert } = require("@jsenv/assert")
```

— see also https://jsenv.github.io/jsenv-assert/node-interactive-example/node-interactive-example.html

# How it works

`assert` does nothing when `actual` and `expected` comparison is successfull.<br />
`assert` throw an error if `actual` and `expected` comparison is failing.

`actual` and `expected` can be different objects but they must deeply look alike in every aspects possible in JavaScript.

To better understand if comparison will fail or not let's see some successfull comparison first and some failing comparisons afterwards.

# Successfull comparison examples

```js
import { assert } from "@jsenv/assert"

// dates
{
  const actual = new Date()
  const expected = new Date()

  assert({ actual, expected })
}

// errors
{
  const actual = new Error("message")
  const expected = new Error("message")

  assert({ actual, expected })
}

// objects without prototype
{
  const actual = Object.create(null)
  const expected = Object.create(null)

  assert({ actual, expected })
}

// regexps
{
  const actual = /ok/
  const expected = /ok/

  assert({ actual, expected })
}
```

# Failing comparison examples

Various code examples where comparison between `actual` and `expected` is failing.<br />
Each code example is followed with the console output.

## Failing on value

```js
import { assert } from "@jsenv/assert"

const actual = 10
const expected = "10"

try {
  assert({ actual, expected })
} catch (e) {
  console.log(e.message)
}
```

Console output

```console
AssertionError: unequal values.
--- found ---
10
--- expected ---
"10"
--- at ---
value
```

## Failing on prototype

```js
import { assert } from "@jsenv/assert"

const actual = new TypeError()
const expected = new Error()

try {
  assert({ actual, expected })
} catch (e) {
  console.log(e.message)
}
```

Console output

```console
AssertionError: unequal prototypes.
--- prototype found ---
window.TypeError.prototype
--- prototype expected ---
window.Error.prototype
--- at ---
value[[Prototype]]
```

## Failing on property value

```js
import { assert } from "@jsenv/assert"

const actual = { foo: true }
const expected = { foo: false }

try {
  assert({ actual, expected })
} catch (e) {
  console.log(e.message)
}
```

Console output

```console
AssertionError: unequal values.
--- found ---
true
--- expected ---
false
--- at ---
value.foo
```

## Failing on properties order

```js
import { assert } from "@jsenv/assert"

const actual = { foo: true, bar: true }
const expected = { bar: true, foo: true }

try {
  assert({ actual, expected })
} catch (e) {
  console.log(e.message)
}
```

Console output

```console
AssertionError: unexpected properties order.
--- properties order found ---
"foo"
"bar"
--- properties order expected ---
"bar"
"foo"
--- at ---
value
```

## Failing on property configurability

```js
import { assert } from "@jsenv/assert"

const actual = Object.defineProperty({}, "answer", { value: 42 })
const expected = { answer: 42 }

try {
  assert({ actual, expected })
} catch (e) {
  console.log(e.message)
}
```

Console output

```console
AssertionError: unequal values.
--- found ---
"non-configurable"
--- expected ---
"configurable"
--- at ---
value.answer[[Configurable]]
```

# Why opinionated ?

As shown `assert` is strict on `actual` / `expected` comparison. It is designed to make test fails if something subtle changes. Any subtle change in code might break things relying on it. You need that level of precision by default to ensure your code does not break a given contract.

> Contract example: calling function named `whatever` returns value `{ answer: 42 }`.

## Properties order constraint

The strongest contraints is that actual and expected must have the same properties order. If a function suddenly changes object properties order it could break things relying on it.

```js
const createSomething = () => {
  return {
    foo: true,
    bar: true,
  }
}

Object.keys(createSomething())[0] // "foo"

// if you change createSomething to return an object with different property order

const createSomething2 = () => {
  return {
    bar: true,
    foo: true,
  }
}

Object.keys(createSomething2())[0] // "bar"
```

In general code does not rely on properties order but it might be crucial.

## Flexible assertions

Some tests requires flexibility in the assertions. In that case you can use `assert.any`, `assert.not` or pattern documented below.

However helpers such as `assert.any` and `assert.not` comes with a cost: they are a new way of doing things. It means you need to learn them and decide when to use them. Because of this, every scenario comes with an **assert only solution**. These solution involves standard JavaScript and `assert` only to get the level of flexibility required.

### Assert any value of a given type

Let's say you have a `createSomething` function. You cannot control creationTime easily so you just want to ensure it's a number.

```js
export const createSomething = () => {
  return {
    whatever: 42,
    creationTime: Date.now(),
  }
}
```

You can test it using `assert.any`:

```js
import { createSomething } from "./something.js"

{
  const actual = createSomething()
  const expected = {
    whatever: 42,
    token: assert.any(Number),
  }
  assert({ actual, expected })
}
```

Or using only `assert`:

```js
import { createSomething } from "./something.js"

const something = createSomething()

// first assert something looks correct being flexible on user.token
{
  const actual = user
  const expected = {
    whatever: 42,
    creationTime: something.creationTime,
  }
  assert({ actual, expected })
}
// then assert something.creationTime is a number
{
  const actual = typeof something.creationTime
  const expected = "number"
  assert({ actual, expected })
}
```

### Assert an other value

You have a value and you want to test that it's not an other value.

You can test this using `assert.not`:

```js
// value is produced by an external function and you just want to assert it's not 42
const value = 41
const actual = value
const expected = assert.not(42)
assert({ actual, expected })
```

Or using only `assert`:

```js
const value = 41
const actual = value !== 42
const expected = true
assert({ actual, expected })
```

### Assert without property order constraint

You have an object and you don't care about the object properties order.

In that case force the object property order by recreating it.

```js
// assuming you don't care about properties order
const value = { foo: true, bar: true }
// make actual an object with your own property order
const actual = { bar: value.bar, foo: value.foo }
const expected = { bar: true, foo: true }
assert({ actual, expected })
```
