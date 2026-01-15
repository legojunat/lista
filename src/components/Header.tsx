import React, { useCallback, useEffect, useMemo, useState } from "react";

import useApi from "../hooks/useApi";

import Categories from "./Categories";
import Colors from "./Colors";

import ZoomInIcon from "../icons/zoom-in";
import ZoomOutIcon from "../icons/zoom-out";
import GridIcon from "../icons/grid";
import TableIcon from "../icons/table";

const SEARCH_CHANGE_THRESHOLD = 1000; // milliseconds

import "./Header.css";

interface Props {
  showTable: boolean;
  setShowTable: React.Dispatch<React.SetStateAction<boolean>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  zoomed: boolean;
  setZoomed: React.Dispatch<React.SetStateAction<boolean>>;
}

function Header(props: Props) {
  const { showTable, setShowTable, setSearch, zoomed, setZoomed } = props;
  const [categoriesVisible, setCategoriesVisible] = useState(false);
  const [colorsVisible, setColorsVisible] = useState(false);
  const [internalSearchValue, setInternalSearchValue] = useState("");
  const { selectedCategoryIds } = useApi();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(internalSearchValue);
    }, SEARCH_CHANGE_THRESHOLD);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [internalSearchValue]);

  const fastSubmit = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        setSearch(internalSearchValue);
      }
    },
    [internalSearchValue]
  );

  const toggleCategoriesVisible = useCallback(() => setCategoriesVisible((prev) => !prev), []);

  const toggleColorsVisible = useCallback(() => setColorsVisible((prev) => !prev), []);

  useEffect(() => {
    if (categoriesVisible) {
      setColorsVisible(false);
    }
  }, [categoriesVisible]);

  useEffect(() => {
    if (colorsVisible) {
      setCategoriesVisible(false);
    }
  }, [colorsVisible]);

  const toggleCategoriesButtonLabel = useMemo(
    () => (categoriesVisible ? "Piilota kategoriat" : "Näytä kategoriat"),
    [categoriesVisible]
  );

  const toggleColorsButtonLabel = useMemo(() => (colorsVisible ? "Piilota värit" : "Näytä värit"), [colorsVisible]);

  const selectedCategoriesLabel = useMemo(() => {
    if (selectedCategoryIds.size > 1) {
      return `${selectedCategoryIds.size} valittua kategoriaa`;
    }

    if (selectedCategoryIds.size === 1) {
      return "1 valittu kategoria";
    }

    return "Ei valittuja kategorioita";
  }, [selectedCategoryIds.size]);

  const toggleShowTable = useCallback(() => setShowTable((prev) => !prev), []);

  const toggleZoomed = useCallback(() => setZoomed((prev) => !prev), []);

  return (
    <div className="Header">
      <div className="Header-toggleContainer">
        <div className="Header-buttons">
          <button onClick={toggleCategoriesVisible}>{toggleCategoriesButtonLabel}</button>
          <button onClick={toggleColorsVisible} disabled={selectedCategoryIds.size === 0}>
            {toggleColorsButtonLabel}
          </button>
          <button onClick={toggleShowTable}>{showTable ? <TableIcon width={25} /> : <GridIcon width={25} />}</button>
          <button onClick={toggleZoomed}>{zoomed ? <ZoomOutIcon width={25} /> : <ZoomInIcon width={25} />}</button>
        </div>
        <span>{selectedCategoriesLabel}</span>
        <span>
          Haku:{" "}
          <input
            type="text"
            value={internalSearchValue}
            onChange={(event) => setInternalSearchValue(event.target.value)}
            onKeyDown={fastSubmit}
          />
        </span>
      </div>
      {categoriesVisible && <Categories />}
      {colorsVisible && <Colors />}
    </div>
  );
}

export default Header;
