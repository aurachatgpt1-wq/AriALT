import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// One-line building sentence: Copy. Paste. Email. Repeat.
const ActionSentence: React.FC<{
  frame: number;
  fps: number;
  words: { text: string; appearFrame: number }[];
}> = ({ frame, fps, words }) => (
  <div style={{
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    height: 220,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
  }}>
    {words.map(({ text, appearFrame }) => {
      const progress = spring({
        frame: frame - appearFrame,
        fps,
        config: { damping: 18, stiffness: 200, mass: 0.5 },
      });
      const opacity = interpolate(progress, [0, 1], [0, 1]);
      const translateY = interpolate(progress, [0, 1], [16, 0]);
      return (
        <span key={text} style={{
          fontFamily: interFont,
          fontSize: 56,
          fontWeight: 700,
          color: "#1D1D1F",
          letterSpacing: "-0.02em",
          opacity: frame >= appearFrame ? opacity : 0,
          transform: `translateY(${frame >= appearFrame ? translateY : 16}px)`,
          display: "inline-block",
        }}>
          {text}
        </span>
      );
    })}
  </div>
);
import {
  GPT_USER_MSG,
  GPT_RESPONSE,
  PASTED_NOTES,
  interFont,
  TEXT_ZONE_HEIGHT,
} from "../constants";
import { BrowserShell } from "../components/BrowserShell";
import { ChatGPTWindow, ChatMessage } from "../components/ChatGPTWindow";
import { NarrationText } from "../../act1/components/NarrationText";
import { AnimatedCursor } from "../../act1/components/AnimatedCursor";

const DESKTOP_BG = "#F0F0F0";

// ── Multi-turn conversation ────────────────────────────────────────────────
const FOLLOWUP_1 = "But I need this specific to our setup — Line A, Motor M-401, 75kW ABB motor.";
const RESPONSE_2 = "To provide specific recommendations, please share:\n• Motor model and manufacturer specs\n• Current operating parameters\n• Full maintenance history and failure patterns";
const FOLLOWUP_2 = "It's a 75kW ABB motor, Line A — Zone 3, in service since 2019. Now give me a real plan.";
const RESPONSE_3 = `Based on that, here's an adjusted plan for a 75kW ABB motor:

• Replace bearings every 12–18 months or 8,000 operating hours
• Check shaft alignment quarterly — misalignment accelerates wear
• Monitor vibration weekly: >4.5 mm/s indicates bearing degradation

⚠️ Actual intervals may vary. Consult ABB documentation for model-specific torque specs.`;

const F1_TYPE = 15;
const F1_SEND = 80;
const R2_START = 90;
const F2_TYPE = 148;
const F2_SEND = 195;
const R3_START = 205;
const CONV_END = 240;

// ── Copy-paste phase (local frames 240+) ──────────────────────────────────
const SEL_START  = 244;
const COPY_START = 264;
const CMMS_START = 284;
const PASTE_START = 310;
const OUTLOOK_START = 348;

function getTyped(text: string, frame: number, start: number, speed: number) {
  if (frame < start) return "";
  return text.slice(0, Math.floor((frame - start) * speed));
}

