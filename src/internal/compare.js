/* eslint-disable no-use-before-define */
import { isPrimitive } from "./isComposite.js"
import { findPreviousComparison } from "./findPreviousComparison.js"
import { isSet, isMap, isRegExp, isError, isArray } from "./object-subtype.js"

export const compare = ({ actual, expected }) => {
  const comparison = createComparison({ type: "root", actual, expected })
  comparison.failed = !defaultComparer(comparison)
  return comparison
}

const createComparison = ({ type, data, actual, expected, parent = null, children = [] }) => {
  const comparison = {
    type,
    data,
    actual,
    expected,
    parent,
    children,
  }
  return comparison
}

const defaultComparer = (comparison) => {
  const { actual, expected } = comparison

  if (isPrimitive(expected) || isPrimitive(actual)) {
    compareIdentity(comparison)
    return !comparison.failed
  }

  const expectedReference = findPreviousComparison(
    comparison,
    (referenceComparisonCandidate) =>
      referenceComparisonCandidate !== comparison &&
      referenceComparisonCandidate.expected === comparison.expected,
  )
  if (expectedReference) {
    if (expectedReference.actual === comparison.actual) {
      subcompare(comparison, {
        type: "reference",
        actual: expectedReference,
        expected: expectedReference,
        comparer: () => true,
      })
      return true
    }
    subcompare(comparison, {
      type: "reference",
      actual: findPreviousComparison(
        comparison,
        (referenceComparisonCandidate) =>
          referenceComparisonCandidate !== comparison &&
          referenceComparisonCandidate.actual === comparison.actual,
      ),
      expected: expectedReference,
      comparer: ({ actual, expected }) => actual === expected,
    })
    if (comparison.failed) return false
    // if we expectedAReference and it did not fail, we are done
    // this expectation was already compared and comparing it again
    // would cause infinite loop
    return true
  }

  const actualReference = findPreviousComparison(
    comparison,
    (referenceComparisonCandidate) =>
      referenceComparisonCandidate !== comparison &&
      referenceComparisonCandidate.actual === comparison.actual,
  )
  if (actualReference) {
    subcompare(comparison, {
      type: "reference",
      actual: actualReference,
      expected: null,
      comparer: () => false,
    })
    return false
  }

  compareIdentity(comparison)
  // actual === expected, no need to compare prototype, properties, ...
  if (!comparison.failed) return true
  comparison.failed = false

  comparePrototype(comparison)
  if (comparison.failed) return false

  compareIntegrity(comparison)
  if (comparison.failed) return false

  compareExtensibility(comparison)
  if (comparison.failed) return false

  comparePropertiesDescriptors(comparison)
  if (comparison.failed) return false

  compareProperties(comparison)
  if (comparison.failed) return false

  compareSymbolsDescriptors(comparison)
  if (comparison.failed) return false

  compareSymbols(comparison)
  if (comparison.failed) return false

  if (typeof Set === "function" && isSet(expected)) {
    compareSetEntries(comparison)
    if (comparison.failed) return false
  }

  if (typeof Map === "function" && isMap(expected)) {
    compareMapEntries(comparison)
    if (comparison.failed) return false
  }

  if ("valueOf" in expected && typeof expected.valueOf === "function") {
    // always keep this one after properties because we must first ensure
    // valueOf is on both actual and expected
    // usefull because new Date(10).valueOf() === 10
    // or new Boolean(true).valueOf() === true
    compareValueOfReturnValue(comparison)
    if (comparison.failed) return false
  }

  // required otherwise assert({ actual: /a/, expected: /b/ }) would not throw
  if (isRegExp(expected)) {
    compareToStringReturnValue(comparison)
    if (comparison.failed) return false
  }

  return true
}

const subcompare = (comparison, { type, data, actual, expected, comparer = defaultComparer }) => {
  const subcomparison = createComparison({ type, data, actual, expected, parent: comparison })
  comparison.children.push(subcomparison)
  subcomparison.failed = !comparer(subcomparison)
  comparison.failed = subcomparison.failed
  return subcomparison
}

const compareIdentity = (comparison) => {
  const { actual, expected } = comparison
  subcompare(comparison, {
    type: "identity",
    actual,
    expected,
    comparer: () => {
      if (Object.is(expected, -0)) {
        return Object.is(actual, -0)
      }
      if (Object.is(actual, -0)) {
        return Object.is(expected, -0)
      }
      return actual === expected
    },
  })
}

const comparePrototype = (comparison) => {
  subcompare(comparison, {
    type: "prototype",
    actual: Object.getPrototypeOf(comparison.actual),
    expected: Object.getPrototypeOf(comparison.expected),
  })
}

const compareExtensibility = (comparison) => {
  subcompare(comparison, {
    type: "extensibility",
    actual: Object.isExtensible(comparison.actual) ? "extensible" : "non-extensible",
    expected: Object.isExtensible(comparison.expected) ? "extensible" : "non-extensible",
    comparer: ({ actual, expected }) => actual === expected,
  })
}

