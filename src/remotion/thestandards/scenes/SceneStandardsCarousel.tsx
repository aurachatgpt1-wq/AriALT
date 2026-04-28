import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { interFont } from "../constants";

// ─── Timeline ─────────────────────────────────────────────────────────────────
const T_TYPE_START    = 7;
const CHARS_PER_FRAME = 1.4;
const TYPE_TEXT       = "Compliant with";
const T_TITLE_UP      = 55;
const T_TITLE_FADEOUT = 55;
const T_SUBTITLE      = 60;
const T_CAROUSEL_IN   = 68;
const ROTATION_SECS   = 7;
const T_ACCEL_START       = 320;
const ACCEL_FACTOR        = 0.055; // deg/frame² — drives both rotation and exit timing
const T_SUBTITLE_FADEOUT  = 390;   // "Global cybersecurity standards" fades out (~13s)

// ─── Carousel geometry ────────────────────────────────────────────────────────
const RADIUS_X    = 380;
const RING_TILT_Y = 110;
const CENTER_X    = 960;
const CENTER_Y    = 640;

// ─── Badge definitions ────────────────────────────────────────────────────────
type BadgeKind =
  | "circle-stars"
  | "globe"
  | "cloud"
  | "doc-check"
  | "seal"
  | "nist"
  | "cis";

const BADGES: { label: string; sub?: string; kind: BadgeKind }[] = [
  { label: "GDPR",       kind: "circle-stars" },
  { label: "ISO 27001",  kind: "globe" },
  { label: "ISO 27799",  kind: "globe" },
  { label: "NIST",       kind: "nist" },
  { label: "NIS2",       sub: "Directive", kind: "circle-stars" },
  { label: "PCI\nDSS",  kind: "doc-check" },
  { label: "AICPA\nSOC", kind: "seal" },
  { label: "C5",         kind: "cloud" },
  { label: "CIS",        kind: "cis" },
];

