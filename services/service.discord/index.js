const assert = require('assert');
process.env.NODE_ENV === 'development' && require('dotenv').config();
assert(process.env.DISCORD_WEBHOOK_URL);

const { send } = require('micro');
const { router, get, post } = require('microrouter');

const postMessage = require('./routes/post-message');
const getHealth = require('./routes/get-health');

module.exports = router(
  post('/post-message', postMessage),
  get('/health', getHealth),
  get('/*', (req, res) => send(res, 404)),
  post('/*', (req, res) => send(res, 404)),
);
