import { useState, useEffect } from "react";
import axios from "axios";
import { useMapTarget } from "../contexts/Mapstate";

// 한국 주요 도시 리스트 (자동완성용)
const CITY_LIST = [
  { ko: "서울", en: "Seoul" },
  { ko: "부산", en: "Busan" },
  { ko: "대구", en: "Daegu" },
  { ko: "인천", en: "Incheon" },
  { ko: "광주", en: "Gwangju" },
  { ko: "대전", en: "Daejeon" },
  { ko: "울산", en: "Ulsan" },
  { ko: "수원", en: "Suwon" },
  { ko: "춘천", en: "Chuncheon" },
  { ko: "제주", en: "Jeju" },
];

// 이름 매칭 헬퍼
const matchesQuery = (loc, query) => {
  const q = query.trim();
  if (q.length < 2) return true;
  const ko = (loc.local_names?.ko || "").toLowerCase();
  const en = (loc.name || "").toLowerCase();
  const lowerQ = q.toLowerCase();
  return ko.includes(lowerQ) || en.includes(lowerQ);
};

// Geocoding
const findLocation = async (query, apiKey) => {
  const url =
    "https://api.openweathermap.org/geo/1.0/direct" +
    `?q=${encodeURIComponent(query)}` +
    "&limit=5" +
    `&appid=${apiKey}`;

  const res = await axios.get(url);
  const list = res.data || [];

  const kr = list.filter(
    (loc) => loc.country === "KR" && matchesQuery(loc, query)
  );

  return kr.length > 0 ? kr[0] : null;
};

export default function WeatherPage() {
  const [city, setCity] = useState("서울");
  const [weather, setWeather] = useState(null);
  const [weekly, setWeekly] = useState([]); // 🔥 주간 날씨
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [locationName, setLocationName] = useState("");
  const { mapTarget } = useMapTarget();

  const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;

  // 오늘 날씨 API
  const fetchWeatherByCoords = async (lat, lon, displayName) => {
    if (!API_KEY) return;

    setLoading(true);
    setError(null);

    try {
      const url =
        "https://api.openweathermap.org/data/2.5/weather" +
        `?lat=${lat}&lon=${lon}` +
        "&units=metric&lang=kr" +
        `&appid=${API_KEY}`;

      const res = await axios.get(url);
      setWeather(res.data);
      setLocationName(displayName || res.data.name || "");

      // 🔥 주간 날씨도 같이 요청
      fetchWeekly(lat, lon);
    } catch (e) {
      console.error(e);
      setError("대한민국에서 해당 위치를 찾지 못했어.");
      setWeather(null);
      setWeekly([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 주간 날씨 API (오늘 제외 6일)
  const fetchWeekly = async (lat, lon) => {
    try {
      const url =
        `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}` +
        `&exclude=current,minutely,hourly,alerts&units=metric&lang=kr&appid=${API_KEY}`;
      const res = await axios.get(url);
      setWeekly(res.data.daily.slice(1, 7)); // 오늘 제외 6일
    } catch (e) {
      console.error(e);
      setWeekly([]);
    }
  };

  // 입력 검색 시
  const fetchWeather = async (targetCity) => {
    if (!API_KEY) return alert("API KEY 없음");

    let q = (targetCity ?? city).trim();
    if (!q) return alert("도시 이름을 입력해줘!");

    setLoading(true);
    setError(null);

    try {
      const loc = await findLocation(q, API_KEY);
      if (!loc) throw new Error("not found");

      const displayKo = loc.local_names?.ko || loc.name;
      setLocationName(displayKo);

      const url =
        "https://api.openweathermap.org/data/2.5/weather" +
        `?lat=${loc.lat}&lon=${loc.lon}` +
        "&units=metric&lang=kr" +
        `&appid=${API_KEY}`;

      const res = await axios.get(url);
      setWeather(res.data);

      // 🔥 주간 날씨 호출
      fetchWeekly(loc.lat, loc.lon);
    } catch (e) {
      console.error(e);
      setError("대한민국에서 해당 위치를 찾지 못했어.");
      setWeather(null);
      setWeekly([]);
    } finally {
      setLoading(false);
    }
  };

  // 지도 패널에서 위치 변경 시 자동 갱신
  useEffect(() => {
    if (!mapTarget || mapTarget.lat == null || mapTarget.lng == null) return;
    const name = mapTarget.name || "";
    setCity(name); // 검색창 값
    setLocationName(name); // 카드에 표시될 도시명
    fetchWeatherByCoords(mapTarget.lat, mapTarget.lng, name);
  }, [mapTarget]);

  const handleChange = (e) => {
    const value = e.target.value;
    setCity(value);

    const trimmed = value.trim();
    if (!trimmed) {
      setSuggestions([]);
      return;
    }

    const lower = trimmed.toLowerCase();
    const next = CITY_LIST.filter(
      (c) => c.ko.startsWith(trimmed) || c.en.toLowerCase().startsWith(lower)
    );

    setSuggestions(next);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setSuggestions([]);
      fetchWeather();
    }
  };

  const handleSelectSuggestion = (item) => {
    setCity(item.ko);
    setSuggestions([]);
    fetchWeather(item.ko);
  };

  const displayCity = city.trim() || locationName;
  const wDesc = weather?.weather?.[0]?.description ?? "";
  const temp = weather?.main?.temp;
  const feels = weather?.main?.feels_like;
  const iconCode = weather?.weather?.[0]?.icon;

  return (
    <div className="weather-page">
      <h2>날씨</h2>

      {/* 입력 영역 */}
      <div className="weather-input-row">
        <div className="weather-input-wrapper">
          <input
            value={city}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="대한민국 어디든 입력 (예: 서울역, 제주공항)"
          />
          {suggestions.length > 0 && (
            <ul className="weather-suggestions">
              {suggestions.map((item) => (
                <li key={item.en} onClick={() => handleSelectSuggestion(item)}>
                  {item.ko} <span className="en">({item.en})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button onClick={() => fetchWeather()}>검색</button>
      </div>

      {/* 결과 영역 */}
      <div className="weather-result">
        {loading && <div className="weather-status">불러오는 중...</div>}
        {error && <div className="weather-status error">{error}</div>}

        {!loading && !error && weather && (
          <div className="weather-card-app">
            {/* 오늘(큰 카드) */}
            <div className="weather-top">
              <div>
                <div className="weather-city">{displayCity}</div>
                <div className="weather-main">{wDesc}</div>
              </div>

              {iconCode && (
                <img
                  className="weather-icon"
                  src={`https://openweathermap.org/img/wn/${iconCode}@2x.png`}
                  alt="weather icon"
                />
              )}
            </div>

            <div className="weather-temps">
              {typeof temp === "number" && (
                <span className="temp-big">{Math.round(temp)}°C</span>
              )}
              {typeof feels === "number" && (
                <span className="temp-feel">체감 {Math.round(feels)}°C</span>
              )}
            </div>

            {/* 주간 6일 (우측하단 작은 카드들) */}
            {weekly.length > 0 && (
              <div className="weather-weekly-box">
                {weekly.map((d, i) => (
                  <div className="weather-mini-card" key={i}>
                    <div>
                      {new Date(d.dt * 1000).toLocaleDateString("ko-KR", {
                        weekday: "short",
                      })}
                    </div>
                    <img
                      src={`https://openweathermap.org/img/wn/${d.weather[0].icon}.png`}
                      alt=""
                    />
                    <div>{Math.round(d.temp.day)}°C</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && !error && !weather && (
          <div className="weather-status">아직 데이터 없음</div>
        )}
      </div>
    </div>
  );
}
