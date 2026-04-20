import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { geistFont, ARIA_COLORS } from "../constants";

// ─────────────────────────────────────────────────────────────────────────────
// SceneWorkOrderExec — Work Order detail page with sequential step check-offs.
// Fidelity reference: Marco Rossi's view of WO-2848 "OVEN_1 Peg Chain Motor…"
// Animation: page fades in → info grid reveals → operational steps reveal →
// parts/tools/safety reveal → steps get ticked off one by one with a green
// "just-completed" row highlight that travels down the list.
// ─────────────────────────────────────────────────────────────────────────────

const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const EASE = Easing.inOut(Easing.sin);

const INK = ARIA_COLORS.foreground;
const MUTED = ARIA_COLORS.mutedFg;
const LABEL_FG = ARIA_COLORS.labelFg;
const PAGE_BG = "#F3F4F7";
const PANEL_BG = "#FFFFFF";
const PANEL_BORDER = "rgba(214,217,227,0.7)";
const APPLE_ACCENT = "#3B5BDB";
const SUCCESS = ARIA_COLORS.success;
const SUCCESS_SOFT_BG = "#E8F6F1";
const SUCCESS_BORDER  = "#A7DFC8";
const CRITICAL = ARIA_COLORS.critical;
const CRITICAL_SOFT = ARIA_COLORS.criticalMuted;
const WARNING = ARIA_COLORS.warning;
const WARNING_SOFT = ARIA_COLORS.warningMuted;
const WARNING_BORDER = ARIA_COLORS.warningBorder;

// ─── Timing (frames @ 30fps) ───────────────────────────────────────────────
// Fast + dynamic: compact intro, rapid ticks, scene ends right after the
// Operational Steps panel sinks back into place. Total: ~240f ≈ 8s.
const BG_FADE_IN_END = 8;
const CONTENT_DELAY  = 10;
const FADE_IN_END    = CONTENT_DELAY + 12;    // 22
const HEADER_AT      = CONTENT_DELAY + 2;     // 12
const INFO_AT        = CONTENT_DELAY + 12;    // 22
const DESC_AT        = CONTENT_DELAY + 28;    // 38
const STEPS_REVEAL   = CONTENT_DELAY + 40;    // 50
const BOTTOM_AT      = CONTENT_DELAY + 62;    // 72
const FIRST_TICK     = CONTENT_DELAY + 82;    // 92
const TICK_STRIDE    = 9;                     // even snappier
// Last tick fully drawn at FIRST_TICK + 7*9 + 10 = 165
// stepsPopOut ends at LAST_TICK + 40 = 197 (see scene body)
const SCENE_END      = 230;

// ─── Data ────────────────────────────────────────────────────────────────────
const STEPS = [
  "Stop and lock out OVEN_1 peg chain motor (LOTO procedure, padlock #A-127)",
  "Verify torque readings on controller T60M2 — expected < 810 N·m",
  "Remove protective guard and inspect chain links for wear, debris, misalignment",
  "Clean chain assembly with degreaser, dry thoroughly with compressed air",
  "Apply synthetic lubricant GR-4 to all chain links (120g total, even distribution)",
  "Verify tensioner bracket alignment with laser (tolerance ±0.5mm)",
  "Reinstall guard, restore power, perform nominal-load test run",
  "Log results in maintenance diary, attach photos, close work order",
];

const PARTS: { sku: string; name: string; status: "OK" | "Low"; qty: string }[] = [
  { sku: "SP-GR4-120",       name: "Synthetic lubricant GR-4",      status: "OK",  qty: "×1" },
  { sku: "SP-CHAINLINK-T60", name: "Chain link replacement kit T60", status: "OK",  qty: "×2" },
  { sku: "SP-FILTER-OIL-07", name: "Oil filter cartridge",           status: "Low", qty: "×1" },
];

const TOOLS = [
  "Torque wrench 5–200 N·m (Torx T40 bit)",
  "Alignment laser — Fluke 830",
  "Grease gun with GR-4 cartridge adapter",
  "Feeler gauge set 0.05 – 1.0 mm",
  "Digital multimeter — Fluke 87V",
];

const PPE = [
  "Heat-resistant gloves (oven surface 80°C)",
  "Safety glasses",
  "Lockout / Tagout padlock",
  "Wait 15 min cooldown after motor stop",
];

