// src/pages/TravelPage.jsx
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useMapTarget } from "../contexts/MapContext";
import { travelInfo } from "../data/travelInfo";
import travelPlacesWithImages from "../data/travelPlacesWithImages";

// 이름 매칭 헬퍼 (한글 + 영문)
const matchesQuery = (loc, query) => {
  const q = query.trim();
  if (q.length < 2) return true;
  const ko = (loc.local_names?.ko || "").toLowerCase();
  const en = (loc.name || "").toLowerCase();
  const lowerQ = q.toLowerCase();
  return ko.includes(lowerQ) || en.includes(lowerQ);
};

export default function TravelPage() {
  const { setMapTarget } = useMapTarget();
  const location = useLocation(); // HomePage에서 온 state 읽기

  const panelRef = useRef(null);
  const [isCompactMode, setIsCompactMode] = useState(false);

  const [placeImgIndex, setPlaceImgIndex] = useState(0);
  const [openName, setOpenName] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchedPlace, setSearchedPlace] = useState(null);

  // HomePage에서 넘어온 placeId로 초기 선택 카드 열기
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const placeName = params.get("placeName");
    const lat = parseFloat(params.get("lat"));
    const lng = parseFloat(params.get("lng"));
    if (!placeName || Number.isNaN(lat) || Number.isNaN(lng)) return;
    setOpenName(placeName);
    setQuery("");
    setResults([]);
    setPlaceImgIndex(0);
    setMapTarget({ name: placeName, lat, lng });
  }, [location.search, setMapTarget]);

  // 패널 높이 기준으로 “전체보기용 컴팩트 모드” 판단
  useEffect(() => {
    const updateMode = () => {
      if (!panelRef.current) return;
      const h = panelRef.current.offsetHeight;
      const vh = window.innerHeight || 0;
      // TravelPage 높이가 화면의 70%보다 작으면 = 여러 패널이 있는 상태라고 보고 컴팩트 모드
      setIsCompactMode(h < vh * 0.7);
    };

    updateMode();
    window.addEventListener("resize", updateMode);
    return () => window.removeEventListener("resize", updateMode);
  }, [openName]); // 카드 펼침 상태가 바뀔 때도 다시 계산

  // 컴팩트 모드 + 카드 펼침일 때만 “사진 슬라이더 + 마지막 슬라이드에 내용”
  const isCompactCard = isCompactMode && !!openName;
  const hideHeader = isCompactCard;

  // 새로고침 시 한 번만 랜덤 추천 3곳 선택
  const [recommendedPlaces] = useState(() => {
    if (travelPlacesWithImages.length <= 2) return travelPlacesWithImages;
    const copy = [...travelPlacesWithImages];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, 2);
  });

  const recommendedNames = recommendedPlaces.map((p) => p.name);

  const getDisplayName = (result, fallbackQuery = "") => {
    const localKo = result.local_names?.ko;
    let base = (localKo || fallbackQuery || result.name || "").trim();
    if (base.endsWith("시")) base = base.slice(0, -1);
    return base;
  };

  const normalizeName = (name = "") => name.trim().replace(/시$/, "");

  const findBasePlaceByName = (displayName) => {
    const normalized = normalizeName(displayName);
    return (
      travelPlacesWithImages.find(
        (p) => normalizeName(p.name) === normalized
      ) ||
      travelPlacesWithImages.find((p) =>
        normalizeName(p.name).includes(normalized)
      ) ||
      travelPlacesWithImages.find((p) =>
        normalized.includes(normalizeName(p.name))
      ) ||
      null
    );
  };

  const searchPlaces = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
          trimmed
        )}&limit=5&appid=${import.meta.env.VITE_OPENWEATHER_KEY}`
      );

      if (!res.ok) {
        console.error("OpenWeather 지오코딩 오류:", res.status);
        return;
      }

      const raw = await res.json();
      const data = Array.isArray(raw) ? raw : [];

      // 대한민국 + 이름 매칭 되는 결과만 사용
      const filtered = data.filter(
        (item) => item.country === "KR" && matchesQuery(item, trimmed)
      );

      const dedup = [];
      const seen = new Set();

      for (const item of filtered) {
        const name = getDisplayName(item, trimmed);
        if (!name) continue;
        if (seen.has(name)) continue;
        seen.add(name);
        dedup.push({ ...item, __displayName: name });
      }

      setResults(dedup);

      if (dedup.length > 0) {
        const first = dedup[0];
        const displayName = first.__displayName;
        const basePlace = findBasePlaceByName(displayName);

        if (basePlace) {
          setMapTarget({
            name: basePlace.name,
            lat: basePlace.lat,
            lng: basePlace.lng,
          });
          setSearchedPlace(null);
          setOpenName(basePlace.name);
        } else {
          setMapTarget({
            name: displayName,
            lat: first.lat,
            lng: first.lon,
          });
          setSearchedPlace({
            name: displayName,
            country: first.country,
            lat: first.lat,
            lng: first.lon,
          });
          setOpenName(displayName);
        }
      } else {
        const base = findBasePlaceByName(trimmed);
        if (base) {
          setMapTarget({
            name: base.name,
            lat: base.lat,
            lng: base.lng,
          });
          setSearchedPlace(null);
          setOpenName(base.name);
        }
      }
    } catch (err) {
      console.error("지오코딩 요청 실패:", err);
    }
  };

  const togglePlace = (place) => {
    const nextName = openName === place.name ? null : place.name;
    setOpenName(nextName);
    setQuery("");
    setResults([]);
    setPlaceImgIndex(0);

    if (nextName && place.lat && place.lng) {
      setMapTarget({ name: place.name, lat: place.lat, lng: place.lng });
    }
  };

  const handleResultClick = (r) => {
    const displayName = r.__displayName || getDisplayName(r, query);
    const basePlace = findBasePlaceByName(displayName);

    if (basePlace) {
      setMapTarget({
        name: basePlace.name,
        lat: basePlace.lat,
        lng: basePlace.lng,
      });
      setSearchedPlace(null);
      setOpenName(basePlace.name);
    } else {
      setMapTarget({ name: displayName, lat: r.lat, lng: r.lon });
      setSearchedPlace({
        name: displayName,
        country: r.country,
        lat: r.lat,
        lng: r.lon,
      });
      setOpenName(displayName);
    }

    setResults([]);
    setQuery("");
  };

  const handleQueryChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === "") {
      setOpenName(null);
      setSearchedPlace(null);
      setResults([]);
      setPlaceImgIndex(0);
    }
  };

  // 추천 + 정렬 로직
  const defaultPlaces = recommendedPlaces;

  const displayedPlaces = (() => {
    if (!openName || recommendedNames.includes(openName)) return defaultPlaces;
    const extra = travelPlacesWithImages.find((p) => p.name === openName);
    if (!extra) return defaultPlaces;
    const exists = defaultPlaces.some((p) => p.name === extra.name);
    return exists ? defaultPlaces : [...defaultPlaces, extra];
  })();

  const sortedPlaces = (() => {
    const copy = [...displayedPlaces];
    if (!openName) return copy;
    const idx = copy.findIndex((p) => p.name === openName);
    if (idx <= 0) return copy;
    const [selected] = copy.splice(idx, 1);
    copy.unshift(selected);
    return copy;
  })();

  return (
    <div className="travel-page" ref={panelRef}>
      <div className="travel-panel">
        {!hideHeader && (
          <>
            <h2 className="panelTitle">여행지 목록 (추천 지역)</h2>

            <div className="searchBar">
              <input
                className="searchInput"
                value={query}
                onChange={handleQueryChange}
                placeholder="여행지 검색 예: 밀양"
                onKeyDown={(e) => e.key === "Enter" && searchPlaces()}
              />
              <button className="searchButton" onClick={searchPlaces}>
                검색
              </button>
            </div>

            {results.length > 1 && !searchedPlace && (
              <div className="search-results">
                {results.map((r, idx) => (
                  <div
                    key={`${r.name}-${r.lat}-${r.lon}-${idx}`}
                    className="search-result-item"
                    onClick={() => handleResultClick(r)}
                  >
                    <strong>
                      {r.__displayName || getDisplayName(r, query)}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="travel-list placeList">
          {searchedPlace && (
            <div
              className={`travel-card placeCard ${
                openName === searchedPlace.name ? "active" : ""
              }`}
              onClick={() => {
                const next =
                  openName === searchedPlace.name ? null : searchedPlace.name;
                setOpenName(next);
                setQuery("");
                setResults([]);

                if (next) {
                  setMapTarget({
                    name: searchedPlace.name,
                    lat: searchedPlace.lat,
                    lng: searchedPlace.lng,
                  });
                }
              }}
            >
              <h3>{searchedPlace.name}</h3>
              {openName === searchedPlace.name &&
                (() => {
                  const info = travelInfo[searchedPlace.name];
                  return info ? (
                    <>
                      <p>
                        ※ 이 지역은 아직 여행 정보가 없어 이미지 자료가
                        없습니다. ※
                      </p>
                      <br />
                      <p>{info.desc}</p>
                      {info.bestSeason && <p>추천 시즌: {info.bestSeason}</p>}
                      {info.tags && <p>태그: {info.tags.join(", ")}</p>}
                      {info.tip && <p>TIP: {info.tip}</p>}
                    </>
                  ) : (
                    <p>이 지역은 아직 여행 정보가 없어요.</p>
                  );
                })()}
            </div>
          )}

          {sortedPlaces.map((p) => (
            <div
              key={p.name}
              className={`travel-card placeCard ${
                openName === p.name ? "active" : ""
              }`}
              onClick={() => togglePlace(p)}
            >
              <h3>{p.name}</h3>

              {openName === p.name && (
                <div className="travel-detail">
                  {/* 1) 컴팩트 카드 모드(주로 전체보기 그리드) → 사진/사진/…/마지막 내용 슬라이드 */}
                  {isCompactCard ? (
                    p.imageUrls && p.imageUrls.length > 0 ? (
                      (() => {
                        const imageCount = p.imageUrls.length;
                        const totalSlides = imageCount + 1; // 마지막 한 장은 내용
                        const safeIndex =
                          ((placeImgIndex % totalSlides) + totalSlides) %
                          totalSlides;
                        const isTextSlide = safeIndex === imageCount;

                        return (
                          <div className="travel-img-wrapper">
                            <button
                              className="travel-arrow left"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPlaceImgIndex(
                                  (i) => (i - 1 + totalSlides) % totalSlides
                                );
                              }}
                            >
                              &lt;
                            </button>

                            {!isTextSlide ? (
                              <img
                                className="travel-img"
                                src={p.imageUrls[safeIndex]}
                                alt={p.name}
                              />
                            ) : (
                              <div className="travel-slide-detail">
                                <p>{p.desc}</p>
                                {p.region && <p>지역: {p.region}</p>}
                                {p.bestSeason && (
                                  <p>추천 시즌: {p.bestSeason}</p>
                                )}
                                {p.tags && <p>태그: {p.tags.join(", ")}</p>}
                                {p.highlights && (
                                  <p>하이라이트: {p.highlights.join(", ")}</p>
                                )}
                                {p.tip && <p>TIP: {p.tip}</p>}
                              </div>
                            )}

                            <button
                              className="travel-arrow right"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPlaceImgIndex((i) => (i + 1) % totalSlides);
                              }}
                            >
                              &gt;
                            </button>
                          </div>
                        );
                      })()
                    ) : (
                      <p></p>
                    )
                  ) : (
                    /* 2) 일반 모드(1번 패널 단독 등) → 예전처럼 위 사진 / 아래 내용 */
                    <>
                      {p.imageUrls && p.imageUrls.length > 0 ? (
                        <div className="travel-img-wrapper">
                          <button
                            className="travel-arrow left"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPlaceImgIndex(
                                (i) =>
                                  (i - 1 + p.imageUrls.length) %
                                  p.imageUrls.length
                              );
                            }}
                          >
                            &lt;
                          </button>

                          <img
                            className="travel-img"
                            src={p.imageUrls[placeImgIndex]}
                            alt={p.name}
                          />

                          <button
                            className="travel-arrow right"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPlaceImgIndex(
                                (i) => (i + 1) % p.imageUrls.length
                              );
                            }}
                          >
                            &gt;
                          </button>
                        </div>
                      ) : (
                        <p></p>
                      )}

                      <p>{p.desc}</p>
                      {p.region && <p>지역: {p.region}</p>}
                      {p.bestSeason && <p>추천 시즌: {p.bestSeason}</p>}
                      {p.tags && <p>태그: {p.tags.join(", ")}</p>}
                      {p.highlights && (
                        <p>하이라이트: {p.highlights.join(", ")}</p>
                      )}
                      {p.tip && <p>TIP: {p.tip}</p>}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
