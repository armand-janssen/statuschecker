/**
 * Create a message for a service that is down
 * @param {string} servicename the name of the service that is back online
 * @param {string} since the date time since the service was down
 * @param {number} httpStatus the actual httpStatus
 * @param {string} reason the reason the service is down
 * @returns
 */
function down(servicename, since, httpStatus, reason) {
  return {
    // channel: 'test-webhook-layout',
    attachments: [
      {
        mrkdwn_in: [
          'text',
        ],
        color: '#FF0000',
        title: `${servicename} is down!`,
        text: `*Down since*: \`${since}\`.\n*Status*: ${httpStatus}\n*Reason*: ${reason}`,
        fields: [],
      },
    ],
  };
}

/**
 * Create a message for a service that is back online.
 * @param {string} servicename the name of the service that is back online
 * @param {string} since the date time since the service was down
 * @param {string} downtime the calculated downtime
 * @returns
 */
function up(servicename, since, downtime) {
  return {
    // channel: 'test-webhook-layout',
    attachments: [
      {
        mrkdwn_in: [
          'text',
        ],
        color: '#00FF00',
        title: `${servicename} is back online!`,
        text: `*Back online since*: \`${since}\`.\n*Down time*: ${downtime}`,
        fields: [],
      },
    ],
  };
}
module.exports = { down, up };
