import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { geistFont, ARIA_COLORS, ARIA_SHADOWS } from "../constants";

// ─────────────────────────────────────────────────────────────────────────────
// SceneAgentCMMS — AriA agent works a Torque safety incident in real-time.
// Total duration: 300 frames (10s @ 30fps).
//
// Choreography:
//   P1   0 – 65     5 alarm cards slide in from the left, stagger
//   P2  25 – 80     Camera zooms onto card #1 (the selected one)
//   P3  85 – 130    Cards 2-5 exit left + chrome fades; card #1 FLIPS into the
//                   full detail panel (rotateY 0→180 + box morph to full size).
//                   Camera pulls back from zoomed to neutral.
//   P4 135 – 180    Camera zooms on Description field, typewriter fills (31% conf)
//   P5 185 – 225    Camera pans to Root Cause, typewriter fills (75% conf)
//   P6 230 – 270    Camera pans to Resolution Plan, typewriter fills (94% conf)
//   P7 270 – 300    Pull back, READY state, Predictive Insight slides in
// ─────────────────────────────────────────────────────────────────────────────

const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
// Softer easing than cubic — the interpolate() helper applies this per-segment,
// so gentler curves mean less acceleration/deceleration at keyframe boundaries,
// which makes multi-keyframe motion feel like one smooth continuous follow.
const EASE = Easing.inOut(Easing.sin);

const APPLE_ACCENT = "#3B5BDB";
const INK = ARIA_COLORS.foreground;
const MUTED = ARIA_COLORS.mutedFg;
const LABEL = ARIA_COLORS.labelFg;
const PAGE_BG = "#F7F8FC";
const PANEL_BG = "#FFFFFF";
const PANEL_BORDER = "rgba(214,217,227,0.7)";
const FIELD_BG = "#FAFBFD";
const FIELD_BORDER = "rgba(214,217,227,0.9)";
const CARD_SHADOW = "0 2px 14px rgba(15,20,40,0.055), 0 1px 3px rgba(15,20,40,0.035)";

// ─── Layout constants (absolute coordinates within 1920×1080) ───────────────
// Full-width stack: search → filter chips → "5 ACTIVE" label → 5 cards
const CARD_W = 1600;
const CARD_H = 100;
const CARD_STRIDE = 114;
const CARD_X = Math.round((1920 - CARD_W) / 2); // 160
const SEARCH_H = 48;
const CHIPS_H = 36;
const LABEL_H = 18;
const CHROME_BLOCK_H = SEARCH_H + 12 + CHIPS_H + 10 + LABEL_H + 12; // 136
const STACK_H = CHROME_BLOCK_H + 5 * CARD_STRIDE - 8; // 698
const STACK_TOP = Math.round((1080 - STACK_H) / 2); // ≈ 191
const SEARCH_Y = STACK_TOP;
const CHIPS_Y  = SEARCH_Y + SEARCH_H + 12;
const LABEL_Y  = CHIPS_Y + CHIPS_H + 10;
const CARD1_TOP = LABEL_Y + LABEL_H + 12; // ≈ 329
// Panel slot (after flip — panel takes most of screen, slim sidebar gone)
const PANEL_X = 80;
const PANEL_Y = 60;
const PANEL_W = 1760;
const PANEL_H = 960;

// ─── Timing constants ───────────────────────────────────────────────────────
const FLIP_START = 95;
const FLIP_MID   = 112;
const FLIP_END   = 130;

const EXIT_START = 85;

// AriA Assistant banner phase: right after the flip settles, camera zooms onto
// the banner and pans left→right following the loading bar, then pulls back.
const BANNER_SHOW_FULL_UNTIL = 134;  // brief hold showing the full panel
const BANNER_ZOOM_IN_AT      = 136;  // camera starts zooming (14f zoom-in, slower & smoother)
const BANNER_ZOOM_IN_END     = 150;  // reached banner focus scale, pan begins
const BANNER_PAN_END         = 180;  // pan complete (30f gentle pan over banner)

// Continuous-follow choreography: camera keeps TYPING_SCALE and slowly pans
// between sections. Inter-section pans are deliberately long (34f each).
const DESC_TYPE_START = 170;   // starts during the banner pan — typing already in progress when the camera arrives
const DESC_CAM_FRAME  = 192;   // camera framing on DESC settles here (after banner pan ends at 180)
const DESC_TYPE_END   = 204;
const RC_TYPE_START   = 238;   // RC_TYPE_END kept at 340 → window grows to 102f (slower pan + slower typing)
const RC_TYPE_END     = 340;
const RP_TYPE_START   = 374;
const RP_TYPE_END     = 410;

const PRED_INSIGHT_START = 416;
const PRED_ZOOM_IN_START = 428;  // starts earlier
const PRED_ZOOM_IN_END   = 460;  // longer zoom-in (32f, was 20f) — slow & smooth
const PRED_ZOOM_HOLD_END = 486;  // hold with a subtle drift (not static)
const DIAG_READY_FRAME   = 452;

// What-If Analysis phase: detail panel dims, modal appears, 3 scenario cards
// slide up from bottom one at a time.
const WHAT_IF_START       = 486;  // backdrop begins to dim the panel
const PANEL_PULLBACK_END  = 500;  // camera fully back to neutral by here
const WHAT_IF_CARD_A_AT   = 498;
const WHAT_IF_CARD_B_AT   = 514;
const WHAT_IF_CARD_C_AT   = 530;
// After the 3 cards are settled, a white container materializes around them
// with a title at the top and an AriA recommendation bar at the bottom.
const CONTAINER_WRAP_AT   = 550;
const CARD_C_HIGHLIGHT_AT = 568;
const ARIA_RECO_AT        = 576;
// Non-recommended options (A and B) fade to grey/hidden-looking state right
// after card C's highlight begins — so the de-emphasis feels like a direct
// consequence of the selection, not a separate moment.
const CARD_AB_HIDE_AT     = 572;   // 4f after CARD_C_HIGHLIGHT_AT (568)

const SCENE_END = 644;           // extended to read the finalized card+recommendation

// ─── Alarm cards data ────────────────────────────────────────────────────────
type Alarm = {
  code: string;
  title: string;
  tag: string;
  sev: "critical" | "warning" | "info";
  sevLabel: string;
};
const ALARMS: Alarm[] = [
  { code: "A25245-E2PK", title: "OVEN_1 Outfeed Peg Chain Motor T60M2 Torque Safety Limit Exceeded", tag: "Torque",      sev: "critical", sevLabel: "Critical" },
  { code: "A25247-E3PS", title: "Conveyor CB-L2 speed anomaly detected on sector 3",                    tag: "Speed",       sev: "warning",  sevLabel: "High" },
  { code: "A25244-E1PA", title: "Press PRS-05 vibration peak at 4200 RPM exceeds baseline",             tag: "Vibration",   sev: "warning",  sevLabel: "High" },
  { code: "A25243-E2PB", title: "Hydraulic Pump PUMP-AX-03 pressure drop below operational threshold",  tag: "Pressure",    sev: "info",     sevLabel: "Medium" },
  { code: "A25242-E1PA", title: "Heater HEAT-07 temperature exceeds setpoint by +8°C sustained",         tag: "Temperature", sev: "info",     sevLabel: "Medium" },
];

const DESC_TEXT =
  "Motor T60M2 torque has exceeded the 95% safety threshold during peak production cycle. Sustained readings of 847 N·m (limit: 810 N·m) over the last 12 minutes.";
const RC_TEXT =
  "Mechanical resistance in the peg chain assembly, likely due to lubrication degradation and accumulated debris. Tensioner bracket alignment may also be compromised.";
const RP_TEXT =
  "1. Stop peg chain motor. 2. Inspect and clean chain links. 3. Apply synthetic lubricant GR-4. 4. Verify tensioner alignment. 5. Test under nominal load before full restart.";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const typed = (full: string, frame: number, start: number, charsPerFrame = 2.6) => {
  const n = Math.max(0, Math.floor((frame - start) * charsPerFrame));
  return full.slice(0, Math.min(full.length, n));
};
const kf = (frame: number, points: { f: number; v: number }[]) =>
  interpolate(frame, points.map((p) => p.f), points.map((p) => p.v), { ...CLAMP, easing: EASE });

