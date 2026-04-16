import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Scene1ChatGPT } from "./scenes/Scene1ChatGPT";
import { Scene2CopyPaste } from "./scenes/Scene2CopyPaste";
import { SceneThreeProblems } from "./scenes/SceneThreeProblems";
import { SceneFasterStill } from "./scenes/SceneFasterStill";
import { SceneBridge } from "./scenes/SceneBridge";
import { SceneBridgeList } from "./scenes/SceneBridgeList";

// Scene 1 + Scene 2 are one continuous ChatGPT session — no cut, no transition
const SceneChatGPTFull: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={210}>
      <Scene1ChatGPT />
    </Sequence>
    <Sequence from={210}>
      <Scene2CopyPaste />
    </Sequence>
  </AbsoluteFill>
);

export const Act15Composition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#F0F0F0" }}>
      <TransitionSeries>

        {/* Scene 1+2 — ChatGPT continuous (210+450 = 660 frames) */}
        <TransitionSeries.Sequence durationInFrames={660}>
          <SceneChatGPTFull />
        </TransitionSeries.Sequence>

        {/* → SceneThreeProblems: fade, 20 frames */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* SceneThreeProblems — 270 frames */}
        <TransitionSeries.Sequence durationInFrames={270}>
          <SceneThreeProblems />
        </TransitionSeries.Sequence>

        {/* → SceneFasterStill: fade, 20 frames */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* SceneFasterStill — 270 frames */}
        <TransitionSeries.Sequence durationInFrames={270}>
          <SceneFasterStill />
        </TransitionSeries.Sequence>

        {/* → SceneBridge: 30f crossfade (cream→blue) */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 30 })}
        />

        {/* SceneBridge — 735 frames */}
        <TransitionSeries.Sequence durationInFrames={735}>
          <SceneBridge />
        </TransitionSeries.Sequence>

        {/* → SceneBridgeList: 25f crossfade (logo carries through) */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 25 })}
        />

        {/* SceneBridgeList — 330 frames (~11s) */}
        <TransitionSeries.Sequence durationInFrames={330}>
          <SceneBridgeList />
        </TransitionSeries.Sequence>

      </TransitionSeries>
    </AbsoluteFill>
  );
};
