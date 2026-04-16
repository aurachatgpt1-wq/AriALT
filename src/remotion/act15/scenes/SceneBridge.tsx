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

// ─── Browser window chrome (showcase phase) ───────────────────────────────────
const BrowserFrame: React.FC<{
  src: string; width: number; height: number; style?: React.CSSProperties;
}> = ({ src, width, height, style }) => {
  const barH = 32;
  return (
    <div style={{
      width, height: height + barH, borderRadius: 14, overflow: "hidden",
      backgroundColor: "#fff",
      boxShadow:
        "0 6px 20px rgba(0,0,0,0.10), 0 18px 40px rgba(0,0,0,0.08), " +
        "0 36px 64px rgba(20,40,80,0.07), inset 0 0 0 0.5px rgba(0,0,0,0.06)",
      flexShrink: 0,
      transform: "perspective(1200px) rotateX(1.5deg)",
      transformOrigin: "center bottom",
      ...style,
    }}>
      <div style={{
        height: barH, background: "linear-gradient(180deg,#FAFAFA 0%,#ECECEC 100%)",
        display: "flex", alignItems: "center", paddingLeft: 14, gap: 8,
        borderBottom: "1px solid #D5D5D5",
      }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#FF5F57" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#FEBC2E" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#28C840" }} />
      </div>
      <div style={{ width, height, overflow: "hidden" }}>
        <Img src={staticFile(src)}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top left" }} />
      </div>
    </div>
  );
};

// ─── Showcase grid config ─────────────────────────────────────────────────────
const SC_GW = 430, SC_GH = 270, SC_GB = 32, SC_GGAP = 24;
const SC_ROW_W = 4 * SC_GW + 3 * SC_GGAP;          // 1792
const SC_ROW_X0 = (1920 - SC_ROW_W) / 2;            // 64
const SC_ROW_TOP = 68;
const SC_ROW_BOT = 1080 - (SC_GH + SC_GB) - 68;     // 710
const scGridX = (col: number) => SC_ROW_X0 + col * (SC_GW + SC_GGAP);
const scGridY = (row: number) => row === 0 ? SC_ROW_TOP : SC_ROW_BOT;
const SC_FEAT_SCALE = 680 / SC_GW;                   // ≈1.582
const SC_HINT_W = Math.round(SC_GW * SC_FEAT_SCALE); // 680

// ─── Burst dashes (Apple Keynote "new ways" style) ────────────────────────────
const BURST_DASHES = [
  { angle: 152, r: 420, w: 34, h: 13 },
  { angle: 130, r: 330, w: 28, h: 11 },
  { angle: 110, r: 370, w: 32, h: 12 },
  { angle:  90, r: 300, w: 24, h: 10 },
  { angle:  70, r: 380, w: 30, h: 12 },
  { angle:  50, r: 340, w: 28, h: 11 },
  { angle:  28, r: 310, w: 26, h: 10 },
  { angle: -30, r: 295, w: 24, h: 10 },
  { angle: -70, r: 260, w: 22, h:  9 },
  { angle:-115, r: 315, w: 28, h: 11 },
  { angle:-148, r: 355, w: 30, h: 12 },
];

// ─── Timing ───────────────────────────────────────────────────────────────────
// Phase 1 — "What if AI actually know your infrastructure?"
const T_TITLE_IN  = 6;
const T_TITLE_OUT = 72;

// Phase 1.5 — "Introducing" reveal → flip (rotateX, bottom→top) → AriA logo
const HERO_TEXT        = "Introducing";
const T_HERO_TEXT_IN   = 92;
const T_REVEAL_END     = T_HERO_TEXT_IN + 16;               // 108
const T_TEXT_HOLD_END  = T_REVEAL_END + 14;                 // 122
const T_SHRINK_DUR     = 12;
const T_SHRINK_END     = T_TEXT_HOLD_END + T_SHRINK_DUR;    // 134

// Showcase — white bg, logo + scrolling app windows
const T_SHOWCASE_START = 156; // subito dopo hero fade-out ([T_SHRINK_END+4, T_SHRINK_END+22] = [138,156])
const T_SHOWCASE_DUR   = 200;
const T_SHOWCASE_END   = T_SHOWCASE_START + T_SHOWCASE_DUR; // 355

// Phase A: inizia a frame 445 (+40 per zoom pause carousel)
const T_PHASE_A_START     = 445;
const T_PHASE_A_WORD_STEP = 7;
const T_PHASE_A_ZOOM      = 463;
const T_PHASE_A_END       = 503;
// "designed to" interlude
const T_DESIGNED_IN  = 503;
// Phase B:
const T_PHASE_B_START      = 555;
const T_PHASE_B_NONSTD     = 584;
const T_PHASE_B_INVERT     = 617;
const T_DESIGNED_OUT       = 617;
const T_PHASE_B_FADE       = 638;
const T_PHASE_B_INDUSTRIAL = 651;
const T_COLLAPSE_START  = 681; // 1s after industrial: dashes implode to center
const T_LOGO_SLIDE      = 703; // ~22f after collapse start: logo appears at center then slides left
const T_SCENE_OUT_START = 708;
const T_SCENE_OUT_END   = 725;

// ─── Scene ────────────────────────────────────────────────────────────────────
export const SceneBridge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

  // Nessun fade interno — la transizione è gestita dal TransitionSeries (blue→blue = seamless)
  const sceneOp = 1;

  // ── Phase 1 — centered typewriter wrapping after "actually" → magic-move zoom-out ──
  const P1_TL1        = "What if AI actually";
  const P1_TL2        = "know your infrastructure?";
  const P1_WRAP_FRAME = T_TITLE_IN + P1_TL1.length;     // 25
  const P1_DONE_FRAME = P1_WRAP_FRAME + P1_TL2.length;  // 50

  const p1L1Chars  = Math.min(P1_TL1.length, Math.max(0, frame - T_TITLE_IN));
  const p1L2Chars  = Math.min(P1_TL2.length, Math.max(0, frame - P1_WRAP_FRAME));
  const p1TypingL1 = p1L1Chars < P1_TL1.length;
  const p1TypingL2 = !p1TypingL1 && p1L2Chars < P1_TL2.length;

  const p1ZoomSp    = spring({ frame: frame - P1_DONE_FRAME, fps,
    config: { stiffness: 75, damping: 24, mass: 1.2 } });
  const p1ZoomScale = interpolate(p1ZoomSp, [0, 1], [1.32, 1.0], clamp);

  const p1Op = interpolate(frame, [T_TITLE_OUT, T_TITLE_OUT + 18], [1, 0], clamp);

  // ── Phase 1.5 — Hero "Introducing" ─────────────────────────────────────
  const heroEnterSpring = spring({
    frame: frame - T_HERO_TEXT_IN, fps,
    config: { stiffness: 85, damping: 24, mass: 1.1 },
  });
  const heroEnterOp    = interpolate(heroEnterSpring, [0, 1], [0, 1], clamp);
  const heroEnterY     = interpolate(heroEnterSpring, [0, 1], [18, 0], clamp);
  const heroEnterScale = interpolate(heroEnterSpring, [0, 1], [0.97, 1], clamp);

  // Flip: "Introducing" flips rotateX bottom→top → AriA logo on back face
  const flipSp    = spring({ frame: frame - T_TEXT_HOLD_END, fps,
    config: { stiffness: 65, damping: 26, mass: 1.3 } });
  const flipAngle = interpolate(flipSp, [0, 1], [0, 180], clamp);
  // Logo scompare quando entra il carosello e non torna più (push azzurro pulito)
  const carouselLogoFade = interpolate(
    frame,
    [T_SHOWCASE_START + 4, T_SHOWCASE_START + 26],
    [1, 0],
    clamp,
  );
  const heroContainerOp = heroEnterOp * carouselLogoFade;

  // Back face logo: resize 200→118 durante showcase
  const backFaceSizeSp = spring({ frame: frame - T_SHOWCASE_START, fps,
    config: { stiffness: 50, damping: 22, mass: 1.5 } });

  // Logo exit → re-entry
  const T_LOGO_EXIT    = 430; // sf≈274 = quando il 3° screen entra (cEased2≈2/3), +40 per zoom pause
  const T_LOGO_REENTRY = 681; // = T_COLLAPSE_START: logo appare esattamente quando le dashes collassano

  // ── Prep uscita: scale-up + flip rotateY verso sinistra ──
  const T_EXIT_PREP    = T_LOGO_EXIT - 14; // inizia 14 frame prima dell'uscita
  const exitPrepSp     = spring({ frame: frame - T_EXIT_PREP, fps,
    config: { stiffness: 200, damping: 18, mass: 0.75 } });
  const exitFlipSp     = spring({ frame: frame - T_LOGO_EXIT, fps,
    config: { stiffness: 160, damping: 22, mass: 0.9 } });

  // scale-up e flip attivi solo durante l'uscita, azzerati al re-entry
  const exitScaleUp    = frame < T_LOGO_REENTRY
    ? interpolate(exitPrepSp,  [0, 1], [1, 1.22], clamp)
    : 1;
  const exitFlipAngle  = frame < T_LOGO_REENTRY
    ? interpolate(exitFlipSp,  [0, 1], [0, 90],   clamp)
    : 0;

  const logoExitSp    = spring({ frame: frame - T_LOGO_EXIT, fps,
    config: { stiffness: 80, damping: 28, mass: 1.4 } });
  const logoReEntrySp = spring({ frame: frame - T_LOGO_REENTRY, fps,
    config: { stiffness: 180, damping: 24, mass: 0.9 } });

  // ── Collapse spring: drives dashes, logo position, text morph — all in lockstep ──
  const collapseSp = spring({ frame: frame - T_COLLAPSE_START, fps,
    config: { stiffness: 120, damping: 22, mass: 0.9 } }); // settles ~22f
  const collapseT = interpolate(collapseSp, [0, 1], [0, 1], clamp);

  // Logo re-entry opacity synced with collapse
  const reEntryOp = interpolate(collapseT, [0, 0.3], [0, 1], clamp);
  const heroLogoOp = heroContainerOp * heroEnterOp + reEntryOp;

  // Dimensione: 200→118 durante showcase, poi 118→128 al re-entry (collapseT = lockstep con dashes)
  const backFaceSize = frame < T_LOGO_REENTRY
    ? interpolate(backFaceSizeSp, [0, 1], [200, 118], clamp)
    : interpolate(collapseT,      [0, 1], [118, 128], clamp);

  // Logo slide: appare al centro (0), poi scivola a sinistra (-380 = screen X 580)
  // stiffness alto → arriva veloce così il cut a SceneBridgeList è seamless
  const logoSlideSp = spring({ frame: frame - T_LOGO_SLIDE, fps,
    config: { stiffness: 200, damping: 25, mass: 0.85 } }); // ~15f settle
  // X: esce a sinistra (-1400 durante showcase/push), poi appare al centro e scivola a -380
  const logoX = frame < T_LOGO_REENTRY
    ? interpolate(logoExitSp,   [0, 1], [0, -1400],  clamp)
    : interpolate(logoSlideSp,  [0, 1], [0, -380],   clamp);

  // White background: fade-in durante il flip
  // Uscita: push slide verso sinistra (-1920px) quando il logo inizia a flipparsi
  const whiteOp = interpolate(frame,
    [T_TEXT_HOLD_END, T_TEXT_HOLD_END + 14],
    [0, 1],
    clamp);
  const whiteSlideSp = spring({ frame: frame - T_LOGO_EXIT, fps,
    config: { stiffness: 80, damping: 20, mass: 1.2 } }); // ~60f per uscire, sincronizzato col secondo scroll
  const whiteSlideX = frame >= T_LOGO_EXIT
    ? interpolate(whiteSlideSp, [0, 1], [0, -1920], clamp)
    : 0;

  const glowT = interpolate(
    frame,
    [T_HERO_TEXT_IN + 4, T_REVEAL_END + 2, T_TEXT_HOLD_END + 4, T_TEXT_HOLD_END + 16],
    [0, 1, 1, 0],
    clamp,
  );

  return (
    <AbsoluteFill style={{ opacity: sceneOp }}>

      {/* ── Background gradient (blue) ── */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "#6FA3CC" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(150deg, #A8C4E8 0%, #7BAFD4 45%, #5E9EC8 100%)" }} />
      <div style={{
        position: "absolute", width: 1000, height: 900, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(147,197,253,0.38) 0%, transparent 65%)",
        right: -200, bottom: -160, filter: "blur(90px)",
      }} />

      {/* White background — fade-in durante il flip, push-slide verso sinistra quando il logo esce */}
      {whiteOp > 0 && (
        <div style={{
          position: "absolute", inset: 0,
          backgroundColor: "#FFFFFF",
          opacity: whiteOp,
          transform: `translateX(${whiteSlideX}px)`,
          zIndex: 7,
          pointerEvents: "none",
          willChange: "transform",
        }} />
      )}

      {/* ── Phase 1 ── */}
      {p1Op > 0.01 && (
        <AbsoluteFill style={{ opacity: p1Op, pointerEvents: "none", zIndex: 8 }}>
          <div style={{
            position: "absolute", left: 0, right: 0, top: "50%",
            transform: `translateY(-50%) scale(${p1ZoomScale})`,
            transformOrigin: "center center",
            willChange: "transform",
          }}>
            <div style={{
              fontFamily: interFont, fontSize: 96, fontWeight: 700,
              letterSpacing: "-0.040em", lineHeight: 1.08,
              textAlign: "center", color: "rgba(255,255,255,0.95)",
            }}>
              <span style={{ display: "inline-block" }}>
                {P1_TL1.slice(0, p1L1Chars)}
                {p1TypingL1 && (
                  <span style={{ opacity: frame % 4 < 2 ? 1 : 0, marginLeft: 2, fontWeight: 200, color: "rgba(255,255,255,0.45)" }}>|</span>
                )}
              </span>
            </div>
            {frame >= P1_WRAP_FRAME && (
              <div style={{
                fontFamily: interFont, fontSize: 96, fontWeight: 700,
                letterSpacing: "-0.040em", lineHeight: 1.08,
                textAlign: "center", color: "rgba(210,228,248,0.88)",
              }}>
                <span style={{ display: "inline-block" }}>
                  {P1_TL2.slice(0, p1L2Chars)}
                  {p1TypingL2 && (
                    <span style={{ opacity: frame % 4 < 2 ? 1 : 0, marginLeft: 2, fontWeight: 200, color: "rgba(255,255,255,0.45)" }}>|</span>
                  )}
                </span>
              </div>
            )}
          </div>
        </AbsoluteFill>
      )}

      {/* ── Phase 1.5: HERO "Introducing" → flip → AriA logo ── */}
      {frame >= T_HERO_TEXT_IN && heroLogoOp > 0.005 && (
        <>
          {/* Ambient glow */}
          <div style={{
            position: "absolute", left: 140, top: 280,
            width: 1640, height: 520,
            pointerEvents: "none", zIndex: 8,
            background:
              "radial-gradient(ellipse at center, " +
              `rgba(180,210,255,${0.34 * glowT}) 0%, ` +
              `rgba(140,180,245,${0.18 * glowT}) 28%, ` +
              "rgba(120,170,230,0) 68%)",
            filter: "blur(40px)",
            opacity: heroLogoOp,
          }} />

          {/* 3D flip wrapper */}
          <div style={{
            position: "absolute", left: 0, right: 0,
            top: 540, textAlign: "center",
            pointerEvents: "none", zIndex: 9,
            perspective: "1400px",
            perspectiveOrigin: "center center",
            opacity: heroLogoOp,
            transform: `translateX(${logoX}px) scale(${exitScaleUp}) rotateY(-${exitFlipAngle}deg)`,
            willChange: "transform",
          }}>
            <div style={{
              display: "inline-block",
              transformStyle: "preserve-3d" as React.CSSProperties["transformStyle"],
              transform:
                `translateY(calc(-50% + ${heroEnterY}px)) ` +
                `scale(${heroEnterScale}) ` +
                `rotateX(-${flipAngle}deg)`,
              transformOrigin: "center center",
              willChange: "transform",
            }}>

              {/* FRONT — "Introducing" */}
              <div style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden" as React.CSSProperties["backfaceVisibility"],
                fontFamily: interFont, fontSize: 196, fontWeight: 900,
                letterSpacing: "-0.045em", lineHeight: 1, whiteSpace: "nowrap",
                color: "#FFFFFF",
                filter:
                  `drop-shadow(0 0 18px rgba(255,255,255,${0.28 * glowT})) ` +
                  `drop-shadow(0 0 52px rgba(175,210,245,${0.22 * glowT}))`,
              }}>
                {HERO_TEXT}
              </div>

              {/* BACK — AriA logo: rimane qui dal flip fino a Phase A, si ridimensiona 200→118 */}
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden" as React.CSSProperties["backfaceVisibility"],
                transform: "rotateX(180deg)",
              }}>
                <div style={{
                  width: backFaceSize, height: backFaceSize,
                  borderRadius: backFaceSize * 0.22,
                  overflow: "hidden",
                  boxShadow: "0 12px 36px rgba(0,0,0,0.18), 0 28px 56px rgba(20,40,80,0.22)",
                  willChange: "width, height",
                }}>
                  <Img
                    src={staticFile("aria-logo.png")}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              </div>

            </div>
          </div>
        </>
      )}

      {/* ── SHOWCASE — carousel unificato: a.png centrato → scroll veloce → griglia 4×2 ── */}
      {frame >= T_SHOWCASE_START && frame < T_LOGO_EXIT + 90 && (() => {
        const sf = frame - T_SHOWCASE_START;

        // Entrance animation (shared by carousel and grid)
        const enterSp = spring({ frame: sf - 6, fps, config: { stiffness: 130, damping: 24, mass: 1.1 } });
        const enterOp   = interpolate(enterSp, [0, 1], [0, 1], clamp);
        const enterOffY = interpolate(enterSp, [0, 1], [50, 0], clamp);

        // ─────────────────────────────────────────────────────────────────────
        // CAROUSEL — a.png (idx=C_INITIAL=1) inizia centrato, scorre fino a e.png (idx=C_TARGET=15)
        // h.png (idx=0) è un buffer a sinistra di a.png
        // ─────────────────────────────────────────────────────────────────────
        const C_W = SC_HINT_W;                    // 680
        const C_H = Math.round((SC_GH + SC_GB) * SC_FEAT_SCALE - SC_GB); // 446
        const C_GAP = 28;
        const C_ITEM_W = C_W + C_GAP;             // 708
        const C_TOP = Math.round((1080 - (C_H + SC_GB)) / 2); // 301

        const C_INITIAL = 1; // a.png centrato all'inizio
        const C_TARGET  = 14; // h.png — primo scroll si ferma qui
        const C_SRCS = [
          "showcase/e.png",   // 0 — buffer sinistro
          "showcase/a.png",   // 1 — C_INITIAL: inizia centrato a x=960
          "showcase/f.png",   // 2
          "showcase/b.png",   // 3
          "showcase/g.png",   // 4
          "showcase/d.png",   // 5
          "showcase/i.png",   // 6
          "showcase/e.png",   // 7
          "showcase/a.png",   // 8
          "showcase/f.png",   // 9
          "showcase/b.png",   // 10
          "showcase/g.png",   // 11
          "showcase/d.png",   // 12
          "showcase/i.png",   // 13
          "showcase/h.png",   // 14 — C_TARGET: fermo qui
          "showcase/e.png",   // 15 — 1° schermata secondo scroll
          "showcase/b.png",   // 16 — 2° schermata secondo scroll
          "showcase/g.png",   // 17 — 3° schermata secondo scroll (poi arriva sfondo azzurro)
        ];
        // C_START_OFFSET: distanza tra C_INITIAL e C_TARGET in pixel
        const C_START_OFFSET = (C_TARGET - C_INITIAL) * C_ITEM_W; // 13 * 708 = 9204
        // C_STRIP_REST: così a cRaw=0, idx=C_INITIAL è centrato a x=960
        // stripX + C_INITIAL * C_ITEM_W + C_W/2 = 960
        const C_STRIP_REST = 960 - C_START_OFFSET - C_INITIAL * C_ITEM_W - C_W / 2; // = -9292

        const C_DUR = 145;
        const cRaw   = Math.min(1, Math.max(0, (sf - 30) / C_DUR));
        // Ease-in-out cubica (curva più ripida): parte lento, accelera forte, decelera
        const cEased = cRaw < 0.5
          ? 4 * cRaw * cRaw * cRaw
          : 1 - Math.pow(-2 * cRaw + 2, 3) / 2;
        const stripX = C_STRIP_REST + C_START_OFFSET * (1 - cEased);

        // Velocità normalizzata 0→1→0 (derivata della cubica ease-in-out)
        const cVelNorm = (cRaw > 0 && cRaw < 1) ? 4 * Math.pow(Math.min(cRaw, 1 - cRaw), 2) : 0;
        const cBlur    = Math.min(45, Math.round(cVelNorm * (C_START_OFFSET / C_DUR) / 4));

        // scrollOpacity: 1.0 quando fermo, scende a 0.55 al picco di velocità
        const scrollOpacity = sf < 30
          ? 1.0
          : interpolate(cVelNorm, [0, 1], [1.0, 0.55], clamp);

        // ── Zoom-in / dezoom sulla schermata centrata durante la pausa ──
        // sf=177: primo scroll fermo, zoom inizia
        // sf=207: inizia dezoom (peak held ~30f)
        // sf=240: dezoom finito, parte il secondo scroll
        const T_PAUSE_ZOOM_SF   = 177;
        const T_PAUSE_DEZOOM_SF = 207;
        const cZoomSp   = spring({ frame: sf - T_PAUSE_ZOOM_SF,   fps,
          config: { stiffness: 65, damping: 22, mass: 1.2 } });
        const cDezoomSp = spring({ frame: sf - T_PAUSE_DEZOOM_SF, fps,
          config: { stiffness: 65, damping: 22, mass: 1.2 } });
        const carouselZoom = Math.max(1,
          1 + interpolate(cZoomSp,   [0, 1], [0, 0.28], clamp)
            - interpolate(cDezoomSp, [0, 1], [0, 0.28], clamp));

        // Secondo scroll: pausa 65f dopo il primo (sf=175) — include zoom in+out
        const C_SCROLL2_SF = 240; // era 200, +40 per il zoom pause
        const C_DUR2 = 60;
        const cRaw2 = Math.min(1, Math.max(0, (sf - C_SCROLL2_SF) / C_DUR2));
        // Stessa cubic ease-in-out del primo scroll: parte lento, accelera, decelera
        const cEased2 = cRaw2 < 0.5
          ? 4 * cRaw2 * cRaw2 * cRaw2
          : 1 - Math.pow(-2 * cRaw2 + 2, 3) / 2;
        const secondScrollOffset = cEased2 * 3 * C_ITEM_W; // 3 schermate, la 4ª è lo sfondo azzurro
        // velocity normalizzata 0→1→0 (stessa formula del primo scroll)
        const cVel2Norm = (cRaw2 > 0 && cRaw2 < 1) ? 4 * Math.pow(Math.min(cRaw2, 1 - cRaw2), 2) : 0;
        // Stessa formula blur del primo scroll: usa C_START_OFFSET/C_DUR (velocità equivalente)
        const cBlur2   = Math.min(45, Math.round(cVel2Norm * (C_START_OFFSET / C_DUR) / 4));
        const totalBlur = Math.max(cBlur, cBlur2);
        const scroll2Opacity = sf >= C_SCROLL2_SF
          ? interpolate(cVel2Norm, [0, 1], [1.0, 0.55], clamp)
          : 1.0;
        // Posizione strip combinata (primo scroll + secondo scroll)
        const stripXFinal = stripX - secondScrollOffset;

        // Carousel rimane visibile fino all'uscita dello showcase (whiteSlideX)
        const carouselOp = enterOp * Math.min(scrollOpacity, scroll2Opacity);

        // Gradiente laterale: visibile mentre a.png è centrato e fermo, scompare con lo scroll
        const sideGradOp = Math.max(0, 1 - cRaw * 10);

        // Fade-out globale quando il logo inizia a uscire
        const showcaseOp = interpolate(frame, [T_LOGO_EXIT + 48, T_LOGO_EXIT + 84], [1, 0], clamp);

        return (
          <div style={{
            position: "absolute", top: 0, left: 0,
            width: 1920, height: 1080,
            overflow: "hidden",
            transform: `translateX(${whiteSlideX}px)`,
            zIndex: 11,
            pointerEvents: "none",
            opacity: showcaseOp,
            willChange: "transform, opacity",
          }}>

            {/* ── Carousel: a.png centrato → scroll veloce → fermo su e.png ── */}
            {carouselOp > 0.005 && (
              <>
                {totalBlur > 0 && (
                  <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
                    <defs>
                      <filter id="sc-motion-blur" x="-60%" width="220%" y="0%" height="100%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation={`${totalBlur} 0`} />
                      </filter>
                    </defs>
                  </svg>
                )}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 1080,
                  transform: `translateY(${enterOffY}px) scale(${carouselZoom})`,
                  transformOrigin: "center center",
                  filter: totalBlur > 0.5 ? "url(#sc-motion-blur)" : "none",
                  opacity: carouselOp,
                  willChange: "transform, filter, opacity",
                }}>
                  {C_SRCS.map((src, idx) => {
                    const itemX = Math.round(stripXFinal + idx * C_ITEM_W);
                    if (itemX + C_W < -10 || itemX > 1930) return null;
                    const distFromCenter = Math.abs((itemX + C_W / 2) - 960);
                    const centerGlow = Math.max(0, 1 - distFromCenter / (C_W * 0.55));
                    const itemScale = 1 + centerGlow * 0.045;
                    return (
                      <div key={`c${idx}`} style={{
                        position: "absolute",
                        left: itemX, top: C_TOP,
                        transform: `scale(${itemScale})`,
                        transformOrigin: "center center",
                        willChange: "transform",
                      }}>
                        <BrowserFrame src={src} width={C_W} height={C_H} />
                      </div>
                    );
                  })}
                </div>

                {/* Gradiente laterale: copre i bordi mentre fermo, svanisce allo scroll */}
                {sideGradOp > 0.01 && (
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to right, #FFFFFF 0%, rgba(255,255,255,0) 26%, rgba(255,255,255,0) 74%, #FFFFFF 100%)",
                    opacity: sideGradOp,
                    zIndex: 2, pointerEvents: "none",
                  }} />
                )}
              </>
            )}

          </div>
        );
      })()}

      {/* ═════════════════════════════════════════════════════════════════
          TAGLINE — Two-phase animation (blue background returns)
          Phase A: "The first vertical GenAI platform"
          Phase B: "autonomously optimize [^highly specialized] industrial workflows"
          ═════════════════════════════════════════════════════════════════ */}

      {/* ── PHASE A ── */}
      {frame >= T_PHASE_A_START - 2 && frame < T_PHASE_A_END + 10 && (() => {
        const WORDS_A = ["The", "first", "GenAI", "agent", "platform"];
        const GENAI_IDX = 2;
        const BLUE = "#1A2640";

        const renderWord = (word: string, idx: number, highlight = false) => {
          const wordDelay = T_PHASE_A_START + idx * T_PHASE_A_WORD_STEP;
          const sp1 = spring({
            frame: frame - wordDelay, fps,
            config: { stiffness: 180, damping: 20, mass: 0.7 },
          });
          const op   = interpolate(sp1, [0, 1], [0, 1], clamp);
          const y    = interpolate(sp1, [0, 1], [18, 0], clamp);
          const blur = interpolate(sp1, [0, 0.6], [5, 0], clamp);

          return (
            <span key={idx} style={{
              display: "inline-block",
              opacity: op,
              transform: `translateY(${y}px)`,
              filter: `blur(${blur}px)`,
              marginLeft: 0,
              marginRight: 20,
              position: "relative",
              willChange: "transform, opacity, filter",
            }}>
              {word}
              {highlight && (() => {
                const uSp = spring({
                  frame: frame - (wordDelay + 2), fps,
                  config: { stiffness: 160, damping: 20, mass: 0.7 },
                });
                const uProg = interpolate(uSp, [0, 1], [0, 1], clamp);
                const cSp = spring({
                  frame: frame - (wordDelay - 3), fps,
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
                        left: -4, right: -4, bottom: -6,
                        width: "calc(100% + 8px)", height: 16,
                        overflow: "visible", pointerEvents: "none",
                      }}
                    >
                      <path
                        d="M 3 15 C 20 10, 40 20, 60 13 S 100 8, 130 14 T 197 12"
                        stroke={BLUE} strokeWidth={7} strokeLinecap="round" fill="none"
                        style={{
                          filter: `drop-shadow(0 0 8px ${BLUE}aa)`,
                          strokeDasharray: 250,
                          strokeDashoffset: 250 * (1 - uProg),
                        }}
                      />
                    </svg>
                    {/* "vertical" callout above with arrow */}
                    <div style={{
                      position: "absolute", top: -128, left: -108,
                      pointerEvents: "none", width: 200, height: 142,
                    }}>
                      <svg viewBox="0 0 200 142" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
                        <path
                          d="M 95 88 Q 94 106, 96 126 L 87 117 M 96 126 L 105 117"
                          stroke={BLUE} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none"
                          style={{
                            filter: `drop-shadow(0 0 4px rgba(26,38,64,0.35))`,
                            strokeDasharray: 65,
                            strokeDashoffset: 65 * (1 - arrowProg),
                          }}
                        />
                      </svg>
                      <span style={{
                        position: "absolute", top: 0, left: 10,
                        fontFamily: "'Caveat', 'Comic Sans MS', cursive",
                        fontSize: 56, fontWeight: 900, color: BLUE,
                        letterSpacing: "0.02em",
                        transform: `scale(${cProg}) rotate(-8deg)`,
                        transformOrigin: "center center",
                        opacity: cProg,
                        filter: `drop-shadow(0 0 6px rgba(26,38,64,0.3))`,
                        textShadow: `0 0 8px rgba(26,38,64,0.15)`,
                        whiteSpace: "nowrap",
                      }}>
                        vertical
                        <svg viewBox="0 0 200 20" preserveAspectRatio="none" style={{ display: "block", marginTop: 2, width: "100%", height: 14, overflow: "visible" }}>
                          <path
                            d="M 4 10 C 30 5, 60 16, 100 10 S 160 5, 196 11"
                            stroke={BLUE} strokeWidth={6} strokeLinecap="round" fill="none"
                            style={{ strokeDasharray: 220, strokeDashoffset: 220 * (1 - uProg) }}
                          />
                        </svg>
                      </span>
                    </div>
                  </>
                );
              })()}
            </span>
          );
        };

        const zoomT = spring({
          frame: frame - T_PHASE_A_ZOOM, fps,
          config: { stiffness: 72, damping: 28, mass: 1.1 },
        });
        const scale  = interpolate(zoomT, [0, 1], [1, 1.28], clamp);
        const shiftX = 0;

        const exitT     = interpolate(frame, [T_PHASE_A_END - 5, T_PHASE_A_END + 10], [0, 1], clamp);
        const exitOp    = interpolate(exitT, [0, 1], [1, 0], clamp);
        const exitScale = interpolate(exitT, [0, 1], [1, 1.08], clamp);
        const exitBlur  = interpolate(exitT, [0, 1], [0, 8], clamp);

        return (
          <div style={{
            position: "absolute", left: 0, right: 0,
            top: 540 - 64 * 1.15 / 2,
            textAlign: "center", zIndex: 10,
            fontFamily: interFont, fontSize: 64, fontWeight: 700,
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

      {/* ── DESIGNED TO — interlude: zoom flash Phase A → sfondo bianco → pop blu → inversione ── */}
      {frame >= T_DESIGNED_IN && frame < T_DESIGNED_OUT && (() => {
        const localF   = frame - T_DESIGNED_IN;
        const T_POP    = 8;  // "designed to" inizia a entrare
        const T_INVERT = 28; // inversione istantanea (bg blu, testo bianco)

        // Zoom flash: Phase A text zooma fuori + sfondo bianco compare
        const zoomSp = spring({
          frame: localF, fps,
          config: { stiffness: 500, damping: 30, mass: 0.45 },
        });
        const phaseAScale = interpolate(zoomSp, [0, 1], [1.25, 1.55], clamp);
        const phaseAOp    = interpolate(zoomSp, [0, 0.5], [1, 0],     clamp);
        const whiteBgOp   = interpolate(zoomSp, [0, 0.3], [0, 1],     clamp);

        // Pop "designed to"
        const popSp = spring({
          frame: localF - T_POP, fps,
          config: { stiffness: 320, damping: 22, mass: 0.6 },
        });
        const popOp    = interpolate(popSp, [0, 1], [0, 1],   clamp);
        const popScale = interpolate(popSp, [0, 1], [0.78, 1], clamp);
        const popBlur  = interpolate(popSp, [0, 0.5], [12, 0], clamp);

        // Inversione istantanea (nessun interpolate — cambio booleano)
        const inverted  = localF >= T_INVERT;
        const bgColor   = inverted ? "#0F1E36" : "#FFFFFF";
        const textColor = inverted ? "rgba(255,255,255,0.95)" : "#0F1E36";

        // "designed to" esce prima che "autonomously optimize" entri
        const desExitStart = T_PHASE_B_START - 6; // = 459
        const desExitEnd   = T_PHASE_B_START - 2; // = 463
        const desOp = frame < desExitStart
          ? popOp
          : interpolate(frame, [desExitStart, desExitEnd], [1, 0], clamp);

        return (
          <>
            {/* Background — bianco durante il pop, poi cut istantaneo a blu scuro.
                Sparisce con cut netto a T_PHASE_B_NONSTD (= T_DESIGNED_OUT) → 2a inversione */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundColor: bgColor,
              opacity: inverted ? 1 : whiteBgOp,
              zIndex: 14,
            }} />

            {/* Phase A zoom flash — testo precedente zooma sparendo nel bianco */}
            {phaseAOp > 0.01 && (
              <div style={{
                position: "absolute", left: 0, right: 0, top: "50%",
                transform: `translateY(-50%) scale(${phaseAScale})`,
                transformOrigin: "center center",
                textAlign: "center",
                fontFamily: interFont,
                fontSize: 64,
                fontWeight: 700,
                letterSpacing: "-0.035em",
                color: "rgba(255,255,255,0.95)",
                opacity: phaseAOp,
                zIndex: 15,
                pointerEvents: "none",
                willChange: "transform, opacity",
              }}>
                The first GenAI agent platform
              </div>
            )}

            {/* "designed to" — pop in, poi fade-out prima di "autonomously optimize" */}
            {localF >= T_POP && desOp > 0.01 && (
              <div style={{
                position: "absolute", left: 0, right: 0, top: "50%",
                transform: `translateY(-50%) scale(${popScale})`,
                transformOrigin: "center center",
                textAlign: "center",
                fontFamily: interFont,
                fontSize: 80,
                fontWeight: 700,
                letterSpacing: "-0.040em",
                lineHeight: 1.1,
                color: textColor,
                opacity: desOp,
                filter: `blur(${popBlur}px)`,
                zIndex: 16,
                pointerEvents: "none",
                willChange: "transform, opacity, filter",
              }}>
                designed to
              </div>
            )}
          </>
        );
      })()}

      {/* ── PHASE B — zoom + underline reveal ── */}
      {frame >= T_PHASE_B_START - 2 && frame < T_SCENE_OUT_END && (() => {
        const BLUE = "#1A2640";
        const AK = { stiffness: 240, damping: 30, mass: 0.88 };

        // "autonomously" + "optimize" — slide dal basso verso l'alto, stagger 9f
        const aoSprings = [0, 9].map((offset) =>
          spring({ frame: frame - (T_PHASE_B_START + offset), fps, config: AK }),
        );
        // Slide pulito: solo translateY + opacity, nessun blur né scala
        const aoWord = (s: number) => ({
          opacity:   interpolate(s, [0, 0.3, 1], [0, 1, 1], clamp),
          transform: `translateY(${interpolate(s, [0, 1], [90, 0], clamp)}px)`,
        });
        // ao rimane BIANCO sempre.
        // hs: azzurro (#A8C4E8) su bg blu scuro → BLUE (#1A2640) su bg azzurro dopo inversione
        const hsColor = frame >= T_PHASE_B_INVERT ? BLUE : "#6FA3CC";

        // Zoom kicks in after ao settles
        const zoomSp = spring({ frame: frame - T_PHASE_B_NONSTD, fps,
          config: { stiffness: 72, damping: 28, mass: 1.1 } });
        const bScale = interpolate(zoomSp, [0, 1], [1, 1.2], clamp);

        // ao words shift left when annotation appears
        const aoShiftSp = spring({ frame: frame - T_PHASE_B_NONSTD, fps,
          config: { stiffness: 160, damping: 24, mass: 0.9 } });
        const aoShiftX = interpolate(aoShiftSp, [0, 1], [0, -110], clamp);

        // "^highly specialized" — types from anchor point
        const ANNOTATION = "^highly specialized";
        const charsShown = Math.min(ANNOTATION.length, Math.max(0, frame - T_PHASE_B_NONSTD + 1));
        const typedText  = ANNOTATION.slice(0, charsShown);
        const isTyping   = charsShown < ANNOTATION.length;
        const nsUProg    = Math.min(1, Math.max(0, (charsShown - 1) / 18));

        // Top line fades out
        const lineOp = interpolate(frame, [T_PHASE_B_FADE, T_PHASE_B_FADE + 10], [1, 0], clamp);

        // "industrial workflows" — big zoom + metallic shimmer
        // "industrial workflows" — entrata keynote pop (underdamped = overshoot naturale)
        const indSp = spring({ frame: frame - T_PHASE_B_INDUSTRIAL, fps,
          config: { stiffness: 360, damping: 20, mass: 0.75 },
        });
        // Opacità: raggiunge 1 in ~6 frame (veloce come keynote)
        const indOp  = interpolate(indSp, [0, 0.28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        // Scala: parte da 0.5, spring con overshoot ~4% prima di stabilizzarsi a 1
        const indScale = 0.5 + indSp * 0.5;          // no clamp → overshoot naturale
        // Slide dal basso: 60px → 0
        const indEntryY = interpolate(indSp, [0, 1], [60, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

        // ── Collapse: dashes converge to logo + text morphs to list item ──────────
        // (collapseSp/collapseT computed in component body for logo sync)

        // Dashes fade out as they arrive at logo
        const dashOp = interpolate(collapseT, [0.6, 1.0], [1, 0], clamp);

        // Text: scale down from 112→92px equivalent, shift from center to FOCUSED_TEXT_X
        // Logo is at screen X=580; FOCUSED_TEXT_X=696 (text starts just right of logo)
        // Text center shifts from 960 (centered) to ~1156 (696 + half of "industrial workflows" at 92px)
        const collapseScale = interpolate(collapseT, [0, 1], [1, 92 / 112], clamp);
        const collapseX     = interpolate(collapseT, [0, 1], [0, 196], clamp);

        return (
          <div style={{ position: "absolute", inset: 0, zIndex: 17, pointerEvents: "none" }}>

            {/* Zoom wrapper — ao words + superscript scale together */}
            <div style={{
              position: "absolute", left: 0, right: 0, top: "50%",
              transform: `translateY(-50%) scale(${bScale})`,
              transformOrigin: "center center",
              opacity: lineOp,
              willChange: "transform, opacity",
            }}>
              <div style={{
                display: "flex", justifyContent: "center", alignItems: "center",
                gap: 22,
                fontFamily: interFont, fontSize: 60, fontWeight: 700,
                letterSpacing: "-0.035em",
                color: "rgba(255,255,255,0.95)",
                whiteSpace: "nowrap",
                transform: `translateX(${aoShiftX}px)`,
                willChange: "transform",
              }}>
                {["autonomously", "optimize"].map((word, i) => (
                  <span key={i} style={{
                    display: "inline-block",
                    position: "relative",
                    willChange: "transform, opacity, filter",
                    ...aoWord(aoSprings[i]),
                  }}>
                    {word}
                    {/* "^highly specialized" — rises from final "e" of "optimize" */}
                    {i === 1 && charsShown > 0 && (
                      <div style={{
                        position: "absolute",
                        left: "100%", bottom: "48%",
                        marginLeft: 2,
                        transform: "rotate(-22deg)",
                        transformOrigin: "left bottom",
                        fontFamily: "'Caveat', 'Comic Sans MS', cursive",
                        fontSize: 58, fontWeight: 700, letterSpacing: "0.05em",
                        color: hsColor, whiteSpace: "nowrap", lineHeight: 1,
                        display: "inline-flex", alignItems: "baseline",
                        willChange: "transform", pointerEvents: "none",
                      }}>
                        <span>^</span>
                        <span style={{ position: "relative", display: "inline-block" }}>
                          {/* Ghost text keeps span at full final width */}
                          <span style={{ visibility: "hidden" }}>highly specialized</span>
                          <span style={{ position: "absolute", left: 0, top: 0, whiteSpace: "nowrap" }}>
                            {charsShown > 1 ? typedText.slice(1) : ""}
                            {isTyping && (
                              <span style={{ opacity: frame % 4 < 2 ? 1 : 0, marginLeft: 1, fontWeight: 300, fontFamily: interFont }}>|</span>
                            )}
                          </span>
                          {charsShown > 1 && (
                            <svg viewBox="0 0 200 30" preserveAspectRatio="none"
                              style={{ position: "absolute", left: 0, right: 0, width: "100%", bottom: -26, height: 18, overflow: "visible", pointerEvents: "none" }}>
                              <path d="M 3 15 C 20 10, 40 20, 60 13 S 100 8, 130 14 T 197 12"
                                stroke={hsColor} strokeWidth={7} strokeLinecap="round" fill="none"
                                style={{ filter: `drop-shadow(0 0 8px ${hsColor}aa)`, strokeDasharray: 200, strokeDashoffset: 200 * (1 - nsUProg) }} />
                            </svg>
                          )}
                        </span>
                      </div>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Burst dashes — explode from center, then collapse toward logo at (580, 540) */}
            {indOp * dashOp > 0.01 && (
              <svg style={{
                position: "absolute", inset: 0, width: "100%", height: "100%",
                overflow: "visible", pointerEvents: "none",
                opacity: indOp * dashOp,
              }}>
                {BURST_DASHES.map((d, i) => {
                  const rad = d.angle * Math.PI / 180;
                  // Burst position (fully extended at indSp=1)
                  const burstCX = 960 + Math.cos(rad) * d.r;
                  const burstCY = 540 - Math.sin(rad) * d.r;
                  // Dashes implode to canvas center (960, 540)
                  const cx = interpolate(collapseT, [0, 1], [burstCX, 960], clamp);
                  const cy = interpolate(collapseT, [0, 1], [burstCY, 540], clamp);
                  // Dashes shrink as they converge
                  const dScale = interpolate(collapseT, [0, 1], [1, 0.2], clamp);
                  return (
                    <rect key={i}
                      x={-d.w / 2} y={-d.h / 2}
                      width={d.w * dScale} height={d.h * dScale}
                      rx={d.h / 2}
                      fill="#1A2640"
                      transform={`translate(${cx}, ${cy}) rotate(${-d.angle})`}
                    />
                  );
                })}
              </svg>
            )}

            {/* "industrial workflows" — pop keynote, poi scompare subito al collapse */}
            <div style={{
              position: "absolute", left: 0, right: 0, top: "50%",
              transform: `translateY(calc(-50% + ${indEntryY}px)) scale(${indScale})`,
              transformOrigin: "center center",
              textAlign: "center",
              opacity: indOp * interpolate(collapseT, [0, 0.15], [1, 0], clamp),
              willChange: "transform, opacity",
            }}>
              <span style={{
                fontFamily: interFont, fontSize: 112, fontWeight: 800,
                letterSpacing: "-0.042em",
                color: "rgba(255,255,255,0.95)",
                display: "inline-block",
              }}>
                industrial workflows
              </span>
            </div>

          </div>
        );
      })()}

    </AbsoluteFill>
  );
};
