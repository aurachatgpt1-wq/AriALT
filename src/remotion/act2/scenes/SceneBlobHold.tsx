import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ARIA_COLORS, geistFont } from "../constants";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ─── Data ────────────────────────────────────────────────────────────────────
type AnimStyle = "arrows" | "invert" | "brackets" | "burst" | "zoom";

interface Seq {
  phrases: string[];
  anim: AnimStyle;
  pd?: number; // optional per-sequence phrase duration override
}

const SEQUENCES: Seq[] = [
  { anim: "arrows", phrases: [
    "Faster repairs",
    "46% less unexpected downtime",
    "Up to 38% lower operating costs",
  ]},
  { anim: "invert", phrases: [
    "+40% increase in equipment lifespan",
    "Reduction in equipment lifecycle costs",
  ]},
  { anim: "brackets", phrases: [
    "Up to 50% higher efficiency",
    "Less waste and fewer production losses",
  ]},
  { anim: "burst", pd: 48, phrases: [
    "Autonomous task management",
    "and execution",
    "means",
    "Reduction in staff costs",
  ]},
  { anim: "zoom", pd: 48, phrases: [
    "Every optimization leads to the same thing",
    "cost savings.",
    "Low investment.",
    "High Return.",
  ]},
];

const PHRASE_DUR = 60;
const INTER_GAP = 0; // continuous flow — no dead beats between sequences
const SCENE_BUFFER = 10;
const ACCENT = "#3B5BDB";
const NAVY   = "#0F1E36";
const INK    = "#1A1F33";
const DARK_BG = "#0A0B10";
const LINE_CLR = NAVY;
const numRegex = /^([<>+\-]?\d+[%x]?|[\$]\d+)$/;

const LIGHT_BG = "#F0F3FF"; // matches SceneAreas outgoing bg for seamless continuity

// Pre-compute sequence starts
const seqMeta: { start: number; dur: number; pd: number }[] = [];
let cursor = SCENE_BUFFER;
SEQUENCES.forEach((seq, i) => {
  const pd = seq.pd ?? PHRASE_DUR;
  const dur = seq.phrases.length * pd;
  seqMeta.push({ start: cursor, dur, pd });
  cursor += dur + (i < SEQUENCES.length - 1 ? INTER_GAP : 0);
});
const TOTAL_DUR = cursor + 28;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const wordReveal = (
  text: string, localF: number, fps: number, stagger = 4,
  config = { stiffness: 240, damping: 22, mass: 0.7 },
) => {
  const words = text.split(" ");
  return words.map((w, i) => {
    const sp = spring({ frame: localF - i * stagger, fps, config });
    return {
      w,
      op: interpolate(sp, [0, 1], [0, 1], clamp),
      ty: interpolate(sp, [0, 1], [22, 0], clamp),
      scale: interpolate(sp, [0, 1], [0.92, 1], clamp),
    };
  });
};

const isNum = (w: string) => numRegex.test(w);

// ─── Burst dashes ────────────────────────────────────────────────────────────
const BURST = [
  { angle: 30, r: 320, w: 28, h: 10 },
  { angle: 75, r: 280, w: 24, h: 9 },
  { angle: 120, r: 340, w: 30, h: 11 },
  { angle: 165, r: 300, w: 26, h: 10 },
  { angle: 210, r: 360, w: 32, h: 11 },
  { angle: 255, r: 290, w: 24, h: 9 },
  { angle: 300, r: 330, w: 28, h: 10 },
  { angle: 345, r: 310, w: 26, h: 10 },
];

