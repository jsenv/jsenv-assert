'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var inspect = require('@jsenv/inspect');
var logger = require('@jsenv/logger');

const isComposite = value => {
  if (value === null) return false;
  if (typeof value === "object") return true;
  if (typeof value === "function") return true;
  return false;
};
const isPrimitive = value => !isComposite(value);

/* eslint-disable no-use-before-define */
// https://github.com/dmail/dom/blob/e55a8c7b4cda6be2f7a4b1222f96d028a379b67f/src/visit.js#L89
const findPreviousComparison = (comparison, predicate) => {
  const createPreviousIterator = () => {
    let current = comparison;

    const next = () => {
      const previous = getPrevious(current);
      current = previous;
      return {
        done: !previous,
        value: previous
      };
    };

    return {
      next
    };
  };

  const iterator = createPreviousIterator();
  let next = iterator.next();

  while (!next.done) {
    const value = next.value;

    if (predicate(value)) {
      return value;
    }

    next = iterator.next();
  }

  return null;
};

const getLastChild = comparison => {
  return comparison.children[comparison.children.length - 1];
};

const getDeepestChild = comparison => {
  let deepest = getLastChild(comparison);

  while (deepest) {
    const lastChild = getLastChild(deepest);

    if (lastChild) {
      deepest = lastChild;
    } else {
      break;
    }
  }

  return deepest;
};

const getPreviousSibling = comparison => {
  const {
    parent
  } = comparison;
  if (!parent) return null;
  const {
    children
  } = parent;
  const index = children.indexOf(comparison);
  if (index === 0) return null;
  return children[index - 1];
};

const getPrevious = comparison => {
  const previousSibling = getPreviousSibling(comparison);

  if (previousSibling) {
    const deepestChild = getDeepestChild(previousSibling);

    if (deepestChild) {
      return deepestChild;
    }

    return previousSibling;
  }

  const parent = comparison.parent;
  return parent;
};

const isRegExp = value => somePrototypeMatch(value, ({
  constructor
}) => constructor && constructor.name === "RegExp");
const isArray = value => somePrototypeMatch(value, ({
  constructor
}) => constructor && constructor.name === "Array");
const isError = value => somePrototypeMatch(value, ({
  constructor
}) => constructor && constructor.name === "Error");
const isSet = value => somePrototypeMatch(value, ({
  constructor
}) => constructor && constructor.name === "Set");
const isMap = value => somePrototypeMatch(value, ({
  constructor
}) => constructor && constructor.name === "Map");
const somePrototypeMatch = (value, predicate) => {
  let prototype = Object.getPrototypeOf(value);

  while (prototype) {
    if (predicate(prototype)) return true;
    prototype = Object.getPrototypeOf(prototype);
  }

  return false;
};

const compare = ({
  actual,
  expected
}, {
  anyOrder
}) => {
  const comparison = createComparison({
    type: "root",
    actual,
    expected
  });
  comparison.failed = !defaultComparer(comparison, {
    anyOrder
  });
  return comparison;
};
const expectationSymbol = Symbol.for("expectation");

const createExpectation = data => {
  return {
    [expectationSymbol]: true,
    data
  };
};

const createNotExpectation = value => {
  return createExpectation({
    type: "not",
    expected: value,
    comparer: ({
      actual
    }) => {
      if (isNegativeZero(value)) {
        return !isNegativeZero(actual);
      }

      if (isNegativeZero(actual)) {
        return !isNegativeZero(value);
      }

      return actual !== value;
    }
  });
};
const createAnyExpectation = expectedConstructor => {
  return createExpectation({
    type: "any",
    expected: expectedConstructor,
    comparer: ({
      actual
    }) => {
      return somePrototypeMatch(actual, ({
        constructor
      }) => constructor && (constructor === expectedConstructor || constructor.name === expectedConstructor.name));
    }
  });
};

const createComparison = ({
  parent = null,
  children = [],
  ...rest
}) => {
  const comparison = {
    parent,
    children,
    ...rest
  };
  return comparison;
};

