import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { geistFont } from "../constants";
import { WindRing3D } from "../components/WindRing3D";

/* ─── Timing ──────────────────────────────────────────────────────────── */
const Q_DUR            = 100;                       // frames of question content
const ANALYZE_DUR      = 60;                        // frames of "Analyzing…" intro per question
const SLOT_DUR         = Q_DUR + ANALYZE_DUR;       // 160 frames per question slot
const REG_ANALYZE_DUR  = 360;                       // 12s — special regulatory analyzing + list
// Total scene = Q1 slot + REG phase + 5 × (Q2-Q6) slots = 160 + 360 + 800 = 1320

/* ─── Data ────────────────────────────────────────────────────────────── */
interface Question {
  label: string;
  question: string;
  options: { icon: string; text: string }[];
  selectedIndex: number;
  selectFrame: number;
}

const QUESTIONS: Question[] = [
  {
    label: "01 · Industry",
    question: "Which industry do you operate in?",
    options: [
      { icon: "", text: "Manufacturing" },
      { icon: "", text: "Chemical & Pharma" },
      { icon: "", text: "Oil & Gas" },
      { icon: "", text: "Food & Beverage" },
      { icon: "", text: "Energy & Utilities" },
      { icon: "", text: "Automotive" },
      { icon: "", text: "Packaging" },
    ],
    selectedIndex: 0,
    selectFrame: 58,
  },
  {
    label: "02 · Main challenge",
    question: "What slows you down the most?",
    options: [
      { icon: "", text: "Finding the right information" },
      { icon: "", text: "Responding to breakdowns too slowly" },
      { icon: "", text: "Too many calls between teams" },
      { icon: "", text: "Paperwork and manual reports" },
      { icon: "", text: "Repetitive tasks eating up time" },
      { icon: "", text: "No visibility on what's happening" },
    ],
    selectedIndex: 1,
    selectFrame: 56,
  },
  {
    label: "03 · Team size",
    question: "How large is your team?",
    options: [
      { icon: "", text: "Just me" },
      { icon: "", text: "2 – 10 people" },
      { icon: "", text: "11 – 50 people" },
      { icon: "", text: "Over 50 people" },
    ],
    selectedIndex: 2,
    selectFrame: 60,
  },
  {
    label: "04 · Current tools",
    question: "How do you manage maintenance today?",
    options: [
      { icon: "", text: "Spreadsheets & Excel" },
      { icon: "", text: "Paper & whiteboards" },
      { icon: "", text: "A legacy CMMS system" },
      { icon: "", text: "We don't have a system" },
      { icon: "", text: "We use multiple tools" },
    ],
    selectedIndex: 0,
    selectFrame: 56,
  },
  {
    label: "05 · Your goal",
    question: "What would change everything for you?",
    options: [
      { icon: "", text: "Zero unplanned downtime" },
      { icon: "", text: "Cut response time in half" },
      { icon: "", text: "Less time on paperwork" },
      { icon: "", text: "Full visibility across the plant" },
      { icon: "", text: "Safer working conditions" },
      { icon: "", text: "Lower maintenance costs" },
    ],
    selectedIndex: 3,
    selectFrame: 58,
  },
  {
    label: "06 · Regulatory region",
    question: "Which regulatory area do you operate in?",
    options: [
      { icon: "", text: "Europe (EU)" },
      { icon: "", text: "United States (US)" },
      { icon: "", text: "Asia-Pacific (APAC)" },
      { icon: "", text: "Latin America (LATAM)" },
      { icon: "", text: "Middle East & Africa (MEA)" },
      { icon: "", text: "Global / Multi-region (GLOBAL)" },
    ],
    selectedIndex: 0,
    selectFrame: 58,
  },
];

/* ─── Frame layout helpers ────────────────────────────────────────────── */
// Q0..Q5: 6 slots of SLOT_DUR = [0, 960)
// REG special phase: [960, 960+REG_ANALYZE_DUR) = [960, 1320)
const REG_START = 6 * SLOT_DUR;                    // 960 — after all 6 questions
const REG_END   = REG_START + REG_ANALYZE_DUR;     // 1320

function getSlotBounds(i: number) {
  const base = i * SLOT_DUR;
  return { aStart: base, qStart: base + ANALYZE_DUR, qEnd: base + SLOT_DUR };
}

/* ─── Analyzing Phase (before each question) ────────────────────────── */
// Phrases rotate per question
const ANALYZING_PHRASES = [
  "Analyzing",              // before Q1 - Industry
  "Understanding context",  // before Q2 - Main challenge
  "Mapping your team",      // before Q3 - Team size
  "Reading your setup",     // before Q4 - Current tools
  "Aligning your goal",     // before Q5 - Goal
  "Checking your region",   // before Q6 - Regulatory region
];

/* ─── Regulatory Analyzing Phase (after Europe selected) ────────────── */
// 3 rotating phrases then a fast-scrolling list of EU manufacturing regulations
const REG_PHRASES = [
  "Adapting agents to your regulatory environment",
  "Processing regulatory context",
  "Identifying applicable standards",
];
const REG_PHRASE_DUR       = 60;  // phrases 1 & 2 lifetime (slightly slower than 52)
const REG_PHRASE_STAGGER   = 44;  // stagger between phrase starts
const FIRST_PHRASE_EXTRA   = 60;  // phrase 0 keeps its dramatic typewriter + zoom

