import React from "react";
import { useCurrentFrame } from "remotion";
import { evolvePath } from "@remotion/paths";

// 官网 openhull-site hero emblem 的复刻（轴对称"船壳浮于波上"标志）：
// 同心涟漪 + 双慢转虚线环 + 渐变填充标志 + 双波纹线。动画参数取自官网 CSS：
// 环 46s/70s 反向慢转，涟漪 4.5s 扩散（延迟 0/1.5/3s），波纹 ±9px/9s 漂移。
export const MARK_VIEWBOX = "0 0 240 240";

// 标志（24 单位空间，site 原 path，左右轴对称）
export const MARK_HULL_D = "M3 14l9-11 9 11h-6v-2h-6v2H3z";
export const MARK_WAVES_D =
  "M2 17c2.5 0 2.5 1.6 5 1.6S9.5 17 12 17s2.5 1.6 5 1.6S19.5 17 22 17v3c-2.5 0-2.5 1.6-5 1.6S14.5 20 12 20s-2.5 1.6-5 1.6S4.5 20 2 20v-3z";

export const MARK_WAVE_LINE_1 =
  "M34 196c10-7 20-7 30 0s20 7 30 0 20-7 30 0 20 7 30 0 20-7 30 0 20 7 26 4";
export const MARK_WAVE_LINE_2 =
  "M42 208c10-6 18-6 28 0s18 6 28 0 18-6 28 0 18 6 28 0 18-6 26-3";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);

// 涟漪：4.5s 周期（135 帧），scale .82→1.28，透明度 .45→0（70% 处到 0，起始 8% 内淡入避免突现）
const Ripple: React.FC<{ delay: number; frame: number }> = ({ delay, frame }) => {
  const P = 135;
  const t = (((frame - delay) % P) + P) % P / P;
  if (frame - delay < 0) return null;
  const sc = 0.82 + 0.46 * easeOut(t);
  const fadeIn = Math.min(t / 0.08, 1);
  const op = t < 0.7 ? 0.45 * fadeIn * (1 - t / 0.7) : 0;
  return (
    <circle
      cx={120}
      cy={120}
      r={86}
      fill="none"
      stroke="#4fa3dd"
      strokeWidth={1.4}
      opacity={op}
      transform={`translate(120 120) scale(${sc}) translate(-120 -120)`}
    />
  );
};

// 慢转虚线环（官网 46s / 70s 反向）
const Ring: React.FC<{ r: number; dash: string; opacity: number; deg: number }> = ({
  r,
  dash,
  opacity,
  deg,
}) => (
  <circle
    cx={120}
    cy={120}
    r={r}
    fill="none"
    stroke="#7fb2dd"
    strokeWidth={1}
    strokeDasharray={dash}
    opacity={opacity}
    transform={`rotate(${deg} 120 120)`}
  />
);

// 波纹线（±9px / 9s，第二条相位差半周期）
const WaveLine: React.FC<{ d: string; frame: number; phase: number; opacity: number }> = ({
  d,
  frame,
  phase,
  opacity,
}) => (
  <path
    d={d}
    fill="none"
    stroke="#4fa3dd"
    strokeWidth={1.6}
    opacity={opacity}
    transform={`translate(${5 * Math.sin((2 * Math.PI * frame) / 405 + phase)} 0)`}
  />
);

// 完整徽标（S8 收尾用）：填充 + 描边 + 涟漪 + 双环 + 波纹
export const EmblemFull: React.FC<{ size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        width: size,
        height: size,
        translate: `0 ${3 * Math.sin((2 * Math.PI * frame) / 300)}px`,
      }}
    >
      <svg width={size} height={size} viewBox={MARK_VIEWBOX}>
        <defs>
          <linearGradient id="markGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6db6ec" />
            <stop offset="1" stopColor="#1a6fb5" />
          </linearGradient>
        </defs>
        <Ripple delay={0} frame={frame} />
        <Ripple delay={45} frame={frame} />
        <Ripple delay={90} frame={frame} />
        <Ring r={102} dash="3 7" opacity={0.28} deg={(frame / 30 / 46) * 360} />
        <Ring r={114} dash="2 9" opacity={0.2} deg={-(frame / 30 / 70) * 360} />
        <WaveLine d={MARK_WAVE_LINE_1} frame={frame} phase={0} opacity={0.5} />
        <WaveLine d={MARK_WAVE_LINE_2} frame={frame} phase={Math.PI} opacity={0.3} />
        <g transform="translate(48 40) scale(6)">
          <path d={MARK_HULL_D} fill="url(#markGrad)" />
          <path d={MARK_WAVES_D} fill="url(#markGrad)" />
          <path
            d={MARK_HULL_D}
            fill="none"
            stroke="#8fd0ef"
            strokeWidth={0.55}
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
};

// 描线版徽标（S1 开场用）：船壳 → 波浪 → 渐变填充，涟漪与双环在描线完成后淡入。
// 描线进度由调用方传入（各段窗口在场景内编排）。
export const EmblemDrawn: React.FC<{
  size: number;
  hull: number;
  waves: number;
  fill: number;
  aura: number;
  absolute?: boolean;
}> = ({ size, hull, waves, fill, aura }) => {
  const frame = useCurrentFrame();
  const hullEvolved = evolvePath(clamp01(hull), MARK_HULL_D);
  const wavesEvolved = evolvePath(clamp01(waves), MARK_WAVES_D);
  return (
    <div
      style={{
        width: size,
        height: size,
        translate: `0 ${3 * Math.sin((2 * Math.PI * frame) / 300)}px`,
      }}
    >
      <svg width={size} height={size} viewBox={MARK_VIEWBOX}>
        <defs>
          <linearGradient id="markGradDraw" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6db6ec" />
            <stop offset="1" stopColor="#1a6fb5" />
          </linearGradient>
        </defs>
        {aura > 0 && frame >= 50 && (
          <>
            <Ripple delay={0} frame={frame - 50} />
            <Ripple delay={45} frame={frame - 50} />
            <Ripple delay={90} frame={frame - 50} />
          </>
        )}
        {aura > 0 && (
          <>
            <Ring r={102} dash="3 7" opacity={0.28 * aura} deg={(frame / 30 / 46) * 360} />
            <Ring r={114} dash="2 9" opacity={0.2 * aura} deg={-(frame / 30 / 70) * 360} />
          </>
        )}
        {aura > 0 && (
          <>
            <WaveLine d={MARK_WAVE_LINE_1} frame={frame} phase={0} opacity={0.5 * aura} />
            <WaveLine d={MARK_WAVE_LINE_2} frame={frame} phase={Math.PI} opacity={0.3 * aura} />
          </>
        )}
        <g transform="translate(48 40) scale(6)">
          <path d={MARK_HULL_D} fill="url(#markGradDraw)" opacity={fill} />
          <path d={MARK_WAVES_D} fill="url(#markGradDraw)" opacity={fill} />
          <path
            d={MARK_HULL_D}
            fill="none"
            stroke="#8fd0ef"
            strokeWidth={0.55}
            strokeLinejoin="round"
            strokeDasharray={hullEvolved.strokeDasharray}
            strokeDashoffset={hullEvolved.strokeDashoffset}
          />
          <path
            d={MARK_WAVES_D}
            fill="none"
            stroke="#8fd0ef"
            strokeWidth={0.55}
            strokeLinejoin="round"
            strokeDasharray={wavesEvolved.strokeDasharray}
            strokeDashoffset={wavesEvolved.strokeDashoffset}
          />
        </g>
      </svg>
    </div>
  );
};
