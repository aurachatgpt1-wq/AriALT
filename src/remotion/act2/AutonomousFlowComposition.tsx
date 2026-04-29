import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

export const AUTONOMOUS_FLOW_FPS = 60;
export const AUTONOMOUS_FLOW_DURATION = 1200;
const W = 1920;
const H = 1080;

const C = {
  bg: "#080a12",
  purple: "#8b5cf6",
  purpleSoft: "rgba(139,92,246,.5)",
  red: "#ef4444",
  primary: "#6366f1",
  violet: "#8b5cf6",
  green: "#10b981",
  white: "#ffffff",
  textMute: "rgba(255,255,255,.55)",
  textFaint: "rgba(255,255,255,.35)",
};

const TAGS: Record<string, { bg: string; fg: string }> = {
  REPORT:    { bg: "rgba(139,92,246,.18)",  fg: "#c4b5fd" },
  WHATIF:    { bg: "rgba(251,113,133,.15)", fg: "#fda4af" },
  STRATEGY:  { bg: "rgba(168,85,247,.18)",  fg: "#d8b4fe" },
  RESEARCH:  { bg: "rgba(234,179,8,.15)",   fg: "#fef08a" },
  ANALYTICS: { bg: "rgba(99,102,241,.18)",  fg: "#a5b4fc" },
  AI:        { bg: "rgba(6,182,212,.15)",   fg: "#67e8f9" },
  DOCS:      { bg: "rgba(20,184,166,.15)",  fg: "#5eead4" },
  OPS:       { bg: "rgba(16,185,129,.15)",  fg: "#6ee7b7" },
  QA:        { bg: "rgba(59,130,246,.15)",  fg: "#93c5fd" },
  DATA:      { bg: "rgba(236,72,153,.15)",  fg: "#f9a8d4" },
  INFRA:     { bg: "rgba(245,158,11,.15)",  fg: "#fcd34d" },
  MAINT:     { bg: "rgba(239,68,68,.15)",   fg: "#fca5a5" },
};

type Card = { label: string; tag: keyof typeof TAGS };
const KANBAN: { name: string; dot: string; cards: Card[] }[] = [
  {
    name: "Backlog",
    dot: "rgba(255,255,255,.28)",
    cards: [
      { label: "Generate executive summary", tag: "REPORT" },
      { label: "What-if scenario analysis",  tag: "WHATIF" },
      { label: "Identify key growth areas",  tag: "STRATEGY" },
      { label: "Compile competitor data",    tag: "RESEARCH" },
    ],
  },
  {
    name: "In Progress",
    dot: C.primary,
    cards: [
      { label: "Analyze Q3 performance data",  tag: "ANALYTICS" },
      { label: "Summarize agent insights",     tag: "AI" },
      { label: "Customer documentation draft", tag: "DOCS" },
      { label: "Technical document review",    tag: "DOCS" },
    ],
  },
  {
    name: "Review",
    dot: C.violet,
    cards: [
      { label: "Review pipeline metrics",        tag: "OPS" },
      { label: "Validate model outputs",         tag: "QA" },
      { label: "Ingest & validate data sources", tag: "DATA" },
      { label: "Automate daily ops report",      tag: "OPS" },
    ],
  },
  {
    name: "Done",
    dot: C.green,
    cards: [
      { label: "Deploy agent v2",           tag: "INFRA" },
      { label: "Configure auth pipeline",   tag: "INFRA" },
      { label: "Sensor drift detection",    tag: "ANALYTICS" },
      { label: "Schedule optimization run", tag: "OPS" },
    ],
  },
];

type WOMove = { at: number; toCol: number };
type WO = { label: string; spawnCol: number; spawnAt: number; moves: WOMove[] };

