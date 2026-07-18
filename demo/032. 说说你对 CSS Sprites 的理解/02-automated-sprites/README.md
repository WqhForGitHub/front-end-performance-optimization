# 02 · 自动化雪碧图生成 & 现代方案对比

> 演示自动化雪碧图工具链、四种图标方案横向对比、请求减少交互模拟，以及 HTTP/2 时代的现代替代方案。

## 运行方式

直接用浏览器打开 `index.html` 即可，无需任何依赖：

```bash
start index.html        # Windows
open index.html         # macOS
xdg-open index.html     # Linux
```

## 演示内容

| 章节          | 内容                                                                                 |
| ------------- | ------------------------------------------------------------------------------------ |
| 1. 自动化工具 | webpack-spritesmith / sprity / postcss-sprites / Glue / svg-sprite-loader 等工具卡片 |
| 2. 构建配置   | webpack-spritesmith 完整配置 + 自动生成的 SCSS + Vite svg-icons 现代配置             |
| 3. 方案对比表 | CSS Sprites vs Icon Fonts vs SVG vs Base64 的 10 维度横向对比                        |
| 4. 性能可视化 | 请求数与传输体积的柱状图对比（滚动进入视口时动画填充）                               |
| 5. 请求模拟   | 拖动滑块改变图标数量，切换"传统多图/CSS Sprites"模式，实时查看请求时间线             |
| 6. 现代替代   | SVG `<symbol>` + `<use>` / Icon Font / CSS 渐变背景 三种方案的实战演示               |
| 7. 决策流程   | 5 步问答式决策树，帮助选型                                                           |

## 交互特性

- **柱状图动画**：使用 IntersectionObserver 在图表进入视口时触发宽度填充动画。
- **请求时间线模拟**：根据图标数量与模式动态生成请求条，可视化 HTTP/1.1 串行 vs 雪碧图单次请求的差异。
- **SVG 颜色切换**：点击 SVG 图标可循环切换颜色，演示 SVG 方案的"CSS 改色"优势。
- **导航高亮**：滚动时自动高亮当前章节。

## 关于"图片"的说明

由于本演示不能携带真实图片文件，所有"图标"均通过以下方式模拟：

1. **CSS Sprites 迷你演示**：用 `linear-gradient` 模拟雪碧图单元
2. **SVG 演示**：直接内联 SVG `<symbol>` 定义（这是真实可用的方案）
3. **Icon Font 演示**：用 Unicode 字符 + monospace 字体模拟图标字体
4. **Base64 演示**：用渐变模拟内联图片

这些模拟仅用于视觉演示，实际方案的请求机制、体积、可访问性等属性在对比表中如实呈现。

## 自动化工具一览

| 工具                       | 生态         | 状态       | 说明                 |
| -------------------------- | ------------ | ---------- | -------------------- |
| webpack-spritesmith        | Webpack      | 维护缓慢   | 经典 PNG 雪碧图插件  |
| postcss-sprites            | PostCSS      | 低频维护   | 扫描 CSS 自动替换    |
| sprity                     | Gulp/Grunt   | 已停止维护 | Node 通用工具        |
| Glue                       | CLI (Python) | 已停止维护 | 命令行工具           |
| @vitejs/plugin-spritesmith | Vite         | 社区维护   | Vite 适配版          |
| **svg-sprite-loader**      | Webpack      | **推荐**   | SVG sprite 现代方案  |
| **vite-plugin-svg-icons**  | Vite         | **推荐**   | Vite SVG sprite 首选 |

## 四种方案对比速查

| 方案           | 请求数 | 矢量   | 改色   | 多色   | Retina   | 可访问性 | HTTP/2 收益 | 维护   |
| -------------- | ------ | ------ | ------ | ------ | -------- | -------- | ----------- | ------ |
| CSS Sprites    | 1      | 否     | 否     | 是     | 需@2x    | 中       | 降低        | 高     |
| Icon Fonts     | 1      | 是     | 单色   | 否     | 天然     | 差       | 不变        | 中     |
| **SVG symbol** | 1(可0) | **是** | **是** | **是** | **天然** | **好**   | **不变**    | **低** |
| Base64         | 0      | 否     | 否     | 是     | 需@2x    | 中       | 不变        | 低     |

## 决策建议（一句话）

- **新项目**：用 SVG `<symbol>` + `<use>`（配合 `vite-plugin-svg-icons` 或 `svg-sprite-loader`）
- **老项目**：保留 CSS Sprites（用 `webpack-spritesmith` 自动化），逐步迁移 SVG
- **单色图标库**：Icon Font（如 Font Awesome）
- **极小图（< 4KB）**：Base64 内联
- **HTTP/2 环境**：减少请求已非首要目标，优先考虑可维护性与可访问性

## 文件清单

| 文件         | 说明                                                   |
| ------------ | ------------------------------------------------------ |
| `index.html` | 页面结构，含 SVG symbol 定义、对比表、性能图、交互控件 |
| `styles.css` | 全部样式，含柱状图、时间线、现代方案卡片样式           |
| `script.js`  | 柱状图动画、请求模拟交互、导航高亮、SVG 颜色切换       |
| `README.md`  | 本文件                                                 |

## 关键收获

1. **手工拼图不可持续**：生产环境必须用工具自动生成雪碧图与 CSS。
2. **HTTP/2 削弱雪碧图优势**：多路复用让"减少请求"收益下降，可维护性更重要。
3. **SVG sprite 是现代首选**：矢量、可改色、多色、可访问、低维护，全面优于雪碧图。
4. **Base64 不是万能**：体积膨胀 33%，无法独立缓存，仅适合极小图。
5. **选型看场景**：没有银弹，根据多色需求、数量、项目阶段综合决策。
