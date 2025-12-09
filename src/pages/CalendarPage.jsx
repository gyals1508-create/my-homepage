// src/pages/CalendarPage.jsx
import { useState, useEffect } from "react";

export default function CalendarPage() {
  // 요일 표시
  const week = ["일", "월", "화", "수", "목", "금", "토"];

  // 오늘 날짜 (일정 추가 버튼 / 오늘 강조용)
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDate = today.getDate();

  // 화면에 보이는 연/월 상태 (달 넘기기용)
  const [viewYear, setViewYear] = useState(todayYear);
  const [viewMonth, setViewMonth] = useState(todayMonth);

  // 모드: 달력 / 상세
  const [mode, setMode] = useState("calendar"); // 'calendar' | 'detail'
  const [selectedDay, setSelectedDay] = useState(null);

  // 날짜별 일정 데이터 (key: 'YYYY-MM-DD')
  const [events, setEvents] = useState({});

  // 로컬스토리지 로딩 완료 여부
  const [loaded, setLoaded] = useState(false);

  // 공통 빈 이벤트 템플릿
  const emptyEvent = {
    title: "",
    content: "",
    time: "",
    place: "",
    category: "",
    startDate: "",
    endDate: "",
    important: false,
  };

  // 상세 입력 상태
  const [detail, setDetail] = useState(emptyEvent);

  // 카테고리 드롭다운 옵션
  const categoryOptions = ["공부", "병원", "약속", "여행", "회사", "기타"];

  // 30분 간격 12시간제 시간 옵션
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const h24 = Math.floor(i / 2);
    const m = i % 2 === 0 ? "00" : "30";
    const h12 = ((h24 + 11) % 12) + 1;
    const ampm = h24 < 12 ? "오전" : "오후";
    return `${ampm} ${h12}:${m}`;
  });

  // 로컬스토리지에서 일정 불러오기 (최초 1회)
  useEffect(() => {
    const saved = localStorage.getItem("myCalendarEvents");
    if (saved) {
      try {
        setEvents(JSON.parse(saved));
      } catch {
        // 파싱 실패 시 무시
      }
    }
    setLoaded(true);
  }, []);

  // 일정 변경 시 로컬스토리지에 저장
  useEffect(() => {
    if (!loaded) return; // 아직 로딩 전이면 저장하지 않음
    localStorage.setItem("myCalendarEvents", JSON.stringify(events));
  }, [events, loaded]);

  // 날짜를 'YYYY-MM-DD' 문자열로 변환
  const getDateKey = (y, m, d) => {
    const mm = String(m).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  };

  // 해당 달의 1일 요일과 마지막 날짜 계산
  const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay();
  const lastDate = new Date(viewYear, viewMonth, 0).getDate();

  // 달력 셀: 앞쪽 비어 있는 칸(null) + 실제 날짜
  const calendarCells = Array.from({ length: firstDay + lastDate }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  // 달 이전 / 다음 이동 (캘린더 모드에서 사용)
  const handlePrevMonth = () => {
    setViewMonth((m) => {
      if (m === 1) {
        setViewYear((y) => y - 1);
        return 12;
      }
      return m - 1;
    });
  };

  const handleNextMonth = () => {
    setViewMonth((m) => {
      if (m === 12) {
        setViewYear((y) => y + 1);
        return 1;
      }
      return m + 1;
    });
  };

  // 날짜가 어떤 일정의 기간(startDate~endDate)에 포함되는지 체크
  const isInRange = (y, m, d, ev) => {
    if (!ev) return false;
    if (!ev.startDate || !ev.endDate) return false;

    const target = new Date(y, m - 1, d);
    const start = new Date(ev.startDate);
    const end = new Date(ev.endDate);

    return target >= start && target <= end;
  };

  // day(숫자)에 해당하는 이벤트 찾기: 기간/단일 공통
  const getEventForDay = (day) => {
    const key = getDateKey(viewYear, viewMonth, day);
    const byKey = events[key]; // 그 날짜에 직접 저장된 이벤트
    const byRange = Object.values(events).find((e) =>
      isInRange(viewYear, viewMonth, day, e)
    );
    return byRange || byKey || null;
  };

  // 상세 모드에서 하루 앞/뒤로 이동
  const moveDetailDay = (offset) => {
    if (!selectedDay) return;
    const base = new Date(viewYear, viewMonth - 1, selectedDay + offset);
    const ny = base.getFullYear();
    const nm = base.getMonth() + 1;
    const nd = base.getDate();

    const key = getDateKey(ny, nm, nd);
    const byKey = events[key];
    const byRange = Object.values(events).find((e) => isInRange(ny, nm, nd, e));
    const saved = byRange || byKey || emptyEvent;

    setViewYear(ny);
    setViewMonth(nm);
    setSelectedDay(nd);
    setDetail(saved);
  };

  // 날짜 클릭 또는 '일정 추가' 버튼에서 상세 화면으로 전환
  const handleDayClick = (day) => {
    if (!day) return;

    const saved = getEventForDay(day) || emptyEvent;

    setSelectedDay(day);
    setDetail(saved);
    setMode("detail");
  };

  // 상세 저장
  const handleSave = () => {
    if (!selectedDay) return;

    // 기간이 설정돼 있다면, 기간 시작일을 기준 key로 저장
    let key;
    if (detail.startDate) {
      // input[type="date"] 값이 이미 'YYYY-MM-DD' 형태
      key = detail.startDate;
    } else {
      key = getDateKey(viewYear, viewMonth, selectedDay);
    }

    setEvents((prev) => ({
      ...prev,
      [key]: { ...detail },
    }));
    setMode("calendar");
  };

  // 상세 취소(달력으로 돌아가기)
  const handleCancel = () => {
    setMode("calendar");
  };

  // 캘린더 각 날짜에 보여줄 짧은 제목
  const shortTitle = (day) => {
    const ev = getEventForDay(day);
    if (!ev || !ev.title) return "";
    const label = ev.important ? `[★] ${ev.title}` : ev.title;
    return label.length > 10 ? `${label.slice(0, 9)}…` : label;
  };

  return (
    <div className="calendar-page">
      <div className="calendar-card">
        <div className="calendar-inner">
          {/* 상단 헤더: 연/월 + 달 넘김 + 일정 추가 버튼 */}
          <div className="cal-header">
            <div className="cal-month-nav">
              <button
                className="cal-nav-arrow"
                onClick={
                  mode === "calendar"
                    ? handlePrevMonth
                    : () => moveDetailDay(-1)
                }
              >
                〈
              </button>
              <span className="cal-header-title">
                {viewYear}년 {viewMonth}월
                {mode === "detail" && selectedDay && ` ${selectedDay}일`}
              </span>
              <button
                className="cal-nav-arrow"
                onClick={
                  mode === "calendar" ? handleNextMonth : () => moveDetailDay(1)
                }
              >
                〉
              </button>
            </div>

            {mode === "calendar" && (
              <button
                className="cal-add-btn"
                onClick={() => handleDayClick(todayDate)}
              >
                일정 추가
              </button>
            )}
          </div>

          {/* 달력 모드 */}
          {mode === "calendar" && (
            <>
              <div className="cal-week-row">
                {week.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>

              <div className="cal-grid">
                {calendarCells.map((day, idx) => (
                  <button
                    key={idx}
                    className={`cal-cell ${
                      day &&
                      viewYear === todayYear &&
                      viewMonth === todayMonth &&
                      day === todayDate
                        ? "cal-today"
                        : ""
                    }`}
                    onClick={() => handleDayClick(day)}
                    disabled={!day}
                  >
                    <div className="cal-day-num">{day || ""}</div>
                    <div className="cal-tags">
                      {day && shortTitle(day) && (
                        <span className="cal-tag">{shortTitle(day)}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* 상세 입력 모드 */}
          {mode === "detail" && selectedDay && (
            <div className="calendar-scroll-area">
              <div className="detail-wrap">
                <div className="detail-header">
                  <span className="detail-date">
                    &nbsp;&nbsp;{viewYear}년 {viewMonth}월 {selectedDay}일
                  </span>
                  <button className="detail-back" onClick={handleCancel}>
                    달력으로
                  </button>
                </div>

                <div className="detail-layout">
                  {/* 왼쪽: 제목 + 상세 내용 */}
                  <div className="detail-box detail-box-left">
                    <div className="detail-left-title">
                      {viewMonth}월 {selectedDay}일
                    </div>

                    <label className="detail-field">
                      <span>제목</span>
                      <input
                        className="detail-title-input"
                        type="text"
                        placeholder="예) 시험 준비, 병원 예약..."
                        value={detail.title}
                        onChange={(e) =>
                          setDetail((p) => ({ ...p, title: e.target.value }))
                        }
                      />
                    </label>

                    <label className="detail-field">
                      <span>상세 내용</span>
                      <textarea
                        className="detail-content-input"
                        placeholder="일정 내용을 적어주세요..."
                        value={detail.content}
                        onChange={(e) =>
                          setDetail((p) => ({ ...p, content: e.target.value }))
                        }
                      />
                    </label>
                  </div>

                  {/* 중요 일정 체크 */}
                  <div className="detail-box detail-box-top">
                    <label className="detail-field detail-important">
                      <span>
                        <input
                          type="checkbox"
                          checked={detail.important}
                          onChange={(e) =>
                            setDetail((p) => ({
                              ...p,
                              important: e.target.checked,
                            }))
                          }
                        />
                        &nbsp;중요한 일정으로 표시
                      </span>
                    </label>
                  </div>

                  {/* 시간 + 장소 */}
                  <div className="detail-box detail-box-middle">
                    <label className="detail-field">
                      <span>시간</span>
                      <select
                        className="detail-title-input"
                        value={detail.time}
                        onChange={(e) =>
                          setDetail((p) => ({ ...p, time: e.target.value }))
                        }
                      >
                        <option value="">시간 선택</option>
                        {timeOptions.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="detail-field">
                      <span>장소</span>
                      <input
                        className="detail-title-input"
                        type="text"
                        placeholder="예) 강남역"
                        value={detail.place}
                        onChange={(e) =>
                          setDetail((p) => ({ ...p, place: e.target.value }))
                        }
                      />
                    </label>
                  </div>

                  {/* 기간(날짜 선택) */}
                  <div className="detail-box detail-box-period">
                    <label className="detail-field">
                      <span>기간</span>
                      <div className="detail-row-2col">
                        <input
                          className="detail-title-input"
                          type="date"
                          value={detail.startDate}
                          onChange={(e) =>
                            setDetail((p) => ({
                              ...p,
                              startDate: e.target.value,
                            }))
                          }
                        />
                        <input
                          className="detail-title-input"
                          type="date"
                          value={detail.endDate}
                          onChange={(e) =>
                            setDetail((p) => ({
                              ...p,
                              endDate: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </label>
                  </div>

                  {/* 카테고리 드롭다운 */}
                  <div className="detail-box detail-box-large">
                    <label className="detail-field">
                      <span>카테고리</span>
                      <select
                        className="detail-title-input"
                        value={detail.category}
                        onChange={(e) =>
                          setDetail((p) => ({
                            ...p,
                            category: e.target.value,
                          }))
                        }
                      >
                        <option value="">선택해줘</option>
                        {categoryOptions.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {/* 미리보기 */}
                  <div className="detail-box detail-box-right">
                    <div className="detail-preview-title">미리보기</div>

                    <div className="detail-preview-body">
                      {/* ★ 제목 */}
                      <div className="preview-main">
                        {detail.important && (
                          <span className="preview-star">★</span>
                        )}
                        <span>{detail.title || "제목 없음"}</span>
                      </div>

                      {/* 카테고리 */}
                      <div className="preview-tag">
                        {detail.category || "카테고리 없음"}
                      </div>

                      {/* 기간 */}
                      {(detail.startDate || detail.endDate) && (
                        <div className="preview-period">
                          {detail.startDate || "시작일 미정"} ~{" "}
                          {detail.endDate || "종료일 미정"}
                        </div>
                      )}

                      {/* 시간 / 장소 */}
                      <div className="preview-sub">
                        {detail.time || "시간 미정"} ·{" "}
                        {detail.place || "장소 미정"}
                      </div>

                      {/* 상세 내용 */}
                      <div className="preview-content">
                        {detail.content || "상세 내용 없음"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="detail-buttons">
                  <button className="detail-save-btn" onClick={handleSave}>
                    저장
                  </button>
                  <button className="detail-cancel-btn" onClick={handleCancel}>
                    취소
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
