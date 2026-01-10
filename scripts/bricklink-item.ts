import "dotenv/config";
import axios from "axios";
import fs from "fs";
import path from "path";

import { getAuthHeader } from "./oauth";
import { processFile } from "./process-file";
import { delay } from "./delay";
import { BRICKLINK_BASE_URL, BRICKLINK_API_TIMEOUT } from "./constants";
import { formatTime } from "./format-time";

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

(async function () {
  const bricklinkLego = path.resolve(__dirname, "../data/bricklink-lego.csv");
  if (!fs.existsSync(bricklinkLego)) {
    console.error('Error: data/bricklink-lego.csv not found, please generate it with "npm run bricklink-lego"');
    process.exit();
  }

  // row[0] => material = 6013938
  // row[1] => brickLinkPartId = 32002
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_header, ...rows] = await processFile(bricklinkLego);
  const brickLinkPartIds = Array.from(new Set(rows.map((row) => row[1]))).filter(Boolean);
  const totalRows = brickLinkPartIds.length;

  const outputPath = path.resolve(__dirname, "../data/bricklink-item.csv");
  const headerFields = [
    "brickLinkPartId",
    "name",
    "type",
    "categoryId",
    "imageUrl",
    "thumbnailUrl",
    "weight",
    "dimX",
    "dimY",
    "dimZ",
    "yearReleased",
    "isObsolete"
  ];
  fs.writeFileSync(outputPath, `"${headerFields.join('","')}"\n`, "utf8");

  const requestDurations: number[] = [];
  const scriptStartTime = Date.now();

  for (let i = 0; i < totalRows; i++) {
    const loopStartTime = Date.now();
    const brickLinkPartId = brickLinkPartIds[i];

    const url = `${BRICKLINK_BASE_URL}/items/part/${brickLinkPartId}`;
    const method = "GET";

    const authHeader = getAuthHeader({
      url,
      method
    });

    let item: BrickLinkItem | undefined = undefined;
    try {
      const response = await axios.get<{ data: BrickLinkItem }>(url, {
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

    const line = `"${[
      item?.no ?? "",
      item?.name ?? "",
      item?.type ?? "",
      item?.category_id ?? "",
      item?.image_url ?? "",
      item?.thumbnail_url ?? "",
      item?.weight ?? "",
      item?.dim_x ?? "",
      item?.dim_y ?? "",
      item?.dim_z ?? "",
      item?.year_released ?? "",
      item?.is_obsolete === true ? "1" : item?.is_obsolete === false ? "0" : ""
    ].join('","')}"`;
    fs.appendFileSync(outputPath, line + "\n", "utf8");

    const currentPercentage = Math.round(((i + 1) / totalRows) * 100);
    let progressText = `Fetching item data for parts: ${i + 1}/${totalRows} (${currentPercentage}%)`;

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
