import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { interFont } from "./constants";

// ─── Timing ────────────────────────────────────────────────────────────────
const P_MSG      = 12;
const P_ARIA     = 60;

const STEPS = [
  { text: "Checking M-401 maintenance history",   detail: "Last service: 14 months ago",       showAt: 100, doneAt: 128 },
  { text: "Identifying fault pattern",             detail: "Bearing degradation confirmed",      showAt: 148, doneAt: 176 },
  { text: "Checking parts inventory",              detail: "SKF 6208 bearing kit in stock",      showAt: 196, doneAt: 224 },
  { text: "Locating available technician",         detail: "Marco R. — available now, Zone 3",   showAt: 244, doneAt: 272 },
];

const ACTIONS = [
  { label: "Work order WO-2024-1284 created",  detail: "High priority · Corrective maintenance",   showAt: 320, color: "#3B5BDB" },
  { label: "Marco R. notified",                detail: "M-401 bearing replacement — Zone 3",         showAt: 375, color: "#059669" },
  { label: "Bearing kit SKF 6208 reserved",    detail: "Warehouse A · Shelf 12 · Ready for pickup", showAt: 430, color: "#059669" },
];

const P_RESULT   = 490;
const P_METRIC   = 520;

// ─── Small CSS AriA Orb ─────────────────────────────────────────────────────
const AriAOrb: React.FC<{ size: number; frame: number; fps: number }> = ({ size, frame, fps }) => {
  const spin  = (frame / fps) * 80;
  const pulse = 0.5 + 0.5 * Math.sin((frame / fps) * 1.8);
  const glowR = size * (1.1 + pulse * 0.08);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{
        position: "absolute",
        width: glowR * 2, height: glowR * 2, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,91,219,0.22) 0%, transparent 65%)",
        left: "50%", top: "50%", transform: "translate(-50%, -50%)",
        filter: "blur(10px)",
      }} />
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: `conic-gradient(from ${spin}deg, #2B4BCA, #3B5BDB, #6B8EFF, #A5B8FF, #7C6FE8, #3B5BDB, #2B4BCA)`,
        boxShadow: `0 0 ${size * 0.5}px rgba(59,91,219,0.5)`,
      }} />
      <div style={{
        position: "absolute",
        width: size * 0.42, height: size * 0.30, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.28) 0%, transparent 75%)",
        top: size * 0.10, left: size * 0.14,
      }} />
    </div>
  );
};

