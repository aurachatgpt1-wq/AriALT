import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ARIA_COLORS, geistFont } from "../constants";

interface WizardShellProps {
  stepIndex: number;       // 0-4
  totalSteps?: number;
  progressOverride?: number; // 0-100, overrides auto
  children: React.ReactNode;
  enterFrame?: number;
  dramaticEntrance?: boolean;  // emerge-from-center transition
}

const STEP_LABELS = ["Welcome", "Your Plant", "Documents", "AI Agents", "Ready"];

export const WizardShell: React.FC<WizardShellProps> = ({
  stepIndex,
  totalSteps = 5,
  progressOverride,
  children,
  enterFrame = 0,
  dramaticEntrance = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterT = spring({
    frame: frame - enterFrame, fps,
    config: dramaticEntrance
      ? { damping: 22, stiffness: 110, mass: 0.9 }   // slower, more dramatic
      : { damping: 22, stiffness: 180, mass: 0.7 },
  });
  const opacity = interpolate(enterT, [0, 1], [0, 1]);
  const scale   = dramaticEntrance
    ? interpolate(enterT, [0, 1], [0.35, 1])        // scales up from small (emerges from center)
    : interpolate(enterT, [0, 1], [0.96, 1]);

  // For dramatic entrance, fade in the background too so previous scene shows through
  const bgOpacity = dramaticEntrance
    ? interpolate(enterT, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  const progress = progressOverride ?? ((stepIndex + 1) / totalSteps) * 100;

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {/* ── Dynamic animated background (same as form) — fades in for dramatic entrance ── */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "#F0F3FF", opacity: bgOpacity }} />

      {/* Blob 1 — primary blue, top-left, slow drift */}
      <div style={{
        position: "absolute",
        width: 900, height: 700, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,91,219,0.18) 0%, transparent 70%)",
        left: interpolate(frame, [0, 300], [-120, 60]),
        top:  interpolate(frame, [0, 300], [-160, -80]),
        filter: "blur(60px)",
        opacity: bgOpacity,
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

      {/* Wizard card */}
      <div style={{
        width: 960, height: 620,
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        border: "1px solid rgba(214,217,227,0.5)",
        boxShadow: "0 20px 60px -10px rgba(59,91,219,0.12), 0 4px 20px -4px rgba(0,0,0,0.08)",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        opacity,
        transform: `scale(${scale})`,
      }}>
        {/* Progress bar */}
        <div style={{ height: 3, backgroundColor: "rgba(214,217,227,0.4)", flexShrink: 0 }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            backgroundColor: ARIA_COLORS.primary,
            transition: "width 0.7s ease",
            borderRadius: "0 2px 2px 0",
          }} />
        </div>

        {/* Step dots */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 8, paddingTop: 16, paddingBottom: 4, flexShrink: 0,
        }}>
          {STEP_LABELS.map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: i === stepIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i < stepIndex ? ARIA_COLORS.primary
                  : i === stepIndex ? ARIA_COLORS.primary
                  : "rgba(214,217,227,0.6)",
                transition: "all 0.4s ease",
                opacity: i > stepIndex ? 0.4 : 1,
              }} />
              {i < totalSteps - 1 && (
                <div style={{ width: 20, height: 1, backgroundColor: i < stepIndex ? ARIA_COLORS.primary : "rgba(214,217,227,0.5)" }} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          {children}
        </div>

        {/* Bottom bar */}
        <div style={{
          flexShrink: 0,
          borderTop: "1px solid rgba(214,217,227,0.4)",
          padding: "14px 36px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontFamily: geistFont, fontSize: 12, color: ARIA_COLORS.mutedFg }}>
            {stepIndex + 1} of {totalSteps}
          </span>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            backgroundColor: ARIA_COLORS.primary,
            color: "#fff",
            borderRadius: 9999,
            padding: "8px 20px",
            fontFamily: geistFont,
            fontSize: 13,
            fontWeight: 600,
          }}>
            {stepIndex === totalSteps - 1 ? "Go to dashboard" : stepIndex === 0 ? "Let's start" : "Continue"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
