import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { interFont } from "../constants";
import { CmmsShell } from "../components/CmmsShell";
import { WorkOrderForm } from "../components/WorkOrderForm";
import { WindowsDesktop } from "../components/WindowsDesktop";
import { ScreenShake } from "../components/ScreenShake";
import { MessagingPopup, PopupData, AppType } from "../components/MessagingPopup";

// ─── Window bounds inside the Windows desktop ────────────────────────────────
const WINDOW_BOUNDS = {
  top: 36,
  left: 150,
  right: 110,
  bottom: 64,
};

// Popups are now ~420px tall. Keep top-Y such that popups fit above the taskbar
// (taskbar ends at 1040). We only need breathing room, not a narration zone.
const Y_MAX = 560;

// Parabolic timing: appearFrame = 5 + 0.145 * i^2
// i=0→5  i=5→8  i=10→19  i=15→37  i=20→63  i=25→96  i=29→127
// Slow start, exponential acceleration toward end
const POPUPS: PopupData[] = [
  // ── Phase 1: slow trickle ───────────────────────────────────────────────
  { app: "whatsapp", sender: "Marco R.", group: "Maintenance Team 🔧",
    message: "guys motor M-401 is vibrating badly, someone needs to check it NOW",
    time: "09:12", appearFrame: 5, x: 780, y: 40, from: "top", rotation: -1.2 },
  { app: "teams", sender: "Plant Manager", group: "Line A — Operations",
    message: "WO-0839 still open and overdue. Why wasn't Pump #3 serviced last week?",
    time: "09:14", appearFrame: 13, x: 160, y: 100, from: "left", rotation: 1.5 },
  { app: "email", sender: "Safety Dept.",
    message: "URGENT: Safety inspection on Line A is 5 days overdue. Compliance at risk.",
    time: "09:15", appearFrame: 22, x: 1270, y: 60, from: "right", rotation: -0.8 },

  // ── Phase 2: picking up pace ────────────────────────────────────────────
  { app: "whatsapp", sender: "Luigi B.", group: "Maintenance Team 🔧",
    message: "spare bearings almost gone — only 2 left. Who ordered more??",
    time: "09:17", appearFrame: 30, x: 500, y: 230, from: "top", rotation: 0.9 },
  { app: "teams", sender: "Supervisor A.", group: "Shift Handover",
    message: "HEX-104 showing abnormal temp readings. Assign someone please",
    time: "09:18", appearFrame: 39, x: 1060, y: 200, from: "right", rotation: -1.8 },
  { app: "whatsapp", sender: "Roberto V.", group: "Maintenance Team 🔧",
    message: "nobody told me about WO-0841, waiting 2 days for assignment 🤦",
    time: "09:19", appearFrame: 47, x: 55, y: 320, from: "left", rotation: 2.0 },
  { app: "email", sender: "ERP System",
    message: "AUTO-ALERT: 3 preventive maintenance plans are past due date.",
    time: "09:21", appearFrame: 55, x: 1310, y: 290, from: "right", rotation: -1.1 },
  { app: "sms", sender: "+39 335 841 2290",
    message: "ALARM: Conveyor CNV-502 stopped. Zone 2 blocked. Line down.",
    time: "09:22", appearFrame: 63, x: 660, y: 420, from: "bottom", rotation: 1.3 },

  // ── Phase 3: rapid fire ─────────────────────────────────────────────────
  { app: "teams", sender: "Director G.", group: "Management",
    message: "I need a status update on Line A NOW. What is going on down there??",
    time: "09:23", appearFrame: 72, x: 270, y: 470, from: "left", rotation: -2.2 },
  { app: "whatsapp", sender: "Marco R.", group: "Maintenance Team 🔧",
    message: "hydraulic oil leak in Zone 2 too. Who's handling this? I can't be everywhere 😤",
    time: "09:24", appearFrame: 80, x: 1090, y: 410, from: "right", rotation: 0.7 },
  { app: "email", sender: "Supplier — Meccanica SRL",
    message: "Re: Order #4821 — Part delivery delayed 2 weeks.",
    time: "09:25", appearFrame: 87, x: 45, y: 560, from: "left", rotation: -1.5 },
  { app: "teams", sender: "Safety Officer", group: "Safety & Compliance",
    message: "GBX-201 vibration alert triggered. Do NOT operate until inspected.",
    time: "09:26", appearFrame: 93, x: 1370, y: 500, from: "right", rotation: 1.8 },
  { app: "whatsapp", sender: "Giovanni F.", group: "Maintenance Team 🔧",
    message: "shift change report not updated again 😡 third time this week",
    time: "09:27", appearFrame: 99, x: 620, y: 600, from: "bottom", rotation: -0.7 },
  { app: "sms", sender: "+39 347 220 8811",
    message: "Line A still stopped. Warehouse waiting. When can we resume??",
    time: "09:28", appearFrame: 105, x: 950, y: 560, from: "bottom", rotation: 1.1 },

  // ── Phase 4: bombardment ────────────────────────────────────────────────
  { app: "whatsapp", sender: "Stefano M.", group: "Line A Workers",
    message: "machine stopped again, what do we do? waiting for instructions",
    time: "09:29", appearFrame: 110, x: 380, y: 150, from: "top", rotation: -1.4 },
  { app: "teams", sender: "HR Dept.", group: "Company",
    message: "Reminder: safety certification for 3 operators expires this Friday.",
    time: "09:29", appearFrame: 113, x: 1150, y: 130, from: "top", rotation: 0.5 },
  { app: "email", sender: "Quality Control",
    message: "Non-conformity report #NC-2024-047 requires sign-off. Deadline today.",
    time: "09:30", appearFrame: 116, x: 100, y: 220, from: "left", rotation: 1.9 },
  { app: "whatsapp", sender: "Luca P.", group: "Maintenance Team 🔧",
    message: "pump PMP-203 making strange noise now, should we stop it?",
    time: "09:30", appearFrame: 119, x: 1400, y: 200, from: "right", rotation: -2.0 },
  { app: "sms", sender: "+39 328 774 1203",
    message: "URGENT: client on-site inspection tomorrow 8am. Is Line A ready?",
    time: "09:31", appearFrame: 122, x: 580, y: 120, from: "top", rotation: 1.6 },
  { app: "teams", sender: "Operations Mgr.", group: "Daily Ops",
    message: "production is 3 hours behind schedule. We need this resolved NOW.",
    time: "09:31", appearFrame: 125, x: 200, y: 400, from: "left", rotation: -0.9 },
  { app: "whatsapp", sender: "Marco R.", group: "Maintenance Team 🔧",
    message: "still nobody came for the motor 🚨🚨🚨",
    time: "09:32", appearFrame: 128, x: 900, y: 320, from: "top", rotation: 2.3 },
  { app: "email", sender: "Finance Dept.",
    message: "Spare parts budget overrun by 40%. Approval needed before next order.",
    time: "09:32", appearFrame: 131, x: 1240, y: 370, from: "right", rotation: -1.3 },
  { app: "whatsapp", sender: "Roberto V.", group: "Maintenance Team 🔧",
    message: "I found the leak but I don't have the right seal with me 😩",
    time: "09:33", appearFrame: 133, x: 60, y: 480, from: "left", rotation: 1.0 },
  { app: "teams", sender: "Director G.", group: "Management",
    message: "I'm calling an emergency meeting in 10 minutes. EVERYONE.",
    time: "09:33", appearFrame: 135, x: 700, y: 200, from: "top", rotation: -1.7 },
  { app: "sms", sender: "+39 335 841 2290",
    message: "Line STILL down. 4 hours of production lost.",
    time: "09:34", appearFrame: 137, x: 1380, y: 620, from: "right", rotation: 0.4 },
  { app: "whatsapp", sender: "Giovanni F.", group: "Maintenance Team 🔧",
    message: "can someone answer?? 👋👋",
    time: "09:34", appearFrame: 139, x: 440, y: 640, from: "bottom", rotation: -1.1 },
  { app: "email", sender: "Plant Manager",
    message: "This is unacceptable. Full incident report by end of day.",
    time: "09:35", appearFrame: 141, x: 980, y: 680, from: "bottom", rotation: 1.4 },
  { app: "whatsapp", sender: "Luigi B.", group: "Maintenance Team 🔧",
    message: "ordered the parts but express delivery costs 3x normal 💸",
    time: "09:35", appearFrame: 143, x: 220, y: 630, from: "bottom", rotation: -0.6 },
  { app: "teams", sender: "Safety Officer", group: "Safety & Compliance",
    message: "⚠️ Line A unsafe until formal clearance. Stopping operations.",
    time: "09:36", appearFrame: 145, x: 1160, y: 640, from: "right", rotation: 1.2 },
  { app: "sms", sender: "+39 347 220 8811",
    message: "ESCALATING TO REGIONAL DIRECTOR. 5 hours lost.",
    time: "09:36", appearFrame: 147, x: 600, y: 30, from: "top", rotation: -2.4 },
].map((p) => ({ ...p, y: Math.min(p.y, Y_MAX) })) as PopupData[];