// ── Lightweight CMMS Notes overlay ────────────────────────────────────────
const CmmsNotesOverlay: React.FC<{
  pastedText: string;
  slideX: number;
  opacity: number;
}> = ({ pastedText, slideX, opacity }) => (
  <div
    style={{
      position: "absolute",
      top: 20,
      right: 20,
      width: "56%",
      bottom: TEXT_ZONE_HEIGHT + 10,
      backgroundColor: "#D4D4D4",
      opacity,
      transform: `translateX(${slideX}px)`,
      display: "flex",
      flexDirection: "column",
      fontFamily: interFont,
      borderRadius: 4,
      overflow: "hidden",
      border: "1px solid #999",
      boxShadow: "-8px 0 40px rgba(0,0,0,0.2)",
      zIndex: 60,
    }}
  >
    {/* Title bar */}
    <div style={{
      height: 28,
      background: "linear-gradient(180deg,#4A7EBB,#3A6AA0)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 10px",
      flexShrink: 0,
    }}>
      <span style={{ color: "white", fontSize: 12, fontWeight: 600 }}>
        Maintenance Management System v3.2.1
      </span>
      <div style={{ display: "flex", gap: 5 }}>
        {["─", "□", "×"].map((icon, i) => (
          <div key={i} style={{
            width: 12, height: 12, borderRadius: 1,
            backgroundColor: i === 2 ? "#C75050" : "rgba(255,255,255,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, color: "white",
          }}>{icon}</div>
        ))}
      </div>
    </div>

    {/* Toolbar */}
    <div style={{
      height: 30, backgroundColor: "#C0C0C0",
      borderBottom: "1px solid #999",
      display: "flex", alignItems: "center",
      padding: "0 8px", gap: 5, flexShrink: 0,
    }}>
      {["New", "Save", "Print"].map((b) => (
        <div key={b} style={{
          padding: "2px 9px", backgroundColor: "#D4D4D4",
          border: "1px solid #999", borderRadius: 2,
          fontSize: 11, color: "#333",
        }}>{b}</div>
      ))}
    </div>

    {/* Content */}
    <div style={{ flex: 1, padding: "14px 18px", overflow: "hidden", backgroundColor: "#D4D4D4" }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: "#1A1A1A", marginBottom: 12 }}>New Work Order</div>

      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        <div style={{ flex: "0 0 160px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#555", letterSpacing: "0.06em", marginBottom: 3 }}>WO CODE</div>
          <div style={{ backgroundColor: "#FFF", border: "1px solid #7A7A7A", borderRadius: 2, padding: "4px 8px", fontSize: 13, color: "#333" }}>WO-2024-0847</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#555", letterSpacing: "0.06em", marginBottom: 3 }}>TITLE</div>
          <div style={{ backgroundColor: "#FFF", border: "1px solid #7A7A7A", borderRadius: 2, padding: "4px 8px", fontSize: 13, color: "#333" }}>Bearing replacement — Motor M-401</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        {[{ label: "TYPE", value: "Corrective" }, { label: "PRIORITY", value: "High" }, { label: "ASSET", value: "MOT-401 — Main axis" }].map(({ label, value }) => (
          <div key={label} style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#555", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</div>
            <div style={{ backgroundColor: "#FFF", border: "1px solid #7A7A7A", borderRadius: 2, padding: "4px 8px", fontSize: 12, color: "#333" }}>{value} ▾</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        {[{ label: "LOCATION", value: "Line A — Zone 3" }, { label: "DEPARTMENT", value: "Mechanical Maint." }, { label: "ASSIGNED TO", value: "Mark Johnson" }].map(({ label, value }) => (
          <div key={label} style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#555", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</div>
            <div style={{ backgroundColor: "#FFF", border: "1px solid #7A7A7A", borderRadius: 2, padding: "4px 8px", fontSize: 12, color: "#333" }}>{value} ▾</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 4 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#555", letterSpacing: "0.06em", marginBottom: 4 }}>NOTES</div>
        <div style={{
          border: pastedText ? "1px solid #F59E0B" : "1px solid #7A7A7A",
          borderRadius: 2,
          backgroundColor: pastedText ? "#FFFBEE" : "#FFF",
          padding: "8px 10px",
          minHeight: 110,
          fontSize: 12, color: "#333", lineHeight: 1.65, whiteSpace: "pre-wrap",
        }}>
          {pastedText}
          {pastedText.length > 0 && pastedText.length < PASTED_NOTES.length && (
            <span style={{ display: "inline-block", width: 2, height: 13, backgroundColor: "#333", marginLeft: 1, verticalAlign: "middle" }} />
          )}
        </div>
      </div>
    </div>
  </div>
);

// ── Outlook popup ──────────────────────────────────────────────────────────
const OutlookPopup: React.FC<{ bodyText: string; opacity: number; translateY: number }> = ({ bodyText, opacity, translateY }) => (
  <div style={{
    position: "absolute",
    bottom: TEXT_ZONE_HEIGHT + 24,
    left: 44,
    width: 580,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
    border: "1px solid #E5E7EB",
    opacity,
    transform: `translateY(${translateY}px)`,
    zIndex: 200,
    fontFamily: interFont,
    overflow: "hidden",
  }}>
    <div style={{ backgroundColor: "#0078D4", padding: "9px 14px", display: "flex", alignItems: "center", gap: 9 }}>
      <span style={{ fontSize: 17 }}>📧</span>
      <span style={{ color: "white", fontSize: 13, fontWeight: 600 }}>Outlook — New Message</span>
      <div style={{ flex: 1 }} />
      <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 19 }}>✕</span>
    </div>
    <div style={{ padding: "8px 14px", borderBottom: "1px solid #E5E7EB" }}>
      {[{ label: "To:", value: "maint-team@northplant.com" }, { label: "Subject:", value: "Motor M-401 — Maintenance Plan (ChatGPT)" }].map(({ label, value }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0", borderBottom: "1px solid #F3F4F6" }}>
          <span style={{ fontSize: 12, color: "#6B7280", width: 56, flexShrink: 0 }}>{label}</span>
          <span style={{ fontSize: 13, color: "#111" }}>{value}</span>
        </div>
      ))}
    </div>
    <div style={{ padding: "10px 14px", minHeight: 100, fontSize: 13, color: "#374151", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
      {bodyText}
      {bodyText.length > 0 && bodyText.length < PASTED_NOTES.length && (
        <span style={{ display: "inline-block", width: 2, height: 14, backgroundColor: "#333", marginLeft: 1, verticalAlign: "middle" }} />
      )}
    </div>
  </div>
);

// ── Scene ──────────────────────────────────────────────────────────────────
export const Scene2CopyPaste: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── PHASE 1: Multi-turn conversation (0-240) ───────────────────────────
  const phase2Active = frame >= F1_SEND;
  const phase3Active = frame >= F2_SEND;
  const phase2Done   = frame >= F2_TYPE;

  const input1 = !phase2Active ? getTyped(FOLLOWUP_1, frame, F1_TYPE, 1.8) : "";
  const input2 = phase2Done && !phase3Active ? getTyped(FOLLOWUP_2, frame, F2_TYPE, 1.8) : "";

  const response2Chars = frame >= R2_START ? Math.floor((frame - R2_START) * 5) : 0;
  const response2Text  = RESPONSE_2.slice(0, response2Chars);
  const response3Chars = frame >= R3_START ? Math.floor((frame - R3_START) * 5) : 0;
  const response3Text  = RESPONSE_3.slice(0, response3Chars);

  const allMessages: ChatMessage[] = phase2Done
    ? [...historyMessages, { role: "user", text: FOLLOWUP_1, opacity: 0.7 }, { role: "assistant", text: RESPONSE_2, opacity: 0.7 }]
    : historyMessages;

  const activeInput    = input1 || input2;
  const activeUser     = phase3Active ? FOLLOWUP_2 : (phase2Active && !phase2Done ? FOLLOWUP_1 : "");
  const activeResponse = phase3Active ? response3Text : (!phase2Done && response2Chars > 0 ? response2Text : "");
  const activeCursor   = phase3Active
    ? (response3Chars < RESPONSE_3.length)
    : (response2Chars < RESPONSE_2.length && phase2Active && !phase2Done);

  // Scroll
  const scrollY = interpolate(
    frame,
    [F1_SEND, F1_SEND+30, F2_TYPE, F2_TYPE+30, R3_START, R3_START+30],
    [0, 160, 160, 340, 340, 480],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ── PHASE 2: Copy-paste (240+) ─────────────────────────────────────────
  const inCopyPaste = frame >= CONV_END;

  const selectionOpacity = inCopyPaste
    ? interpolate(frame, [SEL_START, SEL_START+18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  const cmmsProgress = spring({ frame: frame - CMMS_START, fps, config: { damping: 20, stiffness: 80, mass: 1.5 } });
  const cmmsSlideX = frame >= CMMS_START ? interpolate(cmmsProgress, [0, 1], [1920, 0]) : 1920;
  const cmmsOpacity = interpolate(frame, [CMMS_START, CMMS_START+16], [0, 1], { extrapolateRight: "clamp" });
  const chatDimOpacity = inCopyPaste
    ? interpolate(frame, [CMMS_START, CMMS_START+26], [1, 0.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  const cmmsChars = frame >= PASTE_START ? Math.floor((frame - PASTE_START) * 4.5) : 0;
  const cmmsText  = PASTED_NOTES.slice(0, cmmsChars);

  const outlookProgress = spring({ frame: frame - OUTLOOK_START, fps, config: { damping: 18, stiffness: 100, mass: 0.9 } });
  const outlookY   = frame >= OUTLOOK_START ? interpolate(outlookProgress, [0, 1], [280, 0]) : 280;
  const outlookOp  = interpolate(frame, [OUTLOOK_START, OUTLOOK_START+13], [0, 1], { extrapolateRight: "clamp" });
  const outlookChars = frame >= OUTLOOK_START+22 ? Math.floor((frame - (OUTLOOK_START+22)) * 4.5) : 0;
  const outlookText  = PASTED_NOTES.slice(0, outlookChars);

  // Cursor
  const cursorKeyframes = [
    { frame: 0,   x: 820, y: 680 },
    { frame: 12,  x: 820, y: 680, click: true },
    { frame: 78,  x: 1060, y: 680, click: true },
    { frame: 145, x: 820, y: 680, click: true },
    { frame: 193, x: 1060, y: 680, click: true },
    // copy-paste phase
    { frame: SEL_START,   x: 720,  y: 340 },
    { frame: SEL_START+5, x: 720,  y: 340, click: true },
    { frame: COPY_START,  x: 1060, y: 480, click: true },
    { frame: CMMS_START+40, x: 1500, y: 560 },
    { frame: CMMS_START+45, x: 1500, y: 560, click: true },
    { frame: OUTLOOK_START+10, x: 340, y: 680 },
    { frame: OUTLOOK_START+14, x: 340, y: 680, click: true },
  ];

  // Conversation phase narration (only visible before copy-paste starts)
  const convNarrationLines = [
    { words: ["One", "prompt", "is", "never", "enough."],    startFrame: 8,   color: "#1D1D1F" },
    { words: ["It", "never", "remembers", "your", "plant."], startFrame: 160, color: "#6B7280" },
  ];

  // Carry-over from Scene1 — fades out over first 12 frames so there's no visual jump at the cut
  const carryOverOpacity = interpolate(frame, [0, 12], [1, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: DESKTOP_BG }}>
      {/* Browser + ChatGPT */}
      <div style={{ opacity: chatDimOpacity }}>
        <BrowserShell slideInStart={-9999} url="chat.openai.com" tabTitle="ChatGPT">
          <ChatGPTWindow
            messages={allMessages}
            inputText={activeInput}
            userText={activeUser}
            responseText={activeResponse}
            showCursor={activeCursor}
            scrollY={inCopyPaste ? 480 : scrollY}
            selectionOpacity={inCopyPaste ? selectionOpacity : 0}
          />
        </BrowserShell>
      </div>


      {/* CMMS Notes overlay */}
      {frame >= CMMS_START && (
        <CmmsNotesOverlay pastedText={cmmsText} slideX={cmmsSlideX} opacity={cmmsOpacity} />
      )}

      {/* Outlook popup */}
      {frame >= OUTLOOK_START && (
        <OutlookPopup bodyText={outlookText} opacity={outlookOp} translateY={outlookY} />
      )}

      <AnimatedCursor keyframes={cursorKeyframes} />

      {/* Scene1 carry-over: same text, same size/color, fades out over first 12 frames */}
      {frame < 14 && (
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          height: TEXT_ZONE_HEIGHT,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 8, zIndex: 1001, pointerEvents: "none",
          opacity: carryOverOpacity,
        }}>
          <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
            {["You", "tried", "AI."].map((w) => (
              <span key={w} style={{ fontFamily: interFont, fontSize: 62, fontWeight: 600, color: "#1D1D1F", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{w}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
            {[
              { text: "It",           color: "#6B7280", weight: 600 },
              { text: "answered.",    color: "#6B7280", weight: 600 },
              { text: "Generically.", color: "#1D1D1F", weight: 800 },
            ].map(({ text, color, weight }) => (
              <span key={text} style={{ fontFamily: interFont, fontSize: 62, fontWeight: weight, color, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{text}</span>
            ))}
          </div>
        </div>
      )}

      {!inCopyPaste && (
        <NarrationText lines={convNarrationLines} zoneBg="transparent" showBorder={false} />
      )}
      {inCopyPaste && (
        <ActionSentence
          frame={frame}
          fps={fps}
          words={[
            { text: "Copy.",   appearFrame: COPY_START },
            { text: "Paste.",  appearFrame: PASTE_START },
            { text: "Email.",  appearFrame: OUTLOOK_START },
            { text: "Repeat.", appearFrame: OUTLOOK_START + 25 },
          ]}
        />
      )}
    </AbsoluteFill>
  );
};

const historyMessages: ChatMessage[] = [
  { role: "user",      text: GPT_USER_MSG,  opacity: 0.55 },
  { role: "assistant", text: GPT_RESPONSE,  opacity: 0.55 },
];
