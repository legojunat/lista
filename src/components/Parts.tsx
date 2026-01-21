import React, { useMemo, useRef, useEffect } from "react";
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
  const gridRef = useRef<HTMLDivElement>(null);

  const selectedCategoryAndColorMaterialsWithSearch = useMemo(() => {
    if (!search) {
      return selectedCategoryAndColorMaterials;
    }

    // Special case for NO_BRICKLINK
    if (search === "NO_BRICKLINK") {
      return selectedCategoryAndColorMaterials.filter((material) => {
        return material.price.totalQuantity === "0";
      });
    }

    // Check if it's an OR search
    if (search.toUpperCase().startsWith("OR ")) {
      const searchTerms = search.substring(3).trim().split(/\s+/).filter(Boolean);

      return selectedCategoryAndColorMaterials.filter((material) => {
        // Check if any search term matches
        return searchTerms.some((term) => {
          for (const key in material) {
            const part = material[key as keyof Material];
            if (part && typeof part === "object") {
              const match = Object.values(part).find((value: string) => {
                if (typeof value === "string" && value.toUpperCase().includes(term.toUpperCase())) {
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
      });
    }

    // Default search (AND search with multiple terms)
    const searchTerms = search.trim().split(/\s+/).filter(Boolean);

    return selectedCategoryAndColorMaterials.filter((material) => {
      // Check if all search terms match
      return searchTerms.every((term) => {
        for (const key in material) {
          const part = material[key as keyof Material];
          if (part && typeof part === "object") {
            const match = Object.values(part).find((value: string) => {
              if (typeof value === "string" && value.toUpperCase().includes(term.toUpperCase())) {
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
    });
  }, [search, selectedCategoryAndColorMaterials]);

  useEffect(() => {
    if (gridRef.current && !showTable) {
      const firstChild = gridRef.current.firstElementChild as HTMLElement;
      if (firstChild) {
        const width = firstChild.offsetWidth;
        gridRef.current.style.setProperty("--item-size", `${width}px`);
      }
    }
  }, [selectedCategoryAndColorMaterialsWithSearch, showTable, zoomed]);

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
        <div ref={gridRef} className={classNames("Parts-images", { zoomed })}>
          {selectedCategoryAndColorMaterialsWithSearch.map((material) => (
            <Image key={material.lugbulkData.material} material={material} zoomed={zoomed} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Parts;
