import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { interFont, GPT_USER_MSG, GPT_RESPONSE } from "../constants";

// ─── Colors ──────────────────────────────────────────────────────────────────
const SCENE_BG    = "#F0F0F0";
const SCREEN_BG   = "#FFFFFF";
const INK         = "#0D0D0D";
const MUTED       = "#6B7280";
const SUB         = "#9CA3AF";
const BORDER      = "#E5E7EB";
const FAINT       = "#F5F5F7";
const BUBBLE_BG   = "#F4F4F4";
const ACCENT      = "#10A37F";
const BLUE_ACCENT = "#3B5BDB";
const CMMS_HEADER = "#2F6FD8";
const CMMS_WINDOW = "#E9EBEE";
const CMMS_INPUT  = "#FFFFFF";
const CMMS_LABEL  = "#6B7280";
const CMMS_HIGHLIGHT = "#FFF9C4";
const SEL_BG      = "rgba(59,91,219,0.28)";

const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// ─── Timing ─────────────────────────────────────────────────────────────────
const TITLE_AT      = 0;
const SCREENS_ENTER = 0;

const ACTION_SENT_AT = 195;
const SCENE_END      = 300;

// Browser chrome (Safari-like frame) builds around the carried-over text
// first; new Q&A is pasted below only after the chrome is present.
const CHROME_BUILD   = 18;
const CYCLE_DELAY    = 25;

// Shared perspective
const ROT_X = 7;
const ROT_Y = 11;

// Screen dimensions + positions — chat panel matches CMMS exactly (860×560).
const SCR_W = 860;
const SCR_H = 560;
const CHAT_W = 860;
const CHAT_H = 560;
const CHAT_TOP = 20;
const FINAL_A_X = 60;
const FINAL_B_X = 980;
const START_A_X = -220;
const START_B_X = 1300;

// ─── Chat cycles ─────────────────────────────────────────────────────────────
type Cycle = {
  user: string;
  ai: string;
  // frame offsets within scene
  userStart: number;
  userSpeed: number;
  aiStart: number;
  aiSpeed: number;
  selectAt: number;   // selection highlight appears
  copyAt: number;     // copy toast / mouse click at response
  pasteAt: number;    // mouse lands on notes and text appears (appended)
  pasteChunkLen: number; // chars appended instantly (paste = instant)
};

const CYCLES: Cycle[] = [
  {
    user: "Motor M-401 — vibrations + temp spikes. Plan?",
    ai:   "Replace bearings every 12–18 months. Check shaft alignment quarterly.",
    userStart: 5,   userSpeed: 4,
    aiStart:   22,  aiSpeed:   5,
    selectAt:  40,
    copyAt:    44,
    pasteAt:   50,
    pasteChunkLen: 0,
  },
  {
    user: "Parts list + codes?",
    ai:   "ABB bearing 6312-2Z, seal 45×62×10, coupling 110 mm.",
    userStart: 55,  userSpeed: 4,
    aiStart:   68,  aiSpeed:   5,
    selectAt:  83,
    copyAt:    87,
    pasteAt:   93,
    pasteChunkLen: 0,
  },
  {
    user: "Priority + technician?",
    ai:   "High. Assign Mark Johnson — Mechanical Maint., Zone 3.",
    userStart: 98,  userSpeed: 4,
    aiStart:   110, aiSpeed:   5,
    selectAt:  125,
    copyAt:    129,
    pasteAt:   135,
    pasteChunkLen: 0,
  },
];

// ─── Hero title ──────────────────────────────────────────────────────────────
const TITLE_WORDS = [
  { w: "One",     accent: false },
  { w: "prompt",  accent: true  },
  { w: "is",      accent: false },
  { w: "never",   accent: false },
  { w: "enough.", accent: false },
];

const charsVisible = (frame: number, start: number, speed: number) =>
  frame < start ? 0 : Math.floor((frame - start) * speed);

// Smoothstep easing for mouse motion
const ease = (t: number) => {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
};

