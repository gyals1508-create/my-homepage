// src/panels/panelLayoutContext.jsx
import { createContext, useContext } from "react";
import { usePanelLayoutState } from "../hooks/usePanelLayoutState";

const PanelLayoutContext = createContext(null);

export function PanelLayoutProvider({ children }) {
  const layout = usePanelLayoutState();
  const { activePanelId } = layout;

  const panelMode = activePanelId == null ? "all" : "single";
  // activePanelId === null  → 전체보기(4패널 그리드)
  // activePanelId !== null  → 1번/2번 패널 전체화면

  return (
    <PanelLayoutContext.Provider value={{ ...layout, panelMode }}>
      {children}
    </PanelLayoutContext.Provider>
  );
}

export function usePanelLayout() {
  const ctx = useContext(PanelLayoutContext);
  if (!ctx)
    throw new Error("usePanelLayout must be used inside PanelLayoutProvider");
  return ctx;
}
