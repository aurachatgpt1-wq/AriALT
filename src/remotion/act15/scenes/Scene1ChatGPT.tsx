import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { GPT_USER_MSG, GPT_RESPONSE, interFont } from "../constants";
import { NarrationText } from "../../act1/components/NarrationText";
import { AnimatedCursor } from "../../act1/components/AnimatedCursor";

// ─── Timing (frames @ 30fps) ─────────────────────────────────────────────────
const USER_TYPE_START = 24;
const USER_TYPE_SPEED = 7;
const CURSOR_MOVE_AT  = 30;
const SEND_FRAME      = 46;
const PUNCH_END       = SEND_FRAME + 10;
// Flat bar → perspective view: bubble slides in from the right, lands centered,
// then is pushed upward by the growing response below — one continuous flow.
const FLIP_START      = SEND_FRAME + 2;   // 48 — bar fades, perspective takes over
const FLIP_END        = SEND_FRAME + 34;  // 80 — bubble fully landed
const THINKING_START  = SEND_FRAME + 28;  // 74 — spinner starts before landing settles
const RESPONSE_START  = SEND_FRAME + 40;  // 86 — response begins as bubble settles
const RESPONSE_SPEED  = 11;

// ─── Colors ──────────────────────────────────────────────────────────────────
const SCENE_BG    = "#F0F0F0";
const INK         = "#0D0D0D";
const MUTED       = "#6B7280";
const PLACEHOLDER = "#9CA3AF";
const BORDER      = "#E5E7EB";
const BUBBLE_BG   = "#F4F4F4";
const SEND_GREEN  = "#10A37F";

const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const EASE     = Easing.inOut(Easing.cubic);
const EASE_OUT = Easing.out(Easing.cubic);

// ─── Layout constants — centered input bar (Phase A) ─────────────────────────
const CTR_BAR_W = 1120;
const CTR_BAR_H = 96;
const CTR_BAR_X = (1920 - CTR_BAR_W) / 2;   // 400
const CTR_BAR_Y = 420;
const CTR_SEND_SIZE = 48;
const CTR_SEND_X = CTR_BAR_X + CTR_BAR_W - 30 - CTR_SEND_SIZE / 2;  // 1458
const CTR_SEND_Y = CTR_BAR_Y + CTR_BAR_H / 2;                        // 468

