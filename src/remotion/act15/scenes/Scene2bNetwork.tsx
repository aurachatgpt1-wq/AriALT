import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { interFont } from "../constants";

const DESKTOP_BG = "#F0F0F0";
const CX = 960;
const CY = 390;
const RADIUS = 260;

// Industrial nodes around the center
const INDUSTRIAL_NODES = [
  { id: "mot",      label: "MOT-401",           icon: "⚙️",  angle: 0   },
  { id: "history",  label: "Maintenance History",icon: "📋",  angle: 60  },
  { id: "team",     label: "Team & Schedule",    icon: "👷",  angle: 120 },
  { id: "iso",      label: "ISO Procedures",     icon: "📐",  angle: 180 },
  { id: "parts",    label: "Spare Parts",        icon: "🔧",  angle: 240 },
  { id: "sensors",  label: "Live Sensors",       icon: "📡",  angle: 300 },
];

// ChatGPT node — outside, to the right
const GPT_X = 1660;
const GPT_Y = CY;

function toRad(deg: number) { return (deg * Math.PI) / 180; }
function nodePos(angle: number) {
  return {
    x: CX + RADIUS * Math.cos(toRad(angle)),
    y: CY + RADIUS * Math.sin(toRad(angle)),
  };
}

// Draw a line progressively using SVG stroke-dashoffset
const AnimatedLine: React.FC<{
  x1: number; y1: number; x2: number; y2: number;
  progress: number;
  color?: string;
  dashed?: boolean;
  opacity?: number;
  strokeWidth?: number;
}> = ({ x1, y1, x2, y2, progress, color = "#1D1D1F", dashed = false, opacity = 1, strokeWidth = 1.5 }) => {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const offset = len * (1 - progress);
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeDasharray={dashed ? `${len * 0.06} ${len * 0.06}` : `${len}`}
      strokeDashoffset={dashed ? 0 : offset}
      opacity={opacity}
      strokeLinecap="round"
    />
  );
};

// Node circle component
const NodeCircle: React.FC<{
  x: number; y: number;
  icon: string; label: string;
  progress: number;
  size?: number;
  bgColor?: string;
  textColor?: string;
}> = ({ x, y, icon, label, progress, size = 52, bgColor = "#1D1D1F", textColor = "#FFFFFF" }) => {
  const scale = interpolate(progress, [0, 1], [0.3, 1]);
  const opacity = interpolate(progress, [0, 0.4], [0, 1]);
  return (
    <g transform={`translate(${x}, ${y})`} opacity={opacity}>
      <g transform={`scale(${scale})`}>
        <circle r={size} fill={bgColor} />
        <text textAnchor="middle" dominantBaseline="central" fontSize={22}>{icon}</text>
      </g>
      <text
        y={size + 18}
        textAnchor="middle"
        fontSize={13}
        fontWeight={500}
        fill="#4B4B4B"
        fontFamily={interFont}
        opacity={interpolate(progress, [0.6, 1], [0, 1])}
      >
        {label}
      </text>
    </g>
  );
};

