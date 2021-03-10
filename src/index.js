const express = require('express');
const logger = require('./logger');
const checker = require('./jobScheduler');

const app = express();
const port = 80;

app.get('/', (req, res) => {
  res.send('Hello World!');
});
// app.get('/jobs', async (req, res) => {
//   console.log('get jobs')
//   const jobs = await checker.getJobs();
//   console.log('Jobs: ' + jobs)
//   res.send(jobs)
// })

app.listen(port, () => {
  logger.info(`Example app listening at http://localhost:${port}`);
  checker.start();
});