// Mouse target points (scene-space coords, 1920×1080 viewport)
// Approximate visual landing spots over the tilted panels.
const MOUSE_HOME   = { x: 1500, y: 900 };
const MOUSE_RESP   = [
  { x: 560, y: 360 },
  { x: 560, y: 440 },
  { x: 560, y: 520 },
];
const MOUSE_NOTES  = { x: 1360, y: 640 };

export const Scene2CopyPaste: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Title ──
  const titleWordStates = TITLE_WORDS.map((tw, i) => {
    const start = TITLE_AT + i * 6;
    const sp = spring({ frame: frame - start, fps, config: { stiffness: 220, damping: 18, mass: 0.7 } });
    const op = interpolate(sp, [0, 1], [0, 1], CLAMP);
    const ty = interpolate(sp, [0, 1], [22, 0], CLAMP);
    const accentT = interpolate(frame - start, [8, 18], [1, 0], CLAMP);
    return { ...tw, op, ty, accentT };
  });

  // ── Cycle states ── (all frame offsets shifted by CYCLE_DELAY so the chrome
  // can finish building before new Q&A is pasted below the carried-over text)
  const cycleStates = CYCLES.map((raw) => {
    const c = {
      ...raw,
      userStart: raw.userStart + CYCLE_DELAY,
      aiStart:   raw.aiStart   + CYCLE_DELAY,
      selectAt:  raw.selectAt  + CYCLE_DELAY,
      copyAt:    raw.copyAt    + CYCLE_DELAY,
      pasteAt:   raw.pasteAt   + CYCLE_DELAY,
    };
    const userChars = Math.min(charsVisible(frame, c.userStart, c.userSpeed), c.user.length);
    const userText  = c.user.slice(0, userChars);
    const userTyping = frame >= c.userStart && userChars < c.user.length;
    const userRevealed = frame >= c.userStart;

    const aiChars = Math.min(charsVisible(frame, c.aiStart, c.aiSpeed), c.ai.length);
    const aiText = c.ai.slice(0, aiChars);
    const aiTyping = frame >= c.aiStart && aiChars < c.ai.length;
    const aiRevealed = frame >= c.aiStart;

    const selectOp = interpolate(frame, [c.selectAt, c.selectAt + 6], [0, 1], CLAMP);
    const copyToastOp = interpolate(
      frame,
      [c.copyAt, c.copyAt + 4, c.copyAt + 18, c.copyAt + 24],
      [0, 1, 1, 0],
      CLAMP,
    );

    return {
      cycle: c,
      userText, userTyping, userRevealed,
      aiText, aiTyping, aiRevealed,
      selectOp, copyToastOp,
    };
  });

  // Accumulated pasted text in NOTES — each cycle appends its full ai line once pasteAt hits
  const pastedParts: string[] = [];
  let anyPasteActive = false;
  let pastingCycle = -1;
  CYCLES.forEach((c, i) => {
    const pasteAt = c.pasteAt + CYCLE_DELAY;
    if (frame >= pasteAt) {
      pastedParts.push(c.ai);
      anyPasteActive = true;
    }
    if (frame >= pasteAt && frame < pasteAt + 8) pastingCycle = i;
  });
  const pastedText = pastedParts.join("\n");

  const caretBlink = Math.floor(frame / 8) % 2 === 0 ? 1 : 0;

  // ── Chat panel rotation: stays at Scene1's exit tilt (-ROT_Y, ROT_X) — no
  // recovery, no jump. Chat is tilted outward-left, CMMS outward-right (mirrored).
  const rotYA = -ROT_Y;
  const rotXA = ROT_X;
  const scaleA = 1;
  const offsetAX = 0;
  const screenAOp = 1;

  // CMMS panel: appears alongside the chat panel almost immediately.
  const enterBProg = spring({ frame: frame - (SCREENS_ENTER + 4), fps, config: { stiffness: 90, damping: 20, mass: 1.0 } });
  const rotYB = interpolate(enterBProg, [0, 1], [ROT_Y + 170, ROT_Y], CLAMP);
  const rotXB = interpolate(enterBProg, [0, 1], [ROT_X + 4, ROT_X], CLAMP);
  const scaleB = interpolate(enterBProg, [0, 1], [0.82, 1], CLAMP);
  const screenBOp = interpolate(enterBProg, [0, 0.25, 1], [0, 1, 1], CLAMP);

  // ── Mouse cursor choreography ──
  // For each cycle: move to response → click/select → move to notes → click/paste
  // Sequence per cycle:
  //   approach:    (selectAt - 14) → selectAt     home→resp
  //   at response: selectAt → copyAt + 2          (stays, click blip)
  //   travel:      copyAt + 2 → pasteAt           resp→notes
  //   at notes:    pasteAt → pasteAt + 10         (click blip)
  //   after last:  returns to home
  const mouse = computeMousePosition(frame);

  // Scene fade
  const sceneOp = Math.min(
    interpolate(frame, [0, 10], [0, 1], CLAMP),
    interpolate(frame, [SCENE_END - 16, SCENE_END], [1, 0], CLAMP),
  );

  // Action sentence
  const actionWords = [
    { text: "Copy.",   appearFrame: ACTION_SENT_AT },
    { text: "Paste.",  appearFrame: ACTION_SENT_AT + 10 },
    { text: "Email.",  appearFrame: ACTION_SENT_AT + 20 },
    { text: "Repeat.", appearFrame: ACTION_SENT_AT + 30 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: SCENE_BG, opacity: sceneOp }}>
      {/* ── Hero title ── */}
      <div style={{
        position: "absolute",
        left: 0, right: 0, top: 90,
        display: "flex",
        justifyContent: "center",
        alignItems: "baseline",
        gap: 22,
      }}>
        {titleWordStates.map((s, i) => (
          <span
            key={i}
            style={{
              fontFamily: interFont,
              fontSize: 80,
              fontWeight: 700,
              letterSpacing: "-0.035em",
              lineHeight: 1,
              color: s.accentT > 0 && s.accent
                ? `rgba(59,91,219,${s.accentT})`
                : s.accent ? BLUE_ACCENT : INK,
              opacity: s.op,
              transform: `translateY(${s.ty}px)`,
              display: "inline-block",
              willChange: "transform, opacity",
            }}
          >
            {s.w}
          </span>
        ))}
      </div>

      {/* ── Two tilted panels ── */}
      <div style={{
        position: "absolute",
        left: 0, right: 0, top: 200, bottom: 280,
        perspective: "2600px",
        perspectiveOrigin: "50% 50%",
      }}>
        <div style={{
          position: "absolute",
          left: FINAL_A_X + offsetAX, top: CHAT_TOP,
          width: CHAT_W, height: CHAT_H,
          opacity: screenAOp,
          transform: `rotateX(${rotXA}deg) rotateY(${rotYA}deg) scale(${scaleA})`,
          transformOrigin: "center center",
          transformStyle: "preserve-3d",
        }}>
          <ChatPanel
            cycles={cycleStates}
            caretBlink={caretBlink}
            legacyPrompt={GPT_USER_MSG}
            legacyResponse={GPT_RESPONSE}
            frame={frame}
          />
        </div>

        <div style={{
          position: "absolute",
          left: FINAL_B_X, top: 20,
          width: SCR_W, height: SCR_H,
          opacity: screenBOp,
          transform: `rotateX(${rotXB}deg) rotateY(${rotYB}deg) scale(${scaleB})`,
          transformOrigin: "center center",
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
        }}>
          <CmmsWorkOrder
            pastedText={pastedText}
            pasteActive={anyPasteActive}
            pasteFlashCycle={pastingCycle}
          />
        </div>
      </div>

      {/* ── Mouse cursor (scene-space overlay) ── */}
      {mouse.visible && (
        <MouseCursor x={mouse.x} y={mouse.y} clickPulse={mouse.clickPulse} />
      )}

      {/* ── Bottom action sentence ── */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: 260,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 22,
      }}>
        {actionWords.map(({ text, appearFrame }) => {
          const progress = spring({
            frame: frame - appearFrame,
            fps,
            config: { damping: 18, stiffness: 200, mass: 0.5 },
          });
          const op = interpolate(progress, [0, 1], [0, 1], CLAMP);
          const ty = interpolate(progress, [0, 1], [16, 0], CLAMP);
          return (
            <span
              key={text}
              style={{
                fontFamily: interFont,
                fontSize: 54,
                fontWeight: 800,
                color: "#1D1D1F",
                letterSpacing: "-0.025em",
                opacity: frame >= appearFrame ? op : 0,
                transform: `translateY(${frame >= appearFrame ? ty : 16}px)`,
                display: "inline-block",
              }}
            >
              {text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Mouse position computation — sequences across all cycles
function computeMousePosition(frame: number): { x: number; y: number; visible: boolean; clickPulse: number } {
  let pos = { ...MOUSE_HOME };
  let visible = false;
  let clickPulse = 0;

  // Cursor appears once the first AI response starts streaming
  if (frame < CYCLES[0].aiStart + CYCLE_DELAY - 4) {
    return { x: MOUSE_HOME.x, y: MOUSE_HOME.y, visible: false, clickPulse: 0 };
  }
  visible = true;

  // Determine which cycle segment we're in
  for (let i = 0; i < CYCLES.length; i++) {
    const raw = CYCLES[i];
    const c = {
      ...raw,
      selectAt: raw.selectAt + CYCLE_DELAY,
      copyAt:   raw.copyAt   + CYCLE_DELAY,
      pasteAt:  raw.pasteAt  + CYCLE_DELAY,
    };
    const prev = i === 0 ? MOUSE_HOME : MOUSE_NOTES;
    const respPt = MOUSE_RESP[i];

    const approachStart = c.selectAt - 14;
    const approachEnd   = c.selectAt;
    const clickAt       = c.copyAt;
    const travelStart   = c.copyAt + 2;
    const travelEnd     = c.pasteAt;
    const pasteClickEnd = c.pasteAt + 10;

    if (frame >= approachStart && frame < approachEnd) {
      const t = ease((frame - approachStart) / (approachEnd - approachStart));
      pos = {
        x: prev.x + (respPt.x - prev.x) * t,
        y: prev.y + (respPt.y - prev.y) * t,
      };
      return { ...pos, visible, clickPulse: 0 };
    }
    if (frame >= approachEnd && frame < travelStart) {
      pos = respPt;
      clickPulse = interpolate(frame, [clickAt, clickAt + 4, clickAt + 10], [0, 1, 0], CLAMP);
      return { ...pos, visible, clickPulse };
    }
    if (frame >= travelStart && frame < travelEnd) {
      const t = ease((frame - travelStart) / (travelEnd - travelStart));
      pos = {
        x: respPt.x + (MOUSE_NOTES.x - respPt.x) * t,
        y: respPt.y + (MOUSE_NOTES.y - respPt.y) * t,
      };
      return { ...pos, visible, clickPulse: 0 };
    }
    if (frame >= travelEnd && frame < pasteClickEnd) {
      pos = MOUSE_NOTES;
      clickPulse = interpolate(frame, [travelEnd, travelEnd + 4, pasteClickEnd], [0, 1, 0], CLAMP);
      return { ...pos, visible, clickPulse };
    }
    // Between this cycle's paste click and next approach: stay at notes
    if (i < CYCLES.length - 1 && frame >= pasteClickEnd && frame < CYCLES[i + 1].selectAt + CYCLE_DELAY - 14) {
      return { x: MOUSE_NOTES.x, y: MOUSE_NOTES.y, visible, clickPulse: 0 };
    }
  }

  // After last cycle — fade by returning home
  const last = CYCLES[CYCLES.length - 1];
  const returnStart = last.pasteAt + CYCLE_DELAY + 10;
  const returnEnd   = last.pasteAt + CYCLE_DELAY + 30;
  if (frame >= returnStart) {
    const t = ease((frame - returnStart) / (returnEnd - returnStart));
    pos = {
      x: MOUSE_NOTES.x + (MOUSE_HOME.x - MOUSE_NOTES.x) * t,
      y: MOUSE_NOTES.y + (MOUSE_HOME.y - MOUSE_NOTES.y) * t,
    };
    const vis = interpolate(frame, [returnEnd - 4, returnEnd], [1, 0], CLAMP);
    return { ...pos, visible: vis > 0.02, clickPulse: 0 };
  }

  return { x: MOUSE_HOME.x, y: MOUSE_HOME.y, visible, clickPulse: 0 };
}

// ─── Mouse cursor visual ─────────────────────────────────────────────────────
const MouseCursor: React.FC<{ x: number; y: number; clickPulse: number }> = ({ x, y, clickPulse }) => (
  <div style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
    {/* click ring */}
    {clickPulse > 0 && (
      <div
        style={{
          position: "absolute",
          left: x - 22,
          top: y - 22,
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: `2px solid rgba(59,91,219,${0.7 * (1 - clickPulse)})`,
          transform: `scale(${0.5 + clickPulse * 0.9})`,
          opacity: clickPulse,
        }}
      />
    )}
    {/* arrow */}
    <svg
      width="36"
      height="44"
      viewBox="0 0 24 28"
      style={{
        position: "absolute",
        left: x,
        top: y,
        filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.35))",
      }}
    >
      <path
        d="M2 2 L2 22 L7.5 17 L11 25 L14 24 L10.5 16 L18 16 Z"
        fill="#FFFFFF"
        stroke="#0D0D0D"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

// ─── ChatPanel ────────────────────────────────────────────────────────────────
type CycleState = {
  cycle: Cycle;
  userText: string; userTyping: boolean; userRevealed: boolean;
  aiText: string; aiTyping: boolean; aiRevealed: boolean;
  selectOp: number; copyToastOp: number;
};

const ChatPanel: React.FC<{
  cycles: CycleState[];
  caretBlink: number;
  legacyPrompt: string;
  legacyResponse: string;
  frame: number;
}> = ({ cycles, caretBlink, legacyPrompt, legacyResponse, frame }) => {
  const anyToast = Math.max(...cycles.map(c => c.copyToastOp));
  // Legacy block (Scene1 prompt+response) carries into the panel as chat history.
  // No dissolve — the content stays at full opacity; fresh cycles append below.
  const legacyDim = 1;
  // Browser chrome is already built by Scene1 (it enters pre-framed) — present
  // fully from frame 0 so there is no "window appearing" at the handoff.
  const frameT    = 1;
  const headerT   = 1;
  const inputBarT = 1;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: SCREEN_BG,
        border: `1px solid rgba(229,231,235,${frameT})`,
        borderRadius: 16,
        boxShadow: `0 40px 100px -20px rgba(0,0,0,${0.35 * frameT}), 0 12px 30px -10px rgba(0,0,0,${0.18 * frameT})`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Browser-like header — builds in as Safari chrome */}
      <div style={{
        height: 42,
        background: FAINT,
        borderBottom: `1px solid ${BORDER}`,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 16px",
        opacity: headerT,
        transform: `translateY(${interpolate(headerT, [0, 1], [-6, 0], CLAMP)}px)`,
      }}>
        {["#EF4444", "#F59E0B", "#10B981"].map((c) => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: interFont, fontSize: 11, fontWeight: 600, color: SUB }}>
          ChatGPT · chat.openai.com
        </span>
      </div>

      {/* Chat body */}
      <div style={{
        flex: 1,
        padding: "20px 28px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        overflow: "hidden",
        justifyContent: "flex-start",
      }}>
        {/* Scene1 carry-over — the prompt the user made persists as chat history */}
        <div style={{ display: "flex", justifyContent: "flex-end", opacity: legacyDim }}>
          <div style={{
            maxWidth: "82%",
            background: BUBBLE_BG,
            color: INK,
            borderRadius: 14,
            padding: "10px 14px",
            fontFamily: interFont,
            fontSize: 12.5,
            lineHeight: 1.4,
            letterSpacing: "-0.005em",
          }}>
            {legacyPrompt}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", maxWidth: "94%", opacity: legacyDim }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill={ACCENT} style={{ flexShrink: 0, marginTop: 2 }}>
            <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z" />
          </svg>
          <div style={{
            color: INK,
            fontFamily: interFont,
            fontSize: 11.5,
            lineHeight: 1.45,
            letterSpacing: "-0.005em",
            whiteSpace: "pre-wrap",
          }}>
            {legacyResponse}
          </div>
        </div>

        {cycles.map((cs, idx) => (
          <React.Fragment key={idx}>
            {cs.userRevealed && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{
                  maxWidth: "78%",
                  background: BUBBLE_BG,
                  color: INK,
                  borderRadius: 14,
                  padding: "10px 14px",
                  fontFamily: interFont,
                  fontSize: 13,
                  lineHeight: 1.4,
                  letterSpacing: "-0.005em",
                }}>
                  {cs.userText}
                  {cs.userTyping && (
                    <span style={{
                      display: "inline-block",
                      width: 2, height: 12, marginLeft: 3,
                      verticalAlign: "middle",
                      background: INK,
                      opacity: caretBlink,
                    }} />
                  )}
                </div>
              </div>
            )}

            {cs.aiRevealed && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", maxWidth: "92%", position: "relative" }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill={ACCENT} style={{ flexShrink: 0, marginTop: 3 }}>
                  <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z" />
                </svg>
                <div style={{
                  color: INK,
                  fontFamily: interFont,
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  letterSpacing: "-0.005em",
                  position: "relative",
                }}>
                  <span style={{
                    position: "absolute",
                    inset: "-2px -4px",
                    background: SEL_BG,
                    borderRadius: 4,
                    opacity: cs.selectOp,
                    pointerEvents: "none",
                  }} />
                  <span style={{ position: "relative" }}>
                    {cs.aiText}
                    {cs.aiTyping && (
                      <span style={{
                        display: "inline-block",
                        width: 2, height: 12, marginLeft: 3,
                        verticalAlign: "text-bottom",
                        background: INK,
                        opacity: caretBlink,
                      }} />
                    )}
                  </span>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Input bar — appears after the rest of the chrome */}
      <div style={{
        borderTop: `1px solid ${BORDER}`,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        opacity: inputBarT,
        transform: `translateY(${interpolate(inputBarT, [0, 1], [6, 0], CLAMP)}px)`,
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: "50%",
          border: `1.5px solid ${BORDER}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: MUTED, fontSize: 14,
        }}>+</div>
        <span style={{ fontFamily: interFont, fontSize: 12, color: SUB, flex: 1 }}>Ask anything</span>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "#D1D5DB", color: "#FFF",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14,
        }}>↑</div>
      </div>

      {/* "Copied" toast (shared; shows whenever any cycle fires) */}
      <div style={{
        position: "absolute",
        right: 28, bottom: 100,
        background: "#0D0D0D",
        color: "#FFFFFF",
        padding: "6px 12px",
        borderRadius: 8,
        fontFamily: interFont,
        fontSize: 12,
        fontWeight: 600,
        opacity: anyToast,
        transform: `translateY(${interpolate(anyToast, [0, 1], [8, 0], CLAMP)}px)`,
        boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
      }}>
        Copied ✓
      </div>
    </div>
  );
};

// ─── CmmsWorkOrder ───────────────────────────────────────────────────────────
const CmmsWorkOrder: React.FC<{
  pastedText: string;
  pasteActive: boolean;
  pasteFlashCycle: number;
}> = ({ pastedText, pasteActive, pasteFlashCycle }) => {
  const flashOp = pasteFlashCycle >= 0 ? 1 : 0;
  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: CMMS_WINDOW,
      border: `1px solid ${BORDER}`,
      borderRadius: 10,
      boxShadow: "0 40px 100px -20px rgba(0,0,0,0.35), 0 12px 30px -10px rgba(0,0,0,0.18)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{
        height: 34,
        background: CMMS_HEADER,
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 12px",
      }}>
        <span style={{ fontFamily: interFont, fontSize: 13, fontWeight: 600 }}>
          Maintenance Management System v3.2.1
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {["_", "◻", "✕"].map((s, i) => (
            <div key={i} style={{
              width: 22, height: 22,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#FFF", fontSize: 11, fontWeight: 600,
            }}>{s}</div>
          ))}
        </div>
      </div>

      <div style={{
        height: 32,
        background: "#DEDFE2",
        borderBottom: `1px solid ${BORDER}`,
        display: "flex",
        gap: 8,
        padding: "4px 10px",
      }}>
        {["New", "Save", "Print"].map((b) => (
          <div key={b} style={{
            padding: "4px 12px",
            border: `1px solid ${BORDER}`,
            borderRadius: 3,
            background: b === "New" ? "#FFFFFF" : "transparent",
            fontFamily: interFont,
            fontSize: 12,
            color: INK,
            fontWeight: b === "New" ? 600 : 400,
          }}>{b}</div>
        ))}
      </div>

      <div style={{ flex: 1, padding: "18px 22px", overflow: "hidden" }}>
        <div style={{ fontFamily: interFont, fontSize: 20, fontWeight: 700, color: INK, marginBottom: 14 }}>
          New Work Order
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr 1fr", gap: 12, marginBottom: 10 }}>
          <FormField label="WO CODE" value="WO-2024-0847" />
          <FormField label="TITLE"   value="Bearing replacement — Motor M-401" />
          <FormField label="TYPE"    value="Corrective ▾" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.3fr", gap: 12, marginBottom: 10 }}>
          <FormField label="PRIORITY"   value="High ▾" />
          <FormField label="ASSET"      value="MOT-401 — Main axis ▾" />
          <FormField label="LOCATION"   value="Line A — Zone 3 ▾" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <FormField label="DEPARTMENT"   value="Mechanical Maint. ▾" />
          <FormField label="ASSIGNED TO"  value="Mark Johnson ▾" />
        </div>

        <div>
          <div style={{ fontSize: 10, fontFamily: interFont, fontWeight: 700, color: CMMS_LABEL, letterSpacing: "0.08em", marginBottom: 4 }}>
            NOTES
          </div>
          <div style={{
            minHeight: 170,
            background: pasteActive ? CMMS_HIGHLIGHT : CMMS_INPUT,
            border: `1px solid ${pasteActive ? (flashOp ? "#D4A017" : "#E8C547") : BORDER}`,
            borderRadius: 3,
            padding: "10px 12px",
            fontFamily: interFont,
            fontSize: 12,
            lineHeight: 1.5,
            color: INK,
            whiteSpace: "pre-wrap",
            transition: "none",
          }}>
            {pastedText}
          </div>
        </div>
      </div>
    </div>
  );
};

const FormField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div style={{
      fontSize: 10, fontFamily: interFont, fontWeight: 700,
      color: CMMS_LABEL, letterSpacing: "0.08em", marginBottom: 4,
    }}>
      {label}
    </div>
    <div style={{
      height: 26,
      background: CMMS_INPUT,
      border: `1px solid ${BORDER}`,
      borderRadius: 3,
      padding: "0 10px",
      display: "flex",
      alignItems: "center",
      fontFamily: interFont,
      fontSize: 12,
      color: INK,
    }}>
      {value}
    </div>
  </div>
);
