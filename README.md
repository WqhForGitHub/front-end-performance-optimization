## HTML
### 1. 图片优化

## CSS
### 1. 回流和重绘

## JavaScript

### 1. lazy-load

### 2. DOM

### 3. 防抖和节流

## Vue
### 1. 路由懒加载

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

### 8. splitChunks


## HTTP 缓存
### 1. 强缓存

### 2. 协商缓存

## 服务端渲染
### 1. ssr 


## 可视面板分析

### 1. performance

### 2. lightHouse
