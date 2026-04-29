import React from "react";
import { AbsoluteFill, Sequence, Freeze } from "remotion";
import {
  SCENE_1_START, SCENE_1_DURATION,
  SCENE_AREAS_START, SCENE_AREAS_DURATION,
  SCENE_KANBAN_START, SCENE_KANBAN_DURATION,
  SCENE_WO_EXEC_START, SCENE_WO_EXEC_DURATION,
  SCENE_BLOB_HOLD_PART1_START, SCENE_BLOB_HOLD_PART1_DURATION,
  SCENE_DASHBOARD_INTERSTITIAL_START,
  SCENE_DASHBOARD_INTERSTITIAL_PLAY_DUR,
  SCENE_DASHBOARD_INTERSTITIAL_FREEZE_DUR,
  SCENE_DASHBOARD_INTERSTITIAL_FREEZE_AT,
  SCENE_BLOB_HOLD_PART2A_START, SCENE_BLOB_HOLD_PART2A_DURATION,
  SCENE_WHATIF_INTERSTITIAL_START,
  SCENE_WHATIF_INTERSTITIAL_OFFSET,
  SCENE_WHATIF_INTERSTITIAL_DURATION,
  SCENE_BLOB_HOLD_PART2B_START, SCENE_BLOB_HOLD_PART2B_DURATION,
  SCENE_KANBAN_FLOW_START, SCENE_KANBAN_FLOW_DURATION,
  SCENE_BLOB_HOLD_PART2B2_START, SCENE_BLOB_HOLD_PART2B2_DURATION,
  SCENE_BLOB_HOLD_PART2B2_OFFSET,
  SCENE_BLOB_HOLD_PART2C_START, SCENE_BLOB_HOLD_PART2C_DURATION,
  SCENE_FORM_START, SCENE_FORM_DURATION,
  SCENE_2_START, SCENE_2_DURATION,
  SCENE_3_START, SCENE_3_DURATION,
  SCENE_4_START, SCENE_4_DURATION,
  SCENE_5_START, SCENE_5_DURATION,
  SCENE_6_START, SCENE_6_DURATION,
  ARIA_COLORS,
} from "./constants";
import { Scene1LogoReveal }       from "./scenes/Scene1LogoReveal";
import { SceneAreas }             from "./scenes/SceneAreas";
import { SceneAgentCMMS }         from "./scenes/SceneAgentCMMS";
import { SceneKanbanFlow }        from "./scenes/SceneKanbanFlow";
import { SceneKanbanRouting }     from "./scenes/SceneKanbanRouting";
import { SceneWorkOrderExecCinema } from "./scenes/SceneWorkOrderExecCinema";
import { SceneBlobHold }          from "./scenes/SceneBlobHold";
import { SceneFormProfile }       from "./scenes/SceneFormProfile";
import { Scene2WizardHero }       from "./scenes/Scene2WizardHero";
import { Scene3WizardPlant }      from "./scenes/Scene3WizardPlant";
import { Scene4WizardUpload }     from "./scenes/Scene4WizardUpload";
import { Scene5WizardAI }         from "./scenes/Scene5WizardAI";
import { Scene6WizardComplete }   from "./scenes/Scene6WizardComplete";