const defaultComparer = (comparison, options) => {
  const {
    actual,
    expected
  } = comparison;

  if (typeof expected === "object" && expected !== null && expectationSymbol in expected) {
    subcompare(comparison, { ...expected.data,
      actual,
      options
    });
    return !comparison.failed;
  }

  if (isPrimitive(expected) || isPrimitive(actual)) {
    compareIdentity(comparison, options);
    return !comparison.failed;
  }

  const expectedReference = findPreviousComparison(comparison, referenceComparisonCandidate => referenceComparisonCandidate !== comparison && referenceComparisonCandidate.expected === comparison.expected);

  if (expectedReference) {
    if (expectedReference.actual === comparison.actual) {
      subcompare(comparison, {
        type: "reference",
        actual: expectedReference,
        expected: expectedReference,
        comparer: () => true,
        options
      });
      return true;
    }

    subcompare(comparison, {
      type: "reference",
      actual: findPreviousComparison(comparison, referenceComparisonCandidate => referenceComparisonCandidate !== comparison && referenceComparisonCandidate.actual === comparison.actual),
      expected: expectedReference,
      comparer: ({
        actual,
        expected
      }) => actual === expected,
      options
    });
    if (comparison.failed) return false; // if we expectedAReference and it did not fail, we are done
    // this expectation was already compared and comparing it again
    // would cause infinite loop

    return true;
  }

  const actualReference = findPreviousComparison(comparison, referenceComparisonCandidate => referenceComparisonCandidate !== comparison && referenceComparisonCandidate.actual === comparison.actual);

  if (actualReference) {
    subcompare(comparison, {
      type: "reference",
      actual: actualReference,
      expected: null,
      comparer: () => false,
      options
    });
    return false;
  }

  compareIdentity(comparison, options); // actual === expected, no need to compare prototype, properties, ...

  if (!comparison.failed) return true;
  comparison.failed = false;
  comparePrototype(comparison, options);
  if (comparison.failed) return false;
  compareIntegrity(comparison, options);
  if (comparison.failed) return false;
  compareExtensibility(comparison, options);
  if (comparison.failed) return false;
  comparePropertiesDescriptors(comparison, options);
  if (comparison.failed) return false;
  compareProperties(comparison, options);
  if (comparison.failed) return false;
  compareSymbolsDescriptors(comparison, options);
  if (comparison.failed) return false;
  compareSymbols(comparison, options);
  if (comparison.failed) return false;

  if (typeof Set === "function" && isSet(expected)) {
    compareSetEntries(comparison, options);
    if (comparison.failed) return false;
  }

  if (typeof Map === "function" && isMap(expected)) {
    compareMapEntries(comparison, options);
    if (comparison.failed) return false;
  }

  if ("valueOf" in expected && typeof expected.valueOf === "function") {
    // always keep this one after properties because we must first ensure
    // valueOf is on both actual and expected
    // usefull because new Date(10).valueOf() === 10
    // or new Boolean(true).valueOf() === true
    compareValueOfReturnValue(comparison, options);
    if (comparison.failed) return false;
  } // required otherwise assert({ actual: /a/, expected: /b/ }) would not throw


  if (isRegExp(expected)) {
    compareToStringReturnValue(comparison, options);
    if (comparison.failed) return false;
  }

  return true;
};

const subcompare = (comparison, {
  type,
  data,
  actual,
  expected,
  comparer = defaultComparer,
  options
}) => {
  const subcomparison = createComparison({
    type,
    data,
    actual,
    expected,
    parent: comparison
  });
  comparison.children.push(subcomparison);
  subcomparison.failed = !comparer(subcomparison, options);
  comparison.failed = subcomparison.failed;
  return subcomparison;
};

const compareIdentity = (comparison, options) => {
  const {
    actual,
    expected
  } = comparison;
  subcompare(comparison, {
    type: "identity",
    actual,
    expected,
    comparer: () => {
      if (isNegativeZero(expected)) {
        return isNegativeZero(actual);
      }

      if (isNegativeZero(actual)) {
        return isNegativeZero(expected);
      }

      return actual === expected;
    },
    options
  });
}; // under some rare and odd circumstances firefox Object.is(-0, -0)
// returns false making test fail.
// it is 100% reproductible with big.test.js.
// However putting debugger or executing Object.is just before the
// comparison prevent Object.is failure.
// It makes me thing there is something strange inside firefox internals.
// All this to say avoid relying on Object.is to test if the value is -0


const isNegativeZero = value => {
  return typeof value === "number" && 1 / value === -Infinity;
};

const comparePrototype = (comparison, options) => {
  subcompare(comparison, {
    type: "prototype",
    actual: Object.getPrototypeOf(comparison.actual),
    expected: Object.getPrototypeOf(comparison.expected),
    options
  });
};

const compareExtensibility = (comparison, options) => {
  subcompare(comparison, {
    type: "extensibility",
    actual: Object.isExtensible(comparison.actual) ? "extensible" : "non-extensible",
    expected: Object.isExtensible(comparison.expected) ? "extensible" : "non-extensible",
    comparer: ({
      actual,
      expected
    }) => actual === expected,
    options
  });
}; // https://tc39.github.io/ecma262/#sec-setintegritylevel


const compareIntegrity = (comparison, options) => {
  subcompare(comparison, {
    type: "integrity",
    actual: getIntegriy(comparison.actual),
    expected: getIntegriy(comparison.expected),
    comparer: ({
      actual,
      expected
    }) => actual === expected,
    options
  });
};

const getIntegriy = value => {
  if (Object.isFrozen(value)) return "frozen";
  if (Object.isSealed(value)) return "sealed";
  return "none";
};

const compareProperties = (comparison, options) => {
  const {
    actual,
    expected
  } = comparison;
  const expectedPropertyNames = Object.getOwnPropertyNames(expected);
  const actualPropertyNames = Object.getOwnPropertyNames(actual);
  const actualMissing = expectedPropertyNames.filter(name => actualPropertyNames.indexOf(name) === -1);
  const actualExtra = actualPropertyNames.filter(name => expectedPropertyNames.indexOf(name) === -1);
  const expectedMissing = [];
  const expectedExtra = [];
  subcompare(comparison, {
    type: "properties",
    actual: {
      missing: actualMissing,
      extra: actualExtra
    },
    expected: {
      missing: expectedMissing,
      extra: expectedExtra
    },
    comparer: () => actualMissing.length === 0 && actualExtra.length === 0,
    options
  });
  if (comparison.failed) return;

  if (!options.anyOrder) {
    const expectedKeys = Object.keys(expected);
    const actualKeys = Object.keys(actual);
    subcompare(comparison, {
      type: "properties-order",
      actual: actualKeys,
      expected: expectedKeys,
      comparer: () => expectedKeys.every((name, index) => name === actualKeys[index]),
      options
    });
  }
};

