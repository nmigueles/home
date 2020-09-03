/**
 * This implementation is directly inspired
 * from https://www.npmjs.com/package/spotify-personal-auth
 * and modified for my use-case.
 */

const fs = require('fs');
const qs = require('qs');
const request = require('request');

class SpotifyOauth {
  linkedState = false;
  tokens;
  expires;

  constructor(opts) {
    if (opts) this.config(opts);
  }

  config(opts) {
    if (opts.clientId) this.clientId = opts.clientId;
    if (opts.clientSecret) this.clientSecret = opts.clientSecret;
    if (opts.path) this.path = opts.path;
    if (opts.callback) this.callback = opts.callback;
    if (opts.scope) this.scope = opts.scope;

    if (!this.callback) throw new Error('The callback options is required.');
  }

  getAuthorizeUrl() {
    return `https://accounts.spotify.com/authorize?${qs.stringify({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.callback,
      scope: this.scope.join(' '),
    })}`;
  }

  debug() {
    return {
      linkedState: this.linkedState,
      secondsLeft: this.linkedState
        ? (this.expires - new Date().getTime()) / 1000
        : undefined,
    };
  }

  detachAccount() {
    this.tokens = undefined;
    this.expires = undefined;
    this.linkedState = false;
    // Remove tokens from file.
    if (this.path) {
      this.writeTokensInFile({});
    }
  }

  async tokenEndpointHandler(params) {
    return new Promise((resolve, reject) => {
      request(
        {
          url: 'https://accounts.spotify.com/api/token',
          method: 'POST',
          headers: {
            Authorization:
              'Basic ' +
              Buffer.from(
                this.clientId + ':' + this.clientSecret,
                'utf8',
              ).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          qs: params,
        },
        (err, res, body) => {
          if (err) {
            reject(err);
          } else if (res.statusCode === 200) {
            body = JSON.parse(body);

            this.tokens = {
              token: body.access_token,
              refresh: body.refresh_token
                ? body.refresh_token
                : this.tokens.refresh,
            };

            this.expires = new Date().getTime() + body.expires_in * 1000;

            if (this.path) {
              this.writeTokensInFile(this.tokens);
            }

            this.linkedState = true;

            resolve([this.tokens.token, this.tokens.refresh]);
          } else {
            reject(new Error(res.body));
          }
        },
      );
    });
  }

  getTokensInFile() {
    // Gets the tokens at the specified path
    return JSON.parse(fs.readFileSync(this.path));
  }

  writeTokensInFile(tokens) {
    fs.writeFileSync(this.path, JSON.stringify(tokens));
  }

  /**
   * Gets a Spotify access token.
   * @returns {Promise<string[]>}
   */
  token() {
    // Checks if access and refresh tokens have been obtained and the access token is not expired
    if (this.tokens && this.expires && new Date().getTime() < this.expires) {
      this.linkedState = true;
      return Promise.resolve([this.tokens.token, this.tokens.refresh]);
    }
    // Checks if access and refresh tokens have not been obtained, but there are tokens at a specified path
    if (!this.tokens && this.path && fs.existsSync(this.path)) {
      const tokens = this.getTokensInFile();
      if (tokens.token && tokens.refresh) {
        this.tokens = tokens;
      }
    }

    if (this.tokens) return this.refresh();

    return Promise.reject('No account linked.');
  }

  /**
   * Refreshes the Spotify access token
   * and sets the tokens variable.
   * @returns {Promise<string[]>}
   */
  refresh() {
    // Refreshes the access token
    return this.tokenEndpointHandler({
      grant_type: 'refresh_token',
      refresh_token: this.tokens.refresh,
    });
  }

  /**
   * Retrieves the Spotify access token
   * and sets the tokens variable.
   * @returns {Promise<string[]>}
   */
  authorize(code) {
    return this.tokenEndpointHandler({
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.callback,
    });
  }
}

module.exports = SpotifyOauth;
