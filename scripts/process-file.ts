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
