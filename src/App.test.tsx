import React, { act } from "react";
import ReactDOM from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";

import App from "./App";

vi.mock("axios", () => ({
  default: {
    get: () => Promise.resolve({ data: { hello: "World" } })
  }
}));

describe("App", () => {
  let container: HTMLDivElement;
  let root: ReactDOM.Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = ReactDOM.createRoot(container);
  });

  afterEach(() => {
    if (container !== null) {
      document.body.removeChild(container);
    }
  });

  it("the title is visible", () => {
    act(() => {
      root.render(<App />);
    });
    expect(screen.getByText(/Lista/)).toBeInTheDocument();
  });
});