export const Scene2bNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sp = (f: number, cfg = { damping: 18, stiffness: 180, mass: 0.6 }) =>
    spring({ frame: frame - f, fps, config: cfg });

  // Center node
  const centerP = sp(5);

  // Industrial nodes appear staggered
  const nodeProgress = INDUSTRIAL_NODES.map((n, i) => sp(18 + i * 10));

  // Lines between center and each industrial node
  const lineProgress = INDUSTRIAL_NODES.map((n, i) => sp(22 + i * 10));

  // Cross-connections between adjacent nodes (ring)
  const ringProgress = INDUSTRIAL_NODES.map((n, i) => sp(80 + i * 6));

  // ChatGPT node appears
  const gptP = sp(105);

  // Failed connection line from ChatGPT toward center
  // Extends 55% of the way then fades
  const gptLineFrame = Math.max(0, frame - 118);
  const gptLineExtend = interpolate(gptLineFrame, [0, 20], [0, 0.55], { extrapolateRight: "clamp" });
  const gptLineFade   = interpolate(gptLineFrame, [22, 38], [1, 0], { extrapolateRight: "clamp" });
  const gptLineRetry  = interpolate(Math.max(0, frame - 142), [0, 18], [0, 0.4], { extrapolateRight: "clamp" });
  const gptLineFade2  = interpolate(Math.max(0, frame - 155), [0, 14], [1, 0], { extrapolateRight: "clamp" });

  // Pulse ring on industrial cluster (after gpt fails)
  const pulseP = interpolate(Math.max(0, frame - 160), [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // Narration fade
  const narr1Op = interpolate(frame, [8, 22], [0, 1], { extrapolateRight: "clamp" });
  const narr2Op = interpolate(frame, [110, 124], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: DESKTOP_BG }}>
      <svg width={1920} height={860} style={{ position: "absolute", top: 0, left: 0 }}>

        {/* ── Industrial ring connections ── */}
        {INDUSTRIAL_NODES.map((n, i) => {
          const next = INDUSTRIAL_NODES[(i + 1) % INDUSTRIAL_NODES.length];
          const a = nodePos(n.angle);
          const b = nodePos(next.angle);
          return (
            <AnimatedLine
              key={`ring-${i}`}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              progress={ringProgress[i]}
              color="#9CA3AF"
              strokeWidth={1}
              opacity={0.5}
            />
          );
        })}

        {/* ── Lines: center → each industrial node ── */}
        {INDUSTRIAL_NODES.map((n, i) => {
          const pos = nodePos(n.angle);
          return (
            <AnimatedLine
              key={`line-${i}`}
              x1={CX} y1={CY} x2={pos.x} y2={pos.y}
              progress={lineProgress[i]}
              color="#1D1D1F"
              strokeWidth={1.5}
            />
          );
        })}

        {/* ── Failed ChatGPT connection (attempt 1) ── */}
        {gptLineExtend > 0 && (
          <AnimatedLine
            x1={GPT_X} y1={GPT_Y}
            x2={GPT_X + (CX - GPT_X) * gptLineExtend}
            y2={GPT_Y + (CY - GPT_Y) * gptLineExtend}
            progress={1}
            color="#DC2626"
            dashed
            strokeWidth={2}
            opacity={gptLineFade}
          />
        )}

        {/* ── Failed ChatGPT connection (attempt 2, shorter) ── */}
        {gptLineRetry > 0 && (
          <AnimatedLine
            x1={GPT_X} y1={GPT_Y}
            x2={GPT_X + (CX - GPT_X) * gptLineRetry}
            y2={GPT_Y + (CY - GPT_Y) * gptLineRetry}
            progress={1}
            color="#DC2626"
            dashed
            strokeWidth={2}
            opacity={gptLineFade2}
          />
        )}

        {/* ── Center node ── */}
        <NodeCircle
          x={CX} y={CY}
          icon="🏭" label="Your Plant"
          progress={centerP}
          size={62}
          bgColor="#1D1D1F"
        />

        {/* ── Industrial nodes ── */}
        {INDUSTRIAL_NODES.map((n, i) => {
          const pos = nodePos(n.angle);
          return (
            <NodeCircle
              key={n.id}
              x={pos.x} y={pos.y}
              icon={n.icon} label={n.label}
              progress={nodeProgress[i]}
              size={44}
              bgColor="#374151"
            />
          );
        })}

        {/* ── ChatGPT node ── */}
        {frame >= 105 && (
          <NodeCircle
            x={GPT_X} y={GPT_Y}
            icon="🤖" label="Generic AI"
            progress={gptP}
            size={44}
            bgColor="#10A37F"
            textColor="#FFFFFF"
          />
        )}

        {/* ── Pulse: industrial cluster glows after rejection ── */}
        {pulseP > 0 && (
          <circle
            cx={CX} cy={CY} r={RADIUS + 30}
            fill="none"
            stroke="#1D1D1F"
            strokeWidth={2}
            opacity={interpolate(pulseP, [0, 0.5, 1], [0, 0.3, 0])}
          />
        )}
      </svg>

      {/* ── Narration ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 220,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 10,
      }}>
        <div style={{
          fontFamily: interFont, fontSize: 42, fontWeight: 700,
          color: "#1D1D1F", letterSpacing: "-0.02em",
          opacity: narr1Op, transform: `translateY(${interpolate(narr1Op, [0,1], [14,0])}px)`,
        }}>
          Your plant is a world of its own.
        </div>
        <div style={{
          fontFamily: interFont, fontSize: 36, fontWeight: 500,
          color: "#6B7280", letterSpacing: "-0.01em",
          opacity: narr2Op, transform: `translateY(${interpolate(narr2Op, [0,1], [14,0])}px)`,
        }}>
          Generic AI has never been here.
        </div>
      </div>
    </AbsoluteFill>
  );
};
