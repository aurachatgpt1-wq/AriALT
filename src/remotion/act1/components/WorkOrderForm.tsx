import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_SIZES, interFont } from "../constants";

// ─── Sequential fill timeline ──────────────────────────────────────────────
// Each field starts ONLY after the previous field finished typing + a short
// "human" pause. `speed` is frames-per-char (smaller = faster). Dropdowns and
// dates are effectively instant. All typing speeds are chosen so the full
// form completes inside 210 frames with natural pacing between fields.
const FIELD_FILL_TIMELINE: {
  field: string;
  fillFrame: number;
  value: string;
  type: "text" | "dropdown" | "date" | "textarea" | "table-row";
  speed?: number; // frames-per-char
}[] = [
  { field: "codice",        fillFrame: 4,   speed: 0.08, value: "WO-2024-0847", type: "text" },
  { field: "titolo",        fillFrame: 12,  speed: 0.3,  value: "Bearing replacement — Motor M-401", type: "text" },
  { field: "descrizione",   fillFrame: 28,  speed: 0.22, value: "Motor M-401 shows abnormal vibration and excessive noise. Radial and axial bearing replacement required.", type: "textarea" },
  { field: "tipo",          fillFrame: 60,  value: "Corrective", type: "dropdown" },
  { field: "priorita",      fillFrame: 66,  value: "High", type: "dropdown" },
  { field: "asset",         fillFrame: 72,  speed: 0.3,  value: "MOT-401 — Main axis motor", type: "text" },
  { field: "ubicazione",    fillFrame: 86,  value: "Line A — Zone 3", type: "dropdown" },
  { field: "reparto",       fillFrame: 92,  value: "Mechanical Maintenance", type: "dropdown" },
  { field: "assegnato",     fillFrame: 98,  value: "Mark Johnson", type: "dropdown" },
  { field: "dataRichiesta", fillFrame: 104, value: "03/15/2024", type: "date" },
  { field: "dataScadenza",  fillFrame: 110, value: "03/17/2024", type: "date" },
  { field: "stimeOre",      fillFrame: 116, speed: 0.4,  value: "4.5", type: "text" },
  { field: "materiale1",    fillFrame: 124, speed: 0.22, value: "SKF 6205 radial bearing (x2)", type: "table-row" },
  { field: "materiale2",    fillFrame: 134, speed: 0.22, value: "SKF 51105 thrust bearing (x1)", type: "table-row" },
  { field: "materiale3",    fillFrame: 144, speed: 0.22, value: "Shell Gadus S2 lubricating grease", type: "table-row" },
  { field: "check1",        fillFrame: 156, speed: 0.2,  value: "1. Disconnect electrical power supply", type: "table-row" },
  { field: "check2",        fillFrame: 168, speed: 0.2,  value: "2. Remove protective cover", type: "table-row" },
  { field: "check3",        fillFrame: 178, speed: 0.2,  value: "3. Extract worn bearings with puller tool", type: "table-row" },
  { field: "check4",        fillFrame: 190, speed: 0.2,  value: "4. Install new bearings and lubricate", type: "table-row" },
  { field: "note",          fillFrame: 200, speed: 0.13, value: "Check shaft alignment after replacement.", type: "textarea" },
];

