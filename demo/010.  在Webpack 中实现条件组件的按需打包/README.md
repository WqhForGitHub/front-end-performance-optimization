# 在 Webpack 中实现条件组件的按需打包

## 简介

在前端工程化中，"同一份源码，产出不同功能子集的产物"是非常常见的需求，例如：

- **多版本发布**：免费版 / 专业版 / 旗舰版共用一套代码，但打包出的功能不同。
- **多环境差异**：开发环境带 Mock 与调试工具，生产环境只保留精简实现。
- **按需裁剪**：把体积较大的可选依赖（图表、Excel 导出、AI 模块等）按需打进 bundle。
- **CDN 外置**：开发期把第三方库打进 bundle 方便调试，生产期走 CDN 减小体积。

Webpack 提供了多种机制来实现"条件组件的按需打包"。本 demo 通过 4 个子项目，
分别演示 4 种最常用的方法，并对比它们的适用场景。

## 方法总览

| 序号 | 方法                          | 核心插件 / 配置                          | 作用原理                                   | 典型场景                                   |
| ---- | ------------------------------ | ---------------------------------------- | ------------------------------------------ | ------------------------------------------ |
| 01   | DefinePlugin 条件打包          | `webpack.DefinePlugin`                   | 编译期文本替换标识符，配合死代码消除裁剪   | 功能开关（Feature Flag）控制模块进出 bundle |
| 02   | NormalModuleReplacementPlugin  | `webpack.NormalModuleReplacementPlugin`  | 解析阶段把一个模块请求替换为另一个模块     | 同一接口、不同实现（dev/prod 配置、mock）  |
| 03   | 条件 externals 配置            | `externals: (data, cb) => {...}`         | 函数式 externals，按环境决定是否外置依赖   | 第三方库在 dev 打包 / prod 走 CDN           |
| 04   | 多环境构建（函数式配置）       | `module.exports = (env, argv) => config` | 函数式 webpack 配置，`--env` 参数驱动      | basic / full / premium 多版本产物           |

## 各方法详解

### 01. 使用 DefinePlugin 条件打包

**原理**：`DefinePlugin` 在编译阶段把源码中匹配的标识符做"文本替换"。
当把 `process.env.FEATURE_A` 替换为字面量 `false` 后，
`if (process.env.FEATURE_A) { ... }` 就变成了 `if (false) { ... }`，
配合 Terser 的死代码消除（DCE），整块代码及其依赖都不会进入产物。

**关键点**：
1. `DefinePlugin` 做的是文本替换，不是运行时赋值。
2. 值必须用 `JSON.stringify()` 包裹，否则字符串会被当作代码表达式。
3. 需要开启压缩（`mode: 'production'` 或手动配置 Terser）才能移除死代码。

**示例配置**：

```ts
// webpack.config.ts
import { DefinePlugin } from 'webpack'

export default {
  // ...
  plugins: [
    new DefinePlugin({
      // 注入功能开关：true 表示打包该功能，false 表示移除
      'process.env.FEATURE_A': JSON.stringify(true),
      'process.env.FEATURE_B': JSON.stringify(false),
    }),
  ],
}
```

**业务代码**：

```ts
// src/index.ts
if (process.env.FEATURE_A === 'true') {
  // FEATURE_A 为 true 时，featureA 模块进入产物
  const { renderChart } = require('./features/featureA')
  renderChart()
}

if (process.env.FEATURE_B === 'true') {
  // FEATURE_B 为 false 时，整块成为死代码被移除
  const { exportToExcel } = require('./features/featureB')
  exportToExcel()
}
```

**验证方式**：修改 `webpack.config.ts` 中 `FEATURE_A` / `FEATURE_B` 的值，
重新 `npm run build`，对比 `dist/bundle.js` 体积即可看到差异。

---

### 02. 使用 NormalModuleReplacementPlugin

**原理**：`NormalModuleReplacementPlugin` 在 webpack 解析模块时，
把"匹配某个正则"的 `resource.request` 替换成另一个字符串。
利用这一点，可以让 `./config` 在不同环境下被替换为 `./config.dev` 或 `./config.prod`。

