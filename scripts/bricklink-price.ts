import "dotenv/config";
import axios from "axios";
import fs from "fs";
import path from "path";

import { getAuthHeader } from "./oauth";
import { processFile } from "./process-file";
import { delay } from "./delay";
import { BRICKLINK_BASE_URL, BRICKLINK_API_TIMEOUT } from "./constants";
import { formatTime } from "./format-time";

export interface BrickLinkPart {
  item: {
    no: string;
    type: string;
  };
  new_or_used: string;
  currency_code: string;
  min_price: string;
  max_price: string;
  avg_price: string;
  qty_avg_price: string;
  unit_quantity: number;
  total_quantity: number;
  price_detail: Array<{
    quantity: number;
    unit_price: string;
    seller_country_code: string;
    buyer_country_code: string;
    date_ordered: Date;
    qunatity: number;
  }>;
}

(async function () {
  const bricklinkFile = path.resolve(__dirname, "../data/bricklink-lego.csv");
  if (!fs.existsSync(bricklinkFile)) {
    console.error('Error: data/bricklink-lego.csv not found, please generate it with "npm run bricklink-lego"');
    process.exit();
  }

  // row[0] => material = 6013938
  // row[1] => brickLinkPartId = 32002
  // row[2] => brickLinkColorId = 2
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_header, ...rows] = await processFile(bricklinkFile);
  const totalRows = rows.length;

  const outputPath = path.resolve(__dirname, "../data/bricklink-price.csv");
  const header = [
    "material",
    "brickLinkPartId",
    "brickLinkColorId",
    "minPrice",
    "maxPrice",
    "avgPrice",
    "qtyAvgPrice",
    "unitQuantity",
    "totalQuantity"
  ].join(",");
  fs.writeFileSync(outputPath, header + "\n", "utf8");

  const requestDurations: number[] = [];
  const scriptStartTime = Date.now();

  for (let i = 0; i < totalRows; i++) {
    const loopStartTime = Date.now();
    const [material, brickLinkPartId, brickLinkColorId] = rows[i];
    const url =
      brickLinkPartId && brickLinkColorId
        ? `${BRICKLINK_BASE_URL}/items/part/${brickLinkPartId}/price?color_id=${brickLinkColorId}&guide_type=sold&region=eu`
        : `${BRICKLINK_BASE_URL}/items/part/${material}/price?guide_type=sold&region=eu`;
    const method = "GET";

    const authHeader = getAuthHeader({
      url,
      method
    });

    let info: BrickLinkPart | undefined = undefined;
    try {
      const response = await axios.get<{ data: BrickLinkPart }>(url, {
        headers: {
          Authorization: authHeader.Authorization
        }
      });
      info = response.data.data;
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 404) {
        console.log("\nExitting due error", error);
        process.exit();
      }
    }

    fs.appendFileSync(
      outputPath,
      [
        material,
        brickLinkPartId ?? "",
        brickLinkColorId ?? "",
        info?.min_price ?? "",
        info?.max_price ?? "",
        info?.avg_price ?? "",
        info?.qty_avg_price ?? "",
        info?.unit_quantity ?? "",
        info?.total_quantity ?? ""
      ].join(",") + "\n",
      "utf8"
    );

    const currentPercentage = Math.round(((i + 1) / totalRows) * 100);
    let progressText = `Fetching price data for parts: ${i + 1}/${totalRows} (${currentPercentage}%)`;

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
