import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ARIA_COLORS, geistFont } from "../constants";
import { WizardShell } from "../components/WizardShell";

const LINKS = [
  {
    title: "AI Diagnostics",
    desc: "Root cause, spare parts and work orders in one click.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    accent: "#DC2626",
    accentBg: "#FDF1F1",
  },
  {
    title: "AI Assistant",
    desc: "Describe the issue. AriA understands and acts.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    accent: "#3B5BDB",
    accentBg: "rgba(59,91,219,0.08)",
  },
  {
    title: "Work Orders",
    desc: "Every job tracked from opening to verification.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    accent: "#059669",
    accentBg: "#E8F6F1",
  },
  {
    title: "Analytics",
    desc: "Performance, costs, trends. Everything at a glance.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    accent: "#7C3AED",
    accentBg: "rgba(124,58,237,0.08)",
  },
];

const P_CHECK  = 8;
const P_TITLE  = 22;
const P_HEADER = 42;
const P_CARDS  = 55;

export const Scene6WizardComplete: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sp = (f: number, s = 280, d = 22) =>
    spring({ frame: frame - f, fps, config: { stiffness: s, damping: d, mass: 0.5 } });

  const checkT = sp(P_CHECK, 350, 18);
  const titleT = sp(P_TITLE);

  return (
    <WizardShell stepIndex={4} progressOverride={100}>
      <div style={{
        display: "flex", flexDirection: "column", justifyContent: "center",
        height: "100%", padding: "20px 60px",
      }}>
        {/* Check + title */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            backgroundColor: "rgba(31,168,112,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 18px",
            opacity: interpolate(checkT,[0,1],[0,1]),
            transform: `scale(${interpolate(checkT,[0,1],[0.5,1])})`,
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ARIA_COLORS.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div style={{
            opacity: interpolate(titleT,[0,1],[0,1]),
            transform: `translateY(${interpolate(titleT,[0,1],[10,0])}px)`,
          }}>
            <h2 style={{ fontFamily: geistFont, fontSize: 30, fontWeight: 800, color: ARIA_COLORS.foreground, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
              Your AI colleague is ready.
            </h2>
            <p style={{ fontFamily: geistFont, fontSize: 14, color: ARIA_COLORS.mutedFg, margin: 0 }}>
              It has read your documents. From today, it works by your side.
            </p>
          </div>
        </div>

        {/* Feature cards grid */}
        <div style={{
          borderRadius: 16, border: "1px solid rgba(214,217,227,0.4)",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "14px 24px",
            borderBottom: "1px solid rgba(214,217,227,0.3)",
            opacity: interpolate(sp(P_HEADER),[0,1],[0,1]),
          }}>
            <span style={{ fontFamily: geistFont, fontSize: 10, fontWeight: 700, color: ARIA_COLORS.labelFg, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Where do you want to start?
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
            {LINKS.map((link, i) => {
              const t = sp(P_CARDS + i * 10, 300, 22);
              const isRight = i % 2 === 1;
              const isBottom = i >= 2;
              return (
                <div key={link.title} style={{
                  display: "flex", alignItems: "flex-start", gap: 14,
                  padding: "18px 22px",
                  backgroundColor: "rgba(255,255,255,0.95)",
                  borderRight: isRight ? "none" : "1px solid rgba(214,217,227,0.3)",
                  borderBottom: isBottom ? "none" : "1px solid rgba(214,217,227,0.3)",
                  opacity: interpolate(t,[0,1],[0,1]),
                  transform: `translateY(${interpolate(t,[0,1],[8,0])}px)`,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    backgroundColor: link.accentBg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: link.accent,
                  }}>
                    {link.icon}
                  </div>
                  <div>
                    <p style={{ fontFamily: geistFont, fontSize: 13, fontWeight: 700, color: ARIA_COLORS.foreground, margin: "0 0 3px" }}>{link.title}</p>
                    <p style={{ fontFamily: geistFont, fontSize: 11, color: ARIA_COLORS.mutedFg, margin: 0, lineHeight: 1.5 }}>{link.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </WizardShell>
  );
};