export const Act2Composition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: ARIA_COLORS.background }}>
      <Sequence from={SCENE_1_START} durationInFrames={SCENE_1_DURATION}>
        <Scene1LogoReveal />
      </Sequence>
      <Sequence from={SCENE_AREAS_START} durationInFrames={SCENE_AREAS_DURATION}>
        <SceneAreas />
      </Sequence>
      {/* SceneAgentCMMS + SceneKanbanRouting are no longer mounted in their
          original slots — their content has been distributed as interstitials
          INSIDE SceneBlobHold:
            - SceneAgentCMMS (dashboard portion) → between Seq 0 and Seq 1
            - SceneAgentCMMS (what-if portion)   → between Seq 1 and Seq 2
            - SceneKanbanRouting                  → between Seq 3 and Seq 4
          The WorkOrder exec scene plays directly after SceneAreas now. */}
      <Sequence from={SCENE_WO_EXEC_START} durationInFrames={SCENE_WO_EXEC_DURATION}>
        <SceneWorkOrderExecCinema />
      </Sequence>
      {/* BlobHold Part 1 — up through "Up to 38% lower operating costs" */}
      <Sequence
        from={SCENE_BLOB_HOLD_PART1_START}
        durationInFrames={SCENE_BLOB_HOLD_PART1_DURATION}
      >
        <SceneBlobHold />
      </Sequence>
      {/* ── Dashboard interstitial ──────────────────────────────────────
          Plays SceneAgentCMMS scene-local frames 5..486 (alarm cards →
          flip → banner → typing → predictive-insight zoom), then FREEZES
          at scene-local frame 486 for 30f (~1s) so the graph is readable
          before the next BlobHold phrase ("+40% increase...") fires. */}
      <Sequence
        from={SCENE_DASHBOARD_INTERSTITIAL_START}
        durationInFrames={SCENE_DASHBOARD_INTERSTITIAL_PLAY_DUR}
      >
        <Sequence from={-5}>
          <SceneAgentCMMS />
        </Sequence>
      </Sequence>
      <Sequence
        from={SCENE_DASHBOARD_INTERSTITIAL_START + SCENE_DASHBOARD_INTERSTITIAL_PLAY_DUR}
        durationInFrames={SCENE_DASHBOARD_INTERSTITIAL_FREEZE_DUR}
      >
        <Freeze frame={SCENE_DASHBOARD_INTERSTITIAL_FREEZE_AT}>
          <SceneAgentCMMS />
        </Freeze>
      </Sequence>
      {/* BlobHold Part 2a — seq 1: "+40% increase in equipment lifespan"
          + "Reduction in equipment lifecycle costs" (Blob-local 190..310).
          Ends on the dark "invert" bg (kept at full opacity through Seq 1
          end), so the handover to the what-if interstitial's solid black
          backdrop reads as a single continuous dark canvas — no grey blend. */}
      <Sequence
        from={SCENE_BLOB_HOLD_PART2A_START}
        durationInFrames={SCENE_BLOB_HOLD_PART2A_DURATION}
      >
        <Sequence from={-190}>
          <SceneBlobHold />
        </Sequence>
      </Sequence>
      {/* ── What-If interstitial ────────────────────────────────────────
          Plays SceneAgentCMMS scene-local frames 486..626 (backdrop dim →
          3 scenario cards → Card C highlight + AriA reco + full Card C
          SPOTLIGHT LIFT completion). Slots between BlobHold seq 1 and seq 2. */}
      <Sequence
        from={SCENE_WHATIF_INTERSTITIAL_START}
        durationInFrames={SCENE_WHATIF_INTERSTITIAL_DURATION}
      >
        <Sequence from={-SCENE_WHATIF_INTERSTITIAL_OFFSET}>
          <SceneAgentCMMS />
        </Sequence>
      </Sequence>
      {/* BlobHold Part 2b — Seq 2 + Seq 3 (Blob-local 310..622).
          Ends right after "Reduction in staff costs" — Seq 3's last phrase
          fades to invisible by Blob-local 622 and the burst dark bg ends
          there too, so Part 2b exits on clean light bg. */}
      {/* BlobHold Part 2b-i — through "Autonomous task management" reveal.
          Then SceneKanbanFlow takes over (detail card + perspective + "and
          execution"), then BlobHold resumes for "means" + "Reduction in
          staff costs", then SceneKanbanRouting (cards + flights). */}
      <Sequence
        from={SCENE_BLOB_HOLD_PART2B_START}
        durationInFrames={SCENE_BLOB_HOLD_PART2B_DURATION}
      >
        <Sequence from={-310}>
          <SceneBlobHold />
        </Sequence>
      </Sequence>
      <Sequence from={SCENE_KANBAN_FLOW_START} durationInFrames={SCENE_KANBAN_FLOW_DURATION}>
        <SceneKanbanFlow />
      </Sequence>
      <Sequence
        from={SCENE_BLOB_HOLD_PART2B2_START}
        durationInFrames={SCENE_BLOB_HOLD_PART2B2_DURATION}
      >
        <Sequence from={-SCENE_BLOB_HOLD_PART2B2_OFFSET}>
          <SceneBlobHold />
        </Sequence>
      </Sequence>
      {/* ── Kanban routing — cards burst into columns + ROUTED flash + 3
          sequential flights. Original 350-frame interactive kanban take. */}
      <Sequence from={SCENE_KANBAN_START} durationInFrames={SCENE_KANBAN_DURATION}>
        <SceneKanbanRouting />
      </Sequence>
      {/* BlobHold Part 2c — Seq 4 + final buffer (Blob-local 622..826). */}
      <Sequence
        from={SCENE_BLOB_HOLD_PART2C_START}
        durationInFrames={SCENE_BLOB_HOLD_PART2C_DURATION}
      >
        <Sequence from={-622}>
          <SceneBlobHold />
        </Sequence>
      </Sequence>
      <Sequence from={SCENE_FORM_START} durationInFrames={SCENE_FORM_DURATION}>
        <SceneFormProfile />
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
    </AbsoluteFill>
  );
};
