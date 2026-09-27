import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { enterStyle } from "../components/Enter";
import { MARK_HULL_D, MARK_WAVES_D } from "../components/Emblem";
import { CYAN, GLASS, INK_DARK, INK_SOFT_DARK } from "../theme";
import { FONT_MONO, FONT_SANS, FONT_SERIF } from "../fonts";
import { DarkBackdrop } from "../components/DarkBackdrop";
import { SlowZoom } from "../components/SlowZoom";

// 坦诚邀请幕：承认早期、边界如实、欢迎共建 —— 克制、沉稳、工程敬畏感。
// 所有表述均为事实：拒绝式守卫与跳过声明见章程，初步设计定位见仓库 README。
const ROWS: { term: string; desc: string; icon: React.ReactNode }[] = [
  {
    term: "能力有边界",
    desc: "覆盖的场景有限；域外与未验证的路径，会被直接拒绝或如实声明。",
    icon: (
      // 虚线框：边界
      <g>
        <rect x={3.5} y={3.5} width={17} height={17} rx={3} strokeDasharray="3.2 2.6" />
      </g>
    ),
  },
  {
    term: "结果需要复核",
    desc: "它给的是初步设计的参考答案，最终决策请交给船舶工程师。",
    icon: (
      // 双重校验盾牌
      <g>
        <path d="M12 3l7 2.8v5.4c0 4.4-2.9 7.3-7 8.8-4.1-1.5-7-4.4-7-8.8V5.8z" />
        <path d="M9.2 11.6l2 2 3.6-4.2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ),
  },
  {
    term: "期待与你共建",
    desc: "提一个 issue、贡献一段代码，或是用它认真算一条船——都欢迎。",
    icon: (
      // Git 分支
      <g>
        <circle cx={6} cy={5.6} r={2.1} />
        <circle cx={6} cy={18.4} r={2.1} />
        <circle cx={17.6} cy={7.2} r={2.1} />
        <path d="M6 7.8v8.4" strokeLinecap="round" />
        <path d="M17.6 9.4c0 2.9-2.7 4.4-6.2 4.4H8.4" strokeLinecap="round" />
      </g>
    ),
  },
];

export const S8Contribute: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <DarkBackdrop />
      <SlowZoom duration={210}>
        <AbsoluteFill>
          {/* 品牌标志线稿水印 */}
          <svg
            viewBox="0 0 24 24"
            style={{
              position: "absolute",
              right: -70,
              top: -70,
              width: 420,
              opacity: 0.9,
            }}
          >
            <g fill="none" stroke="rgba(56,189,248,0.07)" strokeWidth={0.7} strokeLinejoin="round">
              <path d={MARK_HULL_D} />
              <path d={MARK_WAVES_D} />
            </g>
          </svg>

          <AbsoluteFill
            style={{
              alignItems: "center",
              justifyContent: "center",
              padding: "0 96px",
            }}
          >
            <div
              style={{
                ...enterStyle(frame, 8, 22),
                fontFamily: FONT_MONO,
                fontWeight: 700,
                fontSize: 23,
                letterSpacing: "0.3em",
                color: "#2DD4BF",
              }}
            >
              EARLY DAYS
            </div>

            <h1
              style={{
                ...enterStyle(frame, 20, 26),
                fontFamily: FONT_SERIF,
                fontWeight: 900,
                fontSize: 70,
                color: INK_DARK,
                letterSpacing: "-0.01em",
                margin: "20px 0 0",
                textAlign: "center",
              }}
            >
              坦率地说，OpenHull 还在早期
            </h1>

            {/* 磨砂长条胶囊（Bento Strips） */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
                marginTop: 50,
              }}
            >
              {ROWS.map((row, i) => (
                <div
                  key={row.term}
                  style={{
                    ...enterStyle(frame, 38 + i * 14, 24),
                    width: 900,
                    minHeight: 88,
                    ...GLASS,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 24,
                    padding: "0 32px",
                    boxSizing: "border-box",
                  }}
                >
                  <svg width={26} height={26} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <g fill="none" stroke={CYAN} strokeWidth={1.6}>
                      {row.icon}
                    </g>
                  </svg>
                  <div
                    style={{
                      fontFamily: FONT_SANS,
                      fontWeight: 700,
                      fontSize: 26,
                      color: INK_DARK,
                      width: 178,
                      flexShrink: 0,
                    }}
                  >
                    {row.term}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_SANS,
                      fontWeight: 400,
                      fontSize: 21,
                      lineHeight: 1.5,
                      color: INK_SOFT_DARK,
                    }}
                  >
                    {row.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* 终端 chip 样式的仓库入口 */}
            <div
              style={{
                ...enterStyle(frame, 90, 24),
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginTop: 48,
                padding: "12px 30px",
                borderRadius: 9999,
                background: "rgba(15,23,42,0.7)",
                border: "1px solid rgba(56,189,248,0.35)",
              }}
            >
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 24,
                  color: "#E2E8F0",
                  letterSpacing: "0.02em",
                }}
              >
                github.com/5777-wq/OpenHull
              </span>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 18,
                  color: CYAN,
                  background: "rgba(56,189,248,0.12)",
                  borderRadius: 999,
                  padding: "6px 16px",
                  letterSpacing: "0.04em",
                }}
              >
                issues / PRs welcome
              </span>
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      </SlowZoom>
    </AbsoluteFill>
  );
};
