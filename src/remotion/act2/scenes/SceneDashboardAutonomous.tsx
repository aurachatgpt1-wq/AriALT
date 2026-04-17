import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { geistFont, ARIA_COLORS, ARIA_SHADOWS, ARIA_RADIUS } from "../constants";

/* ═══════════════════════════════════════════════════════════════════════════
 *  SceneDashboardAutonomous — AriA working on its own
 *
 *  Designed for post-production: the dashboard is rendered alone on the
 *  frame so it can be masked onto a real monitor in compositing.
 *
 *  Flow (24s / 720 frames @ 30fps):
 *    1. Work Orders overview            (0–2s)
 *    2. Critical alarm incoming         (2–4s)
 *    3. Auto-navigation to alarm        (4–6s)
 *    4. AI Assistant auto-compilation   (6–10s)
 *    5. Predictive maintenance insight  (10–14s)
 *    6. What-if analysis                (14–19s)
 *    7. Full diagnostic → WO generated  (19–22s)
 *    8. Reports → resolution            (22–24s)
 * ═══════════════════════════════════════════════════════════════════════════ */

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

// ─── Beat timings (frames) ───── ULTRA DYNAMIC TIMELINE ─────────────────────
// Tight pacing (1-2s between events) + ambient micro-motion for "alive" feel.
const T_TOAST_IN        = 35;
const T_TOAST_OUT       = 105;
const T_BADGE_PULSE     = 50;
const T_NAV_START       = 80;
const T_NAV_END         = 115;          // click Alarms
const T_ALARM_DETAIL_IN = 120;
const T_AI_DESC_START   = 128;
const T_AI_DESC_END     = 168;
const T_AI_CAUSE_START  = 172;
const T_AI_CAUSE_END    = 208;
const T_AI_RESO_START   = 212;
const T_AI_RESO_END     = 252;
const T_PREDICTIVE_IN   = 255;
const T_PREDICTIVE_CHART= 268;
const T_PREDICTIVE_CONF = 282;
const T_PREDICTIVE_OUT  = 315;
const T_WHATIF_OPEN     = 320;
const T_WHATIF_CARD_A   = 335;
const T_WHATIF_CARD_B   = 350;
const T_WHATIF_CARD_C   = 365;
const T_WHATIF_RECO     = 385;
const T_WHATIF_CLOSE    = 415;
const T_DIAGNOSTIC_CLK  = 425;          // click Full Diagnostic
const T_PROGRESS_START  = 430;
const T_PROGRESS_END    = 460;
const T_NAV_BACK_WO     = 465;
const T_NEW_WO_APPEAR   = 475;
const T_WO_STATUS_1     = 485;
const T_WO_STATUS_2     = 495;
// Auto-select WO-2848 → detail panel
const T_WO_DETAIL_OPEN  = 510;
const T_WO_DETAIL_META  = 518;
const T_WO_DETAIL_DESC  = 523;
const T_WO_DETAIL_STEPS = 528;
const T_WO_DETAIL_PARTS = 545;
const T_WO_DETAIL_TOOLS = 553;
const T_WO_DETAIL_SAFETY= 562;
const T_WO_FIRST_CHECK  = 572;
const T_WO_SECOND_CHECK = 582;
// Navigate to Reports
const T_REPORTS_NAV     = 620;          // click Reports
const T_KPI_ANIMATE     = 625;
const T_CHARTS_REVEAL   = 630;
const T_INSIGHTS_STRIP  = 640;
const T_ACTIVITY_FEED   = 655;
// Beat 9: Production & IoT automation
const T_PRODUCTION_NAV  = 720;          // click Production
const T_PROD_KPIS_IN    = 725;
const T_PROD_LINES_IN   = 730;
const T_PROD_CHART_IN   = 735;
const T_IOT_HEADER_IN   = 742;
const T_IOT_RULES_IN    = 750;
const T_IOT_TRIGGERS_IN = 765;
const T_MID_TOAST       = 830;          // mid-production ambient toast
// Beat 10: Kanban board — dynamic agent-routed WO flow
const T_KANBAN_NAV      = 885;          // click "Board" in sidebar
const T_KANBAN_CARDS_IN = 895;          // first cards start being generated
const T_KB_CARDS_DONE   = 960;          // all initial cards generated (65f stagger)
const T_KB_MOVE_1       = 980;          // WO-2848 moves New → Assigned (AriA routing)
const T_KB_MOVE_2       = 1015;         // WO-2842 moves In Progress → Review
const T_KB_MOVE_3       = 1050;         // WO-2837 moves Review → Done
const T_KB_NEW_CARD     = 1080;         // new card auto-appears in New (IoT trigger)
const T_KB_MOVE_4       = 1105;         // another card moves (routing continues)
const T_FINAL_TOAST     = 1140;
const T_FINAL_HOLD_END  = 1200;

// ─── Industrial data ─────────────────────────────────────────────────────────
type WOStatus = "Open" | "In Progress" | "Pending" | "Done" | "New";
type Priority = "Low" | "Medium" | "High" | "Critical";
type WOType   = "Corrective" | "Predictive" | "Scheduled" | "Preventive";

interface WO {
  code: string;
  title: string;
  type: WOType;
  priority: Priority;
  status: WOStatus;
  asset: string;
}

const WORK_ORDERS: WO[] = [
  { code: "WO-2847", title: "Hydraulic pump PUMP-AX-03 pressure drop",       type: "Corrective", priority: "High",     status: "Open",        asset: "PUMP-AX-03" },
  { code: "WO-2846", title: "Conveyor belt CB-L2 tension calibration",       type: "Predictive", priority: "Medium",   status: "In Progress", asset: "CB-L2" },
  { code: "WO-2845", title: "Injection molder IM-07 mold change",            type: "Scheduled",  priority: "Medium",   status: "Pending",     asset: "IM-07" },
  { code: "WO-2844", title: "Kiln KILN-B2 thermocouple replacement",         type: "Corrective", priority: "Low",      status: "Done",        asset: "KILN-B2" },
  { code: "WO-2843", title: "CNC spindle SPI-04 vibration analysis",         type: "Predictive", priority: "Low",      status: "Done",        asset: "SPI-04" },
  { code: "WO-2842", title: "Compressor COMP-02 filter replacement",         type: "Preventive", priority: "Low",      status: "In Progress", asset: "COMP-02" },
  { code: "WO-2841", title: "Pressure relief valve PRV-08 inspection",       type: "Preventive", priority: "Low",      status: "Open",        asset: "PRV-08" },
];

const NEW_WO: WO = {
  code: "WO-2848",
  title: "OVEN_1 Peg Chain Motor T60M2 torque recovery",
  type: "Corrective",
  priority: "Critical",
  status: "New",
  asset: "OVEN_1",
};

// Full detail payload for WO-2848 — what AriA generated autonomously
const NEW_WO_DETAIL = {
  description: "Full recovery procedure for peg chain motor T60M2 torque limit exceedance. Execute preventive inspection, cleaning, and lubrication sequence to restore nominal operating parameters.",
  assigneeName: "Marco Rossi",
  assigneeRole: "Senior Maintenance Technician",
  assigneeInitials: "MR",
  team: "Maintenance Team A · Line 02",
  assetLocation: "Plant 1 · Baking Line 02 · Sector B",
  dueLabel: "Today, 16:00",
  dueRelative: "in 2h 30m",
  estimatedTime: "1h 00m",
  estimatedCost: "€ 1,400",
  scheduledFor: "Today · 13:30 → 14:30",
  steps: [
    "Stop and lock out OVEN_1 peg chain motor (LOTO procedure, padlock #A-127)",
    "Verify torque readings on controller T60M2 — expected < 810 N·m",
    "Remove protective guard and inspect chain links for wear, debris, misalignment",
    "Clean chain assembly with degreaser, dry thoroughly with compressed air",
    "Apply synthetic lubricant GR-4 to all chain links (120g total, even distribution)",
    "Verify tensioner bracket alignment with laser (tolerance ±0.5mm)",
    "Reinstall guard, restore power, perform nominal-load test run",
    "Log results in maintenance diary, attach photos, close work order",
  ],
  parts: [
    { code: "SP-GR4-120",         name: "Synthetic lubricant GR-4",       qty: 1, unit: "cart.", stock: "OK" },
    { code: "SP-CHAINLINK-T60",   name: "Chain link replacement kit T60", qty: 2, unit: "pcs",   stock: "OK" },
    { code: "SP-FILTER-OIL-07",   name: "Oil filter cartridge",            qty: 1, unit: "pc",    stock: "Low" },
  ],
  tools: [
    "Torque wrench 5–200 N·m (Torx T40 bit)",
    "Alignment laser — Fluke 830",
    "Grease gun with GR-4 cartridge adapter",
    "Feeler gauge set 0.05 – 1.0 mm",
    "Digital multimeter — Fluke 87V",
  ],
  safety: [
    "Heat-resistant gloves (oven surface 80°C)",
    "Safety glasses",
    "Lockout / Tagout padlock",
    "Wait 15 min cooldown after motor stop",
  ],
};

interface AlarmItem {
  code: string;
  title: string;
  category: string;
  status: "Draft" | "Accepted";
  asset: string;
  priority: "Critical" | "High" | "Medium";
}

const ALARMS: AlarmItem[] = [
  { code: "A25245-E2PK", title: "OVEN_1 Outfeed Peg Chain Motor T60M2 Torque Safety Limit Exceeded", category: "Torque", status: "Draft", asset: "OVEN_1", priority: "Critical" },
  { code: "A25247-E3PS", title: "Conveyor CB-L2 speed anomaly detected on sector 3",                 category: "Speed",  status: "Draft", asset: "CB-L2",   priority: "High" },
  { code: "A25244-E1PA", title: "Press PRS-05 vibration peak at 4200 RPM exceeds baseline",          category: "Vibration", status: "Draft", asset: "PRS-05", priority: "High" },
  { code: "A25243-E2PB", title: "Hydraulic Pump PUMP-AX-03 pressure drop below operational threshold", category: "Pressure", status: "Draft", asset: "PUMP-AX-03", priority: "Medium" },
  { code: "A25242-E1PA", title: "Heater HEAT-07 temperature exceeds setpoint by +8°C sustained",     category: "Temperature", status: "Draft", asset: "HEAT-07", priority: "Medium" },
];

// AI Assistant generated content for A25245-E2PK
const AI_DESC = "Motor T60M2 torque has exceeded the 95% safety threshold during peak production cycle. Sustained torque readings of 847 N·m (limit: 810 N·m) recorded over the last 12 minutes.";
const AI_CAUSE = "Mechanical resistance in the peg chain assembly, likely due to lubrication degradation and accumulated debris. Tensioner bracket alignment may also be compromised.";
const AI_RESO = "1. Stop peg chain motor. 2. Inspect and clean chain links. 3. Apply synthetic lubricant GR-4. 4. Verify tensioner alignment. 5. Test under nominal load before full restart.";

// ─── Sidebar config ──────────────────────────────────────────────────────────
interface NavItem { label: string; icon: string; key: string; badge?: number; badgeKey?: string; }
interface NavSection { title: string; items: NavItem[]; }

const NAV: NavSection[] = [
  { title: "START", items: [
    { label: "Guided Setup",      icon: "zap",     key: "setup" },
    { label: "AriA Assistant",    icon: "sparkles",key: "assistant" },
    { label: "Knowledge Base",    icon: "book",    key: "kb" },
  ]},
  { title: "OPERATIONS", items: [
    { label: "Work Orders",       icon: "wrench",  key: "wo" },
    { label: "Board",             icon: "flow",    key: "board" },
    { label: "Maintenance",       icon: "gear",    key: "maintenance" },
    { label: "Inspections",       icon: "eye",     key: "insp" },
  ]},
  { title: "RESOURCES", items: [
    { label: "Assets",            icon: "cube",    key: "assets" },
    { label: "Spare Parts",       icon: "parts",   key: "parts", badge: 3, badgeKey: "parts" },
    { label: "Alarms",            icon: "bell",    key: "alarms", badge: 3, badgeKey: "alarms" },
    { label: "Meters",            icon: "gauge",   key: "meters" },
    { label: "Locations",         icon: "pin",     key: "locations" },
  ]},
  { title: "ORDERS", items: [
    { label: "Purchase Orders",   icon: "cart",    key: "po" },
    { label: "Vendors",           icon: "users",   key: "vendors" },
  ]},
  { title: "REPORTS", items: [
    { label: "Reports",           icon: "chart",   key: "reports" },
    { label: "Production",        icon: "factory", key: "production" },
    { label: "Analytics",         icon: "pulse",   key: "analytics" },
  ]},
  { title: "CONFIGURATION", items: [
    { label: "Plants",            icon: "factory", key: "plants" },
    { label: "Categories",        icon: "tag",     key: "cats" },
    { label: "Teams",             icon: "team",    key: "teams" },
    { label: "Checklist Templates", icon: "list",  key: "checklists" },
    { label: "Automations",       icon: "flow",    key: "automations" },
    { label: "Settings",          icon: "cog",     key: "settings" },
  ]},
];

// Item keys flat order (for computing the highlight position)
const NAV_FLAT = NAV.flatMap((s) => s.items);

const SIDEBAR_WIDTH = 220;
const HEADER_H = 56;

