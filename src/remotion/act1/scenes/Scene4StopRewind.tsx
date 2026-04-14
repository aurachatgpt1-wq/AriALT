import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { interFont } from "../constants";
import { CmmsShell } from "../components/CmmsShell";
import { WorkOrderForm } from "../components/WorkOrderForm";

export const Scene4StopRewind: React.FC = () => {
  const frame = useCurrentFrame();

  const isFreezing = frame < 30;
  const isRewinding = frame >= 30 && frame < 75;
  const isClean = frame >= 75;

  // Rewind progress per layer (staggered)
  const getRewindProgress = (order: number) => {
    if (!isRewinding && !isClean) return 0;
    if (isClean) return 1;
    const stagger = order * 4;
    return interpolate(frame - 30 - stagger, [0, 14], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  };

  const formRewind = getRewindProgress(0);
  const shellRewind = getRewindProgress(1);

  // VHS scan line
  const showScanLine = isFreezing || isRewinding;
  const scanLineY = showScanLine ? (frame * 8) % 1080 : -100;

  // AriA world reveal — fades in as CMMS slides away
  const worldReveal = interpolate(shellRewind, [0.3, 1], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>

      {/* AriA blue world revealed beneath the CMMS */}
      <div style={{ position: "absolute", inset: 0, opacity: worldReveal, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundColor: "#F0F3FF" }} />
        <div style={{
          position: "absolute", width: 900, height: 700, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,91,219,0.18) 0%, transparent 70%)",
          left: -120, top: -160, filter: "blur(60px)",
        }} />
        <div style={{
          position: "absolute", width: 800, height: 800, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(107,142,255,0.15) 0%, transparent 65%)",
          right: -200, top: 100, filter: "blur(70px)",
        }} />
        <div style={{
          position: "absolute", width: 700, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(165,184,255,0.20) 0%, transparent 65%)",
          left: 200, bottom: -180, filter: "blur(55px)",
        }} />
        <div style={{
          position: "absolute", width: 600, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,91,219,0.07) 0%, transparent 60%)",
          left: 500, top: 150, filter: "blur(80px)",
        }} />
      </div>

      {/* CMMS shell slides down on rewind */}
      <div style={{
        transform: `translateY(${interpolate(shellRewind, [0, 1], [0, 900])}px)`,
        opacity: interpolate(shellRewind, [0, 0.8, 1], [1, 0.4, 0]),
      }}>
        <CmmsShell slideInStart={-9999} sidebarActiveItem="Work Orders">
          <div style={{
            opacity: interpolate(formRewind, [0, 1], [1, 0]),
            transform: `scale(${interpolate(formRewind, [0, 1], [1, 0.96])})`,
          }}>
            <WorkOrderForm appearFrame={-9999} fillStartFrame={-9999} />
          </div>
        </CmmsShell>
      </div>

      {/* Mask: hides the CmmsShell top border */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 22, backgroundColor: "#FFFFFF", zIndex: 940 }} />

      {/* VHS scan line */}
      {showScanLine && (
        <div style={{
          position: "absolute", top: scanLineY, left: 0, right: 0, height: 2,
          backgroundColor: "rgba(0,0,0,0.07)", zIndex: 960,
        }} />
      )}

      {/* ◀◀ REWIND flash */}
      {isRewinding && frame >= 32 && frame <= 50 && (
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: 52, fontWeight: 800,
          color: "#1D1D1F", fontFamily: interFont,
          letterSpacing: "0.15em",
          opacity: interpolate(frame, [32, 36, 44, 50], [0, 1, 1, 0]),
          zIndex: 970,
        }}>
          ◀◀ REWIND
        </div>
      )}

      {/* Final clean message — on AriA blue world */}
      {isClean && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: interpolate(frame, [75, 82], [0, 1], { extrapolateRight: "clamp" }),
          zIndex: 980,
        }}>
          <div style={{
            fontFamily: interFont,
            fontSize: 72, fontWeight: 700,
            color: "#1D1D1F",
            letterSpacing: "-0.03em", textAlign: "center",
          }}>
            Wait. There's AI for that, right?
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