// ─── Small icon primitives ───────────────────────────────────────────────────
const IconBase: React.FC<{ size?: number; color?: string; children: React.ReactNode }> = ({
  size = 14, color = MUTED, children,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const PinIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <IconBase size={size} color={APPLE_ACCENT}>
    <path d="M12 21s-7-7.5-7-12a7 7 0 0 1 14 0c0 4.5-7 12-7 12z" />
    <circle cx="12" cy="9" r="2.4" />
  </IconBase>
);
const ClockIcon: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = APPLE_ACCENT }) => (
  <IconBase size={size} color={color}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </IconBase>
);
const EuroIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <IconBase size={size} color={SUCCESS}>
    <path d="M17 5.5A6 6 0 0 0 7.5 9m-.5 3h8m-8 3h8M17 18.5A6 6 0 0 1 7.5 15" />
  </IconBase>
);
const GearIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <IconBase size={size} color={APPLE_ACCENT}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </IconBase>
);
const ToolIcon: React.FC<{ size?: number }> = ({ size = 12 }) => (
  <IconBase size={size} color={MUTED}>
    <path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 1 5.4-5.4l-1.3 1.3a2 2 0 1 0 2.8 2.8l1.3-1.3a4 4 0 0 1-5.8-5.8l-.0 1z" />
  </IconBase>
);
const ShieldIcon: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = WARNING }) => (
  <IconBase size={size} color={color}>
    <path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" />
  </IconBase>
);
const SparkleIcon: React.FC<{ size?: number; color?: string }> = ({ size = 12, color = APPLE_ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z"/>
  </svg>
);

// ─── Sub-components ──────────────────────────────────────────────────────────
const Badge: React.FC<{
  text: string; bg: string; fg: string; border?: string; icon?: React.ReactNode;
}> = ({ text, bg, fg, border, icon }) => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "4px 10px", borderRadius: 999,
    background: bg, color: fg,
    border: border ? `1px solid ${border}` : "none",
    fontSize: 12, fontFamily: geistFont, fontWeight: 600,
    letterSpacing: "0.02em",
    whiteSpace: "nowrap",
  }}>
    {icon}{text}
  </div>
);

