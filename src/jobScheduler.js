/* eslint-disable no-param-reassign */
const scheduler = require('node-schedule');
const axios = require('axios');
const { DateTime } = require('luxon');

const jobsList = require('./config/jobs.json');
const notifier = require('./notifier');
const responseValidator = require('./responseValidator');

const jobs = {};

const getData = async (url, timeout) => {
  try {
    const response = await axios.get(url, { timeout });
    return { httpStatus: response.status, response: response.data };
  } catch (error) {
    throw new Error(`ERROR calling ${url}: ${error.message}`);
  }
};

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
async function processOnline(job, now) {
  if (job.failingSince) {
    await notifier.notifyBackOnline(job, now);
    delete job.failingSince;
    delete job.lastNotify;
  }
}

async function processFailedFirstTime(now, job, httpStatus, errorMessage) {
  job.failingSince = now.toISO();
  notifier.notifyServiceDown(job, httpStatus, errorMessage);
  job.lastNotify = now.toISO();
}

function schedule(job) {
  const newJob = scheduler.scheduleJob(job.pattern, async (fireDate) => {
    const now = DateTime.now();
    try {
      const { httpStatus, response } = await getData(job.url, job.timeout);
      console.log(`INFO LOG: ${fireDate} - ${job.id} - ${job.name} - ${job.url} - ${httpStatus}`);
      job.lastCheck = now.toISO();

      const actual = { httpStatus, response };
      const expected = { httpStatus: job.expectedHttpStatus };
      if (job.expectedText) {
        expected.text = job.expectedText;
      }
      responseValidator.validate(actual, expected);

      processOnline(job, now);
    } catch (error) {
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

async function start() {
  jobsList.forEach((job) => {
    schedule(job);
  });
}

module.exports = { start };
