import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { interFont } from "../constants";

/* ─── SceneThreeProblems — Apple keynote, bg indipendente dal testo ─────────
 *  Sfondo: layer separato che crossfade solo ai confini di gruppo (ogni 2 frasi).
 *  Testo: ogni frase si dissolve in/out indipendentemente sul bg fermo.
 *  Word-by-word Pattern A con accent handoff.
 * ────────────────────────────────────────────────────────────────────────── */

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ── Apple tokens ─────────────────────────────────────────────────────────────
const APPLE_INK_LIGHT = "#1D1D1F";
const APPLE_INK_DARK  = "#FFFFFF";
const APPLE_PAPER     = "#F8F9FC";
const APPLE_BLACK     = "#0A0B10";

type Scheme = "dark" | "light" | "climax";

interface Item {
  text: string;
  scheme: Scheme;
}

// ── Timing ───────────────────────────────────────────────────────────────────
const PER_ITEM   = 38;  // frames per phrase
const X_FADE     = 8;   // text crossfade overlap
const BG_FADE    = 18;  // bg crossfade at group boundary (longer = smoother)
const ZOOM_START = 215; // smash-zoom begins here
const EXIT_FROM  = 256; // white flood complete — hand off to next scene
const TOTAL      = 270;

// Group 0 (dark): items 0-1, Group 1 (light): items 2-3, Group 2 (climax): item 4
const BOUNDARY_01 = PER_ITEM * 2; // 76 — dark → light
const BOUNDARY_12 = PER_ITEM * 4; // 152 — light → climax

// Grouped items
const ITEMS: Item[] = [
  { text: "Memory resets with every conversation", scheme: "dark"   },
  { text: "Context is generic, not yours",         scheme: "dark"   },
  { text: "Your data stays out of the loop",       scheme: "light"  },
  { text: "No integration with your systems",      scheme: "light"  },
  { text: "You still have to take the action",     scheme: "climax" },
];

// ── Text-only presence (bg is NOT tied to this) ───────────────────────────────
const textPresence = (i: number, frame: number) => {
  const start = i * PER_ITEM;
  const end   = start + PER_ITEM;
  const fadeIn  = interpolate(frame, [start - X_FADE, start], [0, 1], clamp);
  if (i === ITEMS.length - 1) return fadeIn;
  const fadeOut = interpolate(frame, [end - X_FADE, end], [1, 0], clamp);
  return Math.min(fadeIn, fadeOut);
};

// ── Background layer — crossfades only at group boundaries ───────────────────
const BgLayer: React.FC<{ frame: number }> = ({ frame }) => {
  // t01: 0 = full dark, 1 = full light
  const t01 = interpolate(
    frame,
    [BOUNDARY_01 - BG_FADE / 2, BOUNDARY_01 + BG_FADE / 2],
    [0, 1],
    clamp,
  );
  // t12: 0 = full light, 1 = full climax
  const t12 = interpolate(
    frame,
    [BOUNDARY_12 - BG_FADE / 2, BOUNDARY_12 + BG_FADE / 2],
    [0, 1],
    clamp,
  );

  return (
    <>
      {/* Group 0 — dark */}
      <div style={{
        position: "absolute", inset: 0,
        background: APPLE_BLACK,
        opacity: 1 - t01,
      }} />

      {/* Group 1 — light paper */}
      <div style={{
        position: "absolute", inset: 0,
        background: APPLE_PAPER,
        opacity: t01 * (1 - t12),
      }} />

      {/* Group 2 — climax radial dark */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 45%, #1A1C28 0%, #050610 65%)",
        opacity: t12,
      }} />

      {/* Climax accent glow (only visible when t12 > 0) */}
      {t12 > 0.01 && (
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 50%, rgba(91,138,230,0.10) 0%, transparent 55%)",
          opacity: t12,
          pointerEvents: "none",
        }} />
      )}
    </>
  );
};

