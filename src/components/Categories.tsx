import React from "react";
import classNames from "classnames";

import "./Categories.css";
import useApi from "../hooks/useApi";

function Categories() {
  const { categories, selectedCategoryIds, toggleSelectedCategoryId, toggleSelectAllCategories } = useApi();

  return (
    <div className="Categories">
      <button onClick={toggleSelectAllCategories}>Valitse kaikki</button>
      {categories.map(({ categoryId, categoryName }) => (
        <button
          key={categoryId}
          onClick={() => toggleSelectedCategoryId(categoryId)}
          className={classNames("Categories-button", {
            selected: selectedCategoryIds.has(categoryId)
          })}
        >
          {categoryName}
        </button>
      ))}
    </div>
  );
}

export default Categories;
