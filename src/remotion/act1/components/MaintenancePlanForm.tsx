import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, interFont } from "../constants";

interface MaintenancePlanFormProps {
  appearFrame?: number;
  enableFocusRing?: boolean;
}

// ─── Sequential fill timeline ────────────────────────────────────────────────
// Each field starts AFTER the previous one finishes. speed = frames per char.
type FieldType = "text" | "dropdown" | "date" | "matchcode";
interface FormField {
  id: string;
  label: string;
  value: string;
  fillFrame: number;
  speed: number; // frames-per-char (only for text/matchcode)
  type: FieldType;
  gridSpan?: number;
}

const FIELDS: FormField[] = [
  { id: "plan",     label: "Plan No.",             value: "MP-2024-0032",                         fillFrame: 4,   speed: 0.08, type: "text" },
  { id: "desc",     label: "Description",          value: "Quarterly Maintenance — Line A",       fillFrame: 14,  speed: 0.3,  type: "text", gridSpan: 2 },
  { id: "asset",    label: "Equipment",            value: "MOT-401 — Main axis motor",            fillFrame: 30,  speed: 0.12, type: "matchcode" },
  { id: "freq",     label: "Frequency",            value: "Every 90 days",                         fillFrame: 42,  speed: 0.08, type: "dropdown" },
  { id: "next",     label: "Next Execution",       value: "06/15/2024",                            fillFrame: 50,  speed: 0.08, type: "date" },
  { id: "team",     label: "Assigned Team",        value: "MECH-A",                                fillFrame: 60,  speed: 0.08, type: "dropdown" },
  { id: "dur",      label: "Est. Duration (h)",    value: "6.0",                                   fillFrame: 68,  speed: 0.08, type: "text" },
  { id: "prio",     label: "Priority",             value: "2 — Medium",                            fillFrame: 76,  speed: 0.08, type: "dropdown" },
];

interface ProcStep { text: string; fillFrame: number; speed: number; }

const PROCEDURE_STEPS: ProcStep[] = [
  { text: "General visual inspection of all components", fillFrame: 90,  speed: 0.15 },
  { text: "Check lubricant levels",                       fillFrame: 108, speed: 0.15 },
  { text: "Verify drive belt tension",                    fillFrame: 122, speed: 0.15 },
  { text: "Replace intake filters",                       fillFrame: 134, speed: 0.15 },
  { text: "Functional test and parameter recording",      fillFrame: 146, speed: 0.13 },
];

const TOOLS: ProcStep[] = [
  { text: "Torque wrench 20–100 Nm",     fillFrame: 168, speed: 0.12 },
  { text: "Hydraulic bearing puller",    fillFrame: 180, speed: 0.12 },
  { text: "Hundredth dial gauge",        fillFrame: 192, speed: 0.12 },
];

const getTypedText = (full: string, frame: number, start: number, speed: number): string => {
  if (frame < start) return "";
  const count = Math.min(full.length, Math.floor((frame - start) / speed));
  return full.slice(0, count);
};

const isCharFilling = (frame: number, start: number, fullLen: number, speed: number): boolean => {
  const end = start + Math.ceil(fullLen * speed);
  return frame >= start && frame <= end + 1;
};

// ─── Section header band (navy with yellow ▸) ────────────────────────────────
const SectionBand: React.FC<{ title: string }> = ({ title }) => (
  <div
    style={{
      background: `linear-gradient(180deg, ${COLORS.erpHeaderBlueLight} 0%, ${COLORS.erpHeaderBlue} 100%)`,
      color: "#FFFFFF",
      padding: "3px 10px",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.06em",
      display: "flex",
      alignItems: "center",
      gap: 6,
      borderTop: "1px solid #FFFFFF88",
      borderBottom: `1px solid ${COLORS.erpBorderDark}`,
    }}
  >
    <span style={{ color: COLORS.erpAccentYellow, fontSize: 10 }}>▸</span>
    {title}
  </div>
);

// ─── ERP 3D inset field ──────────────────────────────────────────────────────
interface ErpFieldProps {
  field: FormField;
  frame: number;
  enableFocusRing: boolean;
}