const InfoTile: React.FC<{
  label: string; value: string; subValue?: string;
  icon: React.ReactNode; iconBg: string;
  delay: number; frame: number; fps: number;
}> = ({ label, value, subValue, icon, iconBg, delay, frame, fps }) => {
  const sp = spring({ frame: frame - delay, fps, config: { stiffness: 180, damping: 22, mass: 0.8 } });
  const op = interpolate(sp, [0, 1], [0, 1], CLAMP);
  const ty = interpolate(sp, [0, 1], [14, 0], CLAMP);
  return (
    <div style={{
      background: PANEL_BG,
      border: `1px solid ${PANEL_BORDER}`,
      borderRadius: 12,
      padding: "14px 18px",
      display: "flex", alignItems: "center", gap: 14,
      opacity: op,
      transform: `translateY(${ty}px)`,
      flex: 1,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: iconBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{
          fontSize: 10, fontFamily: geistFont, fontWeight: 600,
          color: LABEL_FG, letterSpacing: "0.09em",
          textTransform: "uppercase",
        }}>{label}</div>
        <div style={{
          fontSize: 15, fontFamily: geistFont, fontWeight: 600,
          color: INK, marginTop: 2,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {value}
          {subValue && (
            <span style={{ color: MUTED, fontWeight: 400, marginLeft: 6 }}>
              · {subValue}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Animated checkbox SVG: the stroke of the checkmark draws on as `progress` → 1.
const CheckBox: React.FC<{ checked: number; size?: number }> = ({ checked, size = 22 }) => {
  // checked: 0..1 controls the fill/bg AND the stroke-dashoffset of the check path.
  const bg = `rgba(31,168,112,${checked})`; // fades in to success
  const borderCol = checked > 0.05
    ? `rgba(31,168,112,${0.25 + 0.75 * checked})`
    : "rgba(180,185,198,0.9)";
  const STROKE_LEN = 22;
  const offset = STROKE_LEN * (1 - Math.max(0, Math.min(1, checked)));
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>
      <rect x={1.5} y={1.5} width={21} height={21} rx={5} ry={5}
            fill={bg} stroke={borderCol} strokeWidth={1.6} />
      <path d="M6.5 12.5 L10.5 16.5 L17.5 8.5"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={STROKE_LEN}
            strokeDashoffset={offset}
            opacity={checked > 0.05 ? 1 : 0} />
    </svg>
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────
export const SceneWorkOrderExec: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background fades in FAST so the empty page is visible first (like Kanban).
  const bgOp = Math.min(
    interpolate(frame, [0, BG_FADE_IN_END], [0, 1], CLAMP),
    interpolate(frame, [SCENE_END - 16, SCENE_END], [1, 0], CLAMP),
  );
  // Content holds briefly on empty bg, then fades in.
  const contentOp = Math.min(
    interpolate(frame, [CONTENT_DELAY, FADE_IN_END], [0, 1], CLAMP),
    interpolate(frame, [SCENE_END - 16, SCENE_END], [1, 0], CLAMP),
  );

  // Page-level subtle zoom-in (1.00 → 1.015) tied to content entrance
  const pageScale = interpolate(frame, [CONTENT_DELAY, FADE_IN_END], [1.01, 1.0], { ...CLAMP, easing: EASE });

  // Header
  const headerSp = spring({ frame: frame - HEADER_AT, fps, config: { stiffness: 280, damping: 20, mass: 0.6 } });
  const headerOp = interpolate(headerSp, [0, 1], [0, 1], CLAMP);
  const headerTy = interpolate(headerSp, [0, 1], [-8, 0], CLAMP);

  // Description
  const descSp = spring({ frame: frame - DESC_AT, fps, config: { stiffness: 260, damping: 20, mass: 0.6 } });
  const descOp = interpolate(descSp, [0, 1], [0, 1], CLAMP);
  const descTy = interpolate(descSp, [0, 1], [10, 0], CLAMP);

  // Steps reveal (container appears then each step staggers)
  const stepsSp = spring({ frame: frame - STEPS_REVEAL, fps, config: { stiffness: 280, damping: 20, mass: 0.6 } });
  const stepsOp = interpolate(stepsSp, [0, 1], [0, 1], CLAMP);
  // ── Steps pop-out: just before the first tick, the whole Operational Steps
  // panel "detaches" and comes forward — scales up slightly, lifts, casts a
  // strong blue-tinted shadow — so the viewer's eye locks onto the checklist
  // while the checks fire. Holds through the last tick, then sinks back.
  const LAST_TICK = FIRST_TICK + (7) * TICK_STRIDE;  // last tick + 10f finish
  const stepsPopIn  = interpolate(frame, [FIRST_TICK - 10, FIRST_TICK + 2],  [0, 1], { ...CLAMP, easing: EASE });
  const stepsPopOut = interpolate(frame, [LAST_TICK + 12, LAST_TICK + 30], [0, 1], { ...CLAMP, easing: EASE });
  const stepsPop = Math.max(0, stepsPopIn - stepsPopOut);
  // Derived transforms for the steps panel AND the de-emphasis of everything else.
  // The panel scales HARD (1 → 1.40) — it's OK that the right-side empty
  // space of the row extends beyond the panel; the focus is on the step TEXT
  // on the left. Transform origin "left center" anchors the text.
  const stepsLiftScale = 1 + stepsPop * 0.40;
  const stepsLiftTy    = -stepsPop * 40;
  const stepsLiftShadow = stepsPop > 0
    ? `drop-shadow(0 ${stepsPop * 40}px ${stepsPop * 80}px rgba(30,50,120,${stepsPop * 0.30})) drop-shadow(0 ${stepsPop * 12}px ${stepsPop * 22}px rgba(0,0,0,${stepsPop * 0.14}))`
    : "none";
  // Other sections dim + desaturate slightly so the steps panel "wins" the frame.
  const otherDim = stepsPop * 0.35;       // opacity drop
  const otherGrey = stepsPop * 0.55;       // grayscale amount
  const otherFilter = otherGrey > 0
    ? `grayscale(${otherGrey}) brightness(${1 - otherGrey * 0.03})`
    : undefined;

  // Per-step checkbox check progress (0..1)
  const stepCheck = (idx: number) => interpolate(
    frame,
    [FIRST_TICK + idx * TICK_STRIDE, FIRST_TICK + idx * TICK_STRIDE + 10],
    [0, 1],
    CLAMP,
  );
  // Per-step "just-checked" highlight pulse (green row tint that fades after ~18f)
  const stepHighlight = (idx: number) => {
    const t0 = FIRST_TICK + idx * TICK_STRIDE;
    return Math.max(
      0,
      interpolate(frame, [t0 - 2, t0 + 4],  [0, 1], CLAMP) -
      interpolate(frame, [t0 + 16, t0 + 30], [0, 1], CLAMP),
    );
  };

  // Bottom blocks
  const bottomSp = spring({ frame: frame - BOTTOM_AT, fps, config: { stiffness: 260, damping: 20, mass: 0.6 } });
  const bottomOp = interpolate(bottomSp, [0, 1], [0, 1], CLAMP);
  const bottomTy = interpolate(bottomSp, [0, 1], [12, 0], CLAMP);

  return (
    <AbsoluteFill style={{
      background: PAGE_BG,
      opacity: bgOp,
    }}>
      {/* No outer white container — content sits directly on the page bg,
          matching the Kanban look. Only sub-sections that need a surface
          (steps list, parts, tools, safety banner) carry their own bg. */}
      <div style={{
        position: "absolute",
        left: 80, top: 40, width: 1760,
        padding: 0,
        transform: `scale(${pageScale})`,
        transformOrigin: "center top",
        opacity: contentOp,
      }}>
        {/* ── Header row ── */}
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          opacity: headerOp * (1 - otherDim), transform: `translateY(${headerTy}px)`,
          filter: otherFilter,
          paddingBottom: 18,
          borderBottom: `1px solid rgba(214,217,227,0.5)`,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{
                fontSize: 13, fontFamily: geistFont, fontWeight: 600, color: MUTED,
                letterSpacing: "0.03em",
              }}>WO-2848</span>
              <Badge text="Critical" bg={CRITICAL_SOFT} fg={CRITICAL} border={ARIA_COLORS.criticalBorder} />
              <Badge
                text="Created by AriA"
                bg="rgba(59,91,219,0.08)"
                fg={APPLE_ACCENT}
                border="rgba(59,91,219,0.25)"
                icon={<SparkleIcon size={11} color={APPLE_ACCENT} />}
              />
            </div>
            <div style={{
              fontSize: 26, fontFamily: geistFont, fontWeight: 700,
              color: INK, letterSpacing: "-0.015em",
            }}>
              OVEN_1 Peg Chain Motor T60M2 torque recovery
            </div>
          </div>
          <div style={{
            padding: "6px 14px", borderRadius: 999,
            border: `1px solid ${WARNING_BORDER}`,
            background: WARNING_SOFT,
            color: WARNING,
            fontSize: 12, fontFamily: geistFont, fontWeight: 600,
            letterSpacing: "0.03em",
            whiteSpace: "nowrap",
          }}>
            In Progress
          </div>
        </div>

        {/* ── Info row ── */}
        <div style={{ display: "flex", gap: 14, marginTop: 16, opacity: 1 - otherDim, filter: otherFilter }}>
          {/* Assigned (wider) */}
          <InfoTile
            label="ASSIGNED TO"
            value="Marco Rossi"
            subValue="Senior Maintenance Technician"
            icon={
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: APPLE_ACCENT, color: "#FFF",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontFamily: geistFont, fontWeight: 700,
                letterSpacing: "0.02em",
              }}>MR</div>
            }
            iconBg="transparent"
            delay={INFO_AT}
            frame={frame}
            fps={fps}
          />
          <InfoTile label="LOCATION" value="Plant 1 · Baking Line 02 · Sector B"
            icon={<PinIcon size={16} />} iconBg="rgba(59,91,219,0.10)"
            delay={INFO_AT + 4} frame={frame} fps={fps} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
            <InfoTile label="DUE" value="Today, 16:00" subValue="in 2h 30m"
              icon={<ClockIcon size={16} color={WARNING} />} iconBg={WARNING_SOFT}
              delay={INFO_AT + 8} frame={frame} fps={fps} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 12, opacity: 1 - otherDim, filter: otherFilter }}>
          <InfoTile label="EST. TIME" value="1h 00m"
            icon={<ClockIcon size={16} color={APPLE_ACCENT} />} iconBg="rgba(59,91,219,0.10)"
            delay={INFO_AT + 12} frame={frame} fps={fps} />
          <InfoTile label="EST. COST" value="€ 1,400"
            icon={<EuroIcon size={16} />} iconBg="rgba(31,168,112,0.12)"
            delay={INFO_AT + 16} frame={frame} fps={fps} />
        </div>

        {/* ── Description ── */}
        <div style={{
          marginTop: 22,
          opacity: descOp * (1 - otherDim), transform: `translateY(${descTy}px)`,
          filter: otherFilter,
        }}>
          <div style={{
            fontSize: 10, fontFamily: geistFont, fontWeight: 600, color: LABEL_FG,
            letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6,
          }}>Description</div>
          <div style={{
            fontSize: 14, fontFamily: geistFont, color: INK, lineHeight: 1.5,
            letterSpacing: "-0.005em",
          }}>
            Full recovery procedure for peg chain motor T60M2 torque limit exceedance.
            Execute preventive inspection, cleaning, and lubrication sequence to restore
            nominal operating parameters.
          </div>
        </div>

        {/* ── Operational Steps (pops FORWARD when the ticks start firing) ── */}
        <div style={{
          marginTop: 20,
          border: `1px solid ${stepsPop > 0 ? `rgba(59,91,219,${0.25 + 0.35 * stepsPop})` : PANEL_BORDER}`,
          borderRadius: 14,
          background: "#FDFDFE",
          overflow: "hidden",
          opacity: stepsOp,
          transform: `translateY(${stepsLiftTy}px) scale(${stepsLiftScale})`,
          // Anchor on the LEFT so the step text stays in place while the
          // panel grows to the right (clipping the empty right-side space
          // is acceptable — the focus is on the step text on the left).
          transformOrigin: "left center",
          filter: stepsLiftShadow,
          position: "relative",
          zIndex: stepsPop > 0 ? 5 : undefined,
          willChange: "transform",
        }}>
          {/* Header strip */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 16px",
            borderBottom: `1px solid rgba(214,217,227,0.5)`,
            background: "#F9FAFC",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                fontSize: 10, fontFamily: geistFont, fontWeight: 600,
                color: LABEL_FG, letterSpacing: "0.09em", textTransform: "uppercase",
              }}>Operational Steps</span>
              <span style={{
                fontSize: 11, fontFamily: geistFont, fontWeight: 600, color: MUTED,
                background: "rgba(214,217,227,0.35)",
                padding: "1px 8px", borderRadius: 999,
              }}>{STEPS.length}</span>
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 11, fontFamily: geistFont, fontWeight: 600,
              color: APPLE_ACCENT,
            }}>
              <SparkleIcon size={10} color={APPLE_ACCENT} />
              Generated by AriA
            </div>
          </div>

          {/* Step rows */}
          {STEPS.map((step, i) => {
            // Staggered in
            const stepSp = spring({
              frame: frame - (STEPS_REVEAL + i * 6),
              fps,
              config: { stiffness: 220, damping: 22, mass: 0.75 },
            });
            const rowOp = interpolate(stepSp, [0, 1], [0, 1], CLAMP);
            const rowTx = interpolate(stepSp, [0, 1], [-10, 0], CLAMP);

            const checked = stepCheck(i);
            const highlight = stepHighlight(i);
            // Row background tint: transient green pulse when just checked.
            const rowBg = `rgba(31,168,112,${0.10 * highlight})`;
            const textGrey = interpolate(checked, [0, 1], [0, 1], CLAMP);
            const textColor = `rgba(${Math.round(26 + (150 - 26) * textGrey)},${Math.round(31 + (155 - 31) * textGrey)},${Math.round(51 + (168 - 51) * textGrey)},1)`;

            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "11px 16px",
                borderBottom: i < STEPS.length - 1 ? `1px solid rgba(214,217,227,0.35)` : "none",
                background: rowBg,
                opacity: rowOp,
                transform: `translateX(${rowTx}px)`,
                position: "relative",
              }}>
                {/* Left accent bar when pulse active */}
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0,
                  width: 3, background: SUCCESS,
                  opacity: highlight,
                }} />
                <CheckBox checked={checked} size={20} />
                <span style={{
                  fontSize: 11, fontFamily: geistFont, fontWeight: 600,
                  color: MUTED, letterSpacing: "0.04em", minWidth: 22,
                }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{
                  fontSize: 13, fontFamily: geistFont, color: textColor,
                  textDecoration: checked > 0.5 ? "line-through" : "none",
                  letterSpacing: "-0.005em",
                  flex: 1,
                }}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Required Parts + Required Tools ── */}
        <div style={{
          display: "flex", gap: 14, marginTop: 16,
          opacity: bottomOp * (1 - otherDim), transform: `translateY(${bottomTy}px)`,
          filter: otherFilter,
        }}>
          {/* Parts */}
          <div style={{
            flex: 1,
            border: `1px solid ${PANEL_BORDER}`, borderRadius: 14,
            background: "#FDFDFE", overflow: "hidden",
          }}>
            <div style={{
              padding: "9px 14px",
              borderBottom: `1px solid rgba(214,217,227,0.5)`,
              background: "#F9FAFC",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <GearIcon size={12} />
              <span style={{
                fontSize: 10, fontFamily: geistFont, fontWeight: 600,
                color: LABEL_FG, letterSpacing: "0.09em", textTransform: "uppercase",
              }}>Required Parts</span>
              <span style={{
                fontSize: 11, fontFamily: geistFont, fontWeight: 600, color: MUTED,
                background: "rgba(214,217,227,0.35)",
                padding: "1px 7px", borderRadius: 999,
              }}>{PARTS.length}</span>
            </div>
            {PARTS.map((p, i) => (
              <div key={p.sku} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "9px 14px",
                borderBottom: i < PARTS.length - 1 ? `1px solid rgba(214,217,227,0.35)` : "none",
              }}>
                <span style={{
                  fontSize: 11, fontFamily: geistFont, color: MUTED, fontWeight: 500,
                  letterSpacing: "0.02em", minWidth: 150,
                }}>{p.sku}</span>
                <span style={{
                  fontSize: 13, fontFamily: geistFont, color: INK,
                  flex: 1,
                }}>{p.name}</span>
                <span style={{
                  fontSize: 11, fontFamily: geistFont, fontWeight: 700,
                  padding: "2px 9px", borderRadius: 6,
                  background: p.status === "OK" ? SUCCESS_SOFT_BG : WARNING_SOFT,
                  color: p.status === "OK" ? SUCCESS : WARNING,
                  border: `1px solid ${p.status === "OK" ? SUCCESS_BORDER : WARNING_BORDER}`,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}>{p.status}</span>
                <span style={{
                  fontSize: 12, fontFamily: geistFont, color: MUTED, fontWeight: 500,
                  minWidth: 28, textAlign: "right",
                }}>{p.qty}</span>
              </div>
            ))}
          </div>

          {/* Tools */}
          <div style={{
            flex: 1,
            border: `1px solid ${PANEL_BORDER}`, borderRadius: 14,
            background: "#FDFDFE", overflow: "hidden",
          }}>
            <div style={{
              padding: "9px 14px",
              borderBottom: `1px solid rgba(214,217,227,0.5)`,
              background: "#F9FAFC",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <ToolIcon size={12} />
              <span style={{
                fontSize: 10, fontFamily: geistFont, fontWeight: 600,
                color: LABEL_FG, letterSpacing: "0.09em", textTransform: "uppercase",
              }}>Required Tools</span>
              <span style={{
                fontSize: 11, fontFamily: geistFont, fontWeight: 600, color: MUTED,
                background: "rgba(214,217,227,0.35)",
                padding: "1px 7px", borderRadius: 999,
              }}>{TOOLS.length}</span>
            </div>
            <div style={{ padding: "8px 16px" }}>
              {TOOLS.map((t) => (
                <div key={t} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "5px 0",
                }}>
                  <span style={{
                    width: 4, height: 4, borderRadius: 999,
                    background: APPLE_ACCENT, flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: 13, fontFamily: geistFont, color: INK,
                  }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Safety / PPE banner ── */}
        <div style={{
          marginTop: 14,
          background: WARNING_SOFT,
          border: `1px solid ${WARNING_BORDER}`,
          borderRadius: 12,
          padding: "10px 16px",
          opacity: bottomOp * (1 - otherDim), transform: `translateY(${bottomTy}px)`,
          filter: otherFilter,
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
          }}>
            <ShieldIcon size={13} color={WARNING} />
            <span style={{
              fontSize: 10, fontFamily: geistFont, fontWeight: 700,
              color: WARNING, letterSpacing: "0.09em", textTransform: "uppercase",
            }}>Safety / PPE Required</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {PPE.map((p) => (
              <span key={p} style={{
                fontSize: 12, fontFamily: geistFont, color: WARNING,
                padding: "4px 11px", borderRadius: 999,
                border: `1px solid ${WARNING_BORDER}`,
                background: "rgba(255,255,255,0.65)",
                fontWeight: 500,
              }}>{p}</span>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const SCENE_WO_EXEC_DURATION = SCENE_END;
