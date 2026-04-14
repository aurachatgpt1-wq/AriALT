import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { WindRing3D } from "../components/WindRing3D";

// ─── Shared animated background (matches SceneFormProfile) ──────────────────
const SharedBg: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#F0F3FF" }} />

    {/* Blob 1 — primary blue, top-left, slow drift */}
    <div style={{
      position: "absolute",
      width: 900, height: 700, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(59,91,219,0.18) 0%, transparent 70%)",
      left: interpolate(frame, [0, 300], [-120, 60]),
      top:  interpolate(frame, [0, 300], [-160, -80]),
      filter: "blur(60px)",
    }} />

    {/* Blob 2 — accent blue, right, oscillates */}
    <div style={{
      position: "absolute",
      width: 800, height: 800, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(107,142,255,0.15) 0%, transparent 65%)",
      right: interpolate(frame, [0, 300], [-200, -80]),
      top:   interpolate(frame, [0, 300], [100, 260]),
      filter: "blur(70px)",
    }} />

    {/* Blob 3 — light indigo, bottom */}
    <div style={{
      position: "absolute",
      width: 700, height: 600, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(165,184,255,0.20) 0%, transparent 65%)",
      left:   interpolate(frame, [0, 300], [200, 400]),
      bottom: interpolate(frame, [0, 300], [-180, -100]),
      filter: "blur(55px)",
    }} />

    {/* Blob 4 — subtle center */}
    <div style={{
      position: "absolute",
      width: 600, height: 500, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(59,91,219,0.07) 0%, transparent 60%)",
      left: interpolate(frame, [0, 300], [500, 640]),
      top:  interpolate(frame, [0, 300], [150, 80]),
      filter: "blur(80px)",
    }} />

    {/* Subtle noise texture */}
    <div style={{
      position: "absolute", inset: 0,
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
      backgroundSize: "200px", pointerEvents: "none",
    }} />
  </>
);

// ─── Scene ────────────────────────────────────────────────────────────────────
// The 3D wind ring enters big & centered, then shrinks and slides to the exact
// position where the SceneAreas intro blob will appear, for a seamless
// scene-to-scene transition (Scene1 → SceneAreas → SceneFormProfile).
export const Scene1LogoReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Enter spring — fade in and scale in the first frames
  const enterT = spring({
    frame: frame - 6,
    fps,
    config: { stiffness: 380, damping: 18, mass: 0.5 },
  });
  const enterOpacity = interpolate(enterT, [0, 1], [0, 1]);
  const enterScale   = interpolate(enterT, [0, 1], [0.4, 1]);

  // ── Target position of the SceneAreas intro blob ─────────────────────────
  // SceneAreas opens with the WindRing3D centred at (960, 540) at size 220.
  // We shrink/slide Scene1's large blob into that exact spot so the two
  // scenes feel like one continuous element.
  const ANALYZE_BLOB_SIZE = 220;
  const ANALYZE_BLOB_CX   = 960;
  const ANALYZE_BLOB_CY   = 540;

  // Hero size at the start of the scene
  const HERO_SIZE = 560;
  const HERO_CX   = 960;
  const HERO_CY   = 540;

  // ── Shrink & slide transition (frames 55 → 88) ─────────────────────────────
  // hero → analyzing position — uses a smooth spring for natural motion
  const transitionT = spring({
    frame: frame - 55,
    fps,
    config: { stiffness: 70, damping: 22, mass: 1.1 },
  });

  const orbSize = interpolate(transitionT, [0, 1], [HERO_SIZE, ANALYZE_BLOB_SIZE]);
  const orbCx   = interpolate(transitionT, [0, 1], [HERO_CX,   ANALYZE_BLOB_CX]);
  const orbCy   = interpolate(transitionT, [0, 1], [HERO_CY,   ANALYZE_BLOB_CY]);

  const orbLeft = orbCx - orbSize / 2;
  const orbTop  = orbCy - orbSize / 2;

  return (
    <AbsoluteFill>
      <SharedBg frame={frame} />

      {/* 3D wind ring */}
      <div style={{
        position: "absolute",
        left: orbLeft,
        top: orbTop,
        width: orbSize,
        height: orbSize,
        opacity: enterOpacity,
        transform: `scale(${enterScale})`,
        transformOrigin: "center",
        zIndex: 20,
        pointerEvents: "none",
      }}>
        <WindRing3D size={orbSize} frame={frame} fps={fps} />
      </div>
    </AbsoluteFill>
  );
};
