import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { interFont } from "../constants";

/* ─── SceneFasterStill — two-phase hero + suffix flip card ──────────────
 *  Light paper stage. Two-phase hero sequence:
 *
 *  PHASE 1 — "Faster" enters MONUMENTAL, centered. Spring scale-up + fade.
 *  PHASE 2 — "But nothing really changes." enters BELOW "Faster",
 *            word-by-word rising from underneath.
 *  PHASE 3 — Whole hero block crossfades out.
 *  PHASE 4 — "Still <suffix>" flip card takes over.
 *            "Still" is fixed (never flips); only the suffix flips around
 *            its own horizontal axis. Suffix cycles:
 *        not smarter. → not autonomous. → inaccurate. → unreliable.
 * ─────────────────────────────────────────────────────────────────────── */

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ── Content ─────────────────────────────────────────────────────────────────
// The qualifier sentence is revealed word-by-word under "Faster".
const QUAL_WORDS = ["But", "nothing", "really", "changes."];

const SUFFIXES = [
  "not smarter.",
  "not autonomous.",
  "inaccurate.",
  "unreliable.",
];

// ── Palette (light paper preset) ────────────────────────────────────────────
const PAPER_BG     = "#FAF6EC";   // warm cream — makes the cool glow pop
const FASTER_COLOR = "#0A0B10";   // near-black hero ink
const QUAL_COLOR   = "#8A8F99";   // muted qualifier
const STILL_COLOR  = "#1D1D1F";
const SUFFIX_COLOR = "#1D1D1F";

// ── Typography ──────────────────────────────────────────────────────────────
const LINE_SIZE    = 84;          // qualifier + still + suffix
const FASTER_SIZE  = 260;         // monumental hero word

// ── Timing ──────────────────────────────────────────────────────────────────
// Phase 1 — "Faster" enters (monumental, spring scale-up)
const FASTER_START        = 0;
// Phase 2 — Qualifier word-by-word reveal
const QUAL_START          = 38;   // first word after Faster has held a moment
const QUAL_WORD_STAGGER   = 6;    // frames between qualifier words
// Phase 3 — Hero block crossfade out
const HERO_HOLD_UNTIL     = 80;   // hero block stays visible until here
const HERO_FADE_OUT       = 14;   // crossfade out duration

const FIRST_SUFFIX_IN  = HERO_HOLD_UNTIL + HERO_FADE_OUT;       // 94 (kept)
const SUFFIX_CYCLE     = 32;      // tighter cycle so the last suffix enters
                                  // early enough to fade out before the
                                  // scene-level transition starts (240)
const SUFFIX_OVERLAP   = 6;       // frames of overlap between old → new during handoff

// ── Content fade-out (before the crossfade to SceneBridge) ──────────────────
// The TransitionSeries crossfade overlaps the last 30 frames of this scene
// with the first 30 of SceneBridge. If the text is still visible in that
// window, both scenes' texts ghost through each other. To avoid that, we
// fade the content to 0 before frame 240, leaving only the cream background
// for the actual crossfade.
const CONTENT_FADE_START = 214;
const CONTENT_FADE_END   = 240;

// Note: no internal fade-out constants — the TransitionSeries fade handles
// the crossfade to the next scene. Keeping a second fade here caused a
// "double fade" feel and interacted badly with the slide transition.

// ── Layout ──────────────────────────────────────────────────────────────────
const CENTER_X  = 960;
const CENTER_Y  = 540;
const PERSPECTIVE = 1400;

// Gap between "Still" and the suffix
const STILL_SUFFIX_GAP = 26;

// ── Shared text styles ──────────────────────────────────────────────────────
const baseText: React.CSSProperties = {
  fontFamily: interFont,
  fontSize: LINE_SIZE,
  fontWeight: 700,
  letterSpacing: "-0.045em",
  lineHeight: 1.0,
  whiteSpace: "nowrap",
};