**与 DefinePlugin 的区别**：
- `DefinePlugin` 是"文本替换"，适合做开关（true/false）。
- `NormalModuleReplacementPlugin` 是"模块替换"，
  适合"同一个接口、不同实现"的场景，例如 dev/prod 配置、mock/真实数据。

**示例配置**：

```ts
// webpack.config.ts
import { NormalModuleReplacementPlugin } from 'webpack'

const isProd = process.env.NODE_ENV === 'production'

export default {
  // ...
  plugins: [
    // 把所有 ./config 请求替换为 ./config.dev 或 ./config.prod
    new NormalModuleReplacementPlugin(/\/config$/, (resource) => {
      resource.request = isProd ? './config.prod' : './config.dev'
    }),
  ],
}
```

**业务代码**（只依赖抽象入口，不关心具体环境）：

```ts
// src/index.ts
import config from './config'   // 实际指向 config.dev 或 config.prod
console.log(config.apiBaseUrl)
```

**目录约定**：
```
src/config/
  index.ts   # 类型契约 + fallback，约束 dev/prod 结构一致
  dev.ts     # 开发环境实现
  prod.ts    # 生产环境实现
```

---

### 03. 条件 externals 配置

**原理**：`externals` 告诉 webpack"某些依赖不要打包，运行时从全局变量取"。
`externals` 既可以是对象，也可以是函数。使用函数形式时，
可以根据 `mode`（或 `--env` 参数）动态决定是否把某个库 external 化。

- 开发模式：把 lodash 打进 bundle，省去配置 CDN，调试方便。
- 生产模式：lodash 走 CDN，bundle 体积更小，首屏更快。

**示例配置**：

```ts
// webpack.config.ts
const isProd = process.env.NODE_ENV === 'production'

export default {
  // ...
  externals: (data, callback) => {
    if (data.request === 'lodash') {
      if (isProd) {
        // 生产：import 'lodash' 映射到全局变量 window._
        callback(null, 'lodash')
      } else {
        // 开发：不 external，lodash 正常打包进 bundle
        callback(null, false)
      }
      return
    }
    callback()
  },
}
```

**HTML 中按需加载 CDN**：

```html
<script>
  // 生产构建通过 DefinePlugin 注入 __USE_LODASH_CDN__ = true
  if (window.__USE_LODASH_CDN__) {
    document.write('<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"><\/script>')
  }
</script>
```

**验证方式**：
- `npm run dev`：`dist/bundle.js` 包含 lodash，体积较大。
- `npm run build`（生产）：`dist/bundle.js` 不含 lodash，体积明显变小。

---

### 04. 多环境构建（函数式配置）

**原理**：`webpack.config.ts` 可以导出一个函数，
签名为 `(env, argv) => Configuration`。`env` 对应命令行 `--env xxx=yyy` 传入的参数。
据此生成不同的 `Configuration`，从而产出"功能子集"不同的 bundle。

本示例定义三个版本：
- `basic`：只包含 basic 模块（最小体积）
- `full`：包含 basic + advanced 模块（标准版）
- `premium`：包含 basic + advanced + premium 模块（旗舰版）

**示例配置**：

```ts
// webpack.config.ts
import { DefinePlugin } from 'webpack'

type Edition = 'basic' | 'full' | 'premium'

export default function configFactory(env, argv) {
  const edition: Edition = env.edition || 'basic'

  const flags = {
    INCLUDE_BASIC: true,
    INCLUDE_ADVANCED: edition === 'full' || edition === 'premium',
    INCLUDE_PREMIUM: edition === 'premium',
  }

  return {
    // ...
    output: {
      filename: `bundle.${edition}.js`,
    },
    plugins: [
      new DefinePlugin({
        'process.env.EDITION': JSON.stringify(edition),
        'process.env.INCLUDE_ADVANCED': JSON.stringify(flags.INCLUDE_ADVANCED),
        'process.env.INCLUDE_PREMIUM': JSON.stringify(flags.INCLUDE_PREMIUM),
      }),
    ],
  }
}
```

**npm 脚本**：

```json
{
  "scripts": {
    "build:basic": "webpack --config webpack.config.ts --env edition=basic",
    "build:full": "webpack --config webpack.config.ts --env edition=full",
    "build:premium": "webpack --config webpack.config.ts --env edition=premium"
  }
}
```

