const axios = require('axios');
const { DateTime } = require('luxon');
const logger = require('./logger');
const slackMessageCreator = require('./slackMessageCreator');

/**
 * Send a message to slack.
 * @param {string} slackUrl the slack incoming webhook url
 * @param {string} content the content to send
 */
async function sendMessageToSlack(slackUrl, content) {
  const timeout = 2000;
  const response = await axios.post(slackUrl, content, { timeout });

  if (response.status !== 200) {
    throw new Error(response.error);
  }
}

/**
 * Send a notification for a service that is down.
 * @param {Object} job the job being executed
 * @param {number} httpStatus the httpStatus of the http request
 * @param {string} reason the reason the service is down
 */
async function notifyServiceDown(job, httpStatus, reason) {
  logger.info(`Sending "service down" message to slack for ${job.name} - reason: ${reason}`);
  const since = job.failingSince;
  const content = slackMessageCreator.down(job.name, since, httpStatus, reason, job.url);
  sendMessageToSlack(job.notification.webhook, content);
}

/**
 * Send a notification for a service that is back online.
 * @param {Object} job the job being executed
 * @param {DateTime} now The current DateTime
 */
async function notifyBackOnline(job, now) {
  logger.info(`Sending "service back online" message to slack for ${job.name}`);
  const since = job.failingSince;
  let downtime = '';
  const diff = now.diff(DateTime.fromISO(since));
  if (diff.as('hours') > 1) {
    downtime = `${diff.as('hours').toFixed(0)} hours`;
  } else {
    downtime = `${diff.as('minutes').toFixed(0)} minutes`;
  }
  const content = slackMessageCreator.up(job.name, now, downtime, job.url);
  sendMessageToSlack(job.notification.webhook, content);
}

module.exports = { notifyBackOnline, notifyServiceDown };
