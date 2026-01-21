import React, { useState } from "react";

import Header from "./components/Header";
import Parts from "./components/Parts";
import useLocalStorage from "./hooks/useLocalStorage";

import "./App.css";

function App() {
  const [showTable, setShowTable] = useLocalStorage("showTable", false);
  const [search, setSearch] = useState("");
  const [zoomed, setZoomed] = useLocalStorage("zoomed", false);

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
