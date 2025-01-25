## HTML
### 1. 图片优化
**`JPEG/JPG`**

关键字：**有损压缩、体积小、加载快、不支持透明**

使用场景：**JPG 适用于呈现色彩丰富的图片，大的背景图、轮播图**

**`PNG-8 与 PNG-24`**

关键字：**无损压缩、质量高、体积大、支持透明**

使用场景：**呈现小的 logo，颜色简单而且对比强烈的图片或背景**

**`SVG`**

关键字：**文本文件、体积小、不失真、兼容性好**

**`Base 64`**

关键字：**文本文件、依赖编码、小图标解决方案**

使用场景：**小图标**


### 2. 预加载
preload
```html
<link rel="preload" href="style.css" />
<link rel="preload" href="main.js" />
```

### 3. 预提取
prefetch
```html
<link rel="prefetch" href="style.css" />
<link rel="prefetch" href="main.js" />
```

### 4. `defer` 属性

```javascript
<script src="script.js" defer></script>
```

* **行为**： **`defer`** 属性表示脚本将在文档解析完成后（即 **`DOMContentLoaded`** 事件之前）异步执行。这种方式不会阻塞 HTML 文档的解析，脚本会按顺序执行。

### 5. `async` 属性

```javascript
<script src="script.js" async></script>
```

* **行为**： **`async`** 属性也用于异步加载脚本，但它会在脚本下载完成完成后立即执行，不考虑页面的解析进度。

无 **`async`** 或 **`defer`** 属性的 **`script`** 标签会阻塞 HTML 的解析，进而也会阻塞渲染。

## CSS

### 1. css 文件放在 `head` 头部

虽然将 css 文件放在 **`<head>`** 部分会阻塞渲染，但它是保证页面样式准确加载的必要方式。要确保在 **`<head>`** 部分中尽量精简和优化 css 以减少阻塞时间。

### 2. 回流和重绘

### 3. css sprites 
减少图像请求数量
```css
.icon-1 {
  width: 20px;
  height: 20px;
  background-image: url("sprite.png");
  background-position: 0 0;
  background-repeat: no-repeat;
}

.icon-2 {
  width: 20px;
  height: 20px;
  background-image: url("sprite.png");
  background-position: -20px 0;
  background-repeat: no-repeat;
}

.icon-3 {
  width: 20px;
  height: 20px;
  background-image: url("sprite.png");
  background-position: -40px 0;
  background-repeat: no-repeat;
}
```

## JavaScript

### 1. lazy-load
```javascript
function isInViewPortOne(el) {
  const viewPortHeight = window.innerHeight;
  const offsetTop = el.offsetTop;
  const scrollTop = document.documentElement.scrollTop;
  const top = offset - scrollTop;
  return top <= viewPortHeight;
}
```

### 2. DOM

### 3. 防抖和节流

**防抖**

```javascript
function debounce(func, wait) {
  let timeout;

  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, arguments);
    }, wait);
  }
}
```

**节流**

```javascript
function throttle(func, apply) {
  let lastTime = 0;
  return function() {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      func.apply(this, arguments);
    }
  }
}
```

### 4. 使用文档片段
使用文档片段（documentFragment）减少 DOM 操作
```html
<ul id="list"></ul>
```
```javascript
const list = document.querySelector("#list");
const fruits = ["Apple", "Orange", "Banana", "Melon"];

const fragment = new DocumentFragment();

fruits.forEach((fruit) => {
  const li = document.createElement("li");
  li.textContent = fruit;
  fragment.appendChild(li);
});

list.appendChild(fragment);
```


## Vue
### 1. 路由懒加载
```javascript
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('./views/About.vue')
  },
  // 其他路由配置
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
```

### 2. keep-alive
使用 keep-alive 缓存组件

### 3. v-if 和 v-for 结合使用
**`v-for`** 的优先级高于 **`v-if`**，将 **`v-if`** 抽到 **`v-for`** 外部
```html
template v-if="someCondition">
  <div v-for="item in items" :key="item.id">
    {{ item.name }}
  </div>
</template>
```


### 4. 虚拟滚动

## webpack

### 1. thread-loader
多进程打包
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          'thread-loader'
        ]
      }
    ]
  }
}
```

### 2. image-webpack-loader
压缩图片

### 3. 配置 babel-loader 缓存
```javascript
{
  test: /\.js$/,
  use: [
    {
      loader: 'babel-loader',
      options: {
        cacheDirectory: true
      }
    }
  ]
}
```

### 4. DLLPlugin

### 5. terser-webpack-plugin
压缩 js
```javascript
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()]
  }
}
```

### 6. mini-css-extract-plugin
压缩 css
```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })
  ]
}
```

### 7. compression-webpack-plugin
gzip 压缩
```javascript
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  plugins: [
    new CompressionPlugin()
  ]
}
```

### 8. splitChunks

它能自动识别和提取公共模块，并将其打包成单独的 chunk，减少重复代码，从而优化你的应用性能。

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/, // 匹配 node_modules 中的模块
          name: 'vendors', // 自定义 chunk 名称
          chunks: 'all',
          priority: 1 // 优先级，更高的优先级会优先被应用
        },
        default: {
          minChunks: 2, // 至少被两个 chunk 共享的模块才会被提取
          reuseExistingChunk: true, // 重用已存在的 chunk
          name: 'common' // 自定义 chunk 名称
        }
      }
    }
  }
}
```


## HTTP 缓存
### 1. 强缓存
css、js、图片等资源可以进行强缓存

### 2. 协商缓存
html 文件可以进行协商缓存

## 服务端渲染
### 1. ssr 


## cdn

将静态资源托管在 cdn 上，利用其全球分布的节点加速资源加载


## 可视面板分析

### 1. performance

### 2. lightHouse