// ─── Icon component ─────────────────────────────────────────────────────────
const Icon: React.FC<{ name: string; size?: number; stroke?: number; color?: string }> = ({ name, size = 18, stroke = 1.7, color = "currentColor" }) => {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: color, strokeWidth: stroke, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "zap":      return (<svg {...common}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>);
    case "sparkles": return (<svg {...common}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>);
    case "book":     return (<svg {...common}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14z"/><path d="M20 17v4H6.5A2.5 2.5 0 0 1 4 18.5"/></svg>);
    case "wrench":   return (<svg {...common}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>);
    case "gear":     return (<svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>);
    case "eye":      return (<svg {...common}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>);
    case "cube":     return (<svg {...common}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>);
    case "parts":    return (<svg {...common}><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>);
    case "bell":     return (<svg {...common}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>);
    case "gauge":    return (<svg {...common}><path d="M12 14l4-4"/><circle cx="12" cy="12" r="10"/></svg>);
    case "pin":      return (<svg {...common}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>);
    case "cart":     return (<svg {...common}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>);
    case "users":    return (<svg {...common}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
    case "chart":    return (<svg {...common}><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>);
    case "pulse":    return (<svg {...common}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>);
    case "factory":  return (<svg {...common}><path d="M2 20V8l7 4V8l7 4V4h6v16z"/><line x1="10" y1="20" x2="10" y2="16"/><line x1="14" y1="20" x2="14" y2="16"/><line x1="18" y1="20" x2="18" y2="16"/></svg>);
    case "tag":      return (<svg {...common}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.83z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>);
    case "team":     return (<svg {...common}><circle cx="9" cy="7" r="4"/><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="17" cy="7" r="3"/></svg>);
    case "list":     return (<svg {...common}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>);
    case "flow":     return (<svg {...common}><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/><path d="M10 7h4a2 2 0 0 1 2 2v5"/></svg>);
    case "cog":      return (<svg {...common}><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 10v6M4.22 4.22l4.24 4.24m7.08 7.08 4.24 4.24M1 12h6m10 0h6M4.22 19.78l4.24-4.24m7.08-7.08 4.24-4.24"/></svg>);
    case "plus":     return (<svg {...common}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
    case "search":   return (<svg {...common}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>);
    case "alert":    return (<svg {...common}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>);
    case "check":    return (<svg {...common}><polyline points="20 6 9 17 4 12"/></svg>);
    case "x":        return (<svg {...common}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
    case "trending": return (<svg {...common}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>);
    case "brain":    return (<svg {...common}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15A2.5 2.5 0 0 1 9.5 22a2.5 2.5 0 0 1-2.5-2.5v-15A2.5 2.5 0 0 1 9.5 2zM14.5 2A2.5 2.5 0 0 0 12 4.5v15A2.5 2.5 0 0 0 14.5 22a2.5 2.5 0 0 0 2.5-2.5v-15A2.5 2.5 0 0 0 14.5 2z"/></svg>);
    case "clock":    return (<svg {...common}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
    case "euro":     return (<svg {...common}><path d="M20 7A8 8 0 0 0 8 7"/><path d="M20 17a8 8 0 0 1-12 0"/><line x1="4" y1="10" x2="14" y2="10"/><line x1="4" y1="14" x2="14" y2="14"/></svg>);
    case "target":   return (<svg {...common}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>);
    default:         return (<svg {...common}><circle cx="12" cy="12" r="2"/></svg>);
  }
};

// ─── Status/priority pill ────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, { bg: string; fg: string; border: string }> = {
  "Open":         { bg: "#EEF4FF", fg: "#3B5BDB", border: "#C8D6FA" },
  "In Progress":  { bg: "#FFF4E5", fg: "#B96408", border: "#FBBF69" },
  "Pending":      { bg: "#F5F0FF", fg: "#7B2FE3", border: "#DCC9F5" },
  "Done":         { bg: "#E8F6F1", fg: "#1FA870", border: "#A7DFC8" },
  "New":          { bg: "#E8F6F1", fg: "#1FA870", border: "#A7DFC8" },
  "Assigned":     { bg: "#EEF4FF", fg: "#3B5BDB", border: "#C8D6FA" },
  "Draft":        { bg: "#F3F4F7", fg: "#767E8C", border: "#D6D9E3" },
  "Accepted":     { bg: "#E8F6F1", fg: "#1FA870", border: "#A7DFC8" },
  "Critical":     { bg: "#FDF1F1", fg: "#DC2626", border: "#FBBFBF" },
  "High":         { bg: "#FFF4E5", fg: "#B96408", border: "#FBBF69" },
  "Medium":       { bg: "#F5F0FF", fg: "#7B2FE3", border: "#DCC9F5" },
  "Low":          { bg: "#F3F4F7", fg: "#767E8C", border: "#D6D9E3" },
};

const Pill: React.FC<{ label: string; kind?: string; small?: boolean; style?: React.CSSProperties }> = ({ label, kind, small, style }) => {
  const palette = STATUS_COLORS[kind ?? label] ?? STATUS_COLORS["Low"];
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: small ? "2px 8px" : "3px 10px",
      borderRadius: 999,
      backgroundColor: palette.bg,
      color: palette.fg,
      border: `1px solid ${palette.border}`,
      fontSize: small ? 10.5 : 11.5,
      fontWeight: 600,
      letterSpacing: "0.01em",
      fontFamily: geistFont,
      whiteSpace: "nowrap",
      ...style,
    }}>
      {label}
    </span>
  );
};

// ─── Typing text effect ──────────────────────────────────────────────────────
// Given a text, current frame, start frame, and chars-per-second, returns
// the substring that should be visible + whether caret should blink.
const getTyped = (text: string, frame: number, startFrame: number, endFrame: number): { shown: string; isTyping: boolean; done: boolean } => {
  if (frame < startFrame) return { shown: "", isTyping: false, done: false };
  const progress = Math.min(1, (frame - startFrame) / (endFrame - startFrame));
  const charsVisible = Math.floor(progress * text.length);
  return {
    shown: text.slice(0, charsVisible),
    isTyping: frame >= startFrame && frame < endFrame,
    done: frame >= endFrame,
  };
};

// ─── Apple-style cursor ─────────────────────────────────────────────────────
// Classic macOS arrow (black fill, white border) with smooth spring movement
// between keyframes + click ripple.
interface CursorKeyframe { at: number; x: number; y: number; click?: boolean; }

// Cursor keyframe timeline.
// Positions measured live from the rendered DOM (converted to 1920×1080 frame coords):
//   Alarms sidebar text center:     (108, 410)
//   Reports sidebar text center:    (122, 622)
//   Production sidebar text center: (122, 652)
//   Full Diagnostic button center:  (1260, 517)
// Cursor tip is at SVG (2,2), so subtract ~2 from the target to align the tip.
const CURSOR_KEYFRAMES: CursorKeyframe[] = [
  // ═══ CLICK 1: Alarms sidebar (frame 115) ═══
  { at: 0,    x: 980, y: 440 },
  { at: 80,   x: 980, y: 440 },
  { at: 112,  x: 106, y: 408 },                 // ARRIVE (17f reach)
  { at: 115,  x: 106, y: 408, click: true },    // CLICK

  // ═══ CLICK 2: Full Diagnostic (frame 425) ═══
  { at: 405,  x: 106, y: 408 },
  { at: 422,  x: 1258, y: 515 },                // ARRIVE
  { at: 425,  x: 1258, y: 515, click: true },   // CLICK

  // ═══ CLICK 3: Reports sidebar (frame 620) — shifted +31 (Board added above) ═══
  { at: 600,  x: 1258, y: 515 },
  { at: 617,  x: 120, y: 651 },                 // ARRIVE (was 620, +31)
  { at: 620,  x: 120, y: 651, click: true },    // CLICK

  // ═══ CLICK 4: Production sidebar (frame 720) ═══
  { at: 700,  x: 120, y: 651 },
  { at: 717,  x: 120, y: 681 },                 // ARRIVE (was 650, +31)
  { at: 720,  x: 120, y: 681, click: true },    // CLICK

  // ═══ CLICK 5: Board sidebar (frame 885) — Board is under Work Orders in OPERATIONS ═══
  { at: 865,  x: 120, y: 681 },                 // held at Production
  { at: 882,  x: 105, y: 264 },                 // ARRIVE at Board (under Work Orders)
  { at: 885,  x: 105, y: 264, click: true },    // CLICK

  // ═══ Idle at end ═══
  { at: 950,  x: 105, y: 264 },
  { at: 1050, x: 960, y: 540 },                 // drift to center for final hold
];

// Human-like mouse easing: quick start, long smooth tail — feels like a hand
// reaching toward a target (easeOutQuart).
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

const getCursorState = (frame: number): { x: number; y: number; clicking: boolean; clickProgress: number } => {
  // Find surrounding keyframes
  let prev = CURSOR_KEYFRAMES[0];
  let next = CURSOR_KEYFRAMES[0];
  for (let i = 0; i < CURSOR_KEYFRAMES.length; i++) {
    if (CURSOR_KEYFRAMES[i].at <= frame) {
      prev = CURSOR_KEYFRAMES[i];
      next = CURSOR_KEYFRAMES[Math.min(i + 1, CURSOR_KEYFRAMES.length - 1)];
    }
  }
  if (prev === next || frame >= next.at) {
    return { x: next.x, y: next.y, clicking: false, clickProgress: 0 };
  }
  const t = Math.max(0, Math.min(1, (frame - prev.at) / (next.at - prev.at)));
  const eased = easeOutQuart(t);
  const x = prev.x + (next.x - prev.x) * eased;
  const y = prev.y + (next.y - prev.y) * eased;

  // Detect click frame — the click flag is on the keyframe itself. Trigger
  // click pulse for ~12 frames around the click keyframe time.
  const nearestClick = CURSOR_KEYFRAMES.find((k) => k.click && Math.abs(k.at - frame) < 15);
  const clicking = !!nearestClick;
  const clickProgress = nearestClick
    ? Math.max(0, Math.min(1, (frame - nearestClick.at) / 12 + 0.5))
    : 0;

  return { x, y, clicking, clickProgress };
};

const Cursor: React.FC<{ frame: number }> = ({ frame }) => {
  const { x, y, clicking, clickProgress } = getCursorState(frame);
  // Click-down scale
  const scale = clicking
    ? interpolate(clickProgress, [0, 0.3, 0.6, 1], [1, 0.88, 0.95, 1], {
        extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const,
      })
    : 1;
  // Ripple expanding outward
  const rippleSize = clicking ? interpolate(clickProgress, [0, 1], [0, 46], clamp) : 0;
  const rippleOp   = clicking ? interpolate(clickProgress, [0, 1], [0.35, 0], clamp) : 0;

  return (
    <div style={{
      position: "absolute",
      left: 0, top: 0,
      width: 0, height: 0,
      transform: `translate(${x}px, ${y}px)`,
      zIndex: 500,
      pointerEvents: "none",
      willChange: "transform",
    }}>
      {/* Click ripple */}
      {rippleSize > 0 && (
        <div style={{
          position: "absolute",
          left: 4, top: 4,
          width: rippleSize,
          height: rippleSize,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          border: "2px solid rgba(0,0,0,0.4)",
          opacity: rippleOp,
        }} />
      )}
      {/* Cursor arrow — macOS style (black with white border) */}
      <svg width="22" height="22" viewBox="0 0 22 22" style={{
        transform: `scale(${scale})`,
        transformOrigin: "2px 2px",
        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))",
      }}>
        <path
          d="M 2,2 L 2,17 L 6.2,13.2 L 9,19.2 L 11.8,18 L 9,12 L 14.6,11.5 Z"
          fill="#0A0A0A"
          stroke="#FFFFFF"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

// ─── Toast component ─────────────────────────────────────────────────────────
const Toast: React.FC<{
  frame: number;
  inFrame: number;
  outFrame: number;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  accent?: string;
}> = ({ frame, inFrame, outFrame, icon, iconBg, iconColor, title, subtitle, accent = "#DC2626" }) => {
  const tIn  = interpolate(frame, [inFrame, inFrame + 12], [0, 1], clamp);
  const tOut = interpolate(frame, [outFrame, outFrame + 10], [1, 0], clamp);
  const op = Math.min(tIn, tOut);
  const tx = interpolate(tIn, [0, 1], [40, 0], clamp);
  if (op < 0.01) return null;
  return (
    <div style={{
      position: "absolute",
      right: 24,
      top: HEADER_H + 20,
      minWidth: 360,
      padding: "12px 14px",
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      backgroundColor: "#FFFFFF",
      border: `1px solid ${ARIA_COLORS.cardBorder}`,
      borderLeft: `3px solid ${accent}`,
      borderRadius: ARIA_RADIUS.md,
      boxShadow: "0 8px 24px rgba(15,18,25,0.12), 0 2px 6px rgba(15,18,25,0.06)",
      opacity: op,
      transform: `translateX(${tx}px)`,
      fontFamily: geistFont,
      zIndex: 200,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        backgroundColor: iconBg, color: iconColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon name={icon} size={18} stroke={2} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: ARIA_COLORS.foreground, letterSpacing: "-0.01em", lineHeight: 1.3 }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 11.5, color: ARIA_COLORS.mutedFg, marginTop: 2, lineHeight: 1.4 }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main scene ──────────────────────────────────────────────────────────────
export const SceneDashboardAutonomous: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ─ Active navigation page ──
  // Determines which page is shown based on current frame
  let activePageKey = "wo";
  if (frame >= T_NAV_END && frame < T_NAV_BACK_WO) activePageKey = "alarms";
  else if (frame >= T_NAV_BACK_WO && frame < T_REPORTS_NAV) activePageKey = "wo";
  else if (frame >= T_REPORTS_NAV && frame < T_PRODUCTION_NAV) activePageKey = "reports";
  else if (frame >= T_PRODUCTION_NAV && frame < T_KANBAN_NAV) activePageKey = "production";
  else if (frame >= T_KANBAN_NAV) activePageKey = "board";

  // Sidebar highlight position — slides between items as we navigate
  const activeIndex = NAV_FLAT.findIndex((n) => n.key === activePageKey);

  // Smooth spring-based highlight transition
  const navSp = spring({
    frame: frame - (
      frame >= T_REPORTS_NAV ? T_REPORTS_NAV :
      frame >= T_NAV_BACK_WO ? T_NAV_BACK_WO :
      frame >= T_NAV_END     ? T_NAV_END     : 0
    ), fps, config: { stiffness: 120, damping: 20, mass: 0.9 },
  });
  const navT = interpolate(navSp, [0, 1], [0, 1], clamp);

  // Alarm badge count (3 → 4 when alarm comes in, → 3 when resolved)
  const alarmCount = frame < T_BADGE_PULSE ? 3 : (frame >= T_KPI_ANIMATE ? 3 : 4);
  const alarmBadgePulse = frame >= T_BADGE_PULSE && frame < T_BADGE_PULSE + 45
    ? 1 + Math.sin((frame - T_BADGE_PULSE) * 0.35) * 0.25
    : 1;

  // Page cross-fades
  const woOp     = interpolate(frame, [T_NAV_END - 15, T_NAV_END], [1, 0], clamp) *
                   (frame < T_NAV_BACK_WO ? 1 : interpolate(frame, [T_NAV_BACK_WO, T_NAV_BACK_WO + 15], [0, 1], clamp));
  const woVisible = frame < T_NAV_END || frame >= T_NAV_BACK_WO;
  // ── Page transitions: instant snap triggered by click ──
  // Each nav event is synced ~4f AFTER the cursor click so the user sees
  // click → immediate page swap. No slow slide or crossfade — just a clean
  // swap with a brief scale pop (stile macOS settings). Nav events fire
  // AT the keyframe (sync with cursor click event).
  // Transition anchored exactly on nav event frames, duration 5f total.
  const transDur = 5;

  // Helper: compute opacity + scale for a page given its visible window
  const pageTransition = (visibleStart: number, visibleEnd: number | null) => {
    let op = 0;
    let sc = 1;
    if (visibleEnd === null && frame < visibleStart) {
      return { op: 0, sc: 1 };
    }
    // Entering: short fade + tiny scale pop (1.02 → 1)
    if (frame >= visibleStart && frame < visibleStart + transDur) {
      const t = (frame - visibleStart) / transDur;
      op = t;
      sc = 1.02 - 0.02 * t;
    } else if (frame >= visibleStart + transDur) {
      op = 1;
      sc = 1;
    }
    // Leaving: fade out + tiny scale down (1 → 0.98)
    if (visibleEnd !== null) {
      if (frame >= visibleEnd && frame < visibleEnd + transDur) {
        const t = (frame - visibleEnd) / transDur;
        op = op * (1 - t);
        sc = 1 - 0.02 * t;
      } else if (frame >= visibleEnd + transDur) {
        op = 0;
      }
    }
    return { op, sc };
  };

  // WO: visible 0..T_NAV_END (range 1) AND T_NAV_BACK_WO..T_REPORTS_NAV (range 2)
  // First page: visibleStart = -transDur so enter animation has already completed at frame 0
  const woRange1 = pageTransition(-transDur, T_NAV_END);
  const woRange2 = pageTransition(T_NAV_BACK_WO, T_REPORTS_NAV);
  const woShowOp = Math.max(woRange1.op, woRange2.op);
  const woScale  = woRange1.op > woRange2.op ? woRange1.sc : woRange2.sc;

  const alarmsRes    = pageTransition(T_NAV_END, T_NAV_BACK_WO);
  const alarmsShowOp = alarmsRes.op;
  const alarmsScale  = alarmsRes.sc;

  const reportsRes    = pageTransition(T_REPORTS_NAV, T_PRODUCTION_NAV);
  const reportsShowOp = reportsRes.op;
  const reportsScale  = reportsRes.sc;

  const productionRes    = pageTransition(T_PRODUCTION_NAV, T_KANBAN_NAV);
  const productionShowOp = productionRes.op;
  const productionScale  = productionRes.sc;

  const boardRes    = pageTransition(T_KANBAN_NAV, null);
  const boardShowOp = boardRes.op;
  const boardScale  = boardRes.sc;

  // ── SCENE-WIDE ZOOM only on the centered What-If modal ──
  // (WO Detail uses LOCAL scale+glow on the panel itself, like Predictive card)
  const megaZoom = (() => {
    if (frame >= T_WHATIF_RECO && frame < T_WHATIF_RECO + 45) {
      const t = interpolate(frame, [T_WHATIF_RECO, T_WHATIF_RECO + 14, T_WHATIF_RECO + 32, T_WHATIF_RECO + 45], [0, 1, 1, 0], clamp);
      return { t, tx: 1208, ty: 540, maxScale: 1.35 };
    }
    return { t: 0, tx: 960, ty: 540, maxScale: 1 };
  })();
  const mzEased = megaZoom.t < 0.5 ? 2 * megaZoom.t * megaZoom.t : 1 - Math.pow(-2 * megaZoom.t + 2, 2) / 2;
  const mzScale = 1 + (megaZoom.maxScale - 1) * mzEased;
  const mzTx = mzEased * (960 - megaZoom.tx);
  const mzTy = mzEased * (540 - megaZoom.ty);

  return (
    <AbsoluteFill style={{
      backgroundColor: ARIA_COLORS.background,
      fontFamily: geistFont,
      overflow: "hidden",
    }}>
    <div style={{
      position: "absolute",
      inset: 0,
      transform: `translate3d(${mzTx}px, ${mzTy}px, 0) scale(${mzScale})`,
      transformOrigin: `${megaZoom.tx}px ${megaZoom.ty}px`,
      willChange: mzEased > 0.01 ? "transform" : "auto",
      backfaceVisibility: "hidden",
    }}>
      {/* Ambient gradients for depth */}
      <div style={{
        position: "absolute",
        width: 1200, height: 900, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,91,219,0.07) 0%, transparent 70%)",
        left: -300, top: -200,
        filter: "blur(60px)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        width: 900, height: 700, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(165,184,255,0.05) 0%, transparent 65%)",
        right: -200, bottom: -100,
        filter: "blur(60px)",
        pointerEvents: "none",
      }} />

      {/* ─────────────── SIDEBAR ─────────────── */}
      <div style={{
        position: "absolute",
        left: 0, top: 0, bottom: 0, width: SIDEBAR_WIDTH,
        backgroundColor: ARIA_COLORS.sidebarBg,
        borderRight: `1px solid ${ARIA_COLORS.sidebarBorder}`,
        display: "flex",
        flexDirection: "column",
        zIndex: 10,
      }}>
        {/* Logo row */}
        <div style={{
          height: HEADER_H,
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: `1px solid ${ARIA_COLORS.sidebarBorder}`,
        }}>
          <div style={{
            width: 30, height: 30,
            borderRadius: 7,
            backgroundColor: ARIA_COLORS.dark,
            color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 12,
            letterSpacing: "-0.02em",
          }}>
            A
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: ARIA_COLORS.foreground, letterSpacing: "-0.02em" }}>
            AriA
          </div>
        </div>

        {/* Nav sections */}
        <div style={{ flex: 1, overflow: "hidden", padding: "10px 0" }}>
          {NAV.map((section) => (
            <div key={section.title} style={{ marginBottom: 6 }}>
              <div style={{
                padding: "8px 20px 4px",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: ARIA_COLORS.labelFg,
              }}>
                {section.title}
              </div>
              {section.items.map((it) => {
                const isActive = it.key === activePageKey;
                const isAlarmsItem = it.key === "alarms";
                const showBadge = (it.badge ?? 0) > 0;
                const displayBadge = isAlarmsItem ? alarmCount : it.badge;
                return (
                  <div key={it.key} style={{
                    position: "relative",
                    margin: "1px 10px",
                    padding: "7px 10px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    borderRadius: 6,
                    backgroundColor: isActive ? ARIA_COLORS.primaryLight : "transparent",
                    color: isActive ? ARIA_COLORS.primary : ARIA_COLORS.foreground,
                    fontWeight: isActive ? 600 : 500,
                    fontSize: 12.5,
                    letterSpacing: "-0.005em",
                  }}>
                    <Icon name={it.icon} size={14.5} stroke={1.8} color={isActive ? ARIA_COLORS.primary : "#6B7280"} />
                    <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.label}</span>
                    {showBadge && (
                      <div style={{
                        minWidth: 18, height: 18, padding: "0 5px",
                        borderRadius: 9,
                        backgroundColor: isAlarmsItem && frame >= T_BADGE_PULSE ? "#DC2626" : "#9AA0B0",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transform: isAlarmsItem ? `scale(${alarmBadgePulse})` : undefined,
                        boxShadow: isAlarmsItem && frame >= T_BADGE_PULSE && frame < T_BADGE_PULSE + 40
                          ? `0 0 ${8 + Math.sin(frame * 0.3) * 4}px rgba(220,38,38,0.5)`
                          : undefined,
                      }}>
                        {displayBadge}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer user */}
        <div style={{
          padding: "10px 14px",
          borderTop: `1px solid ${ARIA_COLORS.sidebarBorder}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg, #3B5BDB, #6B8EFF)",
            color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 600,
          }}>
            BE
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: ARIA_COLORS.foreground }}>
            Brahim El-Kamoun
            <div style={{ fontSize: 9.5, color: ARIA_COLORS.mutedFg, fontWeight: 500 }}>OEM Industrial S.p.A.</div>
          </div>
        </div>
      </div>

      {/* ─────────────── HEADER ─────────────── */}
      <div style={{
        position: "absolute",
        left: SIDEBAR_WIDTH,
        right: 0,
        top: 0,
        height: HEADER_H,
        backgroundColor: ARIA_COLORS.sidebarBg,
        borderBottom: `1px solid ${ARIA_COLORS.sidebarBorder}`,
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        zIndex: 9,
      }}>
        <HeaderContent frame={frame} activePageKey={activePageKey} />
      </div>

      {/* ─────────────── MAIN CONTENT ─────────────── */}
      <div style={{
        position: "absolute",
        left: SIDEBAR_WIDTH,
        top: HEADER_H,
        right: 0,
        bottom: 0,
        overflow: "hidden",
      }}>
        {/* Work Orders */}
        {woShowOp > 0 && (
          <div style={{
            position: "absolute", inset: 0,
            opacity: woShowOp,
            transform: `scale(${woScale})`,
            transformOrigin: "center top",
            willChange: "transform, opacity",
          }}>
            <WorkOrdersPage frame={frame} fps={fps} />
          </div>
        )}

        {/* Alarms */}
        {alarmsShowOp > 0 && (
          <div style={{
            position: "absolute", inset: 0,
            opacity: alarmsShowOp,
            transform: `scale(${alarmsScale})`,
            transformOrigin: "center center",
            willChange: "transform, opacity",
          }}>
            <AlarmsPage frame={frame} fps={fps} />
          </div>
        )}

        {/* Reports */}
        {reportsShowOp > 0 && (
          <div style={{
            position: "absolute", inset: 0,
            opacity: reportsShowOp,
            transform: `scale(${reportsScale})`,
            transformOrigin: "center top",
            willChange: "transform, opacity",
          }}>
            <ReportsPage frame={frame} fps={fps} />
          </div>
        )}

        {/* Production & IoT */}
        {productionShowOp > 0 && (
          <div style={{
            position: "absolute", inset: 0,
            opacity: productionShowOp,
            transform: `scale(${productionScale})`,
            transformOrigin: "center top",
            willChange: "transform, opacity",
          }}>
            <ProductionPage frame={frame} fps={fps} />
          </div>
        )}

        {/* Kanban Board */}
        {boardShowOp > 0 && (
          <div style={{
            position: "absolute", inset: 0,
            opacity: boardShowOp,
            transform: `scale(${boardScale})`,
            transformOrigin: "center top",
            willChange: "transform, opacity",
          }}>
            <KanbanBoardPage frame={frame} fps={fps} />
          </div>
        )}
      </div>

      {/* ─────────────── CRITICAL ALARM RED VIGNETTE ─────────────── */}
      {frame >= T_TOAST_IN - 2 && frame < T_TOAST_IN + 30 && (
        <div style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(220,38,38,0.18) 100%)",
          opacity: interpolate(frame, [T_TOAST_IN - 2, T_TOAST_IN + 4, T_TOAST_IN + 30], [0, 1, 0], clamp),
          zIndex: 180,
          pointerEvents: "none",
        }} />
      )}

      {/* ─────────────── TOASTS ─────────────── */}
      <Toast
        frame={frame}
        inFrame={T_TOAST_IN}
        outFrame={T_TOAST_OUT}
        icon="alert"
        iconBg="#FDF1F1"
        iconColor="#DC2626"
        accent="#DC2626"
        title="Critical alarm detected"
        subtitle="OVEN_1 Outfeed Peg Chain Motor — Torque safety limit exceeded"
      />
      {/* Mid-production ambient toast — AriA handles something else in the background */}
      <Toast
        frame={frame}
        inFrame={T_MID_TOAST}
        outFrame={T_MID_TOAST + 40}
        icon="flow"
        iconBg="rgba(59,91,219,0.12)"
        iconColor="#3B5BDB"
        accent="#3B5BDB"
        title="IoT trigger auto-handled"
        subtitle="PRS-05 vibration → pre-emptive WO drafted for tomorrow's shift"
      />
      <Toast
        frame={frame}
        inFrame={T_FINAL_TOAST}
        outFrame={T_FINAL_TOAST + 55}
        icon="check"
        iconBg="#E8F6F1"
        iconColor="#1FA870"
        accent="#1FA870"
        title="Autonomous loop complete"
        subtitle="AriA handled 6 actions in 3m 42s · €1,400 saved · production nominal"
      />

      {/* ─────────────── APPLE CURSOR ─────────────── */}
      <Cursor frame={frame} />
    </div>
    </AbsoluteFill>
  );
};

// ─── Header (title + actions by page) ───────────────────────────────────────
const HeaderContent: React.FC<{ frame: number; activePageKey: string }> = ({ frame, activePageKey }) => {
  const titleFor: Record<string, { title: string; sub: string; icon: string }> = {
    wo:         { title: "Work Orders", sub: "Manage maintenance activities", icon: "wrench" },
    alarms:     { title: "Alarms",       sub: "Active alarms & diagnostics",  icon: "bell" },
    reports:    { title: "Reports",      sub: "Performance & analytics",      icon: "chart" },
    production: { title: "Production",   sub: "Live monitoring & IoT automation", icon: "factory" },
    board:      { title: "Board",        sub: "Autonomous agent routing · live", icon: "flow" },
  };
  const h = titleFor[activePageKey] ?? titleFor.wo;
  return (
    <>
      <div style={{
        width: 32, height: 32,
        borderRadius: 8,
        backgroundColor: ARIA_COLORS.primaryLight,
        color: ARIA_COLORS.primary,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name={h.icon} size={17} stroke={2} color={ARIA_COLORS.primary} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: ARIA_COLORS.foreground, letterSpacing: "-0.01em" }}>
          {h.title}
        </div>
        <div style={{ fontSize: 11, color: ARIA_COLORS.mutedFg, marginTop: 1 }}>
          {h.sub}
        </div>
      </div>
      {activePageKey === "wo" && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "7px 13px",
          backgroundColor: ARIA_COLORS.primary,
          color: "#fff",
          borderRadius: 7,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "-0.005em",
          boxShadow: "0 2px 6px rgba(59,91,219,0.25)",
        }}>
          <Icon name="plus" size={13} stroke={2.4} color="#fff" />
          New WO
        </div>
      )}
    </>
  );
};

// ─── Work Orders page ────────────────────────────────────────────────────────
const WorkOrdersPage: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Breathing ambient stats at top
  const stats = [
    { label: "Active",    value: 47, color: ARIA_COLORS.primary },
    { label: "Pending",   value: 12, color: "#E8830A" },
    { label: "Overdue",   value: 3,  color: "#DC2626" },
    { label: "Done today",value: 28, color: "#1FA870" },
  ];

  // Show the new WO once created
  const showNewWO = frame >= T_NEW_WO_APPEAR;
  const newWoSp = spring({
    frame: frame - T_NEW_WO_APPEAR, fps,
    config: { stiffness: 140, damping: 18, mass: 0.8 },
  });
  const newWoT = interpolate(newWoSp, [0, 1], [0, 1], clamp);
  const newWoOp = interpolate(frame, [T_NEW_WO_APPEAR, T_NEW_WO_APPEAR + 15], [0, 1], clamp);
  // Dramatic overshoot entry: tiny → bigger → settle
  const newWoScale = interpolate(newWoT, [0, 0.5, 0.8, 1], [0.8, 1.12, 1.02, 1], clamp);
  const newWoStatus: WOStatus = frame >= T_WO_STATUS_2 ? "In Progress" : frame >= T_WO_STATUS_1 ? "Open" : "New";
  // Status transition flash: big pop scale on the status pill right when it changes
  const statusChangeFrame = frame >= T_WO_STATUS_2 ? T_WO_STATUS_2 : frame >= T_WO_STATUS_1 ? T_WO_STATUS_1 : T_NEW_WO_APPEAR;
  const statusPulse = frame >= statusChangeFrame && frame < statusChangeFrame + 16
    ? interpolate(frame, [statusChangeFrame, statusChangeFrame + 4, statusChangeFrame + 10, statusChangeFrame + 16], [1, 1.45, 1.08, 1], clamp)
    : 1;

  // Detail panel state — snappy appear (not slow slide)
  const showDetail = frame >= T_WO_DETAIL_OPEN - 3;
  const detailSp = spring({
    frame: frame - T_WO_DETAIL_OPEN, fps,
    config: { stiffness: 220, damping: 26, mass: 0.6 },
  });
  const detailT = interpolate(detailSp, [0, 1], [0, 1], clamp);
  const detailOp = interpolate(frame, [T_WO_DETAIL_OPEN, T_WO_DETAIL_OPEN + 8], [0, 1], clamp);
  const detailTx = interpolate(detailT, [0, 1], [24, 0], clamp);
  // List shrinks — fast
  const listWidthFactor = interpolate(detailT, [0, 1], [1, 0.42], clamp);
  const kpiOp = interpolate(detailT, [0, 1], [1, 0], clamp);

  return (
    <div style={{ padding: "16px 24px", height: "100%", display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>
      {/* KPI strip — fades out when detail opens to give more vertical room */}
      {kpiOp > 0.01 && (
        <div style={{ display: "flex", gap: 10, opacity: kpiOp, height: kpiOp > 0.95 ? "auto" : 0, overflow: "hidden", marginBottom: kpiOp > 0.95 ? 0 : -14 }}>
          {stats.map((s) => (
            <div key={s.label} style={{
              flex: 1,
              padding: "10px 14px",
              backgroundColor: ARIA_COLORS.cardBg,
              border: `1px solid ${ARIA_COLORS.cardBorder}`,
              borderRadius: ARIA_RADIUS.md,
              boxShadow: ARIA_SHADOWS.card,
            }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: ARIA_COLORS.mutedFg, letterSpacing: "0.02em", textTransform: "uppercase" }}>
                {s.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color, letterSpacing: "-0.02em", marginTop: 2 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ flex: 1, display: "flex", gap: 14, overflow: "hidden" }}>
        {/* List column (shrinks when detail opens) */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          overflow: "hidden",
          minWidth: 0,
          flex: listWidthFactor,
          transition: "none",
        }}>
          {/* Toolbar + tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "7px 11px",
              flex: showDetail ? 1 : "0 0 280px",
              backgroundColor: "#FFF",
              border: `1px solid ${ARIA_COLORS.cardBorder}`,
              borderRadius: 7,
              color: ARIA_COLORS.labelFg,
              fontSize: 11.5,
              minWidth: 0,
            }}>
              <Icon name="search" size={13} color="#9AA0B0" />
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Search orders...</span>
            </div>
            {!showDetail && (["Status", "Priority", "Type", "Asset"].map((t, i) => (
              <div key={t} style={{
                padding: "6px 11px",
                backgroundColor: i === 0 ? ARIA_COLORS.primaryLight : "transparent",
                color: i === 0 ? ARIA_COLORS.primary : ARIA_COLORS.mutedFg,
                border: `1px solid ${i === 0 ? "rgba(59,91,219,0.25)" : ARIA_COLORS.cardBorder}`,
                borderRadius: 7,
                fontSize: 11.5,
                fontWeight: i === 0 ? 600 : 500,
              }}>
                {t}
              </div>
            )))}
            {!showDetail && <div style={{ flex: 1 }} />}
            <div style={{ fontSize: 11.5, color: ARIA_COLORS.mutedFg, whiteSpace: "nowrap" }}>
              {WORK_ORDERS.length + (showNewWO ? 1 : 0)} orders
            </div>
          </div>

          {/* Orders list */}
          <div style={{
            flex: 1,
            backgroundColor: ARIA_COLORS.cardBg,
            border: `1px solid ${ARIA_COLORS.cardBorder}`,
            borderRadius: ARIA_RADIUS.lg,
            boxShadow: ARIA_SHADOWS.card,
            padding: "4px 0",
            overflow: "hidden",
          }}>
            {showNewWO && (
              <WORow
                wo={{ ...NEW_WO, status: newWoStatus }}
                isNew
                isSelected={showDetail}
                compact={showDetail}
                opacity={newWoOp}
                scale={newWoScale}
                frame={frame}
              />
            )}
            {WORK_ORDERS.map((wo) => <WORow key={wo.code} wo={wo} compact={showDetail} />)}
          </div>
        </div>

        {/* Detail panel — slides in from right */}
        {showDetail && (
          <div style={{
            flex: 1 - listWidthFactor,
            minWidth: 0,
            opacity: detailOp,
            transform: `translateX(${detailTx}px)`,
          }}>
            <WorkOrderDetailPanel frame={frame} fps={fps} status={newWoStatus} statusPulse={statusPulse} />
          </div>
        )}
      </div>
    </div>
  );
};

const WORow: React.FC<{
  wo: WO;
  isNew?: boolean;
  isSelected?: boolean;
  compact?: boolean;
  opacity?: number;
  scale?: number;
  frame?: number;
}> = ({ wo, isNew, isSelected, compact, opacity = 1, scale = 1, frame = 0 }) => {
  // New WO: pulsing green glow ring for ~35 frames after appearance
  const newGlowT = isNew ? interpolate(frame, [T_NEW_WO_APPEAR, T_NEW_WO_APPEAR + 35], [1, 0], clamp) : 0;
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: compact ? 10 : 14,
      padding: compact ? "10px 12px" : "12px 18px",
      borderBottom: `1px solid rgba(214,217,227,0.3)`,
      borderLeft: isSelected ? `3px solid ${ARIA_COLORS.primary}` : "3px solid transparent",
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: "center left",
      background: isSelected
        ? "rgba(59,91,219,0.05)"
        : isNew
          ? "linear-gradient(90deg, rgba(31,168,112,0.06) 0%, transparent 60%)"
          : "transparent",
      position: "relative",
      boxShadow: isNew && newGlowT > 0.01
        ? `0 0 ${20 * newGlowT}px rgba(31,168,112,${0.45 * newGlowT}), inset 0 0 0 1px rgba(31,168,112,${0.3 * newGlowT})`
        : undefined,
    }}>
      {/* Expanding attention ring for new WO */}
      {isNew && frame >= T_NEW_WO_APPEAR && frame < T_NEW_WO_APPEAR + 40 && (
        <div style={{
          position: "absolute",
          inset: 0,
          borderRadius: 6,
          border: `2px solid rgba(31,168,112,${interpolate(frame, [T_NEW_WO_APPEAR, T_NEW_WO_APPEAR + 40], [0.7, 0], clamp)})`,
          transform: `scale(${interpolate(frame, [T_NEW_WO_APPEAR, T_NEW_WO_APPEAR + 40], [1, 1.08], clamp)})`,
          pointerEvents: "none",
        }} />
      )}
      <div style={{
        width: 5, height: compact ? 26 : 32,
        borderRadius: 3,
        backgroundColor:
          wo.priority === "Critical" ? "#DC2626" :
          wo.priority === "High"     ? "#E8830A" :
          wo.priority === "Medium"   ? "#7B2FE3" : "#B8BDC9",
        flexShrink: 0,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: compact ? 10 : 11, fontWeight: 600, color: ARIA_COLORS.labelFg, letterSpacing: "0.01em" }}>
            {wo.code}
          </span>
          {isNew && !compact && <Pill label="Created by AriA" kind="New" small style={{ fontSize: 10 }} />}
        </div>
        <div style={{
          fontSize: compact ? 12 : 13,
          fontWeight: 500,
          color: ARIA_COLORS.foreground,
          marginTop: 2,
          letterSpacing: "-0.005em",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: compact ? "nowrap" : "normal",
        }}>
          {wo.title}
        </div>
      </div>
      {!compact && (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Pill label={wo.type} small />
          <Pill label={wo.priority} kind={wo.priority} small />
          <Pill label={wo.status} kind={wo.status} small />
        </div>
      )}
      {compact && (
        <Pill label={wo.status} kind={wo.status} small />
      )}
    </div>
  );
};

// ─── Work Order DETAIL panel — the showpiece of AriA's autonomous execution ──
// Rich, detailed view of WO-2848 with staggered reveals on each section.
// Header → meta strip → description → steps → parts + tools → safety
const WorkOrderDetailPanel: React.FC<{ frame: number; fps: number; status: WOStatus; statusPulse?: number }> = ({ frame, fps, status, statusPulse = 1 }) => {
  const d = NEW_WO_DETAIL;

  // All content visible immediately — the panel slide-in itself is the reveal.
  const metaOp  = 1;
  const metaY   = 0;
  const descOp  = 1;
  const descY   = 0;
  const stepsOp = 1;
  const partsOp = 1;
  const toolsOp = 1;
  const safetyOp= 1;

  // First two steps auto-check (AriA confirms progress)
  const step1Checked = frame >= T_WO_FIRST_CHECK;
  const step2Checked = frame >= T_WO_SECOND_CHECK;

  // LOCAL focus effect — same pattern as Predictive card: scales up in place
  // + strong blue glow during the "AriA executing" window.
  const focusT = interpolate(frame, [T_WO_DETAIL_OPEN + 8, T_WO_DETAIL_OPEN + 22, T_REPORTS_NAV - 20, T_REPORTS_NAV - 8], [0, 1, 1, 0], clamp);
  const focusScale = 1 + focusT * 0.04;       // gentle scale — fits flex constraints
  const focusGlow = focusT;

  return (
    <div style={{
      height: "100%",
      backgroundColor: ARIA_COLORS.cardBg,
      border: `1px solid ${focusT > 0.3 ? "rgba(59,91,219,0.55)" : ARIA_COLORS.cardBorder}`,
      borderLeft: `3px solid ${ARIA_COLORS.primary}`,
      borderRadius: ARIA_RADIUS.lg,
      boxShadow: focusGlow > 0.05
        ? `0 ${20 + focusGlow * 16}px ${50 + focusGlow * 30}px rgba(59,91,219,${0.18 + focusGlow * 0.3}), 0 4px 12px rgba(15,18,25,0.08)`
        : "0 8px 24px rgba(15,18,25,0.08), 0 2px 6px rgba(15,18,25,0.04)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      fontFamily: geistFont,
      transform: `scale(${focusScale})`,
      transformOrigin: "center center",
      transition: "none",
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: "14px 18px",
        borderBottom: `1px solid ${ARIA_COLORS.cardBorder}`,
        background: "linear-gradient(180deg, rgba(59,91,219,0.03) 0%, transparent 100%)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: ARIA_COLORS.labelFg, letterSpacing: "0.02em" }}>
            {NEW_WO.code}
          </span>
          <Pill label="Critical" kind="Critical" small />
          <div style={{
            padding: "2px 8px",
            backgroundColor: "#E8F6F1",
            border: "1px solid #A7DFC8",
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 700,
            color: "#1FA870",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}>
            <Icon name="sparkles" size={10} stroke={2.4} color="#1FA870" />
            Created by AriA
          </div>
          <div style={{ flex: 1 }} />
          <div style={{
            transform: `scale(${statusPulse})`,
            transformOrigin: "center right",
            filter: statusPulse > 1.05
              ? `drop-shadow(0 0 ${(statusPulse - 1) * 60}px rgba(59,91,219,${(statusPulse - 1) * 2}))`
              : undefined,
          }}>
            <Pill label={status} kind={status} small />
          </div>
        </div>
        <div style={{
          fontSize: 15,
          fontWeight: 600,
          color: ARIA_COLORS.foreground,
          letterSpacing: "-0.015em",
          lineHeight: 1.3,
        }}>
          {NEW_WO.title}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div style={{
        flex: 1,
        overflow: "hidden",
        padding: "14px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}>
        {/* META row: assignee + details grid */}
        <div style={{
          opacity: metaOp,
          transform: `translateY(${metaY}px)`,
          display: "flex",
          gap: 12,
          alignItems: "stretch",
        }}>
          {/* Assignee card */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            backgroundColor: "#FFFFFF",
            border: `1px solid ${ARIA_COLORS.cardBorder}`,
            borderRadius: ARIA_RADIUS.md,
            minWidth: 200,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "linear-gradient(135deg, #3B5BDB 0%, #6B8EFF 100%)",
              color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700,
              boxShadow: "0 2px 5px rgba(59,91,219,0.3)",
              position: "relative",
            }}>
              {d.assigneeInitials}
              <div style={{
                position: "absolute",
                bottom: -1, right: -1,
                width: 10, height: 10, borderRadius: "50%",
                backgroundColor: "#1FA870",
                border: "2px solid #fff",
              }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: ARIA_COLORS.labelFg, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>
                Assigned to
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: ARIA_COLORS.foreground, letterSpacing: "-0.005em" }}>
                {d.assigneeName}
              </div>
              <div style={{ fontSize: 10, color: ARIA_COLORS.mutedFg, marginTop: 1 }}>
                {d.assigneeRole}
              </div>
            </div>
          </div>

          {/* Mini info cards grid */}
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <MiniMeta icon="pin"    label="Location"  value={d.assetLocation}  iconColor="#7B2FE3" />
            <MiniMeta icon="clock"  label="Due"       value={d.dueLabel}       sub={d.dueRelative} iconColor="#E8830A" />
            <MiniMeta icon="gauge"  label="Est. time" value={d.estimatedTime}  iconColor="#3B5BDB" />
            <MiniMeta icon="euro"   label="Est. cost" value={d.estimatedCost}  iconColor="#1FA870" />
          </div>
        </div>

        {/* DESCRIPTION */}
        <div style={{ opacity: descOp, transform: `translateY(${descY}px)` }}>
          <div style={{
            fontSize: 9.5, fontWeight: 700,
            color: ARIA_COLORS.labelFg,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 5,
          }}>
            Description
          </div>
          <div style={{
            fontSize: 11.5,
            color: ARIA_COLORS.foreground,
            lineHeight: 1.5,
            letterSpacing: "-0.002em",
          }}>
            {d.description}
          </div>
        </div>

        {/* OPERATIONAL STEPS */}
        <div style={{ opacity: stepsOp, flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <div style={{
              fontSize: 9.5, fontWeight: 700,
              color: ARIA_COLORS.labelFg,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}>
              Operational Steps
            </div>
            <div style={{
              padding: "1px 6px",
              backgroundColor: ARIA_COLORS.background,
              border: `1px solid ${ARIA_COLORS.cardBorder}`,
              borderRadius: 4,
              fontSize: 9.5, fontWeight: 700,
              color: ARIA_COLORS.mutedFg,
              fontVariantNumeric: "tabular-nums",
            }}>
              {d.steps.length}
            </div>
            <div style={{ flex: 1 }} />
            <div style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "2px 7px",
              backgroundColor: "rgba(59,91,219,0.08)",
              borderRadius: 4,
              fontSize: 9.5, fontWeight: 600,
              color: ARIA_COLORS.primary,
              letterSpacing: "0.02em",
            }}>
              <Icon name="sparkles" size={9.5} stroke={2.5} color={ARIA_COLORS.primary} />
              Generated by AriA
            </div>
          </div>
          <div style={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            border: `1px solid ${ARIA_COLORS.cardBorder}`,
            borderRadius: ARIA_RADIUS.md,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}>
            {d.steps.map((step, i) => {
              const stepOp = 1;
              const checked = (i === 0 && step1Checked) || (i === 1 && step2Checked);
              // Check-off pulse: when this row just got checked, flash the background
              // and pop the checkbox for ~15 frames.
              const checkFrame = i === 0 ? T_WO_FIRST_CHECK : i === 1 ? T_WO_SECOND_CHECK : -1;
              const pulseT = checkFrame > 0 && frame >= checkFrame && frame < checkFrame + 18
                ? interpolate(frame, [checkFrame, checkFrame + 8, checkFrame + 18], [0, 1, 0], clamp)
                : 0;
              const checkboxPop = checkFrame > 0 && frame >= checkFrame && frame < checkFrame + 14
                ? interpolate(frame, [checkFrame, checkFrame + 4, checkFrame + 14], [0.3, 1.3, 1], clamp)
                : 1;
              return (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 9,
                  padding: "7px 11px",
                  borderBottom: i < d.steps.length - 1 ? `1px solid rgba(214,217,227,0.3)` : "none",
                  opacity: stepOp,
                  backgroundColor: checked ? `rgba(31,168,112,${0.05 + pulseT * 0.12})` : "transparent",
                  position: "relative",
                  boxShadow: pulseT > 0.1
                    ? `inset 0 0 0 1px rgba(31,168,112,${pulseT * 0.5})`
                    : undefined,
                }}>
                  {/* Checkbox (scale-pops when check happens) */}
                  <div style={{
                    width: 15, height: 15,
                    borderRadius: 3,
                    border: checked ? "none" : `1.5px solid ${ARIA_COLORS.cardBorder}`,
                    backgroundColor: checked ? "#1FA870" : "#fff",
                    flexShrink: 0,
                    marginTop: 0.5,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transform: `scale(${checkboxPop})`,
                    boxShadow: pulseT > 0.3 ? `0 0 ${12 * pulseT}px rgba(31,168,112,${pulseT * 0.6})` : undefined,
                  }}>
                    {checked && <Icon name="check" size={10} stroke={3} color="#fff" />}
                  </div>
                  {/* Step number */}
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: checked ? "#1FA870" : ARIA_COLORS.mutedFg,
                    letterSpacing: "0.02em",
                    fontVariantNumeric: "tabular-nums",
                    flexShrink: 0,
                    marginTop: 1,
                  }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {/* Step text */}
                  <span style={{
                    fontSize: 11,
                    color: checked ? ARIA_COLORS.mutedFg : ARIA_COLORS.foreground,
                    lineHeight: 1.45,
                    textDecoration: checked ? "line-through" : "none",
                    flex: 1,
                  }}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* PARTS + TOOLS row */}
        <div style={{ display: "flex", gap: 12 }}>
          {/* Parts */}
          <div style={{ flex: 1, opacity: partsOp }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 9.5, fontWeight: 700,
              color: ARIA_COLORS.labelFg,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 5,
            }}>
              <Icon name="parts" size={11} stroke={2} color="#9AA0B0" />
              Required Parts
              <div style={{
                padding: "1px 5px",
                backgroundColor: ARIA_COLORS.background,
                border: `1px solid ${ARIA_COLORS.cardBorder}`,
                borderRadius: 4,
                fontSize: 9,
                fontWeight: 700,
                color: ARIA_COLORS.mutedFg,
              }}>
                {d.parts.length}
              </div>
            </div>
            <div style={{
              backgroundColor: "#FFFFFF",
              border: `1px solid ${ARIA_COLORS.cardBorder}`,
              borderRadius: ARIA_RADIUS.sm,
              overflow: "hidden",
            }}>
              {d.parts.map((p, i) => (
                <div key={p.code} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  borderBottom: i < d.parts.length - 1 ? `1px solid rgba(214,217,227,0.3)` : "none",
                  fontSize: 10.5,
                }}>
                  <span style={{ fontWeight: 600, color: ARIA_COLORS.labelFg, letterSpacing: "0.01em", fontSize: 9.5, minWidth: 100 }}>
                    {p.code}
                  </span>
                  <span style={{ flex: 1, color: ARIA_COLORS.foreground, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.name}
                  </span>
                  <div style={{
                    padding: "1px 5px",
                    backgroundColor: p.stock === "Low" ? "#FFF4E5" : "#E8F6F1",
                    color: p.stock === "Low" ? "#B96408" : "#1FA870",
                    border: `1px solid ${p.stock === "Low" ? "#FBBF69" : "#A7DFC8"}`,
                    borderRadius: 4,
                    fontSize: 9,
                    fontWeight: 700,
                  }}>
                    {p.stock}
                  </div>
                  <span style={{ color: ARIA_COLORS.foreground, fontWeight: 700, fontVariantNumeric: "tabular-nums", minWidth: 24, textAlign: "right" }}>
                    ×{p.qty}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div style={{ flex: 1, opacity: toolsOp }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 9.5, fontWeight: 700,
              color: ARIA_COLORS.labelFg,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 5,
            }}>
              <Icon name="wrench" size={11} stroke={2} color="#9AA0B0" />
              Required Tools
              <div style={{
                padding: "1px 5px",
                backgroundColor: ARIA_COLORS.background,
                border: `1px solid ${ARIA_COLORS.cardBorder}`,
                borderRadius: 4,
                fontSize: 9,
                fontWeight: 700,
                color: ARIA_COLORS.mutedFg,
              }}>
                {d.tools.length}
              </div>
            </div>
            <div style={{
              backgroundColor: "#FFFFFF",
              border: `1px solid ${ARIA_COLORS.cardBorder}`,
              borderRadius: ARIA_RADIUS.sm,
              overflow: "hidden",
            }}>
              {d.tools.map((t, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  borderBottom: i < d.tools.length - 1 ? `1px solid rgba(214,217,227,0.3)` : "none",
                  fontSize: 10.5,
                  color: ARIA_COLORS.foreground,
                }}>
                  <div style={{
                    width: 4, height: 4, borderRadius: "50%",
                    backgroundColor: ARIA_COLORS.primary,
                    flexShrink: 0,
                  }} />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SAFETY / PPE */}
        <div style={{
          opacity: safetyOp,
          padding: "10px 12px",
          backgroundColor: "rgba(232,131,10,0.06)",
          border: "1px solid rgba(232,131,10,0.25)",
          borderLeft: "3px solid #E8830A",
          borderRadius: ARIA_RADIUS.md,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 10, fontWeight: 700,
            color: "#B96408",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}>
            <Icon name="alert" size={11} stroke={2.2} color="#B96408" />
            Safety / PPE required
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {d.safety.map((s) => (
              <div key={s} style={{
                padding: "3px 9px",
                backgroundColor: "#FFFFFF",
                border: "1px solid rgba(232,131,10,0.4)",
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 500,
                color: "#B96408",
              }}>
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Small meta card (used inside WO detail panel) ───────────────────────────
const MiniMeta: React.FC<{ icon: string; label: string; value: string; sub?: string; iconColor: string }> = ({ icon, label, value, sub, iconColor }) => (
  <div style={{
    padding: "7px 10px",
    backgroundColor: "#FFFFFF",
    border: `1px solid ${ARIA_COLORS.cardBorder}`,
    borderRadius: ARIA_RADIUS.sm,
    display: "flex",
    alignItems: "center",
    gap: 8,
  }}>
    <div style={{
      width: 24, height: 24,
      borderRadius: 6,
      backgroundColor: iconColor + "14",
      color: iconColor,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <Icon name={icon} size={12} stroke={2.2} color={iconColor} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: 9, fontWeight: 700,
        color: ARIA_COLORS.labelFg,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: 1,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 11.5,
        fontWeight: 600,
        color: ARIA_COLORS.foreground,
        letterSpacing: "-0.005em",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}>
        {value}
        {sub && <span style={{ color: ARIA_COLORS.mutedFg, fontWeight: 500, marginLeft: 4, fontSize: 10 }}>· {sub}</span>}
      </div>
    </div>
  </div>
);

// ─── Alarms page ─────────────────────────────────────────────────────────────
const AlarmsPage: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const selectedAlarm = ALARMS[0]; // A25245-E2PK

  // Detail panel slides in
  const detailSp = spring({
    frame: frame - T_ALARM_DETAIL_IN, fps,
    config: { stiffness: 110, damping: 22, mass: 0.8 },
  });
  const detailT = interpolate(detailSp, [0, 1], [0, 1], clamp);
  const detailTx = interpolate(detailT, [0, 1], [60, 0], clamp);

  // Predictive card appearance
  const predSp = spring({
    frame: frame - T_PREDICTIVE_IN, fps,
    config: { stiffness: 120, damping: 22, mass: 0.85 },
  });
  const predT = interpolate(predSp, [0, 1], [0, 1], clamp);
  const predOp = interpolate(frame, [T_PREDICTIVE_IN, T_PREDICTIVE_IN + 15], [0, 1], clamp) *
                 interpolate(frame, [T_PREDICTIVE_OUT, T_PREDICTIVE_OUT + 10], [1, 0.5], clamp);

  // What-If overlay
  const whatIfSp = spring({
    frame: frame - T_WHATIF_OPEN, fps,
    config: { stiffness: 110, damping: 20, mass: 0.8 },
  });
  const whatIfT = interpolate(whatIfSp, [0, 1], [0, 1], clamp);
  const whatIfOp = interpolate(frame, [T_WHATIF_OPEN, T_WHATIF_OPEN + 12], [0, 1], clamp) *
                   interpolate(frame, [T_WHATIF_CLOSE, T_WHATIF_CLOSE + 15], [1, 0], clamp);

  // Diagnostic click + progress
  const diagnosticPulse = frame >= T_DIAGNOSTIC_CLK && frame < T_PROGRESS_END
    ? interpolate(frame, [T_DIAGNOSTIC_CLK, T_DIAGNOSTIC_CLK + 8, T_DIAGNOSTIC_CLK + 20], [1, 1.05, 1], clamp)
    : 1;
  const progressT = interpolate(frame, [T_PROGRESS_START, T_PROGRESS_END], [0, 1], clamp);

  return (
    <div style={{ height: "100%", display: "flex" }}>
      {/* Alarm list */}
      <div style={{
        width: 380,
        padding: "16px 14px",
        borderRight: `1px solid ${ARIA_COLORS.cardBorder}`,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        overflow: "hidden",
      }}>
        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "7px 11px",
          backgroundColor: "#FFF",
          border: `1px solid ${ARIA_COLORS.cardBorder}`,
          borderRadius: 7,
          color: ARIA_COLORS.labelFg,
          fontSize: 11.5,
        }}>
          <Icon name="search" size={13} color="#9AA0B0" />
          Search by code, asset...
        </div>
        {/* Filter row */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <div style={{
            padding: "4px 9px",
            backgroundColor: ARIA_COLORS.primaryLight,
            color: ARIA_COLORS.primary,
            border: "1px solid rgba(59,91,219,0.3)",
            borderRadius: 6,
            fontSize: 10.5, fontWeight: 600,
          }}>Category Torque</div>
          <div style={{
            padding: "4px 9px",
            border: `1px solid ${ARIA_COLORS.cardBorder}`,
            color: ARIA_COLORS.mutedFg,
            borderRadius: 6,
            fontSize: 10.5, fontWeight: 500,
          }}>Over</div>
          <div style={{
            padding: "4px 9px",
            border: `1px solid ${ARIA_COLORS.cardBorder}`,
            color: ARIA_COLORS.mutedFg,
            borderRadius: 6,
            fontSize: 10.5, fontWeight: 500,
          }}>Priority</div>
        </div>
        <div style={{ fontSize: 10.5, color: ARIA_COLORS.mutedFg, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginTop: 4 }}>
          {ALARMS.length} active
        </div>
        {/* Alarm rows */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, overflow: "hidden" }}>
          {ALARMS.map((al, i) => {
            const isSelected = i === 0;
            const isNewOne = i === 0; // pretend the first one is the new incoming alarm
            const justArrived = isNewOne && frame >= T_TOAST_IN && frame < T_TOAST_IN + 30;
            return (
              <div key={al.code} style={{
                position: "relative",
                padding: "10px 12px",
                backgroundColor: isSelected ? "#FFFFFF" : ARIA_COLORS.cardBg,
                border: `1px solid ${isSelected ? "rgba(59,91,219,0.4)" : ARIA_COLORS.cardBorder}`,
                borderLeft: isSelected ? `3px solid ${ARIA_COLORS.primary}` : `1px solid ${ARIA_COLORS.cardBorder}`,
                borderRadius: ARIA_RADIUS.sm,
                boxShadow: isSelected ? ARIA_SHADOWS.card : "none",
                transform: justArrived ? `translateX(${interpolate(frame, [T_TOAST_IN, T_TOAST_IN + 15], [40, 0], clamp)}px)` : undefined,
                opacity: justArrived ? interpolate(frame, [T_TOAST_IN, T_TOAST_IN + 15], [0, 1], clamp) : 1,
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: ARIA_COLORS.labelFg, letterSpacing: "0.01em" }}>
                  {al.code}
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, color: ARIA_COLORS.foreground, marginTop: 3, lineHeight: 1.35 }}>
                  {al.title}
                </div>
                <div style={{ display: "flex", gap: 5, marginTop: 7 }}>
                  <Pill label={al.category} small />
                  <Pill label={al.priority} kind={al.priority} small />
                  <Pill label={al.status} kind={al.status} small />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alarm detail panel */}
      <div style={{
        flex: 1,
        padding: "18px 20px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        opacity: interpolate(detailT, [0, 1], [0, 1], clamp),
        transform: `translateX(${detailTx}px)`,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Title + close row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: ARIA_COLORS.labelFg, letterSpacing: "0.01em" }}>
                {selectedAlarm.code}
              </span>
              <Pill label="Critical" kind="Critical" small />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: ARIA_COLORS.foreground, letterSpacing: "-0.015em", lineHeight: 1.3 }}>
              {selectedAlarm.title}
            </div>
          </div>
          {/* Status tabs */}
          <div style={{ display: "flex", gap: 0, padding: 3, backgroundColor: ARIA_COLORS.background, borderRadius: 7, border: `1px solid ${ARIA_COLORS.cardBorder}` }}>
            {["Draft", "Accepted", "Rejected"].map((s, i) => (
              <div key={s} style={{
                padding: "4px 10px",
                fontSize: 10.5, fontWeight: 600,
                color: i === 0 ? "#fff" : ARIA_COLORS.mutedFg,
                backgroundColor: i === 0 ? ARIA_COLORS.foreground : "transparent",
                borderRadius: 5,
              }}>
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Subtabs */}
        <div style={{ display: "flex", gap: 20, borderBottom: `1px solid ${ARIA_COLORS.cardBorder}`, paddingBottom: 0 }}>
          {["Details", "Resolution", "History"].map((t, i) => (
            <div key={t} style={{
              padding: "6px 0",
              fontSize: 12, fontWeight: i === 0 ? 600 : 500,
              color: i === 0 ? ARIA_COLORS.foreground : ARIA_COLORS.mutedFg,
              borderBottom: i === 0 ? `2px solid ${ARIA_COLORS.primary}` : "2px solid transparent",
              marginBottom: -1,
            }}>
              {t}
            </div>
          ))}
        </div>

        {/* AI Assistant card — redesigned: step-based, color-coded fields */}
        <AIAssistantCard
          frame={frame}
          fps={fps}
          progressT={progressT}
          diagnosticPulse={diagnosticPulse}
        />

        {/* PREDICTIVE INSIGHT floating card */}
        {predOp > 0.01 && frame < T_PREDICTIVE_OUT + 15 && (
          <PredictiveCard
            frame={frame}
            opacity={predOp}
            scale={interpolate(predT, [0, 1], [0.94, 1], clamp)}
            translateY={interpolate(predT, [0, 1], [12, 0], clamp)}
          />
        )}

        {/* WHAT-IF ANALYSIS MODAL */}
        {whatIfOp > 0.01 && (
          <WhatIfModal
            frame={frame}
            opacity={whatIfOp}
            scale={interpolate(whatIfT, [0, 1], [0.95, 1], clamp)}
          />
        )}
      </div>
    </div>
  );
};

// ─── AI Assistant Card — redesigned ─────────────────────────────────────────
// Richer, more intuitive design:
//   • Segmented progress bar (3 segments light up as fields complete)
//   • Step numbers + color-coded icons per field
//   • Per-field confidence badge (animates to final value)
//   • Animated check when field completes + subtle "generating" shimmer
//   • Status pill morphs: Analyzing → Finding cause → Drafting → Ready
//   • LIVE indicator with response time
//   • Full Diagnostic button with sparkle shimmer + ripple on click
const AIAssistantCard: React.FC<{
  frame: number;
  fps: number;
  progressT: number;
  diagnosticPulse: number;
}> = ({ frame, fps, progressT, diagnosticPulse }) => {
  // Per-field state
  const descDone  = frame >= T_AI_DESC_END;
  const causeDone = frame >= T_AI_CAUSE_END;
  const resoDone  = frame >= T_AI_RESO_END;
  const completedFields = (descDone ? 1 : 0) + (causeDone ? 1 : 0) + (resoDone ? 1 : 0);

  // Status text morph
  let statusLabel = "Analyzing";
  if (frame >= T_AI_CAUSE_START && frame < T_AI_CAUSE_END) statusLabel = "Finding cause";
  else if (frame >= T_AI_RESO_START && frame < T_AI_RESO_END) statusLabel = "Drafting resolution";
  else if (resoDone) statusLabel = "Ready";

  // Response time counter (feels alive)
  const respMs = 38 + Math.floor(Math.sin(frame * 0.2) * 8 + Math.cos(frame * 0.17) * 6);

  // Overall confidence: grows to 94 when all fields done
  const overallConf = Math.min(94, Math.floor(
    (descDone  ? 31 : interpolate(frame, [T_AI_DESC_START, T_AI_DESC_END], [0, 31], clamp)) +
    (causeDone ? 31 : interpolate(frame, [T_AI_CAUSE_START, T_AI_CAUSE_END], [0, 31], clamp)) +
    (resoDone  ? 32 : interpolate(frame, [T_AI_RESO_START, T_AI_RESO_END], [0, 32], clamp))
  ));

  // Avatar breathing ring (animated gradient border when working)
  const isWorking = !resoDone;
  const ringPhase = (frame * 0.08) % (Math.PI * 2);

  // "READY" pop: when resolution finishes, card pulses + gets a glow moment
  const readyPop = resoDone && frame < T_AI_RESO_END + 18
    ? interpolate(frame, [T_AI_RESO_END, T_AI_RESO_END + 6, T_AI_RESO_END + 18], [1, 1.015, 1], clamp)
    : 1;
  const readyGlow = resoDone && frame < T_AI_RESO_END + 30
    ? interpolate(frame, [T_AI_RESO_END, T_AI_RESO_END + 10, T_AI_RESO_END + 30], [0, 1, 0], clamp)
    : 0;

  return (
    <div style={{
      position: "relative",
      padding: 16,
      background:
        "linear-gradient(135deg, rgba(59,91,219,0.05) 0%, rgba(107,142,255,0.03) 50%, rgba(123,47,227,0.04) 100%)",
      border: `1px solid rgba(59,91,219,${0.22 + readyGlow * 0.3})`,
      borderLeft: `3px solid ${ARIA_COLORS.primary}`,
      borderRadius: ARIA_RADIUS.lg,
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: 11,
      transform: `scale(${readyPop})`,
      transformOrigin: "center",
      boxShadow: readyGlow > 0.05
        ? `0 0 ${30 * readyGlow}px rgba(59,91,219,${readyGlow * 0.4}), inset 0 1px 0 rgba(255,255,255,0.4)`
        : "inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 2px rgba(59,91,219,0.05)",
      overflow: "hidden",
    }}>
      {/* subtle animated gradient backdrop */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at ${30 + Math.sin(ringPhase) * 15}% ${30 + Math.cos(ringPhase) * 10}%, rgba(59,91,219,0.07) 0%, transparent 55%)`,
        pointerEvents: "none",
      }} />

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
        {/* Animated avatar */}
        <div style={{
          position: "relative",
          width: 36, height: 36,
          flexShrink: 0,
        }}>
          {/* Rotating gradient ring while working */}
          {isWorking && (
            <div style={{
              position: "absolute",
              inset: -2,
              borderRadius: 10,
              background: `conic-gradient(from ${ringPhase * 180 / Math.PI}deg, ${ARIA_COLORS.primary}, #6B8EFF, #7B2FE3, ${ARIA_COLORS.primary})`,
              opacity: 0.85,
              filter: "blur(1px)",
            }} />
          )}
          <div style={{
            position: "absolute",
            inset: 0,
            borderRadius: 9,
            background: isWorking
              ? "linear-gradient(135deg, #3B5BDB 0%, #6B8EFF 100%)"
              : "linear-gradient(135deg, #1FA870 0%, #26C388 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: isWorking
              ? "0 3px 10px rgba(59,91,219,0.4), inset 0 1px 0 rgba(255,255,255,0.25)"
              : "0 3px 10px rgba(31,168,112,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
          }}>
            <Icon name={isWorking ? "sparkles" : "check"} size={17} stroke={2.4} color="#fff" />
          </div>
        </div>

        {/* Title block */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: ARIA_COLORS.foreground, letterSpacing: "-0.01em" }}>
              AriA Assistant
            </div>
            <div style={{
              padding: "1px 6px",
              backgroundColor: "rgba(59,91,219,0.1)",
              color: ARIA_COLORS.primary,
              borderRadius: 4,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}>
              v2.4
            </div>
          </div>
          <div style={{ fontSize: 10.5, color: ARIA_COLORS.mutedFg, marginTop: 1, letterSpacing: "-0.003em" }}>
            {statusLabel}
            <span style={{ color: ARIA_COLORS.labelFg }}> · Incident A25245-E2PK · {overallConf}% confidence</span>
          </div>
        </div>

        {/* Live indicator */}
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "3px 9px",
          backgroundColor: "#FFFFFF",
          border: `1px solid ${ARIA_COLORS.cardBorder}`,
          borderRadius: 999,
          fontSize: 10, fontWeight: 600,
          color: ARIA_COLORS.mutedFg,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            backgroundColor: isWorking ? "#DC2626" : "#1FA870",
            boxShadow: isWorking
              ? `0 0 ${4 + Math.sin(frame * 0.3) * 3}px rgba(220,38,38,0.7)`
              : "0 0 4px rgba(31,168,112,0.5)",
          }} />
          <span style={{ color: isWorking ? "#DC2626" : "#1FA870", fontWeight: 700, letterSpacing: "0.04em" }}>LIVE</span>
          <span style={{ color: ARIA_COLORS.labelFg, marginLeft: 2, fontVariantNumeric: "tabular-nums" }}>{respMs}ms</span>
        </div>
      </div>

      {/* ── Segmented progress bar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
        <div style={{ display: "flex", flex: 1, gap: 4 }}>
          {[T_AI_DESC_END, T_AI_CAUSE_END, T_AI_RESO_END].map((endFr, i) => {
            const startFr = [T_AI_DESC_START, T_AI_CAUSE_START, T_AI_RESO_START][i];
            const fillT = interpolate(frame, [startFr, endFr], [0, 1], clamp);
            const done = frame >= endFr;
            return (
              <div key={i} style={{
                flex: 1,
                height: 5,
                borderRadius: 3,
                backgroundColor: "rgba(59,91,219,0.10)",
                overflow: "hidden",
                position: "relative",
              }}>
                <div style={{
                  position: "absolute",
                  left: 0, top: 0, bottom: 0,
                  width: `${fillT * 100}%`,
                  background: done
                    ? "linear-gradient(90deg, #3B5BDB 0%, #6B8EFF 100%)"
                    : `linear-gradient(90deg, #3B5BDB 0%, #6B8EFF 100%)`,
                  boxShadow: done ? "0 0 6px rgba(59,91,219,0.4)" : "none",
                }} />
                {/* Shimmer overlay during fill */}
                {fillT > 0 && fillT < 1 && (
                  <div style={{
                    position: "absolute",
                    left: `${fillT * 100 - 15}%`,
                    top: 0, bottom: 0,
                    width: 30,
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                  }} />
                )}
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 10, fontWeight: 600, color: ARIA_COLORS.mutedFg, fontVariantNumeric: "tabular-nums", minWidth: 28, textAlign: "right" }}>
          {completedFields}/3
        </div>
      </div>

      {/* ── Fields ── */}
      <AIFieldV2
        stepNum={1}
        label="Description"
        icon="search"
        color="#3B5BDB"
        colorLight="rgba(59,91,219,0.10)"
        text={AI_DESC}
        frame={frame}
        startFrame={T_AI_DESC_START}
        endFrame={T_AI_DESC_END}
        finalConfidence={98}
      />
      <AIFieldV2
        stepNum={2}
        label="Root cause"
        icon="brain"
        color="#7B2FE3"
        colorLight="rgba(123,47,227,0.10)"
        text={AI_CAUSE}
        frame={frame}
        startFrame={T_AI_CAUSE_START}
        endFrame={T_AI_CAUSE_END}
        finalConfidence={95}
      />
      <AIFieldV2
        stepNum={3}
        label="Resolution plan"
        icon="wrench"
        color="#1FA870"
        colorLight="rgba(31,168,112,0.10)"
        text={AI_RESO}
        frame={frame}
        startFrame={T_AI_RESO_START}
        endFrame={T_AI_RESO_END}
        finalConfidence={92}
      />

      {/* ── Full Diagnostic button (enhanced) ── */}
      <div style={{
        marginTop: 2,
        padding: "11px 16px",
        background: resoDone
          ? "linear-gradient(135deg, #3B5BDB 0%, #6B8EFF 100%)"
          : "linear-gradient(135deg, rgba(59,91,219,0.55) 0%, rgba(107,142,255,0.55) 100%)",
        color: "#fff",
        borderRadius: 10,
        fontSize: 13, fontWeight: 600,
        letterSpacing: "-0.005em",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        boxShadow: resoDone
          ? "0 6px 18px rgba(59,91,219,0.45), inset 0 1px 0 rgba(255,255,255,0.3)"
          : "0 2px 6px rgba(59,91,219,0.2), inset 0 1px 0 rgba(255,255,255,0.2)",
        transform: `scale(${diagnosticPulse})`,
        position: "relative",
        overflow: "hidden",
        opacity: resoDone ? 1 : 0.75,
        cursor: "pointer",
      }}>
        {/* Shimmer (ready state) */}
        {resoDone && frame < T_DIAGNOSTIC_CLK && (
          <div style={{
            position: "absolute",
            top: 0, bottom: 0,
            left: `${((frame - T_AI_RESO_END) * 4) % 400 - 100}px`,
            width: 80,
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
            pointerEvents: "none",
          }} />
        )}
        <Icon name="brain" size={15} stroke={2.3} color="#fff" />
        <span style={{ position: "relative", zIndex: 2 }}>Full Diagnostic</span>
        {resoDone && frame < T_DIAGNOSTIC_CLK && (
          <div style={{
            marginLeft: 6,
            padding: "1px 7px",
            backgroundColor: "rgba(255,255,255,0.22)",
            borderRadius: 4,
            fontSize: 9.5, fontWeight: 700,
            letterSpacing: "0.05em",
            position: "relative", zIndex: 2,
          }}>
            READY
          </div>
        )}
        {/* Progress fill */}
        {frame >= T_PROGRESS_START && (
          <div style={{
            position: "absolute",
            left: 0, top: 0, bottom: 0,
            width: `${progressT * 100}%`,
            background: "linear-gradient(90deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.05) 100%)",
          }} />
        )}
        {/* Click ripple — double-layered for impact */}
        {frame >= T_DIAGNOSTIC_CLK && frame < T_DIAGNOSTIC_CLK + 28 && (
          <>
            <div style={{
              position: "absolute",
              left: "50%", top: "50%",
              width: interpolate(frame, [T_DIAGNOSTIC_CLK, T_DIAGNOSTIC_CLK + 22], [0, 400], clamp),
              height: interpolate(frame, [T_DIAGNOSTIC_CLK, T_DIAGNOSTIC_CLK + 22], [0, 400], clamp),
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.45)",
              transform: "translate(-50%, -50%)",
              opacity: interpolate(frame, [T_DIAGNOSTIC_CLK, T_DIAGNOSTIC_CLK + 22], [0.8, 0], clamp),
              pointerEvents: "none",
            }} />
            {/* Second slower ring */}
            <div style={{
              position: "absolute",
              left: "50%", top: "50%",
              width: interpolate(frame, [T_DIAGNOSTIC_CLK + 4, T_DIAGNOSTIC_CLK + 28], [0, 480], clamp),
              height: interpolate(frame, [T_DIAGNOSTIC_CLK + 4, T_DIAGNOSTIC_CLK + 28], [0, 480], clamp),
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.55)",
              transform: "translate(-50%, -50%)",
              opacity: interpolate(frame, [T_DIAGNOSTIC_CLK + 4, T_DIAGNOSTIC_CLK + 28], [0.6, 0], clamp),
              pointerEvents: "none",
            }} />
          </>
        )}
      </div>
    </div>
  );
};

