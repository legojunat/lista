import React, { useCallback, useEffect, useMemo, useState } from "react";

import useApi from "../hooks/useApi";

import Categories from "./Categories";
import Colors from "./Colors";

const SEARCH_CHANGE_THRESHOLD = 1000; // milliseconds

import "./Header.css";

interface Props {
  showTable: boolean;
  setShowTable: React.Dispatch<React.SetStateAction<boolean>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}

function Header(props: Props) {
  const { showTable, setShowTable, setSearch } = props;
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

  const toggleShowTableButtonLabel = useMemo(() => (showTable ? "Näytä kuvina" : "Näytä taulukkona"), [showTable]);

  return (
    <div className="Header">
      <div className="Header-toggleContainer">
        <div className="Header-buttons">
          <button onClick={toggleShowTable}>{toggleShowTableButtonLabel}</button>
          <button onClick={toggleCategoriesVisible}>{toggleCategoriesButtonLabel}</button>
          <button onClick={toggleColorsVisible} disabled={selectedCategoryIds.size === 0}>
            {toggleColorsButtonLabel}
          </button>
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
