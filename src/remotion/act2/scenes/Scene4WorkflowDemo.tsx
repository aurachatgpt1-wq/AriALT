import React from "react";
import {
  AbsoluteFill, interpolate, spring,
  useCurrentFrame, useVideoConfig,
} from "remotion";
import { ARIA_COLORS, ARIA_SHADOWS, ARIA_RADIUS, geistFont } from "../constants";
import { AriAShell } from "../components/AriAShell";

// ══════════════════════════════════════════════════════════════
//  PHASE TIMINGS  (480 frames = 16 s)
// ══════════════════════════════════════════════════════════════
// — Chat phase —
const P_CHAT_SHOW    = 0;    // Chat page visible
const P_USER_TYPE    = 18;   // Operator starts typing
const P_USER_SEND    = 72;   // Message sent → bubble appears
const P_ARIA_THINK   = 88;   // AriA "thinking" dots
const P_STEP_1       = 108;  // Step 1: KB lookup
const P_STEP_2       = 138;  // Step 2: WO created
const P_STEP_3       = 165;  // Step 3: mobile sent
const P_STEP_4       = 192;  // Step 4: parts check
const P_STEP_5       = 218;  // Step 5: PO auto-created
const P_STEP_DONE    = 245;  // Summary line

// — Work Orders page —
const P_WO_CLICK     = 275;  // Cursor → Work Orders sidebar
const P_WO_IN        = 292;  // WO page fades in
const P_WO_SEL       = 315;  // WO-1094 selected
const P_WO_DETAIL    = 330;  // Detail panel slides in
const P_TAB_CLICK    = 360;  // Click Checklist tab
const P_STEPS_IN     = 374;  // Steps stagger in

// — Mobile overlay —
const P_MOBILE_IN    = 428;  // Phone slides in from right
const P_MOB_NOTIF    = 442;  // Notification banner
const P_MOB_STEPS    = 455;  // Procedure steps appear
const P_END          = 480;

// ══════════════════════════════════════════════════════════════
//  DATA
// ══════════════════════════════════════════════════════════════
const USER_MESSAGE = "MOT-401 is showing a critical bearing temperature at 89 °C. Can you create the work order and brief the technician?";

const ARIA_STEPS = [
  { frame: P_STEP_1,    icon:"search",   text:"Found procedure: Plan #001 — Bearing support maintenance (10 steps from KB)",  done: true  },
  { frame: P_STEP_2,    icon:"clipboard",text:"WO-1094 created · Priority: Critical · Assigned to M. Rossi · Due: Today 18:00", done: true  },
  { frame: P_STEP_3,    icon:"phone",    text:"10-step procedure sent to M. Rossi's mobile app — technician notified",          done: true  },
  { frame: P_STEP_4,    icon:"package",  text:"Spare parts checked: SKF 6308-2RS × 2 ✓ · Grease × 1 ✓ · Gasket kit ✗ (0)",    done: true  },
  { frame: P_STEP_5,    icon:"cart",     text:"Purchase Order PO-0847 auto-created → Mec-Supply · ETA 24 h",                    done: false },
];

const WO_CHECKLIST = [
  "Lock out / Tag out motor MOT-401 (LOTO procedure)",
  "Measure bearing temperature with contact thermometer",
  "Remove bearing housing cover — drive-end side",
  "Inspect bearings for wear, pitting, or discoloration",
  "Replace bearings: SKF 6308-2RS × 2",
  "Relubricate with Mobil XHP 222 grease (3–4 pumps)",
  "Reinstall housing and verify axial play",
  "Run at 20% load for 30 min — monitor temperature",
];

const ICON_PATHS: Record<string, string | string[]> = {
  search:    ["M21 21l-4.35-4.35", "M11 19A8 8 0 1 0 11 3a8 8 0 0 0 0 16z"],
  clipboard: ["M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2","M9 12h6","M9 16h6"],
  phone:     ["M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.91 6.91l.75-.75a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"],
  package:   ["M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z","M12 22V12","M3.27 6.96 12 12.01l8.73-5.05","M7.5 4.21l9 5.2"],
  cart:      ["M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z","M3 6h18","M16 10a4 4 0 0 1-8 0"],
  sparkles:  ["M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"],
};

