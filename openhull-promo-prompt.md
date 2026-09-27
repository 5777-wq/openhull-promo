# 任务：用 Remotion 制作 OpenHull 开源项目宣传片（高端科技风，与官网同一设计语言）

## 环境（已就绪，不要重装）

- 工作目录：`D:\remotion动画开源框架`，Remotion 4.0.529 blank 模板 + React 19 + TailwindCSS v4 已安装可编译。
- 官方 Agent Skills 已装在 `.agents/skills/`（remotion-best-practices、remotion-markup、remotion-render 等 12 个）。
- Chrome Headless Shell 已下载，可直接渲染。
- 动手前先读 `.agents/skills/remotion-best-practices/SKILL.md`（路由），再按它指引读 `remotion-markup`、`remotion-create`、`remotion-render`。

## 产品事实（文案只能用这些，禁止编造数字与功能）

OpenHull 是开源的**参数化船舶初步设计 CLI**（Python，一条命令安装，当前 v1.3.1）。从一份 YAML 任务书（仅 4 个必需字段）出发，自动完成完整设计链：

主尺度与重量平衡 → 参数化船型（Series 60 母型 + Lackenby 变换）→ 静水力 → 大倾角稳性与 IMO IS Code 2.2/2.3 衡准 → 艾亚阻力 + Holtrop 推进因子 → B 系列螺旋桨设计 → 耐波性（可选 capytaine RAO）→ Kwon 波浪失速 → 总布置简图（DXF）→ 中文设计报告。

核心卖点（可信工程纪律）：
- **公式白名单**：每个数字都溯源到白名单内的公式；
- **拒绝式守卫**：不适用域声明式跳过/拒绝，绝不外推、绝不编数（"宁可拒绝，也不给不可信的数"）；
- **工程师拍板**：工具只报告，衡准否决权留给船舶工程师；
- **可验证**：公开基准船 JBC / DTMB 1712 / NMRI MP687 + 书内算例 + 自动化测试（官网自述 "v1.3.1，423 项测试全绿"；渲染前以仓库 VALIDATION.md 核对）。

关键命令：`openhull check`（秒级预检守卫带）、`openhull run`（一条命令出齐报告/曲线图/总布置 DXF）、`openhull optimize`（方案空间扫描 + 帕累托前沿）。

链接：仓库 `https://github.com/5777-wq/OpenHull` · 主页 `https://5777-wq.github.io/openhull-site/` · 文档 `https://5777-wq.github.io/OpenHull/`

## 视频规格

- 16:9，1920×1080，30 fps，总长约 45 s（约 1350 帧）
- Composition id：`OpenHullPromo`，注册在 `src/Root.tsx`
- 输出：`out/openhull-promo.mp4`

## 视觉风格（与官网 openhull-site 同源的设计令牌，苹果式高端感）

### 色彩令牌（直接用这些值，不要发明新颜色）

- 深色场景（开场/终端/收尾）：海军蓝渐变 `linear-gradient(165deg, #0B1C2E 0%, #0E2238 30%, #16324F 68%, #1F4E79 100%)`，叠加官网同款细网格（56px 间距，`rgba(120,170,220,0.07)` 线宽 1px，用径向 mask 让边缘淡出），再加两团极柔和的径向光晕：蓝 `rgba(26,111,181,0.42)` 与青绿 `rgba(15,157,138,0.16)`。
- 浅色场景（内容中段）：底色 `#F7F9FB`，白卡片 `#FFFFFF`，描边 `#E1E9F1`，圆角 16px，阴影 `0 4px 14px rgba(14,34,56,.08), 0 12px 32px rgba(14,34,56,.09)`。
- 强调色：品牌蓝 `#1A6FB5`（主）、青绿 `#0F9D8A`（成功/辅助），金色 `#C9A227` 仅允许极少量点缀；正文墨色 `#1C2733`，次要 `#5B6B7B`。
- 渐变文字（用在最关键的一两个词上）：`linear-gradient(92deg, #7FC0F2, #4FD0BD)`，background-clip: text。
- 终端窗口：底 `#0F1C2B`，字 `#D8E6F3`，成功行用 `#0F9D8A`。

### 字体（Claude 式衬线标题 + 无衬线正文）

- **大标题/slogan 用衬线**：中文 `Noto Serif SC`（700/900），西文与数字 `Source Serif 4`——气质对齐官网 slogan 的 Georgia 衬线与 Claude 的衬线标题。标题字号要大（场景主标题 ≥ 110px），这是"高级感"的核心。
- 正文/UI：`Noto Sans SC`（400/500/700）。
- 数据/终端：`JetBrains Mono`（400/700）。
- 全部用 `@remotion/google-fonts` 显式加载，`loadFont` 完成前 `delayRender`/`continueRender`，禁止依赖系统字体回退。

### 高端感动效纪律（苹果式：克制、慢、稳）

