const daysjs = require('dayjs');
/**
 * Create a message for a service that is down
 * @param {string} servicename the name of the service that is back online
 * @param {string} since the date time since the service was down
 * @param {number} httpStatus the actual httpStatus
 * @param {string} reason the reason the service is down
 * @param {string} url the url
 * @returns
 */
function down(servicename, since, httpStatus, reason, url) {
  return {
    attachments: [
      {
        mrkdwn_in: [
          'text',
        ],
        color: '#FF0000',
        title: `${servicename} is down!`,
        title_link: url,
        fields: [
          { title: 'Down since', value: `\`${daysjs(since).format('DD-MM-YYYY HH:mm:ss')}\``, short: false },
          { title: 'Status', value: `\`${httpStatus}\``, short: false },
          { title: 'Reason', value: `\`${reason}\``, short: false },
          { title: 'URL', value: url, short: false },
        ],
      },
    ],
  };
}

/**
 * Create a message for a service that is back online.
 * @param {string} servicename the name of the service that is back online
 * @param {string} since the date time since the service was down
 * @param {string} downtime the calculated downtime
 * @param {string} url the url
 * @returns
 */
function up(servicename, since, downtime, url) {
  return {
    // channel: 'test-webhook-layout',
    attachments: [
      {
        mrkdwn_in: [
          'text',
        ],
        color: '#00FF00',
        title: `${servicename} is back online!`,
        title_link: url,
        fields: [
          { title: 'Back online since', value: `\`${daysjs(since).format('DD-MM-YYYY HH:mm:ss')}\``, short: false },
          { title: 'Down time*', value: `\`${downtime}\``, short: false },
          { title: 'URL', value: url, short: true },
        ],
      },
    ],
  };
}
module.exports = { down, up };
