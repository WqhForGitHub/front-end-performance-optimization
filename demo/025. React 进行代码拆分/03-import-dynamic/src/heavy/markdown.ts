// 模拟「Markdown 解析器」（类似 marked / markdown-it 的极简版）
// 体积假设 ~95KB。只有用户需要预览 Markdown 时才下载。
// 通过 dynamic import() 加载，会被拆成独立 chunk：assets/markdown-[hash].js

let parserReady = false
function ensureParser() {
  if (parserReady) return
  // 模拟词法/语法分析表初始化
  const rules = new Array(500).fill(0).map((_, i) => `rule-${i}`)
  void rules
  parserReady = true
}

export function renderMarkdown(src: string): string {
  ensureParser()
  const lines = src.split('\n')
  const html: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed === '') {
      html.push('')
      continue
    }
    // 标题 h1~h3
    const h = /^(#{1,3})\s+(.*)$/.exec(trimmed)
    if (h) {
      const level = h[1].length
      html.push(`<h${level}>${inline(h[2])}</h${level}>`)
      continue
    }
    // 无序列表
    if (/^[-*]\s+/.test(trimmed)) {
      html.push(`<li>${inline(trimmed.replace(/^[-*]\s+/, ''))}</li>`)
      continue
    }
    // 引用
    if (/^>\s+/.test(trimmed)) {
      html.push(`<blockquote>${inline(trimmed.replace(/^>\s+/, ''))}</blockquote>`)
      continue
    }
    // 分隔线
    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      html.push('<hr/>')
      continue
    }
    // 普通段落
    html.push(`<p>${inline(trimmed)}</p>`)
  }
  return html.join('\n')
}

function inline(text: string): string {
  return text
    // 行内代码 `code`
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // 粗体 **text**
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // 斜体 *text*
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    // 链接 [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
}

export function extractToc(src: string): Array<{ level: number; text: string }> {
  ensureParser()
  const toc: Array<{ level: number; text: string }> = []
  for (const line of src.split('\n')) {
    const m = /^(#{1,3})\s+(.*)$/.exec(line.trim())
    if (m) toc.push({ level: m[1].length, text: m[2] })
  }
  return toc
}

export const MARKDOWN_LIB_VERSION = 'mini-markdown@2.4.1 (simulated, ~95KB)'
