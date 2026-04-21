import React, { Suspense, useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useGLTF, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { geistFont } from "../constants";
import { clamp, tiltReveal, flashCut, cssTransform } from "../cinema/camera";

// Preload the turret GLB so frames after the first render without a flash of loading
useGLTF.preload(staticFile("assets/turret.glb"));

// ─── Palette ───────────────────────────────────────────────────────────────
const LIGHT_BG     = "#FAFAFA";
const DARK_BG      = "#0A0A0B";
const CARD_BG      = "#FFFFFF";
const CARD_BORDER  = "rgba(15,15,18,0.06)";
const CARD_SHADOW  = "0 16px 56px rgba(15,15,18,0.09), 0 2px 6px rgba(15,15,18,0.04)";
const INK          = "#0F0F12";
const MUTED        = "#7A7F8C";
const LABEL        = "#9AA0B0";
const ACCENT       = "#3B5BDB";
const ACCENT_SOFT  = "rgba(59,91,219,0.08)";
const SUCCESS      = "#10B981";
const SUCCESS_SOFT = "rgba(16,185,129,0.08)";
const CRITICAL     = "#E53935";
const CRITICAL_GLOW = "rgba(229,57,53,0.6)";

// ─── Shot timeline ─────────────────────────────────────────────────────────
export const CINEMA_WO_DURATION = 270;
const SHOT = {
  S1: { start:   0, end:  75 },  // Turret rises centered + 2-phase text reveal
  S2: { start:  75, end: 110 },  // Card tilt reveal + title typing
  S3: { start: 110, end: 145 },  // Info grid stagger
  S4: { start: 145, end: 175 },  // Description type-out
  S5: { start: 175, end: 270 },  // Steps cascade + perspective + focus + depth dive
} as const;

// ─── Shot 1 sub-beats (relative to SHOT.S1.start) ─────────────────────────
//   0-20  Turret rises from below into frame center (ease-out quart)
//   14-32 "Oven 2 / Motor T60M2" fades in on LEFT
//   42-50 Left text slides left + fades out
//   46-62 "Torque Fault" slides in from right + fades in
//   70-75 Exit fade-out to black (hands off to S2)
const S1_BEATS = {
  turretRise:   { start:  0, end: 20 },
  leftIn:       { start: 14, end: 32 },
  leftOut:      { start: 42, end: 50 },
  rightIn:      { start: 46, end: 62 },
} as const;

// S5 sub-phases (relative to S5.start):
// 0-20   Card tilts to 28° rotateX + hero text fades in at top
// 20-60  Steady tilted view — steps compile (cascade + checks)
// 60-95  Camera zoom TOWARD hero text — text grows/fills frame, card
//        retreats + fades, motion blur ramps up late (Heygrow-style push-in)
const HERO_TEXT_PART1 = "From alert.";
const HERO_TEXT_PART2 = "To action.";

// ─── Data ──────────────────────────────────────────────────────────────────
const TITLE = "OVEN_1 Peg Chain Motor T60M2 torque recovery";

type Step = { text: string; dur: string };
const STEPS: Step[] = [
  { text: "Stop and lock out OVEN_1 peg chain motor (LOTO procedure)",   dur: "5 min"  },
  { text: "Verify torque readings on controller T60M2 (< 810 N·m)",       dur: "10 min" },
  { text: "Remove protective guard, inspect chain links for wear",        dur: "15 min" },
  { text: "Clean chain assembly with degreaser, dry with compressed air", dur: "10 min" },
  { text: "Apply synthetic lubricant GR-4 (120g, even distribution)",     dur: "5 min"  },
  { text: "Verify tensioner alignment with laser (±0.5mm tolerance)",     dur: "5 min"  },
  { text: "Reinstall guard, restore power, perform load test",            dur: "8 min"  },
  { text: "Log results, attach photos, close work order",                 dur: "2 min"  },
];

const DESCRIPTION =
  "Full recovery procedure for peg chain motor T60M2 torque limit exceedance. Execute preventive inspection, cleaning, and lubrication sequence to restore nominal operating parameters.";

const INFO_FIELDS = [
  { label: "ASSIGNED TO", value: "Marco Rossi",  sub: "Senior Maintenance"       },
  { label: "LOCATION",    value: "Plant 1",      sub: "Baking Line 02 / Sector 8" },
  { label: "DUE",         value: "Today, 18:00", sub: "in 2h 30m"                 },
  { label: "EST. TIME",   value: "1h 00m",       sub: ""                          },
  { label: "EST. COST",   value: "€ 1,400",      sub: ""                          },
];

// ═══════════════════════════════════════════════════════════════════════════
//                                MAIN SCENE
// ═══════════════════════════════════════════════════════════════════════════
export const SceneWorkOrderExecCinema: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isS1 = frame < SHOT.S2.start;
  const bgColor = isS1 ? DARK_BG : LIGHT_BG;

  // ── Outgoing transition — washes scene to BlobHold's LIGHT_BG (#F0F3FF)
  //    over the last 20 frames so the cut into "Faster repairs" feels like a
  //    dissolve rather than a hard jump. BlobHold's own 12-frame sceneOp
  //    fade-in completes the handshake on the other side.
  const BLOB_HOLD_LIGHT_BG = "#F0F3FF";
  const exitStart  = CINEMA_WO_DURATION - 20; // frame 250
  const exitFadeOp = Math.min(1, Math.max(0, (frame - exitStart) / 20));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        fontFamily: geistFont,
        overflow: "hidden",
      }}
    >
      {isS1 && <Shot1Turret frame={frame} />}

      {frame >= SHOT.S2.start && (
        <CardStage frame={frame} fps={fps} />
      )}

      {/* Light-wash exit overlay — covers everything, blends into BlobHold */}
      {exitFadeOp > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: BLOB_HOLD_LIGHT_BG,
            opacity: exitFadeOp,
            zIndex: 200,
            pointerEvents: "none",
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//                 SHOT 1 — WERMA STACK LIGHT (right) + text (left)
// ═══════════════════════════════════════════════════════════════════════════
const Shot1Turret: React.FC<{ frame: number }> = ({ frame }) => {
  const f = frame - SHOT.S1.start;

  // ─── Turret rises from BELOW into centered position ───────────────────
  const riseT = clamp((f - S1_BEATS.turretRise.start) /
    (S1_BEATS.turretRise.end - S1_BEATS.turretRise.start), 0, 1);
  const riseEase = 1 - Math.pow(1 - riseT, 4);
  const riseY = 900 * (1 - riseEase);                 // 900 → 0
  const riseScale = 0.92 + 0.08 * riseEase;           // subtle scale-up

  // ─── Red beacon pulse (starts right as turret settles) ────────────────
  const beaconStart = S1_BEATS.turretRise.end - 4;
  const beaconOn = f >= beaconStart;
  const pulseF = Math.max(0, f - beaconStart);
  const beaconCycle = (pulseF % 22) / 22;
  const redPulse = beaconOn
    ? Math.max(0, Math.sin(beaconCycle * Math.PI * 2)) * 0.85 +
      (beaconCycle < 0.18 ? 0.15 * (1 - beaconCycle / 0.18) : 0)
    : 0;

  // ─── Phase A: LEFT text "Oven 2 / Motor T60M2" ───────────────────────
  const leftInT  = clamp((f - S1_BEATS.leftIn.start)  / (S1_BEATS.leftIn.end - S1_BEATS.leftIn.start), 0, 1);
  const leftInE  = 1 - Math.pow(1 - leftInT, 3);
  // Left-out: slides slightly LEFT + fades out (no arc)
  const leftOutT = clamp((f - S1_BEATS.leftOut.start) / (S1_BEATS.leftOut.end - S1_BEATS.leftOut.start), 0, 1);
  const leftOutE = 1 - Math.pow(1 - leftOutT, 2);
  const leftTx = (1 - leftInE) * -60 + leftOutE * -80;
  const leftOpacity = leftInE * (1 - leftOutE);

  // ─── Phase B: RIGHT text "Torque Fault" — slides in from right ────────
  const rightT = clamp((f - S1_BEATS.rightIn.start) / (S1_BEATS.rightIn.end - S1_BEATS.rightIn.start), 0, 1);
  const rightE = 1 - Math.pow(1 - rightT, 3);
  const rightTx = (1 - rightE) * 90;  // slides in from +90px
  const rightVisible = f >= S1_BEATS.rightIn.start;
  // Faint glow flicker on arrival
  const critFlicker = 0.92 + 0.08 * Math.sin(f / 4);

  // ─── Exit fade-out to black (last 5f of S1) ───────────────────────────
  const exitT = clamp((SHOT.S1.end - SHOT.S1.start - f) / 5, 0, 1);

  return (
    <AbsoluteFill
      style={{
        background: "#000000",
        opacity: exitT,
        overflow: "hidden",
      }}
    >
      {/* Subtle vertical light gradient (tungsten spill) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(40,40,50,0.35) 0%, rgba(0,0,0,0.0) 60%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Pulsing red halo behind the centered turret */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 1000,
          height: 1200,
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(229,57,53,0.42) 0%, rgba(229,57,53,0.12) 35%, transparent 65%)",
          filter: "blur(90px)",
          opacity: redPulse * 0.85 * riseEase,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* ─── TURRET — CENTERED 3D model, rises from below ───────────── */}
      <div
        style={{
          position: "absolute",
          top: "52%",
          left: "50%",
          width: 860,
          height: 860,
          transform: `translate(-50%, calc(-50% + ${riseY}px)) scale(${riseScale})`,
          transformOrigin: "50% 100%",
          zIndex: 2,
          filter: `drop-shadow(0 60px 80px rgba(0,0,0,0.85))`,
        }}
      >
        <ThreeCanvas width={860} height={860} gl={{ antialias: true, alpha: true }}>
          <PerspectiveCamera makeDefault position={[0, 0.2, 3.2]} fov={30} near={0.1} far={50} />
          <ambientLight intensity={0.55} />
          <directionalLight position={[4, 6, 5]} intensity={1.3} />
          <directionalLight position={[-5, 3, -2]} intensity={0.5} color="#9FC0FF" />
          <pointLight position={[0, 0.3, 2.5]} intensity={redPulse * 3} color="#FF2828" distance={6} />
          <Suspense fallback={null}>
            <Turret3D redPulse={redPulse} frame={f} />
          </Suspense>
        </ThreeCanvas>
      </div>

      {/* ─── LEFT TEXT (phase A): Oven 2 / Motor T60M2 ──────────────
          zIndex 1 → sits BEHIND the turret (zIndex 2).
          Starts at left edge (no margin). The "2" sits right where the
          turret's left silhouette begins → partial occlusion as in reference. */}
      {leftOpacity > 0.01 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            transform: `translate(${leftTx}px, -50%)`,
            transformOrigin: "0% 50%",
            opacity: leftOpacity,
            zIndex: 1,
            fontFamily: geistFont,
            willChange: "transform, opacity",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          {/* "Oven 2" — Inter Black, huge, from left edge */}
          <div
            style={{
              fontSize: 240,
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "-0.04em",
              lineHeight: 0.88,
              whiteSpace: "nowrap",
            }}
          >
            Oven 2
          </div>
          {/* "Motor T60M2" — Inter Light, not bold, below */}
          <div
            style={{
              fontSize: 58,
              fontWeight: 300,
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "0.01em",
              lineHeight: 1,
              marginTop: 6,
              opacity: clamp((f - (S1_BEATS.leftIn.start + 6)) / 10, 0, 1),
            }}
          >
            Motor T60M2
          </div>
        </div>
      )}

      {/* ─── RIGHT TEXT (phase B): TORQUE FAULT ──────────────────────
          Also zIndex 1 → BEHIND the turret. Slides in from right,
          partially occluded by the turret on the left edge. */}
      {rightVisible && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: "6%",
            transform: `translate(${rightTx}px, -50%)`,
            transformOrigin: "50% 50%",
            opacity: rightE,
            zIndex: 1,
            textAlign: "right",
            fontFamily: geistFont,
            willChange: "transform, opacity",
          }}
        >
          <div
            style={{
              fontSize: 240,
              fontWeight: 900,
              color: CRITICAL,
              letterSpacing: "-0.04em",
              lineHeight: 0.88,
              textShadow: `0 0 40px rgba(229,57,53,0.35)`,
              opacity: critFlicker,
            }}
          >
            Torque
            <br />
            Fault
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── 3D Turret — loads sistema_andon.glb, isolates Cylinder_2 subtree ─────
//   The GLB scene contains: Cube_1 (base box), Cylinder_2 (THE TURRET — red,
//   orange, green segments + black housing), Cube.001_5 (machine/stand with
//   children). We render ONLY Cylinder_2 so the turret appears alone.
//   The red lens material (baseColor [1,0,0]) gets its emissive driven by
//   redPulse to simulate the alarm beacon.
const Turret3D: React.FC<{ redPulse: number; frame: number }> = ({ redPulse, frame }) => {
  const { scene } = useGLTF(staticFile("assets/turret.glb")) as unknown as {
    scene: THREE.Group;
  };

  // Extract Cylinder_2 subtree, RESET its transform, BAKE world matrix of its
  // children into their geometry, then auto-fit to a 2-unit bounding cube.
  const { turret, autoScale, centerOffset } = useMemo(() => {
    let found: THREE.Object3D | null = null;
    scene.traverse((obj) => {
      if (!found && obj.name === "Cylinder_2") found = obj;
    });
    if (!found) return { turret: null, autoScale: 1, centerOffset: new THREE.Vector3() };

    // Deep clone and bake its world matrix into geometry so local transform
    // can be safely reset (the Cylinder_2 node had scale 0.24 which would
    // otherwise either shrink or distort the object).
    const cloned = (found as THREE.Object3D).clone(true);
    (found as THREE.Object3D).updateMatrixWorld(true);

    // Capture the world matrix of the original node before reset
    const worldMatrix = (found as THREE.Object3D).matrixWorld.clone();

    // Apply that world matrix onto the cloned root
    cloned.applyMatrix4(worldMatrix);
    // Now reset the cloned root's transform to identity — geometry stays put
    cloned.position.set(0, 0, 0);
    cloned.rotation.set(0, 0, 0);
    cloned.scale.set(1, 1, 1);
    // Wait — applyMatrix4 sets position/rotation/scale from matrix, so
    // resetting them drops the bake. Better approach: bake matrix INTO
    // each child mesh's geometry instead.
    // Re-do with explicit geometry bake:
    const freshClone = (found as THREE.Object3D).clone(true);
    freshClone.updateMatrixWorld(true);
    freshClone.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (mesh.isMesh && mesh.geometry) {
        mesh.updateMatrixWorld(true);
        mesh.geometry = mesh.geometry.clone();
        mesh.geometry.applyMatrix4(mesh.matrixWorld);
        mesh.position.set(0, 0, 0);
        mesh.rotation.set(0, 0, 0);
        mesh.scale.set(1, 1, 1);
      }
    });
    freshClone.position.set(0, 0, 0);
    freshClone.rotation.set(0, 0, 0);
    freshClone.scale.set(1, 1, 1);

    // Now compute bbox (geometry is baked, so Box3.setFromObject is accurate)
    const bbox = new THREE.Box3().setFromObject(freshClone);
    const size = bbox.getSize(new THREE.Vector3());
    const center = bbox.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const TARGET = 2.0; // fit in a 2-unit tall cube
    const s = maxDim > 0 ? TARGET / maxDim : 1;

    return { turret: freshClone, autoScale: s, centerOffset: center };
  }, [scene]);

  // Drive red-material emissive by redPulse
  useMemo(() => {
    if (!turret) return;
    turret.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (!mat || !mat.color) return;
      const isRed =
        mat.color.r > 0.85 && mat.color.g < 0.15 && mat.color.b < 0.15;
      const isOrange =
        mat.color.r > 0.85 && mat.color.g > 0.4 && mat.color.g < 0.7 && mat.color.b < 0.15;
      const isGreen =
        mat.color.r < 0.15 && mat.color.g > 0.85 && mat.color.b < 0.15;
      if (isRed) {
        mat.emissive = new THREE.Color("#FF3030");
        mat.emissiveIntensity = 0.2 + redPulse * 2.2;
        mat.toneMapped = false;
      } else if (isOrange) {
        mat.emissive = new THREE.Color("#FF8800");
        mat.emissiveIntensity = 0.15;
      } else if (isGreen) {
        mat.emissive = new THREE.Color("#30FF40");
        mat.emissiveIntensity = 0.15;
      }
    });
  }, [turret, redPulse]);

  if (!turret) return null;

  // Continuous Y-spin (~110°/sec at 30fps) — fast showcase orbit
  const spinY = frame * 0.064;
  // Slight forward tilt (~14°) so turret looks tall like reference
  const tiltX = -0.24;
  const wobbleZ = Math.sin(frame * 0.04) * 0.04;

  // Outer group handles tilt (fixed angle), inner group spins on Y.
  // Middle group flips X (π) so RED is on top, GREEN on bottom — like reference.
  return (
    <group scale={autoScale} rotation={[tiltX, 0, wobbleZ]}>
      <group rotation={[0, spinY, 0]}>
        <group rotation={[Math.PI, 0, 0]}>
          <group position={[-centerOffset.x, -centerOffset.y, -centerOffset.z]}>
            <primitive object={turret} />
          </group>
        </group>
      </group>
    </group>
  );
};

