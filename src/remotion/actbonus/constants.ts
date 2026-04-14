import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
export const { fontFamily: interFont } = loadInter();

export const FPS = 30;

// ─── Scene durations ────────────────────────────────────────────────────────
export const S1_DURATION       = 210;  // ChatGPT — 7s
export const S2_DURATION       = 450;  // CopyPaste — 15s
export const S3_DURATION       = 270;  // ThreeProblems — 9s
export const S_FASTER_DURATION = 270;  // FasterStill — 9s
export const S4_DURATION       = 270;  // SceneBridge — 9s

// ─── Transitions ────────────────────────────────────────────────────────────
export const T1       = 15;  // S1 → S2
export const T2       = 20;  // S2 → S3
export const T_FASTER = 20;  // S3 → FasterStill
export const T3       = 20;  // FasterStill → S4

// Total = 210+450+270+270+270 - (15+20+20+20) = 1395
export const TOTAL_FRAMES_BONUS = 1395;
