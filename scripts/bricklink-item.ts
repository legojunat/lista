import 'dotenv/config'
import axios from 'axios';
import fs from 'fs';
import path from 'path';

import { getAuthHeader } from './oauth';
import { processFile } from './process-file';
import { delay } from './delay';
import { BRICKLINK_BASE_URL } from './constants';

interface BrickLinkItem {
  no: string;
  name: string;
  type: string;
  category_id: number;
  image_url: string;
  thumbnail_url: string;
  weight: string;
  dim_x: string;
  dim_y: string;
  dim_z: string;
  year_released: number;
  is_obsolete: boolean;
}

(async function() {
  const bricklinkLego = path.resolve(__dirname, '../data/bricklink-lego.csv');
  if (!fs.existsSync(bricklinkLego)) {
    console.error('Error: data/bricklink-lego.csv not found, please generate it with "npm run bricklink-lego"');
    process.exit();
  }

  // row[0] => material = 6013938
  // row[1] => brickLinkPartId = 32002
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_header, ...rows] = (await processFile(bricklinkLego));
  const brickLinkPartIds = Array.from(new Set(rows.map((row) => row[1])));
  console.info(`Info: Starting to fetch part data for ${brickLinkPartIds.length} parts`);

  const output: string[] = [];
  output.push([
    'brickLinkPartId',
    'name',
    'type',
    'categoryId',
    'imageUrl',
    'thumbnailUrl',
    'weight',
    'dimX',
    'dimY',
    'dimZ',
    'yearReleased',
    'isObsolete'
  ].join('","'));
  for (const brickLinkPartId of brickLinkPartIds) {
    if (!brickLinkPartId) {
      continue; 
    }

    const url = `${BRICKLINK_BASE_URL}/items/part/${brickLinkPartId}`
    const method = 'GET';

    const authHeader = getAuthHeader({
      url,
      method,
    });

    let item: BrickLinkItem | undefined = undefined
    try {
      const response = await axios.get<{ data: BrickLinkItem }>(url, {
        headers: {
          Authorization: authHeader.Authorization,
        },
      });
      item = response.data.data;
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 404) {
        console.log('Exitting due error', error)
        process.exit();
      }
    }

    output.push(`"${[
      item?.no ?? '',
      item?.name ?? '',
      item?.type ?? '',
      item?.category_id ?? '',
      item?.image_url ?? '',
      item?.thumbnail_url ?? '',
      item?.weight ?? '',
      item?.dim_x ?? '',
      item?.dim_y ?? '',
      item?.dim_z ?? '',
      item?.year_released ?? '',
      item?.is_obsolete === true ? '1' : item?.is_obsolete === false ? '0' : '',
    ].join('","')}"`);
 
    await delay(1000);
  }

  console.info('Info: Writing to data/bricklink-category.csv');
  fs.writeFileSync(path.resolve(__dirname, '../data/bricklink-category.csv'), output.join('\n'), 'utf8');
})();