// ─── LEGACY CSS WERMA (kept but unused) ───────────────────────────────────
const WermaStackLight: React.FC<{ redPulse: number }> = ({ redPulse }) => {
  // redPulse 0..1 drives only the RED segment brightness (alarm indicator).
  // Orange and green stay at a steady dim state (not active alarms).
  const redBright = 0.40 + redPulse * 0.60;
  const redGlow   = 40 + redPulse * 110;

  // Realistic lens segment with multi-stop glass gradient + deep side shading.
  const segment = (
    color: { r: number; g: number; b: number },
    brightness: number,
    glow: number
  ): React.CSSProperties => ({
    width: 230,
    height: 260,
    position: "relative",
    // Vertical glass-dome gradient (dim top, brighter middle, dimmer bottom)
    background: `linear-gradient(180deg,
      rgba(${color.r * 0.40}, ${color.g * 0.40}, ${color.b * 0.40}, ${brightness * 0.95}) 0%,
      rgba(${color.r * 0.75}, ${color.g * 0.75}, ${color.b * 0.75}, ${brightness * 1.05}) 20%,
      rgba(${color.r}, ${color.g}, ${color.b}, ${brightness * 1.2}) 48%,
      rgba(${color.r * 0.85}, ${color.g * 0.85}, ${color.b * 0.85}, ${brightness * 1.05}) 72%,
      rgba(${color.r * 0.40}, ${color.g * 0.40}, ${color.b * 0.40}, ${brightness * 0.85}) 100%)`,
    boxShadow: glow > 0
      ? `0 0 ${glow}px rgba(${color.r},${color.g},${color.b},0.75),
         0 0 ${glow * 2}px rgba(${color.r},${color.g},${color.b},0.35),
         inset -14px 0 28px rgba(0,0,0,0.55),
         inset 14px 0 28px rgba(0,0,0,0.55),
         inset 0 4px 10px rgba(255,255,255,0.10),
         inset 0 -6px 14px rgba(0,0,0,0.35)`
      : `inset -14px 0 28px rgba(0,0,0,0.55),
         inset 14px 0 28px rgba(0,0,0,0.55),
         inset 0 4px 10px rgba(255,255,255,0.06),
         inset 0 -6px 14px rgba(0,0,0,0.35)`,
    border: "2px solid rgba(10,10,14,0.98)",
    borderLeft: "3px solid rgba(0,0,0,1)",
    borderRight: "3px solid rgba(0,0,0,1)",
    overflow: "hidden",
  });

  // Fine vertical lens ridges (Fresnel pattern)
  const ridges = (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `repeating-linear-gradient(90deg,
          rgba(0,0,0,0.22) 0px,
          rgba(0,0,0,0.22) 1px,
          transparent 1px,
          transparent 9px)`,
        pointerEvents: "none",
      }}
    />
  );

  // Horizontal Fresnel rings
  const fresnel = (
    <>
      <div style={{ position: "absolute", top: "18%", left: 0, right: 0, height: 1, background: "rgba(0,0,0,0.32)" }} />
      <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(0,0,0,0.22)" }} />
      <div style={{ position: "absolute", top: "82%", left: 0, right: 0, height: 1, background: "rgba(0,0,0,0.32)" }} />
    </>
  );

  // Bright internal LED bulb (only when lit)
  const innerBulb = (color: { r: number; g: number; b: number }, intensity: number) => (
    <div
      style={{
        position: "absolute",
        top: "46%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 70,
        height: 70,
        borderRadius: "50%",
        background: `radial-gradient(circle,
          rgba(255,250,248,${intensity * 1.0}) 0%,
          rgba(${color.r + 30},${color.g + 50},${color.b + 40},${intensity * 0.85}) 25%,
          rgba(${color.r},${color.g},${color.b},${intensity * 0.55}) 55%,
          transparent 85%)`,
        filter: `blur(${4 - intensity * 3}px)`,
      }}
    />
  );

  // Left & right specular highlights (glass reflection)
  const speculars = (
    <>
      <div
        style={{
          position: "absolute",
          top: "6%",
          left: "10%",
          width: 14,
          height: "80%",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,0) 100%)",
          borderRadius: 4,
          filter: "blur(3px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "14%",
          right: "12%",
          width: 6,
          height: "60%",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 100%)",
          borderRadius: 3,
          filter: "blur(2px)",
        }}
      />
    </>
  );

  return (
    <div
      style={{
        position: "relative",
        width: 260,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* ─── TOP CAP (black, with vents & beveled edge) ───────────────── */}
      <div
        style={{
          width: 232,
          height: 56,
          background:
            "linear-gradient(180deg, #33333B 0%, #1D1D22 45%, #0B0B0E 100%)",
          border: "2px solid rgba(0,0,0,0.98)",
          borderRadius: "6px 6px 3px 3px",
          boxShadow:
            "inset 0 -4px 10px rgba(255,255,255,0.06), inset 0 3px 6px rgba(255,255,255,0.18), 0 2px 3px rgba(0,0,0,0.7)",
          position: "relative",
          zIndex: 3,
        }}
      >
        {/* Vent slots (cooling louvres) */}
        <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", width: 150, height: 3, background: "rgba(0,0,0,0.85)", borderRadius: 1.5 }} />
        <div style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", width: 120, height: 3, background: "rgba(0,0,0,0.85)", borderRadius: 1.5 }} />
        <div style={{ position: "absolute", top: 30, left: "50%", transform: "translateX(-50%)", width: 90, height: 3, background: "rgba(0,0,0,0.85)", borderRadius: 1.5 }} />
        <div style={{ position: "absolute", top: 40, left: "50%", transform: "translateX(-50%)", width: 60, height: 3, background: "rgba(0,0,0,0.85)", borderRadius: 1.5 }} />
      </div>

      {/* Divider gasket */}
      <div style={{ width: 238, height: 6, background: "linear-gradient(180deg,#08080A 0%,#18181F 50%,#08080A 100%)", border: "1px solid rgba(0,0,0,0.95)", borderRadius: 1, marginTop: -1, zIndex: 3 }} />

      {/* ─── RED segment (active, pulsing alarm) ─────────────────────── */}
      <div style={segment({ r: 232, g: 48, b: 48 }, redBright, redGlow)}>
        {ridges}
        {fresnel}
        {innerBulb({ r: 232, g: 48, b: 48 }, redPulse)}
        {speculars}
      </div>

      {/* Divider */}
      <div style={{ width: 238, height: 6, background: "linear-gradient(180deg,#08080A 0%,#18181F 50%,#08080A 100%)", border: "1px solid rgba(0,0,0,0.95)", borderRadius: 1, marginTop: -1, zIndex: 3 }} />

      {/* ─── ORANGE segment (inactive, dim amber) ────────────────────── */}
      <div style={segment({ r: 230, g: 140, b: 32 }, 0.55, 0)}>
        {ridges}
        {fresnel}
        {speculars}
      </div>

      {/* Divider */}
      <div style={{ width: 238, height: 6, background: "linear-gradient(180deg,#08080A 0%,#18181F 50%,#08080A 100%)", border: "1px solid rgba(0,0,0,0.95)", borderRadius: 1, marginTop: -1, zIndex: 3 }} />

      {/* ─── GREEN segment (inactive, dim) ───────────────────────────── */}
      <div style={segment({ r: 44, g: 170, b: 82 }, 0.55, 0)}>
        {ridges}
        {fresnel}
        {speculars}
      </div>

      {/* Divider */}
      <div style={{ width: 238, height: 5, background: "linear-gradient(180deg,#08080A 0%,#18181F 50%,#08080A 100%)", marginTop: -1, zIndex: 3 }} />

      {/* ─── BASE HOUSING (with Werma label & mounting screws) ───────── */}
      <div
        style={{
          width: 270,
          height: 98,
          background:
            "linear-gradient(180deg, #34343C 0%, #1E1E24 40%, #0C0C10 100%)",
          border: "2px solid rgba(0,0,0,0.98)",
          borderRadius: "6px 6px 12px 12px",
          boxShadow:
            "inset 0 3px 5px rgba(255,255,255,0.10), inset 0 -3px 6px rgba(0,0,0,0.6), 0 6px 14px rgba(0,0,0,0.7)",
          position: "relative",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          padding: "10px 14px",
        }}
      >
        {/* 4 mounting screws (corners) */}
        {[
          { top: 8,    left: 8 },
          { top: 8,    right: 8 },
          { bottom: 10, left: 8 },
          { bottom: 10, right: 8 },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...pos,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 30% 30%, #5A5A62 0%, #2C2C32 55%, #0A0A0E 100%)",
              boxShadow: "inset 0 0 1px rgba(0,0,0,0.9), 0 1px 1px rgba(255,255,255,0.08)",
            }}
          />
        ))}

        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: "rgba(220,225,235,0.78)",
            letterSpacing: "0.18em",
            fontFamily: geistFont,
          }}
        >
          WERMA
        </div>
        <div
          style={{
            fontSize: 9,
            color: "rgba(180,185,195,0.55)",
            letterSpacing: "0.14em",
            fontFamily: geistFont,
          }}
        >
          KombiSIGN · 690.100.55
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
          <div style={{ fontSize: 7.5, color: "rgba(180,185,195,0.48)", letterSpacing: "0.1em", fontWeight: 600 }}>24V DC</div>
          <div style={{ fontSize: 7.5, color: "rgba(180,185,195,0.48)", letterSpacing: "0.1em", fontWeight: 600 }}>IP65</div>
          <div style={{ fontSize: 7.5, color: "rgba(180,185,195,0.48)", letterSpacing: "0.1em", fontWeight: 600 }}>CE</div>
        </div>
      </div>

      {/* Mounting plate ring */}
      <div
        style={{
          width: 120,
          height: 12,
          background: "linear-gradient(180deg,#1C1C22 0%,#0A0A0E 100%)",
          border: "1.5px solid rgba(0,0,0,0.98)",
          borderRadius: "3px 3px 2px 2px",
          marginTop: -2,
          zIndex: 2,
          boxShadow: "inset 0 1px 2px rgba(255,255,255,0.06)",
        }}
      />

      {/* Cable going down */}
      <div
        style={{
          width: 14,
          height: 110,
          background: "linear-gradient(180deg,#08080A 0%,#18181F 40%,#08080A 100%)",
          borderRadius: 3,
          marginTop: -1,
          zIndex: 1,
          boxShadow: "inset 2px 0 3px rgba(255,255,255,0.05), inset -2px 0 3px rgba(0,0,0,0.6)",
        }}
      />
    </div>
  );
};

