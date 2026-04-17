import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT_SIZES, ACCUMULATE_SPRING, UI_TOP, UI_BOTTOM_MARGIN } from "../constants";

interface ExcelOverlayProps {
  slideInFrame?: number;
  highlightedRow?: number;
  /** When provided, overrides the default top/right/bottom positioning */
  bounds?: { top?: number; right?: number; bottom?: number; width?: number };
  /** Title bar style — win10 is flat, legacy is the old XP-green */
  chromeStyle?: "legacy" | "win10";
}

const EXCEL_DATA = [
  ["MOT-401", "Main axis motor", "90 days", "12/15/2023", "03/15/2024", "Bearings"],
  ["PMP-203", "Hydraulic pump #3", "60 days", "01/10/2024", "03/10/2024", "Seals"],
  ["CMP-105", "Air compressor", "180 days", "10/01/2023", "04/01/2024", "Filters + oil"],
  ["VLV-308", "Control valve", "30 days", "02/20/2024", "03/20/2024", "O-rings"],
  ["CNV-502", "Conveyor belt", "120 days", "12/01/2023", "04/01/2024", "Rollers + belt"],
  ["HEX-104", "Heat exchanger", "90 days", "01/05/2024", "04/05/2024", "Tube cleaning"],
  ["GBX-201", "Epicyclic gearbox", "365 days", "03/15/2023", "03/15/2024", "Oil + gears"],
  ["FLT-407", "Suction filter", "30 days", "02/25/2024", "03/25/2024", "Filter element"],
];

const HEADERS = ["Code", "Asset", "Freq.", "Last Maint.", "Next", "Notes"];

