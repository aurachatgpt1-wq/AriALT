import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ARIA_COLORS, geistFont } from "../constants";
import { WizardShell } from "../components/WizardShell";

// ─── Timing ─────────────────────────────────────────────
const P_IN         = 0;
const P_NAME_TYPE  = 18;
const P_CODE_TYPE  = 55;
const P_DESC_TYPE  = 88;
const P_BTN_CLICK  = 120;
const P_SUCCESS    = 140;

const PLANT_NAME = "Milan North Plant";
const PLANT_CODE = "MI-NORD-01";
const PLANT_DESC = "Main production line";

const typed = (full: string, frame: number, start: number, speed = 0.35) =>
  full.slice(0, Math.max(0, Math.floor((frame - start) / speed)));

const CheckIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={ARIA_COLORS.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

export const Scene3WizardPlant: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sp = (f: number) => spring({ frame: frame - f, fps, config: { stiffness: 260, damping: 22, mass: 0.5 } });

  const showSuccess = frame >= P_SUCCESS;
  const successT = sp(P_SUCCESS);

  // Field focus states
  const nameFocused  = frame >= P_NAME_TYPE && frame < P_CODE_TYPE;
  const codeFocused  = frame >= P_CODE_TYPE && frame < P_DESC_TYPE;
  const descFocused  = frame >= P_DESC_TYPE && frame < P_BTN_CLICK;
  const btnActive    = frame >= P_BTN_CLICK && frame < P_SUCCESS;

  const nameVal = frame >= P_NAME_TYPE ? typed(PLANT_NAME, frame, P_NAME_TYPE) : "";
  const codeVal = frame >= P_CODE_TYPE ? typed(PLANT_CODE, frame, P_CODE_TYPE) : "";
  const descVal = frame >= P_DESC_TYPE ? typed(PLANT_DESC, frame, P_DESC_TYPE) : "";

  const contentT = sp(P_IN);

  if (showSuccess) {
    return (
      <WizardShell stepIndex={1} progressOverride={42}>
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          height: "100%",
          opacity: interpolate(successT,[0,1],[0,1]),
          transform: `scale(${interpolate(successT,[0,1],[0.92,1])})`,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            backgroundColor: "rgba(31,168,112,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 24,
          }}>
            <CheckIcon />
          </div>
          <h2 style={{ fontFamily: geistFont, fontSize: 32, fontWeight: 800, color: ARIA_COLORS.foreground, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            {PLANT_NAME}
          </h2>
          <p style={{ fontFamily: "'Geist Mono',monospace", fontSize: 13, color: ARIA_COLORS.mutedFg, margin: "0 0 16px" }}>
            {PLANT_CODE}
          </p>
          <p style={{ fontFamily: geistFont, fontSize: 15, color: ARIA_COLORS.mutedFg, margin: 0, lineHeight: 1.6 }}>
            Plant created. Continue with document upload.
          </p>
        </div>
      </WizardShell>
    );
  }

  return (
    <WizardShell stepIndex={1} progressOverride={28}>
      <div style={{
        display: "flex", flexDirection: "column", justifyContent: "center",
        height: "100%", padding: "0 80px",
        opacity: interpolate(contentT,[0,1],[0,1]),
        transform: `translateX(${interpolate(contentT,[0,1],[30,0])}px)`,
      }}>
        <h2 style={{ fontFamily: geistFont, fontSize: 34, fontWeight: 800, color: ARIA_COLORS.foreground, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          Your plant.
        </h2>
        <p style={{ fontFamily: geistFont, fontSize: 14, color: ARIA_COLORS.mutedFg, margin: "0 0 36px", lineHeight: 1.6 }}>
          Each site has its own data, team and inventory.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 480 }}>
          {/* Name */}
          <Field label="Name" value={nameVal} focused={nameFocused} placeholder="Milan North Plant" />
          {/* Code */}
          <Field label="Code" value={codeVal} focused={codeFocused} placeholder="MI-NORD-01" mono />
          {/* Description */}
          <Field label="Description" value={descVal} focused={descFocused} placeholder="Additional notes..." />
        </div>

        {/* Button */}
        <div style={{ marginTop: 32, maxWidth: 480 }}>
          <div style={{
            height: 48, borderRadius: 12,
            backgroundColor: (nameVal.length > 0 && codeVal.length > 0) ? ARIA_COLORS.primary : "rgba(214,217,227,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: geistFont, fontSize: 15, fontWeight: 600,
            color: (nameVal.length > 0 && codeVal.length > 0) ? "#fff" : ARIA_COLORS.mutedFg,
            transform: btnActive ? "scale(0.97)" : "scale(1)",
            transition: "all 0.15s ease",
            boxShadow: (nameVal.length > 0 && codeVal.length > 0) ? "0 4px 16px rgba(59,91,219,0.25)" : "none",
          }}>
            {btnActive ? "Creating…" : "Create plant"}
          </div>
        </div>
      </div>
    </WizardShell>
  );
};

const Field = ({
  label, value, focused, placeholder, mono = false
}: { label: string; value: string; focused: boolean; placeholder: string; mono?: boolean }) => (
  <div>
    <div style={{ fontFamily: geistFont, fontSize: 12, fontWeight: 600, color: ARIA_COLORS.foreground, marginBottom: 6 }}>
      {label}
    </div>
    <div style={{
      height: 44, borderRadius: 10, padding: "0 14px",
      backgroundColor: focused ? "#fff" : "rgba(243,244,247,0.7)",
      border: `1.5px solid ${focused ? ARIA_COLORS.primary : "rgba(214,217,227,0.6)"}`,
      display: "flex", alignItems: "center",
      boxShadow: focused ? `0 0 0 3px ${ARIA_COLORS.primaryLight}` : "none",
      transition: "all 0.2s ease",
    }}>
      <span style={{
        fontFamily: mono ? "'Geist Mono', monospace" : geistFont,
        fontSize: 13, color: value ? ARIA_COLORS.foreground : ARIA_COLORS.labelFg,
      }}>
        {value || placeholder}
        {focused && <span style={{ opacity: 0.6, animation: "none", borderLeft: `1.5px solid ${ARIA_COLORS.primary}`, marginLeft: 1 }}>&nbsp;</span>}
      </span>
    </div>
  </div>
);
