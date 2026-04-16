import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
export const { fontFamily: interFont } = loadInter();

export const FPS = 30;

// ─── SCENE STRUCTURE (40s = 1200f) ────────────────────────────────────────────
export const SCENE_CHAT_START      = 0;
export const SCENE_CHAT_DURATION   = 210; // 7s

export const SCENE_2_START         = 210;
export const SCENE_2_DURATION      = 450; // 15s — CopyPaste, original

export const SCENE_THREE_START     = 660;
export const SCENE_THREE_DURATION  = 270; // 9s

export const SCENE_BRIDGE_START    = 930;
export const SCENE_BRIDGE_DURATION = 735;

export const SCENE_BRIDGELIST_DURATION = 330; // ~11s — curved list + zoom

export const TOTAL_FRAMES_15 = 2290;

// ─── ChatGPT content ──────────────────────────────────────────────────────────
export const GPT_USER_MSG =
  "Motor M-401 — abnormal vibrations and bearing temp spikes. I need a maintenance plan and a spare parts list ASAP.";

export const GPT_RESPONSE = `Here's a general maintenance plan for motor bearing issues:

IMMEDIATE ACTIONS
• Measure vibration levels against ISO 10816-3 thresholds
• Check bearing temperature — target range: 50–80°C
• Inspect lubrication — add NLGI Grade 2 grease if needed

SPARE PARTS TO STOCK
• Deep groove ball bearings (see motor nameplate for specs)
• Shaft seals and O-rings
• Lithium-based grease (NLGI Grade 2)

MAINTENANCE SCHEDULE
• Daily: visual inspection and temperature monitoring
• Weekly: vibration signature analysis
• Monthly: full re-lubrication per manufacturer specs

⚠️ Note: Consult your equipment's service manual for model-specific procedures and torque specifications.`;

export const PASTED_NOTES =
  "Replace bearings every 12–18 months or 8,000 operating hours. " +
  "Check shaft alignment quarterly. " +
  "Monitor vibration weekly: >4.5 mm/s indicates bearing degradation. " +
  "⚠️ Consult ABB documentation for model-specific torque specs.";

// ─── Colors ───────────────────────────────────────────────────────────────────
export const CHAT_COLORS = {
  sidebar: "#171717",
  sidebarText: "#ECECEC",
  sidebarSecondary: "#8E8EA0",
  mainBg: "#FFFFFF",
  border: "#E5E7EB",
  userBubble: "#F4F4F4",
  textDark: "#0D0D0D",
  textGrey: "#6B7280",
  inputBg: "#F4F4F4",
  inputBorder: "#D1D5DB",
  gptGreen: "#10A37F",
  narrationBg: "#F5F5F7",
  limitationBg: "#FFFFFF",
  limitationBorder: "#FECACA",
  limitationRed: "#DC2626",
};

// ─── Layout ───────────────────────────────────────────────────────────────────
export const TEXT_ZONE_HEIGHT = 220;
export const UI_BOTTOM_MARGIN = TEXT_ZONE_HEIGHT + 10;
export const UI_HEIGHT = 1080 - TEXT_ZONE_HEIGHT;
export const SIDEBAR_WIDTH = 240;
export const CHAT_MAX_WIDTH = 720;
