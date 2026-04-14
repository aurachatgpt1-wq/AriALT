import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_SIZES, interFont } from "../constants";

interface MaintenancePlanFormProps {
  appearFrame?: number;
}

const FIELDS = [
  { label: "Plan Name", value: "Quarterly Maintenance Plan — Line A", fillFrame: 30, type: "text", gridSpan: 2 },
  { label: "Asset", value: "MOT-401 — Main axis motor", fillFrame: 50, type: "dropdown" },
  { label: "Frequency", value: "Every 90 days", fillFrame: 60, type: "dropdown" },
  { label: "Next Execution", value: "06/15/2024", fillFrame: 70, type: "date" },
  { label: "Assigned Team", value: "Mechanical Team A", fillFrame: 80, type: "dropdown" },
  { label: "Estimated Duration", value: "6 hours", fillFrame: 90, type: "text" },
  { label: "Priority", value: "Medium", fillFrame: 95, type: "dropdown" },
];

const PROCEDURE_STEPS = [
  { text: "General visual inspection of all components", fillFrame: 110 },
  { text: "Check lubricant levels", fillFrame: 120 },
  { text: "Verify drive belt tension", fillFrame: 130 },
  { text: "Replace intake filters", fillFrame: 140 },
  { text: "Functional test and parameter recording", fillFrame: 150 },
];

const TOOLS = [
  { text: "Torque wrench 20–100 Nm", fillFrame: 160 },
  { text: "Hydraulic bearing puller", fillFrame: 168 },
  { text: "Hundredth dial gauge", fillFrame: 176 },
];

const getTypedText = (fullText: string, frame: number, startFrame: number, speed = 1.5): string => {
  const elapsed = Math.max(0, frame - startFrame);
  return fullText.slice(0, Math.min(fullText.length, Math.floor(elapsed / speed)));
};

export const MaintenancePlanForm: React.FC<MaintenancePlanFormProps> = ({ appearFrame = 0 }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [appearFrame, appearFrame + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (frame < appearFrame) return null;

  return (
    <div style={{ opacity, fontFamily: interFont }}>
      <div style={{ backgroundColor: COLORS.cmmsHeaderBg, padding: "6px 12px", marginBottom: 10, borderBottom: `2px solid ${COLORS.cmmsBorder}` }}>
        <h2 style={{ fontSize: FONT_SIZES.cmmsTitle, fontWeight: 700, color: COLORS.cmmsText, margin: 0 }}>
          New Preventive Maintenance Plan
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 14px", padding: "0 8px" }}>
        {FIELDS.map((field) => (
          <div key={field.label} style={{ gridColumn: field.gridSpan ? `span ${field.gridSpan}` : undefined }}>
            <label style={{ fontSize: FONT_SIZES.cmmsLabel, fontWeight: 600, color: COLORS.cmmsLabelText, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {field.label}
            </label>
            <div style={{ position: "relative", height: 26, backgroundColor: COLORS.cmmsFieldBg, border: `1px inset ${COLORS.cmmsFieldBorder}`, borderRadius: 1, padding: "3px 6px", fontSize: FONT_SIZES.cmmsField, color: COLORS.cmmsText, marginTop: 2, display: "flex", alignItems: "center" }}>
              {field.type === "dropdown" || field.type === "date"
                ? frame >= field.fillFrame ? field.value : ""
                : getTypedText(field.value, frame, field.fillFrame)}
              {field.type === "dropdown" && <span style={{ position: "absolute", right: 6, fontSize: 10, color: COLORS.cmmsBorder }}>▼</span>}
              {field.type === "date" && <span style={{ position: "absolute", right: 6, fontSize: 11, color: COLORS.cmmsBorder }}>📅</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Procedure */}
      <div style={{ margin: "10px 8px 0" }}>
        <label style={{ fontSize: FONT_SIZES.cmmsLabel, fontWeight: 600, color: COLORS.cmmsLabelText, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Operating Procedure
        </label>
        <div style={{ border: `1px solid ${COLORS.cmmsFieldBorder}`, marginTop: 4, borderRadius: 1 }}>
          {PROCEDURE_STEPS.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 8px", fontSize: FONT_SIZES.tableCell, backgroundColor: i % 2 === 0 ? "#FFFFFF" : COLORS.tableRowAlt, borderTop: i > 0 ? `1px solid ${COLORS.excelGrid}` : "none", color: COLORS.cmmsText, minHeight: 22 }}>
              <span style={{ fontWeight: 600, width: 20 }}>{frame >= step.fillFrame ? `${i + 1}.` : ""}</span>
              <span>{getTypedText(step.text, frame, step.fillFrame, 1)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tools */}
      <div style={{ margin: "10px 8px 0" }}>
        <label style={{ fontSize: FONT_SIZES.cmmsLabel, fontWeight: 600, color: COLORS.cmmsLabelText, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Required Tools
        </label>
        <div style={{ border: `1px solid ${COLORS.cmmsFieldBorder}`, marginTop: 4, borderRadius: 1 }}>
          {TOOLS.map((tool, i) => (
            <div key={i} style={{ padding: "3px 8px", fontSize: FONT_SIZES.tableCell, backgroundColor: i % 2 === 0 ? "#FFFFFF" : COLORS.tableRowAlt, borderTop: i > 0 ? `1px solid ${COLORS.excelGrid}` : "none", color: COLORS.cmmsText, minHeight: 22 }}>
              {getTypedText(tool.text, frame, tool.fillFrame, 1)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
