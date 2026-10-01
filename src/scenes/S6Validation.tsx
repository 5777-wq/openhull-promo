import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { enterStyle } from "../components/Enter";
import { WAVES_D, WAVES_2_D } from "../components/ship";
import { CYAN, GLASS, INK_DARK } from "../theme";
import { FONT_MONO, FONT_SERIF } from "../fonts";
import { DarkBackdrop } from "../components/DarkBackdrop";
import { SlowZoom } from "../components/SlowZoom";
import { FILM_META } from "../version";

const EASE = Easing.bezier(0.22, 0.61, 0.36, 1);

// 三块遥测面板；数值均为官网 VALIDATION 表格公开锚点
const PLATES = [
  {
    name: "JBC",
    value: "L −1.94% · B +1.69%",
    note: "主尺度反向锚 · ±5% 判据内",
  },
  {
    name: "DTMB 1712",
    value: "±0.32 kn",
    note: "按公开轴功率复算航速",
  },
  {
    name: "NMRI MP687",
    value: "ηo 偏差 2.8%",
    note: "B 系列敞水实测对比",
  },
];

export const S6Validation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 423 数字滚动计数器：000 → 423
  const roll = spring({
    frame: frame - 70,
    fps,
    config: { damping: 20, stiffness: 60 },
    durationInFrames: 40,
  });
  const testCount = Math.min(
    FILM_META.tests,
    Math.floor((roll * FILM_META.tests)),
  );

  return (
    <AbsoluteFill>
      <DarkBackdrop />
      <SlowZoom duration={210}>
        <AbsoluteFill>
          {/* 底部波纹水印 */}
          <svg
            viewBox="0 0 1200 300"
            style={{
              position: "absolute",
              left: -60,
              bottom: -120,
              width: 2040,
              opacity: 0.9,
            }}
          >
            <g fill="none" stroke="rgba(56,189,248,0.08)" strokeWidth={3} strokeLinecap="round">
              <path d={WAVES_D} />
              <path d={WAVES_2_D} opacity={0.6} />
            </g>
          </svg>

          <AbsoluteFill
            style={{
              alignItems: "center",
              justifyContent: "center",
              padding: "0 96px",
            }}
          >
            {/* 遥测面板行 */}
            <div style={{ display: "flex", gap: 40, translate: "0 -46px" }}>
              {PLATES.map((p, i) => {
                const delay = 10 + i * 14;
                const appear = interpolate(frame, [delay, delay + 24], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: EASE,
                });
                return (
                  <div
                    key={p.name}
                    style={{
                      width: 380,
                      height: 200,
                      borderRadius: 14,
                      ...GLASS,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 12,
                      opacity: appear,
                      scale: String(interpolate(appear, [0, 1], [0.94, 1])),
                    }}
                  >
                    <div
                      style={{
                        fontFamily: FONT_MONO,
                        fontWeight: 700,
                        fontSize: 42,
                        color: INK_DARK,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {p.name}
                    </div>
                    <div
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 26,
                        fontWeight: 700,
                        color: CYAN,
                      }}
                    >
                      {p.value}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontFamily: FONT_MONO,
                        fontSize: 19,
                        color: "#64748B",
                        letterSpacing: "0.06em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {/* 绿色微型验证灯 */}
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: "#34D399",
                          boxShadow: "0 0 8px rgba(52,211,153,0.8)",
                          opacity: 0.6 + 0.4 * Math.sin((frame / 16) * Math.PI),
                        }}
                      />
                      {p.note}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* FILM_META.tests：发布会级巨型滚动计数 */}
            <div
              style={{
                ...enterStyle(frame, 62, 20),
                display: "flex",
                alignItems: "baseline",
                gap: 26,
                marginTop: 30,
              }}
            >
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontWeight: 700,
                  fontSize: 132,
                  letterSpacing: "0.02em",
                  backgroundImage:
                    "linear-gradient(180deg, #FFFFFF 25%, #94A3B8 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 22px rgba(148,197,255,0.16))",
                }}
              >
                {testCount}
              </span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  fontFamily: FONT_SERIF,
                  fontWeight: 900,
                  fontSize: 52,
                  color: INK_DARK,
                }}
              >
                <span
                  style={{
                    width: 11,
                    height: 11,
                    borderRadius: "50%",
                    background: "#34D399",
                    boxShadow: "0 0 12px rgba(52,211,153,0.9)",
                    opacity: 0.55 + 0.45 * Math.sin((frame / 11) * Math.PI),
                  }}
                />
                项测试全绿
              </span>
            </div>

            {/* 辅助行 */}
            <div
              style={{
                ...enterStyle(frame, 108, 22),
                marginTop: 8,
                fontFamily: FONT_MONO,
                fontSize: 22,
                color: "#64748B",
                letterSpacing: "0.04em",
              }}
            >
              公开基准船 · {FILM_META.validationRecords} 条公开验收记录 · KCS 失速互检 {FILM_META.kcs}
            </div>

            {/* 角标 */}
            <div
              style={{
                ...enterStyle(frame, 132, 22),
                position: "absolute",
                right: 96,
                bottom: 58,
                fontFamily: FONT_MONO,
                fontSize: 21,
                color: "#64748B",
                letterSpacing: "0.06em",
              }}
            >
              VALIDATION.md 可复查
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      </SlowZoom>
    </AbsoluteFill>
  );
};
