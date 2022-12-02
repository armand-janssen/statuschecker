/**
 * Validate that the expected httpStatus and optional text match the actual values.
 * @param {Object} actual {httpStatus, response}
 * @param {Object} expected {httpStatus, response}
 * @throws {Error} when values do not match expectation.
 */
function validate(actual, expected) {
  if (actual.httpStatus !== expected.httpStatus) {
    const error = new Error(`Actual httpStatus (${actual.httpStatus}) does not match expected (${expected.httpStatus})`);
    error.httpStatus = actual.httpStatus;
    throw error;
  }

  if (expected.response && actual.response.indexOf(expected.response) === -1) {
    const error = new Error(`Response does not contain text (${expected.response})`);
    error.httpStatus = actual.httpStatus;
    throw error;
  }
}

module.exports = { validate };