const compareSymbols = (comparison, options) => {
  const {
    actual,
    expected
  } = comparison;
  const expectedSymbols = Object.getOwnPropertySymbols(expected);
  const actualSymbols = Object.getOwnPropertySymbols(actual);
  const actualMissing = expectedSymbols.filter(symbol => actualSymbols.indexOf(symbol) === -1);
  const actualExtra = actualSymbols.filter(symbol => expectedSymbols.indexOf(symbol) === -1);
  const expectedMissing = [];
  const expectedExtra = [];
  subcompare(comparison, {
    type: "symbols",
    actual: {
      missing: actualMissing,
      extra: actualExtra
    },
    expected: {
      missing: expectedMissing,
      extra: expectedExtra
    },
    comparer: () => actualMissing.length === 0 && actualExtra.length === 0,
    options
  });
  if (comparison.failed) return;

  if (!options.anyOrder) {
    subcompare(comparison, {
      type: "symbols-order",
      actual: actualSymbols,
      expected: expectedSymbols,
      comparer: () => expectedSymbols.every((symbol, index) => symbol === actualSymbols[index]),
      options
    });
  }
};

const comparePropertiesDescriptors = (comparison, options) => {
  const {
    expected
  } = comparison;
  const expectedPropertyNames = Object.getOwnPropertyNames(expected); // eslint-disable-next-line no-unused-vars

  for (const expectedPropertyName of expectedPropertyNames) {
    comparePropertyDescriptor(comparison, expectedPropertyName, expected, options);
    if (comparison.failed) break;
  }
};

const compareSymbolsDescriptors = (comparison, options) => {
  const {
    expected
  } = comparison;
  const expectedSymbols = Object.getOwnPropertySymbols(expected); // eslint-disable-next-line no-unused-vars

  for (const expectedSymbol of expectedSymbols) {
    comparePropertyDescriptor(comparison, expectedSymbol, expected, options);
    if (comparison.failed) break;
  }
};

const comparePropertyDescriptor = (comparison, property, owner, options) => {
  const {
    actual,
    expected
  } = comparison;
  const expectedDescriptor = Object.getOwnPropertyDescriptor(expected, property);
  const actualDescriptor = Object.getOwnPropertyDescriptor(actual, property);
  if (!actualDescriptor) return;
  const configurableComparison = subcompare(comparison, {
    type: "property-configurable",
    data: property,
    actual: actualDescriptor.configurable ? "configurable" : "non-configurable",
    expected: expectedDescriptor.configurable ? "configurable" : "non-configurable",
    comparer: ({
      actual,
      expected
    }) => actual === expected,
    options
  });
  if (configurableComparison.failed) return;
  const enumerableComparison = subcompare(comparison, {
    type: "property-enumerable",
    data: property,
    actual: actualDescriptor.enumerable ? "enumerable" : "non-enumerable",
    expected: expectedDescriptor.enumerable ? "enumerable" : "non-enumerable",
    comparer: ({
      actual,
      expected
    }) => actual === expected,
    options
  });
  if (enumerableComparison.failed) return;
  const writableComparison = subcompare(comparison, {
    type: "property-writable",
    data: property,
    actual: actualDescriptor.writable ? "writable" : "non-writable",
    expected: expectedDescriptor.writable ? "writable" : "non-writable",
    comparer: ({
      actual,
      expected
    }) => actual === expected,
    options
  });
  if (writableComparison.failed) return;

  if (isError(owner) && isErrorPropertyIgnored(property)) {
    return;
  }

  if (typeof owner === "function") {
    if (owner.name === "RegExp" && isRegExpPropertyIgnored(property)) {
      return;
    }

    if (isFunctionPropertyIgnored(property)) {
      return;
    }
  }

  const getComparison = subcompare(comparison, {
    type: "property-get",
    data: property,
    actual: actualDescriptor.get,
    expected: expectedDescriptor.get,
    options
  });
  if (getComparison.failed) return;
  const setComparison = subcompare(comparison, {
    type: "property-set",
    data: property,
    actual: actualDescriptor.set,
    expected: expectedDescriptor.set,
    options
  });
  if (setComparison.failed) return;
  const valueComparison = subcompare(comparison, {
    type: "property-value",
    data: isArray(expected) ? propertyToArrayIndex(property) : property,
    actual: actualDescriptor.value,
    expected: expectedDescriptor.value,
    options
  });
  if (valueComparison.failed) return;
};

const isRegExpPropertyIgnored = name => RegExpIgnoredProperties.includes(name);

const isFunctionPropertyIgnored = name => functionIgnoredProperties.includes(name);

const isErrorPropertyIgnored = name => errorIgnoredProperties.includes(name); // some regexp properties fails the comparison but that's expected
// to my experience it happens only in webkit.
// check https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/RegExp/input
// to see why these properties exists and would fail between each regex instance


const RegExpIgnoredProperties = ["input", "$_", "lastMatch", "$&", "lastParen", "$+", "leftContext", "$`", "rightContext", "$'"];
const functionIgnoredProperties = [// function caller would fail comparison but that's expected
"caller", // function arguments would fail comparison but that's expected
"arguments"];
const errorIgnoredProperties = [// stack fails comparison but it's not important
"stack", // firefox properties that would fail comparison but that's expected
"file", "fileName", "lineNumber", "columnNumber", // webkit properties that would fail comparison but that's expected
"line", "column"];

const propertyToArrayIndex = property => {
  if (typeof property !== "string") return property;
  const propertyAsNumber = parseInt(property, 10);

  if (Number.isInteger(propertyAsNumber) && propertyAsNumber >= 0) {
    return propertyAsNumber;
  }

  return property;
};

