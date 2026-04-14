import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_SIZES, interFont } from "../constants";

const FIELD_FILL_TIMELINE: {
  field: string;
  fillFrame: number;
  value: string;
  type: "text" | "dropdown" | "date" | "textarea" | "table-row";
}[] = [
  { field: "codice", fillFrame: 0, value: "WO-2024-0847", type: "text" },
  { field: "titolo", fillFrame: 30, value: "Bearing replacement — Motor M-401", type: "text" },
  { field: "descrizione", fillFrame: 36, value: "Motor M-401 shows abnormal vibration and excessive noise. Radial and axial bearing replacement required.", type: "textarea" },
  { field: "tipo", fillFrame: 41, value: "Corrective", type: "dropdown" },
  { field: "priorita", fillFrame: 46, value: "High", type: "dropdown" },
  { field: "asset", fillFrame: 52, value: "MOT-401 — Main axis motor", type: "text" },
  { field: "ubicazione", fillFrame: 60, value: "Line A — Zone 3", type: "dropdown" },
  { field: "reparto", fillFrame: 65, value: "Mechanical Maintenance", type: "dropdown" },
  { field: "assegnato", fillFrame: 70, value: "Mark Johnson", type: "dropdown" },
  { field: "dataRichiesta", fillFrame: 76, value: "03/15/2024", type: "date" },
  { field: "dataScadenza", fillFrame: 80, value: "03/17/2024", type: "date" },
  { field: "stimeOre", fillFrame: 84, value: "4.5", type: "text" },
  { field: "materiale1", fillFrame: 90, value: "SKF 6205 radial bearing (x2)", type: "table-row" },
  { field: "materiale2", fillFrame: 94, value: "SKF 51105 thrust bearing (x1)", type: "table-row" },
  { field: "materiale3", fillFrame: 98, value: "Shell Gadus S2 lubricating grease", type: "table-row" },
  { field: "check1", fillFrame: 104, value: "1. Disconnect electrical power supply", type: "table-row" },
  { field: "check2", fillFrame: 108, value: "2. Remove protective cover", type: "table-row" },
  { field: "check3", fillFrame: 112, value: "3. Extract worn bearings with puller tool", type: "table-row" },
  { field: "check4", fillFrame: 116, value: "4. Install new bearings and lubricate", type: "table-row" },
  { field: "note", fillFrame: 120, value: "Check shaft alignment after replacement. Run vibration test post-intervention.", type: "textarea" },
];

interface WorkOrderFormProps {
  fillStartFrame?: number;
  appearFrame?: number;
}

const getTypedText = (fullText: string, frame: number, startFrame: number, speed = 0.4): string => {
  const elapsed = Math.max(0, frame - startFrame);
  return fullText.slice(0, Math.min(fullText.length, Math.floor(elapsed / speed)));
};

const FormField: React.FC<{
  label: string;
  value: string;
  isFilled: boolean;
  frame: number;
  fillFrame: number;
  type: string;
  speed?: number;
}> = ({ label, value, frame, fillFrame, type, speed = 1.5 }) => {
  const displayValue =
    type === "dropdown" || type === "date"
      ? frame >= fillFrame ? value : ""
      : getTypedText(value, frame, fillFrame, speed);

  const isTextarea = type === "textarea";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <label style={{ fontSize: FONT_SIZES.cmmsLabel, fontWeight: 600, color: COLORS.cmmsLabelText, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: interFont }}>
        {label}
      </label>
      <div
        style={{
          position: "relative",
          height: isTextarea ? 48 : 28,
          backgroundColor: COLORS.cmmsFieldBg,
          border: `1px inset ${COLORS.cmmsFieldBorder}`,
          borderRadius: 1,
          padding: "4px 6px",
          fontSize: FONT_SIZES.cmmsField,
          fontFamily: interFont,
          color: COLORS.cmmsText,
          display: "flex",
          alignItems: "flex-start",
          overflow: "hidden",
        }}
      >
        <span style={{ lineHeight: "20px" }}>{displayValue}</span>
        {type === "dropdown" && <div style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: COLORS.cmmsBorder }}>▼</div>}
        {type === "date" && <div style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: COLORS.cmmsBorder }}>📅</div>}
      </div>
    </div>
  );
};

