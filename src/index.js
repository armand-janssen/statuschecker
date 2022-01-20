const express = require('express');
const cors = require('cors');
const logger = require('./logger');
const scheduler = require('./jobScheduler');

const app = express();
const port = 4051;

app.use(cors());

app.get('/', async (req, res) => {
  const jobs = await scheduler.getJobs();
  res.json(jobs);
});

app.listen(port, () => {
  logger.info(`Example app listening at http://localhost:${port}`);
  scheduler.start();
});