const compareSetEntries = (comparison, options) => {
  const {
    actual,
    expected
  } = comparison;
  const expectedEntries = Array.from(expected.values()).map((value, index) => {
    return {
      index,
      value
    };
  });
  const actualEntries = Array.from(actual.values()).map((value, index) => {
    return {
      index,
      value
    };
  }); // first check actual entries match expected entries
  // eslint-disable-next-line no-unused-vars

  for (const actualEntry of actualEntries) {
    const expectedEntry = expectedEntries[actualEntry.index];

    if (expectedEntry) {
      const entryComparison = subcompare(comparison, {
        type: "set-entry",
        data: actualEntry.index,
        actual: actualEntry.value,
        expected: expectedEntry.value,
        options
      });
      if (entryComparison.failed) return;
    }
  }

  const actualSize = actual.size;
  const expectedSize = expected.size;
  const sizeComparison = subcompare(comparison, {
    type: "set-size",
    actual: actualSize,
    expected: expectedSize,
    comparer: () => actualSize === expectedSize,
    options
  });
  if (sizeComparison.failed) return;
};

const compareMapEntries = (comparison, options) => {
  const {
    actual,
    expected
  } = comparison;
  const actualEntries = Array.from(actual.keys()).map(key => {
    return {
      key,
      value: actual.get(key)
    };
  });
  const expectedEntries = Array.from(expected.keys()).map(key => {
    return {
      key,
      value: expected.get(key)
    };
  });
  const entryMapping = [];
  const expectedEntryCandidates = expectedEntries.slice();
  actualEntries.forEach(actualEntry => {
    const expectedEntry = expectedEntryCandidates.find(expectedEntryCandidate => {
      const mappingComparison = subcompare(comparison, {
        type: "map-entry-key-mapping",
        actual: actualEntry.key,
        expected: expectedEntryCandidate.key,
        options
      });

      if (mappingComparison.failed) {
        comparison.failed = false;
        return false;
      }

      return true;
    });
    if (expectedEntry) expectedEntryCandidates.splice(expectedEntryCandidates.indexOf(expectedEntry), 1);
    entryMapping.push({
      actualEntry,
      expectedEntry
    });
  }); // should we ensure entries are defined in the same order ?
  // I'm not sure about that, but maybe.
  // in that case, just like for properties order
  // this is the last thing we would check
  // because it gives less information
  // first check all actual entry macthes expected entry

  let index = 0; // eslint-disable-next-line no-unused-vars

  for (const actualEntry of actualEntries) {
    const actualEntryMapping = entryMapping.find(mapping => mapping.actualEntry === actualEntry);

    if (actualEntryMapping && actualEntryMapping.expectedEntry) {
      const mapEntryComparison = subcompare(comparison, {
        type: "map-entry",
        data: index,
        actual: actualEntry,
        expected: actualEntryMapping.expectedEntry,
        options
      });
      if (mapEntryComparison.failed) return;
    }

    index++;
  } // second check there is no unexpected entry


  const mappingWithoutExpectedEntry = entryMapping.find(mapping => mapping.expectedEntry === undefined);
  const unexpectedEntry = mappingWithoutExpectedEntry ? mappingWithoutExpectedEntry.actualEntry : null;
  const unexpectedEntryComparison = subcompare(comparison, {
    type: "map-entry",
    actual: unexpectedEntry,
    expected: null,
    options
  });
  if (unexpectedEntryComparison.failed) return; // third check there is no missing entry (expected but not found)

  const expectedEntryWithoutActualEntry = expectedEntries.find(expectedEntry => entryMapping.every(mapping => mapping.expectedEntry !== expectedEntry));
  const missingEntry = expectedEntryWithoutActualEntry || null;
  const missingEntryComparison = subcompare(comparison, {
    type: "map-entry",
    actual: null,
    expected: missingEntry,
    options
  });
  if (missingEntryComparison.failed) return;
};

const compareValueOfReturnValue = (comparison, options) => {
  subcompare(comparison, {
    type: "value-of-return-value",
    actual: comparison.actual.valueOf(),
    expected: comparison.expected.valueOf(),
    options
  });
};

const compareToStringReturnValue = (comparison, options) => {
  subcompare(comparison, {
    type: "to-string-return-value",
    actual: comparison.actual.toString(),
    expected: comparison.expected.toString(),
    options
  });
};

const symbolToWellKnownSymbol = symbol => {
  const wellKnownSymbolName = Object.getOwnPropertyNames(Symbol).find(name => symbol === Symbol[name]);

  if (wellKnownSymbolName) {
    return `Symbol${propertyToAccessorString(wellKnownSymbolName)}`;
  }

  const description = symbolToDescription(symbol);

  if (description) {
    const key = Symbol.keyFor(symbol);

    if (key) {
      return `Symbol.for(${inspect.inspect(description)})`;
    }

    return `Symbol(${inspect.inspect(description)})`;
  }

  return `Symbol()`;
};

const symbolToDescription = symbol => {
  const toStringResult = symbol.toString();
  const openingParenthesisIndex = toStringResult.indexOf("(");
  const closingParenthesisIndex = toStringResult.indexOf(")");
  return toStringResult.slice(openingParenthesisIndex + 1, closingParenthesisIndex); // return symbol.description // does not work on node
};

const propertyNameToDotNotationAllowed = propertyName => {
  return /^[a-z_$]+[0-9a-z_&]$/i.test(propertyName) || /^[a-z_$]$/i.test(propertyName);
};