// ─── Unread-count HUD (top-right badge pill) ─────────────────────────────────
const APP_HUD: { app: AppType; label: string; icon: string; color: string; base: number }[] = [
  { app: "email",    label: "Outlook",  icon: "📧", color: "#0078D4", base: 7 },
  { app: "teams",    label: "Teams",    icon: "💬", color: "#6264A7", base: 3 },
  { app: "whatsapp", label: "WhatsApp", icon: "💚", color: "#25D366", base: 14 },
  { app: "sms",      label: "SMS",      icon: "📱", color: "#34C759", base: 2 },
];

const UnreadCounterHud: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Slide-in from right
  const hudIn = spring({ frame: frame - 8, fps, config: { damping: 14, stiffness: 140 } });
  const tx = interpolate(hudIn, [0, 1], [360, 0]);
  const opacity = interpolate(hudIn, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: "absolute",
        top: 54,
        right: 24,
        transform: `translateX(${tx}px)`,
        opacity,
        zIndex: 900,
        background: "rgba(18, 22, 30, 0.88)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 14,
        padding: "10px 14px",
        fontFamily: interFont,
        color: "#FFFFFF",
        backdropFilter: "blur(6px)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
        minWidth: 220,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#FF5A5F",
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#FF5A5F",
            boxShadow: "0 0 10px #FF5A5F",
          }}
        />
        Unread · escalating
      </div>

      {APP_HUD.map((row) => {
        const count = POPUPS.filter(
          (p) => p.app === row.app && frame >= p.appearFrame,
        ).length;
        const displayed = row.base + count;
        // Find most recent bump to animate scale
        const lastAppear = POPUPS
          .filter((p) => p.app === row.app && p.appearFrame <= frame)
          .reduce((m, p) => Math.max(m, p.appearFrame), -999);
        const sinceBump = frame - lastAppear;
        const bumpSpring = spring({
          frame: sinceBump,
          fps,
          config: { damping: 8, stiffness: 260, mass: 0.5 },
        });
        const bumpScale =
          sinceBump >= 0 && sinceBump < 12 ? interpolate(bumpSpring, [0, 1], [1.35, 1]) : 1;

        return (
          <div
            key={row.app}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 13, width: 20, textAlign: "center" }}>{row.icon}</span>
            <span style={{ flex: 1, fontSize: 11, opacity: 0.75 }}>{row.label}</span>
            <span
              style={{
                minWidth: 32,
                textAlign: "center",
                padding: "1px 8px",
                background: row.color,
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 800,
                color: "#FFFFFF",
                transform: `scale(${bumpScale})`,
                transformOrigin: "center center",
                boxShadow: sinceBump < 6 ? `0 0 14px ${row.color}` : "none",
              }}
            >
              {displayed}
            </span>
          </div>
        );
      })}

      {/* Total */}
      <div
        style={{
          marginTop: 6,
          paddingTop: 6,
          borderTop: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "baseline",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 10, opacity: 0.6, letterSpacing: "0.1em" }}>TOTAL</span>
        <span style={{ fontSize: 22, fontWeight: 800, color: "#FF5A5F" }}>
          {APP_HUD.reduce(
            (sum, r) =>
              sum + r.base + POPUPS.filter((p) => p.app === r.app && frame >= p.appearFrame).length,
            0,
          )}
        </span>
        <span style={{ fontSize: 11, opacity: 0.6 }}>unread</span>
      </div>
    </div>
  );
};

