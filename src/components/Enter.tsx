import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

// 全片统一缓动（官网同款 cubic-bezier），禁 linear 与生硬弹跳
export const EASE = Easing.bezier(0.22, 0.61, 0.36, 1);

// 发布会级入场弹簧：阻尼适中、弹性干脆有力（全局基准 #3）
export const POP = Easing.spring({ damping: 14, stiffness: 110, mass: 0.8 });

const clampOpts = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// 标准入场：淡入 + 上移 24px + 轻微缩放 0.98→1
// 位移取整到整像素：亚像素爬行在播放时会被显示端取整成 1px 上下抖
export const enterStyle = (
  frame: number,
  delay: number,
  duration = 24,
): React.CSSProperties => {
  const window = [delay, delay + duration];
  const y = interpolate(frame, window, [24, 0], { ...clampOpts, easing: POP });
  return {
    opacity: interpolate(frame, window, [0, 1], { ...clampOpts, easing: POP }),
    translate: `0px ${Math.round(y)}px`,
    scale: interpolate(frame, window, [0.98, 1], {
      ...clampOpts,
      easing: POP,
      output: "perceptual-scale",
    }),
  };
};

// 同屏多元素错峰入场时直接给不同 delay
export const Enter: React.FC<{
  delay?: number;
  duration?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ delay = 0, duration = 24, style, children }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ ...enterStyle(frame, delay, duration), ...style }}>
      {children}
    </div>
  );
};
