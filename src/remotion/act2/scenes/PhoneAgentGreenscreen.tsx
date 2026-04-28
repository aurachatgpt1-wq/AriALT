// ─────────────────────────────────────────────────────────────────────────────
// Phone Screens Standalone — plays only the mobile UI surfaces (Overview
// dashboard intro, home, WO detail, AI voice help, ARIA VISION live camera
// record + video diagnosis, inventory agent, notification banner) in iPhone
// portrait format. No 3D phone body, no bezel, no background — just the app
// itself at full-screen mobile resolution. Designed to be composited into a
// host video externally.
//
// Flow:
//   000-180 OVERVIEW DASHBOARD INTRO — KPI cards animate in, then lift away
//   180-247 Home (WO list) + notification banner + WO card tap
//   248-320 WO detail (steps, tools, "Ask AI" CTA)
//   320-410 AI help modal — voice question, answer, impeller diagram
//   410-440 AI suggests "record a video" — CTA fades in + tap
//   440-560 ARIA VISION camera viewfinder — record impeller with AR anchors
//           and anomaly bounding boxes
//   560-580 AI video analysis sweep + diagnosis card rises
//   580-620 Camera dismisses → inventory agent rises with low-stock alert
//
// Output:
//   - Aspect    : 1080 × 2280  (396 × 836 source, 2.727× uniform scale)
//   - FPS       : 30
//   - Duration  : 620 frames (~20.7 s)
//   - Background: #F3F4F7 (the app's native surface color)
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadGeist } from "@remotion/google-fonts/Inter";
import {
  PhoneHomeScreen,
  PhoneDetailScreen,
  PhoneAIHelpOverlay,
  PhoneInventoryScreen,
  PhoneNotificationBanner,
  PhoneCameraRecord,
} from "./SceneAgentCMMSCinema";
import { PhoneDashboardIntro } from "./PhoneDashboardIntro";

const { fontFamily: geistFont } = loadGeist();

// The phone-screen UI in SceneAgentCMMSCinema is designed inside a screen
// rectangle of 396 × 836 CSS px. We scale it uniformly by 2.727× so the
// screen fills the canvas exactly: 396×2.727=1080 wide, 836×2.727=2280 tall.
const SRC_SCREEN_W = 396;
const SRC_SCREEN_H = 836;
const SCREEN_SCALE = 1080 / SRC_SCREEN_W;   // ≈ 2.727

export const PHONE_GS_FPS      = 30;
export const PHONE_GS_WIDTH    = SRC_SCREEN_W * SCREEN_SCALE;   // 1080
export const PHONE_GS_HEIGHT   = Math.round(SRC_SCREEN_H * SCREEN_SCALE); // 2280
// Length of the opening Overview-dashboard intro before the main agent flow
// kicks in. The dashboard is on screen for ≤ 1 s total, including a
// native-feeling iOS "swipe-up-to-home" exit transition during the last beats.
export const PHONE_DASH_INTRO_LEN = 30;                        // 1 s exactly
export const PHONE_DASH_EXIT_LEN  = 16;                        // last 0.53 s is the transition
export const PHONE_GS_DURATION = 440 + PHONE_DASH_INTRO_LEN;   // 470 frames

// Local clamp helper — duplicated here so this file has no runtime coupling.
const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v));

// The same constants the main scene uses for status-bar colors.
const INK = "#0F0F12";