// ─── Icons ───────────────────────────────────────────────────────────────────
const SearchIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={LABEL} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
  </svg>
);
const CheckIcon: React.FC<{ progress: number; size?: number; color?: string }> = ({ progress, size = 18, color = "#FFFFFF" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12l5 5L20 7" strokeDasharray={22} strokeDashoffset={22 * (1 - progress)} />
  </svg>
);
const SpinnerIcon: React.FC<{ frame: number; size?: number; color?: string }> = ({ frame, size = 18, color = "#FFFFFF" }) => {
  const rot = (frame * 9) % 360;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ transform: `rotate(${rot}deg)` }}>
      <circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeOpacity={0.3} strokeWidth={2.5} />
      <path d="M12 3 A9 9 0 0 1 21 12" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
};

// ─── Alarm card — full-width cinema style ────────────────────────────────────
const AlarmCardBody: React.FC<{ alarm: Alarm; active: boolean; frame?: number }> = ({ alarm, active, frame = 0 }) => {
  const sevColor  = alarm.sev === "critical" ? ARIA_COLORS.critical : alarm.sev === "warning" ? ARIA_COLORS.warning : "#6B7280";
  const sevBg     = alarm.sev === "critical" ? "rgba(229,57,53,0.08)"  : alarm.sev === "warning" ? "rgba(232,131,10,0.08)"  : "rgba(107,114,128,0.06)";
  const sevBorder = alarm.sev === "critical" ? "rgba(229,57,53,0.22)"  : alarm.sev === "warning" ? "rgba(232,131,10,0.22)"  : "rgba(214,217,227,0.55)";
  const pulse = active ? 0.62 + 0.38 * Math.sin(frame * 0.13) : 0;

  return (
    <div style={{
      width: "100%", height: "100%",
      background: PANEL_BG,
      border: `1px solid ${active ? `rgba(59,91,219,${0.25 + pulse * 0.45})` : "rgba(214,217,227,0.55)"}`,
      borderLeft: `4px solid ${sevColor}`,
      borderRadius: 18,
      padding: "0 40px",
      boxSizing: "border-box",
      boxShadow: active
        ? `0 0 0 1px rgba(59,91,219,${pulse * 0.12}), 0 8px 32px rgba(59,91,219,${pulse * 0.09}), ${CARD_SHADOW}`
        : CARD_SHADOW,
      display: "flex", alignItems: "center", gap: 24,
      overflow: "hidden", position: "relative",
    }}>
      {/* Severity dot */}
      <div style={{
        width: 10, height: 10, borderRadius: "50%",
        backgroundColor: sevColor, flexShrink: 0,
        boxShadow: alarm.sev === "critical" ? `0 0 ${6 + pulse * 14}px ${sevColor}` : "none",
      }} />

      {/* Code + Title */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
        <span style={{ fontFamily: geistFont, fontSize: 11.5, color: LABEL, letterSpacing: "0.07em", fontWeight: 500 }}>
          {alarm.code}
        </span>
        <span style={{
          fontFamily: geistFont, fontSize: 26, fontWeight: 600,
          color: INK, letterSpacing: "-0.025em", lineHeight: 1.1,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {alarm.title}
        </span>
      </div>

      {/* Right: tag + severity + status */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <span style={{
          fontFamily: geistFont, fontSize: 12, fontWeight: 500,
          padding: "5px 13px", borderRadius: 999,
          background: "#ECEDF2", color: MUTED,
        }}>{alarm.tag}</span>
        <span style={{
          fontFamily: geistFont, fontSize: 12, fontWeight: 600,
          padding: "5px 13px", borderRadius: 999,
          color: sevColor, background: sevBg,
          border: `1px solid ${sevBorder}`,
        }}>{alarm.sevLabel}</span>
        <span style={{
          fontFamily: geistFont, fontSize: 12, fontWeight: 500,
          padding: "5px 13px", borderRadius: 999,
          background: "#ECEDF2", color: MUTED,
        }}>Draft</span>
      </div>
    </div>
  );
};

// ─── Section block (Description / Root Cause / Resolution Plan) ─────────────
const Section: React.FC<{
  idx: number; label: string; text: string; confidence: number; fullLen: number;
  filled: boolean; active: boolean; frame: number; appearAt: number;
  popOut?: number; // 0..1 — lifts the section forward with a drop-shadow so it "detaches" from the panel
}> = ({ idx, label, text, confidence, fullLen, filled, active, frame, appearAt, popOut = 0 }) => {
  const sp = spring({ frame: frame - appearAt, fps: 30, config: { stiffness: 220, damping: 22, mass: 0.7 } });
  const op = interpolate(sp, [0, 1], [0, 1], CLAMP);
  const ty = interpolate(sp, [0, 1], [12, 0], CLAMP);
  const confOp = filled ? interpolate(frame, [appearAt + 4, appearAt + 18], [0, 1], CLAMP) : 0;
  const caretShown = active && text.length < fullLen;

  // Pop-out transform: the section grows noticeably AND lifts forward — at
  // peak (popOut=1) it scales to 1.08, overflowing the panel padding so the
  // textfield literally "exits" the dashboard. A strong drop-shadow reinforces
  // the "card detached and floating above the panel" look.
  const liftTy    = -popOut * 10;
  const liftScale = 1 + popOut * 0.02; // tiny — real "zoom" feel comes from the camera + shadow, not by growing past the panel width
  const liftShadow = popOut > 0
    ? `drop-shadow(0 ${popOut * 20}px ${popOut * 40}px rgba(30,50,120,${popOut * 0.24})) drop-shadow(0 ${popOut * 6}px ${popOut * 14}px rgba(0,0,0,${popOut * 0.12}))`
    : "none";

  return (
    <div style={{
      opacity: op,
      transform: `translateY(${ty + liftTy}px) scale(${liftScale})`,
      transformOrigin: "center center",
      marginBottom: 18,
      filter: liftShadow,
      position: "relative",
      zIndex: popOut > 0 ? 5 : undefined,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: filled ? "#E8F0FE" : "#EEF0F4",
            border: `1px solid ${filled ? "rgba(59,91,219,0.3)" : "rgba(214,217,227,0.9)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontFamily: geistFont, fontWeight: 600,
            color: filled ? APPLE_ACCENT : LABEL,
          }}>{idx}</div>
          <div style={{ fontSize: 12, letterSpacing: "0.08em", fontFamily: geistFont, fontWeight: 600, color: MUTED, textTransform: "uppercase" }}>
            {label}
          </div>
        </div>
        {filled && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: confOp }}>
            <span style={{ fontSize: 11, fontFamily: geistFont, fontWeight: 600, color: ARIA_COLORS.success }}>{confidence}%</span>
            <div style={{
              width: 18, height: 18, borderRadius: 9, background: ARIA_COLORS.success,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <CheckIcon progress={1} size={12} color="#FFFFFF" />
            </div>
          </div>
        )}
      </div>
      <div style={{
        border: `1.5px solid ${active ? "rgba(59,91,219,0.4)" : FIELD_BORDER}`,
        background: FIELD_BG,
        borderRadius: 10,
        padding: "12px 14px",
        minHeight: 48,
        boxShadow: active ? "0 0 0 3px rgba(59,91,219,0.08)" : "none",
      }}>
        <div style={{ fontSize: 14, color: INK, fontFamily: geistFont, lineHeight: 1.55, letterSpacing: "-0.005em" }}>
          {text}
          {caretShown && (
            <span style={{
              display: "inline-block", width: 2, height: 16, background: APPLE_ACCENT,
              marginLeft: 2, verticalAlign: "middle",
              opacity: Math.floor(frame / 6) % 2 === 0 ? 1 : 0,
            }} />
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Predictive Insight card (slides in bottom-right, then pops to center) ──
const PredictiveInsight: React.FC<{ frame: number }> = ({ frame }) => {
  const sp = spring({ frame: frame - PRED_INSIGHT_START, fps: 30, config: { stiffness: 180, damping: 24, mass: 0.8 } });
  const entryOp = interpolate(sp, [0, 1], [0, 1], CLAMP);
  const entryTx = interpolate(sp, [0, 1], [60, 0], CLAMP);
  const entryScale = interpolate(sp, [0, 1], [0.92, 1], CLAMP);

  // Pop-forward during the camera zoom: card flies to panel center, grows
  // significantly, and casts a strong red-tinted shadow.
  const popOut = interpolate(frame, [PRED_ZOOM_IN_START, PRED_ZOOM_IN_END], [0, 1], { ...CLAMP, easing: EASE });
  const liftScale = 1 + popOut * 0.35;                  // up to 1.35×
  // Move card center from its bottom-right anchor (canvas 1606,880) to the
  // panel center (canvas 960, 540). Deltas: −646, −340.
  const popTx = -popOut * 646;
  const popTy = -popOut * 340;
  const popShadow = popOut > 0
    ? `drop-shadow(0 ${popOut * 32}px ${popOut * 60}px rgba(220,38,38,${popOut * 0.28})) drop-shadow(0 ${popOut * 12}px ${popOut * 22}px rgba(0,0,0,${popOut * 0.16}))`
    : "none";

  // Animated chart line: strokeDasharray draws it smoothly over the zoom-in
  // window, a leading dot travels along the line, and the critical endpoint
  // pulses once the line has fully landed on the failure threshold.
  const lineProg = interpolate(frame, [PRED_ZOOM_IN_START + 4, PRED_ZOOM_IN_END - 4], [0, 1], CLAMP);
  const pts: [number, number][] = [[10, 54], [50, 46], [96, 38], [150, 32], [190, 36], [222, 28], [252, 18]];
  const fullPath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const PATH_LEN = 280;  // a bit more than the estimated polyline length

  // Leading dot: lerp between the two points currently bracketing lineProg
  const segT = Math.max(0, Math.min(pts.length - 1, lineProg * (pts.length - 1)));
  const segIdx = Math.min(pts.length - 2, Math.floor(segT));
  const segFrac = segT - segIdx;
  const dotX = pts[segIdx][0] + (pts[segIdx + 1][0] - pts[segIdx][0]) * segFrac;
  const dotY = pts[segIdx][1] + (pts[segIdx + 1][1] - pts[segIdx][1]) * segFrac;

  const endOp = interpolate(lineProg, [0.92, 1], [0, 1], CLAMP);
  const endPulse = lineProg >= 1 ? 1 + 0.15 * Math.sin(frame / 3) : 1;

  return (
    <div style={{
      position: "absolute", right: 44, bottom: 40, width: 380, padding: 18,
      background: PANEL_BG, border: `1px solid ${PANEL_BORDER}`, borderRadius: 14,
      boxShadow: ARIA_SHADOWS.panel,
      opacity: entryOp,
      transform: `translate(${entryTx + popTx}px, ${popTy}px) scale(${entryScale * liftScale})`,
      transformOrigin: "center center",
      filter: popShadow,
      zIndex: popOut > 0 ? 10 : undefined,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6, background: "rgba(220,38,38,0.1)",
            border: "1px solid rgba(220,38,38,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={ARIA_COLORS.critical} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
          </div>
          <div style={{ fontSize: 11, letterSpacing: "0.09em", fontFamily: geistFont, fontWeight: 700, color: MUTED, textTransform: "uppercase" }}>
            Predictive Insight
          </div>
        </div>
        <div style={{ fontSize: 11, fontFamily: geistFont, fontWeight: 600, color: ARIA_COLORS.success }}>
          94% <span style={{ color: MUTED, fontWeight: 400 }}>conf.</span>
        </div>
      </div>
      <svg width="260" height="68" viewBox="0 0 260 68" style={{ marginBottom: 10 }}>
        {/* Failure threshold line */}
        <line x1="0" y1="44" x2="260" y2="44" stroke={ARIA_COLORS.critical} strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
        {/* Smoothly-drawn trend line */}
        <path
          d={fullPath}
          fill="none"
          stroke={APPLE_ACCENT}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={PATH_LEN}
          strokeDashoffset={PATH_LEN * (1 - lineProg)}
        />
        {/* Leading-edge dot (hides once line is complete) */}
        {lineProg > 0.02 && lineProg < 0.97 && (
          <>
            <circle cx={dotX} cy={dotY} r={6} fill={APPLE_ACCENT} opacity={0.35} />
            <circle cx={dotX} cy={dotY} r={3.2} fill={APPLE_ACCENT} />
          </>
        )}
        {/* Critical failure endpoint — pulses after the line completes */}
        {endOp > 0 && (
          <>
            <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={10 * endPulse} fill={ARIA_COLORS.critical} opacity={endOp * 0.25} />
            <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={5} fill={ARIA_COLORS.critical} opacity={endOp} />
          </>
        )}
      </svg>
      <div style={{ fontSize: 13, fontFamily: geistFont, color: INK, lineHeight: 1.4 }}>
        <span style={{ color: ARIA_COLORS.critical, fontWeight: 600 }}>Estimated failure in 48–72h.</span>{" "}
        Pattern match: 14 similar events in fleet history.
      </div>
      <div style={{ fontSize: 12, fontFamily: geistFont, color: MUTED, marginTop: 6 }}>
        → Act within 24h to avoid unplanned stop.
      </div>
    </div>
  );
};

// ─── Full Diagnostic button ──────────────────────────────────────────────────
const DiagnosticButton: React.FC<{ frame: number }> = ({ frame }) => {
  const ready = frame >= DIAG_READY_FRAME;
  const readyT = interpolate(frame, [DIAG_READY_FRAME, DIAG_READY_FRAME + 10], [0, 1], CLAMP);
  return (
    <div style={{
      width: "100%", height: 54, borderRadius: 12,
      background: ready ? APPLE_ACCENT : "linear-gradient(90deg, rgba(59,91,219,0.55), rgba(91,120,230,0.55))",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
      color: "#FFFFFF", fontFamily: geistFont, fontWeight: 600, fontSize: 15,
      letterSpacing: "-0.005em",
      boxShadow: ready ? "0 8px 24px -8px rgba(59,91,219,0.5)" : "none",
      position: "relative", overflow: "hidden",
    }}>
      {!ready && (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
          transform: `translateX(${((frame * 6) % 600) - 200}px)`,
        }} />
      )}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 6V4m12 2V4M2 12h20" />
      </svg>
      Full Diagnostic
      {ready && (
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
          padding: "3px 8px", borderRadius: 999,
          background: "rgba(255,255,255,0.22)", marginLeft: 6,
          opacity: readyT, transform: `scale(${interpolate(readyT, [0, 1], [0.6, 1], CLAMP)})`,
        }}>READY</span>
      )}
    </div>
  );
};

// ─── Detail Panel (the "back face" after flip) ──────────────────────────────
const DetailPanel: React.FC<{
  frame: number; confidence: number; ariaStatus: "Analyzing" | "Ready"; stepsDone: number;
  segmentFills: [number, number, number]; // per-segment loading bar fill (0..1)
  descText: string; rcText: string; rpText: string;
  descFilled: boolean; rcFilled: boolean; rpFilled: boolean;
  descActive: boolean; rcActive: boolean; rpActive: boolean;
  rcPop?: number; // 0..1 — Root Cause section detaches forward while typing
}> = (props) => {
  const { frame, confidence, ariaStatus, stepsDone, segmentFills, descText, rcText, rpText,
    descFilled, rcFilled, rpFilled, descActive, rcActive, rpActive, rcPop = 0 } = props;

  return (
    <div style={{
      width: "100%", height: "100%",
      background: PANEL_BG, border: `1px solid ${PANEL_BORDER}`, borderRadius: 16,
      padding: "24px 28px", boxShadow: ARIA_SHADOWS.card,
      boxSizing: "border-box", position: "relative", overflow: "visible",
    }}>
      {/* Ribbon */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, fontFamily: geistFont, color: LABEL }}>A25245-E2PK</span>
          <span style={{
            fontSize: 11, padding: "3px 9px", borderRadius: 999, fontFamily: geistFont, fontWeight: 600,
            background: ARIA_COLORS.criticalMuted, color: ARIA_COLORS.critical,
            border: `1px solid ${ARIA_COLORS.criticalBorder}`,
          }}>Critical</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["Draft", "Accepted", "Rejected"].map((t, i) => (
            <span key={t} style={{
              fontSize: 11, padding: "5px 11px", borderRadius: 8, fontFamily: geistFont, fontWeight: 500,
              background: i === 0 ? INK : "transparent",
              color: i === 0 ? "#FFFFFF" : MUTED,
            }}>{t}</span>
          ))}
        </div>
      </div>
      {/* Title */}
      <div style={{ marginTop: 8, fontSize: 22, fontFamily: geistFont, fontWeight: 700, color: INK, letterSpacing: "-0.01em", lineHeight: 1.25 }}>
        OVEN_1 Outfeed Peg Chain Motor T60M2 Torque Safety Limit Exceeded
      </div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 22, marginTop: 18, borderBottom: `1px solid ${PANEL_BORDER}`, paddingBottom: 10 }}>
        {["Details", "Resolution", "History"].map((t, i) => (
          <span key={t} style={{
            fontSize: 14, fontFamily: geistFont, fontWeight: i === 0 ? 600 : 500,
            color: i === 0 ? INK : MUTED,
            borderBottom: i === 0 ? `2px solid ${INK}` : "none",
            paddingBottom: 8, marginBottom: -11,
          }}>{t}</span>
        ))}
      </div>
      {/* AriA banner */}
      <div style={{
        marginTop: 16, background: "rgba(59,91,219,0.04)", border: `1px solid rgba(59,91,219,0.2)`,
        borderRadius: 12, padding: "14px 16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: ariaStatus === "Ready" ? ARIA_COLORS.success : APPLE_ACCENT,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px -4px rgba(59,91,219,0.5)",
            }}>
              {ariaStatus === "Ready"
                ? <CheckIcon progress={interpolate(frame, [DIAG_READY_FRAME, DIAG_READY_FRAME + 12], [0, 1], CLAMP)} size={18} />
                : <SpinnerIcon frame={frame} size={18} />}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 15, fontFamily: geistFont, fontWeight: 600, color: INK }}>AriA Assistant</span>
                <span style={{ fontSize: 11, fontFamily: geistFont, color: APPLE_ACCENT, fontWeight: 500 }}>v2.4</span>
              </div>
              <div style={{ fontSize: 12, fontFamily: geistFont, color: MUTED, marginTop: 2 }}>
                {ariaStatus} · Incident A25245-E2PK · {confidence}% confidence
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: geistFont, color: MUTED }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: ARIA_COLORS.critical, boxShadow: `0 0 0 4px ${ARIA_COLORS.criticalMuted}` }} />
            LIVE · {36 + Math.floor((frame % 40) / 10)}ms
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          {[0, 1, 2].map((i) => {
            const fill = Math.max(0, Math.min(1, segmentFills[i]));
            return (
              <div key={i} style={{
                flex: 1, height: 6, borderRadius: 999,
                background: "rgba(214,217,227,0.7)",
                position: "relative", overflow: "hidden",
              }}>
                {/* Animated fill */}
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0,
                  width: `${fill * 100}%`,
                  background: `linear-gradient(90deg, ${APPLE_ACCENT} 0%, #5B78E6 100%)`,
                  borderRadius: 999,
                }} />
                {/* Leading-edge glow while in progress */}
                {fill > 0 && fill < 1 && (
                  <div style={{
                    position: "absolute", top: 0, bottom: 0,
                    left: `calc(${fill * 100}% - 14px)`, width: 14,
                    background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 100%)",
                    opacity: 0.5 + 0.5 * Math.abs(Math.sin(frame / 3)),
                  }} />
                )}
              </div>
            );
          })}
          <span style={{ fontSize: 11, fontFamily: geistFont, color: MUTED, marginLeft: 6, minWidth: 28 }}>{stepsDone}/3</span>
        </div>
      </div>

      {/* Sections */}
      <div style={{ marginTop: 18 }}>
        <Section idx={1} label="Description"     text={descText} confidence={98} fullLen={DESC_TEXT.length} filled={descFilled} active={descActive} frame={frame} appearAt={FLIP_END + 2} />
        <Section idx={2} label="Root Cause"      text={rcText}   confidence={95} fullLen={RC_TEXT.length}   filled={rcFilled}   active={rcActive}   frame={frame} appearAt={RC_TYPE_START - 6} popOut={rcPop} />
        <Section idx={3} label="Resolution Plan" text={rpText}   confidence={92} fullLen={RP_TEXT.length}   filled={rpFilled}   active={rpActive}   frame={frame} appearAt={RP_TYPE_START - 6} />
      </div>

      {/* Full Diagnostic (inside panel, bottom-left area) */}
      <div style={{ position: "absolute", left: 28, right: 440, bottom: 36 }}>
        <DiagnosticButton frame={frame} />
      </div>
      {/* Predictive Insight lives inside the panel, bottom-right */}
      {frame >= PRED_INSIGHT_START && <PredictiveInsight frame={frame} />}
    </div>
  );
};

