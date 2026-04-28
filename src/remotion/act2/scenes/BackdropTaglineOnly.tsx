// ─────────────────────────────────────────────────────────────────────────────
// Backdrop + Tagline Only — the "mobile beat" of SceneAgentCMMSCinema with
// the phone stripped out. Renders just the ambient background (soft gradient
// + mood blobs) and the two-phase Apple-keynote tagline
//   Phase 1: "Designed with your field operators, in mind, too."
//   Phase 2: "Predicted in the cloud, solved on the floor."
//
// Useful as a standalone clean plate you can composite behind a live phone
// recording, behind the greenscreen phone comp, or as its own interstitial.
//
// Output:
//   - Aspect    : 1920 × 1080 (matches the cinema composition exactly)
//   - FPS       : 30
//   - Duration  : 280 frames (~9.3 s) — covers both tagline phases in + out
//   - Frame 0 is aligned to the phone's local frame 0 (what the tagline calls
//     `f`), so timing reads identically to the cinema scene.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadGeist } from "@remotion/google-fonts/Inter";
import { AppleBackdropTagline } from "./SceneAgentCMMSCinema";

const { fontFamily: geistFont } = loadGeist();

export const BACKDROP_TAGLINE_FPS      = 30;
export const BACKDROP_TAGLINE_WIDTH    = 1920;
export const BACKDROP_TAGLINE_HEIGHT   = 1080;
export const BACKDROP_TAGLINE_DURATION = 280;

// Same ambient blobs the cinema scene uses during the mobile beat (warm
// amber + soft red + cool accent) over the base off-white gradient.
const BLOBS: Array<{ x: number; y: number; color: string; size: number }> = [
  { x: 26, y: 36, color: "rgba(245,158,11,0.24)", size: 1100 },
  { x: 72, y: 72, color: "rgba(229,57,53,0.18)", size:  900 },
  { x: 50, y: 50, color: "rgba(74,109,245,0.12)", size:  700 },
];

export const BackdropTaglineOnly: React.FC = () => {
  const f = useCurrentFrame();

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(180deg, #F6F7FA 0%, #EEF0F4 100%)",
      overflow: "hidden",
      fontFamily: geistFont,
    }}>
      {/* ── Ambient mood blobs (soft, huge, blurred) ───────────────────── */}
      {BLOBS.map((b, i) => (
        <div key={i} style={{
          position: "absolute",
          top: `${b.y}%`, left: `${b.x}%`,
          width: b.size, height: b.size,
          marginLeft: -b.size / 2,
          marginTop:  -b.size / 2,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${b.color} 0%, transparent 65%)`,
          filter: "blur(40px)",
          pointerEvents: "none",
        }} />
      ))}

      {/* ── Apple-keynote tagline (two phases, no phone) ──────────────── */}
      <AppleBackdropTagline f={f} />
    </AbsoluteFill>
  );
};
