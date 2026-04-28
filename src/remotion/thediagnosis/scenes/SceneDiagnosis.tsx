import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  BLUE,
  GREEN,
  ORANGE,
  RED,
  WHITE,
  interFont,
} from "../constants";

// ─── Phase timeline ──────────────────────────────────────────────────────────
const T_STAGE_IN     = 2;
const T_HEADER       = 10;
const T_ERRORCARD    = 22;

// Phase 1: Analyzing
const T_ANALYZING_IN = 38;
const T_PHASE1_END   = 92;

// Phase 2: Issue Found
const T_STATUS2      = 96;
const T_ROOTCAUSE    = 108;
const T_DESC_START   = 118;
const T_PHASE2_END   = 234;

// Phase 3: Solution Ready
const T_STATUS3      = 238;
const T_REPAIR_TITLE = 252;
const T_STEP_START   = 268;
const T_STEP_STAGGER = 16;
const T_ALL_COMPLETE = T_STEP_START + 5 * T_STEP_STAGGER + 24;

// ─── Palette (Light-mode liquid glass) ───────────────────────────────────────
const BG_BASE   = "#eef2f7";
const INK       = "#0e1a2a";
const GLASS_HI  = "rgba(255,255,255,0.75)";
const GLASS_LO  = "rgba(255,255,255,0.35)";
const STROKE_HI = "rgba(255,255,255,0.9)";
const STROKE_LO = "rgba(14,26,42,0.08)";
const MUTED     = "rgba(14,26,42,0.62)";
const DIM       = "rgba(14,26,42,0.32)";

// ─── Monochromatic glass background (no color gradients) ─────────────────────
const MeshBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const wave = (f: number, a: number, b: number, phase = 0) =>
    a + ((Math.sin(t * f + phase) + 1) / 2) * (b - a);

  return (
    <>
      <AbsoluteFill style={{
        background:
          "radial-gradient(ellipse at center, #ffffff 0%, #e6ecf3 60%, #d5dee8 100%)",
      }} />
      {/* soft pastel clouds (blue + amber) for refraction richness on light bg */}
      <div style={{
        position: "absolute",
        width: 1400, height: 1400,
        left: wave(0.15, -350, 150, 0),
        top:  wave(0.12, -250, 250, 0),
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(10,132,255,0.18) 0%, rgba(10,132,255,0) 60%)",
        filter: "blur(50px)",
      }}/>
      <div style={{
        position: "absolute",
        width: 1100, height: 1100,
        right: wave(0.11, -200, 250, 1.3),
        top:   wave(0.14,   50, 500, 0.6),
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,179,64,0.14) 0%, rgba(255,179,64,0) 60%)",
        filter: "blur(50px)",
      }}/>
      <div style={{
        position: "absolute",
        width: 1200, height: 1200,
        left:   wave(0.09,  250,  700, 2.1),
        bottom: wave(0.13, -250,  150, 1.7),
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(74,222,128,0.12) 0%, rgba(74,222,128,0) 60%)",
        filter: "blur(50px)",
      }}/>
      <div style={{
        position: "absolute",
        width: 800, height: 800,
        right: wave(0.16,  400, 750, 2.5),
        bottom: wave(0.10,  80, 400, 0.4),
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(96,165,250,0.15) 0%, rgba(96,165,250,0) 60%)",
        filter: "blur(50px)",
      }}/>
      {/* light edge vignette */}
      <AbsoluteFill style={{ background:
        "radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(14,26,42,0.12) 100%)" }} />
    </>
  );
};

// ─── Glass style helpers ─────────────────────────────────────────────────────
type GlassOpts = {
  blur?: number;
  sat?: number;
  tint?: number;
  stroke?: number;
  radius?: number;
  shadow?: boolean;
};
const glass = (o: GlassOpts = {}): React.CSSProperties => {
  const blur = o.blur ?? 38;
  const sat = o.sat ?? 180;
  const tint = o.tint ?? 0.10;
  const stroke = o.stroke ?? 0.65;
  const radius = o.radius ?? 28;
  return {
    backdropFilter: `blur(${blur}px) saturate(${sat}%)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(${sat}%)`,
    background:
      `linear-gradient(135deg, rgba(255,255,255,${Math.min(1, tint * 4 + 0.25)}) 0%, rgba(255,255,255,${Math.min(1, tint * 2 + 0.10)}) 100%)`,
    border: `1px solid rgba(255,255,255,${stroke})`,
    borderRadius: radius,
    boxShadow: o.shadow === false ? undefined :
      [
        "inset 0 1px 0 0 rgba(255,255,255,0.9)",
        "inset 0 -1px 0 0 rgba(14,26,42,0.08)",
        "0 24px 60px rgba(30,55,90,0.18)",
        "0 6px 18px rgba(30,55,90,0.12)",
      ].join(", "),
  };
};