// ─── Component ───────────────────────────────────────────────────────────────
export const SceneBlobHold: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneOp = Math.min(
    interpolate(frame, [0, 12], [0, 1], clamp),
    interpolate(frame, [TOTAL_DUR - 16, TOTAL_DUR], [1, 0], clamp),
  );

  // Dark bg for "invert" sequence. Holds at full opacity through the end of
  // Seq 1 (Blob-local 310) so Part 2a (mounted as offset -190, duration 120)
  // ENDS on a pure dark background. The subsequent what-if interstitial
  // starts on solid black, so the handover is dark → black — imperceptible,
  // no muddy grey crossfade. The fade-out happens entirely AFTER Seq 1 ends,
  // which is inside the what-if window (and hidden by the black backdrop).
  const invertSeq = seqMeta[1];
  const invertIn = interpolate(frame,
    [invertSeq.start - 14, invertSeq.start + 2], [0, 1], clamp);
  const invertOut = interpolate(frame,
    [invertSeq.start + invertSeq.dur + 6, invertSeq.start + invertSeq.dur + 18], [1, 0], clamp);
  const darkBgOp1 = invertIn * invertOut;

  // Dark bg for "burst" sequence. Ends EXACTLY at seq end (Blob-local 622)
  // so the Kanban interstitial that mounts right after Part 2b lands on
  // clean light bg (not a half-faded dark wash).
  const burstSeq = seqMeta[3];
  const burstIn  = interpolate(frame,
    [burstSeq.start - 4, burstSeq.start + 6], [0, 1], clamp);
  const burstOut = interpolate(frame,
    [burstSeq.start + burstSeq.dur - 12, burstSeq.start + burstSeq.dur], [1, 0], clamp);
  const darkBgOp2 = burstIn * burstOut;

  // Dark bg for zoom phrase 2 ("Low investment.")
  const zoomSeq = seqMeta[4];
  const lowStart = zoomSeq.start + 2 * zoomSeq.pd;
  const lowEnd   = lowStart + 2 * zoomSeq.pd; // covers "Low investment." + "High Return."
  const lowIn  = interpolate(frame, [lowStart - 4, lowStart + 4], [0, 1], clamp);
  const lowOut = interpolate(frame, [lowEnd - 8, lowEnd + 6], [1, 0], clamp);
  const darkBgOp3 = lowIn * lowOut;

  const darkBgOp = Math.max(darkBgOp1, darkBgOp2, darkBgOp3);

  return (
    <AbsoluteFill style={{ backgroundColor: LIGHT_BG, opacity: sceneOp }}>
      {/* Subtle gradient blobs — same palette as SceneAreas for continuity */}
      <div style={{
        position: "absolute", width: 900, height: 800, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,91,219,0.16) 0%, transparent 70%)",
        left: -200, top: -100, filter: "blur(80px)",
      }} />
      <div style={{
        position: "absolute", width: 800, height: 700, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(107,142,255,0.14) 0%, transparent 65%)",
        right: -150, bottom: -80, filter: "blur(90px)",
      }} />
      <div style={{
        position: "absolute", width: 700, height: 700, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(165,184,255,0.20) 0%, transparent 65%)",
        left: "50%", top: "50%", transform: "translate(-50%, -50%)", filter: "blur(100px)",
      }} />

      {/* Dark bg overlay for "invert" sequence */}
      {darkBgOp > 0.001 && (
        <div style={{
          position: "absolute", inset: 0,
          backgroundColor: DARK_BG,
          opacity: darkBgOp,
          zIndex: 0,
        }} />
      )}

      {SEQUENCES.map((seq, sIdx) => {
        const { start, dur, pd } = seqMeta[sIdx];
        const seqLocalF = frame - start;
        if (seqLocalF < -6 || seqLocalF > dur + 20) return null;

        // ── ARROWS: phrase 0→1 horizontal slide, phrase 1→2 diagonal arrows ──
        if (seq.anim === "arrows") {
          const phraseEls = seq.phrases.map((phrase, pIdx) => {
            const phaseStart = start + pIdx * PHRASE_DUR;
            const lf = frame - phaseStart;
            // Phrase 1 renders 12f early so it enters as phrase 0 is exiting
            const earlyThreshold = pIdx === 1 ? -14 : -2;
            if (lf < earlyThreshold || lf > PHRASE_DUR + 14) return null;
            const isLast = pIdx === seq.phrases.length - 1;
            const ws = wordReveal(phrase, lf, fps);

            let tx = 0, ty = 0, opacity = 1;

            if (pIdx === 0) {
              // Exit starts at lf=42 — when line reaches right edge
              const slideOut = spring({ frame: lf - 42, fps, config: { stiffness: 160, damping: 22, mass: 0.9 } });
              tx = interpolate(slideOut, [0, 1], [0, -1920], clamp);
              opacity = interpolate(slideOut, [0, 1], [1, 0.1], clamp);
            }
            if (pIdx === 1) {
              // Enters as phrase 0 exits (10f after exit trigger)
              const slideIn = spring({ frame: lf + 10, fps, config: { stiffness: 140, damping: 24, mass: 0.9 } });
              tx = interpolate(slideIn, [0, 1], [1920, 0], clamp);
              // Zoom-in on whole scene
              const sceneZoomSp = spring({ frame: lf + 10, fps, config: { stiffness: 140, damping: 22, mass: 0.8 } });
              (ws as any).__sceneZoom = interpolate(sceneZoomSp, [0, 1], [0.8, 1], clamp);
              // Exit starts sooner so the arrow flows straight into the slide-up (no static hold)
              const exitSp = spring({ frame: lf - (PHRASE_DUR - 20), fps, config: { stiffness: 160, damping: 24, mass: 0.9 } });
              ty = interpolate(exitSp, [0, 1], [0, -160], clamp);
              opacity = interpolate(exitSp, [0, 1], [1, 0], clamp);
            }
            if (pIdx === 2) {
              const enterSp = spring({ frame: lf, fps, config: { stiffness: 120, damping: 22, mass: 1.0 } });
              const enterTy = interpolate(enterSp, [0, 1], [140, 0], clamp);
              // Exit slides UP + fades out, dark bg fades in behind
              const exitTy = interpolate(lf, [PHRASE_DUR - 24, PHRASE_DUR + 2], [0, -180], clamp);
              ty = enterTy + exitTy;
              opacity = interpolate(lf, [PHRASE_DUR - 24, PHRASE_DUR + 2], [1, 0], clamp);
            }

            // Line extending right from text end (phrase 0 only — no arrowhead)
            // Slower spring so the draw keeps moving until the slide-out, no static hold
            const lineSp = spring({ frame: lf - 8, fps, config: { stiffness: 80, damping: 22, mass: 1.1 } });
            const lineProg = pIdx === 0 ? interpolate(lineSp, [0, 1], [0, 1], clamp) : 0;

            // Downward arrow from center of phrase 1 — starts right after word reveal settles, draws briskly
            const dArrowsSp = pIdx === 1
              ? spring({ frame: lf - (PHRASE_DUR - 38), fps, config: { stiffness: 200, damping: 24, mass: 0.8 } })
              : null;
            const dp = dArrowsSp ? interpolate(dArrowsSp, [0, 1], [0, 1], clamp) : 0;

            // 3 converging arrows on phrase 2 entry
            const cArrSp = pIdx === 2
              ? spring({ frame: lf - 4, fps, config: { stiffness: 100, damping: 20, mass: 1.0 } })
              : null;
            const cp = cArrSp ? interpolate(cArrSp, [0, 1], [0, 1], clamp) : 0;

            const sceneZoom = (ws as any).__sceneZoom ?? 1;

            return (
              <div key={`a${sIdx}-${pIdx}`} style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity,
                transform: `translate(${tx}px, ${ty}px) scale(${sceneZoom})`,
                transformOrigin: "center center",
                zIndex: 1, pointerEvents: "none", willChange: "transform, opacity",
              }}>
                {/* Arrow from center of phrase 1 curving straight down */}
                {dp > 0.001 && (
                  <svg viewBox="0 0 1920 1080" style={{
                    position: "absolute", inset: 0, width: 1920, height: 1080, overflow: "visible",
                  }}>
                    <path d={`M 960 580 C 960 ${580+dp*80}, 960 ${580+dp*200}, 960 ${580+dp*420}`}
                      fill="none" stroke={LINE_CLR} strokeWidth="8" strokeLinecap="round"
                      style={{ strokeDasharray: 600, strokeDashoffset: 600*(1-dp) }} />
                    <path d={`M 948 ${570+dp*420} L 960 ${590+dp*420} L 972 ${570+dp*420}`}
                      fill="none" stroke={LINE_CLR} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
                      style={{ opacity: dp > 0.85 ? (dp-0.85)/0.15 : 0 }} />
                  </svg>
                )}

                {/* 3 converging organic arrows */}
                {cp > 0.001 && (
                  <svg viewBox="0 0 1920 1080" style={{
                    position: "absolute", inset: 0, width: 1920, height: 1080, overflow: "visible",
                  }}>
                    {/* Left: organic S-curve from left edge → "Up" */}
                    <path d="M 0 545 C 70 525, 160 508, 230 518 C 285 526, 325 542, 350 540"
                      fill="none" stroke={LINE_CLR} strokeWidth="8" strokeLinecap="round"
                      style={{ strokeDasharray: 380, strokeDashoffset: 380*(1-cp) }} />
                    <path d="M 332 528 L 350 540 L 332 552"
                      fill="none" stroke={LINE_CLR} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
                      style={{ opacity: cp > 0.85 ? (cp-0.85)/0.15 : 0 }} />
                    {/* Center: gentle hand-drawn curve from top, single organic bow */}
                    <path d="M 960 40 C 978 140, 946 260, 962 380 C 968 420, 960 440, 960 452"
                      fill="none" stroke={LINE_CLR} strokeWidth="8" strokeLinecap="round"
                      style={{ strokeDasharray: 440, strokeDashoffset: 440*(1-cp) }} />
                    <path d="M 946 436 L 960 458 L 974 436"
                      fill="none" stroke={LINE_CLR} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
                      style={{ opacity: cp > 0.85 ? (cp-0.85)/0.15 : 0 }} />
                    {/* Right: organic S-curve from right edge → "costs" */}
                    <path d="M 1920 545 C 1850 525, 1760 508, 1690 518 C 1635 526, 1595 542, 1570 540"
                      fill="none" stroke={LINE_CLR} strokeWidth="8" strokeLinecap="round"
                      style={{ strokeDasharray: 380, strokeDashoffset: 380*(1-cp) }} />
                    <path d="M 1588 528 L 1570 540 L 1588 552"
                      fill="none" stroke={LINE_CLR} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
                      style={{ opacity: cp > 0.85 ? (cp-0.85)/0.15 : 0 }} />
                  </svg>
                )}

                {/* Organic curved line extending right from text (phrase 0 only) */}
                {lineProg > 0.001 && (
                  <svg viewBox="0 0 1920 1080" style={{
                    position: "absolute", inset: 0, width: 1920, height: 1080, overflow: "visible",
                  }}>
                    <path d="M 1240 542 C 1360 520, 1520 508, 1680 518 C 1800 526, 1890 536, 1920 540"
                      fill="none" stroke={LINE_CLR} strokeWidth="9" strokeLinecap="round"
                      style={{ strokeDasharray: 710, strokeDashoffset: 710*(1-lineProg) }} />
                  </svg>
                )}

                {/* Text */}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 16px", maxWidth: 1400, padding: "0 140px" }}>
                  {ws.map((s, i) => (
                    <span key={i} style={{
                      display: "inline-block", fontFamily: geistFont, fontSize: 60, fontWeight: 800,
                      letterSpacing: "-0.035em", lineHeight: 1.15,
                      color: isNum(s.w) ? ACCENT : INK,
                      opacity: s.op, transform: `translateY(${s.ty}px)`, willChange: "transform, opacity",
                    }}>{s.w}</span>
                  ))}
                </div>
              </div>
            );
          });

          // ── Fixed horizontal arrow overlay ──────────────────────────────
          // Starts at seqLocalF=52 (when line hits right edge = lf≈42 + SCENE_BUFFER=10)
          const hOverlapF = seqLocalF - 52;
          const hSp = spring({ frame: hOverlapF, fps, config: { stiffness: 140, damping: 20, mass: 0.9 } });
          const hProg = hOverlapF > 0 ? interpolate(hSp, [0, 1], [0, 1], clamp) : 0;
          // Fade out before phrase 2 starts (seqLocalF=120)
          const hFadeOp = interpolate(seqLocalF,
            [PHRASE_DUR * 2 - 18, PHRASE_DUR * 2 - 4], [1, 0], clamp);
          const hOverlay = hProg > 0.001 ? (
            <svg key={`h-ov-${sIdx}`} viewBox="0 0 1920 1080" style={{
              position: "absolute", inset: 0, width: 1920, height: 1080, overflow: "visible",
              zIndex: 2, pointerEvents: "none", opacity: hFadeOp,
            }}>
              <path d="M 0 545 C 70 525, 160 508, 230 518 C 285 526, 325 542, 350 540"
                fill="none" stroke={LINE_CLR} strokeWidth="8" strokeLinecap="round"
                style={{ strokeDasharray: 380, strokeDashoffset: 380*(1-hProg) }} />
              <path d="M 332 528 L 350 540 L 332 552"
                fill="none" stroke={LINE_CLR} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
                style={{ opacity: hProg > 0.85 ? (hProg-0.85)/0.15 : 0 }} />
            </svg>
          ) : null;

          return [...phraseEls, hOverlay];
        }

        // ── INVERT (dark bg, white text, number pop) ────────────────────
        if (seq.anim === "invert") {
          return seq.phrases.map((phrase, pIdx) => {
            const phaseStart = start + pIdx * PHRASE_DUR;
            const lf = frame - phaseStart;
            // Tight cutoff: nothing renders past PHRASE_DUR so Seq 2 (mounted
            // as Part 2b at Blob-local 310 exactly) doesn't inherit any
            // residue from Seq 1's phrase 1 "Reduction in equipment lifecycle
            // costs" — this was the cause of the ghost text at 01:11.10.
            if (lf < -2 || lf > PHRASE_DUR) return null;
            // Exit starts earlier with a slow fade to kill static holds between phrases
            const exitOp    = interpolate(lf, [PHRASE_DUR - 20, PHRASE_DUR], [1, 0], clamp);
            const exitScale = interpolate(lf, [PHRASE_DUR - 20, PHRASE_DUR], [1, 1.08], clamp);

            // ── Phrase 0: two-line layout (+40% / increase in [equipment lifespan]) ──
            if (pIdx === 0) {
              const words = phrase.split(" "); // ["+40%", "increase", "in", "equipment", "lifespan"]
              const wStates = words.map((w, i) => {
                const sp = spring({ frame: lf - i * 3, fps, config: { stiffness: 300, damping: 20, mass: 0.6 } });
                return {
                  w,
                  op: interpolate(sp, [0, 1], [0, 1], clamp),
                  ty: interpolate(sp, [0, 1], [28, 0], clamp),
                  sc: interpolate(sp, [0, 1], [0.92, 1], clamp),
                };
              });
              // Zoom in after all words settle (lf≈18)
              const zoomSp  = spring({ frame: lf - 20, fps, config: { stiffness: 160, damping: 26, mass: 0.8 } });
              const zoomScale = 1 + interpolate(zoomSp, [0, 1], [0, 0.05], clamp);
              // Underline draws under "equipment lifespan"
              const ulSp   = spring({ frame: lf - 22, fps, config: { stiffness: 180, damping: 20, mass: 0.8 } });
              const ulProg = interpolate(ulSp, [0, 1], [0, 1], clamp);

              const [numState, ...restStates] = wStates;

              return (
                <div key={`i${sIdx}-0`} style={{
                  position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: exitOp, transform: `scale(${exitScale})`, transformOrigin: "center center",
                  zIndex: 1, pointerEvents: "none", willChange: "transform, opacity",
                }}>
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                    transform: `scale(${zoomScale})`,
                  }}>
                    {/* "+40%" */}
                    <span style={{
                      fontFamily: geistFont, fontSize: 90, fontWeight: 900,
                      letterSpacing: "-0.04em", lineHeight: 1, color: ACCENT,
                      display: "block", textAlign: "center",
                      opacity: numState.op,
                      transform: `translateY(${numState.ty}px) scale(${numState.sc})`,
                    }}>{numState.w}</span>

                    {/* "increase in [equipment lifespan]" */}
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 14px" }}>
                      {restStates.slice(0, 2).map((s, i) => (
                        <span key={i} style={{
                          display: "inline-block", fontFamily: geistFont, fontSize: 60, fontWeight: 700,
                          letterSpacing: "-0.03em", lineHeight: 1.2, color: "rgba(255,255,255,0.95)",
                          opacity: s.op, transform: `translateY(${s.ty}px) scale(${s.sc})`,
                        }}>{s.w}</span>
                      ))}
                      {/* "equipment lifespan" underline group */}
                      <span style={{ position: "relative", display: "inline-flex", gap: 14 }}>
                        {restStates.slice(2).map((s, i) => (
                          <span key={i} style={{
                            display: "inline-block", fontFamily: geistFont, fontSize: 60, fontWeight: 700,
                            letterSpacing: "-0.03em", lineHeight: 1.2, color: "rgba(255,255,255,0.95)",
                            opacity: s.op, transform: `translateY(${s.ty}px) scale(${s.sc})`,
                          }}>{s.w}</span>
                        ))}
                        {ulProg > 0.001 && (
                          <svg viewBox="0 0 600 12" preserveAspectRatio="none" style={{
                            position: "absolute", left: 0, right: 0, bottom: -8,
                            width: "100%", height: 10, overflow: "visible",
                          }}>
                            <line x1="0" y1="6" x2="600" y2="6"
                              stroke={ACCENT} strokeWidth="5" strokeLinecap="round"
                              style={{ strokeDasharray: 600, strokeDashoffset: 600 * (1 - ulProg) }} />
                          </svg>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            // ── Phrase 1: slow typing "Reduction in" → hold → shrink+slide up → zoom "equipment lifecycle costs" ──
            const TYPE_TEXT = "Reduction in";
            const CHAR_RATE = 0.45; // slower typing
            const charsShown = Math.floor(Math.max(0, lf * CHAR_RATE));
            const visibleText = TYPE_TEXT.slice(0, Math.min(charsShown, TYPE_TEXT.length));
            const typingDone = charsShown >= TYPE_TEXT.length;
            const cursorBlink = Math.floor(frame / 8) % 2 === 0 ? 1 : 0;

            // Phrase 1 exit: must finish BY PHRASE_DUR (Blob-local 310) so
            // nothing bleeds into Part 2b. Exit runs lf=50 → 60 (10f fade).
            const p1ExitOp    = interpolate(lf, [PHRASE_DUR - 10, PHRASE_DUR], [1, 0], clamp);
            const p1ExitScale = interpolate(lf, [PHRASE_DUR - 10, PHRASE_DUR], [1, 1.08], clamp);

            // Transition starts at lf=28 (typing done ~27f + tiny hold)
            const TRANS = 28;
            const transSp = spring({ frame: lf - TRANS, fps, config: { stiffness: 100, damping: 24, mass: 1.0 } });
            const transT = interpolate(transSp, [0, 1], [0, 1], clamp);

            // "Reduction in" shrinks from 56→34, slides up
            const l1FontSize = interpolate(transT, [0, 1], [56, 34], clamp);
            const l1SlideY = interpolate(transT, [0, 1], [0, -120], clamp);
            const l1Op = interpolate(transT, [0, 1], [1, 0.6], clamp);

            // Line 2 zoom-in
            const L2_DELAY = TRANS + 2;
            const l2Sp = spring({ frame: lf - L2_DELAY, fps, config: { stiffness: 140, damping: 22, mass: 0.8 } });
            const l2Scale = interpolate(l2Sp, [0, 1], [0.7, 1], clamp);
            const l2Op = interpolate(l2Sp, [0, 1], [0, 1], clamp);
            const l2Ty = interpolate(l2Sp, [0, 1], [30, 0], clamp);

            // "costs" underline — starts earlier
            const ulDelay = L2_DELAY + 10;
            const ulSp1 = spring({ frame: lf - ulDelay, fps, config: { stiffness: 220, damping: 18, mass: 0.7 } });
            const ulProg1 = interpolate(ulSp1, [0, 1], [0, 1], clamp);

            // Line 2 words stagger
            const line2Words = ["equipment", "lifecycle", "costs"];
            const l2States = line2Words.map((w, i) => {
              const sp = spring({ frame: lf - L2_DELAY - i * 5, fps, config: { stiffness: 200, damping: 22, mass: 0.7 } });
              return {
                w, op: interpolate(sp, [0, 1], [0, 1], clamp),
                ty: interpolate(sp, [0, 1], [16, 0], clamp),
              };
            });

            return (
              <div key={`i${sIdx}-${pIdx}`} style={{
                position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                opacity: p1ExitOp, transform: `scale(${p1ExitScale})`, transformOrigin: "center center",
                zIndex: 1, pointerEvents: "none", willChange: "transform, opacity",
              }}>
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
                }}>
                  {/* Line 1: "Reduction in" — shrinks + slides up */}
                  <span style={{
                    fontFamily: geistFont, fontSize: l1FontSize, fontWeight: 700,
                    letterSpacing: "-0.03em", lineHeight: 1.2,
                    color: "rgba(255,255,255,0.9)",
                    opacity: l1Op,
                    transform: `translateY(${l1SlideY}px)`,
                    transition: "none",
                  }}>
                    {visibleText}
                    {!typingDone && (
                      <span style={{ opacity: cursorBlink, marginLeft: 2 }}>▌</span>
                    )}
                  </span>

                  {/* Line 2: "equipment lifecycle [costs]" — zoom in */}
                  {l2Op > 0.001 && (
                    <div style={{
                      display: "flex", gap: 16, justifyContent: "center", alignItems: "baseline",
                      opacity: l2Op,
                      transform: `translateY(${l2Ty}px) scale(${l2Scale})`,
                      transformOrigin: "center center",
                    }}>
                      {l2States.map((s, i) => {
                        const isCosts = s.w === "costs";
                        return (
                          <span key={i} style={{
                            position: "relative", display: "inline-block",
                            fontFamily: geistFont, fontSize: 72, fontWeight: 900,
                            letterSpacing: "-0.04em", lineHeight: 1.15,
                            color: isCosts ? ACCENT : "rgba(255,255,255,0.95)",
                            opacity: s.op, transform: `translateY(${s.ty}px)`,
                          }}>
                            {s.w}
                            {isCosts && ulProg1 > 0.001 && (
                              <svg viewBox="0 0 200 12" preserveAspectRatio="none" style={{
                                position: "absolute", left: 0, right: 0, bottom: -8,
                                width: "100%", height: 10, overflow: "visible",
                              }}>
                                <line x1="0" y1="6" x2="200" y2="6"
                                  stroke={ACCENT} strokeWidth="4" strokeLinecap="round"
                                  style={{ strokeDasharray: 200, strokeDashoffset: 200 * (1 - ulProg1) }} />
                              </svg>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          });
        }

        // ── BRACKETS (zoom-in entry, black text, no brackets) ──────────
        if (seq.anim === "brackets") {
          return seq.phrases.map((phrase, pIdx) => {
            const phaseStart = start + pIdx * PHRASE_DUR;
            const lf = frame - phaseStart;
            if (lf < -2 || lf > PHRASE_DUR + 14) return null;

            // Zoom-in entry: scale from 0.6 → 1
            const entrySp = spring({ frame: lf, fps, config: { stiffness: 160, damping: 20, mass: 0.8 } });
            const entryScale = interpolate(entrySp, [0, 1], [0.6, 1], clamp);
            const entryOp    = interpolate(entrySp, [0, 1], [0, 1], clamp);

            // Words appear with stagger
            const ws = wordReveal(phrase, lf - 4, fps);

            // Underline for highlight words (after words settle)
            const hlUlSp = spring({ frame: lf - 20, fps, config: { stiffness: 180, damping: 20, mass: 0.8 } });
            const hlUlProg = interpolate(hlUlSp, [0, 1], [0, 1], clamp);

            // Slow fade starting earlier — removes the static hold after the zoom-in settles
            const exitOp = interpolate(lf, [PHRASE_DUR - 22, PHRASE_DUR + 4], [1, 0], clamp);
            const exitScale = interpolate(lf, [PHRASE_DUR - 22, PHRASE_DUR + 4], [1, 1.06], clamp);

            const HIGHLIGHT_WORDS = ["Less", "fewer"];

            return (
              <div key={`b${sIdx}-${pIdx}`} style={{
                position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                opacity: entryOp * exitOp,
                transform: `scale(${entryScale * exitScale})`,
                transformOrigin: "center center",
                zIndex: 1, pointerEvents: "none", willChange: "transform, opacity",
              }}>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 16px", maxWidth: 1400, padding: "0 100px" }}>
                  {ws.map((s, i) => {
                    const isHl = HIGHLIGHT_WORDS.includes(s.w);
                    return (
                      <span key={i} style={{
                        position: "relative", display: "inline-block",
                        fontFamily: geistFont, fontSize: 60, fontWeight: 800,
                        letterSpacing: "-0.035em", lineHeight: 1.15,
                        color: isHl ? ACCENT : (isNum(s.w) ? ACCENT : INK),
                        opacity: s.op, transform: `translateY(${s.ty}px)`, willChange: "transform, opacity",
                      }}>
                        {s.w}
                        {isHl && hlUlProg > 0.001 && (
                          <svg viewBox="0 0 200 12" preserveAspectRatio="none" style={{
                            position: "absolute", left: 0, right: 0, bottom: -4,
                            width: "100%", height: 8, overflow: "visible",
                          }}>
                            <line x1="0" y1="6" x2="200" y2="6"
                              stroke={ACCENT} strokeWidth="4" strokeLinecap="round"
                              style={{ strokeDasharray: 200, strokeDashoffset: 200 * (1 - hlUlProg) }} />
                          </svg>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          });
        }

        // ── BURST (word-by-word reveal + "means" typewriter) ─────────────
        if (seq.anim === "burst") {
          return seq.phrases.map((phrase, pIdx) => {
            const phaseStart = start + pIdx * pd;
            const lf = frame - phaseStart;
            if (lf < -2 || lf > pd + 14) return null;

            // ── "and execution" — clean cut, accent color + underline, NO enter/exit transition ──
            if (pIdx === 1) {
              // Hard clamp — disappears the moment "means" phase begins
              if (lf < 0 || lf >= pd) return null;
              // Underline draws in over ~14 frames, then holds
              const ulSp = spring({ frame: lf - 2, fps, config: { stiffness: 200, damping: 22, mass: 0.7 } });
              const ulProg = interpolate(ulSp, [0, 1], [0, 1], clamp);
              return (
                <div key={`d${sIdx}-1`} style={{
                  position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  zIndex: 1, pointerEvents: "none",
                }}>
                  <span style={{
                    position: "relative", display: "inline-block",
                    fontFamily: geistFont, fontSize: 88, fontWeight: 900,
                    letterSpacing: "-0.04em", lineHeight: 1.1,
                    color: ACCENT,
                  }}>
                    {phrase}
                    {ulProg > 0.001 && (
                      <svg viewBox="0 0 600 16" preserveAspectRatio="none" style={{
                        position: "absolute", left: -4, right: -4, bottom: -10,
                        width: "calc(100% + 8px)", height: 14, overflow: "visible",
                      }}>
                        <path d="M 3 8 C 80 4, 180 13, 300 8 S 480 4, 596 10"
                          stroke={ACCENT} strokeWidth="6" strokeLinecap="round" fill="none"
                          style={{ strokeDasharray: 620, strokeDashoffset: 620 * (1 - ulProg) }} />
                      </svg>
                    )}
                  </span>
                </div>
              );
            }

            // ── "means" — char-by-char typewriter, large ──
            if (pIdx === 2) {
              const MCHAR_RATE = 0.5;
              const mChars = Math.floor(Math.max(0, lf * MCHAR_RATE));
              const mVisible = phrase.slice(0, Math.min(mChars, phrase.length));
              const mDone = mChars >= phrase.length;
              const mCursor = Math.floor(frame / 8) % 2 === 0 ? 1 : 0;
              const mExitOp = interpolate(lf, [pd - 10, pd], [1, 0], clamp);
              const mExitScale = interpolate(lf, [pd - 10, pd], [1, 1.08], clamp);
              return (
                <div key={`d${sIdx}-2`} style={{
                  position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: mExitOp, transform: `scale(${mExitScale})`, transformOrigin: "center center",
                  zIndex: 1, pointerEvents: "none", willChange: "transform, opacity",
                }}>
                  <span style={{
                    fontFamily: geistFont, fontSize: 140, fontWeight: 900,
                    letterSpacing: "-0.045em", lineHeight: 1,
                    color: "rgba(255,255,255,0.95)",
                  }}>
                    {mVisible}
                    {!mDone && <span style={{ opacity: mCursor, marginLeft: 4 }}>▌</span>}
                  </span>
                </div>
              );
            }

            // ── Phrase 0 & 2: word-by-word reveal ──
            const ws = wordReveal(phrase, lf, fps, 5, { stiffness: 220, damping: 22, mass: 0.7 });
            // Phrase 3 (last — "Reduction in staff costs") fades out BY pd so
            // it's gone by Seq 3's end. That boundary is where the Kanban
            // interstitial mounts, and we want no text residue on either side.
            const exitWindow: [number, number] = pIdx === 3 ? [pd - 14, pd] : [pd - 10, pd + 4];
            const exitOp    = interpolate(lf, exitWindow, [1, 0], clamp);
            const exitTy    = interpolate(lf, exitWindow, [0, -50], clamp);
            const exitScale = interpolate(lf, exitWindow, [1, 1.06], clamp);

            // Dashes only on phrase 2
            const burstSp = spring({ frame: lf, fps, config: { stiffness: 360, damping: 18, mass: 0.7 } });
            const burstT = interpolate(burstSp, [0, 1], [0, 1], clamp);
            const dashOp = pIdx === 3
              ? interpolate(lf, [0, 8, 30, 40], [0, 1, 1, 0], clamp) : 0;

            return (
              <div key={`d${sIdx}-${pIdx}`} style={{
                position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                opacity: exitOp, transform: `translateY(${exitTy}px) scale(${exitScale})`,
                transformOrigin: "center center",
                zIndex: 1, pointerEvents: "none", willChange: "transform, opacity",
              }}>
                {dashOp > 0.01 && (
                  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", opacity: dashOp }}>
                    {BURST.map((d, i) => {
                      const rad = d.angle * Math.PI / 180;
                      const cx = 960 + Math.cos(rad) * d.r * burstT;
                      const cy = 540 - Math.sin(rad) * d.r * burstT;
                      return (
                        <rect key={i} x={-d.w/2} y={-d.h/2} width={d.w} height={d.h} rx={d.h/2}
                          fill={ACCENT} transform={`translate(${cx}, ${cy}) rotate(${-d.angle})`} />
                      );
                    })}
                  </svg>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 18px", maxWidth: 1400, padding: "0 100px" }}>
                  {ws.map((s, i) => (
                    <span key={i} style={{
                      display: "inline-block", fontFamily: geistFont, fontSize: 72, fontWeight: 900,
                      letterSpacing: "-0.04em", lineHeight: 1.15,
                      color: "rgba(255,255,255,0.95)",
                      opacity: s.op, transform: `translateY(${s.ty}px)`,
                      willChange: "transform, opacity",
                    }}>{s.w}</span>
                  ))}
                </div>
              </div>
            );
          });
        }

        // ── ZOOM (closing — zoom-through + metallic) ────────────────────
        if (seq.anim === "zoom") {
          return seq.phrases.map((phrase, pIdx) => {
            const phaseStart = start + pIdx * pd;
            const lf = frame - phaseStart;
            if (lf < -2 || lf > pd + 20) return null;

            if (pIdx === 0) {
              // First phrase: two lines, zoom through
              const LINE1 = "Every optimization leads";
              const LINE2 = "to the same thing";
              const ws1 = wordReveal(LINE1, lf, fps, 3);
              const ws2 = wordReveal(LINE2, lf - LINE1.split(" ").length * 3, fps, 3);
              const zoomT = interpolate(lf, [16, pd], [0, 1], {
                easing: Easing.in(Easing.cubic), ...clamp,
              });
              const zScale = interpolate(zoomT, [0, 1], [1, 4], clamp);
              const zOp    = interpolate(zoomT, [0.3, 0.8], [1, 0], clamp);

              return (
                <div key={`z${sIdx}-0`} style={{
                  position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: zOp, transform: `scale(${zScale})`, transformOrigin: "center center",
                  zIndex: 1, pointerEvents: "none", willChange: "transform, opacity",
                }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                      {ws1.map((s, i) => (
                        <span key={i} style={{
                          display: "inline-block", fontFamily: geistFont, fontSize: 64, fontWeight: 800,
                          letterSpacing: "-0.04em", lineHeight: 1.15, color: NAVY,
                          opacity: s.op, transform: `translateY(${s.ty}px)`, willChange: "transform, opacity",
                        }}>{s.w}</span>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                      {ws2.map((s, i) => (
                        <span key={i} style={{
                          display: "inline-block", fontFamily: geistFont, fontSize: 64, fontWeight: 800,
                          letterSpacing: "-0.04em", lineHeight: 1.15,
                          color: s.w === "same" ? ACCENT : NAVY,
                          opacity: s.op, transform: `translateY(${s.ty}px)`, willChange: "transform, opacity",
                        }}>{s.w}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            } else if (pIdx === 1) {
              // "cost savings." — big, centered, with underline drawing
              const entrySp = spring({ frame: lf, fps, config: { stiffness: 140, damping: 20, mass: 0.8 } });
              const entryOp = interpolate(entrySp, [0, 1], [0, 1], clamp);
              const entryScale = interpolate(entrySp, [0, 1], [0.75, 1], clamp);
              const entryTy = interpolate(entrySp, [0, 1], [30, 0], clamp);
              // Underline draws after text settles
              const ulSp = spring({ frame: lf - 14, fps, config: { stiffness: 180, damping: 18, mass: 0.8 } });
              const ulProg = interpolate(ulSp, [0, 1], [0, 1], clamp);
              const exitOp = interpolate(lf, [pd - 6, pd + 10], [1, 0], clamp);
              const exitScale = interpolate(lf, [pd - 6, pd + 10], [1, 1.1], clamp);

              return (
                <div key={`z${sIdx}-1`} style={{
                  position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: entryOp * exitOp,
                  transform: `scale(${entryScale * exitScale}) translateY(${entryTy}px)`,
                  transformOrigin: "center center",
                  zIndex: 1, pointerEvents: "none", willChange: "transform, opacity",
                }}>
                  <span style={{
                    position: "relative", display: "inline-block",
                    fontFamily: geistFont, fontSize: 100, fontWeight: 900,
                    letterSpacing: "-0.045em", lineHeight: 1.1, textAlign: "center",
                    color: ACCENT,
                  }}>
                    {phrase}
                    {ulProg > 0.001 && (
                      <svg viewBox="0 0 600 16" preserveAspectRatio="none" style={{
                        position: "absolute", left: -4, right: -4, bottom: -12,
                        width: "calc(100% + 8px)", height: 14, overflow: "visible",
                      }}>
                        <path d="M 3 8 C 80 4, 180 13, 300 8 S 480 4, 596 10"
                          stroke={ACCENT} strokeWidth="6" strokeLinecap="round" fill="none"
                          style={{ strokeDasharray: 620, strokeDashoffset: 620 * (1 - ulProg) }} />
                      </svg>
                    )}
                  </span>
                </div>
              );
            } else if (pIdx === 2) {
              // "Low investment." — dark bg, "Low" in blue, rest white
              const ws2 = wordReveal(phrase, lf, fps, 5, { stiffness: 220, damping: 22, mass: 0.7 });
              const exitOp2 = interpolate(lf, [pd - 2, pd], [1, 0], clamp);
              return (
                <div key={`z${sIdx}-2`} style={{
                  position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: exitOp2, zIndex: 1, pointerEvents: "none",
                }}>
                  <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
                    {ws2.map((s, i) => (
                      <span key={i} style={{
                        display: "inline-block", fontFamily: geistFont, fontSize: 90, fontWeight: 900,
                        letterSpacing: "-0.04em", lineHeight: 1.1,
                        color: s.w === "Low" ? ACCENT : "rgba(255,255,255,0.95)",
                        opacity: s.op, transform: `translateY(${s.ty}px)`,
                        willChange: "transform, opacity",
                      }}>{s.w}</span>
                    ))}
                  </div>
                </div>
              );
            } else {
              // "High Return." — dark bg (shared with Low), "High" in blue, rest white
              const ws3 = wordReveal(phrase, lf, fps, 5, { stiffness: 220, damping: 22, mass: 0.7 });
              const exitOp3 = interpolate(lf, [pd - 6, pd + 16], [1, 0], clamp);
              return (
                <div key={`z${sIdx}-3`} style={{
                  position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: exitOp3, zIndex: 1, pointerEvents: "none",
                }}>
                  <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
                    {ws3.map((s, i) => (
                      <span key={i} style={{
                        display: "inline-block", fontFamily: geistFont, fontSize: 90, fontWeight: 900,
                        letterSpacing: "-0.04em", lineHeight: 1.1,
                        color: s.w === "High" ? ACCENT : "rgba(255,255,255,0.95)",
                        opacity: s.op, transform: `translateY(${s.ty}px)`,
                        willChange: "transform, opacity",
                      }}>{s.w}</span>
                    ))}
                  </div>
                </div>
              );
            }
          });
        }

        return null;
      })}
    </AbsoluteFill>
  );
};
