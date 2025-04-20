import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import AppProviders from "./AppProviders";
// Import i18n instance
import "./i18n";

createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <App />
  </AppProviders>
);
