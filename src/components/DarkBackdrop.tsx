import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  DARK_GRADIENT,
  GLOW_BLUE,
  GLOW_TEAL,
  GRID_LINE,
  GRID_SIZE,
} from "../theme";

const EASE = Easing.bezier(0.22, 0.61, 0.36, 1);

// 深色场景底：海军蓝渐变 + 56px 细网格（径向 mask 边缘淡出）+ 两团呼吸光晕。
// 呼吸幅度刻意压小到"几乎察觉不到"（约 ±6%，周期 4.8 s）。
export const DarkBackdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // 网格淡入（开场即起，收尾场景复用时也是柔和进入）
  const gridOpacity = interpolate(frame, [0, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  // 光晕呼吸：正弦驱动，逐帧确定（幅度压到 ±3%，周期 4.8 s）
  const breath = 0.97 + 0.03 * Math.sin((frame / 144) * Math.PI * 2);

  // 场景末尾 8 帧轻微压暗，硬切更干净
  const tail = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [1, 0.92],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ opacity: tail }}>
      <AbsoluteFill style={{ backgroundImage: DARK_GRADIENT }} />
      {/* 细网格 + 径向 mask */}
      <AbsoluteFill
        style={{
          opacity: gridOpacity,
          backgroundImage: `linear-gradient(${GRID_LINE} 1px, transparent 1px), linear-gradient(90deg, ${GRID_LINE} 1px, transparent 1px)`,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          maskImage:
            "radial-gradient(ellipse 72% 66% at 50% 44%, black 30%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 72% 66% at 50% 44%, black 30%, transparent 78%)",
        }}
      />
      {/* 电影级暗角：边缘轻压，聚拢视线 */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 78% 72% at 50% 46%, transparent 55%, rgba(3,9,17,0.42) 100%)",
        }}
      />
      {/* 蓝色主光晕（中偏右） */}
      <div
        style={{
          position: "absolute",
          width: 1500,
          height: 1500,
          left: "58%",
          top: "46%",
          translate: "-50% -50%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${GLOW_BLUE} 0%, transparent 62%)`,
          filter: "blur(70px)",
          opacity: breath,
        }}
      />
      {/* 青绿辅光晕（左下） */}
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          left: "18%",
          top: "78%",
          translate: "-50% -50%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${GLOW_TEAL} 0%, transparent 60%)`,
          filter: "blur(70px)",
          opacity: 0.85 + 0.15 * breath,
        }}
      />
    </AbsoluteFill>
  );
};
