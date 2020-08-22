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

app.get('/login', async (req, res) => {
  res.redirect(spotify.getAuthorizeUrl());
});

app.get('/logout', async (req, res) => {
  // TODO Erase content of the tokens file and remove from memory and set expired to undefined.
  res.sendStatus(204);
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

app.get('/debug', (req, res) => {
  spotify.debug();
  res.sendStatus(200);
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
