import { Fragment, useState, type FC } from 'react'
import './global.css' // 故意引入全局 CSS 演示冲突场景
import styles from './App.module.css'

/**
 * 02 - CSS Modules 与样式作用域
 *
 * 演示内容：
 * 1. 传统全局 CSS 的命名冲突问题
 * 2. CSS Modules 自动 hash 化类名，避免冲突
 * 3. 可视化展示 hash 后的类名（如 App_card__3F9k1）
 * 4. composes 组合样式
 * 5. 与全局 CSS 共存
 */

// 代码示例字符串
const CODE_GLOBAL = `/* global.css - 全局作用域 */
.card {
  background: purple;
  color: #fff;
}

.card .title {
  color: gold;
}

/* 问题：所有 .card 处处生效，容易冲突 */`

const CODE_MODULE = `/* App.module.css - 局部作用域 */
.card {
  background: teal;
  color: #fff;
}

.card .title {
  color: cyan;
}

/* 构建后自动转换为：
   .App_card__3F9k1 { background: teal; ... }
   .App_card__3F9k1 .App_title__7Hb2x { color: cyan; } */`

const CODE_USAGE = `// App.tsx
import styles from './App.module.css'

function App() {
  // styles.card 实际值: "App_card__3F9k1"
  return (
    <div className={styles.card}>
      <h2 className={styles.title}>标题</h2>
    </div>
  )
}`

const CODE_COMPOSES = `/* App.module.css */
.base {
  padding: 8px 14px;
  border-radius: 6px;
}

.primary {
  composes: base;       /* 复用 .base */
  background: #10b981;
  color: #fff;
}

/* 渲染结果：
   class="App_primary__a1b2c App_base__x9y8z" */`

// 模拟 Vite 构建后的 hash 类名（用于可视化展示）
const HASHED_NAMES = [
  { original: 'container', hashed: '_container_1a2b3_1' },
  { original: 'hero', hashed: '_hero_1a2b3_8' },
  { original: 'card', hashed: '_card_1a2b3_15' },
  { original: 'title', hashed: '_title_1a2b3_22' },
  { original: 'button', hashed: '_button_1a2b3_30' },
  { original: 'demoCard', hashed: '_demoCard_1a2b3_40' },
]

