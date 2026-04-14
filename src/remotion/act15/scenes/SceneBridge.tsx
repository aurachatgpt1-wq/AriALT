import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { interFont } from "../constants";

// ─── Timing ───────────────────────────────────────────────────────────────────
// Phase 1 — "What if AI actually know your infrastructure?"
const T_TITLE_IN  = 6;
const T_TITLE_OUT = 72;

// Phase 1.5 — "Introducing" Apple-keynote reveal + flip into logo
const HERO_TEXT        = "Introducing";
const T_HERO_TEXT_IN   = 92;
const T_REVEAL_END     = T_HERO_TEXT_IN + 16;               // 108
const T_TEXT_HOLD_END  = T_REVEAL_END + 14;                 // 122
const T_SHRINK_DUR     = 12;
const T_SHRINK_END     = T_TEXT_HOLD_END + T_SHRINK_DUR;    // 134
const T_FLIP_START     = T_TEXT_HOLD_END + 6;               // 128
const T_FLIP_DUR       = 16;
const T_FLIP_END       = T_FLIP_START + T_FLIP_DUR;          // 144

// Logo holds, then two-phase tagline
const T_HERO_HOLD       = 160;
// Phase A: "The first vertical GenAI platform" — zoom starts AS "GenAI" appears
const T_PHASE_A_START   = 152;
const T_PHASE_A_WORD_STEP = 7;      // words: 152, 159, 166, 173 (GenAI), 180 (platform)
const T_PHASE_A_ZOOM    = 170;      // zoom + underline begin slightly BEFORE GenAI
const T_PHASE_A_HOLD    = 225;
const T_PHASE_A_END     = 255;
// Phase B: "autonomously optimize [non-standardizable] industrial workflows"
const T_PHASE_B_START   = 268;      // start right after Phase A transition
const T_PHASE_B_NONSTD  = 290;
const T_PHASE_B_INDUSTRIAL = 295;   // zoom starts DURING word appearance (industrial @ ~286)
const T_SCENE_OUT_START = 400;
const T_SCENE_OUT_END   = 425;

// ─── Hero layout ────────────────────────────────────────────────────────────
const HERO_LOGO_CX   = 1920 / 2;
const HERO_LOGO_CY   = 540;
const HERO_LOGO_SIZE = 260;
const HERO_TEXT_SIZE = 196;
const LOGO_BR_RATIO = 0.22;
// After flip, logo shifts up to make room for tagline
const LOGO_SETTLED_CX = 1920 / 2;
const LOGO_SETTLED_CY = 200;
const LOGO_SETTLED_SIZE = 110;

