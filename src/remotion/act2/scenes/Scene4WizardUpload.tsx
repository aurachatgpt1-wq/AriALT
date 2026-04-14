import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ARIA_COLORS, geistFont } from "../constants";
import { WizardShell } from "../components/WizardShell";

// ─── Timing ─────────────────────────────────────────────
const P_IN        = 0;
const P_FILE1_IN  = 20;
const P_FILE1_DON = 95;   // done
const P_FILE2_IN  = 50;
const P_FILE2_DON = 110;
const P_FILE3_IN  = 80;
const P_FILE3_DON = 145;
const P_ALL_DONE  = 170;

interface FileEntry { name: string; size: string; type: "pdf" | "xls"; inFrame: number; doneFrame: number; }
const FILES: FileEntry[] = [
  { name: "manuale_MOT401.pdf",        size: "4.2 MB", type: "pdf", inFrame: P_FILE1_IN, doneFrame: P_FILE1_DON },
  { name: "ricambi_2024.xlsx",         size: "1.8 MB", type: "xls", inFrame: P_FILE2_IN, doneFrame: P_FILE2_DON },
  { name: "procedure_manutenzione.pdf",size: "6.1 MB", type: "pdf", inFrame: P_FILE3_IN, doneFrame: P_FILE3_DON },
];

const PdfIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/><line x1="9" y1="9" x2="11" y2="9"/>
  </svg>
);

const XlsIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <rect x="8" y="12" width="8" height="7"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="12" y1="12" x2="12" y2="19"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ARIA_COLORS.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export const Scene4WizardUpload: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sp = (f: number, s = 280, d = 22) =>
    spring({ frame: frame - f, fps, config: { stiffness: s, damping: d, mass: 0.5 } });

  const contentT = sp(P_IN);
  const allDone = frame >= P_ALL_DONE;
  const doneCount = FILES.filter(f => frame >= f.doneFrame).length;

  return (
    <WizardShell stepIndex={2} progressOverride={60}>
      <div style={{
        display: "flex", flexDirection: "column", justifyContent: "center",
        height: "100%", padding: "0 80px",
        opacity: interpolate(contentT,[0,1],[0,1]),
        transform: `translateX(${interpolate(contentT,[0,1],[30,0])}px)`,
      }}>
        <h2 style={{ fontFamily: geistFont, fontSize: 34, fontWeight: 800, color: ARIA_COLORS.foreground, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
          Your documentation.
        </h2>
        <p style={{ fontFamily: geistFont, fontSize: 14, color: ARIA_COLORS.mutedFg, margin: "0 0 20px", lineHeight: 1.6 }}>
          AI reads every page and extracts structured data.
        </p>

        {/* Tags */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {["Assets", "Alarms", "Maintenance", "Spare Parts", "Procedures"].map(tag => (
            <span key={tag} style={{
              fontFamily: geistFont, fontSize: 11, fontWeight: 500,
              color: ARIA_COLORS.foreground, backgroundColor: "rgba(243,244,247,0.9)",
              border: "1px solid rgba(214,217,227,0.6)", borderRadius: 9999,
              padding: "4px 12px",
            }}>{tag}</span>
          ))}
        </div>

        {/* Drop zone */}
        <div style={{
          borderRadius: 16, border: "2px dashed rgba(59,91,219,0.3)",
          backgroundColor: "rgba(59,91,219,0.02)",
          padding: "20px 24px", marginBottom: 20, textAlign: "center",
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ARIA_COLORS.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 8px", display: "block" }}>
            <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
          </svg>
          <p style={{ fontFamily: geistFont, fontSize: 13, fontWeight: 600, color: ARIA_COLORS.foreground, margin: "0 0 4px" }}>
            Drop files here
          </p>
          <p style={{ fontFamily: geistFont, fontSize: 11, color: ARIA_COLORS.mutedFg, margin: 0 }}>
            PDF · XLSX · XLS
          </p>
        </div>

        {/* File list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {FILES.map((f, i) => {
            if (frame < f.inFrame) return null;
            const inT = sp(f.inFrame, 300, 24);
            const isDone = frame >= f.doneFrame;
            const isUploading = frame >= f.inFrame && frame < f.doneFrame;
            const progress = isDone ? 100 : Math.min(95, Math.round(95 * (frame - f.inFrame) / (f.doneFrame - f.inFrame)));
            const iconColor = isDone ? ARIA_COLORS.success : f.type === "pdf" ? "#E63946" : ARIA_COLORS.success;

            return (
              <div key={f.name} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: 10,
                backgroundColor: isDone ? "rgba(31,168,112,0.04)" : "rgba(243,244,247,0.7)",
                border: `1px solid ${isDone ? "rgba(31,168,112,0.2)" : "rgba(214,217,227,0.5)"}`,
                opacity: interpolate(inT,[0,1],[0,1]),
                transform: `translateX(${interpolate(inT,[0,1],[-16,0])}px)`,
              }}>
                {f.type === "pdf" ? <PdfIcon color={iconColor} /> : <XlsIcon color={iconColor} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: geistFont, fontSize: 12, color: ARIA_COLORS.foreground, fontWeight: 500, marginBottom: isUploading ? 4 : 0 }}>
                    {f.name}
                  </div>
                  {isUploading && (
                    <div style={{ height: 3, backgroundColor: "rgba(214,217,227,0.4)", borderRadius: 2, overflow: "hidden", maxWidth: 200 }}>
                      <div style={{
                        height: "100%", width: `${progress}%`,
                        backgroundColor: ARIA_COLORS.primary,
                        borderRadius: 2, transition: "width 0.3s ease",
                      }} />
                    </div>
                  )}
                </div>
                <span style={{ fontFamily: geistFont, fontSize: 11, color: ARIA_COLORS.mutedFg }}>{f.size}</span>
                {isDone && <CheckIcon />}
                {isUploading && (
                  <span style={{ fontFamily: geistFont, fontSize: 11, color: ARIA_COLORS.primary, fontWeight: 600 }}>
                    {progress}%
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* All done summary */}
        {allDone && (
          <p style={{
            fontFamily: geistFont, fontSize: 12, color: ARIA_COLORS.success,
            marginTop: 12, fontWeight: 600,
            opacity: interpolate(sp(P_ALL_DONE),[0,1],[0,1]),
          }}>
            ✓ {doneCount} files processed — AI is analyzing content in the background
          </p>
        )}
      </div>
    </WizardShell>
  );
};
