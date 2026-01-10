import "dotenv/config";
import axios from "axios";
import fs from "fs";
import path from "path";

import { getAuthHeader } from "./oauth";
import { processFile } from "./process-file";
import { delay } from "./delay";
import { BRICKLINK_BASE_URL, BRICKLINK_API_TIMEOUT } from "./constants";
import { formatTime } from "./format-time";

interface BrickLinkLego {
  data: Array<{
    item?: {
      no: string;
    };
    color_id?: string;
  }>;
}

(async function () {
  const lugbulkOriginalData = path.resolve(__dirname, "../data/lugbulk-original-data.csv");
  if (!fs.existsSync(lugbulkOriginalData)) {
    console.error("Error: data/lugbulk-original-data.csv not found");
    process.exit();
  }
  // on list 2025,Main Group Top,Main Group,Main Group Sub,Material,,Colour ID
  /*
  row[0] => on list 2025 = 1
  row[1] => Main Group Top = DUPLO
  row[2] => Main Group Sub = "1 ROW W/ STUD, WITH"
  row[3] => Material = 6030817
  row[4] => Description = DUPLO BRICK 1X2X2
  row[5] => Colour ID = BR.YEL
  row[6] => Main Group = BRICKS
  */
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_header, ...rows] = await processFile(lugbulkOriginalData);
  const totalRows = rows.length;

  const outputPath = path.resolve(__dirname, "../data/bricklink-lego.csv");
  const header = ["material", "brickLinkPartId", "brickLinkColorId"].join(",");
  fs.writeFileSync(outputPath, header + "\n", "utf8");

  const requestDurations: number[] = [];
  const scriptStartTime = Date.now();

  for (let i = 0; i < totalRows; i++) {
    const loopStartTime = Date.now();
    const row = rows[i];
    const material = row[3];
    const url = `${BRICKLINK_BASE_URL}/item_mapping/${material}`;
    const method = "GET";

    const authHeader = getAuthHeader({
      url,
      method
    });

    try {
      const response = await axios.get<BrickLinkLego>(url, {
        headers: {
          Authorization: authHeader.Authorization
        }
      });
      const brickLinkPartId = response.data?.data[0]?.item?.no ?? "";
      const brickLinkColorId = response.data?.data[0]?.color_id ?? "";
      fs.appendFileSync(outputPath, [material, brickLinkPartId, brickLinkColorId].join(",") + "\n", "utf8");
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 404) {
        console.log("\nExitting due error", error);
        process.exit();
      } else {
        // For 404, we just write an empty line for that material to keep progress.
        fs.appendFileSync(outputPath, [material, "", ""].join(",") + "\n", "utf8");
      }
    }

    const currentPercentage = Math.round(((i + 1) / totalRows) * 100);
    let progressText = `Matching Lego parts with BrickLink: ${i + 1}/${totalRows} (${currentPercentage}%)`;

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
