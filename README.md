## HTML
### 1. 图片优化

### 2. 预加载
```html
<link rel="preload">
```

## CSS
### 1. 回流和重绘

### 2. css sprites 
减少图像请求数量

## JavaScript

### 1. lazy-load

### 2. DOM

### 3. 防抖和节流

### 4. 使用文档片段
使用文档片段（documentFragment）减少 DOM 操作


## Vue
### 1. 路由懒加载
### 2. keep-alive
使用 keep-alive 缓存组件

### 3. v-if 和 v-for 结合使用
**`v-for`** 的优先级高于 **`v-if`**，将 **`v-if`** 抽到 **`v-for`** 外部
```html
<template v-if="someCondition">
  <div v-for="item in items" :key="item.id">
    {{ item.name }}
  </div>
</template>
```


### 4. 虚拟滚动

## webpack

### 1. thread-loader
多进程打包

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
```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
    }
  }
}
```


## HTTP 缓存
### 1. 强缓存

### 2. 协商缓存

## 服务端渲染
### 1. ssr 


## cdn
将静态资源托管在 cdn 上，利用其全球分布的节点加速资源加载

## 可视面板分析

### 1. performance

### 2. lightHouse
