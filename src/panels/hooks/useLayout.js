// 전체 패널 레이아웃 관리

import { useEffect, useState } from "react";
import {
  loadLayoutFromStorage,
  saveLayoutToStorage,
  DEFAULT_LAYOUT,
} from "./layoutStore";

export const usePanelLayoutState = () => {
  // 기본 레이아웃 기준 초기값
  const [panels, setPanels] = useState(DEFAULT_LAYOUT.panels);
  const [visiblePanels, setVisiblePanels] = useState(
    DEFAULT_LAYOUT.visiblePanels
  );
  const [activePanelId, setActivePanelId] = useState(
    DEFAULT_LAYOUT.activePanelId
  );
  const [cols, setCols] = useState(DEFAULT_LAYOUT.cols);
  const [rows, setRows] = useState(DEFAULT_LAYOUT.rows);

  // 초기 마운트 시 localStorage 에서 레이아웃 불러오기
  useEffect(() => {
    const loaded = loadLayoutFromStorage();
    if (!loaded) return;

    setPanels(loaded.panels ?? DEFAULT_LAYOUT.panels);
    setVisiblePanels(loaded.visiblePanels ?? DEFAULT_LAYOUT.visiblePanels);
    setActivePanelId(
      loaded.activePanelId ?? loaded.activeId ?? DEFAULT_LAYOUT.activePanelId
    );
    setCols(loaded.cols ?? DEFAULT_LAYOUT.cols);
    setRows(loaded.rows ?? DEFAULT_LAYOUT.rows);
  }, []);

  // 레이아웃 변경 시 저장
  useEffect(() => {
    saveLayoutToStorage({
      panels,
      visiblePanels,
      activePanelId,
      cols,
      rows,
    });
  }, [panels, visiblePanels, activePanelId, cols, rows]);

  // === 패널 개별 속성 변경 ===
  const changeUrl = (id, url) => {
    setPanels((prev) => prev.map((p) => (p.id === id ? { ...p, url } : p)));
  };

  const changePanelType = (id, panelType) => {
    setPanels((prev) =>
      prev.map((p) => (p.id === id ? { ...p, panelType } : p))
    );
  };

  // === 패널 표시/활성 상태 ===
  const togglePanelVisibility = (id) => {
    setVisiblePanels((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );

    // 닫힌 패널이 현재 활성 패널이면 활성 패널을 기본값으로 되돌림
    setActivePanelId((prevActive) =>
      prevActive === id ? DEFAULT_LAYOUT.activePanelId : prevActive
    );
  };

  const setActivePanel = (id) => {
    setActivePanelId(id);
  };

  // === 그리드 분할 비율 ===
  const updateCols = (nextCols) => setCols(nextCols);
  const updateRows = (nextRows) => setRows(nextRows);

  // === App / PanelGrid / PanelControls 에서 직접 쓰는 래퍼들 ===
  const handleActivate = (id) => setActivePanelId(id);

  const handleClose = (id) => {
    togglePanelVisibility(id);
  };

  const handleResetAll = () => {
    setPanels(DEFAULT_LAYOUT.panels);
    setVisiblePanels(DEFAULT_LAYOUT.visiblePanels);
    setActivePanelId(DEFAULT_LAYOUT.activePanelId);
    setCols(DEFAULT_LAYOUT.cols);
    setRows(DEFAULT_LAYOUT.rows);
  };

  const handleToggleClick = (id) => {
    togglePanelVisibility(id);
  };

  const setVisibleIds = (ids) => {
    setVisiblePanels(ids);
  };

  const setActiveId = (id) => {
    setActivePanelId(id);
  };

  return {
    // 기본 상태
    panels,
    visiblePanels,
    visibleIds: visiblePanels,
    activeId: activePanelId,
    cols,
    rows,

    // PanelGrid 에서 사용하는 변경 함수
    handleChangeUrl: changeUrl,
    handleChangePanelType: changePanelType,
    handleActivate,
    handleClose,

    // PanelControls / App 에서 사용하는 제어 함수
    handleResetAll,
    handleToggleClick,

    // 드래그 훅에서 사용하는 setter
    setCols,
    setRows,
    updateCols,
    updateRows,

    // visibleIds / activeId 직접 세팅용
    setVisibleIds,
    setActiveId,
  };
};
