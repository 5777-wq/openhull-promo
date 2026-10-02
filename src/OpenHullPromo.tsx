import React from "react";
import { staticFile, Audio } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { S1Opening } from "./scenes/S1Opening";
import { S2Pain } from "./scenes/S2Pain";
import { S3Terminal } from "./scenes/S3Terminal";
import { S4Capabilities } from "./scenes/S4Capabilities";
import { S5Discipline } from "./scenes/S5Discipline";
import { S6Validation } from "./scenes/S6Validation";
import { S7Agent } from "./scenes/S7Agent";
import { S8Contribute } from "./scenes/S8Contribute";
import { S9Outro } from "./scenes/S9Outro";
import { SCENES, TIMELINE_DURATIONS, TRANSITION } from "./timings";

const SCENE_COMPONENTS = [
  S1Opening,
  S2Pain,
  S3Terminal,
  S4Capabilities,
  S5Discipline,
  S6Validation,
  S7Agent,
  S8Contribute,
  S9Outro,
];

// 九个分镜用 14 帧交叉溶解缝合成连续的一条时间线（总长仍 2025 帧 / 67.5 s）。
// 内容衔接是设计好的：S2 结尾的幽灵命令 "$ openhull run taskbook.yaml"
// 会在溶解中与 S3 终端里敲出的同一条命令叠化；S8 邀请幕后接 S9 品牌收尾。
export const OpenHullPromo: React.FC = () => {
  return (
    <>
      <Audio src={staticFile("openhull-beat.wav")} />
      {/* S7 打字声：tick 精确落在每个字符上屏的全局帧（make_typing.py 合成） */}
      <Audio src={staticFile("openhull-typing.wav")} />
      <TransitionSeries>
        {SCENE_COMPONENTS.map((Component, i) => (
          <React.Fragment key={SCENES[i].id}>
            {i > 0 && (
              <TransitionSeries.Transition
                presentation={fade()}
                timing={linearTiming({ durationInFrames: TRANSITION })}
              />
            )}
            <TransitionSeries.Sequence durationInFrames={TIMELINE_DURATIONS[i]}>
              <Component />
            </TransitionSeries.Sequence>
          </React.Fragment>
        ))}
      </TransitionSeries>
    </>
  );
};