// ─── (legacy beacon — kept for reference, not mounted) ────────────────────
const SiemensBeacon: React.FC<{ pulse: number }> = ({ pulse }) => {
  const lensBrightness = 0.35 + pulse * 0.65;
  const glowSize = 20 + pulse * 80;

  return (
    <div
      style={{
        position: "relative",
        width: 200,
        height: 620,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        filter: `drop-shadow(0 20px 40px rgba(0,0,0,0.6))`,
      }}
    >
      {/* Outer halo glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${CRITICAL_GLOW} 0%, rgba(229,57,53,0.15) 40%, transparent 70%)`,
          opacity: pulse,
          pointerEvents: "none",
          filter: `blur(${glowSize / 4}px)`,
          zIndex: 0,
        }}
      />

      {/* ─── TOP CAP (black, slightly domed) ──────────────────────────── */}
      <div
        style={{
          width: 130,
          height: 26,
          background:
            "linear-gradient(180deg, #2A2A30 0%, #1A1A1F 50%, #0E0E12 100%)",
          borderRadius: "65px 65px 2px 2px",
          border: "1px solid rgba(0,0,0,0.9)",
          boxShadow: "inset 0 -2px 4px rgba(255,255,255,0.06), inset 0 2px 3px rgba(255,255,255,0.08)",
          position: "relative",
          zIndex: 3,
        }}
      >
        {/* Top vents */}
        <div style={{ position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)", width: 80, height: 2, background: "rgba(0,0,0,0.7)", borderRadius: 1 }} />
        <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: 60, height: 2, background: "rgba(0,0,0,0.7)", borderRadius: 1 }} />
      </div>

      {/* Black rim / gasket */}
      <div
        style={{
          width: 142,
          height: 8,
          background: "linear-gradient(180deg, #0A0A0E 0%, #14141A 100%)",
          border: "1px solid rgba(0,0,0,0.9)",
          borderRadius: 1,
          marginTop: -1,
          zIndex: 3,
        }}
      />

      {/* ─── RED LENS (cylindrical with vertical ridges) ──────────────── */}
      <div
        style={{
          width: 150,
          height: 220,
          position: "relative",
          marginTop: -1,
          zIndex: 3,
          background: `linear-gradient(180deg,
            rgba(180, 30, 30, ${lensBrightness}) 0%,
            rgba(230, 70, 60, ${lensBrightness * 1.1}) 30%,
            rgba(255, 90, 80, ${lensBrightness * 1.2}) 50%,
            rgba(210, 50, 45, ${lensBrightness * 1.0}) 75%,
            rgba(140, 20, 20, ${lensBrightness * 0.8}) 100%)`,
          boxShadow: `0 0 ${glowSize}px ${CRITICAL_GLOW}, inset -8px 0 16px rgba(0,0,0,0.35), inset 8px 0 16px rgba(0,0,0,0.35)`,
          border: "2px solid rgba(25,25,30,0.9)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        {/* Vertical ridges (lens optic texture) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `repeating-linear-gradient(90deg,
              rgba(0,0,0,0.15) 0px,
              rgba(0,0,0,0.15) 1px,
              transparent 1px,
              transparent 8px)`,
            pointerEvents: "none",
          }}
        />
        {/* Horizontal band markers (mold lines) */}
        <div style={{ position: "absolute", top: "18%", left: 0, right: 0, height: 1, background: "rgba(0,0,0,0.25)" }} />
        <div style={{ position: "absolute", top: "82%", left: 0, right: 0, height: 1, background: "rgba(0,0,0,0.25)" }} />

        {/* Inner LED bulb */}
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(255,240,235,${pulse}) 0%, rgba(255,120,100,${pulse * 0.9}) 30%, rgba(229,57,53,${pulse * 0.6}) 60%, transparent 80%)`,
            filter: `blur(${3 - pulse * 2.5}px)`,
          }}
        />
        {/* Specular highlight on left side */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "15%",
            width: 12,
            height: "70%",
            background: `linear-gradient(180deg, rgba(255,255,255,${0.15 + pulse * 0.25}) 0%, transparent 100%)`,
            borderRadius: 4,
            filter: "blur(3px)",
          }}
        />
      </div>

      {/* ─── COLLAR (black gasket between lens and pole) ──────────────── */}
      <div
        style={{
          width: 160,
          height: 22,
          background:
            "linear-gradient(180deg, #0F0F14 0%, #1E1E24 30%, #14141A 70%, #0A0A0E 100%)",
          border: "1px solid rgba(0,0,0,0.95)",
          borderRadius: 3,
          marginTop: -1,
          zIndex: 3,
          boxShadow: "inset 0 1px 2px rgba(255,255,255,0.06)",
          position: "relative",
        }}
      >
        {/* Decorative band */}
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(100,100,110,0.25)", transform: "translateY(-50%)" }} />
      </div>

      {/* ─── POLE (brushed metal post) ────────────────────────────────── */}
      <div
        style={{
          width: 32,
          flex: 1,
          background:
            "linear-gradient(90deg, #151519 0%, #3A3A42 25%, #6B6B75 50%, #3A3A42 75%, #151519 100%)",
          boxShadow: "inset 0 1px 2px rgba(255,255,255,0.08)",
          borderRadius: 1,
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Specular highlight */}
        <div
          style={{
            position: "absolute",
            left: "40%",
            top: 0,
            width: 3,
            height: "100%",
            background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.15) 100%)",
          }}
        />
      </div>

      {/* ─── BASE HOUSING ─────────────────────────────────────────────── */}
      <div
        style={{
          width: 200,
          height: 42,
          background:
            "linear-gradient(180deg, #2A2A32 0%, #1A1A20 40%, #0E0E12 100%)",
          border: "1px solid rgba(0,0,0,0.95)",
          borderRadius: "6px 6px 2px 2px",
          boxShadow: "inset 0 1px 2px rgba(255,255,255,0.08), 0 2px 4px rgba(0,0,0,0.5)",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* SIEMENS-style embossed label area */}
        <div
          style={{
            position: "absolute",
            top: 4,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 6,
            color: "rgba(180,180,190,0.4)",
            fontWeight: 700,
            letterSpacing: "0.15em",
            fontFamily: "sans-serif",
          }}
        >
          8WD42-5BD
        </div>
        {/* 4 bolts */}
        <div style={{ position: "absolute", bottom: 4, left: 0, right: 0, display: "flex", justifyContent: "space-around", padding: "0 20px" }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "radial-gradient(circle at 30% 30%, #4A4A52 0%, #1A1A20 70%)",
                border: "0.5px solid rgba(0,0,0,0.8)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//             SHOTS 2-5 — CARD PIPELINE (Heygrow-style tilt + hero text)
// ═══════════════════════════════════════════════════════════════════════════
const CardStage: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // ─── Base entrance (S2) ────────────────────────────────────────────────
  const tilt = tiltReveal(
    { frame, start: SHOT.S2.start, duration: SHOT.S2.end - SHOT.S2.start },
    { fromRotateX: 16, fromScale: 0.85, fromY: 60 }
  );

  // ─── S5 sub-phase camera choreography ─────────────────────────────────
  const s5f = frame - SHOT.S5.start;
  const inS5 = frame >= SHOT.S5.start;

  // Phase A (0-16)  — card tilts HARD (65°) + hero text fades in SYNC
  // Phase B (16-60) — steady tilted view, steps compile, tiny forward drift
  // Phase C (60-95) — we RUN OVER the card toward the title: card rushes
  //                    forward via translateZ (passing beneath us with motion
  //                    blur), hero text rushes toward viewer (scale up). Uses
  //                    real Z-depth so the whoosh feels physical.
  const TILT_BASE = 65; // degrees — near-tabletop, dramatic
  let cardRotX    = 0;
  let cardScale   = 1;
  let cardY       = 0;
  let cardZ       = 0;      // translateZ — used during dolly
  let cardOpacity = 1;
  let cardBlur    = 0;

  let heroOpacity = 0;
  let heroScale   = 1;
  let heroY       = 0;
  let heroZ       = 0;
  let heroBlur    = 0;

  if (inS5) {
    // Phase A — tilt in + hero fade (synced)
    const aT = clamp(s5f / 16, 0, 1);
    const aE = 1 - Math.pow(1 - aT, 3);
    cardRotX = TILT_BASE * aE;
    cardY    = 180 * aE;           // card lowered to leave room for hero
    heroOpacity = aE;
    heroY    = (1 - aE) * 30;
    // Subtle forward drift during steady phase B
    if (s5f >= 16 && s5f < 60) {
      const drift = (s5f - 16) / 44;
      cardZ     = drift * 60;      // slow creep toward camera
      heroScale = 1 + drift * 0.035;
    }
  }

  // Acceleration-feel layer (populated in Phase C) — speed streaks, bright
  // rim vignette, chromatic aberration, tiny camera shake.
  let accelT  = 0;    // 0..1 — overall intensity of acceleration FX
  let shakeX  = 0;
  let shakeY  = 0;

  if (s5f >= 60) {
    // Phase C — RUN OVER THE CARD (exponential forward acceleration)
    const cT = clamp((s5f - 60) / 35, 0, 1);
    const cE = cT < 0.5
      ? 2 * cT * cT
      : 1 - Math.pow(-2 * cT + 2, 3) / 2;
    cardRotX    = TILT_BASE + 8 * cE;
    cardZ       = 60 + 1400 * cE;
    cardY       = 180 + 80 * cE;
    cardOpacity = cT < 0.55 ? 1 : Math.max(0, 1 - (cT - 0.55) / 0.4);
    // Strong motion blur on card — starts early, ramps hard like Heygrow
    cardBlur    = Math.max(0, cT - 0.15) * 42;
    // Hero grows via perspective formula — unified with card
    const PERSP = 1000;
    const heroEquivZ = 60 + 740 * cE;
    heroScale = PERSP / Math.max(180, PERSP - heroEquivZ);
    heroZ     = 0;
    heroY     = cE * 370;
    // Hero text motion blur starts at mid-phase, moderate strength
    heroBlur  = Math.max(0, cT - 0.45) * 18;

    // ── Acceleration FX — intensity follows the derivative-like curve ──
    // Peak strength around mid-to-late phase, tapers just before cut
    accelT = Math.sin(Math.min(1, cT / 0.85) * Math.PI);
    // Pseudo-random shake proportional to accelT, but deterministic (frame-based)
    const shakeSeed = s5f * 0.7;
    shakeX = Math.sin(shakeSeed * 2.1) * 4 * accelT;
    shakeY = Math.cos(shakeSeed * 1.7) * 3 * accelT;
  }

  // No gradual darkening — bg stays light through all of S5 so dark hero
  // text remains visible. The flash at S6 handles the light→dark jump.
  const bgDarkT = 0;

  return (
    <AbsoluteFill
      style={{
        // Very strong perspective for tabletop feel + dramatic Z whoosh
        perspective: inS5 ? 1000 : 2400,
        perspectiveOrigin: inS5 ? "50% 22%" : "50% 50%",
        alignItems: "center",
        justifyContent: "center",
        background: bgDarkT > 0
          ? `linear-gradient(180deg, rgba(251,251,252,${1 - bgDarkT}) 0%, rgba(244,244,247,${1 - bgDarkT}) 100%), ${DARK_BG}`
          : "linear-gradient(180deg, #FBFBFC 0%, #F4F4F7 100%)",
        overflow: "hidden",
        // Whole-stage shake — applies to every child, pure camera vibration
        transform: accelT > 0 ? `translate3d(${shakeX}px, ${shakeY}px, 0)` : undefined,
      }}
    >
      {/* ─── HERO TEXT (top, "Eight steps. One plan.") ─────────────────── */}
      {inS5 && (
        <div
          style={{
            position: "absolute",
            top: "16%",
            left: "50%",
            transform: `translate3d(-50%, ${heroY}px, ${heroZ}px) scale(${heroScale})`,
            transformOrigin: "50% 50%",
            opacity: heroOpacity,
            filter: heroBlur > 0 ? `blur(${heroBlur}px)` : undefined,
            textAlign: "center",
            width: "100%",
            pointerEvents: "none",
            willChange: "transform, opacity",
          }}
        >
          <div
            style={{
              fontSize: 92,
              fontWeight: 600,
              color: INK,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              display: "inline-flex",
              gap: 20,
              alignItems: "baseline",
            }}
          >
            <span>{HERO_TEXT_PART1}</span>
            <span
              style={{
                color: ACCENT,
                fontStyle: "italic",
                fontWeight: 500,
                fontFamily: "'Times New Roman', Georgia, serif",
                letterSpacing: "-0.015em",
              }}
            >
              {HERO_TEXT_PART2}
            </span>
          </div>
        </div>
      )}

      {/* ─── CARD (tilted 3D during S5, translateZ whoosh in phase C) ── */}
      <div
        style={{
          transform: `translate3d(0, ${tilt.translateY + cardY}px, ${cardZ}px) scale(${tilt.scale * cardScale}) rotateX(${tilt.rotateX + cardRotX}deg)`,
          opacity: tilt.opacity * cardOpacity,
          transformOrigin: "50% 50%",
          transformStyle: "preserve-3d",
          filter: cardBlur > 0 ? `blur(${cardBlur}px)` : undefined,
          willChange: "transform, opacity",
        }}
      >
        <WorkOrderCard frame={frame} fps={fps} />
      </div>

      {/* ─── ACCELERATION FX — Heygrow-style soft colored halos ────────
          Soft bokeh/lens glows that catch light as we rush past. Larger and
          more visible than before. Plus directional motion blur on card
          (via cardBlur) and hero text (heroBlur) already handles the
          "motion" feel. */}
      {accelT > 0 && (
        <>
          {/* Left blue glow — bigger, more visible */}
          <div
            style={{
              position: "absolute",
              top: "35%",
              left: "-5%",
              width: 720,
              height: 720,
              borderRadius: "50%",
              pointerEvents: "none",
              opacity: accelT * 0.85,
              background:
                "radial-gradient(circle, rgba(100,150,255,0.7) 0%, rgba(100,150,255,0.25) 35%, transparent 65%)",
              filter: "blur(60px)",
              mixBlendMode: "screen",
              transform: `translateX(${-accelT * 120}px)`,
            }}
          />
          {/* Right purple-pink glow — bigger */}
          <div
            style={{
              position: "absolute",
              top: "40%",
              right: "-5%",
              width: 720,
              height: 720,
              borderRadius: "50%",
              pointerEvents: "none",
              opacity: accelT * 0.8,
              background:
                "radial-gradient(circle, rgba(220,140,230,0.65) 0%, rgba(220,140,230,0.22) 35%, transparent 65%)",
              filter: "blur(60px)",
              mixBlendMode: "screen",
              transform: `translateX(${accelT * 120}px)`,
            }}
          />
          {/* Top center cold blue glow — like light coming from above */}
          <div
            style={{
              position: "absolute",
              top: "-20%",
              left: "50%",
              width: 900,
              height: 600,
              borderRadius: "50%",
              pointerEvents: "none",
              opacity: accelT * 0.4,
              background:
                "radial-gradient(ellipse, rgba(180,210,255,0.55) 0%, transparent 70%)",
              filter: "blur(50px)",
              mixBlendMode: "screen",
              transform: `translate(-50%, 0)`,
            }}
          />
        </>
      )}
    </AbsoluteFill>
  );
};

// ─── Card ──────────────────────────────────────────────────────────────────
const WorkOrderCard: React.FC<{ frame: number; fps: number }> = ({ frame }) => {
  // Title typing (starts 6f into shot 2)
  const titleStart = SHOT.S2.start + 6;
  const titleChars = clamp(Math.floor((frame - titleStart) * 1.15), 0, TITLE.length);
  const titleShown = TITLE.slice(0, titleChars);
  const titleDone = titleChars >= TITLE.length;

  // Description typing
  const descStart = SHOT.S4.start;
  const descLen = clamp(Math.floor((frame - descStart) * 1.5), 0, DESCRIPTION.length);
  const descShown = DESCRIPTION.slice(0, descLen);
  const descActive = frame >= descStart && frame < SHOT.S5.start - 4;

  // Dim non-steps sections during late S5 to focus on steps
  const dimT = clamp((frame - (SHOT.S5.start + 20)) / 25, 0, 1);
  const nonStepsOpacity = 1 - dimT * 0.55;

  // ─── AI-generating glow border ───────────────────────────────────────
  // Visible from just after card reveal (S2.start + 4) until the laser
  // sweep hands off to the steps section (S5.start). Rotates continuously,
  // conveys "AriA is actively writing this work order".
  const glowFadeIn  = clamp((frame - (SHOT.S2.start + 4)) / 10, 0, 1);
  const glowFadeOut = clamp((SHOT.S5.start - frame) / 8, 0, 1);
  const glowActive  = Math.min(glowFadeIn, glowFadeOut);
  const glowRot     = (frame * 4) % 360; // rotates ~4°/frame = 120°/sec

  return (
    <div
      style={{
        position: "relative",
        width: 1480,
        borderRadius: 28,
      }}
    >
      {/* Rotating AI glow — sits behind the card, clipped to the border */}
      {glowActive > 0 && (
        <>
          {/* Outer spinning conic gradient (soft, wide) */}
          <div
            style={{
              position: "absolute",
              inset: -6,
              borderRadius: 32,
              background: `conic-gradient(from ${glowRot}deg at 50% 50%,
                rgba(59,91,219,0) 0deg,
                rgba(59,91,219,0) 270deg,
                rgba(126,161,255,0.95) 320deg,
                rgba(59,91,219,1) 340deg,
                rgba(126,161,255,0.95) 360deg,
                rgba(59,91,219,0) 0deg)`,
              filter: "blur(14px)",
              opacity: glowActive * 0.85,
              pointerEvents: "none",
            }}
          />
          {/* Inner spinning bright ring (tight, sharper) */}
          <div
            style={{
              position: "absolute",
              inset: -2,
              borderRadius: 30,
              background: `conic-gradient(from ${glowRot}deg at 50% 50%,
                rgba(59,91,219,0) 0deg,
                rgba(59,91,219,0) 280deg,
                rgba(180,205,255,1) 325deg,
                rgba(59,91,219,1) 345deg,
                rgba(180,205,255,1) 360deg,
                rgba(59,91,219,0) 0deg)`,
              filter: "blur(3px)",
              opacity: glowActive * 0.9,
              pointerEvents: "none",
              // Mask so only the RING is visible (hollow center)
              WebkitMask:
                "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              maskComposite: "exclude",
              padding: 3,
            }}
          />
        </>
      )}

      {/* Actual card on top */}
      <div
        style={{
          position: "relative",
          width: "100%",
          backgroundColor: CARD_BG,
          borderRadius: 28,
          border: `1px solid ${CARD_BORDER}`,
          boxShadow: CARD_SHADOW,
          padding: "44px 56px",
          display: "flex",
          flexDirection: "column",
          gap: 30,
        }}
      >
      <div style={{ opacity: nonStepsOpacity, transition: "opacity 0.2s" }}>
        <CardHeader titleShown={titleShown} titleDone={titleDone} frame={frame} />
      </div>

      <div style={{ opacity: nonStepsOpacity }}>
        <InfoGrid frame={frame} />
      </div>

      {frame >= SHOT.S4.start && (
        <div style={{ opacity: nonStepsOpacity }}>
          <DescriptionBlock text={descShown} active={descActive} frame={frame} />
        </div>
      )}

      {frame >= SHOT.S5.start && (
        <div style={{ position: "relative" }}>
          {/* Laser sweep at S5 intro — blue horizontal beam that travels down
              the steps section over 14f, announcing the focus shift. */}
          {(() => {
            const sweepT = clamp((frame - SHOT.S5.start) / 14, 0, 1);
            if (sweepT >= 1) return null;
            return (
              <>
                <div
                  style={{
                    position: "absolute",
                    top: `${sweepT * 100}%`,
                    left: -8,
                    right: -8,
                    height: 3,
                    background: `linear-gradient(90deg, transparent 0%, ${ACCENT} 20%, #7EA1FF 50%, ${ACCENT} 80%, transparent 100%)`,
                    boxShadow: `0 0 24px ${ACCENT}, 0 0 48px rgba(59,91,219,0.4)`,
                    zIndex: 10,
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: -8,
                    right: -8,
                    height: `${sweepT * 100}%`,
                    background: `linear-gradient(180deg, transparent 0%, rgba(59,91,219,0.04) 70%, rgba(59,91,219,0.12) 100%)`,
                    zIndex: 9,
                    pointerEvents: "none",
                  }}
                />
              </>
            );
          })()}
          <StepsList frame={frame} />
        </div>
      )}
      </div>
    </div>
  );
};

// ─── Header ────────────────────────────────────────────────────────────────
const CardHeader: React.FC<{ titleShown: string; titleDone: boolean; frame: number }> = ({
  titleShown, titleDone, frame,
}) => {
  const ariaPulse = 0.5 + 0.5 * Math.sin(frame / 5);
  const critPulse = 0.85 + 0.15 * Math.sin(frame / 9);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 16, color: LABEL, fontWeight: 700, letterSpacing: "0.1em" }}>
          WO-2848
        </span>
        <Pill color={CRITICAL} bg="rgba(229,57,53,0.08)" pulse={critPulse}>CRITICAL</Pill>
        <Pill color={ACCENT} bg={ACCENT_SOFT} dotOpacity={ariaPulse}>Generated by AriA</Pill>
        <div style={{ flex: 1 }} />
        <Pill color="#E8830A" bg="rgba(232,131,10,0.08)">IN PROGRESS</Pill>
      </div>
      <h1
        style={{
          fontSize: 58,
          fontWeight: 600,
          color: INK,
          margin: 0,
          lineHeight: 1.04,
          letterSpacing: "-0.028em",
          minHeight: 62,
        }}
      >
        {titleShown}
        {!titleDone && <AriaCursor />}
      </h1>
    </div>
  );
};

