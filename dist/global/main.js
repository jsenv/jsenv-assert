var __jsenv_assert__ = function (exports) {
  'use strict';

  var nativeTypeOf = function nativeTypeOf(obj) {
    return typeof obj;
  };

  var customTypeOf = function customTypeOf(obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? nativeTypeOf : customTypeOf;

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

  var somePrototypeMatch = function somePrototypeMatch(value, predicate) {
    var prototype = Object.getPrototypeOf(value);

    while (prototype) {
      if (predicate(prototype)) return true;
      prototype = Object.getPrototypeOf(prototype);
    }

    return false;
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

  var compare = function compare(_ref) {
    var actual = _ref.actual,
        expected = _ref.expected;
    var comparison = createComparison({
      type: "root",
      actual: actual,
      expected: expected
    });
    comparison.failed = !defaultComparer(comparison);
    return comparison;
  };

  var createComparison = function createComparison(_ref2) {
    var type = _ref2.type,
        data = _ref2.data,
        actual = _ref2.actual,
        expected = _ref2.expected,
        _ref2$parent = _ref2.parent,
        parent = _ref2$parent === void 0 ? null : _ref2$parent,
        _ref2$children = _ref2.children,
        children = _ref2$children === void 0 ? [] : _ref2$children;
    var comparison = {
      type: type,
      data: data,
      actual: actual,
      expected: expected,
      parent: parent,
      children: children
    };
    return comparison;
  };

  var defaultComparer = function defaultComparer(comparison) {
    var actual = comparison.actual,
        expected = comparison.expected;

    if (isPrimitive(expected) || isPrimitive(actual)) {
      compareIdentity(comparison);
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
          }
        });
        return true;
      }

      subcompare(comparison, {
        type: "reference",
        actual: findPreviousComparison(comparison, function (referenceComparisonCandidate) {
          return referenceComparisonCandidate !== comparison && referenceComparisonCandidate.actual === comparison.actual;
        }),
        expected: expectedReference,
        comparer: function comparer(_ref3) {
          var actual = _ref3.actual,
              expected = _ref3.expected;
          return actual === expected;
        }
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
        }
      });
      return false;
    }

    compareIdentity(comparison); // actual === expected, no need to compare prototype, properties, ...

    if (!comparison.failed) return true;
    comparison.failed = false;
    comparePrototype(comparison);
    if (comparison.failed) return false;
    compareIntegrity(comparison);
    if (comparison.failed) return false;
    compareExtensibility(comparison);
    if (comparison.failed) return false;
    comparePropertiesDescriptors(comparison);
    if (comparison.failed) return false;
    compareProperties(comparison);
    if (comparison.failed) return false;
    compareSymbolsDescriptors(comparison);
    if (comparison.failed) return false;
    compareSymbols(comparison);
    if (comparison.failed) return false;

    if (typeof Set === "function" && isSet(expected)) {
      compareSetEntries(comparison);
      if (comparison.failed) return false;
    }

    if (typeof Map === "function" && isMap(expected)) {
      compareMapEntries(comparison);
      if (comparison.failed) return false;
    }

    if ("valueOf" in expected && typeof expected.valueOf === "function") {
      // always keep this one after properties because we must first ensure
      // valueOf is on both actual and expected
      // usefull because new Date(10).valueOf() === 10
      // or new Boolean(true).valueOf() === true
      compareValueOfReturnValue(comparison);
      if (comparison.failed) return false;
    } // required otherwise assert({ actual: /a/, expected: /b/ }) would not throw


    if (isRegExp(expected)) {
      compareToStringReturnValue(comparison);
      if (comparison.failed) return false;
    }

    return true;
  };

  var subcompare = function subcompare(comparison, _ref4) {
    var type = _ref4.type,
        data = _ref4.data,
        actual = _ref4.actual,
        expected = _ref4.expected,
        _ref4$comparer = _ref4.comparer,
        comparer = _ref4$comparer === void 0 ? defaultComparer : _ref4$comparer;
    var subcomparison = createComparison({
      type: type,
      data: data,
      actual: actual,
      expected: expected,
      parent: comparison
    });
    comparison.children.push(subcomparison);
    subcomparison.failed = !comparer(subcomparison);
    comparison.failed = subcomparison.failed;
    return subcomparison;
  };

  var compareIdentity = function compareIdentity(comparison) {
    var actual = comparison.actual,
        expected = comparison.expected;
    subcompare(comparison, {
      type: "identity",
      actual: actual,
      expected: expected,
      comparer: function comparer() {
        if (Object.is(expected, -0)) {
          return Object.is(actual, -0);
        }

        if (Object.is(actual, -0)) {
          return Object.is(expected, -0);
        }

        return actual === expected;
      }
    });
  };

  var comparePrototype = function comparePrototype(comparison) {
    subcompare(comparison, {
      type: "prototype",
      actual: Object.getPrototypeOf(comparison.actual),
      expected: Object.getPrototypeOf(comparison.expected)
    });
  };

  var compareExtensibility = function compareExtensibility(comparison) {
    subcompare(comparison, {
      type: "extensibility",
      actual: Object.isExtensible(comparison.actual) ? "extensible" : "non-extensible",
      expected: Object.isExtensible(comparison.expected) ? "extensible" : "non-extensible",
      comparer: function comparer(_ref5) {
        var actual = _ref5.actual,
            expected = _ref5.expected;
        return actual === expected;
      }
    });
  }; // https://tc39.github.io/ecma262/#sec-setintegritylevel


  var compareIntegrity = function compareIntegrity(comparison) {
    subcompare(comparison, {
      type: "integrity",
      actual: getIntegriy(comparison.actual),
      expected: getIntegriy(comparison.expected),
      comparer: function comparer(_ref6) {
        var actual = _ref6.actual,
            expected = _ref6.expected;
        return actual === expected;
      }
    });
  };

  var getIntegriy = function getIntegriy(value) {
    if (Object.isFrozen(value)) return "frozen";
    if (Object.isSealed(value)) return "sealed";
    return "none";
  };

  var compareProperties = function compareProperties(comparison) {
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
      }
    });
    if (comparison.failed) return;
    subcompare(comparison, {
      type: "properties-order",
      actual: actualPropertyNames,
      expected: expectedPropertyNames,
      comparer: function comparer() {
        return expectedPropertyNames.every(function (name, index) {
          return name === actualPropertyNames[index];
        });
      }
    });
  };

  var compareSymbols = function compareSymbols(comparison) {
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
      }
    });
    if (comparison.failed) return;
    subcompare(comparison, {
      type: "symbols-order",
      actual: actualSymbols,
      expected: expectedSymbols,
      comparer: function comparer() {
        return expectedSymbols.every(function (symbol, index) {
          return symbol === actualSymbols[index];
        });
      }
    });
  };

  var comparePropertiesDescriptors = function comparePropertiesDescriptors(comparison) {
    var expected = comparison.expected;
    var expectedPropertyNames = Object.getOwnPropertyNames(expected); // eslint-disable-next-line no-unused-vars

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = expectedPropertyNames[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _expectedPropertyName = _step.value;
        comparePropertyDescriptor(comparison, _expectedPropertyName, expected);
        if (comparison.failed) break;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  };

  var compareSymbolsDescriptors = function compareSymbolsDescriptors(comparison) {
    var expected = comparison.expected;
    var expectedSymbols = Object.getOwnPropertySymbols(expected); // eslint-disable-next-line no-unused-vars

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = expectedSymbols[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var _expectedSymbol = _step2.value;
        comparePropertyDescriptor(comparison, _expectedSymbol, expected);
        if (comparison.failed) break;
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  };

  var comparePropertyDescriptor = function comparePropertyDescriptor(comparison, property, owner) {
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
      comparer: function comparer(_ref7) {
        var actual = _ref7.actual,
            expected = _ref7.expected;
        return actual === expected;
      }
    });
    if (configurableComparison.failed) return;
    var enumerableComparison = subcompare(comparison, {
      type: "property-enumerable",
      data: property,
      actual: actualDescriptor.enumerable ? "enumerable" : "non-enumerable",
      expected: expectedDescriptor.enumerable ? "enumerable" : "non-enumerable",
      comparer: function comparer(_ref8) {
        var actual = _ref8.actual,
            expected = _ref8.expected;
        return actual === expected;
      }
    });
    if (enumerableComparison.failed) return;
    var writableComparison = subcompare(comparison, {
      type: "property-writable",
      data: property,
      actual: actualDescriptor.writable ? "writable" : "non-writable",
      expected: expectedDescriptor.writable ? "writable" : "non-writable",
      comparer: function comparer(_ref9) {
        var actual = _ref9.actual,
            expected = _ref9.expected;
        return actual === expected;
      }
    });
    if (writableComparison.failed) return;

    if (isError(owner)) {
      // error stack always differ, ignore it
      if (property === "stack") return;
    }

    if (typeof owner === "function") {
      // function caller could differ but we want to ignore that
      if (property === "caller") return; // function arguments could differ but we want to ignore that

      if (property === "arguments") return;
    }

    var getComparison = subcompare(comparison, {
      type: "property-get",
      data: property,
      actual: actualDescriptor.get,
      expected: expectedDescriptor.get
    });
    if (getComparison.failed) return;
    var setComparison = subcompare(comparison, {
      type: "property-set",
      data: property,
      actual: actualDescriptor.set,
      expected: expectedDescriptor.set
    });
    if (setComparison.failed) return;
    var valueComparison = subcompare(comparison, {
      type: "property-value",
      data: isArray(expected) ? propertyToArrayIndex(property) : property,
      actual: actualDescriptor.value,
      expected: expectedDescriptor.value
    });
    if (valueComparison.failed) return;
  };

  var propertyToArrayIndex = function propertyToArrayIndex(property) {
    if (typeof property !== "string") return property;
    var propertyAsNumber = parseInt(property, 10);

    if (Number.isInteger(propertyAsNumber) && propertyAsNumber >= 0) {
      return propertyAsNumber;
    }

    return property;
  };

  var compareSetEntries = function compareSetEntries(comparison) {
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

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = actualEntries[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var _actualEntry = _step3.value;
        var _expectedEntry = expectedEntries[_actualEntry.index];

        if (_expectedEntry) {
          var entryComparison = subcompare(comparison, {
            type: "set-entry",
            data: _actualEntry.index,
            actual: _actualEntry.value,
            expected: _expectedEntry.value
          });
          if (entryComparison.failed) return;
        }
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    var actualSize = actual.size;
    var expectedSize = expected.size;
    var sizeComparison = subcompare(comparison, {
      type: "set-size",
      actual: actualSize,
      expected: expectedSize,
      comparer: function comparer() {
        return actualSize === expectedSize;
      }
    });
    if (sizeComparison.failed) return;
  };

  var compareMapEntries = function compareMapEntries(comparison) {
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
          expected: expectedEntryCandidate.key
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
          expected: actualEntryMapping.expectedEntry
        });
        if (mapEntryComparison.failed) return {
          v: void 0
        };
      }

      index++;
    };

    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = actualEntries[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var actualEntry = _step4.value;

        var _ret = _loop(actualEntry);

        if (_typeof(_ret) === "object") return _ret.v;
      } // second check there is no unexpected entry

    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }

    var mappingWithoutExpectedEntry = entryMapping.find(function (mapping) {
      return mapping.expectedEntry === undefined;
    });
    var unexpectedEntry = mappingWithoutExpectedEntry ? mappingWithoutExpectedEntry.actualEntry : null;
    var unexpectedEntryComparison = subcompare(comparison, {
      type: "map-entry",
      actual: unexpectedEntry,
      expected: null
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
      expected: missingEntry
    });
    if (missingEntryComparison.failed) return;
  };

  var compareValueOfReturnValue = function compareValueOfReturnValue(comparison) {
    subcompare(comparison, {
      type: "value-of-return-value",
      actual: comparison.actual.valueOf(),
      expected: comparison.expected.valueOf()
    });
  };

  var compareToStringReturnValue = function compareToStringReturnValue(comparison) {
    subcompare(comparison, {
      type: "to-string-return-value",
      actual: comparison.actual.toString(),
      expected: comparison.expected.toString()
    });
  };

  var defineProperty = function (obj, key, value) {
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
  };

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      // eslint-disable-next-line prefer-rest-params
      var source = arguments[i] === null ? {} : arguments[i];

      if (i % 2) {
        // eslint-disable-next-line no-loop-func
        ownKeys(Object(source), true).forEach(function (key) {
          defineProperty(target, key, source[key]);
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
    return Object.is(value, -0) ? "-0" : value.toString();
  }; // https://github.com/joliss/js-string-escape/blob/master/index.js
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

      var options = _objectSpread({}, scopedOptions, {
        nestedInspect: function nestedInspect(nestedValue) {
          var nestedOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          return scopedInspect(nestedValue, _objectSpread({}, scopedOptions, {
            depth: scopedOptions.depth + 1
          }, nestedOptions));
        }
      });

      if (primitiveType) return primitiveMap[primitiveType](scopedValue, options);
      if (compositeType in compositeMap) return compositeMap[compositeType](scopedValue, options);
      return inspectConstructor("".concat(compositeType, "(").concat(inspectObject(scopedValue, options), ")"), _objectSpread({}, options, {
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

      if (type === "map-entry") return "".concat(previous, "[[mapEntry:").concat(data, "]]");
      if (type === "set-entry") return "".concat(previous, "[[setEntry:").concat(data, "]]");

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

      if (type === "identity") {
        return previous;
      }

      return "".concat(previous, " type:").concat(type, ", data:").concat(data);
    }, name);
    return path;
  }; // eslint-disable-next-line consistent-return


  var arrayWithoutHoles = function (arr) {
    if (Array.isArray(arr)) {
      var i = 0;
      var arr2 = new Array(arr.length);

      for (; i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    }
  }; // eslint-disable-next-line consistent-return


  var iterableToArray = function (iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  };

  var nonIterableSpread = function () {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  };

  var _toConsumableArray = function (arr) {
    return arrayWithoutHoles(arr) || iterableToArray(arr) || nonIterableSpread();
  };

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

  var propertiesComparisonToErrorMessage = function propertiesComparisonToErrorMessage(comparison) {
    if (comparison.type !== "properties") return undefined;
    var path = comparisonToPath(comparison);
    var extra = comparison.actual.extra;
    var missing = comparison.actual.missing;
    var hasExtra = extra.length > 0;
    var hasMissing = missing.length > 0;

    if (hasExtra && !hasMissing) {
      return createUnexpectedPropertiesMessage({
        path: path,
        unexpectedProperties: propertyNameArrayToString(extra)
      });
    }

    if (!hasExtra && hasMissing) {
      return createMissingPropertiesMessage({
        path: path,
        missingProperties: propertyNameArrayToString(missing)
      });
    }

    return createUnexpectedAndMissingPropertiesMessage({
      path: path,
      unexpectedProperties: propertyNameArrayToString(extra),
      missingProperties: propertyNameArrayToString(missing)
    });
  };

  var createUnexpectedPropertiesMessage = function createUnexpectedPropertiesMessage(_ref) {
    var path = _ref.path,
        unexpectedProperties = _ref.unexpectedProperties;
    return "unexpected properties.\n--- unexpected property names ---\n".concat(unexpectedProperties.join("\n"), "\n--- at ---\n").concat(path);
  };

  var createMissingPropertiesMessage = function createMissingPropertiesMessage(_ref2) {
    var path = _ref2.path,
        missingProperties = _ref2.missingProperties;
    return "missing properties.\n--- missing property names ---\n".concat(missingProperties.join("\n"), "\n--- at ---\n").concat(path);
  };

  var createUnexpectedAndMissingPropertiesMessage = function createUnexpectedAndMissingPropertiesMessage(_ref3) {
    var path = _ref3.path,
        unexpectedProperties = _ref3.unexpectedProperties,
        missingProperties = _ref3.missingProperties;
    return "unexpected and missing properties.\n--- unexpected property names ---\n".concat(unexpectedProperties.join("\n"), "\n--- missing property names ---\n").concat(missingProperties.join("\n"), "\n--- at ---\n").concat(path);
  };

  var propertyNameArrayToString = function propertyNameArrayToString(propertyNameArray) {
    return propertyNameArray.map(function (propertyName) {
      return inspect(propertyName);
    });
  };

  var propertiesOrderComparisonToErrorMessage = function propertiesOrderComparisonToErrorMessage(comparison) {
    if (comparison.type !== "properties-order") return undefined;
    var path = comparisonToPath(comparison);
    var expected = comparison.expected;
    var actual = comparison.actual;
    return createUnexpectedPropertiesOrderMessage({
      path: path,
      expectedPropertiesOrder: propertyNameArrayToString$1(expected),
      actualPropertiesOrder: propertyNameArrayToString$1(actual)
    });
  };

  var createUnexpectedPropertiesOrderMessage = function createUnexpectedPropertiesOrderMessage(_ref) {
    var path = _ref.path,
        expectedPropertiesOrder = _ref.expectedPropertiesOrder,
        actualPropertiesOrder = _ref.actualPropertiesOrder;
    return "unexpected properties order.\n--- properties order found ---\n".concat(actualPropertiesOrder.join("\n"), "\n--- properties order expected ---\n").concat(expectedPropertiesOrder.join("\n"), "\n--- at ---\n").concat(path);
  };

  var propertyNameArrayToString$1 = function propertyNameArrayToString(propertyNameArray) {
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

  var arrayLengthComparisonToMessage = function arrayLengthComparisonToMessage(comparison) {
    if (comparison.type !== "identity") return undefined;
    var parentComparison = comparison.parent;
    if (parentComparison.type !== "property-value") return undefined;
    if (parentComparison.data !== "length") return undefined;
    var grandParentComparison = parentComparison.parent;
    if (!isArray(grandParentComparison.actual)) return undefined;
    if (comparison.actual > comparison.expected) return createBiggerThanExpectedMessage$1(comparison);
    return createSmallerThanExpectedMessage$1(comparison);
  };

  var createBiggerThanExpectedMessage$1 = function createBiggerThanExpectedMessage(comparison) {
    return "an array is bigger than expected.\n--- array length found ---\n".concat(comparison.actual, "\n--- array length expected ---\n").concat(comparison.expected, "\n--- at ---\n").concat(comparisonToPath(comparison.parent.parent));
  };

  var createSmallerThanExpectedMessage$1 = function createSmallerThanExpectedMessage(comparison) {
    return "an array is smaller than expected.\n--- array length found ---\n".concat(comparison.actual, "\n--- array length expected ---\n").concat(comparison.expected, "\n--- at ---\n").concat(comparisonToPath(comparison.parent.parent));
  };
  /* eslint-disable import/max-dependencies */


  var comparisonToErrorMessage = function comparisonToErrorMessage(comparison) {
    var failedComparison = deepestComparison(comparison);
    return firstFunctionReturningSomething([mapEntryComparisonToErrorMessage, prototypeComparisonToErrorMessage, referenceComparisonToErrorMessage, propertiesComparisonToErrorMessage, propertiesOrderComparisonToErrorMessage, symbolsComparisonToErrorMessage, symbolsOrderComparisonToErrorMessage, setSizeComparisonToMessage, arrayLengthComparisonToMessage], failedComparison) || defaultComparisonToErrorMessage(failedComparison);
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

    var actual = firstArg.actual,
        expected = firstArg.expected,
        message = firstArg.message;
    var expectation = {
      actual: actual,
      expected: expected
    };
    var comparison = compare(expectation);

    if (comparison.failed) {
      var error = createAssertionError(message || comparisonToErrorMessage(comparison));
      if (Error.captureStackTrace) Error.captureStackTrace(error, assert);
      throw error;
    }
  };

  exports.assert = assert;
  exports.createAssertionError = createAssertionError;
  exports.isAssertionError = isAssertionError;
  return exports;
}({});
//# sourceMappingURL=./main.js.map