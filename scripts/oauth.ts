import crypto from 'crypto';
import OAuth from 'oauth-1.0a';

const OAUTH_CONSUMER_KEY = process.env.OAUTH_CONSUMER_KEY ?? ''
const OAUTH_CONSUMER_SECRET = process.env.OAUTH_CONSUMER_SECRET ?? ''
const OAUTH_ACCESS_TOKEN = process.env.OAUTH_ACCESS_TOKEN ?? ''
const OAUTH_ACCESS_TOKEN_SECRET = process.env.OAUTH_ACCESS_TOKEN_SECRET ?? ''

const oauth = new OAuth({
  consumer: {
    key: OAUTH_CONSUMER_KEY,
    secret: OAUTH_CONSUMER_SECRET,
  },
  signature_method: 'HMAC-SHA1',
  hash_function(baseString, key) {
    return crypto.createHmac('sha1', key).update(baseString).digest('base64');
  },
});

export const getAuthHeader = (request: OAuth.RequestOptions) => oauth.toHeader(
  oauth.authorize(request, {
    key: OAUTH_ACCESS_TOKEN,
    secret: OAUTH_ACCESS_TOKEN_SECRET,
  })
);