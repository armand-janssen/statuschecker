const { createLogger, format, transports } = require('winston');

const {
  combine, splat, timestamp, printf,
} = format;

const myFormat = printf(({
  // eslint-disable-next-line no-shadow
  level, message, timestamp, ...metadata
}) => {
  let msg = `${timestamp} [${level}] : ${message}  -- `;
  if (metadata) {
    msg += JSON.stringify(metadata);
  }
  return msg;
});

const logger = createLogger({
  level: 'debug',
  format: combine(
    splat(),
    timestamp(),
    myFormat,
  ),
  transports: [
    new transports.Console({ level: 'debug' }),
  ],
});
module.exports = logger;
