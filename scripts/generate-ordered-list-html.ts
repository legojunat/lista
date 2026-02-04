import fs from "fs";
import path from "path";

import { processFile } from "./process-file";

const BRICKLINK_IMAGE_URL = "https://img.bricklink.com/ItemImage";

interface Part {
  brickLinkPartId?: string;
  brickLinkColorId?: string;
  file?: string;
}

const anotherMap: Record<string, Part> = {
  "6490873": {
    brickLinkPartId: "5533",
    brickLinkColorId: "108"
  }
};

const skipMap: Record<string, string> = {
  "5264": "./img/5264_black.png"
};

(async function () {
  const orderedFile = path.resolve(__dirname, "../data/basebrick-ordered.csv");
  if (!fs.existsSync(orderedFile)) {
    console.error('Error: data/basebrick-ordered.csv not found"');
    process.exit();
  }

  const priceFile = path.resolve(__dirname, "../data/bricklink-price.csv");
  if (!fs.existsSync(priceFile)) {
    console.error('Error: data/bricklink-price.csv not found, please generate it with "npm run bricklink-price"');
    process.exit();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_priceHeader, ...priceRows] = await processFile(priceFile);
  const priceMap: Record<string, Part> = priceRows.reduce(
    (prev, [material, brickLinkPartId, brickLinkColorId]) => ({
      ...prev,
      [material]: {
        brickLinkPartId,
        brickLinkColorId
      }
    }),
    {}
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_orderedHeader, ...orderedRows] = await processFile(orderedFile);
  const orderedMaterials = orderedRows.map((orderedRow) => {
    const part = orderedRow[2];
    if (skipMap[part]) {
      return { file: skipMap[part] };
    }

    const materials = orderedRow[1].split(/\s+/);
    for (const material of materials) {
      if (priceMap[material]) {
        return priceMap[material];
      }

      if (anotherMap[material]) {
        return anotherMap[material];
      }
    }

    return { brickLinkPartId: part };
  });

  console.log(`<!doctype html>
<html>
  <head>
    <title>Kuvat</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style type="text/css">
      body {
        display: flex;
        flex-wrap: wrap;
      }

      h1 {
        background-image: url("https://www.palikkatakomo.org/forum/templates/Takomo_Vaalea/images/logo.jpg");
        background-size: contain;
        background-position: left center;
        background-repeat: no-repeat;
        width: 300px;
        height: 100px;
        color: transparent;
        margin-right: 20px;
      }

      img {
        display: block;
        max-width: 200px;
        max-height: 120px;
        width: auto;
        height: auto;
        object-fit: contain;
        margin-right: 20px;
        margin-bottom: 10px;
      }

      img.wrongcolor {
        border: 2px solid red;
      }
    </style>
  </head>
  <body>
    <h1>Palikkatakomo</h1>${orderedMaterials
      .map(({ brickLinkPartId, brickLinkColorId, file }, index) =>
        brickLinkPartId && brickLinkColorId
          ? `
    <img src="${BRICKLINK_IMAGE_URL}/PN/${brickLinkColorId}/${brickLinkPartId}.png" />`
          : brickLinkPartId
            ? `
    <img src="${BRICKLINK_IMAGE_URL}/PL/${brickLinkPartId}.png" class="wrongcolor" /><!-- ${index + 1} -->`
            : `
    <img src="${file}" />`
      )
      .join("")}
  </body>
</html>
`);
})();
