import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { DarkBackdrop } from "../components/DarkBackdrop";
import { SlowZoom } from "../components/SlowZoom";
import { enterStyle } from "../components/Enter";
import { EmblemDrawn } from "../components/Emblem";
import { COLORS, CYAN, gradientTextStyle } from "../theme";
import { FONT_MONO, FONT_SANS, FONT_SERIF } from "../fonts";

const EASE = Easing.bezier(0.22, 0.61, 0.36, 1);

// 窗口函数：frames a→b 内 0→1，统一缓动，两端 clamp
const sweep = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

const METAL: React.CSSProperties = {
  backgroundImage: "linear-gradient(180deg, #FFFFFF 20%, #94A3B8 100%)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
};

export const S1Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 官网同款 emblem 描线编排：船壳 → 波浪（spring 驱动，严禁匀速）
  const hull = spring({ frame: frame - 6, fps, config: { damping: 18, stiffness: 80, mass: 1 }, durationInFrames: 58 });
  const waves = spring({ frame: frame - 40, fps, config: { damping: 18, stiffness: 80, mass: 1 }, durationInFrames: 42 });
  const fill = sweep(frame, 58, 78);
  const aura = sweep(frame, 50, 80);

  // 版本胶囊圆点呼吸（周期 1.6 s）
  const dotBreath = 0.75 + 0.25 * Math.sin((frame / 48) * Math.PI * 2);

  return (
    <AbsoluteFill>
      <DarkBackdrop />

      <SlowZoom duration={150}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 10,
        }}
      >
        {/* 官网轴对称徽标：描线 → 填充 */}
        <div style={{ ...enterStyle(frame, 0, 14), marginBottom: 26 }}>
          <EmblemDrawn
            size={400}
            hull={hull}
            waves={waves}
            fill={fill}
            aura={aura}
          />
        </div>

        {/* 主标题：衬线大字，"Hull" 用渐变文字 */}
        <h1
          style={{
            ...enterStyle(frame, 84, 26),
            fontFamily: FONT_SERIF,
            fontWeight: 700,
            fontSize: 148,
            lineHeight: 1.1,
            margin: 0,
            color: COLORS.white,
            letterSpacing: "-0.015em",
          }}
        >
          <span style={METAL}>Open</span>
          <span style={gradientTextStyle}>Hull</span>
        </h1>

        {/* 副标题 */}
        <div
          style={{
            ...enterStyle(frame, 100, 24),
            fontFamily: FONT_SANS,
            fontWeight: 400,
            fontSize: 40,
            letterSpacing: "0.30em",
            marginTop: 22,
            color: "rgba(216,230,243,0.78)",
          }}
        >
          开源船舶初步设计框架
        </div>

        {/* 版本胶囊 */}
        <div
          style={{
            ...enterStyle(frame, 112, 24),
            marginTop: 32,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "12px 30px",
            borderRadius: 999,
            border: "1px solid rgba(56,189,248,0.35)",
            background: "rgba(15,23,42,0.6)",
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: CYAN,
              opacity: dotBreath,
              scale: String(1 + 0.12 * (dotBreath - 0.75)),
            }}
          />
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 24,
              fontWeight: 400,
              letterSpacing: "0.12em",
              color: "#7DD3FC",
            }}
          >
            v1.3.1
          </span>
        </div>
      </AbsoluteFill>
      </SlowZoom>
    </AbsoluteFill>
  );
};
