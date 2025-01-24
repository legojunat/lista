import React, { useCallback, useMemo, useState } from "react";

import useApi from "../hooks/useApi";

import Categories from "./Categories";

import "./Header.css";

interface Props {
  showTable: boolean;
  setShowTable: React.Dispatch<React.SetStateAction<boolean>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}

function Header(props: Props) {
  const { showTable, setShowTable, search, setSearch } = props;
  const [categoriesVisible, setCategoriesVisible] = useState(false);
  const { selectedCategoryIds } = useApi();

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
          Haku: <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} />
        </span>
      </div>
      {categoriesVisible && <Categories />}
    </div>
  );
}

export default Header;
