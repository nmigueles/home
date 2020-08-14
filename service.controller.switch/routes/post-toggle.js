const fetch = require('node-fetch');
const { json, createError } = require('micro');

module.exports = async (req, res) => {
  const { device } = await json(req);
  if (!device) {
    throw new Error('Device not provided.');
  }

  if (!device.ip) {
    throw new Error('Device ip not provided.');
  }
  try {
    await fetch(`${device.ip}/toggle`, {
      method: 'post',
    });
  } catch (error) {
    console.error(error);
    throw createError(500, `Failed communicating with device in ${device.ip}`);
  }
  return { ok: true };
};