export const Scene3PuntoRottura: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Red radial vignette intensifies with chaos
  const vignetteOpacity = interpolate(frame, [40, 90, 130, 160], [0, 0.12, 0.22, 0.28], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Subtle pulse on top of intensity
  const vignettePulse =
    frame >= 80
      ? 0.04 * (Math.sin((frame - 80) * 0.22) * 0.5 + 0.5)
      : 0;
  const finalVignetteOpacity = vignetteOpacity + vignettePulse;

  return (
    <AbsoluteFill>
      <WindowsDesktop
        outlookPulseFrame={-9999}
        teamsPulseFrame={-9999}
      >
        {/* CMMS in background — Windows 10 + ERP chrome (change work order: IW32) */}
        <ScreenShake startFrame={70} maxAmplitude={5} rampUpDuration={60}>
          <CmmsShell
            slideInStart={-9999}
            windowStyle="win10"
            contentStyle="erp"
            transactionCode="IW32"
            title="Change Work Order (IW32) — Maintenance Management System"
            rightTitle="Change Work Order: WO-2024-0847"
            windowBounds={WINDOW_BOUNDS}
          >
            <WorkOrderForm appearFrame={-9999} fillStartFrame={-9999} />
          </CmmsShell>
        </ScreenShake>

        {/* Unread-counter HUD (top-right) */}
        <UnreadCounterHud frame={frame} fps={fps} />

        {/* All messaging popups */}
        {POPUPS.map((popup, i) => (
          <MessagingPopup key={i} popup={popup} />
        ))}

        {/* Red radial vignette — dark edges pulsing as chaos peaks */}
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(220,38,38,0) 40%, rgba(220,38,38,0.55) 85%, rgba(120,12,12,0.9) 100%)",
            opacity: finalVignetteOpacity,
            pointerEvents: "none",
            zIndex: 950,
            mixBlendMode: "multiply",
          }}
        />
      </WindowsDesktop>
    </AbsoluteFill>
  );
};
