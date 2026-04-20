import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { interFont } from "../constants";

/* ─── SceneFasterStill — hero row + suffix flip cards ───────────────────────
 *  White paper stage.
 *  PHASE 1 — "Yeah" (blue) → "Faster" → "but nothing really changes"
 *            word-by-word from below.
 *  PHASE 2 — "Still <suffix>" flip cards:
 *            not smarter. → not autonomous. → inaccurate. → unreliable.
 * ────────────────────────────────────────────────────────────────────────── */

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const QUAL_WORDS = ["but", "nothing", "really", "changes"];

const SUFFIXES = [
  "not smarter.",
  "not autonomous.",
  "inaccurate.",
  "unreliable.",
];

// ── Palette ──────────────────────────────────────────────────────────────────
const PAPER_BG     = "#FFFFFF";
const YEAH_COLOR   = "#5E9EC8";   // AriA brand blue
const FASTER_COLOR = "#0A0B10";
const QUAL_COLOR   = "#1D1D1F";
const STILL_COLOR  = "#1D1D1F";
const SUFFIX_COLOR = "#1D1D1F";

// ── Typography ───────────────────────────────────────────────────────────────
const LINE_SIZE   = 84;
const YEAH_SIZE   = 80;
const FASTER_SIZE = 160;
const QUAL_SIZE   = 34;

// ── Timing ───────────────────────────────────────────────────────────────────
const YEAH_START        = 0;
const FASTER_START      = 10;
const QUAL_START        = 50;   // qualifier starts AFTER zoom is mostly complete
const QUAL_WORD_STAGGER = 7;
const QUAL_EXIT_START   = 86;   // qualifier exits before hero fades
const HERO_HOLD_UNTIL   = 110;
const HERO_FADE_OUT     = 14;

const STILL_APPEAR_AT = HERO_HOLD_UNTIL + HERO_FADE_OUT - 4;  // slight overlap
const FIRST_SUFFIX_IN = HERO_HOLD_UNTIL + HERO_FADE_OUT;
const SUFFIX_CYCLE    = 32;
const SUFFIX_OVERLAP  = 6;

const CONTENT_FADE_START = 214;
const CONTENT_FADE_END   = 240;

// ── Layout ───────────────────────────────────────────────────────────────────
const CENTER_X    = 960;
const CENTER_Y    = 540;
// Approx half visual width of "Faster" at FASTER_SIZE 160px Inter 900.
// Adjust this constant if Faster drifts from center.
const FASTER_HALF_W = 225;
const PERSPECTIVE = 1400;
const STILL_SUFFIX_GAP = 26;
const GROUND_Y    = CENTER_Y + 150;

// ── Shared text style ────────────────────────────────────────────────────────
const baseText: React.CSSProperties = {
  fontFamily: interFont,
  fontSize: LINE_SIZE,
  fontWeight: 700,
  letterSpacing: "-0.045em",
  lineHeight: 1.0,
  whiteSpace: "nowrap",
};

// ── Dynamic ground shadow ────────────────────────────────────────────────────
const DynamicShadow: React.FC<{
  cx: number;
  cy: number;
  width: number;
  rotDeg: number;
  baseOpacity: number;
}> = ({ cx, cy, width, rotDeg, baseOpacity }) => {
  const rad        = (rotDeg * Math.PI) / 180;
  const facing     = Math.max(0, Math.cos(rad));
  const widthScale = 0.15 + facing * 0.85;
  const opacity    = Math.pow(facing, 0.9) * baseOpacity;
  const blurPx     = 6 + (1 - facing) * 10;
  const yOffset    = (1 - facing) * 8;
  return (
    <div style={{
      position: "absolute",
      left: cx - width / 2,
      top:  cy + yOffset,
      width,
      height: 46,
      borderRadius: "50%",
      background: "radial-gradient(ellipse at center, rgba(20,22,40,0.30) 0%, rgba(20,22,40,0.12) 42%, rgba(20,22,40,0) 76%)",
      filter: `blur(${blurPx}px)`,
      opacity,
      transform: `scaleX(${widthScale})`,
      transformOrigin: "center center",
      pointerEvents: "none",
      willChange: "transform, opacity, filter",
    }} />
  );
};

const SUFFIX_SHADOW_WIDTH: Record<string, number> = {
  "not smarter.":    480,
  "not autonomous.": 640,
  "inaccurate.":     420,
  "unreliable.":     400,
};

