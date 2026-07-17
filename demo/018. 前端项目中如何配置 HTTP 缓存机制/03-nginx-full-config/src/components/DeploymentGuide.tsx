import { useState } from 'react'

interface Command {
  id: string
  label: string
  cmd: string
  output: string
  explain: string
}

const commands: Command[] = [
  {
    id: 'build',
    label: '1. 构建产物',
    cmd: 'npm run build',
    output: `vite v5.3.4 building for production...
dist/index.html                  0.46 kB
dist/assets/index-a3f9b2c1.js   142.07 kB │ gzip: 45.82 kB
dist/assets/index-d8e1f4a7.css   12.33 kB │ gzip:  3.10 kB
dist/assets/logo-7c2b9e3f.png     8.91 kB
✓ built in 1.23s`,
    explain: '构建后产物文件名带 contenthash，配合 nginx 的 immutable 长缓存规则。'
  },
  {
    id: 'docker',
    label: '2. 用 Nginx 启动',
    cmd: 'docker run -d -p 5236:80 \\\n  -v $(pwd)/dist:/usr/share/nginx/html \\\n  -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf \\\n  nginx:alpine',
    output: `a1b2c3d4e5f6...
# 容器启动后访问 http://localhost:5236`,
    explain: '将 dist 挂载到 nginx 静态目录，nginx.conf 挂载为站点配置。'
  },
  {
    id: 'curl-js',
    label: '3. 验证 JS 长缓存',
    cmd: "curl -I http://localhost:5236/assets/index-a3f9b2c1.js",
    output: `HTTP/1.1 200 OK
Server: nginx/1.25.3
Content-Type: application/javascript
Content-Length: 142070
Last-Modified: Wed, 17 Jul 2026 08:00:00 GMT
ETag: "64a1c2-abcdef"
Cache-Control: public, max-age=31536000, immutable
Accept-Ranges: bytes`,
    explain: 'JS 产物带 immutable + 一年 max-age，且附带 ETag / Last-Modified。'
  },
  {
    id: 'curl-html',
    label: '4. 验证 HTML no-cache',
    cmd: 'curl -I http://localhost:5236/index.html',
    output: `HTTP/1.1 200 OK
Server: nginx/1.25.3
Content-Type: text/html
Cache-Control: no-cache
ETag: "deadbeef"
Last-Modified: Wed, 17 Jul 2026 08:00:00 GMT`,
    explain: 'HTML 走 no-cache，每次发协商请求，命中则 304。'
  },
  {
    id: 'curl-304',
    label: '5. 触发 304',
    cmd: 'curl -I -H \'If-None-Match: "deadbeef"\' http://localhost:5236/index.html',
    output: `HTTP/1.1 304 Not Modified
Server: nginx/1.25.3
ETag: "deadbeef"
Cache-Control: no-cache`,
    explain: '带上 If-None-Match 后，nginx 比对 ETag 一致，返回 304 不带 body。'
  }
]

export default function DeploymentGuide() {
  const [active, setActive] = useState('build')
  const current = commands.find((c) => c.id === active)!

  return (
    <section className="card">
      <div className="card-head">
        <h2>部署与验证</h2>
        <p>从构建到用 curl 验证每类资源的缓存响应头，完整复现生产链路。</p>
      </div>

      <div className="cmd-tabs">
        {commands.map((c) => (
          <button
            key={c.id}
            className="cmd-tab"
            style={active === c.id ? { background: '#2563eb', color: '#fff', borderColor: '#2563eb' } : {}}
            onClick={() => setActive(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="cmd-layout">
        <div className="cmd-block">
          <div className="cmd-label">命令</div>
          <pre className="code-block cmd">{current.cmd}</pre>
        </div>
        <div className="cmd-block">
          <div className="cmd-label">输出</div>
          <pre className="code-block output">{current.output}</pre>
        </div>
      </div>

      <div className="cmd-explain">
        <span className="explain-tag">说明</span>
        {current.explain}
      </div>
    </section>
  )
}
