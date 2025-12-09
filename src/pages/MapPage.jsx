import { useState } from "react";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";
import { useMapTarget } from "../contexts/Mapstate";

// 전국 단위 검색으로 전환할 때 사용할 주요 도시/지역 키워드
const CITY_KEYWORDS = [
  "서울",
  "부산",
  "대구",
  "인천",
  "광주",
  "대전",
  "울산",
  "세종",
  "수원",
  "창원",
  "전주",
  "여수",
  "포항",
  "춘천",
  "제주",
  "제주도",
  "구미",
  "안동",
  "경주",
  "김해",
  "천안",
  "청주",
  "광명",
  "성남",
  "의정부",
  "일산",
  "부천",
  "군산",
];

export default function MapPage() {
  const { mapTarget } = useMapTarget();
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAP_KEY,
    libraries: ["clusterer", "drawing", "services"],
  });

  const handleCategorySearch = (code) => {
    if (!map || !window.kakao) return;
    const kakao = window.kakao;

    // 같은 카테고리를 다시 누르면 맵핀 제거
    if (activeCategory === code) {
      setActiveCategory(null);
      setMarkers([]);
      return;
    }

    const ps = new kakao.maps.services.Places(map);
    ps.categorySearch(
      code,
      (data, status) => {
        if (status !== kakao.maps.services.Status.OK) return;

        const next = data.map((item) => ({
          id: item.id,
          name: item.place_name,
          lat: Number(item.y),
          lng: Number(item.x),
        }));

        setActiveCategory(code);
        setMarkers(next);
      },
      { useMapBounds: true }
    );
  };

  const handleKeywordSearch = () => {
    if (!map || !window.kakao) return;
    const q = searchQuery.trim();
    if (!q) return;

    const kakao = window.kakao;
    const ps = new kakao.maps.services.Places(map);

    // 기본은 지도 중심/영역 기준 검색,
    // 검색어 안에 특정 지역 키워드가 포함되면 전국 단위 검색으로 전환
    const isGlobalSearch = CITY_KEYWORDS.some((name) => q.includes(name));
    const options = isGlobalSearch ? {} : { bounds: map.getBounds() };

    ps.keywordSearch(
      q,
      (data, status) => {
        if (status !== kakao.maps.services.Status.OK || !data.length) return;

        const next = data.map((item) => ({
          id: item.id,
          name: item.place_name,
          lat: Number(item.y),
          lng: Number(item.x),
        }));

        setActiveCategory(null);
        setMarkers(next);

        // 첫 번째 결과 기준으로 중심 이동 (전국 검색일 때 특히 유용)
        const first = next[0];
        if (first) {
          const latlng = new kakao.maps.LatLng(first.lat, first.lng);
          map.setCenter(latlng);
        }
      },
      options
    );
  };

  return (
    <div className="map-page">
      {/* 카테고리 버튼 + 검색 박스 */}
      <div className="map-category-bar">
        <button
          className={`map-cat-btn ${activeCategory === "CE7" ? "active" : ""}`}
          onClick={() => handleCategorySearch("CE7")}
        >
          카페
        </button>
        <button
          className={`map-cat-btn ${activeCategory === "CS2" ? "active" : ""}`}
          onClick={() => handleCategorySearch("CS2")}
        >
          편의점
        </button>
        <button
          className={`map-cat-btn ${activeCategory === "FD6" ? "active" : ""}`}
          onClick={() => handleCategorySearch("FD6")}
        >
          음식점
        </button>

        <div className="map-search-box">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleKeywordSearch()}
            placeholder="장소 검색 예: 스타벅스, 구미 스타벅스"
          />
          <button onClick={handleKeywordSearch}>검색</button>
        </div>
      </div>

      <div className="map-wrapper">
        <Map
          center={{ lat: mapTarget.lat, lng: mapTarget.lng }}
          style={{ width: "100%", height: "100%" }}
          level={3}
          onCreate={setMap}
        >
          {/* 카테고리/검색 결과 마커만 표시 */}
          {markers.map((m) => (
            <MapMarker key={m.id} position={{ lat: m.lat, lng: m.lng }} />
          ))}
        </Map>
      </div>
    </div>
  );
}
