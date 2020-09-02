const { send } = require('micro');
const { router, get, post, put } = require('microrouter');

const getHealth = require('./routes/get-health');
const getDevice = require('./routes/get-device');
const newDevice = require('./routes/post-new-device');
const putDevice = require('./routes/put-device');

module.exports = router(
  get('/health', getHealth),
  get('/device', getDevice),
  post('/device', newDevice),
  put('/device', putDevice),
  get('/*', (req, res) => send(res, 404)),
  post('/*', (req, res) => send(res, 404)),
  put('/*', (req, res) => send(res, 404)),
);