// ── Dynamic ground shadow ──────────────────────────────────────────────────
// Each text element casts its own shadow on the floor. The shadow is a soft
// elliptical blur that *physically* reacts to the text's rotation angle:
//   • widthScale  → cos(angle)   (shadow flattens as card edges on)
//   • opacity     → cos(angle)   (shadow fades as card loses facing surface)
//   • blur        → grows with   (card moves away from the ground → softer)
//   • yOffset     → grows with   (parallax / subtle ground-bounce feel)
// This gives the strong sense that the shadow belongs to the flipping text,
// not that it's a detached static element.
const DynamicShadow: React.FC<{
  cx: number;
  cy: number;
  width: number;
  rotDeg: number;
  baseOpacity: number;
}> = ({ cx, cy, width, rotDeg, baseOpacity }) => {
  const rad    = (rotDeg * Math.PI) / 180;
  const facing = Math.max(0, Math.cos(rad));

  // Width compresses toward a thin line as the card tilts; clamp to 0.15
  // so a hint of shadow remains even at steep angles.
  const widthScale = 0.15 + facing * 0.85;
  // Opacity follows facing (slight power curve for a softer fall-off)
  const opacity    = Math.pow(facing, 0.9) * baseOpacity;
  // More blur + push further down as the card tilts → feels like the
  // source is leaving the ground.
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

// Approximate visual widths of the suffixes at LINE_SIZE 84 / Inter 700 —
// used only to size each suffix's own shadow so it matches the word width.
const SUFFIX_SHADOW_WIDTH: Record<string, number> = {
  "not smarter.":    480,
  "not autonomous.": 640,
  "inaccurate.":     420,
  "unreliable.":     400,
};

// Ground plane Y — all shadows sit on this horizontal plane
const GROUND_Y = CENTER_Y + 150;

// ── Scene ───────────────────────────────────────────────────────────────────
export const SceneFasterStill: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Global fade-in only. The out-fade of the CREAM BACKGROUND is handled
  // by the TransitionSeries crossfade to SceneBridge.
  const sceneOp = interpolate(frame, [0, 18], [0, 1], clamp);

  // Content (hero + still + suffix + shadows) fades OUT before the
  // transition so that only the cream background participates in the
  // cross-dissolve — avoiding a ghosted text overlap with SceneBridge.
  const contentOp = interpolate(
    frame,
    [CONTENT_FADE_START, CONTENT_FADE_END],
    [1, 0],
    clamp,
  );

  // ── PHASE 1 — "Faster" monumental entry ──────────────────────────────────
  // Soft spring: scale 0.88 → 1.0 with fade-in and gentle y-rise. Slow mass
  // so the word feels weighty as it settles.
  const fasterSp = spring({
    frame: frame - FASTER_START,
    fps,
    config: { stiffness: 150, damping: 22, mass: 1.0 },
  });
  const fasterOp    = interpolate(fasterSp, [0, 1], [0, 1], clamp);
  const fasterScale = interpolate(fasterSp, [0, 1], [0.88, 1.0], clamp);
  const fasterY     = interpolate(fasterSp, [0, 1], [28, 0], clamp);

  // ── PHASE 2 — Qualifier word-by-word reveal ──────────────────────────────
  // Each word springs up from below the baseline with a small overshoot.
  const qualifierWordStates = QUAL_WORDS.map((text, i) => {
    const start = QUAL_START + i * QUAL_WORD_STAGGER;
    const sp = spring({
      frame: frame - start,
      fps,
      config: { stiffness: 220, damping: 18, mass: 0.7 },
    });
    const op = interpolate(sp, [0, 1], [0, 1], clamp);
    const y  = interpolate(sp, [0, 1], [32, 0], clamp);
    return { text, op, y };
  });

  // ── PHASE 3 — Hero block crossfade out ───────────────────────────────────
  const heroBlockOp = interpolate(
    frame,
    [HERO_HOLD_UNTIL, HERO_HOLD_UNTIL + HERO_FADE_OUT],
    [1, 0],
    clamp,
  );
  const heroVisible = heroBlockOp > 0.001;

  // ── "Still" word ──────────────────────────────────────────────────────────
  // Appears right after the hero has started flipping out. Never flips.
  const stillAppearAt = HERO_HOLD_UNTIL + HERO_FADE_OUT - 4; // tiny overlap
  const stillSp = spring({
    frame: frame - stillAppearAt,
    fps,
    config: { stiffness: 220, damping: 22, mass: 0.65 },
  });
  const stillOp    = interpolate(stillSp, [0, 1], [0, 1], clamp);
  const stillShift = interpolate(stillSp, [0, 1], [18, 0], clamp);
  const stillVisible = frame >= stillAppearAt - 2;

  // ── Suffix flip cycles ────────────────────────────────────────────────────
  // Each suffix i appears at:
  //   inStart = FIRST_SUFFIX_IN + i * SUFFIX_CYCLE     (spring begins here)
  //   outStart = next inStart − SUFFIX_OVERLAP         (old starts leaving
  //              slightly BEFORE the new one arrives → both rotate at once)
  //
  // Both incoming and outgoing use a physics spring (no linear segments!)
  // so the motion has natural ease-in and ease-out. The incoming has a bit
  // less damping so it overshoots 0° slightly and settles → that's the
  // bounce. Opacity is derived from the COSINE of the rotation angle, like
  // a real flip card: fully visible at 0°, invisible edge-on at ±90°.
  //
  // The rotation axis is HORIZONTAL — the card rotates around its own
  // horizontal axle (like a billboard flipping upward), so the animation
  // reads as a vertical swap.
  const suffixStates = SUFFIXES.map((text, i) => {
    const inStart  = FIRST_SUFFIX_IN + i * SUFFIX_CYCLE;
    const outStart = i < SUFFIXES.length - 1
      ? FIRST_SUFFIX_IN + (i + 1) * SUFFIX_CYCLE - SUFFIX_OVERLAP
      : Infinity; // last suffix stays put until scene fade-out

    // Incoming spring — smooth motion with a small overshoot (the bounce)
    const inSp = spring({
      frame: frame - inStart,
      fps,
      config: { stiffness: 210, damping: 13, mass: 0.9 },
    });
    // Spring 0→1 → rotation -100° → 0° (and naturally overshoots past 0°,
    // giving a visible bounce on the card as it settles).
    const rotIn = interpolate(inSp, [0, 1], [-100, 0]);

    // Outgoing spring — smooth exit toward +100° (past 90° so it's hidden)
    let rotOut = 0;
    if (frame >= outStart) {
      const outSp = spring({
        frame: frame - outStart,
        fps,
        config: { stiffness: 200, damping: 20, mass: 0.8 },
      });
      rotOut = outSp * 100;
    }

    // Total rotation = incoming + outgoing (they never overlap in time so
    // summation is safe; incoming is fully settled by the time outgoing
    // kicks in).
    const rotX = rotIn + rotOut;

    // Cosine-based facing visibility: fully opaque at 0°, fades naturally
    // to 0 as the card turns edge-on. Slight power curve makes the fade
    // feel a touch softer around 45°.
    const angleRad = (rotX * Math.PI) / 180;
    const facing   = Math.max(0, Math.cos(angleRad));
    const opacity  = Math.pow(facing, 0.85);

    const visible = opacity > 0.002;

    return { text, rotX, opacity, visible };
  });

  // ── Shadow horizontal layout ──────────────────────────────────────────────
  // Pre-compute centre-x for each shadow so they align with the text on
  // screen. The "Still <suffix>" line is flex-centred on CENTER_X, so we
  // measure from the middle of the line outward.
  const STILL_W      = 220;                 // approx visual width of "Still"
  const SUFFIX_SLOT_W = 620;                // same value as minWidth below
  const LINE_TOTAL_W = STILL_W + STILL_SUFFIX_GAP + SUFFIX_SLOT_W;
  const LINE_LEFT    = CENTER_X - LINE_TOTAL_W / 2;
  const STILL_CX     = LINE_LEFT + STILL_W / 2;
  const SUFFIX_LEFT  = LINE_LEFT + STILL_W + STILL_SUFFIX_GAP;
  // Each suffix is LEFT-anchored inside its slot (transformOrigin left), so
  // the visual centre of the word is half its width to the right of the slot
  // left edge.
  const suffixCx = (text: string) =>
    SUFFIX_LEFT + (SUFFIX_SHADOW_WIDTH[text] ?? 500) / 2;

  return (
    <AbsoluteFill style={{ backgroundColor: PAPER_BG, opacity: sceneOp }}>
      {/* Everything EXCEPT the cream background fades out via contentOp
          before the crossfade to SceneBridge begins. */}
      <div style={{
        position: "absolute",
        inset: 0,
        opacity: contentOp,
        willChange: "opacity",
      }}>

      {/* ── Dynamic ground shadows ── */}
      {/* Hero shadow intentionally removed: Pattern A (word-by-word reveal)
          keeps the paper background clean. Only the "Still + suffix" line
          casts a shadow below. */}

      {/* "Still" shadow — static (Still never flips) */}
      {stillOp > 0.003 && (
        <DynamicShadow
          cx={STILL_CX + stillShift}
          cy={GROUND_Y}
          width={STILL_W + 40}
          rotDeg={0}
          baseOpacity={stillOp * 0.55}
        />
      )}

      {/* Suffix shadows — one per suffix, each tied to its own rotX so the
          shadow physically breathes with the flip of that word. */}
      {suffixStates.map((s, i) => {
        if (!s.visible) return null;
        const w = SUFFIX_SHADOW_WIDTH[s.text] ?? 500;
        return (
          <DynamicShadow
            key={`sh${i}`}
            cx={suffixCx(s.text) + stillShift}
            cy={GROUND_Y}
            width={w + 40}
            rotDeg={s.rotX}
            baseOpacity={0.60 * stillOp}
          />
        );
      })}

      {/* Perspective stage */}
      <div style={{
        position: "absolute",
        left: 0, top: 0,
        width: 1920, height: 1080,
        perspective: `${PERSPECTIVE}px`,
      }}>

        {/* ─── Hero block: "Faster" monumental + qualifier word-by-word ─── */}
        {heroVisible && (
          <div style={{
            position: "absolute",
            left: CENTER_X,
            top:  CENTER_Y,
            transform: "translate(-50%, -50%)",
            opacity: heroBlockOp,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 44,
            willChange: "opacity",
          }}>
            {/* PHASE 1 — "Faster" monumental */}
            <div style={{
              fontFamily: interFont,
              fontSize: FASTER_SIZE,
              fontWeight: 900,
              letterSpacing: "-0.045em",
              lineHeight: 0.9,
              color: FASTER_COLOR,
              opacity: fasterOp,
              transform: `translateY(${fasterY}px) scale(${fasterScale})`,
              willChange: "transform, opacity",
              whiteSpace: "nowrap",
            }}>
              Faster
            </div>

            {/* PHASE 2 — Qualifier word-by-word below Faster */}
            <div style={{
              display: "flex",
              alignItems: "baseline",
              whiteSpace: "nowrap",
              overflow: "hidden",
              paddingBottom: 8,
            }}>
              {qualifierWordStates.map((s, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    opacity: s.op,
                    transform: `translateY(${s.y}px)`,
                    color: QUAL_COLOR,
                    fontFamily: interFont,
                    fontSize: LINE_SIZE,
                    fontWeight: 500,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.0,
                    marginLeft: i === 0 ? 0 : 18,
                    willChange: "transform, opacity",
                  }}
                >
                  {s.text}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ─── "Still <suffix>" — "Still" is fixed, suffix flips in place ───
           Inline-flex container so both pieces share the same baseline. */}
        {stillVisible && (
          <div style={{
            position: "absolute",
            left: CENTER_X,
            top:  CENTER_Y,
            transform: `translate(-50%, -50%) translateX(${stillShift}px)`,
            opacity: stillOp,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            whiteSpace: "nowrap",
          }}>
            {/* Fixed "Still" */}
            <div style={{ ...baseText, color: STILL_COLOR }}>
              Still
            </div>

            {/* Suffix slot — has its own perspective so the child flip looks
                3D independently of the hero stage */}
            <div style={{
              position: "relative",
              marginLeft: STILL_SUFFIX_GAP,
              perspective: `${PERSPECTIVE}px`,
              // Reserve space for the widest suffix so "Still" never jumps
              minWidth: 620,
              height: LINE_SIZE + 6,
            }}>
              {suffixStates.map((s, i) => {
                if (!s.visible) return null;
                const absRot = Math.abs(s.rotX);
                // Push deeper into the screen as the card tilts away — adds
                // a noticeable depth cue so the eye reads the rotation as
                // real 3D motion rather than a flat scale.
                const zPush     = interpolate(absRot, [0, 90], [0, -220], clamp);
                const flipScale = interpolate(absRot, [0, 90], [1, 0.90], clamp);
                // Shadow strength follows proximity to the camera: strongest
                // at 0° (card facing camera), softer as it tilts away.
                const shadowOp  = interpolate(absRot, [0, 45, 90], [0.55, 0.35, 0], clamp);
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      opacity: s.opacity,
                      transform:
                        `translateY(-50%) ` +
                        `translateZ(${zPush}px) ` +
                        `rotateX(${s.rotX}deg) ` +
                        `scale(${flipScale})`,
                      transformOrigin: "center center",
                      transformStyle: "preserve-3d",
                      backfaceVisibility: "hidden",
                      willChange: "transform, opacity",
                      // Soft drop-shadow that intensifies when the card is
                      // flat toward the camera, giving weight during the
                      // flip.
                      filter: `drop-shadow(0 10px 18px rgba(20,22,40,${shadowOp * 0.28}))`,
                    }}
                  >
                    <div style={{ ...baseText, color: SUFFIX_COLOR }}>
                      {s.text}
                    </div>
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
