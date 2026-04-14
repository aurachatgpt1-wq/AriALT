import React from "react";
import {
  AbsoluteFill, interpolate, spring,
  useCurrentFrame, useVideoConfig,
} from "remotion";
import { ARIA_COLORS, ARIA_SHADOWS, ARIA_RADIUS, geistFont } from "../constants";
import { AriAShell } from "../components/AriAShell";

// ══════════════════════════════════════════════════════════════
//  PHASE TIMING  (780 frames = 26 s)
// ══════════════════════════════════════════════════════════════
const P_KB_CLICK       = 55;    // cursor clicks Knowledge Base
const P_KB_IN          = 68;    // KB page fades in

const P_FILE1_PICKUP   = 88;    // pick up file 1
const P_FILE1_DROP     = 128;   // drop file 1 → progress bar
const P_FILE2_PICKUP   = 142;   // pick up file 2
const P_FILE2_DROP     = 182;   // drop file 2
const P_FILE3_PICKUP   = 196;   // pick up file 3
const P_FILE3_DROP     = 236;   // drop file 3

const P_ALL_DONE       = 308;   // all files processed + sync counts finish

// Tour — populated everywhere
const P_M_CLICK        = 326;   // cursor → Maintenance sidebar
const P_M_IN           = 341;   // Maintenance page fades in — 10 plans appear
const P_ALARMS_CLICK   = 418;   // cursor → Alarms sidebar
const P_ALARMS_IN      = 432;   // Alarms page fades in — alarms appear

// Back to Maintenance — detail review
const P_BACK_M_CLICK   = 498;   // cursor → Maintenance (second time)
const P_BACK_M_IN      = 513;   // Maintenance fades in again
const P_PLAN_CLICK     = 554;   // cursor clicks first plan card
const P_DETAIL_IN      = 570;   // detail panel slides in

const P_FIELDS_START   = 578;   // AI-filled fields appear one by one (Details tab)
const P_PROC_CLICK     = 618;   // cursor clicks "Procedure" tab
const P_STEPS_START    = 631;   // procedure steps appear

// AI assistant chat — ask to improve
const P_AI_CHAT_CLICK  = 672;   // cursor clicks AI chat input
const P_AI_CHAT_IN     = 684;   // chat bar activates / typing starts
const P_AI_RESPONSE    = 728;   // AriA responds — steps update (typing done by ~714)

// Approval
const P_APPROVE_HOVER  = 748;   // cursor hovers "Approve Plan"
const P_APPROVE_CLICK  = 762;   // cursor clicks
const P_END            = 780;

// ══════════════════════════════════════════════════════════════
//  CURSOR
// ══════════════════════════════════════════════════════════════
const Cursor: React.FC<{
  x: number; y: number; clicking: boolean; dragLabel?: string;
}> = ({ x, y, clicking, dragLabel }) => (
  <div style={{
    position: "absolute", left: x - 2, top: y - 2,
    zIndex: 200, pointerEvents: "none",
  }}>
    {clicking && (
      <div style={{
        position: "absolute", left: -14, top: -14,
        width: 32, height: 32, borderRadius: "50%",
        border: `2px solid ${ARIA_COLORS.primary}`, opacity: 0.7,
      }} />
    )}
    <svg width="22" height="26" viewBox="0 0 22 26" fill="none">
      <path d="M3 1 L3 21 L7.5 16.5 L10.5 24 L13 23 L10 15.5 L17 15.5 Z"
        fill="white" stroke="#1A1F33" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
    {dragLabel && (
      <div style={{
        position: "absolute", left: 18, top: 18,
        backgroundColor: dragLabel === "XLSX" ? "#E8F6F1" : "#FDF1F1",
        border: `1px solid ${dragLabel === "XLSX" ? "#A7DFC8" : "#FBBFBF"}`,
        borderRadius: 6, padding: "4px 10px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.22)",
      }}>
        <span style={{
          fontFamily: geistFont, fontSize: 10, fontWeight: 700,
          color: dragLabel === "XLSX" ? "#1FA870" : "#DC2626",
        }}>{dragLabel}</span>
      </div>
    )}
  </div>
);

// ══════════════════════════════════════════════════════════════
//  DATA
// ══════════════════════════════════════════════════════════════
const FILES_DEF = [
  { name: "Line_A_Maintenance_Manual.pdf",  size: "4.2 MB", type: "PDF",  color: "#DC2626", bg: "#FDF1F1", dropFrame: P_FILE1_DROP },
  { name: "Spare_Parts_Catalog_2026.xlsx",  size: "1.8 MB", type: "XLSX", color: "#1FA870", bg: "#E8F6F1", dropFrame: P_FILE2_DROP },
  { name: "Equipment_Specifications.pdf",   size: "2.9 MB", type: "PDF",  color: "#DC2626", bg: "#FDF1F1", dropFrame: P_FILE3_DROP },
];

const ENTITY_COUNTS = [
  { label: "Assets",            value: 14,  startFrame: 248 },
  { label: "Alarms",            value: 36,  startFrame: 262 },
  { label: "Maintenance plans", value: 28,  startFrame: 276 },
  { label: "Spare parts",       value: 142, startFrame: 290 },
];

const PLANS = [
  { name: "Line A — Bearing support maintenance",   cat: "Preventive",  catC: { bg:"#EFF6FF",text:"#1E40AF",border:"#BFDBFE"}, freq:"90 days",  zone:"Line A — Zone 3",  next:"87d",  red:false, ap:0  },
  { name: "Line A — General line maintenance",      cat: "Inspection",  catC: { bg:"#F0FDF4",text:"#166534",border:"#BBF7D0"}, freq:"Weekly",   zone:"Line A",           next:"−5d",  red:true,  ap:8  },
  { name: "Compressor air filter replacement",      cat: "Preventive",  catC: { bg:"#EFF6FF",text:"#1E40AF",border:"#BFDBFE"}, freq:"Monthly",  zone:"Compressor Room",  next:"2d",   red:false, ap:16 },
  { name: "Hydraulic pump quarterly review",        cat: "Overhaul",    catC: { bg:"#FDF4FF",text:"#7E22CE",border:"#E9D5FF"}, freq:"Quarterly",zone:"Line B — Zone 1", next:"43d",  red:false, ap:24 },
  { name: "Safety valve inspection",                cat: "Inspection",  catC: { bg:"#F0FDF4",text:"#166534",border:"#BBF7D0"}, freq:"Bi-annual",zone:"Main Line",         next:"120d", red:false, ap:32 },
  { name: "Electrical panel thermography",          cat: "Preventive",  catC: { bg:"#EFF6FF",text:"#1E40AF",border:"#BFDBFE"}, freq:"Annual",   zone:"Control Room",     next:"210d", red:false, ap:38 },
  { name: "Conveyor belt lubrication",              cat: "Lubrication", catC: { bg:"#FFFBEB",text:"#92400E",border:"#FDE68A"}, freq:"Weekly",   zone:"Line B — Zone 1", next:"−2d",  red:true,  ap:44 },
  { name: "Cooling tower inspection",               cat: "Inspection",  catC: { bg:"#F0FDF4",text:"#166534",border:"#BBF7D0"}, freq:"Monthly",  zone:"External — North", next:"18d",  red:false, ap:50 },
  { name: "Emergency generator test",               cat: "Test",        catC: { bg:"#EEF2FF",text:"#3730A3",border:"#C7D2FE"}, freq:"Monthly",  zone:"Generator Room",   next:"7d",   red:false, ap:56 },
  { name: "Fire suppression system check",          cat: "Inspection",  catC: { bg:"#F0FDF4",text:"#166534",border:"#BBF7D0"}, freq:"Quarterly",zone:"All zones",         next:"65d",  red:false, ap:62 },
];

