// 여러 패널을 한 화면에 배치하고 전체 구조를 잡아주는 컴포넌트

import PanelGrid from "./PanelGrid";
import PanelControls from "./PanelControls";
import { usePanelLayoutState } from "./hooks/useLayout";
import { usePanelDrag } from "./hooks/useDrag";
import { useLocation } from "react-router-dom";
import { SelectedPlaceContext } from "../contexts/PlaceState";
import { Link } from "react-router-dom";

function PanelApp() {
  const location = useLocation();
  const selectedPlaceId = location.state?.placeId || null;
  console.log("선택된 여행지:", selectedPlaceId, location.state);

  const layout = usePanelLayoutState();
  const drag = usePanelDrag({
    cols: layout.cols,
    rows: layout.rows,
    setCols: layout.setCols,
    setRows: layout.setRows,
    panels: layout.panels,
    visiblePanels: layout.visiblePanels,
    setVisibleIds: layout.setVisibleIds,
  });

  return (
    <SelectedPlaceContext.Provider value={selectedPlaceId}>
      <div className="app-root">
        <div className="top-logo">
          <Link to="/" className="travel-logo-link">
            Travel🛫
          </Link>
        </div>
        <div className="background-title">T r a v e l</div>
        <PanelGrid layout={layout} drag={drag} />
        <PanelControls
          panels={layout.panels}
          visibleIds={layout.visibleIds}
          onReset={layout.handleResetAll}
          onToggle={(id) => {
            layout.setActiveId(id);
            layout.setVisibleIds([id]);
          }}
        />
      </div>
    </SelectedPlaceContext.Provider>
  );
}

export default PanelApp;
