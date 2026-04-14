import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT_SIZES, ACCUMULATE_SPRING, UI_TOP, UI_BOTTOM_MARGIN } from "../constants";

interface ExcelOverlayProps {
  slideInFrame?: number;
  highlightedRow?: number;
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
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideProgress = spring({ frame: frame - slideInFrame, fps, config: ACCUMULATE_SPRING });
  const translateX = interpolate(slideProgress, [0, 1], [800, 0]);
  const opacity = interpolate(slideProgress, [0, 1], [0, 1]);

  if (frame < slideInFrame) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: UI_TOP,
        right: 20,
        width: 720,
        bottom: UI_BOTTOM_MARGIN,
        transform: `translateX(${translateX}px)`,
        opacity,
        display: "flex",
        flexDirection: "column",
        borderRadius: 4,
        overflow: "hidden",
        border: `1px solid ${COLORS.cmmsBorder}`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        zIndex: 100,
      }}
    >
      {/* Excel title bar */}
      <div style={{ height: 28, backgroundColor: COLORS.excelGreen, display: "flex", alignItems: "center", padding: "0 10px", justifyContent: "space-between" }}>
        <span style={{ color: "white", fontSize: 12, fontWeight: 600 }}>Maintenance_Plan_2024.xlsx — Microsoft Excel</span>
        <div style={{ display: "flex", gap: 6 }}>
          {["─", "□", "×"].map((icon, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: 1, backgroundColor: i === 2 ? "#C75050" : "rgba(255,255,255,0.3)", fontSize: i === 1 ? 8 : 9, color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
          ))}
        </div>
      </div>

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
