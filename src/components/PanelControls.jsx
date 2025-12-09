// src/components/PanelControls.jsx (safe visibleIds handling)
function PanelControls({
  panels,
  visibleIds,
  visiblePanels,
  onReset,
  onToggle,
}) {
  const ids = visibleIds ?? visiblePanels ?? [];

  return (
    <div className="panel-controls floating">
      <button type="button" onClick={onReset}>
        전체보기 &lt;&lt;
      </button>
      {panels.map((p) => {
        const open = ids.includes(p.id);
        return (
          <button
            key={p.id}
            type="button"
            className={open ? "panel-toggle open" : "panel-toggle closed"}
            onClick={() => onToggle(p.id)}
          >
            {p.id}번 패널{open ? "" : " (닫힘)"}
          </button>
        );
      })}
    </div>
  );
}

export default PanelControls;