// ─── AI field v2 with step number + color-coded icon + confidence badge ────
const AIFieldV2: React.FC<{
  stepNum: number;
  label: string;
  icon: string;
  color: string;
  colorLight: string;
  text: string;
  frame: number;
  startFrame: number;
  endFrame: number;
  finalConfidence: number;
}> = ({ stepNum, label, icon, color, colorLight, text, frame, startFrame, endFrame, finalConfidence }) => {
  const { shown, isTyping, done } = getTyped(text, frame, startFrame, endFrame);
  const fieldOp = interpolate(frame, [startFrame - 10, startFrame], [0, 1], clamp);
  const caret = Math.floor(frame / 6) % 2 === 0;
  const fieldInY = interpolate(frame, [startFrame - 10, startFrame], [6, 0], clamp);

  // Confidence animates from 0 to final once done
  const confT = interpolate(frame, [endFrame, endFrame + 18], [0, 1], clamp);
  const conf = Math.floor(confT * finalConfidence);

  // Check animation in
  const checkSp = done
    ? interpolate(frame, [endFrame, endFrame + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  return (
    <div style={{
      opacity: fieldOp,
      transform: `translateY(${fieldInY}px)`,
      position: "relative",
    }}>
      {/* Label row with step + icon + confidence */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 5,
      }}>
        {/* Step circle with icon */}
        <div style={{
          position: "relative",
          width: 22, height: 22,
          borderRadius: 6,
          backgroundColor: colorLight,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon name={icon} size={11.5} stroke={2.2} color={color} />
          {/* Step number badge */}
          <div style={{
            position: "absolute",
            top: -5, right: -5,
            width: 14, height: 14,
            borderRadius: "50%",
            backgroundColor: "#FFFFFF",
            border: `1.5px solid ${color}`,
            color,
            fontSize: 8.5,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontVariantNumeric: "tabular-nums",
          }}>
            {stepNum}
          </div>
        </div>

        {/* Label */}
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: ARIA_COLORS.foreground,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
        }}>
          {label}
        </div>

        <div style={{ flex: 1 }} />

        {/* Confidence badge (appears when done) */}
        {done && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            opacity: interpolate(confT, [0, 1], [0, 1], clamp),
            padding: "2px 7px",
            backgroundColor: colorLight,
            border: `1px solid ${color}40`,
            borderRadius: 999,
            fontSize: 9.5,
            fontWeight: 700,
            color,
            fontVariantNumeric: "tabular-nums",
          }}>
            {conf}%
          </div>
        )}

        {/* Animated check */}
        {done && (
          <div style={{
            width: 18, height: 18,
            borderRadius: "50%",
            backgroundColor: "#1FA870",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${interpolate(checkSp, [0, 1], [0, 1], clamp)})`,
            boxShadow: "0 2px 5px rgba(31,168,112,0.35)",
          }}>
            <Icon name="check" size={10} stroke={3} color="#fff" />
          </div>
        )}

        {/* In-progress spinning dot */}
        {isTyping && !done && (
          <div style={{
            display: "flex",
            gap: 3,
            padding: "3px 6px",
            backgroundColor: colorLight,
            borderRadius: 999,
          }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width: 4, height: 4,
                borderRadius: "50%",
                backgroundColor: color,
                opacity: 0.3 + 0.7 * Math.abs(Math.sin((frame - startFrame) * 0.2 + i * 0.8)),
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Text content box */}
      <div style={{
        position: "relative",
        padding: "10px 13px",
        paddingLeft: 16,
        backgroundColor: "#FFFFFF",
        border: `1px solid ${done ? color + "35" : ARIA_COLORS.cardBorder}`,
        borderLeft: `2px solid ${done ? color : "transparent"}`,
        borderRadius: 8,
        fontSize: 11.5,
        color: ARIA_COLORS.foreground,
        lineHeight: 1.55,
        minHeight: 40,
        fontFamily: geistFont,
        letterSpacing: "-0.002em",
        transition: "border-color 0.3s, border-left-color 0.3s",
        overflow: "hidden",
      }}>
        {shown}
        {isTyping && caret && (
          <span style={{
            display: "inline-block",
            width: 2,
            height: "1em",
            marginLeft: 2,
            verticalAlign: "text-bottom",
            backgroundColor: color,
            animation: "none",
          }} />
        )}
        {/* Active typing glow */}
        {isTyping && (
          <div style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(90deg, transparent 0%, ${color}08 ${Math.max(0, ((frame - startFrame) / (endFrame - startFrame)) * 100 - 10)}%, ${color}14 ${Math.min(100, ((frame - startFrame) / (endFrame - startFrame)) * 100)}%, transparent ${Math.min(100, ((frame - startFrame) / (endFrame - startFrame)) * 100 + 10)}%)`,
            pointerEvents: "none",
            borderRadius: 8,
          }} />
        )}
      </div>
    </div>
  );
};

