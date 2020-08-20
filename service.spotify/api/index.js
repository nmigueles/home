const SpotifyWebApi = require('spotify-web-api-node');

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

class SpotifyController {
  constructor() {
    this.spotifyApi = new SpotifyWebApi({
      clientId,
      clientSecret,
      redirectUri: 'http://localhost:7000/spotify/callback',
    });
  }
  getAuthorizeURL() {
    return this.spotifyApi.createAuthorizeURL(
      [
        'user-read-private',
        'user-read-playback-state',
        'user-read-currently-playing',
        'user-read-email',
        'streaming',
      ],
      'spotify-service',
    );
  }
  async authorize(code) {
    try {
      // First retrieve an access token
      const data = await this.spotifyApi.authorizationCodeGrant(code);
      // Set the access token and refresh token
      this.spotifyApi.setAccessToken(data.body['access_token']);
      this.spotifyApi.setRefreshToken(data.body['refresh_token']);

      // Save the amount of seconds until the access token expired
      return {
        expirantionEpoch: new Date().getTime() / 1000 + data.body['expires_in'],
      };
    } catch (error) {
      throw new Error(
        `Something went wrong when retrieving the access token! ${error.message}`,
      );
    }
  }

  async refreshToken() {
    try {
      const data = await this.spotifyApi.refreshAccessToken();
      this.spotifyApi.setAccessToken(data.body['access_token']);
      console.log('Token refreshed, expires in: ', data.body['expires_in']);
      return { expiresIn: data.body.expires_in };
    } catch (error) {
      throw new Error(
        `Something went wrong trying to refresh the access token! ${error.message}`,
      );
    }
  }

  async play() {
    try {
      const { is_playing } = await this.playbackState();

      let data;
      if (is_playing) {
        data = await this.spotifyApi.pause();
      } else {
        data = await this.spotifyApi.play();
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
      await this.spotifyApi.skipToNext();
      return { ok: true };
    } catch (error) {
      throw new Error(
        `Something went wrong skipping the song! ${error.message}`,
      );
    }
  }
  async previusSong() {
    try {
      await this.spotifyApi.skipToPrevious();
      return { ok: true };
    } catch (error) {
      throw new Error(
        `Something went wrong going back the the previus song! ${error.message}`,
      );
    }
  }

  async playbackState() {
    try {
      const playbackData = await this.spotifyApi.getMyCurrentPlaybackState({});
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
