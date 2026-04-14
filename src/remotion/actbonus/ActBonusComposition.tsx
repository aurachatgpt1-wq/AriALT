import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";

// Independent scene copies — isolated from Act 1.5 changes
import { Scene1ChatGPT }      from "../act15/scenes/Scene1ChatGPT";
import { Scene2CopyPaste }    from "../act15/scenes/Scene2CopyPaste";
import { SceneThreeProblems as SceneB3Problems } from "./scenes/SceneB3Problems";
import { SceneFasterStill }   from "../act15/scenes/SceneFasterStill";
import { SceneBridge as SceneB4Bridge }          from "./scenes/SceneB4Bridge";

import { S1_DURATION, S2_DURATION, S3_DURATION, S_FASTER_DURATION, S4_DURATION, T2, T_FASTER, T3 } from "./constants";

// Scene 1 + 2 continuous — no cut
const SceneChatGPTFull: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={S1_DURATION}>
      <Scene1ChatGPT />
    </Sequence>
    <Sequence from={S1_DURATION}>
      <Scene2CopyPaste />
    </Sequence>
  </AbsoluteFill>
);

export const ActBonusComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#F0F0F0" }}>
      <TransitionSeries>

        {/* Scene 1+2 — ChatGPT continuous */}
        <TransitionSeries.Sequence durationInFrames={S1_DURATION + S2_DURATION}>
          <SceneChatGPTFull />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T2 })}
        />

        {/* Scene 3 — "A brilliant generalist. In a specialist's world." */}
        <TransitionSeries.Sequence durationInFrames={S3_DURATION}>
          <SceneB3Problems />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T_FASTER })}
        />

        {/* Scene 3b — "Faster. But nothing really changes." */}
        <TransitionSeries.Sequence durationInFrames={S_FASTER_DURATION}>
          <SceneFasterStill />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ durationInFrames: T3, config: { damping: 200 } })}
        />

        {/* Scene 4 — "What if AI actually knew your plant?" */}
        <TransitionSeries.Sequence durationInFrames={S4_DURATION}>
          <SceneB4Bridge />
        </TransitionSeries.Sequence>

      </TransitionSeries>
    </AbsoluteFill>
  );
};
