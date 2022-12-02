const logger = require('./logger');

module.exports = class Job {
  constructor(myJob) {
    this.id = myJob.id;
    this.name = myJob.name;
    this.url = myJob.url;
    this.timeout = myJob.timeout;
    this.pattern = myJob.pattern;
    this.expectedHttpStatus = myJob.expectedHttpStatus;
    this.expectedText = myJob.expectedText;
    this.notification = myJob.notification;
  }

  scheduledJobCreated(scheduledJob) {
    logger.debug(`scheduledJobCreated: ${this.toString()}`);
    this.scheduledJob = scheduledJob;
  }

  checked(now) {
    logger.debug(`checked: ${this.toString()}`);
    this.lastcheck = now;
  }

  backOnline() {
    logger.debug(`backOnline: ${this.toString()}`);
    delete this.failingSince;
    delete this.lastNotify;
  }

  failed(now) {
    logger.debug(`failed: ${this.toString()}`);
    if (!this.failingSince) {
      this.failingSince = now;
    }
    this.lastNotify = now;
  }

  isTimeForNotification(now) {
    logger.debug(`isTimeForNotification: ${this.toString()}`);
    if (!this.failingSince) {
      return true;
    }
    if (!this.lastNotify) {
      return false;
    }
    const intervalUnit = this.notification.interval.unit;
    const intervalValue = this.notification.interval.value;
    const difference = now.diff(this.lastNotify, intervalUnit);

    return difference.as(intervalUnit) > intervalValue;
  }

  hasAlreadyFailed() {
    const returnValue = this.failingSince !== undefined;
    logger.debug(`hasAlreadyFailed: ${returnValue} - ${this.toString()}`);
    return returnValue;
  }

  hasFailedFirstTime() {
    const returnValue = this.failingSince === null;
    logger.debug(`hasFailedFirstTime: ${returnValue} - ${this.toString()}`);
    return returnValue;
  }

  summarize() {
    const returnObj = {
      id: this.id,
      name: this.name,
      url: this.url,
      lastcheck: this.lastcheck,
      failingSince: this.failingSince,
      lastNotify: this.lastNotify,
    };
    return returnObj;
  }

  toString() {
    return JSON.stringify(this.summarize());
  }
};
