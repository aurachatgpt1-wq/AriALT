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
// SceneKanbanRouting — Autonomous routing board. 5 columns (NEW / ASSIGNED /
// IN PROGRESS / REVIEW / DONE) each with WO cards. AriA routes WO-2848 into
// ASSIGNED with a "ROUTED" badge — the card we will execute in the next scene.
// Design note: NO column background tints — cards sit on the clean page bg
// (like the alarm cards at 00:21), only the column header chips carry color.
// ─────────────────────────────────────────────────────────────────────────────

const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const EASE = Easing.inOut(Easing.sin);

const INK = ARIA_COLORS.foreground;
const MUTED = ARIA_COLORS.mutedFg;
const PAGE_BG = "#F3F4F7";
const CARD_BG = "#FFFFFF";
const CARD_BORDER = "rgba(214,217,227,0.7)";
const APPLE_ACCENT = "#3B5BDB";

// ─── Timing (frames @ 30fps) — total 350f ≈ 11.7s ────────────────────────
// Scene split into clear kinetic beats — something is always moving:
//   P1   0 – 8    background fades in
//   P1   6 – 22   banner + LIVE + empty columns land
//   P2  28 – 140  cards POUR IN column-by-column (NEW → ASSIGNED → IN PROGRESS
//                 → REVIEW → DONE), each column's cards stagger inside it
//   P3 148 –180   ROUTED badge flashes on WO-2848  (ASSIGNED column spotlight)
//   P4 190 –230   Flight A : WO-2850  NEW → IN PROGRESS
//   P5 240 –280   Flight B : WO-2842  IN PROGRESS → REVIEW
//   P6 290 –330   Flight C : WO-2838  REVIEW → DONE  (closing the loop)
//   P7 330 –350   settle + fade out
const BG_FADE_IN_END = 8;
const BANNER_AT           = 6;
const AGENT_A_AT          = 8;
const AGENT_1_AT          = 10;
const AGENT_2_AT          = 12;
const COLS_AT             = 10;
// Per-column card entrance — each column enters its cards as a burst, with
// visible gaps between columns so you SEE the board populate station by station.
const COL_ENTRY_FRAMES: [number, number, number, number, number] = [28, 46, 68, 90, 108];
const CARD_STAGGER_IN_COL = 8;
// Phase beats (all AFTER the cards finish entering ~f 140):
const ROUTE_FLIGHT_START  = 148;
const ROUTE_FLIGHT_END    = 180;
const FLIGHT_A_START      = 190;   // WO-2850 : NEW → IN PROGRESS
const FLIGHT_A_END        = 230;
const FLIGHT_B_START      = 240;   // WO-2842 : IN PROGRESS → REVIEW
const FLIGHT_B_END        = 280;
const FLIGHT_C_START      = 290;   // WO-2838 : REVIEW → DONE (new beat)
const FLIGHT_C_END        = 330;
const SCENE_END           = 350;
// Content opacity window (inner container) — crossfades in during intro.
const CONTENT_DELAY = 4;
const FADE_IN_END   = 22;

// ─── Board layout anchors (within the outer container at left:40, top:30) ──
// Outer container spans 40..1880 (width 1840). Grid: 5 cols with 20 gap.
// col_width = (1840 - 4*20) / 5 = 352
const COL_STRIDE_PX = 352 + 20;  // 372
const CARD_STRIDE_PX = 125;      // approximate card height + gap
// First card top inside a column (banner height ≈ 84, gap 22, col header ≈ 30, gap 12)
const FIRST_CARD_TOP = 84 + 22 + 30 + 12; // 148
const CARD_WIDTH_PX  = 352;
const colLeft = (i: number) => i * COL_STRIDE_PX;
const cardTop = (i: number) => FIRST_CARD_TOP + i * CARD_STRIDE_PX;