const REGULATIONS = [
  "Machinery Regulation (EU) 2023/1230",
  "CE Marking",
  "ATEX Directive 2014/34/EU",
  "Low Voltage Directive 2014/35/EU",
  "EMC Directive 2014/30/EU",
  "Pressure Equipment Directive 2014/68/EU",
  "REACH Regulation (EC) 1907/2006",
  "RoHS Directive 2011/65/EU",
  "ISO 9001 · Quality Management",
  "ISO 14001 · Environmental Management",
  "ISO 45001 · Occupational Safety",
  "EU AI Act (Reg. 2024/1689)",
];
const REG_LIST_START = 220;   // frame (local) when list begins fading in
                              // (right after phrase 0's typewriter + phrases 1 & 2)
const REG_LIST_STEP  = 10;    // frames between items (fast scroll)

/* ─── Metallic shimmer text ─────────────────────────────────────────── */
// Sweeping chrome-like highlight that travels left → right across the text.
// Uses background-clip: text with a gradient 3× wider than the element.
// The bright band is at 50% of the gradient. Because the gradient is 3×
// wider, backgroundPosition ∈ [0, 100] always keeps the text fully covered.
// A SOLID backgroundColor is set as a safety net so glyphs never go fully
// transparent in case the gradient doesn't cover them.
//
// `startFrame` shifts the shimmer timeline: the sweep begins so that the
// bright band enters the left edge of the text ~12 frames after `startFrame`
// (which matches the typical text fade-in), giving the impression that the
// glow starts right as the text becomes visible.
const getShimmerStyle = (localFrame: number, startFrame = 0): React.CSSProperties => {
  const sweepDur = 55;   // frames the bright band takes to cross
  const pauseDur = 95;   // frames before the next sweep
  const cycleDur = sweepDur + pauseDur;
  const f = localFrame - startFrame;
  const phase = ((f % cycleDur) + cycleDur) % cycleDur;
  // Sweep 95 → 5 (band enters text at f≈10, exits around f≈50).
  // During the pause we keep pos at 5 (band offscreen right = invisible).
  const pos = phase < sweepDur ? 95 - (phase / sweepDur) * 90 : 5;

  return {
    backgroundColor: "rgba(26,26,46,0.74)",
    backgroundImage:
      "linear-gradient(100deg, " +
      "rgba(26,26,46,0.74) 0%, " +
      "rgba(26,26,46,0.74) 42%, " +
      "rgba(120,150,255,0.95) 47%, " +
      "#ffffff 50%, " +
      "rgba(120,150,255,0.95) 53%, " +
      "rgba(26,26,46,0.74) 58%, " +
      "rgba(26,26,46,0.74) 100%)",
    backgroundSize: "300% 100%",
    backgroundPosition: `${pos}% 0%`,
    backgroundRepeat: "no-repeat",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent",
  };
};

/* ─── Cursor ──────────────────────────────────────────────────────────── */
const Cursor: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.22))" }}>
    <path d="M4 2l16 10-7 1-4 7z" fill="#1A1F2E" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round"/>
  </svg>
);