const S2_ALARMS = [
  { code:"A001-S20S8E1", asset:"MOT-401", desc:"Critical bearing temperature: 89 °C (threshold: 75 °C)",      cat:"Temperature", dot:ARIA_COLORS.critical, sev:"CRITICAL", sevC:{bg:ARIA_COLORS.criticalMuted,text:ARIA_COLORS.critical,border:ARIA_COLORS.criticalBorder}, catC:{bg:"#FFF7ED",text:"#9A3412",border:"#FED7AA"}, ap:0  },
  { code:"A002-S15P3E2", asset:"PMP-203", desc:"Inlet pressure out of range: 2.1 bar (expected: 3.0–4.5 bar)", cat:"Pressure",    dot:ARIA_COLORS.warning,  sev:"WARNING",  sevC:{bg:ARIA_COLORS.warningMuted, text:ARIA_COLORS.warning, border:ARIA_COLORS.warningBorder},  catC:{bg:"#FFF7ED",text:"#92400E",border:"#FDE68A"}, ap:10 },
  { code:"A003-S12V7E1", asset:"CNV-118", desc:"Drive shaft vibration +18% above baseline (5.1 mm/s)",         cat:"Vibration",   dot:ARIA_COLORS.warning,  sev:"WARNING",  sevC:{bg:ARIA_COLORS.warningMuted, text:ARIA_COLORS.warning, border:ARIA_COLORS.warningBorder},  catC:{bg:"#EEF2FF",text:"#3730A3",border:"#C7D2FE"}, ap:20 },
  { code:"A004-S08F2E3", asset:"CMP-101", desc:"Filter differential pressure: 0.8 bar (limit: 0.6 bar)",       cat:"Filtration",  dot:"#3B82F6",            sev:"INFO",     sevC:{bg:"#EFF6FF",text:"#1D4ED8",border:"#BFDBFE"},                                              catC:{bg:"#F0FDF4",text:"#166534",border:"#BBF7D0"}, ap:30 },
  { code:"A005-S22T4E1", asset:"VLV-044", desc:"Actuator position error: commanded 100%, feedback 73%",        cat:"Mechanical",  dot:ARIA_COLORS.warning,  sev:"WARNING",  sevC:{bg:ARIA_COLORS.warningMuted, text:ARIA_COLORS.warning, border:ARIA_COLORS.warningBorder},  catC:{bg:"#F5F3FF",text:"#6D28D9",border:"#DDD6FE"}, ap:40 },
];

const DETAIL_FIELDS = [
  { label: "Plan name",     value: "Line A — Bearing support maintenance" },
  { label: "Type",          value: "Preventive Maintenance"                },
  { label: "Category",      value: "Mechanical"                            },
  { label: "Frequency",     value: "Every 90 days"                         },
  { label: "Zone",          value: "Line A — Zone 3"                       },
  { label: "Duration est.", value: "2h 30min"                              },
  { label: "Team",          value: "Mechanical Maintenance"                },
  { label: "Next due",      value: "In 87 days"                            },
  { label: "Source doc",    value: "Line A Manual §4.2"                    },
  { label: "Created by",    value: "⚡ AriA (AI-generated)"               },
];

const PROCEDURE_STEPS = [
  "Lock out / Tag out affected motors (LOTO procedure)",
  "Inspect bearing housings for cracks and surface wear",
  "Remove bearing cap — measure clearance with feeler gauge",
  "Check lubrication quality — replace grease if contaminated",
  "Verify shaft alignment with dial indicator (< 0.05 mm)",
  "Inspect belt tension — adjust to 180–200 N if required",
  "Check motor surface temperature with IR thermometer (< 65 °C)",
  "Measure vibration levels with analyzer (< 4.5 mm/s RMS)",
  "Test run at 50% load for 15 min — monitor all readings",
  "Record all data in the maintenance log and close the plan",
];

const CHAT_MESSAGE = "Add safety warnings to each step";

