import fs from "fs";
import path from "path";

import { processFile } from "./process-file";
import { getColors } from "./colors";

interface Item {
  brickLinkPartId: string;
  name: string;
  type: string;
  categoryId: string;
  imageUrl: string;
  thumbnailUrl: string;
  weight: string;
  dimX: string;
  dimY: string;
  dimZ: string;
  yearReleased: string;
  isObsolete: string;
}

interface Lego {
  materialId: string;
  brickLinkPartId: string;
  brickLinkColorId: string;
}

interface Price {
  brickLinkPartId: string;
  brickLinkColorId: string;
  minPrice: string;
  avgPrice: string;
  maxPrice: string;
  qtyAvgPrice: string;
  unitQuantity: string;
  totalQuantity: string;
}

interface Data {
  onList2024: string;
  mainGroupTop: string;
  mainGroupSub: string;
  material: string;
  description: string;
  colourId: string;
  communicationNumber: string;
  grossWeight: string;
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_categoryHeader, ...categoryRows] = await processFile(categoryFile);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const categories = new Map<string, string>(
    Object.entries(
      categoryRows.reduce(
        (prev, [categoryId, categoryName]) => ({
          ...prev,
          [categoryId]: categoryName
        }),
        {}
      )
    )
  );

  console.info("Info: Processing data/bricklink-item.csv");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_itemHeader, ...itemRows] = await processFile(itemFile);
  const items = new Map<string, Item>(
    Object.entries(
      itemRows.reduce(
        (
          prev,
          [
            brickLinkPartId = "",
            name = "",
            type = "",
            categoryId = "",
            imageUrl = "",
            thumbnailUrl = "",
            weight = "",
            dimX = "",
            dimY = "",
            dimZ = "",
            yearReleased = "",
            isObsolete = ""
          ]
        ) => ({
          ...prev,
          [brickLinkPartId]: {
            brickLinkPartId,
            name,
            type,
            categoryId,
            imageUrl,
            thumbnailUrl,
            weight,
            dimX,
            dimY,
            dimZ,
            yearReleased,
            isObsolete
          }
        }),
        {}
      )
    )
  );

  console.info("Info: Processing data/bricklink-lego.csv");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_legoHeader, ...legoRows] = await processFile(legoFile);
  const legos = new Map<string, Lego>(
    Object.entries(
      legoRows.reduce(
        (prev, [material = "", brickLinkPartId = "", brickLinkColorId = ""]) => ({
          ...prev,
          [material]: {
            material,
            brickLinkPartId,
            brickLinkColorId
          }
        }),
        {}
      )
    )
  );

  console.info("Info: Processing data/bricklink-price.csv");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_priceHeader, ...priceRows] = await processFile(priceFile);
  const prices = new Map<string, Price>(
    Object.entries(
      priceRows.reduce(
        (
          prev,
          [
            material = "",
            brickLinkPartId = "",
            brickLinkColorId = "",
            minPrice = "",
            avgPrice = "",
            maxPrice = "",
            qtyAvgPrice = "",
            unitQuantity = "",
            totalQuantity = ""
          ]
        ) => ({
          ...prev,
          [material]: {
            brickLinkPartId,
            brickLinkColorId,
            minPrice,
            avgPrice,
            maxPrice,
            qtyAvgPrice,
            unitQuantity,
            totalQuantity
          }
        }),
        {}
      )
    )
  );

  console.info("Info: Processing data/lugbulk-original-data.csv");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_dataHeader, ...dataRows] = await processFile(lugbulkOriginalData);
  const rows: Data[] = dataRows.map(
    ([
      onList2024 = "", // on list 2024 = 1
      mainGroupTop = "", // Main Group Top = TECHNIC
      mainGroupSub = "", // Main Group Sub = CONNECTING BUSH W/ A
      material = "", // Material = 6013938
      description = "", // Description = 1 1/2 M CONNECTING BUSH
      colourId = "", // Colour ID = BRICK-YEL
      communicationNumber = "", // Communication number = 32002
      grossWeight = "", // Gross Weight (G) = 0.109
      length = "", // Length (MM) = 12.100
      width = "", // Width (MM) = 5.600
      height = "", // Height (MM) = 5.900
      price = "" // 2025 Prices (in EUR) = 1.23
    ]) => ({
      onList2024,
      mainGroupTop,
      mainGroupSub,
      material,
      description,
      colourId,
      communicationNumber,
      grossWeight,
      length,
      width,
      height,
      price
    })
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
  const materialsWithBrickLinkMetadata = rows.map(({ material }) => {
    const lego = legos.get(material);
    const item = lego ? items.get(lego.brickLinkPartId) : undefined;
    const categoryId = item?.categoryId;
    return { material, categoryId };
  });
  const brickLinkCategories = categoryRows.map(([categoryId, categoryName]) => ({
    categoryId,
    categoryName,
    materials: materialsWithBrickLinkMetadata.filter((m) => m.categoryId === categoryId).map((m) => m.material)
  }));
  fs.writeFileSync(
    path.resolve(__dirname, "../public/bricklink-categories.json"),
    JSON.stringify(brickLinkCategories, null, 2),
    "utf8"
  );

  // Colors
  console.info("Info: Generating public/colors.json");
  fs.writeFileSync(path.resolve(__dirname, "../public/colors.json"), JSON.stringify(colors, null, 2), "utf8");

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
