import React from "react";
import {
  AbsoluteFill, interpolate, spring,
  useCurrentFrame, useVideoConfig,
} from "remotion";
import { ARIA_COLORS, ARIA_SHADOWS, ARIA_RADIUS, geistFont } from "../constants";
import { AriAShell } from "../components/AriAShell";

// ══════════════════════════════════════════════════════════════
//  PHASE TIMINGS  (540 frames = 18 s)
// ══════════════════════════════════════════════════════════════
const P_LIST_IN      = 0;    // Alarm cards fly in (staggered over ~4s)
const P_ALARM1_SEL   = 90;   // Cursor selects A001
const P_DETAIL_IN    = 108;  // Detail panel slides in
const P_AI_IN        = 130;  // AI diagnosis items appear (22 frames apart)
const P_DIAG_BTN     = 220;  // "Complete Diagnosis" button appears
const P_CAUSES_TAB   = 250;  // Cursor clicks Causes tab
const P_CAUSES_IN    = 266;  // Causes list stagger in (15 frames apart)
const P_RES_TAB      = 360;  // Cursor clicks Resolution tab
const P_RES_STEPS    = 376;  // Resolution steps stagger in (12 frames apart)
const P_ALARM2_SEL   = 464;  // Cursor moves to A002
const P_DETAIL2_IN   = 480;  // A002 detail slides in
const P_AI2_IN       = 498;  // A002 AI diagnosis (22 frames apart)
const P_END          = 540;