// Adds a specular highlight line on top of a glass surface
const SpecularHighlight: React.FC<{ radius?: number }> = ({ radius = 28 }) => (
  <div style={{
    position: "absolute",
    top: 0, left: "10%", right: "10%",
    height: 1,
    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
    borderRadius: radius,
    pointerEvents: "none",
  }}/>
);

// ─── Icons ───────────────────────────────────────────────────────────────────
const AriaGlyph: React.FC<{ size?: number }> = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx={24} cy={24} r={7} fill="#60A5FA" />
    {Array.from({ length: 8 }).map((_, i) => {
      const a = (i * Math.PI) / 4;
      const x1 = 24 + Math.cos(a) * 12;
      const y1 = 24 + Math.sin(a) * 12;
      const x2 = 24 + Math.cos(a) * 19;
      const y2 = 24 + Math.sin(a) * 19;
      return (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#60A5FA" strokeWidth={3} strokeLinecap="round" />
      );
    })}
  </svg>
);

const WarnGlyph: React.FC<{ size?: number }> = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <path d="M32 8 L58 54 L6 54 Z"
      fill="rgba(255,159,10,0.1)"
      stroke="#FF9F0A" strokeWidth={3.5} strokeLinejoin="round"/>
    <line x1={32} y1={24} x2={32} y2={40}
      stroke="#FF9F0A" strokeWidth={4} strokeLinecap="round" />
    <circle cx={32} cy={47} r={2.6} fill="#FF9F0A" />
  </svg>
);

const CheckGlyph: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx={24} cy={24} r={22} fill="#34D158" />
    <circle cx={24} cy={24} r={22} fill="none"
      stroke="rgba(255,255,255,0.35)" strokeWidth={1.5}/>
    <path d="M14 24 L21 31 L34 18"
      stroke="#FFFFFF" strokeWidth={3.6}
      strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

// ─── Status pill ─────────────────────────────────────────────────────────────
const StatusPill: React.FC<{
  label: string;
  accent: string;
  opacity: number;
}> = ({ label, accent, opacity }) => (
  <div style={{
    ...glass({ blur: 28, sat: 170, tint: 0.14, radius: 999 }),
    padding: "14px 32px",
    display: "flex",
    alignItems: "center",
    gap: 14,
    opacity,
    position: "relative",
    overflow: "hidden",
  }}>
    <div style={{
      width: 14, height: 14, borderRadius: "50%",
      background: accent,
      boxShadow: `0 0 14px ${accent}`,
    }}/>
    <div style={{
      fontSize: 30, fontWeight: 700, letterSpacing: -0.3,
      color: accent,
      textShadow: `0 0 24px ${accent}80`,
    }}>{label}</div>
    <SpecularHighlight radius={999} />
  </div>
);

// ─── Error card ──────────────────────────────────────────────────────────────
const ErrorCard: React.FC<{ opacity: number; y: number }> = ({ opacity, y }) => (
  <div style={{
    ...glass({ blur: 30, sat: 170, tint: 0.09, radius: 28 }),
    marginTop: 36,
    padding: "24px 32px",
    display: "flex",
    alignItems: "center",
    gap: 24,
    opacity,
    transform: `translateY(${y}px)`,
    position: "relative",
    overflow: "hidden",
  }}>
    <div style={{
      width: 76, height: 76, borderRadius: 22,
      ...glass({ blur: 18, tint: 0.08, radius: 22, shadow: false }),
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <WarnGlyph size={48} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -0.6, color: INK }}>
        Error Code: <span style={{ color: "#E08400", fontWeight: 800 }}>FMO1201</span>
      </div>
      <div style={{ fontSize: 26, color: MUTED, marginTop: 4, fontWeight: 500 }}>
        Motor Torque Limit Reached
      </div>
    </div>
    <SpecularHighlight radius={28} />
  </div>
);

