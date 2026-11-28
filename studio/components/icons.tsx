/** The studio's small icon set: 16-unit stroke glyphs, sized by the toolbar (14 px at size m, 12 px at s). */
const PATHS: Record<string, string> = {
  undo: "M6 3 2.5 6.5 6 10 M3 6.5h6a4 4 0 0 1 0 8H6",
  redo: "m10 3 3.5 3.5L10 10 M13 6.5H7a4 4 0 0 0 0 8h3",
  save: "M3 2.5h8l2.5 2.5v8.5h-10.5z M5 2.5v4h5v-4 M5 13.5v-4h6v4",
  live: "M8 2.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z M2.5 8h11 M8 2.5c-2 2-2 9 0 11 M8 2.5c2 2 2 9 0 11",
  external: "M6.5 3.5h-3v9h9v-3 M9.5 2.5h4v4 M13.5 2.5 7.5 8.5",
  status: "M8 3.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z M8 6v2.5l1.5 1",
  more: "M3.5 8h.01 M8 8h.01 M12.5 8h.01",
  "zoom-in": "M7 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z M10.5 10.5 14 14 M7 5v4 M5 7h4",
  "zoom-out": "M7 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z M10.5 10.5 14 14 M5 7h4",
  fit: "M2.5 6v-3.5h3.5 M13.5 6v-3.5h-3.5 M2.5 10v3.5h3.5 M13.5 10v3.5h-3.5",
  refresh: "M13 8a5 5 0 1 1-1.5-3.5 M13 2.5v3h-3",
  close: "M4 4l8 8 M12 4l-8 8",
  chevron: "M4 6l4 4 4-4",
  upload: "M8 11V3.5 M4.5 7 8 3.5 11.5 7 M3 12.5h10",
  grip: "M3 6.5h10 M3 9.5h10",
};

export function StudioIcon({ name, size = 14 }: { name: string; size?: number }) {
  const d = PATHS[name] ?? PATHS.more;
  const dots = name === "more";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={dots ? 2.4 : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}