**验证方式**：分别执行三个脚本，对比 `dist/bundle.basic.js`、
`bundle.full.js`、`bundle.premium.js` 的体积。

## 目录结构

```
010.  在Webpack 中实现条件组件的按需打包\
├── README.md
├── 01-define-plugin\
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src\
│       ├── env.d.ts
│       ├── index.ts
│       └── features\
│           ├── featureA.ts
│           ├── featureB.ts
│           └── featureC.ts
├── 02-normal-module-replacement\
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src\
│       ├── env.d.ts
│       ├── index.ts
│       ├── config\
│       │   ├── index.ts
│       │   ├── dev.ts
│       │   └── prod.ts
│       └── services\
│           └── analytics.ts
├── 03-externals-conditional\
│   ├── package.json
│   ├── tsconfig.json
│   ├── webpack.config.ts
│   ├── index.html
│   └── src\
│       ├── env.d.ts
│       ├── index.ts
│       └── utils\
│           └── data.ts
└── 04-multi-env\
    ├── package.json
    ├── tsconfig.json
    ├── webpack.config.ts
    ├── index.html
    └── src\
        ├── env.d.ts
        ├── index.ts
        └── modules\
            ├── basic.ts
            ├── advanced.ts
            └── premium.ts
```

## 启动方式

> 注意：本 demo 的 `src/env.d.ts` 提供了完整的本地类型声明，
> 因此即使不执行 `npm install`（无 node_modules），
> 也可以通过 `npx tsc --noEmit` 进行类型检查。
> 若要真正构建运行，需要先在各子项目目录执行 `npm install`。

```bash
# 进入某个子项目（以 01 为例）
cd "01-define-plugin"

# 安装依赖（仅在需要真正构建/运行时执行）
npm install

# 类型检查（无需 node_modules 也能通过）
npx tsc --noEmit
# 或
npm run type-check

# 开发模式（启动 dev server）
npm run dev

# 生产构建
npm run build
```

### 04-multi-env 的多版本构建

```bash
cd "04-multi-env"
npm install

# 分别构建三个版本
npm run build:basic
npm run build:full
npm run build:premium

# 对比产物体积
# dist/bundle.basic.js   （最小）
# dist/bundle.full.js    （中等）
# dist/bundle.premium.js （最大）
```

## 方法分类

| 分类维度        | 方法 01                        | 方法 02                           | 方法 03                     | 方法 04                      |
| --------------- | ------------------------------ | --------------------------------- | --------------------------- | ---------------------------- |
| 触发时机        | 编译期（文本替换）             | 解析期（模块替换）                | 解析期（external 决策）     | 配置加载期（函数式配置）     |
| 控制粒度        | 代码块级别（if 分支）          | 模块级别（整文件替换）            | 依赖级别（整包外置）        | 配置级别（整份 webpack 配置） |
| 是否需要改业务代码 | 需要写 if 分支               | 不需要（业务代码只写抽象入口）    | 不需要（业务代码正常 import）| 需要写 if 分支               |
| 死代码消除依赖  | 依赖 Terser DCE                | 不依赖（直接换文件）              | 不依赖（根本不打包）        | 依赖 Terser DCE              |
| 典型用途        | Feature Flag 开关              | dev/prod 配置、mock 数据          | CDN 外置第三方库            | 多版本/多租户产物            |
| 配置复杂度      | 低                             | 中                                | 中                          | 高                           |

## 选型建议

- **只是想做功能开关（开/关某个模块）**：用 **方法 01 DefinePlugin**，最简单直接。
- **同一接口需要多套实现（dev/prod/mock）**：用 **方法 02 NormalModuleReplacementPlugin**。
- **想把第三方库从 bundle 里挪到 CDN**：用 **方法 03 条件 externals**。
- **需要产出多份功能差异较大的产物**：用 **方法 04 函数式配置 + --env**。

实际项目中，这四种方法常常**组合使用**：
例如用方法 04 产出多版本，版本内部再用方法 01 做细粒度开关，
用方法 02 切换 dev/prod 配置，用方法 03 外置通用第三方库。
