import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE, enterStyle } from "../components/Enter";
import { DrawnPath } from "../components/ship";
import { CYAN, GLASS, INK_DARK, INK_SOFT_DARK } from "../theme";
import { FONT_MONO, FONT_SANS, FONT_SERIF } from "../fonts";
import { DarkBackdrop } from "../components/DarkBackdrop";
import { SlowZoom } from "../components/SlowZoom";

// GZ 复原力臂曲线（示意形状：峰值约 36°，90° 归零，非任何具体船的数据）
const GZ_CURVE_D =
  "M 60 370 C 150 240, 235 120, 335 102 C 425 90, 560 220, 740 370";
const GZ_AREA_D = `${GZ_CURVE_D} L 740 370 L 60 370 Z`;
const PEAK_X = 335;
const PEAK_Y = 102;

// 工程纪律四条（口径：白名单公式，无"原书"字样）
const RULES = [
  {
    n: "01",
    term: "白名单先行",
    desc: "每条经验公式先入白名单，逐条溯源核验后方可使用——先立账本，再动手。",
  },
  {
    n: "02",
    term: "验收靠数字",
    desc: "独立路径互检、公开基准船数据交叉验证；“能跑”不算验收。",
  },
  {
    n: "03",
    term: "近似必须声明",
    desc: "直壁甲板、阻尼区间、被约束的自由度——写了什么假定，就声明在哪里。",
  },
  {
    n: "04",
    term: "人机各司其职",
    desc: "谐摇区是否规避、衡准是否否决方案，是船舶工程师的专业判断；工具只报告。",
  },
];

