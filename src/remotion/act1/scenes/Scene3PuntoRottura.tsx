import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../constants";
import { CmmsShell } from "../components/CmmsShell";
import { WorkOrderForm } from "../components/WorkOrderForm";
import { ScreenShake } from "../components/ScreenShake";
import { NarrationText } from "../components/NarrationText";
import { MessagingPopup, PopupData } from "../components/MessagingPopup";

// Parabolic timing: appearFrame = 5 + 0.145 * i^2
// i=0→5  i=5→8  i=10→19  i=15→37  i=20→63  i=25→96  i=29→127
// Slow start, exponential acceleration toward end
const POPUPS: PopupData[] = [
  // ── Phase 1: slow trickle (i 0-5, frames 5-15) ──────────────────────────
  {
    app: "whatsapp", sender: "Marco R.", group: "Maintenance Team 🔧",
    message: "guys motor M-401 is vibrating badly, someone needs to check it NOW",
    time: "09:12", appearFrame: 5,
    x: 780, y: 40, from: "top", rotation: -1.2,
  },
  {
    app: "teams", sender: "Plant Manager", group: "Line A — Operations",
    message: "WO-0839 still open and overdue. Why wasn't Pump #3 serviced last week?",
    time: "09:14", appearFrame: 13,
    x: 160, y: 100, from: "left", rotation: 1.5,
  },
  {
    app: "email", sender: "Safety Dept.",
    message: "URGENT: Safety inspection on Line A is 5 days overdue. Compliance at risk.",
    time: "09:15", appearFrame: 22,
    x: 1270, y: 60, from: "right", rotation: -0.8,
  },

  // ── Phase 2: picking up pace (i 6-13, frames 30-70) ─────────────────────
  {
    app: "whatsapp", sender: "Luigi B.", group: "Maintenance Team 🔧",
    message: "spare bearings almost gone — only 2 left. Who ordered more??",
    time: "09:17", appearFrame: 30,
    x: 500, y: 290, from: "top", rotation: 0.9,
  },
  {
    app: "teams", sender: "Supervisor A.", group: "Shift Handover",
    message: "HEX-104 showing abnormal temp readings. Assign someone please",
    time: "09:18", appearFrame: 39,
    x: 1060, y: 240, from: "right", rotation: -1.8,
  },
  {
    app: "whatsapp", sender: "Roberto V.", group: "Maintenance Team 🔧",
    message: "nobody told me about WO-0841, waiting 2 days for assignment 🤦",
    time: "09:19", appearFrame: 47,
    x: 55, y: 380, from: "left", rotation: 2.0,
  },
  {
    app: "email", sender: "ERP System",
    message: "AUTO-ALERT: 3 preventive maintenance plans are past due date.",
    time: "09:21", appearFrame: 55,
    x: 1310, y: 340, from: "right", rotation: -1.1,
  },
  {
    app: "sms", sender: "+39 335 841 2290",
    message: "ALARM: Conveyor CNV-502 stopped. Zone 2 blocked. Line down.",
    time: "09:22", appearFrame: 63,
    x: 660, y: 500, from: "bottom", rotation: 1.3,
  },

  // ── Phase 3: rapid fire (i 14-21, frames 72-105) ─────────────────────────
  {
    app: "teams", sender: "Director G.", group: "Management",
    message: "I need a status update on Line A NOW. What is going on down there??",
    time: "09:23", appearFrame: 72,
    x: 270, y: 550, from: "left", rotation: -2.2,
  },
  {
    app: "whatsapp", sender: "Marco R.", group: "Maintenance Team 🔧",
    message: "hydraulic oil leak in Zone 2 too. Who's handling this? I can't be everywhere 😤",
    time: "09:24", appearFrame: 80,
    x: 1090, y: 490, from: "right", rotation: 0.7,
  },
  {
    app: "email", sender: "Supplier — Meccanica SRL",
    message: "Re: Order #4821 — Part delivery delayed 2 weeks.",
    time: "09:25", appearFrame: 87,
    x: 45, y: 620, from: "left", rotation: -1.5,
  },
  {
    app: "teams", sender: "Safety Officer", group: "Safety & Compliance",
    message: "GBX-201 vibration alert triggered. Do NOT operate until inspected.",
    time: "09:26", appearFrame: 93,
    x: 1370, y: 570, from: "right", rotation: 1.8,
  },
  {
    app: "whatsapp", sender: "Giovanni F.", group: "Maintenance Team 🔧",
    message: "shift change report not updated again 😡 third time this week",
    time: "09:27", appearFrame: 99,
    x: 620, y: 670, from: "bottom", rotation: -0.7,
  },
  {
    app: "sms", sender: "+39 347 220 8811",
    message: "Line A still stopped. Warehouse waiting. When can we resume??",
    time: "09:28", appearFrame: 105,
    x: 950, y: 650, from: "bottom", rotation: 1.1,
  },

  // ── Phase 4: bombardment (i 22-35, frames 110-145, 2-3 frames each) ──────
  {
    app: "whatsapp", sender: "Stefano M.", group: "Line A Workers",
    message: "machine stopped again, what do we do? waiting for instructions",
    time: "09:29", appearFrame: 110,
    x: 380, y: 160, from: "top", rotation: -1.4,
  },
  {
    app: "teams", sender: "HR Dept.", group: "Company",
    message: "Reminder: safety certification for 3 operators expires this Friday.",
    time: "09:29", appearFrame: 113,
    x: 1150, y: 130, from: "top", rotation: 0.5,
  },
  {
    app: "email", sender: "Quality Control",
    message: "Non-conformity report #NC-2024-047 requires sign-off. Deadline today.",
    time: "09:30", appearFrame: 116,
    x: 100, y: 240, from: "left", rotation: 1.9,
  },
  {
    app: "whatsapp", sender: "Luca P.", group: "Maintenance Team 🔧",
    message: "pump PMP-203 making strange noise now, should we stop it?",
    time: "09:30", appearFrame: 119,
    x: 1400, y: 210, from: "right", rotation: -2.0,
  },
  {
    app: "sms", sender: "+39 328 774 1203",
    message: "URGENT: client on-site inspection tomorrow 8am. Is Line A ready?",
    time: "09:31", appearFrame: 122,
    x: 580, y: 130, from: "top", rotation: 1.6,
  },
  {
    app: "teams", sender: "Operations Mgr.", group: "Daily Ops",
    message: "production is 3 hours behind schedule. We need this resolved NOW.",
    time: "09:31", appearFrame: 125,
    x: 200, y: 470, from: "left", rotation: -0.9,
  },
  {
    app: "whatsapp", sender: "Marco R.", group: "Maintenance Team 🔧",
    message: "still nobody came for the motor 🚨🚨🚨",
    time: "09:32", appearFrame: 128,
    x: 900, y: 380, from: "top", rotation: 2.3,
  },
  {
    app: "email", sender: "Finance Dept.",
    message: "Spare parts budget overrun by 40%. Approval needed before next order.",
    time: "09:32", appearFrame: 131,
    x: 1240, y: 440, from: "right", rotation: -1.3,
  },
  {
    app: "whatsapp", sender: "Roberto V.", group: "Maintenance Team 🔧",
    message: "I found the leak but I don't have the right seal with me 😩",
    time: "09:33", appearFrame: 133,
    x: 60, y: 540, from: "left", rotation: 1.0,
  },
  {
    app: "teams", sender: "Director G.", group: "Management",
    message: "I'm calling an emergency meeting in 10 minutes. EVERYONE.",
    time: "09:33", appearFrame: 135,
    x: 700, y: 200, from: "top", rotation: -1.7,
  },
  {
    app: "sms", sender: "+39 335 841 2290",
    message: "Line STILL down. 4 hours of production lost.",
    time: "09:34", appearFrame: 137,
    x: 1380, y: 680, from: "right", rotation: 0.4,
  },
  {
    app: "whatsapp", sender: "Giovanni F.", group: "Maintenance Team 🔧",
    message: "can someone answer?? 👋👋",
    time: "09:34", appearFrame: 139,
    x: 440, y: 700, from: "bottom", rotation: -1.1,
  },
  {
    app: "email", sender: "Plant Manager",
    message: "This is unacceptable. Full incident report by end of day.",
    time: "09:35", appearFrame: 141,
    x: 980, y: 730, from: "bottom", rotation: 1.4,
  },
  {
    app: "whatsapp", sender: "Luigi B.", group: "Maintenance Team 🔧",
    message: "ordered the parts but express delivery costs 3x normal 💸",
    time: "09:35", appearFrame: 143,
    x: 220, y: 680, from: "bottom", rotation: -0.6,
  },
  {
    app: "teams", sender: "Safety Officer", group: "Safety & Compliance",
    message: "⚠️ Line A unsafe until formal clearance. Stopping operations.",
    time: "09:36", appearFrame: 145,
    x: 1160, y: 710, from: "right", rotation: 1.2,
  },
  {
    app: "sms", sender: "+39 347 220 8811",
    message: "ESCALATING TO REGIONAL DIRECTOR. 5 hours lost.",
    time: "09:36", appearFrame: 147,
    x: 600, y: 30, from: "top", rotation: -2.4,
  },
];

