import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { interFont } from "../constants";

export const SCENE_LIQUID_BAR_DURATION = 165; // 5.5s @ 30fps

// ─── Timeline (30 fps) — fast, no bar movement ───────────────────────────────
const T_SHIMMER_IN   = 0;    // shimmer always looping
const T_MIC_HOLD     = 4;    // start holding the mic (rings appear)
const T_DICT_START   = 14;   // dictation begins typing
const T_DICT_END     = 92;   // dictation finishes (fast typing)
const T_MIC_RELEASE  = 96;   // release mic, start morph to send arrow
const T_MORPH_END    = 110;  // morph completed
const T_SEND_PRESS   = 118;  // send button is pressed
const T_RESET_START  = 130;  // textfield begins to clear (backspace)
const T_RESET_END    = 148;  // textfield empty

const DICTATION = "i have an error FMO1201, what i need to do";

// ─── Palette ────────────────────────────────────────────────────────────────
const BLUE  = "#0A84FF";
const RED   = "#FF3B30";
const WHITE = "#FFFFFF";
const INK   = "#1a2430";

// ─── Liquid Glass Bar ────────────────────────────────────────────────────────
type LiquidBarProps = {
  shimmer: number;
  typed: string;
  caretOn: boolean;
  micHold: number;       // 0..1 — how "pressed" the mic is
  micRelease: number;    // 0..1 — release transition (drives morph mic→send)
  morph: number;         // 0..1 — mic icon → send arrow cross-fade
  sendPress: number;     // 0..1..0 — send button click squish
  ripple: number;        // 0..1 — expanding ring after press
  buttonAccent: number;  // 0..1 — color shift mic-blue → send-blue (slightly darker)
};

const LiquidBar: React.FC<LiquidBarProps> = ({
  shimmer, typed, caretOn,
  micHold, micRelease, morph, sendPress, ripple, buttonAccent,
}) => {
  const sweepX = interpolate(shimmer, [0, 1], [-120, 220]);

  // mic press scales the button down a bit; release returns to 1
  const buttonScale =
    interpolate(micHold, [0, 1], [1, 0.94]) *
    interpolate(sendPress, [0, 0.5, 1], [1, 0.86, 1]);

  // soft glow ring around the mic while held (3 staggered rings)
  void micRelease;

  // mix the button color: held mic = bright blue, send = slightly deeper blue
  const r = Math.round(58  + (10 - 58)  * buttonAccent);
  const g = Math.round(160 + (110 - 160) * buttonAccent);
  const b = Math.round(255 + (240 - 255) * buttonAccent);
  const btnTop = `rgb(${r + 30}, ${Math.min(255, g + 30)}, ${b})`;
  const btnBot = `rgb(${r}, ${g}, ${b})`;

  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: "50%",
        height: 140,
        marginTop: -70,
      }}
    >
      {/* outer soft glow */}
      <div
        style={{
          position: "absolute",
          inset: -18,
          borderRadius: 64,
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 65%)",
          filter: "blur(18px)",
          pointerEvents: "none",
        }}
      />

      {/* glass body */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 54,
          overflow: "hidden",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.28) 45%, rgba(255,255,255,0.42) 100%)",
          border: "1.5px solid rgba(255,255,255,0.85)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.06), 0 18px 40px rgba(80,100,130,0.22)",
        }}
      >
        {/* top specular highlight */}
        <div
          style={{
            position: "absolute",
            left: 40, right: 40, top: 6, height: 22, borderRadius: 22,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 100%)",
            filter: "blur(2px)", opacity: 0.85,
          }}
        />
        {/* bottom inner shadow */}
        <div
          style={{
            position: "absolute",
            left: 0, right: 0, bottom: 0, height: 30,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.22) 100%)",
          }}
        />
        {/* sweeping liquid shimmer */}
        <div
          style={{
            position: "absolute",
            top: 0, bottom: 0,
            left: `${sweepX}%`, width: "40%",
            background:
              "linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)",
            transform: "skewX(-12deg)",
            filter: "blur(6px)",
            mixBlendMode: "screen",
          }}
        />
        {/* refraction blobs */}
        <div
          style={{
            position: "absolute",
            left: "22%", top: "-40%",
            width: 240, height: 240, borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 65%)",
            filter: "blur(10px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "18%", bottom: "-30%",
            width: 200, height: 200, borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(10,132,255,0.28) 0%, rgba(10,132,255,0) 65%)",
            filter: "blur(12px)",
          }}
        />
      </div>

      {/* content row */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          padding: "0 28px 0 44px",
          gap: 16,
        }}
      >
        {/* dictated text */}
        <div
          style={{
            flex: 1,
            fontFamily: interFont,
            fontSize: 40,
            fontWeight: 600,
            color: INK,
            letterSpacing: -0.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {typed}
          <span
            style={{
              display: "inline-block",
              width: 3, height: 40,
              marginLeft: 4,
              background: INK,
              opacity: caretOn ? 0.85 : 0,
              transform: "translateY(8px)",
            }}
          />
        </div>

        {/* main action button (mic ↔ send) */}
        <div style={{ position: "relative", width: 72, height: 72 }}>
          {/* expanding pulse rings while holding the mic */}
          {[0, 1, 2].map((i) => {
            const ringPhase = (micHold * 1.0 + i * 0.33) % 1;
            const ringOp =
              micHold > 0.05
                ? (1 - ringPhase) * (1 - micRelease) * 0.55
                : 0;
            const ringSize = 72 + ringPhase * 44;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: "50%", top: "50%",
                  width: ringSize, height: ringSize,
                  marginLeft: -ringSize / 2,
                  marginTop:  -ringSize / 2,
                  borderRadius: "50%",
                  border: `2px solid ${BLUE}`,
                  opacity: ringOp,
                  pointerEvents: "none",
                }}
              />
            );
          })}

          {/* send-press ripple */}
          {ripple > 0 && (
            <div
              style={{
                position: "absolute",
                left: "50%", top: "50%",
                width:  72 + ripple * 50,
                height: 72 + ripple * 50,
                marginLeft: -(72 + ripple * 50) / 2,
                marginTop:  -(72 + ripple * 50) / 2,
                borderRadius: "50%",
                border: `2px solid ${BLUE}`,
                opacity: (1 - ripple) * 0.7,
                pointerEvents: "none",
              }}
            />
          )}

          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: `linear-gradient(180deg, ${btnTop} 0%, ${btnBot} 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1.5px solid rgba(255,255,255,0.55)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.7), 0 8px 18px rgba(10,132,255,0.45)",
              transform: `scale(${buttonScale})`,
            }}
          >
            {/* MIC (fades out during morph) */}
            <svg
              width={30} height={30} viewBox="0 0 24 24" fill="none"
              style={{
                position: "absolute",
                opacity: 1 - morph,
                transform: `scale(${1 - morph * 0.4})`,
              }}
            >
              <rect x={9} y={3} width={6} height={12} rx={3} fill={WHITE} />
              <path
                d="M 6 11 Q 6 17 12 17 Q 18 17 18 11"
                stroke={WHITE} strokeWidth={2} fill="none" strokeLinecap="round"
              />
              <line x1={12} y1={17} x2={12} y2={21}
                stroke={WHITE} strokeWidth={2} strokeLinecap="round" />
            </svg>

            {/* SEND ARROW (fades in during morph) */}
            <svg
              width={32} height={32} viewBox="0 0 24 24" fill="none"
              style={{
                position: "absolute",
                opacity: morph,
                transform: `scale(${0.6 + morph * 0.4})`,
              }}
            >
              <path
                d="M 12 20 L 12 5 M 6 11 L 12 5 L 18 11"
                stroke={WHITE}
                strokeWidth={2.6}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* close button */}
        <div
          style={{
            width: 72, height: 72, borderRadius: "50%",
            background: `linear-gradient(180deg, #ff6b62 0%, ${RED} 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1.5px solid rgba(255,255,255,0.55)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.7), 0 8px 18px rgba(255,59,48,0.45)",
          }}
        >
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <path
              d="M 6 6 L 18 18 M 18 6 L 6 18"
              stroke={WHITE} strokeWidth={3} strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