const WO_LIST: WO[] = [
  { label: "OVEN_1 Peg Chain T60M2",      spawnCol: 0, spawnAt: 534,       moves: [{ at: 720, toCol: 1 }] },
  { label: "Motor T60M2 torque recovery", spawnCol: 0, spawnAt: 534 + 12,  moves: [{ at: 900, toCol: 1 }] },
  { label: "Sensor SNS-05 calibration",   spawnCol: 1, spawnAt: 534 + 24,  moves: [{ at: 840, toCol: 2 }] },
  { label: "Tank TNK-02 pressure check",  spawnCol: 1, spawnAt: 534 + 36,  moves: [] },
  { label: "Compressor COMP-02 filter",   spawnCol: 2, spawnAt: 534 + 48,  moves: [{ at: 780, toCol: 3 }] },
  { label: "Bearing replace line 02",     spawnCol: 2, spawnAt: 534 + 60,  moves: [] },
  { label: "Hydraulic pump PUMP-AX",      spawnCol: 3, spawnAt: 534 + 72,  moves: [] },
  { label: "Valve VLV-08 inspection",     spawnCol: 3, spawnAt: 534 + 84,  moves: [] },
];

const BgBlobs: React.FC = () => {
  const f = useCurrentFrame();
  const breathe = (off: number) =>
    1 + 0.06 * Math.sin(((f + off) / (60 * 8)) * Math.PI * 2);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <div style={{
        position: "absolute", left: "-10%", top: "-10%", width: 900, height: 900,
        background: "radial-gradient(circle, rgba(139,92,246,.35) 0%, transparent 60%)",
        filter: "blur(80px)",
        transform: `scale(${breathe(0)})`,
      }} />
      <div style={{
        position: "absolute", right: "-12%", bottom: "-12%", width: 1000, height: 1000,
        background: "radial-gradient(circle, rgba(99,102,241,.30) 0%, transparent 60%)",
        filter: "blur(90px)",
        transform: `scale(${breathe(120)})`,
      }} />
      <div style={{
        position: "absolute", right: "5%", top: "30%", width: 700, height: 700,
        background: "radial-gradient(circle, rgba(236,72,153,.22) 0%, transparent 60%)",
        filter: "blur(80px)",
        transform: `scale(${breathe(240)})`,
      }} />
    </AbsoluteFill>
  );
};

