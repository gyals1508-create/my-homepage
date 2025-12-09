// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { PanelLayoutProvider } from "./panels/panelLayoutContext";
import { MapProvider } from "./contexts/MapContext"; // 원래 쓰던 이름 그대로

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PanelLayoutProvider>
      <MapProvider>
        <App />
      </MapProvider>
    </PanelLayoutProvider>
  </React.StrictMode>
);
