// 时间常量 —— 30 fps，总长 58.5 s（1755 帧），九个分镜依次相接
// （节奏压缩版：九卡 7.5s、章程 8s，静态留白全部收紧）
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const SCENES = [
  { id: "S1Opening", duration: 150 },
  { id: "S2Pain", duration: 150 },
  { id: "S3Terminal", duration: 195 },
  { id: "S4Capabilities", duration: 195 },
  { id: "S5Discipline", duration: 240 },
  { id: "S6Validation", duration: 210 },
  { id: "S7Agent", duration: 240 },
  { id: "S8Contribute", duration: 210 },
  { id: "S9Outro", duration: 165 },
] as const;

// 150+150+195+195+240+210+240+210+165 = 1755
export const TOTAL_FRAMES = 1755;

// 分镜间交叉溶解 14 帧；被转场交叠的时长补回前 8 个分镜，
// 使每个分镜内容的全局起点与总长（59.5 s，音乐网格）完全不变。
export const TRANSITION = 14;
export const TIMELINE_DURATIONS = [
  SCENES[0].duration + TRANSITION,
  SCENES[1].duration + TRANSITION,
  SCENES[2].duration + TRANSITION,
  SCENES[3].duration + TRANSITION,
  SCENES[4].duration + TRANSITION,
  SCENES[5].duration + TRANSITION,
  SCENES[6].duration + TRANSITION,
  SCENES[7].duration + TRANSITION,
  SCENES[8].duration,
] as const;
// 164+164+209+209+254+224+254+224+165 - 8×14 = 1755

// 统一入场：淡入 + 上移 24px + 缩放 0.98→1，20–30 帧
export const ENTER = {
  duration: 24,
  rise: 24,
} as const;
