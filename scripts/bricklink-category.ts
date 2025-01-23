import 'dotenv/config'
import axios from 'axios';
import fs from 'fs';
import path from 'path';

import { getAuthHeader } from './oauth';
import { processFile } from './process-file';
import { delay } from './delay';
import { BRICKLINK_BASE_URL } from './constants';

interface Category {
  category_id: number;
  category_name: string;
  parent_id: number;
}

(async function() {
  const bricklinkItem = path.resolve(__dirname, '../data/bricklink-item.csv');
  if (!fs.existsSync(bricklinkItem)) {
    console.error('Error: data/bricklink-item.csv not found, please generate it with "npm run bricklink-item"');
    process.exit();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_header, ...rows] = (await processFile(bricklinkItem));
  const categories = Array.from(new Set(rows.map((row) => row[3]))).filter(Boolean);
  console.info(`Info: Starting to fetch category names for ${categories.length} categories`);

  const output: string[] = [];
  output.push(['categoryId', 'categoryName', 'parentId'].join('","'));
  for (const category of categories) {
    const url = `${BRICKLINK_BASE_URL}/categories/${category}`
    const method = 'GET';

    const authHeader = getAuthHeader({
      url,
      method,
    });

    let item: Category | undefined = undefined;
    try {
      const response = await axios.get<{ data: Category }>(url, {
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
      item?.category_id,
      item?.category_name,
      item?.parent_id,
    ].join('","')}"`);

    await delay(1000);
  }

  console.info('Info: Writing to data/bricklink-category.csv');
  fs.writeFileSync(path.resolve(__dirname, '../data/bricklink-category.csv'), output.join('\n'), 'utf8');
})();
