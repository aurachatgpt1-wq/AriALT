import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, interFont } from "../constants";

// ─── Fake existing work orders ───────────────────────────────────────────────
const EXISTING_ORDERS = [
  { code: "WO-2024-0846", title: "Quarterly inspection — Line B conveyor",         type: "Preventive", priority: "Medium", status: "Open",        assigned: "J. Smith",   date: "03/14/2024" },
  { code: "WO-2024-0845", title: "Hydraulic leak on press HP-12",                   type: "Corrective", priority: "High",   status: "In Progress", assigned: "M. Rossi",   date: "03/14/2024" },
  { code: "WO-2024-0844", title: "Lubrication — bearings all assembly stations",   type: "Preventive", priority: "Low",    status: "Closed",      assigned: "L. Bianchi", date: "03/13/2024" },
  { code: "WO-2024-0843", title: "Replace pneumatic cylinder — Station 4",          type: "Corrective", priority: "High",   status: "Open",        assigned: "J. Smith",   date: "03/13/2024" },
  { code: "WO-2024-0842", title: "Calibration of torque wrenches Q1",               type: "Preventive", priority: "Medium", status: "Closed",      assigned: "Mark Johnson", date: "03/12/2024" },
  { code: "WO-2024-0841", title: "Conveyor belt alignment check — Line A",          type: "Preventive", priority: "Medium", status: "Closed",      assigned: "Mark Johnson", date: "03/12/2024" },
  { code: "WO-2024-0840", title: "Emergency stop circuit test — all lines",         type: "Preventive", priority: "High",   status: "Closed",      assigned: "L. Bianchi", date: "03/11/2024" },
  { code: "WO-2024-0839", title: "Spindle vibration investigation — CNC-02",        type: "Corrective", priority: "High",   status: "In Progress", assigned: "M. Rossi",   date: "03/11/2024" },
];

const STATUS_COLOR: Record<string, string> = {
  "Open":        "#C07800",
  "In Progress": "#1F6FB0",
  "Closed":      "#2F7C3F",
};
const PRIORITY_COLOR: Record<string, string> = {
  "High":   "#B82020",
  "Medium": "#8A6D00",
  "Low":    "#5A5A5A",
};

// ─── Props ───────────────────────────────────────────────────────────────────
interface WorkOrdersListProps {
  /** Frame where the button highlight should pulse (cursor hovering) */
  buttonHoverFrame?: number;
  /** Frame where the + button gets clicked */
  buttonClickFrame?: number;
}

