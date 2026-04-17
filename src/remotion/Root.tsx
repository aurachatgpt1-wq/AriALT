import React from "react";
import { Composition } from "remotion";
import { DynamicComp } from "./DynamicComp";

// ─── Full Acts ──────────────────────────────────────────────────────────────
import { Act1Composition } from "./act1/Act1Composition";
import { TOTAL_FRAMES, FPS } from "./act1/constants";
import { Act15Composition } from "./act15/Act15Composition";
import { TOTAL_FRAMES_15, FPS as FPS15 } from "./act15/constants";
import { Act2Composition } from "./act2/Act2Composition";
import { TOTAL_FRAMES_2, FPS as FPS2 } from "./act2/constants";
import { ActBonusComposition } from "./actbonus/ActBonusComposition";
import { TOTAL_FRAMES_BONUS, FPS as FPSBonus } from "./actbonus/constants";

// ─── Act 1 — Individual scenes ──────────────────────────────────────────────
import { Scene0Intro } from "./act1/scenes/Scene0Intro";
import { SceneOpenCmms } from "./act1/scenes/SceneOpenCmms";
import { Scene1WorkOrder } from "./act1/scenes/Scene1WorkOrder";
import { Scene2ManutenzionePreventiva } from "./act1/scenes/Scene2ManutenzionePreventiva";
import { Scene3bCost } from "./act1/scenes/Scene3bCost";
import { Scene3PuntoRottura } from "./act1/scenes/Scene3PuntoRottura";
import { Scene3cLimits } from "./act1/scenes/Scene3cLimits";
import { Scene4StopRewind } from "./act1/scenes/Scene4StopRewind";
import {
  SCENE_0_DURATION,
  SCENE_OPEN_CMMS_DURATION,
  SCENE_1_DURATION,
  SCENE_2_DURATION,
  SCENE_3B_DURATION,
  SCENE_3_DURATION,
  SCENE_3C_DURATION,
  SCENE_4_DURATION,
} from "./act1/constants";

// ─── Act 1.5 — Individual scenes ───────────────────────────────────────────
import { Scene1ChatGPT } from "./act15/scenes/Scene1ChatGPT";
import { Scene2CopyPaste } from "./act15/scenes/Scene2CopyPaste";
import { SceneThreeProblems } from "./act15/scenes/SceneThreeProblems";
import { SceneFasterStill } from "./act15/scenes/SceneFasterStill";
import { SceneBridge } from "./act15/scenes/SceneBridge";
import { SceneShowcase } from "./act15/scenes/SceneShowcase";
import { SceneBridgeList } from "./act15/scenes/SceneBridgeList";
import {
  SCENE_CHAT_DURATION,
  SCENE_2_DURATION as SCENE_15_2_DURATION,
  SCENE_THREE_DURATION,
  SCENE_BRIDGE_DURATION,
  SCENE_SHOWCASE_DURATION,
  SCENE_BRIDGELIST_DURATION,
} from "./act15/constants";

// ─── Act 2 — Individual scenes ──────────────────────────────────────────────
import { Scene1LogoReveal } from "./act2/scenes/Scene1LogoReveal";
import { SceneAreas } from "./act2/scenes/SceneAreas";
import { SceneFormProfile } from "./act2/scenes/SceneFormProfile";
import { SceneExecutingPlan } from "./act2/scenes/SceneExecutingPlan";
import { SceneExecutingPlan2 } from "./act2/scenes/SceneExecutingPlan2";
import { Scene2WizardHero } from "./act2/scenes/Scene2WizardHero";
import { Scene3WizardPlant } from "./act2/scenes/Scene3WizardPlant";
import { Scene4WizardUpload } from "./act2/scenes/Scene4WizardUpload";
import { Scene5WizardAI } from "./act2/scenes/Scene5WizardAI";
import { Scene6WizardComplete } from "./act2/scenes/Scene6WizardComplete";
import { SceneDashboardAutonomous } from "./act2/scenes/SceneDashboardAutonomous";
import {
  SCENE_1_DURATION as ACT2_S1_DUR,
  SCENE_AREAS_DURATION,
  SCENE_FORM_DURATION,
  SCENE_EXECUTING_DURATION,
  SCENE_EXECUTING2_DURATION,
  SCENE_DASHBOARD_DURATION,
  SCENE_2_DURATION as ACT2_S2_DUR,
  SCENE_3_DURATION as ACT2_S3_DUR,
  SCENE_4_DURATION as ACT2_S4_DUR,
  SCENE_5_DURATION as ACT2_S5_DUR,
  SCENE_6_DURATION as ACT2_S6_DUR,
} from "./act2/constants";

