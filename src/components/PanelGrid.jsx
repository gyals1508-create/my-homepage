// src/components/PanelGrid.jsx - 패널 객체 매핑 + key 경고 해결 버전
import Panel from "./Panel.jsx";

function PanelGrid({ layout, drag }) {
  const {
    panels,
    visiblePanels,
    cols,
    rows,
    activeId,
    handleChangeUrl,
    handleActivate,
    handleClose,
  } = layout;

  const count = visiblePanels.length;

  let gridTemplateColumns = "1fr";
  let gridTemplateRows = "1fr";
  const panelStyles = [];

  if (count === 1) {
    panelStyles.push({ gridColumn: "1 / 2", gridRow: "1 / 2" });
  } else if (count === 2) {
    gridTemplateColumns = `${cols[0] * 100}% ${cols[1] * 100}%`;
    gridTemplateRows = "1fr";
    panelStyles.push({ gridColumn: "1 / 2", gridRow: "1 / 2" });
    panelStyles.push({ gridColumn: "2 / 3", gridRow: "1 / 2" });
  } else if (count === 3) {
    gridTemplateColumns = `${cols[0] * 100}% ${cols[1] * 100}%`;
    gridTemplateRows = `${rows[0] * 100}% ${rows[1] * 100}%`;
    panelStyles.push({ gridColumn: "1 / 2", gridRow: "1 / 2" });
    panelStyles.push({ gridColumn: "2 / 3", gridRow: "1 / 2" });
    panelStyles.push({ gridColumn: "1 / 3", gridRow: "2 / 3" });
  } else if (count >= 4) {
    gridTemplateColumns = `${cols[0] * 100}% ${cols[1] * 100}%`;
    gridTemplateRows = `${rows[0] * 100}% ${rows[1] * 100}%`;
    panelStyles.push({ gridColumn: "1 / 2", gridRow: "1 / 2" });
    panelStyles.push({ gridColumn: "2 / 3", gridRow: "1 / 2" });
    panelStyles.push({ gridColumn: "1 / 2", gridRow: "2 / 3" });
    panelStyles.push({ gridColumn: "2 / 3", gridRow: "2 / 3" });
  }

  const showVertical = count >= 2;
  const showHorizontal = count >= 3;

  return (
    <div className="panel-grid-wrapper">
      <div
        className="panel-grid"
        style={{ gridTemplateColumns, gridTemplateRows }}
      >
        {visiblePanels.map((id, index) => {
          const panel = panels.find((p) => p.id === id);
          if (!panel) return null;

          return (
            <Panel
              key={panel.id}
              panel={panel}
              style={panelStyles[index]}
              isActive={panel.id === activeId}
              onChangeUrl={handleChangeUrl}
              onActivate={handleActivate}
              onClose={handleClose}
            />
          );
        })}
      </div>

      {showVertical && (
        <div
          className="splitter-vertical"
          style={{ left: `${cols[0] * 100}%` }}
          onMouseDown={drag.startDrag("vertical")}
        >
          <div className="splitter-handle-vertical" />
        </div>
      )}

      {showHorizontal && (
        <div
          className="splitter-horizontal"
          style={{ top: `${rows[0] * 100}%` }}
          onMouseDown={drag.startDrag("horizontal")}
        >
          <div className="splitter-handle-horizontal" />
        </div>
      )}

      {showVertical && showHorizontal && (
        <div
          className="splitter-center"
          style={{
            left: `${cols[0] * 100}%`,
            top: `${rows[0] * 100}%`,
          }}
          onMouseDown={drag.startDrag("both")}
        >
          <div className="splitter-center-dot" />
        </div>
      )}
    </div>
  );
}

export default PanelGrid;
