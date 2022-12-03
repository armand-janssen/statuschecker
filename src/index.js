const express = require('express');
const hbs = require('hbs');
const dayjs = require('dayjs');
const logger = require('./logger');
const scheduler = require('./jobScheduler');

const app = express();
const port = 80;

app.set('view engine', 'hbs');
app.set('views', './views');
app.set('layoutsDir', './views/layouts');
app.use(express.static('public'));

hbs.registerHelper('dateFormat', (date, format) => dayjs(date).format(format));
hbs.registerHelper('bgColorStriped', (index) => {
  if (index % 2 === 0) {
    return 'bg-white-100';
  }
  return 'bg-gray-100';
});
hbs.registerPartials('./views/partials');

app.get('/', async (req, res) => {
  const jobs = await scheduler.getJobs();
  res.render('home', {
    layout: 'layouts/layout',
    jobs,
  });
});
app.get('/jobs/:jobid', async (req, res) => {
  const jobId = req.params.jobid;
  const job = await scheduler.getJob(jobId);
  res.render('job', {
    layout: 'layouts/layout',
    job,
  });
});

app.listen(port, () => {
  logger.info(`App listening at http://localhost:${port}`);
  scheduler.start();
});