// ─── Data ────────────────────────────────────────────────────────────────────
type Priority = "CRIT" | "HIGH" | "MEDI" | "LOW";
const PRI_COLOR: Record<Priority, { bg: string; fg: string; bar: string }> = {
  CRIT: { bg: "#FDEFEF", fg: "#DC2626", bar: "#DC2626" },
  HIGH: { bg: "#FFF4E5", fg: "#E8830A", bar: "#F59E0B" },
  MEDI: { bg: "#E9EEF7", fg: "#5B6B8F", bar: "#8B93A6" },
  LOW:  { bg: "#EEF0F4", fg: "#767E8C", bar: "#D1D5DB" },
};

type Owner = {
  kind: "agent" | "person";
  label: string;     // "Agent-01" / "MR"
  color: string;     // chip fill (agent) or circle bg (person)
  textColor?: string;
};
const AGENT_01: Owner = { kind: "agent", label: "Agent-01", color: "#E9DEFF", textColor: "#6D28D9" };
// AGENT_02 reserved for future use; currently all IN-PROGRESS cards are owned
// by human operators in the mock data.
// const AGENT_02: Owner = { kind: "agent", label: "Agent-02", color: "#FFE4CC", textColor: "#C2410C" };
const ARIA_OWNER: Owner = { kind: "agent", label: "AriA", color: "rgba(59,91,219,0.10)", textColor: APPLE_ACCENT };
const PERSON = (initials: string, bg = APPLE_ACCENT): Owner =>
  ({ kind: "person", label: initials, color: bg, textColor: "#FFF" });

type Status = "routing..." | "in 2h" | "in 3h" | "today" | "running" | "validating" | "done";
type Card = {
  id: string;
  title: string;
  pri: Priority;
  owner: Owner;
  status?: Status;
  highlight?: boolean; // for the "ROUTED" card
};

const COL_NEW: Card[] = [
  { id: "WO-2850", title: "Valve VLV-03 leak detection",   pri: "HIGH", owner: AGENT_01, status: "routing..." },
  { id: "WO-2849", title: "Bearing SBR-12 thermal anomaly", pri: "CRIT", owner: ARIA_OWNER, status: "routing..." },
];
const COL_ASSIGNED: Card[] = [
  { id: "WO-2848", title: "OVEN_1 Peg Chain T60M2 recovery", pri: "CRIT", owner: PERSON("MR"), status: "in 2h", highlight: true },
  { id: "WO-2847", title: "Hydraulic pump PUMP-AX-03 pressure", pri: "HIGH", owner: PERSON("LT", "#047857"), status: "in 3h" },
  { id: "WO-2846", title: "Conveyor CB-L2 tension calibration", pri: "MEDI", owner: PERSON("PB", "#7C3AED"), status: "today" },
  { id: "WO-2845", title: "Injection molder IM-07 mold change", pri: "MEDI", owner: PERSON("AF", APPLE_ACCENT), status: "today" },
];
const COL_PROGRESS: Card[] = [
  { id: "WO-2842", title: "Compressor COMP-02 filter replacement", pri: "LOW",  owner: PERSON("DM", "#475569"), status: "running" },
  { id: "WO-2841", title: "Sensor SNS-05 calibration",              pri: "MEDI", owner: PERSON("SR", "#0F766E"), status: "running" },
  { id: "WO-2840", title: "Motor MTR-09 vibration diagnostic",      pri: "HIGH", owner: PERSON("MB", "#B45309"), status: "running" },
];
const COL_REVIEW: Card[] = [
  { id: "WO-2838", title: "Tank TNK-02 pressure test",    pri: "MEDI", owner: PERSON("LT", "#047857"), status: "validating" },
  { id: "WO-2837", title: "Pump PUMP-BB-01 inspection",   pri: "LOW",  owner: PERSON("AF", APPLE_ACCENT), status: "validating" },
];
const COL_DONE: Card[] = [
  { id: "WO-2836", title: "Heater HEAT-04 thermocouple", pri: "LOW",  owner: PERSON("DM", "#475569"), status: "done" },
  { id: "WO-2835", title: "Relay RLY-07 replacement",    pri: "MEDI", owner: PERSON("SR", "#0F766E"), status: "done" },
  { id: "WO-2834", title: "Sensor array calibration",    pri: "LOW",  owner: PERSON("PB", "#7C3AED"), status: "done" },
];