/* ─── Single Question Slide ───────────────────────────────────────────── */
const QuestionSlide: React.FC<{ q: Question; localFrame: number }> = ({ q, localFrame }) => {
  const { fps } = useVideoConfig();

  const sp = (f: number, s = 280, d = 24) =>
    spring({ frame: localFrame - f, fps, config: { stiffness: s, damping: d, mass: 0.6 } });

  // Slide enter from right
  const enterT = sp(0, 240, 28);
  // Slide exit to left (last 18 frames)
  const exitStart = Q_DUR - 18;
  const exitT = localFrame >= exitStart
    ? spring({ frame: localFrame - exitStart, fps, config: { stiffness: 260, damping: 26, mass: 0.5 } })
    : 0;

  const translateX = interpolate(enterT, [0,1], [80, 0]) - interpolate(exitT, [0,1], [0, 80]);
  const opacity    = interpolate(enterT, [0,1], [0, 1])  * interpolate(exitT, [0,1], [1, 0]);

  // Typing effect on question text
  const typeStart = 10;
  const typeSpeed = 0.45;
  const typedLen  = Math.max(0, Math.floor((localFrame - typeStart) / typeSpeed));
  const displayText = q.question.slice(0, typedLen);
  const showCursor  = localFrame < typeStart + q.question.length / typeSpeed + 12;

  // Selected option
  const selected    = localFrame >= q.selectFrame;
  const selectT     = selected ? sp(q.selectFrame, 400, 18) : 0;

  // Cursor movement — adapt cols based on option count
  const cols = q.options.length > 4 ? 3 : 2;
  const cardW = q.options.length > 4 ? 280 : 340;
  const cardH = 80; const gapX = 16; const gapY = 12;
  const totalGridW = cols * cardW + (cols - 1) * gapX;
  const gridLeft = (1920 - totalGridW) / 2;
  const rows = Math.ceil(q.options.length / cols);
  const gridHeight = rows * cardH + (rows - 1) * gapY;
  const gridTop = Math.round((1080 - 86 - gridHeight) / 2 + 86);
  const col = q.selectedIndex % cols;
  const row = Math.floor(q.selectedIndex / cols);
  const targetX = gridLeft + col * (cardW + gapX) + cardW * 0.5;
  const targetY = gridTop  + row * (cardH + gapY) + cardH * 0.5;

  const cursorMoveT = spring({ frame: localFrame - 20, fps, config: { stiffness: 90, damping: 22, mass: 1 } });
  const cursorX = interpolate(cursorMoveT, [0,1], [1040, targetX]);
  const cursorY = interpolate(cursorMoveT, [0,1], [520, targetY]);
  const cursorOp = interpolate(localFrame, [12, 20], [0, 1], { extrapolateLeft:"clamp", extrapolateRight:"clamp" })
                 * interpolate(exitT, [0,1], [1, 0]);
  const clickScale = selected
    ? interpolate(spring({ frame: localFrame - q.selectFrame, fps, config: { stiffness: 700, damping: 16 } }), [0,1], [1.4, 1])
    : 1;

  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      opacity,
      transform: `translateX(${translateX}px)`,
    }}>
      {/* Label */}
      <div style={{
        fontFamily: geistFont, fontSize: 11, fontWeight: 600, letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "rgba(59,91,219,0.55)",
        marginBottom: 22,
        opacity: interpolate(sp(4), [0,1], [0,1]),
      }}>
        {q.label}
      </div>

      {/* Question — large, light */}
      <h1 style={{
        fontFamily: geistFont, fontSize: 46, fontWeight: 300,
        color: "#1A1A2E", margin: "0 0 40px", whiteSpace: "nowrap",
        textAlign: "center", letterSpacing: "-0.025em", lineHeight: 1.1,
        maxWidth: 820,
        opacity: interpolate(sp(8, 220, 30), [0,1], [0,1]),
      }}>
        {displayText}
        {showCursor && (
          <span style={{
            display: "inline-block", width: 3, height: "0.85em",
            backgroundColor: "rgba(59,91,219,0.7)",
            marginLeft: 4, verticalAlign: "middle",
            borderRadius: 2,
          }} />
        )}
      </h1>

      {/* Options grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${cardW}px)`,
        gap: `${gapY}px ${gapX}px`,
      }}>
        {q.options.map((opt, i) => {
          const optT = sp(22 + i * 8, 300, 22);
          const isSel = selected && i === q.selectedIndex;
          const selT  = isSel ? selectT : 0;

          return (
            <div key={opt.text} style={{
              height: cardH,
              borderRadius: 20,
              border: `1.5px solid ${isSel ? "rgba(59,91,219,0.55)" : "rgba(59,91,219,0.12)"}`,
              backgroundColor: isSel ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.72)",
              backdropFilter: "blur(14px)",
              display: "flex", alignItems: "center", gap: 18, padding: "0 26px",
              boxShadow: isSel
                ? "0 0 0 4px rgba(59,91,219,0.10), 0 8px 32px rgba(59,91,219,0.18), 0 2px 12px rgba(0,0,0,0.06)"
                : "0 4px 24px rgba(59,91,219,0.07), 0 1px 4px rgba(0,0,0,0.03)",
              opacity: interpolate(optT, [0,1], [0,1]),
              transform: `translateY(${interpolate(optT, [0,1], [22,0])}px) scale(${isSel ? interpolate(selT,[0,1],[1,1.025]) : 1})`,
            }}>
              {opt.icon && <span style={{ fontSize: 28, lineHeight: 1 }}>{opt.icon}</span>}
              <span style={{
                fontFamily: geistFont, fontSize: 16, fontWeight: isSel ? 500 : 400,
                color: isSel ? "#1E3A8A" : "#2D3561",
                letterSpacing: "-0.01em",
              }}>
                {opt.text}
              </span>
              {isSel && (
                <div style={{
                  marginLeft: "auto",
                  width: 26, height: 26, borderRadius: "50%",
                  backgroundColor: "#3B5BDB",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: interpolate(selT, [0,1], [0,1]),
                  transform: `scale(${interpolate(selT,[0,1],[0.4,1])})`,
                  flexShrink: 0,
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cursor */}
      <div style={{
        position: "absolute",
        left: cursorX - 4, top: cursorY - 4,
        opacity: cursorOp,
        transform: `scale(${clickScale})`,
        pointerEvents: "none",
      }}>
        <Cursor />
      </div>
    </div>
  );
};

/* ─── Analyzing Phase (before each question) ────────────────────────── */
const AnalyzingPhase: React.FC<{ localFrame: number; globalFrame: number; phrase: string; seamlessIn?: boolean }> = ({ localFrame, globalFrame, phrase, seamlessIn }) => {
  const { fps } = useVideoConfig();

  const enterT = seamlessIn
    ? 1
    : spring({ frame: localFrame, fps, config: { stiffness: 90, damping: 24, mass: 1.1 } });
  const textEnterT = spring({ frame: localFrame - 4, fps, config: { stiffness: 120, damping: 22, mass: 0.8 } });
  const exitT  = localFrame >= 44
    ? spring({ frame: localFrame - 44, fps, config: { stiffness: 140, damping: 24, mass: 0.9 } })
    : 0;

  const t = localFrame / fps;
  const blobBreathe = 1 + Math.sin(t * 3.6) * 0.07;

  const opacity    = interpolate(enterT, [0, 1], [0, 1]) * interpolate(exitT, [0, 1], [1, 0]);
  const scale      = interpolate(enterT, [0, 1], [0.88, 1]);
  const translateY = interpolate(exitT, [0, 1], [0, -8]);
  const textOpacity = seamlessIn
    ? interpolate(textEnterT, [0, 1], [0, 1]) * interpolate(exitT, [0, 1], [1, 0])
    : 1;

  const dotCount = Math.floor(localFrame / 7) % 4;
  const dots = ".".repeat(dotCount);

  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      pointerEvents: "none",
      gap: 36,
      opacity,
      transform: `scale(${scale}) translateY(${translateY}px)`,
      willChange: "transform, opacity",
    }}>
      <div style={{ transform: `scale(${blobBreathe})`, transformOrigin: "center" }}>
        <WindRing3D size={120} frame={globalFrame} fps={fps} />
      </div>
      <span style={{
        fontFamily: geistFont, fontSize: 48, fontWeight: 300,
        letterSpacing: "-0.025em",
        width: 640,
        textAlign: "left",
        whiteSpace: "nowrap",
        flexShrink: 0,
        opacity: textOpacity,
        ...getShimmerStyle(localFrame),
      }}>
        {phrase}{dots}
      </span>
    </div>
  );
};

