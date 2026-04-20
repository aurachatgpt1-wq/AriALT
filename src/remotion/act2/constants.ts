import { loadFont as loadGeist } from "@remotion/google-fonts/Inter";
export const { fontFamily: geistFont } = loadGeist();

export const FPS = 30;

// Scene durations
export const SCENE_1_START    = 0;
export const SCENE_1_DURATION = 90;   // 3s  – AriA blob intro

// SceneAreas — areas spotlight → sectors orbit → merge → tagline → blob transition
export const SCENE_AREAS_START    = 90;
export const SCENE_AREAS_DURATION = 505;  // ~17s – areas + sectors orbit + merge + taglines + transition (trimmed tail)

// SceneAgentCMMS — its entire content has been redistributed:
//   - alarm cards + flip + typing + predictive insight  → dashboard interstitial
//   - What-If Analysis                                    → what-if interstitial
// Nothing remains to play in its original slot, so the scene is no longer
// mounted in Act2Composition. Start kept for historical reference only.
export const SCENE_AGENT_CMMS_START    = 595;
export const SCENE_AGENT_CMMS_DURATION = 0;      // no longer rendered here

// SceneWorkOrderExec — plays right after SceneAreas (Kanban no longer
// mounted here; it has moved to between BlobHold Seq 3 and Seq 4).
export const SCENE_WO_EXEC_START    = 595;
export const SCENE_WO_EXEC_DURATION = 230;  // ~7.7s

// SceneBlobHold — split into FOUR mounted chunks. Three interstitials
// (dashboard / what-if / Kanban) slot between them:
//   Part 1  = SCENE_BUFFER + Seq 0 (Faster repairs / 46% less / Up to 38%)          190f
//   [Dashboard interstitial — 511f]
//   Part 2a = Seq 1 (+40% increase / Reduction in equipment lifecycle costs)         120f
//   [What-If interstitial — 140f]
//   Part 2b = Seq 2 + Seq 3 (Up to 50% / Less waste / Autonomous tasks / ...)        312f
//   [Kanban interstitial — 350f]
//   Part 2c = Seq 4 + final buffer (Every optimization / cost savings / Low / High)  204f
export const SCENE_BLOB_HOLD_PART1_START    = 825;
export const SCENE_BLOB_HOLD_PART1_DURATION = 190;  // through end of "Up to 38% lower operating costs"

// Dashboard interstitial — plays SceneAgentCMMS scene-local frames 5→486
// (alarm cards intro → panel flip → banner → description + root cause + RP
// typing → predictive insight zoom), then FREEZES at scene-local frame 485
// for 30f (~1s) so the graph is visible + readable.
export const SCENE_DASHBOARD_INTERSTITIAL_START      = 1015;
export const SCENE_DASHBOARD_INTERSTITIAL_PLAY_DUR   = 481;  // play 5..486
export const SCENE_DASHBOARD_INTERSTITIAL_FREEZE_DUR = 30;   // 1s hold on graph
export const SCENE_DASHBOARD_INTERSTITIAL_FREEZE_AT  = 485;
export const SCENE_DASHBOARD_INTERSTITIAL_DURATION   =
  SCENE_DASHBOARD_INTERSTITIAL_PLAY_DUR + SCENE_DASHBOARD_INTERSTITIAL_FREEZE_DUR; // 511

// BlobHold Part 2a — Seq 1: "+40% increase in equipment lifespan" +
// "Reduction in equipment lifecycle costs". Blob-local frames 190..310.
export const SCENE_BLOB_HOLD_PART2A_START    = 1526;
export const SCENE_BLOB_HOLD_PART2A_DURATION = 120;

// What-If interstitial — plays SceneAgentCMMS scene-local frames 486..626.
export const SCENE_WHATIF_INTERSTITIAL_START    = 1646;
export const SCENE_WHATIF_INTERSTITIAL_OFFSET   = 486;
export const SCENE_WHATIF_INTERSTITIAL_DURATION = 140;

// BlobHold Part 2b — Seq 2 + Seq 3. Blob-local frames 310..622.
// Ends RIGHT AFTER "Reduction in staff costs" (Seq 3's last phrase fades out
// by Blob-local 622) so the Kanban interstitial lands on clean light bg.
export const SCENE_BLOB_HOLD_PART2B_START    = 1786;
export const SCENE_BLOB_HOLD_PART2B_DURATION = 312;

// Kanban interstitial — the full SceneKanbanRouting (agent stages, cards
// pouring in column-by-column, ROUTED, 3 flights between columns), mounted
// BETWEEN BlobHold Seq 3 and Seq 4 (so it plays right after "Reduction in
// staff costs" and immediately before "Every optimization...").
export const SCENE_KANBAN_START    = 2098;
export const SCENE_KANBAN_DURATION = 350;  // ~11.7s

// BlobHold Part 2c — Seq 4 + final buffer. Blob-local frames 622..826.
export const SCENE_BLOB_HOLD_PART2C_START    = 2448;
export const SCENE_BLOB_HOLD_PART2C_DURATION = 204;

export const SCENE_FORM_START    = 2652;
export const SCENE_FORM_DURATION = 1320;

export const SCENE_2_START    = 3972;
export const SCENE_2_DURATION = 180;

export const SCENE_3_START    = 4152;
export const SCENE_3_DURATION = 180;

export const SCENE_4_START    = 4332;
export const SCENE_4_DURATION = 210;

export const SCENE_5_START    = 4542;
export const SCENE_5_DURATION = 150;

export const SCENE_6_START    = 4692;
export const SCENE_6_DURATION = 150;

export const TOTAL_FRAMES_2   = 4842; // ~161.4s

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