// ─── Predictive Maintenance card ─────────────────────────────────────────────
const PredictiveCard: React.FC<{ frame: number; opacity: number; scale: number; translateY: number }> = ({ frame, opacity, scale, translateY }) => {
  // Health score chart points
  // Historical: y=90 to y=40 over time
  // Predicted: y=40 to y=15 (crosses threshold at y=25)
  const chartPathHistory = "M 8,20 L 40,28 L 75,42 L 115,55 L 155,68 L 195,78 L 230,82";
  const chartPathPredict = "M 230,82 L 265,102 L 295,118 L 320,130 L 345,138";
  const histLen = 260;
  const predLen = 140;

  const drawT = interpolate(frame, [T_PREDICTIVE_CHART, T_PREDICTIVE_CHART + 30], [0, 1], clamp);
  const histDraw = Math.min(1, drawT * 1.3) * histLen;
  const predDraw = Math.max(0, (drawT - 0.5) * 2) * predLen;

  // Confidence counter 0 → 94
  const confVal = Math.floor(interpolate(frame, [T_PREDICTIVE_CONF, T_PREDICTIVE_CONF + 25], [0, 94], clamp));
  // FOCUS: at the failure prediction moment, card scales UP locally + stronger glow
  const focusT = interpolate(frame, [T_PREDICTIVE_CONF, T_PREDICTIVE_CONF + 10, T_PREDICTIVE_CONF + 30, T_PREDICTIVE_CONF + 42], [0, 1, 1, 0], clamp);
  const focusScale = 1 + focusT * 0.18; // grows up to 1.18×
  const focusGlow = focusT * 0.5;

  return (
    <div style={{
      position: "absolute",
      right: 20,
      bottom: 14,
      width: 380,
      padding: 14,
      backgroundColor: "#FFFFFF",
      border: `1px solid ${focusT > 0.3 ? "#7B2FE3" : ARIA_COLORS.cardBorder}`,
      borderLeft: `3px solid #7B2FE3`,
      borderRadius: ARIA_RADIUS.md,
      boxShadow: focusT > 0.05
        ? `0 ${16 + focusT * 8}px ${40 + focusT * 20}px rgba(123,47,227,${0.2 + focusGlow}), 0 6px 16px rgba(15,18,25,0.1)`
        : "0 12px 32px rgba(15,18,25,0.15), 0 4px 12px rgba(15,18,25,0.08)",
      opacity,
      transform: `translateY(${translateY}px) scale(${scale * focusScale})`,
      transformOrigin: "100% 100%",
      zIndex: 50,
      fontFamily: geistFont,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 6,
          backgroundColor: "#F5F0FF",
          color: "#7B2FE3",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name="trending" size={13} stroke={2.2} color="#7B2FE3" />
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: ARIA_COLORS.foreground, letterSpacing: "0.05em" }}>
          PREDICTIVE INSIGHT
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 10.5, color: ARIA_COLORS.mutedFg, fontWeight: 500 }}>
          <span style={{ color: "#7B2FE3", fontWeight: 700 }}>{confVal}%</span> confidence
        </div>
      </div>

      {/* Chart */}
      <div style={{ position: "relative", height: 120, marginBottom: 10 }}>
        <svg width="100%" height="120" viewBox="0 0 360 150" style={{ position: "absolute", inset: 0 }}>
          {/* Grid lines */}
          <line x1="0" y1="30" x2="360" y2="30" stroke="#F0F2F6" strokeWidth="1" />
          <line x1="0" y1="75" x2="360" y2="75" stroke="#F0F2F6" strokeWidth="1" />
          <line x1="0" y1="120" x2="360" y2="120" stroke="#F0F2F6" strokeWidth="1" />
          {/* Threshold line */}
          <line x1="0" y1="115" x2="360" y2="115" stroke="#DC2626" strokeWidth="1.3" strokeDasharray="4 3" opacity="0.6" />
          <text x="355" y="112" fontSize="9" fill="#DC2626" textAnchor="end" fontFamily={geistFont} fontWeight="600">
            Failure threshold
          </text>
          {/* History area fill */}
          <path
            d={`${chartPathHistory} L 230,150 L 8,150 Z`}
            fill="url(#healthGradient)"
            opacity={histDraw / histLen}
          />
          <defs>
            <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7B2FE3" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#7B2FE3" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* History path */}
          <path
            d={chartPathHistory}
            fill="none"
            stroke="#7B2FE3"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={histLen}
            strokeDashoffset={histLen - histDraw}
          />
          {/* Prediction path (dashed) */}
          <path
            d={chartPathPredict}
            fill="none"
            stroke="#7B2FE3"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 4"
            opacity={predDraw / predLen * 0.9}
          />
          {/* Current point */}
          {drawT > 0.6 && (
            <circle cx="230" cy="82" r="4" fill="#fff" stroke="#7B2FE3" strokeWidth="2" />
          )}
          {/* Failure point (when crosses threshold) — DRAMATIC */}
          {drawT >= 1 && (
            <g>
              {/* Big expanding red ring */}
              <circle cx="320" cy="130" r={8 + (frame - (T_PREDICTIVE_CHART + 30)) % 25 * 1.4} fill="none" stroke="#DC2626" strokeWidth="2"
                opacity={interpolate((frame - T_PREDICTIVE_CHART - 30) % 25, [0, 25], [0.75, 0], clamp)} />
              {/* Smaller fast ring */}
              <circle cx="320" cy="130" r={6 + (frame - (T_PREDICTIVE_CHART + 30)) % 15 * 0.9} fill="none" stroke="#DC2626" strokeWidth="1.5"
                opacity={interpolate((frame - T_PREDICTIVE_CHART - 30) % 15, [0, 15], [0.7, 0], clamp)} />
              {/* Core dot with glow */}
              <circle cx="320" cy="130" r="6" fill="#DC2626"
                filter="drop-shadow(0 0 4px rgba(220,38,38,0.8))" />
              <circle cx="320" cy="130" r="3" fill="#FFF" opacity="0.4" />
              {/* FAILURE callout — appears with spring-like pop */}
              <g transform={`translate(270 105) scale(${interpolate(frame, [T_PREDICTIVE_CHART + 30, T_PREDICTIVE_CHART + 40, T_PREDICTIVE_CHART + 50], [0, 1.15, 1], clamp)})`}
                 opacity={interpolate(frame, [T_PREDICTIVE_CHART + 30, T_PREDICTIVE_CHART + 40], [0, 1], clamp)}>
                <rect x="0" y="0" width="50" height="14" rx="7" fill="#DC2626" />
                <text x="25" y="10" fontSize="8.5" fill="#FFF" textAnchor="middle" fontFamily={geistFont} fontWeight="700" letterSpacing="0.06em">
                  FAILURE
                </text>
              </g>
            </g>
          )}
          {/* Threshold line pulse when prediction hits it */}
          {drawT >= 0.95 && (
            <line x1="0" y1="115" x2="360" y2="115"
              stroke="#DC2626" strokeWidth="2.4" strokeDasharray="4 3"
              opacity={0.3 + Math.abs(Math.sin((frame - T_PREDICTIVE_CHART - 25) * 0.25)) * 0.5} />
          )}
          {/* Axis labels */}
          <text x="8" y="145" fontSize="9" fill="#9AA0B0" fontFamily={geistFont}>-7d</text>
          <text x="220" y="145" fontSize="9" fill="#9AA0B0" fontFamily={geistFont} textAnchor="middle">now</text>
          <text x="345" y="145" fontSize="9" fill="#DC2626" fontFamily={geistFont} textAnchor="end" fontWeight="600">+72h</text>
        </svg>
      </div>

      {/* Insight text */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <div style={{
          width: 20, height: 20, borderRadius: 5, flexShrink: 0,
          backgroundColor: "#FDF1F1",
          color: "#DC2626",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name="alert" size={11} stroke={2.5} color="#DC2626" />
        </div>
        <div style={{ fontSize: 11.5, color: ARIA_COLORS.foreground, lineHeight: 1.4 }}>
          <b style={{ color: "#DC2626" }}>Estimated failure in 48–72h.</b> Pattern match: <b>14</b> similar events in fleet history.
          <div style={{ fontSize: 10.5, color: ARIA_COLORS.mutedFg, marginTop: 4 }}>
            → Act within 24h to avoid unplanned stop.
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── What-If Analysis modal ──────────────────────────────────────────────────
const WhatIfModal: React.FC<{ frame: number; opacity: number; scale: number }> = ({ frame, opacity, scale }) => {
  const cards = [
    { id: "A", title: "Stop immediately",   subtitle: "Halt motor now for full inspection", time: "2h 00m",  cost: "€ 3,200", risk: "LOW",  riskColor: "#1FA870", showAt: T_WHATIF_CARD_A },
    { id: "B", title: "Wait end of shift",  subtitle: "Continue until scheduled break",     time: "4h 15m",  cost: "€ 8,100", risk: "HIGH", riskColor: "#DC2626", showAt: T_WHATIF_CARD_B },
    { id: "C", title: "Schedule in 24h",    subtitle: "Plan parts & team, minimal impact",  time: "1h 00m",  cost: "€ 1,400", risk: "MED",  riskColor: "#E8830A", showAt: T_WHATIF_CARD_C, recommended: true },
  ];

  const recoOp = interpolate(frame, [T_WHATIF_RECO, T_WHATIF_RECO + 15], [0, 1], clamp);

  return (
    <>
      {/* Backdrop — solid dim without blur (blur created ugly ghosting on text behind) */}
      <div style={{
        position: "absolute",
        inset: -20,
        background: "rgba(15,18,25,0.55)",
        opacity,
        zIndex: 80,
      }} />
      {/* Modal */}
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        transform: `translate(-50%, -50%) scale(${scale})`,
        width: 780,
        padding: 22,
        backgroundColor: "#FFFFFF",
        border: `1px solid ${ARIA_COLORS.cardBorder}`,
        borderRadius: ARIA_RADIUS.xl,
        boxShadow: "0 24px 60px rgba(15,18,25,0.35), 0 8px 24px rgba(15,18,25,0.18)",
        opacity,
        zIndex: 90,
        fontFamily: geistFont,
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            backgroundColor: "#EEF4FF",
            color: ARIA_COLORS.primary,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="target" size={15} stroke={2.2} color={ARIA_COLORS.primary} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: ARIA_COLORS.foreground, letterSpacing: "-0.01em" }}>
              What-If Analysis
            </div>
            <div style={{ fontSize: 11, color: ARIA_COLORS.mutedFg, marginTop: 1 }}>
              Scenario impact comparison for A25245-E2PK
            </div>
          </div>
          <div style={{
            width: 24, height: 24, borderRadius: 5,
            border: `1px solid ${ARIA_COLORS.cardBorder}`,
            color: ARIA_COLORS.mutedFg,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="x" size={12} color="#767E8C" />
          </div>
        </div>

        {/* Cards row */}
        <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
          {cards.map((c) => {
            const sp = spring({ frame: frame - c.showAt, fps: 30, config: { stiffness: 140, damping: 20, mass: 0.8 } });
            const t = interpolate(sp, [0, 1], [0, 1], clamp);
            const op = interpolate(frame, [c.showAt, c.showAt + 14], [0, 1], clamp);
            const ty = interpolate(t, [0, 1], [14, 0], clamp);
            const recSelected = c.recommended && frame >= T_WHATIF_RECO;
            // SPOTLIGHT: C grows and stays bold; A & B fade to 55% + shrink slightly
            const spotlightT = interpolate(frame, [T_WHATIF_RECO, T_WHATIF_RECO + 14], [0, 1], clamp);
            const nonRecDim = c.recommended ? 0 : spotlightT;
            const cardOp = op * (1 - nonRecDim * 0.5);
            const recGrow = recSelected
              ? interpolate(frame, [T_WHATIF_RECO, T_WHATIF_RECO + 12, T_WHATIF_RECO + 40], [1, 1.15, 1.12], clamp)
              : 1 - nonRecDim * 0.06;
            const recBreathe = recSelected ? 1 + Math.sin((frame - T_WHATIF_RECO) * 0.2) * 0.008 : 1;

            return (
              <div key={c.id} style={{
                flex: 1,
                padding: 14,
                backgroundColor: recSelected ? "#F4F8FF" : "#FFFFFF",
                border: recSelected ? `2px solid ${ARIA_COLORS.primary}` : `1px solid ${ARIA_COLORS.cardBorder}`,
                borderRadius: ARIA_RADIUS.md,
                opacity: cardOp,
                transform: `translateY(${ty}px) scale(${recGrow * recBreathe})`,
                boxShadow: recSelected
                  ? `0 ${12 + Math.sin((frame - T_WHATIF_RECO) * 0.15) * 2}px 32px rgba(59,91,219,${0.28 + Math.sin((frame - T_WHATIF_RECO) * 0.15) * 0.05}), 0 4px 12px rgba(59,91,219,0.18)`
                  : ARIA_SHADOWS.card,
                position: "relative",
                filter: nonRecDim > 0.5 ? `grayscale(${nonRecDim * 0.4})` : undefined,
              }}>
                {/* Recommended badge */}
                {recSelected && (
                  <div style={{
                    position: "absolute",
                    top: -10,
                    right: 10,
                    padding: "3px 10px",
                    backgroundColor: "#1FA870",
                    color: "#fff",
                    borderRadius: 999,
                    fontSize: 9.5, fontWeight: 700,
                    letterSpacing: "0.08em",
                    boxShadow: "0 4px 12px rgba(31,168,112,0.4)",
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <Icon name="check" size={10} stroke={3} color="#fff" />
                    RECOMMENDED
                  </div>
                )}
                {/* ID circle */}
                <div style={{
                  width: 28, height: 28,
                  borderRadius: "50%",
                  backgroundColor: recSelected ? ARIA_COLORS.primary : ARIA_COLORS.background,
                  color: recSelected ? "#fff" : ARIA_COLORS.mutedFg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700,
                  marginBottom: 10,
                }}>
                  {c.id}
                </div>
                {/* Title */}
                <div style={{ fontSize: 13.5, fontWeight: 600, color: ARIA_COLORS.foreground, letterSpacing: "-0.01em" }}>
                  {c.title}
                </div>
                <div style={{ fontSize: 10.5, color: ARIA_COLORS.mutedFg, marginTop: 3, lineHeight: 1.4, minHeight: 28 }}>
                  {c.subtitle}
                </div>
                {/* Stats */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10, fontSize: 11 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon name="clock" size={11} color="#767E8C" />
                    <span style={{ color: ARIA_COLORS.mutedFg, fontWeight: 500 }}>Downtime</span>
                    <span style={{ flex: 1 }} />
                    <span style={{ color: ARIA_COLORS.foreground, fontWeight: 600 }}>{c.time}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon name="euro" size={11} color="#767E8C" />
                    <span style={{ color: ARIA_COLORS.mutedFg, fontWeight: 500 }}>Cost</span>
                    <span style={{ flex: 1 }} />
                    <span style={{ color: ARIA_COLORS.foreground, fontWeight: 600 }}>{c.cost}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon name="alert" size={11} color="#767E8C" />
                    <span style={{ color: ARIA_COLORS.mutedFg, fontWeight: 500 }}>Risk</span>
                    <span style={{ flex: 1 }} />
                    <span style={{
                      color: c.riskColor,
                      fontWeight: 700,
                      fontSize: 10.5,
                      letterSpacing: "0.05em",
                    }}>
                      {c.risk}
                    </span>
                  </div>
                </div>
                {/* Risk bar */}
                <div style={{
                  marginTop: 10,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: ARIA_COLORS.background,
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: c.risk === "LOW" ? "25%" : c.risk === "MED" ? "55%" : "90%",
                    height: "100%",
                    backgroundColor: c.riskColor,
                    borderRadius: 2,
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* AriA recommendation footer */}
        <div style={{
          marginTop: 16,
          padding: "10px 14px",
          backgroundColor: ARIA_COLORS.aiPanelBg,
          border: `1px solid rgba(59,91,219,0.25)`,
          borderRadius: ARIA_RADIUS.md,
          display: "flex",
          alignItems: "center",
          gap: 10,
          opacity: recoOp,
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: 5,
            backgroundColor: ARIA_COLORS.primary,
            color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="sparkles" size={11} stroke={2.4} color="#fff" />
          </div>
          <div style={{ fontSize: 12, fontWeight: 500, color: ARIA_COLORS.foreground }}>
            <b>AriA's recommendation:</b> Scenario C — schedule maintenance within 24h to minimize cost and risk.
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Reports page ────────────────────────────────────────────────────────────
const ReportsPage: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Realistic industrial values — live micro-tick for "alive" feel.
  const kpiT = 1;
  const tick = (frame - T_REPORTS_NAV) / 30;
  // MTTR hovers around 1h 08m (68 min) ±2 min
  const mttrMinVal  = 68 + Math.sin(tick * 1.2) * 1.2 + Math.sin(tick * 2.5) * 0.6;
  const mttrH = Math.floor(mttrMinVal / 60);
  const mttrM = Math.floor(mttrMinVal % 60);
  const mttrLabel = mttrH > 0 ? `${mttrH}h ${String(mttrM).padStart(2, "0")}m` : `${mttrM}m`;
  // MTTA hovers around 23s ±3s
  const mttaSec = Math.max(18, Math.min(28, Math.floor(23 + Math.sin(tick * 1.7) * 2.5)));
  const mttaLabel = `${mttaSec}s`;
  // Uptime live
  const uptimeVal = 98.4 + Math.sin(tick * 0.9) * 0.06;
  // Resolved counter occasionally ticks up
  const resolvedVal = 128 + Math.floor(Math.max(0, tick / 8));

  // Agent bar chart — AriA's bar grows at the end
  const agents = [
    { name: "AriA",       value: 68, growAt: T_KPI_ANIMATE },
    { name: "Agent A-02", value: 54 },
    { name: "Agent A-01", value: 41 },
    { name: "Manual",     value: 22 },
  ];

  return (
    <div style={{ padding: "16px 24px", height: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* KPI row — realistic industrial values */}
      <div style={{ display: "flex", gap: 10 }}>
        <KpiCard label="MTTR" value={mttrLabel} icon="clock" color="#3B5BDB" trend="-74%" trendColor="#1FA870" />
        <KpiCard label="MTTA" value={mttaLabel} icon="pulse" color="#E8830A" trend="-95%" trendColor="#1FA870" />
        <KpiCard label="Uptime" value={`${uptimeVal.toFixed(1)}%`} icon="trending" color="#1FA870" trend="+4.3%" trendColor="#1FA870" />
        <KpiCard label="Resolved today" value={resolvedVal.toString()} icon="check" color="#7B2FE3" trend="+18%" trendColor="#1FA870" />
      </div>

      {/* Charts row */}
      <div style={{ flex: 1, display: "flex", gap: 10 }}>
        {/* Agent performance bar chart */}
        <div style={{
          flex: 1.2,
          padding: 16,
          backgroundColor: ARIA_COLORS.cardBg,
          border: `1px solid ${ARIA_COLORS.cardBorder}`,
          borderRadius: ARIA_RADIUS.lg,
          boxShadow: ARIA_SHADOWS.card,
          display: "flex",
          flexDirection: "column",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: ARIA_COLORS.foreground, letterSpacing: "-0.005em" }}>
              Agent performance
            </div>
            <div style={{ fontSize: 10.5, color: ARIA_COLORS.mutedFg }}>Last 7 days</div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, justifyContent: "center" }}>
            {agents.map((a) => {
              const isAria = a.name === "AriA";
              const extraGrow = isAria ? interpolate(frame, [T_KPI_ANIMATE, T_KPI_ANIMATE + 30], [0, 3], clamp) : 0;
              const val = a.value + extraGrow;
              const pct = Math.min(100, val);
              return (
                <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 82, fontSize: 11.5, fontWeight: isAria ? 700 : 500, color: isAria ? ARIA_COLORS.primary : ARIA_COLORS.foreground }}>
                    {a.name}
                  </div>
                  <div style={{ flex: 1, height: 18, backgroundColor: ARIA_COLORS.background, borderRadius: 4, overflow: "hidden", position: "relative" }}>
                    <div style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: isAria
                        ? "linear-gradient(90deg, #3B5BDB 0%, #6B8EFF 100%)"
                        : "#B8BDC9",
                      borderRadius: 4,
                      boxShadow: isAria ? "0 2px 6px rgba(59,91,219,0.3)" : "none",
                    }} />
                  </div>
                  <div style={{ width: 48, textAlign: "right", fontSize: 11.5, fontWeight: 600, color: isAria ? ARIA_COLORS.primary : ARIA_COLORS.foreground }}>
                    {Math.round(val)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MTTR trend chart */}
        <div style={{
          flex: 1,
          padding: 16,
          backgroundColor: ARIA_COLORS.cardBg,
          border: `1px solid ${ARIA_COLORS.cardBorder}`,
          borderRadius: ARIA_RADIUS.lg,
          boxShadow: ARIA_SHADOWS.card,
          display: "flex",
          flexDirection: "column",
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: ARIA_COLORS.foreground, letterSpacing: "-0.005em", marginBottom: 2 }}>
            MTTR trend
          </div>
          <div style={{ fontSize: 10.5, color: ARIA_COLORS.mutedFg, marginBottom: 12 }}>Mean time to resolution · last 30 days</div>
          <div style={{ flex: 1, position: "relative" }}>
            <svg viewBox="0 0 300 160" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
              <defs>
                <linearGradient id="mttrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B5BDB" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3B5BDB" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="20" x2="300" y2="20" stroke="#F0F2F6" strokeWidth="1" />
              <line x1="0" y1="70" x2="300" y2="70" stroke="#F0F2F6" strokeWidth="1" />
              <line x1="0" y1="120" x2="300" y2="120" stroke="#F0F2F6" strokeWidth="1" />
              <path d="M 10,60 L 35,55 L 65,70 L 95,58 L 125,64 L 155,52 L 185,48 L 215,42 L 245,35 L 275,30 L 292,130 L 10,130 Z" fill="url(#mttrGrad)" />
              <path d="M 10,60 L 35,55 L 65,70 L 95,58 L 125,64 L 155,52 L 185,48 L 215,42 L 245,35 L 275,30" fill="none" stroke="#3B5BDB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {/* Latest point pulse */}
              <circle cx="275" cy={interpolate(kpiT, [0, 1], [30, 110], clamp)} r="5" fill="#fff" stroke="#3B5BDB" strokeWidth="2" />
              <circle cx="275" cy={interpolate(kpiT, [0, 1], [30, 110], clamp)} r={5 + ((frame - T_KPI_ANIMATE) % 30) / 5} fill="none" stroke="#3B5BDB" strokeWidth="1.5" opacity={interpolate((frame - T_KPI_ANIMATE) % 30, [0, 30], [0.6, 0], clamp)} />
              <text x="275" y={interpolate(kpiT, [0, 1], [22, 102], clamp)} fontSize="10" fill="#3B5BDB" fontFamily={geistFont} textAnchor="middle" fontWeight="600">{mttrLabel}</text>
            </svg>
          </div>
        </div>
      </div>

      {/* Insights strip + Activity feed */}
      <ReportsBottomSection frame={frame} />
    </div>
  );
};

// ─── Reports bottom section: insights strip + AriA activity timeline ─────────
const ReportsBottomSection: React.FC<{ frame: number }> = ({ frame }) => {
  const insightsOp = 1;
  const insightsY  = 0;

  const feedHeaderOp = 1;

  // Activity feed items — most recent autonomous AriA actions (times relative "ago")
  const activities = [
    { time: "just now",  icon: "check",    color: "#1FA870", colorBg: "rgba(31,168,112,0.12)", title: "Alarm A25245-E2PK routed", subtitle: "OVEN_1 · WO dispatched to technician · diagnostic in 23s" },
    { time: "2m ago",    icon: "wrench",   color: "#3B5BDB", colorBg: "rgba(59,91,219,0.12)",  title: "Work order WO-2848 created", subtitle: "Assigned to Marco Rossi · 8 steps, 3 parts, 5 tools" },
    { time: "4m ago",    icon: "target",   color: "#7B2FE3", colorBg: "rgba(123,47,227,0.12)", title: "What-if analysis completed",  subtitle: "Scenario C selected · €1,400 saved vs. scenario B" },
    { time: "5m ago",    icon: "trending", color: "#E8830A", colorBg: "rgba(232,131,10,0.12)", title: "Predictive insight generated", subtitle: "Motor T60M2 · failure in 48-72h · 94% confidence" },
    { time: "7m ago",    icon: "brain",    color: "#3B5BDB", colorBg: "rgba(59,91,219,0.12)",  title: "Root cause analysis drafted", subtitle: "14 similar events matched in fleet history" },
    { time: "12m ago",   icon: "bell",     color: "#DC2626", colorBg: "rgba(220,38,38,0.12)",  title: "Conveyor CB-L2 anomaly resolved", subtitle: "Speed calibration · routed to Agent A-02" },
  ];

  return (
    <>
      {/* Insights strip */}
      <div style={{
        padding: "11px 14px",
        backgroundColor: ARIA_COLORS.aiPanelBg,
        border: `1px solid rgba(59,91,219,0.25)`,
        borderLeft: `3px solid ${ARIA_COLORS.primary}`,
        borderRadius: ARIA_RADIUS.md,
        display: "flex", alignItems: "center", gap: 12,
        opacity: insightsOp,
        transform: `translateY(${insightsY}px)`,
      }}>
        <div style={{
          width: 26, height: 26, borderRadius: 6,
          background: "linear-gradient(135deg, #3B5BDB 0%, #6B8EFF 100%)",
          color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 6px rgba(59,91,219,0.3)",
        }}>
          <Icon name="sparkles" size={14} stroke={2.3} color="#fff" />
        </div>
        <div style={{ flex: 1, fontSize: 12, color: ARIA_COLORS.foreground, fontWeight: 500, lineHeight: 1.35 }}>
          <b style={{ fontSize: 12.5 }}>AriA resolved 87% of alarms autonomously this week</b>
          <span style={{ color: ARIA_COLORS.mutedFg, marginLeft: 6 }}>· saved 32 operator hours · prevented 4 unplanned stops</span>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "3px 9px",
          backgroundColor: "#E8F6F1",
          border: "1px solid #A7DFC8",
          borderRadius: 999,
          fontSize: 10.5, fontWeight: 700,
          color: "#1FA870",
        }}>
          <Icon name="trending" size={10.5} stroke={2.3} color="#1FA870" />
          +43% efficiency
        </div>
      </div>

      {/* Activity feed — recent AriA autonomous actions */}
      <div style={{
        padding: "12px 14px",
        backgroundColor: ARIA_COLORS.cardBg,
        border: `1px solid ${ARIA_COLORS.cardBorder}`,
        borderRadius: ARIA_RADIUS.lg,
        boxShadow: ARIA_SHADOWS.card,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          opacity: feedHeaderOp,
        }}>
          <Icon name="pulse" size={13} stroke={2.2} color={ARIA_COLORS.primary} />
          <div style={{ fontSize: 12.5, fontWeight: 600, color: ARIA_COLORS.foreground, letterSpacing: "-0.005em" }}>
            AriA Activity
          </div>
          <div style={{
            padding: "1px 6px",
            backgroundColor: "rgba(59,91,219,0.08)",
            border: "1px solid rgba(59,91,219,0.2)",
            borderRadius: 4,
            fontSize: 9.5, fontWeight: 700,
            color: ARIA_COLORS.primary,
            letterSpacing: "0.02em",
          }}>
            LIVE
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 10.5, color: ARIA_COLORS.mutedFg }}>Last 15 minutes</div>
        </div>

        <div style={{
          display: "flex", flexDirection: "column", gap: 2,
        }}>
          {activities.map((a, i) => {
            const itemOp = 1;
            const itemX  = 0;
            const isTop = i === 0;
            return (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "7px 4px",
                opacity: itemOp,
                transform: `translateX(${itemX}px)`,
                borderBottom: i < activities.length - 1 ? `1px solid rgba(214,217,227,0.3)` : "none",
                background: isTop
                  ? "linear-gradient(90deg, rgba(31,168,112,0.05) 0%, transparent 60%)"
                  : "transparent",
                borderRadius: 4,
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 7,
                  backgroundColor: a.colorBg,
                  color: a.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  position: "relative",
                }}>
                  <Icon name={a.icon} size={13} stroke={2.2} color={a.color} />
                  {isTop && (
                    <div style={{
                      position: "absolute",
                      inset: -3,
                      borderRadius: 10,
                      border: `2px solid ${a.color}`,
                      opacity: interpolate(frame % 40, [0, 40], [0.5, 0], clamp),
                      transform: `scale(${1 + interpolate(frame % 40, [0, 40], [0, 0.3], clamp)})`,
                      pointerEvents: "none",
                    }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: ARIA_COLORS.foreground, letterSpacing: "-0.005em", lineHeight: 1.3 }}>
                    {a.title}
                  </div>
                  <div style={{ fontSize: 10.5, color: ARIA_COLORS.mutedFg, marginTop: 1, lineHeight: 1.35 }}>
                    {a.subtitle}
                  </div>
                </div>
                <div style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: isTop ? a.color : ARIA_COLORS.labelFg,
                  whiteSpace: "nowrap",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {a.time}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

const KpiCard: React.FC<{ label: string; value: string; icon: string; color: string; trend: string; trendColor: string }> = ({ label, value, icon, color, trend, trendColor }) => (
  <div style={{
    flex: 1,
    padding: "12px 14px",
    backgroundColor: ARIA_COLORS.cardBg,
    border: `1px solid ${ARIA_COLORS.cardBorder}`,
    borderRadius: ARIA_RADIUS.md,
    boxShadow: ARIA_SHADOWS.card,
    display: "flex", flexDirection: "column", gap: 6,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        width: 22, height: 22, borderRadius: 5,
        backgroundColor: color + "18",
        color,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name={icon} size={12} stroke={2.2} color={color} />
      </div>
      <div style={{ fontSize: 10.5, fontWeight: 600, color: ARIA_COLORS.mutedFg, letterSpacing: "0.02em", textTransform: "uppercase" }}>
        {label}
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: ARIA_COLORS.foreground, letterSpacing: "-0.025em" }}>
        {value}
      </div>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: trendColor }}>
        {trend}
      </div>
    </div>
  </div>
);

// ─── Production & IoT page ──────────────────────────────────────────────────
const ProductionPage: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // KPIs live — values micro-tick continuously to feel "alive" (not frozen).
  // Deterministic pseudo-random based on frame → smooth tiny oscillations.
  const tick = (frame - T_PRODUCTION_NAV) / 30;
  const oeeVal        = 87.3 + Math.sin(tick * 1.3) * 0.15 + Math.sin(tick * 2.7) * 0.08;
  const throughputVal = Math.floor(2680 + Math.sin(tick * 1.7) * 12 + Math.cos(tick * 2.3) * 8);
  const qualityVal    = 98.6 + Math.sin(tick * 0.9) * 0.08;
  const availVal      = 94.8 + Math.sin(tick * 1.1) * 0.15 + Math.sin(tick * 3.1) * 0.06;

  // Production lines status
  const lines = [
    { code: "LINE-01", name: "Baking line 02",   status: "Running", output: "612 u/h", target: 650, actual: 612, color: "#1FA870" },
    { code: "LINE-02", name: "Packaging A",      status: "Running", output: "480 u/h", target: 500, actual: 480, color: "#1FA870" },
    { code: "LINE-03", name: "Injection molding",status: "Setup",   output: "0 u/h",   target: 380, actual: 0,   color: "#E8830A" },
    { code: "LINE-04", name: "Assembly line B",  status: "Running", output: "724 u/h", target: 720, actual: 724, color: "#1FA870" },
    { code: "LINE-05", name: "Quality control",  status: "Slowed",  output: "341 u/h", target: 420, actual: 341, color: "#E8830A" },
  ];

  // IoT automation — active rules
  const activeRules = [
    { label: "Predictive alerts",         count: 42, icon: "trending", color: "#7B2FE3" },
    { label: "Auto-dispatch",             count: 18, icon: "flow",     color: "#3B5BDB" },
    { label: "Threshold monitors",        count: 127, icon: "gauge",   color: "#E8830A" },
    { label: "Safety interlocks",         count: 24, icon: "alert",    color: "#DC2626" },
    { label: "Energy optimizations",      count: 9,  icon: "pulse",    color: "#1FA870" },
  ];

  // IoT recent triggers (most recent at top)
  const triggers = [
    { time: "12s ago",  icon: "gauge",    color: "#E8830A", colorBg: "rgba(232,131,10,0.12)", title: "Vibration threshold exceeded on PRS-05",    subtitle: "Auto-routed → maintenance team · pre-emptive WO draft" },
    { time: "38s ago",  icon: "pulse",    color: "#1FA870", colorBg: "rgba(31,168,112,0.12)", title: "Energy peak smoothed on OVEN_1",            subtitle: "Load balanced with OVEN_2 · +3.2% efficiency" },
    { time: "1m ago",   icon: "flow",     color: "#3B5BDB", colorBg: "rgba(59,91,219,0.12)",  title: "Conveyor CB-L2 speed auto-adjusted",        subtitle: "Temperature drop detected · speed +4% to hold throughput" },
    { time: "2m ago",   icon: "alert",    color: "#DC2626", colorBg: "rgba(220,38,38,0.12)",  title: "Safety interlock engaged on IM-07",         subtitle: "Mold change in progress · operator verified" },
    { time: "3m ago",   icon: "trending", color: "#7B2FE3", colorBg: "rgba(123,47,227,0.12)", title: "Predictive trigger: filter COMP-02 90% saturated", subtitle: "WO-2842 auto-created · 48h lead time" },
  ];

  // Chart visible immediately — no internal fade (content must be there when page shows).
  const chartOp = 1;
  const chartDrawT = 1;
  const chartTotalLen = 520;

  return (
    <div style={{ padding: "16px 24px", height: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* KPI row */}
      <div style={{ display: "flex", gap: 10 }}>
        <KpiCard label="OEE" value={`${oeeVal.toFixed(1)}%`} icon="target" color="#3B5BDB" trend="+6.1%" trendColor="#1FA870" />
        <KpiCard label="Throughput" value={`${throughputVal.toLocaleString()} u/h`} icon="trending" color="#1FA870" trend="+9.1%" trendColor="#1FA870" />
        <KpiCard label="Quality" value={`${qualityVal.toFixed(1)}%`} icon="check" color="#7B2FE3" trend="+1.5%" trendColor="#1FA870" />
        <KpiCard label="Availability" value={`${availVal.toFixed(1)}%`} icon="pulse" color="#E8830A" trend="+3.4%" trendColor="#1FA870" />
      </div>

      {/* Top section: Lines + Throughput chart */}
      <div style={{ display: "flex", gap: 10 }}>
        {/* Active production lines */}
        <div style={{
          flex: 1.1,
          padding: 14,
          backgroundColor: ARIA_COLORS.cardBg,
          border: `1px solid ${ARIA_COLORS.cardBorder}`,
          borderRadius: ARIA_RADIUS.lg,
          boxShadow: ARIA_SHADOWS.card,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Icon name="factory" size={13} stroke={2} color={ARIA_COLORS.foreground} />
            <div style={{ fontSize: 12.5, fontWeight: 600, color: ARIA_COLORS.foreground, letterSpacing: "-0.005em" }}>
              Active production lines
            </div>
            <div style={{ flex: 1 }} />
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 10.5, color: ARIA_COLORS.mutedFg, fontWeight: 500,
            }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#1FA870", boxShadow: "0 0 5px rgba(31,168,112,0.5)" }} />
              3 running · 2 slowed
            </div>
          </div>
          <div style={{
            display: "flex", flexDirection: "column", gap: 6,
          }}>
            {lines.map((l, i) => {
              const itemOp = 1;
              const itemX  = 0;
              const fillPct = (l.actual / l.target) * 100;
              const fillT = 1;
              return (
                <div key={l.code} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "7px 4px",
                  opacity: itemOp,
                  transform: `translateX(${itemX}px)`,
                }}>
                  {/* Status dot */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      backgroundColor: l.color,
                    }} />
                    {l.status === "Running" && (
                      <div style={{
                        position: "absolute",
                        inset: -3,
                        borderRadius: "50%",
                        border: `1.5px solid ${l.color}`,
                        opacity: interpolate(frame % 36, [0, 36], [0.5, 0], clamp),
                        transform: `scale(${1 + interpolate(frame % 36, [0, 36], [0, 0.5], clamp)})`,
                      }} />
                    )}
                  </div>
                  {/* Name */}
                  <div style={{ minWidth: 132 }}>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: ARIA_COLORS.labelFg, letterSpacing: "0.04em" }}>
                      {l.code}
                    </div>
                    <div style={{ fontSize: 11.5, fontWeight: 500, color: ARIA_COLORS.foreground, letterSpacing: "-0.005em" }}>
                      {l.name}
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ flex: 1, height: 6, backgroundColor: ARIA_COLORS.background, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      width: `${fillPct * fillT}%`,
                      height: "100%",
                      backgroundColor: l.color,
                      borderRadius: 3,
                      transition: "width 0.1s",
                    }} />
                  </div>
                  {/* Output */}
                  <div style={{ minWidth: 70, textAlign: "right", fontSize: 11, fontWeight: 600, color: ARIA_COLORS.foreground, fontVariantNumeric: "tabular-nums" }}>
                    {l.output}
                  </div>
                  {/* Status pill */}
                  <div style={{ minWidth: 68, display: "flex", justifyContent: "flex-end" }}>
                    <div style={{
                      padding: "2px 8px",
                      backgroundColor: l.color + "18",
                      color: l.color,
                      border: `1px solid ${l.color}40`,
                      borderRadius: 999,
                      fontSize: 9.5, fontWeight: 700,
                      letterSpacing: "0.02em",
                    }}>
                      {l.status}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Throughput live chart */}
        <div style={{
          flex: 1,
          padding: 14,
          backgroundColor: ARIA_COLORS.cardBg,
          border: `1px solid ${ARIA_COLORS.cardBorder}`,
          borderRadius: ARIA_RADIUS.lg,
          boxShadow: ARIA_SHADOWS.card,
          display: "flex", flexDirection: "column",
          opacity: chartOp,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: ARIA_COLORS.foreground, letterSpacing: "-0.005em" }}>
              Throughput live
            </div>
            <div style={{ flex: 1 }} />
            <div style={{
              padding: "1px 7px",
              backgroundColor: "rgba(31,168,112,0.12)",
              color: "#1FA870",
              border: "1px solid rgba(31,168,112,0.3)",
              borderRadius: 999,
              fontSize: 9.5, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 4,
              position: "relative",
            }}>
              <div style={{
                width: 5, height: 5, borderRadius: "50%", backgroundColor: "#1FA870",
                position: "relative",
              }}>
                {/* Continuous pulse ring around the LIVE dot */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: "1.5px solid #1FA870",
                  transform: `scale(${1 + (frame % 30) / 15})`,
                  opacity: interpolate(frame % 30, [0, 30], [0.7, 0], clamp),
                  pointerEvents: "none",
                }} />
              </div>
              LIVE
            </div>
          </div>
          <div style={{ fontSize: 10.5, color: ARIA_COLORS.mutedFg, marginBottom: 8 }}>
            Last 30 minutes · units/hour
          </div>
          <div style={{ flex: 1, position: "relative" }}>
            <svg viewBox="0 0 300 140" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
              <defs>
                <linearGradient id="throughputGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1FA870" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#1FA870" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* grid */}
              <line x1="0" y1="25" x2="300" y2="25" stroke="#F0F2F6" strokeWidth="1" />
              <line x1="0" y1="65" x2="300" y2="65" stroke="#F0F2F6" strokeWidth="1" />
              <line x1="0" y1="105" x2="300" y2="105" stroke="#F0F2F6" strokeWidth="1" />
              {/* Target baseline (dashed) */}
              <line x1="0" y1="50" x2="300" y2="50" stroke="#3B5BDB" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
              <text x="5" y="47" fontSize="9" fill="#3B5BDB" textAnchor="start" fontFamily={geistFont} fontWeight="600">target 2,680 u/h</text>
              {/* Throughput line */}
              <path
                d="M 10,90 L 30,75 L 55,80 L 80,68 L 110,72 L 138,58 L 165,62 L 195,48 L 225,52 L 255,46 L 285,52"
                fill="none"
                stroke="#1FA870"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={chartTotalLen}
                strokeDashoffset={chartTotalLen - chartDrawT * chartTotalLen}
              />
              <path
                d="M 10,90 L 30,75 L 55,80 L 80,68 L 110,72 L 138,58 L 165,62 L 195,48 L 225,52 L 255,46 L 285,52 L 295,130 L 10,130 Z"
                fill="url(#throughputGrad)"
                opacity={chartDrawT}
              />
              {/* Current dot pulse */}
              {chartDrawT >= 0.95 && (
                <>
                  <circle cx="285" cy="52" r="4.5" fill="#fff" stroke="#1FA870" strokeWidth="2" />
                  <circle cx="285" cy="52" r={4.5 + ((frame - T_PROD_CHART_IN - 35) % 30) / 4} fill="none" stroke="#1FA870" strokeWidth="1.5"
                    opacity={interpolate((frame - T_PROD_CHART_IN - 35) % 30, [0, 30], [0.6, 0], clamp)} />
                  <text x="285" y="40" fontSize="10" fill="#1FA870" fontFamily={geistFont} textAnchor="middle" fontWeight="700">2,680</text>
                </>
              )}
            </svg>
          </div>
        </div>
      </div>

      {/* IoT AUTOMATION section */}
      <div style={{
        flex: 1,
        padding: 14,
        backgroundColor: "linear-gradient(180deg, rgba(59,91,219,0.03) 0%, transparent 100%)" as any,
        background: "linear-gradient(180deg, rgba(59,91,219,0.03) 0%, transparent 100%)",
        border: `1px solid ${ARIA_COLORS.cardBorder}`,
        borderRadius: ARIA_RADIUS.lg,
        boxShadow: ARIA_SHADOWS.card,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: "linear-gradient(135deg, #3B5BDB 0%, #6B8EFF 100%)",
            color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 6px rgba(59,91,219,0.3)",
          }}>
            <Icon name="flow" size={14} stroke={2.3} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: ARIA_COLORS.foreground, letterSpacing: "-0.005em" }}>
              IoT Automation
            </div>
            <div style={{ fontSize: 10.5, color: ARIA_COLORS.mutedFg }}>
              2,847 connected devices · 220 active rules
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "3px 9px",
            backgroundColor: "#E8F6F1",
            border: "1px solid #A7DFC8",
            borderRadius: 999,
            fontSize: 10, fontWeight: 700,
            color: "#1FA870",
          }}>
            <Icon name="check" size={10} stroke={2.4} color="#1FA870" />
            All systems operational
          </div>
        </div>

        {/* Active rules row */}
        <div style={{
          display: "flex",
          gap: 8,
        }}>
          {activeRules.map((r) => {
            const rOp = 1;
            return (
              <div key={r.label} style={{
                flex: 1,
                padding: "8px 10px",
                backgroundColor: "#FFFFFF",
                border: `1px solid ${ARIA_COLORS.cardBorder}`,
                borderRadius: ARIA_RADIUS.sm,
                display: "flex",
                flexDirection: "column",
                gap: 3,
                opacity: rOp,
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 9, fontWeight: 700,
                  color: ARIA_COLORS.labelFg,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}>
                  <Icon name={r.icon} size={10} stroke={2} color={r.color} />
                  {r.label}
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: r.color, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
                  {r.count}
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent triggers timeline */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, minHeight: 0 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 10, fontWeight: 700,
            color: ARIA_COLORS.labelFg,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 2,
          }}>
            Recent autonomous triggers
            <div style={{
              padding: "1px 6px",
              backgroundColor: "rgba(59,91,219,0.08)",
              border: "1px solid rgba(59,91,219,0.2)",
              borderRadius: 4,
              fontSize: 9, fontWeight: 700,
              color: ARIA_COLORS.primary,
              letterSpacing: "0.02em",
            }}>
              LIVE
            </div>
          </div>
          <div style={{
            flex: 1, display: "flex", flexDirection: "column", gap: 0, overflow: "hidden",
          }}>
            {triggers.map((t, i) => {
              const itemOp = 1;
              const itemX  = 0;
              const isTop = i === 0;
              return (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "7px 6px",
                  opacity: itemOp,
                  transform: `translateX(${itemX}px)`,
                  borderBottom: i < triggers.length - 1 ? `1px solid rgba(214,217,227,0.3)` : "none",
                }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: 7,
                    backgroundColor: t.colorBg,
                    color: t.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    position: "relative",
                  }}>
                    <Icon name={t.icon} size={13} stroke={2.2} color={t.color} />
                    {isTop && (
                      <div style={{
                        position: "absolute",
                        inset: -3,
                        borderRadius: 10,
                        border: `2px solid ${t.color}`,
                        opacity: interpolate(frame % 40, [0, 40], [0.5, 0], clamp),
                        transform: `scale(${1 + interpolate(frame % 40, [0, 40], [0, 0.3], clamp)})`,
                      }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: ARIA_COLORS.foreground, letterSpacing: "-0.005em", lineHeight: 1.3 }}>
                      {t.title}
                    </div>
                    <div style={{ fontSize: 10.5, color: ARIA_COLORS.mutedFg, marginTop: 1, lineHeight: 1.35 }}>
                      {t.subtitle}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: isTop ? t.color : ARIA_COLORS.labelFg,
                    whiteSpace: "nowrap",
                    fontVariantNumeric: "tabular-nums",
                  }}>
                    {t.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Kanban Board page ──────────────────────────────────────────────────────
// Live board with WO cards flowing through columns, routed by AriA agents.
type KBColumn = "new" | "assigned" | "inprogress" | "review" | "done";
interface KBCard {
  id: string;
  title: string;
  asset: string;
  priority: Priority;
  type: WOType;
  assignee: string;           // technician name or "AriA" or "Agent-0X"
  assigneeInitials: string;
  agent: "AriA" | "Agent-01" | "Agent-02";
  dueRel: string;             // "in 2h", "tomorrow"
  initialCol: KBColumn;
}

const KANBAN_COLUMNS: { key: KBColumn; label: string; color: string; bg: string }[] = [
  { key: "new",        label: "New",          color: "#3B5BDB", bg: "rgba(59,91,219,0.07)" },
  { key: "assigned",   label: "Assigned",     color: "#E8830A", bg: "rgba(232,131,10,0.07)" },
  { key: "inprogress", label: "In progress",  color: "#7B2FE3", bg: "rgba(123,47,227,0.07)" },
  { key: "review",     label: "Review",       color: "#1A1F33", bg: "rgba(26,31,51,0.05)" },
  { key: "done",       label: "Done",         color: "#1FA870", bg: "rgba(31,168,112,0.07)" },
];

const KANBAN_CARDS: KBCard[] = [
  // NEW column
  { id: "WO-2850", title: "Valve VLV-03 leak detection",        asset: "VLV-03",     priority: "High",     type: "Corrective", assignee: "—",           assigneeInitials: "??", agent: "Agent-01", dueRel: "routing…", initialCol: "new" },
  { id: "WO-2849", title: "Bearing SBR-12 thermal anomaly",     asset: "SBR-12",     priority: "Critical", type: "Corrective", assignee: "—",           assigneeInitials: "??", agent: "AriA",     dueRel: "routing…", initialCol: "new" },
  { id: "WO-2848", title: "OVEN_1 Peg Chain T60M2 recovery",    asset: "OVEN_1",     priority: "Critical", type: "Corrective", assignee: "Marco Rossi", assigneeInitials: "MR", agent: "AriA",     dueRel: "in 2h", initialCol: "new" },

  // ASSIGNED column
  { id: "WO-2847", title: "Hydraulic pump PUMP-AX-03 pressure", asset: "PUMP-AX-03", priority: "High",     type: "Corrective", assignee: "Luca Tonti",  assigneeInitials: "LT", agent: "AriA",     dueRel: "in 3h",    initialCol: "assigned" },
  { id: "WO-2846", title: "Conveyor CB-L2 tension calibration", asset: "CB-L2",      priority: "Medium",   type: "Predictive", assignee: "Paolo Bruni", assigneeInitials: "PB", agent: "Agent-02", dueRel: "today",    initialCol: "assigned" },
  { id: "WO-2845", title: "Injection molder IM-07 mold change", asset: "IM-07",      priority: "Medium",   type: "Scheduled",  assignee: "Anna Ferri",  assigneeInitials: "AF", agent: "Agent-01", dueRel: "today",    initialCol: "assigned" },

  // IN PROGRESS
  { id: "WO-2842", title: "Compressor COMP-02 filter replacement", asset: "COMP-02", priority: "Low",    type: "Preventive", assignee: "Davide Moro", assigneeInitials: "DM", agent: "AriA",     dueRel: "running",  initialCol: "inprogress" },
  { id: "WO-2841", title: "Sensor SNS-05 calibration",             asset: "SNS-05",  priority: "Medium", type: "Predictive", assignee: "Sofia Russo", assigneeInitials: "SR", agent: "Agent-02", dueRel: "running",  initialCol: "inprogress" },
  { id: "WO-2840", title: "Motor MTR-09 vibration diagnostic",     asset: "MTR-09",  priority: "High",   type: "Corrective", assignee: "Marco Rossi", assigneeInitials: "MR", agent: "AriA",     dueRel: "running",  initialCol: "inprogress" },

  // REVIEW
  { id: "WO-2838", title: "Tank TNK-02 pressure test",       asset: "TNK-02", priority: "Medium", type: "Preventive", assignee: "Luca Tonti", assigneeInitials: "LT", agent: "AriA", dueRel: "validating", initialCol: "review" },
  { id: "WO-2837", title: "Pump PUMP-BB-01 inspection",      asset: "PUMP-BB-01", priority: "Low", type: "Preventive", assignee: "Anna Ferri", assigneeInitials: "AF", agent: "Agent-01", dueRel: "validating", initialCol: "review" },

  // DONE
  { id: "WO-2836", title: "Heater HEAT-04 thermocouple",     asset: "HEAT-04", priority: "Low",    type: "Corrective", assignee: "Davide Moro", assigneeInitials: "DM", agent: "AriA",     dueRel: "done",  initialCol: "done" },
  { id: "WO-2835", title: "Relay RLY-07 replacement",        asset: "RLY-07",  priority: "Medium", type: "Corrective", assignee: "Sofia Russo", assigneeInitials: "SR", agent: "Agent-02", dueRel: "done",  initialCol: "done" },
  { id: "WO-2834", title: "Sensor array calibration",        asset: "ARR-12",  priority: "Low",    type: "Preventive", assignee: "Paolo Bruni", assigneeInitials: "PB", agent: "AriA",     dueRel: "done",  initialCol: "done" },
];

// New card that auto-appears later in the scene
const KANBAN_NEW_CARD: KBCard = {
  id: "WO-2851",
  title: "Humidity sensor HUM-04 drift detected",
  asset: "HUM-04",
  priority: "Medium",
  type: "Predictive",
  assignee: "—",
  assigneeInitials: "??",
  agent: "AriA",
  dueRel: "routing…",
  initialCol: "new",
};

const KanbanBoardPage: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // ── Generation order: each card gets a "birth frame" so they appear
  //    staggered — feels like agents populating the board live. ──
  const totalCards = KANBAN_CARDS.length;
  const genDuration = T_KB_CARDS_DONE - T_KANBAN_CARDS_IN; // ~65 frames
  const stagger = genDuration / totalCards;
  const cardBirthFrame: Record<string, number> = {};
  KANBAN_CARDS.forEach((c, i) => {
    cardBirthFrame[c.id] = T_KANBAN_CARDS_IN + i * stagger;
  });
  cardBirthFrame[KANBAN_NEW_CARD.id] = T_KB_NEW_CARD;

  // Compute dynamic column assignment — cards can move between columns over time
  const getColumnFor = (card: KBCard): KBColumn => {
    if (card.id === "WO-2848" && frame >= T_KB_MOVE_1) return "assigned";
    if (card.id === "WO-2842" && frame >= T_KB_MOVE_2) return "review";
    if (card.id === "WO-2837" && frame >= T_KB_MOVE_3) return "done";
    if (card.id === "WO-2841" && frame >= T_KB_MOVE_4) return "review";
    return card.initialCol;
  };

  // Cards including the dynamically-created one
  const allCards = frame >= T_KB_NEW_CARD ? [KANBAN_NEW_CARD, ...KANBAN_CARDS] : KANBAN_CARDS;

  // Filter cards that have been "generated" already (birth frame passed)
  const visibleCards = allCards.filter((c) => frame >= cardBirthFrame[c.id]);

  const cardsByColumn: Record<KBColumn, KBCard[]> = {
    new: [], assigned: [], inprogress: [], review: [], done: [],
  };
  visibleCards.forEach((c) => cardsByColumn[getColumnFor(c)].push(c));

  // Agent activity status — rotates over time to feel alive
  const agentStatus = (() => {
    const phase = Math.floor((frame - T_KANBAN_CARDS_IN) / 40) % 4;
    switch (phase) {
      case 0: return { aria: "routing 2 items", a01: "analyzing vibration", a02: "dispatching WO" };
      case 1: return { aria: "creating WO-2851", a01: "validating parts",    a02: "routing alarm" };
      case 2: return { aria: "matching agent",   a01: "scanning fleet",      a02: "confirming assignment" };
      default:return { aria: "auto-prioritizing", a01: "updating schedule",  a02: "checking inventory" };
    }
  })();
  // Generation counter: how many cards have been generated so far
  const generatedCount = visibleCards.length;
  const totalExpected = frame >= T_KB_NEW_CARD ? KANBAN_CARDS.length + 1 : KANBAN_CARDS.length;
  const stillGenerating = frame < T_KB_CARDS_DONE;

  return (
    <div style={{
      padding: "14px 20px",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 12,
      overflow: "hidden",
    }}>
      {/* Header strip with live agent status */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "10px 14px",
        backgroundColor: ARIA_COLORS.cardBg,
        border: `1px solid ${ARIA_COLORS.cardBorder}`,
        borderRadius: ARIA_RADIUS.md,
        boxShadow: ARIA_SHADOWS.card,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 7,
          background: "linear-gradient(135deg, #3B5BDB 0%, #6B8EFF 100%)",
          color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 6px rgba(59,91,219,0.3)",
          position: "relative",
        }}>
          <Icon name="sparkles" size={15} stroke={2.3} color="#fff" />
          {/* Rotating gradient ring when generating */}
          {stillGenerating && (
            <div style={{
              position: "absolute",
              inset: -2,
              borderRadius: 9,
              background: `conic-gradient(from ${frame * 8}deg, #3B5BDB, #6B8EFF, #7B2FE3, #3B5BDB)`,
              zIndex: -1,
              filter: "blur(2px)",
            }} />
          )}
        </div>
        <div style={{ flex: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: ARIA_COLORS.foreground, letterSpacing: "-0.005em" }}>
            {stillGenerating ? "Agents generating board…" : "Autonomous routing active"}
          </div>
          <div style={{ fontSize: 11, color: ARIA_COLORS.mutedFg, marginTop: 1, fontVariantNumeric: "tabular-nums" }}>
            {stillGenerating
              ? `${generatedCount} / ${totalExpected} work orders routed · MTTA 23s`
              : `${generatedCount} work orders · 3 agents active · MTTA 23s avg`}
          </div>
        </div>

        {/* Live agent activity pills */}
        <div style={{ flex: 1, display: "flex", gap: 7, marginLeft: 12, overflow: "hidden" }}>
          {[
            { name: "AriA",     color: "#3B5BDB", status: agentStatus.aria },
            { name: "Agent-01", color: "#7B2FE3", status: agentStatus.a01 },
            { name: "Agent-02", color: "#E8830A", status: agentStatus.a02 },
          ].map((a, i) => (
            <div key={a.name} style={{
              flex: 1,
              minWidth: 0,
              padding: "4px 9px",
              backgroundColor: a.color + "12",
              border: `1px solid ${a.color}35`,
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              gap: 7,
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Agent avatar */}
              <div style={{
                width: 20, height: 20, borderRadius: "50%",
                backgroundColor: a.color, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 8.5, fontWeight: 700,
                flexShrink: 0,
                position: "relative",
              }}>
                {a.name === "AriA" ? <Icon name="sparkles" size={9} stroke={2.4} color="#fff" /> : a.name.slice(-2)}
                {/* Pulse indicator */}
                <div style={{
                  position: "absolute", inset: -2,
                  borderRadius: "50%",
                  border: `1.5px solid ${a.color}`,
                  opacity: interpolate((frame + i * 12) % 45, [0, 45], [0.6, 0], clamp),
                  transform: `scale(${1 + interpolate((frame + i * 12) % 45, [0, 45], [0, 0.5], clamp)})`,
                  pointerEvents: "none",
                }} />
              </div>
              {/* Agent name + status */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: a.color, letterSpacing: "0.02em", lineHeight: 1.2 }}>
                  {a.name}
                </div>
                <div style={{
                  fontSize: 9, color: ARIA_COLORS.mutedFg, fontWeight: 500,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {a.status}
                  <span style={{ marginLeft: 2, opacity: (frame / 8) % 3 < 1 ? 0.3 : (frame / 8) % 3 < 2 ? 0.6 : 1 }}>•</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "3px 9px",
          backgroundColor: "#E8F6F1",
          border: "1px solid #A7DFC8",
          borderRadius: 999,
          fontSize: 10, fontWeight: 700,
          color: "#1FA870",
          flexShrink: 0,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#1FA870",
            boxShadow: `0 0 ${4 + Math.sin(frame * 0.2) * 3}px rgba(31,168,112,0.6)` }} />
          LIVE
        </div>
      </div>

      {/* Kanban columns */}
      <div style={{ flex: 1, display: "flex", gap: 10, overflow: "hidden" }}>
        {KANBAN_COLUMNS.map((col) => {
          const cards = cardsByColumn[col.key];
          return (
            <div key={col.key} style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              backgroundColor: col.bg,
              border: `1px solid ${ARIA_COLORS.cardBorder}`,
              borderRadius: ARIA_RADIUS.md,
              overflow: "hidden",
              minWidth: 0,
            }}>
              {/* Column header */}
              <div style={{
                padding: "9px 12px",
                display: "flex",
                alignItems: "center",
                gap: 7,
                borderBottom: `1px solid ${ARIA_COLORS.cardBorder}`,
                backgroundColor: "rgba(255,255,255,0.5)",
              }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: col.color }} />
                <div style={{ fontSize: 11, fontWeight: 700, color: ARIA_COLORS.foreground, letterSpacing: "0.04em", textTransform: "uppercase", flex: 1 }}>
                  {col.label}
                </div>
                <div style={{
                  minWidth: 20, height: 18, padding: "0 6px",
                  borderRadius: 9,
                  backgroundColor: col.color,
                  color: "#fff",
                  fontSize: 10, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {cards.length}
                </div>
              </div>

              {/* Cards */}
              <div style={{
                flex: 1,
                padding: "8px 8px",
                display: "flex",
                flexDirection: "column",
                gap: 7,
                overflow: "hidden",
              }}>
                {cards.map((card) => (
                  <KBCardView
                    key={card.id}
                    card={card}
                    frame={frame}
                    colorAccent={col.color}
                    birthFrame={cardBirthFrame[card.id]}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const KBCardView: React.FC<{ card: KBCard; frame: number; colorAccent: string; birthFrame: number }> = ({ card, frame, colorAccent, birthFrame }) => {
  // Determine the most relevant "entrance event":
  //  1. Initial generation (birthFrame) — card appears for the first time
  //  2. Move between columns (WO-2848/2842/2837/2841) — card re-enters with flash
  const moveFrame =
    card.id === "WO-2848" && frame >= T_KB_MOVE_1 ? T_KB_MOVE_1 :
    card.id === "WO-2842" && frame >= T_KB_MOVE_2 ? T_KB_MOVE_2 :
    card.id === "WO-2837" && frame >= T_KB_MOVE_3 ? T_KB_MOVE_3 :
    card.id === "WO-2841" && frame >= T_KB_MOVE_4 ? T_KB_MOVE_4 :
    -1;
  // Use the MOST RECENT event (move takes precedence over birth)
  const showFrame = moveFrame > 0 ? moveFrame : birthFrame;

  // Entrance animation: scale-up + slide + fade + glow pulse
  const entryOp    = interpolate(frame, [showFrame, showFrame + 10], [0, 1], clamp);
  const entryX     = interpolate(frame, [showFrame, showFrame + 14], [-16, 0], clamp);
  const entryScale = interpolate(frame, [showFrame, showFrame + 6, showFrame + 16], [0.85, 1.04, 1], clamp);
  const entryPulse = frame < showFrame + 28
    ? interpolate(frame, [showFrame, showFrame + 14], [1, 0], clamp)
    : 0;
  // "JUST GENERATED" / "JUST ROUTED" badge visible briefly after entry
  const badgeOp = frame < showFrame + 22
    ? interpolate(frame, [showFrame, showFrame + 4, showFrame + 18, showFrame + 22], [0, 1, 1, 0], clamp)
    : 0;
  const isMove = moveFrame > 0;

  const priorityColor =
    card.priority === "Critical" ? "#DC2626" :
    card.priority === "High"     ? "#E8830A" :
    card.priority === "Medium"   ? "#7B2FE3" : "#B8BDC9";
  const agentColor =
    card.agent === "AriA"     ? "#3B5BDB" :
    card.agent === "Agent-01" ? "#7B2FE3" : "#E8830A";

  return (
    <div style={{
      padding: "8px 10px",
      backgroundColor: "#FFFFFF",
      border: `1px solid ${ARIA_COLORS.cardBorder}`,
      borderLeft: `3px solid ${priorityColor}`,
      borderRadius: ARIA_RADIUS.sm,
      boxShadow: entryPulse > 0.1
        ? `0 0 ${18 * entryPulse}px ${colorAccent}${Math.round(entryPulse * 70).toString(16).padStart(2, "0")}, 0 1px 3px rgba(15,18,25,0.04)`
        : "0 1px 3px rgba(15,18,25,0.04)",
      opacity: entryOp,
      transform: `translateX(${entryX}px) scale(${entryScale})`,
      transformOrigin: "left center",
      position: "relative",
      willChange: "transform, opacity",
    }}>
      {/* Expanding ring when card just entered */}
      {entryPulse > 0.05 && (
        <div style={{
          position: "absolute",
          inset: -2,
          borderRadius: 8,
          border: `2px solid ${colorAccent}`,
          opacity: entryPulse * 0.7,
          transform: `scale(${1 + (1 - entryPulse) * 0.12})`,
          pointerEvents: "none",
        }} />
      )}
      {/* Shimmer sweep during entry — feels like content is being "typed in" */}
      {entryOp < 1 && (
        <div style={{
          position: "absolute",
          inset: 0,
          borderRadius: 6,
          background: `linear-gradient(90deg, transparent 0%, ${colorAccent}20 50%, transparent 100%)`,
          transform: `translateX(${interpolate(frame, [showFrame, showFrame + 14], [-100, 100], clamp)}%)`,
          pointerEvents: "none",
        }} />
      )}
      {/* "NEW" / "ROUTED" floating badge */}
      {badgeOp > 0.1 && (
        <div style={{
          position: "absolute",
          top: -7,
          right: 6,
          padding: "1px 6px",
          backgroundColor: isMove ? colorAccent : "#1FA870",
          color: "#fff",
          borderRadius: 999,
          fontSize: 8, fontWeight: 700,
          letterSpacing: "0.08em",
          boxShadow: `0 2px 6px ${isMove ? colorAccent : "#1FA870"}60`,
          opacity: badgeOp,
          pointerEvents: "none",
        }}>
          {isMove ? "ROUTED" : "NEW"}
        </div>
      )}

      {/* Top row: code + agent badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
        <span style={{ fontSize: 9.5, fontWeight: 700, color: ARIA_COLORS.labelFg, letterSpacing: "0.02em" }}>
          {card.id}
        </span>
        <div style={{ flex: 1 }} />
        <div style={{
          padding: "1px 5px",
          backgroundColor: agentColor + "18",
          color: agentColor,
          border: `1px solid ${agentColor}40`,
          borderRadius: 4,
          fontSize: 8.5,
          fontWeight: 700,
          letterSpacing: "0.02em",
          display: "flex", alignItems: "center", gap: 3,
        }}>
          {card.agent === "AriA" && <Icon name="sparkles" size={8} stroke={2.5} color={agentColor} />}
          {card.agent}
        </div>
      </div>

      {/* Title */}
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        color: ARIA_COLORS.foreground,
        letterSpacing: "-0.005em",
        lineHeight: 1.3,
        marginBottom: 6,
        overflow: "hidden",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical" as const,
      }}>
        {card.title}
      </div>

      {/* Bottom row: priority + assignee + due */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{
          padding: "1px 6px",
          backgroundColor: priorityColor + "18",
          color: priorityColor,
          border: `1px solid ${priorityColor}40`,
          borderRadius: 3,
          fontSize: 8.5,
          fontWeight: 700,
          letterSpacing: "0.02em",
        }}>
          {card.priority.toUpperCase().slice(0, 4)}
        </div>
        <div style={{ flex: 1 }} />
        {/* Assignee avatar */}
        {card.assigneeInitials !== "??" ? (
          <div style={{
            width: 18, height: 18, borderRadius: "50%",
            background: "linear-gradient(135deg, #3B5BDB 0%, #6B8EFF 100%)",
            color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 8, fontWeight: 700,
            border: "1.5px solid #fff",
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}>
            {card.assigneeInitials}
          </div>
        ) : (
          <div style={{
            width: 18, height: 18, borderRadius: "50%",
            backgroundColor: "#F3F4F7",
            border: `1.5px dashed ${ARIA_COLORS.mutedFg}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="sparkles" size={8} stroke={2.4} color="#9AA0B0" />
          </div>
        )}
        <div style={{
          fontSize: 9.5,
          fontWeight: 500,
          color: card.dueRel === "done" ? "#1FA870" :
                 card.dueRel === "running" ? "#7B2FE3" :
                 card.dueRel === "validating" ? ARIA_COLORS.mutedFg :
                 card.dueRel === "routing…" ? ARIA_COLORS.primary :
                 ARIA_COLORS.foreground,
          fontStyle: card.dueRel === "routing…" || card.dueRel === "validating" || card.dueRel === "running" ? "italic" : "normal",
          whiteSpace: "nowrap",
        }}>
          {card.dueRel}
        </div>
      </div>
    </div>
  );
};
