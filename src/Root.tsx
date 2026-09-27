import "./index.css";
import { Composition, Folder } from "remotion";
import { OpenHullPromo } from "./OpenHullPromo";
import { S1Opening } from "./scenes/S1Opening";
import { S2Pain } from "./scenes/S2Pain";
import { S3Terminal } from "./scenes/S3Terminal";
import { S4Capabilities } from "./scenes/S4Capabilities";
import { S5Discipline } from "./scenes/S5Discipline";
import { S6Validation } from "./scenes/S6Validation";
import { S7Agent } from "./scenes/S7Agent";
import { S8Contribute } from "./scenes/S8Contribute";
import { S9Outro } from "./scenes/S9Outro";
import { FPS, HEIGHT, SCENES, WIDTH } from "./timings";

const SCENE_COMPONENTS = [
  ["S1Opening", S1Opening],
  ["S2Pain", S2Pain],
  ["S3Terminal", S3Terminal],
  ["S4Capabilities", S4Capabilities],
  ["S5Discipline", S5Discipline],
  ["S6Validation", S6Validation],
  ["S7Agent", S7Agent],
  ["S8Contribute", S8Contribute],
  ["S9Outro", S9Outro],
] as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Scenes">
        {SCENE_COMPONENTS.map(([id, component], i) => (
          <Composition
            key={id}
            id={id}
            component={component}
            durationInFrames={SCENES[i].duration}
            fps={FPS}
            width={WIDTH}
            height={HEIGHT}
          />
        ))}
      </Folder>
      <Composition
        id="OpenHullPromo"
        component={OpenHullPromo}
        durationInFrames={1755}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};
