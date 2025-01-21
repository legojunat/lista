require('dotenv').config();
const axios = require('axios');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const path = require('path');

const { processFile } = require('./process-file');

const BASE_URL = 'https://api.bricklink.com/api/store/v1';
const OAUTH_CONSUMER_KEY = process.env.OAUTH_CONSUMER_KEY ?? ''
const OAUTH_CONSUMER_SECRET = process.env.OAUTH_CONSUMER_SECRET ?? ''
const OAUTH_ACCESS_TOKEN = process.env.OAUTH_ACCESS_TOKEN ?? ''
const OAUTH_ACCESS_TOKEN_SECRET = process.env.OAUTH_ACCESS_TOKEN_SECRET ?? ''

const oauth = OAuth({
  consumer: {
    key: OAUTH_CONSUMER_KEY,
    secret: OAUTH_CONSUMER_SECRET,
  },
  signature_method: 'HMAC-SHA1',
  hash_function(baseString, key) {
    return crypto.createHmac('sha1', key).update(baseString).digest('base64');
  },
});

const delay = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

(async function() {
  // row[0] => on list 2024 = 1
  // row[1] => Main Group Top = TECHNIC
  // row[2] => Main Group Sub = CONNECTING BUSH W/ A
  // row[3] => Material = 6013938
  // row[4] => Description = 1 1/2 M CONNECTING BUSH
  // row[5] => Colour ID = BRICK-YEL
  // row[6] => Communication number = 32002
  // row[7] => Gross Weight (G) = 0.109
  // row[8] => Length (MM) = 12.100
  // row[9] => Width (MM) = 5.600
  // row[10] => Height (MM) = 5.900
  // row[11] => 2025 Prices (in EUR) = 1.23
  const [_header, ...rows] = (await processFile(path.resolve(__dirname, 'lista.csv')));

  console.log(['material', 'brickLinkPartId', 'brickLinkColorId'].join(','));
  for (const row of rows) { // communicationNumbers.slice(0, 10)
    const material = row[3];
    const url = `${BASE_URL}/item_mapping/${material}`;
    const method = 'GET';

    const requestData = {
      url,
      method,
    };

    const authHeader = oauth.toHeader(
      oauth.authorize(requestData, {
        key: OAUTH_ACCESS_TOKEN,
        secret: OAUTH_ACCESS_TOKEN_SECRET,
      })
    );

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: authHeader.Authorization,
        },
      });
      const brickLinkPartId = response.data?.data[0]?.item?.no ?? '';
      const brickLinkColorId = response.data?.data[0]?.color_id ?? '';
      console.log([material, brickLinkPartId, brickLinkColorId].join(','));
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response.status !== 404) {
        console.log('Exitting due error', error)
        process.exit();
      }
    }

    await delay(1000);
  }
})();