const propertyToAccessorString = property => {
  if (typeof property === "number") {
    return `[${inspect.inspect(property)}]`;
  }

  if (typeof property === "string") {
    const dotNotationAllowedForProperty = propertyNameToDotNotationAllowed(property);

    if (dotNotationAllowedForProperty) {
      return `.${property}`;
    }

    return `[${inspect.inspect(property)}]`;
  }

  return `[${symbolToWellKnownSymbol(property)}]`;
};

/* eslint-disable no-use-before-define */
const comparisonToPath = (comparison, name = "value") => {
  const comparisonPath = [];
  let ancestor = comparison.parent;

  while (ancestor && ancestor.type !== "root") {
    comparisonPath.unshift(ancestor);
    ancestor = ancestor.parent;
  }

  if (comparison.type !== "root") {
    comparisonPath.push(comparison);
  }

  const path = comparisonPath.reduce((previous, {
    type,
    data
  }) => {
    if (type === "property-enumerable") {
      return `${previous}${propertyToAccessorString(data)}[[Enumerable]]`;
    }

    if (type === "property-configurable") {
      return `${previous}${propertyToAccessorString(data)}[[Configurable]]`;
    }

    if (type === "property-writable") {
      return `${previous}${propertyToAccessorString(data)}[[Writable]]`;
    }

    if (type === "property-get") {
      return `${previous}${propertyToAccessorString(data)}[[Get]]`;
    }

    if (type === "property-set") {
      return `${previous}${propertyToAccessorString(data)}[[Set]]`;
    }

    if (type === "property-value") {
      return `${previous}${propertyToAccessorString(data)}`;
    }

    if (type === "map-entry") {
      return `${previous}[[mapEntry:${data}]]`;
    }

    if (type === "set-entry") {
      return `${previous}[[setEntry:${data}]]`;
    }

    if (type === "reference") {
      return `${previous}`;
    }

    if (type === "integrity") {
      return `${previous}[[Integrity]]`;
    }

    if (type === "extensibility") {
      return `${previous}[[Extensible]]`;
    }

    if (type === "prototype") {
      return `${previous}[[Prototype]]`;
    }

    if (type === "properties") {
      return `${previous}`;
    }

    if (type === "properties-order") {
      return `${previous}`;
    }

    if (type === "symbols") {
      return `${previous}`;
    }

    if (type === "symbols-order") {
      return `${previous}`;
    }

    if (type === "to-string-return-value") {
      return `${previous}.toString()`;
    }

    if (type === "value-of-return-value") {
      return `${previous}.valueOf()`;
    }

    if (type === "identity" || type === "not") {
      return previous;
    }

    if (type === "any") {
      return previous;
    }

    return `${previous} type:${type}, data:${data}`;
  }, name);
  return path;
};

/* eslint-disable no-use-before-define */
const valueToWellKnown = value => {
  const compositeWellKnownPath = valueToCompositeWellKnownPath(value);

  if (compositeWellKnownPath) {
    return compositeWellKnownPath.slice(1).reduce((previous, property) => `${previous}${propertyToAccessorString(property)}`, compositeWellKnownPath[0]);
  }

  return null;
}; // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap

const compositeWellKnownMap = new WeakMap();
const primitiveWellKnownMap = new Map();

const valueToCompositeWellKnownPath = value => {
  return compositeWellKnownMap.get(value);
};

const isPrimitive$1 = value => !isComposite(value);

const addWellKnownComposite = (value, name) => {
  const visitValue = (value, path) => {
    if (isPrimitive$1(value)) {
      primitiveWellKnownMap.set(value, path);
      return;
    }

    if (compositeWellKnownMap.has(value)) return; // prevent infinite recursion

    compositeWellKnownMap.set(value, path);

    const visitProperty = property => {
      let descriptor;

      try {
        descriptor = Object.getOwnPropertyDescriptor(value, property);
      } catch (e) {
        // may happen if you try to access some iframe properties or stuff like that
        if (e.name === "SecurityError") {
          return;
        }

        throw e;
      }

      if (!descriptor) {
        return;
      } // do not trigger getter/setter


      if ("value" in descriptor) {
        const propertyValue = descriptor.value;
        visitValue(propertyValue, [...path, property]);
      }
    };

    Object.getOwnPropertyNames(value).forEach(name => visitProperty(name));
    Object.getOwnPropertySymbols(value).forEach(symbol => visitProperty(symbol));
  };

  visitValue(value, [name]);
};

if (typeof global === "object") {
  addWellKnownComposite(global, "global");
}

if (typeof window === "object") {
  addWellKnownComposite(window, "window");
}

const valueToString = value => {
  return valueToWellKnown(value) || inspect.inspect(value);
};

const anyComparisonToErrorMessage = comparison => {
  if (comparison.type !== "any") return undefined;
  const path = comparisonToPath(comparison);
  const actualValue = valueToString(comparison.actual);
  const expectedConstructor = comparison.expected;
  return createAnyMessage({
    path,
    expectedConstructor,
    actualValue
  });
};

const createAnyMessage = ({
  path,
  expectedConstructor,
  actualValue
}) => `unexpected value.
--- found ---
${actualValue}
--- expected ---
any(${expectedConstructor.name})
--- at ---
${path}`;

const defaultComparisonToErrorMessage = comparison => {
  const path = comparisonToPath(comparison);
  const expectedValue = valueToString(comparison.expected);
  const actualValue = valueToString(comparison.actual);
  return createUnequalValuesMessage({
    path,
    expectedValue,
    actualValue
  });
};

