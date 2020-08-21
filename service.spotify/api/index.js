const auth = require('spotify-personal-auth');
const SpotifyWebApi = require('spotify-web-api-node');

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

// Configure module
auth.config({
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
  path: './tokens.json', // Optional path to file to save tokens (will be created for you)
});

const spotifyApi = new SpotifyWebApi();

class SpotifyController {
  // returns a SpotifyWebApi instance already authenticated.
  async apiBuilder() {
    const [token, refresh] = await auth.token();
    // Sets api access and refresh token
    spotifyApi.setAccessToken(token);
    spotifyApi.setRefreshToken(refresh);

    return spotifyApi;
  }

  async playSong(songId) {
    try {
      const api = await this.apiBuilder();
      // Is the song valid?
      const { statusCode, body } = await api.getTrack(songId);
      const { uri } = body;
      if (statusCode !== 200) {
        console.log('Failed to get song info.');
      }

      api.play({ uris: [uri] });

      return body;
    } catch (error) {
      console.log('Error in playSong method.');
      throw error;
    }
  }

  async playPlaylist(playlistId) {
    try {
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
    } catch (error) {
      console.log('Error in playPlaylist method.');
      throw error;
    }
  }

  async play() {
    try {
      const api = await this.apiBuilder();
      const { is_playing } = await this.playbackState();
      if (is_playing) {
        await api.pause();
      } else {
        await api.play();
      }
      return { is_playing: !is_playing };
    } catch (error) {
      throw new Error(
        `Something went wrong playing the song! ${error.message}`,
      );
    }
  }

  async nextSong() {
    try {
      const api = await this.apiBuilder();
      await api.skipToNext();
      return { ok: true };
    } catch (error) {
      throw new Error(
        `Something went wrong skipping the song! ${error.message}`,
      );
    }
  }
  async previusSong() {
    try {
      const api = await this.apiBuilder();
      await api.skipToPrevious();
      return { ok: true };
    } catch (error) {
      throw new Error(
        `Something went wrong going back the the previus song! ${error.message}`,
      );
    }
  }

  async playbackState() {
    try {
      const api = await this.apiBuilder();
      const playbackData = await api.getMyCurrentPlaybackState({});
      return playbackData.body;
    } catch (error) {
      throw new Error(
        `Something went wrong when retrieving the playbackData! ${error.message}`,
      );
    }
  }
}

module.exports = {
  SpotifyController,
};
