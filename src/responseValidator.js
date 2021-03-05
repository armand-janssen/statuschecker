/**
 *
 * @param {Object} actual
 * @param {Object} expected
 */
function validate(actual, expected) {
  if (actual.httpStatus !== expected.httpStatus) {
    const error = new Error(`Actual httpStatus (${actual.httpStatus}) does not match expected (${expected.httpStatus})`);
    error.httpStatus = actual.httpStatus;
    throw error;
  }

  if (expected.text && actual.response.indexOf(expected.text) === -1) {
    const error = new Error(`Response does not contain text (${expected.text})`);
    error.httpStatus = actual.httpStatus;
    throw error;
  }
}

module.exports = { validate };