// ─── Scene ───────────────────────────────────────────────────────────────────
export const SceneLiquidBar: React.FC = () => {
  const frame = useCurrentFrame();
  // shimmer loops every 90 frames once it starts
  const shimmerRaw = Math.max(0, frame - T_SHIMMER_IN);
  const shimmer    = (shimmerRaw % 90) / 90;

  // ── Mic hold lifecycle ────────────────────────────────────────────────────
  const micHold = interpolate(
    frame,
    [T_MIC_HOLD, T_MIC_HOLD + 8, T_MIC_RELEASE, T_MIC_RELEASE + 8],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const micRelease = interpolate(
    frame, [T_MIC_RELEASE, T_MIC_RELEASE + 12], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ── Mic → Send morph ──────────────────────────────────────────────────────
  const morph = interpolate(
    frame, [T_MIC_RELEASE + 4, T_MORPH_END], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const buttonAccent = morph;

  // ── Send press click (squish in then back) ────────────────────────────────
  const sendPress = interpolate(
    frame,
    [T_SEND_PRESS, T_SEND_PRESS + 5, T_SEND_PRESS + 12],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  // ripple expands after press
  const ripple = interpolate(
    frame, [T_SEND_PRESS + 4, T_SEND_PRESS + 26], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ── Dictation typing 0..n  +  reset (backspace) ──────────────────────────
  const dictProg = interpolate(
    frame, [T_DICT_START, T_DICT_END], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const dictLen = Math.floor(dictProg * DICTATION.length);

  const resetProg = interpolate(
    frame, [T_RESET_START, T_RESET_END], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  // backspace: slice length goes from full → 0
  const visibleLen =
    frame < T_RESET_START
      ? dictLen
      : Math.max(0, Math.floor((1 - resetProg) * DICTATION.length));
  const typed = DICTATION.slice(0, visibleLen);

  // caret blinks while idle/typing, hidden during morph/press
  const caretOn =
    frame < T_MIC_RELEASE &&
    Math.floor(frame / 10) % 2 === 0;

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at center, #ffffff 0%, #e6ecf2 100%)",
        fontFamily: interFont,
        overflow: "hidden",
      }}
    >
      <LiquidBar
        shimmer={shimmer}
        typed={typed}
        caretOn={caretOn}
        micHold={micHold}
        micRelease={micRelease}
        morph={morph}
        sendPress={sendPress}
        ripple={ripple}
        buttonAccent={buttonAccent}
      />
    </AbsoluteFill>
  );
};