export const Scene3PuntoRottura: React.FC = () => {
  const frame = useCurrentFrame();

  // Red pulse intensifies as chaos peaks
  const redOpacity =
    frame >= 80
      ? interpolate(
          Math.sin((frame - 80) * 0.15),
          [-1, 1],
          [0, interpolate(frame, [80, 145], [0.04, 0.10])],
        )
      : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bgLight }}>
      {/* CMMS in background — still visible under the chaos */}
      <ScreenShake startFrame={70} maxAmplitude={5} rampUpDuration={60}>
        <CmmsShell slideInStart={-9999} sidebarActiveItem="Work Orders">
          <WorkOrderForm appearFrame={-9999} fillStartFrame={-9999} />
        </CmmsShell>
      </ScreenShake>

      {/* All messaging popups */}
      {POPUPS.map((popup, i) => (
        <MessagingPopup key={i} popup={popup} />
      ))}

      {/* Red tint grows with chaos */}
      <AbsoluteFill
        style={{
          backgroundColor: COLORS.warningRed,
          opacity: redOpacity,
          pointerEvents: "none",
          zIndex: 950,
        }}
      />

      {/* Apple narration */}
      <NarrationText
        position="bottom"
        zoneBg="transparent"
        showBorder={false}
        lines={[
          {
            words: ["Missed.", "Delayed.", "Forgotten."],
            startFrame: 10,
            fontSize: 54,
            color: "#1D1D1F",
            weight: 700,
          },
          {
            words: ["Your", "team", "is", "drowning", "in", "messages."],
            startFrame: 40,
            fontSize: 34,
            color: "#6E6E73",
            weight: 400,
          },
        ]}
      />
    </AbsoluteFill>
  );
};