// https://tc39.github.io/ecma262/#sec-setintegritylevel
const compareIntegrity = (comparison) => {
  subcompare(comparison, {
    type: "integrity",
    actual: getIntegriy(comparison.actual),
    expected: getIntegriy(comparison.expected),
    comparer: ({ actual, expected }) => actual === expected,
  })
}

const getIntegriy = (value) => {
  if (Object.isFrozen(value)) return "frozen"
  if (Object.isSealed(value)) return "sealed"
  return "none"
}

const compareProperties = (comparison) => {
  const { actual, expected } = comparison

  const expectedPropertyNames = Object.getOwnPropertyNames(expected)
  const actualPropertyNames = Object.getOwnPropertyNames(actual)
  const actualMissing = expectedPropertyNames.filter(
    (name) => actualPropertyNames.indexOf(name) === -1,
  )
  const actualExtra = actualPropertyNames.filter(
    (name) => expectedPropertyNames.indexOf(name) === -1,
  )
  const expectedMissing = []
  const expectedExtra = []

  subcompare(comparison, {
    type: "properties",
    actual: { missing: actualMissing, extra: actualExtra },
    expected: { missing: expectedMissing, extra: expectedExtra },
    comparer: () => actualMissing.length === 0 && actualExtra.length === 0,
  })
  if (comparison.failed) return

  subcompare(comparison, {
    type: "properties-order",
    actual: actualPropertyNames,
    expected: expectedPropertyNames,
    comparer: () =>
      expectedPropertyNames.every((name, index) => name === actualPropertyNames[index]),
  })
}

const compareSymbols = (comparison) => {
  const { actual, expected } = comparison

  const expectedSymbols = Object.getOwnPropertySymbols(expected)
  const actualSymbols = Object.getOwnPropertySymbols(actual)
  const actualMissing = expectedSymbols.filter((symbol) => actualSymbols.indexOf(symbol) === -1)
  const actualExtra = actualSymbols.filter((symbol) => expectedSymbols.indexOf(symbol) === -1)
  const expectedMissing = []
  const expectedExtra = []

  subcompare(comparison, {
    type: "symbols",
    actual: { missing: actualMissing, extra: actualExtra },
    expected: { missing: expectedMissing, extra: expectedExtra },
    comparer: () => actualMissing.length === 0 && actualExtra.length === 0,
  })
  if (comparison.failed) return

  subcompare(comparison, {
    type: "symbols-order",
    actual: actualSymbols,
    expected: expectedSymbols,
    comparer: () => expectedSymbols.every((symbol, index) => symbol === actualSymbols[index]),
  })
}

const comparePropertiesDescriptors = (comparison) => {
  const { expected } = comparison
  const expectedPropertyNames = Object.getOwnPropertyNames(expected)
  // eslint-disable-next-line no-unused-vars
  for (const expectedPropertyName of expectedPropertyNames) {
    comparePropertyDescriptor(comparison, expectedPropertyName, expected)
    if (comparison.failed) break
  }
}

const compareSymbolsDescriptors = (comparison) => {
  const { expected } = comparison
  const expectedSymbols = Object.getOwnPropertySymbols(expected)
  // eslint-disable-next-line no-unused-vars
  for (const expectedSymbol of expectedSymbols) {
    comparePropertyDescriptor(comparison, expectedSymbol, expected)
    if (comparison.failed) break
  }
}

const comparePropertyDescriptor = (comparison, property, owner) => {
  const { actual, expected } = comparison

  const expectedDescriptor = Object.getOwnPropertyDescriptor(expected, property)
  const actualDescriptor = Object.getOwnPropertyDescriptor(actual, property)
  if (!actualDescriptor) return

  const configurableComparison = subcompare(comparison, {
    type: "property-configurable",
    data: property,
    actual: actualDescriptor.configurable ? "configurable" : "non-configurable",
    expected: expectedDescriptor.configurable ? "configurable" : "non-configurable",
    comparer: ({ actual, expected }) => actual === expected,
  })
  if (configurableComparison.failed) return

  const enumerableComparison = subcompare(comparison, {
    type: "property-enumerable",
    data: property,
    actual: actualDescriptor.enumerable ? "enumerable" : "non-enumerable",
    expected: expectedDescriptor.enumerable ? "enumerable" : "non-enumerable",
    comparer: ({ actual, expected }) => actual === expected,
  })
  if (enumerableComparison.failed) return

  const writableComparison = subcompare(comparison, {
    type: "property-writable",
    data: property,
    actual: actualDescriptor.writable ? "writable" : "non-writable",
    expected: expectedDescriptor.writable ? "writable" : "non-writable",
    comparer: ({ actual, expected }) => actual === expected,
  })
  if (writableComparison.failed) return

  if (isError(owner)) {
    // error stack always differ, ignore it
    if (property === "stack") return
  }

  if (typeof owner === "function") {
    // function caller could differ but we want to ignore that
    if (property === "caller") return
    // function arguments could differ but we want to ignore that
    if (property === "arguments") return
  }

  const getComparison = subcompare(comparison, {
    type: "property-get",
    data: property,
    actual: actualDescriptor.get,
    expected: expectedDescriptor.get,
  })
  if (getComparison.failed) return

  const setComparison = subcompare(comparison, {
    type: "property-set",
    data: property,
    actual: actualDescriptor.set,
    expected: expectedDescriptor.set,
  })
  if (setComparison.failed) return

  const valueComparison = subcompare(comparison, {
    type: "property-value",
    data: isArray(expected) ? propertyToArrayIndex(property) : property,
    actual: actualDescriptor.value,
    expected: expectedDescriptor.value,
  })
  if (valueComparison.failed) return
}

