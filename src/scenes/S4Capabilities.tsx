import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CYAN, GLASS, INK_DARK, INK_SOFT_DARK } from "../theme";
import { HATCHES_D, HOUSE_D, HULL_D, SHIP_VIEWBOX } from "../components/ship";
import { FONT_MONO, FONT_SANS } from "../fonts";
import { DarkBackdrop } from "../components/DarkBackdrop";
import { SlowZoom } from "../components/SlowZoom";

// 官网 CAPABILITIES 卡片的九张高亮（官网现有十张：干舷校核并入了
// 稳性/交付物叙事，影片按节奏保留九张，无数量文案上屏）
const CARDS: { tag: string; title: string; desc: string }[] = [
  {
    tag: "DIMENSIONS",
    title: "主尺度与重量",
    desc: "载重量比法估算、诺曼系数迭代的重量浮力平衡，输出主尺度方案与载重量比。",
  },
  {
    tag: "HULL FORM",
    title: "参数化船型",
    desc: "数字化 Series 60 母型 + Lackenby 变换，交付真实型值表与分层 DXF 型线图。",
  },
  {
    tag: "HYDROSTATICS",
    title: "静水力",
    desc: "静水力表、邦戎曲线，自动绘制静水力曲线图（12 项要素）。",
  },
  {
    tag: "STABILITY",
    title: "稳性校核",
    desc: "大倾角 GZ 曲线 + IMO 2008 IS Code 2.2 六项衡准 + 恶劣风浪衡准 2.3，逐条判定。",
  },
  {
    tag: "PERFORMANCE",
    title: "阻力与推进",
    desc: "艾亚阻力估算、Holtrop 推进因子、瓦根宁根 B 系列螺旋桨设计与空泡校核。",
  },
  {
    tag: "OPTIMIZE",
    title: "方案空间扫描",
    desc: "L/B × B/T × Cb 网格逐点过全链：可行方案集、逐级拒绝记录、帕累托前沿。",
  },
  {
    tag: "SEAKEEPING",
    title: "耐波性两级",
    desc: "白名单公式计算固有周期与谐摇判定；可选 capytaine 扩展输出零航速 RAO 曲线。",
  },
  {
    tag: "SPEED LOSS",
    title: "失速估算",
    desc: "Kwon 方法：按蒲福风级、浪向与装载状态估算波浪中航速损失与实际航速。",
  },
  {
    tag: "DELIVERABLES",
    title: "图纸与报告",
    desc: "静水力曲线图、总布置简图（图 + 分层 DXF）、中文 Markdown 设计报告，一条命令出齐。",
  },
];

export const S4Capabilities: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 扫描光：第 60-150 帧自艏向艉滑过一束竖向光斑
  const scanX = interpolate(frame, [60, 150], [-12, 108], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <DarkBackdrop />
      <SlowZoom duration={195}>
        <AbsoluteFill>
          {/* 底层船体轮廓：青色辉光线稿 */}
          <svg
            viewBox={SHIP_VIEWBOX}
            style={{
              position: "absolute",
              right: -160,
              bottom: -70,
              width: 1450,
              opacity: 0.9,
              filter: "drop-shadow(0 0 14px rgba(56,189,248,0.18))",
            }}
          >
            <g fill="none" stroke="rgba(56,189,248,0.16)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <path d={HULL_D} />
              <path d={HOUSE_D} />
              {HATCHES_D.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
          </svg>

          {/* 扫描光斑 */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${scanX}%`,
              width: 150,
              translate: "-50% 0",
              background:
                "linear-gradient(90deg, transparent, rgba(56,189,248,0.06), transparent)",
            }}
          />

          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 524px)",
                gridAutoRows: "248px",
                gap: 28,
              }}
            >
              {CARDS.map((card, i) => {
                // 3D 错峰弹入：index*2 帧延迟；Telegram customSpring 底座
                // mass5/stiffness900/damping100（约 3% 过冲，CAAnimationUtils.swift:85-88）
                const p = spring({
                  frame: frame - (10 + i * 2),
                  fps,
                  config: { damping: 100, stiffness: 900, mass: 5 },
                  durationInFrames: 30,
                });
                const ty = interpolate(p, [0, 1], [30, 0]);
                const rx = interpolate(p, [0, 1], [8, 0]);
                return (
                  <div
                    key={card.tag}
                    style={{
                      position: "relative",
                      opacity: p,
                      transform: `perspective(800px) translateY(${ty}px) rotateX(${rx}deg)`,
                      ...GLASS,
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
                  >
                    {/* 左侧青色能量条 */}
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        background: CYAN,
                        boxShadow: "0 0 10px rgba(56,189,248,0.7)",
                      }}
                    />
                    <div
                      style={{
                        padding: "28px 32px",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 17,
                          fontWeight: 700,
                          letterSpacing: "0.15em",
                          color: CYAN,
                        }}
                      >
                        {card.tag}
                      </span>
                      <span
                        style={{
                          marginTop: 14,
                          fontFamily: FONT_SANS,
                          fontWeight: 700,
                          fontSize: 31,
                          color: INK_DARK,
                        }}
                      >
                        {card.title}
                      </span>
                      <span
                        style={{
                          marginTop: "auto",
                          fontFamily: FONT_SANS,
                          fontWeight: 400,
                          fontSize: 21,
                          lineHeight: 1.55,
                          color: INK_SOFT_DARK,
                        }}
                      >
                        {card.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      </SlowZoom>
    </AbsoluteFill>
  );
};