// ============================================================
// 主组件
// ============================================================
const App: FC = () => {
  const [showHash, setShowHash] = useState(true)

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>02 · CSS Modules 与样式作用域</h1>
        <p className={styles.heroSub}>
          CSS 优化方法之二 -- 通过 CSS Modules 实现样式局部作用域，杜绝命名冲突。
        </p>
      </header>

      {/* 概念解释 */}
      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.badge}>概念</span>
          什么是 CSS Modules？
        </h2>
        <p style={{ margin: '0 0 12px', color: '#cbd5e1' }}>
          <b style={{ color: '#6ee7b7' }}>CSS Modules</b> 是一种 CSS 文件（通常以{' '}
          <code style={inlineCodeStyle}>*.module.css</code> 命名），
          其中所有类名和动画名默认都在局部作用域内。构建工具（Vite/Webpack）会自动把类名转换成唯一的哈希值，
          例如 <code style={inlineCodeStyle}>.card</code> 变成{' '}
          <code style={inlineCodeStyle}>_card_1a2b3_15</code>， 从而避免全局命名冲突。
        </p>
        <ul style={{ margin: 0, paddingLeft: 22, color: '#cbd5e1' }}>
          <li>局部作用域：默认所有类名局部生效，不影响其他组件。</li>
          <li>
            显式引用：必须 <code style={inlineCodeStyle}>import styles from './x.module.css'</code>{' '}
            才能使用，零隐式依赖。
          </li>
          <li>
            可组合：<code style={inlineCodeStyle}>composes</code> 关键字复用其他规则。
          </li>
          <li>
            与全局共存：用 <code style={inlineCodeStyle}>:global(.x)</code> 选择性引用全局类名。
          </li>
        </ul>
      </section>

      {/* 同名类不冲突演示 */}
      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.badge}>核心</span>
          同名类 .card 不冲突演示
        </h2>
        <p style={{ margin: '0 0 16px', color: '#cbd5e1', fontSize: 14 }}>
          下面两张卡片都使用了 <code style={inlineCodeStyle}>.card</code> /{' '}
          <code style={inlineCodeStyle}>.title</code> 类名。 左边使用全局 CSS（紫色），右边使用 CSS
          Modules（蓝绿色）。两者各自渲染，互不影响。
        </p>

        <div className={styles.compareGrid}>
          {/* 左：全局 CSS */}
          <div className={styles.compareCol}>
            <span className="global-tag">全局 CSS · global.css</span>
            <div className="card">
              <h3 className="title">全局 .card</h3>
              <p className="desc">
                这个卡片用全局 CSS 渲染。类名 <code>.card</code> 在全局作用域， 任何地方使用{' '}
                <code>className="card"</code> 都会变成紫色。
              </p>
            </div>
            <button className="button">全局 .button（粉色）</button>
          </div>

          {/* 右：CSS Modules */}
          <div className={styles.compareCol}>
            <span className={styles.badge}>CSS Modules · App.module.css</span>
            <div className={styles.demoCard}>
              <h3 className={styles.title}>局部 .card（实际类名已 hash）</h3>
              <p className={styles.desc}>
                这个卡片用 CSS Modules 渲染。虽然源码也叫 <code>.card</code>， 但构建后变成{' '}
                <code>_demoCard_1a2b3_40</code>，与全局不冲突。
              </p>
            </div>
            <button className={styles.button}>局部 .button（青色）</button>
          </div>
        </div>
      </section>

      {/* Hash 类名可视化 */}
      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.badge}>可视化</span>
          Hash 后的类名对照表
          <button className={styles.button} onClick={() => setShowHash((v) => !v)}>
            {showHash ? '隐藏 hash' : '显示 hash'}
          </button>
        </h2>
        <p style={{ margin: '0 0 12px', color: '#cbd5e1', fontSize: 14 }}>
          点击按钮切换查看构建后真实的 hash 类名。Vite 默认格式：
          <code style={inlineCodeStyle}>_&lt;name&gt;_&lt;file&gt;_&lt;hash&gt;</code>。
        </p>

        <div>
          {HASHED_NAMES.map((item) => (
            <div key={item.original} className={styles.hashBox}>
              <span className={styles.hashLabel}>源码类名：</span>
              <span style={{ color: '#fbbf24' }}>.{item.original}</span>
              {showHash ? (
                <Fragment>
                  <span className={styles.hashLabel} style={{ marginLeft: 16 }}>
                    构建后：
                  </span>
                  <span className={styles.hashValue}>.{item.hashed}</span>
                </Fragment>
              ) : null}
            </div>
          ))}
        </div>

        <p style={{ margin: '16px 0 0', color: '#94a3b8', fontSize: 12 }}>
          注：上表中的 hash 值为示意格式，实际构建工具会基于文件路径和内容生成稳定的 hash。
        </p>
      </section>

      {/* 代码示例 */}
      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.badge}>代码</span>
          写法对比
        </h2>
        <div className={styles.compareGrid}>
          <div className={styles.compareCol}>
            <div style={{ fontSize: 12, color: '#f9a8d4', marginBottom: 6 }}>
              全局 CSS（易冲突）
            </div>
            <pre className={styles.codeBlock}>{CODE_GLOBAL}</pre>
          </div>
          <div className={styles.compareCol}>
            <div style={{ fontSize: 12, color: '#6ee7b7', marginBottom: 6 }}>
              CSS Modules（局部作用域）
            </div>
            <pre className={styles.codeBlock}>{CODE_MODULE}</pre>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>在组件中使用</div>
          <pre className={styles.codeBlock}>{CODE_USAGE}</pre>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>composes 组合样式</div>
          <pre className={styles.codeBlock}>{CODE_COMPOSES}</pre>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <span className={styles.primary}>primary 按钮（含 base）</span>
            <span className={styles.secondary}>secondary 按钮（含 base）</span>
          </div>
        </div>
      </section>

      {/* 实践要点 */}
      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.badge}>实践</span>
          实践要点
        </h2>
        <ul style={{ margin: 0, paddingLeft: 22, color: '#cbd5e1', fontSize: 14 }}>
          <li>
            Vite 原生支持 <code style={inlineCodeStyle}>*.module.css</code>，零配置开箱即用。
          </li>
          <li>
            类名建议 camelCase（<code style={inlineCodeStyle}>styles.heroTitle</code>）便于 JS
            引用。
          </li>
          <li>
            配合 TypeScript：在 <code style={inlineCodeStyle}>env.d.ts</code> 中声明{' '}
            <code style={inlineCodeStyle}>*.module.css</code> 模块即可获得类型提示。
          </li>
          <li>
            用 <code style={inlineCodeStyle}>:global(.x)</code>{' '}
            选择性引入全局样式（如第三方库覆盖）。
          </li>
          <li>
            <b style={{ color: '#fbbf24' }}>性能优势</b>：构建时可做
            Tree-shaking，未使用的类名不会进入产物。
          </li>
          <li>大型项目可考虑 CSS-in-JS（styled-components / emotion）或 Tailwind 作为替代方案。</li>
        </ul>
      </section>

      <footer style={{ textAlign: 'center', color: '#64748b', fontSize: 12, marginTop: 32 }}>
        CSS 优化 · 02 · CSS Modules · port 5268
      </footer>
    </div>
  )
}

const inlineCodeStyle = {
  background: 'rgba(16, 185, 129, 0.15)',
  color: '#6ee7b7',
  padding: '1px 6px',
  borderRadius: 4,
  fontFamily: '"JetBrains Mono", Consolas, monospace',
  fontSize: '0.9em',
}

export default App
