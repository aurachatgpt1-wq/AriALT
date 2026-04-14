---
name: apple-style-motion
description: Apple-keynote-style monumental typography motion for Remotion scenes — word/char progressive reveal, accent-color handoff, crossfade scene transitions, per-scene visual identity (metallic, paper, glow, paper, oversized PAN). Use when user asks for "dynamism like the Apple reference", "word-by-word reveal", "Apple keynote feel", or similar.
---

# Apple-Style Motion — Reusable Pattern Library

Reusable reveal/transition vocabulary extracted from the `VideoApplestyle` reference (288 frames, ~15 scenes). Use this file whenever the user wants a Remotion section animated in the "Apple keynote" language.

## Core philosophy

1. **Typography IS the animation.** No flying boxes, no particles. The word/letter itself is the hero.
2. **Reveal is progressive, settling is still.** Motion happens during the reveal (≤30 frames). After that the composition breathes but does not move around.
3. **Scene-level crossfade, not element-level flip.** Transitions between ideas are full-scene dissolves with background swap, never per-element flips.
4. **One accent color at a time.** The newest word gets the accent (typically `#3B5BDB` blue); prior words fade to neutral white/grey.
5. **Per-scene visual identity.** Each idea gets a distinct background treatment so the eye registers "new chapter".
6. **Monumental typography.** Inter/SF Pro Display 800-900, `letter-spacing: -0.03 to -0.045em`, sizes 96-160px.
7. **Horizontal overflow is allowed.** Oversized text that bleeds past the frame edge + slow horizontal PAN is a signature move.

## Typography rules (non-negotiable)

```ts
const APPLE_TYPO = {
  fontFamily: interFont, // from ../constants
  fontWeight: 900,       // 800 minimum; never <700
  letterSpacing: "-0.04em", // range: -0.03 to -0.045
  lineHeight: 0.95,
  whiteSpace: "nowrap",
} as const;

// Size scale
const SIZE_HERO      = 140; // main statement
const SIZE_MONUMENTAL = 180; // oversize + PAN
const SIZE_SUB        = 84;  // secondary line
```

Color tokens:
```ts
const APPLE_INK       = "#0A0B10"; // near-black text
const APPLE_INK_SOFT  = "#1D1D1F"; // Apple's default
const APPLE_MUTED     = "#8A8F99"; // secondary phrase
const APPLE_PAPER     = "#F8F9FC"; // near-white bg
const APPLE_PAPER_WARM = "#F3F0FA"; // lavender paper bg
const APPLE_ACCENT    = "#3B5BDB"; // the one blue
const APPLE_ACCENT_SOFT = "#5B78E6";
```

## Reveal Patterns

### Pattern A — Word-by-word with accent handoff (most common)

Each word appears in sequence. The **newest** word is in accent color; after ~8 frames it settles to the ink color and the next word arrives in accent. Subtle Y-rise + fade-in per word, bouncy spring.

Use for: statements of 3-7 words. Signature move. Default choice.

```tsx
// --- Word-by-word reveal with accent handoff ---
const WORDS = ["Faster.", "But", "nothing", "really", "changes."];
const WORD_STAGGER = 7;      // frames between words
const WORD_ACCENT_HOLD = 8;  // frames the new word stays accent-colored

const wordStates = WORDS.map((w, i) => {
  const start = i * WORD_STAGGER;
  const sp = spring({
    frame: frame - start,
    fps,
    config: { stiffness: 220, damping: 18, mass: 0.7 },
  });
  const op = interpolate(sp, [0, 1], [0, 1], clamp);
  const y  = interpolate(sp, [0, 1], [28, 0], clamp);
  // Accent fades to ink after the hold window
  const accentT = interpolate(
    frame - start,
    [WORD_ACCENT_HOLD, WORD_ACCENT_HOLD + 10],
    [1, 0],
    clamp,
  );
  return { w, op, y, accentT };
});

// render:
<div style={{ ...APPLE_TYPO, fontSize: SIZE_HERO, display: "flex", gap: 24 }}>
  {wordStates.map((s, i) => (
    <span key={i} style={{
      display: "inline-block",
      opacity: s.op,
      transform: `translateY(${s.y}px)`,
      color: s.accentT > 0
        ? `rgba(59,91,219,${s.accentT})` // accent
        : APPLE_INK_SOFT,
      // Interpolate between accent and ink so there's no color pop
      // (use mix-blend or a manual rgb interpolation if needed)
    }}>
      {s.w}
    </span>
  ))}
</div>
```

### Pattern B — Character-by-character (terminal/typewriter)

One character per 1-2 frames. Optional blinking block cursor `▌` at the end during typing.

Use for: short punchy words ("Active", "Online", "Ready", "Build"), code/terminal moments.

```tsx
const TYPE_TEXT = "Active";
const CHAR_PER_FRAME = 0.6; // chars revealed per frame (adjust)
const charsShown = Math.floor(Math.max(0, (frame - START) * CHAR_PER_FRAME));
const visible = TYPE_TEXT.slice(0, charsShown);
const cursorBlink = Math.floor(frame / 8) % 2 === 0 ? 1 : 0;
const typingDone = charsShown >= TYPE_TEXT.length;

<div style={{ ...APPLE_TYPO, fontSize: SIZE_HERO, color: APPLE_INK }}>
  {visible}
  {!typingDone && (
    <span style={{ opacity: cursorBlink, marginLeft: 4 }}>▌</span>
  )}
</div>
```

