import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ARIA_COLORS, geistFont } from "../constants";
import { WindRing3D } from "../components/WindRing3D";

// ─── Areas (phase 1) → Sectors (phase 2) → Merge + Tagline (phase 3) ─────
const AREAS = [
  "Maintenance",
  "Lean Manufacturing",
  "Supply Chain",
  "Operations Management",
  "Enterprise Asset Management",
  "Business Process Management",
];

const SECTORS = [
  "Manufacturing",
  "Energy & Utilities",
  "Facility Management",
  "Transport & Logistics",
  "Pharma & Life Sciences",
  "OEM",
  "Railway",
  "Oil & Gas",
  "Green Economy",
];

// ─── Timing ─────────────────────────────────────────────────────────────────
const P_INTRO            = 2;
const P_FIRST_AREA       = 10;
const AREA_DUR           = 20;
const SUMMARY_START      = P_FIRST_AREA + AREAS.length * AREA_DUR + 2;  // 132
const MORPH_START        = SUMMARY_START + 70;                           // 202 — pills visible ~2.3s
const MORPH_END          = MORPH_START + 45;                             // 247
const ORBIT_HOLD_END     = MORPH_END + 60;                              // 307

// Phase 3: merge → pulse → tagline
const MERGE_START        = ORBIT_HOLD_END;                               // 307
const MERGE_DUR          = 28;
const MERGE_END          = MERGE_START + MERGE_DUR;                      // 335
const PULSE_FRAME        = MERGE_END - 4;                                // 331
const TAGLINE_START      = MERGE_END + 4;                                // 339
const TAGLINE_HOLD_END   = TAGLINE_START + 60;                           // 399

// Phase 4: second tagline (no overlap — first fully gone before second appears)
const TAGLINE2_START     = TAGLINE_HOLD_END + 14;                        // 413 — clean gap
const TAGLINE2_HOLD_END  = TAGLINE2_START + 70;                          // 483
const BLOB_MORPH_START   = TAGLINE2_HOLD_END;                            // 483
const SCENE_END          = 505; // trimmed: blob clears frame ~503

// Orbit layout
const ORBIT_CX = 960;
const ORBIT_CY = 540;
const ORBIT_RADIUS = 350;

// ─── Shimmer ────────────────────────────────────────────────────────────────
const areaShimmer = (localFrame: number, startFrame: number): React.CSSProperties => {
  const sweepDur = 55;
  const pauseDur = 95;
  const cycleDur = sweepDur + pauseDur;
  const f = localFrame - startFrame;
  const phase = ((f % cycleDur) + cycleDur) % cycleDur;
  const pos = phase < sweepDur ? 95 - (phase / sweepDur) * 90 : 5;
  return {
    backgroundColor: "rgba(26,26,46,0.78)",
    backgroundImage:
      "linear-gradient(100deg, " +
      "rgba(26,26,46,0.78) 0%, " +
      "rgba(26,26,46,0.78) 42%, " +
      "rgba(120,150,255,0.95) 47%, " +
      "#ffffff 50%, " +
      "rgba(120,150,255,0.95) 53%, " +
      "rgba(26,26,46,0.78) 58%, " +
      "rgba(26,26,46,0.78) 100%)",
    backgroundSize: "300% 100%",
    backgroundPosition: `${pos}% 0%`,
    backgroundRepeat: "no-repeat",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent",
  };
};

// Pill style (shared)
const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "14px 26px",
  borderRadius: 999,
  backgroundColor: "rgba(255,255,255,0.95)",
  border: "1px solid rgba(59,91,219,0.22)",
  boxShadow:
    "0 8px 32px -10px rgba(59,91,219,0.22), " +
    "0 2px 10px -4px rgba(102,112,153,0.12)",
  whiteSpace: "nowrap",
};

const pillTextStyle: React.CSSProperties = {
  fontFamily: geistFont,
  fontSize: 22,
  fontWeight: 600,
  color: ARIA_COLORS.foreground,
  letterSpacing: "-0.016em",
};

