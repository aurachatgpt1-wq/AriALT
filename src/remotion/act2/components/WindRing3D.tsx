import React from "react";

// ─── 3D Wind Ring — rotates on all axes ─────────────────────────────────────
// Luminous blue ring made of multiple concentric circles at different 3D
// orientations. Sparkle particles orbit around it. Continuously rotates on
// X, Y, and Z axes for a true 3D "wind swirl" effect. Fully scalable via
// `size` prop so it can act as a hero element or a small corner logo.

const PARTICLES = Array.from({ length: 64 }, (_, i) => ({
  id: i,
  angle: (i / 64) * Math.PI * 2 + (i % 4) * 0.31,
  radiusFrac: 0.44 + (i % 6) * 0.025, // 0.44 → 0.565 of size
  phase: (i * 0.41) % (Math.PI * 2),
  sizeFrac: 0.010 + (i % 3) * 0.005,  // 1.0% → 2.0% of size
  speed: 0.20 + (i % 5) * 0.05,
  wobble: (i % 7) * 0.015,
}));

const RING_CONFIGS = [
  { rx: 0,   ry: 0,   rz: 0,   op: 0.98, w: 0.010 },
  { rx: 62,  ry: 0,   rz: 12,  op: 0.90, w: 0.009 },
  { rx: 0,   ry: 68,  rz: -12, op: 0.90, w: 0.009 },
  { rx: 48,  ry: 42,  rz: 6,   op: 0.82, w: 0.008 },
  { rx: -30, ry: 58,  rz: 18,  op: 0.78, w: 0.008 },
  { rx: 30,  ry: -50, rz: -18, op: 0.78, w: 0.008 },
  { rx: 75,  ry: 30,  rz: 0,   op: 0.70, w: 0.007 },
  { rx: -45, ry: -25, rz: 25,  op: 0.70, w: 0.007 },
  { rx: 25,  ry: 75,  rz: -25, op: 0.65, w: 0.007 },
  { rx: -65, ry: 35,  rz: 8,   op: 0.65, w: 0.007 },
];

const INNER_RING_CONFIGS = [
  { insetFrac: 0.10, rx: 20,  ry: 45,  rz: 0,  op: 0.88 },
  { insetFrac: 0.10, rx: 70,  ry: -20, rz: 15, op: 0.82 },
  { insetFrac: 0.18, rx: 0,   ry: 0,   rz: 0,  op: 0.88 },
  { insetFrac: 0.18, rx: 50,  ry: 50,  rz: 0,  op: 0.78 },
  { insetFrac: 0.28, rx: 30,  ry: 60,  rz: 0,  op: 0.75 },
  { insetFrac: 0.28, rx: -40, ry: 20,  rz: 20, op: 0.70 },
];

export const WindRing3D: React.FC<{ size: number; frame: number; fps: number }> = ({ size, frame, fps }) => {
  const t = frame / fps; // seconds

  // Continuous 3D rotation on all axes — each axis at a different speed so
  // the ring never looks "flat" from any angle.
  const rotX = t * 38;
  const rotY = t * 62;
  const rotZ = t * 22;

  // Gentle breathing scale so the whole thing pulses slightly
  const breathe = 1 + 0.025 * Math.sin(t * 1.6);

  const px = (frac: number) => Math.max(1, size * frac);

  return (
    <div style={{
      position: "relative",
      width: size, height: size,
      perspective: size * 2.8,
      pointerEvents: "none",
    }}>
      {/* Outer halo glow — far, soft */}
      <div style={{
        position: "absolute", inset: -size * 0.42, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(150,210,255,0.32) 0%, rgba(150,210,255,0.14) 26%, rgba(150,210,255,0.05) 55%, transparent 72%)",
        filter: `blur(${Math.max(8, size * 0.07)}px)`,
      }} />

      {/* Secondary tighter glow */}
      <div style={{
        position: "absolute", inset: -size * 0.15, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(190,225,255,0.25) 0%, rgba(150,210,255,0.10) 45%, transparent 75%)",
        filter: `blur(${Math.max(4, size * 0.035)}px)`,
      }} />

      {/* 3D stage: preserve-3d, rotates on all axes, with subtle breathe */}
      <div style={{
        position: "relative",
        width: "100%", height: "100%",
        transformStyle: "preserve-3d",
        transform: `scale(${breathe}) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`,
      }}>
        {/* Outer rings — 10 of them at different 3D orientations */}
        {RING_CONFIGS.map((r, i) => (
          <div key={`r${i}`} style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: `${px(r.w)}px solid rgba(200,230,255,0.95)`,
            boxShadow: `
              0 0 ${px(0.06)}px rgba(150,210,255,0.65),
              0 0 ${px(0.13)}px rgba(150,210,255,0.32),
              inset 0 0 ${px(0.06)}px rgba(150,210,255,0.42)
            `,
            transform: `rotateX(${r.rx}deg) rotateY(${r.ry}deg) rotateZ(${r.rz}deg)`,
            opacity: r.op,
          }} />
        ))}

        {/* Inner rings — smaller concentric, more detail */}
        {INNER_RING_CONFIGS.map((r, i) => (
          <div key={`ir${i}`} style={{
            position: "absolute", inset: size * r.insetFrac, borderRadius: "50%",
            border: `${px(0.006)}px solid rgba(220,240,255,0.92)`,
            boxShadow: `
              0 0 ${px(0.045)}px rgba(170,220,255,0.60),
              inset 0 0 ${px(0.035)}px rgba(170,220,255,0.40)
            `,
            transform: `rotateX(${r.rx}deg) rotateY(${r.ry}deg) rotateZ(${r.rz}deg)`,
            opacity: r.op,
          }} />
        ))}

        {/* Core nucleus — bright white-blue center */}
        <div style={{
          position: "absolute", inset: size * 0.38, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.92) 0%, rgba(210,235,255,0.55) 40%, rgba(170,220,255,0.18) 72%, transparent 100%)",
          filter: `blur(${Math.max(2, size * 0.012)}px)`,
        }} />

        {/* Tiny hot core */}
        <div style={{
          position: "absolute", inset: size * 0.46, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(230,245,255,0.7) 50%, transparent 100%)",
          filter: `blur(${Math.max(1, size * 0.006)}px)`,
        }} />
      </div>

      {/* Sparkle particles orbiting — 2D overlay, continuous drift */}
      <div style={{ position: "absolute", inset: 0 }}>
        {PARTICLES.map((p) => {
          const drift = t * p.speed;
          const wobbleR = 1 + Math.sin(t * 1.4 + p.phase) * p.wobble;
          const pulse = 0.5 + 0.5 * Math.sin(t * 2.6 + p.phase);
          const r = size * p.radiusFrac * wobbleR;
          const x = Math.cos(p.angle + drift) * r;
          const y = Math.sin(p.angle + drift) * r * 0.92;
          const pSize = Math.max(1.2, size * p.sizeFrac);
          return (
            <div key={p.id} style={{
              position: "absolute", left: "50%", top: "50%",
              width: pSize, height: pSize,
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,1)",
              boxShadow: `0 0 ${pSize * 2.5}px rgba(210,235,255,0.98), 0 0 ${pSize * 5}px rgba(150,210,255,0.75), 0 0 ${pSize * 9}px rgba(150,210,255,0.35)`,
              opacity: 0.32 + pulse * 0.68,
            }} />
          );
        })}
      </div>
    </div>
  );
};
