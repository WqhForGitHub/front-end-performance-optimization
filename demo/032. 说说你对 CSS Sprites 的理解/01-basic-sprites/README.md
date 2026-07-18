# 01 · 基础 CSS Sprites 演示

> 使用 `background-image` + `background-position` 实现基础的 CSS 雪碧图切图。

## 运行方式

直接用浏览器打开 `index.html` 即可，无需任何依赖：

```bash
# 双击文件，或用命令行：
start index.html        # Windows
open index.html         # macOS
xdg-open index.html     # Linux
```

也可以用任意静态服务器：

```bash
python -m http.server 8080
# 访问 http://localhost:8080/index.html
```

## 演示内容

| 章节          | 内容                                                    |
| ------------- | ------------------------------------------------------- |
| 1. 雪碧图全貌 | 展示完整的 256×128 雪碧图，说明布局与坐标系             |
| 2. 图标网格   | 4 个图标共用同一张背景图，仅 `background-position` 不同 |
| 3. 原理可视化 | 交互式演示：点击按钮观察背景图如何被"推"入 64×64 视窗   |
| 4. 悬停效果   | hover 切换 `background-position`，零额外请求、零闪烁    |
| 5. 代码示例   | 完整的 CSS / HTML 代码，含 Retina `@2x` 适配            |
| 6. 请求对比   | 传统多图（4 次请求）vs 雪碧图（1 次请求）               |

## 关于"图片"的说明

由于本演示不能携带真实 PNG 文件，所有"雪碧图"均通过 **内联 SVG data URI** 模拟：

```css
background-image: url('data:image/svg+xml,%3Csvg ...%3E');
```

这与真实 PNG 雪碧图的 `background-position` 机制完全一致——浏览器把 data URI 当作一张普通图片处理，所有定位、缩放、缓存规则都相同。真实项目中只需把 `url(...)` 换成 `url("./sprite.png")` 即可。

## 雪碧图结构

```
sprite.png (256 × 128)
┌────────┬────────┬────────┬────────┐
│  Home  │  User  │  Star  │ Heart  │  ← 第 1 行：默认状态 (y=0)
│  0,0   │ -64,0  │-128,0  │-192,0  │
├────────┼────────┼────────┼────────┤
│ Home:h │ User:h │ Star:h │Heart:h │  ← 第 2 行：hover 状态 (y=-64)
│ 0,-64  │-64,-64 │-128,-64│-192,-64│
└────────┴────────┴────────┴────────┘
每格 64×64px
```

## 核心 CSS

```css
.sprite {
  width: 64px;
  height: 64px;
  background-image: url('./sprite.png');
  background-repeat: no-repeat;
  display: inline-block;
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
.icon-heart {
  background-position: -192px 0;
}

/* hover：切到第 2 行 */
.icon-home:hover {
  background-position: 0 -64px;
}
```

## 文件清单

| 文件         | 说明                                                    |
| ------------ | ------------------------------------------------------- |
| `index.html` | 页面结构，引用 styles.css 与 script.js                  |
| `styles.css` | 雪碧图定义、图标定位、可视化样式（含内联 SVG data URI） |
| `script.js`  | 原理可视化交互、导航高亮、坐标提示                      |
| `README.md`  | 本文件                                                  |

## 关键收获

1. **一张图 + N 个 position** = N 个图标，只产生 1 次 HTTP 请求。
2. **hover 状态预置**在同一张图里，切换 `background-position` 即时生效，无闪烁。
3. **负的 `background-position`** 表示把背景图向左/上推，使目标单元落入视窗。
4. **Retina 屏**用 `background-size` 配合 `@2x` 图缩放，避免模糊。