const Pill: React.FC<{
  children: React.ReactNode;
  color: string;
  bg: string;
  pulse?: number;
  dotOpacity?: number;
}> = ({ children, color, bg, pulse = 1, dotOpacity }) => (
  <span
    style={{
      fontSize: 13,
      fontWeight: 700,
      color,
      backgroundColor: bg,
      padding: dotOpacity !== undefined ? "6px 12px 6px 10px" : "6px 12px",
      borderRadius: 8,
      letterSpacing: "0.06em",
      opacity: pulse,
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
    }}
  >
    {dotOpacity !== undefined && (
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: color,
          opacity: dotOpacity,
          boxShadow: `0 0 ${6 + dotOpacity * 10}px ${color}`,
        }}
      />
    )}
    {children}
  </span>
);

const AriaCursor: React.FC = () => (
  <span
    style={{
      display: "inline-block",
      width: 4,
      height: "0.88em",
      backgroundColor: ACCENT,
      marginLeft: 4,
      verticalAlign: "text-bottom",
      animation: "aria-blink 1s infinite",
      boxShadow: `0 0 14px ${ACCENT}`,
    }}
  >
    <style>{`@keyframes aria-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0.2; } }`}</style>
  </span>
);

// ─── Info grid ─────────────────────────────────────────────────────────────
const InfoGrid: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
    {INFO_FIELDS.map((f, i) => {
      const itemStart = SHOT.S3.start + 2 + i * 4;
      const t = clamp((frame - itemStart) / 16, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const overshoot = t < 1 ? 1 + Math.sin(eased * Math.PI) * 0.06 : 1;
      const shimmerT = clamp((frame - itemStart) / 14, 0, 1);
      const shimmerPos = shimmerT * 200 - 50;

      return (
        <div
          key={i}
          style={{
            position: "relative",
            background: "linear-gradient(180deg, #F8F9FB 0%, #F1F2F6 100%)",
            borderRadius: 16,
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            minHeight: 96,
            opacity: eased,
            transform: `scale(${overshoot}) translateY(${(1 - eased) * 14}px)`,
            border: "1px solid rgba(15,15,18,0.04)",
            overflow: "hidden",
          }}
        >
          {shimmerT > 0 && shimmerT < 1 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(100deg, transparent ${shimmerPos - 18}%, ${ACCENT_SOFT} ${shimmerPos}%, transparent ${shimmerPos + 18}%)`,
                pointerEvents: "none",
              }}
            />
          )}
          <span style={labelStyle}>{f.label}</span>
          <span style={{ fontSize: 24, fontWeight: 600, color: INK, lineHeight: 1.1, letterSpacing: "-0.012em" }}>
            {f.value}
          </span>
          {f.sub && <span style={{ fontSize: 14, color: MUTED, lineHeight: 1.2 }}>{f.sub}</span>}
        </div>
      );
    })}
  </div>
);

// ─── Description ───────────────────────────────────────────────────────────
const DescriptionBlock: React.FC<{ text: string; active: boolean; frame: number }> = ({
  text, active, frame,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <span style={labelStyle}>DESCRIPTION</span>
    <p
      style={{
        fontSize: 24,
        lineHeight: 1.5,
        color: INK,
        margin: 0,
        minHeight: 72,
        letterSpacing: "-0.005em",
      }}
    >
      {text}
      {active && (frame % 20) < 10 && <AriaCursor />}
    </p>
  </div>
);

// ─── Steps list ────────────────────────────────────────────────────────────
const StepsList: React.FC<{ frame: number }> = ({ frame }) => {
  // Progress: how many checks are done
  const completedCount = STEPS.filter((_, i) => {
    const itemStart = SHOT.S5.start + 2 + i * 4;
    return frame >= itemStart + 8;
  }).length;
  const progressT = completedCount / STEPS.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Header with progress bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <span style={labelStyle}>OPERATIONAL STEPS</span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: ACCENT,
            backgroundColor: ACCENT_SOFT,
            padding: "2px 10px",
            borderRadius: 999,
          }}
        >
          {STEPS.length}
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 13, color: MUTED, fontWeight: 600, letterSpacing: "0.02em" }}>
          {completedCount} / {STEPS.length} · 60 min total
        </span>
      </div>
      {/* Progress bar */}
      <div
        style={{
          height: 4,
          backgroundColor: "rgba(15,15,18,0.06)",
          borderRadius: 999,
          overflow: "hidden",
          marginBottom: 6,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressT * 100}%`,
            background: `linear-gradient(90deg, ${SUCCESS} 0%, #34D39E 100%)`,
            borderRadius: 999,
            transition: "width 0.2s",
            boxShadow: `0 0 12px rgba(16,185,129,0.4)`,
          }}
        />
      </div>

      {STEPS.map((step, i) => {
        const stride = 4;
        const itemStart = SHOT.S5.start + 2 + i * stride;
        const t = clamp((frame - itemStart) / 14, 0, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const checkT = clamp((frame - (itemStart + 6)) / 10, 0, 1);
        const checked = checkT > 0.4;
        // Burst flash right when check happens (2f)
        const burstT = clamp((frame - (itemStart + 6 + 4)) / 4, 0, 1);
        const burstOpacity = burstT < 0.5 ? burstT * 2 : (1 - burstT) * 2;

        return (
          <div
            key={i}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "14px 20px",
              backgroundColor: checked ? SUCCESS_SOFT : "transparent",
              borderRadius: 12,
              opacity: eased,
              transform: `translateX(${(1 - eased) * -18}px)`,
              border: `1px solid ${checked ? "rgba(16,185,129,0.15)" : "transparent"}`,
              overflow: "hidden",
            }}
          >
            {/* Burst flash overlay */}
            {burstT > 0 && burstT < 1 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(ellipse at 30px 50%, rgba(16,185,129,0.5) 0%, transparent 40%)`,
                  opacity: burstOpacity,
                  pointerEvents: "none",
                }}
              />
            )}
            <CheckBox progress={checkT} />
            <span
              style={{
                fontSize: 15,
                color: MUTED,
                fontWeight: 700,
                width: 28,
                letterSpacing: "0.04em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              style={{
                fontSize: 21,
                color: INK,
                lineHeight: 1.35,
                flex: 1,
                letterSpacing: "-0.005em",
              }}
            >
              {step.text}
            </span>
            <span
              style={{
                fontSize: 14,
                color: checked ? SUCCESS : MUTED,
                fontWeight: 600,
                minWidth: 64,
                textAlign: "right",
                letterSpacing: "0.02em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {step.dur}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const CheckBox: React.FC<{ progress: number }> = ({ progress }) => {
  const checked = progress > 0.4;
  // Pop animation — scale 1 → 1.25 → 1 around the check moment
  const pop = progress > 0.4 && progress < 0.7 ? 1 + (0.25 - Math.abs(progress - 0.55) * 2) : 1;
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        border: `2px solid ${checked ? SUCCESS : "#D6D9E3"}`,
        backgroundColor: checked ? SUCCESS : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transform: `scale(${pop})`,
        boxShadow: checked ? `0 0 ${8 * pop}px rgba(16,185,129,0.4)` : "none",
      }}
    >
      {checked && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//                          SHOT 7 — COST ZOOM
//   Continues seamlessly from S5 depth-dive. The €1,400 cell was zooming
//   toward viewer at end of S5; here it lands and holds with a soft settle.
// ═══════════════════════════════════════════════════════════════════════════
const Shot7CostZoom: React.FC<{ frame: number }> = ({ frame }) => {
  const f = frame - SHOT.S7.start;
  const dur = SHOT.S7.end - SHOT.S7.start;
  // Settle from a slightly-over-zoomed state: 1.25 → 1.08 (no big grow-in)
  const t = clamp(f / dur, 0, 1);
  const settleEase = 1 - Math.pow(1 - t, 4);
  const scale = 1.25 - 0.17 * settleEase;

  const VALUE = "€ 1,400";
  // Whole value appears ~immediately (3f stagger), continuing the dive context
  const charsShown = clamp(Math.floor((f + 2) / 2.0), 0, VALUE.length);
  const labelT = clamp((f - 2) / 8, 0, 1);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: DARK_BG }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 26,
          transform: `scale(${scale})`,
        }}
      >
        <span
          style={{
            fontSize: 22,
            color: "#8A8F9D",
            fontWeight: 600,
            letterSpacing: "0.22em",
            opacity: labelT,
          }}
        >
          EST. COST SAVED
        </span>
        <span
          style={{
            fontSize: 280,
            fontWeight: 700,
            color: SUCCESS,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            display: "inline-block",
            minWidth: 760,
            textAlign: "center",
            textShadow: "0 0 80px rgba(16,185,129,0.4)",
          }}
        >
          {VALUE.slice(0, charsShown)}
          {charsShown < VALUE.length && (
            <span style={{ opacity: (frame % 16) < 8 ? 1 : 0, color: SUCCESS, marginLeft: 8 }}>|</span>
          )}
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//                          SHOT 8 — OUTRO
// ═══════════════════════════════════════════════════════════════════════════
const Shot8Outro: React.FC<{ frame: number }> = ({ frame }) => {
  const f = frame - SHOT.S8.start;
  const t1 = clamp(f / 7, 0, 1);
  const t2 = clamp((f - 3) / 10, 0, 1);
  const eased1 = 1 - Math.pow(1 - t1, 3);
  const overshoot = t2 < 1 ? 1 + Math.sin(t2 * Math.PI) * 0.12 : 1;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: LIGHT_BG }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <span
          style={{
            fontSize: 60,
            fontWeight: 400,
            color: MUTED,
            opacity: eased1,
            letterSpacing: "-0.01em",
          }}
        >
          From alert to fixed:
        </span>
        <span
          style={{
            fontSize: 200,
            fontWeight: 700,
            color: ACCENT,
            opacity: clamp(t2 * 1.5, 0, 1),
            transform: `scale(${overshoot * (0.85 + eased1 * 0.15)})`,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          4 hours
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ─── Shared ────────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: LABEL,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
};
