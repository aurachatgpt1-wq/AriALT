import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ARIA_COLORS, ARIA_RADIUS, geistFont } from "../constants";
import { WizardShell } from "../components/WizardShell";

const PILLARS = [
  {
    num: "01",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
      </svg>
    ),
    title: "Upload",
    desc: "PDF manuals, Excel sheets, spare parts catalogs. No formatting required.",
  },
  {
    num: "02",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0V4.5A2.5 2.5 0 0 1 9.5 2z"/><path d="M14.5 8A2.5 2.5 0 0 1 17 10.5v9a2.5 2.5 0 0 1-5 0v-9A2.5 2.5 0 0 1 14.5 8z"/>
      </svg>
    ),
    title: "AI understands",
    desc: "Extracts assets, alarms, maintenance plans and spare parts. Automatically.",
  },
  {
    num: "03",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    title: "You act",
    desc: "Diagnostics, work orders, chat with your plant. Everything in one click.",
  },
];

const P_HEADLINE = 20;
const P_SUB      = 36;
const P_PILLARS  = 50;

export const Scene2WizardHero: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sp = (f: number, stiff = 260, damp = 22) =>
    spring({ frame: frame - f, fps, config: { stiffness: stiff, damping: damp, mass: 0.5 } });

  const h1T = sp(P_HEADLINE);
  const subT = sp(P_SUB);

  return (
    <WizardShell stepIndex={0} enterFrame={0} dramaticEntrance>
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        height: "100%", padding: "0 60px",
      }}>
        {/* Headline */}
        <div style={{ textAlign: "center", marginBottom: 48, opacity: interpolate(h1T,[0,1],[0,1]), transform: `translateY(${interpolate(h1T,[0,1],[16,0])}px)` }}>
          <h1 style={{
            fontFamily: geistFont, fontSize: 52, fontWeight: 800,
            color: ARIA_COLORS.foreground, lineHeight: 1.06, margin: 0, letterSpacing: "-0.02em",
          }}>
            Your plant.
            <br />
            <span style={{ color: ARIA_COLORS.mutedFg, fontWeight: 600 }}>Under control.</span>
          </h1>
          <p style={{
            fontFamily: geistFont, fontSize: 16, color: ARIA_COLORS.mutedFg,
            marginTop: 16, maxWidth: 380, lineHeight: 1.6, fontWeight: 400,
            opacity: interpolate(subT,[0,1],[0,1]),
            transform: `translateY(${interpolate(subT,[0,1],[10,0])}px)`,
          }}>
            Upload your technical documents. AriA does the rest.
          </p>
        </div>

        {/* 3 Pillars */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, width: "100%" }}>
          {PILLARS.map((p, i) => {
            const t = sp(P_PILLARS + i * 18, 280, 24);
            return (
              <div key={p.num} style={{
                padding: "24px 24px 26px",
                backgroundColor: i === 1 ? ARIA_COLORS.primaryLight : "rgba(243,244,247,0.7)",
                borderRadius: ARIA_RADIUS.xl,
                border: `1px solid ${i === 1 ? ARIA_COLORS.primaryBorder : "rgba(214,217,227,0.5)"}`,
                opacity: interpolate(t,[0,1],[0,1]),
                transform: `translateY(${interpolate(t,[0,1],[20,0])}px)`,
              }}>
                <span style={{ fontFamily: geistFont, fontSize: 10, fontWeight: 600, color: ARIA_COLORS.labelFg, letterSpacing: "0.1em" }}>{p.num}</span>
                <div style={{ color: i === 1 ? ARIA_COLORS.primary : ARIA_COLORS.foreground, marginTop: 10, marginBottom: 10 }}>{p.icon}</div>
                <p style={{ fontFamily: geistFont, fontSize: 14, fontWeight: 700, color: ARIA_COLORS.foreground, margin: "0 0 6px" }}>{p.title}</p>
                <p style={{ fontFamily: geistFont, fontSize: 12, color: ARIA_COLORS.mutedFg, margin: 0, lineHeight: 1.55 }}>{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </WizardShell>
  );
};