export const WorkOrdersList: React.FC<WorkOrdersListProps> = ({
  buttonHoverFrame = 9999,
  buttonClickFrame = 9999,
}) => {
  const frame = useCurrentFrame();

  // Button hover pulse — guard against invalid ranges when hover/click are close together
  const hoverMid = Math.min(buttonHoverFrame + 10, buttonClickFrame - 1);
  const hoverPreClick = Math.max(hoverMid + 1, buttonClickFrame - 1);
  const hoverIntensity = interpolate(
    frame,
    [buttonHoverFrame, hoverMid, hoverPreClick, buttonClickFrame],
    [0, 1, 1, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Click flash
  const clickFlash = interpolate(
    frame,
    [buttonClickFrame, buttonClickFrame + 2, buttonClickFrame + 10],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const buttonBg = clickFlash > 0.1
    ? "#1F6FB0"
    : hoverIntensity > 0.1
    ? "#2F8D3F"
    : "#3A9E4A";

  return (
    <div style={{ fontFamily: interFont, color: COLORS.cmmsText }}>
      {/* ERP-style section header */}
      <div
        style={{
          background: `linear-gradient(180deg, ${COLORS.erpHeaderBlueLight} 0%, ${COLORS.erpHeaderBlue} 100%)`,
          padding: "4px 10px",
          marginBottom: 8,
          borderBottom: `1px solid ${COLORS.erpBorderDark}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: COLORS.erpAccentYellow }}>▸</span>
          <h2
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#FFFFFF",
              margin: 0,
              letterSpacing: "0.02em",
            }}
          >
            WORK ORDERS — LIST DISPLAY (IW39)
          </h2>
        </div>
        <div style={{ fontSize: 11, color: "#D4E4F7" }}>
          8 of 847 records
        </div>
      </div>

      {/* Filter/action toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 8px 10px",
          borderBottom: `1px solid ${COLORS.cmmsBorder}`,
          marginBottom: 8,
        }}
      >
        {/* Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#FFFFFF",
            border: `1px inset ${COLORS.cmmsFieldBorder}`,
            padding: "3px 8px",
            fontSize: 11,
            color: COLORS.cmmsLabelText,
            width: 200,
          }}
        >
          🔍 <span>Search work orders...</span>
        </div>

        {/* Dropdown filters */}
        {[
          { label: "Status", value: "All" },
          { label: "Priority", value: "All" },
          { label: "Assigned to", value: "All" },
          { label: "Date", value: "Last 7 days" },
        ].map((f) => (
          <div
            key={f.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: COLORS.cmmsText,
            }}
          >
            <span style={{ color: COLORS.cmmsLabelText }}>{f.label}:</span>
            <div
              style={{
                position: "relative",
                padding: "3px 22px 3px 8px",
                background: "#FFFFFF",
                border: `1px inset ${COLORS.cmmsFieldBorder}`,
                minWidth: 80,
              }}
            >
              {f.value}
              <span
                style={{
                  position: "absolute",
                  right: 5,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 9,
                  color: COLORS.cmmsLabelText,
                }}
              >
                ▼
              </span>
            </div>
          </div>
        ))}

        <div style={{ flex: 1 }} />

        {/* + Create (IW31) button — ERP-style outset 3D button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 12px 3px 8px",
            background: buttonBg,
            color: "#FFFFFF",
            fontSize: 12,
            fontWeight: 700,
            border: `1px outset ${hoverIntensity > 0.1 ? "#6DCE7B" : "#6DCE7B"}`,
            boxShadow: hoverIntensity > 0.1
              ? `0 0 0 2px rgba(0,166,81,${0.28 * hoverIntensity}), inset 1px 1px 0 rgba(255,255,255,0.35)`
              : "inset 1px 1px 0 rgba(255,255,255,0.35)",
            transform: `scale(${1 + clickFlash * 0.04})`,
            transition: "transform 60ms ease",
            letterSpacing: "0.02em",
            fontFamily: interFont,
          }}
        >
          <span style={{ fontSize: 15, lineHeight: "15px", marginTop: -2 }}>+</span>
          <span>Create (IW31)</span>
        </div>

        {/* Secondary "Export" button */}
        <div
          style={{
            padding: "3px 10px",
            fontSize: 11,
            background: COLORS.erpToolbar,
            border: `1px outset ${COLORS.erpBorder}`,
            color: "#1A1A1A",
            fontFamily: interFont,
          }}
        >
          ↧ Export
        </div>
      </div>

      {/* ERP-style data table */}
      <div
        style={{
          border: `1px solid ${COLORS.erpBorderDark}`,
          margin: "0 8px",
          background: "#FFFFFF",
        }}
      >
        {/* Header — beige 3D outset with column dividers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "24px 140px 1fr 110px 90px 120px 140px 100px",
            background: `linear-gradient(180deg, #ECE9D8 0%, ${COLORS.erpToolbar} 100%)`,
            padding: "3px 0",
            fontSize: 11,
            fontWeight: 700,
            color: "#1A1A1A",
            borderBottom: `1px solid ${COLORS.erpBorderDark}`,
            fontFamily: interFont,
          }}
        >
          {["", "Order", "Description", "Order Type", "Priority", "System Status", "Responsible", "Created On"].map((h, i) => (
            <span
              key={i}
              style={{
                padding: "0 6px",
                borderRight: i < 7 ? `1px solid ${COLORS.erpBorder}` : "none",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Rows — alternating white/beige, monospace data */}
        {EXISTING_ORDERS.map((order, i) => {
          const isSelected = i === 1; // highlight one row for realism
          return (
            <div
              key={order.code}
              style={{
                display: "grid",
                gridTemplateColumns: "24px 140px 1fr 110px 90px 120px 140px 100px",
                padding: "3px 0",
                fontSize: 11,
                background: isSelected ? COLORS.erpSelectedRow : i % 2 === 0 ? "#FFFFFF" : "#F5F3EA",
                borderBottom: `1px solid #DDDCCE`,
                color: "#1A1A1A",
                minHeight: 20,
                alignItems: "center",
                fontFamily: "Consolas, 'Courier New', monospace",
              }}
            >
              {/* Row marker */}
              <span style={{ padding: "0 6px", color: "#666", textAlign: "center" }}>
                {isSelected ? "▶" : ""}
              </span>
              <span
                style={{
                  padding: "0 6px",
                  color: COLORS.erpLinkBlue,
                  textDecoration: "underline",
                }}
              >
                {order.code}
              </span>
              <span
                style={{
                  padding: "0 6px",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  fontFamily: interFont,
                }}
              >
                {order.title}
              </span>
              <span style={{ padding: "0 6px" }}>
                {order.type === "Corrective" ? "PM02" : "PM01"}
              </span>
              <span
                style={{
                  padding: "0 6px",
                  color: PRIORITY_COLOR[order.priority],
                  fontWeight: 700,
                }}
              >
                {order.priority === "High" ? "1" : order.priority === "Medium" ? "2" : "3"} {order.priority}
              </span>
              <span style={{ padding: "0 6px", display: "flex", alignItems: "center", gap: 4 }}>
                <span
                  style={{
                    display: "inline-block",
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: STATUS_COLOR[order.status],
                    border: "1px solid rgba(0,0,0,0.25)",
                    boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.5)",
                  }}
                />
                <span style={{ fontFamily: interFont }}>
                  {order.status === "In Progress" ? "REL" : order.status === "Open" ? "CRTD" : "TECO"}
                </span>
              </span>
              <span style={{ padding: "0 6px", fontFamily: interFont }}>{order.assigned}</span>
              <span style={{ padding: "0 6px" }}>{order.date}</span>
            </div>
          );
        })}
      </div>

      {/* ERP-style pagination */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 10px",
          marginTop: 6,
          fontSize: 11,
          color: "#1A1A1A",
          background: COLORS.erpToolbar,
          border: `1px solid ${COLORS.erpBorder}`,
          marginLeft: 8,
          marginRight: 8,
        }}
      >
        <span style={{ fontFamily: interFont }}>
          Entry <strong>1 – 8</strong> of <strong>847</strong> · Page <strong>1 / 106</strong>
        </span>
        <div style={{ display: "flex", gap: 2 }}>
          {["⏮", "◀", "▶", "⏭"].map((p, i) => (
            <div
              key={i}
              style={{
                padding: "2px 8px",
                background: COLORS.erpToolbar,
                border: `1px outset ${COLORS.erpBorder}`,
                fontSize: 11,
                color: "#1A1A1A",
                minWidth: 16,
                textAlign: "center",
                fontFamily: interFont,
              }}
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