interface WorkOrderFormProps {
  fillStartFrame?: number;
  appearFrame?: number;
  /** Enables the blue Windows-10 focus ring around fields about to be filled */
  enableFocusRing?: boolean;
  /** Vertical scroll applied to the form body (used by Scene1 to pan to checklist) */
  scrollY?: number;
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
  /** When true, render a Windows-10 blue focus ring that pulses in the 6 frames before fillFrame */
  enableFocusRing?: boolean;
}> = ({ label, value, frame, fillFrame, type, speed = 1.5, enableFocusRing = false }) => {
  const displayValue =
    type === "dropdown" || type === "date"
      ? frame >= fillFrame ? value : ""
      : getTypedText(value, frame, fillFrame, speed);

  const isTextarea = type === "textarea";

  // Focus-ring lifecycle: starts 6f before fill, holds through typing, fades 10f after fill
  const typingDurationFrames =
    type === "dropdown" || type === "date" ? 4 : Math.max(6, Math.ceil(value.length * speed));
  const focusStart = fillFrame - 6;
  const focusEnd = fillFrame + typingDurationFrames;
  const focusActive = enableFocusRing && frame >= focusStart && frame <= focusEnd + 10;

  const focusIntensity = focusActive
    ? Math.max(
        0,
        Math.min(
          1,
          frame < fillFrame
            ? (frame - focusStart) / 6
            : frame < focusEnd
            ? 1
            : 1 - (frame - focusEnd) / 10,
        ),
      )
    : 0;

  // Caret blink (shown only while typing text)
  const isTyping =
    (type === "text" || type === "textarea") &&
    frame >= fillFrame &&
    displayValue.length < value.length;
  const caretOn = Math.floor(frame / 8) % 2 === 0;

  // ERP-style 3D inset borders (classic enterprise look)
  const fieldBorder =
    focusIntensity > 0.05
      ? `1px solid ${COLORS.win10FocusRing}`
      : `1px solid ${COLORS.erpBorderDark}`;
  const fieldInset =
    focusIntensity > 0.05
      ? `0 0 0 2px rgba(0,120,212,${0.22 * focusIntensity})`
      : `inset 1px 1px 0 ${COLORS.erpField3DShadow}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <label
        style={{
          fontSize: 10,
          fontWeight: 400,
          color: "#1A1A1A",
          letterSpacing: "0",
          fontFamily: interFont,
        }}
      >
        {label}
      </label>
      <div
        style={{
          position: "relative",
          height: isTextarea ? 46 : 22,
          backgroundColor: "#FFFFFF",
          border: fieldBorder,
          boxShadow: fieldInset,
          borderRadius: 0,
          padding: "2px 20px 2px 5px",
          fontSize: 12,
          fontFamily: "Consolas, 'Courier New', monospace",
          color: "#1A1A1A",
          display: "flex",
          alignItems: "flex-start",
          overflow: "hidden",
        }}
      >
        <span style={{ lineHeight: "18px", fontFamily: "Consolas, 'Courier New', monospace" }}>
          {displayValue}
        </span>
        {isTyping && caretOn && (
          <span
            style={{
              display: "inline-block",
              width: 1,
              height: 14,
              background: "#000",
              marginLeft: 1,
              verticalAlign: "middle",
            }}
          />
        )}
        {/* ERP matchcode button (small square on right for dropdowns) */}
        {(type === "dropdown" || type === "date") && (
          <div
            style={{
              position: "absolute",
              right: 2,
              top: 2,
              bottom: 2,
              width: 16,
              background: COLORS.erpToolbar,
              border: `1px outset ${COLORS.erpBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              color: "#1A1A1A",
            }}
          >
            {type === "date" ? "📅" : "▾"}
          </div>
        )}
      </div>
    </div>
  );
};

