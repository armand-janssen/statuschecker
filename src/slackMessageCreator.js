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
