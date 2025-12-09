// 전체 화면을 어떤 구성으로 보여줄지 결정하는 가장 중심 컴포넌트
// 페이지 라우팅
// 전체 레이아웃 뼈대
// 상단/패널/페이지 배치
// → 말 그대로 앱의 메인 화면 설계도

import "./index.css";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PanelApp from "./panels/PanelContainer";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/app" element={<PanelApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