export const PhoneAgentGreenscreen: React.FC = () => {
  const frame = useCurrentFrame();
  // Main agent-flow timeline starts *after* the dashboard intro. During the
  // intro (frame < PHONE_DASH_INTRO_LEN) `local` is clamped to 0, so every
  // existing beat waits at its initial state until the dashboard lifts away.
  const local = Math.max(0, frame - PHONE_DASH_INTRO_LEN);

  // ── Dashboard intro exit — native iOS push navigation ────────────────────
  // Real UINavigationController push: outgoing screen slides LEFT by ~30 % of
  // the canvas width with a dim overlay darkening it (back-stack effect);
  // incoming screen slides in from the RIGHT edge using the full canvas
  // width. Both move in sync, no crossfade, no scaling — only one screen
  // reads as "on top" at any given moment, exactly like tapping a row in an
  // iPhone list view.
  const pushT = clamp((frame - (PHONE_DASH_INTRO_LEN - PHONE_DASH_EXIT_LEN)) / PHONE_DASH_EXIT_LEN, 0, 1);
  const pushE = 1 - Math.pow(1 - pushT, 3);            // ease-out cubic, iOS-feel
  // Outgoing dashboard — parallax shift + back-stack dim
  const dashPushXpx   = -pushE * (PHONE_GS_WIDTH * 0.30);  // 0 → -324 px
  const dashDimAlpha  = pushE * 0.28;                       // back-stack darkening
  // Incoming home stage — full slide-in from the right
  const stageInXpx    = (1 - pushE) * PHONE_GS_WIDTH;       // 1080 → 0 px
  // Stop mounting the intro a couple of frames after it finishes sliding off.
  const renderIntro = frame < PHONE_DASH_INTRO_LEN + 2;

  // ─────────────────────────────────────────────────────────────────────────
  // Beat timeline (local frames)
  // ─────────────────────────────────────────────────────────────────────────
  const statusT    = 1;
  // Notification appears at 0.22 s (frame 7 @ 30fps). Keeps the banner on-
  // screen for ~1.5 s before iOS-style swipe-up dismiss starts at frame 54.
  const notifT     = clamp((local - 7)  / 10, 0, 1);
  const bannerOutT = clamp((local - 54) / 8,  0, 1);
  const cardTapT   = clamp((local - 62) / 6,  0, 1);
  const transT     = clamp((local - 68) / 14, 0, 1);
  const stepT      = clamp((local - 88)  / 14, 0, 1);
  const toolsT     = clamp((local - 102) / 12, 0, 1);
  const ctaT       = clamp((local - 114) / 12, 0, 1);

  // AI help sheet
  const aiTapT     = clamp((local - 140) / 6,  0, 1);
  const aiRiseT    = clamp((local - 146) / 14, 0, 1);
  const aiMicT     = clamp((local - 156) / 10, 0, 1);
  const aiTransT   = clamp((local - 162) / 20, 0, 1);
  const aiThinkT   = clamp((local - 182) / 10, 0, 1);
  const aiAnswerT  = clamp((local - 190) / 14, 0, 1);
  const aiDiagramT = clamp((local - 204) / 22, 0, 1);

  // NEW — camera CTA + video diagnosis flow
  const cameraCtaT     = clamp((local - 232) / 14, 0, 1);   // chip fades in
  const cameraTapT     = clamp((local - 254) / 6,  0, 1);   // press-down
  const aiDismissT     = clamp((local - 258) / 12, 0, 1);   // AI sheet slides away
  const cameraRiseT    = clamp((local - 262) / 16, 0, 1);   // viewfinder rises
  const recordT        = clamp((local - 284) / 92, 0, 1);   // REC active window
  const analyzeT       = clamp((local - 378) / 16, 0, 1);   // analysis sweep
  const diagT          = clamp((local - 390) / 14, 0, 1);   // diagnosis card rises

  // Camera dismisses → inventory rises
  const cameraDismissT = clamp((local - 408) / 14, 0, 1);
  const inventoryRiseT = clamp((local - 412) / 20, 0, 1);
  const inventoryListT = clamp((local - 418) / 20, 0, 1);
  const invAlertT      = clamp((local - 428) / 18, 0, 1);

  return (
    <AbsoluteFill style={{
      backgroundColor: "#F3F4F7",
      overflow: "hidden",
      fontFamily: geistFont,
    }}>
      {/* Push-in wrapper — slides the entire home stage in from the right
          during the dashboard → home iOS push transition. Pixel-space
          translation on the canvas (1080 wide); after the transition it
          rests at translateX(0) and becomes a no-op for the rest of the
          scene. Sits above the dashboard (z-index 50) so the incoming
          screen visibly covers the outgoing one, exactly like a real
          UINavigationController push. A hairline drop shadow appears on
          its left edge during the slide to emphasise depth. */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        transform: `translateX(${stageInXpx.toFixed(2)}px)`,
        willChange: "transform",
        zIndex: 50,
        boxShadow: stageInXpx > 0
          ? `-16px 0 28px -8px rgba(0,0,0,${(0.18 * pushE).toFixed(3)})`
          : "none",
      }}>
      {/* Stage — native screen size 396 × 836, anchored top-left and scaled
          uniformly from (0,0) so it fills the canvas edge-to-edge with no
          margins. Canvas aspect (1080:2280) is chosen to match the scaled
          screen exactly → squared up, no tilt, no empty borders. */}
      <div style={{
        position: "absolute",
        top: 0, left: 0,
        width: SRC_SCREEN_W,
        height: SRC_SCREEN_H,
        transform: `scale(${SCREEN_SCALE})`,
        transformOrigin: "0 0",
        background: "linear-gradient(180deg, #F3F4F7 0%, #E8ECF4 100%)",
        overflow: "hidden",
      }}>
        {/* Status bar — clock + signal dots + battery. Identical layout to
            the phone mockup, minus the dynamic-island notch since we're no
            longer rendering the device chrome. */}
        <div style={{
          position: "absolute", top: 20, left: 30, right: 30,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: 14, fontWeight: 700, color: INK,
          opacity: statusT,
        }}>
          <span>18:50</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 10 }}>●●●●</span>
            <span style={{
              display: "inline-block",
              width: 22, height: 10, borderRadius: 2,
              border: `1.2px solid ${INK}`, position: "relative",
            }}>
              <span style={{
                position: "absolute", inset: 1.5, width: "80%",
                background: INK, borderRadius: 1,
              }} />
            </span>
          </span>
        </div>

        {/* APP CONTENT — starts below the status bar, fills the rest. */}
        <div style={{
          position: "absolute", top: 56, left: 0, right: 0, bottom: 0,
          overflow: "hidden",
        }}>
          <PhoneHomeScreen pushT={transT} cardTapT={cardTapT} />
          <PhoneDetailScreen
            pushT={transT}
            stepT={stepT}
            toolsT={toolsT}
            ctaT={ctaT}
            aiTapT={aiTapT}
            modalT={aiRiseT}
          />
          <PhoneAIHelpOverlay
            riseT={aiRiseT}
            micT={aiMicT}
            transT={aiTransT}
            thinkT={aiThinkT}
            answerT={aiAnswerT}
            diagramT={aiDiagramT}
            dismissT={aiDismissT}
            cameraCtaT={cameraCtaT}
            cameraTapT={cameraTapT}
          />
          <PhoneCameraRecord
            riseT={cameraRiseT}
            recordT={recordT}
            analyzeT={analyzeT}
            diagT={diagT}
            dismissT={cameraDismissT}
          />
          <PhoneInventoryScreen
            riseT={inventoryRiseT}
            listT={inventoryListT}
            alertT={invAlertT}
          />
          <PhoneNotificationBanner notifT={notifT} dismiss={bannerOutT} />
        </div>
      </div>
      </div>

      {/* ── OVERVIEW DASHBOARD INTRO ──────────────────────────────────────
          Opening beat. Renders in its settled state from frame 0, then on
          exit performs a real iOS push-navigation outgoing animation:
          parallax shift to the left (~30 % of canvas width) + darkening
          overlay, simulating the UINavigationController "back stack"
          behaviour. No scaling, no opacity fade — the card moves and dims
          exactly like a real iPhone screen as the next one slides in on
          top of it. */}
      {renderIntro && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          transform: `translateX(${dashPushXpx.toFixed(2)}px)`,
          willChange: "transform",
          zIndex: 40,
          overflow: "hidden",
        }}>
          <PhoneDashboardIntro />
          {/* iOS back-stack dim — a flat dark layer that fades in as the
              dashboard slides under the incoming home screen. */}
          <div style={{
            position: "absolute", inset: 0,
            background: "#000",
            opacity: dashDimAlpha,
            pointerEvents: "none",
          }} />
        </div>
      )}
    </AbsoluteFill>
  );
};