/* ─── Regulatory Analyzing Phase ──────────────────────────────────────── */
// Special long phase shown after Europe is selected. Rotates through 3
// "thinking" phrases while the blob breathes, then the blob fades and a fast
// scrolling list of EU manufacturing regulations takes over the centre.
const RegulatoryAnalyzingPhase: React.FC<{ localFrame: number; globalFrame: number }> = ({ localFrame, globalFrame }) => {
  const { fps } = useVideoConfig();
  const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

  // Global enter / exit
  const enterT = spring({ frame: localFrame, fps, config: { stiffness: 90, damping: 24, mass: 1.1 } });
  const exitStart = REG_ANALYZE_DUR - 22;
  const exitT = localFrame >= exitStart
    ? spring({ frame: localFrame - exitStart, fps, config: { stiffness: 160, damping: 24, mass: 0.9 } })
    : 0;
  const globalOpacity = interpolate(enterT, [0, 1], [0, 1]) * interpolate(exitT, [0, 1], [1, 0]);

  // Breathing blob — stronger, faster pulse
  const t = localFrame / fps;
  const blobBreathe = 1 + Math.sin(t * 4.6) * 0.13;

  // Dots animation
  const dotCount = Math.floor(localFrame / 7) % 4;
  const dots = ".".repeat(dotCount);

  // List scrolling state
  const listLocal = localFrame - REG_LIST_START;
  const listOpacity = interpolate(
    localFrame,
    [REG_LIST_START - 6, REG_LIST_START + 18],
    [0, 1],
    clamp,
  );
  // One trigger fewer than items so the scroll settles with the LAST item
  // centred on the badge — not past it.
  const triggers = Array.from({ length: REGULATIONS.length - 1 }, (_, i) => i * REG_LIST_STEP);
  const scrollPos = triggers.reduce(
    (acc, f) => acc + spring({ frame: listLocal - f, fps, config: { stiffness: 190, damping: 28, mass: 0.85 } }),
    0,
  );

  // ── Layout constants ──
  const CENTER_X = 960;
  const CENTER_Y = 540;

  // List typography — active item is larger/bolder, inactive smaller & dimmer
  const SLOT_H       = 76;
  const FONT_ACTIVE  = 40;
  const FONT_NEAR    = 28;
  const FONT_FAR     = 22;
  const BADGE_SIZE   = 62;                            // legacy spacing anchor for TEXT_X
  const LIST_W       = 820;
  const LIST_LEFT    = (1920 - LIST_W) / 2;
  const TEXT_X       = LIST_LEFT + BADGE_SIZE + 14;

  // ── Phrase-stage blob layout ──
  // Each phrase has its own HUGE, LOW-OPACITY, BLURRED blob that sits at
  // centre as a ghostly halo behind the phrase text. When transitioning
  // between phrases the blobs OVERLAP (STAGGER < DUR) and a connecting line
  // visually links them so the sequence feels interconnected. The LAST
  // phrase doesn't exit — instead it shrinks, un-blurs and fades UP to full
  // opacity while morphing into the list-badge position where the
  // scales-of-justice icon fades in.
  const PHRASE_BLOB_SIZE = 640;   // huge, fills the stage
  const LIST_BLOB_SIZE   = 104;
  const LIST_BLOB_CX     = LIST_LEFT + LIST_BLOB_SIZE / 2 - 6;
  const BLOB_LOW_ALPHA   = 0.28;  // very ghostly, soft presence behind the text
  const BLOB_BLUR_PX     = 16;    // heavy blur → diffuse cloud-like feel

  // Scales icon pulse (used on the last phrase once it morphs into the badge)
  const scalesOpacity = interpolate(
    localFrame,
    [REG_LIST_START - 6, REG_LIST_START + 16],
    [0, 1],
    clamp,
  );
  const scalesPulse = 1 + Math.sin(t * 4.6) * 0.09;

  // ── Compute per-phrase state (position, size, opacity) ──
  type PhraseState = {
    phrase: string;
    pStart: number;
    pF: number;
    blobCx: number;
    blobSize: number;
    blobAlpha: number;   // final alpha multiplier for the blob (ghost vs solid)
    blobBlur: number;    // blur px applied to the blob div
    blobOpacity: number; // enter/exit fade factor
    textOpacity: number;
    scalesOn: boolean;
    badgeness: number;   // 0 = phrase stage (blob), 1 = list badge (white circle)
    visible: boolean;
  };

  // Slow, deliberate spring config for all phrase motion
  const slowSpring = { stiffness: 68, damping: 22, mass: 1.25 };
  const slowExit   = { stiffness: 80, damping: 24, mass: 1.15 };

  const phraseStates: PhraseState[] = REG_PHRASES.map((phrase, i) => {
    const isFirst = i === 0;
    const isLast  = i === REG_PHRASES.length - 1;
    // Phrase 0 gets its own extended typewriter lifetime; subsequent phrases
    // start AFTER phrase 0 has fully exited (offset by FIRST_PHRASE_EXTRA).
    const pStart    = isFirst ? 0 : FIRST_PHRASE_EXTRA + i * REG_PHRASE_STAGGER;
    const phraseDur = isFirst ? REG_PHRASE_DUR + FIRST_PHRASE_EXTRA : REG_PHRASE_DUR;
    const pF        = localFrame - pStart;

    // Enter: pulled in from the right (slowed)
    const enterSp = spring({ frame: pF, fps, config: slowSpring });
    const enterX  = interpolate(enterSp, [0, 1], [1100, 0], clamp);
    const enterOp = interpolate(enterSp, [0, 0.35, 1], [0, 1, 1], clamp);

    if (!isLast) {
      // Non-last phrases slide out to the left once their hold time is done
      const exitAt = phraseDur - 20;
      const exitSp = pF >= exitAt
        ? spring({ frame: pF - exitAt, fps, config: slowExit })
        : 0;
      const exitX  = interpolate(exitSp, [0, 1], [0, -2100], clamp);
      const exitOp = interpolate(exitSp, [0, 0.6, 1], [1, 1, 0], clamp);

      const visible = pF > -6 && pF < phraseDur + 14;

      return {
        phrase,
        pStart,
        pF,
        blobCx: CENTER_X + enterX + exitX,
        blobSize: PHRASE_BLOB_SIZE,
        blobAlpha: BLOB_LOW_ALPHA,
        blobBlur: BLOB_BLUR_PX,
        blobOpacity: enterOp * exitOp,
        textOpacity: enterOp * exitOp,
        scalesOn: false,
        badgeness: 0,
        visible,
      };
    }

    // Last phrase: enter from right, hold centered, then morph into badge
    // (position, size, alpha all morph up, blur goes to 0 so blob becomes
    // a clean solid badge)
    const morphStart = REG_LIST_START - pStart - 34;
    const morphSp = pF >= morphStart
      ? spring({ frame: pF - morphStart, fps, config: slowSpring })
      : 0;

    const baseCx   = CENTER_X + enterX;
    const blobCx   = interpolate(morphSp, [0, 1], [baseCx, LIST_BLOB_CX]);
    const blobSize = interpolate(morphSp, [0, 1], [PHRASE_BLOB_SIZE, LIST_BLOB_SIZE]);
    const blobAlpha = interpolate(morphSp, [0, 0.5, 1], [BLOB_LOW_ALPHA, 0.82, 1], clamp);
    const blobBlur  = interpolate(morphSp, [0, 0.5, 1], [BLOB_BLUR_PX, 4, 0], clamp);
    const textOpacity = enterOp * interpolate(morphSp, [0, 0.35], [1, 0], clamp);

    return {
      phrase,
      pStart,
      pF,
      blobCx,
      blobSize,
      blobAlpha,
      blobBlur,
      blobOpacity: enterOp,
      textOpacity,
      scalesOn: true,
      badgeness: morphSp,
      visible: pF > -6,
    };
  });

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: globalOpacity }}>
      {/* ── Interconnection lines between adjacent phrase blobs ── */}
      {/* Drawn BEFORE blobs so they sit underneath the rings */}
      {phraseStates.slice(0, -1).map((_, idx) => {
        const si = phraseStates[idx];
        const sj = phraseStates[idx + 1];
        const linkAlpha = Math.min(si.blobOpacity, sj.blobOpacity);
        if (linkAlpha < 0.02) return null;
        const x1 = si.blobCx + si.blobSize / 2 - 6; // right edge of exiting blob
        const x2 = sj.blobCx - sj.blobSize / 2 + 6; // left edge of entering blob
        const lineLeft = Math.min(x1, x2);
        const lineW    = Math.max(0, Math.abs(x2 - x1));
        return (
          <div key={`link${idx}`} style={{
            position: "absolute",
            left: lineLeft,
            top: CENTER_Y - 1.5,
            width: lineW,
            height: 3,
            background: "linear-gradient(90deg, rgba(59,91,219,0.25) 0%, rgba(107,142,255,0.9) 20%, #ffffff 50%, rgba(107,142,255,0.9) 80%, rgba(59,91,219,0.25) 100%)",
            opacity: linkAlpha * 0.92,
            boxShadow: "0 0 18px rgba(107,142,255,0.8), 0 0 5px rgba(59,91,219,0.9)",
            borderRadius: 2,
            pointerEvents: "none",
            zIndex: 4,
          }} />
        );
      })}

      {/* ── Per-phrase units: big ghost blob behind, text centered in front ── */}
      {phraseStates.map((s, i) => {
        if (!s.visible) return null;
        // Crossfade: during phrase stage show the WindRing3D blob, during the
        // list-badge stage show a clean white circle instead.
        const blobVis   = Math.max(0, 1 - s.badgeness * 1.6); // fades out fast
        const badgeVis  = Math.min(1, Math.max(0, (s.badgeness - 0.25) / 0.55));
        return (
          <React.Fragment key={`p${i}`}>
            {/* Big low-opacity BLURRED blob — sits BEHIND the text
                (phrase stage only — fades out as it morphs into the badge) */}
            {blobVis > 0.001 && (
              <div style={{
                position: "absolute",
                left: s.blobCx - s.blobSize / 2,
                top:  CENTER_Y - s.blobSize / 2,
                width: s.blobSize,
                height: s.blobSize,
                opacity: s.blobOpacity * s.blobAlpha * blobVis,
                transform: `scale(${blobBreathe})`,
                transformOrigin: "center",
                filter: `blur(${s.blobBlur}px)`,
                zIndex: 5,
              }}>
                <WindRing3D size={s.blobSize} frame={globalFrame} fps={fps} />
              </div>
            )}

            {/* White-circle list badge — replaces the blob once it morphs down
                next to the regulations list. */}
            {badgeVis > 0.001 && (
              <div style={{
                position: "absolute",
                left: s.blobCx - s.blobSize / 2,
                top:  CENTER_Y - s.blobSize / 2,
                width: s.blobSize,
                height: s.blobSize,
                opacity: s.blobOpacity * badgeVis,
                transform: `scale(${blobBreathe})`,
                transformOrigin: "center",
                borderRadius: "50%",
                backgroundColor: "#FFFFFF",
                border: "1.5px solid rgba(59,91,219,0.22)",
                boxShadow: "0 6px 22px -6px rgba(59,91,219,0.28), 0 2px 8px -2px rgba(26,31,51,0.08)",
                zIndex: 5,
              }} />
            )}

            {/* Scales-of-justice icon — rendered OUTSIDE the blurred blob so
                it stays sharp. Only visible on the last phrase as it
                morphs into the list badge. */}
            {s.scalesOn && scalesOpacity > 0.001 && (
              <div style={{
                position: "absolute",
                left: s.blobCx - s.blobSize / 2,
                top:  CENTER_Y - s.blobSize / 2,
                width: s.blobSize,
                height: s.blobSize,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: scalesOpacity,
                transform: `scale(${scalesPulse})`,
                transformOrigin: "center",
                pointerEvents: "none",
                filter: "drop-shadow(0 2px 6px rgba(59,91,219,0.35))",
                zIndex: 7,
              }}>
                <svg width={s.blobSize * 0.44} height={s.blobSize * 0.44} viewBox="0 0 24 24" fill="none"
                     stroke="#1E3A8A" strokeWidth="1.6"
                     strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="3"  x2="12" y2="20" />
                  <line x1="4"  y1="7"  x2="20" y2="7" />
                  <path d="M4 7 L1.5 13 L6.5 13 Z" />
                  <path d="M20 7 L17.5 13 L22.5 13 Z" />
                  <line x1="8"  y1="20" x2="16" y2="20" />
                </svg>
              </div>
            )}

            {/* Phrase text — CENTERED in front of the blob.
                Phrase 0: BIG typewriter with full-screen zoom that shrinks back
                to normal. Phrases 1 & 2: static shimmer text with dots (no
                typing, no zoom). */}
            {s.textOpacity > 0.001 && i === 0 && (() => {
              // ── Phrase 0: typewriter + dramatic zoom (kept slow/dramatic) ──
              const typeStart = 8;
              const typeSpeed = 1.2; // frames per character
              const typedLen  = Math.max(0, Math.floor((s.pF - typeStart) / typeSpeed));
              const displayText = s.phrase.slice(0, Math.min(typedLen, s.phrase.length));
              const typingDoneFrame = typeStart + s.phrase.length * typeSpeed;
              const typingDone = s.pF >= typingDoneFrame;

              // Blinking cursor while typing, fades out quickly after typing completes
              const cursorBlink = Math.floor(s.pF / 6) % 2 === 0;
              const cursorOp = typingDone
                ? interpolate(s.pF, [typingDoneFrame, typingDoneFrame + 7], [1, 0], clamp)
                : 1;
              const showCursor = typedLen > 0 && cursorOp > 0.05;

              // BIG zoom during typing (full-screen feel), then SNAPS back to
              // normal with a snappy spring.
              const shrinkDoneFrame = typingDoneFrame + 7;
              const textScale = interpolate(
                s.pF,
                [typeStart - 4, typeStart, typingDoneFrame, shrinkDoneFrame],
                [0.9, 1.55, 1.55, 1.0],
                clamp,
              );

              // After typing completes, append the same cycling "..." dots
              // used by phrases 1 & 2, so phrase 0 gets the thinking feel too.
              const phrase0Dots = typingDone ? dots : "";

              return (
                <div style={{
                  position: "absolute",
                  left: s.blobCx - 680,
                  width: 1360,
                  top: CENTER_Y,
                  transform: `translateY(-50%) scale(${textScale})`,
                  transformOrigin: "center center",
                  textAlign: "center",
                  opacity: s.textOpacity,
                  fontFamily: geistFont,
                  fontSize: 52,
                  fontWeight: 400,
                  letterSpacing: "-0.028em",
                  whiteSpace: "nowrap",
                  zIndex: 10,
                  ...getShimmerStyle(localFrame, s.pStart),
                }}>
                  {displayText}{phrase0Dots}
                  {showCursor && cursorBlink && (
                    <span style={{
                      display: "inline-block",
                      width: 4,
                      height: "0.9em",
                      backgroundColor: "rgba(107,142,255,0.95)",
                      marginLeft: 6,
                      verticalAlign: "middle",
                      borderRadius: 2,
                      boxShadow: "0 0 10px rgba(107,142,255,0.7)",
                      opacity: cursorOp,
                    }} />
                  )}
                </div>
              );
            })()}

            {/* Phrases 1 & 2: static shimmer text with dots — no typing, no zoom */}
            {s.textOpacity > 0.001 && i !== 0 && (() => {
              // Last phrase ("Identifying applicable standards") gets a quick
              // FINAL FLASH before it morphs into the badge: scale pulse +
              // brightness/green confirm flash so it reads as "locked in".
              const isLast = i === REG_PHRASES.length - 1;
              // Flash window starts a few frames before morphStart (38 pF)
              // and lasts ~12 frames — just enough to be noticed.
              const FLASH_START = 28;
              const FLASH_END   = 44;
              const flashT = isLast
                ? interpolate(s.pF, [FLASH_START, (FLASH_START + FLASH_END) / 2, FLASH_END], [0, 1, 0], clamp)
                : 0;
              const pulseScale = 1 + flashT * 0.08;
              const flashFilter = flashT > 0.001
                ? `drop-shadow(0 0 ${18 * flashT}px rgba(31,168,112,${0.85 * flashT})) ` +
                  `drop-shadow(0 0 ${42 * flashT}px rgba(107,180,150,${0.55 * flashT})) ` +
                  `brightness(${1 + flashT * 0.12})`
                : undefined;

              return (
                <div style={{
                  position: "absolute",
                  left: s.blobCx - 680,
                  width: 1360,
                  top: CENTER_Y,
                  transform: `translateY(-50%) scale(${pulseScale})`,
                  transformOrigin: "center center",
                  textAlign: "center",
                  opacity: s.textOpacity,
                  fontFamily: geistFont,
                  fontSize: 52,
                  fontWeight: 400,
                  letterSpacing: "-0.028em",
                  whiteSpace: "nowrap",
                  zIndex: 10,
                  ...getShimmerStyle(localFrame, s.pStart),
                  ...(flashFilter ? { filter: flashFilter } : {}),
                }}>
                  {s.phrase}{dots}
                </div>
              );
            })()}
          </React.Fragment>
        );
      })}

      {/* ── Scrolling regulations list ── */}
      {localFrame >= REG_LIST_START - 12 && (
        <div style={{ position: "absolute", inset: 0, opacity: listOpacity }}>
          {/* Small uppercase label */}
          <div style={{
            position: "absolute",
            left: 0, right: 0,
            top: CENTER_Y - 260,
            textAlign: "center",
            fontFamily: geistFont,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "rgba(59,91,219,0.62)",
          }}>
            Applicable Standards · Europe
          </div>

          {/* Items — variable size (active bigger), masked wrapper */}
          <div style={{
            position: "absolute",
            left: TEXT_X,
            width: LIST_W - (BADGE_SIZE + 28),
            top: CENTER_Y - SLOT_H * 3,
            height: SLOT_H * 6,
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 26%, #000 74%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, transparent 0%, #000 26%, #000 74%, transparent 100%)",
            pointerEvents: "none",
            zIndex: 8,
          }}>
            {REGULATIONS.map((label, i) => {
              const distance = i - scrollPos;
              const absDist  = Math.abs(distance);
              if (absDist > 3.2) return null;

              const yPos     = SLOT_H * 3 + distance * SLOT_H;
              const isActive = absDist < 0.4;
              // An item becomes "verified" the moment it reaches the centre
              // and stays verified from that point on (green + checkmark).
              const verifyT  = interpolate(
                scrollPos - i, [-0.05, 0.15], [0, 1], clamp,
              );
              const isVerified = verifyT > 0.01;

              const fontSize = interpolate(absDist, [0, 0.4, 1.0, 2.2], [FONT_ACTIVE, FONT_NEAR, FONT_NEAR, FONT_FAR], clamp);
              const itemOp   = interpolate(absDist, [0, 0.2, 1.0, 2.0, 3.2], [1, 1, 0.36, 0.16, 0], clamp);

              // Colour transitions: default dark → blue at center → green
              // once verified (the check moment). Interpolation between the
              // blue and the green is driven by verifyT.
              const VERIFIED_GREEN = "#16A34A";
              const baseColor = isActive ? "#1E3A8A" : "rgba(26,26,46,0.80)";
              const color = isVerified
                ? VERIFIED_GREEN
                : baseColor;

              // Arc indent — active item sits furthest right, items above
              // and below curve back to the left forming a "(" shape
              const arcX     = interpolate(absDist, [0, 0.5, 1.5, 3], [44, 38, 24, 0], clamp);

              // Checkmark: springs in as the item becomes verified, stays
              // visible afterwards.
              const checkScale = interpolate(verifyT, [0, 1], [0.4, 1], clamp);
              const checkOp    = verifyT;

              return (
                <div key={label} style={{
                  position: "absolute",
                  left: arcX,
                  top: yPos,
                  transform: "translateY(-50%)",
                  opacity: itemOp,
                  pointerEvents: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}>
                  <span style={{
                    fontFamily: geistFont,
                    fontSize,
                    fontWeight: isActive || isVerified ? 700 : 400,
                    color,
                    letterSpacing: isActive ? "-0.020em" : "-0.012em",
                    whiteSpace: "nowrap",
                    transition: "color 160ms ease-out",
                  }}>{label}</span>
                  {checkOp > 0.01 && (
                    <svg
                      width={Math.round(fontSize * 0.72)}
                      height={Math.round(fontSize * 0.72)}
                      viewBox="0 0 24 24"
                      style={{
                        opacity: checkOp,
                        transform: `scale(${checkScale})`,
                        transformOrigin: "center",
                        flexShrink: 0,
                      }}
                    >
                      <circle cx="12" cy="12" r="11" fill={VERIFIED_GREEN} opacity="0.14" />
                      <circle cx="12" cy="12" r="11" fill="none" stroke={VERIFIED_GREEN} strokeWidth="1.6" opacity="0.55" />
                      <path
                        d="M6.5 12.5 L10.5 16.5 L17.5 8.5"
                        fill="none"
                        stroke={VERIFIED_GREEN}
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Main Scene ─────────────────────────────────────────────────────── */
export const SceneFormProfile: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Determine current question & whether we're in the REG phase
  const inRegPhase = frame >= REG_START && frame < REG_END;
  const currentQ = inRegPhase
    ? QUESTIONS.length - 1 // still on the last question conceptually
    : Math.min(QUESTIONS.length - 1, Math.floor(frame / SLOT_DUR));

  // Gradient crossfade
  const bgEnterT = spring({ frame, fps, config: { stiffness: 60, damping: 30 } });

  // Progress bar — linear on total scene length (Q0 slot + REG + 5 remaining slots)
  const TOTAL_DUR = SLOT_DUR + REG_ANALYZE_DUR + (QUESTIONS.length - 1) * SLOT_DUR;
  const progressPct = Math.min(100, (frame / TOTAL_DUR) * 100);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* ── Dynamic animated background ── */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "#F0F3FF" }} />

      <div style={{
        position: "absolute",
        width: 900, height: 700, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,91,219,0.18) 0%, transparent 70%)",
        left: interpolate(frame, [0, 300], [-120, 60]),
        top:  interpolate(frame, [0, 300], [-160, -80]),
        filter: "blur(60px)",
      }} />

      <div style={{
        position: "absolute",
        width: 800, height: 800, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(107,142,255,0.15) 0%, transparent 65%)",
        right: interpolate(frame, [0, 300], [-200, -80]),
        top:   interpolate(frame, [0, 300], [100, 260]),
        filter: "blur(70px)",
      }} />

      <div style={{
        position: "absolute",
        width: 700, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(165,184,255,0.20) 0%, transparent 65%)",
        left:   interpolate(frame, [0, 300], [200, 400]),
        bottom: interpolate(frame, [0, 300], [-180, -100]),
        filter: "blur(55px)",
      }} />

      <div style={{
        position: "absolute",
        width: 600, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,91,219,0.07) 0%, transparent 60%)",
        left: interpolate(frame, [0, 300], [500, 640]),
        top:  interpolate(frame, [0, 300], [150, 80]),
        filter: "blur(80px)",
      }} />

      {/* Per-question tint layer — only the current question's tint shows
          (previous ones fade out so tints don't accumulate) */}
      {QUESTIONS.map((_, i) => {
        const { qStart, qEnd } = getSlotBounds(i);
        if (frame < qStart - 20 || frame > qEnd + 40) return null;
        const inT  = interpolate(frame, [qStart - 10, qStart + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const outT = interpolate(frame, [qEnd - 4, qEnd + 20], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const tints = [
          "rgba(59,91,219,0.06)",  // Q1 Industry
          "rgba(91,156,248,0.06)", // Q2 Challenge
          "rgba(59,91,219,0.05)",  // Q3 Team
          "rgba(91,156,248,0.07)", // Q4 Tools
          "rgba(59,91,219,0.06)",  // Q5 Goal
          "rgba(91,156,248,0.05)", // Q6 Regulatory
        ];
        return (
          <div key={i} style={{
            position: "absolute", inset: 0,
            backgroundColor: tints[i],
            opacity: inT * outT,
          }} />
        );
      })}

      {/* Subtle noise texture overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
        backgroundSize: "200px",
        pointerEvents: "none",
      }} />

      {/* Question slides */}
      {QUESTIONS.map((q, i) => {
        const { qStart, qEnd } = getSlotBounds(i);
        const visible  = frame >= qStart && frame < qEnd + 20;
        if (!visible) return null;
        return (
          <QuestionSlide key={i} q={q} localFrame={frame - qStart} />
        );
      })}

      {/* "Analyzing…" intro before every question */}
      {QUESTIONS.map((_, i) => {
        const { aStart } = getSlotBounds(i);
        const aEnd = aStart + ANALYZE_DUR;
        if (frame < aStart || frame >= aEnd) return null;
        return (
          <AnalyzingPhase
            key={`a${i}`}
            localFrame={frame - aStart}
            globalFrame={frame}
            phrase={ANALYZING_PHRASES[i]}
            seamlessIn={i === 0}
          />
        );
      })}

      {/* Regulatory analyzing + list (after Europe selected in Q1) */}
      {inRegPhase && (
        <RegulatoryAnalyzingPhase
          localFrame={frame - REG_START}
          globalFrame={frame}
        />
      )}

      {/* Bottom progress bar */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
        backgroundColor: "rgba(59,91,219,0.08)",
        opacity: interpolate(bgEnterT, [0,1], [0,1]),
      }}>
        <div style={{
          height: "100%",
          width: `${progressPct}%`,
          background: "linear-gradient(90deg, #8B6FF0, #5B9CF8)",
          borderRadius: "0 2px 2px 0",
        }} />
      </div>

      {/* Step dots bottom center */}
      <div style={{
        position: "absolute", bottom: 28, left: 0, right: 0,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        opacity: interpolate(bgEnterT, [0,1], [0,1]),
      }}>
        {QUESTIONS.map((_, i) => (
          <div key={i} style={{
            width: i === currentQ ? 24 : 7,
            height: 7, borderRadius: 4,
            backgroundColor: i <= currentQ ? "#3B5BDB" : "rgba(59,91,219,0.18)",
            transition: "all 0.4s ease",
          }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
