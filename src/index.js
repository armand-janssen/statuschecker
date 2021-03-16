const express = require('express');
const logger = require('./logger');
const scheduler = require('./jobScheduler');

const app = express();
const port = 80;

app.get('/', async (req, res) => {
  const jobs = await scheduler.getJobs();
  res.send(jobs);
});

app.listen(port, () => {
  logger.info(`Example app listening at http://localhost:${port}`);
  scheduler.start();
});
