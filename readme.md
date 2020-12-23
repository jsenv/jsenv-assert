# assert

Opinionated test assertion.

[![github package](https://img.shields.io/github/package-json/v/jsenv/jsenv-assert.svg?logo=github&label=package)](https://github.com/jsenv/jsenv-assert/packages)
[![npm package](https://img.shields.io/npm/v/@jsenv/assert.svg?logo=npm&label=package)](https://www.npmjs.com/package/@jsenv/assert)
[![github ci](https://github.com/jsenv/jsenv-assert/workflows/ci/badge.svg)](https://github.com/jsenv/jsenv-assert/actions?workflow=ci)
[![codecov coverage](https://codecov.io/gh/jsenv/jsenv-assert/branch/master/graph/badge.svg)](https://codecov.io/gh/jsenv/jsenv-assert)

# Table of contents

- [Presentation](#Presentation)
- [Installation](#Installation)
- [How it works](#How-it-works)
- [Why opinionated ?](#Why-opinionated-)
- [Properties order constraint](#Properties-order-constraint)
- [Flexible assertions](#Flexible-assertions)

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
npm install @jsenv/assert
```

## Browser usage

<details>
  <summary>Remote server using script type module</summary>

```html
<script type="module">
  import { assert } from "https://unpkg.com/@jsenv/assert@latest/dist/esmodule/main.js"
</script>
```

</details>

<details>
  <summary>Remote server using script</summary>

```html
<script src="https://unpkg.com/@jsenv/assert@latest/dist/global/main.js"></script>
<script>
  const { assert } = window.__jsenv_assert__
</script>
```

</details>

<details>
  <summary>From node modules using script type module</summary>

```html
<script type="module">
  import { assert } from "./node_modules/@jsenv/assert/dist/esmodule/main.js"
</script>
```

Or

```html
<script type="module">
  import { assert } from "@jsenv/assert"
</script>
```

> Using `@jsenv/assert` notation means something in your setup maps `"@jsenv/assert"` to `"./node_modules/@jsenv/assert/index.js"`. Something like [import maps](https://github.com/WICG/import-maps), or webpack for instance.

</details>

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

## Successful comparison examples

Various code examples where comparison between `actual` and `expected` is successful (it does not throw).

<details>
  <summary>dates</summary>

```js
import { assert } from "@jsenv/assert"

const actual = new Date()
const expected = new Date()

assert({ actual, expected })
```

</details>

<details>
  <summary>errors</summary>

```js
import { assert } from "@jsenv/assert"

const actual = new Error("message")
const expected = new Error("message")

assert({ actual, expected })
```

</details>

<details>
  <summary>object without prototypes</summary>

```js
import { assert } from "@jsenv/assert"

const actual = Object.create(null)
const expected = Object.create(null)

assert({ actual, expected })
```

</details>

<details>
  <summary>regular expressions</summary>

```js
import { assert } from "@jsenv/assert"

const actual = /ok/
const expected = /ok/

assert({ actual, expected })
```

</details>

## Failing comparison examples

Various code examples where comparison between `actual` and `expected` is failing. Each code example is followed with the console output.

<details>
  <summary>Failing on value</summary>

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

</details>

<details>
  <summary>Failing on prototype</summary>

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

</details>

<details>
  <summary>Failing on property value</summary>

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

</details>

<details>
  <summary>Failing on properties order</summary>

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

</details>

<details>
  <summary>Failing on property configurability</summary>

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

</details>

# Why opinionated ?

As shown `assert` is strict on `actual` / `expected` comparison. It is designed like this to make test fails if something subtle changes. Any subtle change in code might break things relying on it. You need that level of precision by default to ensure your code cannot introduce regression.

# Properties order constraint

The strongest contraints is that actual and expected must have the same properties order.

<details>
<summary>Properties order code example</summary>

```js
Object.keys({
  foo: true,
  bar: true,
})[0] // "foo"

Object.keys({
  bar: true,
  foo: true,
})[0] // "bar"
```

</details>

In general code does not rely on properties order but sometimes it's crucial.

# Flexible assertions

Some tests requires flexibility in the assertions. In that case you can use patterns documented in this part. But before showing those example, one opinion I would like to share: Ideally, there would be only one assertion.

One assertion to test everything is a simple rule, simple to follow, simple to understand. It will increase efficiency and prevent [bikeshedding](https://en.wiktionary.org/wiki/bikeshedding) (If you really think too much you can even bikeshed yourself).

> equal() is my favorite assertion. If the only available assertion in every test suite was equal(), almost every test suite in the world would be better for it.
> — Eric Elliot in [Rethinking Unit Test Assertion](https://medium.com/javascript-scene/rethinking-unit-test-assertions-55f59358253f)

That being said `@jsenv/assert` has two other assertions than can be used: `assert.any` and `assert.not`. They exists mostly because they are useful enough to potentially counterbalance the simplicity of using only one assertion.

> Personally, I tend to use only `assert` because having only on way of doing things make things easier for my brain. And I care more about this than saving lines of code in a test file.

For that reason code examples that will follow have two sections:

- First one shows how to write assertion using `assert`
- Second one shows the equivalent using `assert.any` or `assert.not`.

## Assert any value of a given type

Let's say you have a function returning a user.

```js
export const createUser = () => {
  return {
    name: "john",
    creationTime: Date.now(),
  }
}
```

You cannot control the user creationTime easily so you just want to ensure it's a number.

<details>
  <summary>using <code>assert</code></summary>

```js
import { createUser } from "./user.js"

const user = createUser()

// assert user shape is correct being flexible on creationTime
{
  const actual = user
  const expected = {
    name: "john",
    creationTime: actual.creationTime,
  }
  assert({ actual, expected })
}
// then assert user.creationTime is a number
{
  const actual = typeof user.creationTime
  const expected = "number"
  assert({ actual, expected })
}
```

</details>

<details>
  <summary>using <code>assert.any</code></summary>

```js
import { createUser } from "./user.js"

const user = createUser()
const actual = user
const expected = {
  whatever: 42,
  creationTime: assert.any(Number),
}
assert({ actual, expected })
```

</details>

## Assert an other value

Let's say you have a function returning a random user name that must not be the current user name. Here we don't care about the value itself. What is important is to test it's not an other value.

```js
export const getRandomDifferentUserName = (user) => {
  const randomName = getRandomName()
  if (randomName === user.name) {
    return getRandomDifferentUserName(user)
  }
  return randomName
}

const getRandomName = () => {
  return Array.from({ length: 4 })
    .map(() => getRandomLetter())
    .join("")
}

const getRandomLetter = () => {
  return ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length))
}

const ALPHABET = "abcdefghijklmnopqrstuvwxyz"
```

<details>
  <summary>using <code>assert</code></summary>

```js
import { assert } from "@jsenv/assert"
import { getRandomDifferentUserName } from "./user.js"

const name = getRandomDifferentUserName({ name: "toto" })
const actual = name !== "toto"
const expected = true
assert({ actual, expected })
```

</details>

<details>
  <summary>using <code>assert.not</code></summary>

```js
import { assert } from "@jsenv/assert"
import { getRandomDifferentUserName } from "./user.js"

const actual = getRandomDifferentUserName({ name: "toto" })
const expected = assert.not("toto")
assert({ actual, expected })
```

</details>

## Assert without property order constraint

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

## Assert subset of properties

You have an object and you care only about a part of it.

In that case recreate a lighter object with less properties (only the one you care about).

```js
// assuming you care only about bar and foo.
// if there is more properties it's not important
const value = { foo: true, bar: true, whatever: 42 }
// make actual an object with only bar and foo
const actual = { bar: value.bar, foo: value.foo }
const expected = { bar: true, foo: true }
assert({ actual, expected })
```
