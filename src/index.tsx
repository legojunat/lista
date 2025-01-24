import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { ApiProvider } from "./hooks/useApi";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <ApiProvider>
      <App />
    </ApiProvider>
  );
} else {
  console.error('Cannot find <div id="root"></div> element for React');
}
