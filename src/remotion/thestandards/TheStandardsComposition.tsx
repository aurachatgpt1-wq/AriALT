import React from "react";
import { AbsoluteFill } from "remotion";
import { SceneStandardsCarousel } from "./scenes/SceneStandardsCarousel";

export const TheStandardsComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <SceneStandardsCarousel />
    </AbsoluteFill>
  );
};