// ── Scene ────────────────────────────────────────────────────────────────────
export const SceneFasterStill: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneOp = interpolate(frame, [0, 18], [0, 1], clamp);
  const contentOp = interpolate(frame, [CONTENT_FADE_START, CONTENT_FADE_END], [1, 0], clamp);

  // ── "Yeah" entry ──────────────────────────────────────────────────────────
  const yeahSp = spring({ frame: frame - YEAH_START, fps,
    config: { stiffness: 220, damping: 20, mass: 0.7 } });
  const yeahOp    = interpolate(yeahSp, [0, 1], [0, 1], clamp);
  const yeahY     = interpolate(yeahSp, [0, 1], [32, 0], clamp);
  const yeahScale = interpolate(yeahSp, [0, 1], [0.88, 1.0], clamp);

  // ── "Faster" entry ────────────────────────────────────────────────────────
  const fasterSp = spring({ frame: frame - FASTER_START, fps,
    config: { stiffness: 180, damping: 20, mass: 0.9 } });
  const fasterOp    = interpolate(fasterSp, [0, 1], [0, 1], clamp);
  const fasterScale = interpolate(fasterSp, [0, 1], [0.88, 1.0], clamp);
  const fasterY     = interpolate(fasterSp, [0, 1], [36, 0], clamp);

  // ── Scene camera zoom-in (pure centered scale, nothing moves) ────────────
  // Whole scene scales up from canvas center. No translation. Everything stays
  // in its canvas position; just becomes larger.
  const SCENE_ZOOM_START = QUAL_START - 4;
  const SCENE_MAX_ZOOM   = 1.5;

  const sceneZoomInSp = spring({ frame: frame - SCENE_ZOOM_START, fps,
    config: { stiffness: 80, damping: 22, mass: 1.2 } });

  // No de-zoom: once we hit max zoom, stay there.
  const sceneP = interpolate(sceneZoomInSp, [0, 1], [0, 1], clamp);
  const sceneZoomScale = interpolate(sceneP, [0, 1], [1, SCENE_MAX_ZOOM]);

  // ── Qualifier word-by-word from below; stays visible (no exit fade) ──────
  const qualifierWordStates = QUAL_WORDS.map((word, i) => {
    const sp = spring({ frame: frame - (QUAL_START + i * QUAL_WORD_STAGGER), fps,
      config: { stiffness: 220, damping: 18, mass: 0.7 } });
    const op = interpolate(sp, [0, 1], [0, 1], clamp);
    const ty = interpolate(sp, [0, 1], [28, 0], clamp);
    return { word, op, ty };
  });

  // ── Hero fade out ──────────────────────────────────────────────────────────
  const heroBlockOp = interpolate(frame,
    [HERO_HOLD_UNTIL, HERO_HOLD_UNTIL + HERO_FADE_OUT], [1, 0], clamp);
  const heroVisible = heroBlockOp > 0.001;

  // ── "Still" entry ──────────────────────────────────────────────────────────
  const stillSp = spring({ frame: frame - STILL_APPEAR_AT, fps,
    config: { stiffness: 220, damping: 22, mass: 0.65 } });
  const stillOp    = interpolate(stillSp, [0, 1], [0, 1], clamp);
  const stillShift = interpolate(stillSp, [0, 1], [18, 0], clamp);
  const stillVisible = frame >= STILL_APPEAR_AT - 2;

  // ── Suffix flip cycles ────────────────────────────────────────────────────
  const suffixStates = SUFFIXES.map((text, i) => {
    const inStart  = FIRST_SUFFIX_IN + i * SUFFIX_CYCLE;
    const outStart = i < SUFFIXES.length - 1
      ? FIRST_SUFFIX_IN + (i + 1) * SUFFIX_CYCLE - SUFFIX_OVERLAP
      : Infinity;

    const inSp = spring({ frame: frame - inStart, fps,
      config: { stiffness: 210, damping: 13, mass: 0.9 } });
    const rotIn = interpolate(inSp, [0, 1], [-100, 0]);

    let rotOut = 0;
    if (frame >= outStart) {
      const outSp = spring({ frame: frame - outStart, fps,
        config: { stiffness: 200, damping: 20, mass: 0.8 } });
      rotOut = outSp * 100;
    }

    const rotX     = rotIn + rotOut;
    const facing   = Math.max(0, Math.cos((rotX * Math.PI) / 180));
    const opacity  = Math.pow(facing, 0.85);
    return { text, rotX, opacity, visible: opacity > 0.002 };
  });

  // ── Shadow layout ──────────────────────────────────────────────────────────
  const STILL_W       = 220;
  const SUFFIX_SLOT_W = 620;
  const LINE_TOTAL_W  = STILL_W + STILL_SUFFIX_GAP + SUFFIX_SLOT_W;
  const LINE_LEFT     = CENTER_X - LINE_TOTAL_W / 2;
  const STILL_CX      = LINE_LEFT + STILL_W / 2;
  const SUFFIX_LEFT   = LINE_LEFT + STILL_W + STILL_SUFFIX_GAP;
  const suffixCx = (text: string) =>
    SUFFIX_LEFT + (SUFFIX_SHADOW_WIDTH[text] ?? 500) / 2;

  return (
    <AbsoluteFill style={{ backgroundColor: PAPER_BG, opacity: sceneOp }}>
      <div style={{ position: "absolute", inset: 0, opacity: contentOp, willChange: "opacity" }}>

        {/* Shadows */}
        {stillOp > 0.003 && (
          <DynamicShadow cx={STILL_CX + stillShift} cy={GROUND_Y}
            width={STILL_W + 40} rotDeg={0} baseOpacity={stillOp * 0.55} />
        )}
        {suffixStates.map((s, i) => {
          if (!s.visible) return null;
          const w = SUFFIX_SHADOW_WIDTH[s.text] ?? 500;
          return (
            <DynamicShadow key={`sh${i}`}
              cx={suffixCx(s.text) + stillShift} cy={GROUND_Y}
              width={w + 40} rotDeg={s.rotX} baseOpacity={0.60 * stillOp} />
          );
        })}

        {/* Perspective stage — camera zoom toward qualifier when it appears */}
        <div style={{
          position: "absolute", left: 0, top: 0,
          width: 1920, height: 1080,
          perspective: `${PERSPECTIVE}px`,
          transform: `scale(${sceneZoomScale})`,
          transformOrigin: `${CENTER_X}px ${CENTER_Y}px`,
          willChange: "transform",
        }}>

          {/* ── Hero: "Faster" exactly at canvas center; Yeah + qualifier flank it ── */}
          {heroVisible && (
            <>
              {/* "Faster" — pinned to exact canvas center */}
              <div style={{
                position: "absolute", left: CENTER_X, top: CENTER_Y,
                transform: `translate(-50%, -50%) translateY(${fasterY}px) scale(${fasterScale})`,
                opacity: heroBlockOp * fasterOp,
                fontFamily: interFont, fontSize: FASTER_SIZE, fontWeight: 900,
                letterSpacing: "-0.045em", lineHeight: 1.0, color: FASTER_COLOR,
                whiteSpace: "nowrap",
                willChange: "transform, opacity",
              }}>
                Faster
              </div>

              {/* "Yeah" — right edge flush against Faster's left, baseline-aligned
                  right = 1920 − (CENTER_X − FASTER_HALF_W − 18) = 1203
                  top   = CENTER_Y − 16  (so baseline ≈ CENTER_Y + 48, same as Faster) */}
              <div style={{
                position: "absolute",
                right: 1920 - (CENTER_X - FASTER_HALF_W - 18),
                top: CENTER_Y - 16,
                transform: `translateY(${yeahY}px) scale(${yeahScale})`,
                opacity: heroBlockOp * yeahOp,
                fontFamily: interFont, fontSize: YEAH_SIZE, fontWeight: 900,
                letterSpacing: "-0.04em", lineHeight: 1.0, color: YEAH_COLOR,
                whiteSpace: "nowrap",
                willChange: "transform, opacity",
              }}>
                Yeah
              </div>

              {/* Qualifier — left edge flush against Faster's right, no own transform */}
              <div style={{
                position: "absolute",
                left: CENTER_X + FASTER_HALF_W + 10,
                top: CENTER_Y + 21,
                display: "flex", alignItems: "baseline", gap: 6,
                whiteSpace: "nowrap",
                opacity: heroBlockOp,
                pointerEvents: "none",
              }}>
                {qualifierWordStates.map((s, i) => (
                  <span key={i} style={{
                    display: "inline-block",
                    fontFamily: interFont, fontSize: QUAL_SIZE, fontWeight: 500,
                    letterSpacing: "-0.03em", lineHeight: 1.0, color: QUAL_COLOR,
                    opacity: s.op, transform: `translateY(${s.ty}px)`,
                    willChange: "transform, opacity",
                  }}>
                    {s.word}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* ── "Still <suffix>" ── */}
          {stillVisible && (
            <div style={{
              position: "absolute", left: CENTER_X, top: CENTER_Y,
              transform: `translate(-50%, -50%) translateX(${stillShift}px)`,
              opacity: stillOp,
              display: "flex", alignItems: "center", justifyContent: "center",
              whiteSpace: "nowrap",
            }}>
              <div style={{ ...baseText, color: STILL_COLOR }}>Still</div>

              <div style={{
                position: "relative",
                marginLeft: STILL_SUFFIX_GAP,
                perspective: `${PERSPECTIVE}px`,
                minWidth: 620,
                height: LINE_SIZE + 6,
              }}>
                {suffixStates.map((s, i) => {
                  if (!s.visible) return null;
                  const absRot    = Math.abs(s.rotX);
                  const zPush     = interpolate(absRot, [0, 90], [0, -220], clamp);
                  const flipScale = interpolate(absRot, [0, 90], [1, 0.90], clamp);
                  const shadowOp  = interpolate(absRot, [0, 45, 90], [0.55, 0.35, 0], clamp);
                  return (
                    <div key={i} style={{
                      position: "absolute", left: 0, top: "50%",
                      opacity: s.opacity,
                      transform:
                        `translateY(-50%) translateZ(${zPush}px) ` +
                        `rotateX(${s.rotX}deg) scale(${flipScale})`,
                      transformOrigin: "center center",
                      transformStyle: "preserve-3d",
                      backfaceVisibility: "hidden",
                      willChange: "transform, opacity",
                      filter: `drop-shadow(0 10px 18px rgba(20,22,40,${shadowOp * 0.28}))`,
                    }}>
                      <div style={{ ...baseText, color: SUFFIX_COLOR }}>{s.text}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
