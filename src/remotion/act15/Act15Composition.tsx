import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Scene1ChatGPT } from "./scenes/Scene1ChatGPT";
import { Scene2CopyPaste } from "./scenes/Scene2CopyPaste";
import { SceneThreeProblems } from "./scenes/SceneThreeProblems";
import { SceneFasterStill } from "./scenes/SceneFasterStill";
import { SceneBridge } from "./scenes/SceneBridge";
import { SceneBridgeList } from "./scenes/SceneBridgeList";

export const Act15Composition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#F0F0F0" }}>
      <TransitionSeries>

        {/* Scene 1 — ChatGPT (135 frames) — exits early so the prompt
            lands directly into Scene2's chat panel slot with no dissolve. */}
        <TransitionSeries.Sequence durationInFrames={135}>
          <Scene1ChatGPT />
        </TransitionSeries.Sequence>

        {/* → Scene 2: 1-frame near-hard cut — the prompt "pastes" into the
            next screen instead of dissolving. */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 1 })}
        />

        {/* Scene 2 — CopyPaste (300 frames) */}
        <TransitionSeries.Sequence durationInFrames={300}>
          <Scene2CopyPaste />
        </TransitionSeries.Sequence>

        {/* → SceneThreeProblems: snappy 6-frame fade (avoid mid-scene overlap) */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 6 })}
        />

        {/* SceneThreeProblems — 270 frames */}
        <TransitionSeries.Sequence durationInFrames={270}>
          <SceneThreeProblems />
        </TransitionSeries.Sequence>

        {/* → SceneFasterStill: longer fade so "Faster" emerges from the white flood */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* SceneFasterStill — 300 frames (extended for Phase 2 dark section) */}
        <TransitionSeries.Sequence durationInFrames={300}>
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

        {/* SceneBridgeList — 725 frames (~24s): title + 3 dark-blue phases + list */}
        <TransitionSeries.Sequence durationInFrames={725}>
          <SceneBridgeList />
        </TransitionSeries.Sequence>

      </TransitionSeries>
    </AbsoluteFill>
  );
};
