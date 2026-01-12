import path from "path";

import { processFile, recordsToObjects } from "./process-file";

interface Color {
  img: string;
  rebrickableId: string;
  rebrickableName: string;
  hex: string;
  legoId: string;
  legoName: string;
  lDrawId: string;
  lDrawName: string;
  bricklinkId: string;
  bricklinkName: string;
  brickowlId: string;
  brickowlName: string;
}

const extractIdAndName = (value?: string) => {
  if (!value) return { id: "", name: "" };
  const firstEntry = value
    .split(/\n/)
    .map((entry) => entry.trim())
    .find(Boolean);
  if (!firstEntry) return { id: "", name: "" };
  const match = firstEntry.match(/^(\d+)\s*\[(.*)\]$/);
  if (!match) return { id: firstEntry, name: "" };
  const names = match[2]
    .split(",")
    .map((part) => part.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean);
  return { id: match[1], name: names[0] ?? "" };
};

export const getColors = async (): Promise<Color[]> => {
  const rows = await processFile(path.resolve(__dirname, "../data/colors.csv"));
  return recordsToObjects(rows).map((row) => {
    const { id: legoId, name: legoName } = extractIdAndName(row.LEGO);
    const { id: lDrawId, name: lDrawName } = extractIdAndName(row.LDraw);
    const { id: bricklinkId, name: bricklinkName } = extractIdAndName(row.BrickLink);
    const { id: brickowlId, name: brickowlName } = extractIdAndName(row.BrickOwl);
    return {
      img: row.Img ?? "",
      rebrickableId: row.ID ?? "",
      rebrickableName: row.Name ?? "",
      hex: row.RGB ?? "",
      legoId,
      legoName,
      lDrawId,
      lDrawName,
      bricklinkId,
      bricklinkName,
      brickowlId,
      brickowlName
    };
  });
};