const createUnequalValuesMessage = ({
  path,
  expectedValue,
  actualValue
}) => `unequal values.
--- found ---
${actualValue}
--- expected ---
${expectedValue}
--- at ---
${path}`;

const referenceComparisonToErrorMessage = comparison => {
  if (comparison.type !== "reference") return undefined;
  const {
    actual,
    expected
  } = comparison;
  const isMissing = expected && !actual;
  const isExtra = !expected && actual;
  const path = comparisonToPath(comparison);

  if (isExtra) {
    return createUnexpectedReferenceMessage({
      path,
      expectedValue: valueToString(comparison.parent.expected),
      unexpectedReferencePath: comparisonToPath(actual, "actual")
    });
  }

  if (isMissing) {
    return createMissingReferenceMessage({
      path,
      expectedReferencePath: comparisonToPath(expected, "expected"),
      actualValue: valueToString(comparison.parent.actual)
    });
  }

  return createUnequalRefencesMessage({
    path,
    expectedReferencePath: comparisonToPath(expected, "expected"),
    actualReferencePath: comparisonToPath(actual, "actual")
  });
};

const createUnexpectedReferenceMessage = ({
  path,
  expectedValue,
  unexpectedReferencePath
}) => `found a reference instead of a value.
--- reference found to ---
${unexpectedReferencePath}
--- value expected ---
${expectedValue}
--- at ---
${path}`;

const createMissingReferenceMessage = ({
  path,
  expectedReferencePath,
  actualValue
}) => `found a value instead of a reference.
--- value found ---
${actualValue}
--- reference expected to ---
${expectedReferencePath}
--- at ---
${path}`;

const createUnequalRefencesMessage = ({
  path,
  expectedReferencePath,
  actualReferencePath
}) => `unequal references.
--- reference found to ---
${actualReferencePath}
--- reference expected to ---
${expectedReferencePath}
--- at ---
${path}`;

const comparisonToRootComparison = comparison => {
  let current = comparison;

  while (current) {
    if (current.parent) {
      current = current.parent;
    } else {
      break;
    }
  }

  return current;
};

const findSelfOrAncestorComparison = (comparison, predicate) => {
  let current = comparison;
  let foundComparison;

  while (current) {
    if (current && predicate(current)) {
      foundComparison = current;
      current = foundComparison.parent;

      while (current) {
        if (predicate(current)) foundComparison = current;
        current = current.parent;
      }

      return foundComparison;
    }

    current = current.parent;
  }

  return null;
};

const prototypeComparisonToErrorMessage = comparison => {
  const prototypeComparison = findSelfOrAncestorComparison(comparison, ({
    type
  }) => type === "prototype");
  if (!prototypeComparison) return null;
  const rootComparison = comparisonToRootComparison(comparison);
  const path = comparisonToPath(prototypeComparison);

  const prototypeToString = prototype => {
    const wellKnown = valueToWellKnown(prototype);
    if (wellKnown) return wellKnown; // we could check in the whole comparison tree, not only for actual/expected
    // but any reference to that prototype
    // to have a better name for it
    // if anything refer to it except himself
    // it would be a better name for that object no ?

    if (prototype === rootComparison.expected) return "expected";
    if (prototype === rootComparison.actual) return "actual";
    return inspect.inspect(prototype);
  };

  const expectedPrototype = prototypeComparison.expected;
  const actualPrototype = prototypeComparison.actual;
  return createUnequalPrototypesMessage({
    path,
    expectedPrototype: prototypeToString(expectedPrototype),
    actualPrototype: prototypeToString(actualPrototype)
  });
};

const createUnequalPrototypesMessage = ({
  path,
  expectedPrototype,
  actualPrototype
}) => `unequal prototypes.
--- prototype found ---
${actualPrototype}
--- prototype expected ---
${expectedPrototype}
--- at ---
${path}`;

const propertiesComparisonToErrorMessage = comparison => {
  if (comparison.type !== "properties") {
    return undefined;
  }

  const path = comparisonToPath(comparison.parent);
  const missing = comparison.actual.missing;
  const extra = comparison.actual.extra;
  const missingCount = missing.length;
  const extraCount = extra.length;
  const unexpectedProperties = {};
  extra.forEach(propertyName => {
    unexpectedProperties[propertyName] = comparison.parent.actual[propertyName];
  });
  const missingProperties = {};
  missing.forEach(propertyName => {
    missingProperties[propertyName] = comparison.parent.expected[propertyName];
  });

  if (missingCount === 1 && extraCount === 0) {
    return logger.createDetailedMessage("1 missing property.", {
      "missing property": inspect.inspect(missingProperties),
      "at": path
    });
  }

  if (missingCount > 1 && extraCount === 0) {
    return logger.createDetailedMessage(`${missingCount} missing properties.`, {
      "missing properties": inspect.inspect(missingProperties),
      "at": path
    });
  }

  if (missingCount === 0 && extraCount === 1) {
    return logger.createDetailedMessage(`1 unexpected property.`, {
      "unexpected property": inspect.inspect(unexpectedProperties),
      "at": path
    });
  }

  if (missingCount === 0 && extraCount > 1) {
    return logger.createDetailedMessage(`${extraCount} unexpected properties.`, {
      "unexpected properties": inspect.inspect(unexpectedProperties),
      "at": path
    });
  }

  let message = "";

  if (missingCount === 1) {
    message += `1 missing property`;
  } else {
    message += `${missingCount} missing properties`;
  }

  if (extraCount === 1) {
    message += ` and 1 unexpected property.`;
  } else {
    message += ` and ${extraCount} unexpected properties.`;
  }

  return logger.createDetailedMessage(message, {
    [missingCount === 1 ? "missing property" : "missing properties"]: inspect.inspect(missingProperties),
    [extraCount === 1 ? "unexpected property" : "unexpected properties"]: inspect.inspect(unexpectedProperties),
    at: path
  });
};

