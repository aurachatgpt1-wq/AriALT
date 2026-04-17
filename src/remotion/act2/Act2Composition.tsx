import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import {
  SCENE_1_START, SCENE_1_DURATION,
  SCENE_AREAS_START, SCENE_AREAS_DURATION,
  SCENE_FORM_START, SCENE_FORM_DURATION,
  SCENE_EXECUTING_START, SCENE_EXECUTING_DURATION,
  SCENE_2_START, SCENE_2_DURATION,
  SCENE_3_START, SCENE_3_DURATION,
  SCENE_4_START, SCENE_4_DURATION,
  SCENE_5_START, SCENE_5_DURATION,
  SCENE_6_START, SCENE_6_DURATION,
  SCENE_EXECUTING2_START, SCENE_EXECUTING2_DURATION,
  SCENE_DASHBOARD_START, SCENE_DASHBOARD_DURATION,
  ARIA_COLORS,
} from "./constants";
import { Scene1LogoReveal }       from "./scenes/Scene1LogoReveal";
import { SceneAreas }             from "./scenes/SceneAreas";
import { SceneFormProfile }       from "./scenes/SceneFormProfile";
import { SceneExecutingPlan }     from "./scenes/SceneExecutingPlan";
import { Scene2WizardHero }       from "./scenes/Scene2WizardHero";
import { Scene3WizardPlant }      from "./scenes/Scene3WizardPlant";
import { Scene4WizardUpload }     from "./scenes/Scene4WizardUpload";
import { Scene5WizardAI }         from "./scenes/Scene5WizardAI";
import { Scene6WizardComplete }   from "./scenes/Scene6WizardComplete";
import { SceneExecutingPlan2 }    from "./scenes/SceneExecutingPlan2";
import { SceneDashboardAutonomous } from "./scenes/SceneDashboardAutonomous";

export const Act2Composition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: ARIA_COLORS.background }}>
      <Sequence from={SCENE_1_START} durationInFrames={SCENE_1_DURATION}>
        <Scene1LogoReveal />
      </Sequence>
      <Sequence from={SCENE_AREAS_START} durationInFrames={SCENE_AREAS_DURATION}>
        <SceneAreas />
      </Sequence>
<Sequence from={SCENE_FORM_START} durationInFrames={SCENE_FORM_DURATION}>
        <SceneFormProfile />
      </Sequence>
      <Sequence from={SCENE_EXECUTING_START} durationInFrames={SCENE_EXECUTING_DURATION}>
        <SceneExecutingPlan />
      </Sequence>
      <Sequence from={SCENE_2_START} durationInFrames={SCENE_2_DURATION}>
        <Scene2WizardHero />
      </Sequence>
      <Sequence from={SCENE_3_START} durationInFrames={SCENE_3_DURATION}>
        <Scene3WizardPlant />
      </Sequence>
      <Sequence from={SCENE_4_START} durationInFrames={SCENE_4_DURATION}>
        <Scene4WizardUpload />
      </Sequence>
      <Sequence from={SCENE_5_START} durationInFrames={SCENE_5_DURATION}>
        <Scene5WizardAI />
      </Sequence>
      <Sequence from={SCENE_6_START} durationInFrames={SCENE_6_DURATION}>
        <Scene6WizardComplete />
      </Sequence>
      <Sequence from={SCENE_EXECUTING2_START} durationInFrames={SCENE_EXECUTING2_DURATION}>
        <SceneExecutingPlan2 />
      </Sequence>
      <Sequence from={SCENE_DASHBOARD_START} durationInFrames={SCENE_DASHBOARD_DURATION}>
        <SceneDashboardAutonomous />
      </Sequence>
    </AbsoluteFill>
  );
};
