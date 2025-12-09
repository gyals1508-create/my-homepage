// 패널 드래그 동작 관리

import { useRef, useState } from "react";

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export function usePanelDrag({
  cols,
  rows,
  setCols,
  setRows,
  visiblePanels,
  panels,
  setVisibleIds,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);

  const onDrag = (e) => {
    const data = dragRef.current;
    if (!data) return;

    const { type, wrapperLeft, wrapperTop, width, height } = data;

    // ✅ 마우스 "현재 위치"를 그대로 비율로 사용
    const x = (e.clientX - wrapperLeft) / width;
    const y = (e.clientY - wrapperTop) / height;

    const MIN = 0.02;
    const MAX = 0.98;

    let nextCols = [...cols];
    let nextRows = [...rows];

    if (type === "vertical" || type === "both") {
      const left = clamp(x, MIN, MAX);
      nextCols = [left, 1 - left];
    }

    if (type === "horizontal" || type === "both") {
      const top = clamp(y, MIN, MAX);
      nextRows = [top, 1 - top];
    }

    setCols(nextCols);
    setRows(nextRows);

    // 4분할일 때만 95% 이상 차지하면 해당 패널만 전체화면
    if (visiblePanels.length === 4) {
      const areas = [
        nextCols[0] * nextRows[0],
        nextCols[1] * nextRows[0],
        nextCols[0] * nextRows[1],
        nextCols[1] * nextRows[1],
      ];
      const max = Math.max(...areas);
      if (max >= 0.95) {
        const idx = areas.indexOf(max);
        const mainId = panels[idx]?.id ?? idx + 1;
        setVisibleIds([mainId]);
      }
    }
  };

  const endDrag = () => {
    dragRef.current = null;
    window.removeEventListener("mousemove", onDrag);
    window.removeEventListener("mouseup", endDrag);
    setIsDragging(false);
  };

  const startDrag = (type) => (e) => {
    e.preventDefault();
    setIsDragging(true);

    // ✅ 실제 패널 래퍼 기준 좌표/크기 저장
    const wrapper = e.currentTarget.closest(".panel-grid-wrapper");
    const rect = wrapper
      ? wrapper.getBoundingClientRect()
      : {
          left: 0,
          top: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };

    dragRef.current = {
      type,
      wrapperLeft: rect.left,
      wrapperTop: rect.top,
      width: rect.width,
      height: rect.height,
    };

    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", endDrag);
  };

  return { isDragging, startDrag };
}