// ─── Phase 1: Analyzing orb ──────────────────────────────────────────────────
const AnalyzingOrb: React.FC<{ opacity: number; frame: number }> = ({ opacity, frame }) => {
  const spin = (frame * 4) % 360;
  const pulse = 1 + 0.04 * Math.sin((frame / 8));
  return (
    <div style={{
      marginTop: 70,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      opacity,
    }}>
      <div style={{
        position: "relative",
        width: 220, height: 220,
        transform: `scale(${pulse})`,
      }}>
        {/* soft glow under orb */}
        <div style={{
          position: "absolute", inset: -50,
          background: "radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 70%)",
          filter: "blur(20px)",
        }}/>
        {/* glass orb */}
        <div style={{
          ...glass({ blur: 28, sat: 180, tint: 0.14, radius: 999 }),
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}>
          <AriaGlyph size={92} />
          <SpecularHighlight radius={999} />
        </div>
        {/* spinning outer ring */}
        <svg width={260} height={260} viewBox="0 0 260 260"
          style={{ position: "absolute", left: -20, top: -20, transform: `rotate(${spin}deg)` }}>
          <defs>
            <linearGradient id="spinG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="rgba(255,255,255,0.0)" />
              <stop offset="1" stopColor="rgba(255,255,255,0.9)" />
            </linearGradient>
          </defs>
          <circle cx={130} cy={130} r={122}
            fill="none" stroke="url(#spinG)" strokeWidth={4}
            strokeDasharray="220 600" strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ marginTop: 36, fontSize: 32, fontWeight: 500,
        color: "rgba(14,26,42,0.78)", letterSpacing: -0.2 }}>
        AriA is analyzing<span style={{ opacity: 0.4 }}>...</span>
      </div>
    </div>
  );
};

// ─── Phase 2: Root cause card ────────────────────────────────────────────────
const RootCauseCard: React.FC<{
  opacity: number;
  y: number;
  revealFrame: number;
  descStart: number;
}> = ({ opacity, y, revealFrame, descStart }) => {
  const PARAGRAPH =
    "The retractable unit motor has exceeded the maximum permitted torque value, likely due to a mechanical blockage, excessive friction, or an abnormal load. Both automatic and manual operation of the motor are inhibited.";
  const words = PARAGRAPH.split(" ");
  const perWord = 1.1;
  const progress = Math.max(0, revealFrame - descStart);
  const wordsShown = Math.min(words.length, Math.floor(progress / perWord));

  return (
    <div style={{
      ...glass({ blur: 34, sat: 180, tint: 0.09, radius: 32 }),
      marginTop: 40,
      padding: "34px 40px",
      opacity,
      transform: `translateY(${y}px)`,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* label chip */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        padding: "8px 16px",
        ...glass({ blur: 18, tint: 0.10, radius: 999, shadow: false }),
      }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF9F0A",
          boxShadow: "0 0 10px #FF9F0A" }}/>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#C46800",
          letterSpacing: 0.6, textTransform: "uppercase" }}>
          Root Cause Identified
        </div>
      </div>
      <div style={{
        marginTop: 22,
        fontSize: 30, fontWeight: 500,
        color: "rgba(14,26,42,0.9)",
        lineHeight: 1.45,
        maxWidth: 1500,
        minHeight: 180,
        letterSpacing: -0.3,
      }}>
        {words.slice(0, wordsShown).join(" ")}
      </div>
      <SpecularHighlight radius={32} />
    </div>
  );
};

// ─── Phase 3: Repair steps ───────────────────────────────────────────────────
const REPAIR_STEPS = [
  "Inspect the guides, slides, screws, chains and belts",
  "Check that no mechanical end stop has been reached",
  "Verify lubrication and condition of the moving parts",
  "Verify drive parameters (torque, current, acceleration)",
  "Reset the fault and perform a low-speed manual test",
];

