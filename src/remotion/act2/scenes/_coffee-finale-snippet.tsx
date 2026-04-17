/**
 * Coffee finale snippet — PRESERVED for reuse as the video's final closing.
 *
 * Source: previously integrated at the end of SceneExecutingPlan2.
 *
 * What it does:
 *   1. Hero "AriA is ready" collapses to a point of light (scale 1 → 0.25,
 *      blur 0 → 12px, opacity 1 → 0) synchronously with coffee entry.
 *   2. Coffee video (`public/coffee.mp4`) fades in over 80 frames under a
 *      dark tint that lifts gradually — preserves tonal continuity so the
 *      transition feels like ONE motion, not two scenes.
 *   3. Tagline appears in the bottom third with a cinematic vignette:
 *        "Just have a coffee."         (weight 400, warm white)
 *        "AriA does the rest."         (weight 600, pure white)
 *
 * When moving this to its own final-closing scene, reproduce these pieces:
 *
 * ── TIME CONSTANTS ─────────────────────────────────────────────────────
 * const T_COFFEE_IN_START      = 830;
 * const T_COFFEE_IN_END        = T_COFFEE_IN_START + 80;   // 910
 * const T_ARIA_TEXT_OUT_START  = T_COFFEE_IN_START;         // synced
 * const T_ARIA_TEXT_OUT_END    = T_ARIA_TEXT_OUT_START + 22; // 852
 * const T_COFFEE_DARK_END      = T_COFFEE_IN_END + 10;      // 920
 * const T_CTAG1_IN_START       = 940;
 * const T_CTAG1_IN_END         = T_CTAG1_IN_START + 22;     // 962
 * const T_CTAG2_IN_START       = T_CTAG1_IN_END + 18;       // 980
 * const T_CTAG2_IN_END         = T_CTAG2_IN_START + 22;     // 1002
 * const T_CTAG_OUT_START       = 1078;
 * const T_CTAG_OUT_END         = 1098;
 *
 * ── COMPUTED VALUES ────────────────────────────────────────────────────
 * const heroTextOutT = interpolate(frame, [T_ARIA_TEXT_OUT_START, T_ARIA_TEXT_OUT_END], [1, 0], clamp);
 * const heroExitT    = interpolate(frame, [T_ARIA_TEXT_OUT_START, T_ARIA_TEXT_OUT_END], [0, 1], clamp);
 * const heroExitScale = 1 - heroExitT * 0.75;     // collapses to 0.25
 * const heroExitBlur  = heroExitT * 12;
 * const coffeeInT     = interpolate(frame, [T_COFFEE_IN_START, T_COFFEE_IN_END], [0, 1], clamp);
 * const coffeeDarkTint= interpolate(frame, [T_COFFEE_IN_START, T_COFFEE_DARK_END], [0.55, 0], clamp);
 * const coffeeScale   = interpolate(frame, [T_COFFEE_IN_START, T_COFFEE_IN_END + 180], [1.18, 1.0], clamp);
 * // ... spring-based ctag1T, ctag2T and their Op variants (see original)
 *
 * ── JSX ────────────────────────────────────────────────────────────────
 * <Sequence from={T_COFFEE_IN_START} layout="none">
 *   <div style={{ position: "absolute", inset: 0, zIndex: 150, opacity: coffeeInT, overflow: "hidden", pointerEvents: "none" }}>
 *     <div style={{ position: "absolute", inset: 0, transform: `scale(${coffeeScale})`, transformOrigin: "center" }}>
 *       <OffthreadVideo src={staticFile("coffee.mp4")} muted
 *         style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
 *       <div style={{ position: "absolute", inset: 0, backgroundColor: "#000", opacity: coffeeDarkTint }} />
 *     </div>
 *
 *     {frame >= T_CTAG1_IN_START && (
 *       <>
 *         <div style={{
 *           position: "absolute", left: 0, right: 0, bottom: 0, height: "55%",
 *           background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.40) 30%, rgba(0,0,0,0.15) 60%, transparent 100%)",
 *           opacity: ctagOutOp,
 *         }} />
 *         <div style={{ position: "absolute", left: 0, right: 0, bottom: "14%", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, fontFamily: geistFont, opacity: ctagOutOp, textAlign: "center" }}>
 *           <div style={{ fontSize: 62, fontWeight: 400, letterSpacing: "-0.01em", color: "rgba(245,241,232,0.95)", opacity: ctag1Op, transform: `translateY(${...}px)`, textShadow: "0 2px 20px rgba(0,0,0,0.55)" }}>
 *             Just have a coffee.
 *           </div>
 *           <div style={{ fontSize: 62, fontWeight: 600, letterSpacing: "-0.018em", color: "#FFFFFF", opacity: ctag2Op, transform: `translateY(${...}px)`, textShadow: "0 2px 20px rgba(0,0,0,0.55)" }}>
 *             AriA does the rest.
 *           </div>
 *         </div>
 *       </>
 *     )}
 *   </div>
 * </Sequence>
 *
 * ── ASSETS ─────────────────────────────────────────────────────────────
 * Video file: public/coffee.mp4 (already copied, ~26MB, ~6s duration)
 *
 * ── IMPORTS TO ADD ─────────────────────────────────────────────────────
 * import { OffthreadVideo, Sequence, staticFile } from "remotion";
 */

export {};
