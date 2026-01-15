import React, { useEffect, useState } from "react";

import Header from "./components/Header";
import Parts from "./components/Parts";

import "./App.css";

const SHOW_TABLE_KEY = "showTable";
const INITIAL_SHOW_TABLE = window.localStorage.getItem(SHOW_TABLE_KEY) === "true";

function App() {
  const [showTable, setShowTable] = useState(INITIAL_SHOW_TABLE);
  const [search, setSearch] = useState("");
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(SHOW_TABLE_KEY, showTable ? "true" : "false");
  }, [showTable]);

  return (
    <div className="App">
      <h1>Lista</h1>
      <Header
        showTable={showTable}
        setShowTable={setShowTable}
        search={search}
        setSearch={setSearch}
        zoomed={zoomed}
        setZoomed={setZoomed}
      />
      <Parts showTable={showTable} search={search} zoomed={zoomed} />
    </div>
  );
}

export default App;
