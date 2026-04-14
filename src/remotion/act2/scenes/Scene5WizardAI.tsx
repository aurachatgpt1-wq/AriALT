import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ARIA_COLORS, ARIA_RADIUS, geistFont } from "../constants";
import { WizardShell } from "../components/WizardShell";

const AGENTS = [
  {
    title: "Extraction",
    desc: "Reads documents, classifies content, creates structured records.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    accent: "#3B5BDB",
  },
  {
    title: "Enrichment",
    desc: "Rewrites descriptions, enriches root causes and solutions, translates.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    accent: "#7C3AED",
  },
  {
    title: "Diagnostics",
    desc: "Analyzes alarms, identifies root cause, generates work orders.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    accent: "#DC2626",
  },
  {
    title: "Orchestrator",
    desc: "Talk in natural language. Search, create orders, assign teams.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    accent: "#059669",
  },
  {
    title: "Advisor",
    desc: "Anticipates issues. Analyzes trends, suggests optimizations.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
    accent: "#D97706",
  },
  {
    title: "Knowledge Base",
    desc: "Answers grounded in your documents. Always cites the source.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
      </svg>
    ),
    accent: "#0891B2",
  },
];

const P_TITLE = 8;
const P_CARDS = 25;

export const Scene5WizardAI: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sp = (f: number, s = 300, d = 22) =>
    spring({ frame: frame - f, fps, config: { stiffness: s, damping: d, mass: 0.5 } });

  const titleT = sp(P_TITLE);

  return (
    <WizardShell stepIndex={3} progressOverride={80}>
      <div style={{
        display: "flex", flexDirection: "column", justifyContent: "center",
        height: "100%", padding: "20px 60px",
      }}>
        <div style={{
          marginBottom: 28,
          opacity: interpolate(titleT,[0,1],[0,1]),
          transform: `translateY(${interpolate(titleT,[0,1],[12,0])}px)`,
        }}>
          <h2 style={{ fontFamily: geistFont, fontSize: 32, fontWeight: 800, color: ARIA_COLORS.foreground, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Your AI agents.{" "}
            <span style={{ color: ARIA_COLORS.mutedFg, fontWeight: 600 }}>One unified brain.</span>
          </h2>
          <p style={{ fontFamily: geistFont, fontSize: 13, color: ARIA_COLORS.mutedFg, margin: 0, lineHeight: 1.6 }}>
            After upload, AriA activates specialists that work on your data.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {AGENTS.map((agent, i) => {
            const t = sp(P_CARDS + i * 12, 320, 24);
            return (
              <div key={agent.title} style={{
                borderRadius: ARIA_RADIUS.lg,
                border: `1px solid rgba(214,217,227,0.5)`,
                padding: "16px 18px 18px",
                backgroundColor: "rgba(255,255,255,0.8)",
                opacity: interpolate(t,[0,1],[0,1]),
                transform: `translateY(${interpolate(t,[0,1],[16,0])}px) scale(${interpolate(t,[0,1],[0.95,1])})`,
              }}>
                <div style={{ color: agent.accent, marginBottom: 8 }}>{agent.icon}</div>
                <p style={{ fontFamily: geistFont, fontSize: 13, fontWeight: 700, color: ARIA_COLORS.foreground, margin: "0 0 4px" }}>
                  {agent.title}
                </p>
                <p style={{ fontFamily: geistFont, fontSize: 11, color: ARIA_COLORS.mutedFg, margin: 0, lineHeight: 1.55 }}>
                  {agent.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </WizardShell>
  );
};
