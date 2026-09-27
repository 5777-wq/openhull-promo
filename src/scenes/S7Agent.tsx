import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { DarkBackdrop } from "../components/DarkBackdrop";
import { SlowZoom } from "../components/SlowZoom";
import { enterStyle } from "../components/Enter";
import { COLORS } from "../theme";
import { FONT_MONO, FONT_SANS, FONT_SERIF } from "../fonts";

const EASE = Easing.bezier(0.22, 0.61, 0.36, 1);

const PROMPT =
  "「请安装并使用 OpenHull 技能，然后帮我设计一条 5 万吨散货船，服务航速 14.5 节，出设计报告和总布置简图。」";

const TYPE_START = 64;
const FRAMES_PER_CHAR = 1.4;

// 三步卡片：官网 FOR AI AGENTS 三张卡（逐字精简）
const STEPS = [
  {
    n: "①",
    title: "自动安装",
    desc: "读取技能文件后一条命令装好 CLI 并自检版本——锁定发布标签，可复现、可审计。",
  },
  {
    n: "②",
    title: "自己写任务书",
    desc: "技能内置最小任务书模板：载重吨、航速、吃水、方形系数四个字段，其余按内置方法补全。",
  },
  {
    n: "③",
    title: "出齐成果",
    desc: "中文设计报告、静水力曲线图、总布置简图与 DXF——全部可溯源，跳过项如实声明。",
  },
];

// 卡片间脉冲光束：流经即点亮下游卡片边框（全链路自动编排语义）
const Beam: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  return (
    <div
      style={{
        width: 54,
        position: "relative",
        alignSelf: "center",
        height: 2,
        background: "rgba(56,189,248,0.16)",
        opacity: frame >= delay ? 1 : 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -2,
          left: `${t * 100}%`,
          translate: "-50% 0",
          width: 26,
          height: 6,
          borderRadius: 3,
          background: "#38BDF8",
          boxShadow: "0 0 12px rgba(56,189,248,0.9)",
        }}
      />
    </div>
  );
};

export const S7Agent: React.FC = () => {
  const frame = useCurrentFrame();
  const typedChars = Math.min(
    Math.max(Math.floor((frame - TYPE_START) / FRAMES_PER_CHAR), 0),
    PROMPT.length,
  );
  const typing = typedChars > 0 && typedChars < PROMPT.length;
  const cursorOn = typing || Math.floor(frame / 14) % 2 === 0;

  return (
    <AbsoluteFill>
      <DarkBackdrop />

      <SlowZoom duration={240}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          padding: "0 150px",
        }}
      >
        {/* kicker + 标题 */}
        <div
          style={{
            ...enterStyle(frame, 6, 20),
            fontFamily: FONT_MONO,
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: "0.3em",
            color: COLORS.teal,
          }}
        >
          FOR AI AGENTS
        </div>
        <h2
          style={{
            ...enterStyle(frame, 18, 26),
            fontFamily: FONT_SERIF,
            fontWeight: 900,
            fontSize: 76,
            color: COLORS.white,
            margin: "18px 0 0",
            letterSpacing: "0.02em",
          }}
        >
          一句话，交给你的 <span style={{ color: "#7FC0F2" }}>AI 智能体</span>
        </h2>
        <div
          style={{
            ...enterStyle(frame, 34, 24),
            fontFamily: FONT_SANS,
            fontWeight: 400,
            fontSize: 27,
            color: "rgba(216,230,243,0.72)",
            marginTop: 18,
          }}
        >
          OpenHull 就是为智能体编排设计的 —— ZCode、Claude Code
          等任何支持技能的智能体都能跑完这条链
        </div>

        {/* 指令气泡（打字机） */}
        <div
          style={{
            ...enterStyle(frame, 50, 24),
            width: 1360,
            marginTop: 44,
            borderRadius: 16,
            background: "rgba(15,23,42,0.65)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 0 40px -10px rgba(99,102,241,0.35)",
            padding: "26px 36px",
          }}
        >
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 17,
              letterSpacing: "0.12em",
              color: "rgba(216,230,243,0.5)",
            }}
          >
            复制这句话，发给你的智能体
          </div>
          <div
            style={{
              fontFamily: FONT_SANS,
              fontWeight: 500,
              fontSize: 30,
              lineHeight: 1.6,
              color: COLORS.terminalText,
              marginTop: 12,
              minHeight: 96,
            }}
          >
            {PROMPT.slice(0, typedChars)}
            <span
              style={{
                display: "inline-block",
                width: 16,
                height: 32,
                translate: "0 5px",
                background: "linear-gradient(180deg,#38BDF8,#818CF8)",
                boxShadow: "0 0 10px rgba(56,189,248,0.7)",
                opacity: cursorOn ? 0.85 : 0,
              }}
            />
          </div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: 20,
              color: "#7FC0F2",
              opacity: interpolate(frame, [168, 192], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: EASE,
              }),
            }}
          >
            github.com/5777-wq/OpenHull/tree/main/skills/openhull
          </div>
        </div>

        {/* 三步卡片 + 动态脉冲流水线 */}
        <div style={{ display: "flex", alignItems: "stretch", marginTop: 40 }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s.title}>
              {i > 0 && <Beam delay={196 + (i - 1) * 14} />}
              <div
                style={{
                  ...enterStyle(frame, 160 + i * 14, 24),
                  width: 420,
                  borderRadius: 16,
                  background: "rgba(15,23,42,0.65)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: `1px solid ${(() => {
                    if (i === 0) return "rgba(255,255,255,0.08)";
                    const t = interpolate(
                      frame,
                      [182 + (i - 1) * 14, 196 + (i - 1) * 14],
                      [0, 1],
                      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE },
                    );
                    const ch = (a: number, b: number) => Math.round(a + (b - a) * t);
                    return `rgba(${ch(255, 56)},${ch(255, 189)},${ch(255, 248)},${(0.08 + 0.47 * t).toFixed(3)})`;
                  })()}`,
                  boxShadow:
                    i > 0
                      ? `0 0 24px -6px rgba(56,189,248,${interpolate(
                          frame,
                          [182 + (i - 1) * 14, 196 + (i - 1) * 14],
                          [0, 0.35],
                          { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE },
                        )})`
                      : "none",
                  padding: "24px 28px",
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_SANS,
                    fontWeight: 700,
                    fontSize: 27,
                    color: COLORS.white,
                  }}
                >
                  <span style={{ color: "#7FC0F2", marginRight: 10 }}>{s.n}</span>
                  {s.title}
                </div>
                <div
                  style={{
                    fontFamily: FONT_SANS,
                    fontWeight: 400,
                    fontSize: 20,
                    lineHeight: 1.55,
                    color: "rgba(216,230,243,0.68)",
                    marginTop: 10,
                  }}
                >
                  {s.desc}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </AbsoluteFill>
      </SlowZoom>

      {/* 底部落款 */}
      <div
        style={{
          ...enterStyle(frame, 200, 22),
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 58,
          textAlign: "center",
          fontFamily: FONT_SANS,
          fontSize: 24,
          letterSpacing: "0.1em",
          color: "rgba(216,230,243,0.55)",
        }}
      >
        由 AI 智能体编排，为船舶工程师服务
      </div>
    </AbsoluteFill>
  );
};
