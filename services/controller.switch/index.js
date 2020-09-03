const { send } = require('micro');
const { router, get, post } = require('microrouter');

const getHealth = require('./routes/get-health');
const postToggle = require('./routes/post-toggle');

module.exports = router(
  get('/health', getHealth),
  post('/toggle', postToggle),
  get('/*', (req, res) => send(res, 404)),
  post('/*', (req, res) => send(res, 404)),
);
