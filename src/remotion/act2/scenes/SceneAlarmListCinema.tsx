import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { geistFont } from "../constants";

// ─────────────────────────────────────────────────────────────────────────────
// SceneAlarmListCinema — Heygrow-style cinematic alarm inbox
//
// Shot structure:
//   S1   0 – 52    Dark opener: "1 critical alarm" with pulsing red dot
//   FLASH  48–54   White flash cut
//   S2  52 – 145   Light-mode alarm stack: tilt-reveal, staggered, camera pull-back
//   S3 145 – 215   Push-in on card 1: camera zooms, others ghost-out, AriA badge
//   S4 215 – 270   AriA scan line + "Analyzing..." + dissolve out
// ─────────────────────────────────────────────────────────────────────────────

export const ALARM_CINEMA_DURATION = 270;

const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const EASE  = Easing.inOut(Easing.sin);
const kf    = (f: number, pts: { f: number; v: number }[]) =>
  interpolate(f, pts.map(p => p.f), pts.map(p => p.v), { ...CLAMP, easing: EASE });

// ─── Palette ─────────────────────────────────────────────────────────────────
const DARK_BG   = "#060607";
const LIGHT_BG  = "#F7F8FC";
const CARD_BG   = "#FFFFFF";
const INK       = "#1A1F33";
const MUTED     = "#767E8C";
const LABEL_FG  = "#9AA0B0";
const ACCENT    = "#3B5BDB";
const CRITICAL  = "#E53935";
const WARNING   = "#E8830A";
const INFO_CLR  = "#6B7280";
const CARD_SHADOW = "0 2px 12px rgba(15,20,40,0.055), 0 1px 3px rgba(15,20,40,0.04)";

// ─── Timing ──────────────────────────────────────────────────────────────────
const FLASH_AT    = 48;
const S2_START    = 52;
const S3_START    = 145;
const S4_START    = 215;

// ─── Layout ──────────────────────────────────────────────────────────────────
const CARD_W   = 1600;
const CARD_H   = 94;
const CARD_GAP = 14;
const CARD_X   = (1920 - CARD_W) / 2;            // 160
const STACK_H  = 5 * CARD_H + 4 * CARD_GAP;      // 526
const STACK_TOP = Math.round((1080 - STACK_H) / 2); // ≈ 277
const CARD1_CY  = STACK_TOP + CARD_H / 2;         // ≈ 324

// ─── Data ────────────────────────────────────────────────────────────────────
type Sev = "critical" | "warning" | "info";
interface Alarm { code: string; title: string; tag: string; sev: Sev; sevLabel: string }
const ALARMS: Alarm[] = [
  { code: "A25245-E2PK", title: "OVEN_1 Outfeed Peg Chain Motor T60M2 Torque Safety Limit Exceeded", tag: "Torque",      sev: "critical", sevLabel: "Critical" },
  { code: "A25247-E3PS", title: "Conveyor CB-L2 speed anomaly detected on sector 3",                  tag: "Speed",       sev: "warning",  sevLabel: "High"     },
  { code: "A25244-E1PA", title: "Press PRS-05 vibration peak at 4200 RPM exceeds baseline",           tag: "Vibration",   sev: "warning",  sevLabel: "High"     },
  { code: "A25243-E2PB", title: "Hydraulic Pump PUMP-AX-03 pressure drop below operational threshold",tag: "Pressure",    sev: "info",     sevLabel: "Medium"   },
  { code: "A25242-E1PA", title: "Heater HEAT-07 temperature exceeds setpoint by +8°C sustained",      tag: "Temperature", sev: "info",     sevLabel: "Medium"   },
];
const SEV_CLR: Record<Sev, string>    = { critical: CRITICAL, warning: WARNING, info: INFO_CLR };
const SEV_BG:  Record<Sev, string>    = {
  critical: "rgba(229,57,53,0.08)",
  warning:  "rgba(232,131,10,0.08)",
  info:     "rgba(107,114,128,0.06)",
};
const SEV_BD:  Record<Sev, string>    = {
  critical: "rgba(229,57,53,0.22)",
  warning:  "rgba(232,131,10,0.22)",
  info:     "rgba(214,217,227,0.55)",
};