const propertyToArrayIndex = (property) => {
  if (typeof property !== "string") return property
  const propertyAsNumber = parseInt(property, 10)
  if (Number.isInteger(propertyAsNumber) && propertyAsNumber >= 0) {
    return propertyAsNumber
  }
  return property
}

const compareSetEntries = (comparison) => {
  const { actual, expected } = comparison

  const expectedEntries = Array.from(expected.values()).map((value, index) => {
    return { index, value }
  })
  const actualEntries = Array.from(actual.values()).map((value, index) => {
    return { index, value }
  })

  // first check actual entries match expected entries
  // eslint-disable-next-line no-unused-vars
  for (const actualEntry of actualEntries) {
    const expectedEntry = expectedEntries[actualEntry.index]
    if (expectedEntry) {
      const entryComparison = subcompare(comparison, {
        type: "set-entry",
        data: actualEntry.index,
        actual: actualEntry.value,
        expected: expectedEntry.value,
      })
      if (entryComparison.failed) return
    }
  }

  const actualSize = actual.size
  const expectedSize = expected.size
  const sizeComparison = subcompare(comparison, {
    type: "set-size",
    actual: actualSize,
    expected: expectedSize,
    comparer: () => actualSize === expectedSize,
  })
  if (sizeComparison.failed) return
}

const compareMapEntries = (comparison) => {
  const { actual, expected } = comparison

  const actualEntries = Array.from(actual.keys()).map((key) => {
    return { key, value: actual.get(key) }
  })
  const expectedEntries = Array.from(expected.keys()).map((key) => {
    return { key, value: expected.get(key) }
  })

  const entryMapping = []
  const expectedEntryCandidates = expectedEntries.slice()

  actualEntries.forEach((actualEntry) => {
    const expectedEntry = expectedEntryCandidates.find((expectedEntryCandidate) => {
      const mappingComparison = subcompare(comparison, {
        type: "map-entry-key-mapping",
        actual: actualEntry.key,
        expected: expectedEntryCandidate.key,
      })
      if (mappingComparison.failed) {
        comparison.failed = false
        return false
      }
      return true
    })
    if (expectedEntry)
      expectedEntryCandidates.splice(expectedEntryCandidates.indexOf(expectedEntry), 1)
    entryMapping.push({ actualEntry, expectedEntry })
  })

  // should we ensure entries are defined in the same order ?
  // I'm not sure about that, but maybe.
  // in that case, just like for properties order
  // this is the last thing we would check
  // because it gives less information

  // first check all actual entry macthes expected entry
  let index = 0
  // eslint-disable-next-line no-unused-vars
  for (const actualEntry of actualEntries) {
    const actualEntryMapping = entryMapping.find((mapping) => mapping.actualEntry === actualEntry)
    if (actualEntryMapping && actualEntryMapping.expectedEntry) {
      const mapEntryComparison = subcompare(comparison, {
        type: "map-entry",
        data: index,
        actual: actualEntry,
        expected: actualEntryMapping.expectedEntry,
      })
      if (mapEntryComparison.failed) return
    }
    index++
  }

  // second check there is no unexpected entry
  const mappingWithoutExpectedEntry = entryMapping.find(
    (mapping) => mapping.expectedEntry === undefined,
  )
  const unexpectedEntry = mappingWithoutExpectedEntry
    ? mappingWithoutExpectedEntry.actualEntry
    : null
  const unexpectedEntryComparison = subcompare(comparison, {
    type: "map-entry",
    actual: unexpectedEntry,
    expected: null,
  })
  if (unexpectedEntryComparison.failed) return

  // third check there is no missing entry (expected but not found)
  const expectedEntryWithoutActualEntry = expectedEntries.find((expectedEntry) =>
    entryMapping.every((mapping) => mapping.expectedEntry !== expectedEntry),
  )
  const missingEntry = expectedEntryWithoutActualEntry || null
  const missingEntryComparison = subcompare(comparison, {
    type: "map-entry",
    actual: null,
    expected: missingEntry,
  })
  if (missingEntryComparison.failed) return
}

const compareValueOfReturnValue = (comparison) => {
  subcompare(comparison, {
    type: "value-of-return-value",
    actual: comparison.actual.valueOf(),
    expected: comparison.expected.valueOf(),
  })
}

const compareToStringReturnValue = (comparison) => {
  subcompare(comparison, {
    type: "to-string-return-value",
    actual: comparison.actual.toString(),
    expected: comparison.expected.toString(),
  })
}