type Column = { title: string; dot: string; count: number; cards: Card[] };
const COLUMNS: Column[] = [
  { title: "NEW",         dot: "#E8830A", count: COL_NEW.length,      cards: COL_NEW },
  { title: "ASSIGNED",    dot: "#E8830A", count: COL_ASSIGNED.length, cards: COL_ASSIGNED },
  { title: "IN PROGRESS", dot: "#7C3AED", count: COL_PROGRESS.length, cards: COL_PROGRESS },
  { title: "REVIEW",      dot: "#0F1219", count: COL_REVIEW.length,   cards: COL_REVIEW },
  { title: "DONE",        dot: "#1FA870", count: COL_DONE.length,     cards: COL_DONE },
];

// ─── Small sub-components ────────────────────────────────────────────────────
const SparkleIcon: React.FC<{ size?: number; color?: string }> = ({ size = 11, color = APPLE_ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z"/>
  </svg>
);

const OwnerChip: React.FC<{ owner: Owner }> = ({ owner }) => {
  if (owner.kind === "person") {
    return (
      <div style={{
        width: 22, height: 22, borderRadius: 999,
        background: owner.color, color: owner.textColor ?? "#FFF",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, fontFamily: geistFont, fontWeight: 700,
        letterSpacing: "0.02em",
      }}>{owner.label}</div>
    );
  }
  return (
    <div style={{
      padding: "2px 8px", borderRadius: 6,
      background: owner.color, color: owner.textColor ?? APPLE_ACCENT,
      fontSize: 10.5, fontFamily: geistFont, fontWeight: 700,
      letterSpacing: "0.02em", display: "inline-flex", alignItems: "center", gap: 4,
    }}>
      <SparkleIcon size={9} color={owner.textColor ?? APPLE_ACCENT} />
      {owner.label}
    </div>
  );
};

const KanbanCard: React.FC<{
  card: Card;
  appearAt: number;
  routeGlow?: number; // 0..1 — only on the highlighted "ROUTED" card
  frame: number; fps: number;
}> = ({ card, appearAt, routeGlow = 0, frame, fps }) => {
  // Apple-keynote card entrance: bouncier spring, bigger travel, subtle scale.
  // The card pops up from below with a touch of overshoot — never a flat fade.
  const sp = spring({
    frame: frame - appearAt, fps,
    config: { stiffness: 240, damping: 16, mass: 0.75 },
  });
  const op = interpolate(sp, [0, 1], [0, 1], CLAMP);
  const ty = interpolate(sp, [0, 1], [36, 0], CLAMP);
  const scale = interpolate(sp, [0, 1], [0.94, 1], CLAMP);

  const pri = PRI_COLOR[card.pri];

  const routeBadgeOp = card.highlight ? routeGlow : 0;
  const borderCol = card.highlight && routeGlow > 0
    ? `rgba(232,131,10,${0.25 + 0.5 * routeGlow})`
    : CARD_BORDER;
  const cardShadow = card.highlight && routeGlow > 0
    ? `0 ${10 + routeGlow * 10}px ${24 + routeGlow * 26}px rgba(232,131,10,${0.12 + 0.10 * routeGlow}), 0 2px 6px rgba(0,0,0,0.04)`
    : "0 2px 6px rgba(0,0,0,0.04)";

  return (
    <div style={{
      position: "relative",
      background: CARD_BG,
      border: `1px solid ${borderCol}`,
      borderRadius: 12,
      padding: "12px 14px 11px",
      boxShadow: cardShadow,
      opacity: op,
      transform: `translateY(${ty}px) scale(${scale})`,
      transformOrigin: "center top",
      overflow: "visible",
    }}>
      {/* Priority left accent */}
      <div style={{
        position: "absolute", left: 0, top: 10, bottom: 10, width: 3,
        background: pri.bar, borderRadius: 3,
      }} />

      {/* ROUTED badge (only on highlighted card) */}
      {card.highlight && (
        <div style={{
          position: "absolute", top: -10, right: 10,
          padding: "3px 9px", borderRadius: 6,
          background: "#E8830A", color: "#FFF",
          fontSize: 9.5, fontFamily: geistFont, fontWeight: 700,
          letterSpacing: "0.1em",
          opacity: routeBadgeOp,
          transform: `scale(${0.85 + 0.15 * routeBadgeOp})`,
          boxShadow: `0 6px 16px rgba(232,131,10,${0.3 * routeBadgeOp})`,
        }}>ROUTED</div>
      )}

      {/* Header: WO id + owner */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 6,
      }}>
        <span style={{
          fontSize: 10.5, fontFamily: geistFont, fontWeight: 600, color: MUTED,
          letterSpacing: "0.03em",
        }}>{card.id}</span>
        <OwnerChip owner={card.owner} />
      </div>

      {/* Title */}
      <div style={{
        fontSize: 13, fontFamily: geistFont, color: INK, fontWeight: 500,
        letterSpacing: "-0.005em", lineHeight: 1.35,
        minHeight: 34, marginBottom: 8,
      }}>{card.title}</div>

      {/* Footer: priority pill + status */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{
          padding: "2px 8px", borderRadius: 6,
          background: pri.bg, color: pri.fg,
          fontSize: 10, fontFamily: geistFont, fontWeight: 700,
          letterSpacing: "0.06em",
        }}>{card.pri}</span>
        {card.status && (
          <span style={{
            fontSize: 11, fontFamily: geistFont, color: MUTED, fontStyle: "italic",
          }}>{card.status}</span>
        )}
      </div>
    </div>
  );
};

