import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE, enterStyle } from "../components/Enter";
import { DrawnPath } from "../components/ship";
import { CYAN, GLASS, INK_DARK, INK_SOFT_DARK } from "../theme";
import { FONT_MONO, FONT_SANS, FONT_SERIF } from "../fonts";
import { DarkBackdrop } from "../components/DarkBackdrop";
import { SlowZoom } from "../components/SlowZoom";

// GZ 复原力臂曲线——45,000 t 算例（FILM-45000 任务书全链真实计算，
// run_taskbook() 的 gz_curve 输出；数据来自 premium/design-data.ts）。
// 峰值 1.392 m @ 26.75°，消失角 61.48°，70° 后为负（倾覆侧如实画出）。
// 路径 = 自然三次样条穿过 9 个真实点、每 0.5° 密采样（round-9b：消除折角；
// 峰区圆滑且精确穿过 26.75° 数据点，零线交点 61.5° 与消失角线重合）
const GZ_CURVE_D =
  "M 60.0 219.6 L 63.8 216.4 L 67.6 213.2 L 71.3 209.9 L 75.1 206.7 L 78.9 203.5 L 82.7 200.2 L 86.4 196.9 L 90.2 193.6 L 94.0 190.3 L 97.8 186.9 L 101.6 183.5 L 105.3 180.0 L 109.1 176.5 L 112.9 172.9 L 116.7 169.3 L 120.4 165.6 L 124.2 161.9 L 128.0 158.1 L 131.8 154.2 L 135.6 150.2 L 139.3 146.2 L 143.1 142.0 L 146.9 137.9 L 150.7 133.7 L 154.4 129.5 L 158.2 125.2 L 162.0 121.0 L 165.8 116.9 L 169.6 112.7 L 173.3 108.6 L 177.1 104.6 L 180.9 100.7 L 184.7 96.9 L 188.4 93.3 L 192.2 89.7 L 196.0 86.3 L 199.8 83.1 L 203.6 80.0 L 207.3 77.2 L 211.1 74.6 L 214.9 72.2 L 218.7 70.0 L 222.4 68.0 L 226.2 66.3 L 230.0 64.7 L 233.8 63.4 L 237.6 62.2 L 241.3 61.2 L 245.1 60.3 L 248.9 59.7 L 252.7 59.1 L 256.4 58.8 L 260.2 58.5 L 264.0 58.4 L 267.8 58.4 L 271.6 58.5 L 275.3 58.8 L 279.1 59.1 L 282.9 59.6 L 286.7 60.2 L 290.4 60.9 L 294.2 61.7 L 298.0 62.6 L 301.8 63.6 L 305.6 64.7 L 309.3 65.9 L 313.1 67.2 L 316.9 68.6 L 320.7 70.0 L 324.4 71.5 L 328.2 73.2 L 332.0 74.8 L 335.8 76.6 L 339.6 78.4 L 343.3 80.3 L 347.1 82.3 L 350.9 84.3 L 354.7 86.4 L 358.4 88.5 L 362.2 90.7 L 366.0 92.9 L 369.8 95.1 L 373.6 97.5 L 377.3 99.8 L 381.1 102.2 L 384.9 104.7 L 388.7 107.1 L 392.4 109.7 L 396.2 112.2 L 400.0 114.9 L 403.8 117.5 L 407.6 120.2 L 411.3 122.9 L 415.1 125.7 L 418.9 128.5 L 422.7 131.4 L 426.4 134.3 L 430.2 137.2 L 434.0 140.1 L 437.8 143.1 L 441.6 146.2 L 445.3 149.2 L 449.1 152.3 L 452.9 155.4 L 456.7 158.6 L 460.4 161.8 L 464.2 165.0 L 468.0 168.3 L 471.8 171.5 L 475.6 174.8 L 479.3 178.2 L 483.1 181.5 L 486.9 184.9 L 490.7 188.3 L 494.4 191.7 L 498.2 195.1 L 502.0 198.6 L 505.8 202.1 L 509.6 205.5 L 513.3 209.1 L 517.1 212.6 L 520.9 216.1 L 524.7 219.7 L 528.4 223.2 L 532.2 226.8 L 536.0 230.4 L 539.8 234.0 L 543.6 237.6 L 547.3 241.2 L 551.1 244.9 L 554.9 248.5 L 558.7 252.2 L 562.4 255.8 L 566.2 259.5 L 570.0 263.1 L 573.8 266.8 L 577.6 270.5 L 581.3 274.2 L 585.1 277.8 L 588.9 281.5 L 592.7 285.2 L 596.4 288.9 L 600.2 292.5 L 604.0 296.2 L 607.8 299.9 L 611.6 303.6 L 615.3 307.3 L 619.1 310.9 L 622.9 314.6 L 626.7 318.3 L 630.4 322.0 L 634.2 325.7 L 638.0 329.4 L 641.8 333.0 L 645.6 336.7 L 649.3 340.4 L 653.1 344.1 L 656.9 347.8 L 660.7 351.5 L 664.4 355.1";