export const ExcelOverlay: React.FC<ExcelOverlayProps> = ({
  slideInFrame = 0,
  highlightedRow = -1,
  bounds,
  chromeStyle = "legacy",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideProgress = spring({ frame: frame - slideInFrame, fps, config: ACCUMULATE_SPRING });
  const translateX = interpolate(slideProgress, [0, 1], [800, 0]);
  const opacity = interpolate(slideProgress, [0, 1], [0, 1]);

  if (frame < slideInFrame) return null;

  const isWin10 = chromeStyle === "win10";
  const top = bounds?.top ?? UI_TOP;
  const right = bounds?.right ?? 20;
  const bottom = bounds?.bottom ?? UI_BOTTOM_MARGIN;
  const width = bounds?.width ?? 720;

  return (
    <div
      style={{
        position: "absolute",
        top,
        right,
        width,
        bottom,
        transform: `translateX(${translateX}px)`,
        opacity,
        display: "flex",
        flexDirection: "column",
        borderRadius: isWin10 ? 0 : 4,
        overflow: "hidden",
        border: isWin10
          ? `1px solid ${COLORS.win10WindowBorder}`
          : `1px solid ${COLORS.cmmsBorder}`,
        boxShadow: isWin10
          ? `0 10px 32px ${COLORS.win10WindowShadow}, 0 2px 6px rgba(0,0,0,0.18)`
          : "0 4px 20px rgba(0,0,0,0.15)",
        zIndex: 100,
      }}
    >
      {/* Excel title bar */}
      {isWin10 ? (
        <div
          style={{
            height: 32,
            background: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 0,
            borderBottom: `1px solid ${COLORS.win10WindowBorder}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 10 }}>
            <div
              style={{
                width: 16,
                height: 16,
                background: COLORS.excelGreen,
                color: "#FFFFFF",
                fontSize: 10,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1,
              }}
            >
              X
            </div>
            <span
              style={{
                color: "#2B2B2B",
                fontSize: 12,
                fontWeight: 400,
                letterSpacing: "0.01em",
              }}
            >
              Maintenance_Plan_2024.xlsx — Excel
            </span>
          </div>
          <div style={{ display: "flex", height: "100%" }}>
            {["─", "☐", "✕"].map((icon, i) => (
              <div
                key={i}
                style={{
                  width: 46,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 400,
                  color: "#2B2B2B",
                }}
              >
                {icon}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ height: 28, backgroundColor: COLORS.excelGreen, display: "flex", alignItems: "center", padding: "0 10px", justifyContent: "space-between" }}>
          <span style={{ color: "white", fontSize: 12, fontWeight: 600 }}>Maintenance_Plan_2024.xlsx — Microsoft Excel</span>
          <div style={{ display: "flex", gap: 6 }}>
            {["─", "□", "×"].map((icon, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: 1, backgroundColor: i === 2 ? "#C75050" : "rgba(255,255,255,0.3)", fontSize: i === 1 ? 8 : 9, color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
            ))}
          </div>
        </div>
      )}

      {/* Ribbon tab strip (win10 only — Excel green ribbon accent) */}
      {isWin10 && (
        <div
          style={{
            height: 22,
            background: COLORS.excelGreen,
            display: "flex",
            alignItems: "center",
            padding: "0 8px",
            gap: 14,
            fontSize: 11,
            color: "#FFFFFF",
            fontWeight: 500,
          }}
        >
          <span>File</span>
          <span>Home</span>
          <span>Insert</span>
          <span>Page Layout</span>
          <span>Formulas</span>
          <span style={{ background: "rgba(255,255,255,0.18)", padding: "0 6px" }}>Data</span>
          <span>Review</span>
          <span>View</span>
        </div>
      )}

      {/* Formula bar */}
      <div style={{ height: 24, backgroundColor: COLORS.excelHeaderBg, display: "flex", alignItems: "center", padding: "0 6px", borderBottom: `1px solid ${COLORS.excelGrid}`, fontSize: 11, color: COLORS.cmmsText, fontFamily: "Courier New, monospace" }}>
        <span style={{ padding: "0 8px", borderRight: `1px solid ${COLORS.excelGrid}`, fontWeight: 600 }}>A1</span>
        <span style={{ padding: "0 8px" }}>fx</span>
        <span style={{ padding: "0 8px" }}>Code</span>
      </div>

      {/* Spreadsheet */}
      <div style={{ flex: 1, backgroundColor: "white", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "30px 70px 1fr 60px 90px 90px 100px", backgroundColor: COLORS.excelHeaderBg, borderBottom: `1px solid ${COLORS.excelGrid}` }}>
          <div style={cellHeaderStyle}></div>
          {["A", "B", "C", "D", "E", "F"].map((col) => <div key={col} style={cellHeaderStyle}>{col}</div>)}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "30px 70px 1fr 60px 90px 90px 100px", backgroundColor: COLORS.excelHeaderBg, borderBottom: `2px solid ${COLORS.cmmsBorder}` }}>
          <div style={{ ...cellStyle, backgroundColor: COLORS.excelHeaderBg, fontWeight: 600 }}>1</div>
          {HEADERS.map((h) => <div key={h} style={{ ...cellStyle, fontWeight: 700, fontSize: 11 }}>{h}</div>)}
        </div>

        {EXCEL_DATA.map((row, rowIndex) => (
          <div key={rowIndex} style={{ display: "grid", gridTemplateColumns: "30px 70px 1fr 60px 90px 90px 100px", backgroundColor: rowIndex === highlightedRow ? COLORS.excelSelectedCell : rowIndex % 2 === 0 ? "white" : "#F8F9FA", borderBottom: `1px solid ${COLORS.excelGrid}` }}>
            <div style={{ ...cellStyle, backgroundColor: COLORS.excelHeaderBg, fontWeight: 600 }}>{rowIndex + 2}</div>
            {row.map((cell, colIndex) => <div key={colIndex} style={cellStyle}>{cell}</div>)}
          </div>
        ))}
      </div>

      {/* Sheet tabs */}
      <div style={{ height: 22, backgroundColor: COLORS.excelHeaderBg, display: "flex", alignItems: "center", padding: "0 4px", borderTop: `1px solid ${COLORS.excelGrid}`, gap: 2 }}>
        <div style={{ padding: "2px 12px", fontSize: 10, backgroundColor: "white", border: `1px solid ${COLORS.excelGrid}`, borderBottom: "none" }}>Sheet1</div>
        <div style={{ padding: "2px 12px", fontSize: 10, color: COLORS.cmmsLabelText }}>Sheet2</div>
      </div>
    </div>
  );
};

const cellHeaderStyle: React.CSSProperties = {
  padding: "2px 4px", fontSize: 10, fontWeight: 600, color: "#666", textAlign: "center", borderRight: `1px solid ${COLORS.excelGrid}`,
};

const cellStyle: React.CSSProperties = {
  padding: "3px 6px", fontSize: FONT_SIZES.excelCell, color: COLORS.cmmsText, borderRight: `1px solid ${COLORS.excelGrid}`, fontFamily: "Courier New, monospace", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
};