export const S5Discipline: React.FC = () => {
  const frame = useCurrentFrame();

  const draw = interpolate(frame, [18, 112], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  const marker = interpolate(frame, [116, 132], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  return (
    <AbsoluteFill>
      <DarkBackdrop />
      <SlowZoom duration={240}>
        <AbsoluteFill>
          {/* 背景巧思：量角弧水印，呼应稳性主题 */}
          <svg
            viewBox="0 0 620 320"
            style={{
              position: "absolute",
              right: -90,
              top: -110,
              width: 640,
              opacity: 0.9,
            }}
          >
            <g fill="none" stroke="rgba(56,189,248,0.07)" strokeWidth={2.4} strokeLinecap="round">
              <path d="M 50 300 A 260 260 0 0 1 570 300" />
              <path d="M 110 300 A 200 200 0 0 1 510 300" opacity={0.7} />
              {Array.from({ length: 7 }, (_, i) => {
                const a = Math.PI - (i * Math.PI) / 6;
                const x1 = 310 + 236 * Math.cos(a);
                const y1 = 300 - 236 * Math.sin(a);
                const x2 = 310 + 260 * Math.cos(a);
                const y2 = 300 - 260 * Math.sin(a);
                return <path key={i} d={`M ${x1} ${y1} L ${x2} ${y2}`} />;
              })}
              <path d="M 310 300 L 452 116" />
            </g>
          </svg>

          <AbsoluteFill
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 72,
              padding: "0 150px",
            }}
          >
            {/* 左：深色精密示波器面板 */}
            <div
              style={{
                ...enterStyle(frame, 6, 24),
                width: 850,
                height: 580,
                ...GLASS,
                borderRadius: 16,
                padding: "36px 44px",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 21,
                  color: INK_SOFT_DARK,
                  letterSpacing: "0.06em",
                }}
              >
                GZ 复原力臂曲线 · 大倾角稳性
              </div>
              <svg viewBox="0 0 780 420" width="100%" style={{ marginTop: 18 }}>
                <defs>
                  <linearGradient id="gzGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#22D3EE" />
                    <stop offset="1" stopColor="#38BDF8" />
                  </linearGradient>
                  <linearGradient id="gzArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="rgba(56,189,248,0.28)" />
                    <stop offset="1" stopColor="rgba(56,189,248,0)" />
                  </linearGradient>
                </defs>
                {/* 虚线精密网格 */}
                {[40, 150, 260].map((y) => (
                  <path key={y} d={`M 60 ${y} L 740 ${y}`} stroke="rgba(255,255,255,0.05)" strokeWidth={1.5} strokeDasharray="3 6" fill="none" />
                ))}
                {[287, 513].map((x) => (
                  <path key={x} d={`M ${x} 40 L ${x} 370`} stroke="rgba(255,255,255,0.04)" strokeWidth={1.5} strokeDasharray="3 6" fill="none" />
                ))}
                {/* 安全域渐变填充 */}
                <path d={GZ_AREA_D} fill="url(#gzArea)" opacity={draw} />
                {/* 坐标轴 */}
                <path d="M 60 40 L 60 370 L 740 370" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={2} />
                {/* 轴刻度 */}
                {[
                  { x: 60, label: "0°" },
                  { x: 287, label: "30°" },
                  { x: 513, label: "60°" },
                  { x: 740, label: "90°" },
                ].map((t) => (
                  <text key={t.label} x={t.x} y={400} textAnchor="middle" fontFamily={FONT_MONO} fontSize={19} fill="#64748B">
                    {t.label}
                  </text>
                ))}
                <text x={70} y={62} fontFamily={FONT_MONO} fontSize={19} fill="#64748B">
                  GZ / m
                </text>
                {/* GZ max：双层光环 + 双向参考虚线 */}
                <g opacity={marker}>
                  <path d={`M ${PEAK_X} ${PEAK_Y} L ${PEAK_X} 370`} stroke={CYAN} strokeWidth={1.6} strokeDasharray="5 6" opacity={0.5} fill="none" />
                  <path d={`M 60 ${PEAK_Y} L ${PEAK_X} ${PEAK_Y}`} stroke={CYAN} strokeWidth={1.6} strokeDasharray="5 6" opacity={0.35} fill="none" />
                  <circle cx={PEAK_X} cy={PEAK_Y} r={12} fill="none" stroke={CYAN} strokeWidth={1.6} opacity={0.35 + 0.25 * Math.sin((frame / 12) * Math.PI)} />
                  <circle cx={PEAK_X} cy={PEAK_Y} r={6.5} fill="none" stroke={CYAN} strokeWidth={1.8} opacity={0.9} />
                  <circle cx={PEAK_X} cy={PEAK_Y} r={3.5} fill="#7DD3FC" />
                  <text x={PEAK_X + 18} y={PEAK_Y - 16} textAnchor="start" fontFamily={FONT_MONO} fontSize={20} fill="#E2E8F0">
                    GZ max
                  </text>
                </g>
                {/* 曲线逐点绘出（渐变青蓝笔触） */}
                <DrawnPath d={GZ_CURVE_D} progress={draw} stroke="url(#gzGrad)" strokeWidth={3} />
              </svg>
            </div>

            {/* 右：工业法则条目 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                maxWidth: 660,
              }}
            >
              <div
                style={{
                  ...enterStyle(frame, 24, 24),
                  fontFamily: FONT_MONO,
                  fontWeight: 700,
                  fontSize: 16,
                  letterSpacing: "0.22em",
                  color: CYAN,
                }}
              >
                ENGINEERING DISCIPLINE · AGENTS.MD
              </div>
              <div
                style={{
                  ...enterStyle(frame, 32, 24),
                  fontFamily: FONT_SERIF,
                  fontWeight: 900,
                  fontSize: 58,
                  color: INK_DARK,
                  letterSpacing: "0.02em",
                  marginTop: 16,
                }}
              >
                把工程纪律写进章程
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 38 }}>
                {RULES.map((rule, i) => (
                  <div
                    key={rule.n}
                    style={{
                      ...enterStyle(frame, 48 + i * 14, 24),
                      display: "flex",
                      gap: 18,
                      alignItems: "flex-start",
                    }}
                  >
                    {/* 左侧发光激活竖线 */}
                    <span
                      style={{
                        width: 2.5,
                        height: 52,
                        borderRadius: 2,
                        background: CYAN,
                        boxShadow: "0 0 8px rgba(56,189,248,0.8)",
                        marginTop: 4,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: FONT_MONO,
                        fontWeight: 700,
                        fontSize: 18,
                        color: CYAN,
                        marginTop: 2,
                        width: 34,
                        flexShrink: 0,
                      }}
                    >
                      {rule.n}
                    </span>
                    <div>
                      <div
                        style={{
                          fontFamily: FONT_SANS,
                          fontWeight: 700,
                          fontSize: 29,
                          color: INK_DARK,
                        }}
                      >
                        {rule.term}
                      </div>
                      <div
                        style={{
                          fontFamily: FONT_SANS,
                          fontWeight: 400,
                          fontSize: 21,
                          lineHeight: 1.5,
                          color: INK_SOFT_DARK,
                          marginTop: 5,
                        }}
                      >
                        {rule.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      </SlowZoom>
    </AbsoluteFill>
  );
};