- 统一缓动 `Easing.bezier(0.22, 0.61, 0.36, 1)`（官网同款），禁用 linear 和生硬弹跳；spring 只用大阻尼（damping ≥ 200 的柔入）。
- 入场统一"淡入 + 上移 24px + 轻微缩放 0.98→1"，时长 20–30 帧，同屏多元素错峰 3–5 帧。
- 每屏只讲一件事：字少、留白多、重心居中或左对齐大字。宁可删文案，不许堆满画面。
- 背景允许极缓慢的环境动画（官网同款）：logo 外环 46–70s/圈慢转、水面涟漪扩散、光晕呼吸——幅度必须小到"几乎察觉不到"。
- 数字用衬线或 mono 大号呈现（官网 stat 卡风格：玻璃拟态白 7% 底 + 14% 描边）。
- 禁止：花哨渐变横幅、卡通图标乱飞、 emoji、荧光色、密集堆叠卡片。

## 分镜脚本（按此实现；明暗节奏 = 官网 hero 深 → 内容浅 → 收尾深）

1. **开场·深（0–5 s）**：海军蓝渐变 + 网格 + 光晕。白色线条沿路径"画出"散货船侧影（`@remotion/paths` 的 `evolvePath` 描线，呼应官网 logo 的 stroke-dashoffset 画法），画完瞬间标题浮现：衬线大字 `OpenHull`（可对一两个字母用渐变文字），副标题 `开源船舶初步设计框架`，下方 `v1.3.1` 版本胶囊（青绿圆点呼吸）。
2. **痛点·浅（5–10 s）**：切 `#F7F9FB` 浅底。衬线大字两行：`十几张表格，数周试算。` / 下一行放大强调（渐变文字）：`改一个数，全部重算？`，背景漂浮极淡的表格线与数字碎片（透明度 ≤ 0.06）。
3. **一条命令·深（10–17 s）**：深色底居中一块官网同款代码窗（`#0F1C2B` 圆角 16 阴影），打字机敲入 `$ openhull run taskbook.yaml`，输出行逐条柔和滚入：`主尺度与重量平衡 ✓` `静水力 ✓` `稳性 IS Code · PASS`（PASS 用青绿）`螺旋桨 ✓` `设计报告已生成`。
4. **能力全景·浅（17–27 s）**：浅底白卡 4×2 网格（官网卡片：白底、`#E1E9F1` 描边、16px 圆角、md 阴影、左侧 4px 品牌蓝色条），8 张卡 spring 错峰浮入：`主尺度与重量平衡` `参数化船型 Series 60 + Lackenby` `静水力` `稳性 · IMO IS Code` `阻力与推进 · 艾亚 + Holtrop` `B 系列螺旋桨` `耐波性与波浪失速` `总布置 DXF · 中文报告`。卡片图标用单色线性 SVG。
5. **可信纪律·浅（27–34 s）**：左侧白卡内 GZ 稳性曲线逐点绘出（品牌蓝线 + 安全域青绿淡填充），右侧衬线三行递进：`公式白名单 · 拒绝式守卫 · 零外推` / `域外直接拒绝，绝不编数` / `工程师拍板，工具只报告`。
6. **验证背书·浅（34–40 s）**：三块玻璃名牌依次亮起：`JBC` `DTMB 1712` `NMRI MP687`（mono 字体），下方一行大字：`公开基准船 · 423 项测试全绿`，角标小字 `VALIDATION.md 可复查`。
7. **收尾·深（40–45 s）**：回到海军蓝渐变，网格淡入，船徽 + 衬线 slogan 居中：`让每艘船，从可靠的计算开始`，下方两枚官网同款按钮：白底主按钮 `GitHub · OpenHull`、幽灵描边按钮 `文档与主页`，落版小字 `github.com/5777-wq/OpenHull`。

## 技术纪律（Remotion 官方 best-practices）

- 动画全部基于 `useCurrentFrame()` + `interpolate()`/`spring()`；`interpolate` 输入范围不得出现 NaN，随机一律带种子 `random(\`scene3-${i}\`)`。
- 每个分镜一个独立组件，主 Composition 用 `<Sequence from={...}>` 编排；时间常量与色彩令牌集中到 `src/timings.ts` 与 `src/theme.ts`（theme.ts 按"色彩令牌"一节定义常量）。
- 只允许追加 `@remotion/*` 官方包（`@remotion/google-fonts`、`@remotion/paths`、`@remotion/shapes`），不改已有依赖与 scripts。
- 图形一律 SVG/代码绘制，不引入外部图片；中文字幕防溢出：容器留边 ≥ 96px，`npm run lint` 必须通过。

## 工作流与验收（必须按顺序）

1. 读 skills → 建 `theme.ts`/`timings.ts` 与字体加载模块 → 逐景实现。
2. 中途用 `npx remotion still OpenHullPromo out/preview/s{n}.png --frame=<关键帧>` 输出每个分镜首/中/尾帧自查：标题字号是否够大、留白是否足够、文字不溢出、明暗场景过渡干净。
3. 全部通过后渲染成片：`npx remotion render OpenHullPromo out/openhull-promo.mp4`。
4. 汇报：成片路径 + 每个分镜对应的组件文件 + 渲染耗时。

## 可调参数（如我另行说明，按说明覆盖）

- 时长/比例（默认 45 s 16:9；可加 9:16 竖版 composition）
- 文案语言（默认中文，可改双语字幕条）
- slogan 与结尾 CTA 文案
- 若我把 `logo.svg`（官网 favicon 里那枚船形标可导出）放进 `public/`，开场与收尾用真 logo 替换手绘船体