// ══════════════════════════════════════════════════════════════
//  DATA
// ══════════════════════════════════════════════════════════════
const ALARMS = [
  // ── CRITICAL ──────────────────────────────────────────────
  {
    code: "A001-S20S8E1", asset: "MOT-401", assetFull: "MOT-401 — Main shaft motor",
    desc: "Critical bearing temperature: 89 °C (threshold: 75 °C)",
    category: "Temperature",
    catColor: { bg:"#FFF7ED", text:"#9A3412", border:"#FED7AA" },
    zone: "Line A — Zone 3",
    severity: "CRITICAL",
    sevColor: { bg:ARIA_COLORS.criticalMuted, text:ARIA_COLORS.critical, border:ARIA_COLORS.criticalBorder },
    dot: ARIA_COLORS.critical, appear: P_LIST_IN + 8,
  },
  {
    code: "A009-S11C2E1", asset: "CHT-107", assetFull: "CHT-107 — Coolant heat exchanger",
    desc: "Coolant outlet temperature: 97 °C — cooling circuit fault suspected",
    category: "Temperature",
    catColor: { bg:"#FFF7ED", text:"#9A3412", border:"#FED7AA" },
    zone: "Cooling Tower — North",
    severity: "CRITICAL",
    sevColor: { bg:ARIA_COLORS.criticalMuted, text:ARIA_COLORS.critical, border:ARIA_COLORS.criticalBorder },
    dot: ARIA_COLORS.critical, appear: P_LIST_IN + 22,
  },
  {
    code: "A010-S05E3F1", asset: "ELT-023", assetFull: "ELT-023 — Main electrical panel",
    desc: "Ground fault detected on circuit L3 — residual current: 42 mA",
    category: "Electrical",
    catColor: { bg:"#FDF4FF", text:"#7E22CE", border:"#E9D5FF" },
    zone: "Control Room",
    severity: "CRITICAL",
    sevColor: { bg:ARIA_COLORS.criticalMuted, text:ARIA_COLORS.critical, border:ARIA_COLORS.criticalBorder },
    dot: ARIA_COLORS.critical, appear: P_LIST_IN + 36,
  },
  // ── WARNING ──────────────────────────────────────────────
  {
    code: "A002-S15P3E2", asset: "PMP-203", assetFull: "PMP-203 — Inlet pump",
    desc: "Inlet pressure out of range: 2.1 bar (expected: 3.0–4.5 bar)",
    category: "Pressure",
    catColor: { bg:"#FFFBEB", text:"#92400E", border:"#FDE68A" },
    zone: "Pump Room B",
    severity: "WARNING",
    sevColor: { bg:ARIA_COLORS.warningMuted, text:ARIA_COLORS.warning, border:ARIA_COLORS.warningBorder },
    dot: ARIA_COLORS.warning, appear: P_LIST_IN + 50,
  },
  {
    code: "A003-S12V7E1", asset: "CNV-118", assetFull: "CNV-118 — Conveyor belt",
    desc: "Drive shaft vibration +18% above baseline (4.2 mm/s → 5.1 mm/s)",
    category: "Vibration",
    catColor: { bg:"#EEF2FF", text:"#3730A3", border:"#C7D2FE" },
    zone: "Line B — Zone 1",
    severity: "WARNING",
    sevColor: { bg:ARIA_COLORS.warningMuted, text:ARIA_COLORS.warning, border:ARIA_COLORS.warningBorder },
    dot: ARIA_COLORS.warning, appear: P_LIST_IN + 64,
  },
  {
    code: "A005-S22T4E1", asset: "VLV-044", assetFull: "VLV-044 — Bypass valve",
    desc: "Actuator position error: commanded 100%, feedback 73%",
    category: "Mechanical",
    catColor: { bg:"#F5F3FF", text:"#6D28D9", border:"#DDD6FE" },
    zone: "Line A — Zone 1",
    severity: "WARNING",
    sevColor: { bg:ARIA_COLORS.warningMuted, text:ARIA_COLORS.warning, border:ARIA_COLORS.warningBorder },
    dot: ARIA_COLORS.warning, appear: P_LIST_IN + 78,
  },
  {
    code: "A007-S18M5E2", asset: "MTR-305", assetFull: "MTR-305 — Feed motor",
    desc: "Motor current overload: 38.4 A (rated: 32 A) — duty cycle exceeded",
    category: "Electrical",
    catColor: { bg:"#FDF4FF", text:"#7E22CE", border:"#E9D5FF" },
    zone: "Line C — Zone 2",
    severity: "WARNING",
    sevColor: { bg:ARIA_COLORS.warningMuted, text:ARIA_COLORS.warning, border:ARIA_COLORS.warningBorder },
    dot: ARIA_COLORS.warning, appear: P_LIST_IN + 92,
  },
  // ── INFO ─────────────────────────────────────────────────
  {
    code: "A004-S08F2E3", asset: "CMP-101", assetFull: "CMP-101 — Air compressor",
    desc: "Filter differential pressure: 0.8 bar (limit: 0.6 bar) — replacement required",
    category: "Filtration",
    catColor: { bg:"#F0FDF4", text:"#166534", border:"#BBF7D0" },
    zone: "Compressor Room",
    severity: "INFO",
    sevColor: { bg:"#EFF6FF", text:"#1D4ED8", border:"#BFDBFE" },
    dot: "#3B82F6", appear: P_LIST_IN + 106,
  },
  {
    code: "A006-S09S1E1", asset: "HMI-012", assetFull: "HMI-012 — Operator panel",
    desc: "E-Stop button acknowledged — machine resumed normal operation",
    category: "Safety",
    catColor: { bg:"#FFF1F2", text:"#9F1239", border:"#FECDD3" },
    zone: "Line A — Zone 3",
    severity: "INFO",
    sevColor: { bg:"#EFF6FF", text:"#1D4ED8", border:"#BFDBFE" },
    dot: "#3B82F6", appear: P_LIST_IN + 118,
  },
  {
    code: "A008-S14T3E2", asset: "SNS-201", assetFull: "SNS-201 — PT100 sensor",
    desc: "Sensor drift detected: offset +2.3 °C — calibration recommended",
    category: "Sensor",
    catColor: { bg:"#F0F9FF", text:"#0369A1", border:"#BAE6FD" },
    zone: "Main Line",
    severity: "INFO",
    sevColor: { bg:"#EFF6FF", text:"#1D4ED8", border:"#BFDBFE" },
    dot: "#3B82F6", appear: P_LIST_IN + 130,
  },
];

// ── A001 detail data ───────────────────────────────────────────
const AI_DIAGNOSIS_1 = [
  { label:"Probable cause",     value:"Stage 2–3 bearing wear",       frame: P_AI_IN      },
  { label:"Operating hours",    value:"847 h (threshold: 800 h)",     frame: P_AI_IN + 22 },
  { label:"Estimated risk",     value:"Failure within 48–72 hours",   frame: P_AI_IN + 44 },
  { label:"Recommended action", value:"Immediate replacement",        frame: P_AI_IN + 66 },
];

const CAUSES_1 = [
  "Stage 2–3 bearing wear due to insufficient lubrication",
  "Contaminated lubricant or wrong viscosity grade",
  "Excessive radial load beyond design specifications",
  "Improper shaft-to-coupling alignment causing thermal stress",
  "Operating beyond rated duty cycle — thermal fatigue accumulation",
];