const AgentStage: React.FC<{
  num: string; label: string; sub: string; tint: string; fg: string;
  appearAt: number; frame: number; fps: number;
  pulseActive: boolean;
  icon?: React.ReactNode;
}> = ({ num, label, sub, tint, fg, appearAt, frame, fps, pulseActive, icon }) => {
  const sp = spring({ frame: frame - appearAt, fps, config: { stiffness: 220, damping: 22, mass: 0.7 } });
  const op = interpolate(sp, [0, 1], [0, 1], CLAMP);
  const tx = interpolate(sp, [0, 1], [-12, 0], CLAMP);
  const pulse = pulseActive
    ? 0.5 + 0.5 * Math.sin((frame - appearAt) / 4)
    : 0;
  return (
    <div style={{
      flex: 1,
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 14px",
      background: `rgba(${tint},${0.08 + 0.06 * pulse})`,
      border: `1px solid rgba(${tint},${0.25 + 0.1 * pulse})`,
      borderRadius: 10,
      opacity: op,
      transform: `translateX(${tx}px)`,
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: 7,
        background: `rgb(${tint})`, color: "#FFF",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontFamily: geistFont, fontWeight: 700,
        flexShrink: 0,
      }}>
        {icon ?? num}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 12.5, fontFamily: geistFont, fontWeight: 700,
          color: fg, letterSpacing: "0.01em",
        }}>{label}</div>
        <div style={{
          fontSize: 11, fontFamily: geistFont, color: MUTED,
        }}>{sub}</div>
      </div>
    </div>
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────
export const SceneKanbanRouting: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background fades in QUICKLY (so the viewer sees the empty page first).
  const bgOp = Math.min(
    interpolate(frame, [0, BG_FADE_IN_END], [0, 1], CLAMP),
    interpolate(frame, [SCENE_END - 16, SCENE_END], [1, 0], CLAMP),
  );
  // Content (banner + board) fades in AFTER the empty-bg beat (CONTENT_DELAY).
  const contentOp = Math.min(
    interpolate(frame, [CONTENT_DELAY, FADE_IN_END], [0, 1], CLAMP),
    interpolate(frame, [SCENE_END - 16, SCENE_END], [1, 0], CLAMP),
  );

  // Top banner entry
  const bannerSp = spring({ frame: frame - BANNER_AT, fps, config: { stiffness: 220, damping: 22, mass: 0.7 } });
  const bannerOp = interpolate(bannerSp, [0, 1], [0, 1], CLAMP);
  const bannerTy = interpolate(bannerSp, [0, 1], [-10, 0], CLAMP);

  // LIVE dot pulse
  const livePulse = 0.5 + 0.5 * Math.sin(frame / 8);

  // Column header entry
  const colSp = (i: number) => spring({
    frame: frame - (COLS_AT + i * 4), fps,
    config: { stiffness: 260, damping: 16, mass: 0.7 }, // bouncier, Apple-feel
  });

  // WO-2848 "ROUTED" glow progress
  const routeGlow = interpolate(
    frame,
    [ROUTE_FLIGHT_START, ROUTE_FLIGHT_END],
    [0, 1],
    CLAMP,
  );

  // ── Card choreography: cards pour in COLUMN-BY-COLUMN with a visible gap
  // between columns so the eye tracks a wave from NEW → DONE.
  const cardMotion = (ci: number, i: number) => {
    const riseAt = COL_ENTRY_FRAMES[ci] + i * CARD_STAGGER_IN_COL;
    const sp = spring({
      frame: frame - riseAt, fps,
      config: { stiffness: 240, damping: 18, mass: 0.75 },
    });
    const op = interpolate(sp, [0, 1], [0, 1], CLAMP);
    const ty = interpolate(sp, [0, 1], [48, 0], CLAMP);   // noticeable rise into slot
    const scale = interpolate(sp, [0, 1], [0.94, 1], CLAMP);
    return { op, tx: 0, ty, scale };
  };

  // Per-column spotlight: during each flight, the source+destination column
  // headers pulse subtly (slight scale + color lift) while other columns dim.
  const colSpotlight = (ci: number): { dim: number; pulse: number } => {
    // Determine which flight is currently active
    if (frame >= ROUTE_FLIGHT_START - 6 && frame <= ROUTE_FLIGHT_END + 10) {
      // ROUTED: focus ASSIGNED (col 1)
      const active = ci === 1;
      const t = interpolate(frame, [ROUTE_FLIGHT_START - 6, ROUTE_FLIGHT_START + 6, ROUTE_FLIGHT_END, ROUTE_FLIGHT_END + 10], [0, 1, 1, 0], CLAMP);
      return { dim: active ? 0 : t * 0.22, pulse: active ? t : 0 };
    }
    if (frame >= FLIGHT_A_START - 6 && frame <= FLIGHT_A_END + 10) {
      const active = ci === 0 || ci === 2;
      const t = interpolate(frame, [FLIGHT_A_START - 6, FLIGHT_A_START + 6, FLIGHT_A_END, FLIGHT_A_END + 10], [0, 1, 1, 0], CLAMP);
      return { dim: active ? 0 : t * 0.22, pulse: active ? t : 0 };
    }
    if (frame >= FLIGHT_B_START - 6 && frame <= FLIGHT_B_END + 10) {
      const active = ci === 2 || ci === 3;
      const t = interpolate(frame, [FLIGHT_B_START - 6, FLIGHT_B_START + 6, FLIGHT_B_END, FLIGHT_B_END + 10], [0, 1, 1, 0], CLAMP);
      return { dim: active ? 0 : t * 0.22, pulse: active ? t : 0 };
    }
    if (frame >= FLIGHT_C_START - 6 && frame <= FLIGHT_C_END + 10) {
      const active = ci === 3 || ci === 4;
      const t = interpolate(frame, [FLIGHT_C_START - 6, FLIGHT_C_START + 6, FLIGHT_C_END, FLIGHT_C_END + 10], [0, 1, 1, 0], CLAMP);
      return { dim: active ? 0 : t * 0.22, pulse: active ? t : 0 };
    }
    return { dim: 0, pulse: 0 };
  };

  // ── Card flights — 3 sequential moves across the board ──
  //   A: WO-2850  NEW(0,0)         → IN PROGRESS bottom (col 2)
  //   B: WO-2842  IN PROGRESS(2,0) → REVIEW bottom     (col 3)
  //   C: WO-2838  REVIEW(3,0)      → DONE bottom       (col 4)
  const flightA = interpolate(frame, [FLIGHT_A_START, FLIGHT_A_END], [0, 1], { ...CLAMP, easing: EASE });
  const flightB = interpolate(frame, [FLIGHT_B_START, FLIGHT_B_END], [0, 1], { ...CLAMP, easing: EASE });
  const flightC = interpolate(frame, [FLIGHT_C_START, FLIGHT_C_END], [0, 1], { ...CLAMP, easing: EASE });

  // Flight A: origin (col 0, idx 0), destination (col 2, new idx = COL_PROGRESS.length)
  const flightA_from = { left: colLeft(0), top: cardTop(0) };
  const flightA_to   = { left: colLeft(2), top: cardTop(COL_PROGRESS.length) };
  const flightA_lift = Math.sin(flightA * Math.PI) * 34;

  // Flight B: origin (col 2, idx 0), destination (col 3, new idx = COL_REVIEW.length)
  const flightB_from = { left: colLeft(2), top: cardTop(0) };
  const flightB_to   = { left: colLeft(3), top: cardTop(COL_REVIEW.length) };
  const flightB_lift = Math.sin(flightB * Math.PI) * 30;

  // Flight C: origin (col 3, idx 0), destination (col 4, new idx = COL_DONE.length)
  const flightC_from = { left: colLeft(3), top: cardTop(0) };
  const flightC_to   = { left: colLeft(4), top: cardTop(COL_DONE.length) };
  const flightC_lift = Math.sin(flightC * Math.PI) * 28;

  // Identify which live cards are in flight / already landed
  const hiddenInOrigin = (id: string): number => {
    if (id === "WO-2850") return interpolate(flightA, [0, 0.25], [0, 1], CLAMP);
    if (id === "WO-2842") return interpolate(flightB, [0, 0.25], [0, 1], CLAMP);
    if (id === "WO-2838") return interpolate(flightC, [0, 0.25], [0, 1], CLAMP);
    return 0;
  };
  // Destination placeholder appears as the flight lands
  const landedOp = (flight: number) => interpolate(flight, [0.75, 1], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{
      background: PAGE_BG,
      opacity: bgOp,
    }}>
      <div style={{
        position: "absolute",
        left: 40, top: 30, right: 40, bottom: 30,
        display: "flex", flexDirection: "column", gap: 22,
        opacity: contentOp,
      }}>
        {/* ── Top banner: status + 3 agent stages + LIVE ── */}
        <div style={{
          display: "flex", alignItems: "stretch", gap: 14,
          opacity: bannerOp, transform: `translateY(${bannerTy}px)`,
          background: "#FFFFFF",
          border: `1px solid ${CARD_BORDER}`,
          borderRadius: 14,
          padding: "14px 18px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
        }}>
          {/* Status block */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            paddingRight: 18, borderRight: `1px solid rgba(214,217,227,0.5)`,
            minWidth: 280,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "rgba(59,91,219,0.10)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: APPLE_ACCENT, fontSize: 20,
            }}>✦</div>
            <div>
              <div style={{
                fontSize: 14, fontFamily: geistFont, fontWeight: 700,
                color: INK, letterSpacing: "-0.01em",
              }}>Autonomous routing active</div>
              <div style={{
                fontSize: 11, fontFamily: geistFont, color: MUTED,
                marginTop: 2,
              }}>14 work orders · 3 agents active · MTTA 23s avg</div>
            </div>
          </div>

          {/* Agent stages (pipeline) */}
          <AgentStage
            num="✦" label="AriA" sub="matching agent ·"
            tint="59,91,219" fg={APPLE_ACCENT}
            appearAt={AGENT_A_AT} frame={frame} fps={fps}
            pulseActive={frame >= AGENT_A_AT && frame < AGENT_1_AT + 60}
            icon={<SparkleIcon size={12} color="#FFF" />}
          />
          <AgentStage
            num="01" label="Agent-01" sub="scanning fleet ·"
            tint="124,58,237" fg="#6D28D9"
            appearAt={AGENT_1_AT} frame={frame} fps={fps}
            pulseActive={frame >= AGENT_1_AT && frame < AGENT_2_AT + 60}
          />
          <AgentStage
            num="02" label="Agent-02" sub="confirming assignment ·"
            tint="234,88,12" fg="#C2410C"
            appearAt={AGENT_2_AT} frame={frame} fps={fps}
            pulseActive={frame >= AGENT_2_AT && frame < ROUTE_FLIGHT_END + 10}
          />

          {/* LIVE indicator */}
          <div style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "0 4px 0 14px",
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: 999,
              background: "#16A34A",
              boxShadow: `0 0 ${6 + 10 * livePulse}px rgba(22,163,74,${0.3 + 0.4 * livePulse})`,
            }} />
            <span style={{
              fontSize: 11, fontFamily: geistFont, fontWeight: 700,
              color: "#16A34A", letterSpacing: "0.1em",
            }}>LIVE</span>
          </div>
        </div>

        {/* ── Board: 5 columns ── */}
        <div style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 20,
          minHeight: 0,
        }}>
          {COLUMNS.map((col, ci) => {
            const hSp = colSp(ci);
            const hOp = interpolate(hSp, [0, 1], [0, 1], CLAMP);
            // Bigger, springier column header drop — reads as "planting" each column
            const hTy = interpolate(hSp, [0, 1], [-22, 0], CLAMP);
            const hScale = interpolate(hSp, [0, 1], [0.9, 1], CLAMP);
            const spot = colSpotlight(ci);

            return (
              <div key={col.title} style={{
                display: "flex", flexDirection: "column", gap: 12,
                minWidth: 0,
                opacity: 1 - spot.dim,
                filter: spot.dim > 0 ? `grayscale(${spot.dim * 1.6})` : undefined,
                transform: spot.pulse > 0 ? `scale(${1 + spot.pulse * 0.02})` : undefined,
                transformOrigin: "center top",
                transition: "none",
              }}>
                {/* Column header — no tinted background, just label + dot + count */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "2px 4px",
                  opacity: hOp, transform: `translateY(${hTy}px) scale(${hScale})`,
                  transformOrigin: "left center",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 7, height: 7, borderRadius: 999, background: col.dot,
                    }} />
                    <span style={{
                      fontSize: 11, fontFamily: geistFont, fontWeight: 700,
                      color: INK, letterSpacing: "0.12em",
                    }}>{col.title}</span>
                  </div>
                  <span style={{
                    width: 22, height: 22, borderRadius: 999,
                    background: col.dot, color: "#FFF",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10.5, fontFamily: geistFont, fontWeight: 700,
                  }}>{col.count}</span>
                </div>

                {/* Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
                  {col.cards.map((card, i) => {
                    // Origin collapse during card flight (flight A/B)
                    const hiddenFade = hiddenInOrigin(card.id);
                    if (hiddenFade >= 1) return null;
                    // Rise motion driven from the scene (direct to its slot).
                    const m = cardMotion(ci, i);
                    return (
                      <div key={card.id} style={{
                        opacity: m.op * (1 - hiddenFade),
                        transform: `translateY(${m.ty}px) scale(${m.scale})`,
                        transformOrigin: "center top",
                        willChange: "transform",
                      }}>
                        <KanbanCard
                          card={card}
                          appearAt={0}   // motion handled outside; keep inner spring settled
                          routeGlow={routeGlow}
                          frame={frame}
                          fps={fps}
                        />
                      </div>
                    );
                  })}

                  {/* Landing placeholders: the newly-arrived card settles into
                      its destination column's bottom slot once the flight lands.
                      appearAt is BEFORE now so the inner spring is fully settled
                      by the time this card becomes visible. */}
                  {ci === 2 && landedOp(flightA) > 0 && (
                    <div style={{ opacity: landedOp(flightA) }}>
                      <KanbanCard
                        card={COL_NEW[0]}
                        appearAt={FLIGHT_A_END - 10}
                        frame={frame}
                        fps={fps}
                      />
                    </div>
                  )}
                  {ci === 3 && landedOp(flightB) > 0 && (
                    <div style={{ opacity: landedOp(flightB) }}>
                      <KanbanCard
                        card={{ ...COL_PROGRESS[0], status: "validating" }}
                        appearAt={FLIGHT_B_END - 10}
                        frame={frame}
                        fps={fps}
                      />
                    </div>
                  )}
                  {ci === 4 && landedOp(flightC) > 0 && (
                    <div style={{ opacity: landedOp(flightC) }}>
                      <KanbanCard
                        card={{ ...COL_REVIEW[0], status: "done" }}
                        appearAt={FLIGHT_C_END - 10}
                        frame={frame}
                        fps={fps}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Flying cards (absolute overlay, traverse between columns) ── */}
        {flightA > 0 && flightA < 1 && (
          <div style={{
            position: "absolute",
            left: flightA_from.left + (flightA_to.left - flightA_from.left) * flightA,
            top:  flightA_from.top  + (flightA_to.top  - flightA_from.top)  * flightA - flightA_lift,
            width: CARD_WIDTH_PX,
            zIndex: 30,
            filter: `drop-shadow(0 ${10 + 16 * Math.sin(flightA * Math.PI)}px ${18 + 28 * Math.sin(flightA * Math.PI)}px rgba(20,30,60,${0.10 + 0.14 * Math.sin(flightA * Math.PI)}))`,
            transform: `scale(${1 + 0.03 * Math.sin(flightA * Math.PI)}) rotate(${-2 + 4 * flightA}deg)`,
            transformOrigin: "center center",
            pointerEvents: "none",
          }}>
            <KanbanCard card={COL_NEW[0]} appearAt={FLIGHT_A_START - 20} frame={frame} fps={fps} />
          </div>
        )}
        {flightB > 0 && flightB < 1 && (
          <div style={{
            position: "absolute",
            left: flightB_from.left + (flightB_to.left - flightB_from.left) * flightB,
            top:  flightB_from.top  + (flightB_to.top  - flightB_from.top)  * flightB - flightB_lift,
            width: CARD_WIDTH_PX,
            zIndex: 30,
            filter: `drop-shadow(0 ${10 + 16 * Math.sin(flightB * Math.PI)}px ${18 + 28 * Math.sin(flightB * Math.PI)}px rgba(20,30,60,${0.10 + 0.14 * Math.sin(flightB * Math.PI)}))`,
            transform: `scale(${1 + 0.03 * Math.sin(flightB * Math.PI)}) rotate(${-2 + 4 * flightB}deg)`,
            transformOrigin: "center center",
            pointerEvents: "none",
          }}>
            <KanbanCard card={{ ...COL_PROGRESS[0], status: "validating" }} appearAt={FLIGHT_B_START - 20} frame={frame} fps={fps} />
          </div>
        )}
        {flightC > 0 && flightC < 1 && (
          <div style={{
            position: "absolute",
            left: flightC_from.left + (flightC_to.left - flightC_from.left) * flightC,
            top:  flightC_from.top  + (flightC_to.top  - flightC_from.top)  * flightC - flightC_lift,
            width: CARD_WIDTH_PX,
            zIndex: 30,
            filter: `drop-shadow(0 ${10 + 16 * Math.sin(flightC * Math.PI)}px ${18 + 28 * Math.sin(flightC * Math.PI)}px rgba(20,30,60,${0.10 + 0.14 * Math.sin(flightC * Math.PI)}))`,
            transform: `scale(${1 + 0.03 * Math.sin(flightC * Math.PI)}) rotate(${-2 + 4 * flightC}deg)`,
            transformOrigin: "center center",
            pointerEvents: "none",
          }}>
            <KanbanCard card={{ ...COL_REVIEW[0], status: "done" }} appearAt={FLIGHT_C_START - 20} frame={frame} fps={fps} />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export const SCENE_KANBAN_DURATION = SCENE_END;
