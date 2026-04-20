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

// ─── Items ────────────────────────────────────────────────────────────────────
const ITEMS = [
  "Memory Persistent",
  "Context-aware",
  "No prompts needed",
  "No developers required",
  "No data preparation",
  "No additional hardware",
  "Zero expertise required",
  "Tailored on your Data",
  "Works with your existing systems",
  "Compliant with your standards",
  "No setup costs",
  "Autonomous by design",
  "Ready from day one",
];
const LAST_IDX = ITEMS.length - 1;

// ─── Title phase ─────────────────────────────────────────────────────────────
// "Native multi-agent AI architecture" — Apple keynote word-by-word reveal
const TITLE_WORDS = ["Native", "multi-agent", "AI", "architecture"];
const T_TITLE_START    = 8;
const T_TITLE_STAGGER  = 7;
const T_TITLE_OUT      = 80;
const T_TITLE_OUT_END  = 94;

// ─── Logo fullscreen zoom-in (background turns dark blue) ──────────────────
// Starts simultaneously with title exit (no delay between the two animations)
const T_LOGO_ZOOM_IN_START = 80;   // = T_TITLE_OUT (concurrent)
const T_LOGO_ZOOM_IN_END   = 140;

// ─── Dark-blue text phases (enter word-by-word, exit push-slide-up) ────────
// Each phase overlaps the previous exit by ~4 frames for a seamless push feel.
const DARK_PHASES: {
  lines: string[][]; enter: number; exit: number;
  poppy?: boolean; slideOut?: boolean; slideIn?: boolean;
  withLine?: boolean; withArrows?: boolean;
}[] = [
  { lines: [["Beyond", "documents."], ["Directly", "within", "your", "systems."]],
    enter: 94, exit: 178 },
  { lines: [["Complex", "tasks."]],
    enter: 192, exit: 218, slideOut: true, withLine: true },
  { lines: [["Fully", "handled", "by", "agents."]],
    enter: 218, exit: 262, slideIn: true, slideOut: true, withArrows: true },
  { lines: [["Operators,", "freed", "from", "the", "workload."]],
    enter: 268, exit: 325, slideIn: true, slideOut: true, poppy: true },
];
const DARK_WORD_STAGGER    = 6;
const DARK_LINE_DELAY      = 20;

// ─── Logo zoom-out back to original position ───────────────────────────────
// Starts at the same frame as the last text exit — they run in parallel
const T_LOGO_ZOOM_OUT_START = 322;
const T_LOGO_ZOOM_OUT_END   = 375;
// Dark overlay holds until text exits, then fades to reveal logo collapse
const T_DARK_HOLD_UNTIL = 325;

// Dark blue (matching logo background)
const LOGO_DARK = "#0F1E36";
const LOGO_FULL_SCALE = 6;

// ─── List timing (enters at 326 — as logo settles, scroll after hold) ──
const T_LIST_IN    = 326;
const T_LIST_BASE  = 356;            // scroll starts 30f after fade-in (~1s hold)
const LIST_STEP    = 21;          // ~9s per passata (21f/item × 11 passi + settle)

const T_ZOOM           = T_LIST_BASE + 11 * LIST_STEP + 28;  // 552
const T_FINAL_ZOOM_END = T_ZOOM + 30;                         // 582
const T_SCENE_OUT_START = T_FINAL_ZOOM_END;                   // 582
const T_SCENE_OUT_END   = T_SCENE_OUT_START + 17;             // 599

// ─── Layout ──────────────────────────────────────────────────────────────────
const CHECK_Y         = 540;
const SLOT_H          = 150;
const CHECK_LOGO_SIZE = 128;
const LOGO_GAP        = 52;
const CHECK_LOGO_CX   = 580;
const CHECK_LOGO_CY   = CHECK_Y;
const FOCUSED_TEXT_X  = CHECK_LOGO_CX + CHECK_LOGO_SIZE / 2 + LOGO_GAP;
const CURVE_MAX_PX    = 230;
const CURVE_MAX_DIST  = 2.6;
const LOGO_BR_RATIO   = 0.22;
const FOCAL_X         = CHECK_LOGO_CX + 260;
const FOCAL_Y         = CHECK_Y;