export const WorkOrderForm: React.FC<WorkOrderFormProps> = ({
  fillStartFrame = 70,
  appearFrame = 70,
  enableFocusRing = false,
  scrollY = 0,
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
    <div
      style={{
        opacity: formOpacity,
        transform: `translateY(${-scrollY}px)`,
        transition: "transform 0.12s ease-out",
        willChange: "transform",
      }}
    >
      {/* ERP-style section header (dark navy bar with white text) */}
      <div
        style={{
          background: `linear-gradient(180deg, ${COLORS.erpHeaderBlueLight} 0%, ${COLORS.erpHeaderBlue} 100%)`,
          padding: "4px 10px",
          marginBottom: 8,
          borderBottom: `1px solid ${COLORS.erpBorderDark}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 13, color: COLORS.erpAccentYellow }}>▸</span>
        <h2
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#FFFFFF",
            margin: 0,
            fontFamily: interFont,
            letterSpacing: "0.02em",
          }}
        >
          WORK ORDER — HEADER DATA
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px 16px", padding: "0 8px" }}>
        <FormField label="WO Code" {...getFieldProps("codice", frame)} enableFocusRing={enableFocusRing} />
        <div style={{ gridColumn: "2 / 4" }}>
          <FormField label="Title" {...getFieldProps("titolo", frame)} enableFocusRing={enableFocusRing} />
        </div>
        <div style={{ gridColumn: "1 / 4" }}>
          <FormField label="Description" {...getFieldProps("descrizione", frame)} enableFocusRing={enableFocusRing} />
        </div>
        <FormField label="Type" {...getFieldProps("tipo", frame)} enableFocusRing={enableFocusRing} />
        <FormField label="Priority" {...getFieldProps("priorita", frame)} enableFocusRing={enableFocusRing} />
        <FormField label="Asset" {...getFieldProps("asset", frame)} enableFocusRing={enableFocusRing} />
        <FormField label="Location" {...getFieldProps("ubicazione", frame)} enableFocusRing={enableFocusRing} />
        <FormField label="Department" {...getFieldProps("reparto", frame)} enableFocusRing={enableFocusRing} />
        <FormField label="Assigned to" {...getFieldProps("assegnato", frame)} enableFocusRing={enableFocusRing} />
        <FormField label="Request Date" {...getFieldProps("dataRichiesta", frame)} enableFocusRing={enableFocusRing} />
        <FormField label="Due Date" {...getFieldProps("dataScadenza", frame)} enableFocusRing={enableFocusRing} />
        <FormField label="Est. Hours" {...getFieldProps("stimeOre", frame)} enableFocusRing={enableFocusRing} />
      </div>

      {/* Materials */}
      <div style={{ margin: "10px 8px 0" }}>
        <div
          style={{
            background: `linear-gradient(180deg, ${COLORS.erpHeaderBlueLight} 0%, ${COLORS.erpHeaderBlue} 100%)`,
            padding: "3px 10px",
            marginBottom: 0,
            borderBottom: `1px solid ${COLORS.erpBorderDark}`,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 11, color: COLORS.erpAccentYellow }}>▸</span>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#FFFFFF", fontFamily: interFont, letterSpacing: "0.02em" }}>
            COMPONENTS / MATERIALS
          </div>
        </div>
        <div style={{ border: `1px solid ${COLORS.cmmsFieldBorder}`, borderRadius: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 80px", backgroundColor: COLORS.tableHeader, padding: "3px 6px", fontSize: FONT_SIZES.tableHeader, fontWeight: 600, color: COLORS.cmmsText, fontFamily: interFont }}>
            <span>#</span><span>Description</span><span>Qty</span>
          </div>
          {materialRows.map((row, i) => (
            <div key={row.field} style={{ display: "grid", gridTemplateColumns: "40px 1fr 80px", padding: "3px 6px", fontSize: FONT_SIZES.tableCell, backgroundColor: i % 2 === 0 ? "#FFFFFF" : COLORS.tableRowAlt, borderTop: `1px solid ${COLORS.excelGrid}`, fontFamily: interFont, color: COLORS.cmmsText, minHeight: 22 }}>
              <span>{frame >= row.fillFrame ? i + 1 : ""}</span>
              <span>{getTypedText(row.value, frame, row.fillFrame, row.speed ?? 0.22)}</span>
              <span>{frame >= row.fillFrame ? "1" : ""}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Checklist */}
      <div style={{ margin: "10px 8px 0" }}>
        <div
          style={{
            background: `linear-gradient(180deg, ${COLORS.erpHeaderBlueLight} 0%, ${COLORS.erpHeaderBlue} 100%)`,
            padding: "3px 10px",
            marginBottom: 0,
            borderBottom: `1px solid ${COLORS.erpBorderDark}`,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 11, color: COLORS.erpAccentYellow }}>▸</span>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#FFFFFF", fontFamily: interFont, letterSpacing: "0.02em" }}>
            OPERATIONS
          </div>
        </div>
        <div style={{ border: `1px solid ${COLORS.cmmsFieldBorder}`, borderRadius: 1 }}>
          {checkRows.map((row, i) => (
            <div key={row.field} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", fontSize: FONT_SIZES.tableCell, backgroundColor: i % 2 === 0 ? "#FFFFFF" : COLORS.tableRowAlt, borderTop: i > 0 ? `1px solid ${COLORS.excelGrid}` : "none", fontFamily: interFont, color: COLORS.cmmsText, minHeight: 24 }}>
              <input type="checkbox" disabled style={{ accentColor: COLORS.cmmsBorder }} />
              <span>{getTypedText(row.value, frame, row.fillFrame, row.speed ?? 0.2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div style={{ margin: "12px 8px 0" }}>
        <FormField label="Notes" {...getFieldProps("note", frame)} enableFocusRing={enableFocusRing} />
      </div>
    </div>
  );
};

function getFieldProps(fieldName: string, frame: number) {
  const entry = FIELD_FILL_TIMELINE.find((f) => f.field === fieldName);
  if (!entry) return { value: "", isFilled: false, frame, fillFrame: 9999, type: "text" as const, speed: 0.3 };
  return {
    value: entry.value,
    isFilled: frame >= entry.fillFrame,
    frame,
    fillFrame: entry.fillFrame,
    type: entry.type,
    speed: entry.speed ?? 0.3,
  };
}
