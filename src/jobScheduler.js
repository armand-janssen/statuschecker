/* eslint-disable no-param-reassign */
const scheduler = require('node-schedule');
const axios = require('axios');
const { DateTime } = require('luxon');
const logger = require('./logger');

const jobsList = require('./config/jobs.json');
const notifier = require('./notifier');
const responseValidator = require('./responseValidator');

const jobs = {};

/**
 * Perform an httpcall to the desired url.
 * @param {string} url the url the service to check
 * @param {number} timeout max timeout in miliseconds
 * @returns {httpStatus, response}
 * @throws {Error} when request throws error
 */
const getData = async (url, timeout) => {
  try {
    const response = await axios.get(url, { timeout });
    return { httpStatus: response.status, response: response.data };
  } catch (error) {
    throw new Error(`Error while performing http request: ${error.message}`);
  }
};

/**
 * Process a job that already failed and determine if a resend of the notification is desired.
 * @param {DateTime} now The current DateTime
 * @param {Object} job the job being executed
 * @param {number} httpStatus the actual httpStatus
 * @param {string} errorMessage the errorMessage
 */
async function processAlreadyFailed(now, job, httpStatus, errorMessage) {
  const lastnotify = DateTime.fromISO(job.lastNotify);
  const intervalUnit = job.notification.interval.unit;
  const intervalValue = job.notification.interval.value;
  const difference = now.diff(lastnotify, intervalUnit);

  if (difference.as(intervalUnit) > intervalValue) {
    notifier.notifyServiceDown(job, httpStatus, errorMessage);
    job.lastNotify = now.toISO();
  }
}

/**
 * Process a job that is back online after some downtime.
 * @param {Object} job the job being executed
 * @param {DateTime} now The current DateTime
 */
async function processOnline(job, now) {
  if (job.failingSince) {
    await notifier.notifyBackOnline(job, now);
    delete job.failingSince;
    delete job.lastNotify;
  }
}

/**
 * Process a job that failed the first time.
 * @param {DateTime} now The current DateTime
 * @param {Object} job the job being executed
 * @param {number} httpStatus the actual httpStatus
 * @param {string} errorMessage the errorMessage
 */
async function processFailedFirstTime(now, job, httpStatus, errorMessage) {
  job.failingSince = now.toISO();
  notifier.notifyServiceDown(job, httpStatus, errorMessage);
  job.lastNotify = now.toISO();
}

/**
 * Schedule a job that was configured.
 * @param {object} job the job to schedule based on the config
 */
function schedule(job) {
  const newJob = scheduler.scheduleJob(job.pattern, async (fireDate) => {
    const now = DateTime.now();
    try {
      const { httpStatus, response } = await getData(job.url, job.timeout);
      logger.info(`FireDate: ${fireDate} - id: ${job.id} - name: ${job.name} - url: ${job.url} - httpStatus: ${httpStatus}`);
      job.lastCheck = now.toISO();

      const actual = { httpStatus, response };
      const expected = { httpStatus: job.expectedHttpStatus };
      if (job.expectedText) {
        expected.text = job.expectedText;
      }
      responseValidator.validate(actual, expected);

      processOnline(job, now);
    } catch (error) {
      logger.error(`Error executing job: ${error.message}`);
      if (job.failingSince) {
        processAlreadyFailed(now, job, error.httpStatus, error.message);
      } else {
        processFailedFirstTime(now, job, error.httpStatus, error.message);
      }
    }
  });
  const jobEntry = {
    ...job,
    job: newJob,
  };
  jobs[job.id] = jobEntry;
}

/**
 * Loop all configured jobs and schedule them.
 */
async function start() {
  jobsList.forEach((job) => {
    schedule(job);
  });
}

module.exports = { start };
