import React, { useMemo } from "react";
import classNames from "classnames";

import useApi from "../hooks/useApi";
import { Material } from "../types/material";

import Image from "./Image";
import Row from "./Row";

import "./Parts.css";
import { FEES } from "../constants";

interface Props {
  showTable: boolean;
  search: string;
  zoomed: boolean;
}

function Parts({ showTable, search, zoomed }: Props) {
  const { selectedCategoryAndColorMaterials } = useApi();

  const selectedCategoryAndColorMaterialsWithSearch = useMemo(() => {
    if (!search) {
      return selectedCategoryAndColorMaterials;
    }

    return selectedCategoryAndColorMaterials.filter((material) => {
      for (const key in material) {
        const part = material[key as keyof Material];
        if (part && typeof part === "object") {
          const match: string | undefined = Object.values(part).find((value: string) => {
            if (typeof value === "string" && value.toUpperCase().includes(search.toUpperCase())) {
              return true;
            }
            return false;
          });

          if (match) {
            return true;
          }
        }
      }

      return false;
    });
  }, [search, selectedCategoryAndColorMaterials]);

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
                <th rowSpan={2}>LB hinta</th>
              </tr>
              <tr>
                <th>osakoodi</th>
                <th>min</th>
                <th>avg</th>
                <th>max</th>
                <th>qty avg</th>
                <th>unit</th>
                <th>total</th>
                <th>* {FEES.toFixed(3)}</th>
              </tr>
            </thead>
            <tbody>
              {selectedCategoryAndColorMaterialsWithSearch.map((material) => (
                <Row key={material.lugbulkData.material} material={material} />
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!showTable && (
        <div className={classNames("Parts-images", { zoomed })}>
          {selectedCategoryAndColorMaterialsWithSearch.map((material) => (
            <Image key={material.lugbulkData.material} material={material} zoomed={zoomed} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Parts;