// ─── Scene ────────────────────────────────────────────────────────────────────
export const SceneBridgeList: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

  const sceneOp = interpolate(frame, [T_SCENE_OUT_START, T_SCENE_OUT_END], [1, 0], clamp);

  // ── Title phase: word-by-word reveal, Apple keynote style ─────────────────
  const titleWordStates = TITLE_WORDS.map((word, i) => {
    const sp = spring({
      frame: frame - (T_TITLE_START + i * T_TITLE_STAGGER),
      fps,
      config: { stiffness: 220, damping: 20, mass: 0.8 },
    });
    return {
      word,
      op: interpolate(sp, [0, 1], [0, 1], clamp),
      ty: interpolate(sp, [0, 1], [28, 0], clamp),
    };
  });
  // Pop-away exit: bouncy scale + quick opacity drop so it dissolves smoothly
  // alongside the dark-bg fill (they must land together)
  const titleExitSp = spring({
    frame: frame - T_TITLE_OUT, fps,
    config: { stiffness: 320, damping: 14, mass: 0.6 },
  });
  const titleExitScale = interpolate(titleExitSp, [0, 1], [1, 1.32], clamp);
  // Fast opacity drop, 8 frames — already well on its way to 0 by frame 86
  const titleExitOp    = interpolate(frame,
    [T_TITLE_OUT, T_TITLE_OUT + 8], [1, 0], clamp);
  const titleVisible = frame < T_TITLE_OUT_END;

  // ── Logo zoom-in (fullscreen dark blue fill) ────────────────────────────
  const logoZoomInSp = spring({ frame: frame - T_LOGO_ZOOM_IN_START, fps,
    config: { stiffness: 70, damping: 24, mass: 1.2 } });
  const logoZoomOutSp = spring({ frame: frame - T_LOGO_ZOOM_OUT_START, fps,
    config: { stiffness: 100, damping: 24, mass: 0.9 } });

  const logoScale = frame < T_LOGO_ZOOM_OUT_START
    ? interpolate(logoZoomInSp,  [0, 1], [1, LOGO_FULL_SCALE], clamp)
    : interpolate(logoZoomOutSp, [0, 1], [LOGO_FULL_SCALE, 1], clamp);

  // Letters fade out during zoom-in; always visible during zoom-out (shows actual logo)
  const logoImgOp = frame >= T_LOGO_ZOOM_OUT_START
    ? 1
    : interpolate(logoScale, [1, 4], [1, 0], clamp);
  // Border radius collapses so rounded corners don't leave bg visible
  const logoBorderRadius = interpolate(logoScale, [1, 3],
    [CHECK_LOGO_SIZE * LOGO_BR_RATIO, 0], clamp);
  // Dark blue fill — snap cover on zoom-in. Time-based fade-out so the
  // collapse into the logo is visible (not hidden by the overlay).
  const darkBgOp = frame < T_DARK_HOLD_UNTIL
    ? interpolate(frame, [T_LOGO_ZOOM_IN_START, T_LOGO_ZOOM_IN_START + 8], [0, 1], clamp)
    : interpolate(frame, [T_DARK_HOLD_UNTIL, T_DARK_HOLD_UNTIL + 10], [1, 0], clamp);

  // Fullscreen phase active: used to hide list/title, show Beyond text
  const inFullscreen = frame >= T_LOGO_ZOOM_IN_START && frame < T_LOGO_ZOOM_OUT_END;

  // ── Dark-blue text phases: word-by-word enter, push-slide-up exit ────────
  const AZZURRO = "#5E9EC8";
  const darkPhaseStates = DARK_PHASES.map((phase) => {
    const isPop = !!phase.poppy;
    const entryConfig = isPop
      ? { stiffness: 280, damping: 12, mass: 0.65 }   // bouncy pop-funky
      : { stiffness: 210, damping: 20, mass: 0.8 };    // standard smooth
    const entryY = isPop ? 54 : 36;
    // Per-word entry springs (staggered per line)
    const wordStates = phase.lines.flatMap((line, lineIdx) =>
      line.map((word, i) => {
        const start = phase.enter + lineIdx * DARK_LINE_DELAY + i * DARK_WORD_STAGGER;
        const sp = spring({ frame: frame - start, fps, config: entryConfig });
        return {
          word, lineIdx,
          op: interpolate(sp, [0, 1], [0, 1], clamp),
          ty: interpolate(sp, [0, 1], [entryY, 0], clamp),
          scale: isPop ? interpolate(sp, [0, 1], [0.6, 1]) : 1,
          isHighlight: isPop && word === "workload.",
        };
      })
    );
    // Exit animation (default: push-slide-up, unless slideOut handles it)
    const isSlideOut = !!phase.slideOut;
    const isSlideIn  = !!phase.slideIn;
    let exitY = 0, exitOp = 1;
    if (!isSlideOut) {
      const exitSp = spring({ frame: frame - phase.exit, fps,
        config: { stiffness: 200, damping: 24, mass: 0.8 } });
      exitY  = interpolate(exitSp, [0, 1], [0, -80], clamp);
      exitOp = interpolate(exitSp, [0, 1], [1, 0], clamp);
    }
    const visible = frame >= phase.enter - 2 && frame < phase.exit + 22;

    // Slide transitions — additive: slideIn slides from right, slideOut slides left
    let slideX = 0;
    let lineProg = 0;
    let arrowProg = 0;
    if (isSlideIn) {
      const slideSp = spring({ frame: frame - phase.enter, fps,
        config: { stiffness: 120, damping: 24, mass: 1.0 } });
      slideX += interpolate(slideSp, [0, 1], [1920, 0], clamp);
      if (phase.withArrows) {
        const arrSp = spring({ frame: frame - (phase.enter + 18), fps,
          config: { stiffness: 140, damping: 20, mass: 0.9 } });
        arrowProg = interpolate(arrSp, [0, 1], [0, 1], clamp);
      }
    }
    if (isSlideOut) {
      const slideSp = spring({ frame: frame - phase.exit, fps,
        config: { stiffness: 120, damping: 24, mass: 1.0 } });
      slideX += interpolate(slideSp, [0, 1], [0, -1920], clamp);
      exitOp = interpolate(slideSp, [0, 1], [1, 0.2], clamp);
      if (phase.withLine) {
        const lineSp = spring({ frame: frame - (phase.enter + 16), fps,
          config: { stiffness: 160, damping: 22, mass: 0.9 } });
        lineProg = interpolate(lineSp, [0, 1], [0, 1], clamp);
      }
    }

    // Poppy phase: checkbox + underline + color animations
    let checkProg = 0;
    let underlineProg = 0;
    if (isPop) {
      const T_CHECK = phase.enter + 22;
      const chSp = spring({ frame: frame - T_CHECK, fps,
        config: { stiffness: 80, damping: 18, mass: 1.2 } });
      checkProg = interpolate(chSp, [0, 1], [0, 1], clamp);
      underlineProg = checkProg;
    }

    return { wordStates, exitY, exitOp, visible, lines: phase.lines,
             isPop, checkProg, underlineProg,
             isSlideOut, isSlideIn, slideX, lineProg, arrowProg,
             withLine: !!phase.withLine, withArrows: !!phase.withArrows };
  });

  // List entrance — slide from below + fade
  const p2Op = interpolate(frame, [T_LIST_IN, T_LIST_IN + 14], [0, 1], clamp);
  const listEntrySp = spring({ frame: frame - T_LIST_IN, fps,
    config: { stiffness: 55, damping: 22, mass: 1.4 } });
  const listEntryY = interpolate(listEntrySp, [0, 1], [120, 0], clamp);

  // ── Scroll — soft spring so the first item glides in smoothly ──────────
  const TRIGGERS = Array.from({ length: 12 }, (_, i) => T_LIST_BASE + i * LIST_STEP);
  const scrollPos = TRIGGERS.reduce((acc, f) =>
    acc + spring({ frame: frame - f, fps, config: { stiffness: 65, damping: 24, mass: 1.4 } }),
    0
  );

  // ── Zoom ──────────────────────────────────────────────────────────────────
  const zoomT = spring({ frame: frame - T_ZOOM, fps, config: { stiffness: 100, damping: 20, mass: 1.3 } });
  const zoomScale = interpolate(zoomT, [0, 1], [1, 1.32]);

  const finalZoomT = spring({ frame: frame - T_ZOOM, fps, config: { stiffness: 70, damping: 22, mass: 1.4 } });
  const cameraScale = interpolate(finalZoomT, [0, 1], [1, 1.65]);
  const vignetteOp  = interpolate(finalZoomT, [0, 1], [0, 0.55], clamp);

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

      {/* Fade masks */}
      {p2Op > 0.01 && (
        <>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 300,
            background: "linear-gradient(to bottom, rgba(95,148,195,0.94) 0%, transparent 100%)",
            zIndex: 5, pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 320,
            background: "linear-gradient(to top, rgba(95,148,195,0.94) 0%, transparent 100%)",
            zIndex: 5, pointerEvents: "none",
          }} />
        </>
      )}

      {/* ── Camera-zoom stage ── */}
      <div style={{
        position: "absolute", inset: 0,
        transform:
          `translate(${FOCAL_X * (1 - cameraScale)}px, ${FOCAL_Y * (1 - cameraScale)}px) ` +
          `scale(${cameraScale})`,
        transformOrigin: "0 0",
        willChange: "transform",
      }}>

        {p2Op > 0.01 && (
          <div style={{
            position: "absolute", inset: 0,
            transform: `translateY(${listEntryY}px)`,
            willChange: "transform",
          }}>
            {/* Atmospheric glow */}
            <div style={{
              position: "absolute",
              left: FOCUSED_TEXT_X - 320,
              top: CHECK_Y - 260,
              width: 1700, height: 520,
              pointerEvents: "none", zIndex: 6,
              background:
                "radial-gradient(ellipse at 22% 50%, " +
                "rgba(240,248,255,0.30) 0%, rgba(186,216,245,0.18) 32%, rgba(120,170,220,0) 72%)",
              filter: "blur(32px)",
              opacity: p2Op,
            }} />

            {/* Scrolling list */}
            {ITEMS.map((label, i) => {
              const distance = i - scrollPos;
              const absDist  = Math.abs(distance);
              if (absDist > 3.1) return null;

              const isLast = i === LAST_IDX;
              const yPos   = CHECK_Y + distance * SLOT_H;
              const requestedFontSize = interpolate(
                absDist, [0, 0.5, 1.2, 2.2], [92, 92, 52, 32],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              );
              const itemOp = interpolate(
                absDist, [0, 0.15, 0.85, 1.8, 2.8], [1, 1, 0.32, 0.14, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              );
              const fontWeight = absDist < 0.35 ? 800 : 400;

              const curveT  = Math.min(1, absDist / CURVE_MAX_DIST);
              const recess  = (1 - Math.cos(curveT * Math.PI / 2)) * CURVE_MAX_PX;
              const itemX   = FOCUSED_TEXT_X - recess;

              const SCREEN_RIGHT_MARGIN = 80;
              const availableW = 1920 - itemX - SCREEN_RIGHT_MARGIN;
              const CHAR_W_RATIO = 0.50;
              const naturalW = label.length * requestedFontSize * CHAR_W_RATIO;
              const fit = naturalW > availableW ? availableW / naturalW : 1;
              const baseFontSize = requestedFontSize * fit;

              const scale = isLast && absDist < 0.5 ? zoomScale : 1;
              const finalZoomFade = isLast
                ? 1
                : interpolate(finalZoomT, [0, 1], [1, 0], clamp);

              const focusedGlow = Math.max(0, 1 - absDist / 0.4);
              const itemFilter = focusedGlow > 0.01
                ? `drop-shadow(0 0 ${14 * focusedGlow}px rgba(255,255,255,${0.32 * focusedGlow})) ` +
                  `drop-shadow(0 0 ${36 * focusedGlow}px rgba(180,215,245,${0.22 * focusedGlow}))`
                : "none";

              return (
                <div key={label} style={{
                  position: "absolute",
                  left: itemX, top: yPos,
                  transform: `translateY(-50%) scale(${scale})`,
                  transformOrigin: "left center",
                  opacity: p2Op * itemOp * finalZoomFade,
                  pointerEvents: "none", zIndex: 8,
                  filter: itemFilter,
                  willChange: "transform, opacity, filter",
                }}>
                  <span style={{
                    fontFamily: interFont,
                    fontSize: baseFontSize, fontWeight,
                    color: "rgba(255,255,255,0.97)",
                    letterSpacing: absDist < 0.35 ? "-0.034em" : "-0.014em",
                    whiteSpace: "nowrap",
                  }}>{label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Title phase: "Native multi-agent AI architecture" ──
            Apple keynote word-by-word reveal; appears next to the (fixed) logo,
            then fades out before the list enters. */}
        {titleVisible && (
          <div style={{
            position: "absolute",
            left: FOCUSED_TEXT_X,
            top: CHECK_Y,
            transform: `translateY(-50%) scale(${titleExitScale})`,
            transformOrigin: "left center",
            display: "flex", alignItems: "baseline",
            columnGap: 18,
            whiteSpace: "nowrap",
            opacity: titleExitOp,
            zIndex: 9,
            pointerEvents: "none",
            willChange: "transform, opacity",
          }}>
            {titleWordStates.map((s, i) => (
              <span key={i} style={{
                display: "inline-block",
                fontFamily: interFont,
                fontSize: 62, fontWeight: 800,
                letterSpacing: "-0.038em", lineHeight: 1.05,
                color: "rgba(255,255,255,0.97)",
                whiteSpace: "nowrap",
                opacity: s.op,
                transform: `translateY(${s.ty}px)`,
                willChange: "transform, opacity",
              }}>
                {s.word}
              </span>
            ))}
          </div>
        )}

        {/* ── Logo at check position (scales up to fullscreen during Beyond phase) ── */}
        <div style={{
          position: "absolute",
          left: CHECK_LOGO_CX, top: CHECK_LOGO_CY,
          width: CHECK_LOGO_SIZE, height: CHECK_LOGO_SIZE,
          transform: `translate(-50%, -50%) scale(${logoScale})`,
          transformOrigin: "center center",
          zIndex: 10,
          willChange: "transform",
        }}>
          <div style={{
            width: "100%", height: "100%",
            borderRadius: logoBorderRadius,
            // bg only during zoom-IN (image fades, need dark behind); not during zoom-out
            backgroundColor: logoScale > 1.01 && frame < T_LOGO_ZOOM_OUT_START ? LOGO_DARK : undefined,
            overflow: "hidden",
            boxShadow: logoScale < 1.5
              ? "0 8px 28px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.12)"
              : "none",
          }}>
            <Img
              src={staticFile("aria-logo.png")}
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: logoImgOp }}
            />
          </div>
        </div>

      </div>{/* end camera-zoom stage */}

      {/* ── Dark blue fullscreen overlay (matches logo color) ── */}
      {darkBgOp > 0.001 && (
        <div style={{
          position: "absolute", inset: 0,
          backgroundColor: LOGO_DARK,
          opacity: darkBgOp,
          zIndex: 11,
          pointerEvents: "none",
        }} />
      )}

      {/* ── Dark-blue text phases (push-slide transitions) ── */}
      {darkPhaseStates.map((phase, pIdx) => {
        if (!phase.visible) return null;
        const useSlide = phase.isSlideOut || phase.isSlideIn;
        return (
          <div key={pIdx} style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 14,
            opacity: phase.exitOp,
            transform: useSlide
              ? `translateX(${phase.slideX}px)`
              : `translateY(${phase.exitY}px)`,
            zIndex: 12,
            pointerEvents: "none",
            willChange: "transform, opacity",
          }}>
            {phase.lines.map((line, lineIdx) => (
              <div key={lineIdx} style={{
                display: "flex", gap: 22, whiteSpace: "nowrap",
                alignItems: "center",
              }}>
                {/* Checkbox — only for poppy phase, first line */}
                {phase.isPop && lineIdx === 0 && (
                  <svg viewBox="0 0 100 100" width={96} height={96}
                    style={{ flexShrink: 0, marginRight: 14, overflow: "visible" }}>
                    {/* Box: thick white rounded border, dark fill inside */}
                    <rect x="18" y="22" width="56" height="56" rx="14" ry="14"
                      fill={LOGO_DARK} stroke="rgba(255,255,255,0.95)" strokeWidth="7" />
                    {/* Checkmark: V centered in box, long tail well past top-right */}
                    <path d="M 32 48 L 46 62 L 105 -6"
                      fill="none" stroke={AZZURRO} strokeWidth="14"
                      strokeLinecap="round" strokeLinejoin="round"
                      style={{
                        filter: `drop-shadow(0 2px 5px rgba(0,0,0,0.35))`,
                        strokeDasharray: 110,
                        strokeDashoffset: 110 * (1 - phase.checkProg),
                      }} />
                  </svg>
                )}
                {phase.wordStates
                  .filter((w) => w.lineIdx === lineIdx)
                  .map((s, i) => {
                    const hlColor = s.isHighlight
                      ? `rgba(${94 + (255 - 94) * (1 - phase.underlineProg)}, ${158 + (255 - 158) * (1 - phase.underlineProg)}, ${200 + (255 - 200) * (1 - phase.underlineProg)}, 0.97)`
                      : "rgba(255,255,255,0.97)";
                    return (
                      <span key={i} style={{
                        display: "inline-block",
                        position: s.isHighlight ? "relative" as const : undefined,
                        fontFamily: interFont,
                        fontSize: 96, fontWeight: 800,
                        letterSpacing: "-0.042em", lineHeight: 1.05,
                        color: hlColor,
                        opacity: s.op,
                        transform: `translateY(${s.ty}px) scale(${typeof s.scale === "number" ? s.scale : 1})`,
                        willChange: "transform, opacity",
                      }}>
                        {s.word}
                        {s.isHighlight && (
                          <svg viewBox="0 0 200 20" preserveAspectRatio="none"
                            style={{
                              position: "absolute", left: -4, right: -4, bottom: -8,
                              width: "calc(100% + 8px)", height: 14,
                              overflow: "visible", pointerEvents: "none",
                            }}>
                            <path d="M 3 10 C 30 5, 60 16, 100 10 S 160 5, 196 12"
                              stroke={AZZURRO} strokeWidth={5} strokeLinecap="round" fill="none"
                              style={{
                                filter: `drop-shadow(0 0 6px ${AZZURRO}88)`,
                                strokeDasharray: 220,
                                strokeDashoffset: 220 * (1 - phase.underlineProg),
                              }} />
                          </svg>
                        )}
                      </span>
                    );
                  })}
              </div>
            ))}

            {/* Line extending right from end of "tasks." — only with withLine flag */}
            {phase.withLine && phase.lineProg > 0.001 && (
              <svg style={{
                position: "absolute", top: "50%", left: "70%",
                width: "32%", height: 24,
                transform: "translateY(-50%)",
                overflow: "visible", pointerEvents: "none",
              }}>
                <line x1="0" y1="12" x2={`${phase.lineProg * 100}%`} y2="12"
                  stroke={AZZURRO} strokeWidth="12" strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 6px ${AZZURRO}55)` }} />
              </svg>
            )}

            {/* Arrows + underline — only with withArrows flag */}
            {phase.withArrows && phase.arrowProg > 0.001 && (
              <>
                {/* Arrow 1: smooth arc from top-left, curving down to text */}
                <svg viewBox="0 0 1000 500" style={{
                  position: "absolute", top: "2%", left: "-2%",
                  width: 860, height: 430,
                  overflow: "visible", pointerEvents: "none",
                }}>
                  <path d="M -20 340 C 60 340, 120 60, 400 30 C 600 10, 720 40, 760 200"
                    fill="none" stroke={AZZURRO} strokeWidth="14" strokeLinecap="round"
                    style={{
                      filter: `drop-shadow(0 2px 5px rgba(0,0,0,0.2))`,
                      strokeDasharray: 1100,
                      strokeDashoffset: 1100 * (1 - phase.arrowProg),
                    }} />
                  <path d="M 742 188 L 760 210 L 778 188"
                    fill="none" stroke={AZZURRO} strokeWidth="12"
                    strokeLinecap="round" strokeLinejoin="round"
                    style={{ opacity: phase.arrowProg > 0.85 ? (phase.arrowProg - 0.85) / 0.15 : 0 }} />
                </svg>

                {/* Arrow 2: horizontal from left with chevron arrowhead */}
                <svg viewBox="0 0 400 60" style={{
                  position: "absolute", top: "46%", left: "-2%",
                  width: 380, height: 50,
                  overflow: "visible", pointerEvents: "none",
                }}>
                  <line x1="0" y1="30" x2={phase.arrowProg * 330} y2="30"
                    stroke={AZZURRO} strokeWidth="12" strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 4px ${AZZURRO}44)` }} />
                  <path d={`M ${phase.arrowProg * 330 - 6},12 L ${phase.arrowProg * 330 + 14},30 L ${phase.arrowProg * 330 - 6},48`}
                    fill="none" stroke={AZZURRO} strokeWidth="10"
                    strokeLinecap="round" strokeLinejoin="round"
                    style={{ opacity: phase.arrowProg > 0.7 ? (phase.arrowProg - 0.7) / 0.3 : 0 }} />
                </svg>

                {/* Arrow 3: diagonal from bottom-left curving up toward text */}
                <svg viewBox="0 0 800 500" style={{
                  position: "absolute", bottom: "-8%", left: "6%",
                  width: 600, height: 380,
                  overflow: "visible", pointerEvents: "none",
                }}>
                  <path d="M 40 480 C 120 380, 220 200, 420 120"
                    fill="none" stroke={AZZURRO} strokeWidth="14" strokeLinecap="round"
                    style={{
                      filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.2))`,
                      strokeDasharray: 550,
                      strokeDashoffset: 550 * (1 - phase.arrowProg),
                    }} />
                  <path d="M 400,96 L 428,114 L 410,138"
                    fill="none" stroke={AZZURRO} strokeWidth="10"
                    strokeLinecap="round" strokeLinejoin="round"
                    style={{ opacity: phase.arrowProg > 0.8 ? (phase.arrowProg - 0.8) / 0.2 : 0 }} />
                </svg>

                {/* Underline under entire phrase */}
                <svg viewBox="0 0 900 20" preserveAspectRatio="none" style={{
                  position: "absolute", bottom: "38%", left: "24%",
                  width: "54%", height: 14,
                  overflow: "visible", pointerEvents: "none",
                }}>
                  <path d="M 4 10 C 80 4, 180 16, 300 9 S 520 4, 650 12 S 820 6, 896 10"
                    stroke={AZZURRO} strokeWidth="6" strokeLinecap="round" fill="none"
                    style={{
                      filter: `drop-shadow(0 0 5px ${AZZURRO}66)`,
                      strokeDasharray: 920,
                      strokeDashoffset: 920 * (1 - phase.arrowProg),
                    }} />
                </svg>
              </>
            )}
          </div>
        );
      })}

      {/* Vignette */}
      {vignetteOp > 0.01 && (
        <div style={{
          position: "absolute", inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 28%, rgba(0,0,0,0.60) 100%)",
          opacity: vignetteOp,
          zIndex: 11, pointerEvents: "none", mixBlendMode: "multiply",
        }} />
      )}
    </AbsoluteFill>
  );
};
