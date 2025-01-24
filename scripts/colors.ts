import path from "path";

import { processFile } from "./process-file";

interface Color {
  material: string;
  legoId: string;
  legoName: string;
  legoAbbreviation: string;
  brickColorstream: string;
  bricklinkId: string;
  bricklinkName: string;
  lDrawId: string;
  lDrawName: string;
  peeronName: string;
  otherName: string;
  rarity: string;
  firstSeen: string;
  lastSeen: string;
  notes: string;
  hex: string;
}

export const getColors = async (): Promise<Color[]> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_header, ...rows] = await processFile(path.resolve(__dirname, "../data/colors.csv"));
  return rows.map((row) => ({
    material: row[0] ?? "",
    legoId: row[1] ?? "",
    legoName: row[2] ?? "",
    legoAbbreviation: row[3] ?? "",
    brickColorstream: row[4] ?? "",
    bricklinkId: row[5] ?? "",
    bricklinkName: row[6] ?? "",
    lDrawId: row[7] ?? "",
    lDrawName: row[8] ?? "",
    peeronName: row[9] ?? "",
    otherName: row[10] ?? "",
    rarity: row[11] ?? "",
    firstSeen: row[12] ?? "",
    lastSeen: row[13] ?? "",
    notes: row[14] ?? "",
    hex: row[15] ?? ""
  }));
};
