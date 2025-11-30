// validation tools
const { anyPass, has, is, isEmpty, isNil } = require("ramda");

/**
 * Checks if an object has a specific property
 *
 * @param {Object} object  - the object to be verified
 * @param {String} property - the string property of the object
 * @returns {Boolean} - true or false depending on the condition
 */
const checkObjectProperty = (object, property) => {
  return object && has(property, object) ? object[property] : undefined;
};

/**
 * Returns `true` if the given value is its type's empty value, `null` or `undefined`.
 *
 * @param {*} val The value to test
 * @return {Boolean}
 */
const isNilOrEmpty = anyPass([isNil, isEmpty]);

/**
 * Checks if array is not empty
 *
 * @param {Array} value - the array argument
 * @returns {Boolean} - false or true, depending on the value of the array
 */
const isArrayNotEmpty = (array) =>
  !isNilOrEmpty(array) && Array.isArray(array) && array.length > 0;

module.exports = {
  isEmpty,
  anyPass,
  isNil,
  is,
  checkObjectProperty,
  isNilOrEmpty,
  isArrayNotEmpty,
};
