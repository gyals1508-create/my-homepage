// 하나의 패널이 화면에서 어떻게 생기고 동작하는지 정의한 컴포넌트

import TravelPage from "../pages/TravelPage";
import CalendarPage from "../pages/CalendarPage";
import WeatherPage from "../pages/WeatherPage";
import MapPage from "../pages/MapPage";

const Panel = ({ panel, style, isActive, onActivate, onClose }) => {
  const handleActivate = () => onActivate(panel.id);

  const handleCloseClick = (e) => {
    e.stopPropagation();
    onClose(panel.id);
  };

  const renderContent = () => {
    if (panel.panelType === "map") return <MapPage />;
    if (panel.panelType === "weather") return <WeatherPage />;
    if (panel.panelType === "calendar") return <CalendarPage />;
    if (panel.panelType === "travel") return <TravelPage />;

    return (
      <div className="panel-placeholder">패널 콘텐츠가 설정되지 않았어</div>
    );
  };

  const panelTypeClass = panel.panelType || "default";

  return (
    <div
      className={`panel ${isActive ? "panel-active" : ""}`}
      style={style}
      onClick={handleActivate}
    >
      <div className="panel-inner">
        <div className="panel-header">
          <span className="panel-title">{panel.id}번 패널</span>

          {/* 닫기 버튼만 유지 */}
          <button
            className="close-button"
            type="button"
            onClick={handleCloseClick}
          >
            닫기
          </button>
        </div>

        <div className={`panel-body panel-body--${panelTypeClass}`}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Panel;
