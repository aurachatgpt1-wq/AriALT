import { loadFont as loadGeist } from "@remotion/google-fonts/Inter";
export const { fontFamily: geistFont } = loadGeist();

export const FPS = 30;

// Scene durations
export const SCENE_1_START    = 0;
export const SCENE_1_DURATION = 90;   // 3s  – AriA blob intro

// SceneAreas — areas spotlight → sectors orbit → merge → tagline → blob transition
export const SCENE_AREAS_START    = 90;
export const SCENE_AREAS_DURATION = 520;  // ~17s – areas + sectors orbit + merge + taglines + transition

export const SCENE_FORM_START    = 610;
export const SCENE_FORM_DURATION = 1320; // ~44s – Profile form (6 questions + regulatory analyzing phase)

export const SCENE_2_START    = 1930;
export const SCENE_2_DURATION = 180;  // 6s  – Wizard: Hero (slower reading time)

export const SCENE_3_START    = 2110;
export const SCENE_3_DURATION = 180;  // 6s  – Wizard: Create Plant (step 1)

export const SCENE_4_START    = 2290;
export const SCENE_4_DURATION = 210;  // 7s  – Wizard: Upload docs (step 2)

export const SCENE_5_START    = 2500;
export const SCENE_5_DURATION = 150;  // 5s  – Wizard: AI Agents (step 3)

export const SCENE_6_START    = 2650;
export const SCENE_6_DURATION = 150;  // 5s  – Wizard: Complete (step 4)

export const TOTAL_FRAMES_2   = 2800; // ~93s

// AriA Design Tokens (exact from real software)
export const ARIA_COLORS = {
  // Backgrounds
  background:        "#F3F4F7",
  cardBg:            "rgba(255,255,255,0.85)",
  cardBorder:        "rgba(214,217,227,0.6)",
  sidebarBg:         "rgba(255,255,255,0.92)",
  sidebarBorder:     "rgba(214,217,227,0.4)",

  // Text
  foreground:        "#1A1F33",
  mutedFg:           "#767E8C",
  labelFg:           "#9AA0B0",

  // Primary
  primary:           "#3B5BDB",
  primaryLight:      "rgba(59,91,219,0.1)",
  primaryBorder:     "rgba(59,91,219,0.3)",

  // Status
  success:           "#1FA870",
  successMuted:      "#E8F6F1",
  successBorder:     "#A7DFC8",
  warning:           "#E8830A",
  warningMuted:      "#FFF4E5",
  warningBorder:     "#FBBF69",
  critical:          "#DC2626",
  criticalMuted:     "#FDF1F1",
  criticalBorder:    "#FBBFBF",

  // AI Panel
  aiPanelBg:         "rgba(59,91,219,0.04)",
  aiPanelBorder:     "#3B5BDB",

  // Dark (logo scene)
  dark:              "#0F1219",
  darkCard:          "rgba(26,31,51,0.8)",
};

export const ARIA_SHADOWS = {
  card:   "0 2px 8px -2px rgba(102,112,153,0.08), 0 4px 16px -4px rgba(102,112,153,0.05)",
  panel:  "0 4px 24px -4px rgba(59,91,219,0.15)",
  mobile: "0 8px 40px -8px rgba(0,0,0,0.18)",
};

export const ARIA_RADIUS = {
  sm:   "8px",
  md:   "10px",
  lg:   "12px",
  xl:   "16px",
  full: "9999px",
};

// Sidebar items
export const SIDEBAR_WIDTH = 220;

// Mobile dimensions (iPhone proportions inside video)
export const MOBILE_WIDTH  = 280;
export const MOBILE_HEIGHT = 560;
