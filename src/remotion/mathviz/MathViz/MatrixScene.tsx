import { loadFont } from "@remotion/google-fonts/Inter";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BG, DIM, MINT, PINK, WHITE } from "../Showcase/palette";
import { fmt, segmentStarts, type Spine } from "./spine";

const { fontFamily } = loadFont();

const GREEN = "#00E5A0";
const YELLOW = "#F4B941";

// 1080 px / 8 world units — matches Manim's default frame height
const SCALE = 135;

type Vec = readonly [number, number];
type Mat = readonly [number, number, number, number]; // a b c d row-major

const apply = (m: Mat, [x, y]: Vec): Vec => [
  m[0] * x + m[1] * y,
  m[2] * x + m[3] * y,
];

const smooth = Easing.bezier(0.4, 0, 0.2, 1);

export const MatrixScene: React.FC<{ spine: Spine | null }> = ({ spine }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  if (!spine) {
    return <AbsoluteFill style={{ backgroundColor: BG }} />;
  }

  const seg = segmentStarts(spine.timing);
  const t = frame / fps;

  const toPx = ([x, y]: Vec): Vec => [
    width / 2 + x * SCALE,
    height / 2 - y * SCALE,
  ];

  const [[a, b], [c, d]] = spine.matrix;
  // Transformation progress: identity → A across the transform segment
  const p = interpolate(t, [seg.transform, seg.eigenReveal], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: smooth,
  });
  const M: Mat = [1 + (a - 1) * p, b * p, c * p, 1 + (d - 1) * p];

  const gridIn = interpolate(t, [seg.gridIn, seg.vectorsIn], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: smooth,
  });
  const vectorsIn = interpolate(t, [seg.vectorsIn, seg.holdBefore], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: smooth,
  });
  const eigenIn = interpolate(t, [seg.eigenReveal, seg.holdAfter], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: smooth,
  });
  const detIn = interpolate(
    t,
    [seg.holdAfter, seg.holdAfter + 0.4],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const EXT = 12; // world half-extent so sheared lines still cover the frame
  const gridRange = Array.from({ length: 2 * EXT + 1 }, (_, i) => i - EXT);

  const line = (from: Vec, to: Vec, key: string, stroke: string, w: number, opacity: number) => {
    const [x1, y1] = toPx(apply(M, from));
    const [x2, y2] = toPx(apply(M, to));
    return (
      <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={w} opacity={opacity} />
    );
  };

  const arrow = (target: Vec, color: string, key: string) => {
    const tip = apply(M, [target[0] * vectorsIn, target[1] * vectorsIn]);
    const [x1, y1] = toPx([0, 0]);
    const [x2, y2] = toPx(tip);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLen = 18;
    const head = [
      [x2, y2],
      [x2 - headLen * Math.cos(angle - 0.45), y2 - headLen * Math.sin(angle - 0.45)],
      [x2 - headLen * Math.cos(angle + 0.45), y2 - headLen * Math.sin(angle + 0.45)],
    ]
      .map((pt) => pt.join(","))
      .join(" ");
    return (
      <g key={key} opacity={Math.min(1, vectorsIn * 2)}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={6} />
        <polygon points={head} fill={color} />
      </g>
    );
  };

  const [lam1, lam2] = spine.eigenvalues;
  const evecs = spine.eigenvectors_columns; // evecs[row][col], columns are v1 v2
  const SPAN = 6;

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily }}>
      <svg width={width} height={height}>
        {/* grid, staggered in from the axes */}
        {gridRange.flatMap((k) => {
          const reveal = interpolate(gridIn, [Math.abs(k) / (EXT + 6), 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const isAxis = k === 0;
          const stroke = isAxis ? WHITE : "#7C5CFF";
          const opacity = reveal * (isAxis ? 0.9 : 0.28);
          const w = isAxis ? 2.5 : 1.5;
          return [
            line([k, -EXT], [k, EXT], `v${k}`, stroke, w, opacity),
            line([-EXT, k], [EXT, k], `h${k}`, stroke, w, opacity),
          ];
        })}

        {/* sample points riding the transformation */}
        {spine.sample_points.map((pt, i) => {
          const [x, y] = toPx(apply(M, [pt[0], pt[1]]));
          return (
            <circle key={`pt${i}`} cx={x} cy={y} r={6} fill={MINT} opacity={vectorsIn * 0.85} />
          );
        })}

        {/* eigenvector lines: invariant directions */}
        {[0, 1].map((i) => {
          const v: Vec = [evecs[0][i], evecs[1][i]];
          const [x1, y1] = toPx(apply(M, [-SPAN * v[0] * eigenIn, -SPAN * v[1] * eigenIn]));
          const [x2, y2] = toPx(apply(M, [SPAN * v[0] * eigenIn, SPAN * v[1] * eigenIn]));
          return (
            <line key={`e${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={PINK} strokeWidth={4} opacity={eigenIn * 0.9} />
          );
        })}

        {/* basis vectors */}
        {arrow([1, 0], GREEN, "i")}
        {arrow([0, 1], YELLOW, "j")}
      </svg>

      {/* matrix label — entries straight from the spine */}
      <div
        style={{
          position: "absolute",
          top: 48,
          right: 64,
          display: "flex",
          alignItems: "center",
          gap: 14,
          color: WHITE,
          fontSize: 40,
          fontWeight: 700,
          opacity: vectorsIn,
        }}
      >
        <span>A =</span>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto auto",
            gap: "2px 22px",
            padding: "8px 18px",
            borderLeft: `4px solid ${WHITE}`,
            borderRight: `4px solid ${WHITE}`,
            borderRadius: 6,
            textAlign: "center",
          }}
        >
          <span>{fmt(a)}</span>
          <span>{fmt(b)}</span>
          <span>{fmt(c)}</span>
          <span>{fmt(d)}</span>
        </div>
      </div>

      {/* eigen + determinant labels */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          width: "100%",
          textAlign: "center",
          color: PINK,
          fontSize: 34,
          fontWeight: 600,
          opacity: eigenIn,
        }}
      >
        A<i>v</i> = λ<i>v</i> &nbsp;·&nbsp; λ₁ = {fmt(lam1)}, λ₂ = {fmt(lam2)}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 64,
          width: "100%",
          textAlign: "center",
          color: DIM,
          fontSize: 28,
          letterSpacing: "0.12em",
          opacity: detIn,
        }}
      >
        det(A) = {fmt(spine.determinant)} — areas scale by {fmt(spine.determinant)}
      </div>
    </AbsoluteFill>
  );
};
