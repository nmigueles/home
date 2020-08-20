const assert = require('assert');
process.env.NODE_ENV === 'development' && require('dotenv').config();
assert(process.env.SPOTIFY_CLIENT_ID);
assert(process.env.SPOTIFY_CLIENT_SECRET);

const express = require('express');

const { SpotifyController } = require('./api');

// TODO MIDDLEWARE TO AUTOMATIC REFRESH THE TOKENS WHEN UNAUTHORIRED.
const app = express();
app.use(express.json());

const spotify = new SpotifyController();

app.get('/callback', async (req, res) => {
  try {
    const code = req.query['code'];
    spotify.authorize(code);

    res.json({
      ok: true,
      message: 'Authorizado, ya se puede cerrar esta ventana.',
    });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
});

app.get('/authorize', async (req, res) => {
  try {
    res.redirect(spotify.getAuthorizeURL());
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
});

app.get('/refreshToken', async (req, res) => {
  try {
    const { expiresIn } = await spotify.refreshToken();

    res.json({
      ok: true,
      expiresIn,
    });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
});

app.get('/next', async (req, res) => {
  try {
    await spotify.nextSong();
    res.json({ ok: true });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
});

app.get('/previus', async (req, res) => {
  try {
    await spotify.previusSong();
    res.json({ ok: true });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
});

app.get('/state', async (req, res) => {
  try {
    const data = await spotify.playbackState();
    res.json({ ok: true, data });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
});

app.get('/play', async (req, res) => {
  try {
    const data = await spotify.play();
    res.json({ ok: true, data });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
});

app.listen('3000', () => console.log('Spotify service started.'));
