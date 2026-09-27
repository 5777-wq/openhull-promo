// 字体加载 —— 全部经 @remotion/google-fonts 显式加载；loadFont 内部
// 对每个字体文件调用 delayRender，字体就绪前渲染不会开始。
// 中文大标题走 Noto Serif SC（700/900），西文与数字走 Source Serif 4，
// 正文走 Noto Sans SC，数据/终端走 JetBrains Mono。
import { loadFont as loadNotoSerifSC } from "@remotion/google-fonts/NotoSerifSC";
import { loadFont as loadSourceSerif4 } from "@remotion/google-fonts/SourceSerif4";
import { loadFont as loadNotoSansSC } from "@remotion/google-fonts/NotoSansSC";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";

const serifSC = loadNotoSerifSC("normal", {
  weights: ["700", "900"],
  ignoreTooManyRequestsWarning: true,
});

const sourceSerif = loadSourceSerif4("normal", {
  weights: ["600", "700"],
  subsets: ["latin"],
});

// 官网 slogan "Design the shell that carries it all." 用 Georgia 斜体气质 —— 补斜体字面
const sourceSerifItalic = loadSourceSerif4("italic", {
  weights: ["400", "600"],
  subsets: ["latin"],
});

const sansSC = loadNotoSansSC("normal", {
  weights: ["400", "500", "700"],
  ignoreTooManyRequestsWarning: true,
});

const mono = loadJetBrainsMono("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

// 西文/数字命中 Source Serif 4，中文回退 Noto Serif SC —— 气质对齐官网衬线标题
export const FONT_SERIF = `${sourceSerif.fontFamily}, ${serifSC.fontFamily}, Georgia, serif`;
// 斜体衬线（英文 slogan 专用）
export const FONT_SERIF_ITALIC = `${sourceSerifItalic.fontFamily}, ${sourceSerif.fontFamily}, Georgia, serif`;
export const FONT_SANS = `${sansSC.fontFamily}, sans-serif`;
// 终端里的中文（输出行）回退到 Noto Sans SC，保持同一套无衬线气质
export const FONT_MONO = `${mono.fontFamily}, ${sansSC.fontFamily}, monospace`;
