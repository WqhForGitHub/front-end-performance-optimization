# 说说你对 CSS Sprites 的理解

本目录演示前端性能优化中经典的 **CSS Sprites（CSS 雪碧图 / 精灵图）** 技术，包含两个独立的纯 HTML+CSS+JS 演示，无需任何构建工具，双击 `index.html` 即可在浏览器中运行。

## 子项目

| #   | 目录                   | 主题                                                                         | 运行方式              |
| --- | ---------------------- | ---------------------------------------------------------------------------- | --------------------- |
| 01  | `01-basic-sprites`     | 基础 CSS Sprites：`background-position` 切图、悬停效果、原理可视化           | 直接打开 `index.html` |
| 02  | `02-automated-sprites` | 自动化雪碧图生成、对比 Icon Fonts / SVG / Base64、请求减少演示、现代替代方案 | 直接打开 `index.html` |

## 技术栈

- **HTML5**：原生语义化标签
- **CSS3**：`background-image`、`background-position`、`background-size`、`linear-gradient`
- **JavaScript (ES6+)**：交互逻辑、性能模拟、动态 DOM
- **零依赖**：不引入任何框架或构建工具，所有"图片"均使用内联 SVG data URI 或 CSS 渐变模拟

> 由于无法在演示中携带真实的 PNG 文件，所有"雪碧图"均通过 **内联 SVG data URI** 或 **CSS 渐变** 模拟。这与真实场景下使用 PNG/JPG 雪碧图的 `background-position` 机制完全一致。

---

## 一、什么是 CSS Sprites

**CSS Sprites**（国内常称"雪碧图"或"精灵图"）是一种将多个小图标合并为一张大图，再通过 CSS `background-image` + `background-position` 在不同位置展示不同图标的技术。

### 原理示意

```
合并后的雪碧图 sprite.png（一张图，包含 4 个图标）
┌──────┬──────┬──────┬──────┐
│ home │ user │ star │ heart│   每个图标 64×64
└──────┴──────┴──────┴──────┘
  0,0  -64,0 -128,0 -192,0   <- background-position

CSS:
.icon-home  { background-position: 0 0; }
.icon-user  { background-position: -64px 0; }
.icon-star  { background-position: -128px 0; }
.icon-heart { background-position: -192px 0; }
```

每个图标元素都使用 `background-image: url(sprite.png)`，但 `background-position` 不同，因此显示大图中对应区域的小图标。

### 核心代码

```css
.sprite {
  width: 64px;
  height: 64px;
  background-image: url('./sprite.png');
  background-repeat: no-repeat;
}

.icon-home {
  background-position: 0 0;
}
.icon-user {
  background-position: -64px 0;
}
.icon-star {
  background-position: -128px 0;
}
```

```html
<div class="sprite icon-home"></div>
<div class="sprite icon-user"></div>
```

---

## 二、历史背景