// ─── What-If Analysis modal ─────────────────────────────────────────────────
type RiskLevel = "LOW" | "MED" | "HIGH";
const RISK_STYLE: Record<RiskLevel, { color: string; fill: number }> = {
  LOW:  { color: ARIA_COLORS.success,  fill: 0.32 },
  MED:  { color: ARIA_COLORS.warning,  fill: 0.62 },
  HIGH: { color: ARIA_COLORS.critical, fill: 1.0  },
};

const ClockIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
  </svg>
);
const EuroIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6a7 7 0 1 0 0 12" /><path d="M4 10h11M4 14h10" />
  </svg>
);
const RiskIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.2v.01" />
  </svg>
);
const TargetIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = APPLE_ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.6" fill={color} />
  </svg>
);
const CloseIconSmall: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth={1.8} strokeLinecap="round">
    <path d="M6 6l12 12M18 6l-12 12" />
  </svg>
);
const SparkleIconW: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = "#FFFFFF" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6 2.1-2.1" />
  </svg>
);
const CheckMark: React.FC<{ size?: number; color?: string }> = ({ size = 11, color = "#FFFFFF" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12l5 5L20 7" />
  </svg>
);

const Metric: React.FC<{
  icon: React.ReactNode; label: string; value: string;
  valueColor?: string; upper?: boolean; minW?: number;
}> = ({ icon, label, value, valueColor, upper, minW = 150 }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, minWidth: minW }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {icon}
      <span style={{
        fontSize: 11, color: MUTED, fontFamily: geistFont,
        textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500,
      }}>{label}</span>
    </div>
    <div style={{
      fontSize: 24, fontFamily: geistFont, fontWeight: 700,
      color: valueColor || INK,
      letterSpacing: upper ? "0.08em" : "-0.01em",
    }}>
      {value}
    </div>
  </div>
);

