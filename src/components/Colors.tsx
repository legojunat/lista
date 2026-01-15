import React, { useMemo } from "react";
import classNames from "classnames";

import "./Colors.css";
import useApi from "../hooks/useApi";

const getContrastingTextColor = (hex: string) => {
  const cleaned = hex.replace(/^#/, "").padEnd(6, "0").slice(0, 6);
  const bigint = Number.parseInt(cleaned, 16);
  if (Number.isNaN(bigint)) return "#000000";
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
  return brightness > 186 ? "#000000" : "#ffffff";
};

function Colors() {
  const {
    selectedBricklinkColorIds,
    selectedCategoryColors,
    toggleSelectedBricklinkColorId,
    toggleSelectAllBricklinkColorIds
  } = useApi();

  const label = useMemo(
    () => (selectedBricklinkColorIds.size === selectedCategoryColors.length ? "Poista kaikki" : "Valitse kaikki"),
    [selectedBricklinkColorIds, selectedCategoryColors]
  );

  return (
    <div className="Colors">
      <button onClick={toggleSelectAllBricklinkColorIds}>{label}</button>
      {selectedCategoryColors.map(({ bricklinkId, bricklinkName, hex }) => (
        <div
          key={bricklinkId}
          className={classNames("Colors-buttonWrapper", {
            selected: selectedBricklinkColorIds.has(bricklinkId)
          })}
        >
          <button
            style={{ backgroundColor: `#${hex}`, color: getContrastingTextColor(hex) }}
            onClick={() => toggleSelectedBricklinkColorId(bricklinkId)}
          >
            {bricklinkName}
          </button>
        </div>
      ))}
    </div>
  );
}

export default Colors;