const defaultCode = `import { AbsoluteFill } from "remotion";
export const MyAnimation = () => <AbsoluteFill style={{ backgroundColor: "#000" }} />;`;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          FULL ACTS
          ═══════════════════════════════════════════════════════════════════ */}
      <Composition
        id="Act1-IlCaos"
        component={Act1Composition}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="Act15-ThePatch"
        component={Act15Composition}
        durationInFrames={TOTAL_FRAMES_15}
        fps={FPS15}
        width={1920}
        height={1080}
      />
      <Composition
        id="Act2-LaRivoluzione"
        component={Act2Composition}
        durationInFrames={TOTAL_FRAMES_2}
        fps={FPS2}
        width={1920}
        height={1080}
      />
      <Composition
        id="ActBonus-ThePatchV2"
        component={ActBonusComposition}
        durationInFrames={TOTAL_FRAMES_BONUS}
        fps={FPSBonus}
        width={1920}
        height={1080}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          ACT 1 — SCENE INDIVIDUALI
          ═══════════════════════════════════════════════════════════════════ */}
      <Composition
        id="A1-S0-Intro"
        component={Scene0Intro}
        durationInFrames={SCENE_0_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="A1-S0b-OpenCmms"
        component={SceneOpenCmms}
        durationInFrames={SCENE_OPEN_CMMS_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="A1-S1-WorkOrder"
        component={Scene1WorkOrder}
        durationInFrames={SCENE_1_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="A1-S2-ManutenzionePreventiva"
        component={Scene2ManutenzionePreventiva}
        durationInFrames={SCENE_2_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="A1-S3b-Cost"
        component={Scene3bCost}
        durationInFrames={SCENE_3B_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="A1-S3-PuntoRottura"
        component={Scene3PuntoRottura}
        durationInFrames={SCENE_3_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="A1-S3c-Limits"
        component={Scene3cLimits}
        durationInFrames={SCENE_3C_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="A1-S4-StopRewind"
        component={Scene4StopRewind}
        durationInFrames={SCENE_4_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          ACT 1.5 — SCENE INDIVIDUALI
          ═══════════════════════════════════════════════════════════════════ */}
      <Composition
        id="A15-S1-ChatGPT"
        component={Scene1ChatGPT}
        durationInFrames={SCENE_CHAT_DURATION}
        fps={FPS15}
        width={1920}
        height={1080}
      />
      <Composition
        id="A15-S2-CopyPaste"
        component={Scene2CopyPaste}
        durationInFrames={SCENE_15_2_DURATION}
        fps={FPS15}
        width={1920}
        height={1080}
      />
      <Composition
        id="A15-S3-ThreeProblems"
        component={SceneThreeProblems}
        durationInFrames={SCENE_THREE_DURATION}
        fps={FPS15}
        width={1920}
        height={1080}
      />
      <Composition
        id="A15-S4-FasterStill"
        component={SceneFasterStill}
        durationInFrames={270}
        fps={FPS15}
        width={1920}
        height={1080}
      />
      <Composition
        id="A15-S5-Bridge"
        component={SceneBridge}
        durationInFrames={SCENE_BRIDGE_DURATION}
        fps={FPS15}
        width={1920}
        height={1080}
      />
      <Composition
        id="A15-S6-Showcase"
        component={SceneShowcase}
        durationInFrames={SCENE_SHOWCASE_DURATION}
        fps={FPS15}
        width={1920}
        height={1080}
      />
      <Composition
        id="A15-S7-BridgeList"
        component={SceneBridgeList}
        durationInFrames={SCENE_BRIDGELIST_DURATION}
        fps={FPS15}
        width={1920}
        height={1080}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          ACT 2 — SCENE INDIVIDUALI
          ═══════════════════════════════════════════════════════════════════ */}
      <Composition
        id="A2-S1-LogoReveal"
        component={Scene1LogoReveal}
        durationInFrames={ACT2_S1_DUR}
        fps={FPS2}
        width={1920}
        height={1080}
      />
      <Composition
        id="A2-S2-Areas"
        component={SceneAreas}
        durationInFrames={SCENE_AREAS_DURATION}
        fps={FPS2}
        width={1920}
        height={1080}
      />
<Composition
        id="A2-S3-FormProfile"
        component={SceneFormProfile}
        durationInFrames={SCENE_FORM_DURATION}
        fps={FPS2}
        width={1920}
        height={1080}
      />
      <Composition
        id="A2-S3b-ExecutingPlan"
        component={SceneExecutingPlan}
        durationInFrames={SCENE_EXECUTING_DURATION}
        fps={FPS2}
        width={1920}
        height={1080}
      />
      <Composition
        id="A2-S3c-ExecutingPlan2"
        component={SceneExecutingPlan2}
        durationInFrames={SCENE_EXECUTING2_DURATION}
        fps={FPS2}
        width={1920}
        height={1080}
      />
      <Composition
        id="A2-S4-WizardHero"
        component={Scene2WizardHero}
        durationInFrames={ACT2_S2_DUR}
        fps={FPS2}
        width={1920}
        height={1080}
      />
      <Composition
        id="A2-S5-WizardPlant"
        component={Scene3WizardPlant}
        durationInFrames={ACT2_S3_DUR}
        fps={FPS2}
        width={1920}
        height={1080}
      />
      <Composition
        id="A2-S6-WizardUpload"
        component={Scene4WizardUpload}
        durationInFrames={ACT2_S4_DUR}
        fps={FPS2}
        width={1920}
        height={1080}
      />
      <Composition
        id="A2-S7-WizardAI"
        component={Scene5WizardAI}
        durationInFrames={ACT2_S5_DUR}
        fps={FPS2}
        width={1920}
        height={1080}
      />
      <Composition
        id="A2-S8-WizardComplete"
        component={Scene6WizardComplete}
        durationInFrames={ACT2_S6_DUR}
        fps={FPS2}
        width={1920}
        height={1080}
      />
      <Composition
        id="A2-S9-DashboardAutonomous"
        component={SceneDashboardAutonomous}
        durationInFrames={SCENE_DASHBOARD_DURATION}
        fps={FPS2}
        width={1920}
        height={1080}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          DYNAMIC (dev playground)
          ═══════════════════════════════════════════════════════════════════ */}
      <Composition
        id="DynamicComp"
        component={DynamicComp}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ code: defaultCode }}
        calculateMetadata={({ props }) => ({
          durationInFrames: props.durationInFrames as number,
          fps: props.fps as number,
        })}
      />
    </>
  );
};
