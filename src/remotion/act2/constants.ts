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
export const SCENE_WO_EXEC_DURATION = 270;  // cinema redesign (~9s)

// SceneBlobHold — split into FOUR mounted chunks. Three interstitials
// (dashboard / what-if / Kanban) slot between them:
//   Part 1  = SCENE_BUFFER + Seq 0 (Faster repairs / 46% less / Up to 38%)          190f
//   [Dashboard interstitial — 511f]
//   Part 2a = Seq 1 (+40% increase / Reduction in equipment lifecycle costs)         120f
//   [What-If interstitial — 140f]
//   Part 2b = Seq 2 + Seq 3 (Up to 50% / Less waste / Autonomous tasks / ...)        312f
//   [Kanban interstitial — 350f]
//   Part 2c = Seq 4 + final buffer (Every optimization / cost savings / Low / High)  204f
export const SCENE_BLOB_HOLD_PART1_START    = 865;
export const SCENE_BLOB_HOLD_PART1_DURATION = 190;

export const SCENE_DASHBOARD_INTERSTITIAL_START      = 1055;
export const SCENE_DASHBOARD_INTERSTITIAL_PLAY_DUR   = 481;
export const SCENE_DASHBOARD_INTERSTITIAL_FREEZE_DUR = 30;
export const SCENE_DASHBOARD_INTERSTITIAL_FREEZE_AT  = 485;
export const SCENE_DASHBOARD_INTERSTITIAL_DURATION   =
  SCENE_DASHBOARD_INTERSTITIAL_PLAY_DUR + SCENE_DASHBOARD_INTERSTITIAL_FREEZE_DUR;

export const SCENE_BLOB_HOLD_PART2A_START    = 1566;
export const SCENE_BLOB_HOLD_PART2A_DURATION = 120;

export const SCENE_WHATIF_INTERSTITIAL_START    = 1686;
export const SCENE_WHATIF_INTERSTITIAL_OFFSET   = 486;
export const SCENE_WHATIF_INTERSTITIAL_DURATION = 140;

// BlobHold Part 2b-i — Seq 2 + start of Seq 3 (Blob-local 310..478).
// Plays through "Autonomous task management" full reveal (ends at 1994).
export const SCENE_BLOB_HOLD_PART2B_START    = 1826;
export const SCENE_BLOB_HOLD_PART2B_DURATION = 168;

// SceneKanbanFlow — standalone scene: WO-2848 detail card materializes,
// tilts into 3D perspective, then "and execution" overlays above. NOTHING
// else (no full kanban board, no route flights — those live in SceneKanbanRouting).
export const SCENE_KANBAN_FLOW_START    = 1994;
export const SCENE_KANBAN_FLOW_DURATION = 180;

// BlobHold Part 2b-ii — picks back up at "means" + "Reduction in staff costs"
// (Blob-local 526..622). The skipped "and execution" beat (478..526) is now
// owned by SceneKanbanFlow.
export const SCENE_BLOB_HOLD_PART2B2_START    = 2174;
export const SCENE_BLOB_HOLD_PART2B2_DURATION = 96;
export const SCENE_BLOB_HOLD_PART2B2_OFFSET   = 526;  // skip "and execution"

// SceneKanbanRouting — original interactive kanban (cards burst into columns,
// ROUTED flash, 3 sequential flights, settle). Restored to its native timing.
export const SCENE_KANBAN_START    = 2270;
export const SCENE_KANBAN_DURATION = 350;

// BlobHold Part 2c — closing zoom sequence (Blob-local 622..785).
export const SCENE_BLOB_HOLD_PART2C_START    = 2620;
export const SCENE_BLOB_HOLD_PART2C_DURATION = 163;

export const SCENE_FORM_START    = 2783;
export const SCENE_FORM_DURATION = 1320;

export const SCENE_2_START    = 4103;
export const SCENE_2_DURATION = 180;

export const SCENE_3_START    = 4283;
export const SCENE_3_DURATION = 180;

export const SCENE_4_START    = 4463;
export const SCENE_4_DURATION = 210;

export const SCENE_5_START    = 4673;
export const SCENE_5_DURATION = 150;

export const SCENE_6_START    = 4823;
export const SCENE_6_DURATION = 150;

export const TOTAL_FRAMES_2   = 4973; // ~165.8s

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
