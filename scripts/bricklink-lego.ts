import "dotenv/config";
import axios from "axios";
import fs from "fs";
import path from "path";

import { getAuthHeader } from "./oauth";
import { processFile } from "./process-file";
import { delay } from "./delay";
import { BRICKLINK_BASE_URL } from "./constants";

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
  console.info(`Info: Starting to match ${rows.length} Lego parts with BrickLink`);

  const output: string[] = [];
  output.push(["material", "brickLinkPartId", "brickLinkColorId"].join(","));
  for (const row of rows) {
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
      output.push([material, brickLinkPartId, brickLinkColorId].join(","));
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 404) {
        console.log("Exitting due error", error);
        process.exit();
      }
    }

    await delay(1000);
  }

  console.info("Info: Writing to data/bricklink-lego.csv");
  fs.writeFileSync(path.resolve(__dirname, "../data/bricklink-lego.csv"), output.join("\n"), "utf8");
})();