// ══════════════════════════════════════════════════════════════
//  EMPTY MAINTENANCE PAGE
// ══════════════════════════════════════════════════════════════
const EmptyMaintenancePage: React.FC<{ opacity: number; frame: number }> = ({ opacity, frame }) => {
  const op = interpolate(frame, [4, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ opacity, display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ opacity: op, padding: "20px 28px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width:36, height:36, borderRadius:ARIA_RADIUS.md, backgroundColor:ARIA_COLORS.primaryLight, border:`1px solid ${ARIA_COLORS.primaryBorder}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ARIA_COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <div>
              <div style={{ fontFamily:geistFont, fontSize:17, fontWeight:600, color:ARIA_COLORS.foreground, letterSpacing:"-0.01em" }}>Maintenance</div>
              <div style={{ fontFamily:geistFont, fontSize:12, color:ARIA_COLORS.mutedFg }}>No maintenance plans yet</div>
            </div>
          </div>
        </div>
        <div style={{ borderBottom:`1px solid ${ARIA_COLORS.cardBorder}`, marginTop:16 }} />
      </div>
      <div style={{ flex:1, opacity, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14, paddingBottom:180 }}>
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
        <div style={{ fontFamily:geistFont, fontSize:17, fontWeight:600, color:ARIA_COLORS.foreground }}>No maintenance plans found.</div>
        <div style={{ fontFamily:geistFont, fontSize:13, color:ARIA_COLORS.mutedFg, textAlign:"center", maxWidth:400, lineHeight:1.6 }}>
          Upload your technical documentation in the Knowledge Base.<br />
          AriA will extract all maintenance plans automatically.
        </div>
        <div style={{ marginTop:4, fontFamily:geistFont, fontSize:12, fontWeight:600, color:ARIA_COLORS.primary, border:`1px solid ${ARIA_COLORS.primaryBorder}`, borderRadius:ARIA_RADIUS.md, padding:"8px 20px" }}>
          Go to Knowledge Base →
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
//  KB UPLOAD PAGE
// ══════════════════════════════════════════════════════════════
const KBPage: React.FC<{ opacity: number; frame: number; fps: number }> = ({ opacity, frame, fps }) => {
  const hOp = interpolate(frame, [P_KB_IN, P_KB_IN+14], [0,1], { extrapolateLeft:"clamp", extrapolateRight:"clamp" });
  const dragging = (frame >= P_FILE1_PICKUP && frame < P_FILE1_DROP+4)
    || (frame >= P_FILE2_PICKUP && frame < P_FILE2_DROP+4)
    || (frame >= P_FILE3_PICKUP && frame < P_FILE3_DROP+4);

  return (
    <div style={{ opacity, display:"flex", flexDirection:"column", height:"100%" }}>
      <div style={{ opacity:hOp, padding:"20px 28px 14px", flexShrink:0, borderBottom:`1px solid ${ARIA_COLORS.cardBorder}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:ARIA_RADIUS.md, backgroundColor:ARIA_COLORS.primaryLight, border:`1px solid ${ARIA_COLORS.primaryBorder}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ARIA_COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a8 2 0 1 0 0 4 8 2 0 0 0 0-4z"/><path d="M4 6v4c0 1.1 3.582 2 8 2s8-.9 8-2V6"/><path d="M4 14v4c0 1.1 3.582 2 8 2s8-.9 8-2v-4"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily:geistFont, fontSize:17, fontWeight:600, color:ARIA_COLORS.foreground, letterSpacing:"-0.01em" }}>Knowledge Base</div>
            <div style={{ fontFamily:geistFont, fontSize:12, color:ARIA_COLORS.mutedFg }}>Drop your documents — AriA extracts and structures everything automatically</div>
          </div>
        </div>
      </div>

      <div style={{ flex:1, display:"flex", gap:20, padding:"20px 28px", overflow:"hidden" }}>
        {/* Drop zone */}
        <div style={{
          flex:1,
          border:`2px dashed ${dragging ? ARIA_COLORS.primary : ARIA_COLORS.cardBorder}`,
          borderRadius:ARIA_RADIUS.xl,
          backgroundColor: dragging ? ARIA_COLORS.primaryLight : "rgba(255,255,255,0.5)",
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          gap:10, padding:24,
        }}>
          <div style={{ width:56, height:56, borderRadius:ARIA_RADIUS.xl, backgroundColor: dragging ? ARIA_COLORS.primaryLight : "rgba(0,0,0,0.04)", border:`1px solid ${dragging ? ARIA_COLORS.primaryBorder : ARIA_COLORS.cardBorder}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={dragging ? ARIA_COLORS.primary : ARIA_COLORS.mutedFg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <div style={{ fontFamily:geistFont, fontSize:14, fontWeight:600, color: dragging ? ARIA_COLORS.primary : ARIA_COLORS.foreground }}>
            {dragging ? "Drop to upload" : "Drag documents here"}
          </div>
          <div style={{ fontFamily:geistFont, fontSize:12, color:ARIA_COLORS.mutedFg, textAlign:"center", lineHeight:1.5 }}>
            PDF, XLSX, DOCX — AriA extracts assets, alarms,<br />maintenance plans, spare parts and more
          </div>

          {/* Dropped files */}
          <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:8, marginTop:10 }}>
            {FILES_DEF.map((f, i) => {
              if (frame < f.dropFrame) return null;
              const en = spring({ frame: frame - f.dropFrame, fps, config:{ damping:22, stiffness:260, mass:0.5 } });
              const prog = interpolate(frame, [f.dropFrame+4, f.dropFrame+58], [0,100], { extrapolateLeft:"clamp", extrapolateRight:"clamp" });
              const done = prog >= 99;
              return (
                <div key={i} style={{
                  opacity: interpolate(en,[0,1],[0,1]), transform:`translateY(${interpolate(en,[0,1],[10,0])}px)`,
                  backgroundColor:ARIA_COLORS.cardBg, border:`1px solid ${done ? ARIA_COLORS.successBorder : ARIA_COLORS.cardBorder}`, borderRadius:ARIA_RADIUS.lg, padding:"10px 14px",
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom: done ? 0 : 8 }}>
                    <span style={{ fontFamily:geistFont, fontSize:9, fontWeight:700, color:f.color, backgroundColor:f.bg, border:`1px solid ${f.color}40`, borderRadius:4, padding:"2px 6px", flexShrink:0 }}>{f.type}</span>
                    <span style={{ fontFamily:geistFont, fontSize:12, fontWeight:500, color:ARIA_COLORS.foreground, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.name}</span>
                    <span style={{ fontFamily:geistFont, fontSize:10, color:ARIA_COLORS.mutedFg, flexShrink:0 }}>{f.size}</span>
                    {done && <span style={{ fontSize:14 }}>✅</span>}
                  </div>
                  {!done && (
                    <div style={{ height:4, borderRadius:2, backgroundColor:"rgba(0,0,0,0.07)", overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${prog}%`, borderRadius:2, backgroundColor:ARIA_COLORS.primary }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sync status panel */}
        <div style={{ width:290, flexShrink:0, display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ backgroundColor:ARIA_COLORS.cardBg, border:`1px solid ${ARIA_COLORS.cardBorder}`, borderRadius:ARIA_RADIUS.lg, padding:18 }}>
            <div style={{ fontFamily:geistFont, fontSize:10, fontWeight:600, color:ARIA_COLORS.mutedFg, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>EXTRACTION STATUS</div>
            {ENTITY_COUNTS.map((ec) => {
              if (frame < ec.startFrame) return null;
              const count = Math.round(interpolate(frame, [ec.startFrame, ec.startFrame+24], [0, ec.value], { extrapolateLeft:"clamp", extrapolateRight:"clamp" }));
              const en = spring({ frame: frame - ec.startFrame, fps, config:{ damping:20, stiffness:280 } });
              return (
                <div key={ec.label} style={{ opacity: interpolate(en,[0,1],[0,1]), display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${ARIA_COLORS.cardBorder}` }}>
                  <span style={{ fontFamily:geistFont, fontSize:12, color:ARIA_COLORS.foreground }}>{ec.label}</span>
                  <span style={{ fontFamily:geistFont, fontSize:14, fontWeight:700, color:ARIA_COLORS.primary, fontVariantNumeric:"tabular-nums" }}>{count}</span>
                </div>
              );
            })}
          </div>

          {frame >= 242 && (
            <div style={{ backgroundColor:ARIA_COLORS.aiPanelBg, border:`1px solid ${ARIA_COLORS.primaryBorder}`, borderRadius:ARIA_RADIUS.lg, padding:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:8 }}>
                <span style={{ fontSize:14 }}>✨</span>
                <span style={{ fontFamily:geistFont, fontSize:11, fontWeight:600, color:ARIA_COLORS.primary }}>AriA is processing</span>
              </div>
              <div style={{ fontFamily:geistFont, fontSize:11, color:ARIA_COLORS.mutedFg, lineHeight:1.55 }}>
                Extracting maintenance plans, alarm thresholds, asset specs and spare part lists…
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
//  ALARMS PAGE (tour — populated)
// ══════════════════════════════════════════════════════════════
const AlarmsPage: React.FC<{ opacity: number; frame: number; fps: number }> = ({ opacity, frame, fps }) => {
  const hOp = interpolate(frame, [P_ALARMS_IN, P_ALARMS_IN+14], [0,1], { extrapolateLeft:"clamp", extrapolateRight:"clamp" });
  const visibleCount = S2_ALARMS.filter((a) => frame >= P_ALARMS_IN + a.ap + 8).length;

  return (
    <div style={{ opacity, display:"flex", flexDirection:"column", height:"100%" }}>
      <div style={{ opacity:hOp, padding:"20px 28px 0", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:ARIA_RADIUS.md, backgroundColor:ARIA_COLORS.criticalMuted, border:`1px solid ${ARIA_COLORS.criticalBorder}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🔔</div>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontFamily:geistFont, fontSize:17, fontWeight:600, color:ARIA_COLORS.foreground, letterSpacing:"-0.01em" }}>Alarms</span>
                <span style={{ fontFamily:geistFont, fontSize:11, color:ARIA_COLORS.mutedFg, backgroundColor:"rgba(0,0,0,0.05)", border:`1px solid ${ARIA_COLORS.cardBorder}`, borderRadius:ARIA_RADIUS.full, padding:"1px 8px" }}>{visibleCount}</span>
              </div>
              <div style={{ fontFamily:geistFont, fontSize:12, color:ARIA_COLORS.mutedFg }}>Alarm configurations extracted automatically by AriA</div>
            </div>
          </div>
          <div style={{ fontFamily:geistFont, fontSize:11, fontWeight:600, color:ARIA_COLORS.primary, backgroundColor:ARIA_COLORS.primaryLight, border:`1px solid ${ARIA_COLORS.primaryBorder}`, borderRadius:ARIA_RADIUS.md, padding:"6px 12px" }}>⚡ AI-extracted</div>
        </div>
        <div style={{ borderBottom:`1px solid ${ARIA_COLORS.cardBorder}`, marginTop:12 }} />
      </div>

      <div style={{ flex:1, padding:"12px 22px", display:"flex", flexDirection:"column", gap:8, overflowY:"hidden" }}>
        {S2_ALARMS.map((alarm, i) => {
          const af = P_ALARMS_IN + alarm.ap;
          if (frame < af) return null;
          const en = spring({ frame: frame - af, fps, config:{ damping:20, stiffness:250, mass:0.5 } });
          return (
            <div key={alarm.code} style={{
              opacity: interpolate(en,[0,1],[0,1]), transform:`translateY(${interpolate(en,[0,1],[10,0])}px)`,
              padding:"11px 14px 11px 16px", borderRadius:ARIA_RADIUS.lg,
              backgroundColor:ARIA_COLORS.cardBg,
              border:`1px solid ${i===0 ? alarm.sevC.border : ARIA_COLORS.cardBorder}`,
              borderLeft:`3px solid ${alarm.dot}`,
              boxShadow: i===0 ? `0 2px 12px -2px ${alarm.dot}30` : ARIA_SHADOWS.card,
            }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontFamily:"'Geist Mono', monospace", fontSize:11, fontWeight:700, color:alarm.dot, letterSpacing:"0.02em" }}>{alarm.code}</span>
                <span style={{ fontFamily:geistFont, fontSize:9, fontWeight:700, color:alarm.sevC.text, backgroundColor:alarm.sevC.bg, border:`1px solid ${alarm.sevC.border}`, borderRadius:ARIA_RADIUS.full, padding:"2px 8px" }}>{alarm.sev}</span>
              </div>
              <div style={{ fontFamily:geistFont, fontSize:12, color:ARIA_COLORS.foreground, lineHeight:1.35, marginBottom:6 }}>{alarm.desc}</div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontFamily:geistFont, fontSize:10, fontWeight:500, color:alarm.catC.text, backgroundColor:alarm.catC.bg, border:`1px solid ${alarm.catC.border}`, borderRadius:ARIA_RADIUS.sm, padding:"1px 6px" }}>{alarm.cat}</span>
                <span style={{ fontFamily:"'Geist Mono', monospace", fontSize:10, fontWeight:600, color:ARIA_COLORS.mutedFg, marginLeft:"auto" }}>{alarm.asset}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
//  PLAN DETAIL PANEL
// ══════════════════════════════════════════════════════════════
const PlanDetailPanel: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  if (frame < P_DETAIL_IN) return null;

  const enter = spring({ frame: frame - P_DETAIL_IN, fps, config:{ damping:22, stiffness:150 } });
  const procTabActive = frame >= P_PROC_CLICK;
  const aiImproved    = frame >= P_AI_RESPONSE;
  const approved      = frame >= P_APPROVE_CLICK + 4;

  // Typing animation
  const chatActive   = frame >= P_AI_CHAT_CLICK;
  const chatTyping   = frame >= P_AI_CHAT_IN;
  const chatChars    = chatTyping ? Math.min(Math.floor((frame - P_AI_CHAT_IN) * 1.1), CHAT_MESSAGE.length) : 0;
  const typedText    = CHAT_MESSAGE.slice(0, chatChars);
  const typingDone   = chatChars >= CHAT_MESSAGE.length;

  return (
    <div style={{
      flex:1,
      opacity: interpolate(enter,[0,1],[0,1]),
      transform:`translateX(${interpolate(enter,[0,1],[30,0])}px)`,
      display:"flex", flexDirection:"column", overflow:"hidden",
      borderLeft:`1px solid ${ARIA_COLORS.cardBorder}`,
    }}>
      {/* Header */}
      <div style={{ padding:"16px 22px 0", borderBottom:`1px solid ${ARIA_COLORS.cardBorder}`, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:8 }}>
          <div style={{ flex:1, paddingRight:14 }}>
            <div style={{ fontFamily:geistFont, fontSize:15, fontWeight:600, color:ARIA_COLORS.foreground, letterSpacing:"-0.01em", lineHeight:1.35 }}>
              {PLANS[0].name}
            </div>
            <div style={{ fontFamily:geistFont, fontSize:11, color:ARIA_COLORS.mutedFg, marginTop:3 }}>
              Plan #001 · Extracted from uploaded documentation
            </div>
          </div>
          {/* Approve button */}
          <div style={{
            fontFamily:geistFont, fontSize:11, fontWeight:600, cursor:"pointer", flexShrink:0,
            color:      approved ? ARIA_COLORS.success : frame >= P_APPROVE_HOVER ? "#FFFFFF" : ARIA_COLORS.primary,
            backgroundColor: approved ? ARIA_COLORS.successMuted : frame >= P_APPROVE_HOVER ? ARIA_COLORS.primary : ARIA_COLORS.primaryLight,
            border:`1px solid ${approved ? ARIA_COLORS.successBorder : ARIA_COLORS.primaryBorder}`,
            borderRadius:ARIA_RADIUS.md, padding:"7px 16px",
          }}>{approved ? "✓ Approved" : "Approve Plan"}</div>
        </div>

        {/* Pills */}
        <div style={{ display:"flex", gap:6, marginBottom:12 }}>
          {[
            { label:"Preventive",                             bg:"#EFF6FF",              color:"#1E40AF",          border:"#BFDBFE"                   },
            { label: aiImproved ? "✓ AI-improved" : "⚡ AI-generated", bg:ARIA_COLORS.primaryLight, color:ARIA_COLORS.primary, border:ARIA_COLORS.primaryBorder },
            ...(approved ? [{ label:"✓ Approved", bg:ARIA_COLORS.successMuted, color:ARIA_COLORS.success, border:ARIA_COLORS.successBorder }] : []),
          ].map((pill) => (
            <div key={pill.label} style={{ fontFamily:geistFont, fontSize:11, fontWeight:500, color:pill.color, backgroundColor:pill.bg, border:`1px solid ${pill.border}`, borderRadius:ARIA_RADIUS.full, padding:"3px 10px" }}>{pill.label}</div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex" }}>
          {["Details","Procedure","Spare Parts","History"].map((tab, i) => {
            const isProc = i === 1;
            const active = procTabActive ? isProc : i === 0;
            return (
              <div key={tab} style={{ fontFamily:geistFont, fontSize:12, fontWeight:active?600:400, color:active?ARIA_COLORS.primary:ARIA_COLORS.mutedFg, padding:"6px 16px", borderBottom:active?`2px solid ${ARIA_COLORS.primary}`:"2px solid transparent", marginBottom:-1 }}>{tab}</div>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {!procTabActive ? (
          /* ── DETAILS TAB — AI-filled fields ── */
          <div style={{ flex:1, padding:"18px 22px", overflow:"hidden" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18, padding:"10px 14px", backgroundColor:ARIA_COLORS.aiPanelBg, border:`1px solid ${ARIA_COLORS.primaryBorder}`, borderRadius:ARIA_RADIUS.md }}>
              <span style={{ fontSize:14 }}>✨</span>
              <span style={{ fontFamily:geistFont, fontSize:11, fontWeight:600, color:ARIA_COLORS.primary }}>All fields auto-filled by AriA from your uploaded documents</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px 32px" }}>
              {DETAIL_FIELDS.map((f, i) => {
                const ff = P_FIELDS_START + i * 5;
                if (frame < ff) return null;
                const fe = spring({ frame: frame - ff, fps, config:{ damping:20, stiffness:360, mass:0.4 } });
                const isAI = f.label === "Created by";
                return (
                  <div key={f.label} style={{ opacity:interpolate(fe,[0,1],[0,1]), transform:`translateY(${interpolate(fe,[0,1],[6,0])}px)` }}>
                    <div style={{ fontFamily:geistFont, fontSize:10, color:ARIA_COLORS.mutedFg, fontWeight:500, marginBottom:3, textTransform:"uppercase", letterSpacing:"0.06em" }}>{f.label}</div>
                    <div style={{ fontFamily:geistFont, fontSize:12, fontWeight:500, color:isAI?ARIA_COLORS.primary:ARIA_COLORS.foreground, backgroundColor:isAI?ARIA_COLORS.primaryLight:"transparent", borderRadius:isAI?ARIA_RADIUS.sm:0, padding:isAI?"2px 7px":0, display:"inline-block" }}>{f.value}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── PROCEDURE TAB — steps + AI chat ── */
          <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", position:"relative" }}>
            {/* Steps header */}
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 22px 10px", flexShrink:0 }}>
              <div style={{ fontFamily:geistFont, fontSize:10, fontWeight:600, color:ARIA_COLORS.mutedFg, textTransform:"uppercase", letterSpacing:"0.1em" }}>
                PROCEDURE — {PROCEDURE_STEPS.length} STEPS
              </div>
              {aiImproved
                ? <div style={{ fontFamily:geistFont, fontSize:9, fontWeight:600, color:ARIA_COLORS.success, backgroundColor:ARIA_COLORS.successMuted, border:`1px solid ${ARIA_COLORS.successBorder}`, borderRadius:ARIA_RADIUS.full, padding:"1px 7px" }}>✓ AI-improved</div>
                : <div style={{ fontFamily:geistFont, fontSize:9, fontWeight:600, color:ARIA_COLORS.primary, backgroundColor:ARIA_COLORS.primaryLight, borderRadius:ARIA_RADIUS.full, padding:"1px 7px" }}>⚡ AI-generated</div>
              }
            </div>

            {/* Steps list */}
            <div style={{ flex:1, padding:"0 22px", display:"flex", flexDirection:"column", gap:6, overflowY:"hidden", paddingBottom: chatActive ? 248 : 16 }}>
              {PROCEDURE_STEPS.map((step, i) => {
                const sf = P_STEPS_START + i * 5;
                if (frame < sf) return null;
                const se = spring({ frame: frame - sf, fps, config:{ damping:20, stiffness:300, mass:0.5 } });
                // staggered green transition — each step turns green 2 frames after the previous
                const greenFrame = P_AI_RESPONSE + i * 2;
                const isGreen = aiImproved && frame >= greenFrame;
                const greenT = isGreen ? spring({ frame: frame - greenFrame, fps, config:{ damping:18, stiffness:280, mass:0.4 } }) : 0;
                const bgColor = isGreen
                  ? `rgba(232,246,241,${interpolate(greenT,[0,1],[0,1])})`
                  : ARIA_COLORS.cardBg;
                const borderColor = isGreen
                  ? `rgba(167,223,200,${interpolate(greenT,[0,1],[0,1])})`
                  : ARIA_COLORS.cardBorder;
                return (
                  <div key={i} style={{
                    opacity:interpolate(se,[0,1],[0,1]), transform:`translateX(${interpolate(se,[0,1],[-10,0])}px)`,
                    display:"flex", alignItems:"flex-start", gap:10,
                    padding:"8px 12px", borderRadius:ARIA_RADIUS.md,
                    backgroundColor: bgColor,
                    border:`1px solid ${borderColor}`,
                  }}>
                    <div style={{
                      width:20, height:20, borderRadius:ARIA_RADIUS.sm, flexShrink:0,
                      backgroundColor: isGreen ? ARIA_COLORS.success : "rgba(0,0,0,0.05)",
                      border:`1px solid ${isGreen ? ARIA_COLORS.success : ARIA_COLORS.cardBorder}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontFamily:geistFont, fontSize:10, fontWeight:700,
                      color: isGreen ? "#FFFFFF" : ARIA_COLORS.mutedFg,
                    }}>
                      {isGreen ? "✓" : i + 1}
                    </div>
                    <span style={{ fontFamily:geistFont, fontSize:12, color:ARIA_COLORS.foreground, lineHeight:1.4 }}>{step}</span>
                  </div>
                );
              })}
            </div>

            {/* ── AI ASSISTANT PANEL — pixel-accurate AriA style ── */}
            {chatActive && (() => {
              const panelEn = spring({ frame: frame - P_AI_CHAT_CLICK, fps, config:{ damping:22, stiffness:220 } });


              return (
                <div style={{
                  position:"absolute", bottom:0, left:0, right:0,
                  padding:"10px 16px 14px",
                  backgroundColor:ARIA_COLORS.background,
                  opacity: interpolate(panelEn,[0,1],[0,1]),
                  transform:`translateY(${interpolate(panelEn,[0,1],[20,0])}px)`,
                }}>

                  {/* AriA response — slides in above the card */}
                  {frame >= P_AI_RESPONSE && (() => {
                    const rEn = spring({ frame: frame - P_AI_RESPONSE, fps, config:{ damping:22, stiffness:200 } });
                    return (
                      <div style={{
                        opacity:interpolate(rEn,[0,1],[0,1]),
                        transform:`translateY(${interpolate(rEn,[0,1],[8,0])}px)`,
                        marginBottom:8, display:"flex", alignItems:"flex-start", gap:8,
                      }}>
                        <div style={{ width:22, height:22, borderRadius:"50%", backgroundColor:ARIA_COLORS.primary, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:11 }}>✨</div>
                        <div style={{ fontFamily:geistFont, fontSize:11, color:ARIA_COLORS.foreground, lineHeight:1.5, backgroundColor:ARIA_COLORS.successMuted, border:`1px solid ${ARIA_COLORS.successBorder}`, borderRadius:ARIA_RADIUS.md, padding:"7px 12px" }}>
                          Done — safety warnings added to all 10 steps. Steps are now highlighted in green.
                        </div>
                      </div>
                    );
                  })()}

                  {/* ── Card wrapper — matches real AriA bordered card ── */}
                  <div style={{
                    backgroundColor:"#FFFFFF",
                    border:`1px solid rgba(214,217,227,0.8)`,
                    borderRadius:12,
                    overflow:"hidden",
                    boxShadow:"0 2px 12px -2px rgba(102,112,153,0.10)",
                  }}>

                    {/* ── Header row ── */}
                    <div style={{
                      display:"flex", alignItems:"center", gap:12,
                      padding:"12px 16px",
                      backgroundColor:"#F7F8FC",
                      borderBottom:`1px solid rgba(214,217,227,0.6)`,
                    }}>
                      {/* AriA branded icon */}
                      <div style={{
                        width:34, height:34, borderRadius:10,
                        backgroundColor:ARIA_COLORS.primaryLight,
                        border:`1.5px solid ${ARIA_COLORS.primaryBorder}`,
                        display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ARIA_COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
                        </svg>
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontFamily:geistFont, fontSize:13, fontWeight:700, color:ARIA_COLORS.primary, letterSpacing:"-0.01em" }}>AriA Assistant</div>
                        <div style={{ fontFamily:geistFont, fontSize:11, color:ARIA_COLORS.mutedFg, marginTop:2 }}>Improve procedure content automatically</div>
                      </div>
                      {/* Improve All button */}
                      <div style={{
                        display:"flex", alignItems:"center", gap:6,
                        fontFamily:geistFont, fontSize:11, fontWeight:600, color:"#FFFFFF",
                        backgroundColor:ARIA_COLORS.primary,
                        borderRadius:8, padding:"7px 16px",
                        flexShrink:0,
                        boxShadow:"0 2px 8px rgba(59,91,219,0.30)",
                      }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
                        </svg>
                        Improve All
                      </div>
                    </div>

                    {/* ── Hide actions divider ── */}
                    <div style={{
                      display:"flex", alignItems:"center", justifyContent:"center", gap:5,
                      padding:"6px 16px",
                      backgroundColor:"#FAFBFD",
                      borderBottom:`1px solid rgba(214,217,227,0.6)`,
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={ARIA_COLORS.mutedFg} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m18 15-6-6-6 6"/>
                      </svg>
                      <span style={{ fontFamily:geistFont, fontSize:11, color:ARIA_COLORS.mutedFg }}>Hide actions</span>
                    </div>

                    {/* ── 2×2 action grid ── */}
                    <div style={{
                      display:"grid", gridTemplateColumns:"1fr 1fr",
                      borderBottom:`1px solid rgba(214,217,227,0.6)`,
                    }}>
                      {[
                        { d:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", label:"Add safety"  },
                        { d:"M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01", label:"Cause"       },
                        { d:"M11 12H3M16 6H3M16 18H3M21 12l-4.35 4.35L15 15", label:"Resolution" },
                        { d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z", label:"All"         },
                      ].map((a, gi) => (
                        <div key={a.label} style={{
                          display:"flex", alignItems:"center", gap:10,
                          padding:"13px 16px",
                          backgroundColor:"#FFFFFF",
                          borderRight:  gi % 2 === 0 ? `1px solid rgba(214,217,227,0.6)` : "none",
                          borderBottom: gi < 2      ? `1px solid rgba(214,217,227,0.6)` : "none",
                          cursor:"pointer",
                        }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ARIA_COLORS.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            {a.d.split("M").filter(Boolean).map((seg, si) => (
                              <path key={si} d={"M"+seg} />
                            ))}
                          </svg>
                          <span style={{ fontFamily:geistFont, fontSize:12, fontWeight:500, color:ARIA_COLORS.foreground }}>{a.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* ── Text input row ── */}
                    <div style={{
                      display:"flex", alignItems:"center", gap:12,
                      padding:"11px 16px",
                      backgroundColor:"#FFFFFF",
                    }}>
                      <span style={{ fontFamily:geistFont, fontSize:12, flex:1, color: chatTyping ? ARIA_COLORS.foreground : ARIA_COLORS.mutedFg }}>
                        {chatTyping ? typedText : "Ask AriA to improve this procedure…"}
                        {chatTyping && !typingDone && (
                          <span style={{ opacity: Math.sin(frame * 0.45) > 0 ? 1 : 0, color:ARIA_COLORS.primary }}>|</span>
                        )}
                      </span>
                      {/* Paper-plane icon — blue when text ready */}
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke={typingDone ? ARIA_COLORS.primary : "rgba(150,160,180,0.5)"}
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ flexShrink:0 }}>
                        <path d="M22 2 11 13"/>
                        <path d="M22 2 15 22 11 13 2 9l20-7z"/>
                      </svg>
                    </div>

                  </div>{/* /card */}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
//  POPULATED MAINTENANCE PAGE
// ══════════════════════════════════════════════════════════════
const PopulatedMaintenancePage: React.FC<{ opacity: number; frame: number; fps: number; planAppearBase: number }> = ({ opacity, frame, fps, planAppearBase }) => {
  const hOp = interpolate(frame, [planAppearBase - 14, planAppearBase], [0, 1], { extrapolateLeft:"clamp", extrapolateRight:"clamp" });
  const detailVisible = frame >= P_DETAIL_IN;
  const narrowList = detailVisible;

  return (
    <div style={{ opacity, display:"flex", flexDirection:"column", height:"100%" }}>
      <div style={{ opacity:hOp, padding:"20px 28px 0", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:ARIA_RADIUS.md, backgroundColor:ARIA_COLORS.primaryLight, border:`1px solid ${ARIA_COLORS.primaryBorder}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ARIA_COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontFamily:geistFont, fontSize:17, fontWeight:600, color:ARIA_COLORS.foreground, letterSpacing:"-0.01em" }}>Maintenance</span>
                <span style={{ fontFamily:geistFont, fontSize:11, color:ARIA_COLORS.mutedFg, backgroundColor:"rgba(0,0,0,0.05)", border:`1px solid ${ARIA_COLORS.cardBorder}`, borderRadius:ARIA_RADIUS.full, padding:"1px 8px" }}>
                  {Math.min(PLANS.filter((p) => frame >= planAppearBase + p.ap + 5).length, PLANS.length)}
                </span>
              </div>
              <div style={{ fontFamily:geistFont, fontSize:12, color:ARIA_COLORS.mutedFg }}>Plans extracted automatically by AriA</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <div style={{ fontFamily:geistFont, fontSize:11, fontWeight:600, color:ARIA_COLORS.primary, backgroundColor:ARIA_COLORS.primaryLight, border:`1px solid ${ARIA_COLORS.primaryBorder}`, borderRadius:ARIA_RADIUS.md, padding:"6px 12px" }}>⚡ AI-extracted</div>
            <div style={{ fontFamily:geistFont, fontSize:11, fontWeight:600, color:"#FFFFFF", backgroundColor:ARIA_COLORS.primary, borderRadius:ARIA_RADIUS.md, padding:"6px 12px" }}>+ Create Plan</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:6, padding:"10px 0", borderBottom:`1px solid ${ARIA_COLORS.cardBorder}` }}>
          {["All","Overdue","Next 7 days","Preventive","Inspection"].map((f,i) => (
            <div key={f} style={{ fontFamily:geistFont, fontSize:11, fontWeight:i===0?600:400, color:i===0?ARIA_COLORS.primary:ARIA_COLORS.mutedFg, backgroundColor:i===0?ARIA_COLORS.primaryLight:"rgba(0,0,0,0.03)", border:`1px solid ${i===0?ARIA_COLORS.primaryBorder:"transparent"}`, borderRadius:ARIA_RADIUS.full, padding:"4px 12px" }}>{f}</div>
          ))}
        </div>
      </div>

      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {/* Plan list */}
        <div style={{ width: narrowList ? "38%" : "100%", flexShrink:0, padding:"10px 10px", display:"flex", flexDirection:"column", gap:6, overflowY:"hidden" }}>
          {PLANS.map((plan, i) => {
            const pf = planAppearBase + plan.ap;
            if (frame < pf) return null;
            const pe = spring({ frame: frame - pf, fps, config:{ damping:20, stiffness:280, mass:0.4 } });
            const sel = i === 0 && detailVisible;
            return (
              <div key={plan.name} style={{
                opacity:interpolate(pe,[0,1],[0,1]), transform:`translateY(${interpolate(pe,[0,1],[10,0])}px)`,
                padding:"9px 12px 9px 14px", borderRadius:ARIA_RADIUS.lg,
                backgroundColor:sel?ARIA_COLORS.cardBg:"rgba(255,255,255,0.5)",
                border:`1px solid ${sel?ARIA_COLORS.primaryBorder:ARIA_COLORS.cardBorder}`,
                borderLeft:`3px solid ${sel?ARIA_COLORS.primary:"transparent"}`,
                boxShadow:sel?"0 2px 12px -2px rgba(59,91,219,0.18)":ARIA_SHADOWS.card,
                cursor:"pointer",
              }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:5 }}>
                  <div style={{ fontFamily:geistFont, fontSize:12, fontWeight:500, color:ARIA_COLORS.foreground, lineHeight:1.3, flex:1, paddingRight:8, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{plan.name}</div>
                  <span style={{ fontFamily:geistFont, fontSize:10, fontWeight:600, color:plan.red?ARIA_COLORS.critical:ARIA_COLORS.success, flexShrink:0 }}>{plan.next}</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ fontFamily:geistFont, fontSize:9, fontWeight:500, color:plan.catC.text, backgroundColor:plan.catC.bg, border:`1px solid ${plan.catC.border}`, borderRadius:ARIA_RADIUS.sm, padding:"1px 6px" }}>{plan.cat}</span>
                  <span style={{ fontFamily:geistFont, fontSize:9, color:ARIA_COLORS.mutedFg }}>{plan.freq} · {plan.zone}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        <PlanDetailPanel frame={frame} fps={fps} />
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
//  MAIN SCENE
// ══════════════════════════════════════════════════════════════
export const Scene2DocumentUpload: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Page opacity crossfades ────────────────────────────────
  const emptyOp = interpolate(frame, [P_KB_CLICK-2, P_KB_CLICK+12], [1,0], { extrapolateLeft:"clamp", extrapolateRight:"clamp" });

  const kbOp = interpolate(frame, [P_KB_IN, P_KB_IN+12, P_M_CLICK, P_M_CLICK+14], [0,1,1,0], { extrapolateLeft:"clamp", extrapolateRight:"clamp" });

  // First Maintenance visit (tour)
  const maint1Op = interpolate(frame,
    [P_M_IN, P_M_IN+14, P_ALARMS_CLICK, P_ALARMS_CLICK+14],
    [0,1,1,0],
    { extrapolateLeft:"clamp", extrapolateRight:"clamp" }
  );

  const alarmsOp = interpolate(frame,
    [P_ALARMS_IN, P_ALARMS_IN+14, P_BACK_M_CLICK, P_BACK_M_CLICK+14],
    [0,1,1,0],
    { extrapolateLeft:"clamp", extrapolateRight:"clamp" }
  );

  // Second Maintenance visit (detail review)
  const maint2Op = interpolate(frame, [P_BACK_M_IN, P_BACK_M_IN+14], [0,1], { extrapolateLeft:"clamp", extrapolateRight:"clamp" });

  // ── Cursor ────────────────────────────────────────────────
  // All times strictly increasing
  const CX_T = [0,   P_KB_CLICK, P_KB_IN, P_FILE1_PICKUP, P_FILE1_DROP, P_FILE2_PICKUP, P_FILE2_DROP, P_FILE3_PICKUP, P_FILE3_DROP, P_ALL_DONE+12, P_M_CLICK, P_M_IN+14, P_ALARMS_CLICK, P_ALARMS_IN+10, P_BACK_M_CLICK, P_BACK_M_IN+14, P_PLAN_CLICK, P_DETAIL_IN+5, P_PROC_CLICK-6, P_PROC_CLICK, P_AI_CHAT_CLICK, P_AI_CHAT_IN, P_AI_RESPONSE, P_APPROVE_HOVER, P_APPROVE_CLICK, P_END];
  const CX_V = [860, 57,         57,      375,            720,          375,            720,          375,            720,          720,           57,        57,          57,             57,             57,             57,             420,          420,           1060,           1060,         1200,            1200,         1200,          1730,            1730,            1730];
  const CY_T = [0,   P_KB_CLICK, P_KB_IN, P_FILE1_PICKUP, P_FILE1_DROP, P_FILE2_PICKUP, P_FILE2_DROP, P_FILE3_PICKUP, P_FILE3_DROP, P_ALL_DONE+12, P_M_CLICK, P_M_IN+14, P_ALARMS_CLICK, P_ALARMS_IN+10, P_BACK_M_CLICK, P_BACK_M_IN+14, P_PLAN_CLICK, P_DETAIL_IN+5, P_PROC_CLICK-6, P_PROC_CLICK, P_AI_CHAT_CLICK, P_AI_CHAT_IN, P_AI_RESPONSE, P_APPROVE_HOVER, P_APPROVE_CLICK, P_END];
  const CY_V = [540, 136,        136,     372,            316,          388,            338,          404,            358,          358,           200,       200,         214,            214,            200,            200,            295,          295,           132,            132,          480,             480,          480,           208,             208,             208];

  const cursorX = interpolate(frame, CX_T, CX_V, { extrapolateLeft:"clamp", extrapolateRight:"clamp" });
  const cursorY = interpolate(frame, CY_T, CY_V, { extrapolateLeft:"clamp", extrapolateRight:"clamp" });

  const d1 = frame >= P_FILE1_PICKUP && frame < P_FILE1_DROP+2;
  const d2 = frame >= P_FILE2_PICKUP && frame < P_FILE2_DROP+2;
  const d3 = frame >= P_FILE3_PICKUP && frame < P_FILE3_DROP+2;
  const dragLabel = d1 ? "PDF" : d2 ? "XLSX" : d3 ? "PDF" : undefined;

  const clicking = (frame >= P_KB_CLICK-1       && frame < P_KB_CLICK+10)
    || (frame >= P_M_CLICK-1          && frame < P_M_CLICK+10)
    || (frame >= P_ALARMS_CLICK-1     && frame < P_ALARMS_CLICK+10)
    || (frame >= P_BACK_M_CLICK-1     && frame < P_BACK_M_CLICK+10)
    || (frame >= P_PLAN_CLICK-1       && frame < P_PLAN_CLICK+10)
    || (frame >= P_PROC_CLICK-1       && frame < P_PROC_CLICK+10)
    || (frame >= P_AI_CHAT_CLICK-1    && frame < P_AI_CHAT_CLICK+10)
    || (frame >= P_APPROVE_CLICK-1    && frame < P_APPROVE_CLICK+10);

  // ── Narration ─────────────────────────────────────────────
  const NAR = [
    { text:"Empty.",                            color:ARIA_COLORS.foreground, in:8,            out:P_KB_CLICK-4     },
    { text:"Upload your documentation.",        color:ARIA_COLORS.primary,    in:P_KB_IN,      out:P_ALL_DONE-12    },
    { text:"AriA fills everything in.",         color:ARIA_COLORS.foreground, in:P_ALL_DONE,   out:P_BACK_M_CLICK-8 },
    { text:"Review every detail.",              color:ARIA_COLORS.primary,    in:P_DETAIL_IN,  out:P_AI_CHAT_CLICK-8},
    { text:"Refine with AI.",                   color:ARIA_COLORS.foreground, in:P_AI_CHAT_CLICK, out:P_APPROVE_HOVER-8 },
    { text:"Review and approve.",               color:ARIA_COLORS.primary,    in:P_APPROVE_HOVER, out:P_END          },
  ];

  const activeItem = frame < P_M_CLICK
    ? "Knowledge Base"
    : frame < P_ALARMS_CLICK
    ? "Maintenance"
    : frame < P_BACK_M_CLICK
    ? "Alarms"
    : "Maintenance";

  return (
    <AbsoluteFill style={{ backgroundColor:ARIA_COLORS.background }}>

      {/* ── App shell — constrained so narration strip never overlaps ── */}
      <div style={{ position:"absolute", top:0, left:0, right:0, bottom:120 }}>
        <AriAShell activeItem={activeItem}>
          <div style={{ position:"relative", flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

            {/* 1 — Empty Maintenance */}
            <div style={{ position:"absolute", inset:0 }}>
              <EmptyMaintenancePage opacity={emptyOp} frame={frame} />
            </div>

            {/* 2 — KB upload */}
            <div style={{ position:"absolute", inset:0 }}>
              <KBPage opacity={kbOp} frame={frame} fps={fps} />
            </div>

            {/* 3 — First Maintenance visit (tour) */}
            <div style={{ position:"absolute", inset:0 }}>
              <PopulatedMaintenancePage opacity={maint1Op} frame={frame} fps={fps} planAppearBase={P_M_IN+8} />
            </div>

            {/* 4 — Alarms visit (tour) */}
            <div style={{ position:"absolute", inset:0 }}>
              <AlarmsPage opacity={alarmsOp} frame={frame} fps={fps} />
            </div>

            {/* 5 — Second Maintenance visit (detail review + AI chat + approve) */}
            <div style={{ position:"absolute", inset:0 }}>
              <PopulatedMaintenancePage opacity={maint2Op} frame={frame} fps={fps} planAppearBase={P_BACK_M_IN+6} />
            </div>

            {/* Cursor */}
            <Cursor x={cursorX} y={cursorY} clicking={clicking} dragLabel={dragLabel} />
          </div>
        </AriAShell>
      </div>

      {/* ── Narration strip — always clear below the app ── */}
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
              position:"absolute",
              opacity:op,
              fontFamily:geistFont,
              fontSize:36,
              fontWeight:700,
              color:n.color,
              letterSpacing:"-0.02em",
              textAlign:"center",
            }}>{n.text}</div>
          );
        })}
      </div>

    </AbsoluteFill>
  );
};
