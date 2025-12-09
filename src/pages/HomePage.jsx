// src/pages/HomePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import travelPlacesWithImages from "../data/travelPlacesWithImages";

/**
 * 메인 홈 화면
 * - 상단 대형 카드 + 배경 이미지
 * - Travel 제목을 클릭하면 4분할 메인(/app)으로 이동
 * - 카드 하나를 클릭하면 해당 지역 정보(placeName, lat, lng)를 쿼리스트링으로 넘김
 */
function HomePage() {
  const navigate = useNavigate();

  // 상단 제목 클릭 → 단순히 4분할 메인 화면 열기
  const handleTitleClick = () => {
    navigate("/app");
  };

  // 카드 클릭 → 선택한 여행지 정보를 쿼리스트링으로 /app에 전달
  const handleCardClick = (place) => {
    const params = new URLSearchParams({
      placeName: place.name || "",
      lat: String(place.lat ?? ""),
      lng: String(place.lng ?? ""),
    });
    navigate(`/app?${params.toString()}`);
  };

  return (
    <>
      <div className="home-page-root">
        {/* 제목 클릭 → 기본 4분할 페이지로 이동 */}
        <h1 className="home-title">
          <span className="home-title-link" onClick={handleTitleClick}>
            🛫 Travel 🗺
          </span>
        </h1>

        <p className="home-subtitle">
          여행이란, 일상에서 잠시 벗어나 나를 쉬게 하는 시간
        </p>

        {/* 카드 클릭 → 선택된 여행지 정보를 들고 /app 으로 이동 */}
        <div className="home-travel-card-grid">
          {travelPlacesWithImages.slice(0, 6).map((place) => (
            <div
              key={place.id || place.name}
              className="home-travel-card"
              onClick={() => handleCardClick(place)}
            >
              <img
                className="home-travel-card-image"
                src={place.image || place.imageUrls?.[0]}
                alt={place.name}
              />
              <h3 className="home-travel-card-name">{place.name}</h3>
              {place.region && (
                <p className="home-travel-card-region">{place.region}</p>
              )}
              {place.desc && (
                <p className="home-travel-card-desc">{place.desc}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 홈과 4분할 사이의 푸터 느낌 문구 */}
      <div className="home-between-text">
        <p>© 2025 Travel Project · 국내 여행 추천 서비스</p>
        <p>All journeys begin with a single decision.</p>
      </div>
    </>
  );
}

export default HomePage;
