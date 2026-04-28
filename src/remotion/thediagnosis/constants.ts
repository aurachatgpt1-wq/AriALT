import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
export const { fontFamily: interFont } = loadInter();

export const FPS = 30;

// Scene timeline (30 fps)
// ── Phase 1: Analyzing          0-150  (5.0s)
// ── Phase 2: Issue Found      150-330  (6.0s)
// ── Phase 3: Solution Ready   330-600  (9.0s)
export const SCENE_DIAGNOSIS_DURATION = 510; // 17s
export const SCENE_HMI_DURATION       = 180; // 6s
export const TOTAL_FRAMES_DIAGNOSIS   = SCENE_DIAGNOSIS_DURATION;

// Brand colors (match reference screenshots)
export const BLUE    = "#0A84FF";
export const ORANGE  = "#F5A623";
export const GREEN   = "#34C759";
export const RED     = "#FF3B30";
export const WHITE   = "#FFFFFF";
export const MUTED   = "rgba(255,255,255,0.55)";
export const DIM     = "rgba(255,255,255,0.28)";
