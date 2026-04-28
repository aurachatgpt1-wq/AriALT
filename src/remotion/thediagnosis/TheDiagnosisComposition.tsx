import React from "react";
import { AbsoluteFill } from "remotion";
import { SceneDiagnosis } from "./scenes/SceneDiagnosis";

export const TheDiagnosisComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <SceneDiagnosis />
    </AbsoluteFill>
  );
};
