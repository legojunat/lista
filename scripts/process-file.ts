import fs from "fs";
import { parse } from "csv-parse";

export const processFile = async (file: string) => {
  const records: string[][] = [];
  const parser = fs.createReadStream(file).pipe(
    parse({
      // CSV options if any
    })
  );
  for await (const record of parser) {
    // Work with each record
    records.push(record as string[]);
  }
  return records;
};

export const recordsToObjects = (rows: string[][]): Record<string, string>[] => {
  if (!rows.length) return [];
  const [header, ...data] = rows;
  return data.map((row) =>
    header.reduce<Record<string, string>>((acc, originalKey, idx) => {
      const key = originalKey.replace(/^"|"$/g, "");
      if (key) {
        acc[key] = row[idx] ?? "";
      }
      return acc;
    }, {})
  );
};
