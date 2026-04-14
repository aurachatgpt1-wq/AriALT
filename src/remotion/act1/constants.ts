import { loadFont } from "@remotion/google-fonts/Roboto";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

// Fonts
export const { fontFamily: robotoFont } = loadFont();
export const { fontFamily: interFont } = loadInter();

// Layout zones (1920x1080)
export const TEXT_ZONE_HEIGHT = 220; // px reserved at bottom for narration
export const UI_TOP = 20;            // px from top where UI starts
export const UI_BOTTOM_MARGIN = TEXT_ZONE_HEIGHT + 10; // px from bottom where UI ends

// Timing (frames @ 30fps)
export const FPS = 30;
export const SCENE_0_START = 0;
export const SCENE_0_DURATION = 90;  // 3s
export const SCENE_1_START = 90;
export const SCENE_1_DURATION = 150; // 5s
export const SCENE_2_START = 240;
export const SCENE_2_DURATION = 240; // 8s
export const SCENE_3B_START = 480;
export const SCENE_3B_DURATION = 240; // 8s — cost of inefficiency
export const SCENE_3_START = 720;
export const SCENE_3_DURATION = 150; // 5s
export const SCENE_3C_START = 870;
export const SCENE_3C_DURATION = 270; // 9s — limits
export const SCENE_4_START = 1140;
export const SCENE_4_DURATION = 150; // 5s
export const TOTAL_FRAMES = 1290; // 43s

// Scene 4 sub-phases
export const FREEZE_DURATION = 45;
export const REWIND_DURATION = 105;

// Spring configs
export const HEAVY_SPRING = { damping: 20, stiffness: 80, mass: 2 };
export const ACCUMULATE_SPRING = { damping: 15, stiffness: 200, mass: 0.8 };
export const FRANTIC_SPRING = { damping: 8, stiffness: 300, mass: 0.5 };
export const REWIND_SPRING = { damping: 12, stiffness: 100, mass: 1 };
export const CURSOR_SPRING = { damping: 18, stiffness: 120, mass: 0.6 };

// Colors
export const COLORS = {
  // Background
  bgLight: "#F0F0F0",
  bgDark: "#1A1A1A",

  // CMMS interface (old grey)
  cmmsBackground: "#D4D4D4",
  cmmsToolbar: "#C0C0C0",
  cmmsBorder: "#999999",
  cmmsText: "#333333",
  cmmsFieldBg: "#FFFFFF",
  cmmsFieldBorder: "#7A7A7A",
  cmmsLabelText: "#555555",
  cmmsSidebarBg: "#E0E0E0",
  cmmsSidebarActive: "#B8B8B8",
  cmmsHeaderBg: "#B0B0B0",

  // Table
  tableHeader: "#B0B0B0",
  tableRowAlt: "#E8E8E8",
  tableRowHover: "#D0D8E0",

  // Excel
  excelGreen: "#217346",
  excelGrid: "#D6DCE4",
  excelHeaderBg: "#E7E6E6",
  excelSelectedCell: "#B4D6A4",

  // Status / Alerts
  warningRed: "#DC2626",
  warningAmber: "#F59E0B",
  infoBlue: "#3B82F6",
  successGreen: "#16A34A",

  // Narration
  narrationBg: "rgba(0, 0, 0, 0.7)",
  narrationText: "#FFFFFF",

  // Cursor
  cursorWhite: "#FFFFFF",
  cursorBorder: "#333333",
  clickRipple: "rgba(59, 130, 246, 0.4)",

  // Dropdown
  dropdownBg: "#FFFFFF",
  dropdownHover: "#E8F0FE",
  dropdownBorder: "#C0C0C0",
} as const;

// Typography sizes
export const FONT_SIZES = {
  narration: 38,
  cmmsTitle: 18,
  cmmsLabel: 12,
  cmmsField: 14,
  cmmsMenu: 13,
  cmmsSidebar: 13,
  tableHeader: 12,
  tableCell: 13,
  excelCell: 12,
  notification: 14,
  notificationTitle: 13,
} as const;