const RESOLUTION_STEPS = [
  "Lock out / Tag out motor MOT-401 (LOTO procedure)",
  "Measure bearing temperature with contact thermometer",
  "Remove bearing housing cover — drive-end side",
  "Inspect bearings for wear, pitting, or discoloration",
  "Replace bearings: SKF 6308-2RS × 2 units",
  "Relubricate with Mobil XHP 222 grease (3–4 pumps)",
  "Reinstall housing and verify axial play (< 0.1 mm)",
  "Run at 20% load for 30 min — monitor temperature",
];

// ── A002 detail data ───────────────────────────────────────────
const AI_DIAGNOSIS_2 = [
  { label:"Probable cause",     value:"Partial blockage in inlet line",    frame: P_AI2_IN      },
  { label:"Last maintenance",   value:"312 days ago",                      frame: P_AI2_IN + 22 },
  { label:"Estimated risk",     value:"Flow reduction — 15% capacity loss",frame: P_AI2_IN + 44 },
  { label:"Recommended action", value:"Inspect inlet valve and filter",    frame: P_AI2_IN + 66 },
];

// ══════════════════════════════════════════════════════════════
//  CURSOR
// ══════════════════════════════════════════════════════════════
const Cursor: React.FC<{ x:number; y:number; clicking:boolean }> = ({ x, y, clicking }) => (
  <div style={{ position:"absolute", left:x-2, top:y-2, zIndex:200, pointerEvents:"none" }}>
    {clicking && (
      <div style={{
        position:"absolute", left:-14, top:-14, width:32, height:32,
        borderRadius:"50%", border:`2px solid ${ARIA_COLORS.primary}`, opacity:0.65,
      }} />
    )}
    <svg width="22" height="26" viewBox="0 0 22 26" fill="none">
      <path d="M3 1 L3 21 L7.5 16.5 L10.5 24 L13 23 L10 15.5 L17 15.5 Z"
        fill="white" stroke="#1A1F33" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  </div>
);