export const Scene1ChatGPT: React.FC = () => {
  const frame = useCurrentFrame();

  // ── Typing state ──────────────────────────────────────────────────────────
  const inputChars = frame >= USER_TYPE_START && frame < SEND_FRAME
    ? Math.floor((frame - USER_TYPE_START) * USER_TYPE_SPEED)
    : frame >= SEND_FRAME
      ? GPT_USER_MSG.length
      : 0;
  const inputText  = GPT_USER_MSG.slice(0, Math.min(inputChars, GPT_USER_MSG.length));
  const typing     = frame >= USER_TYPE_START && frame < SEND_FRAME;
  const caretBlink = Math.floor(frame / 8) % 2 === 0 ? 1 : 0;

  const responseChars = frame >= RESPONSE_START
    ? Math.floor((frame - RESPONSE_START) * RESPONSE_SPEED)
    : 0;
  const responseText = GPT_RESPONSE.slice(0, Math.min(responseChars, GPT_RESPONSE.length));
  const respTyping   = frame >= RESPONSE_START && responseChars < GPT_RESPONSE.length;
  const respOpacity  = interpolate(frame, [RESPONSE_START - 4, RESPONSE_START + 16], [0, 1], CLAMP);
  const respTy       = interpolate(frame, [RESPONSE_START - 4, RESPONSE_START + 16], [18, 0], CLAMP);
  const RESPONSE_END = RESPONSE_START + Math.ceil(GPT_RESPONSE.length / RESPONSE_SPEED);

  // ── Click punch on send ──────────────────────────────────────────────────
  const punchScale = interpolate(
    frame,
    [SEND_FRAME - 2, SEND_FRAME + 2, PUNCH_END],
    [1, 1.06, 1],
    { ...CLAMP, easing: Easing.inOut(Easing.quad) },
  );

  // ── FLIP — flat bar → perspective view; tilt starts strong & eases to rest ──
  const flipProg = interpolate(frame, [FLIP_START, FLIP_END], [0, 1], { ...CLAMP, easing: EASE });
  // Target end angle = Scene2 left panel (ROT_X=7, ROT_Y=11).
  const REST_ROT_Y = 11;
  const REST_ROT_X = 7;
  const START_ROT_Y = 22;   // pronounced tilt when the bubble first lands
  const START_ROT_X = 9;
  // Continuous tilt flow: 0 → START during slide-in (ease-out), then
  // continuously eases toward REST across the rest of the scene.
  const tiltUpT = interpolate(flipProg, [0, 1], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const settleT = interpolate(frame, [FLIP_END, 100], [0, 1], { ...CLAMP, easing: EASE });
  // ── EXIT MORPH (frame 100 → 135) — tilt reverses to the OPPOSITE side while
  // de-zooming and translating so the content lands EXACTLY inside Scene2's
  // chat-panel slot (left=60, top=220, 860×560) at frame 135.
  // Scene1 rotating box spans (0,0)-(1920,900), center (960,450).
  // Target center = (490, 500); target scale = 860/1920 ≈ 0.448.
  const EXIT_START = 100;
  const EXIT_END   = 135;
  const exitT = interpolate(frame, [EXIT_START, EXIT_END], [0, 1], { ...CLAMP, easing: EASE });
  const rotY = frame < FLIP_END
    ? START_ROT_Y * tiltUpT
    : frame < EXIT_START
      ? START_ROT_Y + (REST_ROT_Y - START_ROT_Y) * settleT
      : REST_ROT_Y + (-REST_ROT_Y - REST_ROT_Y) * exitT; // 11° → -11° (opposite side)
  const rotX = frame < FLIP_END
    ? START_ROT_X * tiltUpT
    : frame < EXIT_START
      ? START_ROT_X + (REST_ROT_X - START_ROT_X) * settleT
      : REST_ROT_X;
  // Content lives inside a centered 1200×782 box whose aspect (≈1.535) matches
  // Scene2's 860×560 chat panel exactly, so a UNIFORM scale (no text stretch)
  // lands it pixel-perfect on that slot. 1200×782 × (860/1200) = 860×560.
  const BOX_W = 1200;
  const BOX_H = 782;
  const flipScale = interpolate(exitT, [0, 1], [1, 860 / BOX_W], CLAMP);
  const exitTx    = interpolate(exitT, [0, 1], [0, -470], CLAMP);
  const exitTy    = interpolate(exitT, [0, 1], [0, 50],  CLAMP);
  // Safari-like browser frame appears during the exit (frame ~100 → ~125).
  const browserFrameOp = interpolate(frame, [100, 125], [0, 1], CLAMP);
  // Inverse of the uniform scale — chrome sizes (header height, font size, etc.)
  // are pre-multiplied by INV so they match Scene2's chat-panel chrome after the
  // exit scale.
  const INV = BOX_W / 860;

  // Centered bar fades out during the first half of the flip
  const centerBarOp    = interpolate(flipProg, [0, 0.45], [1, 0], CLAMP);
  const centerBarScale = interpolate(flipProg, [0, 0.45], [1, 0.92], CLAMP);
  // Perspective content fades in as the flat bar departs
  const contentOp = interpolate(flipProg, [0.25, 0.85], [0, 1], CLAMP);

  // Prompt bubble: slides in from the right, decelerating smoothly into landing,
  // then is pushed upward continuously by the growing response below.
  const slideInT = interpolate(frame, [FLIP_START, FLIP_END], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const slideX = interpolate(slideInT, [0, 1], [900, 0], CLAMP);
  // Within the 1200×782 rotating box, the 42×INV-tall browser header sits at top,
  // so the prompt bubble lands below it and rises toward the top of the body.
  const CENTER_Y = 220;
  const TOP_Y    = 86;
  // During the exit phase (100→135), the prompt/response morph from the big
  // Scene1 style to Scene2's chat-panel rendering (pre-scaled by INV), so at
  // frame 135 they match exactly what Scene2 renders — no size/position jump.
  const morphT = interpolate(frame, [EXIT_START, EXIT_END], [0, 1], { ...CLAMP, easing: EASE });
  const promptFont    = interpolate(morphT, [0, 1], [28, 12.5 * INV], CLAMP);
  const promptPadV    = interpolate(morphT, [0, 1], [20, 10 * INV],   CLAMP);
  const promptPadH    = interpolate(morphT, [0, 1], [28, 14 * INV],   CLAMP);
  const promptRadius  = interpolate(morphT, [0, 1], [24, 14 * INV],   CLAMP);
  const promptMaxPct  = interpolate(morphT, [0, 1], [78, 82],         CLAMP);
  const responseFont  = interpolate(morphT, [0, 1], [26, 13.5 * INV], CLAMP);
  const responseIcon  = interpolate(morphT, [0, 1], [32, 18   * INV], CLAMP);
  const responseGap   = interpolate(morphT, [0, 1], [22, 10   * INV], CLAMP);
  // Gap between prompt-bottom and response-top — wide pre-morph (prevents text
  // overlap at the large Scene1 size), tight at the handoff (matches Scene2).
  const bubbleToResp  = interpolate(morphT, [0, 1], [190, 110], CLAMP);
  // responseProgress starts early (before typing) so the lift eases in continuously
  // with the slide-in — no dead time between landing and pushing up.
  const responseProgress = interpolate(
    frame,
    [FLIP_END - 6, RESPONSE_START + Math.ceil(GPT_RESPONSE.length * 0.55 / RESPONSE_SPEED)],
    [0, 1],
    { ...CLAMP, easing: EASE },
  );
  const bubbleTop = CENTER_Y + (TOP_Y - CENTER_Y) * responseProgress;

  // ── Cursor (Phase A only) ─────────────────────────────────────────────────
  const cursorKeyframes = [
    { frame: 0,                 x: 800,          y: 900 },
    { frame: CURSOR_MOVE_AT,    x: 800,          y: 900 },
    { frame: SEND_FRAME - 2,    x: CTR_SEND_X,   y: CTR_SEND_Y },
    { frame: SEND_FRAME,        x: CTR_SEND_X,   y: CTR_SEND_Y, click: true },
    { frame: FLIP_START - 1,    x: CTR_SEND_X,   y: CTR_SEND_Y },
  ];
  const cursorVisible = frame < FLIP_START;

  // ── Narration ─────────────────────────────────────────────────────────────
  const narrationLines = [
    { words: ["You", "tried", "AI."], startFrame: 4, color: "#1D1D1F" },
    {
      words: ["It", "answered.", "Generically."],
      startFrame: 50,
      color: MUTED,
      wordColors: [MUTED, MUTED, "#1D1D1F"],
      wordWeights: [600, 600, 800],
      wordDelays: [0, 5, 70],
    },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: SCENE_BG }}>
      {/* ── PHASE A: centered input bar on flat bg ── */}
      {centerBarOp > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: CTR_BAR_X,
            top: CTR_BAR_Y,
            width: CTR_BAR_W,
            height: CTR_BAR_H,
            background: "#FFFFFF",
            border: `1px solid ${BORDER}`,
            borderRadius: 28,
            boxShadow:
              "0 22px 60px -18px rgba(20,30,60,0.22), 0 8px 24px -10px rgba(20,30,60,0.12)",
            display: "flex",
            alignItems: "center",
            padding: "0 30px",
            gap: 18,
            opacity: centerBarOp,
            transform: `scale(${centerBarScale * punchScale})`,
            transformOrigin: "center center",
            willChange: "transform, opacity",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: `1.5px solid ${BORDER}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: MUTED,
              fontSize: 22,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            +
          </div>

          <div
            style={{
              flex: 1,
              color: inputText.length > 0 ? INK : PLACEHOLDER,
              fontFamily: interFont,
              fontSize: 32,
              fontWeight: 400,
              letterSpacing: "-0.005em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {inputText.length > 0 ? inputText : "Ask anything"}
            {typing && (
              <span
                style={{
                  display: "inline-block",
                  width: 2,
                  height: 28,
                  marginLeft: 3,
                  verticalAlign: "middle",
                  background: INK,
                  opacity: caretBlink,
                }}
              />
            )}
          </div>

          <div
            style={{
              width: CTR_SEND_SIZE,
              height: CTR_SEND_SIZE,
              borderRadius: "50%",
              background:
                inputText.length > 0 || frame >= SEND_FRAME ? SEND_GREEN : "#D1D5DB",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              flexShrink: 0,
              boxShadow:
                frame >= SEND_FRAME - 1 && frame <= SEND_FRAME + 12
                  ? `0 0 0 ${interpolate(frame, [SEND_FRAME, SEND_FRAME + 10], [0, 16], CLAMP)}px rgba(16,163,127,${interpolate(frame, [SEND_FRAME, SEND_FRAME + 10], [0.45, 0], CLAMP)})`
                  : "none",
            }}
          >
            ↑
          </div>
        </div>
      )}

      {/* ── PHASE B / C: flipped, tilted prompt + response ── */}
      {contentOp > 0.001 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 180,
            perspective: "1800px",
            perspectiveOrigin: "50% 50%",
            opacity: contentOp,
            overflow: "visible",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: (1920 - BOX_W) / 2,
              top:  (900  - BOX_H) / 2,
              width:  BOX_W,
              height: BOX_H,
              transform: `translate(${exitTx}px, ${exitTy}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${flipScale})`,
              transformOrigin: "center center",
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
            {/* Safari-like browser frame — builds around the content during the exit,
                matches Scene2's chat panel so the window is already present at handoff. */}
            {browserFrameOp > 0.01 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: browserFrameOp,
                  pointerEvents: "none",
                }}
              >
                {/* Outer border + shadow — pre-stretched by INV so it renders at
                    the same pixel size as Scene2's chat panel after scaling. */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  border: `${1 * INV}px solid ${BORDER}`,
                  borderRadius: 16 * INV,
                  boxShadow: `0 ${40 * INV}px ${100 * INV}px -${20 * INV}px rgba(0,0,0,0.35), 0 ${12 * INV}px ${30 * INV}px -${10 * INV}px rgba(0,0,0,0.18)`,
                  background: "transparent",
                }} />
                {/* Header strip with traffic lights + URL */}
                <div style={{
                  position: "absolute",
                  left: 0, right: 0, top: 0,
                  height: 42 * INV,
                  background: "#F5F5F7",
                  borderBottom: `${1 * INV}px solid ${BORDER}`,
                  borderTopLeftRadius: 16 * INV,
                  borderTopRightRadius: 16 * INV,
                  display: "flex",
                  alignItems: "center",
                  padding: `0 ${16 * INV}px`,
                  gap: 12 * INV,
                }}>
                  {["#EF4444", "#F59E0B", "#10B981"].map((c) => (
                    <div key={c} style={{
                      width: 10 * INV,
                      height: 10 * INV,
                      borderRadius: "50%",
                      background: c,
                      opacity: 0.7,
                    }} />
                  ))}
                  <div style={{ flex: 1 }} />
                  <span style={{
                    fontFamily: interFont,
                    fontSize: 11 * INV,
                    fontWeight: 600,
                    color: "#9CA3AF",
                  }}>
                    ChatGPT · chat.openai.com
                  </span>
                </div>
                {/* Input bar at bottom */}
                <div style={{
                  position: "absolute",
                  left: 0, right: 0, bottom: 0,
                  height: 46 * INV,
                  borderTop: `${1 * INV}px solid ${BORDER}`,
                  background: "#FFFFFF",
                  borderBottomLeftRadius: 16 * INV,
                  borderBottomRightRadius: 16 * INV,
                  display: "flex",
                  alignItems: "center",
                  gap: 10 * INV,
                  padding: `0 ${14 * INV}px`,
                }}>
                  <div style={{
                    width: 22 * INV,
                    height: 22 * INV,
                    borderRadius: "50%",
                    border: `1.5px solid ${BORDER}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: MUTED,
                    fontSize: 14 * INV,
                    flexShrink: 0,
                  }}>+</div>
                  <span style={{
                    flex: 1,
                    fontFamily: interFont,
                    fontSize: 12 * INV,
                    color: "#9CA3AF",
                  }}>Ask anything</span>
                  <div style={{
                    width: 28 * INV,
                    height: 28 * INV,
                    borderRadius: "50%",
                    background: "#D1D5DB",
                    color: "#FFF",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14 * INV,
                    flexShrink: 0,
                  }}>↑</div>
                </div>
              </div>
            )}

            {/* Sent prompt bubble — right-aligned (matches Scene2 chat-panel layout
                so the content stays put through the handoff). */}
            <div
              style={{
                position: "absolute",
                left: 60,
                top: bubbleTop,
                right: 60,
                display: "flex",
                justifyContent: "flex-end",
                transform: `translateX(${slideX}px)`,
                willChange: "transform, top",
              }}
            >
              <div
                style={{
                  maxWidth: `${promptMaxPct}%`,
                  background: BUBBLE_BG,
                  color: INK,
                  borderRadius: promptRadius,
                  padding: `${promptPadV}px ${promptPadH}px`,
                  fontFamily: interFont,
                  fontSize: promptFont,
                  fontWeight: 500,
                  lineHeight: 1.4,
                  letterSpacing: "-0.01em",
                  boxShadow: "0 10px 32px -14px rgba(20,30,60,0.18)",
                }}
              >
                {GPT_USER_MSG}
              </div>
            </div>

            {/* Thinking spinner */}
            {frame >= THINKING_START && frame < RESPONSE_START + 2 && (
              <div
                style={{
                  position: "absolute",
                  left: 80,
                  top: bubbleTop + 120,
                  opacity: interpolate(
                    frame,
                    [THINKING_START, THINKING_START + 4, RESPONSE_START - 3, RESPONSE_START],
                    [0, 1, 1, 0],
                    CLAMP,
                  ),
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: `3px solid ${BORDER}`,
                    borderTopColor: SEND_GREEN,
                    borderRightColor: SEND_GREEN,
                    transform: `rotate(${(frame - THINKING_START) * 14}deg)`,
                    transformOrigin: "center center",
                  }}
                />
              </div>
            )}

            {/* Response — anchored just below the bubble */}
            {frame >= RESPONSE_START - 4 && (
              <div
                style={{
                  position: "absolute",
                  left: 60,
                  top: bubbleTop + bubbleToResp,
                  right: 60,
                  opacity: respOpacity,
                  transform: `translateY(${respTy}px)`,
                  display: "flex",
                  gap: responseGap,
                  alignItems: "flex-start",
                }}
              >
                <svg
                  width={responseIcon}
                  height={responseIcon}
                  viewBox="0 0 24 24"
                  fill={SEND_GREEN}
                  style={{ flexShrink: 0, marginTop: 6 }}
                >
                  <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z" />
                </svg>
                <div
                  style={{
                    color: INK,
                    fontFamily: interFont,
                    fontSize: responseFont,
                    fontWeight: 500,
                    lineHeight: 1.5,
                    letterSpacing: "-0.005em",
                    whiteSpace: "pre-wrap",
                    flex: 1,
                  }}
                >
                  {responseText}
                  {respTyping && (
                    <span
                      style={{
                        display: "inline-block",
                        width: 2,
                        height: 24,
                        marginLeft: 4,
                        verticalAlign: "text-bottom",
                        background: INK,
                        opacity: caretBlink,
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cursor — only during Phase A */}
      {cursorVisible && <AnimatedCursor keyframes={cursorKeyframes} />}

      {/* Narration at the bottom — compact zone */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 180,
          background: SCENE_BG,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          zIndex: 1000,
          padding: "20px 0",
        }}
      >
        <NarrationText
          lines={narrationLines}
          position="center"
          zoneBg={SCENE_BG}
          showBorder={false}
        />
      </div>
    </AbsoluteFill>
  );
};