const StepCard: React.FC<{
  index: number;
  label: string;
  frame: number;
  fps: number;
  appearFrame: number;
  completed: boolean;
  active: boolean;
}> = ({ index, label, frame, fps, appearFrame, completed, active }) => {
  const s = spring({ frame: frame - appearFrame, fps,
    config: { damping: 180, stiffness: 120, mass: 0.7 } });
  const y = interpolate(s, [0, 1], [18, 0]);
  return (
    <div style={{
      ...glass({
        blur: 26, sat: 170,
        tint: active ? 0.14 : completed ? 0.11 : 0.07,
        radius: 22,
      }),
      padding: "18px 26px",
      display: "flex",
      alignItems: "center",
      gap: 22,
      opacity: s,
      transform: `translateY(${y}px)`,
      border: active
        ? "1px solid rgba(10,132,255,0.55)"
        : completed
        ? "1px solid rgba(52,209,88,0.35)"
        : "1px solid rgba(255,255,255,0.12)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* index / check badge */}
      <div style={{
        width: 52, height: 52, borderRadius: 999,
        flexShrink: 0,
        ...glass({ blur: 14, tint: completed ? 0.20 : active ? 0.18 : 0.08, radius: 999, shadow: false }),
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {completed ? (
          <CheckGlyph size={36} />
        ) : (
          <span style={{
            fontSize: 22, fontWeight: 700,
            color: active ? "#0A84FF" : "rgba(14,26,42,0.5)",
          }}>{index + 1}</span>
        )}
      </div>
      {/* label */}
      <div style={{
        flex: 1,
        fontSize: 26, fontWeight: 600,
        letterSpacing: -0.2,
        color: completed || active ? INK : "rgba(14,26,42,0.55)",
      }}>
        {label}
      </div>
      {/* chevron for active */}
      {active && (
        <div style={{ fontSize: 30, color: "#0A84FF" }}>›</div>
      )}
      <SpecularHighlight radius={22} />
    </div>
  );
};

const RepairStepsSection: React.FC<{
  titleOpacity: number;
  titleY: number;
  frame: number;
  fps: number;
}> = ({ titleOpacity, titleY, frame, fps }) => {
  const allComplete = frame >= T_ALL_COMPLETE;
  return (
    <div style={{ marginTop: 34 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        opacity: titleOpacity,
        transform: `translateY(${titleY}px)`,
        marginBottom: 18,
      }}>
        <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.3, color: INK }}>
          Repair Steps
        </div>
        <div style={{
          padding: "4px 12px",
          ...glass({ blur: 14, tint: 0.10, radius: 999, shadow: false }),
          fontSize: 18, color: MUTED, fontWeight: 600,
        }}>
          {REPAIR_STEPS.length} actions
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {REPAIR_STEPS.map((label, i) => {
          const appearFrame = T_STEP_START + i * T_STEP_STAGGER;
          const appeared = frame >= appearFrame;
          const myCompletionFrame = T_ALL_COMPLETE + i * 7;
          const completed = i === 0 ? true : allComplete && frame >= myCompletionFrame;
          const active = !allComplete && i === 1 && appeared;
          return (
            <StepCard
              key={i}
              index={i}
              label={label}
              frame={frame}
              fps={fps}
              appearFrame={appearFrame}
              completed={completed}
              active={active}
            />
          );
        })}
      </div>
    </div>
  );
};

// ─── Main scene ──────────────────────────────────────────────────────────────
export const SceneDiagnosis: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Stage entry
  const stageIn = spring({ frame: frame - T_STAGE_IN, fps,
    config: { damping: 200, stiffness: 85, mass: 0.95 } });

  // Gentle floating
  const floatY = Math.sin((frame / fps) * 0.6) * 3;

  const headerIn = spring({ frame: frame - T_HEADER, fps,
    config: { damping: 180, stiffness: 120, mass: 0.7 } });

  const errorIn = spring({ frame: frame - T_ERRORCARD, fps,
    config: { damping: 180, stiffness: 120, mass: 0.7 } });
  const errorY = interpolate(errorIn, [0, 1], [18, 0]);

  // status crossfades
  const s1In  = spring({ frame: frame - T_HEADER,  fps,
    config: { damping: 200, stiffness: 120, mass: 0.7 } });
  const s1Out = spring({ frame: frame - T_STATUS2, fps,
    config: { damping: 200, stiffness: 160, mass: 0.4 } });
  const s2In  = spring({ frame: frame - T_STATUS2, fps,
    config: { damping: 200, stiffness: 120, mass: 0.7 } });
  const s2Out = spring({ frame: frame - T_STATUS3, fps,
    config: { damping: 200, stiffness: 160, mass: 0.4 } });
  const s3In  = spring({ frame: frame - T_STATUS3, fps,
    config: { damping: 200, stiffness: 120, mass: 0.7 } });

  const s1Opacity = s1In * (1 - s1Out);
  const s2Opacity = s2In * (1 - s2Out);
  const s3Opacity = s3In;

  // analyzing lifecycle
  const anIn  = spring({ frame: frame - T_ANALYZING_IN, fps,
    config: { damping: 200, stiffness: 120, mass: 0.7 } });
  const anOut = spring({ frame: frame - T_PHASE1_END, fps,
    config: { damping: 200, stiffness: 160, mass: 0.4 } });
  const anOpacity = anIn * (1 - anOut);

  // root cause lifecycle
  const rcIn  = spring({ frame: frame - T_ROOTCAUSE, fps,
    config: { damping: 180, stiffness: 120, mass: 0.7 } });
  const rcOut = spring({ frame: frame - T_PHASE2_END, fps,
    config: { damping: 200, stiffness: 160, mass: 0.4 } });
  const rcOpacity = rcIn * (1 - rcOut);
  const rcY = interpolate(rcIn, [0, 1], [14, 0]);

  // phase 3 title
  const p3In = spring({ frame: frame - T_REPAIR_TITLE, fps,
    config: { damping: 200, stiffness: 120, mass: 0.7 } });
  const p3Y = interpolate(p3In, [0, 1], [14, 0]);

  // pick status label/color
  const statusLabel =
    s3Opacity > 0.5 ? "Solution Ready" : s2Opacity > 0.5 ? "Issue Found" : "Analyzing";
  const statusColor =
    s3Opacity > 0.5 ? "#16A34A" : s2Opacity > 0.5 ? "#D97706" : "#0A84FF";

  return (
    <AbsoluteFill style={{ fontFamily: interFont }}>
      <MeshBackground />

      {/* ───── Full-screen glass stage ───── */}
      <AbsoluteFill style={{
        display: "flex",
        alignItems: "stretch",
        justifyContent: "stretch",
      }}>
        <div style={{
          backdropFilter: "blur(44px) saturate(180%)",
          WebkitBackdropFilter: "blur(44px) saturate(180%)",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 100%)",
          borderTop: "1px solid rgba(255,255,255,0.22)",
          width: "100%",
          height: "100%",
          padding: "72px 96px",
          opacity: stageIn,
          transform: `scale(${interpolate(stageIn, [0, 1], [0.995, 1])})`,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>
          {/* specular highlights on main stage */}
          <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)",
            pointerEvents: "none",
          }}/>

          {/* ─── Header ─── */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            opacity: headerIn,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{
                ...glass({ blur: 20, tint: 0.14, radius: 22, shadow: false }),
                width: 82, height: 82,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", overflow: "hidden",
              }}>
                <AriaGlyph size={46} />
                <SpecularHighlight radius={22} />
              </div>
              <div>
                <div style={{ fontSize: 48, fontWeight: 700,
                  letterSpacing: -1, color: INK, lineHeight: 1 }}>
                  Smart Diagnostics
                </div>
                <div style={{ fontSize: 20, color: MUTED, marginTop: 6, fontWeight: 500 }}>
                  Real-time machine health monitoring
                </div>
              </div>
            </div>
            <StatusPill
              label={statusLabel}
              accent={statusColor}
              opacity={Math.max(s1Opacity, s2Opacity, s3Opacity)}
            />
          </div>

          {/* Error card (phase 1 + 2) */}
          {frame < T_REPAIR_TITLE && (
            <ErrorCard opacity={errorIn} y={errorY} />
          )}

          {/* Phase 1 */}
          {frame < T_PHASE1_END + 24 && (
            <AnalyzingOrb opacity={anOpacity} frame={frame} />
          )}

          {/* Phase 2 */}
          {frame >= T_ROOTCAUSE - 8 && frame < T_PHASE2_END + 24 && (
            <RootCauseCard
              opacity={rcOpacity}
              y={rcY}
              revealFrame={frame}
              descStart={T_DESC_START}
            />
          )}

          {/* Phase 3 */}
          {frame >= T_REPAIR_TITLE - 6 && (
            <RepairStepsSection
              titleOpacity={p3In}
              titleY={p3Y}
              frame={frame}
              fps={fps}
            />
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
