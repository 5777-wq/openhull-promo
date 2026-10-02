import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

// 全片统一缓动 = Telegram 招牌布局曲线 cubic-bezier(0.38, 0.7, 0.125, 1)
// （CAAnimationUtils.swift:186，非 0.5s 弹簧的官方降级曲线，全库复用最高）
export const EASE = Easing.bezier(0.38, 0.7, 0.125, 1);

// alpha 专用：Telegram 定律——透明度永远走 easeInEaseOut，不走弹簧
export const EASE_ALPHA = Easing.bezier(0.42, 0, 0.58, 1);

// 入场弹簧 = Telegram animateSpring 底座（mass 5 / stiffness 900，damping 88，
// 阻尼比 0.66、约 6.5% 过冲；CAAnimationUtils.swift:338）——干脆、小幅回弹
export const POP = Easing.spring({ damping: 88, stiffness: 900, mass: 5 });

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
    // Telegram 组合律：alpha 走 easeInEaseOut，位移/缩放走弹簧
    opacity: interpolate(frame, window, [0, 1], { ...clampOpts, easing: EASE_ALPHA }),
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
