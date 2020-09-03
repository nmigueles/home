const fetch = require('node-fetch');
const { json } = require('micro');

const { DISCORD_WEBHOOK_URL } = process.env;

module.exports = async (req, res) => {
  const body = await json(req);
  await fetch(DISCORD_WEBHOOK_URL, {
    method: 'post',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  return { ok: true };
};