| 年份      | 事件                                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------------------------- |
| 2004      | Dave Shea 在 [CSS Sprites: Image Slicing's Kiss of Death](https://alistapart.com/article/sprites/) 中正式提出该技术 |
| 2006–2012 | 雅虎、Google、Facebook 等大厂广泛采用，成为前端性能优化标配                                                         |
| 2010 前后 | 工具链成熟：`Compass`、`Glue`、`webpack-spritesmith` 等自动生成雪碧图                                               |
| 2013+     | Icon Fonts（如 Font Awesome）、SVG Symbols 兴起，雪碧图使用率开始下降                                               |
| 2015+     | HTTP/2 多路复用普及，"减少请求数"的收益下降，雪碧图进一步式微                                                       |
| 2020+     | 现代 Web 仍保留雪碧图场景（如游戏图集、复古 UI），但常规图标多用 SVG / Icon Font                                    |

---

## 三、为什么使用 CSS Sprites（优点）

1. **减少 HTTP 请求数**：N 个图标合并为 1 个请求，避免建立多次 TCP/TLS 连接（HTTP/1.1 时代的关键瓶颈）。
2. **减少图片总体积**：合并后的 PNG/JPG 由于共享调色板和压缩头，比 N 张小图总和更小（通常小 20%–50%）。
3. **预加载所有图标**：页面加载时一次拉取全部图标，悬停切换状态不会出现"闪烁"（不会临时去下载 hover 状态图）。
4. **便于做状态切换**：通过修改 `background-position` 即可切换图标，无需 JS 替换 `<img src>`。

---

## 四、CSS Sprites 的缺点

1. **维护成本高**：每次新增图标需要重新拼图并更新所有 `background-position`，手动操作极易出错。
2. **依赖构建工具**：大型项目必须依赖 `webpack-spritesmith`、`sprity`、`Glue` 等工具自动生成，否则不可持续。
3. **图片尺寸固定**：雪碧图中的图标无法像 SVG 一样无损缩放，Retina 屏需额外准备 `@2x` 版本。
4. **颜色不可控**：无法通过 CSS 改变图标颜色（Icon Font、SVG 可以）。
5. **HTTP/2 下收益降低**：HTTP/2 多路复用让多个请求可共用一个连接，"减少请求"的边际收益下降，反而合并大图会延迟首屏关键图标显示。
6. **缓存粒度粗**：任何一个图标变更都使整张雪碧图缓存失效，所有图标需重新下载。

---

## 五、与现代替代方案的对比

| 方案                         | 请求数        | 矢量缩放       | 可改色    | 维护成本 | 适用场景                       |
| ---------------------------- | ------------- | -------------- | --------- | -------- | ------------------------------ |
| **CSS Sprites**              | 1             | 否（位图）     | 否        | 高       | 老项目兼容、位图图标、游戏图集 |
| **Icon Fonts**               | 1             | 是（字体缩放） | 单色      | 中       | 单色图标库（如 FontAwesome）   |
| **SVG `<symbol>` + `<use>`** | 1（可内联）   | 是             | 是（CSS） | 低       | 现代多色可交互图标首选         |
| **Base64 内联**              | 0（嵌入 CSS） | 否             | 否        | 低       | 极小图（< 4KB）、避免额外请求  |
| **HTTP/2 多图直连**          | N（共用连接） | 取决格式       | 取决格式  | 低       | 现代 Web 默认方式              |

> 详细对比与可视化见 `02-automated-sprites/index.html`。

---

## 六、最佳实践（如果仍要使用）

1. **只合并小图标**：通常单图 < 10KB，整张雪碧图 < 100KB；超大图反而拖慢首屏。
2. **横向排列优于纵向**：浏览器解码 PNG 时按行扫描，横向更省内存。
3. **留 1–2px 间隔**：避免相邻图标因 `background-size` 缩放产生像素渗透。
4. **配合 Retina**：使用 `background-size` 缩放，提供 `@2x` 图。
5. **必须自动化**：用 `webpack-spritesmith` / `postcss-sprites` 等工具，禁止手工拼图。
6. **HTTP/2 项目慎用**：评估实际收益，必要时直接用 SVG 或独立小图。

---

## 目录结构

```
032. 说说你对 CSS Sprites 的理解/
├── README.md                       <- 本文件
├── 01-basic-sprites/               <- 基础雪碧图演示
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── README.md
└── 02-automated-sprites/           <- 自动化与对比演示
    ├── index.html
    ├── styles.css
    ├── script.js
    └── README.md
```

## 运行方式

无需安装任何依赖，直接用浏览器打开 `index.html` 即可：

```bash
# 方式 1：双击文件
demo/032. 说说你对 CSS Sprites 的理解/01-basic-sprites/index.html

# 方式 2：用任意静态服务器（可选，更接近真实环境）
cd "demo/032. 说说你对 CSS Sprites 的理解"
python -m http.server 8080
# 访问 http://localhost:8080/01-basic-sprites/index.html
```

## 相关资源

- [CSS Sprits: Image Slicing's Kiss of Death - A List Apart (2004)](https://alistapart.com/article/sprites/)
- [MDN - background-position](https://developer.mozilla.org/zh-CN/docs/Web/CSS/background-position)
- [webpack-spritesmith](https://github.com/mixtur/webpack-spritesmith)
- [CSS-Tricks - CSS Sprites](https://css-tricks.com/css-sprites/)
- [web.dev - HTTP/2 对雪碧图的影响](https://web.dev/articles/http2)
