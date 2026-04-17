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
export const SCENE_OPEN_CMMS_START = 90;
export const SCENE_OPEN_CMMS_DURATION = 165; // ~5.5s — desktop → splash → list → + click
export const SCENE_1_START = 255;
export const SCENE_1_DURATION = 210; // 7s — form filling
export const SCENE_2_START = 465;
export const SCENE_2_DURATION = 240; // 8s
export const SCENE_3B_START = 705;
export const SCENE_3B_DURATION = 240; // 8s — cost of inefficiency
export const SCENE_3_START = 945;
export const SCENE_3_DURATION = 150; // 5s
export const SCENE_3C_START = 1095;
export const SCENE_3C_DURATION = 270; // 9s — limits
export const SCENE_4_START = 1365;
export const SCENE_4_DURATION = 150; // 5s
export const TOTAL_FRAMES = 1515; // ~50.5s

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

  // Windows 10 Enterprise (corporate "ugly" palette)
  win10Wallpaper: "#4A5A6E",       // flat corporate grey-blue
  win10WallpaperDark: "#384654",   // gradient bottom
  win10Taskbar: "#1F1F1F",         // dark taskbar
  win10TaskbarHover: "#2D2D2D",
  win10Accent: "#0078D4",          // Windows 10 blue
  win10AccentSoft: "rgba(0,120,212,0.12)",
  win10WindowBg: "#FFFFFF",
  win10WindowChrome: "#F3F3F3",    // title bar bg
  win10WindowBorder: "#CECECE",
  win10WindowShadow: "rgba(0,0,0,0.28)",
  win10DesktopText: "#FFFFFF",
  win10DesktopIconShadow: "rgba(0,0,0,0.65)",
  win10FocusRing: "#0078D4",
  win10ToastBg: "#2D2D2D",
  win10ToastBorder: "#3F3F3F",

  // Enterprise ERP (classic 2000s gestionale style)
  erpBody: "#E8EAED",              // beige-grey workspace
  erpToolbar: "#D4D0C8",           // beige toolbar
  erpSidebar: "#F1EFE4",           // light beige sidebar
  erpSidebarBorder: "#A8A59A",
  erpField3DLight: "#FFFFFF",      // 3D inset highlight
  erpField3DShadow: "#808080",     // 3D inset shadow
  erpBorder: "#808080",
  erpBorderDark: "#555555",
  erpHeaderBlue: "#003366",        // dark navy header band
  erpHeaderBlueLight: "#255B9E",
  erpAccentYellow: "#FCB514",      // classic yellow accent
  erpAccentGreen: "#00A651",       // "execute" green
  erpAccentRed: "#C00000",
  erpStatusBar: "#C5C0B0",
  erpStatusGreen: "#38A238",
  erpStatusAmber: "#D4A017",
  erpLinkBlue: "#1F4E79",
  erpSelectedRow: "#FFF1B8",       // yellow highlight
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
