import React, { useMemo } from "react";

import useApi from "../hooks/useApi";

import Image from "./Image";
import Row from "./Row";

import "./Parts.css";

interface Props {
  showTable: boolean;
  search: string;
}

function Parts({ showTable, search }: Props) {
  const { categories, selectedCategoryIds } = useApi();

  const materialIds = useMemo(() => {
    return categories
      .filter(({ categoryId }) => selectedCategoryIds.has(categoryId))
      .map(({ materials }) => materials)
      .flatMap((materials) => materials);
  }, [categories, selectedCategoryIds]);

  return (
    <div className="Parts">
      {showTable && (
        <div className="Parts-table">
          <table>
            <thead>
              <tr>
                <th rowSpan={2}>Kuva</th>
                <th rowSpan={2}>Väri</th>
                <th>BrickLink</th>
                <th colSpan={4}>BrickLink hinta</th>
                <th colSpan={2}>BrickLink saatavuus</th>
                <th rowSpan={2}>BrickLink osan nimi</th>
                <th>LB hinta</th>
                <th rowSpan={2}>Material</th>
                <th rowSpan={2}>Description</th>
                <th rowSpan={2}>Colour ID</th>
                <th rowSpan={2}>Price</th>
              </tr>
              <tr>
                <th>osakoodi</th>
                <th>min</th>
                <th>avg</th>
                <th>max</th>
                <th>qty avg</th>
                <th>unit</th>
                <th>total</th>
                <th>ALV&P</th>
              </tr>
            </thead>
            <tbody>
              {materialIds.map((materialId) => (
                <Row key={materialId} materialId={materialId} search={search} />
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!showTable && (
        <div className="Parts-images">
          {materialIds.map((materialId) => (
            <Image key={materialId} materialId={materialId} search={search} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Parts;
