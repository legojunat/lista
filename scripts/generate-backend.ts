import fs from "fs";
import path from "path";

import { processFile, recordsToObjects } from "./process-file";
import { getColors } from "./colors";
import { encodePrice } from "./crypto-utils";

interface Data {
  mainGroupTop: string;
  mainGroupSub: string;
  material: string;
  description: string;
  colourId: string;
  communicationNumber: string;
  grossWeight?: string;
  length: string;
  width: string;
  height: string;
  price: string;
}

(async function () {
  const categoryFile = path.resolve(__dirname, "../data/bricklink-category.csv");
  if (!fs.existsSync(categoryFile)) {
    console.error('Error: data/bricklink-category.csv not found, please generate it with "npm run bricklink-category"');
    process.exit();
  }

  const itemFile = path.resolve(__dirname, "../data/bricklink-item.csv");
  if (!fs.existsSync(itemFile)) {
    console.error('Error: data/bricklink-item.csv not found, please generate it with "npm run bricklink-item"');
    process.exit();
  }

  const legoFile = path.resolve(__dirname, "../data/bricklink-lego.csv");
  if (!fs.existsSync(legoFile)) {
    console.error('Error: data/bricklink-lego.csv not found, please generate it with "npm run bricklink-lego"');
    process.exit();
  }

  const priceFile = path.resolve(__dirname, "../data/bricklink-price.csv");
  if (!fs.existsSync(priceFile)) {
    console.error('Error: data/bricklink-price.csv not found, please generate it with "npm run bricklink-price"');
    process.exit();
  }

  const lugbulkOriginalData = path.resolve(__dirname, "../data/lugbulk-original-data.csv");
  if (!fs.existsSync(lugbulkOriginalData)) {
    console.error("Error: data/lugbulk-original-data.csv not found");
    process.exit();
  }

  console.info("Info: Processing data/colors.csv");
  const colors = await getColors();

  console.info("Info: Processing data/bricklink-category.csv");
  const categoryRows = recordsToObjects(await processFile(categoryFile));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const categories = categoryRows.reduce((prev, curr) => {
    if (curr.categoryId) {
      const next = new Map(prev);
      next.set(curr.categoryId, curr);
      return next;
    }
    return prev;
  }, new Map<string, Record<string, string>>());

  console.info("Info: Processing data/bricklink-item.csv");
  const itemRows = recordsToObjects(await processFile(itemFile));
  const items = itemRows.reduce((prev, curr) => {
    if (curr.brickLinkPartId) {
      const next = new Map(prev);
      next.set(curr.brickLinkPartId, curr);
      return next;
    }
    return prev;
  }, new Map<string, Record<string, string>>());

  console.info("Info: Processing data/bricklink-lego.csv");
  const legoRows = recordsToObjects(await processFile(legoFile));
  const legos = legoRows.reduce((prev, curr) => {
    if (curr.material) {
      const next = new Map(prev);
      next.set(curr.material, curr);
      return next;
    }
    return prev;
  }, new Map<string, Record<string, string>>());

  console.info("Info: Processing data/bricklink-price.csv");
  const priceRows = recordsToObjects(await processFile(priceFile));
  const prices = priceRows.reduce((prev, curr) => {
    if (curr.material) {
      const next = new Map(prev);
      next.set(curr.material, curr);
      return next;
    }
    return prev;
  }, new Map<string, Record<string, string>>());

  console.info("Info: Processing data/lugbulk-original-data.csv");
  const dataRows = recordsToObjects(await processFile(lugbulkOriginalData));
  const rows = dataRows.map(
    (obj) =>
      ({
        mainGroupTop: obj["Main Group Top"] ?? "",
        mainGroupSub: obj["Main Group Sub"] ?? "",
        material: obj["Material"] ?? "",
        description: obj["Description"] ?? "",
        colourId: obj["Colour ID"] ?? "",
        communicationNumber: obj["Communication number"] ?? "",
        grossWeight: obj["Gross Weight (G)"] ?? "",
        length: obj["Length (MM)"] ?? "",
        width: obj["Width (MM)"] ?? "",
        height: obj["Height (MM)"] ?? "",
        price: encodePrice(obj["2026 Prices (in EUR)"] ?? "")
      }) satisfies Data
  );

  // Rendereable categories based on Lugbulk data
  console.info("Info: Generating public/main-group-tops.json");
  const mainGroupTops = Array.from(new Set(rows.map((row) => row.mainGroupTop))).map((mainGroupTop) => {
    const mainGroupTopRows = rows.filter((row) => row.mainGroupTop === mainGroupTop);
    const mainGroupSubs = Array.from(new Set(mainGroupTopRows.map((row) => row.mainGroupSub)));
    return {
      mainGroupTop,
      items: mainGroupSubs.sort().map((mainGroupSub) => {
        const mainGroupSubRows = mainGroupTopRows.filter((row) => row.mainGroupSub === mainGroupSub);
        const categoryIds = Array.from(
          new Set(
            mainGroupSubRows
              .map(({ material }) => {
                const lego = legos.get(material);
                const item = lego ? items.get(lego.brickLinkPartId) : undefined;
                return item?.categoryId;
              })
              .filter(Boolean)
          )
        );
        return {
          mainGroupSub,
          categoryIds,
          materials: mainGroupSubRows.map((row) => row.material)
        };
      })
    };
  });
  fs.writeFileSync(
    path.resolve(__dirname, "../public/main-group-tops.json"),
    JSON.stringify(mainGroupTops, null, 2),
    "utf8"
  );

  // Renderable categories based on BrickLink categories found in Lugbulk data
  console.info("Info: Generating public/bricklink-categories.json");
  const rowsWithBrickLinkMetadata = rows.map((row) => {
    const lego = legos.get(row.material);
    const item = lego ? items.get(lego.brickLinkPartId) : undefined;
    const categoryId = item?.categoryId;
    return { ...row, categoryId };
  });
  const brickLinkCategories = categoryRows.map(({ categoryId, categoryName }) => ({
    categoryId,
    categoryName,
    bricklinkColorIds: Array.from(
      new Set(
        rowsWithBrickLinkMetadata
          .filter((row) => row.categoryId === categoryId)
          .map(({ material }) => {
            const lego = legos.get(material);
            return lego?.brickLinkColorId;
          })
          .filter(Boolean)
      )
    ),
    materials: rowsWithBrickLinkMetadata.filter((row) => row.categoryId === categoryId).map((row) => row.material)
  }));
  fs.writeFileSync(
    path.resolve(__dirname, "../public/bricklink-categories.json"),
    JSON.stringify(brickLinkCategories, null, 2),
    "utf8"
  );

  // Renderable categories based on BrickLink categories found in Lugbulk data
  console.info(`Info: Generating public/category-materials/*.json (${categoryRows.length} pcs)`);
  for (const { categoryId, categoryName } of categoryRows) {
    const categoryMaterials = {
      categoryId,
      categoryName,
      bricklinkColorIds: Array.from(
        new Set(
          rowsWithBrickLinkMetadata
            .filter((row) => row.categoryId === categoryId)
            .map(({ material }) => {
              const lego = legos.get(material);
              return lego?.brickLinkColorId;
            })
            .filter(Boolean)
        )
      ),
      materials: rowsWithBrickLinkMetadata
        .filter((row) => row.categoryId === categoryId)
        .map((row) => {
          const lego = legos.get(row.material);
          const price = prices.get(row.material);
          const item = lego ? items.get(lego.brickLinkPartId) : undefined;
          return { lugbulkData: row, price, item };
        })
    };
    fs.writeFileSync(
      path.resolve(__dirname, `../public/category-materials/${categoryId}.json`),
      JSON.stringify(categoryMaterials, null, 2),
      "utf8"
    );
  }

  // Colors
  console.info("Info: Generating public/colors.json");
  fs.writeFileSync(path.resolve(__dirname, "../public/colors.json"), JSON.stringify(colors, null, 2), "utf8");

  // Note! Not used at the moment
  // Individual materials with metadata
  console.info(`Info: Generating public/materials/*.json (${rows.length} pcs)`);
  for (const row of rows) {
    const lego = legos.get(row.material);
    const price = prices.get(row.material);
    const item = lego ? items.get(lego.brickLinkPartId) : undefined;
    const filename = path.resolve(__dirname, `../public/materials/${row.material}.json`);
    const payload = { lugbulkData: row, price, item };
    fs.writeFileSync(filename, JSON.stringify(payload, null, 2), "utf8");
  }
})();