export const WorkOrderForm: React.FC<WorkOrderFormProps> = ({
  fillStartFrame = 70,
  appearFrame = 70,
}) => {
  const frame = useCurrentFrame();

  const formOpacity = interpolate(frame, [appearFrame, appearFrame + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (frame < appearFrame) return null;

  const materialRows = FIELD_FILL_TIMELINE.filter((f) => f.field.startsWith("materiale"));
  const checkRows = FIELD_FILL_TIMELINE.filter((f) => f.field.startsWith("check"));

  return (
    <div style={{ opacity: formOpacity }}>
      <div style={{ backgroundColor: COLORS.cmmsHeaderBg, padding: "6px 12px", marginBottom: 12, borderBottom: `2px solid ${COLORS.cmmsBorder}` }}>
        <h2 style={{ fontSize: FONT_SIZES.cmmsTitle, fontWeight: 700, color: COLORS.cmmsText, margin: 0, fontFamily: interFont }}>
          New Work Order
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px 16px", padding: "0 8px" }}>
        <FormField label="WO Code" value="WO-2024-0847" isFilled type="text" frame={frame} fillFrame={0} speed={2} />
        <div style={{ gridColumn: "2 / 4" }}>
          <FormField label="Title" {...getFieldProps("titolo", frame)} />
        </div>
        <div style={{ gridColumn: "1 / 4" }}>
          <FormField label="Description" {...getFieldProps("descrizione", frame)} />
        </div>
        <FormField label="Type" {...getFieldProps("tipo", frame)} />
        <FormField label="Priority" {...getFieldProps("priorita", frame)} />
        <FormField label="Asset" {...getFieldProps("asset", frame)} />
        <FormField label="Location" {...getFieldProps("ubicazione", frame)} />
        <FormField label="Department" {...getFieldProps("reparto", frame)} />
        <FormField label="Assigned to" {...getFieldProps("assegnato", frame)} />
        <FormField label="Request Date" {...getFieldProps("dataRichiesta", frame)} />
        <FormField label="Due Date" {...getFieldProps("dataScadenza", frame)} />
        <FormField label="Est. Hours" {...getFieldProps("stimeOre", frame)} />
      </div>

      {/* Materials */}
      <div style={{ margin: "12px 8px 0" }}>
        <div style={{ fontSize: FONT_SIZES.cmmsLabel, fontWeight: 600, color: COLORS.cmmsLabelText, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4, fontFamily: interFont }}>
          Required Materials
        </div>
        <div style={{ border: `1px solid ${COLORS.cmmsFieldBorder}`, borderRadius: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 80px", backgroundColor: COLORS.tableHeader, padding: "3px 6px", fontSize: FONT_SIZES.tableHeader, fontWeight: 600, color: COLORS.cmmsText, fontFamily: interFont }}>
            <span>#</span><span>Description</span><span>Qty</span>
          </div>
          {materialRows.map((row, i) => (
            <div key={row.field} style={{ display: "grid", gridTemplateColumns: "40px 1fr 80px", padding: "3px 6px", fontSize: FONT_SIZES.tableCell, backgroundColor: i % 2 === 0 ? "#FFFFFF" : COLORS.tableRowAlt, borderTop: `1px solid ${COLORS.excelGrid}`, fontFamily: interFont, color: COLORS.cmmsText, minHeight: 22 }}>
              <span>{frame >= row.fillFrame ? i + 1 : ""}</span>
              <span>{getTypedText(row.value, frame, row.fillFrame, 0.25)}</span>
              <span>{frame >= row.fillFrame ? "1" : ""}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Checklist */}
      <div style={{ margin: "12px 8px 0" }}>
        <div style={{ fontSize: FONT_SIZES.cmmsLabel, fontWeight: 600, color: COLORS.cmmsLabelText, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4, fontFamily: interFont }}>
          Operations Checklist
        </div>
        <div style={{ border: `1px solid ${COLORS.cmmsFieldBorder}`, borderRadius: 1 }}>
          {checkRows.map((row, i) => (
            <div key={row.field} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", fontSize: FONT_SIZES.tableCell, backgroundColor: i % 2 === 0 ? "#FFFFFF" : COLORS.tableRowAlt, borderTop: i > 0 ? `1px solid ${COLORS.excelGrid}` : "none", fontFamily: interFont, color: COLORS.cmmsText, minHeight: 24 }}>
              <input type="checkbox" disabled style={{ accentColor: COLORS.cmmsBorder }} />
              <span>{getTypedText(row.value, frame, row.fillFrame, 0.25)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div style={{ margin: "12px 8px 0" }}>
        <FormField label="Notes" {...getFieldProps("note", frame)} />
      </div>
    </div>
  );
};

function getFieldProps(fieldName: string, frame: number) {
  const entry = FIELD_FILL_TIMELINE.find((f) => f.field === fieldName);
  if (!entry) return { value: "", isFilled: false, frame, fillFrame: 9999, type: "text" as const };
  return { value: entry.value, isFilled: frame >= entry.fillFrame, frame, fillFrame: entry.fillFrame, type: entry.type };
}
