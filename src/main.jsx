// React 앱을 실제로 웹 브라우저에 연결하는 시작점

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { PanelLayoutProvider } from "./panels/PanelContext";
import { MapProvider } from "./contexts/Mapstate"; // 지도 화면 제어용 컨텍스트

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PanelLayoutProvider>
      <MapProvider>
        <App />
      </MapProvider>
    </PanelLayoutProvider>
  </React.StrictMode>
);
