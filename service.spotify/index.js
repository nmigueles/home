const assert = require('assert');
process.env.NODE_ENV === 'development' && require('dotenv').config();
assert(process.env.SPOTIFY_CLIENT_ID);
assert(process.env.SPOTIFY_CLIENT_SECRET);

const express = require('express');

const { SpotifyController } = require('./api');

const app = express();
app.use(express.json());

const spotify = new SpotifyController();

app.get('/health', async (req, res) => {
  res.sendStatus(200);
});

app.get('/connect', async (req, res) => {
  res.redirect(spotify.getAuthorizeUrl());
});

app.get('/callback', async (req, res) => {
  const code = req.query['code'];
  if (code) {
    await spotify.callback(code);
    res.json({ ok: true, message: 'You can close this window.' });
  } else {
    res.json({ ok: false, error: 'Code query parameter is required.' });
  }
});

app.post('/disconnect', async (req, res) => {
  const { ok, error } = spotify.disconnect();
  res.json({
    ok,
    error,
  });
});

app.get('/account', async (req, res) => {
  try {
    const { statusCode, body } = await spotify.getAttachedAccount();
    if (statusCode === 200) res.json({ ok: true, linked: true, data: body });
    else
      throw new Error(`Failed communicating with spotify api, ${statusCode}`);
  } catch (error) {
    if (
      error.message ===
      'You need to link an account to use the spotify service.'
    ) {
      res.json({ ok: true, linked: false, message: 'No account linked.' });
    } else {
      res.json({ ok: false, error: error.message });
    }
  }
});

app.get('/debug', (req, res) => {
  const data = spotify.debug();
  res.json({ data });
});

app.post('/song/:song_id', async (req, res) => {
  try {
    const { song_id } = req.params;
    const data = await spotify.playSong(song_id);
    res.json({
      ok: true,
      data,
    });
  } catch (error) {
    res.json({ ok: false, error: error.message });
  }
});

app.post('/playlist/:playlist_id', async (req, res) => {
  try {
    const { playlist_id } = req.params;
    const data = await spotify.playPlaylist(playlist_id);
    res.json(data);
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

(async () => {
  await spotify.start();
  app.listen('3000', () => console.log('Spotify service started.'));
})();