const propertiesOrderComparisonToErrorMessage = comparison => {
  if (comparison.type !== "properties-order") return undefined;
  const path = comparisonToPath(comparison);
  const expected = comparison.expected;
  const actual = comparison.actual;
  return createUnexpectedPropertiesOrderMessage({
    path,
    expectedPropertiesOrder: propertyNameArrayToString(expected),
    actualPropertiesOrder: propertyNameArrayToString(actual)
  });
};

const createUnexpectedPropertiesOrderMessage = ({
  path,
  expectedPropertiesOrder,
  actualPropertiesOrder
}) => `unexpected properties order.
--- properties order found ---
${actualPropertiesOrder.join(`
`)}
--- properties order expected ---
${expectedPropertiesOrder.join(`
`)}
--- at ---
${path}`;

const propertyNameArrayToString = propertyNameArray => {
  return propertyNameArray.map(propertyName => inspect.inspect(propertyName));
};

const symbolsComparisonToErrorMessage = comparison => {
  if (comparison.type !== "symbols") return undefined;
  const path = comparisonToPath(comparison);
  const extra = comparison.actual.extra;
  const missing = comparison.actual.missing;
  const hasExtra = extra.length > 0;
  const hasMissing = missing.length > 0;

  if (hasExtra && !hasMissing) {
    return createUnexpectedSymbolsMessage({
      path,
      unexpectedSymbols: symbolArrayToString(extra)
    });
  }

  if (!hasExtra && hasMissing) {
    return createMissingSymbolsMessage({
      path,
      missingSymbols: symbolArrayToString(missing)
    });
  }

  return createUnexpectedAndMissingSymbolsMessage({
    path,
    unexpectedSymbols: symbolArrayToString(extra),
    missingSymbols: symbolArrayToString(missing)
  });
};

const createUnexpectedSymbolsMessage = ({
  path,
  unexpectedSymbols
}) => `unexpected symbols.
--- unexpected symbol list ---
${unexpectedSymbols.join(`
`)}
--- at ---
${path}`;

const createMissingSymbolsMessage = ({
  path,
  missingSymbols
}) => `missing symbols.
--- missing symbol list ---
${missingSymbols.join(`
`)}
--- at ---
${path}`;

const createUnexpectedAndMissingSymbolsMessage = ({
  path,
  unexpectedSymbols,
  missingSymbols
}) => `unexpected and missing symbols.
--- unexpected symbol list ---
${unexpectedSymbols.join(`
`)}
--- missing symbol list ---
${missingSymbols.join(`
`)}
--- at ---
${path}`;

const symbolArrayToString = symbolArray => {
  return symbolArray.map(symbol => inspect.inspect(symbol));
};

const symbolsOrderComparisonToErrorMessage = comparison => {
  if (comparison.type !== "symbols-order") return undefined;
  const path = comparisonToPath(comparison);
  const expected = comparison.expected;
  const actual = comparison.actual;
  return createUnexpectedSymbolsOrderMessage({
    path,
    expectedSymbolsOrder: symbolArrayToString$1(expected),
    actualSymbolsOrder: symbolArrayToString$1(actual)
  });
};

const createUnexpectedSymbolsOrderMessage = ({
  path,
  expectedSymbolsOrder,
  actualSymbolsOrder
}) => `unexpected symbols order.
--- symbols order found ---
${actualSymbolsOrder.join(`
`)}
--- symbols order expected ---
${expectedSymbolsOrder.join(`
`)}
--- at ---
${path}`;

const symbolArrayToString$1 = symbolArray => {
  return symbolArray.map(symbol => inspect.inspect(symbol));
};

const setSizeComparisonToMessage = comparison => {
  if (comparison.type !== "set-size") return undefined;
  if (comparison.actual > comparison.expected) return createBiggerThanExpectedMessage(comparison);
  return createSmallerThanExpectedMessage(comparison);
};

const createBiggerThanExpectedMessage = comparison => `a set is bigger than expected.
--- set size found ---
${comparison.actual}
--- set size expected ---
${comparison.expected}
--- at ---
${comparisonToPath(comparison.parent)}`;

const createSmallerThanExpectedMessage = comparison => `a set is smaller than expected.
--- set size found ---
${comparison.actual}
--- set size expected ---
${comparison.expected}
--- at ---
${comparisonToPath(comparison.parent)}`;

const mapEntryComparisonToErrorMessage = comparison => {
  const mapEntryComparison = findSelfOrAncestorComparison(comparison, ({
    type
  }) => type === "map-entry");
  if (!mapEntryComparison) return null;
  const isUnexpected = !mapEntryComparison.expected && mapEntryComparison.actual;
  if (isUnexpected) return createUnexpectedMapEntryErrorMessage(mapEntryComparison);
  const isMissing = mapEntryComparison.expected && !mapEntryComparison.actual;
  if (isMissing) return createMissingMapEntryErrorMessage(mapEntryComparison);
  return null;
};

const createUnexpectedMapEntryErrorMessage = comparison => `an entry is unexpected.
--- unexpected entry key ---
${valueToString(comparison.actual.key)}
--- unexpected entry value ---
${valueToString(comparison.actual.value)}
--- at ---
${comparisonToPath(comparison.parent)}`;

