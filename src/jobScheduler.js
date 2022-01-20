/* eslint-disable no-param-reassign */
const scheduler = require('node-schedule');
const axios = require('axios');
const { DateTime } = require('luxon');
const logger = require('./logger');
const Job = require('./job');

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
  if (job.isTimeForNotification(now)) {
    job.failed(now);
    notifier.notifyServiceDown(job, httpStatus, errorMessage);
  }
}

/**
 * Process a job that is back online after some downtime.
 * @param {Object} job the job being executed
 * @param {DateTime} now The current DateTime
 */
async function processOnline(job, now) {
  if (job.hasAlreadyFailed()) {
    await notifier.notifyBackOnline(job, now);
    job.backOnline();
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
  job.failed(now.toISO());
  notifier.notifyServiceDown(job, httpStatus, errorMessage);
}

/**
 * Schedule a job that was configured.
 * @param {object} job the job to schedule based on the config
 */
function schedule(myJob) {
  const job = new Job(myJob);
  jobs[job.id] = job;

  const scheduledJob = scheduler.scheduleJob(job.pattern, async (fireDate) => {
    const now = DateTime.now();
    // const job = jobs[job.id];
    logger.debug(`Start of schedule: ${job.toString()}`);
    try {
      const { httpStatus, response } = await getData(job.url, job.timeout);
      logger.info(`FireDate: ${fireDate} - id: ${job.id} - name: ${job.name} - url: ${job.url} - httpStatus: ${httpStatus}`);

      const actual = { httpStatus, response };
      const expected = { httpStatus: job.expectedHttpStatus };
      if (job.expectedText) {
        expected.text = job.expectedText;
      }
      responseValidator.validate(actual, expected);

      processOnline(job, now);
    } catch (error) {
      logger.error(`Error executing job: ${error.message}`);
      if (job.hasAlreadyFailed) {
        processAlreadyFailed(now, job, error.httpStatus, error.message);
      } else {
        processFailedFirstTime(now, job, error.httpStatus, error.message);
      }
    } finally {
      job.checked(now);
    }
    // jobs[job.id] = job;
  });
  job.scheduledJobCreated(scheduledJob);
}

async function getJobs() {
  return Object.values(jobs).map((job) => job.summarize());
}

/**
 * Loop all configured jobs and schedule them.
 */
async function start() {
  jobsList.forEach((job) => {
    schedule(job);
  });
}

module.exports = { start, getJobs };
