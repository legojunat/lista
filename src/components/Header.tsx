import React, { useCallback, useEffect, useMemo, useState } from "react";

import useApi from "../hooks/useApi";

import Categories from "./Categories";

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

  const toggleCategoriesButtonLabel = useMemo(
    () => (categoriesVisible ? "Piilota kategoriat" : "Näytä kategoriat"),
    [categoriesVisible]
  );

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
        <button onClick={toggleShowTable}>{toggleShowTableButtonLabel}</button>
        <button onClick={toggleCategoriesVisible}>{toggleCategoriesButtonLabel}</button>
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
    </div>
  );
}

export default Header;
