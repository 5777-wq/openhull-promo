import React from "react";
import { Composition, registerRoot } from "remotion";
import { OpenHullPremium, premiumMetadata } from "./DesignFilm";

const RemotionRoot: React.FC = () => (
  <Composition
    id="OpenHullPremium"
    component={OpenHullPremium}
    width={premiumMetadata.width}
    height={premiumMetadata.height}
    fps={premiumMetadata.fps}
    durationInFrames={premiumMetadata.durationInFrames}
  />
);
registerRoot(RemotionRoot);