// ─── Step Item ───────────────────────────────────────────────────────────────
const StepItem: React.FC<{
  num: number;
  text: string;
  detail: string;
  frame: number;
  fps: number;
  showAt: number;
  doneAt: number;
}> = ({ num, text, detail, frame, fps, showAt, doneAt }) => {
  const isDone   = frame >= doneAt;
  const isActive = frame >= showAt && !isDone;

  const t      = spring({ frame: frame - showAt, fps, config: { stiffness: 300, damping: 26 } });
  const doneT  = spring({ frame: frame - doneAt, fps, config: { stiffness: 260, damping: 24 } });
  const detailT = spring({ frame: frame - (doneAt + 4), fps, config: { stiffness: 240, damping: 26 } });

  if (frame < showAt && t === 0) return null;

  const pulse = 0.5 + 0.5 * Math.sin((frame / fps) * 4);

  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 20,
      marginBottom: 28,
      opacity: interpolate(t, [0, 1], [0, 1]),
      transform: `translateY(${interpolate(t, [0, 1], [16, 0])}px)`,
    }}>
      {/* Circle indicator */}
      <div style={{
        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        backgroundColor: isDone
          ? "#059669"
          : isActive
            ? `rgba(59,91,219,${0.08 + pulse * 0.06})`
            : "rgba(209,213,219,0.5)",
        border: isDone
          ? "none"
          : isActive
            ? `2px solid rgba(59,91,219,${0.4 + pulse * 0.3})`
            : "2px solid #D1D5DB",
        transition: "background-color 0.2s",
        transform: isDone ? `scale(${interpolate(doneT, [0, 1], [0.7, 1])})` : "scale(1)",
      }}>
        {isDone ? (
          <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
            <polyline points="1,5.5 5,9.5 13,1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <span style={{
            fontFamily: interFont, fontSize: 14, fontWeight: 700,
            color: isActive ? "#3B5BDB" : "#9CA3AF",
          }}>{num}</span>
        )}
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: interFont, fontSize: 26, fontWeight: isDone ? 500 : 600,
          color: isDone ? "#6B7280" : "#1D1D1F",
          letterSpacing: "-0.02em", lineHeight: 1.3,
          textDecoration: isDone ? "line-through" : "none",
          textDecorationColor: "rgba(107,114,128,0.4)",
        }}>
          {text}
          {isActive && (
            <span style={{
              display: "inline-block",
              width: 3, height: 20,
              backgroundColor: "#3B5BDB",
              marginLeft: 6,
              verticalAlign: "middle",
              opacity: pulse,
            }} />
          )}
        </div>
        {isDone && (
          <div style={{
            fontFamily: interFont, fontSize: 18, fontWeight: 400,
            color: "#059669", letterSpacing: "-0.01em", marginTop: 3,
            opacity: interpolate(detailT, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(detailT, [0, 1], [6, 0])}px)`,
          }}>
            {detail}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Action Row ───────────────────────────────────────────────────────────────
const ActionRow: React.FC<{
  label: string;
  detail: string;
  frame: number;
  fps: number;
  showAt: number;
  color: string;
}> = ({ label, detail, frame, fps, showAt, color }) => {
  const t = spring({ frame: frame - showAt, fps, config: { stiffness: 320, damping: 26 } });
  if (frame < showAt && t === 0) return null;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16,
      padding: "14px 20px",
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      border: "1px solid rgba(5,150,105,0.15)",
      marginBottom: 12,
      opacity: interpolate(t, [0, 1], [0, 1]),
      transform: `translateX(${interpolate(t, [0, 1], [30, 0])}px)`,
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        backgroundColor: "rgba(5,150,105,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
          <polyline points="1,5.5 5,9.5 13,1" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: interFont, fontSize: 20, fontWeight: 600,
          color: "#1D1D1F", letterSpacing: "-0.01em",
        }}>{label}</div>
        <div style={{
          fontFamily: interFont, fontSize: 15, fontWeight: 400,
          color: "#6B7280", marginTop: 2,
        }}>{detail}</div>
      </div>
    </div>
  );
};

// ─── Main Scene ──────────────────────────────────────────────────────────────
export const SceneAriAInAction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sp = (f: number, s = 280, d = 26) =>
    spring({ frame: frame - f, fps, config: { stiffness: s, damping: d } });

  const msgT    = sp(P_MSG, 300, 22);
  const ariaT   = sp(P_ARIA, 280, 24);
  const resultT = sp(P_RESULT, 260, 26);
  const metricT = sp(P_METRIC, 240, 26);

  const allStepsDone = frame >= STEPS[STEPS.length - 1].doneAt + 10;

  return (
    <AbsoluteFill>
      {/* Background */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "#FAFAFA" }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 60% 50% at 20% 15%, rgba(59,91,219,0.05) 0%, transparent 60%)",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 50% 45% at 80% 85%, rgba(5,150,105,0.04) 0%, transparent 60%)",
      }} />

      <AbsoluteFill style={{
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ width: 960, display: "flex", flexDirection: "column" }}>

          {/* User message */}
          <div style={{
            alignSelf: "flex-start",
            marginBottom: 48,
            opacity: interpolate(msgT, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(msgT, [0, 1], [16, 0])}px)`,
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                backgroundColor: "#E5E7EB",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14,
              }}>👷</div>
              <span style={{
                fontFamily: interFont, fontSize: 14, fontWeight: 600,
                color: "#9CA3AF", letterSpacing: "0.01em",
              }}>Marco R. — Maintenance Manager</span>
            </div>
            <div style={{
              display: "inline-block",
              backgroundColor: "#F3F4F6",
              borderRadius: "0 18px 18px 18px",
              padding: "14px 20px",
              fontFamily: interFont, fontSize: 22, fontWeight: 500,
              color: "#1D1D1F", letterSpacing: "-0.01em",
              maxWidth: 600,
              lineHeight: 1.4,
            }}>
              M-401 — vibration alarm triggered.<br />Line A at risk.
            </div>
          </div>

          {/* AriA processing block */}
          <div style={{
            opacity: interpolate(ariaT, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(ariaT, [0, 1], [16, 0])}px)`,
          }}>
            {/* AriA header row */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12, marginBottom: 36,
            }}>
              <AriAOrb size={40} frame={frame} fps={fps} />
              <span style={{
                fontFamily: interFont, fontSize: 19, fontWeight: 700,
                color: "#3B5BDB", letterSpacing: "-0.01em",
              }}>AriA</span>
              <span style={{
                fontFamily: interFont, fontSize: 17, fontWeight: 400,
                color: "#9CA3AF",
              }}>
                {allStepsDone ? "Analysis complete — executing actions" : "Analyzing M-401..."}
              </span>
            </div>

            {/* Step list */}
            <div style={{ marginBottom: allStepsDone ? 36 : 0 }}>
              {STEPS.map((step, i) => (
                <StepItem
                  key={i}
                  num={i + 1}
                  text={step.text}
                  detail={step.detail}
                  frame={frame}
                  fps={fps}
                  showAt={step.showAt}
                  doneAt={step.doneAt}
                />
              ))}
            </div>

            {/* Divider */}
            {allStepsDone && (
              <div style={{
                height: 1,
                backgroundColor: "rgba(59,91,219,0.1)",
                marginBottom: 24,
                opacity: interpolate(
                  spring({ frame: frame - (STEPS[STEPS.length-1].doneAt + 10), fps, config: { stiffness: 300, damping: 26 } }),
                  [0, 1], [0, 1]
                ),
              }} />
            )}

            {/* Action rows */}
            <div>
              {ACTIONS.map((action, i) => (
                <ActionRow
                  key={i}
                  label={action.label}
                  detail={action.detail}
                  frame={frame}
                  fps={fps}
                  showAt={action.showAt}
                  color={action.color}
                />
              ))}
            </div>
          </div>

          {/* Result */}
          {frame >= P_RESULT && (
            <div style={{
              marginTop: 36,
              opacity: interpolate(resultT, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(resultT, [0, 1], [12, 0])}px)`,
              display: "flex", alignItems: "center", gap: 24,
            }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "12px 28px", borderRadius: 100,
                backgroundColor: "rgba(5,150,105,0.07)",
                border: "1px solid rgba(5,150,105,0.2)",
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#059669" }} />
                <span style={{
                  fontFamily: interFont, fontSize: 16, fontWeight: 600,
                  color: "#059669", letterSpacing: "-0.01em",
                }}>
                  M-401 scheduled. Line A protected.
                </span>
              </div>

              {frame >= P_METRIC && (
                <div style={{
                  opacity: interpolate(metricT, [0, 1], [0, 1]),
                  transform: `translateX(${interpolate(metricT, [0, 1], [16, 0])}px)`,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{
                    fontFamily: interFont, fontSize: 15, fontWeight: 400,
                    color: "#9CA3AF",
                  }}>Resolution:</span>
                  <span style={{
                    fontFamily: interFont, fontSize: 15, fontWeight: 700,
                    color: "#059669",
                  }}>4h</span>
                  <span style={{
                    fontFamily: interFont, fontSize: 15, fontWeight: 400,
                    color: "#9CA3AF", textDecoration: "line-through",
                  }}>11h</span>
                </div>
              )}
            </div>
          )}

        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
