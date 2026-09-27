import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { DarkBackdrop } from "../components/DarkBackdrop";
import { Enter, enterStyle } from "../components/Enter";
import { EmblemFull } from "../components/Emblem";
import { COLORS } from "../theme";
import { FONT_MONO, FONT_SANS, FONT_SERIF } from "../fonts";

const EASE9 = Easing.bezier(0.22, 0.61, 0.36, 1);

export const S9Outro: React.FC = () => {
  const frame = useCurrentFrame();
  // 电影感落幕：最后 20 帧缓慢后拉 + 虚焦 + 沉入黑暗
  const exit = interpolate(frame, [145, 165], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE9,
  });

  return (
    <AbsoluteFill>
      <DarkBackdrop />

      <div
        style={{
          width: "100%",
          height: "100%",
          scale: String(1 - 0.04 * exit),
          opacity: String(1 - exit),
          filter: `blur(${(4 * exit).toFixed(2)}px)`,
        }}
      >
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          padding: "0 96px",
        }}
      >
        {/* 官网同款徽标 + 深蓝柔光 */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              width: 460,
              height: 460,
              left: "50%",
              top: "50%",
              translate: "-50% -50%",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(26,111,181,0.30) 0%, transparent 70%)",
              filter: "blur(30px)",
            }}
          />
          <Enter delay={2} duration={28}>
            <EmblemFull size={310} />
          </Enter>
        </div>

        {/* 英文 slogan：现代无衬线 + 金属扫光 */}
        <div
          style={{
            ...enterStyle(frame, 20, 28),
            fontFamily: FONT_SANS,
            fontWeight: 400,
            fontSize: 54,
            letterSpacing: "0.05em",
            margin: "34px 0 0",
            textAlign: "center",
            backgroundImage:
              "linear-gradient(110deg, #A8B8C8 40%, #FFFFFF 52%, #A8B8C8 64%)",
            backgroundSize: "220% 100%",
            backgroundPosition: interpolate(frame, [10, 130], [-60, 160]) + "% 0",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            WebkitTextFillColor: "transparent",
          }}
        >
          Design the shell that carries it all.
        </div>

        {/* 中文副句 */}
        <div
          style={{
            ...enterStyle(frame, 36, 26),
            fontFamily: FONT_SERIF,
            fontWeight: 700,
            fontSize: 46,
            color: COLORS.white,
            letterSpacing: "0.06em",
            marginTop: 22,
            textAlign: "center",
          }}
        >
          让每艘船，从<span style={{ color: "#7FC0F2" }}>可靠的计算</span>开始
        </div>

        {/* 链接信息（视频不可交互，用纯文字而非按钮样式） */}
        <div
          style={{
            ...enterStyle(frame, 56, 24),
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
            marginTop: 56,
          }}
        >
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 28,
              color: "rgba(216,230,243,0.92)",
              letterSpacing: "0.02em",
            }}
          >
            <span style={{ color: "rgba(216,230,243,0.5)", marginRight: 18 }}>
              GitHub
            </span>
            github.com/5777-wq/OpenHull
          </div>
          <div
            style={{
              ...enterStyle(frame, 70, 22),
              fontFamily: FONT_MONO,
              fontSize: 28,
              color: "rgba(216,230,243,0.75)",
              letterSpacing: "0.02em",
            }}
          >
            <span style={{ color: "rgba(216,230,243,0.5)", marginRight: 18 }}>
              主页与文档
            </span>
            5777-wq.github.io/openhull-site
          </div>
        </div>
      </AbsoluteFill>
      </div>
    </AbsoluteFill>
  );
};