const createMissingMapEntryErrorMessage = comparison => `an entry is missing.
--- missing entry key ---
${valueToString(comparison.expected.key)}
--- missing entry value ---
${valueToString(comparison.expected.value)}
--- at ---
${comparisonToPath(comparison.parent)}`;

const notComparisonToErrorMessage = comparison => {
  if (comparison.type !== "not") return undefined;
  const path = comparisonToPath(comparison);
  const actualValue = valueToString(comparison.actual);
  return createNotMessage({
    path,
    actualValue
  });
};

const createNotMessage = ({
  path,
  actualValue
}) => `unexpected value.
--- found ---
${actualValue}
--- expected ---
an other value
--- at ---
${path}`;

const arrayLengthComparisonToMessage = comparison => {
  if (comparison.type !== "identity") return undefined;
  const parentComparison = comparison.parent;
  if (parentComparison.type !== "property-value") return undefined;
  if (parentComparison.data !== "length") return undefined;
  const grandParentComparison = parentComparison.parent;
  if (!isArray(grandParentComparison.actual)) return undefined;
  const actualArray = grandParentComparison.actual;
  const expectedArray = grandParentComparison.expected;
  const actualLength = comparison.actual;
  const expectedLength = comparison.expected;
  const path = comparisonToPath(grandParentComparison);

  if (actualLength < expectedLength) {
    const missingValues = expectedArray.slice(actualLength);
    return logger.createDetailedMessage(`an array is smaller than expected.`, {
      "array length found": actualLength,
      "array length expected": expectedLength,
      "missing values": inspect.inspect(missingValues),
      "at": path
    });
  }

  const extraValues = actualArray.slice(expectedLength);
  return logger.createDetailedMessage(`an array is bigger than expected.`, {
    "array length found": actualLength,
    "array length expected": expectedLength,
    "extra values": inspect.inspect(extraValues),
    "at": path
  });
};

/* eslint-disable import/max-dependencies */
const comparisonToErrorMessage = comparison => {
  const failedComparison = deepestComparison(comparison);
  return firstFunctionReturningSomething([anyComparisonToErrorMessage, mapEntryComparisonToErrorMessage, notComparisonToErrorMessage, prototypeComparisonToErrorMessage, referenceComparisonToErrorMessage, propertiesComparisonToErrorMessage, propertiesOrderComparisonToErrorMessage, symbolsComparisonToErrorMessage, symbolsOrderComparisonToErrorMessage, setSizeComparisonToMessage, arrayLengthComparisonToMessage], failedComparison) || defaultComparisonToErrorMessage(failedComparison);
};

const deepestComparison = comparison => {
  let current = comparison;

  while (current) {
    const {
      children
    } = current;
    if (children.length === 0) break;
    current = children[children.length - 1];
  }

  return current;
};

const firstFunctionReturningSomething = (fns, ...args) => {
  let i = 0;

  while (i < fns.length) {
    const fn = fns[i];
    const returnValue = fn(...args);
    if (returnValue !== null && returnValue !== undefined) return returnValue;
    i++;
  }

  return undefined;
};

const isAssertionError = value => value && typeof value === "object" && value.name === "AssertionError";
const createAssertionError = message => {
  const error = new Error(message);
  error.name = "AssertionError";
  return error;
};

/* eslint-disable no-use-before-define */
const assert = (...args) => {
  if (args.length === 0) {
    throw new Error(`assert must be called with { actual, expected }, missing first argument`);
  }

  if (args.length > 1) {
    throw new Error(`assert must be called with { actual, expected }, received too much arguments`);
  }

  const firstArg = args[0];

  if (typeof firstArg !== "object" || firstArg === null) {
    throw new Error(`assert must be called with { actual, expected }, received ${firstArg} as first argument instead of object`);
  }

  if ("actual" in firstArg === false) {
    throw new Error(`assert must be called with { actual, expected }, missing actual property on first argument`);
  }

  if ("expected" in firstArg === false) {
    throw new Error(`assert must be called with { actual, expected }, missing expected property on first argument`);
  }

  return _assert(...args);
};

assert.not = value => {
  return createNotExpectation(value);
};

assert.any = Constructor => {
  return createAnyExpectation(Constructor);
};
/*
 * anyOrder is not documented because ../readme.md#Why-opinionated-
 * but I feel like the property order comparison might be too strict
 * and if we cannot find a proper alternative, being able to disable it
 * might be useful
 *
 * Documentation suggest to take the object and reorder manually
 *
 * const value = { bar: true, foo: true }
 * const actual = { foo: value.foo, bar: value.bar }
 * const expected = { foo: true, bar: true }
 *
 * An other good alternative could be an helper that would sort properties
 *
 * const value = sortProperties(value)
 * const expected = sortProperties({ foo: true, bar: true })
 s*
 */


const _assert = ({
  actual,
  expected,
  message,
  anyOrder = false
}) => {
  const expectation = {
    actual,
    expected
  };
  const comparison = compare(expectation, {
    anyOrder
  });

  if (comparison.failed) {
    const error = createAssertionError(message || comparisonToErrorMessage(comparison));
    if (Error.captureStackTrace) Error.captureStackTrace(error, assert);
    throw error;
  }
};

exports.assert = assert;
exports.createAssertionError = createAssertionError;
exports.isAssertionError = isAssertionError;

//# sourceMappingURL=main.cjs.map