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
- [Examples](#Examples)

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

## Properties order constraint

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

## One assertion to test everything

In the [Examples](#Examples) part we'll see how of `assert` can be used to test what you need to. But before that, one opinion I would like to share: Ideally, there would be only one assertion.

One assertion to test everything is a simple rule, simple to follow, simple to understand. It will increase efficiency and prevent [bikeshedding](https://en.wiktionary.org/wiki/bikeshedding) (If you really think too much you can even bikeshed yourself).

> equal() is my favorite assertion. If the only available assertion in every test suite was equal(), almost every test suite in the world would be better for it.
> — Eric Elliot in [Rethinking Unit Test Assertion](https://medium.com/javascript-scene/rethinking-unit-test-assertions-55f59358253f)

That being said `@jsenv/assert` has two other assertions than can be used: `assert.any` and `assert.not`. They exists mostly because they are useful enough to potentially counterbalance the simplicity of using only one assertion.

> Personally, I tend to use only `assert` because having only on way of doing things make things easier for my brain. And I care more about this than saving lines of code in a test file.

## AAA pattern

The AAA pattern stands for Act, Arrange, Assert. It's used implicitely in code examples. This pattern is referenced as recommendation 4.3 in Node.js best practices.

> Structure your tests with 3 well-separated sections: Arrange, Act & Assert (AAA).
>
> — Yoni Goldberg in [Structure tests by the AAA pattern](https://github.com/goldbergyoni/nodebestpractices/blob/061bd10c2a4e2ba3407d9e1205b0fe702ef82b57/sections/testingandquality/aaa.md)

You can also check the following medium article for an other point of view.

> The AAA (Arrange-Act-Assert) pattern has become almost a standard across the industry.
>
> — Paulo Gomes in [Unit Testing and the Arrange, Act and Assert (AAA) Pattern](https://medium.com/@pjbgf/title-testing-code-ocd-and-the-aaa-pattern-df453975ab80)

# Examples

This part gives illustrates how `assert` can be used in common use cases.

## Assert a function throws

<details>
  <summary>description</summary>

You have a function throwing an error in certain cistumstances. You want to reproduce this scenario and test how that function throws.

```js
export const getCircleArea = (circleRadius) => {
  if (isNaN(circleRadius)) {
    throw new TypeError(`circleRadius must be a number, received ${circleRadius}`)
  }
  return circleRadius * circleRadius * Math.PI
}
```

</details>

<details>
  <summary>implementation</summary>

```js
import { assert } from "@jsenv/assert"
import { getCircleArea } from "./circle.js"

try {
  getCircleArea("toto")
  throw new Error("should throw")
} catch (error) {
  const actual = error
  const expected = new TypeError(`circleRadius must be a number, received toto`)
  assert({ actual, expected })
}
```

If `getCircleArea` was an `async` function, you could use `await`.

```js
import { assert } from "@jsenv/assert"
import { getCircleArea } from "./circle.js"

try {
  await getCircleArea("toto")
  throw new Error("should throw")
} catch (error) {
  const actual = error
  const expected = new TypeError(`circleRadius must be a number, received toto`)
  assert({ actual, expected })
}
```

</details>

## Assert a callback is called

<details>
  <summary>description</summary>

You want to test that, under certain circumstances, a function will be called.

```js
export const createAbortSignal = () => {
  return {
    onabort: () => {},
    abort: () => {
      onabort()
    },
  }
}
```

Here you want to test that if you create an `abortSignal` and do `abortSignal.abort`, `abortSignal.onabort` is called.

</details>

<details>
  <summary>implementation</summary>

> This code is a great example of the [AAA pattern](#AAA-pattern).

```js
import { assert } from "@jsenv/assert"
import { createAbortSignal } from "./abort-signal.js"

// arrange
const abortSignal = createAbortSignal()
let called = false
abortSignal.onabort = () => {
  called = true
}

// act
abortSignal.abort()

// assert
const actual = called
const expected = true
assert({ actual, expected })
```

</details>

## Assert something should happen

<details>
  <summary>description</summary>

You need to test that something should happen but you don't have the control to make it happen immediatly or in at an exact point in time.

```js
export const callAfter50Ms = (callback) => {
  setTimeout(callback, 50)
}
```

</details>

<details>
  <summary>implementation</summary>

In this scenario you might be tempted to mock `setTimeout`. Doing this make unit test complex and too tied with the code under test. Mocks should be avoided when possible. By waiting several ms, code is testing more accurately what happens.

```js
import { assert } from "@jsenv/assert"
import { callAfter50Ms } from "./call-me-maybe.js"

let called = false
callAfter50Ms(() => {
  called = true
})

await new Promise((resolve) => setTimeout(resolve, 80)) // wait a bit more than 50ms

const actual = called
const expected = true
assert({ actual, expected })
```

</details>

## Assert any value of a given type

<details>
  <summary>description</summary>

Let's say you have a function returning a user.

```js
export const createUser = () => {
  return {
    name: "sam",
    creationTime: Date.now(),
  }
}
```

You cannot control the user `creationTime` easily so you just want to ensure it's a number.

</details>

<details>
  <summary>implementation</summary>

```js
import { createUser } from "./user.js"

const user = createUser()

// assert user shape is correct being flexible on creationTime
{
  const actual = user
  const expected = {
    name: "sam",
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

> You can also use `assert.any` but consider [One assertion to test everything](#One-assertion-to-test-everything) before using `assert.any`.

```js
import { assert } from "@jsenv/assert"
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

<details>
  <summary>description</summary>

You have a function returning a random user name that must not be the current user name. Here we don't care about the value itself. What is important is to test it's not an other value.

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

</details>

<details>
  <summary>implementation</summary>

```js
import { assert } from "@jsenv/assert"
import { getRandomDifferentUserName } from "./user.js"

const name = getRandomDifferentUserName({ name: "toto" })
const actual = name !== "toto"
const expected = true
assert({ actual, expected })
```

You can also use `assert.not` but consider [One assertion to test everything](#One-assertion-to-test-everything) before using `assert.not`.

```js
import { assert } from "@jsenv/assert"
import { getRandomDifferentUserName } from "./user.js"

const actual = getRandomDifferentUserName({ name: "toto" })
const expected = assert.not("toto")
assert({ actual, expected })
```

</details>

## Assert without property order constraint

<details>
  <summary>description</summary>

You have an object and you don't care about the object properties order.

```js
export const getUser = () => {
  return {
    name: "sam",
    age: 32,
  }
}
```

</details>

<details>
  <summary>implementation</summary>

In that case force the object property order by recreating it.

```js
import { assert } from "@jsenv/assert"
import { getUser } from "./user.js"

// assuming you don't care about properties order
const user = getUser()
// make actual an object with your own property order
const actual = { age: user.age, name: user.name }
const expected = { age: 32, name: "sam" }
assert({ actual, expected })
```

</details>

## Assert subset of properties

<details>
  <summary>description</summary>

You have an object and you care only about a part of it.

```js
export const getUser = () => {
  return {
    name: "sam",
    age: 32,
    friends: [], // poor sam :(
  }
}
```

Let's assume the important thing to test about `getUser` is
the `name` and `age` properties returned on the object.

</details>

<details>
  <summary>implementation</summary>

In that case recreate a lighter object with less properties (only the one you care about).

```js
import { assert } from "@jsenv/assert"
import { getUser } from "./user.js"

// assuming you care only about name and age
const user = getUser()
// make actual an object with only name and age
const actual = { name: user.name, age: user.age }
const expected = { name: "sam", age: 32 }
assert({ actual, expected })
```

</details>