// ─── Scene ──────────────────────────────────────────────────────────────────
export const SceneAreas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

  const sp = (f: number, stiff = 180, damp = 24, mass = 0.9) =>
    spring({ frame: frame - f, fps, config: { stiffness: stiff, damping: damp, mass } });

  // Intro
  const introT = sp(P_INTRO, 240, 24, 0.8);
  const introOp = interpolate(introT, [0, 1], [0, 1]);

  // Morph progress (0 = flex, 1 = orbit)
  const morphT = spring({
    frame: frame - MORPH_START,
    fps,
    config: { stiffness: 100, damping: 20, mass: 1 },
  });

  // Flex pills fade out during morph
  const flexOp = interpolate(morphT, [0, 0.5], [1, 0], clamp);
  // Orbit pills fade in during morph
  const orbitOp = interpolate(morphT, [0.2, 0.7], [0, 1], clamp);

  // Blob morph to Form position
  const blobMorphT = spring({
    frame: frame - BLOB_MORPH_START,
    fps,
    config: { stiffness: 80, damping: 22, mass: 1.1 },
  });
  // Handoff to SceneBlobHold: blob rises straight up & exits frame,
  // background stays untouched so the two scenes blend seamlessly.
  const blobSize = interpolate(blobMorphT, [0, 1], [220, 180], clamp);
  const blobCX   = 960;
  const blobCY   = interpolate(blobMorphT, [0, 1], [540, -260], clamp);
  const tSec = frame / fps;

  // Blob pulse when pills merge into it
  const pulseT = spring({
    frame: frame - PULSE_FRAME,
    fps,
    config: { stiffness: 300, damping: 12, mass: 0.5 },
  });
  const blobPulse = 1 + pulseT * 0.18;
  const blobBreathe = (1 + Math.sin(tSec * 2.2) * 0.06) * blobPulse;

  // Label: "Areas of Operation" → "Industries We Serve" → fade out for tagline
  const labelOldOp = interpolate(morphT, [0, 0.4], [1, 0], clamp);
  const labelNewOp = interpolate(frame,
    [MORPH_START + 10, MORPH_END, MERGE_START, MERGE_END],
    [0, 1, 1, 0], clamp);

  // Active spotlight index
  const activeIdx = Math.min(
    AREAS.length - 1,
    Math.max(0, Math.floor((frame - P_FIRST_AREA) / AREA_DUR)),
  );

  // Orbit rotation during hold
  const orbitRotation = interpolate(
    frame, [MORPH_END, ORBIT_HOLD_END], [0, 8], clamp,
  );

  // ── Tagline animation ──
  const taglineT = spring({
    frame: frame - TAGLINE_START,
    fps,
    config: { stiffness: 120, damping: 22, mass: 1 },
  });
  const taglineOp = interpolate(taglineT, [0, 1], [0, 1], clamp);

  // Second line delay
  const tagline2T = spring({
    frame: frame - (TAGLINE_START + 12),
    fps,
    config: { stiffness: 120, damping: 22, mass: 1 },
  });
  const tagline2Op = interpolate(tagline2T, [0, 1], [0, 1], clamp);

  // ── Second tagline: "Tailored by you. Without developers." ──
  const tag2ExitOp = interpolate(frame,
    [TAGLINE2_HOLD_END - 10, TAGLINE2_HOLD_END + 10], [1, 0], clamp);
  // Text slides downward as it fades, creating a handoff into SceneBlobHold
  const tag2ExitY = interpolate(frame,
    [TAGLINE2_HOLD_END - 10, TAGLINE2_HOLD_END + 16], [0, 140], clamp);

  // Pulse glow ring
  const glowOp = interpolate(frame,
    [PULSE_FRAME, PULSE_FRAME + 6, PULSE_FRAME + 20],
    [0, 0.6, 0], clamp);
  const glowScale = interpolate(frame,
    [PULSE_FRAME, PULSE_FRAME + 20],
    [0.8, 2.2], clamp);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* ── Background ── */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "#F0F3FF" }} />

      {/* Ambient washes */}
      <div style={{
        position: "absolute",
        width: 900, height: 700, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,91,219,0.16) 0%, transparent 70%)",
        left: interpolate(frame, [0, SCENE_END], [-140, 60], clamp),
        top:  interpolate(frame, [0, SCENE_END], [-200, -120], clamp),
        filter: "blur(60px)",
      }} />
      <div style={{
        position: "absolute",
        width: 800, height: 800, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(107,142,255,0.14) 0%, transparent 65%)",
        right: interpolate(frame, [0, SCENE_END], [-220, -100], clamp),
        top:   interpolate(frame, [0, SCENE_END], [160, 260], clamp),
        filter: "blur(70px)",
      }} />
      <div style={{
        position: "absolute",
        width: 700, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(165,184,255,0.20) 0%, transparent 65%)",
        left:   interpolate(frame, [0, SCENE_END], [280, 420], clamp),
        bottom: interpolate(frame, [0, SCENE_END], [-180, -100], clamp),
        filter: "blur(55px)",
      }} />

      {/* ── Label: crossfade ── */}
      <div style={{
        position: "absolute",
        left: 0, right: 0,
        top: 96,
        textAlign: "center",
        opacity: introOp,
        transform: `translateY(${interpolate(introT, [0, 1], [10, 0])}px)`,
        zIndex: 8,
      }}>
        <span style={{
          position: "absolute",
          left: 0, right: 0,
          fontFamily: geistFont,
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: "0.30em",
          textTransform: "uppercase",
          color: "rgba(59,91,219,0.72)",
          opacity: labelOldOp,
        }}>
          Areas of Operation
        </span>
        <span style={{
          position: "absolute",
          left: 0, right: 0,
          fontFamily: geistFont,
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: "0.30em",
          textTransform: "uppercase",
          color: "rgba(59,91,219,0.72)",
          opacity: labelNewOp,
        }}>
          Industries We Serve
        </span>
      </div>

      {/* ── Pulse glow ring (when pills merge) ── */}
      {glowOp > 0.005 && (
        <div style={{
          position: "absolute",
          left: 960,
          top: 540,
          width: 220,
          height: 220,
          transform: `translate(-50%, -50%) scale(${glowScale})`,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,91,219,0.35) 0%, rgba(120,150,255,0.15) 40%, transparent 70%)",
          opacity: glowOp,
          zIndex: 6,
        }} />
      )}

      {/* ── WindRing3D blob ── */}
      <div style={{
        position: "absolute",
        left: blobCX,
        top:  blobCY,
        transform: `translate(-50%, -50%) scale(${blobBreathe})`,
        opacity: introOp,
        zIndex: 7,
      }}>
        <WindRing3D size={blobSize} frame={frame} fps={fps} />
      </div>

      {/* ── Spotlight area name ── */}
      {frame < SUMMARY_START && AREAS.map((area, i) => {
        const startF = P_FIRST_AREA + i * AREA_DUR;
        const endF   = startF + AREA_DUR;
        const op = interpolate(
          frame,
          [startF - 4, startF + 6, endF - 6, endF + 2],
          [0, 1, 1, 0],
          clamp,
        );
        const y = interpolate(
          frame,
          [startF - 4, startF + 8, endF - 6, endF + 4],
          [18, 0, 0, -14],
          clamp,
        );
        if (op < 0.005) return null;
        return (
          <div key={area} style={{
            position: "absolute",
            left: 0, right: 0,
            top: 820,
            textAlign: "center",
            opacity: op,
            transform: `translateY(${y}px)`,
            fontFamily: geistFont,
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: "-0.028em",
            lineHeight: 1,
            whiteSpace: "nowrap",
            zIndex: 9,
            ...areaShimmer(frame, startF),
          }}>
            {area}
          </div>
        );
      })}

      {/* ── Progress dots ── */}
      {frame < SUMMARY_START && frame >= P_FIRST_AREA - 6 && (
        <div style={{
          position: "absolute",
          left: 0, right: 0,
          top: 940,
          display: "flex",
          justifyContent: "center",
          gap: 10,
          opacity: interpolate(frame, [P_FIRST_AREA - 6, P_FIRST_AREA + 4], [0, 1], clamp),
          zIndex: 8,
        }}>
          {AREAS.map((_, i) => {
            const isActive = i === activeIdx;
            const isDone   = i < activeIdx;
            return (
              <div key={i} style={{
                width: isActive ? 28 : 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: isActive
                  ? "rgba(59,91,219,0.85)"
                  : isDone
                    ? "rgba(59,91,219,0.55)"
                    : "rgba(59,91,219,0.22)",
              }} />
            );
          })}
        </div>
      )}

      {/* ── FLEX PILLS (Areas) — visible before morph ── */}
      {frame >= SUMMARY_START - 4 && flexOp > 0.005 && (
        <div style={{
          position: "absolute",
          left: 0, right: 0,
          top: 720,
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 14,
          padding: "0 160px",
          zIndex: 9,
          opacity: flexOp,
          transform: `scale(${interpolate(morphT, [0, 0.5], [1, 0.85], clamp)})`,
        }}>
          {AREAS.map((area, i) => {
            const fadeOp = interpolate(frame, [SUMMARY_START, SUMMARY_START + 18], [0, 1], clamp);
            const scale = interpolate(frame, [SUMMARY_START, SUMMARY_START + 18], [0.96, 1], clamp);
            const itemOp = fadeOp;
            if (itemOp < 0.005) return null;
            return (
              <div key={area} style={{
                ...pillStyle,
                transform: `scale(${scale})`,
                opacity: itemOp,
              }}>
                <span style={pillTextStyle}>{area}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ORBIT PILLS (Sectors) — appear during morph, merge into blob ── */}
      {orbitOp > 0.005 && frame < MERGE_END + 4 && (
        <div style={{
          position: "absolute",
          left: ORBIT_CX,
          top: ORBIT_CY,
          width: 0,
          height: 0,
          transform: `rotate(${orbitRotation}deg)`,
          zIndex: 9,
        }}>
          {SECTORS.map((sector, i) => {
            const stagger = MORPH_START + 5 + i * 3;
            const s = spring({
              frame: frame - stagger,
              fps,
              config: { stiffness: 140, damping: 18, mass: 0.8 },
            });

            const baseAngle = (i / SECTORS.length) * Math.PI * 2 - Math.PI / 2;
            const angle = baseAngle;

            // Merge: pills fly back to center (0,0) relative to orbit container
            const mergeStagger = MERGE_START + i * 2;
            const mergeT = spring({
              frame: frame - mergeStagger,
              fps,
              config: { stiffness: 200, damping: 16, mass: 0.6 },
            });

            const itemRadius = ORBIT_RADIUS;
            const fullR = interpolate(s, [0, 1], [0, itemRadius], clamp);
            const r = interpolate(mergeT, [0, 1], [fullR, 0], clamp);
            const xBase = Math.cos(angle) * r;
            const x = xBase + (sector === "OEM" ? -40 : 0);
            const y = Math.sin(angle) * r;

            const baseScale = interpolate(s, [0, 1], [0.4, 1], clamp);
            const mergeScale = interpolate(mergeT, [0, 1], [1, 0], clamp);
            const scale = baseScale * mergeScale;

            const baseOp = interpolate(s, [0, 1], [0, 1], clamp) * orbitOp;
            const mergeOp = interpolate(mergeT, [0, 0.8], [1, 0], clamp);
            const itemOp = baseOp * mergeOp;

            if (itemOp < 0.005 || scale < 0.01) return null;

            return (
              <div key={sector} style={{
                ...pillStyle,
                position: "absolute",
                left: x,
                top: y,
                transform: `translate(-50%, -50%) scale(${scale})`,
                opacity: itemOp,
                willChange: "transform, opacity",
              }}>
                <span style={pillTextStyle}>{sector}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAGLINES — fluid transition ── */}
      {frame >= TAGLINE_START - 4 && frame < SCENE_END && (() => {
        // morphT: 0 = phase 1 fully visible, 1 = phase 2 fully visible
        const morphT = interpolate(frame,
          [TAGLINE_HOLD_END, TAGLINE_HOLD_END + 18], [0, 1], clamp);

        // "Any industry." — fades out
        const anyOp = taglineOp * interpolate(morphT, [0, 0.4], [1, 0], clamp);

        // "One intelligent entry point." — persistent, slides up + scales up
        const oneEnterOp = tagline2Op; // initial fade in
        // "Tailored by you. Without developers." — fades in at end
        const subOp = interpolate(morphT, [0.7, 1], [0, 1], clamp);

        const exitOp = tag2ExitOp;

        // All three texts use absolute positioning at fixed Y coordinates
        // Title position: top 0 (relative to container at 720)
        // Subtitle position: top 96 (72*1.15 + 12 gap)
        const TITLE_Y = 0;
        const SUB_Y = 96;

        return (
          <div style={{
            position: "absolute",
            left: 0, right: 0,
            top: 720,
            textAlign: "center",
            zIndex: 10,
            transform: `translateY(${tag2ExitY}px)`,
            willChange: "transform",
          }}>
            {/* "Any industry." — at title position, fades out */}
            <div style={{
              position: "absolute",
              left: 0, right: 0,
              top: TITLE_Y,
              opacity: anyOp,
              fontFamily: geistFont,
              fontSize: 72,
              fontWeight: 700,
              color: ARIA_COLORS.foreground,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
            }}>
              Any industry.
            </div>

            {/* "One intelligent entry point." — slides from SUB_Y to TITLE_Y */}
            <div style={{
              position: "absolute",
              left: 0, right: 0,
              top: interpolate(morphT, [0, 1], [SUB_Y, TITLE_Y], clamp),
              opacity: oneEnterOp * exitOp,
              fontFamily: geistFont,
              fontSize: interpolate(morphT, [0, 1], [42, 60], clamp),
              fontWeight: morphT > 0.5 ? 600 : 500,
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
              willChange: "transform, opacity",
            }}>
              <span style={{
                color: ARIA_COLORS.mutedFg,
                opacity: interpolate(morphT, [0.5, 0.9], [1, 0], clamp),
                position: "absolute",
                left: 0, right: 0,
              }}>
                One intelligent entry point.
              </span>
              <span style={{
                color: ARIA_COLORS.foreground,
                opacity: interpolate(morphT, [0.5, 0.9], [0, 1], clamp),
              }}>
                One intelligent entry point.
              </span>
            </div>

            {/* "Tailored by you. Without developers." — at SUB_Y, fades in */}
            <div style={{
              position: "absolute",
              left: 0, right: 0,
              top: SUB_Y,
              opacity: subOp * exitOp,
              fontFamily: geistFont,
              fontSize: 42,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
              color: ARIA_COLORS.mutedFg,
            }}>
              Tailored by you. Without developers.
            </div>
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};
