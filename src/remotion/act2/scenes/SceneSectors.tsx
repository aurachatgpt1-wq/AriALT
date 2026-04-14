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

// ─── Sectors ────────────────────────────────────────────────────────────────
const SECTORS = [
  "Manufacturing",
  "Energy & Utilities",
  "Facility Management",
  "Transport & Logistics",
  "Pharma & Life Sciences",
  "OEM",
  "Railway",
  "OIL & GAS",
  "Green Economy",
];

// ─── Timing ─────────────────────────────────────────────────────────────────
const P_INTRO            = 2;
const P_FIRST_SECTOR     = 10;
const SECTOR_DUR         = 20;                                              // each sector ~0.67s
const SUMMARY_START      = P_FIRST_SECTOR + SECTORS.length * SECTOR_DUR + 2; // 192
const PILLS_HOLD_END     = SUMMARY_START + 50;                               // 242
const PILLS_SCENE_END    = PILLS_HOLD_END + 18;                              // 260
const BLOB_MORPH_START   = PILLS_HOLD_END;                                   // 242
const SCENE_END          = 280;

// Orbit layout
const ORBIT_CX = 960;
const ORBIT_CY = 540;
const ORBIT_RADIUS = 310;

// ─── Shimmer ────────────────────────────────────────────────────────────────
const sectorShimmer = (localFrame: number, startFrame: number): React.CSSProperties => {
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

// ─── Scene ──────────────────────────────────────────────────────────────────
export const SceneSectors: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

  const sp = (f: number, stiff = 180, damp = 24, mass = 0.9) =>
    spring({ frame: frame - f, fps, config: { stiffness: stiff, damping: damp, mass } });

  // No global exit fade — hands off to SceneFormProfile pixel-perfect
  const sceneOp = 1;

  // Intro: blob + label fade in
  const introT = sp(P_INTRO, 240, 24, 0.8);
  const introOp = interpolate(introT, [0, 1], [0, 1]);

  // Pills exit
  const pillsExitOp = interpolate(frame, [PILLS_HOLD_END, PILLS_SCENE_END], [1, 0], clamp);

  // Blob morph to Form position (after pills fade)
  const blobMorphT = spring({
    frame: frame - BLOB_MORPH_START,
    fps,
    config: { stiffness: 80, damping: 22, mass: 1.1 },
  });
  const FORM_BLOB_CX = 622;
  const FORM_BLOB_CY = 540;
  const FORM_BLOB_SIZE = 120;
  const INTRO_BLOB_CX = 960;
  const INTRO_BLOB_CY = 540;
  const INTRO_BLOB_SIZE = 220;
  const blobSize = interpolate(blobMorphT, [0, 1], [INTRO_BLOB_SIZE, FORM_BLOB_SIZE], clamp);
  const blobCX   = interpolate(blobMorphT, [0, 1], [INTRO_BLOB_CX, FORM_BLOB_CX], clamp);
  const blobCY   = interpolate(blobMorphT, [0, 1], [INTRO_BLOB_CY, FORM_BLOB_CY], clamp);
  const tSec = frame / fps;
  const blobBreathe = 1 + Math.sin(tSec * 2.2) * 0.06;

  // Active sector index (spotlight phase)
  const activeIdx = Math.min(
    SECTORS.length - 1,
    Math.max(0, Math.floor((frame - P_FIRST_SECTOR) / SECTOR_DUR)),
  );

  return (
    <AbsoluteFill style={{ opacity: sceneOp, overflow: "hidden" }}>
      {/* ── Base background ── */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "#F0F3FF" }} />

      {/* Soft ambient washes */}
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

      {/* ── Uppercase label at top ── */}
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
          fontFamily: geistFont,
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: "0.30em",
          textTransform: "uppercase",
          color: "rgba(59,91,219,0.72)",
        }}>
          Industries We Serve
        </span>
      </div>

      {/* ── WindRing3D blob — morphs to Form position at end ── */}
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

      {/* ── Spotlight sector name — one at a time, big shimmer text ── */}
      {frame < SUMMARY_START && SECTORS.map((sector, i) => {
        const startF = P_FIRST_SECTOR + i * SECTOR_DUR;
        const endF   = startF + SECTOR_DUR;
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
          <div key={sector} style={{
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
            ...sectorShimmer(frame, startF),
          }}>
            {sector}
          </div>
        );
      })}

      {/* ── Progress dots ── */}
      {frame < SUMMARY_START && frame >= P_FIRST_SECTOR - 6 && (
        <div style={{
          position: "absolute",
          left: 0, right: 0,
          top: 940,
          display: "flex",
          justifyContent: "center",
          gap: 10,
          opacity: interpolate(frame, [P_FIRST_SECTOR - 6, P_FIRST_SECTOR + 4], [0, 1], clamp),
          zIndex: 8,
        }}>
          {SECTORS.map((_, i) => {
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
                transition: "all 200ms ease-out",
              }} />
            );
          })}
        </div>
      )}

      {/* ── Summary: pills orbit in a circle around the blob ── */}
      {frame >= SUMMARY_START - 4 && frame < PILLS_SCENE_END + 2 && (() => {
        const orbitRotation = interpolate(
          frame, [SUMMARY_START, PILLS_HOLD_END], [0, 8], clamp,
        );

        return (
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
              const enterFrame = SUMMARY_START + i * 3;
              const s = spring({
                frame: frame - enterFrame,
                fps,
                config: { stiffness: 160, damping: 20, mass: 0.7 },
              });

              const angle = (i / SECTORS.length) * Math.PI * 2 - Math.PI / 2;
              const r = interpolate(s, [0, 1], [0, ORBIT_RADIUS], clamp);
              const x = Math.cos(angle) * r;
              const y = Math.sin(angle) * r;
              const scale = interpolate(s, [0, 1], [0.4, 1], clamp);
              const itemOp = interpolate(s, [0, 1], [0, 1], clamp) * pillsExitOp;

              if (itemOp < 0.005) return null;

              return (
                <div key={sector} style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  transform: `translate(-50%, -50%) scale(${scale})`,
                  opacity: itemOp,
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "14px 26px",
                  borderRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.95)",
                  border: "1px solid rgba(59,91,219,0.22)",
                  boxShadow:
                    "0 8px 32px -10px rgba(59,91,219,0.22), " +
                    "0 2px 10px -4px rgba(102,112,153,0.12)",
                  willChange: "transform, opacity",
                  whiteSpace: "nowrap",
                }}>
                  <span style={{
                    fontFamily: geistFont,
                    fontSize: 22,
                    fontWeight: 600,
                    color: ARIA_COLORS.foreground,
                    letterSpacing: "-0.016em",
                  }}>
                    {sector}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};