// ══════════════════════════════════════════════════════════════
//  ALARM CARD
// ══════════════════════════════════════════════════════════════
const AlarmCard: React.FC<{
  alarm: typeof ALARMS[0]; selected:boolean; frame:number; fps:number;
}> = ({ alarm, selected, frame, fps }) => {
  if (frame < alarm.appear) return null;
  const en = spring({ frame:frame-alarm.appear, fps, config:{ damping:20, stiffness:240, mass:0.5 } });
  return (
    <div style={{
      opacity:         interpolate(en,[0,1],[0,1]),
      transform:       `translateY(${interpolate(en,[0,1],[10,0])}px)`,
      padding:         "9px 14px 9px 16px",
      borderRadius:    ARIA_RADIUS.lg,
      backgroundColor: selected ? ARIA_COLORS.cardBg : "rgba(255,255,255,0.5)",
      border:          `1px solid ${selected ? alarm.sevColor.border : ARIA_COLORS.cardBorder}`,
      borderLeft:      `3px solid ${selected ? alarm.dot : "transparent"}`,
      boxShadow:       selected ? `0 2px 12px -2px ${alarm.dot}30` : ARIA_SHADOWS.card,
      cursor:          "pointer",
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{
          fontFamily:"'Geist Mono',monospace", fontSize:10, fontWeight:700,
          color:alarm.dot, letterSpacing:"0.02em",
        }}>{alarm.code}</span>
        <span style={{
          fontFamily:geistFont, fontSize:9, fontWeight:700,
          color:alarm.sevColor.text, backgroundColor:alarm.sevColor.bg,
          border:`1px solid ${alarm.sevColor.border}`,
          borderRadius:ARIA_RADIUS.full, padding:"2px 7px",
        }}>{alarm.severity}</span>
      </div>
      <div style={{
        fontFamily:geistFont, fontSize:11, color:ARIA_COLORS.foreground,
        lineHeight:1.35, marginBottom:5,
        overflow:"hidden", display:"-webkit-box",
        WebkitLineClamp:2, WebkitBoxOrient:"vertical",
      }}>{alarm.desc}</div>
      <div style={{ display:"flex", alignItems:"center", gap:5 }}>
        <span style={{
          fontFamily:geistFont, fontSize:9, fontWeight:500,
          color:alarm.catColor.text, backgroundColor:alarm.catColor.bg,
          border:`1px solid ${alarm.catColor.border}`,
          borderRadius:ARIA_RADIUS.sm, padding:"1px 6px",
        }}>{alarm.category}</span>
        <span style={{ fontFamily:geistFont, fontSize:9, color:ARIA_COLORS.mutedFg }}>
          {alarm.zone}
        </span>
        <span style={{
          marginLeft:"auto", fontFamily:"'Geist Mono',monospace",
          fontSize:9, fontWeight:600, color:ARIA_COLORS.mutedFg,
        }}>{alarm.asset}</span>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
//  DETAIL PANEL
// ══════════════════════════════════════════════════════════════
const AlarmDetail: React.FC<{ frame:number; fps:number }> = ({ frame, fps }) => {
  if (frame < P_DETAIL_IN) return null;

  // Switch between A001 and A002 detail
  const showAlarm2 = frame >= P_DETAIL2_IN;
  const alarm = showAlarm2 ? ALARMS[3] : ALARMS[0]; // A002=index3, A001=index0

  // Panel slide-in (re-triggers on alarm switch)
  const enterBase = showAlarm2 ? P_DETAIL2_IN : P_DETAIL_IN;
  const enter = spring({ frame:frame-enterBase, fps, config:{ damping:22, stiffness:150 } });

  const activeTab = showAlarm2
    ? "details"  // A002 always shows Details
    : frame >= P_RES_TAB ? "resolution" : frame >= P_CAUSES_TAB ? "causes" : "details";

  const aiDiagData  = showAlarm2 ? AI_DIAGNOSIS_2 : AI_DIAGNOSIS_1;

  return (
    <div style={{
      flex:1,
      opacity:   interpolate(enter,[0,1],[0,1]),
      transform:`translateX(${interpolate(enter,[0,1],[24,0])}px)`,
      display:"flex", flexDirection:"column", overflow:"hidden",
      borderLeft:`1px solid ${ARIA_COLORS.cardBorder}`,
    }}>
      {/* ── Header ── */}
      <div style={{
        padding:"14px 20px 0",
        borderBottom:`1px solid ${ARIA_COLORS.cardBorder}`,
        flexShrink:0,
      }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:8 }}>
          <div>
            <div style={{
              fontFamily:"'Geist Mono',monospace", fontSize:11,
              color:alarm.dot, fontWeight:700, marginBottom:3,
            }}>{alarm.code}</div>
            <div style={{
              fontFamily:geistFont, fontSize:15, fontWeight:600,
              color:ARIA_COLORS.foreground, letterSpacing:"-0.01em", lineHeight:1.3,
            }}>
              {showAlarm2 ? "Inlet pressure out of range" : "Critical bearing temperature"}
            </div>
            <div style={{ fontFamily:geistFont, fontSize:11, color:ARIA_COLORS.mutedFg, marginTop:3 }}>
              {alarm.assetFull}
            </div>
          </div>
          <span style={{
            fontFamily:geistFont, fontSize:10, fontWeight:700, flexShrink:0,
            color:alarm.sevColor.text, backgroundColor:alarm.sevColor.bg,
            border:`1px solid ${alarm.sevColor.border}`,
            borderRadius:ARIA_RADIUS.full, padding:"4px 12px",
          }}>{alarm.severity}</span>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex" }}>
          {["Details","Causes","Resolution","History"].map((tab, i) => {
            const key = ["details","causes","resolution","history"][i];
            const isActive = key === activeTab;
            return (
              <div key={tab} style={{
                fontFamily:geistFont, fontSize:12,
                fontWeight:isActive?600:400,
                color:isActive?ARIA_COLORS.primary:ARIA_COLORS.mutedFg,
                padding:"6px 14px",
                borderBottom:isActive?`2px solid ${ARIA_COLORS.primary}`:"2px solid transparent",
                marginBottom:-1,
              }}>{tab}</div>
            );
          })}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {activeTab === "details" && (
          <div style={{ flex:1, padding:"14px 18px", overflow:"hidden", display:"flex", flexDirection:"column", gap:12 }}>

            {/* AI Diagnosis card */}
            <div style={{
              backgroundColor:ARIA_COLORS.aiPanelBg,
              border:`1px solid ${ARIA_COLORS.primaryBorder}`,
              borderRadius:ARIA_RADIUS.lg, overflow:"hidden",
            }}>
              <div style={{
                padding:"8px 14px", borderBottom:`1px solid ${ARIA_COLORS.primaryBorder}`,
                backgroundColor:ARIA_COLORS.primaryLight,
                display:"flex", alignItems:"center", gap:7,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={ARIA_COLORS.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
                </svg>
                <span style={{
                  fontFamily:geistFont, fontSize:10, fontWeight:600,
                  color:ARIA_COLORS.primary, textTransform:"uppercase", letterSpacing:"0.08em",
                }}>AriA · Automatic Diagnosis</span>
              </div>
              <div style={{ padding:"12px 14px", display:"flex", flexDirection:"column", gap:10 }}>
                {aiDiagData.map((item) => {
                  if (frame < item.frame) return null;
                  const en = spring({ frame:frame-item.frame, fps, config:{ damping:20, stiffness:300 } });
                  return (
                    <div key={item.label} style={{
                      opacity:   interpolate(en,[0,1],[0,1]),
                      transform:`translateY(${interpolate(en,[0,1],[6,0])}px)`,
                    }}>
                      <div style={{
                        fontFamily:geistFont, fontSize:9, fontWeight:600,
                        color:ARIA_COLORS.mutedFg, textTransform:"uppercase",
                        letterSpacing:"0.07em", marginBottom:2,
                      }}>{item.label}</div>
                      <div style={{
                        fontFamily:geistFont, fontSize:12, fontWeight:600, color:ARIA_COLORS.foreground,
                      }}>{item.value}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Complete Diagnosis button — appears at P_DIAG_BTN */}
            {!showAlarm2 && frame >= P_DIAG_BTN && (() => {
              const btnEn = spring({ frame:frame-P_DIAG_BTN, fps, config:{ damping:20, stiffness:260 } });
              return (
                <div style={{
                  opacity:   interpolate(btnEn,[0,1],[0,1]),
                  transform:`translateY(${interpolate(btnEn,[0,1],[8,0])}px)`,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  padding:"11px 20px",
                  backgroundColor:ARIA_COLORS.primary,
                  borderRadius:ARIA_RADIUS.lg,
                  boxShadow:`0 4px 18px -4px rgba(59,91,219,0.45)`,
                  cursor:"pointer",
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4M12 8h.01"/>
                  </svg>
                  <span style={{ fontFamily:geistFont, fontSize:12, fontWeight:600, color:"#FFFFFF", letterSpacing:"0.01em" }}>
                    Complete Diagnosis
                  </span>
                </div>
              );
            })()}

            {/* Event details */}
            <div style={{
              backgroundColor:ARIA_COLORS.cardBg,
              border:`1px solid ${ARIA_COLORS.cardBorder}`,
              borderRadius:ARIA_RADIUS.lg, padding:"10px 14px",
            }}>
              <div style={{
                fontFamily:geistFont, fontSize:9, fontWeight:600,
                color:ARIA_COLORS.mutedFg, textTransform:"uppercase",
                letterSpacing:"0.1em", marginBottom:8,
              }}>EVENT DETAILS</div>
              {(showAlarm2
                ? [
                    { label:"Detected value",       value:"2.1 bar"       },
                    { label:"Configured threshold",  value:"3.0–4.5 bar"  },
                    { label:"First detected",        value:"Today, 07:52"  },
                    { label:"Event duration",        value:"2 h 14 min"    },
                  ]
                : [
                    { label:"Detected value",       value:"89 °C"         },
                    { label:"Configured threshold",  value:"75 °C"         },
                    { label:"First detected",        value:"Today, 09:14"  },
                    { label:"Event duration",        value:"47 minutes"    },
                  ]
              ).map((row) => (
                <div key={row.label} style={{
                  display:"flex", justifyContent:"space-between",
                  padding:"5px 0", borderBottom:`1px solid ${ARIA_COLORS.cardBorder}`,
                }}>
                  <span style={{ fontFamily:geistFont, fontSize:11, color:ARIA_COLORS.mutedFg }}>{row.label}</span>
                  <span style={{ fontFamily:geistFont, fontSize:11, fontWeight:600, color:ARIA_COLORS.foreground }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "causes" && (
          <div style={{ flex:1, padding:"14px 18px", overflow:"hidden" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
              <div style={{
                fontFamily:geistFont, fontSize:9, fontWeight:600,
                color:ARIA_COLORS.mutedFg, textTransform:"uppercase", letterSpacing:"0.1em",
              }}>TYPICAL CAUSES</div>
              <div style={{
                fontFamily:geistFont, fontSize:9, fontWeight:600,
                color:ARIA_COLORS.primary, backgroundColor:ARIA_COLORS.primaryLight,
                borderRadius:ARIA_RADIUS.full, padding:"1px 7px",
              }}>⚡ AI-identified</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              {CAUSES_1.map((cause, i) => {
                const cf = P_CAUSES_IN + i * 15;
                if (frame < cf) return null;
                const en = spring({ frame:frame-cf, fps, config:{ damping:20, stiffness:300, mass:0.5 } });
                return (
                  <div key={i} style={{
                    opacity:   interpolate(en,[0,1],[0,1]),
                    transform:`translateX(${interpolate(en,[0,1],[-12,0])}px)`,
                    display:"flex", alignItems:"flex-start", gap:10,
                    padding:"9px 14px", borderRadius:ARIA_RADIUS.md,
                    backgroundColor:ARIA_COLORS.cardBg,
                    border:`1px solid ${ARIA_COLORS.cardBorder}`,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ARIA_COLORS.warning} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:1 }}>
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>
                    </svg>
                    <span style={{ fontFamily:geistFont, fontSize:12, color:ARIA_COLORS.foreground, lineHeight:1.4 }}>{cause}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "resolution" && (
          <div style={{ flex:1, padding:"14px 18px", overflow:"hidden" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <div style={{
                fontFamily:geistFont, fontSize:9, fontWeight:600,
                color:ARIA_COLORS.mutedFg, textTransform:"uppercase", letterSpacing:"0.1em",
              }}>PROCEDURE — {RESOLUTION_STEPS.length} STEPS</div>
              <div style={{
                fontFamily:geistFont, fontSize:9, fontWeight:600,
                color:ARIA_COLORS.primary, backgroundColor:ARIA_COLORS.primaryLight,
                borderRadius:ARIA_RADIUS.full, padding:"1px 7px",
              }}>⚡ AI-generated</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {RESOLUTION_STEPS.map((step, i) => {
                const sf = P_RES_STEPS + i * 12;
                if (frame < sf) return null;
                const en = spring({ frame:frame-sf, fps, config:{ damping:20, stiffness:320, mass:0.5 } });
                return (
                  <div key={i} style={{
                    opacity:   interpolate(en,[0,1],[0,1]),
                    transform:`translateX(${interpolate(en,[0,1],[-12,0])}px)`,
                    display:"flex", alignItems:"flex-start", gap:10,
                    padding:"8px 12px", borderRadius:ARIA_RADIUS.md,
                    backgroundColor:ARIA_COLORS.cardBg,
                    border:`1px solid ${ARIA_COLORS.cardBorder}`,
                  }}>
                    <div style={{
                      width:20, height:20, borderRadius:ARIA_RADIUS.sm, flexShrink:0,
                      backgroundColor:"rgba(0,0,0,0.04)",
                      border:`1px solid ${ARIA_COLORS.cardBorder}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontFamily:geistFont, fontSize:9, fontWeight:600, color:ARIA_COLORS.mutedFg,
                    }}>{i+1}</div>
                    <span style={{ fontFamily:geistFont, fontSize:11, color:ARIA_COLORS.foreground, lineHeight:1.4 }}>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Right metadata sidebar ── */}
        <div style={{
          width:200, flexShrink:0,
          borderLeft:`1px solid ${ARIA_COLORS.cardBorder}`,
          padding:"14px 14px",
          display:"flex", flexDirection:"column", gap:14,
        }}>
          <div>
            <div style={{
              fontFamily:geistFont, fontSize:9, fontWeight:600,
              color:ARIA_COLORS.mutedFg, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8,
            }}>REFERENCES</div>
            {[
              { label:"Asset",    value:alarm.asset,    mono:true  },
              { label:"Zone",     value:alarm.zone,     mono:false },
              { label:"Category", value:alarm.category, mono:false },
              { label:"Tag",      value:showAlarm2 ? "B2156A" : "A43856", mono:true },
            ].map((row) => (
              <div key={row.label} style={{ marginBottom:8 }}>
                <div style={{ fontFamily:geistFont, fontSize:9, color:ARIA_COLORS.mutedFg, marginBottom:2 }}>{row.label}</div>
                <div style={{
                  fontFamily:row.mono?"'Geist Mono',monospace":geistFont,
                  fontSize:11, fontWeight:500, color:ARIA_COLORS.foreground,
                }}>{row.value}</div>
              </div>
            ))}
          </div>

          {/* Status pills */}
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <div style={{
              fontFamily:geistFont, fontSize:9, fontWeight:600,
              color:ARIA_COLORS.mutedFg, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:2,
            }}>CLASSIFICATION</div>
            {["Draft","Approved","Rejected"].map((s, si) => {
              const active = si === 0;
              const c = si === 0 ? ARIA_COLORS.warning : si === 1 ? ARIA_COLORS.success : ARIA_COLORS.critical;
              return (
                <div key={s} style={{
                  display:"flex", alignItems:"center", gap:6,
                  padding:"4px 10px", borderRadius:ARIA_RADIUS.full,
                  backgroundColor: active ? `${c}18` : "transparent",
                  border:`1px solid ${active ? c : ARIA_COLORS.cardBorder}`,
                }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", backgroundColor: active ? c : ARIA_COLORS.cardBorder, flexShrink:0 }} />
                  <span style={{ fontFamily:geistFont, fontSize:10, color: active ? c : ARIA_COLORS.mutedFg, fontWeight: active ? 600 : 400 }}>{s}</span>
                </div>
              );
            })}
          </div>

          {/* AI badge */}
          <div style={{
            backgroundColor:ARIA_COLORS.primaryLight,
            border:`1px solid ${ARIA_COLORS.primaryBorder}`,
            borderRadius:ARIA_RADIUS.md, padding:"10px 12px",
          }}>
            <div style={{
              fontFamily:geistFont, fontSize:9, fontWeight:600, color:ARIA_COLORS.primary, marginBottom:4,
            }}>⚡ Extracted by AriA</div>
            <div style={{ fontFamily:geistFont, fontSize:10, color:ARIA_COLORS.mutedFg, lineHeight:1.4 }}>
              Alarm configuration auto-generated from uploaded documentation
            </div>
          </div>
        </div>

      </div>{/* /tab content */}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
//  MAIN SCENE
// ══════════════════════════════════════════════════════════════
export const Scene3AutoConfig: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Cursor path ───────────────────────────────────────────
  const CX_T = [0, P_ALARM1_SEL, P_DETAIL_IN, P_CAUSES_TAB-8, P_CAUSES_TAB, P_CAUSES_TAB+8, P_RES_TAB-8, P_RES_TAB, P_RES_TAB+8, P_ALARM2_SEL, P_DETAIL2_IN, P_END];
  const CX_V = [400, 420,         950,          960,            960,           960,             960,         960,        960,          420,           950,          950];
  const CY_T = [0, P_ALARM1_SEL, P_DETAIL_IN, P_CAUSES_TAB-8, P_CAUSES_TAB, P_CAUSES_TAB+8, P_RES_TAB-8, P_RES_TAB, P_RES_TAB+8, P_ALARM2_SEL, P_DETAIL2_IN, P_END];
  const CY_V = [200, 175,         175,          175,            175,           175,             175,         175,        175,          310,           310,          310];

  const cursorX = interpolate(frame, CX_T, CX_V, { extrapolateLeft:"clamp", extrapolateRight:"clamp" });
  const cursorY = interpolate(frame, CY_T, CY_V, { extrapolateLeft:"clamp", extrapolateRight:"clamp" });

  const clicking =
    (frame >= P_ALARM1_SEL - 1   && frame < P_ALARM1_SEL + 12)   ||
    (frame >= P_CAUSES_TAB - 1   && frame < P_CAUSES_TAB + 12)   ||
    (frame >= P_RES_TAB - 1      && frame < P_RES_TAB + 12)      ||
    (frame >= P_ALARM2_SEL - 1   && frame < P_ALARM2_SEL + 12);

  // ── Header fade-in ────────────────────────────────────────
  const headerOp = interpolate(frame, [4, 18], [0, 1], { extrapolateLeft:"clamp", extrapolateRight:"clamp" });

  // ── Narration lines ───────────────────────────────────────
  const NAR = [
    { text:"Every alarm, extracted and catalogued.",      color:ARIA_COLORS.foreground, in:6,             out:P_DETAIL_IN - 10   },
    { text:"AriA diagnoses each one automatically.",      color:ARIA_COLORS.primary,    in:P_DETAIL_IN,    out:P_CAUSES_TAB - 12  },
    { text:"Probable causes, identified in seconds.",     color:ARIA_COLORS.foreground, in:P_CAUSES_TAB,   out:P_RES_TAB - 12     },
    { text:"Step-by-step resolution, generated by AI.",  color:ARIA_COLORS.primary,    in:P_RES_TAB,      out:P_ALARM2_SEL - 12  },
    { text:"Every alarm. Every asset.",                   color:ARIA_COLORS.foreground, in:P_ALARM2_SEL,   out:P_END              },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor:ARIA_COLORS.background }}>

      {/* ── App shell ── */}
      <div style={{ position:"absolute", top:0, left:0, right:0, bottom:120 }}>
        <AriAShell activeItem="Alarms">

          {/* Page header */}
          <div style={{ opacity:headerOp, padding:"18px 26px 0", flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{
                  width:36, height:36, borderRadius:ARIA_RADIUS.md,
                  backgroundColor:ARIA_COLORS.criticalMuted, border:`1px solid ${ARIA_COLORS.criticalBorder}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ARIA_COLORS.critical} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </div>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontFamily:geistFont, fontSize:17, fontWeight:600, color:ARIA_COLORS.foreground, letterSpacing:"-0.01em" }}>
                      Alarms
                    </span>
                    <span style={{
                      fontFamily:geistFont, fontSize:11, color:ARIA_COLORS.mutedFg,
                      backgroundColor:"rgba(0,0,0,0.05)", border:`1px solid ${ARIA_COLORS.cardBorder}`,
                      borderRadius:ARIA_RADIUS.full, padding:"1px 8px",
                    }}>
                      {Math.min(ALARMS.filter(a => frame >= a.appear + 5).length, ALARMS.length)}
                    </span>
                  </div>
                  <div style={{ fontFamily:geistFont, fontSize:12, color:ARIA_COLORS.mutedFg }}>
                    Alarm configurations extracted automatically by AriA
                  </div>
                </div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <div style={{
                  fontFamily:geistFont, fontSize:11, fontWeight:600,
                  color:ARIA_COLORS.primary, backgroundColor:ARIA_COLORS.primaryLight,
                  border:`1px solid ${ARIA_COLORS.primaryBorder}`,
                  borderRadius:ARIA_RADIUS.md, padding:"6px 12px",
                }}>⚡ AI-extracted</div>
                <div style={{
                  fontFamily:geistFont, fontSize:11, fontWeight:600, color:"#FFFFFF",
                  backgroundColor:ARIA_COLORS.primary, borderRadius:ARIA_RADIUS.md, padding:"6px 12px",
                }}>+ New Alarm</div>
              </div>
            </div>

            {/* Filter tabs */}
            <div style={{
              display:"flex", gap:6, padding:"8px 0",
              borderBottom:`1px solid ${ARIA_COLORS.cardBorder}`,
            }}>
              {[
                { label:"All",      active:true  },
                { label:"Critical", active:false },
                { label:"Warning",  active:false },
                { label:"Info",     active:false },
                { label:"Resolved", active:false },
              ].map((f) => (
                <div key={f.label} style={{
                  fontFamily:geistFont, fontSize:11, fontWeight:f.active?600:400,
                  color:f.active?ARIA_COLORS.primary:ARIA_COLORS.mutedFg,
                  backgroundColor:f.active?ARIA_COLORS.primaryLight:"rgba(0,0,0,0.03)",
                  border:`1px solid ${f.active?ARIA_COLORS.primaryBorder:"transparent"}`,
                  borderRadius:ARIA_RADIUS.full, padding:"4px 12px",
                }}>{f.label}</div>
              ))}
            </div>
          </div>

          {/* Split pane */}
          <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

            {/* Alarm list */}
            <div style={{
              width:"40%", flexShrink:0, padding:"10px 10px",
              display:"flex", flexDirection:"column", gap:6, overflowY:"hidden",
            }}>
              {ALARMS.map((alarm, i) => (
                <AlarmCard
                  key={alarm.code}
                  alarm={alarm}
                  selected={
                    (i === 0 && frame >= P_ALARM1_SEL && frame < P_ALARM2_SEL) ||
                    (i === 3 && frame >= P_ALARM2_SEL)
                  }
                  frame={frame}
                  fps={fps}
                />
              ))}
            </div>

            {/* Detail panel */}
            <AlarmDetail frame={frame} fps={fps} />
          </div>

          {/* Cursor */}
          <Cursor x={cursorX} y={cursorY} clicking={clicking} />

        </AriAShell>
      </div>

      {/* ── Narration strip ── */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0, height:120,
        backgroundColor:ARIA_COLORS.background,
        borderTop:`1px solid ${ARIA_COLORS.cardBorder}`,
        display:"flex", alignItems:"center", justifyContent:"center",
        pointerEvents:"none",
      }}>
        {NAR.map((n, i) => {
          const op = interpolate(frame, [n.in, n.in+14, n.out-8, n.out], [0,1,1,0], { extrapolateLeft:"clamp", extrapolateRight:"clamp" });
          if (op <= 0.01) return null;
          return (
            <div key={i} style={{
              position:"absolute", opacity:op,
              fontFamily:geistFont, fontSize:36, fontWeight:700,
              color:n.color, letterSpacing:"-0.02em", textAlign:"center",
            }}>{n.text}</div>
          );
        })}
      </div>

    </AbsoluteFill>
  );
};