// Horizontal card. The `width` defaults to a fixed size for the pre-container
// phase (cards float on the dimmed backdrop); switch to "100%" once wrapped
// in the white container.
const WhatIfCard: React.FC<{
  letter: string; title: string; subtitle: string;
  downtime: string; cost: string; risk: RiskLevel;
  anim: { op: number; ty: number };
  width?: number | string;
  highlight?: number;   // 0..1 — recommended-state fade/scale
  hide?: number;        // 0..1 — card fades AND collapses its slot
  lift?: number;        // 0..1 — card scales forward (spotlight zoom-in)
}> = ({ letter, title, subtitle, downtime, cost, risk, anim, width = 1420, highlight = 0, hide = 0, lift = 0 }) => {
  const rs = RISK_STYLE[risk];
  // Smoothly blend letter circle bg/fg between neutral and highlighted
  const mix = (a: number, b: number) => Math.round(a + (b - a) * highlight);
  const letterBg = `rgb(${mix(243, 59)}, ${mix(244, 91)}, ${mix(247, 219)})`;
  const letterFg = `rgb(${mix(118, 255)}, ${mix(126, 255)}, ${mix(140, 255)})`;
  const outlineW = highlight > 0 ? 2 + highlight * 1.5 : 0;
  const boxShadow = [
    highlight > 0 ? `0 0 0 ${outlineW}px rgba(59,91,219,${0.9 * highlight})` : null,
    `0 ${18 + lift * 22}px ${48 + lift * 40}px rgba(0,0,0,${0.14 + lift * 0.10})`,
    "0 2px 6px rgba(0,0,0,0.04)",
  ].filter(Boolean).join(", ");
  // Spotlight scale — applied to the card itself (not the camera) so the
  // background stays put and only Card C grows forward.
  const liftScale = 1 + lift * 0.08;
  const liftTy    = -lift * 6;

  // When the card is "hidden", we DON'T collapse it — instead we de-emphasize
  // it: opacity drops toward 0.5 and a grayscale filter desaturates it, so
  // only the recommended card stays vibrant.
  const dimOp   = 1 - 0.55 * hide;   // 1 → 0.45
  const greyFilter = hide > 0
    ? `grayscale(${hide}) brightness(${1 - 0.05 * hide})`
    : undefined;
  return (
    <div style={{
      width,
      padding: "22px 32px",
      background: "rgba(255,255,255,0.98)",
      border: `1px solid rgba(214,217,227,0.6)`,
      borderLeft: highlight > 0.5 ? `1px solid rgba(214,217,227,0.6)` : `5px solid ${rs.color}`,
      borderRadius: 18,
      boxShadow,
      display: "flex", alignItems: "center", gap: 30,
      opacity: anim.op * dimOp,
      transform: `translateY(${anim.ty + liftTy}px) scale(${liftScale})`,
      transformOrigin: "center center",
      position: "relative",
      zIndex: lift > 0 ? 5 : undefined,
      filter: greyFilter,
    }}>
      {/* RECOMMENDED badge (appears when highlighted) */}
      {highlight > 0 && (
        <div style={{
          position: "absolute", top: -14, right: 24,
          padding: "5px 11px", borderRadius: 8,
          background: ARIA_COLORS.success,
          color: "#FFFFFF", fontSize: 11.5, fontWeight: 700,
          letterSpacing: "0.09em", fontFamily: geistFont,
          opacity: highlight,
          transform: `scale(${interpolate(highlight, [0, 1], [0.8, 1], CLAMP)})`,
          display: "flex", alignItems: "center", gap: 5,
          boxShadow: "0 6px 18px rgba(22,168,112,0.35)",
          whiteSpace: "nowrap",
        }}>
          <CheckMark size={11} color="#FFFFFF" />
          RECOMMENDED
        </div>
      )}

      {/* Letter circle (color shifts toward blue when highlighted) */}
      <div style={{
        width: 42, height: 42, borderRadius: 999,
        background: letterBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 15, fontFamily: geistFont, fontWeight: 600, color: letterFg,
        flexShrink: 0,
      }}>{letter}</div>

      {/* Title + subtitle */}
      <div style={{ flex: "0 0 380px" }}>
        <div style={{ fontSize: 24, fontFamily: geistFont, fontWeight: 700, color: INK, letterSpacing: "-0.01em" }}>
          {title}
        </div>
        <div style={{ fontSize: 14, fontFamily: geistFont, color: MUTED, marginTop: 4 }}>
          {subtitle}
        </div>
      </div>

      {/* Metrics inline, pushed to the right */}
      <div style={{ display: "flex", alignItems: "center", gap: 48, flex: 1, justifyContent: "flex-end" }}>
        <Metric icon={<ClockIcon size={16} />} label="Downtime" value={downtime} />
        <Metric icon={<EuroIcon  size={16} />} label="Cost"     value={cost} />
        <Metric icon={<RiskIcon  size={16} />} label="Risk"     value={risk} valueColor={rs.color} upper minW={100} />
      </div>
    </div>
  );
};

