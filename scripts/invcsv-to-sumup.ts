import fs from "fs";
import path from "path";

import { getColors } from "./colors";

const header = [
  "Item name",
  "Variations",
  "Option set 1",
  "Option 1",
  "Option set 2 ",
  "Option 2",
  "Option set 3",
  "Option 3",
  "Option set 4",
  "Option 4",
  "Is variation visible? (Yes/No)",
  "Price",
  "On sale in Online Store?",
  "Regular price (before sale)",
  "Tax rate (%)",
  "Unit",
  "Track inventory? (Yes/No)",
  "Quantity",
  "Low stock threshold",
  "SKU",
  "Barcode",
  "Description (Online Store and Invoices only)",
  "Category",
  "Display colour in POS checkout ",
  "Image 1",
  "Image 2",
  "Image 3",
  "Image 4",
  "Image 5",
  "Image 6",
  "Image 7",
  "Display item in Online Store? (Yes/No)",
  "SEO title (Online Store only)",
  "SEO description (Online Store only)",
  "Shipping weight [kg] (Online Store only)",
  "Item id (Do not change)",
  "Variant id (Do not change)"
];

function cleanField(field: string): string {
  field = field.trim();
  if (field.startsWith('"') && field.endsWith('"')) {
    field = field.slice(1, -1);
  }
  return field.replace(/""/g, '"');
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      result.push(cleanField(current));
      current = "";
    } else {
      current += char;
    }
  }
  result.push(cleanField(current));
  return result;
}

(async function () {
  const colors = await getColors();

  const invCsvFile = path.resolve(__dirname, "../data/invcsv.csv");
  if (!fs.existsSync(invCsvFile)) {
    console.error("Error: data/invcsv.csv not found");
    process.exit();
  }
  const data = await fs.readFileSync(invCsvFile, { encoding: "utf8" });
  const rows = data.split(/\r?\n/).slice(1).map(splitCsvLine);

  console.log(header.join(","));
  for (const row of rows) {
    if (!row[0]) {
      continue;
    }

    // row[0] = Lot ID
    // row[1] = Color
    // row[2] = Category
    // row[3] = Condition
    // row[4] = Sub-Condition
    // row[5] = Description
    // row[6] = Remarks
    // row[7] = Price
    // row[8] = Quantity
    // row[9] = Bulk
    // row[10] = Sale
    // row[11] = URL
    // row[12] = Item No
    // row[13] = Tier Qty 1
    // row[14] = Tier Price 1
    // row[15] = Tier Qty 2
    // row[16] = Tier Price 2
    // row[17] = Tier Qty 3
    // row[18] = Tier Price 3
    // row[19] = Reserved For
    // row[20] = Stockroom
    // row[21] = Retain
    // row[22] = Super Lot ID
    // row[23] = Super Lot Qty
    // row[24] = My Cost
    // row[25] = Weight
    // row[26] = Extended Description
    // row[27] = Date Added
    // row[28] = Date Last Sold
    // row[29] = Currency

    const sku = row[0];
    const category = `"${row[2].split(",")[0]}"`;
    const itemName = `"${row[5]}"`;
    const price = row[7];

    const color = colors.find((c) => c.bricklinkName === row[1]);
    const image = color ? `https://img.bricklink.com/ItemImage/PN/${color.bricklinkId}/${row[12]}.png` : "";

    console.log(
      [
        itemName, // Item name
        "", // Variations
        "", // Option set 1
        "", // Option 1
        "", // Option set 2
        "", // Option 2
        "", // Option set 3
        "", // Option 3
        "", // Option set 4
        "", // Option 4
        "", // Is variation visible? (Yes/No)
        price, // Price
        "", // On sale in Online Store?
        "", // Regular price (before sale)
        "", // Tax rate (%)
        "", // Unit
        "", // Track inventory? (Yes/No)
        "", // Quantity
        "", // Low stock threshold
        sku, // SKU
        "", // Barcode
        "", // Description (Online Store and Invoices only)
        category, // Category
        "Black", // Display colour in POS checkout
        image, // Image 1
        "", // Image 2
        "", // Image 3
        "", // Image 4
        "", // Image 5
        "", // Image 6
        "", // Image 7
        "", // Display item in Online Store? (Yes/No)
        "", // SEO title (Online Store only)
        "", // SEO description (Online Store only)
        "", // Shipping weight [kg] (Online Store only)
        "", // Item id (Do not change)
        "" // Variant id (Do not change
      ].join(",")
    );
  }
})();