const SvgIcon: React.FC<{ name: string; size?: number; color?: string }> = ({ name, size = 13, color = ARIA_COLORS.primary }) => {
  const paths = ICON_PATHS[name] ?? [];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {(Array.isArray(paths) ? paths : [paths]).map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
};

// ══════════════════════════════════════════════════════════════
//  CURSOR
// ══════════════════════════════════════════════════════════════
const Cursor: React.FC<{ x:number; y:number; clicking:boolean }> = ({ x, y, clicking }) => (
  <div style={{ position:"absolute", left:x-2, top:y-2, zIndex:200, pointerEvents:"none" }}>
    {clicking && (
      <div style={{ position:"absolute", left:-14, top:-14, width:32, height:32, borderRadius:"50%", border:`2px solid ${ARIA_COLORS.primary}`, opacity:0.65 }}/>
    )}
    <svg width="22" height="26" viewBox="0 0 22 26" fill="none">
      <path d="M3 1 L3 21 L7.5 16.5 L10.5 24 L13 23 L10 15.5 L17 15.5 Z" fill="white" stroke="#1A1F33" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  </div>
);

// ══════════════════════════════════════════════════════════════
//  CHAT PAGE
// ══════════════════════════════════════════════════════════════
const ChatPage: React.FC<{ opacity:number; frame:number; fps:number }> = ({ opacity, frame, fps }) => {
  const typingChars = frame >= P_USER_TYPE
    ? Math.min(Math.floor((frame - P_USER_TYPE) * 1.8), USER_MESSAGE.length)
    : 0;
  const typedMsg = USER_MESSAGE.slice(0, typingChars);
  const msgSent  = frame >= P_USER_SEND;
  const showThinking = frame >= P_ARIA_THINK && frame < P_STEP_1;

  return (
    <div style={{ opacity, display:"flex", flexDirection:"column", height:"100%" }}>
      {/* Page header */}
      <div style={{ padding:"18px 26px 14px", borderBottom:`1px solid ${ARIA_COLORS.cardBorder}`, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:36, height:36, borderRadius:ARIA_RADIUS.md,
            backgroundColor:ARIA_COLORS.primaryLight, border:`1px solid ${ARIA_COLORS.primaryBorder}`,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <SvgIcon name="sparkles" size={16} color={ARIA_COLORS.primary}/>
          </div>
          <div>
            <div style={{ fontFamily:geistFont, fontSize:16, fontWeight:600, color:ARIA_COLORS.foreground, letterSpacing:"-0.01em" }}>AriA Assistant</div>
            <div style={{ fontFamily:geistFont, fontSize:11, color:ARIA_COLORS.mutedFg }}>Agent Orchestrator — ask anything, AriA handles it</div>
          </div>
        </div>
      </div>

      {/* Chat messages */}
      <div style={{ flex:1, padding:"20px 26px", display:"flex", flexDirection:"column", gap:16, overflowY:"hidden" }}>

        {/* User bubble */}
        {msgSent && (() => {
          const en = spring({ frame:frame-P_USER_SEND, fps, config:{ damping:22, stiffness:280 } });
          return (
            <div style={{
              display:"flex", justifyContent:"flex-end",
              opacity:interpolate(en,[0,1],[0,1]),
              transform:`translateY(${interpolate(en,[0,1],[10,0])}px)`,
            }}>
              <div style={{
                maxWidth:"62%",
                backgroundColor:ARIA_COLORS.primary,
                borderRadius:"14px 14px 4px 14px",
                padding:"11px 16px",
                boxShadow:`0 4px 16px -4px rgba(59,91,219,0.30)`,
              }}>
                <span style={{ fontFamily:geistFont, fontSize:12, color:"#FFFFFF", lineHeight:1.5 }}>
                  {USER_MESSAGE}
                </span>
              </div>
            </div>
          );
        })()}

        {/* AriA response */}
        {frame >= P_ARIA_THINK && (() => {
          const en = spring({ frame:frame-P_ARIA_THINK, fps, config:{ damping:22, stiffness:220 } });
          return (
            <div style={{
              display:"flex", alignItems:"flex-start", gap:10,
              opacity:interpolate(en,[0,1],[0,1]),
              transform:`translateY(${interpolate(en,[0,1],[10,0])}px)`,
            }}>
              {/* AriA avatar */}
              <div style={{
                width:32, height:32, borderRadius:"50%", flexShrink:0,
                backgroundColor:ARIA_COLORS.primary,
                border:`2px solid ${ARIA_COLORS.primaryBorder}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:`0 2px 10px -2px rgba(59,91,219,0.35)`,
              }}>
                <SvgIcon name="sparkles" size={14} color="#FFFFFF"/>
              </div>

              {/* Message card */}
              <div style={{
                flex:1, maxWidth:"78%",
                backgroundColor:"#FFFFFF",
                border:`1px solid ${ARIA_COLORS.cardBorder}`,
                borderRadius:"4px 14px 14px 14px",
                overflow:"hidden",
                boxShadow:ARIA_SHADOWS.card,
              }}>
                {/* Card header */}
                <div style={{
                  padding:"9px 14px",
                  backgroundColor:ARIA_COLORS.primaryLight,
                  borderBottom:`1px solid ${ARIA_COLORS.primaryBorder}`,
                  display:"flex", alignItems:"center", gap:7,
                }}>
                  <SvgIcon name="sparkles" size={11} color={ARIA_COLORS.primary}/>
                  <span style={{ fontFamily:geistFont, fontSize:10, fontWeight:600, color:ARIA_COLORS.primary, textTransform:"uppercase", letterSpacing:"0.08em" }}>
                    AriA · Agent Orchestrator
                  </span>
                </div>

                <div style={{ padding:"12px 14px", display:"flex", flexDirection:"column", gap:8 }}>
                  {/* Thinking dots */}
                  {showThinking && (
                    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <span style={{ fontFamily:geistFont, fontSize:11, color:ARIA_COLORS.mutedFg }}>Analyzing alarm data</span>
                      {[0,1,2].map(d => (
                        <div key={d} style={{
                          width:5, height:5, borderRadius:"50%", backgroundColor:ARIA_COLORS.primary,
                          opacity: interpolate((frame + d * 5) % 15, [0,5,10,15],[0.2,1,1,0.2],{extrapolateLeft:"clamp",extrapolateRight:"clamp"}),
                        }}/>
                      ))}
                    </div>
                  )}

                  {/* Action steps */}
                  {ARIA_STEPS.map((step, i) => {
                    if (frame < step.frame) return null;
                    const en = spring({ frame:frame-step.frame, fps, config:{ damping:20, stiffness:300, mass:0.5 } });
                    const stepDone = step.done;
                    const isWarning = !stepDone;
                    const accent = isWarning ? ARIA_COLORS.warning : ARIA_COLORS.success;
                    return (
                      <div key={i} style={{
                        opacity:   interpolate(en,[0,1],[0,1]),
                        transform:`translateX(${interpolate(en,[0,1],[-8,0])}px)`,
                        display:"flex", alignItems:"flex-start", gap:8,
                        padding:"8px 12px", borderRadius:ARIA_RADIUS.md,
                        backgroundColor: isWarning ? ARIA_COLORS.warningMuted : "#F0FDF6",
                        border:`1px solid ${isWarning ? ARIA_COLORS.warningBorder : ARIA_COLORS.successBorder}`,
                      }}>
                        <div style={{
                          width:22, height:22, borderRadius:"50%", flexShrink:0,
                          backgroundColor:`${accent}18`, border:`1.5px solid ${accent}`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                        }}>
                          <SvgIcon name={step.icon} size={11} color={accent}/>
                        </div>
                        <span style={{ fontFamily:geistFont, fontSize:11, color:ARIA_COLORS.foreground, lineHeight:1.45 }}>
                          {step.text}
                        </span>
                        <span style={{ fontFamily:geistFont, fontSize:11, fontWeight:700, color:accent, flexShrink:0, marginLeft:"auto" }}>
                          {stepDone ? "✓" : "⚠"}
                        </span>
                      </div>
                    );
                  })}

                  {/* Final summary */}
                  {frame >= P_STEP_DONE && (() => {
                    const en = spring({ frame:frame-P_STEP_DONE, fps, config:{ damping:20, stiffness:240 } });
                    return (
                      <div style={{
                        opacity:   interpolate(en,[0,1],[0,1]),
                        transform:`translateY(${interpolate(en,[0,1],[6,0])}px)`,
                        fontFamily:geistFont, fontSize:12, color:ARIA_COLORS.foreground,
                        lineHeight:1.5, paddingTop:4,
                        borderTop:`1px solid ${ARIA_COLORS.cardBorder}`,
                      }}>
                        All done — work order open, technician briefed, parts ordered where needed.
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Input bar */}
      <div style={{
        padding:"12px 26px 16px", flexShrink:0,
        borderTop:`1px solid ${ARIA_COLORS.cardBorder}`,
      }}>
        <div style={{
          display:"flex", alignItems:"center", gap:10,
          backgroundColor:"#FFFFFF",
          border:`1.5px solid ${frame < P_USER_SEND ? ARIA_COLORS.primary : ARIA_COLORS.cardBorder}`,
          borderRadius:ARIA_RADIUS.lg, padding:"10px 14px",
          boxShadow: frame < P_USER_SEND ? `0 0 0 3px rgba(59,91,219,0.08)` : "none",
        }}>
          <span style={{ fontFamily:geistFont, fontSize:12, flex:1, color:ARIA_COLORS.foreground }}>
            {frame < P_USER_SEND ? (
              <>
                {typedMsg}
                {frame >= P_USER_TYPE && frame < P_USER_SEND && (
                  <span style={{ opacity: Math.sin(frame * 0.5) > 0 ? 1 : 0, color:ARIA_COLORS.primary }}>|</span>
                )}
              </>
            ) : (
              <span style={{ color:ARIA_COLORS.mutedFg }}>Ask AriA anything…</span>
            )}
          </span>
          <div style={{
            width:30, height:30, borderRadius:"50%",
            backgroundColor: frame < P_USER_SEND ? ARIA_COLORS.primary : ARIA_COLORS.primaryLight,
            border:`1.5px solid ${ARIA_COLORS.primaryBorder}`,
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={frame < P_USER_SEND ? "#FFF" : ARIA_COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13"/>
              <path d="M22 2 15 22 11 13 2 9l20-7z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
//  WORK ORDERS PAGE
// ══════════════════════════════════════════════════════════════
const WOPage: React.FC<{ opacity:number; frame:number; fps:number }> = ({ opacity, frame, fps }) => {
  const detailVisible = frame >= P_WO_DETAIL;
  const checklistActive = frame >= P_TAB_CLICK;

  const woCards = [
    { id:"WO-1094", title:"Replace MOT-401 bearings — Critical temp alarm", priority:"Critical", pColor:ARIA_COLORS.critical, pBg:ARIA_COLORS.criticalMuted, assigned:"M. Rossi",   due:"Today 18:00", status:"Open",    sel:true,  appear:P_WO_IN+6  },
    { id:"WO-1092", title:"Quarterly inspection — Conveyor belt CNV-118",   priority:"Medium",   pColor:"#1D4ED8",            pBg:"#EFF6FF",               assigned:"L. Bianchi", due:"Tomorrow",    status:"Pending", sel:false, appear:P_WO_IN+20 },
    { id:"WO-1090", title:"Air compressor filter replacement CMP-101",       priority:"Low",      pColor:ARIA_COLORS.success,  pBg:ARIA_COLORS.successMuted, assigned:"R. Ferrari", due:"3 days",      status:"Pending", sel:false, appear:P_WO_IN+34 },
  ] as const;

  return (
    <div style={{ opacity, display:"flex", flexDirection:"column", height:"100%" }}>
      {/* Header */}
      <div style={{ padding:"18px 26px 0", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:ARIA_RADIUS.md, backgroundColor:ARIA_COLORS.primaryLight, border:`1px solid ${ARIA_COLORS.primaryBorder}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <SvgIcon name="clipboard" size={17} color={ARIA_COLORS.primary}/>
            </div>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontFamily:geistFont, fontSize:17, fontWeight:600, color:ARIA_COLORS.foreground, letterSpacing:"-0.01em" }}>Work Orders</span>
                <span style={{ fontFamily:geistFont, fontSize:11, color:ARIA_COLORS.mutedFg, backgroundColor:"rgba(0,0,0,0.05)", border:`1px solid ${ARIA_COLORS.cardBorder}`, borderRadius:ARIA_RADIUS.full, padding:"1px 8px" }}>3</span>
              </div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <div style={{ fontFamily:geistFont, fontSize:11, fontWeight:600, color:ARIA_COLORS.primary, backgroundColor:ARIA_COLORS.primaryLight, border:`1px solid ${ARIA_COLORS.primaryBorder}`, borderRadius:ARIA_RADIUS.md, padding:"6px 12px" }}>⚡ AI-generated</div>
            <div style={{ fontFamily:geistFont, fontSize:11, fontWeight:600, color:"#FFF", backgroundColor:ARIA_COLORS.primary, borderRadius:ARIA_RADIUS.md, padding:"6px 12px" }}>+ Create WO</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:6, padding:"10px 0", borderBottom:`1px solid ${ARIA_COLORS.cardBorder}` }}>
          {["All","Open","In Progress","Pending","Closed"].map((f,i) => (
            <div key={f} style={{ fontFamily:geistFont, fontSize:11, fontWeight:i===0?600:400, color:i===0?ARIA_COLORS.primary:ARIA_COLORS.mutedFg, backgroundColor:i===0?ARIA_COLORS.primaryLight:"rgba(0,0,0,0.03)", border:`1px solid ${i===0?ARIA_COLORS.primaryBorder:"transparent"}`, borderRadius:ARIA_RADIUS.full, padding:"4px 12px" }}>{f}</div>
          ))}
        </div>
      </div>

      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {/* WO list */}
        <div style={{ width: detailVisible ? "38%" : "100%", flexShrink:0, padding:"10px 10px", display:"flex", flexDirection:"column", gap:7, overflowY:"hidden" }}>
          {woCards.map((wo) => {
            const af = wo.appear;
            if (frame < af) return null;
            const en = spring({ frame:frame-af, fps, config:{ damping:20, stiffness:260 } });
            return (
              <div key={wo.id} style={{
                opacity:   interpolate(en,[0,1],[0,1]),
                transform:`translateY(${interpolate(en,[0,1],[10,0])}px)`,
                padding:"10px 12px 10px 14px", borderRadius:ARIA_RADIUS.lg,
                backgroundColor: wo.sel ? ARIA_COLORS.cardBg : "rgba(255,255,255,0.5)",
                border:`1px solid ${wo.sel ? ARIA_COLORS.primaryBorder : ARIA_COLORS.cardBorder}`,
                borderLeft:`3px solid ${wo.sel ? ARIA_COLORS.primary : "transparent"}`,
                boxShadow: wo.sel ? "0 2px 12px -2px rgba(59,91,219,0.18)" : ARIA_SHADOWS.card,
              }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:5 }}>
                  <div>
                    <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:10, fontWeight:700, color:ARIA_COLORS.primary, marginBottom:2 }}>{wo.id}</div>
                    <div style={{ fontFamily:geistFont, fontSize:11, fontWeight:500, color:ARIA_COLORS.foreground, lineHeight:1.3, maxWidth:280 }}>{wo.title}</div>
                  </div>
                  <span style={{ fontFamily:geistFont, fontSize:9, fontWeight:700, color:wo.pColor, backgroundColor:wo.pBg, border:`1px solid ${wo.pColor}33`, borderRadius:ARIA_RADIUS.full, padding:"2px 8px", flexShrink:0, marginLeft:8 }}>{wo.priority}</span>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <span style={{ fontFamily:geistFont, fontSize:9, color:ARIA_COLORS.mutedFg }}>👤 {wo.assigned}</span>
                  <span style={{ fontFamily:geistFont, fontSize:9, color:ARIA_COLORS.mutedFg }}>📅 {wo.due}</span>
                  <span style={{ marginLeft:"auto", fontFamily:geistFont, fontSize:9, fontWeight:600, color:wo.status==="Open"?ARIA_COLORS.warning:ARIA_COLORS.mutedFg }}>{wo.status}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* WO Detail panel */}
        {detailVisible && (() => {
          const en = spring({ frame:frame-P_WO_DETAIL, fps, config:{ damping:22, stiffness:150 } });
          return (
            <div style={{
              flex:1, opacity:interpolate(en,[0,1],[0,1]),
              transform:`translateX(${interpolate(en,[0,1],[30,0])}px)`,
              display:"flex", flexDirection:"column", overflow:"hidden",
              borderLeft:`1px solid ${ARIA_COLORS.cardBorder}`,
            }}>
              {/* Detail header */}
              <div style={{ padding:"14px 20px 0", borderBottom:`1px solid ${ARIA_COLORS.cardBorder}`, flexShrink:0 }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:8 }}>
                  <div>
                    <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:11, fontWeight:700, color:ARIA_COLORS.primary, marginBottom:3 }}>WO-1094</div>
                    <div style={{ fontFamily:geistFont, fontSize:14, fontWeight:600, color:ARIA_COLORS.foreground, letterSpacing:"-0.01em", lineHeight:1.3 }}>Replace MOT-401 bearings</div>
                    <div style={{ fontFamily:geistFont, fontSize:11, color:ARIA_COLORS.mutedFg, marginTop:3 }}>Created by AriA Agent · Today 09:14</div>
                  </div>
                  <span style={{ fontFamily:geistFont, fontSize:10, fontWeight:700, color:ARIA_COLORS.critical, backgroundColor:ARIA_COLORS.criticalMuted, border:`1px solid ${ARIA_COLORS.criticalBorder}`, borderRadius:ARIA_RADIUS.full, padding:"4px 12px", flexShrink:0 }}>CRITICAL</span>
                </div>
                <div style={{ display:"flex", gap:6, marginBottom:10 }}>
                  {[
                    { l:"⚡ AI-generated", c:ARIA_COLORS.primary,  bg:ARIA_COLORS.primaryLight,  border:ARIA_COLORS.primaryBorder  },
                    { l:"Assigned",        c:"#1D4ED8",             bg:"#EFF6FF",                 border:"#BFDBFE"                 },
                  ].map(p => (
                    <div key={p.l} style={{ fontFamily:geistFont, fontSize:11, fontWeight:500, color:p.c, backgroundColor:p.bg, border:`1px solid ${p.border}`, borderRadius:ARIA_RADIUS.full, padding:"3px 10px" }}>{p.l}</div>
                  ))}
                </div>
                {/* Tabs */}
                <div style={{ display:"flex" }}>
                  {["Details","Checklist","Parts","History"].map((tab, i) => {
                    const active = checklistActive ? i === 1 : i === 0;
                    return (
                      <div key={tab} style={{ fontFamily:geistFont, fontSize:12, fontWeight:active?600:400, color:active?ARIA_COLORS.primary:ARIA_COLORS.mutedFg, padding:"6px 16px", borderBottom:active?`2px solid ${ARIA_COLORS.primary}`:"2px solid transparent", marginBottom:-1 }}>{tab}</div>
                    );
                  })}
                </div>
              </div>

              {/* Tab content */}
              {!checklistActive ? (
                <div style={{ flex:1, padding:"16px 20px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 28px", overflow:"hidden" }}>
                  {[
                    { label:"Asset",       value:"MOT-401 — Main shaft motor" },
                    { label:"Zone",        value:"Line A — Zone 3"            },
                    { label:"Assigned to", value:"M. Rossi"                   },
                    { label:"Department",  value:"Mechanical Maintenance"     },
                    { label:"Priority",    value:"Critical",   valueColor:ARIA_COLORS.critical },
                    { label:"Due date",    value:"Today 18:00"                },
                    { label:"Est. time",   value:"4.5 hours"                  },
                    { label:"Created by",  value:"⚡ AriA Agent", valueColor:ARIA_COLORS.primary },
                  ].map(f => (
                    <div key={f.label}>
                      <div style={{ fontFamily:geistFont, fontSize:9, fontWeight:600, color:ARIA_COLORS.mutedFg, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>{f.label}</div>
                      <div style={{ fontFamily:geistFont, fontSize:12, fontWeight:500, color:(f as any).valueColor ?? ARIA_COLORS.foreground }}>{f.value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ flex:1, padding:"14px 20px", overflow:"hidden" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                    <div style={{ fontFamily:geistFont, fontSize:9, fontWeight:600, color:ARIA_COLORS.mutedFg, textTransform:"uppercase", letterSpacing:"0.1em" }}>CHECKLIST — {WO_CHECKLIST.length} STEPS</div>
                    <div style={{ fontFamily:geistFont, fontSize:9, fontWeight:600, color:ARIA_COLORS.primary, backgroundColor:ARIA_COLORS.primaryLight, borderRadius:ARIA_RADIUS.full, padding:"1px 7px" }}>⚡ From Knowledge Base</div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {WO_CHECKLIST.map((step, i) => {
                      const sf = P_STEPS_IN + i * 10;
                      if (frame < sf) return null;
                      const en = spring({ frame:frame-sf, fps, config:{ damping:20, stiffness:320, mass:0.5 } });
                      return (
                        <div key={i} style={{
                          opacity:   interpolate(en,[0,1],[0,1]),
                          transform:`translateX(${interpolate(en,[0,1],[-10,0])}px)`,
                          display:"flex", alignItems:"flex-start", gap:10,
                          padding:"8px 12px", borderRadius:ARIA_RADIUS.md,
                          backgroundColor:ARIA_COLORS.cardBg, border:`1px solid ${ARIA_COLORS.cardBorder}`,
                        }}>
                          <div style={{ width:20, height:20, borderRadius:ARIA_RADIUS.sm, flexShrink:0, backgroundColor:"rgba(0,0,0,0.04)", border:`1px solid ${ARIA_COLORS.cardBorder}`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:geistFont, fontSize:9, fontWeight:600, color:ARIA_COLORS.mutedFg }}>{i+1}</div>
                          <span style={{ fontFamily:geistFont, fontSize:11, color:ARIA_COLORS.foreground, lineHeight:1.4 }}>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
//  MOBILE OVERLAY
// ══════════════════════════════════════════════════════════════
const MobileOverlay: React.FC<{ frame:number; fps:number }> = ({ frame, fps }) => {
  if (frame < P_MOBILE_IN) return null;
  const en = spring({ frame:frame-P_MOBILE_IN, fps, config:{ damping:22, stiffness:160 } });

  const MOB_STEPS = [
    "Lock out / Tag out MOT-401",
    "Measure bearing temperature",
    "Remove housing cover",
    "Inspect bearings for wear",
    "Replace SKF 6308-2RS × 2",
  ];

  return (
    <div style={{
      position:"absolute", right:32, top:80,
      opacity:   interpolate(en,[0,1],[0,1]),
      transform:`translateX(${interpolate(en,[0,1],[80,0])}px) rotate(${interpolate(en,[0,1],[3,0])}deg)`,
      zIndex:100,
    }}>
      {/* Phone shell */}
      <div style={{
        width:240, borderRadius:32,
        backgroundColor:"#1A1F33",
        padding:"10px 6px",
        boxShadow:"0 30px 80px -16px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)",
      }}>
        {/* Notch */}
        <div style={{ width:70, height:18, borderRadius:10, backgroundColor:"#0F1219", margin:"0 auto 8px", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ width:42, height:8, borderRadius:4, backgroundColor:"#2A2F45" }}/>
        </div>
        {/* Screen */}
        <div style={{ borderRadius:22, backgroundColor:"#F3F4F7", overflow:"hidden", minHeight:380 }}>
          {/* App header */}
          <div style={{ backgroundColor:ARIA_COLORS.primary, padding:"12px 14px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:24, height:24, borderRadius:6, backgroundColor:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <SvgIcon name="sparkles" size={12} color="#FFF"/>
              </div>
              <div>
                <div style={{ fontFamily:geistFont, fontSize:11, fontWeight:700, color:"#FFF" }}>AriA Mobile</div>
                <div style={{ fontFamily:geistFont, fontSize:9, color:"rgba(255,255,255,0.7)" }}>M. Rossi · Technician</div>
              </div>
            </div>
          </div>

          {/* Notification banner */}
          {frame >= P_MOB_NOTIF && (() => {
            const nEn = spring({ frame:frame-P_MOB_NOTIF, fps, config:{ damping:22, stiffness:300 } });
            return (
              <div style={{
                margin:"10px 8px 0",
                opacity:   interpolate(nEn,[0,1],[0,1]),
                transform:`translateY(${interpolate(nEn,[0,1],[-12,0])}px)`,
                backgroundColor:"#FFF",
                border:`1.5px solid ${ARIA_COLORS.criticalBorder}`,
                borderRadius:10, padding:"9px 11px",
                boxShadow:`0 4px 16px -4px rgba(220,38,38,0.22)`,
              }}>
                <div style={{ fontFamily:geistFont, fontSize:10, fontWeight:700, color:ARIA_COLORS.critical, marginBottom:2 }}>🔴 WO-1094 — URGENT</div>
                <div style={{ fontFamily:geistFont, fontSize:9, color:ARIA_COLORS.foreground, lineHeight:1.4 }}>
                  Replace MOT-401 bearings · Due today 18:00
                </div>
              </div>
            );
          })()}

          {/* Steps */}
          <div style={{ padding:"10px 8px", display:"flex", flexDirection:"column", gap:6 }}>
            <div style={{ fontFamily:geistFont, fontSize:9, fontWeight:600, color:ARIA_COLORS.mutedFg, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:2 }}>PROCEDURE — 8 STEPS</div>
            {MOB_STEPS.map((step, i) => {
              const sf = P_MOB_STEPS + i * 12;
              if (frame < sf) return null;
              const en = spring({ frame:frame-sf, fps, config:{ damping:20, stiffness:320 } });
              return (
                <div key={i} style={{
                  opacity:   interpolate(en,[0,1],[0,1]),
                  transform:`translateX(${interpolate(en,[0,1],[-6,0])}px)`,
                  display:"flex", alignItems:"center", gap:7,
                  padding:"7px 9px", borderRadius:7,
                  backgroundColor:"#FFF", border:`1px solid ${ARIA_COLORS.cardBorder}`,
                }}>
                  <div style={{ width:18, height:18, borderRadius:"50%", flexShrink:0, backgroundColor:ARIA_COLORS.primaryLight, border:`1px solid ${ARIA_COLORS.primaryBorder}`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:geistFont, fontSize:8, fontWeight:700, color:ARIA_COLORS.primary }}>{i+1}</div>
                  <span style={{ fontFamily:geistFont, fontSize:9, color:ARIA_COLORS.foreground, lineHeight:1.35 }}>{step}</span>
                </div>
              );
            })}
            {frame >= P_MOB_STEPS + 4 * 12 && (
              <div style={{ fontFamily:geistFont, fontSize:9, color:ARIA_COLORS.mutedFg, textAlign:"center", paddingTop:2 }}>+ 3 more steps below</div>
            )}
          </div>
        </div>
        {/* Home bar */}
        <div style={{ width:60, height:4, borderRadius:2, backgroundColor:"rgba(255,255,255,0.2)", margin:"8px auto 0" }}/>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
//  MAIN SCENE
// ══════════════════════════════════════════════════════════════
export const Scene4WorkflowDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Page crossfades
  const chatOp = interpolate(frame, [P_CHAT_SHOW, P_CHAT_SHOW+12, P_WO_CLICK, P_WO_CLICK+18], [0,1,1,0], { extrapolateLeft:"clamp", extrapolateRight:"clamp" });
  const woOp   = interpolate(frame, [P_WO_IN, P_WO_IN+18], [0,1], { extrapolateLeft:"clamp", extrapolateRight:"clamp" });

  const activeItem = frame < P_WO_CLICK ? "AriA Assistant" : "Work Orders";

  // Cursor
  const CX_T = [0, P_USER_SEND-4, P_USER_SEND, P_WO_CLICK, P_WO_CLICK+5, P_WO_SEL, P_TAB_CLICK, P_TAB_CLICK+5, P_END];
  const CX_V = [900, 1810,         1810,         57,          57,            450,       900,          900,           900];
  const CY_T = [0, P_USER_SEND-4, P_USER_SEND, P_WO_CLICK, P_WO_CLICK+5, P_WO_SEL, P_TAB_CLICK, P_TAB_CLICK+5, P_END];
  const CY_V = [500, 760,          760,          200,         200,           285,       178,          178,           178];

  const cursorX = interpolate(frame, CX_T, CX_V, { extrapolateLeft:"clamp", extrapolateRight:"clamp" });
  const cursorY = interpolate(frame, CY_T, CY_V, { extrapolateLeft:"clamp", extrapolateRight:"clamp" });

  const clicking =
    (frame >= P_USER_SEND-1   && frame < P_USER_SEND+10)  ||
    (frame >= P_WO_CLICK-1    && frame < P_WO_CLICK+12)   ||
    (frame >= P_WO_SEL-1      && frame < P_WO_SEL+12)     ||
    (frame >= P_TAB_CLICK-1   && frame < P_TAB_CLICK+12);

  // Narration
  const NAR = [
    { text:"The operator reports a problem.",    color:ARIA_COLORS.foreground, in:8,            out:P_USER_SEND + 10    },
    { text:"AriA handles everything.",           color:ARIA_COLORS.primary,    in:P_ARIA_THINK, out:P_WO_CLICK - 10     },
    { text:"Work order, ready.",                 color:ARIA_COLORS.foreground, in:P_WO_IN,      out:P_MOBILE_IN - 10    },
    { text:"The technician knows what to do.",   color:ARIA_COLORS.primary,    in:P_MOBILE_IN,  out:P_END               },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor:ARIA_COLORS.background }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, bottom:120 }}>
        <AriAShell activeItem={activeItem}>
          <div style={{ position:"relative", flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
            {/* Chat page */}
            <div style={{ position:"absolute", inset:0 }}>
              <ChatPage opacity={chatOp} frame={frame} fps={fps} />
            </div>
            {/* WO page */}
            <div style={{ position:"absolute", inset:0 }}>
              <WOPage opacity={woOp} frame={frame} fps={fps} />
            </div>
            {/* Mobile overlay */}
            <MobileOverlay frame={frame} fps={fps} />
            {/* Cursor */}
            <Cursor x={cursorX} y={cursorY} clicking={clicking} />
          </div>
        </AriAShell>
      </div>

      {/* Narration strip */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0, height:120,
        backgroundColor:ARIA_COLORS.background, borderTop:`1px solid ${ARIA_COLORS.cardBorder}`,
        display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none",
      }}>
        {NAR.map((n, i) => {
          const op = interpolate(frame, [n.in, n.in+14, n.out-10, n.out], [0,1,1,0], { extrapolateLeft:"clamp", extrapolateRight:"clamp" });
          if (op <= 0.01) return null;
          return (
            <div key={i} style={{ position:"absolute", opacity:op, fontFamily:geistFont, fontSize:40, fontWeight:700, color:n.color, letterSpacing:"-0.02em", textAlign:"center" }}>{n.text}</div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