// ═══════════════════════════════════════════════════════════════════════════════
//  SHOT 1 — Dark Opener: "1 critical alarm"
// ═══════════════════════════════════════════════════════════════════════════════
const DarkOpener: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const fadeIn  = interpolate(frame, [0, 10], [0, 1], CLAMP);
  const exitT   = interpolate(frame, [36, 50], [0, 1], CLAMP);
  const exitTy  = -exitT * 44;
  const exitOp  = 1 - exitT;

  // Red alert dot — spring overshoot
  const dotSp = spring({ frame: frame - 5, fps, config: { stiffness: 320, damping: 16, mass: 0.55 } });
  const dotSc = interpolate(dotSp, [0, 1], [0, 1], CLAMP);
  const pulse = 0.55 + 0.45 * Math.sin(frame * 0.30);

  // Word-by-word reveal for "1 critical alarm"
  const WORDS = ["1", "critical", "alarm"] as const;
  const wordSprings = WORDS.map((_, i) =>
    spring({ frame: frame - (10 + i * 7), fps, config: { stiffness: 280, damping: 20, mass: 0.6 } })
  );

  // Subtitle
  const subSp = spring({ frame: frame - 30, fps, config: { stiffness: 160, damping: 26, mass: 0.85 } });
  const subOp = interpolate(subSp, [0, 1], [0, 1], CLAMP);
  const subTy = interpolate(subSp, [0, 1], [18, 0], CLAMP);

  // Horizontal rule draws under the text
  const ruleSp = spring({ frame: frame - 26, fps, config: { stiffness: 200, damping: 22, mass: 0.8 } });
  const ruleProg = interpolate(ruleSp, [0, 1], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{
      backgroundColor: DARK_BG,
      opacity: fadeIn,
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden",
    }}>
      {/* Ambient red bloom */}
      <div style={{
        position: "absolute",
        width: 560, height: 560, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(229,57,53,${pulse * 0.28}) 0%, transparent 60%)`,
        filter: "blur(80px)",
        opacity: dotSc * exitOp,
        pointerEvents: "none",
      }} />

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 28,
        transform: `translateY(${exitTy}px)`,
        opacity: exitOp,
      }}>

        {/* Pulsing dot */}
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: `radial-gradient(circle at 38% 38%, #FF5252 0%, ${CRITICAL} 50%, #7B0000 100%)`,
          boxShadow: `0 0 ${28 + pulse * 52}px rgba(229,57,53,${0.55 + pulse * 0.35}), 0 0 100px rgba(229,57,53,0.15)`,
          transform: `scale(${dotSc * (0.92 + pulse * 0.08)})`,
        }} />

        {/* "1 critical alarm" — three words, oversized */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
          {WORDS.map((word, i) => {
            const sp = wordSprings[i];
            const wOp   = interpolate(sp, [0, 1], [0, 1], CLAMP);
            const wTy   = interpolate(sp, [0, 1], [30, 0], CLAMP);
            const wSc   = interpolate(sp, [0, 1], [0.88, 1], CLAMP);
            return (
              <span key={word} style={{
                fontFamily: geistFont,
                fontSize: i === 0 ? 120 : 78,
                fontWeight: i === 0 ? 900 : 700,
                letterSpacing: "-0.045em",
                lineHeight: 0.9,
                color: i === 0 ? CRITICAL : "rgba(255,255,255,0.93)",
                opacity: wOp,
                transform: `translateY(${wTy}px) scale(${wSc})`,
                display: "inline-block",
                willChange: "transform, opacity",
              }}>{word}</span>
            );
          })}
        </div>

        {/* Horizontal rule */}
        {ruleProg > 0.01 && (
          <div style={{
            height: 1,
            background: "rgba(255,255,255,0.12)",
            width: `${ruleProg * 640}px`,
            borderRadius: 1,
          }} />
        )}

        {/* Subtitle */}
        <div style={{
          fontFamily: geistFont, fontSize: 15, fontWeight: 400,
          color: "rgba(255,255,255,0.32)", letterSpacing: "0.16em",
          opacity: subOp, transform: `translateY(${subTy}px)`,
        }}>
          PLANT 1 · BAKING LINE 02 · SECTOR 8
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
//  ALARM CARD
// ═══════════════════════════════════════════════════════════════════════════════
interface CardProps {
  alarm: Alarm;
  isActive: boolean;
  frame: number;
  fps: number;
  entryAt: number;
  dimT: number;
  scanProg: number;    // 0-1, left-to-right blue scan line
  ariaT: number;       // 0-1, badge fade-in
  analyzeT: number;    // 0-1, analyzing state
}
const AlarmCard: React.FC<CardProps> = ({
  alarm, isActive, frame, fps, entryAt, dimT, scanProg, ariaT, analyzeT,
}) => {
  const sevColor = SEV_CLR[alarm.sev];

  // Tilt-reveal entry (rotateX 22°→0° + scale + fade)
  const entrySp = spring({ frame: frame - entryAt, fps, config: { stiffness: 118, damping: 22, mass: 1.05 } });
  const entryT   = interpolate(entrySp, [0, 1], [0, 1], CLAMP);
  const rotX     = 22 * (1 - entryT);
  const entryOp  = Math.min(1, entryT * 1.9);
  const entryTy  = (1 - entryT) * 36;
  const entrySc  = 0.88 + 0.12 * entryT;

  // Active glow pulse
  const activePulse = isActive ? 0.68 + 0.32 * Math.sin(frame * 0.14) : 0;

  // Dim non-active cards
  const dimOp     = 1 - dimT * 0.90;
  const dimFilter = dimT > 0.01 ? `grayscale(${dimT * 0.85}) blur(${dimT * 1.4}px)` : undefined;

  // AriA badge spring
  const ariaSp  = spring({ frame: frame - (S3_START + 32), fps, config: { stiffness: 220, damping: 22, mass: 0.7 } });
  const ariaBOp = ariaT > 0 ? interpolate(ariaSp, [0, 1], [0, 1], CLAMP) : 0;
  const ariaBTy = ariaT > 0 ? interpolate(ariaSp, [0, 1], [10, 0], CLAMP) : 0;

  return (
    <div style={{
      width: "100%", height: CARD_H,
      perspective: 1100,
      opacity: entryOp * dimOp,
      filter: dimFilter,
    }}>
      <div style={{
        width: "100%", height: "100%",
        transform: `rotateX(${rotX}deg) translateY(${entryTy}px) scale(${entrySc})`,
        transformOrigin: "50% 0%",
        position: "relative",
        backgroundColor: CARD_BG,
        borderRadius: 18,
        border: `1px solid ${isActive
          ? `rgba(59,91,219,${0.28 + activePulse * 0.48})`
          : "rgba(214,217,227,0.55)"}`,
        borderLeft: `4px solid ${sevColor}`,
        boxShadow: isActive
          ? `0 0 0 1px rgba(59,91,219,${activePulse * 0.18}), 0 8px 36px rgba(59,91,219,${activePulse * 0.12}), ${CARD_SHADOW}`
          : CARD_SHADOW,
        display: "flex", alignItems: "center",
        padding: "0 40px",
        gap: 28,
        overflow: "hidden",
        boxSizing: "border-box",
      }}>

        {/* Scan line — blue beam sweeping left to right */}
        {isActive && scanProg > 0 && scanProg < 1 && (
          <>
            <div style={{
              position: "absolute", top: 0, bottom: 0,
              left: `${scanProg * 100}%`, width: 3,
              background: `linear-gradient(180deg, transparent 0%, ${ACCENT} 25%, ${ACCENT} 75%, transparent 100%)`,
              boxShadow: `0 0 20px ${ACCENT}, 0 0 8px ${ACCENT}`,
              zIndex: 6, pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", top: 0, bottom: 0, left: 0,
              width: `${scanProg * 100}%`,
              background: `linear-gradient(90deg, rgba(59,91,219,0.04) 0%, rgba(59,91,219,0.10) 100%)`,
              zIndex: 5, pointerEvents: "none",
            }} />
          </>
        )}

        {/* Severity dot */}
        <div style={{
          width: 10, height: 10, borderRadius: "50%",
          backgroundColor: sevColor, flexShrink: 0,
          boxShadow: alarm.sev === "critical"
            ? `0 0 ${6 + activePulse * 14}px ${sevColor}`
            : "none",
        }} />

        {/* Title block */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          <span style={{
            fontFamily: geistFont, fontSize: 11.5, color: LABEL_FG,
            letterSpacing: "0.07em", fontWeight: 500,
          }}>{alarm.code}</span>
          <span style={{
            fontFamily: geistFont, fontSize: 25, fontWeight: 600,
            color: INK, letterSpacing: "-0.025em", lineHeight: 1.1,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>{alarm.title}</span>
        </div>

        {/* Right meta */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {/* AriA badge */}
          {ariaT > 0.01 && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontFamily: geistFont, fontSize: 12, fontWeight: 600, color: ACCENT,
              background: "rgba(59,91,219,0.08)",
              padding: "5px 12px", borderRadius: 999,
              border: "1px solid rgba(59,91,219,0.22)",
              opacity: ariaBOp,
              transform: `translateY(${ariaBTy}px)`,
              whiteSpace: "nowrap",
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                backgroundColor: ACCENT,
                boxShadow: `0 0 ${4 + activePulse * 8}px ${ACCENT}`,
              }} />
              Generated by AriA
            </span>
          )}

          <span style={{
            fontFamily: geistFont, fontSize: 12, fontWeight: 500,
            padding: "5px 13px", borderRadius: 999,
            background: "#ECEDF2", color: MUTED,
          }}>{alarm.tag}</span>

          <span style={{
            fontFamily: geistFont, fontSize: 12, fontWeight: 600,
            padding: "5px 13px", borderRadius: 999,
            color: sevColor,
            background: SEV_BG[alarm.sev],
            border: `1px solid ${SEV_BD[alarm.sev]}`,
          }}>{alarm.sevLabel}</span>

          {/* Status pill: Draft → Analyzing... */}
          <span style={{
            fontFamily: geistFont, fontSize: 12, fontWeight: 500,
            padding: "5px 13px", borderRadius: 999,
            background: analyzeT > 0.35
              ? "rgba(59,91,219,0.08)"
              : "#ECEDF2",
            color: analyzeT > 0.35 ? ACCENT : MUTED,
            border: analyzeT > 0.35
              ? "1px solid rgba(59,91,219,0.20)"
              : "1px solid transparent",
          }}>
            {analyzeT > 0.35 ? "Analyzing..." : "Draft"}
          </span>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
//  SHOTS 2-4 — Light Alarm List Stage
// ═══════════════════════════════════════════════════════════════════════════════
const AlarmListStage: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const stageOp = interpolate(frame, [S2_START, S2_START + 12], [0, 1], CLAMP);

  // ── Camera ────────────────────────────────────────────────────────────────
  // S2: pull back (0.76) → neutral (1.0) as cards arrive
  // S3: push in hard (1.44) centered on card 1
  const camScale = kf(frame, [
    { f: S2_START,       v: 0.76  },
    { f: S2_START + 30,  v: 0.82  },
    { f: S2_START + 72,  v: 0.98  },
    { f: S2_START + 90,  v: 1.0   },
    { f: S3_START,       v: 1.0   },
    { f: S3_START + 38,  v: 1.44  },
    { f: S4_START,       v: 1.44  },
    { f: ALARM_CINEMA_DURATION, v: 1.44 },
  ]);

  // S3: camera centers vertically on card 1
  const camTy = kf(frame, [
    { f: S2_START,      v: 0 },
    { f: S3_START,      v: 0 },
    { f: S3_START + 38, v: 540 - CARD1_CY },
    { f: ALARM_CINEMA_DURATION, v: 540 - CARD1_CY },
  ]);

  // Camera micro-shake during S3 push (urgency)
  const shakeWindow = interpolate(frame,
    [S3_START + 38, S3_START + 55, S3_START + 76],
    [0, 1, 0], CLAMP);
  const sf = frame - (S3_START + 38);
  const shakeX = shakeWindow > 0 ? Math.sin(sf * 3.1) * 2.8 * shakeWindow : 0;
  const shakeY = shakeWindow > 0 ? Math.cos(sf * 2.4) * 1.8 * shakeWindow : 0;

  // ── Cards 2-5 dim during S3 ────────────────────────────────────────────────
  const dimT = interpolate(frame, [S3_START + 8, S3_START + 36], [0, 1], CLAMP);

  // ── S4: scan line across card 1 ───────────────────────────────────────────
  const scanProg = interpolate(frame, [S4_START + 6, S4_START + 28], [0, 1], CLAMP);

  // ── S4: Analyzing animation ───────────────────────────────────────────────
  const analyzeT = interpolate(frame, [S4_START + 32, S4_START + 50], [0, 1], CLAMP);

  // ── Header ────────────────────────────────────────────────────────────────
  const headerOp = interpolate(frame, [S2_START + 54, S2_START + 68, S3_START - 10, S3_START + 20], [0, 1, 1, 0], CLAMP);

  // ── AriA badge ────────────────────────────────────────────────────────────
  const ariaT = interpolate(frame, [S3_START + 30, S3_START + 46], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{ backgroundColor: LIGHT_BG, opacity: stageOp }}>
      {/* Ambient blobs */}
      <div style={{
        position: "absolute", width: 900, height: 700, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,91,219,0.07) 0%, transparent 65%)",
        left: -260, top: -140, filter: "blur(90px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: 700, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,91,219,0.05) 0%, transparent 65%)",
        right: -120, bottom: -100, filter: "blur(90px)", pointerEvents: "none",
      }} />

      {/* Camera wrapper */}
      <div style={{
        position: "absolute", inset: 0,
        transform: `scale(${camScale}) translate(${shakeX}px, ${camTy + shakeY}px)`,
        transformOrigin: "center center",
        willChange: "transform",
      }}>

        {/* Header label */}
        <div style={{
          position: "absolute",
          left: CARD_X, top: STACK_TOP - 54,
          width: CARD_W,
          display: "flex", alignItems: "center", gap: 14,
          opacity: headerOp,
        }}>
          <span style={{
            fontFamily: geistFont, fontSize: 12, fontWeight: 700,
            color: LABEL_FG, letterSpacing: "0.14em",
          }}>5 ACTIVE</span>
          <div style={{ flex: 1, height: 1, background: "rgba(214,217,227,0.6)" }} />
          <span style={{
            fontFamily: geistFont, fontSize: 12, color: MUTED, fontWeight: 500,
          }}>Torque · Priority</span>
        </div>

        {/* Card stack */}
        {ALARMS.map((alarm, i) => {
          const cardTop = STACK_TOP + i * (CARD_H + CARD_GAP);
          const entryAt = S2_START + 6 + i * 11;
          const isActive = i === 0;

          return (
            <div key={alarm.code} style={{
              position: "absolute",
              left: CARD_X, top: cardTop,
              width: CARD_W,
            }}>
              <AlarmCard
                alarm={alarm}
                isActive={isActive}
                frame={frame}
                fps={fps}
                entryAt={entryAt}
                dimT={isActive ? 0 : dimT}
                scanProg={isActive ? scanProg : 0}
                ariaT={isActive ? ariaT : 0}
                analyzeT={isActive ? analyzeT : 0}
              />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN SCENE
// ═══════════════════════════════════════════════════════════════════════════════
export const SceneAlarmListCinema: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // White flash at the cut (dark → light)
  const flashOp = interpolate(frame,
    [FLASH_AT - 2, FLASH_AT, FLASH_AT + 5],
    [0, 1, 0], CLAMP);

  // Exit dissolve to BlobHold light bg
  const exitOp = interpolate(frame, [252, 270], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* S1 — dark opener */}
      {frame < FLASH_AT + 10 && <DarkOpener frame={frame} fps={fps} />}

      {/* S2/S3/S4 — light alarm list */}
      {frame >= S2_START - 2 && <AlarmListStage frame={frame} fps={fps} />}

      {/* Flash cut */}
      {flashOp > 0.005 && (
        <div style={{
          position: "absolute", inset: 0,
          backgroundColor: "#FFFFFF",
          opacity: flashOp,
          zIndex: 50,
          pointerEvents: "none",
        }} />
      )}

      {/* Exit wash to BlobHold */}
      {exitOp > 0.005 && (
        <div style={{
          position: "absolute", inset: 0,
          backgroundColor: "#F0F3FF",
          opacity: exitOp,
          zIndex: 100,
          pointerEvents: "none",
        }} />
      )}
    </AbsoluteFill>
  );
};
