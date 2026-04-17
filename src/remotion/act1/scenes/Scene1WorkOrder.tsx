import React from "react";
import { AbsoluteFill } from "remotion";
import { CmmsShell } from "../components/CmmsShell";
import { WorkOrderForm } from "../components/WorkOrderForm";
import { WindowsDesktop } from "../components/WindowsDesktop";
import { NotificationToast } from "../components/NotificationToast";

// ─── Window bounds inside the Windows desktop ────────────────────────────────
const WINDOW_BOUNDS = {
  top: 36,
  left: 150,
  right: 110,
  bottom: 64,
};

export const Scene1WorkOrder: React.FC = () => {
  // ─── Notification toast timing ──────────────────────────────────────────
  const TOAST_START = 72;
  const TOAST_DURATION = 85;

  return (
    <AbsoluteFill>
      <WindowsDesktop
        outlookPulseFrame={TOAST_START - 2}
        teamsPulseFrame={TOAST_START + 78}
      >
        <CmmsShell
          slideInStart={-9999}
          windowStyle="win10"
          contentStyle="erp"
          transactionCode="IW31"
          title="Create Work Order (IW31) — Maintenance Management System"
          windowBounds={WINDOW_BOUNDS}
        >
          <WorkOrderForm
            appearFrame={0}
            enableFocusRing
          />
        </CmmsShell>

        <NotificationToast
          startFrame={TOAST_START}
          duration={TOAST_DURATION}
          bottom={52}
          right={20}
        />
      </WindowsDesktop>
    </AbsoluteFill>
  );
};