### Pattern C — Metallic char reveal (premium moment)

Char-by-char BUT each char uses a metallic silver gradient via `background-clip: text`. Black scene background. Save for 1 special moment per video.

```tsx
// Apply to the container:
const metallicText: React.CSSProperties = {
  background: "linear-gradient(180deg, #FFFFFF 0%, #C9CED8 45%, #6E7582 90%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  color: "transparent",
};
```

### Pattern D — Monumental oversize + horizontal PAN

Text is LARGER than the 1920 frame (e.g. 2600-3200px wide). The camera slowly pans horizontally across it while the text is stationary. Feels cinematic.

```tsx
// PAN the wrapper, not the text
const panX = interpolate(frame, [0, 180], [200, -800], {
  easing: Easing.inOut(Easing.ease),
  ...clamp,
});
<div style={{
  position: "absolute",
  left: panX,
  top: "50%",
  transform: "translateY(-50%)",
  fontSize: SIZE_MONUMENTAL,
  ...APPLE_TYPO,
  color: APPLE_INK,
  whiteSpace: "nowrap",
}}>
  This system feels built to ship now
</div>
```

## Background / scene identity presets

Pick ONE per scene. Do not mix.

```tsx
// Preset 1 — Paper (default)
background: "#F8F9FC",

// Preset 2 — Lavender paper (introspective, product copy)
background: "#F3F0FA",
// optional grain overlay (see below)

// Preset 3 — Black + radial glow (premium, metallic)
background: "radial-gradient(ellipse at 50% 45%, #1A1C28 0%, #0A0B10 60%)",

// Preset 4 — Pure black (for metallic text)
background: "#0A0B10",

// Preset 5 — White minimal (2-line statements)
background: "#FFFFFF",
```

Grain/noise overlay (reuse across presets):
```tsx
<div style={{
  position: "absolute", inset: 0,
  backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"200\" height=\"200\"><filter id=\"n\"><feTurbulence baseFrequency=\"0.9\"/></filter><rect width=\"100%\" height=\"100%\" filter=\"url(%23n)\" opacity=\"0.18\"/></svg>')",
  mixBlendMode: "multiply",
  opacity: 0.35,
  pointerEvents: "none",
}} />
```

## Transition rule (SCENE → SCENE)

When moving between ideas, use a full-scene crossfade over 14-20 frames. Background AND text dissolve together. **NEVER** flip/slide the whole scene as one object.

```tsx
const sceneOp = Math.min(
  interpolate(frame, [0, 16], [0, 1], clamp),
  interpolate(frame, [TOTAL - 16, TOTAL], [1, 0], clamp),
);
<AbsoluteFill style={{ opacity: sceneOp, background: /* preset */ }}>
  {/* ... */}
</AbsoluteFill>
```

## Timing cheatsheet (30fps)

| Element | Frames |
|---|---|
| Scene fade-in | 16-20 |
| Scene fade-out | 16-20 |
| Word stagger (word-by-word) | 6-8 |
| Char stagger (typewriter) | 1-2 frames per char |
| Accent → ink handoff | 8 hold + 10 fade |
| Post-reveal hold | ≥30 before anything else moves |
| Monumental PAN duration | 120-200 |

## Spring configs (copy-paste)

```ts
// Bouncy-in (word pops with a touch of overshoot)
{ stiffness: 220, damping: 18, mass: 0.7 }

// Crisp-in (no overshoot, clean)
{ stiffness: 260, damping: 26, mass: 0.6 }

// Smooth-out (exit without bounce)
{ stiffness: 200, damping: 22, mass: 0.8 }
```

## What NOT to do

- Do NOT use multiple accent colors in one scene.
- Do NOT animate background color within a scene — switch scene instead.
- Do NOT use fontWeight < 700.
- Do NOT use letter-spacing > 0.
- Do NOT add drop shadows on paper backgrounds (only on black).
- Do NOT rotate/skew text during the reveal. Only Y-translate + fade.
- Do NOT mix Pattern A and Pattern B in the same phrase.
- Do NOT keep wiggling/pulsing after the reveal is done. Hold still.

## Reusable component templates

See `templates/` (next to this file) for drop-in Remotion components:
- `WordReveal.tsx` — Pattern A
- `CharType.tsx`   — Pattern B
- `MetallicText.tsx` — Pattern C
- `PanText.tsx`    — Pattern D
- `SceneShell.tsx` — crossfade wrapper with background preset prop

## How to invoke this skill

User phrases that should trigger reading this skill:
- "fai come nel video Apple style"
- "word-by-word reveal"
- "Apple keynote feel"
- "dinamismo Apple"
- "metallic text"
- "horizontal pan over text"

When invoked:
1. Re-read this file end-to-end.
2. Ask the user which Pattern (A/B/C/D) if not obvious.
3. Ask which Background Preset if not obvious.
4. Use the exact tokens + spring configs above. Do not improvise values.
