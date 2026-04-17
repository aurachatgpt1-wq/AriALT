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
import { geistFont, ARIA_COLORS } from "../constants";
import { WindRing3D } from "../components/WindRing3D";

// ─── Particles — each assigned to a card, form a sphere that opens wide ─────
const mulberry32 = (a: number) => () => {
  a = (a + 0x6D2B79F5) | 0;
  let t = a;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const PARTICLES_PER_CARD = 29;
const NEURAL_COUNT = 9 * PARTICLES_PER_CARD; // 261 — matches 9 tool cards
const NEURAL_NODES = (() => {
  const rng = mulberry32(42);
  const nodes: {
    theta: number; phi: number; pulsePhase: number; size: number; cardIndex: number;
    burstX: number; burstY: number; driftPhase: number;
  }[] = [];
  for (let i = 0; i < NEURAL_COUNT; i++) {
    const idx = i + 0.5;
    const phi = Math.acos(1 - 2 * idx / NEURAL_COUNT);
    const theta = Math.PI * (1 + Math.sqrt(5)) * idx;
    nodes.push({
      theta,
      phi,
      pulsePhase: rng() * Math.PI * 2,
      size: 1.6 + rng() * 1.4,
      cardIndex: Math.floor(i / PARTICLES_PER_CARD),
      // Burst offset when breaking out of the card (radial explosion)
      burstX: (rng() - 0.5) * 260,
      burstY: (rng() - 0.5) * 30,
      driftPhase: rng() * Math.PI * 2,
    });
  }
  return nodes;
})();
const NEURAL_CONNECT_DIST = 130;
const CENTER_X = 960;
const CENTER_Y = 540;
// Sphere radii
const SPHERE_R_TIGHT = 120;
const SPHERE_R_OPEN  = 380;   // initial open state — moderate size
const SPHERE_R_FINAL = 500;   // grown: reaches near top/bottom edges leaving ~40px air

// ─── Items ────────────────────────────────────────────────────────────────────
const ITEMS = [
  "Orchestrating smart matchmaking",   // 7 — pre-checked
  "Setting up your AI tool suites",    // 8 — expands sub-list
  "Finalizing your agents",            // 9
  "AriA is ready",                     // 10
];
const NUMBER_OFFSET = 6;
const ITEM_8_INDEX = 1;

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconBase: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const FolderIcon = () => <IconBase><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></IconBase>;
const CodeIcon   = () => <IconBase><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></IconBase>;
const MCPIcon    = () => <IconBase><polygon points="12 2 15 8.5 22 9.3 17 14.5 18.2 22 12 18.3 5.8 22 7 14.5 2 9.3 9 8.5 12 2"/></IconBase>;
const FileIcon   = () => <IconBase><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></IconBase>;
const DocIcon    = () => <IconBase><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></IconBase>;
const IntentIcon = () => <IconBase><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></IconBase>;
const LinkIcon   = () => <IconBase><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></IconBase>;
const CubeIcon   = () => <IconBase><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></IconBase>;
const PlugIcon   = () => <IconBase><path d="M18 2v6"/><path d="M6 2v6"/><path d="M2 8h20v3a6 6 0 0 1-12 0"/><path d="M10 14v4a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v-4"/></IconBase>;
const WrenchIcon = () => <IconBase><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></IconBase>;
const MapIcon    = () => <IconBase><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></IconBase>;
const ChartIcon  = () => <IconBase><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></IconBase>;

// ─── Skills pills (appear after card splits) ─────────────────────────────────
const SKILLS = [
  { label: "Autonomous Troubleshooting" },
  { label: "Automation & Rules" },
  { label: "Work Order Generation" },
  { label: "What-if Analysis" },
  { label: "Production Forecasting" },
  { label: "E2E Strategy" },
  { label: "100+" },
];

// ─── Sub-list for item 8 ──────────────────────────────────────────────────────
const TOOL_SUITES = [
  { label: "Parsing your content library",         Icon: DocIcon },
  { label: "Creating plant digital twin",          Icon: CubeIcon },
  { label: "Wiring IoT connections",               Icon: PlugIcon },
  { label: "Crafting your Platform",               Icon: CodeIcon },
  { label: "Generating maintenance agents",        Icon: WrenchIcon },
  { label: "Attaching AI diagnostic tools",        Icon: MCPIcon },
  { label: "Mapping operational scenarios",        Icon: MapIcon },
  { label: "Forecasting operational scenarios",    Icon: ChartIcon },
  { label: "Attaching skill to agent",             Icon: LinkIcon },
];

// ─── Timing ───────────────────────────────────────────────────────────────────
const T_LIST_IN          = 10;
const T_ITEM_7_CHECK     = 20;
const T_ITEM_8_FOCUS     = 40;
const T_SUBLIST_IN       = 55;

// Per-card timeline (relative to card's start)
const CARD_ENTER_DUR   = 14;   // slide+rotate+scale in
const CARD_LABEL_IN    = 6;    // label starts (shimmer writing)
const CARD_SHIMMER_DUR = 22;   // shimmer sweep duration
const CARD_CREATED_AT  = 26;   // "Created" badge pops in
const SUBLIST_STAGGER  = 18;   // base linear gap (used for height growth only)
const CASCADE_TOTAL_DUR = 150; // longer total — more breathing room for fluidity
// Soft parabolic acceleration: gentler curve (power 1.4 vs 2) so gaps shrink
// gradually, creating a flowing rhythm instead of a snappy one.
const cascadeOffset = (i: number): number => {
  const N = TOOL_SUITES.length;
  if (N <= 1) return 0;
  const p = i / (N - 1);                       // 0 → 1
  const eased = 1 - Math.pow(1 - p, 1.4);      // gentle easeOutPower
  return Math.round(CASCADE_TOTAL_DUR * eased);
};

const T_SUBLIST_LAST   = T_SUBLIST_IN + cascadeOffset(TOOL_SUITES.length - 1);
const T_SUBLIST_DONE   = T_SUBLIST_LAST + CARD_CREATED_AT + 8;

// ── FOCUS PHASE: at frame 226 (1:47.06 absolute), everything transitions
//    to a single centered hero card "Creating skills..". This is the
//    arrival/hero moment before the scene closes.
const T_FOCUS_START    = 226;
const T_FOCUS_ARRIVE   = T_FOCUS_START + 62;   // 288 — hero card fully in place
const T_FOCUS_HOLD_END = T_FOCUS_ARRIVE + 580; // 868 — hero "AriA is ready" hold ends
const T_FADE_OUT_START = T_FOCUS_HOLD_END;     // 868 — scene fade-out begins
const T_FADE_OUT_END   = T_FADE_OUT_START + 22; // 890 — scene ends

// Keep old milestones referenced below (items 8/9/10) but offset so they
// don't fight with the focus phase — they stay dormant.
const T_ITEM_8_CHECK   = T_FOCUS_HOLD_END + 999;
const T_ITEM_9_CHECK   = T_ITEM_8_CHECK + 999;
const T_ITEM_10_FOCUS  = T_ITEM_9_CHECK + 999;

// ─── Layout ───────────────────────────────────────────────────────────────────
const LEFT       = 440;
const TOP        = 120;
const BULLET_W   = 56;
const BULLET_GAP = 24;
const ROW_H      = 92;

// Sub-list cards stack below item 8
const SUB_CARD_W    = 660;
const SUB_CARD_H    = 54;
const SUB_GAP       = 10;
const SUB_LIST_LEFT = LEFT + BULLET_W + BULLET_GAP + 6;
const SUB_LIST_TOP  = TOP + (ITEM_8_INDEX + 1) * ROW_H - 4;

// ─── Blue shimmer sweep ──────────────────────────────────────────────────────
const getShimmerStyle = (localFrame: number, sweepDur = 24, cyclic = false): React.CSSProperties => {
  const f = Math.max(0, localFrame);
  let pos;
  if (cyclic) {
    const cycleDur = sweepDur + 40; // with a short pause between sweeps
    const phase = ((f % cycleDur) + cycleDur) % cycleDur;
    pos = phase < sweepDur ? 100 - (phase / sweepDur) * 100 : 0;
  } else {
    const phase = Math.min(f, sweepDur);
    pos = 100 - (phase / sweepDur) * 100;
  }
  return {
    backgroundColor: "#1A1F33",
    backgroundImage:
      "linear-gradient(100deg, " +
      "#1A1F33 0%, #1A1F33 38%, " +
      "rgba(120,150,255,1) 46%, #ffffff 50%, rgba(120,150,255,1) 54%, " +
      "#1A1F33 62%, #1A1F33 100%)",
    backgroundSize: "250% 100%",
    backgroundPosition: `${pos}% 0%`,
    backgroundRepeat: "no-repeat",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent",
  };
};

// ─── Tool Card — dynamic 3D entrance + shimmer + created pop ─────────────────
const ToolCard: React.FC<{
  label: string;
  Icon: React.FC;
  localFrame: number;
  listIndex: number;
  fps: number;
  // Liquid collapse: 0 = normal position, 1 = fully merged blob at center
  collapseT?: number;
  collapseTargetX?: number;
  collapseTargetY?: number;
  collapseCount?: number;
}> = ({ label, Icon, localFrame, listIndex, fps, collapseT = 0, collapseTargetX = 960, collapseTargetY = 540, collapseCount = 8 }) => {
  const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

  // ── ENTRANCE: smooth spring slide — softer for fluid feel, no harsh overshoot
  const enterSp = spring({
    frame: localFrame, fps,
    config: { stiffness: 120, damping: 22, mass: 0.95 },  // smoother, more damped
  });
  const opacity   = interpolate(enterSp, [0, 0.4, 1], [0, 1, 1], clamp);
  const slideX    = interpolate(enterSp, [0, 1], [120, 0], clamp);   // shorter slide
  const tiltY     = interpolate(enterSp, [0, 1], [-22, 0], clamp);   // milder tilt
  const scale     = interpolate(enterSp, [0, 1], [0.85, 1], clamp);  // less aggressive scale

  // ── Icon pulse on arrival — softer, more graceful
  const iconPulseSp = spring({
    frame: localFrame - (CARD_ENTER_DUR - 4), fps,
    config: { stiffness: 200, damping: 20, mass: 0.7 },
  });
  const iconScale = interpolate(iconPulseSp, [0, 0.6, 1], [0.7, 1.1, 1], clamp);
  const iconOp    = interpolate(iconPulseSp, [0, 1], [0, 1], clamp);

  // ── Label shimmer writing ──
  const shimmerActive = localFrame >= CARD_LABEL_IN && localFrame < CARD_LABEL_IN + CARD_SHIMMER_DUR;
  const shimmerFrame  = localFrame - CARD_LABEL_IN;
  const labelOp       = interpolate(localFrame, [CARD_LABEL_IN - 2, CARD_LABEL_IN + 6], [0, 1], clamp);

  // ── Blue glow ring during processing (pulses then fades) ──
  const glowT = interpolate(localFrame,
    [CARD_LABEL_IN, CARD_LABEL_IN + 8, CARD_CREATED_AT - 2, CARD_CREATED_AT + 4],
    [0, 1, 1, 0], clamp);

  // ── "Created" badge pops in with spring bounce ──
  const createdSp = spring({
    frame: localFrame - CARD_CREATED_AT, fps,
    config: { stiffness: 300, damping: 14, mass: 0.55 },
  });
  const createdOp    = interpolate(createdSp, [0, 1], [0, 1], clamp);
  const createdScale = interpolate(createdSp, [0, 0.6, 1], [0.3, 1.25, 1], clamp);

  // ── Left accent bar slides in ──
  const barH = interpolate(localFrame, [CARD_ENTER_DUR - 4, CARD_ENTER_DUR + 4], [0, 100], clamp);

  const y = SUB_LIST_TOP + listIndex * (SUB_CARD_H + SUB_GAP);

  // ── CLEAN DISSOLVE COLLAPSE: cards fade + slide toward center ──
  const cT = Math.max(0, Math.min(1, collapseT));
  const cardCenterX = SUB_LIST_LEFT + SUB_CARD_W / 2;
  const cardCenterY = y + SUB_CARD_H / 2;

  // Slight translate toward center (subtle gather)
  const dx = (collapseTargetX - cardCenterX) * cT * 0.35;
  const dy = (collapseTargetY - cardCenterY) * cT * 0.35;

  // Gentle scale down + fade — clean and elegant
  const collapseScale = interpolate(cT, [0, 1], [1, 0.85]);
  const collapseOp    = interpolate(cT, [0, 0.6, 1], [1, 0.6, 0]);
  const collapseBlur  = interpolate(cT, [0, 1], [0, 6]);
  // Keep content intact, no morph
  const contentOp = 1;

  return (
    <div style={{
      position: "absolute",
      left: SUB_LIST_LEFT,
      top: y,
      width: SUB_CARD_W,
      height: SUB_CARD_H,
      perspective: 800,
      opacity: opacity * collapseOp,
      transform: `translate(${dx}px, ${dy}px)`,
      filter: `blur(${collapseBlur}px)`,
      willChange: "transform, opacity, filter",
    }}>
      <div style={{
        width: "100%",
        height: "100%",
        transform: `translateX(${slideX}px) rotateY(${tiltY}deg) scale(${scale * collapseScale})`,
        transformOrigin: "left center",
        backgroundColor: "rgba(255,255,255,0.94)",
        borderRadius: 12,
        border: "1px solid rgba(214,217,227,0.6)",
        boxShadow:
          `0 2px 10px rgba(0,0,0,0.04), ` +
          `0 0 0 ${1.5 * glowT}px rgba(59,91,219,${0.35 * glowT}), ` +
          `0 0 ${24 * glowT}px rgba(59,91,219,${0.30 * glowT})`,
        display: "flex",
        alignItems: "center",
        gap: 14,
        paddingLeft: 20,
        paddingRight: 18,
        overflow: "hidden",
        position: "relative",
      }}>
        {/* Left accent bar */}
        <div style={{
          position: "absolute",
          left: 0, top: 0, bottom: 0,
          width: 3,
          backgroundColor: ARIA_COLORS.primary,
          height: `${barH}%`,
          opacity: 0.7 * contentOp,
          transition: "none",
        }} />

        {/* Icon */}
        <div style={{
          color: ARIA_COLORS.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: iconOp * contentOp,
          transform: `scale(${iconScale})`,
        }}>
          <Icon />
        </div>

        {/* Label */}
        <span style={{
          flex: 1,
          fontFamily: geistFont,
          fontSize: 18,
          fontWeight: 500,
          color: ARIA_COLORS.foreground,
          letterSpacing: "-0.01em",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          opacity: labelOp * contentOp,
          ...(shimmerActive ? getShimmerStyle(shimmerFrame, CARD_SHIMMER_DUR) : {}),
        }}>
          {label}
        </span>

        {/* Created badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          opacity: createdOp * contentOp,
          transform: `scale(${createdScale})`,
          flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#1FA870" />
            <path d="M7 12.5l3.5 3.5L17 9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span style={{ fontFamily: geistFont, fontSize: 14, fontWeight: 600, color: ARIA_COLORS.success }}>
            Created
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────
export const SceneExecutingPlan2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
  const sceneOp = interpolate(frame, [T_FADE_OUT_START, T_FADE_OUT_END], [1, 0], clamp);

  const listSp = spring({
    frame: frame - T_LIST_IN, fps,
    config: { stiffness: 180, damping: 22, mass: 0.8 },
  });
  const listOp = interpolate(listSp, [0, 1], [0, 1], clamp);

  const t = frame / fps;
  const blobBreathe = 1 + Math.sin(t * 3.2) * 0.08;
  // Reveal-phase: bigger checklist + blob aligned with bullet column
  // (computed inline as `frame >= 628` since isInRevealPhase isn't declared yet here)
  const _isReveal_local = frame >= 628;
  const REV_BULLET_W = _isReveal_local ? 84 : BULLET_W;
  const REV_BULLET_GAP = _isReveal_local ? 36 : BULLET_GAP;
  const REV_ROW_H = _isReveal_local ? 138 : ROW_H;
  const REV_FONT_SIZE = _isReveal_local ? 60 : 36;
  const REV_TOP = _isReveal_local ? 220 : TOP;
  const HEADER_BLOB_SIZE = _isReveal_local ? 70 : 52;
  // Header blob center aligns with the bullets column (vertical line)
  const HEADER_LEFT = LEFT + REV_BULLET_W / 2 - HEADER_BLOB_SIZE / 2;
  const HEADER_TOP  = _isReveal_local ? 110 : 60;
  const dotCount = Math.floor(frame / 7) % 4;

  // Sub-list height grows as cards arrive — count uses parabolic offsets
  let visibleCards = 0;
  for (let i = 0; i < TOOL_SUITES.length; i++) {
    if (frame >= T_SUBLIST_IN + cascadeOffset(i)) visibleCards++;
  }
  const subHeightT = spring({
    frame: frame - T_SUBLIST_IN, fps,
    config: { stiffness: 120, damping: 22, mass: 0.9 },
  });
  const subListHeight = visibleCards * (SUB_CARD_H + SUB_GAP) * interpolate(subHeightT, [0, 1], [0, 1], clamp);
  const subListFadeOut = interpolate(frame, [T_ITEM_8_CHECK, T_ITEM_8_CHECK + 18], [1, 0], clamp);
  // pushY: when drag-down starts (frame >= 628), items 9, 10 immediately
  // return to their normal positions so all items slide in together as a unit.
  const pushY = frame >= 628 ? 0 : subListHeight * subListFadeOut;

  // ── FOCUS PHASE: cards shatter → particles form LARGE sphere directly → hero ─
  // Phase A (226 → 240): cards shatter — particles burst from each card.
  // Phase B (232 → 270): UI fades out while particles fly DIRECTLY to the
  //   large sphere formation (overlaps with shatter).
  // Phase C (270 → 350): hero "Creating skills.." emerges at the empty center.
  const T_SHATTER_START = T_FOCUS_START;          // 226
  const T_SHATTER_END   = T_FOCUS_START + 14;     // 240
  const T_FLY_START     = T_FOCUS_START + 6;      // 232 — particles start flying toward sphere
  const T_FLY_END       = T_FOCUS_START + 50;     // 276 — particles arrived at large sphere
  const T_UI_GONE       = T_FOCUS_START + 44;     // 270
  const T_HERO_EMERGE   = T_FOCUS_START + 50;     // 276 — hero appears as sphere is fully formed
  // Transformation kicks in at local frame 340 (= 1:51.00 absolute).
  const T_GROW_START    = 340;
  const T_GROW_END      = T_GROW_START + 40;      // 380 — fully grown
  // Card splits AT THE EXACT SAME MOMENT the sphere opens. Pills burst
  // from center simultaneously for impactful, synchronized feel.
  const T_CARD_SPLIT    = T_GROW_START;            // 340 — same moment
  const T_PILLS_START   = T_GROW_START;            // 340 — ALL pills burst simultaneously
  const T_PILLS_STAGGER = 0;                       // NO stagger — explosion = all together
  const T_SKILLS_TITLE  = T_GROW_START + 8;        // 348 — title fades in right after
  // Mega zoom on "100+" pill (last skill, index 6)
  const T_ZOOM100_START = 470;                      // ~3.5s after pills appear
  const T_ZOOM100_END   = T_ZOOM100_START + 35;    // 505 — fully zoomed
  const SKILL_100_INDEX = 6;                       // index of "100+" in SKILLS

  // Fingerprint rises + pill flips horizontally to reveal text
  const T_FINGER_START   = T_ZOOM100_END + 25;       // 530 — fingerprint starts rising
  const T_FINGER_REACH   = T_FINGER_START + 60;      // 590 — fully behind pill at center
  const T_PILL_FLIP_START = 543;                     // 00:18.03 — exact frame requested
  const T_PILL_FLIP_END   = T_PILL_FLIP_START + 35;  // 578 — flip complete
  const T_REVEAL_HOLD_END = T_PILL_FLIP_END + 100;   // 700 — hold the reveal

  // Drag-down transition: dark scene slides DOWN dragging fingerprint+pill.
  // Hold = ~1.7s (50 frames) after flip completes.
  const T_DRAG_START = T_PILL_FLIP_END + 50;          // 628 — 1.67s after flip ends
  const T_DRAG_END   = T_DRAG_START + 50;             // 678
  // After reveal completes, items 8 then 9 check off quickly one at a time.
  // Item 10 ("AriA is ready") stays pending — it's the final state.
  const T_ITEM_8_DONE  = T_DRAG_END + 12;             // 690 — ~0.4s after drag ends
  const T_ITEM_9_DONE  = T_ITEM_8_DONE + 16;          // 706 — ~0.53s gap
  const T_ITEM_10_DONE = Infinity;                    // never checks

  const itemCompleteFrames = [T_ITEM_7_CHECK, T_ITEM_8_DONE, T_ITEM_9_DONE, T_ITEM_10_DONE];

  // ── ARIA HERO TRANSITION — SNAPPY but smooth ──
  // Fast zoom with a slightly softer settle (no abrupt stop).
  const T_OTHERS_FADE_START = T_ITEM_9_DONE + 8;      // 714
  const T_OTHERS_FADE_END   = T_OTHERS_FADE_START + 6; // 720 — fast fade
  const T_ARIA_ZOOM_START = T_OTHERS_FADE_END;        // 720
  const T_ARIA_ZOOM_END   = T_ARIA_ZOOM_START + 14;   // 734 — quick + smooth settle
  const T_BG_BLACK_START  = T_ARIA_ZOOM_START;        // 720
  const T_BG_BLACK_END    = T_ARIA_ZOOM_START + 12;   // 732
  const T_TEXT_WHITE_START = T_ARIA_ZOOM_START + 2;   // 722
  const T_TEXT_WHITE_END   = T_ARIA_ZOOM_START + 14;  // 734
  const T_ARIA_HERO_FULL  = T_ARIA_ZOOM_END;          // 734

  const shatterT = interpolate(frame, [T_SHATTER_START, T_SHATTER_END], [0, 1], clamp);
  const uiFadeT  = interpolate(frame, [T_SHATTER_START + 2, T_UI_GONE], [0, 1], clamp);
  const flyT     = interpolate(frame, [T_FLY_START, T_FLY_END], [0, 1], clamp);
  // Grow progress (0 = OPEN size, 1 = FINAL reference size)
  const growSp = spring({
    frame: frame - T_GROW_START, fps,
    config: { stiffness: 70, damping: 24, mass: 1.3 },
  });
  const growT = interpolate(growSp, [0, 1], [0, 1], clamp);

  // Ease (easeInOutCubic)
  const flyE = flyT < 0.5 ? 4 * flyT * flyT * flyT : 1 - Math.pow(-2 * flyT + 2, 3) / 2;

  // Sphere is always LARGE — no tight intermediate
  const openT = 1;

  const globalCollapseT = shatterT;
  const nonHeroFade = interpolate(uiFadeT, [0, 1], [1, 0], clamp);
  const dropletT = 0;

  // Hero card emerges from droplet
  const heroEnterSp = spring({
    frame: frame - T_HERO_EMERGE, fps,
    config: { stiffness: 110, damping: 18, mass: 0.85 },
  });
  const heroT = interpolate(heroEnterSp, [0, 1], [0, 1], clamp);
  const heroActive = frame >= T_HERO_EMERGE - 2;
  const heroFadeOut = interpolate(frame, [T_FOCUS_HOLD_END, T_FADE_OUT_END], [1, 0], clamp);

  // Card split: hero card dissolves AS the pills burst out (perfectly synced)
  const cardSplitT = interpolate(frame, [T_CARD_SPLIT, T_CARD_SPLIT + 8], [0, 1], clamp);
  const cardAliveFade = 1 - cardSplitT;
  // Skills panel visible once pills start bursting
  const skillsPanelActive = frame >= T_PILLS_START - 4;
  const titleSp = spring({
    frame: frame - T_SKILLS_TITLE, fps,
    config: { stiffness: 180, damping: 22, mass: 0.8 },
  });
  const titleOp = interpolate(titleSp, [0, 1], [0, 1], clamp);
  const titleY  = interpolate(titleSp, [0, 1], [14, 0], clamp);

  // Mega zoom on "100+" pill — eased over the duration
  const zoom100Sp = spring({
    frame: frame - T_ZOOM100_START, fps,
    config: { stiffness: 80, damping: 20, mass: 1.0 },
  });
  const zoom100T = interpolate(zoom100Sp, [0, 1], [0, 1], clamp);
  // Other pills (and title/sphere) fade out QUICKLY as zoom starts so 100+ takes the spotlight
  const zoomFadeOthers = interpolate(zoom100T, [0, 0.3], [1, 0], clamp);

  // Fingerprint rises from below screen → centered behind pill
  const fingerSp = spring({
    frame: frame - T_FINGER_START, fps,
    config: { stiffness: 60, damping: 22, mass: 1.2 },
  });
  const fingerT = interpolate(fingerSp, [0, 1], [0, 1], clamp);
  const fingerVisible = frame >= T_FINGER_START - 2;
  // Background snaps to AriA dark navy the instant the FLIP starts (immediate)
  const darkBgT = frame >= T_PILL_FLIP_START ? 1 : 0;
  // Y position: starts well below screen, ends so visible fingerprint top is near canvas top
  const fingerY = interpolate(fingerT, [0, 1], [2400, 510], clamp);

  // Pill horizontal flip — rotateY 0 → 180 degrees
  const flipSp = spring({
    frame: frame - T_PILL_FLIP_START, fps,
    config: { stiffness: 70, damping: 20, mass: 1.0 },
  });
  const flipT = interpolate(flipSp, [0, 1], [0, 1], clamp);
  const flipDeg = interpolate(flipT, [0, 1], [0, -180], clamp);

  // Drag-down: dark scene slides down, fresh checklist fades in below
  const dragSp = spring({
    frame: frame - T_DRAG_START, fps,
    config: { stiffness: 75, damping: 22, mass: 1.1 },
  });
  const dragT = interpolate(dragSp, [0, 1], [0, 1], clamp);
  const dragOffsetY = dragT * 1200;                   // push dark layer down by full screen + buffer
  // Checklist becomes FULLY visible the instant the drag starts — slides in opaque.
  // Force 1 immediately and ignore any other fading (item appear, list spring, etc.)
  const isInRevealPhase = frame >= T_DRAG_START;
  const checklistOp = isInRevealPhase ? 1 : nonHeroFade;
  // Slide the new checklist DOWN from above the viewport, synced with the drag
  const listSlideY = (dragT - 1) * 1080;              // -1080 → 0 as drag progresses

  // ── Transition values (snappy zoom-in) ──
  // Fade out items 7/8/9 + header/blob first
  const othersFadeT = interpolate(frame, [T_OTHERS_FADE_START, T_OTHERS_FADE_END], [1, 0], clamp);
  // Item 10 zoom: fast but with a smooth settle (higher damping, slightly
  // lower stiffness than pure snap — avoids abrupt stop while staying quick)
  const zoomInSp = spring({
    frame: frame - T_ARIA_ZOOM_START, fps,
    config: { stiffness: 180, damping: 28, mass: 0.7 },
  });
  const zoomInT = interpolate(zoomInSp, [0, 1], [0, 1], clamp);
  // Item 10 travels from its row position toward viewport center + scales up
  const ITEM10_DX = zoomInT * 205;
  const ITEM10_DY = zoomInT * -163;
  const ITEM10_SCALE = 1 + zoomInT * 1.13;  // 60px → ~128px visual
  // Background to black
  const bgBlackT = interpolate(frame, [T_BG_BLACK_START, T_BG_BLACK_END], [0, 1], clamp);
  // Text color: dark → white
  const textWhiteT = interpolate(frame, [T_TEXT_WHITE_START, T_TEXT_WHITE_END], [0, 1], clamp);
  const _txtR = Math.round(26 + (255 - 26) * textWhiteT);
  const _txtG = Math.round(31 + (255 - 31) * textWhiteT);
  const _txtB = Math.round(51 + (255 - 51) * textWhiteT);
  const ariaTextColor = `rgb(${_txtR}, ${_txtG}, ${_txtB})`;
  // Subtle Apple-keynote glow — just a whisper of light near the letters.
  // NB: text is at scale ~2.13× so declared blur is multiplied.
  const ariaTextFilter = textWhiteT > 0.05
    ? `drop-shadow(0 0 ${4 * textWhiteT}px rgba(255,255,255,${0.55 * textWhiteT})) ` +
      `drop-shadow(0 0 ${14 * textWhiteT}px rgba(255,255,255,${0.22 * textWhiteT}))`
    : undefined;
  // Subtle breathing after fully settled
  const heroBreathe = frame >= T_ARIA_HERO_FULL
    ? 1 + Math.sin((frame - T_ARIA_HERO_FULL) / 32) * 0.012
    : 1;
  const ariaMorphing = frame >= T_OTHERS_FADE_START;

  return (
    <AbsoluteFill style={{ opacity: sceneOp, overflow: "hidden" }}>
      {/* ── Background ── */}
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

      {/* ── White wash during hero phase (cleaner look for neural network) ── */}
      {globalCollapseT > 0.05 && !isInRevealPhase && (
        <div style={{
          position: "absolute", inset: 0,
          backgroundColor: "#FAFBFF",
          opacity: interpolate(globalCollapseT, [0, 1], [0, 0.75], clamp) * heroFadeOut,
          zIndex: 15,
          pointerEvents: "none",
        }} />
      )}

      {/* ── Header blob ── */}
      <div style={{
        position: "absolute",
        left: HEADER_LEFT,
        top:  HEADER_TOP,
        width: HEADER_BLOB_SIZE,
        height: HEADER_BLOB_SIZE,
        transform: `translateY(${dragT > 0 ? listSlideY : 0}px) scale(${blobBreathe})`,
        transformOrigin: "center",
        opacity: interpolate(frame, [0, 12], [0, 1], clamp) * checklistOp * othersFadeT,
        zIndex: 11,
      }}>
        <WindRing3D size={HEADER_BLOB_SIZE} frame={frame} fps={fps} />
      </div>
      <div style={{
        position: "absolute",
        left: HEADER_LEFT + HEADER_BLOB_SIZE + 14,
        top: HEADER_TOP,
        height: HEADER_BLOB_SIZE,
        display: "flex",
        alignItems: "center",
        opacity: interpolate(frame, [0, 14], [0, 1], clamp) * checklistOp * othersFadeT,
        fontFamily: geistFont,
        fontSize: _isReveal_local ? 44 : 30,
        fontWeight: 400,
        letterSpacing: "-0.02em",
        color: ARIA_COLORS.mutedFg,
        transform: dragT > 0 ? `translateY(${listSlideY}px)` : undefined,
      }}>
        Building your platform
        <span style={{ opacity: dotCount >= 1 ? 1 : 0 }}>.</span>
        <span style={{ opacity: dotCount >= 2 ? 1 : 0 }}>.</span>
        <span style={{ opacity: dotCount >= 3 ? 1 : 0 }}>.</span>
      </div>

      {/* ── Main checklist ── */}
      <div style={{
        position: "absolute",
        left: LEFT,
        top: REV_TOP,
        opacity: isInRevealPhase ? 1 : listOp * checklistOp,
        transform: dragT > 0 ? `translateY(${listSlideY}px)` : undefined,
        willChange: "transform, opacity",
        zIndex: 101,  // above the black wash so zoomed item 10 stays visible
      }}>
        {ITEMS.map((label, i) => {
          const completeFrame = itemCompleteFrames[i];
          const completeT = completeFrame !== Infinity ? spring({
            frame: frame - completeFrame, fps,
            config: { stiffness: 260, damping: 22, mass: 0.6 },
          }) : 0;
          const isCompleted = completeT > 0.05;
          const strikeW = interpolate(completeT, [0, 1], [0, 100], clamp);
          const circleFill = interpolate(completeT, [0, 1], [0, 1], clamp);

          const appearSp = spring({
            frame: frame - (T_LIST_IN + 2 + i * 3), fps,
            config: { stiffness: 220, damping: 22, mass: 0.7 },
          });
          const itemOp = interpolate(appearSp, [0, 1], [0, 1], clamp);
          const itemX  = interpolate(appearSp, [0, 1], [-12, 0], clamp);

          const isItem8Focus = i === ITEM_8_INDEX && frame >= T_ITEM_8_FOCUS && frame < T_ITEM_8_CHECK;
          const isItem10Focus = i === 3 && frame >= T_ITEM_10_FOCUS;
          const shimmerActive = isItem8Focus || isItem10Focus;
          const shimmerFrame = isItem8Focus ? frame - T_ITEM_8_FOCUS : frame - T_ITEM_10_FOCUS;

          const pushDownY = i > ITEM_8_INDEX ? pushY : 0;

          // Item 10 ("AriA is ready") becomes hero: stays on top with z-index,
          // its text element below gets a transform. Items 7/8/9 fade out first.
          // The hero stays visible through the scene fade-out (sceneOp handles it).
          const isAriaItem = i === 3;
          const rowOpacity = isAriaItem
            ? 1
            : (isInRevealPhase ? 1 : itemOp) * othersFadeT;

          return (
            <div key={label} style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: REV_BULLET_GAP,
              height: REV_ROW_H,
              opacity: rowOpacity,
              transform: `translate(${itemX}px, ${pushDownY}px)`,
              willChange: "transform, opacity",
              zIndex: isAriaItem ? 101 : 1,
            }}>
              <div style={{
                width: REV_BULLET_W, height: REV_BULLET_W,
                borderRadius: "50%",
                flexShrink: 0,
                position: "relative",
                border: isCompleted ? "none" : `2px solid rgba(154,160,176,0.45)`,
                backgroundColor: `rgba(31,168,112,${circleFill})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: isAriaItem ? (1 - zoomInT) : 1,
              }}>
                <span style={{
                  position: "absolute",
                  fontFamily: geistFont,
                  fontSize: _isReveal_local ? 28 : 20,
                  fontWeight: 500,
                  color: "rgba(154,160,176,0.75)",
                  opacity: 1 - circleFill,
                }}>
                  {i + 1 + NUMBER_OFFSET}
                </span>
                <svg viewBox="0 0 24 24" width={_isReveal_local ? 40 : 28} height={_isReveal_local ? 40 : 28} style={{ opacity: circleFill, position: "absolute" }}>
                  <path d="M5 12.5l4.5 4.5L19 7" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </div>

              <div style={{
                position: "relative",
                fontFamily: geistFont,
                fontSize: REV_FONT_SIZE,
                fontWeight: isAriaItem && zoomInT > 0.5 ? 700 : 500,
                letterSpacing: isAriaItem
                  ? `${-0.015 + (-0.02) * zoomInT}em`
                  : "-0.015em",
                color: isAriaItem ? ariaTextColor : ARIA_COLORS.foreground,
                whiteSpace: "nowrap",
                transform: isAriaItem
                  ? `translate(${ITEM10_DX}px, ${ITEM10_DY}px) scale(${ITEM10_SCALE * heroBreathe})`
                  : undefined,
                transformOrigin: "center center",
                filter: isAriaItem ? ariaTextFilter : undefined,
                willChange: isAriaItem ? "transform, color, filter" : undefined,
                ...(shimmerActive ? {
                  ...getShimmerStyle(shimmerFrame, 80),
                } : {}),
              }}>
                {label}
                <div style={{
                  position: "absolute",
                  left: 0, top: "50%",
                  height: _isReveal_local ? 3.5 : 2.5,
                  width: `${strikeW}%`,
                  backgroundColor: ARIA_COLORS.foreground,
                  opacity: 0.6,
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Iridescent halos (pink/purple/blue) at left & right edges ── */}
      {globalCollapseT > 0.05 && (() => {
        // Base opacity from initial phase, boosted significantly during grow phase
        const baseOp = interpolate(globalCollapseT, [0, 0.6, 1], [0, 0.7, 0.9], clamp);
        const boost  = 1 + growT * 0.6;  // up to 60% stronger when fully grown
        const haloOp = baseOp * boost * heroFadeOut * zoomFadeOthers;
        // Halos also grow in size during the grow phase
        const sizeBoost = 1 + growT * 0.3;
        return (
          <>
            {/* LEFT halo — BLUE/CYAN (matches reference) */}
            <div style={{
              position: "absolute",
              left: interpolate(growT, [0, 1], [-200, -240]),
              top: 540 - (500 * sizeBoost),
              width: 800 * sizeBoost,
              height: 1000 * sizeBoost,
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse at center, " +
                `rgba(130,190,255,${0.45 + growT * 0.15}) 0%, ` +
                `rgba(150,200,250,${0.32 + growT * 0.10}) 30%, ` +
                `rgba(170,210,245,${0.18 + growT * 0.05}) 55%, ` +
                "transparent 80%)",
              filter: "blur(60px)",
              opacity: haloOp,
              zIndex: 20,
              pointerEvents: "none",
            }} />
            {/* RIGHT halo — PINK/MAGENTA (matches reference) */}
            <div style={{
              position: "absolute",
              right: interpolate(growT, [0, 1], [-200, -240]),
              top: 540 - (500 * sizeBoost),
              width: 800 * sizeBoost,
              height: 1000 * sizeBoost,
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse at center, " +
                `rgba(255,180,220,${0.45 + growT * 0.15}) 0%, ` +
                `rgba(240,175,230,${0.33 + growT * 0.10}) 32%, ` +
                `rgba(225,180,240,${0.18 + growT * 0.05}) 58%, ` +
                "transparent 80%)",
              filter: "blur(60px)",
              opacity: haloOp,
              zIndex: 20,
              pointerEvents: "none",
            }} />
          </>
        );
      })()}

      {/* ── PARTICLES — shatter from cards, float, fly to sphere, then open ── */}
      {shatterT > 0.02 && (() => {
        const time = frame / fps;
        const rotY = time * 0.22;
        const rotX = Math.sin(time * 0.15) * 0.25;

        // Current sphere radius: tight → open → final (grows to near screen edge)
        const openRadius = SPHERE_R_TIGHT + (SPHERE_R_OPEN - SPHERE_R_TIGHT) * openT;
        const currentSphereR = openRadius + (SPHERE_R_FINAL - openRadius) * growT;

        // Particles visible once shatter begins
        const particleOp = interpolate(shatterT, [0, 1], [0, 1], clamp) * heroFadeOut;

        // Card center positions (for particle origins)
        const cardCenterX = SUB_LIST_LEFT + SUB_CARD_W / 2;

        // Project spherical coords → 2D with rotation
        const nodes = NEURAL_NODES.map((n) => {
          const phi = isFinite(n.phi) ? n.phi : 0;
          const theta = isFinite(n.theta) ? n.theta : 0;
          const sx = Math.sin(phi) * Math.cos(theta);
          const sy = Math.sin(phi) * Math.sin(theta);
          const sz = Math.cos(phi);
          const x1 =  sx * Math.cos(rotY) + sz * Math.sin(rotY);
          const z1 = -sx * Math.sin(rotY) + sz * Math.cos(rotY);
          const y2 = sy * Math.cos(rotX) - z1 * Math.sin(rotX);
          const z2 = sy * Math.sin(rotX) + z1 * Math.cos(rotX);
          // Final sphere position
          const sphereX = CENTER_X + x1 * currentSphereR;
          const sphereY = CENTER_Y + y2 * currentSphereR;

          // Burst position: particle lives at its card center + burst offset
          const cardY = SUB_LIST_TOP + n.cardIndex * (SUB_CARD_H + SUB_GAP) + SUB_CARD_H / 2;
          // During shatter: burst grows from 0 to full offset (radial scatter)
          const burstGrowth = shatterT;
          const burstX = cardCenterX + n.burstX * burstGrowth;
          const burstY = cardY + n.burstY * burstGrowth;
          // Add slight organic drift while floating
          const drift = Math.sin(time * 1.2 + n.driftPhase) * 6 * (1 - flyE);
          const floatX = burstX + drift;
          const floatY = burstY + Math.cos(time * 1.0 + n.driftPhase) * 4 * (1 - flyE);

          // Interpolate floating position → sphere position based on flyE
          const x = floatX + (sphereX - floatX) * flyE;
          const y = floatY + (sphereY - floatY) * flyE;

          const depth = (z2 + 1) / 2;
          // Center-hole: only appears during the transformation phase (after 1:51).
          // Before grow starts, holeRadius is 0 so NO particles are hidden.
          const distFromCenter = Math.hypot(x - CENTER_X, y - CENTER_Y);
          const holeRadius = 280 * growT;      // 0 → 280 only as grow progresses
          const holeFalloff = 100;
          const holeFade = growT > 0.01
            ? interpolate(distFromCenter, [holeRadius, holeRadius + holeFalloff], [0, 1], clamp)
            : 1;
          return {
            x, y, z: z2,
            alphaNode: (0.35 + depth * 0.55) * holeFade,
            r: n.size * (0.7 + depth * 0.6),
            pulsePhase: n.pulsePhase,
            holeFade,
          };
        });

        // Connections fade in only once particles are nearly at sphere
        const connOp = interpolate(flyT, [0.7, 1], [0, 1], clamp);
        const conns: { x1:number; y1:number; x2:number; y2:number; op:number }[] = [];
        if (connOp > 0.01) {
          for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
              const dx = nodes[i].x - nodes[j].x;
              const dy = nodes[i].y - nodes[j].y;
              const d = Math.sqrt(dx*dx + dy*dy);
              if (d < NEURAL_CONNECT_DIST) {
                // Only draw connection if BOTH endpoints are outside the hole
                const connFade = Math.min(nodes[i].holeFade, nodes[j].holeFade);
                if (connFade < 0.1) continue;
                const avgAlpha = (nodes[i].alphaNode + nodes[j].alphaNode) / 2;
                conns.push({
                  x1: nodes[i].x, y1: nodes[i].y,
                  x2: nodes[j].x, y2: nodes[j].y,
                  op: (1 - d / NEURAL_CONNECT_DIST) * avgAlpha * connOp * connFade,
                });
              }
            }
          }
        }

        return (
          <svg
            width="1920" height="1080"
            style={{
              position: "absolute",
              left: 0, top: 0,
              opacity: particleOp * zoomFadeOthers,
              zIndex: 22,
              pointerEvents: "none",
            }}
          >
            {/* Connections (dashed wireframe) */}
            {conns.map((c, idx) => {
              if (!isFinite(c.x1) || !isFinite(c.y1) || !isFinite(c.x2) || !isFinite(c.y2)) return null;
              return (
                <line
                  key={idx}
                  x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
                  stroke={`rgba(80,95,130,${c.op * 0.55})`}
                  strokeWidth={0.9}
                  strokeDasharray="3 4"
                />
              );
            })}
            {/* Nodes */}
            {nodes.map((n, idx) => {
              if (!isFinite(n.x) || !isFinite(n.y)) return null;
              const pulse = 1 + Math.sin(time * 1.8 + n.pulsePhase) * 0.25;
              return (
                <circle
                  key={`node-${idx}`}
                  cx={n.x} cy={n.y} r={Math.max(0.1, n.r * pulse)}
                  fill={`rgba(70,85,115,${n.alphaNode})`}
                />
              );
            })}

            {/* Electric SPARKS — rare, brief blue flashes along connections */}
            {connOp > 0.3 && conns.length > 0 && (() => {
              const SPARK_SLOTS = 4;
              const sparkElems: React.ReactNode[] = [];
              // Each spark slot cycles slowly. Only a tiny portion of cycle is visible.
              const cyclePeriod = 3.2; // seconds between sparks in same slot
              const sparkActive = 0.12;   // only 12% of cycle is a visible spark (~0.38s)

              for (let s = 0; s < SPARK_SLOTS; s++) {
                // Each cycle picks a different connection (stable within cycle)
                const cycleNumber = Math.floor(time / cyclePeriod + s * 0.23);
                const connIdx = ((cycleNumber * 53 + s * 97) % conns.length + conns.length) % conns.length;
                const c = conns[connIdx];
                if (!c || !isFinite(c.x1) || !isFinite(c.y1) || !isFinite(c.x2) || !isFinite(c.y2)) continue;

                const offset = s * 0.23;
                const t = (((time / cyclePeriod + offset) % 1) + 1) % 1;
                if (t > sparkActive) continue;

                // Within the active window: bright flash then fade
                const k = t / sparkActive;        // 0 → 1
                // Brightness curve: rise sharp, fall exponential
                const brightness = k < 0.15 ? k / 0.15 : Math.exp(-(k - 0.15) * 4);

                if (brightness < 0.05) continue;

                sparkElems.push(
                  <g key={`spark-${s}-${cycleNumber}`} opacity={connOp * brightness}>
                    {/* Wide outer glow */}
                    <line
                      x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
                      stroke="rgba(120,160,255,0.45)"
                      strokeWidth={6}
                      strokeLinecap="round"
                    />
                    {/* Mid glow */}
                    <line
                      x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
                      stroke="rgba(59,91,219,0.85)"
                      strokeWidth={2.4}
                      strokeLinecap="round"
                    />
                    {/* Bright core */}
                    <line
                      x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
                      stroke="#ffffff"
                      strokeWidth={1}
                      strokeLinecap="round"
                    />
                    {/* Endpoint highlights */}
                    <circle cx={c.x1} cy={c.y1} r={3} fill="rgba(120,160,255,0.85)" />
                    <circle cx={c.x2} cy={c.y2} r={3} fill="rgba(120,160,255,0.85)" />
                  </g>
                );
              }
              return sparkElems;
            })()}
          </svg>
        );
      })()}

      {/* ── Soft central glow to anchor the hero card ── */}
      {globalCollapseT > 0.05 && (() => {
        const glowOp = interpolate(globalCollapseT, [0, 0.5, 1], [0, 0.3, 0.5], clamp) * heroFadeOut;
        const glowScale = interpolate(globalCollapseT, [0, 1], [0.6, 1.2]);
        return (
          <div style={{
            position: "absolute",
            left: 960 - 320,
            top: 540 - 320,
            width: 640,
            height: 640,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, " +
              "rgba(255,255,255,0.5) 0%, " +
              "rgba(200,220,255,0.35) 30%, " +
              "rgba(107,142,255,0.20) 55%, " +
              "transparent 80%)",
            filter: "blur(28px)",
            opacity: glowOp,
            transform: `scale(${glowScale})`,
            transformOrigin: "center",
            zIndex: 21,
            pointerEvents: "none",
          }} />
        );
      })()}

      {/* ── Sub-list tool cards ── */}
      {frame >= T_SUBLIST_IN - 4 && frame < T_SHATTER_END + 6 && (
        <div style={{
          position: "absolute", inset: 0,
          pointerEvents: "none",
        }}>
          {TOOL_SUITES.map((tool, si) => {
            const itemStart = T_SUBLIST_IN + cascadeOffset(si);
            const localFrame = frame - itemStart;
            if (localFrame < -3) return null;

            // Per-card collapse progress — small stagger for a liquid ripple
            const cardCollapseSp = spring({
              frame: frame - (T_SHATTER_START + si * 1.2), fps,
              config: { stiffness: 90, damping: 26, mass: 1.15 },
            });
            const cardCollapseT = interpolate(cardCollapseSp, [0, 1], [0, 1], clamp);

            return (
              <ToolCard
                key={tool.label}
                label={tool.label}
                Icon={tool.Icon}
                localFrame={localFrame}
                listIndex={si}
                fps={fps}
                collapseT={cardCollapseT}
                collapseTargetX={960}
                collapseTargetY={540}
                collapseCount={TOOL_SUITES.length}
              />
            );
          })}
        </div>
      )}

      {/* ── DROPLET FLASH — bright blue blob at merge point ── */}
      {dropletT > 0.01 && (
        <div style={{
          position: "absolute",
          left: 960 - 80,
          top: 540 - 80,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background:
            `radial-gradient(circle, ` +
            `rgba(255,255,255,${0.95 * dropletT}) 0%, ` +
            `rgba(170,200,255,${0.9 * dropletT}) 30%, ` +
            `rgba(59,91,219,${0.6 * dropletT}) 60%, ` +
            `transparent 80%)`,
          filter: `blur(${interpolate(dropletT, [0, 1], [8, 20])}px)`,
          transform: `scale(${interpolate(dropletT, [0, 1], [0.6, 1.3])})`,
          transformOrigin: "center",
          zIndex: 25,
          pointerEvents: "none",
        }} />
      )}

      {/* ── HERO CARD — "Creating skills.." centered with soft blue glow ── */}
      {heroActive && cardAliveFade > 0.01 && (() => {
        const HERO_W = 720;
        const HERO_H = 118;
        const HERO_X = (1920 - HERO_W) / 2;
        const HERO_Y = (1080 - HERO_H) / 2;

        // Enter: from slightly below + scale up + opacity
        const eY = interpolate(heroT, [0, 1], [60, 0], clamp);
        const eScale = interpolate(heroT, [0, 1], [0.7, 1], clamp) * (1 + cardSplitT * 0.08);
        const eOp = interpolate(heroT, [0, 0.4, 1], [0, 1, 1], clamp) * heroFadeOut * cardAliveFade;

        // Shimmer on the hero label during the arrival + hold
        const shimmerFrame = frame - (T_HERO_EMERGE + 8);
        const shimmerSpeed = 90; // slower, more cinematic

        // Breathing scale after arrival for a subtle "alive" feel
        const tt = (frame - T_FOCUS_ARRIVE) / fps;
        const breathe = frame > T_FOCUS_ARRIVE ? 1 + Math.sin(tt * 1.6) * 0.012 : 1;

        // Soft blue glow around the card — pulsing
        const glowAlpha = frame > T_FOCUS_ARRIVE
          ? 0.35 + Math.sin(tt * 2.2) * 0.1
          : interpolate(heroT, [0, 1], [0, 0.4], clamp);

        return (
          <div style={{
            position: "absolute",
            left: HERO_X,
            top: HERO_Y + eY,
            width: HERO_W,
            height: HERO_H,
            opacity: eOp,
            transform: `scale(${eScale * breathe})`,
            transformOrigin: "center",
            zIndex: 30,
          }}>
            {/* Outer soft blue glow */}
            <div style={{
              position: "absolute",
              inset: -60,
              borderRadius: 24,
              background: `radial-gradient(ellipse at center, rgba(107,142,255,${glowAlpha * 0.5}) 0%, rgba(59,91,219,${glowAlpha * 0.2}) 35%, transparent 70%)`,
              filter: "blur(30px)",
              pointerEvents: "none",
            }} />

            {/* The LIQUID GLASS card */}
            <div style={{
              position: "relative",
              width: "100%",
              height: "100%",
              borderRadius: 22,
              // Liquid glass: translucent + backdrop blur + saturation
              backgroundColor: "rgba(255,255,255,0.22)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              // Layered shadows for depth + inner highlights for the "glass" sheen
              boxShadow:
                `0 18px 50px rgba(59,91,219,${glowAlpha * 0.35}), ` +
                `0 6px 18px rgba(0,0,0,0.08), ` +
                `inset 0 1.5px 0 rgba(255,255,255,0.75), ` +
                `inset 0 -1px 0 rgba(255,255,255,0.35), ` +
                `inset 1px 0 0 rgba(255,255,255,0.4), ` +
                `inset -1px 0 0 rgba(255,255,255,0.25)`,
              border: "1px solid rgba(255,255,255,0.45)",
              display: "flex",
              alignItems: "center",
              gap: 28,
              paddingLeft: 40,
              paddingRight: 40,
              overflow: "hidden",
            }}>
              {/* Liquid glass specular highlight — diagonal sheen */}
              <div style={{
                position: "absolute",
                inset: 0,
                borderRadius: 22,
                background:
                  "linear-gradient(135deg, " +
                  "rgba(255,255,255,0.45) 0%, " +
                  "rgba(255,255,255,0.08) 30%, " +
                  "transparent 55%, " +
                  "rgba(200,220,255,0.06) 80%, " +
                  "rgba(150,180,255,0.12) 100%)",
                pointerEvents: "none",
              }} />
              {/* Subtle top-edge refraction glow */}
              <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0,
                height: 40,
                borderRadius: "22px 22px 0 0",
                background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)",
                pointerEvents: "none",
              }} />

              {/* Icon — liquid glass inner badge */}
              <div style={{
                width: 56, height: 56,
                borderRadius: 14,
                backgroundColor: "rgba(255,255,255,0.35)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.55)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.8), " +
                  "inset 0 -1px 0 rgba(255,255,255,0.3), " +
                  "0 2px 8px rgba(59,91,219,0.15)",
                color: ARIA_COLORS.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                position: "relative",
                zIndex: 1,
              }}>
                <div style={{ transform: "scale(1.4)" }}>
                  <FolderIcon />
                </div>
              </div>

              {/* Label with shimmer + animated dots (...) */}
              <span style={{
                flex: 1,
                fontFamily: geistFont,
                fontSize: 38,
                fontWeight: 500,
                letterSpacing: "-0.01em",
                position: "relative",
                zIndex: 1,
                display: "flex",
                alignItems: "baseline",
                ...getShimmerStyle(shimmerFrame, shimmerSpeed, true),
              }}>
                Preparing skills
                {/* Animated dots — same rhythm as "Building your platform..." */}
                <span style={{ opacity: dotCount >= 1 ? 1 : 0 }}>.</span>
                <span style={{ opacity: dotCount >= 2 ? 1 : 0 }}>.</span>
                <span style={{ opacity: dotCount >= 3 ? 1 : 0 }}>.</span>
              </span>
            </div>
          </div>
        );
      })()}

      {/* ── DARK BLUE OVERLAY — instant snap; slides DOWN during drag-out ── */}
      {darkBgT > 0.005 && (
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#0E1F38",          // deep navy from reference
          opacity: darkBgT * heroFadeOut,
          zIndex: 22,                          // BEHIND fingerprint (25) and pill (50)
          pointerEvents: "none",
          transform: `translateY(${dragOffsetY}px)`,
          willChange: "transform",
        }} />
      )}

      {/* ── FINGERPRINT — exact coords from user: 2966.4×1764, x=-425.9, y=0 ── */}
      {fingerVisible && (() => {
        const FP_W = 2966.4;
        const FP_H = 1764;
        const FP_LEFT = -525;
        const FP_TOP_FINAL = 0;
        // Animate the top from below screen to the final value
        const fpTop = interpolate(fingerT, [0, 1], [FP_TOP_FINAL + 1200, FP_TOP_FINAL], clamp);
        const fpOp = interpolate(fingerT, [0, 0.15], [0, 1], clamp) * heroFadeOut;
        return (
          <div style={{
            position: "absolute",
            left: FP_LEFT,
            top: fpTop,
            width: FP_W,
            height: FP_H,
            opacity: fpOp,
            zIndex: 25,         // BEHIND the Skills panel (z 30) so pill (z 50) covers it
            pointerEvents: "none",
            transform: `translateY(${dragOffsetY}px)`,
            willChange: "transform, opacity",
          }}>
            <Img
              src={staticFile("fingerprint.svg")}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                // Black → white instantly when bg is dark
                filter: `invert(${darkBgT})`,
              }}
            />
          </div>
        );
      })()}

      {/* ── EXPLOSION FLASH at the moment of the burst ── */}
      {frame >= T_PILLS_START - 2 && frame < T_PILLS_START + 18 && (() => {
        const flashT = interpolate(frame, [T_PILLS_START, T_PILLS_START + 3, T_PILLS_START + 16], [0, 1, 0], clamp);
        const flashScale = interpolate(frame, [T_PILLS_START, T_PILLS_START + 16], [0.4, 2.2]);
        return (
          <div style={{
            position: "absolute",
            left: 1920 / 2 - 260,
            top: 540 - 260,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, " +
              `rgba(255,255,255,${0.85 * flashT}) 0%, ` +
              `rgba(200,220,255,${0.7 * flashT}) 18%, ` +
              `rgba(107,142,255,${0.5 * flashT}) 40%, ` +
              `rgba(59,91,219,${0.2 * flashT}) 65%, ` +
              "transparent 85%)",
            filter: "blur(22px)",
            opacity: flashT,
            transform: `scale(${flashScale})`,
            transformOrigin: "center",
            zIndex: 29,
            pointerEvents: "none",
            mixBlendMode: "screen",
          }} />
        );
      })()}

      {/* ── SKILLS PANEL — pills burst from center and arrange into grid ── */}
      {skillsPanelActive && (() => {
        // Panel layout centered on screen
        const PANEL_CX = 1920 / 2;
        const PANEL_CY = 540;

        // Rows: 7 skills laid out in 3 rows (2 / 3 / 2 with the "100+" pill last)
        const ROWS = [
          [0, 1],         // Autonomous Troubleshooting | Automation & Rules
          [2, 3, 4],      // Work Order Generation | What-if Analysis | Production Forecasting
          [5, 6],         // E2E Strategy | 100+
        ];

        // Measure-ish widths per label (approx by char count × px-per-char)
        const PX_PER_CHAR = 11.5;
        const PAD_X = 46;
        const pillW = (label: string) => Math.max(140, label.length * PX_PER_CHAR + PAD_X * 2);
        const PILL_H = 60;
        const PILL_GAP = 18;
        const ROW_GAP = 18;

        // Compute row widths (for horizontal centering)
        const rowWidths = ROWS.map(row =>
          row.reduce((sum, idx) => sum + pillW(SKILLS[idx].label), 0) +
          (row.length - 1) * PILL_GAP
        );

        // Panel total height
        const totalH = ROWS.length * PILL_H + (ROWS.length - 1) * ROW_GAP;
        const panelTop = PANEL_CY - totalH / 2 + 60;  // shift down a bit to leave room for title

        // "Skills" title
        const TITLE_TOP = panelTop - 70;

        return (
          <div style={{
            position: "absolute", inset: 0,
            opacity: heroFadeOut,
            zIndex: 30,
            pointerEvents: "none",
            transform: `translateY(${dragOffsetY}px)`,
            willChange: "transform",
          }}>
            {/* Title "Skills" — fades out during 100+ zoom */}
            <div style={{
              position: "absolute",
              left: 0, right: 0,
              top: TITLE_TOP + titleY,
              textAlign: "center",
              opacity: titleOp * zoomFadeOthers,
              fontFamily: geistFont,
              fontSize: 40,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "rgba(26,31,51,0.9)",
            }}>
              Skills
            </div>

            {/* Pills */}
            {ROWS.map((row, rIdx) => {
              const rowWidth = rowWidths[rIdx];
              let cursorX = PANEL_CX - rowWidth / 2;
              const rowTop = panelTop + rIdx * (PILL_H + ROW_GAP);
              return row.map((skillIdx, colIdx) => {
                const skill = SKILLS[skillIdx];
                const w = pillW(skill.label);
                const x = cursorX;
                const y = rowTop;
                cursorX += w + PILL_GAP;

                // EXPLOSION entrance — snappy spring, all pills together
                const pillStart = T_PILLS_START + skillIdx * T_PILLS_STAGGER;
                const pillSp = spring({
                  frame: frame - pillStart, fps,
                  config: { stiffness: 260, damping: 16, mass: 0.55 },  // fast + bouncy
                });
                // Opacity pops in very quickly (first 20% of spring)
                const pOp = interpolate(pillSp, [0, 0.2], [0, 1], clamp);
                // Dramatic scale with big overshoot: 0.05 → 1.18 → 1
                const pScale = pillSp < 0.65
                  ? interpolate(pillSp, [0, 0.65], [0.05, 1.18], clamp)
                  : interpolate(pillSp, [0.65, 1], [1.18, 1], clamp);
                // Quick blur clear
                const pBlur = interpolate(pillSp, [0, 0.35], [14, 0], clamp);
                // Random tilt per pill for explosive variety
                const tiltStart = (skillIdx * 137 % 50) - 25;  // -25° to +25° pseudo-random
                const pRot = interpolate(pillSp, [0, 1], [tiltStart, 0], clamp);

                // BURST from center — eased explosion feel (fast start, hard stop)
                const explodeE = 1 - Math.pow(1 - pillSp, 2.5);  // fast initial blast
                const fromCenterX = (PANEL_CX - (x + w / 2));
                const fromCenterY = (PANEL_CY - (y + PILL_H / 2));
                const burstX = fromCenterX * (1 - explodeE);
                const burstY = fromCenterY * (1 - explodeE);

                // ── SIMULATED ZOOM on "100+" pill ──
                // Instead of CSS scale (which pixelates), we interpolate the
                // actual dimensions: width, height, font-size, padding, radius.
                // The pill is RENDERED at its true large size — text stays crisp.
                const isHero100 = skillIdx === SKILL_100_INDEX;
                let pillFinalOp = 1;
                if (!isHero100) {
                  pillFinalOp = zoomFadeOthers;
                }

                // Final zoom dimensions for "100+" hero
                const FINAL_W = 880;
                const FINAL_H = 380;
                const FINAL_FONT = 200;
                const FINAL_PAD_X = 80;
                const FINAL_RADIUS = FINAL_H / 2;

                // Live dimensions interpolated by zoom100T
                const liveW = isHero100
                  ? interpolate(zoom100T, [0, 1], [w, FINAL_W], clamp)
                  : w;
                const liveH = isHero100
                  ? interpolate(zoom100T, [0, 1], [PILL_H, FINAL_H], clamp)
                  : PILL_H;
                const liveFont = isHero100
                  ? interpolate(zoom100T, [0, 1], [18, FINAL_FONT], clamp)
                  : 18;
                const livePadX = isHero100
                  ? interpolate(zoom100T, [0, 1], [PAD_X, FINAL_PAD_X], clamp)
                  : PAD_X;
                const liveRadius = isHero100
                  ? interpolate(zoom100T, [0, 1], [PILL_H / 2, FINAL_RADIUS], clamp)
                  : PILL_H / 2;

                // Live position so the pill stays centered around the desired focal point
                const liveLeft = isHero100
                  ? interpolate(zoom100T, [0, 1], [x, PANEL_CX - FINAL_W / 2], clamp)
                  : x;
                const liveTop = isHero100
                  ? interpolate(zoom100T, [0, 1], [y, PANEL_CY - FINAL_H / 2], clamp)
                  : y;

                // ── HERO 100+ pill: with horizontal flip to reveal text ──
                if (isHero100) {
                  // CONSTANT liquid glass throughout — same translucent look during/after flip
                  const glassBg: React.CSSProperties = {
                    position: "absolute",
                    inset: 0,
                    borderRadius: liveRadius,
                    backgroundColor: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(18px) saturate(180%)",
                    WebkitBackdropFilter: "blur(18px) saturate(180%)",
                    border: "1px solid rgba(255,255,255,0.7)",
                    boxShadow:
                      "0 12px 32px rgba(59,91,219,0.14), " +
                      "0 2px 8px rgba(0,0,0,0.06), " +
                      "inset 0 1.5px 0 rgba(255,255,255,0.85), " +
                      "inset 0 -1px 0 rgba(255,255,255,0.35)",
                    // clip-path works better than overflow:hidden with 3D transforms
                    clipPath: `inset(0 round ${liveRadius}px)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    willChange: "transform",
                  };
                  const sheen = (
                    <div style={{
                      position: "absolute", inset: 0, borderRadius: liveRadius,
                      background:
                        "linear-gradient(135deg, " +
                        "rgba(255,255,255,0.5) 0%, " +
                        "rgba(255,255,255,0.08) 35%, " +
                        "transparent 60%, " +
                        "rgba(200,220,255,0.12) 100%)",
                      pointerEvents: "none",
                    }} />
                  );

                  return (
                    <div
                      key={`pill-${skillIdx}`}
                      style={{
                        position: "absolute",
                        left: liveLeft,
                        top: liveTop,
                        width: liveW,
                        height: liveH,
                        opacity: pOp,
                        transform: `translate(${burstX}px, ${burstY}px) scale(${pScale}) rotate(${pRot}deg)`,
                        transformOrigin: "center center",
                        filter: `blur(${pBlur}px)`,
                        zIndex: 50,
                        perspective: 2200,
                        willChange: "transform, opacity, filter, width, height",
                      }}>
                      <div style={{
                        position: "relative",
                        width: "100%", height: "100%",
                        transformStyle: "preserve-3d",
                        WebkitTransformStyle: "preserve-3d",
                        transform: `rotateX(${flipDeg}deg)`,
                        borderRadius: liveRadius,         // matches faces so any artifact is clipped
                        willChange: "transform",
                      }}>
                        {/* FRONT face — "100+" */}
                        <div style={{
                          ...glassBg,
                          fontFamily: geistFont,
                          fontSize: liveFont,
                          fontWeight: zoom100T > 0.3 ? 700 : 500,
                          color: "rgba(26,31,51,0.88)",
                          letterSpacing: "-0.02em",
                          whiteSpace: "nowrap",
                          paddingLeft: livePadX,
                          paddingRight: livePadX,
                        }}>
                          {sheen}
                          <span style={{ position: "relative", zIndex: 1 }}>{skill.label}</span>
                        </div>
                        {/* BACK face — Apple-keynote style typography */}
                        <div style={{
                          ...glassBg,
                          transform: "rotateX(180deg)",
                          flexDirection: "column",
                          gap: 14,
                          paddingLeft: 60,
                          paddingRight: 60,
                          textAlign: "center",
                          fontFamily: geistFont,
                        }}>
                          {sheen}
                          {/* Subtle lead-in (Apple subhead style) */}
                          <div style={{
                            position: "relative", zIndex: 1,
                            fontSize: 32,
                            fontWeight: 400,
                            color: "rgba(60,60,67,0.6)",
                            letterSpacing: "-0.022em",
                            lineHeight: 1.1,
                            whiteSpace: "nowrap",
                          }}>
                            Skills, ready to work for you.
                          </div>
                          {/* Big bold tagline (Apple keynote style) */}
                          <div style={{
                            position: "relative", zIndex: 1,
                            fontSize: 88,
                            fontWeight: 700,
                            color: "#1d1d1f",
                            letterSpacing: "-0.045em",
                            lineHeight: 1.05,
                            whiteSpace: "nowrap",
                          }}>
                            At your fingertips.
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={`pill-${skillIdx}`}
                    style={{
                      position: "absolute",
                      left: liveLeft,
                      top: liveTop,
                      width: liveW,
                      height: liveH,
                      opacity: pOp * pillFinalOp,
                      transform: `translate(${burstX}px, ${burstY}px) scale(${pScale}) rotate(${pRot}deg)`,
                      transformOrigin: "center center",
                      filter: `blur(${pBlur}px)`,
                      zIndex: 30,
                      willChange: "transform, opacity, filter, width, height",
                      // Liquid glass
                      borderRadius: liveRadius,
                      backgroundColor: "rgba(255,255,255,0.55)",
                      backdropFilter: "blur(18px) saturate(180%)",
                      WebkitBackdropFilter: "blur(18px) saturate(180%)",
                      border: "1px solid rgba(255,255,255,0.7)",
                      boxShadow:
                        "0 8px 24px rgba(59,91,219,0.12), " +
                        "0 2px 6px rgba(0,0,0,0.06), " +
                        "inset 0 1.5px 0 rgba(255,255,255,0.85), " +
                        "inset 0 -1px 0 rgba(255,255,255,0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: geistFont,
                      fontSize: liveFont,
                      fontWeight: 500,
                      color: "rgba(26,31,51,0.88)",
                      letterSpacing: "-0.02em",
                      whiteSpace: "nowrap",
                      paddingLeft: livePadX,
                      paddingRight: livePadX,
                      overflow: "hidden",
                    }}>
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: liveRadius,
                      background:
                        "linear-gradient(135deg, " +
                        "rgba(255,255,255,0.5) 0%, " +
                        "rgba(255,255,255,0.08) 35%, " +
                        "transparent 60%, " +
                        "rgba(200,220,255,0.12) 100%)",
                      pointerEvents: "none",
                    }} />
                    <span style={{ position: "relative", zIndex: 1 }}>{skill.label}</span>
                  </div>
                );
              });
            })}
          </div>
        );
      })()}

      {/* ═══════════════════════════════════════════════════════════════════
          ARIA HERO — snappy zoom-in on "AriA is ready"
          Items 7/8/9 + blob + header fade out FIRST → then item 10 alone
          zooms from its row position to the screen center while the bg
          fades to black and text shifts white with glow.
          ═══════════════════════════════════════════════════════════════════ */}
      {ariaMorphing && (
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#000",
          opacity: bgBlackT,
          zIndex: 50,
          pointerEvents: "none",
        }} />
      )}

    </AbsoluteFill>
  );
};
