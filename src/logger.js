// const winston = require('winston');

// let loggerInstance = null;

// function logger() {
//   if (loggerInstance === null) {
//     init();
//   }
//   return loggerInstance();
// }

// function init() {
//   if (loggerInstance !== null) {
//     return loggerInstance;
//   }

//   loggerInstance = winston.createLogger({
//     transports: [
//       new winston.transports.Console(),
//     ],
//   });
// }

// module.exports = { logger }



const { createLogger, format, transports } = require('winston');
const { combine, splat, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message}  -- `
  if (metadata) {
    msg += JSON.stringify(metadata)
  }
  return msg
});
// const myOtherFormat = format(transform => {
//   return transform;
// });

const logger = createLogger({
  level: 'debug',
  format: combine(
    format.colorize(),
    splat(),
    format.json(),
    timestamp(),
    // myFormat
  ),
  transports: [
    new transports.Console({ level: 'silly' }),
    // new transports.File({ filename: config.get("app.logging.outputfile"), level: 'debug' }),
  ]
});
module.exports = logger