const WhatIfModal: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Backdrop is FULLY OPAQUE BLACK from WHAT_IF_START onward. The interpolation
  // [WHAT_IF_START-1, WHAT_IF_START] means at scene-local 486 we already have
  // backdropOp = 1 (black covers the dashboard). The dashboard interstitial's
  // freeze target is 485 (the frame BEFORE the modal mounts at all), so the
  // frozen graph is still visible cleanly with no black.
  const backdropOp = interpolate(frame, [WHAT_IF_START - 1, WHAT_IF_START], [0, 1], CLAMP);

  // Apple-style entrance: gentle spring, slide up from below, fade in.
  const mkCardAnim = (appearAt: number) => {
    const sp = spring({ frame: frame - appearAt, fps, config: { stiffness: 120, damping: 22, mass: 1 } });
    return {
      op: interpolate(sp, [0, 1], [0, 1], CLAMP),
      ty: interpolate(sp, [0, 1], [180, 0], CLAMP),
    };
  };

  // Container wrap (white box + header) fades in after the 3 cards settle
  const wrapSp = spring({ frame: frame - CONTAINER_WRAP_AT, fps, config: { stiffness: 140, damping: 22, mass: 0.9 } });
  const containerOp    = interpolate(wrapSp, [0, 1], [0, 1], CLAMP);
  const containerScale = interpolate(wrapSp, [0, 1], [0.98, 1], CLAMP);
  const headerOp       = interpolate(frame, [CONTAINER_WRAP_AT + 4, CONTAINER_WRAP_AT + 18], [0, 1], CLAMP);

  // Card C highlight (recommended state)
  const cHighlight = interpolate(frame, [CARD_C_HIGHLIGHT_AT, CARD_C_HIGHLIGHT_AT + 14], [0, 1], CLAMP);
  // Card C spotlight zoom — begins just after the AriA reco lands (~00:40.0)
  // and holds through the end of the scene. The SCENE's camera stays static;
  // only Card C itself scales forward, so the background doesn't move.
  const cLift = interpolate(frame, [ARIA_RECO_AT + 14, ARIA_RECO_AT + 38], [0, 1], CLAMP);

  // AriA recommendation bar slides up from below the cards
  const recoSp = spring({ frame: frame - ARIA_RECO_AT, fps, config: { stiffness: 140, damping: 22, mass: 0.9 } });
  const recoOp = interpolate(recoSp, [0, 1], [0, 1], CLAMP);
  const recoTy = interpolate(recoSp, [0, 1], [30, 0], CLAMP);

  // Non-recommended options (A + B) collapse and fade out, leaving only card C
  const abHide = interpolate(frame, [CARD_AB_HIDE_AT, CARD_AB_HIDE_AT + 16], [0, 1], CLAMP);

  return (
    <AbsoluteFill>
      {/* Solid black backdrop — hides the dashboard completely behind the
          What-If modal, so the modal reads as if it were its own dedicated
          (black) scene rather than a dim overlay over the dashboard. */}
      <div style={{
        position: "absolute", inset: 0,
        background: "#000000",
        opacity: backdropOp,
      }} />

      {/* Container wrap — fades in AROUND the already-present cards */}
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        transform: `translate(-50%, -50%) scale(${containerScale})`,
        width: 1620,
        padding: "32px 40px 32px",
        background: `rgba(255, 255, 255, ${0.97 * containerOp})`,
        borderRadius: 24,
        boxShadow: containerOp > 0 ? `0 30px 100px rgba(0,0,0,${0.22 * containerOp})` : "none",
        display: "flex", flexDirection: "column", gap: 22,
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          opacity: headerOp,
        }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12,
            background: "rgba(59,91,219,0.10)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <TargetIcon size={22} color={APPLE_ACCENT} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontFamily: geistFont, fontWeight: 700, color: INK, letterSpacing: "-0.01em" }}>
              What-If Analysis
            </div>
            <div style={{ fontSize: 13, fontFamily: geistFont, color: MUTED, marginTop: 2 }}>
              Scenario impact comparison for A25245-E2PK
            </div>
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            border: `1px solid ${PANEL_BORDER}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <CloseIconSmall size={14} />
          </div>
        </div>

        {/* 3 cards, stacked vertically; spacers collapse when A/B hide */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <WhatIfCard letter="A" title="Stop immediately" subtitle="Halt motor now for full inspection"
                     downtime="2h 00m" cost="€ 3,200" risk="LOW"  width="100%"
                     anim={mkCardAnim(WHAT_IF_CARD_A_AT)} hide={abHide} />
          <div style={{ height: 18 }} />
          <WhatIfCard letter="B" title="Wait end of shift" subtitle="Continue until scheduled break"
                     downtime="4h 15m" cost="€ 8,100" risk="HIGH" width="100%"
                     anim={mkCardAnim(WHAT_IF_CARD_B_AT)} hide={abHide} />
          <div style={{ height: 18 }} />
          <WhatIfCard letter="C" title="Schedule in 24h" subtitle="Plan parts & team, minimal impact"
                     downtime="1h 00m" cost="€ 1,400" risk="MED"  width="100%"
                     anim={mkCardAnim(WHAT_IF_CARD_C_AT)} highlight={cHighlight} lift={cLift} />
        </div>

        {/* AriA recommendation bar */}
        <div style={{
          padding: "12px 16px",
          background: "rgba(59,91,219,0.06)",
          border: `1px solid rgba(59,91,219,0.2)`,
          borderRadius: 12,
          display: "flex", alignItems: "center", gap: 12,
          opacity: recoOp,
          transform: `translateY(${recoTy}px)`,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: APPLE_ACCENT,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <SparkleIconW size={14} />
          </div>
          <div style={{ fontSize: 14, fontFamily: geistFont, color: INK, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 700 }}>AriA's recommendation:</span>{" "}
            Scenario C — schedule maintenance within 24h to minimize cost and risk.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Main scene ──────────────────────────────────────────────────────────────
export const SceneAgentCMMS: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneOp = Math.min(
    interpolate(frame, [0, 14], [0, 1], CLAMP),
    interpolate(frame, [SCENE_END - 16, SCENE_END], [1, 0], CLAMP),
  );

  // ── Confidence progression (ties to typewriter milestones) ──
  const confidence = Math.round(interpolate(
    frame,
    [95, 135, DESC_TYPE_END, RC_TYPE_END, RP_TYPE_END],
    [0, 8, 31, 72, 94],
    CLAMP,
  ));
  const ariaStatus: "Analyzing" | "Ready" = frame >= DIAG_READY_FRAME ? "Ready" : "Analyzing";
  const stepsDone = frame >= RP_TYPE_END ? 3 : frame >= RC_TYPE_END ? 2 : frame >= DESC_TYPE_END ? 1 : 0;

  // Progress-bar segment fills — smooth left-to-right. Segment 1 starts filling at
  // BANNER_ZOOM_IN_AT so the camera has something to follow while panning L→R.
  const seg1 = interpolate(frame, [BANNER_ZOOM_IN_AT, DESC_TYPE_END], [0, 1], CLAMP);
  const seg2 = interpolate(frame, [DESC_TYPE_END + 4, RC_TYPE_END], [0, 1], CLAMP);
  const seg3 = interpolate(frame, [RC_TYPE_END + 4, RP_TYPE_END], [0, 1], CLAMP);
  const segmentFills: [number, number, number] = [seg1, seg2, seg3];

  // Root Cause pop-out: the RC section lifts forward a few frames before typing
  // starts, stays lifted while the agent types, then sinks back after typing.
  // Rise: 28f (very smooth zoom-in), fall: 16f.
  const rcPopIn  = interpolate(frame, [RC_TYPE_START - 18, RC_TYPE_START + 18], [0, 1], { ...CLAMP, easing: EASE });
  // Start the release BEFORE typing ends (-14) and stretch it over ~32 f so
  // the camera "un-zooms" as a slow exhale, not a snap, as the last words land.
  const rcPopOut = interpolate(frame, [RC_TYPE_END - 14,   RC_TYPE_END + 18],   [0, 1], { ...CLAMP, easing: EASE });
  const rcPop = Math.max(0, rcPopIn - rcPopOut);

  // During the RC pop-out the camera stays essentially FIXED on the textfield —
  // with the zoom boost tuned small (see rcPop * 0.05 below) the entire RC
  // field fits in frame, so we DO NOT need a horizontal pan override. We keep
  // rcFollowTx at 0 so the transform override adds no extra translation on top
  // of the base camTx — the base keyframes already provide a gentle ±20 drift.
  // (This removes the abrupt translate jump that happened when rcPop ramped.)
  const rcFollowTx = 0;

  // ── Camera focal points (absolute canvas coordinates) ──
  // Section field centers after flip. Panel sits at (80,60,1760,960); padding 24 top.
  const DESC_X = 960;   // panel is full-width; fields are horizontally centered
  const DESC_Y = 430;
  const RC_X   = 960;
  const RC_Y   = 560;
  const RP_X   = 960;
  const RP_Y   = 690;
  // (Predictive card anchors to the panel's bottom-right but translates to
  //  panel center during its pop-out — see PredictiveInsight component.)

  // AriA Assistant banner: loading bar center y ≈ 272.
  // Camera points at the LEFT portion of the banner (where the loading is
  // happening) with a small right-pan during the phase. Focal points chosen
  // so the title "OVEN_1 Outfeed Peg..." is clearly framed (NOT cut off at left).
  const BANNER_CY = 272;
  const BANNER_FOCUS_L_X = 520;   // early: title + beginning of the bar framed
  const BANNER_FOCUS_R_X = 820;   // end of banner phase: slight right nudge

  // VERY gentle zoom during typing — at 1.10 visible area is 1745×982 so the
  // whole 1760×960 panel is essentially always on screen.
  const TYPING_SCALE    = 1.10;
  // Banner zoom lowered 1.40 → 1.22: visible 1574×885, panel 89% visible,
  // so the banner title fits comfortably with good left/right context.
  const BANNER_SCALE    = 1.22;
  const PRED_ZOOM_SCALE = 1.65;

  // Helper: given a target canvas point (px, py) and scale S, compute tx/ty that
  // centers it at screen (960,540). Since transform order is scale() then translate(),
  // and translate is in pre-scale coords: tx = 960 - px, ty = 540 - py.
  const focus = (px: number, py: number) => ({ tx: 960 - px, ty: 540 - py });

  const fDesc = focus(DESC_X, DESC_Y);
  const fRC   = focus(RC_X,   RC_Y);
  const fRP   = focus(RP_X,   RP_Y);
  // fPred would focus on (PRED_CX, PRED_CY) — unused now that the card
  // translates to the panel center during the pop-out.
  const fBannerL = focus(BANNER_FOCUS_L_X, BANNER_CY);  // tracks leading edge at 9% fill
  const fBannerR = focus(BANNER_FOCUS_R_X, BANNER_CY);  // tracks leading edge at 42% fill

  // Continuous FOLLOW: after the banner pan, the camera settles at TYPING_SCALE
  // (1.22) and STAYS there through every section. Transitions between sections
  // are slow vertical pans — no zoom-in/pull-back cycles. During each typing
  // window the camera drifts slightly to feel like it is tracking the caret.
  const camScale = kf(frame, [
    { f: 0,   v: 0.78 },
    { f: 2,   v: 0.78 },
    { f: 80,  v: 1.12 },
    { f: 95,  v: 1.12 },
    { f: FLIP_END, v: 1.0 },
    { f: BANNER_SHOW_FULL_UNTIL, v: 1.0 },
    // Banner: ease in to the banner focus, hold during pan, THEN one smooth
    // arc (scale + pan together) from banner → description typing pose.
    { f: BANNER_ZOOM_IN_AT,  v: 1.0 },
    { f: BANNER_ZOOM_IN_END, v: BANNER_SCALE },
    { f: BANNER_PAN_END,     v: BANNER_SCALE },
    // Camera completes its descent from BANNER_SCALE to TYPING_SCALE as it
    // arrives on the description (DESC_CAM_FRAME). Actual typing already
    // started at DESC_TYPE_START (= 170) which is off-camera during banner pan.
    { f: DESC_CAM_FRAME, v: TYPING_SCALE },
    { f: DESC_TYPE_END,  v: TYPING_SCALE },
    { f: RC_TYPE_START,   v: TYPING_SCALE },
    { f: RC_TYPE_END,     v: TYPING_SCALE },
    { f: RP_TYPE_START,   v: TYPING_SCALE },
    { f: RP_TYPE_END,     v: TYPING_SCALE },
    // Predictive Insight: slow 32f zoom-in + 26f hold
    { f: PRED_ZOOM_IN_START, v: TYPING_SCALE },
    { f: PRED_ZOOM_IN_END,   v: PRED_ZOOM_SCALE },
    { f: PRED_ZOOM_HOLD_END, v: PRED_ZOOM_SCALE },
    // Pullback to neutral so the What-If modal sits on a stable framing
    { f: PANEL_PULLBACK_END, v: 1.0 },
    { f: SCENE_END, v: 1.0 },
  ]);
  const camTx = kf(frame, [
    { f: 0,   v: 0 },
    { f: FLIP_END, v: 0 },
    { f: BANNER_SHOW_FULL_UNTIL, v: 0 },
    // Banner L→R pan
    { f: BANNER_ZOOM_IN_AT,  v: 0 },
    { f: BANNER_ZOOM_IN_END, v: fBannerL.tx },
    { f: BANNER_PAN_END,     v: fBannerR.tx },
    // Camera arrives on each section and HOLDS nearly still while typing —
    // a tiny ±4 px drift keeps it alive without distracting from the text.
    // Inter-section travel happens in the gap between TYPE_END and next TYPE_START.
    { f: DESC_CAM_FRAME,  v: -4 },
    { f: DESC_TYPE_END,   v: 4 },
    { f: RC_TYPE_START,   v: -4 },
    { f: RC_TYPE_END,     v: 4 },
    { f: RP_TYPE_START,   v: -4 },
    { f: RP_TYPE_END,     v: 4 },
    // Predictive pan right-down (keep tx drifting during the hold — never static)
    { f: PRED_ZOOM_IN_START, v: 20 },
    // The card slides to panel center during the zoom, so the camera targets
    // canvas (960, 540) — still a small tx drift during the hold for liveness.
    { f: PRED_ZOOM_IN_END,   v: -14 },
    { f: PRED_ZOOM_HOLD_END, v: 14 },
    { f: PANEL_PULLBACK_END, v: 0 },
    { f: SCENE_END, v: 0 },
  ]);
  // Vertical pan: the camera CONTINUOUSLY pans between sections. Subtle drift
  // within each typing window (~±10px) simulates follow on the caret.
  const camTy = kf(frame, [
    { f: 0,   v: 0 },
    { f: FLIP_END, v: 0 },
    { f: BANNER_SHOW_FULL_UNTIL, v: 0 },
    // Banner phase: framed on the bar
    { f: BANNER_ZOOM_IN_AT,  v: 0 },
    { f: BANNER_ZOOM_IN_END, v: fBannerL.ty },
    { f: BANNER_PAN_END,     v: fBannerR.ty },
    // Camera arrives centered on each section and HOLDS — only a tiny ±6 px
    // vertical drift to keep it alive. No chasing the caret here.
    { f: DESC_CAM_FRAME,  v: fDesc.ty - 6 },
    { f: DESC_TYPE_END,   v: fDesc.ty + 6 },
    // Smooth pan DESC → RC (vertical travel happens entirely in the gap)
    { f: RC_TYPE_START,   v: fRC.ty - 6 },
    { f: RC_TYPE_END,     v: fRC.ty + 6 },
    // Smooth pan RC → RP (vertical travel happens entirely in the gap)
    { f: RP_TYPE_START,   v: fRP.ty - 6 },
    { f: RP_TYPE_END,     v: fRP.ty + 6 },
    // Predictive pan right-down (keep ty drifting during the hold — never static)
    { f: PRED_ZOOM_IN_START, v: fRP.ty + 30 },
    // Camera on canvas center (where the card now sits), with gentle ty drift
    { f: PRED_ZOOM_IN_END,   v: -10 },
    { f: PRED_ZOOM_HOLD_END, v: 10 },
    { f: PANEL_PULLBACK_END, v: 0 },
    { f: SCENE_END, v: 0 },
  ]);

  // ── Flip wrapper morph: sidebar card slot → full panel slot ──
  const flipT = interpolate(frame, [FLIP_START, FLIP_END], [0, 1], { ...CLAMP, easing: EASE });
  const rotY  = interpolate(flipT, [0, 1], [0, 180], CLAMP);
  const wrapLeft   = interpolate(flipT, [0, 1], [CARD_X, PANEL_X], CLAMP);
  const wrapTop    = interpolate(flipT, [0, 1], [CARD1_TOP, PANEL_Y], CLAMP);
  const wrapWidth  = interpolate(flipT, [0, 1], [CARD_W, PANEL_W], CLAMP);
  const wrapHeight = interpolate(flipT, [0, 1], [CARD_H, PANEL_H], CLAMP);

  // Opacity crossfade at flip mid (rotY ≈ 90°, faces are edge-on anyway — this is belt+braces)
  const cardFaceOp  = interpolate(frame, [FLIP_MID - 4, FLIP_MID + 2], [1, 0], CLAMP);
  const panelFaceOp = interpolate(frame, [FLIP_MID - 2, FLIP_MID + 4], [0, 1], CLAMP);

  // ── Sidebar chrome + cards 2-5 ──
  // ── Typewriter text ──
  const descText = frame >= DESC_TYPE_START ? typed(DESC_TEXT, frame, DESC_TYPE_START, 2.8) : "";
  const rcText   = frame >= RC_TYPE_START   ? typed(RC_TEXT,   frame, RC_TYPE_START,   1.8) : "";
  const rpText   = frame >= RP_TYPE_START   ? typed(RP_TEXT,   frame, RP_TYPE_START,   3.0) : "";
  const descFilled = frame >= DESC_TYPE_END;
  const rcFilled   = frame >= RC_TYPE_END;
  const rpFilled   = frame >= RP_TYPE_END;
  const descActive = frame >= DESC_TYPE_START && !descFilled;
  const rcActive   = frame >= RC_TYPE_START   && !rcFilled;
  const rpActive   = frame >= RP_TYPE_START   && !rpFilled;

  // ── Global "stack rise": the whole column starts LOW and progressively
  //    moves up as each element appears one at a time. First element (search)
  //    lands near the bottom; as more elements join, the group slides up
  //    until the stack is vertically centered at y=STACK_TOP.
  const STAGGER_STEP = 8;
  const entryAt = (i: number) => 2 + i * STAGGER_STEP;
  const LAST_ENTRY_AT = entryAt(7); // 2 + 7*8 = 58
  const STACK_RISE_START_OFFSET = 560; // pixels the stack starts below its centered position
  const stackRise = interpolate(
    frame,
    [2, LAST_ENTRY_AT + 22],
    [STACK_RISE_START_OFFSET, 0],
    { ...CLAMP, easing: Easing.out(Easing.cubic) },
  );

  // Each element fades in at its own stagger moment with a small local bounce.
  const makeEntry = (i: number) => {
    const sp = spring({ frame: frame - entryAt(i), fps, config: { stiffness: 200, damping: 22, mass: 0.7 } });
    return {
      op: interpolate(sp, [0, 1], [0, 1], CLAMP),
      ty: interpolate(sp, [0, 1], [24, 0], CLAMP), // subtle local lift on each element
    };
  };
  const searchE = makeEntry(0);
  const chipsE  = makeEntry(1);
  const labelE  = makeEntry(2);
  const card1E  = makeEntry(3);

  // Chrome exit during flip phase
  const chromeExitT = interpolate(frame, [EXIT_START - 4, EXIT_START + 22], [0, 1], CLAMP);
  const chromeExitTy = interpolate(chromeExitT, [0, 1], [0, 60], { ...CLAMP, easing: EASE });
  const chromeExitOp = interpolate(chromeExitT, [0, 1], [1, 0], CLAMP);

  return (
    <AbsoluteFill style={{ background: PAGE_BG, opacity: sceneOp, overflow: "hidden" }}>
      {/* Ambient background blobs */}
      <div style={{
        position: "absolute", width: 900, height: 700, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,91,219,0.07) 0%, transparent 65%)",
        left: -220, top: -120, filter: "blur(90px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: 700, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,91,219,0.05) 0%, transparent 65%)",
        right: -100, bottom: -80, filter: "blur(90px)", pointerEvents: "none",
      }} />

      {/* CAMERA WRAPPER
          During the RC pop-out, aggressively zoom in on the Root Cause section
          and track the caret horizontally. The textfield visibly overflows the
          dashboard, and the camera follows the typing. */}
      <div style={{
        position: "absolute", inset: 0,
        transform: `scale(${camScale - rcPop * 0.04}) translate(${camTx + rcFollowTx}px, ${camTy - rcPop * 2}px)`,
        transformOrigin: "center center",
        willChange: "transform",
      }}>

        {/* ── SEARCH BAR ── */}
        <div style={{
          position: "absolute", left: CARD_X, top: SEARCH_Y, width: CARD_W, height: SEARCH_H,
          transform: `translateY(${stackRise + searchE.ty + chromeExitTy}px)`,
          opacity: searchE.op * chromeExitOp,
          display: "flex", alignItems: "center", gap: 10,
          background: "#FFFFFF", border: `1px solid ${PANEL_BORDER}`,
          borderRadius: 14, padding: "0 20px", boxSizing: "border-box",
          boxShadow: CARD_SHADOW,
        }}>
          <SearchIcon size={16} />
          <span style={{ fontSize: 14, color: LABEL, fontFamily: geistFont, letterSpacing: "-0.005em" }}>
            Search by code, asset…
          </span>
        </div>

        {/* ── FILTER CHIPS ── */}
        <div style={{
          position: "absolute", left: CARD_X, top: CHIPS_Y, width: CARD_W, height: CHIPS_H,
          transform: `translateY(${stackRise + chipsE.ty + chromeExitTy}px)`,
          opacity: chipsE.op * chromeExitOp,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          {[
            { l: "Category Torque", active: true },
            { l: "Over",            active: false },
            { l: "Priority",        active: false },
          ].map((c, i) => (
            <span key={i} style={{
              fontSize: 13, padding: "7px 16px", borderRadius: 999,
              fontFamily: geistFont, fontWeight: 500,
              background: c.active ? "rgba(59,91,219,0.08)" : "#FFFFFF",
              color: c.active ? APPLE_ACCENT : MUTED,
              border: `1px solid ${c.active ? "rgba(59,91,219,0.28)" : PANEL_BORDER}`,
            }}>{c.l}</span>
          ))}
        </div>

        {/* ── "5 ACTIVE" LABEL ── */}
        <div style={{
          position: "absolute", left: CARD_X, top: LABEL_Y, width: CARD_W, height: LABEL_H,
          transform: `translateY(${stackRise + labelE.ty + chromeExitTy}px)`,
          opacity: labelE.op * chromeExitOp,
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <span style={{
            fontSize: 12, letterSpacing: "0.14em", fontFamily: geistFont,
            color: LABEL, textTransform: "uppercase", fontWeight: 700,
          }}>5 Active</span>
          <div style={{ flex: 1, height: 1, background: "rgba(214,217,227,0.6)" }} />
          <span style={{ fontSize: 12, color: MUTED, fontFamily: geistFont }}>Torque · Priority</span>
        </div>

        {/* ── CARDS 2-5 — tilt-reveal entry, fade+slide exit ── */}
        {ALARMS.slice(1).map((alarm, i) => {
          const idx = i + 1;
          const finalTop = CARD1_TOP + idx * CARD_STRIDE;
          const sp = spring({ frame: frame - entryAt(3 + idx), fps, config: { stiffness: 180, damping: 22, mass: 0.85 } });
          const entryOp  = interpolate(sp, [0, 1], [0, 1], CLAMP);
          const entryTy  = interpolate(sp, [0, 1], [28, 0], CLAMP);
          const rotX     = interpolate(sp, [0, 1], [20, 0], CLAMP);
          const entryScl = interpolate(sp, [0, 1], [0.92, 1], CLAMP);

          const exitF  = EXIT_START + idx * 2;
          const exitT  = interpolate(frame, [exitF, exitF + 22], [0, 1], CLAMP);
          const exitTy = interpolate(exitT, [0, 1], [0, 56], { ...CLAMP, easing: EASE });
          const exitOp = interpolate(exitT, [0, 1], [1, 0], CLAMP);

          return (
            <div key={alarm.code} style={{
              position: "absolute",
              left: CARD_X, top: finalTop,
              width: CARD_W, height: CARD_H,
              transform: `translateY(${stackRise + entryTy + exitTy}px)`,
              opacity: entryOp * exitOp,
              perspective: 1100,
            }}>
              <div style={{
                width: "100%", height: "100%",
                transform: `rotateX(${rotX * (1 - exitT)}deg) scale(${entryScl})`,
                transformOrigin: "50% 0%",
              }}>
                <AlarmCardBody alarm={alarm} active={false} frame={frame} />
              </div>
            </div>
          );
        })}

        {/* ── FLIP WRAPPER: card 1 → detail panel ── */}
        {/* Tilt-reveal on card 1 entry, resets before the flip starts */}
        {(() => {
          const card1RotX = interpolate(card1E.op, [0, 1], [20, 0], CLAMP) * (1 - flipT);
          return (
        <div style={{
          position: "absolute",
          left: wrapLeft, top: wrapTop, width: wrapWidth, height: wrapHeight,
          transformStyle: "preserve-3d",
          perspective: 2800,
          opacity: card1E.op,
          transform: `translateY(${(stackRise + card1E.ty) * (1 - flipT)}px) rotateX(${card1RotX}deg)`,
        }}>
          <div style={{
            position: "absolute", inset: 0,
            transformStyle: "preserve-3d",
            transform: `rotateY(${rotY}deg)`,
          }}>
            {/* Card face */}
            <div style={{
              position: "absolute", inset: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              opacity: cardFaceOp,
            }}>
              <AlarmCardBody alarm={ALARMS[0]} active={true} frame={frame} />
            </div>
            {/* Panel face */}
            <div style={{
              position: "absolute", inset: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              opacity: panelFaceOp,
            }}>
              {frame >= FLIP_MID - 4 && (
                <DetailPanel
                  frame={frame}
                  confidence={confidence}
                  ariaStatus={ariaStatus}
                  stepsDone={stepsDone}
                  segmentFills={segmentFills}
                  descText={descText} rcText={rcText} rpText={rpText}
                  descFilled={descFilled} rcFilled={rcFilled} rpFilled={rpFilled}
                  descActive={descActive} rcActive={rcActive} rpActive={rpActive}
                  rcPop={rcPop}
                />
              )}
            </div>
          </div>
        </div>
          );
        })()}

      </div>

      {/* What-If modal: outside the camera wrapper so it is NOT scaled by the camera */}
      {frame >= WHAT_IF_START && <WhatIfModal frame={frame} fps={fps} />}
    </AbsoluteFill>
  );
};
