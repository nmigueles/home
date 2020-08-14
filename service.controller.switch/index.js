// const assert = require('assert');
// process.env.NODE_ENV === 'development' && require('dotenv').config();
// assert(process.env.SWITCH_IP);

const { send } = require('micro');
const { router, get } = require('microrouter');

const getHealth = require('./routes/get-health');

module.exports = router(
  get('/health', getHealth),
  get('/*', (req, res) => send(res, 404)),
);
