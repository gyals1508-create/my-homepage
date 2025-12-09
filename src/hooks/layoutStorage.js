// src/hooks/layoutStorage.js (panelType + Travel 기본값 반영 버전)
export const KEY = "myhome_layout_v1";

export const DEFAULT_LAYOUT = {
  panels: [
    { id: 1, url: "", panelType: "travel" }, // 1번 = 여행
    { id: 2, url: "", panelType: "calendar" }, // 2번 = 캘린더
    { id: 3, url: "", panelType: "weather" }, // 3번 = 날씨
    { id: 4, url: "", panelType: "map" }, // 4번 = 지도(아직 페이지 미완)
  ],
  visiblePanels: [1, 2, 3, 4],
  cols: [0.5, 0.5],
  rows: [0.5, 0.5],
  activePanelId: 1,
};

export const loadLayoutFromStorage = () => {
  if (typeof window === "undefined") return DEFAULT_LAYOUT;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_LAYOUT;
    const data = JSON.parse(raw);

    return {
      panels: (data.panels || DEFAULT_LAYOUT.panels).map((p, idx) => ({
        id: p.id ?? idx + 1,
        url: p.url ?? "",
        panelType: p.panelType ?? (idx === 0 ? "travel" : null), // 예전 저장본에도 기본값 적용
      })),
      visiblePanels:
        data.visiblePanels || data.visibleIds || DEFAULT_LAYOUT.visiblePanels,
      cols:
        data.cols && data.cols.length === 2 ? data.cols : DEFAULT_LAYOUT.cols,
      rows:
        data.rows && data.rows.length === 2 ? data.rows : DEFAULT_LAYOUT.rows,
      activePanelId:
        data.activePanelId || data.activeId || DEFAULT_LAYOUT.activePanelId,
    };
  } catch {
    return DEFAULT_LAYOUT;
  }
};

export const saveLayoutToStorage = (layout) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(layout));
};
