const { send } = require('micro');
const { router, get } = require('microrouter');

const tick = require('./routes/tick');

module.exports = router(
  get('/health', () => ({ ok: true })),
  get('/tick', tick),
  get('/*', (req, res) => send(res, 404)),
);
