const axios = require('axios');
const { DateTime } = require('luxon');
const slackMessageCreator = require('./slackMessageCreator');
/**
 * Send a message to slack.
 * @param {object} body
 * @param {string} sessionId
 */
async function sendMessageToSlack(slackUrl, content) {
  const timeout = 2000;
  const response = await axios.post(slackUrl, content, { timeout });

  if (response.status !== 200) {
    throw new Error(response.error);
  }
}

async function notifyServiceDown(job, httpStatus, reason) {
  console.log(`ERROR *NOTIFY **** ${job.name} - ${reason}`);
  const servicename = job.url;
  const since = job.failingSince;
  const content = slackMessageCreator.down(servicename, since, httpStatus, reason);
  sendMessageToSlack(job.notification.webhook, content);
}

async function notifyBackOnline(job, now) {
  console.log(`BACK ONLINE *NOTIFY **** ${job.name} `);
  const servicename = job.url;
  const since = job.failingSince;
  let downtime = '';
  const diff = now.diff(DateTime.fromISO(since));
  console.log(`diff.as('hours') > 0 : ${diff.as('hours') > 0}`);
  console.log(`typeof diff.as('hours'): ${typeof diff.as('hours')}`);
  console.log(`diff.as('hours'): ${diff.as('hours')}`);
  if (diff.as('hours') > 1) {
    downtime = `${diff.as('hours').toFixed(0)} hours`;
  } else {
    downtime = `${diff.as('minutes').toFixed(0)} minutes`;
  }
  const content = slackMessageCreator.up(servicename, now, downtime);
  sendMessageToSlack(job.notification.webhook, content);
}

module.exports = { notifyBackOnline, notifyServiceDown };