// ── Word-by-word reveal (Pattern A, accent handoff) ──────────────────────────
const WordsReveal: React.FC<{
  text: string;
  localFrame: number;
  fps: number;
  scheme: Scheme;
}> = ({ text, localFrame, fps, scheme }) => {
  const words = text.split(" ");
  const stagger    = 3;
  const accentHold = 6;
  const accentFade = 8;

  const ink = scheme === "light" ? APPLE_INK_LIGHT : APPLE_INK_DARK;

  // Per-group accent colors
  const accentR = scheme === "light" ? 220 : scheme === "climax" ? 91 : 91;
  const accentG = scheme === "light" ? 38  : scheme === "climax" ? 138 : 138;
  const accentB = scheme === "light" ? 127 : 230;
  const inkR = scheme === "light" ? 29  : 255;
  const inkG = scheme === "light" ? 29  : 255;
  const inkB = scheme === "light" ? 31  : 255;

  const isClimax = scheme === "climax";

  const charCount = text.length;
  const baseSize  = charCount > 32 ? 76 : charCount > 28 ? 84 : 92;
  const fontSize  = isClimax ? Math.min(baseSize + 12, 100) : baseSize;

  return (
    <div style={{
      display: "flex", flexWrap: "nowrap", justifyContent: "center", gap: "0 22px",
      maxWidth: 1800,
    }}>
      {words.map((w, i) => {
        const start = i * stagger;
        const sp = spring({
          frame: localFrame - start,
          fps,
          config: { stiffness: 240, damping: 20, mass: 0.65 },
        });
        const op = interpolate(sp, [0, 1], [0, 1], clamp);
        const ty = interpolate(sp, [0, 1], [22, 0], clamp);

        const accentT = interpolate(
          localFrame - start,
          [accentHold, accentHold + accentFade],
          [1, 0],
          clamp,
        );

        const r = Math.round(accentR * accentT + inkR * (1 - accentT));
        const g = Math.round(accentG * accentT + inkG * (1 - accentT));
        const b = Math.round(accentB * accentT + inkB * (1 - accentT));
        const color = accentT > 0.02 ? `rgb(${r},${g},${b})` : ink;

        const glow = isClimax && accentT > 0.05
          ? `0 0 ${22 * accentT}px rgba(91,138,230,${0.55 * accentT})`
          : "none";

        return (
          <span key={i} style={{
            display: "inline-block",
            opacity: op,
            transform: `translateY(${ty}px)`,
            color,
            textShadow: glow,
            fontFamily: interFont,
            fontSize,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            whiteSpace: "nowrap",
          }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

// ── Card — text + dots only (NO background here) ─────────────────────────────
const Card: React.FC<{
  item: Item;
  index: number;
  frame: number;
  fps: number;
}> = ({ item, index, frame, fps }) => {
  const op = textPresence(index, frame);
  if (op <= 0.001) return null;

  const localFrame = frame - index * PER_ITEM;
  const isLast = index === ITEMS.length - 1;

  // Last item: the zoom is applied directly here so there is only ONE text
  // element on screen during the smash-zoom — no snap between two renderers.
  let textScale = 1;
  let textOp    = 1;
  let dotsOp    = 1;
  if (isLast && frame >= ZOOM_START) {
    const t = interpolate(frame, [ZOOM_START, EXIT_FROM], [0, 1], {
      easing: Easing.in(Easing.cubic),
      ...clamp,
    });
    textScale = interpolate(t, [0, 1], [1, 5], clamp);
    textOp    = interpolate(t, [0.55, 0.85], [1, 0], clamp);
    dotsOp    = interpolate(frame, [ZOOM_START, ZOOM_START + 6], [1, 0], clamp);
  }

  return (
    <AbsoluteFill style={{ opacity: op }}>
      {/* Text — centered; zoom applied inline for last item */}
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0 80px",
        transform: `scale(${textScale})`,
        opacity: textOp,
      }}>
        <WordsReveal text={item.text} localFrame={localFrame} fps={fps} scheme={item.scheme} />
      </div>

      {/* Progress dots */}
      <div style={{
        position: "absolute",
        bottom: 80, left: 0, right: 0,
        display: "flex", justifyContent: "center", gap: 14,
        opacity: dotsOp,
      }}>
        {ITEMS.map((_, dIdx) => {
          const active = dIdx === index;
          const dotColor = item.scheme === "light"
            ? (active ? APPLE_INK_LIGHT : "#D1D5DB")
            : (active ? APPLE_INK_DARK : "#3A3D45");
          return (
            <div key={dIdx} style={{
              width: active ? 28 : 8,
              height: 8,
              borderRadius: 4,
              background: dotColor,
            }} />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── White flood overlay ───────────────────────────────────────────────────────
// The zoom is now handled inside the last Card — this overlay only provides
// the white flood that hands off to SceneFasterStill's background.
const ZoomExitOverlay: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < ZOOM_START) return null;

  const t = interpolate(frame, [ZOOM_START, EXIT_FROM], [0, 1], {
    easing: Easing.in(Easing.cubic),
    ...clamp,
  });

  const whiteOp = interpolate(t, [0.3, 1], [0, 1], {
    easing: Easing.out(Easing.quad),
    ...clamp,
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "#FFFFFF",
        opacity: whiteOp,
      }} />
    </AbsoluteFill>
  );
};

// ── Scene ────────────────────────────────────────────────────────────────────
export const SceneThreeProblems: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* Background — independent layer, changes only at group boundaries */}
      <BgLayer frame={frame} />

      {/* Text cards — dissolve in/out per phrase, bg stays still */}
      {ITEMS.map((item, i) => (
        <Card key={i} item={item} index={i} frame={frame} fps={fps} />
      ))}

      {/* Smash-zoom exit: last phrase grows toward camera → white flood */}
      <ZoomExitOverlay frame={frame} />
    </AbsoluteFill>
  );
};
