const SpotifyWebApi = require('spotify-web-api-node');
const SpotifyOauth = require('./oauth');

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

const config = {
  clientId,
  clientSecret,
  scope: [
    'user-read-private',
    'user-read-playback-state',
    'user-read-currently-playing',
    'user-modify-playback-state',
    'user-read-email',
    'streaming',
  ],
  path: './tokens.json', // Optional path to file to save tokens (will be created for you),
  callback: 'http://192.168.0.19:7000/spotify/callback',
};

const auth = new SpotifyOauth(config);
const spotifyApi = new SpotifyWebApi();

class SpotifyController {
  // returns a SpotifyWebApi instance already authenticated.
  async apiBuilder() {
    if (!auth.linkedState) {
      throw new Error(
        'You need to link an account to use the spotify service.',
      );
    }
    const [token, refresh] = await auth.token();
    // Sets api access and refresh token
    spotifyApi.setAccessToken(token);
    spotifyApi.setRefreshToken(refresh);

    return spotifyApi;
  }

  async start() {
    try {
      const [token, refresh] = await auth.token();
      // Sets api access and refresh token
      spotifyApi.setAccessToken(token);
      spotifyApi.setRefreshToken(refresh);
      const {
        body: { display_name, id },
      } = await spotifyApi.getMe();
      console.log(`Account linked - ${display_name || id}.`);
    } catch (error) {
      console.log('The service started correctly but no account is linked.');
      console.log(error);
      console.log('Go to http://localhost:7000/spotify/login');
    }
  }

  async callback(code) {
    return auth.authorize(code);
  }

  debug() {
    auth.debug();
  }

  getAuthorizeUrl() {
    return auth.getAuthorizeUrl();
  }

  async playSong(songId) {
    const api = await this.apiBuilder();
    // Is the song valid?
    const { statusCode, body } = await api.getTrack(songId);
    const { uri } = body;
    if (statusCode !== 200) {
      console.log('Failed to get song info.');
    }

    api.play({ uris: [uri] });

    return body;
  }

  async playPlaylist(playlistId) {
    const api = await this.apiBuilder();
    // Is the song valid?
    const { statusCode, body } = await api.getPlaylist(playlistId);
    const { uri: context_uri } = body;
    if (statusCode !== 200) {
      console.log('Failed to get playlist info.');
    }

    api.play({ context_uri });

    const {
      context: { type, uri },
    } = await this.playbackState();

    const ok = context_uri === uri && type === 'playlist';
    return { ok, uri };
  }

  async play() {
    const api = await this.apiBuilder();
    const { is_playing } = await this.playbackState();
    if (is_playing) {
      await api.pause();
    } else {
      await api.play();
    }
    return { is_playing: !is_playing };
  }

  async nextSong() {
    const api = await this.apiBuilder();
    await api.skipToNext();
    return { ok: true };
  }

  async previusSong() {
    const api = await this.apiBuilder();
    await api.skipToPrevious();
    return { ok: true };
  }

  async playbackState() {
    const api = await this.apiBuilder();
    const playbackData = await api.getMyCurrentPlaybackState({});
    return playbackData.body;
  }
}

module.exports = {
  SpotifyController,
};
