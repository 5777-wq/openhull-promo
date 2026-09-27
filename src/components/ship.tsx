import React from "react";
import { evolvePath } from "@remotion/paths";

// 散货船侧影（手绘线稿，viewBox 0 0 1200 300，船艏朝右）
export const SHIP_VIEWBOX = "0 0 1200 300";

// 船体主轮廓（闭合：艏柱上端→船底→艉→甲板线；起笔在船艏，描线时先见船艏轮廓）。
// 散货船特征：近垂直微前倾船艏、方艉、平直甲板线。
export const HULL_D = [
  "M 1042 85",
  "C 1049 86, 1053 90, 1054 96",
  "C 1056 122, 1052 152, 1042 170",
  "C 1030 192, 1010 202, 986 204",
  "L 276 203",
  "C 254 199, 243 186, 241 166",
  "C 238 140, 240 112, 246 100",
  "L 260 93",
  "C 480 92, 890 88, 1042 85",
  "Z",
].join(" ");

// 艉楼甲板室 + 驾驶室窗带 + 烟囱
export const HOUSE_D = "M 292 89 L 292 44 L 402 44 L 402 87";
export const BRIDGE_WINDOW_D = "M 306 58 L 388 58";
export const FUNNEL_D = "M 318 44 L 312 18 L 352 18 L 348 44";

// 三组货舱舱口盖
export const HATCHES_D = [
  "M 470 86 L 470 66 L 600 66 L 600 85",
  "M 630 85 L 630 65 L 760 65 L 760 84",
  "M 790 84 L 790 64 L 920 64 L 920 82",
];

// 艏部桅杆与横桁
export const MAST_D = "M 986 82 L 986 46";
export const YARD_D = "M 972 56 L 1000 56";

// 水面涟漪（两条，一深一浅；上条贴近船底龙骨）
export const WAVES_D =
  "M 130 222 Q 180 214 230 222 T 330 222 T 430 222 T 530 222 T 630 222 T 730 222 T 830 222 T 930 222 T 1030 222";
export const WAVES_2_D = "M 300 242 Q 350 235 400 242 T 500 242 T 600 242 T 700 242 T 800 242";

// 沿路径逐帧描线（evolvePath：进度 → dasharray/dashoffset）
export const DrawnPath: React.FC<{
  d: string;
  progress: number;
  stroke: string;
  strokeWidth?: number;
  opacity?: number;
}> = ({ d, progress, stroke, strokeWidth = 3.5, opacity = 1 }) => {
  const p = Math.min(Math.max(progress, 0), 1);
  const evolved = evolvePath(p, d);
  return (
    <path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={evolved.strokeDasharray}
      strokeDashoffset={evolved.strokeDashoffset}
      opacity={opacity}
    />
  );
};

