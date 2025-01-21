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
  const bricklinkFile = path.resolve(__dirname, 'bricklink.csv');
  if (!fs.fileExistsSync(bricklinkFile)) {
    console.error('bricklink.csv not found, please generate it with "npm run bricklink"');
    process.exit();
  }

  // row[0] => material = 6013938
  // row[1] => brickLinkPartId = 32002
  // row[2] => brickLinkColorId = 2
  const [_header, ...rows] = (await processFile(bricklinkFile));

  console.log([
    'material',
    'brickLinkPartId',
    'brickLinkColorId',
    'minPrice',
    'maxPrice',
    'avgPrice',
    'qtyAvgPrice',
    'unitQuantity',
    'totalQuantity'
  ].join(','));
  for (const [material, brickLinkPartId, brickLinkColorId] of rows) {
    const url = (brickLinkPartId && brickLinkColorId)
      ? `${BASE_URL}/items/part/${brickLinkId}/price?color_id=${brickLinkColorId}&guide_type=sold&region=eu`
      : `${BASE_URL}/items/part/${material}/price?guide_type=sold&region=eu`;
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
      const info = response.data.data;
      console.log([
        material,
        brickLinkPartId,
        brickLinkColorId,
        info.min_price,
        info.max_price,
        info.avg_price,
        info.qty_avg_price,
        info.unit_quantity,
        info.total_quantity,
      ].join(','));
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response.status !== 404) {
        console.log('Exitting due error', error)
        process.exit();
      }
    }

    await delay(1000);
  }
})();
