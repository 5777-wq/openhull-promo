import type { CSSProperties } from "react";

// 设计令牌 —— 与官网 openhull-site 同源（色彩值来自任务书，不得新增颜色）
export const COLORS = {
  brandBlue: "#1A6FB5",
  teal: "#0F9D8A",
  gold: "#C9A227",
  ink: "#1C2733",
  inkSoft: "#5B6B7B",
  lightBg: "#F7F9FB",
  cardBg: "#FFFFFF",
  cardBorder: "#E1E9F1",
  terminalBg: "#0F1C2B",
  terminalText: "#D8E6F3",
  white: "#FFFFFF",
} as const;

// 深色场景统一底：深空石墨黑至午夜深蓝径向渐变（发布会级基准）
export const DARK_GRADIENT =
  "radial-gradient(circle at 50% 40%, #0c1626 0%, #060a12 100%)";

// 玻璃拟态卡片（替代一切白色实体卡）
export const GLASS: CSSProperties = {
  background: "rgba(15, 23, 42, 0.65)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.6)",
};

// 深色页文字基准
export const INK_DARK = "#F1F5F9";
export const INK_SOFT_DARK = "#94A3B8";
export const CYAN = "#38BDF8";

// 渐变文字（仅用于全片最关键的一两个词）
export const GRADIENT_TEXT = "linear-gradient(92deg, #7FC0F2, #4FD0BD)";

// 浅色卡片阴影（官网同款）
// 浅色页极淡纵向渐变（替代死板纯色，增加进深）
export const LIGHT_BG_GRADIENT =
  "linear-gradient(180deg, #FAFBFC 0%, #F4F6F9 100%)";

export const CARD_SHADOW =
  "0 4px 14px rgba(14,34,56,.08), 0 12px 32px rgba(14,34,56,.09)";

// 深色场景光晕与网格
export const GLOW_BLUE = "rgba(26,111,181,0.42)";
export const GLOW_TEAL = "rgba(15,157,138,0.16)";
export const GRID_LINE = "rgba(56,189,248,0.04)";
export const GRID_SIZE = 32;

// 渐变文字通用样式（配合 background-clip: text）
export const gradientTextStyle: CSSProperties = {
  backgroundImage: GRADIENT_TEXT,
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
};
