import "dotenv/config";
import axios from "axios";
import fs from "fs";
import path from "path";

import { getAuthHeader } from "./oauth";
import { processFile } from "./process-file";
import { delay } from "./delay";
import { BRICKLINK_BASE_URL, BRICKLINK_API_TIMEOUT } from "./constants";
import { formatTime } from "./format-time";

interface Category {
  category_id: number;
  category_name: string;
  parent_id: number;
}

(async function () {
  const bricklinkItem = path.resolve(__dirname, "../data/bricklink-item.csv");
  if (!fs.existsSync(bricklinkItem)) {
    console.error('Error: data/bricklink-item.csv not found, please generate it with "npm run bricklink-item"');
    process.exit();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_header, ...rows] = await processFile(bricklinkItem);
  const categories = Array.from(new Set(rows.map((row) => row[3]))).filter(Boolean);
  const totalRows = categories.length;

  const outputPath = path.resolve(__dirname, "../data/bricklink-category.csv");
  const header = '"' + ["categoryId", "categoryName", "parentId"].join('","') + '"';
  fs.writeFileSync(outputPath, header + "\n", "utf8");

  const requestDurations: number[] = [];
  const scriptStartTime = Date.now();

  for (let i = 0; i < totalRows; i++) {
    const loopStartTime = Date.now();
    const category = categories[i];
    const url = `${BRICKLINK_BASE_URL}/categories/${category}`;
    const method = "GET";

    const authHeader = getAuthHeader({
      url,
      method
    });

    let item: Category | undefined = undefined;
    try {
      const response = await axios.get<{ data: Category }>(url, {
        headers: {
          Authorization: authHeader.Authorization
        }
      });
      item = response.data.data;
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 404) {
        console.log("\nExitting due error", error);
        process.exit();
      }
    }

    const line = `"${[item?.category_id ?? "", item?.category_name ?? "", item?.parent_id ?? ""].join('","')}"`;
    fs.appendFileSync(outputPath, line + "\n", "utf8");

    const currentPercentage = Math.round(((i + 1) / totalRows) * 100);
    let progressText = `Fetching category data: ${i + 1}/${totalRows} (${currentPercentage}%)`;

    const loopEndTime = Date.now();
    const duration = loopEndTime - loopStartTime;
    requestDurations.push(duration);
    if (requestDurations.length > 10) {
      requestDurations.shift();
    }

    if (i >= 9) {
      const avgApiDuration = requestDurations.reduce((a, b) => a + b, 0) / requestDurations.length;
      const avgLoopDuration = avgApiDuration + BRICKLINK_API_TIMEOUT;
      const remainingItems = totalRows - (i + 1);
      const remainingTimeMs = remainingItems * avgLoopDuration;
      const elapsedTimeMs = Date.now() - scriptStartTime;
      const totalTimeMs = elapsedTimeMs + remainingTimeMs;

      progressText += ` - Elapsed: ${formatTime(elapsedTimeMs)}, Remaining: ${formatTime(
        remainingTimeMs
      )} (Total: ${formatTime(totalTimeMs)})`;
    }

    process.stdout.write(progressText.padEnd(120, " ") + "\r");

    await delay(BRICKLINK_API_TIMEOUT);
  }

  process.stdout.write("\n");
  console.log(`Finished in ${formatTime(Date.now() - scriptStartTime)}.`);
})();
