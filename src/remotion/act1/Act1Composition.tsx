import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { COLORS, SCENE_0_DURATION, SCENE_OPEN_CMMS_START, SCENE_OPEN_CMMS_DURATION, SCENE_1_DURATION, SCENE_2_DURATION, SCENE_3_DURATION, SCENE_3B_DURATION, SCENE_3C_DURATION, SCENE_4_DURATION, SCENE_1_START, SCENE_2_START, SCENE_3_START, SCENE_3B_START, SCENE_3C_START, SCENE_4_START } from "./constants";
import { Scene0Intro } from "./scenes/Scene0Intro";
import { SceneOpenCmms } from "./scenes/SceneOpenCmms";
import { Scene1WorkOrder } from "./scenes/Scene1WorkOrder";
import { Scene2ManutenzionePreventiva } from "./scenes/Scene2ManutenzionePreventiva";
import { Scene3PuntoRottura } from "./scenes/Scene3PuntoRottura";
import { Scene3bCost } from "./scenes/Scene3bCost";
import { Scene3cLimits } from "./scenes/Scene3cLimits";
import { Scene4StopRewind } from "./scenes/Scene4StopRewind";

export const Act1Composition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bgLight }}>
      <Sequence from={0} durationInFrames={SCENE_0_DURATION} name="Scena0-Intro">
        <Scene0Intro />
      </Sequence>

      <Sequence from={SCENE_OPEN_CMMS_START} durationInFrames={SCENE_OPEN_CMMS_DURATION} name="Scena0b-AperturaGestionale">
        <SceneOpenCmms />
      </Sequence>

      <Sequence from={SCENE_1_START} durationInFrames={SCENE_1_DURATION} name="Scena1-CreazioneWorkOrder">
        <Scene1WorkOrder />
      </Sequence>

      <Sequence from={SCENE_2_START} durationInFrames={SCENE_2_DURATION} name="Scena2-ManutenzionePreventiva">
        <Scene2ManutenzionePreventiva />
      </Sequence>

      <Sequence from={SCENE_3B_START} durationInFrames={SCENE_3B_DURATION} name="Scena3b-CostoInefficienza">
        <Scene3bCost />
      </Sequence>

      <Sequence from={SCENE_3_START} durationInFrames={SCENE_3_DURATION} name="Scena3-PuntoRottura">
        <Scene3PuntoRottura />
      </Sequence>

      <Sequence from={SCENE_3C_START} durationInFrames={SCENE_3C_DURATION} name="Scena3c-Limiti">
        <Scene3cLimits />
      </Sequence>

      <Sequence from={SCENE_4_START} durationInFrames={SCENE_4_DURATION} name="Scena4-StopRewind">
        <Scene4StopRewind />
      </Sequence>
    </AbsoluteFill>
  );
};
