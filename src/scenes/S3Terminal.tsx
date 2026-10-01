import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { DarkBackdrop } from "../components/DarkBackdrop";
import { SlowZoom } from "../components/SlowZoom";
import { enterStyle } from "../components/Enter";
import { COLORS } from "../theme";
import { FONT_MONO } from "../fonts";

const EASE = Easing.bezier(0.22, 0.61, 0.36, 1);

const COMMAND = "openhull run taskbook.yaml";
const TYPE_START = 14;
const FRAMES_PER_CHAR = 2;

// 阶段行：label + 点线引导 + 状态（全部为真实产物与真实衡准名）
const STAGES: { label: string; status: string; pass?: boolean }[] = [
  { label: "主尺度与重量平衡", status: "✓" },
  { label: "静水力", status: "✓" },
  { label: "稳性 · IS Code 2.2/2.3", status: "PASS", pass: true },
  { label: "阻力与推进 · 艾亚 + Holtrop", status: "✓" },
  { label: "B 系列螺旋桨", status: "✓" },
];

const STAGE_DELAYS = [86, 94, 102, 110, 118];

// 终端行入场：比全局入场更轻（上移 10px），符合命令行的克制
const rowStyle = (frame: number, delay: number): React.CSSProperties => ({
  opacity: interpolate(frame, [delay, delay + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  }),
  translate: `0 ${Math.round(
    interpolate(frame, [delay, delay + 18], [10, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASE,
    }),
  )}px`,
});

export const S3Terminal: React.FC = () => {
  const frame = useCurrentFrame();
  const typedChars = Math.min(
    Math.max(Math.floor((frame - TYPE_START) / FRAMES_PER_CHAR), 0),
    COMMAND.length,
  );
  const typing = typedChars > 0 && typedChars < COMMAND.length;
  // 光标闪烁：14 帧周期（打字中常亮）
  const cursorOn = typing || Math.floor(frame / 14) % 2 === 0;

  return (
    <AbsoluteFill>
      <DarkBackdrop />

      <SlowZoom duration={195}>
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center", padding: "0 96px" }}
      >
        <div
          style={{
            position: "absolute",
            width: 1240,
            height: 700,
            left: "50%",
            top: "50%",
            translate: "-50% -50%",
            borderRadius: 40,
            background:
              "radial-gradient(ellipse, rgba(26,111,181,0.30) 0%, rgba(15,157,138,0.10) 55%, transparent 75%)",
            filter: "blur(46px)",
          }}
        />
        <div
          style={{
            ...enterStyle(frame, 4, 22),
            width: 1180,
            borderRadius: 14,
            background: "rgba(10,15,26,0.92)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow: "0 24px 80px rgba(4,12,22,0.5)",
            overflow: "hidden",
          }}
        >
          {/* 窗口标题栏 */}
          <div
            style={{
              height: 52,
              display: "flex",
              alignItems: "center",
              paddingLeft: 22,
              gap: 9,
              background: "rgba(255,255,255,0.04)",
              borderBottom: "1px solid rgba(120,170,220,0.10)",
            }}
          >
            {["#E0655F", "#D9A038", "#3FA76A"].map((c) => (
              <span
                key={c}
                style={{ width: 13, height: 13, borderRadius: "50%", background: c }}
              />
            ))}
            <span
              style={{
                position: "absolute",
                left: "50%",
                translate: "-50% 0",
                fontFamily: FONT_MONO,
                fontSize: 19,
                color: "rgba(216,230,243,0.45)",
              }}
            >
              openhull — zsh
            </span>
          </div>

          {/* 终端主体（固定高度 = 10 行内容，输出时窗口不再长高） */}
          <div
            style={{
              padding: "34px 48px 38px",
              minHeight: 676,
              boxSizing: "border-box",
              fontFamily: FONT_MONO,
              fontSize: 29,
              lineHeight: 2.05,
              color: COLORS.terminalText,
            }}
          >
            {/* 命令行 + 打字机 */}
            <div style={{ whiteSpace: "nowrap" }}>
              <span style={{ color: COLORS.teal }}>$ </span>
              <span>{COMMAND.slice(0, typedChars)}</span>
              {frame < STAGE_DELAYS[0] - 6 && (
                <span
                  style={{
                    display: "inline-block",
                    width: 15,
                    height: 30,
                    translate: "0 5px",
                    background: COLORS.terminalText,
                    opacity: cursorOn ? 0.85 : 0,
                  }}
                />
              )}
            </div>

            {/* 版本与预检（真实事实：v1.6.0、8 道适用域关卡） */}
            <div
              style={{
                ...rowStyle(frame, 74),
                fontSize: 24,
                color: "rgba(216,230,243,0.52)",
              }}
            >
              openhull v1.6.0 · 适用域预检 8/8 通过
            </div>

            {/* 阶段清单：label + 点线引导 + 状态 */}
            {STAGES.map((s, i) => (
              <div key={s.label} style={rowStyle(frame, STAGE_DELAYS[i])}>
                <div style={{ display: "flex", alignItems: "baseline" }}>
                  <span style={{ color: "rgba(216,230,243,0.92)", whiteSpace: "nowrap" }}>
                    {s.label}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      minWidth: 40,
                      margin: "0 18px",
                      borderBottom: "2px dotted rgba(216,230,243,0.22)",
                      translate: "0 -7px",
                    }}
                  />
                  {s.pass ? (
                    <span
                      style={{
                        background: "#059669",
                        color: "#FFFFFF",
                        fontWeight: 700,
                        fontSize: 22,
                        padding: "2px 14px",
                        borderRadius: 6,
                        whiteSpace: "nowrap",
                        boxShadow: "0 0 18px rgba(5,150,105,0.55)",
                        scale: String(
                          interpolate(
                            frame,
                            [STAGE_DELAYS[i], STAGE_DELAYS[i] + 6],
                            [1.15, 1.0],
                            {
                              extrapolateLeft: "clamp",
                              extrapolateRight: "clamp",
                              easing: EASE,
                            },
                          ),
                        ),
                      }}
                    >
                      {s.status}
                    </span>
                  ) : (
                    <span style={{ color: COLORS.teal, whiteSpace: "nowrap" }}>
                      {s.status}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* 交付物 */}
            <div style={rowStyle(frame, 140)}>
              <span style={{ fontWeight: 500, color: "rgba(216,230,243,0.96)" }}>
                设计报告已生成
              </span>
            </div>
            <div
              style={{
                ...rowStyle(frame, 152),
                fontSize: 24,
                display: "flex",
                gap: 22,
                alignItems: "baseline",
              }}
            >
              <span style={{ color: "#38BDF8" }}>design_report.md</span>
              <span style={{ color: "rgba(148,163,184,0.5)" }}>·</span>
              <span style={{ color: "#C084FC" }}>curves.png</span>
              <span style={{ color: "rgba(148,163,184,0.5)" }}>·</span>
              <span style={{ color: "#FBBF24" }}>ga.dxf</span>
            </div>

            {/* 收尾提示符 */}
            {frame >= 168 && (
              <div>
                <span style={{ color: COLORS.teal }}>$ </span>
                <span
                  style={{
                    display: "inline-block",
                    width: 15,
                    height: 30,
                    translate: "0 5px",
                    background: COLORS.teal,
                    opacity: Math.floor(frame / 14) % 2 === 0 ? 0.85 : 0,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </AbsoluteFill>
      </SlowZoom>
    </AbsoluteFill>
  );
};
