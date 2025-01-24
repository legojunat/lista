import "dotenv/config";
import axios from "axios";
import fs from "fs";
import path from "path";

import { getAuthHeader } from "./oauth";
import { processFile } from "./process-file";
import { delay } from "./delay";
import { BRICKLINK_BASE_URL } from "./constants";

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
  console.info(`Info: Starting to fetch price data for ${rows.length} parts`);

  const output: string[] = [];
  output.push(
    [
      "material",
      "brickLinkPartId",
      "brickLinkColorId",
      "minPrice",
      "maxPrice",
      "avgPrice",
      "qtyAvgPrice",
      "unitQuantity",
      "totalQuantity"
    ].join(",")
  );
  for (const [material, brickLinkPartId, brickLinkColorId] of rows) {
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
        console.log("Exitting due error", error);
        process.exit();
      }
    }

    output.push(
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
      ].join(",")
    );

    await delay(1000);
  }

  console.info("Info: Writing to data/bricklink-price.csv");
  fs.writeFileSync(path.resolve(__dirname, "../data/bricklink-price.csv"), output.join("\n"), "utf8");
})();
