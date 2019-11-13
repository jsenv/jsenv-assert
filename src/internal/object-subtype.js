import { somePrototypeMatch } from "./somePrototypeMatch.js"

export const isRegExp = (value) =>
  somePrototypeMatch(value, ({ constructor }) => constructor && constructor.name === "RegExp")

export const isArray = (value) =>
  somePrototypeMatch(value, ({ constructor }) => constructor && constructor.name === "Array")

export const isError = (value) =>
  somePrototypeMatch(value, ({ constructor }) => constructor && constructor.name === "Error")

export const isSet = (value) =>
  somePrototypeMatch(value, ({ constructor }) => constructor && constructor.name === "Set")

export const isMap = (value) =>
  somePrototypeMatch(value, ({ constructor }) => constructor && constructor.name === "Map")
