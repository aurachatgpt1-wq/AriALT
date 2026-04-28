import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
export const { fontFamily: interFont } = loadInter();

export const FPS = 30;

// ─── SCENE STRUCTURE ─────────────────────────────────────────────────────────
export const SCENE_CAROUSEL_DURATION = 420; // 14s (scene ends just after subtitle fade-out at 13.12s)

export const TOTAL_FRAMES_STANDARDS = SCENE_CAROUSEL_DURATION;

// ─── Standards list ──────────────────────────────────────────────────────────
export const STANDARDS = [
  "GDPR",
  "ISO 27001",
  "ISO 27799",
  "NEN 7510",
  "NIS2",
  "PCI DSS",
  "AICPA SOC",
  "C5",
];