const BadgeGraphic: React.FC<{ kind: BadgeKind; label: string; sub?: string }> = ({
  kind, label, sub,
}) => {
  const stroke = "#FFFFFF";
  const sw = 3;

  if (kind === "circle-stars") {
    const stars = Array.from({ length: 12 }).map((_, i) => {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      return (
        <text key={i} x={110 + Math.cos(a) * 80} y={110 + Math.sin(a) * 80}
          fill={stroke} fontSize={14} textAnchor="middle" dominantBaseline="central">★</text>
      );
    });
    return (
      <svg viewBox="0 0 220 220" width={220} height={220}>
        {stars}
        <text x={110} y={sub ? 100 : 112} fill={stroke} fontSize={sub ? 24 : 28}
          fontWeight={800} textAnchor="middle" dominantBaseline="central"
          style={{ fontFamily: interFont }}>{label}</text>
        {sub && <text x={110} y={125} fill={stroke} fontSize={16}
          textAnchor="middle" dominantBaseline="central"
          style={{ fontFamily: interFont }}>{sub}</text>}
      </svg>
    );
  }

  if (kind === "globe") {
    return (
      <svg viewBox="0 0 220 220" width={220} height={220}>
        <circle cx={110} cy={110} r={90} fill="none" stroke={stroke} strokeWidth={sw} />
        <ellipse cx={110} cy={110} rx={90} ry={36} fill="none" stroke={stroke} strokeWidth={sw} />
        <ellipse cx={110} cy={110} rx={36} ry={90} fill="none" stroke={stroke} strokeWidth={sw} />
        <line x1={20} y1={110} x2={200} y2={110} stroke={stroke} strokeWidth={sw} />
        <rect x={40} y={92} width={140} height={38} fill="#000" />
        <text x={110} y={111} fill={stroke} fontSize={26} fontWeight={700}
          textAnchor="middle" dominantBaseline="central"
          style={{ fontFamily: interFont }}>{label}</text>
      </svg>
    );
  }

  if (kind === "nist") {
    // Stylized NIST wordmark (white, outlined glyph style)
    return (
      <svg viewBox="0 0 260 220" width={260} height={220}>
        <text
          x={130}
          y={130}
          fill={stroke}
          fontSize={82}
          fontWeight={900}
          letterSpacing={-4}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontFamily: interFont, fontStretch: "condensed" }}
        >
          NIST
        </text>
      </svg>
    );
  }

  if (kind === "cis") {
    // CIS logo — thick open swoosh arc (gap near top-right), CIS wordmark inside
    return (
      <svg viewBox="0 0 220 220" width={220} height={220}>
        {/* Large swoosh: starts top-right with tapered end, wraps CCW around
            through left, bottom and up the right side back toward the start. */}
        <path
          d="M 155 24
             A 92 92 0 1 0 196 130"
          fill="none"
          stroke={stroke}
          strokeWidth={9}
          strokeLinecap="round"
        />
        {/* Thin inner accent arc for a subtle double-line feel (top portion) */}
        <path
          d="M 150 38
             A 74 74 0 0 0 48 90"
          fill="none"
          stroke={stroke}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        {/* CIS wordmark */}
        <text
          x={108}
          y={118}
          fill={stroke}
          fontSize={62}
          fontWeight={800}
          letterSpacing={-2}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontFamily: interFont }}
        >
          CIS
        </text>
        {/* ® mark */}
        <text
          x={168}
          y={108}
          fill={stroke}
          fontSize={14}
          fontWeight={700}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontFamily: interFont }}
        >
          ®
        </text>
      </svg>
    );
  }

  if (kind === "cloud") {
    return (
      <svg viewBox="0 0 260 220" width={260} height={220}>
        <path d="M 70 140 Q 40 140 40 118 Q 40 96 64 96 Q 68 76 92 76 Q 116 76 122 98 Q 142 96 146 118 Q 146 140 120 140 Z"
          fill="none" stroke={stroke} strokeWidth={sw} />
        <path d="M 140 150 Q 110 150 110 128 Q 110 106 134 106 Q 138 86 162 86 Q 186 86 192 108 Q 212 106 216 128 Q 216 150 190 150 Z"
          fill="none" stroke={stroke} strokeWidth={sw} />
        <text x={85} y={122} fill={stroke} fontSize={22} fontWeight={800}
          textAnchor="middle" style={{ fontFamily: interFont }}>C5</text>
        <circle cx={180} cy={128} r={8} fill="none" stroke={stroke} strokeWidth={sw} />
        <line x1={180} y1={136} x2={180} y2={150} stroke={stroke} strokeWidth={sw} />
        <line x1={180} y1={144} x2={186} y2={144} stroke={stroke} strokeWidth={sw} />
      </svg>
    );
  }

  if (kind === "doc-check") {
    return (
      <svg viewBox="0 0 220 220" width={220} height={220}>
        <path d="M 50 50 L 160 50 L 180 70 L 180 180 L 50 180 Z" fill="#000" stroke={stroke} strokeWidth={sw} />
        <path d="M 160 50 L 160 70 L 180 70" fill="none" stroke={stroke} strokeWidth={sw} />
        <text x={115} y={108} fill={stroke} fontSize={34} fontWeight={900}
          textAnchor="middle" style={{ fontFamily: interFont }}>PCI</text>
        <text x={115} y={150} fill={stroke} fontSize={34} fontWeight={900}
          textAnchor="middle" style={{ fontFamily: interFont }}>DSS</text>
        <path d="M 150 150 L 170 170 L 200 130" fill="none" stroke={stroke} strokeWidth={5}
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 220 220" width={220} height={220}>
      <circle cx={110} cy={110} r={90} fill="none" stroke={stroke} strokeWidth={sw} />
      <circle cx={110} cy={110} r={80} fill="none" stroke={stroke} strokeWidth={1.5} />
      <line x1={40} y1={110} x2={180} y2={110} stroke={stroke} strokeWidth={sw} />
      <text x={110} y={88} fill={stroke} fontSize={22} fontWeight={800}
        textAnchor="middle" style={{ fontFamily: interFont }}>AICPA</text>
      <text x={110} y={140} fill={stroke} fontSize={22} fontWeight={800}
        textAnchor="middle" style={{ fontFamily: interFont }}>SOC</text>
    </svg>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
export const SceneStandardsCarousel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const N = BADGES.length;

  // ── Typing animation ────────────────────────────────────────────────────────
  const typedCount = Math.min(
    TYPE_TEXT.length,
    Math.max(0, Math.floor((frame - T_TYPE_START) * CHARS_PER_FRAME)),
  );
  const typedText = TYPE_TEXT.slice(0, typedCount);
  const showCursor = frame >= T_TYPE_START && typedCount < TYPE_TEXT.length;

  // ── Title position: center → top, then fade out ────────────────────────────
  const titleUp = spring({ frame: frame - T_TITLE_UP, fps,
    config: { damping: 180, stiffness: 100, mass: 0.8 } });
  const titleY = interpolate(titleUp, [0, 1], [440, 130]);
  const titleSize = interpolate(titleUp, [0, 1], [130, 88]);
  const titleFadeOut = spring({ frame: frame - T_TITLE_FADEOUT, fps,
    config: { damping: 200, stiffness: 120, mass: 0.6 } });
  const titleOpacity = 1 - titleFadeOut;

  // ── Subtitle ───────────────────────────────────────────────────────────────
  const subIn = spring({ frame: frame - T_SUBTITLE, fps,
    config: { damping: 180, stiffness: 90, mass: 0.8 } });
  const subY = interpolate(subIn, [0, 1], [20, 0]);
  const subFadeOut = spring({ frame: frame - T_SUBTITLE_FADEOUT, fps,
    config: { damping: 200, stiffness: 120, mass: 0.6 } });
  const subOpacity = subIn * (1 - subFadeOut);

  // ── Carousel entrance ──────────────────────────────────────────────────────
  const carouselIn = spring({ frame: frame - T_CAROUSEL_IN, fps,
    config: { damping: 200, stiffness: 70, mass: 1 } });

  // ── Rotation: slow (counter-clockwise) → accelerate ───────────────────────
  const slowProgress = Math.max(0, Math.min(frame - T_CAROUSEL_IN, T_ACCEL_START - T_CAROUSEL_IN));
  const slowDeg = (slowProgress / (ROTATION_SECS * fps)) * 360;
  const accelProgress = Math.max(0, frame - T_ACCEL_START);
  const accelDeg = ACCEL_FACTOR * accelProgress * accelProgress;
  const rotationDeg = slowDeg + accelDeg;

  // ── Analytical exit frame: badge i exits when it crosses the front (angle≡0)
  //    during the acceleration spin — one badge per crossing, one full turn total
  const ROT_AT_ACCEL = ((T_ACCEL_START - T_CAROUSEL_IN) / (ROTATION_SECS * fps)) * 360;
  const badgeExitFrames = BADGES.map((_, i) => {
    const baseAngle = (i / N) * 360;
    const effAtAccel = ((baseAngle + ROT_AT_ACCEL) % 360 + 360) % 360;
    // degrees still needed to reach front (0°); if already at front give it a full turn
    const extra = effAtAccel < 1 ? 360 : 360 - effAtAccel;
    return T_ACCEL_START + Math.sqrt(extra / ACCEL_FACTOR);
  });

  return (
    <AbsoluteFill style={{ background: "#000000", fontFamily: interFont, overflow: "hidden" }}>

      {/* ── "Compliant with" typing title (fades out after moving up) ─────── */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: titleY,
          textAlign: "center",
          color: "#FFFFFF",
          opacity: titleOpacity,
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            fontSize: titleSize,
            fontWeight: 800,
            letterSpacing: -2,
            lineHeight: 1,
          }}
        >
          {typedText}
          {showCursor && (
            <span style={{ opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0 }}>|</span>
          )}
        </span>
      </div>

      {/* ── Subtitle ────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 390,
          textAlign: "center",
          color: "#FFFFFF",
          fontSize: 52,
          fontWeight: 300,
          letterSpacing: 0,
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
          zIndex: 9,
        }}
      >
        Global cybersecurity standards
      </div>

      {/* ── Carousel ────────────────────────────────────────────────────────── */}
      <div style={{ position: "absolute", inset: 0, opacity: carouselIn }}>
        {BADGES.map((b, i) => {
          const baseAngle = (i / N) * 360;
          const current   = baseAngle + rotationDeg;
          const rad       = (current * Math.PI) / 180;
          const cosA      = Math.cos(rad);
          const sinA      = Math.sin(rad);
          const depth     = (cosA + 1) / 2;
          const carouselOpacity = 0.18 + depth * 0.82;
          const carouselScale   = 0.4 + depth * 0.6;

          // counter-clockwise: negate sin so ring goes front→left→back→right→front
          const cx = CENTER_X - sinA * RADIUS_X;
          const cy = CENTER_Y + cosA * RING_TILT_Y;

          // ── Exit: badge flies off left when it crosses front during accel ──
          const exitFrame = badgeExitFrames[i];
          const exiting   = frame >= exitFrame;
          const exitProg  = spring({
            frame: frame - exitFrame,
            fps,
            config: { damping: 110, stiffness: 280, mass: 0.35 },
          });

          // At exit moment badge is at front: (CENTER_X, CENTER_Y + RING_TILT_Y)
          const FRONT_X = CENTER_X;
          const FRONT_Y = CENTER_Y + RING_TILT_Y;

          const finalX   = exiting ? interpolate(exitProg, [0, 1], [FRONT_X, -500])  : cx;
          const finalY   = exiting ? FRONT_Y                                          : cy;
          const finalScale   = exiting ? interpolate(exitProg, [0, 1], [1.0, 0.5])   : carouselScale;
          const finalOpacity = exiting ? interpolate(exitProg, [0, 1], [1, 0])        : carouselOpacity;
          const finalBlur    = exiting ? 0                                             : (1 - depth) * 1.2;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 260,
                height: 220,
                transform: `translate(${finalX - 130}px, ${finalY - 110}px) scale(${finalScale})`,
                opacity: finalOpacity,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                filter: `blur(${finalBlur}px)`,
                zIndex: exiting ? 2000 : Math.round(depth * 1000),
              }}
            >
              <BadgeGraphic kind={b.kind} label={b.label} sub={b.sub} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
