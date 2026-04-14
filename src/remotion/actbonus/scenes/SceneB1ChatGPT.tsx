import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { GPT_USER_MSG, GPT_RESPONSE, interFont } from "../constants";
import { BrowserShell } from "../components/BrowserShell";
import { ChatGPTWindow } from "../components/ChatGPTWindow";
import { NarrationText } from "../../act1/components/NarrationText";
import { AnimatedCursor } from "../../act1/components/AnimatedCursor";

const USER_TYPE_START = 72;
const USER_TYPE_SPEED = 4;
const SEND_FRAME = 112;
const RESPONSE_START = 122;
const RESPONSE_SPEED = 7;

// Background matching Act 1
const DESKTOP_BG = "#F0F0F0";

export const Scene1ChatGPT: React.FC = () => {
  const frame = useCurrentFrame();

  // Typing in input field (before send)
  const inputChars = frame >= USER_TYPE_START && frame < SEND_FRAME
    ? Math.floor((frame - USER_TYPE_START) * USER_TYPE_SPEED)
    : 0;
  const inputText = GPT_USER_MSG.slice(0, inputChars);

  // After send: message appears in chat bubble
  const userText = frame >= SEND_FRAME ? GPT_USER_MSG : "";

  // Response typing
  const responseChars = frame >= RESPONSE_START
    ? Math.floor((frame - RESPONSE_START) * RESPONSE_SPEED)
    : 0;
  const responseText = GPT_RESPONSE.slice(0, responseChars);
  const showCursor = frame >= RESPONSE_START && responseChars < GPT_RESPONSE.length;

  // Cursor keyframes
  // Browser content area starts at: top=20(UI_TOP)+38(titlebar)+42(toolbar)=100px, left=20px
  // Input area y ≈ 100 + (content_height - 85) ≈ 100 + (830-80-85) = 765px
  // Send button x ≈ 20 + 240(sidebar) + (1880-240-720)/2 + 720 - 55 ≈ 1415px
  const cursorKeyframes = [
    { frame: 0, x: 960, y: 500 },
    { frame: 65, x: 960, y: 770 },
    { frame: 68, x: 960, y: 770, click: true },
    { frame: SEND_FRAME - 3, x: 1415, y: 778 },
    { frame: SEND_FRAME, x: 1415, y: 778, click: true },
    { frame: SEND_FRAME + 14, x: 1415, y: 778 },
  ];

  const narrationLines = [
    { words: ["You", "tried", "AI."], startFrame: 62, color: "#1D1D1F" },
    {
      words: ["It", "answered.", "Generically."],
      startFrame: 75,
      color: "#6B7280",
      wordColors: ["#6B7280", "#6B7280", "#1D1D1F"],
      wordWeights: [600, 600, 800],
      wordDelays: [0, 5, 60],
    },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: DESKTOP_BG }}>
      <BrowserShell slideInStart={3} url="chat.openai.com" tabTitle="ChatGPT">
        <ChatGPTWindow
          inputText={inputText}
          userText={userText}
          responseText={responseText}
          showCursor={showCursor}
        />
      </BrowserShell>

      {/* Send flash */}
      {frame >= SEND_FRAME && frame <= SEND_FRAME + 8 && (
        <div
          style={{
            position: "absolute",
            right: 280,
            bottom: 250,
            backgroundColor: "#1D1D1F",
            color: "white",
            borderRadius: 8,
            padding: "8px 18px",
            fontSize: 14,
            fontFamily: interFont,
            fontWeight: 600,
            opacity: interpolate(
              frame,
              [SEND_FRAME, SEND_FRAME + 3, SEND_FRAME + 6, SEND_FRAME + 8],
              [0, 1, 1, 0],
              { extrapolateRight: "clamp" }
            ),
            zIndex: 50,
          }}
        >
          Sending...
        </div>
      )}

      <AnimatedCursor keyframes={cursorKeyframes} />
      <NarrationText lines={narrationLines} zoneBg="transparent" showBorder={false} />
    </AbsoluteFill>
  );
};
