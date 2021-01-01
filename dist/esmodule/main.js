var nativeTypeOf = function nativeTypeOf(obj) {
  return typeof obj;
};

var customTypeOf = function customTypeOf(obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? nativeTypeOf : customTypeOf;

/* eslint-disable no-eq-null, eqeqeq */
function arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  var arr2 = new Array(len);

  for (var i = 0; i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

/* eslint-disable consistent-return */
function unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
}

/* eslint-disable eqeqeq, no-eq-null */
// n: next
// e: error (called whenever something throws)
// f: finish (always called at the end)

function createForOfIteratorHelper(o, allowArrayLike) {
  var it;

  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
    // Fallback for engines without symbol support
    if (Array.isArray(o) || (it = unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;

      var F = function F() {};

      return {
        s: F,
        n: function n() {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        },
        e: function e(_e) {
          throw _e;
        },
        f: F
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var normalCompletion = true;
  var didErr = false;
  var err;
  return {
    s: function s() {
      it = o[Symbol.iterator]();
    },
    n: function n() {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function e(_e2) {
      didErr = true;
      err = _e2;
    },
    f: function f() {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    }
  };
}

var _defineProperty = (function (obj, key, value) {
  // Shortcircuit the slow defineProperty path when possible.
  // We are trying to avoid issues where setters defined on the
  // prototype cause side effects under the fast path of simple
  // assignment. By checking for existence of the property with
  // the in operator, we can optimize most of this overhead away.
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
});

function _objectSpread (target) {
  for (var i = 1; i < arguments.length; i++) {
    // eslint-disable-next-line prefer-rest-params
    var source = arguments[i] === null ? {} : arguments[i];

    if (i % 2) {
      // eslint-disable-next-line no-loop-func
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      // eslint-disable-next-line no-loop-func
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
} // This function is different to "Reflect.ownKeys". The enumerableOnly
// filters on symbol properties only. Returned string properties are always
// enumerable. It is good to use in objectSpread.

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    }); // eslint-disable-next-line prefer-spread

    keys.push.apply(keys, symbols);
  }

  return keys;
}

var objectWithoutPropertiesLoose = (function (source, excluded) {
  if (source === null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key;
  var i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
});

var _objectWithoutProperties = (function (source, excluded) {
  if (source === null) return {};
  var target = objectWithoutPropertiesLoose(source, excluded);
  var key;
  var i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
});

var isComposite = function isComposite(value) {
  if (value === null) return false;
  if (_typeof(value) === "object") return true;
  if (typeof value === "function") return true;
  return false;
};
var isPrimitive = function isPrimitive(value) {
  return !isComposite(value);
};

/* eslint-disable no-use-before-define */
// https://github.com/dmail/dom/blob/e55a8c7b4cda6be2f7a4b1222f96d028a379b67f/src/visit.js#L89
var findPreviousComparison = function findPreviousComparison(comparison, predicate) {
  var createPreviousIterator = function createPreviousIterator() {
    var current = comparison;

    var next = function next() {
      var previous = getPrevious(current);
      current = previous;
      return {
        done: !previous,
        value: previous
      };
    };

    return {
      next: next
    };
  };

  var iterator = createPreviousIterator();
  var next = iterator.next();

  while (!next.done) {
    var value = next.value;

    if (predicate(value)) {
      return value;
    }

    next = iterator.next();
  }

  return null;
};

var getLastChild = function getLastChild(comparison) {
  return comparison.children[comparison.children.length - 1];
};

var getDeepestChild = function getDeepestChild(comparison) {
  var deepest = getLastChild(comparison);

  while (deepest) {
    var lastChild = getLastChild(deepest);

    if (lastChild) {
      deepest = lastChild;
    } else {
      break;
    }
  }

  return deepest;
};

var getPreviousSibling = function getPreviousSibling(comparison) {
  var parent = comparison.parent;
  if (!parent) return null;
  var children = parent.children;
  var index = children.indexOf(comparison);
  if (index === 0) return null;
  return children[index - 1];
};

var getPrevious = function getPrevious(comparison) {
  var previousSibling = getPreviousSibling(comparison);

  if (previousSibling) {
    var deepestChild = getDeepestChild(previousSibling);

    if (deepestChild) {
      return deepestChild;
    }

    return previousSibling;
  }

  var parent = comparison.parent;
  return parent;
};

var isRegExp = function isRegExp(value) {
  return somePrototypeMatch(value, function (_ref) {
    var constructor = _ref.constructor;
    return constructor && constructor.name === "RegExp";
  });
};
var isArray = function isArray(value) {
  return somePrototypeMatch(value, function (_ref2) {
    var constructor = _ref2.constructor;
    return constructor && constructor.name === "Array";
  });
};
var isError = function isError(value) {
  return somePrototypeMatch(value, function (_ref3) {
    var constructor = _ref3.constructor;
    return constructor && constructor.name === "Error";
  });
};
var isSet = function isSet(value) {
  return somePrototypeMatch(value, function (_ref4) {
    var constructor = _ref4.constructor;
    return constructor && constructor.name === "Set";
  });
};
var isMap = function isMap(value) {
  return somePrototypeMatch(value, function (_ref5) {
    var constructor = _ref5.constructor;
    return constructor && constructor.name === "Map";
  });
};
var somePrototypeMatch = function somePrototypeMatch(value, predicate) {
  var prototype = Object.getPrototypeOf(value);

  while (prototype) {
    if (predicate(prototype)) return true;
    prototype = Object.getPrototypeOf(prototype);
  }

  return false;
};

var compare = function compare(_ref, _ref2) {
  var actual = _ref.actual,
      expected = _ref.expected;
  var anyOrder = _ref2.anyOrder;
  var comparison = createComparison({
    type: "root",
    actual: actual,
    expected: expected
  });
  comparison.failed = !defaultComparer(comparison, {
    anyOrder: anyOrder
  });
  return comparison;
};
var expectationSymbol = Symbol.for("expectation");

var createExpectation = function createExpectation(data) {
  var _ref3;

  return _ref3 = {}, _defineProperty(_ref3, expectationSymbol, true), _defineProperty(_ref3, "data", data), _ref3;
};

var createNotExpectation = function createNotExpectation(value) {
  return createExpectation({
    type: "not",
    expected: value,
    comparer: function comparer(_ref4) {
      var actual = _ref4.actual;

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
var createAnyExpectation = function createAnyExpectation(expectedConstructor) {
  return createExpectation({
    type: "any",
    expected: expectedConstructor,
    comparer: function comparer(_ref5) {
      var actual = _ref5.actual;
      return somePrototypeMatch(actual, function (_ref6) {
        var constructor = _ref6.constructor;
        return constructor && (constructor === expectedConstructor || constructor.name === expectedConstructor.name);
      });
    }
  });
};

var createComparison = function createComparison(_ref7) {
  var _ref7$parent = _ref7.parent,
      parent = _ref7$parent === void 0 ? null : _ref7$parent,
      _ref7$children = _ref7.children,
      children = _ref7$children === void 0 ? [] : _ref7$children,
      rest = _objectWithoutProperties(_ref7, ["parent", "children"]);

  var comparison = _objectSpread({
    parent: parent,
    children: children
  }, rest);

  return comparison;
};

var defaultComparer = function defaultComparer(comparison, options) {
  var actual = comparison.actual,
      expected = comparison.expected;

  if (_typeof(expected) === "object" && expected !== null && expectationSymbol in expected) {
    subcompare(comparison, _objectSpread(_objectSpread({}, expected.data), {}, {
      actual: actual,
      options: options
    }));
    return !comparison.failed;
  }

  if (isPrimitive(expected) || isPrimitive(actual)) {
    compareIdentity(comparison, options);
    return !comparison.failed;
  }

  var expectedReference = findPreviousComparison(comparison, function (referenceComparisonCandidate) {
    return referenceComparisonCandidate !== comparison && referenceComparisonCandidate.expected === comparison.expected;
  });

  if (expectedReference) {
    if (expectedReference.actual === comparison.actual) {
      subcompare(comparison, {
        type: "reference",
        actual: expectedReference,
        expected: expectedReference,
        comparer: function comparer() {
          return true;
        },
        options: options
      });
      return true;
    }

    subcompare(comparison, {
      type: "reference",
      actual: findPreviousComparison(comparison, function (referenceComparisonCandidate) {
        return referenceComparisonCandidate !== comparison && referenceComparisonCandidate.actual === comparison.actual;
      }),
      expected: expectedReference,
      comparer: function comparer(_ref8) {
        var actual = _ref8.actual,
            expected = _ref8.expected;
        return actual === expected;
      },
      options: options
    });
    if (comparison.failed) return false; // if we expectedAReference and it did not fail, we are done
    // this expectation was already compared and comparing it again
    // would cause infinite loop

    return true;
  }

  var actualReference = findPreviousComparison(comparison, function (referenceComparisonCandidate) {
    return referenceComparisonCandidate !== comparison && referenceComparisonCandidate.actual === comparison.actual;
  });

  if (actualReference) {
    subcompare(comparison, {
      type: "reference",
      actual: actualReference,
      expected: null,
      comparer: function comparer() {
        return false;
      },
      options: options
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

var subcompare = function subcompare(comparison, _ref9) {
  var type = _ref9.type,
      data = _ref9.data,
      actual = _ref9.actual,
      expected = _ref9.expected,
      _ref9$comparer = _ref9.comparer,
      comparer = _ref9$comparer === void 0 ? defaultComparer : _ref9$comparer,
      options = _ref9.options;
  var subcomparison = createComparison({
    type: type,
    data: data,
    actual: actual,
    expected: expected,
    parent: comparison
  });
  comparison.children.push(subcomparison);
  subcomparison.failed = !comparer(subcomparison, options);
  comparison.failed = subcomparison.failed;
  return subcomparison;
};

var compareIdentity = function compareIdentity(comparison, options) {
  var actual = comparison.actual,
      expected = comparison.expected;
  subcompare(comparison, {
    type: "identity",
    actual: actual,
    expected: expected,
    comparer: function comparer() {
      if (isNegativeZero(expected)) {
        return isNegativeZero(actual);
      }

      if (isNegativeZero(actual)) {
        return isNegativeZero(expected);
      }

      return actual === expected;
    },
    options: options
  });
}; // under some rare and odd circumstances firefox Object.is(-0, -0)
// returns false making test fail.
// it is 100% reproductible with big.test.js.
// However putting debugger or executing Object.is just before the
// comparison prevent Object.is failure.
// It makes me thing there is something strange inside firefox internals.
// All this to say avoid relying on Object.is to test if the value is -0


var isNegativeZero = function isNegativeZero(value) {
  return typeof value === "number" && 1 / value === -Infinity;
};

var comparePrototype = function comparePrototype(comparison, options) {
  subcompare(comparison, {
    type: "prototype",
    actual: Object.getPrototypeOf(comparison.actual),
    expected: Object.getPrototypeOf(comparison.expected),
    options: options
  });
};

var compareExtensibility = function compareExtensibility(comparison, options) {
  subcompare(comparison, {
    type: "extensibility",
    actual: Object.isExtensible(comparison.actual) ? "extensible" : "non-extensible",
    expected: Object.isExtensible(comparison.expected) ? "extensible" : "non-extensible",
    comparer: function comparer(_ref10) {
      var actual = _ref10.actual,
          expected = _ref10.expected;
      return actual === expected;
    },
    options: options
  });
}; // https://tc39.github.io/ecma262/#sec-setintegritylevel


var compareIntegrity = function compareIntegrity(comparison, options) {
  subcompare(comparison, {
    type: "integrity",
    actual: getIntegriy(comparison.actual),
    expected: getIntegriy(comparison.expected),
    comparer: function comparer(_ref11) {
      var actual = _ref11.actual,
          expected = _ref11.expected;
      return actual === expected;
    },
    options: options
  });
};

var getIntegriy = function getIntegriy(value) {
  if (Object.isFrozen(value)) return "frozen";
  if (Object.isSealed(value)) return "sealed";
  return "none";
};

var compareProperties = function compareProperties(comparison, options) {
  var actual = comparison.actual,
      expected = comparison.expected;
  var expectedPropertyNames = Object.getOwnPropertyNames(expected);
  var actualPropertyNames = Object.getOwnPropertyNames(actual);
  var actualMissing = expectedPropertyNames.filter(function (name) {
    return actualPropertyNames.indexOf(name) === -1;
  });
  var actualExtra = actualPropertyNames.filter(function (name) {
    return expectedPropertyNames.indexOf(name) === -1;
  });
  var expectedMissing = [];
  var expectedExtra = [];
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
    comparer: function comparer() {
      return actualMissing.length === 0 && actualExtra.length === 0;
    },
    options: options
  });
  if (comparison.failed) return;

  if (!options.anyOrder) {
    var expectedKeys = Object.keys(expected);
    var actualKeys = Object.keys(actual);
    subcompare(comparison, {
      type: "properties-order",
      actual: actualKeys,
      expected: expectedKeys,
      comparer: function comparer() {
        return expectedKeys.every(function (name, index) {
          return name === actualKeys[index];
        });
      },
      options: options
    });
  }
};

var compareSymbols = function compareSymbols(comparison, options) {
  var actual = comparison.actual,
      expected = comparison.expected;
  var expectedSymbols = Object.getOwnPropertySymbols(expected);
  var actualSymbols = Object.getOwnPropertySymbols(actual);
  var actualMissing = expectedSymbols.filter(function (symbol) {
    return actualSymbols.indexOf(symbol) === -1;
  });
  var actualExtra = actualSymbols.filter(function (symbol) {
    return expectedSymbols.indexOf(symbol) === -1;
  });
  var expectedMissing = [];
  var expectedExtra = [];
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
    comparer: function comparer() {
      return actualMissing.length === 0 && actualExtra.length === 0;
    },
    options: options
  });
  if (comparison.failed) return;

  if (!options.anyOrder) {
    subcompare(comparison, {
      type: "symbols-order",
      actual: actualSymbols,
      expected: expectedSymbols,
      comparer: function comparer() {
        return expectedSymbols.every(function (symbol, index) {
          return symbol === actualSymbols[index];
        });
      },
      options: options
    });
  }
};

var comparePropertiesDescriptors = function comparePropertiesDescriptors(comparison, options) {
  var expected = comparison.expected;
  var expectedPropertyNames = Object.getOwnPropertyNames(expected); // eslint-disable-next-line no-unused-vars

  var _iterator = createForOfIteratorHelper(expectedPropertyNames),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var expectedPropertyName = _step.value;
      comparePropertyDescriptor(comparison, expectedPropertyName, expected, options);
      if (comparison.failed) break;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
};

var compareSymbolsDescriptors = function compareSymbolsDescriptors(comparison, options) {
  var expected = comparison.expected;
  var expectedSymbols = Object.getOwnPropertySymbols(expected); // eslint-disable-next-line no-unused-vars

  var _iterator2 = createForOfIteratorHelper(expectedSymbols),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var expectedSymbol = _step2.value;
      comparePropertyDescriptor(comparison, expectedSymbol, expected, options);
      if (comparison.failed) break;
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
};

var comparePropertyDescriptor = function comparePropertyDescriptor(comparison, property, owner, options) {
  var actual = comparison.actual,
      expected = comparison.expected;
  var expectedDescriptor = Object.getOwnPropertyDescriptor(expected, property);
  var actualDescriptor = Object.getOwnPropertyDescriptor(actual, property);
  if (!actualDescriptor) return;
  var configurableComparison = subcompare(comparison, {
    type: "property-configurable",
    data: property,
    actual: actualDescriptor.configurable ? "configurable" : "non-configurable",
    expected: expectedDescriptor.configurable ? "configurable" : "non-configurable",
    comparer: function comparer(_ref12) {
      var actual = _ref12.actual,
          expected = _ref12.expected;
      return actual === expected;
    },
    options: options
  });
  if (configurableComparison.failed) return;
  var enumerableComparison = subcompare(comparison, {
    type: "property-enumerable",
    data: property,
    actual: actualDescriptor.enumerable ? "enumerable" : "non-enumerable",
    expected: expectedDescriptor.enumerable ? "enumerable" : "non-enumerable",
    comparer: function comparer(_ref13) {
      var actual = _ref13.actual,
          expected = _ref13.expected;
      return actual === expected;
    },
    options: options
  });
  if (enumerableComparison.failed) return;
  var writableComparison = subcompare(comparison, {
    type: "property-writable",
    data: property,
    actual: actualDescriptor.writable ? "writable" : "non-writable",
    expected: expectedDescriptor.writable ? "writable" : "non-writable",
    comparer: function comparer(_ref14) {
      var actual = _ref14.actual,
          expected = _ref14.expected;
      return actual === expected;
    },
    options: options
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

  var getComparison = subcompare(comparison, {
    type: "property-get",
    data: property,
    actual: actualDescriptor.get,
    expected: expectedDescriptor.get,
    options: options
  });
  if (getComparison.failed) return;
  var setComparison = subcompare(comparison, {
    type: "property-set",
    data: property,
    actual: actualDescriptor.set,
    expected: expectedDescriptor.set,
    options: options
  });
  if (setComparison.failed) return;
  var valueComparison = subcompare(comparison, {
    type: "property-value",
    data: isArray(expected) ? propertyToArrayIndex(property) : property,
    actual: actualDescriptor.value,
    expected: expectedDescriptor.value,
    options: options
  });
  if (valueComparison.failed) return;
};

var isRegExpPropertyIgnored = function isRegExpPropertyIgnored(name) {
  return RegExpIgnoredProperties.includes(name);
};

var isFunctionPropertyIgnored = function isFunctionPropertyIgnored(name) {
  return functionIgnoredProperties.includes(name);
};

var isErrorPropertyIgnored = function isErrorPropertyIgnored(name) {
  return errorIgnoredProperties.includes(name);
}; // some regexp properties fails the comparison but that's expected
// to my experience it happens only in webkit.
// check https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/RegExp/input
// to see why these properties exists and would fail between each regex instance


var RegExpIgnoredProperties = ["input", "$_", "lastMatch", "$&", "lastParen", "$+", "leftContext", "$`", "rightContext", "$'"];
var functionIgnoredProperties = [// function caller would fail comparison but that's expected
"caller", // function arguments would fail comparison but that's expected
"arguments"];
var errorIgnoredProperties = [// stack fails comparison but it's not important
"stack", // firefox properties that would fail comparison but that's expected
"file", "fileName", "lineNumber", "columnNumber", // webkit properties that would fail comparison but that's expected
"line", "column"];

var propertyToArrayIndex = function propertyToArrayIndex(property) {
  if (typeof property !== "string") return property;
  var propertyAsNumber = parseInt(property, 10);

  if (Number.isInteger(propertyAsNumber) && propertyAsNumber >= 0) {
    return propertyAsNumber;
  }

  return property;
};

var compareSetEntries = function compareSetEntries(comparison, options) {
  var actual = comparison.actual,
      expected = comparison.expected;
  var expectedEntries = Array.from(expected.values()).map(function (value, index) {
    return {
      index: index,
      value: value
    };
  });
  var actualEntries = Array.from(actual.values()).map(function (value, index) {
    return {
      index: index,
      value: value
    };
  }); // first check actual entries match expected entries
  // eslint-disable-next-line no-unused-vars

  var _iterator3 = createForOfIteratorHelper(actualEntries),
      _step3;

  try {
    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
      var actualEntry = _step3.value;
      var expectedEntry = expectedEntries[actualEntry.index];

      if (expectedEntry) {
        var entryComparison = subcompare(comparison, {
          type: "set-entry",
          data: actualEntry.index,
          actual: actualEntry.value,
          expected: expectedEntry.value,
          options: options
        });
        if (entryComparison.failed) return;
      }
    }
  } catch (err) {
    _iterator3.e(err);
  } finally {
    _iterator3.f();
  }

  var actualSize = actual.size;
  var expectedSize = expected.size;
  var sizeComparison = subcompare(comparison, {
    type: "set-size",
    actual: actualSize,
    expected: expectedSize,
    comparer: function comparer() {
      return actualSize === expectedSize;
    },
    options: options
  });
  if (sizeComparison.failed) return;
};

var compareMapEntries = function compareMapEntries(comparison, options) {
  var actual = comparison.actual,
      expected = comparison.expected;
  var actualEntries = Array.from(actual.keys()).map(function (key) {
    return {
      key: key,
      value: actual.get(key)
    };
  });
  var expectedEntries = Array.from(expected.keys()).map(function (key) {
    return {
      key: key,
      value: expected.get(key)
    };
  });
  var entryMapping = [];
  var expectedEntryCandidates = expectedEntries.slice();
  actualEntries.forEach(function (actualEntry) {
    var expectedEntry = expectedEntryCandidates.find(function (expectedEntryCandidate) {
      var mappingComparison = subcompare(comparison, {
        type: "map-entry-key-mapping",
        actual: actualEntry.key,
        expected: expectedEntryCandidate.key,
        options: options
      });

      if (mappingComparison.failed) {
        comparison.failed = false;
        return false;
      }

      return true;
    });
    if (expectedEntry) expectedEntryCandidates.splice(expectedEntryCandidates.indexOf(expectedEntry), 1);
    entryMapping.push({
      actualEntry: actualEntry,
      expectedEntry: expectedEntry
    });
  }); // should we ensure entries are defined in the same order ?
  // I'm not sure about that, but maybe.
  // in that case, just like for properties order
  // this is the last thing we would check
  // because it gives less information
  // first check all actual entry macthes expected entry

  var index = 0; // eslint-disable-next-line no-unused-vars

  var _loop = function _loop(actualEntry) {
    var actualEntryMapping = entryMapping.find(function (mapping) {
      return mapping.actualEntry === actualEntry;
    });

    if (actualEntryMapping && actualEntryMapping.expectedEntry) {
      var mapEntryComparison = subcompare(comparison, {
        type: "map-entry",
        data: index,
        actual: actualEntry,
        expected: actualEntryMapping.expectedEntry,
        options: options
      });
      if (mapEntryComparison.failed) return {
        v: void 0
      };
    }

    index++;
  };

  var _iterator4 = createForOfIteratorHelper(actualEntries),
      _step4;

  try {
    for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
      var actualEntry = _step4.value;

      var _ret = _loop(actualEntry);

      if (_typeof(_ret) === "object") return _ret.v;
    } // second check there is no unexpected entry

  } catch (err) {
    _iterator4.e(err);
  } finally {
    _iterator4.f();
  }

  var mappingWithoutExpectedEntry = entryMapping.find(function (mapping) {
    return mapping.expectedEntry === undefined;
  });
  var unexpectedEntry = mappingWithoutExpectedEntry ? mappingWithoutExpectedEntry.actualEntry : null;
  var unexpectedEntryComparison = subcompare(comparison, {
    type: "map-entry",
    actual: unexpectedEntry,
    expected: null,
    options: options
  });
  if (unexpectedEntryComparison.failed) return; // third check there is no missing entry (expected but not found)

  var expectedEntryWithoutActualEntry = expectedEntries.find(function (expectedEntry) {
    return entryMapping.every(function (mapping) {
      return mapping.expectedEntry !== expectedEntry;
    });
  });
  var missingEntry = expectedEntryWithoutActualEntry || null;
  var missingEntryComparison = subcompare(comparison, {
    type: "map-entry",
    actual: null,
    expected: missingEntry,
    options: options
  });
  if (missingEntryComparison.failed) return;
};

var compareValueOfReturnValue = function compareValueOfReturnValue(comparison, options) {
  subcompare(comparison, {
    type: "value-of-return-value",
    actual: comparison.actual.valueOf(),
    expected: comparison.expected.valueOf(),
    options: options
  });
};

var compareToStringReturnValue = function compareToStringReturnValue(comparison, options) {
  subcompare(comparison, {
    type: "to-string-return-value",
    actual: comparison.actual.toString(),
    expected: comparison.expected.toString(),
    options: options
  });
};

var valueToType = function valueToType(value) {
  var primitiveType = valueToPrimitiveType(value);

  if (primitiveType === "function") {
    return {
      compositeType: "Function"
    };
  }

  if (primitiveType === "object") {
    var compositeType = valueToCompositeType(value);
    return {
      compositeType: compositeType
    };
  }

  return {
    primitiveType: primitiveType
  };
};
var toString = Object.prototype.toString;

var valueToCompositeType = function valueToCompositeType(object) {
  if (_typeof(object) === "object" && Object.getPrototypeOf(object) === null) return "Object";
  var toStringResult = toString.call(object); // returns format is '[object ${tagName}]';
  // and we want ${tagName}

  var tagName = toStringResult.slice("[object ".length, -1);

  if (tagName === "Object") {
    var objectConstructorName = object.constructor.name;

    if (objectConstructorName !== "Object") {
      return objectConstructorName;
    }
  }

  return tagName;
};

var valueToPrimitiveType = function valueToPrimitiveType(value) {
  if (value === null) {
    return "null";
  }

  if (value === undefined) {
    return "undefined";
  }

  return _typeof(value);
};

var inspectBoolean = function inspectBoolean(value) {
  return value.toString();
};

var inspectNull = function inspectNull() {
  return "null";
};

var inspectNumber = function inspectNumber(value) {
  return isNegativeZero$1(value) ? "-0" : value.toString();
}; // Use this and instead of Object.is(value, -0)
// because in some corner cases firefox returns false
// for Object.is(-0, -0)

var isNegativeZero$1 = function isNegativeZero(value) {
  return value === 0 && 1 / value === -Infinity;
};

// https://github.com/joliss/js-string-escape/blob/master/index.js
// http://javascript.crockford.com/remedial.html
var quote = function quote(value) {
  var string = String(value);
  var i = 0;
  var j = string.length;
  var escapedString = "";

  while (i < j) {
    var char = string[i];
    var escapedChar = void 0;

    if (char === '"' || char === "'" || char === "\\") {
      escapedChar = "\\".concat(char);
    } else if (char === "\n") {
      escapedChar = "\\n";
    } else if (char === "\r") {
      escapedChar = "\\r";
    } else if (char === "\u2028") {
      escapedChar = "\\u2028";
    } else if (char === "\u2029") {
      escapedChar = "\\u2029";
    } else {
      escapedChar = char;
    }

    escapedString += escapedChar;
    i++;
  }

  return escapedString;
};
var preNewLineAndIndentation = function preNewLineAndIndentation(value, _ref) {
  var depth = _ref.depth,
      indentUsingTab = _ref.indentUsingTab,
      indentSize = _ref.indentSize;
  return "".concat(newLineAndIndent({
    count: depth + 1,
    useTabs: indentUsingTab,
    size: indentSize
  })).concat(value);
};

var postNewLineAndIndentation = function postNewLineAndIndentation(_ref2) {
  var depth = _ref2.depth,
      indentUsingTab = _ref2.indentUsingTab,
      indentSize = _ref2.indentSize;
  return newLineAndIndent({
    count: depth,
    useTabs: indentUsingTab,
    size: indentSize
  });
};

var newLineAndIndent = function newLineAndIndent(_ref3) {
  var count = _ref3.count,
      useTabs = _ref3.useTabs,
      size = _ref3.size;

  if (useTabs) {
    // eslint-disable-next-line prefer-template
    return "\n" + "\t".repeat(count);
  } // eslint-disable-next-line prefer-template


  return "\n" + " ".repeat(count * size);
};

var wrapNewLineAndIndentation = function wrapNewLineAndIndentation(value, _ref4) {
  var depth = _ref4.depth,
      indentUsingTab = _ref4.indentUsingTab,
      indentSize = _ref4.indentSize;
  return "".concat(preNewLineAndIndentation(value, {
    depth: depth,
    indentUsingTab: indentUsingTab,
    indentSize: indentSize
  })).concat(postNewLineAndIndentation({
    depth: depth,
    indentUsingTab: indentUsingTab,
    indentSize: indentSize
  }));
};

var inspectString = function inspectString(value, _ref) {
  var singleQuote = _ref.singleQuote;
  var quotedValue = quote(value);
  return singleQuote ? "'".concat(quotedValue, "'") : "\"".concat(quotedValue, "\"");
};

var inspectSymbol = function inspectSymbol(value, _ref) {
  var nestedInspect = _ref.nestedInspect,
      parenthesis = _ref.parenthesis;
  var symbolDescription = symbolToDescription(value);
  var symbolDescriptionSource = symbolDescription ? nestedInspect(symbolDescription) : "";
  var symbolSource = "Symbol(".concat(symbolDescriptionSource, ")");
  if (parenthesis) return "".concat(symbolSource);
  return symbolSource;
};
var symbolToDescription = "description" in Symbol.prototype ? function (symbol) {
  return symbol.description;
} : function (symbol) {
  var toStringResult = symbol.toString();
  var openingParenthesisIndex = toStringResult.indexOf("(");
  var closingParenthesisIndex = toStringResult.indexOf(")");
  var symbolDescription = toStringResult.slice(openingParenthesisIndex + 1, closingParenthesisIndex);
  return symbolDescription;
};

var inspectUndefined = function inspectUndefined() {
  return "undefined";
};

var primitiveMap = {
  boolean: inspectBoolean,
  null: inspectNull,
  number: inspectNumber,
  string: inspectString,
  symbol: inspectSymbol,
  undefined: inspectUndefined
};

var inspectConstructor = function inspectConstructor(value, _ref) {
  var parenthesis = _ref.parenthesis,
      useNew = _ref.useNew;
  var formattedString = value;

  if (parenthesis) {
    formattedString = "(".concat(value, ")");
  }

  if (useNew) {
    formattedString = "new ".concat(formattedString);
  }

  return formattedString;
};

var inspectArray = function inspectArray(value, _ref) {
  var _ref$seen = _ref.seen,
      seen = _ref$seen === void 0 ? [] : _ref$seen,
      nestedInspect = _ref.nestedInspect,
      depth = _ref.depth,
      indentUsingTab = _ref.indentUsingTab,
      indentSize = _ref.indentSize,
      parenthesis = _ref.parenthesis,
      useNew = _ref.useNew;

  if (seen.indexOf(value) > -1) {
    return "Symbol.for('circular')";
  }

  seen.push(value);
  var valuesSource = "";
  var i = 0;
  var j = value.length;

  while (i < j) {
    var valueSource = value.hasOwnProperty(i) ? nestedInspect(value[i], {
      seen: seen
    }) : "";

    if (i === 0) {
      valuesSource += valueSource;
    } else {
      valuesSource += ",".concat(preNewLineAndIndentation(valueSource, {
        depth: depth,
        indentUsingTab: indentUsingTab,
        indentSize: indentSize
      }));
    }

    i++;
  }

  var arraySource;

  if (valuesSource.length) {
    arraySource = wrapNewLineAndIndentation(valuesSource, {
      depth: depth,
      indentUsingTab: indentUsingTab,
      indentSize: indentSize
    });
  } else {
    arraySource = "";
  }

  arraySource = "[".concat(arraySource, "]");
  return inspectConstructor(arraySource, {
    parenthesis: parenthesis,
    useNew: useNew
  });
};

var inspectObject = function inspectObject(value, _ref) {
  var nestedInspect = _ref.nestedInspect,
      _ref$seen = _ref.seen,
      seen = _ref$seen === void 0 ? [] : _ref$seen,
      depth = _ref.depth,
      indentUsingTab = _ref.indentUsingTab,
      indentSize = _ref.indentSize,
      objectConstructor = _ref.objectConstructor,
      parenthesis = _ref.parenthesis,
      useNew = _ref.useNew;
  if (seen.indexOf(value) > -1) return "Symbol.for('circular')";
  seen.push(value);
  var propertySourceArray = [];
  Object.getOwnPropertyNames(value).forEach(function (propertyName) {
    var propertyNameAsNumber = parseInt(propertyName, 10);
    var propertyNameSource = nestedInspect(Number.isInteger(propertyNameAsNumber) ? propertyNameAsNumber : propertyName);
    propertySourceArray.push({
      nameOrSymbolSource: propertyNameSource,
      valueSource: nestedInspect(value[propertyName], {
        seen: seen
      })
    });
  });
  Object.getOwnPropertySymbols(value).forEach(function (symbol) {
    propertySourceArray.push({
      nameOrSymbolSource: "[".concat(nestedInspect(symbol), "]"),
      valueSource: nestedInspect(value[symbol], {
        seen: seen
      })
    });
  });
  var propertiesSource = "";
  propertySourceArray.forEach(function (_ref2, index) {
    var nameOrSymbolSource = _ref2.nameOrSymbolSource,
        valueSource = _ref2.valueSource;

    if (index === 0) {
      propertiesSource += "".concat(nameOrSymbolSource, ": ").concat(valueSource);
    } else {
      propertiesSource += ",".concat(preNewLineAndIndentation("".concat(nameOrSymbolSource, ": ").concat(valueSource), {
        depth: depth,
        indentUsingTab: indentUsingTab,
        indentSize: indentSize
      }));
    }
  });
  var objectSource;

  if (propertiesSource.length) {
    objectSource = "".concat(wrapNewLineAndIndentation(propertiesSource, {
      depth: depth,
      indentUsingTab: indentUsingTab,
      indentSize: indentSize
    }));
  } else {
    objectSource = "";
  }

  if (objectConstructor) {
    objectSource = "Object({".concat(objectSource, "})");
  } else {
    objectSource = "{".concat(objectSource, "}");
  }

  return inspectConstructor(objectSource, {
    parenthesis: parenthesis,
    useNew: useNew
  });
};

var inspectFunction = function inspectFunction(value, _ref) {
  var showFunctionBody = _ref.showFunctionBody,
      parenthesis = _ref.parenthesis,
      depth = _ref.depth;
  var functionSource;

  if (showFunctionBody) {
    functionSource = value.toString();
  } else {
    var isArrowFunction = value.prototype === undefined;
    var head = isArrowFunction ? "() =>" : "function ".concat(depth === 0 ? value.name : "", "()");
    functionSource = "".concat(head, " {/* hidden */}");
  }

  if (parenthesis) {
    return "(".concat(functionSource, ")");
  }

  return functionSource;
};

var inspectDate = function inspectDate(value, _ref) {
  var nestedInspect = _ref.nestedInspect,
      useNew = _ref.useNew,
      parenthesis = _ref.parenthesis;
  var dateSource = nestedInspect(value.valueOf());
  return inspectConstructor("Date(".concat(dateSource, ")"), {
    useNew: useNew,
    parenthesis: parenthesis
  });
};

var inspectNumberObject = function inspectNumberObject(value, _ref) {
  var nestedInspect = _ref.nestedInspect,
      useNew = _ref.useNew,
      parenthesis = _ref.parenthesis;
  var numberSource = nestedInspect(value.valueOf());
  return inspectConstructor("Number(".concat(numberSource, ")"), {
    useNew: useNew,
    parenthesis: parenthesis
  });
};

var inspectStringObject = function inspectStringObject(value, _ref) {
  var nestedInspect = _ref.nestedInspect,
      useNew = _ref.useNew,
      parenthesis = _ref.parenthesis;
  var stringSource = nestedInspect(value.valueOf());
  return inspectConstructor("String(".concat(stringSource, ")"), {
    useNew: useNew,
    parenthesis: parenthesis
  });
};

var inspectBooleanObject = function inspectBooleanObject(value, _ref) {
  var nestedInspect = _ref.nestedInspect,
      useNew = _ref.useNew,
      parenthesis = _ref.parenthesis;
  var booleanSource = nestedInspect(value.valueOf());
  return inspectConstructor("Boolean(".concat(booleanSource, ")"), {
    useNew: useNew,
    parenthesis: parenthesis
  });
};

var inspectError = function inspectError(error, _ref) {
  var nestedInspect = _ref.nestedInspect,
      useNew = _ref.useNew,
      parenthesis = _ref.parenthesis;
  var messageSource = nestedInspect(error.message);
  var errorSource = inspectConstructor("".concat(errorToConstructorName(error), "(").concat(messageSource, ")"), {
    useNew: useNew,
    parenthesis: parenthesis
  });
  return errorSource;
};

var errorToConstructorName = function errorToConstructorName(_ref2) {
  var name = _ref2.name;

  if (derivedErrorNameArray.includes(name)) {
    return name;
  }

  return "Error";
}; // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Error_types


var derivedErrorNameArray = ["EvalError", "RangeError", "ReferenceError", "SyntaxError", "TypeError", "URIError"];

var inspectRegExp = function inspectRegExp(value) {
  return value.toString();
};

var compositeMap = {
  Array: inspectArray,
  Boolean: inspectBooleanObject,
  Error: inspectError,
  Date: inspectDate,
  Function: inspectFunction,
  Number: inspectNumberObject,
  Object: inspectObject,
  RegExp: inspectRegExp,
  String: inspectStringObject
};

var inspect = function inspect(value) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$parenthesis = _ref.parenthesis,
      parenthesis = _ref$parenthesis === void 0 ? false : _ref$parenthesis,
      _ref$singleQuote = _ref.singleQuote,
      singleQuote = _ref$singleQuote === void 0 ? false : _ref$singleQuote,
      _ref$useNew = _ref.useNew,
      useNew = _ref$useNew === void 0 ? false : _ref$useNew,
      _ref$objectConstructo = _ref.objectConstructor,
      objectConstructor = _ref$objectConstructo === void 0 ? false : _ref$objectConstructo,
      _ref$showFunctionBody = _ref.showFunctionBody,
      showFunctionBody = _ref$showFunctionBody === void 0 ? false : _ref$showFunctionBody,
      _ref$indentUsingTab = _ref.indentUsingTab,
      indentUsingTab = _ref$indentUsingTab === void 0 ? false : _ref$indentUsingTab,
      _ref$indentSize = _ref.indentSize,
      indentSize = _ref$indentSize === void 0 ? 2 : _ref$indentSize;

  var scopedInspect = function scopedInspect(scopedValue, scopedOptions) {
    var _valueToType = valueToType(scopedValue),
        primitiveType = _valueToType.primitiveType,
        compositeType = _valueToType.compositeType;

    var options = _objectSpread(_objectSpread({}, scopedOptions), {}, {
      nestedInspect: function nestedInspect(nestedValue) {
        var nestedOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        return scopedInspect(nestedValue, _objectSpread(_objectSpread({}, scopedOptions), {}, {
          depth: scopedOptions.depth + 1
        }, nestedOptions));
      }
    });

    if (primitiveType) return primitiveMap[primitiveType](scopedValue, options);
    if (compositeType in compositeMap) return compositeMap[compositeType](scopedValue, options);
    return inspectConstructor("".concat(compositeType, "(").concat(inspectObject(scopedValue, options), ")"), _objectSpread(_objectSpread({}, options), {}, {
      parenthesis: false
    }));
  };

  return scopedInspect(value, {
    parenthesis: parenthesis,
    singleQuote: singleQuote,
    useNew: useNew,
    objectConstructor: objectConstructor,
    showFunctionBody: showFunctionBody,
    indentUsingTab: indentUsingTab,
    indentSize: indentSize,
    depth: 0
  });
};

var symbolToWellKnownSymbol = function symbolToWellKnownSymbol(symbol) {
  var wellKnownSymbolName = Object.getOwnPropertyNames(Symbol).find(function (name) {
    return symbol === Symbol[name];
  });

  if (wellKnownSymbolName) {
    return "Symbol".concat(propertyToAccessorString(wellKnownSymbolName));
  }

  var description = symbolToDescription$1(symbol);

  if (description) {
    var key = Symbol.keyFor(symbol);

    if (key) {
      return "Symbol.for(".concat(inspect(description), ")");
    }

    return "Symbol(".concat(inspect(description), ")");
  }

  return "Symbol()";
};

var symbolToDescription$1 = function symbolToDescription(symbol) {
  var toStringResult = symbol.toString();
  var openingParenthesisIndex = toStringResult.indexOf("(");
  var closingParenthesisIndex = toStringResult.indexOf(")");
  return toStringResult.slice(openingParenthesisIndex + 1, closingParenthesisIndex); // return symbol.description // does not work on node
};

var propertyNameToDotNotationAllowed = function propertyNameToDotNotationAllowed(propertyName) {
  return /^[a-z_$]+[0-9a-z_&]$/i.test(propertyName) || /^[a-z_$]$/i.test(propertyName);
};

var propertyToAccessorString = function propertyToAccessorString(property) {
  if (typeof property === "number") {
    return "[".concat(inspect(property), "]");
  }

  if (typeof property === "string") {
    var dotNotationAllowedForProperty = propertyNameToDotNotationAllowed(property);

    if (dotNotationAllowedForProperty) {
      return ".".concat(property);
    }

    return "[".concat(inspect(property), "]");
  }

  return "[".concat(symbolToWellKnownSymbol(property), "]");
};

/* eslint-disable no-use-before-define */
var comparisonToPath = function comparisonToPath(comparison) {
  var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "value";
  var comparisonPath = [];
  var ancestor = comparison.parent;

  while (ancestor && ancestor.type !== "root") {
    comparisonPath.unshift(ancestor);
    ancestor = ancestor.parent;
  }

  if (comparison.type !== "root") {
    comparisonPath.push(comparison);
  }

  var path = comparisonPath.reduce(function (previous, _ref) {
    var type = _ref.type,
        data = _ref.data;

    if (type === "property-enumerable") {
      return "".concat(previous).concat(propertyToAccessorString(data), "[[Enumerable]]");
    }

    if (type === "property-configurable") {
      return "".concat(previous).concat(propertyToAccessorString(data), "[[Configurable]]");
    }

    if (type === "property-writable") {
      return "".concat(previous).concat(propertyToAccessorString(data), "[[Writable]]");
    }

    if (type === "property-get") {
      return "".concat(previous).concat(propertyToAccessorString(data), "[[Get]]");
    }

    if (type === "property-set") {
      return "".concat(previous).concat(propertyToAccessorString(data), "[[Set]]");
    }

    if (type === "property-value") {
      return "".concat(previous).concat(propertyToAccessorString(data));
    }

    if (type === "map-entry") {
      return "".concat(previous, "[[mapEntry:").concat(data, "]]");
    }

    if (type === "set-entry") {
      return "".concat(previous, "[[setEntry:").concat(data, "]]");
    }

    if (type === "reference") {
      return "".concat(previous);
    }

    if (type === "integrity") {
      return "".concat(previous, "[[Integrity]]");
    }

    if (type === "extensibility") {
      return "".concat(previous, "[[Extensible]]");
    }

    if (type === "prototype") {
      return "".concat(previous, "[[Prototype]]");
    }

    if (type === "properties") {
      return "".concat(previous);
    }

    if (type === "properties-order") {
      return "".concat(previous);
    }

    if (type === "symbols") {
      return "".concat(previous);
    }

    if (type === "symbols-order") {
      return "".concat(previous);
    }

    if (type === "to-string-return-value") {
      return "".concat(previous, ".toString()");
    }

    if (type === "value-of-return-value") {
      return "".concat(previous, ".valueOf()");
    }

    if (type === "identity" || type === "not") {
      return previous;
    }

    if (type === "any") {
      return previous;
    }

    return "".concat(previous, " type:").concat(type, ", data:").concat(data);
  }, name);
  return path;
};

var arrayWithoutHoles = (function (arr) {
  if (Array.isArray(arr)) return arrayLikeToArray(arr);
});

// eslint-disable-next-line consistent-return
var iterableToArray = (function (iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
});

var nonIterableSpread = (function () {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
});

var _toConsumableArray = (function (arr) {
  return arrayWithoutHoles(arr) || iterableToArray(arr) || unsupportedIterableToArray(arr) || nonIterableSpread();
});

var valueToWellKnown = function valueToWellKnown(value) {
  var compositeWellKnownPath = valueToCompositeWellKnownPath(value);

  if (compositeWellKnownPath) {
    return compositeWellKnownPath.slice(1).reduce(function (previous, property) {
      return "".concat(previous).concat(propertyToAccessorString(property));
    }, compositeWellKnownPath[0]);
  }

  return null;
}; // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap

var compositeWellKnownMap = new WeakMap();
var primitiveWellKnownMap = new Map();

var valueToCompositeWellKnownPath = function valueToCompositeWellKnownPath(value) {
  return compositeWellKnownMap.get(value);
};

var isPrimitive$1 = function isPrimitive(value) {
  return !isComposite(value);
};

var addWellKnownComposite = function addWellKnownComposite(value, name) {
  var visitValue = function visitValue(value, path) {
    if (isPrimitive$1(value)) {
      primitiveWellKnownMap.set(value, path);
      return;
    }

    if (compositeWellKnownMap.has(value)) return; // prevent infinite recursion

    compositeWellKnownMap.set(value, path);

    var visitProperty = function visitProperty(property) {
      var descriptor;

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
        var propertyValue = descriptor.value;
        visitValue(propertyValue, [].concat(_toConsumableArray(path), [property]));
      }
    };

    Object.getOwnPropertyNames(value).forEach(function (name) {
      return visitProperty(name);
    });
    Object.getOwnPropertySymbols(value).forEach(function (symbol) {
      return visitProperty(symbol);
    });
  };

  visitValue(value, [name]);
};

if ((typeof global === "undefined" ? "undefined" : _typeof(global)) === "object") {
  addWellKnownComposite(global, "global");
}

if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === "object") {
  addWellKnownComposite(window, "window");
}

var valueToString = function valueToString(value) {
  return valueToWellKnown(value) || inspect(value);
};

var anyComparisonToErrorMessage = function anyComparisonToErrorMessage(comparison) {
  if (comparison.type !== "any") return undefined;
  var path = comparisonToPath(comparison);
  var actualValue = valueToString(comparison.actual);
  var expectedConstructor = comparison.expected;
  return createAnyMessage({
    path: path,
    expectedConstructor: expectedConstructor,
    actualValue: actualValue
  });
};

var createAnyMessage = function createAnyMessage(_ref) {
  var path = _ref.path,
      expectedConstructor = _ref.expectedConstructor,
      actualValue = _ref.actualValue;
  return "unexpected value.\n--- found ---\n".concat(actualValue, "\n--- expected ---\nany(").concat(expectedConstructor.name, ")\n--- at ---\n").concat(path);
};

var defaultComparisonToErrorMessage = function defaultComparisonToErrorMessage(comparison) {
  var path = comparisonToPath(comparison);
  var expectedValue = valueToString(comparison.expected);
  var actualValue = valueToString(comparison.actual);
  return createUnequalValuesMessage({
    path: path,
    expectedValue: expectedValue,
    actualValue: actualValue
  });
};

var createUnequalValuesMessage = function createUnequalValuesMessage(_ref) {
  var path = _ref.path,
      expectedValue = _ref.expectedValue,
      actualValue = _ref.actualValue;
  return "unequal values.\n--- found ---\n".concat(actualValue, "\n--- expected ---\n").concat(expectedValue, "\n--- at ---\n").concat(path);
};

var referenceComparisonToErrorMessage = function referenceComparisonToErrorMessage(comparison) {
  if (comparison.type !== "reference") return undefined;
  var actual = comparison.actual,
      expected = comparison.expected;
  var isMissing = expected && !actual;
  var isExtra = !expected && actual;
  var path = comparisonToPath(comparison);

  if (isExtra) {
    return createUnexpectedReferenceMessage({
      path: path,
      expectedValue: valueToString(comparison.parent.expected),
      unexpectedReferencePath: comparisonToPath(actual, "actual")
    });
  }

  if (isMissing) {
    return createMissingReferenceMessage({
      path: path,
      expectedReferencePath: comparisonToPath(expected, "expected"),
      actualValue: valueToString(comparison.parent.actual)
    });
  }

  return createUnequalRefencesMessage({
    path: path,
    expectedReferencePath: comparisonToPath(expected, "expected"),
    actualReferencePath: comparisonToPath(actual, "actual")
  });
};

var createUnexpectedReferenceMessage = function createUnexpectedReferenceMessage(_ref) {
  var path = _ref.path,
      expectedValue = _ref.expectedValue,
      unexpectedReferencePath = _ref.unexpectedReferencePath;
  return "found a reference instead of a value.\n--- reference found to ---\n".concat(unexpectedReferencePath, "\n--- value expected ---\n").concat(expectedValue, "\n--- at ---\n").concat(path);
};

var createMissingReferenceMessage = function createMissingReferenceMessage(_ref2) {
  var path = _ref2.path,
      expectedReferencePath = _ref2.expectedReferencePath,
      actualValue = _ref2.actualValue;
  return "found a value instead of a reference.\n--- value found ---\n".concat(actualValue, "\n--- reference expected to ---\n").concat(expectedReferencePath, "\n--- at ---\n").concat(path);
};

var createUnequalRefencesMessage = function createUnequalRefencesMessage(_ref3) {
  var path = _ref3.path,
      expectedReferencePath = _ref3.expectedReferencePath,
      actualReferencePath = _ref3.actualReferencePath;
  return "unequal references.\n--- reference found to ---\n".concat(actualReferencePath, "\n--- reference expected to ---\n").concat(expectedReferencePath, "\n--- at ---\n").concat(path);
};

var comparisonToRootComparison = function comparisonToRootComparison(comparison) {
  var current = comparison;

  while (current) {
    if (current.parent) {
      current = current.parent;
    } else {
      break;
    }
  }

  return current;
};

var findSelfOrAncestorComparison = function findSelfOrAncestorComparison(comparison, predicate) {
  var current = comparison;
  var foundComparison;

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

var prototypeComparisonToErrorMessage = function prototypeComparisonToErrorMessage(comparison) {
  var prototypeComparison = findSelfOrAncestorComparison(comparison, function (_ref) {
    var type = _ref.type;
    return type === "prototype";
  });
  if (!prototypeComparison) return null;
  var rootComparison = comparisonToRootComparison(comparison);
  var path = comparisonToPath(prototypeComparison);

  var prototypeToString = function prototypeToString(prototype) {
    var wellKnown = valueToWellKnown(prototype);
    if (wellKnown) return wellKnown; // we could check in the whole comparison tree, not only for actual/expected
    // but any reference to that prototype
    // to have a better name for it
    // if anything refer to it except himself
    // it would be a better name for that object no ?

    if (prototype === rootComparison.expected) return "expected";
    if (prototype === rootComparison.actual) return "actual";
    return inspect(prototype);
  };

  var expectedPrototype = prototypeComparison.expected;
  var actualPrototype = prototypeComparison.actual;
  return createUnequalPrototypesMessage({
    path: path,
    expectedPrototype: prototypeToString(expectedPrototype),
    actualPrototype: prototypeToString(actualPrototype)
  });
};

var createUnequalPrototypesMessage = function createUnequalPrototypesMessage(_ref2) {
  var path = _ref2.path,
      expectedPrototype = _ref2.expectedPrototype,
      actualPrototype = _ref2.actualPrototype;
  return "unequal prototypes.\n--- prototype found ---\n".concat(actualPrototype, "\n--- prototype expected ---\n").concat(expectedPrototype, "\n--- at ---\n").concat(path);
};

var createDetailedMessage = function createDetailedMessage(message) {
  var details = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var string = "".concat(message);
  Object.keys(details).forEach(function (key) {
    var value = details[key];
    string += "\n--- ".concat(key, " ---\n").concat(Array.isArray(value) ? value.join("\n") : value);
  });
  return string;
};

var propertiesComparisonToErrorMessage = function propertiesComparisonToErrorMessage(comparison) {
  var _createDetailedMessag;

  if (comparison.type !== "properties") {
    return undefined;
  }

  var path = comparisonToPath(comparison.parent);
  var missing = comparison.actual.missing;
  var extra = comparison.actual.extra;
  var missingCount = missing.length;
  var extraCount = extra.length;
  var unexpectedProperties = {};
  extra.forEach(function (propertyName) {
    unexpectedProperties[propertyName] = comparison.parent.actual[propertyName];
  });
  var missingProperties = {};
  missing.forEach(function (propertyName) {
    missingProperties[propertyName] = comparison.parent.expected[propertyName];
  });

  if (missingCount === 1 && extraCount === 0) {
    return createDetailedMessage("1 missing property.", {
      "missing property": inspect(missingProperties),
      "at": path
    });
  }

  if (missingCount > 1 && extraCount === 0) {
    return createDetailedMessage("".concat(missingCount, " missing properties."), {
      "missing properties": inspect(missingProperties),
      "at": path
    });
  }

  if (missingCount === 0 && extraCount === 1) {
    return createDetailedMessage("1 unexpected property.", {
      "unexpected property": inspect(unexpectedProperties),
      "at": path
    });
  }

  if (missingCount === 0 && extraCount > 1) {
    return createDetailedMessage("".concat(extraCount, " unexpected properties."), {
      "unexpected properties": inspect(unexpectedProperties),
      "at": path
    });
  }

  var message = "";

  if (missingCount === 1) {
    message += "1 missing property";
  } else {
    message += "".concat(missingCount, " missing properties");
  }

  if (extraCount === 1) {
    message += " and 1 unexpected property.";
  } else {
    message += " and ".concat(extraCount, " unexpected properties.");
  }

  return createDetailedMessage(message, (_createDetailedMessag = {}, _defineProperty(_createDetailedMessag, missingCount === 1 ? "missing property" : "missing properties", inspect(missingProperties)), _defineProperty(_createDetailedMessag, extraCount === 1 ? "unexpected property" : "unexpected properties", inspect(unexpectedProperties)), _defineProperty(_createDetailedMessag, "at", path), _createDetailedMessag));
};

var propertiesOrderComparisonToErrorMessage = function propertiesOrderComparisonToErrorMessage(comparison) {
  if (comparison.type !== "properties-order") return undefined;
  var path = comparisonToPath(comparison);
  var expected = comparison.expected;
  var actual = comparison.actual;
  return createUnexpectedPropertiesOrderMessage({
    path: path,
    expectedPropertiesOrder: propertyNameArrayToString(expected),
    actualPropertiesOrder: propertyNameArrayToString(actual)
  });
};

var createUnexpectedPropertiesOrderMessage = function createUnexpectedPropertiesOrderMessage(_ref) {
  var path = _ref.path,
      expectedPropertiesOrder = _ref.expectedPropertiesOrder,
      actualPropertiesOrder = _ref.actualPropertiesOrder;
  return "unexpected properties order.\n--- properties order found ---\n".concat(actualPropertiesOrder.join("\n"), "\n--- properties order expected ---\n").concat(expectedPropertiesOrder.join("\n"), "\n--- at ---\n").concat(path);
};

var propertyNameArrayToString = function propertyNameArrayToString(propertyNameArray) {
  return propertyNameArray.map(function (propertyName) {
    return inspect(propertyName);
  });
};

var symbolsComparisonToErrorMessage = function symbolsComparisonToErrorMessage(comparison) {
  if (comparison.type !== "symbols") return undefined;
  var path = comparisonToPath(comparison);
  var extra = comparison.actual.extra;
  var missing = comparison.actual.missing;
  var hasExtra = extra.length > 0;
  var hasMissing = missing.length > 0;

  if (hasExtra && !hasMissing) {
    return createUnexpectedSymbolsMessage({
      path: path,
      unexpectedSymbols: symbolArrayToString(extra)
    });
  }

  if (!hasExtra && hasMissing) {
    return createMissingSymbolsMessage({
      path: path,
      missingSymbols: symbolArrayToString(missing)
    });
  }

  return createUnexpectedAndMissingSymbolsMessage({
    path: path,
    unexpectedSymbols: symbolArrayToString(extra),
    missingSymbols: symbolArrayToString(missing)
  });
};

var createUnexpectedSymbolsMessage = function createUnexpectedSymbolsMessage(_ref) {
  var path = _ref.path,
      unexpectedSymbols = _ref.unexpectedSymbols;
  return "unexpected symbols.\n--- unexpected symbol list ---\n".concat(unexpectedSymbols.join("\n"), "\n--- at ---\n").concat(path);
};

var createMissingSymbolsMessage = function createMissingSymbolsMessage(_ref2) {
  var path = _ref2.path,
      missingSymbols = _ref2.missingSymbols;
  return "missing symbols.\n--- missing symbol list ---\n".concat(missingSymbols.join("\n"), "\n--- at ---\n").concat(path);
};

var createUnexpectedAndMissingSymbolsMessage = function createUnexpectedAndMissingSymbolsMessage(_ref3) {
  var path = _ref3.path,
      unexpectedSymbols = _ref3.unexpectedSymbols,
      missingSymbols = _ref3.missingSymbols;
  return "unexpected and missing symbols.\n--- unexpected symbol list ---\n".concat(unexpectedSymbols.join("\n"), "\n--- missing symbol list ---\n").concat(missingSymbols.join("\n"), "\n--- at ---\n").concat(path);
};

var symbolArrayToString = function symbolArrayToString(symbolArray) {
  return symbolArray.map(function (symbol) {
    return inspect(symbol);
  });
};

var symbolsOrderComparisonToErrorMessage = function symbolsOrderComparisonToErrorMessage(comparison) {
  if (comparison.type !== "symbols-order") return undefined;
  var path = comparisonToPath(comparison);
  var expected = comparison.expected;
  var actual = comparison.actual;
  return createUnexpectedSymbolsOrderMessage({
    path: path,
    expectedSymbolsOrder: symbolArrayToString$1(expected),
    actualSymbolsOrder: symbolArrayToString$1(actual)
  });
};

var createUnexpectedSymbolsOrderMessage = function createUnexpectedSymbolsOrderMessage(_ref) {
  var path = _ref.path,
      expectedSymbolsOrder = _ref.expectedSymbolsOrder,
      actualSymbolsOrder = _ref.actualSymbolsOrder;
  return "unexpected symbols order.\n--- symbols order found ---\n".concat(actualSymbolsOrder.join("\n"), "\n--- symbols order expected ---\n").concat(expectedSymbolsOrder.join("\n"), "\n--- at ---\n").concat(path);
};

var symbolArrayToString$1 = function symbolArrayToString(symbolArray) {
  return symbolArray.map(function (symbol) {
    return inspect(symbol);
  });
};

var setSizeComparisonToMessage = function setSizeComparisonToMessage(comparison) {
  if (comparison.type !== "set-size") return undefined;
  if (comparison.actual > comparison.expected) return createBiggerThanExpectedMessage(comparison);
  return createSmallerThanExpectedMessage(comparison);
};

var createBiggerThanExpectedMessage = function createBiggerThanExpectedMessage(comparison) {
  return "a set is bigger than expected.\n--- set size found ---\n".concat(comparison.actual, "\n--- set size expected ---\n").concat(comparison.expected, "\n--- at ---\n").concat(comparisonToPath(comparison.parent));
};

var createSmallerThanExpectedMessage = function createSmallerThanExpectedMessage(comparison) {
  return "a set is smaller than expected.\n--- set size found ---\n".concat(comparison.actual, "\n--- set size expected ---\n").concat(comparison.expected, "\n--- at ---\n").concat(comparisonToPath(comparison.parent));
};

var mapEntryComparisonToErrorMessage = function mapEntryComparisonToErrorMessage(comparison) {
  var mapEntryComparison = findSelfOrAncestorComparison(comparison, function (_ref) {
    var type = _ref.type;
    return type === "map-entry";
  });
  if (!mapEntryComparison) return null;
  var isUnexpected = !mapEntryComparison.expected && mapEntryComparison.actual;
  if (isUnexpected) return createUnexpectedMapEntryErrorMessage(mapEntryComparison);
  var isMissing = mapEntryComparison.expected && !mapEntryComparison.actual;
  if (isMissing) return createMissingMapEntryErrorMessage(mapEntryComparison);
  return null;
};

var createUnexpectedMapEntryErrorMessage = function createUnexpectedMapEntryErrorMessage(comparison) {
  return "an entry is unexpected.\n--- unexpected entry key ---\n".concat(valueToString(comparison.actual.key), "\n--- unexpected entry value ---\n").concat(valueToString(comparison.actual.value), "\n--- at ---\n").concat(comparisonToPath(comparison.parent));
};

var createMissingMapEntryErrorMessage = function createMissingMapEntryErrorMessage(comparison) {
  return "an entry is missing.\n--- missing entry key ---\n".concat(valueToString(comparison.expected.key), "\n--- missing entry value ---\n").concat(valueToString(comparison.expected.value), "\n--- at ---\n").concat(comparisonToPath(comparison.parent));
};

var notComparisonToErrorMessage = function notComparisonToErrorMessage(comparison) {
  if (comparison.type !== "not") return undefined;
  var path = comparisonToPath(comparison);
  var actualValue = valueToString(comparison.actual);
  return createNotMessage({
    path: path,
    actualValue: actualValue
  });
};

var createNotMessage = function createNotMessage(_ref) {
  var path = _ref.path,
      actualValue = _ref.actualValue;
  return "unexpected value.\n--- found ---\n".concat(actualValue, "\n--- expected ---\nan other value\n--- at ---\n").concat(path);
};

var arrayLengthComparisonToMessage = function arrayLengthComparisonToMessage(comparison) {
  if (comparison.type !== "identity") return undefined;
  var parentComparison = comparison.parent;
  if (parentComparison.type !== "property-value") return undefined;
  if (parentComparison.data !== "length") return undefined;
  var grandParentComparison = parentComparison.parent;
  if (!isArray(grandParentComparison.actual)) return undefined;
  var actualArray = grandParentComparison.actual;
  var expectedArray = grandParentComparison.expected;
  var actualLength = comparison.actual;
  var expectedLength = comparison.expected;
  var path = comparisonToPath(grandParentComparison);

  if (actualLength < expectedLength) {
    var missingValues = expectedArray.slice(actualLength);
    return createDetailedMessage("an array is smaller than expected.", {
      "array length found": actualLength,
      "array length expected": expectedLength,
      "missing values": inspect(missingValues),
      "at": path
    });
  }

  var extraValues = actualArray.slice(expectedLength);
  return createDetailedMessage("an array is bigger than expected.", {
    "array length found": actualLength,
    "array length expected": expectedLength,
    "extra values": inspect(extraValues),
    "at": path
  });
};

/* eslint-disable import/max-dependencies */
var comparisonToErrorMessage = function comparisonToErrorMessage(comparison) {
  var failedComparison = deepestComparison(comparison);
  return firstFunctionReturningSomething([anyComparisonToErrorMessage, mapEntryComparisonToErrorMessage, notComparisonToErrorMessage, prototypeComparisonToErrorMessage, referenceComparisonToErrorMessage, propertiesComparisonToErrorMessage, propertiesOrderComparisonToErrorMessage, symbolsComparisonToErrorMessage, symbolsOrderComparisonToErrorMessage, setSizeComparisonToMessage, arrayLengthComparisonToMessage], failedComparison) || defaultComparisonToErrorMessage(failedComparison);
};

var deepestComparison = function deepestComparison(comparison) {
  var current = comparison;

  while (current) {
    var _current = current,
        children = _current.children;
    if (children.length === 0) break;
    current = children[children.length - 1];
  }

  return current;
};

var firstFunctionReturningSomething = function firstFunctionReturningSomething(fns) {
  var i = 0;

  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  while (i < fns.length) {
    var fn = fns[i];
    var returnValue = fn.apply(void 0, args);
    if (returnValue !== null && returnValue !== undefined) return returnValue;
    i++;
  }

  return undefined;
};

var isAssertionError = function isAssertionError(value) {
  return value && _typeof(value) === "object" && value.name === "AssertionError";
};
var createAssertionError = function createAssertionError(message) {
  var error = new Error(message);
  error.name = "AssertionError";
  return error;
};

var assert = function assert() {
  if (arguments.length === 0) {
    throw new Error("assert must be called with { actual, expected }, missing first argument");
  }

  if (arguments.length > 1) {
    throw new Error("assert must be called with { actual, expected }, received too much arguments");
  }

  var firstArg = arguments.length <= 0 ? undefined : arguments[0];

  if (_typeof(firstArg) !== "object" || firstArg === null) {
    throw new Error("assert must be called with { actual, expected }, received ".concat(firstArg, " as first argument instead of object"));
  }

  if ("actual" in firstArg === false) {
    throw new Error("assert must be called with { actual, expected }, missing actual property on first argument");
  }

  if ("expected" in firstArg === false) {
    throw new Error("assert must be called with { actual, expected }, missing expected property on first argument");
  }

  return _assert.apply(void 0, arguments);
};

assert.not = function (value) {
  return createNotExpectation(value);
};

assert.any = function (Constructor) {
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


var _assert = function _assert(_ref) {
  var actual = _ref.actual,
      expected = _ref.expected,
      message = _ref.message,
      _ref$anyOrder = _ref.anyOrder,
      anyOrder = _ref$anyOrder === void 0 ? false : _ref$anyOrder;
  var expectation = {
    actual: actual,
    expected: expected
  };
  var comparison = compare(expectation, {
    anyOrder: anyOrder
  });

  if (comparison.failed) {
    var error = createAssertionError(message || comparisonToErrorMessage(comparison));
    if (Error.captureStackTrace) Error.captureStackTrace(error, assert);
    throw error;
  }
};

export { assert, createAssertionError, isAssertionError };

//# sourceMappingURL=main.js.map