import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { DarkBackdrop } from "../components/DarkBackdrop";
import { SlowZoom } from "../components/SlowZoom";
import { enterStyle } from "../components/Enter";
import { COLORS, gradientTextStyle } from "../theme";
import { FONT_MONO, FONT_SERIF } from "../fonts";

const EASE = Easing.bezier(0.22, 0.61, 0.36, 1);

// 背景纹理：三列整齐排列的半透明船舶试算参数矩阵，随帧缓慢上浮（0.2px/帧）
const PARAMS: [string, string][] = [
  ["Cb", "0.640"], ["L/B", "6.85"], ["B/T", "2.86"],
  ["Δ", "64,000 t"], ["DWT", "45,000 t"], ["Vs", "14.5 kn"],
  ["GM", "1.21 m"], ["T", "7.86 m"], ["Cw", "0.805"],
  ["Fn", "0.19"], ["Lpp", "212.0 m"], ["B", "32.26 m"],
];

const CodeRain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {PARAMS.map(([k, v], i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const y = (((frame * 0.2 + row * 210) % 1250) + 1250) % 1250 - 90;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: `${14 + col * 30}%`,
              top: 0,
              translate: `0 ${y}px`,
              fontFamily: FONT_MONO,
              fontSize: 26,
              whiteSpace: "nowrap",
              color: "rgba(148,163,184,0.10)",
            }}
          >
            {k}: {v}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const S2Pain: React.FC = () => {
  const frame = useCurrentFrame();

  // 激光删除线：12 帧干脆利落从左划到右
  const strike = interpolate(frame, [70, 82], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  // 划断瞬间：文字退到 0.3 并轻度虚焦
  const dim = interpolate(frame, [84, 104], [1, 0.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  const lift = interpolate(frame, [84, 104], [0, -110], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  return (
    <AbsoluteFill>
      <DarkBackdrop />
      <SlowZoom duration={150}>
        <AbsoluteFill>
          <CodeRain />

          <AbsoluteFill
            style={{
              alignItems: "center",
              justifyContent: "center",
              padding: "0 96px",
            }}
          >
            <div
              style={{
                translate: `0 ${lift}px`,
                opacity: dim,
                filter: dim < 0.95 ? `blur(${(1 - dim) * 1.4}px)` : "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  ...enterStyle(frame, 12, 24),
                  fontFamily: FONT_SERIF,
                  fontWeight: 700,
                  fontSize: 88,
                  color: "#E2E8F0",
                  letterSpacing: "0.02em",
                }}
              >
                十几张表格，数周试算。
              </div>
              <div
                style={{
                  ...enterStyle(frame, 34, 26),
                  position: "relative",
                  marginTop: 40,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_SERIF,
                    fontWeight: 900,
                    fontSize: 126,
                    letterSpacing: "0.01em",
                    ...gradientTextStyle,
                  }}
                >
                  改一个数，全部重算？
                </div>
                {/* 发光激光删除线 */}
                <div
                  style={{
                    position: "absolute",
                    left: "-1%",
                    right: "-1%",
                    top: "50%",
                    translate: "0 -50%",
                    rotate: "-1.4deg",
                    height: 4,
                    borderRadius: 2,
                    transformOrigin: "left center",
                    scale: `${strike} 1`,
                    background: "linear-gradient(90deg, #EF4444, #F87171)",
                    boxShadow: "0 0 14px rgba(239,68,68,0.8)",
                  }}
                />
              </div>
            </div>

            {/* 答案：词标 + 悬浮命令药丸。inset-0 显式居中（round-9 评审：
                词标要在画面正中央），上移 49px 让词标光学中心对准画布中心 */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                translate: "0 49px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={enterStyle(frame, 92, 24)}>
                <div
                  style={{
                    position: "relative",
                    fontFamily: FONT_SERIF,
                    fontWeight: 700,
                    fontSize: 110,
                    lineHeight: 1.1,
                    letterSpacing: "-0.01em",
                  }}
                >
                  <span
                    style={{
                      backgroundImage:
                        "linear-gradient(180deg, #FFFFFF 20%, #94A3B8 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Open
                  </span>
                  <span style={gradientTextStyle}>Hull</span>
                </div>
              </div>
              <div
                style={{
                  ...enterStyle(frame, 110, 24),
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 36,
                  padding: "15px 38px",
                  borderRadius: 9999,
                  background: "rgba(15,23,42,0.85)",
                  border: "1px solid rgba(56,189,248,0.4)",
                  boxShadow: "0 0 35px rgba(56,189,248,0.25)",
                  fontFamily: FONT_MONO,
                  fontSize: 29,
                  color: "#E2E8F0",
                }}
              >
                <span style={{ color: COLORS.teal }}>$ </span>
                openhull run taskbook.yaml
              </div>
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      </SlowZoom>
    </AbsoluteFill>
  );
};
