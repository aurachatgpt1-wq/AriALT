// ─────────────────────────────────────────────────────────────────────────────
// Cinema camera vocabulary — 6 reusable movements for Act 2 dashboard scenes.
// Each helper takes the current frame + a window (start/duration) and returns
// raw numbers (scale, translate, rotate, blur, opacity) so the caller can
// compose them into CSS transform strings or style objects.
//
// Reference style: Heygrow elegance + Lovable rapid cuts.
// ─────────────────────────────────────────────────────────────────────────────

import { spring } from "remotion";

export const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v));

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
const easeOutExpo  = (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export interface Window {
  frame: number;
  start: number;
  duration: number;
}

const localT = (w: Window): number =>
  clamp((w.frame - w.start) / w.duration, 0, 1);

// 1. PUSH-IN — camera advances toward subject. Use for emphasis.
export const pushIn = (
  w: Window,
  opts: { fromScale?: number; toScale?: number; ease?: "cubic" | "expo" } = {}
): number => {
  const { fromScale = 1, toScale = 1.8, ease = "cubic" } = opts;
  const t = localT(w);
  const eased = ease === "expo" ? easeOutExpo(t) : easeOutCubic(t);
  return fromScale + (toScale - fromScale) * eased;
};

// 2. PULL-BACK — dramatic zoom-out with spring overshoot.
export const pullBack = (
  w: Window,
  opts: { fps: number; fromScale?: number; toScale?: number }
): number => {
  const { fps, fromScale = 2, toScale = 0.85 } = opts;
  const s = spring({
    frame: w.frame - w.start,
    fps,
    config: { damping: 14, mass: 0.9, stiffness: 110 },
    durationInFrames: w.duration,
  });
  return fromScale + (toScale - fromScale) * s;
};

// 3. LATERAL DOLLY — horizontal translation in pixels.
export const lateralDolly = (
  w: Window,
  opts: { distance?: number } = {}
): number => {
  const { distance = 40 } = opts;
  return distance * easeOutCubic(localT(w));
};

// 4. TILT REVEAL — card arrives in 3D perspective.
export interface TiltState {
  rotateX: number;
  scale:   number;
  translateY: number;
  opacity: number;
}
export const tiltReveal = (
  w: Window,
  opts: { fromRotateX?: number; fromScale?: number; fromY?: number } = {}
): TiltState => {
  const { fromRotateX = 25, fromScale = 0.7, fromY = 80 } = opts;
  const t = localT(w);
  const eased = easeOutCubic(t);
  return {
    rotateX:    fromRotateX * (1 - eased),
    scale:      fromScale + (1 - fromScale) * eased,
    translateY: fromY * (1 - eased),
    opacity:    clamp(eased * 1.3, 0, 1),
  };
};

// 5. FOCUS PULL — background blur ramps in/out.
export const focusPull = (
  w: Window,
  opts: { maxBlur?: number; direction?: "in" | "out" } = {}
): number => {
  const { maxBlur = 4, direction = "in" } = opts;
  const t = localT(w);
  const eased = easeOutCubic(t);
  return direction === "in" ? maxBlur * eased : maxBlur * (1 - eased);
};

// 6. HARD CUT + FLASH — returns flash opacity (0 or 1).
// Use as overlay <AbsoluteFill backgroundColor="white" opacity={flashCut(...)} />
export const flashCut = (
  frame: number,
  at: number,
  opts: { duration?: number } = {}
): number => {
  const { duration = 2 } = opts;
  return frame >= at && frame < at + duration ? 1 : 0;
};

// ─── Helpers for composing camera moves ────────────────────────────────────

// Combine multiple transforms into one CSS string (order matters).
export interface Transform {
  translateX?: number;
  translateY?: number;
  scale?:      number;
  rotateX?:    number;
  rotateY?:    number;
  rotateZ?:    number;
}
export const cssTransform = (t: Transform): string => {
  const parts: string[] = [];
  if (t.translateX !== undefined || t.translateY !== undefined) {
    parts.push(`translate(${t.translateX ?? 0}px, ${t.translateY ?? 0}px)`);
  }
  if (t.scale !== undefined)   parts.push(`scale(${t.scale})`);
  if (t.rotateX !== undefined) parts.push(`rotateX(${t.rotateX}deg)`);
  if (t.rotateY !== undefined) parts.push(`rotateY(${t.rotateY}deg)`);
  if (t.rotateZ !== undefined) parts.push(`rotateZ(${t.rotateZ}deg)`);
  return parts.join(" ");
};

// Per-char/per-word stagger time. Returns t in [0,1] for item `i`.
export const staggerT = (
  frame: number,
  start: number,
  duration: number,
  index: number,
  stride: number
): number => {
  const itemStart = start + index * stride;
  return clamp((frame - itemStart) / duration, 0, 1);
};
