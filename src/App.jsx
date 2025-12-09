// src/App.jsx
import "./index.css";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PanelApp from "./PanelApp";

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
