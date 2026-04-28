import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
export const { fontFamily: interFont } = loadInter();

export const FPS = 30;

// Scene structure — single scene of ~12s with final zoom-into-letter at the end
export const SCENE_CLICK_DURATION = 280; // ~9.3s
export const TOTAL_FRAMES_CLICK   = SCENE_CLICK_DURATION;

// Brand colors
export const ARIA_BLUE = "#3B5BDB";
export const INK       = "#0A0A0A";
export const PAPER     = "#FAFAFA";
