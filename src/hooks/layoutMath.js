
export function getLayoutStyles(count, cols, rows) {
  if (count === 1)
    return { cols: "1fr", rows: "1fr", styles: [{ gridColumn: "1 / 2", gridRow: "1 / 2" }] };

  const colsStr = `${cols[0] * 100}% ${cols[1] * 100}%`;

  if (count === 2)
    return {
      cols: colsStr,
      rows: "1fr",
      styles: [
        { gridColumn: "1 / 2", gridRow: "1 / 2" },
        { gridColumn: "2 / 3", gridRow: "1 / 2" },
      ],
    };

  const rowsStr = `${rows[0] * 100}% ${rows[1] * 100}%`;

  if (count === 3)
    return {
      cols: colsStr,
      rows: rowsStr,
      styles: [
        { gridColumn: "1 / 2", gridRow: "1 / 2" },
        { gridColumn: "2 / 3", gridRow: "1 / 2" },
        { gridColumn: "1 / 3", gridRow: "2 / 3" },
      ],
    };

  return {
    cols: colsStr,
    rows: rowsStr,
    styles: [
      { gridColumn: "1 / 2", gridRow: "1 / 2" },
      { gridColumn: "2 / 3", gridRow: "1 / 2" },
      { gridColumn: "1 / 2", gridRow: "2 / 3" },
      { gridColumn: "2 / 3", gridRow: "2 / 3" },
    ],
  };
}
