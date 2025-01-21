const fs = require('fs');
const { parse } = require('csv-parse');

const processFile = async (file) => {
  const records = [];
  const parser = fs
    .createReadStream(file)
    .pipe(parse({
      // CSV options if any
    }));
  for await (const record of parser) {
    // Work with each record
    records.push(record);
  }
  return records;
};

module.exports = { processFile };
