import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame, useVideoConfig } from "remotion";

const vertexShader = `
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

// Simple hash-based noise
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

void main() {
  // View direction for fresnel
  vec3 viewDir = normalize(-vPosition);
  float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.8);

  // Animated sweep / swirl on the sphere
  float sweep = sin(vUv.x * 6.2831 + uTime * 1.4) * 0.5 + 0.5;
  float sweep2 = sin(vUv.y * 9.4248 - uTime * 0.9 + vUv.x * 3.14159) * 0.5 + 0.5;

  // Noise layer for texture
  float n = noise(vUv * 6.0 + vec2(uTime * 0.3, uTime * 0.22));
  float n2 = noise(vUv * 12.0 - vec2(uTime * 0.18, uTime * 0.4));

  // Base iridescent colours
  vec3 deepBlue   = vec3(0.231, 0.357, 0.859);  // #3B5BDB
  vec3 midBlue    = vec3(0.420, 0.557, 1.000);  // #6B8EFF
  vec3 lightBlue  = vec3(0.647, 0.722, 1.000);  // #A5B8FF
  vec3 deepPurple = vec3(0.400, 0.220, 0.900);

  // Blend colours based on sweep + noise
  vec3 color = mix(deepBlue, midBlue, sweep * 0.7 + n * 0.3);
  color = mix(color, lightBlue, sweep2 * 0.45 + n2 * 0.2);
  color = mix(color, deepPurple, n * n2 * 0.35);

  // Fresnel rim — bright edge glow
  vec3 rimColor = mix(midBlue, lightBlue, 0.5);
  color = mix(color, rimColor, fresnel * 0.85);

  // Specular highlight
  vec3 lightDir = normalize(vec3(0.8, 0.8, 1.5));
  float spec = pow(max(dot(reflect(-lightDir, vNormal), viewDir), 0.0), 28.0);
  color += spec * 0.55 * lightBlue;

  // Pulsing inner glow
  float pulse = 0.5 + 0.5 * sin(uTime * 2.0);
  color += pulse * 0.06 * midBlue * (1.0 - fresnel);

  // Keep it fully opaque
  gl_FragColor = vec4(color, 1.0);
}
`;

const OrbMesh: React.FC<{ time: number }> = ({ time }) => {
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  uniforms.uTime.value = time;
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[2, 2, 2]} intensity={2.5} color="#6B8EFF" />
      <pointLight position={[-2, -1, 1.5]} intensity={1.2} color="#A5B8FF" />
      <mesh rotation={[time * 0.15, time * 0.7, time * 0.08]}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
        />
      </mesh>
    </>
  );
};

export const AriAOrb3D: React.FC<{ size: number; style?: React.CSSProperties }> = ({
  size,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        boxShadow:
          "0 0 50px rgba(59,91,219,0.6), 0 0 18px rgba(107,142,255,0.45)",
        flexShrink: 0,
        ...style,
      }}
    >
      <ThreeCanvas
        width={size}
        height={size}
        camera={{ position: [0, 0, 2.5], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
      >
        <OrbMesh time={frame / fps} />
      </ThreeCanvas>
    </div>
  );
};
