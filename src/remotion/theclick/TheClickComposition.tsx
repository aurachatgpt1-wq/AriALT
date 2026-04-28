import React from "react";
import { AbsoluteFill } from "remotion";
import { SceneClick } from "./scenes/SceneClick";

export const TheClickComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      <SceneClick />
    </AbsoluteFill>
  );
};