const Ring: React.FC = () => {
  const f = useCurrentFrame();
  const cx = W / 2, cy = H / 2;
  const r = 238;
  const circ = 2 * Math.PI * r;
  const draw = interpolate(f, [0, 72], [circ, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });
  const ringOpacity = interpolate(f, [170, 210], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  if (ringOpacity <= 0 && f < 180) return null;

  const rotate2 = (f / 60) * 60;
  const dots = Array.from({ length: 8 }).map((_, i) => {
    const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    const op = interpolate(f, [10 + i * 6, 22 + i * 6], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    return <circle key={i} cx={x} cy={y} r={4} fill={C.purple} opacity={op} />;
  });

  const orbT = (f / 60) * 0.8;
  const orbAng = orbT * Math.PI * 2;
  const orbX = cx + Math.cos(orbAng) * r;
  const orbY = cy + Math.sin(orbAng) * r;

  const swSize = interpolate(f, [180, 222], [10, 700], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const swOp = interpolate(f, [180, 222], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ filter: "drop-shadow(0 0 10px rgba(139,92,246,.7))" }}>
      <div style={{ opacity: ringOpacity, position: "absolute", inset: 0 }}>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={C.purpleSoft}
            strokeWidth={1.2}
            strokeDasharray={circ}
            strokeDashoffset={draw}
          />
          <g transform={`rotate(${rotate2} ${cx} ${cy})`}>
            <circle
              cx={cx} cy={cy} r={r + 10}
              fill="none"
              stroke="rgba(139,92,246,.7)"
              strokeWidth={1.4}
              strokeDasharray="120 1400"
            />
          </g>
          {dots}
          <circle cx={orbX} cy={orbY} r={6} fill="#a78bfa" />
        </svg>
      </div>
      {f >= 180 && f <= 230 && swOp > 0 ? (
        <div style={{
          position: "absolute",
          left: cx - swSize / 2,
          top: cy - swSize / 2,
          width: swSize,
          height: swSize,
          borderRadius: "50%",
          border: `2px solid rgba(139,92,246,${0.6 * swOp})`,
          opacity: swOp,
        }} />
      ) : null}
    </AbsoluteFill>
  );
};

const HeroCard: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < 72 || f > 215) return null;
  const local = f - 72;
  const sp = spring({ frame: local, fps, config: { damping: 14, stiffness: 120 } });
  const enterScale = interpolate(sp, [0, 1], [0, 1]);
  const enterRot = interpolate(sp, [0, 1], [-6, 0]);
  const floatY = -10 * Math.sin((f / 60) * ((2 * Math.PI) / 3.5));

  const pulse = (off: number) => {
    const t = (((f + off) / 60) % 1.8) / 1.8;
    return { scale: 1 + 0.04 * t, op: 0.4 * (1 - t) };
  };
  const p1 = pulse(0);
  const p2 = pulse(54);

  const expT = interpolate(f, [180, 210], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const expScale = 1 + expT * 1;
  const expOp = 1 - expT;
  const expRot = expT * 3;
  const totalScale = enterScale * expScale;

  // Inner glow that flares at entrance (peaks ~frame 90), then settles
  const entranceGlow = interpolate(local, [0, 18, 50, 90], [0, 1, 0.55, 0.25], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        position: "relative",
        width: 720,
        opacity: expOp,
        transform: `translateY(${floatY}px) scale(${totalScale}) rotate(${enterRot + expRot}deg)`,
      }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: 16,
          border: `1.5px solid rgba(239,68,68,${p1.op})`,
          transform: `scale(${p1.scale})`,
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", inset: 0, borderRadius: 16,
          border: `1.5px solid rgba(239,68,68,${p2.op})`,
          transform: `scale(${p2.scale})`,
          pointerEvents: "none",
        }} />
        <div style={{
          position: "relative",
          background: "rgba(255,255,255,.06)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: "1px solid rgba(255,255,255,.14)",
          borderRadius: 22,
          padding: "32px 36px",
          color: C.white,
          fontFamily: "Geist, Inter, system-ui, sans-serif",
          boxShadow: `0 0 0 1px rgba(167,139,250,${0.35 * entranceGlow}), 0 0 60px rgba(139,92,246,${0.55 * entranceGlow}), inset 0 0 80px rgba(167,139,250,${0.35 * entranceGlow}), inset 0 0 30px rgba(255,255,255,${0.08 * entranceGlow})`,
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(167,139,250,${0.28 * entranceGlow}) 0%, transparent 70%)`,
          }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, fontSize: 15, letterSpacing: 0.6, color: C.textMute }}>
            <span style={{
              width: 10, height: 10, borderRadius: "50%",
              background: C.red,
              boxShadow: `0 0 14px ${C.red}`,
            }} />
            WO-2848 · Critical
          </div>
          <div style={{ position: "relative", fontSize: 32, fontWeight: 700, marginTop: 14, lineHeight: 1.22 }}>
            OVEN_1 Peg Chain<br/>Motor T60M2<br/>torque recovery
          </div>
          <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 18, marginTop: 24 }}>
            {[
              ["Assigned",  "AriA Agent"],
              ["Location",  "Plant 1"],
              ["Due",       "Today"],
              ["Est.Cost",  "€2.4k"],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, color: C.textFaint, textTransform: "uppercase", letterSpacing: 0.7 }}>{k}</div>
                <div style={{ fontSize: 16, marginTop: 6, color: C.white, fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const _Particles: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 180 || f > 215) return null;
  const t = interpolate(f, [180, 210], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const colors = ["#818cf8", "#a78bfa", "#ec4899", "#ef4444", "#f59e0b", "#34d399"];
  const rand = (i: number, salt: number) => {
    const v = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
    return v - Math.floor(v);
  };
  return (
    <>
      {Array.from({ length: 28 }).map((_, i) => {
        const angle = rand(i, 1) * Math.PI * 2;
        const dist = 60 + rand(i, 2) * 210;
        const x = Math.cos(angle) * dist * t;
        const y = Math.sin(angle) * dist * t;
        const color = colors[i % colors.length];
        return (
          <div key={i} style={{
            position: "absolute",
            left: W / 2 + x - 4,
            top: H / 2 + y - 4,
            width: 8, height: 8, borderRadius: "50%",
            background: color,
            boxShadow: `0 0 12px ${color}`,
            transform: `scale(${1 - t})`,
            opacity: 1 - t,
          }} />
        );
      })}
    </>
  );
};

const TagPill: React.FC<{ tag: keyof typeof TAGS }> = ({ tag }) => {
  const c = TAGS[tag];
  return (
    <span style={{
      display: "inline-block",
      padding: "4px 12px",
      borderRadius: 999,
      background: c.bg,
      color: c.fg,
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: 0.5,
    }}>{tag}</span>
  );
};

const CardBody: React.FC<{
  label: string;
  tag: keyof typeof TAGS;
  glow?: number;
  compact?: boolean;
}> = ({ label, tag, glow = 0, compact = false }) => {
  const glowShadow = glow > 0
    ? `0 0 0 2px rgba(139,92,246,${0.55 * glow}), 0 0 32px rgba(139,92,246,${0.30 * glow})`
    : "none";
  return (
    <div style={{
      borderRadius: compact ? 10 : 11,
      padding: compact ? "9px 14px" : "12px 16px",
      background: "rgba(16,18,30,.92)",
      border: "1px solid rgba(255,255,255,.07)",
      color: C.white,
      fontFamily: "Geist, Inter, system-ui, sans-serif",
      boxShadow: glowShadow,
    }}>
      <TagPill tag={tag} />
      <div style={{
        fontSize: compact ? 13 : 15,
        marginTop: compact ? 6 : 8,
        lineHeight: 1.3,
        fontWeight: 500,
      }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: compact ? 6 : 8 }}>
        <span style={{
          width: compact ? 6 : 7, height: compact ? 6 : 7, borderRadius: "50%",
          background: "linear-gradient(135deg, #a78bfa, #ec4899)",
        }} />
        <span style={{ fontSize: compact ? 10 : 11, color: "rgba(255,255,255,.32)" }}>AI Agent</span>
      </div>
    </div>
  );
};

const COL_WIDTH = 440;
const COL_GAP = 28;
const BOARD_W = 4 * COL_WIDTH + 3 * COL_GAP;
const CARD_H = 96;
const BASE_CARD_H = 80;
const CARD_GAP = 10;

const colX = (i: number) => i * (COL_WIDTH + COL_GAP);

const woColAt = (wo: WO, f: number) => {
  let col = wo.spawnCol;
  for (const m of wo.moves) {
    if (f >= m.at) col = m.toCol;
  }
  return col;
};

const MOVE_DUR = 75;
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Find which column a WO is in at frame f, plus when it joined that col.
const woJoinInfo = (woIdx: number, f: number) => {
  const wo = WO_LIST[woIdx];
  if (f < wo.spawnAt) return null;
  let col = wo.spawnCol;
  let joinedAt = wo.spawnAt;
  for (const m of wo.moves) {
    if (f >= m.at) { col = m.toCol; joinedAt = m.at; }
  }
  return { col, joinedAt };
};

// Slot = number of WOs in same col that joined that col earlier.
const woStateAt = (woIdx: number, f: number) => {
  const info = woJoinInfo(woIdx, f);
  if (!info) return null;
  let slot = 0;
  for (let j = 0; j < WO_LIST.length; j++) {
    if (j === woIdx) continue;
    const oi = woJoinInfo(j, f);
    if (oi && oi.col === info.col && oi.joinedAt < info.joinedAt) slot++;
  }
  return { col: info.col, slot };
};

const ALL_KFS = (() => {
  const s = new Set<number>();
  for (const wo of WO_LIST) {
    s.add(wo.spawnAt);
    for (const m of wo.moves) s.add(m.at);
  }
  return [...s].sort((a, b) => a - b);
})();

// Distinct (col, slot) state changes for a given WO across all keyframes.
const woStateChanges = (woIdx: number) => {
  const wo = WO_LIST[woIdx];
  const out: { frame: number; state: { col: number; slot: number } }[] = [];
  let last: { col: number; slot: number } | null = null;
  for (const kf of ALL_KFS) {
    if (kf < wo.spawnAt) continue;
    const s = woStateAt(woIdx, kf);
    if (!s) continue;
    if (!last || s.col !== last.col || s.slot !== last.slot) {
      out.push({ frame: kf, state: s });
      last = s;
    }
  }
  return out;
};

// Pre-compute per WO so we don't redo it every frame.
const WO_CHANGES: ReturnType<typeof woStateChanges>[] = WO_LIST.map((_, i) => woStateChanges(i));

// Smoothly interpolated position at frame f.
const woPos = (woIdx: number, f: number) => {
  const wo = WO_LIST[woIdx];
  if (f < wo.spawnAt) return null;
  const changes = WO_CHANGES[woIdx];
  if (changes.length === 0) return null;
  let curIdx = 0;
  for (let i = 0; i < changes.length; i++) {
    if (changes[i].frame <= f) curIdx = i;
    else break;
  }
  const cur = changes[curIdx];
  if (curIdx === 0) {
    return { col: cur.state.col, slot: cur.state.slot, moveT: 1 };
  }
  const prev = changes[curIdx - 1];
  const t = Math.min(1, Math.max(0, (f - cur.frame) / MOVE_DUR));
  const e = easeInOutCubic(t);
  return {
    col: lerp(prev.state.col, cur.state.col, e),
    slot: lerp(prev.state.slot, cur.state.slot, e),
    moveT: t,
  };
};

const SPLIT_START = 990;
const SPLIT_END = 1014;
const PUNCH_START = 1014;
const SPLIT_PX = 0;

const Kanban: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < 210) return null;

  const sp = spring({ frame: f - 210, fps, config: { damping: 18, stiffness: 80 } });
  const flatT = interpolate(f, [420, 474], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const rx = (1 - flatT) * 26;
  const ry = (1 - flatT) * -8;
  const scFlat = interpolate(flatT, [0, 1], [0.85, 1]);
  const ty = (1 - sp) * 30;
  const boardOp = sp;

  // End-phase split + dim + zoom-out
  const splitT = interpolate(f, [SPLIT_START, SPLIT_END], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const dimT = interpolate(f, [SPLIT_START, SPLIT_END], [1, 0.12], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const zoomT = interpolate(f, [SPLIT_START, SPLIT_END], [1, 1.18], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", perspective: 1200 }}>
      <div style={{
        width: BOARD_W,
        opacity: boardOp * dimT,
        transformStyle: "preserve-3d",
        transform: `rotateX(${rx}deg) rotateY(${ry}deg) scale(${scFlat * zoomT}) translateY(${ty}px)`,
        position: "relative",
      }}>
        <div style={{ display: "flex", gap: COL_GAP, position: "relative" }}>
          {KANBAN.map((col, ci) => (
            <Column key={col.name} col={col} ci={ci} f={f} splitX={splitT * (ci < 2 ? -SPLIT_PX : SPLIT_PX)} />
          ))}
          {/* Vertical dividers between columns */}
          {[1, 2, 3].map((i) => {
            const x = i * COL_WIDTH + (i - 1) * COL_GAP + COL_GAP / 2;
            const drawT = interpolate(f, [240 + i * 8, 280 + i * 8], [0, 1], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
            });
            return (
              <div key={`div-${i}`} style={{
                position: "absolute",
                left: x,
                top: 0,
                bottom: 0,
                width: 1,
                background: "linear-gradient(180deg, transparent 0%, rgba(255,255,255,.18) 12%, rgba(255,255,255,.18) 88%, transparent 100%)",
                transform: `scaleY(${drawT})`,
                transformOrigin: "top center",
                pointerEvents: "none",
              }} />
            );
          })}
        </div>
        <WorkOrderLayer f={f} splitT={splitT} />
      </div>
      <Title f={f} />
      <PunchLine f={f} />
    </AbsoluteFill>
  );
};

const Column: React.FC<{ col: typeof KANBAN[0]; ci: number; f: number; splitX: number }> = ({ col, ci, f, splitX }) => {
  const { fps } = useVideoConfig();
  const start = 218 + ci * 16;
  const sp = spring({ frame: f - start, fps, config: { damping: 18, stiffness: 90 } });
  const op = interpolate(sp, [0, 1], [0, 1]);
  const ty = (1 - sp) * 20;

  return (
    <div style={{
      width: COL_WIDTH,
      opacity: op,
      transform: `translate(${splitX}px, ${ty}px)`,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 16px", marginBottom: 16,
        color: C.white, fontFamily: "Geist, Inter, system-ui, sans-serif",
        fontSize: 18, fontWeight: 600, letterSpacing: 0.4,
      }}>
        <span style={{
          width: 14, height: 14, borderRadius: "50%",
          background: col.dot,
          boxShadow:
            col.dot === C.primary || col.dot === C.violet || col.dot === C.green
              ? `0 0 12px ${col.dot}`
              : "none",
        }} />
        {col.name}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: CARD_GAP }}>
        {col.cards.map((card, idx) => {
          const cs = 218 + ci * 16 + 24 + idx * 11;
          const csp = spring({ frame: f - cs, fps, config: { damping: 18, stiffness: 100 } });
          const cop = interpolate(csp, [0, 1], [0, 1]);
          const mh = interpolate(csp, [0, 1], [0, 110]);
          return (
            <div key={idx} style={{ opacity: cop, maxHeight: mh, overflow: "hidden" }}>
              <CardBody label={card.label} tag={card.tag} compact />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const WorkOrderLayer: React.FC<{ f: number; splitT: number }> = ({ f, splitT }) => {
  const { fps } = useVideoConfig();
  const baseY = 60 + 4 * (BASE_CARD_H + CARD_GAP) + 14;
  const colShift = (col: number) => splitT * (Math.round(col) < 2 ? -SPLIT_PX : SPLIT_PX);

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      {WO_LIST.map((wo, i) => {
        if (f < wo.spawnAt) return null;
        const pos = woPos(i, f);
        if (!pos) return null;

        const x = pos.col * (COL_WIDTH + COL_GAP) + colShift(pos.col);
        const y = baseY + pos.slot * (CARD_H + CARD_GAP);

        const spawnSp = spring({ frame: f - wo.spawnAt, fps, config: { damping: 18, stiffness: 110 } });
        const spawnOp = interpolate(spawnSp, [0, 1], [0, 1]);
        const spawnTy = (1 - spawnSp) * -8;

        const sinceSpawn = f - wo.spawnAt;
        const spawnGlow =
          sinceSpawn < 48 ? 1 : Math.max(0, 1 - (sinceSpawn - 48) / 30);

        // Move glow: any active move including post-landing fade
        let moveGlow = 0;
        for (const m of wo.moves) {
          if (f >= m.at && f < m.at + MOVE_DUR) {
            moveGlow = Math.max(moveGlow, 1);
          } else if (f >= m.at + MOVE_DUR && f < m.at + MOVE_DUR + 60) {
            const t = (f - (m.at + MOVE_DUR)) / 60;
            moveGlow = Math.max(moveGlow, 1 - t);
          }
        }
        const glow = Math.max(spawnGlow, moveGlow);

        return (
          <div key={i} style={{
            position: "absolute",
            left: x,
            top: y,
            width: COL_WIDTH,
            opacity: spawnOp,
            transform: `translateY(${spawnTy}px)`,
          }}>
            <CardBody label={wo.label} tag="MAINT" glow={glow} />
          </div>
        );
      })}
    </div>
  );
};

const Title: React.FC<{ f: number }> = ({ f }) => {
  if (f < 462 || f > 1014) return null;
  const t = interpolate(f, [462, 492], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(f, [978, 1008], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const ty = (1 - t) * -8 + (1 - fadeOut) * -12;
  const op = t * fadeOut;
  const ulT = interpolate(f, [486, 522], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return (
    <div style={{
      position: "absolute",
      top: 180,
      left: 0, right: 0,
      textAlign: "center",
      color: C.white,
      fontFamily: "Geist, Inter, system-ui, sans-serif",
      fontSize: 64,
      fontWeight: 800,
      letterSpacing: -1,
      opacity: op,
      transform: `translateY(${ty}px)`,
    }}>
      And execution of{" "}
      <span style={{ position: "relative", display: "inline-block" }}>
        any type
        <span style={{
          position: "absolute",
          left: 0, bottom: -6,
          height: 6,
          width: "100%",
          background: "linear-gradient(90deg, #a78bfa, #6366f1)",
          borderRadius: 3,
          transform: `scaleX(${ulT})`,
          transformOrigin: "left center",
        }} />
      </span>
    </div>
  );
};

const PunchLine: React.FC<{ f: number }> = ({ f }) => {
  if (f < PUNCH_START - 6) return null;
  const line1 = spring({
    frame: f - PUNCH_START,
    fps: 60,
    config: { damping: 16, stiffness: 200 },
  });
  const line2 = spring({
    frame: f - (PUNCH_START + 8),
    fps: 60,
    config: { damping: 16, stiffness: 200 },
  });
  const accentT = interpolate(f, [PUNCH_START + 18, PUNCH_START + 44], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "none",
      fontFamily: "Geist, Inter, system-ui, sans-serif",
      color: C.white,
      textAlign: "center",
    }}>
      <div style={{
        fontSize: 64,
        fontWeight: 600,
        letterSpacing: -1.2,
        opacity: line1,
        transform: `translateY(${(1 - line1) * 18}px)`,
        marginBottom: 14,
      }}>
        From <span style={{ fontWeight: 800 }}>Work Orders</span>
      </div>
      <div style={{
        fontSize: 64,
        fontWeight: 600,
        letterSpacing: -1.2,
        opacity: line2,
        transform: `translateY(${(1 - line2) * 18}px)`,
      }}>
        to{" "}
        <span style={{ position: "relative", display: "inline-block", fontWeight: 800 }}>
          <span style={{
            background: "linear-gradient(90deg, #a78bfa 0%, #6366f1 50%, #ec4899 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Business Process Optimization
          </span>
          <span style={{
            position: "absolute",
            left: 0, bottom: -8,
            height: 4,
            width: "100%",
            background: "linear-gradient(90deg, #a78bfa, #6366f1, #ec4899)",
            borderRadius: 2,
            transform: `scaleX(${accentT})`,
            transformOrigin: "left center",
            opacity: 0.85,
          }} />
        </span>
      </div>
    </div>
  );
};

const Badge: React.FC<{ f: number }> = ({ f }) => {
  if (f < 210) return null;
  const op = interpolate(f, [210, 240], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const count = WO_LIST.filter((wo) => f >= wo.spawnAt).length;
  const pulseT = ((f / 60) % 1.6) / 1.6;
  return (
    <div style={{
      position: "absolute",
      bottom: 60,
      left: 0, right: 0,
      display: "flex",
      justifyContent: "center",
      opacity: op,
    }}>
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 20px",
        borderRadius: 999,
        background: "rgba(255,255,255,.06)",
        border: "1px solid rgba(255,255,255,.12)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        color: C.white,
        fontFamily: "Geist, Inter, system-ui, sans-serif",
        fontSize: 14,
        fontWeight: 500,
      }}>
        <span style={{
          width: 10, height: 10, borderRadius: "50%",
          background: "linear-gradient(135deg, #a78bfa, #ec4899)",
          boxShadow: `0 0 ${8 + 8 * pulseT}px rgba(167,139,250,${0.6 - 0.4 * pulseT})`,
        }} />
        AriA generated <strong style={{ fontWeight: 700 }}>{count}</strong> tasks autonomously
      </div>
    </div>
  );
};

export const AutonomousFlowComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <BgBlobs />
      <Ring />
      <HeroCard />
      <Kanban />
    </AbsoluteFill>
  );
};