// ─── Scene ────────────────────────────────────────────────────────────────────
export const SceneBridge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

  const sceneOp = interpolate(frame, [T_SCENE_OUT_START, T_SCENE_OUT_END], [1, 0], clamp);

  const sp = (f: number, s = 240, d = 26, m = 0.7) =>
    spring({ frame: frame - f, fps, config: { stiffness: s, damping: d, mass: m } });

  // ── Phase 1 — title ──────────────────────────────────────────────────────
  const titleEnterT = sp(T_TITLE_IN, 220, 28, 0.7);
  const p1Op = Math.min(
    interpolate(titleEnterT, [0, 1], [0, 1]),
    interpolate(frame, [T_TITLE_OUT, T_TITLE_OUT + 18], [1, 0], clamp),
  );

  // ── Phase 1.5 — Hero "Introducing" ─────────────────────────────────────
  const shrinkSpring = spring({
    frame: frame - T_TEXT_HOLD_END, fps,
    config: { stiffness: 150, damping: 14, mass: 1.0 },
  });
  const anticipT = interpolate(
    frame, [T_TEXT_HOLD_END - 6, T_TEXT_HOLD_END, T_TEXT_HOLD_END + 3], [0, 1, 0], clamp,
  );
  const textScale =
    interpolate(shrinkSpring, [0, 1], [1, 0.36], clamp) + anticipT * 0.035;
  const textDriftY = interpolate(shrinkSpring, [0, 1], [0, 18], clamp);

  const textFlipProgress = interpolate(
    frame,
    [T_FLIP_START, T_FLIP_START + T_FLIP_DUR * 0.50],
    [0, 1],
    clamp,
  );
  const flipEaseIn = textFlipProgress * textFlipProgress;
  const textRotX = interpolate(flipEaseIn, [0, 1], [0, 92]);
  const textFlipOp = interpolate(textFlipProgress, [0, 0.70, 1], [1, 0.15, 0]);

  const textBlur = interpolate(
    frame, [T_FLIP_START - 2, T_FLIP_START + 8, T_FLIP_END], [0, 4, 0], clamp,
  );

  // Logo flip-in
  const logoFlipEnter = T_FLIP_START + T_FLIP_DUR * 0.35;
  const logoFlipProgress = interpolate(
    frame, [logoFlipEnter, T_FLIP_END], [0, 1], clamp,
  );
  const logoLandSpring = spring({
    frame: frame - logoFlipEnter, fps,
    config: { stiffness: 160, damping: 16, mass: 0.9 },
  });
  const logoFlipRotX = interpolate(logoLandSpring, [0, 1], [-90, 0], clamp);
  const logoFlipOp   = interpolate(logoFlipProgress, [0, 0.25, 1], [0, 0.55, 1]);

  const logoVisible = frame >= logoFlipEnter - 1;
  const logoRotX = frame < T_FLIP_END ? logoFlipRotX : 0;

  // Logo shifts up after flip to make room for tagline
  const logoShiftT = spring({
    frame: frame - T_FLIP_END, fps,
    config: { stiffness: 100, damping: 22, mass: 1.0 },
  });
  const logoCX = interpolate(logoShiftT, [0, 1], [HERO_LOGO_CX, LOGO_SETTLED_CX], clamp);
  const logoCY = interpolate(logoShiftT, [0, 1], [HERO_LOGO_CY, LOGO_SETTLED_CY], clamp);
  const logoSizeSettled = interpolate(logoShiftT, [0, 1], [HERO_LOGO_SIZE, LOGO_SETTLED_SIZE], clamp);

  // (Tagline timing handled inline in the render section below)

  // Hero text entrance
  const heroEnterSpring = spring({
    frame: frame - T_HERO_TEXT_IN, fps,
    config: { stiffness: 220, damping: 22, mass: 0.8 },
  });
  const heroEnterOp = interpolate(heroEnterSpring, [0, 1], [0, 1], clamp);
  const heroEnterY  = interpolate(heroEnterSpring, [0, 1], [18, 0], clamp);
  const heroEnterScale = interpolate(heroEnterSpring, [0, 1], [0.97, 1], clamp);

  const heroTextOp = textFlipOp;

  const glowT = interpolate(
    frame,
    [T_HERO_TEXT_IN + 4, T_REVEAL_END + 2, T_TEXT_HOLD_END + 4, T_SHRINK_END],
    [0, 1, 1, 0.4],
    clamp,
  );

  return (
    <AbsoluteFill style={{ opacity: sceneOp }}>

      {/* ── Background gradient ── */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "#6FA3CC" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(150deg, #A8C4E8 0%, #7BAFD4 45%, #5E9EC8 100%)" }} />
      <div style={{
        position: "absolute", width: 1000, height: 900, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(147,197,253,0.38) 0%, transparent 65%)",
        right: -200, bottom: -160, filter: "blur(90px)",
      }} />

      {/* ── Phase 1: title centered ── */}
      {p1Op > 0.01 && (
        <AbsoluteFill style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          opacity: p1Op, pointerEvents: "none", zIndex: 8,
        }}>
          <div style={{
            textAlign: "center",
            fontFamily: interFont, fontSize: 96, fontWeight: 700,
            letterSpacing: "-0.040em", lineHeight: 1.06,
            opacity: interpolate(titleEnterT, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(titleEnterT, [0, 1], [28, 0])}px)`,
          }}>
            <div style={{ color: "rgba(255,255,255,0.92)" }}>What if AI actually</div>
            <div style={{ color: "rgba(210,228,248,0.86)" }}>know your infrastructure?</div>
          </div>
        </AbsoluteFill>
      )}

      {/* ── Phase 1.5: HERO "Introducing" ── */}
      {heroTextOp > 0.005 && frame < T_FLIP_END && (
        <>
          <div style={{
            position: "absolute",
            left: HERO_LOGO_CX - 820,
            top:  HERO_LOGO_CY - 260,
            width: 1640, height: 520,
            pointerEvents: "none", zIndex: 8,
            background:
              "radial-gradient(ellipse at center, " +
              `rgba(180,210,255,${0.34 * glowT}) 0%, ` +
              `rgba(140,180,245,${0.18 * glowT}) 28%, ` +
              "rgba(120,170,230,0) 68%)",
            filter: "blur(40px)",
            opacity: heroTextOp * heroEnterOp,
          }} />

          <div style={{
            position: "absolute", left: 0, right: 0,
            top: HERO_LOGO_CY, textAlign: "center",
            pointerEvents: "none", zIndex: 9, perspective: 1600,
          }}>
            <div style={{
              display: "inline-block",
              fontFamily: interFont, fontSize: HERO_TEXT_SIZE, fontWeight: 900,
              letterSpacing: "-0.045em", lineHeight: 1, whiteSpace: "nowrap",
              color: "#FFFFFF",
              transform:
                `translateY(calc(-50% + ${textDriftY + heroEnterY}px)) ` +
                `scale(${textScale * heroEnterScale}) rotateX(${textRotX}deg)`,
              transformOrigin: "center center",
              opacity: heroTextOp * heroEnterOp,
              filter:
                `drop-shadow(0 0 18px rgba(255,255,255,${0.28 * glowT})) ` +
                `drop-shadow(0 0 52px rgba(175,210,245,${0.22 * glowT})) ` +
                `blur(${textBlur}px)`,
              willChange: "transform, opacity, filter",
              backfaceVisibility: "hidden",
            }}>
              {HERO_TEXT}
            </div>
          </div>
        </>
      )}

      {/* ── LOGO — flips in, then shifts up for tagline ── */}
      {logoVisible && (
        <div style={{
          position: "absolute",
          left: logoCX - logoSizeSettled / 2,
          top:  logoCY - logoSizeSettled / 2,
          width: logoSizeSettled, height: logoSizeSettled,
          perspective: 1600, zIndex: 10,
        }}>
          <div style={{
            width: "100%", height: "100%",
            borderRadius: logoSizeSettled * LOGO_BR_RATIO,
            overflow: "hidden",
            opacity: logoFlipOp,
            transform: `rotateX(${logoRotX}deg)`,
            transformOrigin: "center center",
            backfaceVisibility: "hidden",
            boxShadow:
              "0 22px 50px rgba(0,0,0,0.30), 0 34px 88px rgba(20,40,80,0.36)",
            willChange: "opacity, transform",
          }}>
            <Img
              src={staticFile("aria-logo.png")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════
          TAGLINE — Two-phase animation
          Phase A: "The first vertical GenAI platform" + zoom on "GenAI platform" + underline on "GenAI"
          Transition: Apple-style fade+scale
          Phase B: "autonomously optimize [non-standardizable] industrial workflows" + zoom on "industrial workflows"
          ═════════════════════════════════════════════════════════════════ */}

      {/* ── PHASE A ── */}
      {frame >= T_PHASE_A_START - 2 && frame < T_PHASE_A_END + 10 && (() => {
        const WORDS_A = ["The", "first", "GenAI", "platform"];
        const GENAI_IDX = 2;
        const BLUE = "#4FC3F7"; // bright sky blue, brand-aligned

        // Word entrance animation
        const renderWord = (word: string, idx: number, highlight = false) => {
          const wordDelay = T_PHASE_A_START + idx * T_PHASE_A_WORD_STEP;
          const sp1 = spring({
            frame: frame - wordDelay, fps,
            config: { stiffness: 180, damping: 20, mass: 0.7 },
          });
          const op = interpolate(sp1, [0, 1], [0, 1], clamp);
          const y = interpolate(sp1, [0, 1], [18, 0], clamp);
          const blur = interpolate(sp1, [0, 0.6], [5, 0], clamp);

          // Extra margin-left on GenAI to leave room for "vertical" callout
          const extraLeft = idx === GENAI_IDX ? 100 : 0;

          return (
            <span key={idx} style={{
              display: "inline-block",
              opacity: op,
              transform: `translateY(${y}px)`,
              filter: `blur(${blur}px)`,
              marginLeft: extraLeft,
              marginRight: 20,
              position: "relative",
              willChange: "transform, opacity, filter",
            }}>
              {word}
              {highlight && (() => {
                // Hand-drawn BLUE annotation on GenAI: underline + arrow + "vertical" callout between first and GenAI
                const uSp = spring({
                  frame: frame - (wordDelay + 2), fps,
                  config: { stiffness: 160, damping: 20, mass: 0.7 },
                });
                const uProg = interpolate(uSp, [0, 1], [0, 1], clamp);
                const cSp = spring({
                  frame: frame - (wordDelay - 3), fps, // "vertical" callout appears BEFORE GenAI finishes
                  config: { stiffness: 180, damping: 18, mass: 0.7 },
                });
                const cProg = interpolate(cSp, [0, 1], [0, 1], clamp);
                const arrowSp = spring({
                  frame: frame - (wordDelay + 4), fps,
                  config: { stiffness: 140, damping: 20, mass: 0.8 },
                });
                const arrowProg = interpolate(arrowSp, [0, 1], [0, 1], clamp);
                return (
                  <>
                    {/* Underline under GenAI */}
                    <svg
                      viewBox="0 0 200 30"
                      preserveAspectRatio="none"
                      style={{
                        position: "absolute",
                        left: -4,
                        right: -4,
                        bottom: -18,
                        width: "calc(100% + 8px)",
                        height: 22,
                        overflow: "visible",
                        pointerEvents: "none",
                      }}
                    >
                      <path
                        d="M 3 15 C 20 10, 40 20, 60 13 S 100 8, 130 14 T 197 12"
                        stroke={BLUE}
                        strokeWidth={7}
                        strokeLinecap="round"
                        fill="none"
                        style={{
                          filter: `drop-shadow(0 0 8px ${BLUE}aa)`,
                          strokeDasharray: 250,
                          strokeDashoffset: 250 * (1 - uProg),
                        }}
                      />
                    </svg>
                    {/* "vertical" callout — positioned to the LEFT of GenAI (between first and GenAI) */}
                    <div style={{
                      position: "absolute",
                      top: -78,
                      left: -150,
                      pointerEvents: "none",
                      width: 180,
                      height: 90,
                    }}>
                      <span style={{
                        position: "absolute",
                        top: 0,
                        left: 10,
                        fontFamily: "'Caveat', 'Comic Sans MS', cursive",
                        fontSize: 56,
                        fontWeight: 900,
                        color: BLUE,
                        letterSpacing: "0.02em",
                        transform: `scale(${cProg}) rotate(-8deg)`,
                        transformOrigin: "center center",
                        opacity: cProg,
                        filter: `drop-shadow(0 0 10px ${BLUE}88)`,
                        textShadow: `0 0 8px ${BLUE}55`,
                        whiteSpace: "nowrap",
                      }}>
                        vertical
                      </span>
                      {/* Curved arrow from "vertical" callout down-right into GenAI */}
                      <svg
                        viewBox="0 0 180 90"
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          overflow: "visible",
                        }}
                      >
                        <path
                          d="M 80 22 Q 110 40, 148 72 L 140 72 M 148 72 L 146 62"
                          stroke={BLUE}
                          strokeWidth={5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                          style={{
                            filter: `drop-shadow(0 0 6px ${BLUE}99)`,
                            strokeDasharray: 140,
                            strokeDashoffset: 140 * (1 - arrowProg),
                          }}
                        />
                      </svg>
                    </div>
                  </>
                );
              })()}
            </span>
          );
        };

        // Zoom progress: strong zoom-in on GenAI area
        const zoomT = spring({
          frame: frame - T_PHASE_A_ZOOM, fps,
          config: { stiffness: 140, damping: 20, mass: 0.8 },
        });
        const scale = interpolate(zoomT, [0, 1], [1, 1.9], clamp);
        // Shift left so "GenAI" moves to center when zoomed
        const shiftX = interpolate(zoomT, [0, 1], [0, -460], clamp);

        // Phase A exit (fade+scale to transition out)
        const exitT = interpolate(frame, [T_PHASE_A_END - 5, T_PHASE_A_END + 10], [0, 1], clamp);
        const exitOp = interpolate(exitT, [0, 1], [1, 0], clamp);
        const exitScale = interpolate(exitT, [0, 1], [1, 1.08], clamp);
        const exitBlur = interpolate(exitT, [0, 1], [0, 8], clamp);

        return (
          <div style={{
            position: "absolute",
            left: 0, right: 0,
            top: 540 - 64 * 1.15 / 2,
            textAlign: "center",
            zIndex: 10,
            fontFamily: interFont,
            fontSize: 64, fontWeight: 700,
            lineHeight: 1.15, letterSpacing: "-0.035em",
            color: "rgba(255,255,255,0.95)",
            opacity: exitOp,
            transform: `translateX(${shiftX}px) scale(${scale * exitScale})`,
            transformOrigin: "center center",
            filter: `blur(${exitBlur}px)`,
            willChange: "transform, opacity, filter",
          }}>
            {WORDS_A.map((w, i) => renderWord(w, i, i === GENAI_IDX))}
          </div>
        );
      })()}

      {/* ── PHASE B ── */}
      {frame >= T_PHASE_B_START - 2 && frame < T_SCENE_OUT_END && (() => {
        // Main line: "autonomously optimize ___ industrial workflows"
        // "non-standardizable" appears ABOVE between "optimize" and "industrial"
        const WORDS_B = ["autonomously", "optimize", "industrial", "workflows"];
        const WORD_STEP_B = 9;

        const renderWord = (word: string, idx: number, emphasize = false) => {
          const wordDelay = T_PHASE_B_START + idx * WORD_STEP_B;
          const sp1 = spring({
            frame: frame - wordDelay, fps,
            config: { stiffness: 180, damping: 20, mass: 0.7 },
          });
          const op = interpolate(sp1, [0, 1], [0, 1], clamp);
          // Alternate side entry: even words from LEFT, odd from RIGHT
          const fromLeft = idx % 2 === 0;
          const x = interpolate(sp1, [0, 1], [fromLeft ? -80 : 80, 0], clamp);
          const blur = interpolate(sp1, [0, 0.6], [5, 0], clamp);

          return (
            <span key={idx} style={{
              display: "inline-block",
              opacity: op,
              transform: `translateX(${x}px)`,
              filter: `blur(${blur}px)`,
              marginRight: 20,
              willChange: "transform, opacity, filter",
            }}>
              {word}
            </span>
          );
        };

        // Zoom/emphasis on "industrial workflows" — snappier + stronger
        const indZoomT = spring({
          frame: frame - T_PHASE_B_INDUSTRIAL, fps,
          config: { stiffness: 140, damping: 20, mass: 0.8 },
        });
        const indScale = interpolate(indZoomT, [0, 1], [1, 1.4], clamp);

        // non-standardizable entrance (small, above, parenthetical)
        const nsSp = spring({
          frame: frame - T_PHASE_B_NONSTD, fps,
          config: { stiffness: 160, damping: 22, mass: 0.8 },
        });
        const nsOp = interpolate(nsSp, [0, 1], [0, 1], clamp);
        const nsY = interpolate(nsSp, [0, 1], [-10, 0], clamp);
        const nsBlur = interpolate(nsSp, [0, 0.6], [4, 0], clamp);

        // Scene exit
        const exitT = interpolate(frame, [T_SCENE_OUT_START, T_SCENE_OUT_END], [0, 1], clamp);
        const exitOp = interpolate(exitT, [0, 1], [1, 0], clamp);

        return (
          <div style={{
            position: "absolute",
            left: 0, right: 0,
            top: 540 - 64 * 1.15 / 2,
            textAlign: "center",
            zIndex: 10,
            fontFamily: interFont,
            fontSize: 64, fontWeight: 700,
            lineHeight: 1.15, letterSpacing: "-0.035em",
            color: "rgba(255,255,255,0.95)",
            opacity: exitOp,
            transform: `scale(${indScale})`,
            transformOrigin: "center center",
            willChange: "transform, opacity",
          }}>
            {/* "non-standardizable" as hand-drawn green callout above */}
            <div style={{
              position: "absolute",
              left: 0, right: 0,
              top: -90,
              fontFamily: "'Caveat', 'Comic Sans MS', cursive",
              fontSize: 44, fontWeight: 900,
              color: "#4FC3F7",
              letterSpacing: "0.02em",
              opacity: nsOp,
              transform: `translateY(${nsY}px) rotate(-3deg)`,
              filter: `blur(${nsBlur}px) drop-shadow(0 0 8px #4FC3F766)`,
              textShadow: "0 0 6px #4FC3F744",
              willChange: "transform, opacity, filter",
              pointerEvents: "none",
            }}>
              non-standardizable
              {/* Hand-drawn underline below the callout */}
              <svg
                viewBox="0 0 300 20"
                preserveAspectRatio="none"
                style={{
                  display: "block",
                  margin: "4px auto 0",
                  width: 440,
                  height: 14,
                  overflow: "visible",
                }}
              >
                <path
                  d="M 5 10 C 40 4, 80 16, 130 9 S 220 4, 295 12"
                  stroke="#4FC3F7"
                  strokeWidth={5}
                  strokeLinecap="round"
                  fill="none"
                  style={{
                    filter: "drop-shadow(0 0 6px #4FC3F788)",
                    strokeDasharray: 320,
                    strokeDashoffset: 320 * (1 - nsOp),
                  }}
                />
              </svg>
            </div>

            {/* Arrow from callout pointing down to "industrial workflows" */}
            <svg
              viewBox="0 0 200 80"
              style={{
                position: "absolute",
                left: "50%",
                top: -30,
                width: 200,
                height: 80,
                transform: "translateX(-50%)",
                overflow: "visible",
                pointerEvents: "none",
                opacity: nsOp,
              }}
            >
              <path
                d="M 100 8 Q 95 30, 100 60 L 93 52 M 100 60 L 107 52"
                stroke="#4FC3F7"
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                style={{
                  filter: "drop-shadow(0 0 6px #4FC3F777)",
                  strokeDasharray: 120,
                  strokeDashoffset: 120 * (1 - nsOp),
                }}
              />
            </svg>

            {WORDS_B.map((w, i) => renderWord(w, i))}
          </div>
        );
      })()}

    </AbsoluteFill>
  );
};
