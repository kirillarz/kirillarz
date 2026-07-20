import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { initializeYandexMetrika } from "./analytics/yandexMetrika";
import { App } from "./App";
import "./styles/base.css";
import "./styles/tokens.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element was not found");
}

initializeYandexMetrika();

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
