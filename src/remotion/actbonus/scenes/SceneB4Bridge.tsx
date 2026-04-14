import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { interFont } from "../../actbonus/constants";

const ITEMS = [
  "Memory Persistent",
  "Context-aware",
  "No prompts needed",
  "Tailored on your Data",
  "Works with your existing systems",
  "Compliant with your standards",
  "No setup costs",
  "Autonomous by design",
  "Ready from day one",
];

const LAST_IDX = ITEMS.length - 1;

const T_TITLE_IN  = 8;
const T_TITLE_OUT = 68;
const T_P2_IN     = 80;
const T_LIST_BASE = 100;
const LIST_STEP   = 18;
const T_ZOOM      = T_LIST_BASE + 7 * LIST_STEP + 20;

const CONTENT_W = 860;
const CONTENT_X = (1920 - CONTENT_W) / 2;
const CHECK_Y   = 620;
const SLOT_H    = 86;

const FixedCheck: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div style={{
    position: "absolute", left: CONTENT_X, top: CHECK_Y - 21,
    width: 42, height: 42, borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.22)",
    border: "1.5px solid rgba(255,255,255,0.55)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 10, opacity,
  }}>
    <svg width="17" height="13" viewBox="0 0 17 13" fill="none">
      <polyline points="1.5,6.5 5.5,11 15.5,1.5"
        stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

export const SceneBridge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

  const sceneOp = Math.min(
    interpolate(frame, [0, 18], [0, 1], clamp),
    interpolate(frame, [254, 270], [1, 0], clamp),
  );

  const sp = (f: number, s = 240, d = 26, m = 0.7) =>
    spring({ frame: frame - f, fps, config: { stiffness: s, damping: d, mass: m } });

  const titleEnterT = sp(T_TITLE_IN, 220, 28, 0.7);
  const p1Op = Math.min(
    interpolate(titleEnterT, [0, 1], [0, 1]),
    interpolate(frame, [T_TITLE_OUT, T_TITLE_OUT + 18], [1, 0], clamp),
  );

  const p2Op        = interpolate(frame, [T_P2_IN, T_P2_IN + 18], [0, 1], clamp);
  const introLogoT  = sp(T_P2_IN + 8,  260, 24, 0.6);
  const introBadgeT = sp(T_P2_IN + 18, 240, 26, 0.6);

  const TRIGGERS = Array.from({ length: 8 }, (_, i) => T_LIST_BASE + i * LIST_STEP);
  const scrollPos = TRIGGERS.reduce((acc, f) =>
    acc + spring({ frame: frame - f, fps, config: { stiffness: 180, damping: 28, mass: 0.9 } }),
    0
  );

  const zoomT = spring({ frame: frame - T_ZOOM, fps, config: { stiffness: 100, damping: 20, mass: 1.3 } });
  const zoomScale = interpolate(zoomT, [0, 1], [1, 2.1]);

  return (
    <AbsoluteFill style={{ opacity: sceneOp }}>

      <div style={{ position: "absolute", inset: 0, backgroundColor: "#6FA3CC" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(150deg, #A8C4E8 0%, #7BAFD4 45%, #5E9EC8 100%)" }} />
      <div style={{
        position: "absolute", width: 1000, height: 900, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(147,197,253,0.38) 0%, transparent 65%)",
        right: -200, bottom: -160, filter: "blur(90px)",
      }} />

      {p1Op > 0.01 && (
        <AbsoluteFill style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          opacity: p1Op, pointerEvents: "none", zIndex: 8,
        }}>
          <div style={{
            textAlign: "center",
            fontFamily: interFont, fontSize: 96, fontWeight: 700,
            letterSpacing: "-0.040em", lineHeight: 1.06,
            opacity: interpolate(titleEnterT, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(titleEnterT, [0, 1], [28, 0])}px)`,
          }}>
            <div style={{ color: "rgba(255,255,255,0.92)" }}>What if AI actually</div>
            <div style={{ color: "rgba(210,228,248,0.86)" }}>knew your infrastructure?</div>
          </div>
        </AbsoluteFill>
      )}

      {p2Op > 0.01 && (
        <>
          <div style={{
            position: "absolute", left: CONTENT_X, top: 176,
            opacity: p2Op * interpolate(introBadgeT, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(introBadgeT, [0, 1], [10, 0])}px) scale(${interpolate(introBadgeT, [0, 1], [0.92, 1])})`,
            pointerEvents: "none", zIndex: 9,
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "7px 18px 7px 12px", borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.30)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                  stroke="rgba(255,255,255,0.80)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{
                fontFamily: interFont, fontSize: 13, fontWeight: 600,
                color: "rgba(255,255,255,0.82)", letterSpacing: "0.10em",
                textTransform: "uppercase",
              }}>Introducing</span>
            </div>
          </div>

          <div style={{
            position: "absolute", left: CONTENT_X, top: 220,
            display: "flex", alignItems: "center", gap: 20,
            opacity: p2Op * interpolate(introLogoT, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(introLogoT, [0, 1], [16, 0])}px) scale(${interpolate(introLogoT, [0, 1], [0.88, 1])})`,
            pointerEvents: "none", zIndex: 9,
          }}>
            <div style={{ width: 72, height: 72, borderRadius: 18, overflow: "hidden", flexShrink: 0, boxShadow: "0 4px 24px rgba(0,0,0,0.18)" }}>
              <Img src={staticFile("aria-logo.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <span style={{ fontFamily: interFont, fontSize: 44, fontWeight: 800, color: "rgba(255,255,255,0.96)", letterSpacing: "-0.028em" }}>AriA</span>
          </div>

          <div style={{ position: "absolute", left: CONTENT_X, right: CONTENT_X, top: 326, height: 1, backgroundColor: "rgba(255,255,255,0.16)", opacity: p2Op, zIndex: 9 }} />

          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 200, background: "linear-gradient(to bottom, rgba(95,148,195,0.88) 0%, transparent 100%)", zIndex: 5, pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 240, background: "linear-gradient(to top, rgba(95,148,195,0.88) 0%, transparent 100%)", zIndex: 5, pointerEvents: "none" }} />

          <FixedCheck opacity={p2Op} />

          {ITEMS.map((label, i) => {
            const distance = i - scrollPos;
            const absDist  = Math.abs(distance);
            if (absDist > 3.1) return null;
            const isLast = i === LAST_IDX;
            const yPos   = CHECK_Y + distance * SLOT_H;
            const baseFontSize = interpolate(absDist, [0, 0.5, 1.2, 2.2], [54, 54, 32, 22], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const itemOp       = interpolate(absDist, [0, 0.15, 0.85, 1.8, 2.8], [1, 1, 0.35, 0.15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const fontWeight   = absDist < 0.35 ? 700 : 400;
            const scale        = isLast && absDist < 0.5 ? zoomScale : 1;
            return (
              <div key={label} style={{ position: "absolute", left: CONTENT_X + 66, right: CONTENT_X, top: yPos, transform: `translateY(-50%) scale(${scale})`, transformOrigin: "left center", opacity: p2Op * itemOp, pointerEvents: "none", zIndex: 8 }}>
                <span style={{ fontFamily: interFont, fontSize: baseFontSize, fontWeight, color: "rgba(255,255,255,0.96)", letterSpacing: absDist < 0.35 ? "-0.030em" : "-0.014em", whiteSpace: "nowrap" }}>{label}</span>
              </div>
            );
          })}
        </>
      )}
    </AbsoluteFill>
  );
};