const GZ_AREA_D =
  "M 60.0 219.6 L 63.8 216.4 L 67.6 213.2 L 71.3 209.9 L 75.1 206.7 L 78.9 203.5 L 82.7 200.2 L 86.4 196.9 L 90.2 193.6 L 94.0 190.3 L 97.8 186.9 L 101.6 183.5 L 105.3 180.0 L 109.1 176.5 L 112.9 172.9 L 116.7 169.3 L 120.4 165.6 L 124.2 161.9 L 128.0 158.1 L 131.8 154.2 L 135.6 150.2 L 139.3 146.2 L 143.1 142.0 L 146.9 137.9 L 150.7 133.7 L 154.4 129.5 L 158.2 125.2 L 162.0 121.0 L 165.8 116.9 L 169.6 112.7 L 173.3 108.6 L 177.1 104.6 L 180.9 100.7 L 184.7 96.9 L 188.4 93.3 L 192.2 89.7 L 196.0 86.3 L 199.8 83.1 L 203.6 80.0 L 207.3 77.2 L 211.1 74.6 L 214.9 72.2 L 218.7 70.0 L 222.4 68.0 L 226.2 66.3 L 230.0 64.7 L 233.8 63.4 L 237.6 62.2 L 241.3 61.2 L 245.1 60.3 L 248.9 59.7 L 252.7 59.1 L 256.4 58.8 L 260.2 58.5 L 264.0 58.4 L 267.8 58.4 L 271.6 58.5 L 275.3 58.8 L 279.1 59.1 L 282.9 59.6 L 286.7 60.2 L 290.4 60.9 L 294.2 61.7 L 298.0 62.6 L 301.8 63.6 L 305.6 64.7 L 309.3 65.9 L 313.1 67.2 L 316.9 68.6 L 320.7 70.0 L 324.4 71.5 L 328.2 73.2 L 332.0 74.8 L 335.8 76.6 L 339.6 78.4 L 343.3 80.3 L 347.1 82.3 L 350.9 84.3 L 354.7 86.4 L 358.4 88.5 L 362.2 90.7 L 366.0 92.9 L 369.8 95.1 L 373.6 97.5 L 377.3 99.8 L 381.1 102.2 L 384.9 104.7 L 388.7 107.1 L 392.4 109.7 L 396.2 112.2 L 400.0 114.9 L 403.8 117.5 L 407.6 120.2 L 411.3 122.9 L 415.1 125.7 L 418.9 128.5 L 422.7 131.4 L 426.4 134.3 L 430.2 137.2 L 434.0 140.1 L 437.8 143.1 L 441.6 146.2 L 445.3 149.2 L 449.1 152.3 L 452.9 155.4 L 456.7 158.6 L 460.4 161.8 L 464.2 165.0 L 468.0 168.3 L 471.8 171.5 L 475.6 174.8 L 479.3 178.2 L 483.1 181.5 L 486.9 184.9 L 490.7 188.3 L 494.4 191.7 L 498.2 195.1 L 502.0 198.6 L 505.8 202.1 L 509.6 205.5 L 513.3 209.1 L 517.1 212.6 L 520.9 216.1 L 524.5 219.6 L 60 219.6 Z";
const PEAK_X = 262.1;
const PEAK_Y = 58.4;
const ZERO_Y = 219.6;
const VANISH_X = 524.5;

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
                <span>GZ 复原力臂曲线 · 大倾角稳性</span>
                <span style={{ float: "right", color: "#475569" }}>
                  45,000 t 算例 · 真实计算数据
                </span>
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
                {/* 坐标轴 + 零线（消失角以下为倾覆侧，如实展示） */}
                <path d="M 60 40 L 60 370 L 740 370" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={2} />
                <path d={`M 60 ${ZERO_Y} L 740 ${ZERO_Y}`} stroke="rgba(255,255,255,0.14)" strokeWidth={1.4} strokeDasharray="2 6" fill="none" />
                <text x={44} y={ZERO_Y + 6} textAnchor="end" fontFamily={FONT_MONO} fontSize={17} fill="#475569">
                  0
                </text>
                {/* 消失角刻度：曲线与零线的交点 */}
                <g opacity={marker}>
                  <path d={`M ${VANISH_X} ${ZERO_Y} L ${VANISH_X} 370`} stroke="#38BDF8" strokeWidth={1.4} strokeDasharray="4 6" opacity={0.45} fill="none" />
                  <text x={VANISH_X + 12} y={352} fontFamily={FONT_MONO} fontSize={18} fill="#64748B">
                    消失角 61.5°
                  </text>
                </g>
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
                <text x={70} y={32} fontFamily={FONT_MONO} fontSize={19} fill="#64748B">
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
                    GZ max 1.392 m
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