const ErpField: React.FC<ErpFieldProps> = ({ field, frame, enableFocusRing }) => {
  const filling = isCharFilling(frame, field.fillFrame, field.value.length, field.speed);
  const caretVisible = filling && Math.floor(frame / 8) % 2 === 0;

  const ringOpacity = enableFocusRing
    ? interpolate(
        frame,
        [field.fillFrame - 3, field.fillFrame, field.fillFrame + Math.ceil(field.value.length * field.speed) + 2, field.fillFrame + Math.ceil(field.value.length * field.speed) + 6],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 0;

  const displayed =
    field.type === "dropdown" || field.type === "date"
      ? (frame >= field.fillFrame ? field.value : "")
      : getTypedText(field.value, frame, field.fillFrame, field.speed);

  return (
    <div style={{ gridColumn: field.gridSpan ? `span ${field.gridSpan}` : undefined }}>
      <label
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: "#1A1A1A",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          display: "block",
          marginBottom: 2,
        }}
      >
        {field.label}
      </label>
      <div
        style={{
          position: "relative",
          height: 22,
          background: "#FFFFFF",
          border: `1px solid ${COLORS.erpBorderDark}`,
          borderTopColor: "#3A3A3A",
          borderLeftColor: "#3A3A3A",
          boxShadow: `inset 1px 1px 0 ${COLORS.erpField3DShadow}`,
          padding: "2px 6px",
          fontSize: 12,
          color: "#1A1A1A",
          fontFamily: "Consolas, 'Courier New', monospace",
          display: "flex",
          alignItems: "center",
        }}
      >
        <span>{displayed}</span>
        {caretVisible && (
          <span style={{ width: 1, height: 14, background: "#1A1A1A", marginLeft: 1 }} />
        )}

        {/* Matchcode / dropdown button */}
        {(field.type === "matchcode" || field.type === "dropdown") && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: 18,
              background: COLORS.erpToolbar,
              borderLeft: `1px solid ${COLORS.erpBorderDark}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              color: "#1A1A1A",
            }}
          >
            {field.type === "matchcode" ? "⊞" : "▼"}
          </div>
        )}
        {field.type === "date" && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: 18,
              background: COLORS.erpToolbar,
              borderLeft: `1px solid ${COLORS.erpBorderDark}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
            }}
          >
            📅
          </div>
        )}

        {/* Focus ring */}
        {enableFocusRing && ringOpacity > 0 && (
          <div
            style={{
              position: "absolute",
              inset: -2,
              border: `2px solid ${COLORS.win10FocusRing}`,
              opacity: ringOpacity,
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    </div>
  );
};

export const MaintenancePlanForm: React.FC<MaintenancePlanFormProps> = ({
  appearFrame = 0,
  enableFocusRing = false,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [appearFrame, appearFrame + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (frame < appearFrame) return null;

  return (
    <div
      style={{
        opacity,
        fontFamily: interFont,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <SectionBand title="MAINTENANCE PLAN — HEADER DATA" />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "6px 12px",
          padding: "4px 8px 6px",
        }}
      >
        {FIELDS.map((f) => (
          <ErpField
            key={f.id}
            field={f}
            frame={frame}
            enableFocusRing={enableFocusRing}
          />
        ))}
      </div>

      <SectionBand title="OPERATING PROCEDURE" />
      <div
        style={{
          margin: "0 8px",
          background: "#FFFFFF",
          border: `1px solid ${COLORS.erpBorderDark}`,
          boxShadow: `inset 1px 1px 0 ${COLORS.erpField3DShadow}`,
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "34px 1fr",
            background: COLORS.erpToolbar,
            borderBottom: `1px solid ${COLORS.erpBorderDark}`,
            fontSize: 10,
            fontWeight: 700,
            color: "#1A1A1A",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          <div style={{ padding: "3px 6px", borderRight: `1px solid ${COLORS.erpBorderDark}`, textAlign: "center" }}>#</div>
          <div style={{ padding: "3px 6px" }}>Operation description</div>
        </div>
        {PROCEDURE_STEPS.map((step, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "34px 1fr",
              background: i % 2 === 0 ? "#FFFFFF" : "#F5F3EC",
              borderTop: i > 0 ? `1px solid #D9D6CA` : "none",
              fontSize: 12,
              color: "#1A1A1A",
              fontFamily: "Consolas, 'Courier New', monospace",
              minHeight: 20,
            }}
          >
            <div
              style={{
                padding: "2px 6px",
                borderRight: `1px solid #D9D6CA`,
                textAlign: "center",
                fontWeight: 700,
                color: COLORS.erpLinkBlue,
              }}
            >
              {frame >= step.fillFrame ? String((i + 1) * 10).padStart(4, "0") : ""}
            </div>
            <div style={{ padding: "2px 8px" }}>
              {getTypedText(step.text, frame, step.fillFrame, step.speed)}
              {isCharFilling(frame, step.fillFrame, step.text.length, step.speed) &&
                Math.floor(frame / 8) % 2 === 0 && (
                  <span style={{ display: "inline-block", width: 1, height: 12, background: "#1A1A1A", marginLeft: 1, verticalAlign: "middle" }} />
                )}
            </div>
          </div>
        ))}
      </div>

      <SectionBand title="REQUIRED TOOLS / MATERIALS" />
      <div
        style={{
          margin: "0 8px",
          background: "#FFFFFF",
          border: `1px solid ${COLORS.erpBorderDark}`,
          boxShadow: `inset 1px 1px 0 ${COLORS.erpField3DShadow}`,
        }}
      >
        {TOOLS.map((t, i) => (
          <div
            key={i}
            style={{
              padding: "2px 8px",
              background: i % 2 === 0 ? "#FFFFFF" : "#F5F3EC",
              borderTop: i > 0 ? `1px solid #D9D6CA` : "none",
              fontSize: 12,
              color: "#1A1A1A",
              fontFamily: "Consolas, 'Courier New', monospace",
              minHeight: 20,
            }}
          >
            {getTypedText(t.text, frame, t.fillFrame, t.speed)}
            {isCharFilling(frame, t.fillFrame, t.text.length, t.speed) &&
              Math.floor(frame / 8) % 2 === 0 && (
                <span style={{ display: "inline-block", width: 1, height: 12, background: "#1A1A1A", marginLeft: 1, verticalAlign: "middle" }} />
              )}
          </div>
        ))}
      </div>
    </div>
  );
};
