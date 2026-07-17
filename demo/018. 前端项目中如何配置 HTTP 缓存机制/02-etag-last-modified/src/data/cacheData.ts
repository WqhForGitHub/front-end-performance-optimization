/**
 * 协商缓存相关数据：ETag / Last-Modified 校验器对比、请求头映射、流程节点
 */

export interface ValidatorInfo {
  header: string
  requestHeader: string
  type: 'strong' | 'weak'
  precision: string
  granularity: string
  example: string
  pros: string
  cons: string
  color: string
}

/** 强校验 (ETag) 与弱校验 (Last-Modified) 对比 */
export const validators: ValidatorInfo[] = [
  {
    header: 'ETag',
    requestHeader: 'If-None-Match',
    type: 'strong',
    precision: '基于内容 hash / 版本号',
    granularity: '字节级精确',
    example: 'ETag: "abc123"  /  If-None-Match: "abc123"',
    pros: '内容真正变更才换值；同一秒修改也能识别；可区分内容相同但元数据不同的资源',
    cons: '服务器需计算 hash，有一定 CPU 开销',
    color: '#16a34a'
  },
  {
    header: 'Last-Modified',
    requestHeader: 'If-Modified-Since',
    type: 'weak',
    precision: '基于文件修改时间',
    granularity: '秒级（无法区分 1 秒内多次修改）',
    example: 'Last-Modified: Wed, 17 Jul 2026 08:00:00 GMT  /  If-Modified-Since: ...',
    pros: '计算开销小，直接用文件 mtime；兼容性最好',
    cons: '精度只到秒；修改时间变但内容没变也会误判为更新；分布式时间不同步可能出错',
    color: '#ea580c'
  }
]

/** 请求头 -> 响应头 映射关系 */
export interface HeaderPair {
  responseHeader: string
  requestHeader: string
  validator: 'ETag' | 'Last-Modified'
  desc: string
}

export const headerPairs: HeaderPair[] = [
  {
    responseHeader: 'ETag',
    requestHeader: 'If-None-Match',
    validator: 'ETag',
    desc: '服务器返回 ETag，浏览器下次请求带上 If-None-Match'
  },
  {
    responseHeader: 'Last-Modified',
    requestHeader: 'If-Modified-Since',
    validator: 'Last-Modified',
    desc: '服务器返回 Last-Modified，浏览器下次请求带上 If-Modified-Since'
  }
]

/** 流程节点 */
export interface FlowStep {
  id: string
  side: 'client' | 'server'
  title: string
  detail: string
  payload?: string
  status?: string
  highlight?: boolean
}

/** 首次请求 + 命中 304 的完整交互流程 */
export const negotiationFlow: FlowStep[] = [
  {
    id: '1',
    side: 'client',
    title: '首次请求 GET /article.json',
    detail: '本地无缓存，直接请求',
    payload: 'GET /article.json HTTP/1.1'
  },
  {
    id: '2',
    side: 'server',
    title: '服务器返回 200 + 校验器',
    detail: '附带 ETag 与 Last-Modified，浏览器存入缓存',
    payload: 'HTTP/1.1 200 OK\nETag: "v3"\nLast-Modified: Wed, 17 Jul 2026 08:00:00 GMT\nCache-Control: no-cache',
    status: '200',
    highlight: true
  },
  {
    id: '3',
    side: 'client',
    title: '再次请求 (携带校验器)',
    detail: '因 no-cache 或过期，浏览器发协商请求',
    payload: 'GET /article.json HTTP/1.1\nIf-None-Match: "v3"\nIf-Modified-Since: Wed, 17 Jul 2026 08:00:00 GMT'
  },
  {
    id: '4',
    side: 'server',
    title: '比对校验器 -> 未变更',
    detail: 'ETag / Last-Modified 一致，仅返回 304',
    payload: 'HTTP/1.1 304 Not Modified\nETag: "v3"\nCache-Control: no-cache',
    status: '304',
    highlight: true
  },
  {
    id: '5',
    side: 'client',
    title: '复用本地副本',
    detail: '浏览器用缓存内容渲染，节省了 body 传输'
  }
]

/** 当资源被修改时的流程 */
export const modifiedFlow: FlowStep[] = [
  {
    id: '1',
    side: 'client',
    title: '再次请求 (携带旧校验器)',
    detail: '资源已在服务器更新',
    payload: 'GET /article.json HTTP/1.1\nIf-None-Match: "v3"'
  },
  {
    id: '2',
    side: 'server',
    title: '比对 -> 已变更',
    detail: 'ETag 不一致，返回完整新内容',
    payload: 'HTTP/1.1 200 OK\nETag: "v4"\nLast-Modified: Wed, 17 Jul 2026 09:30:00 GMT\nCache-Control: no-cache\n\n{ "title": "已更新的文章" }',
    status: '200',
    highlight: true
  },
  {
    id: '3',
    side: 'client',
    title: '用新内容替换缓存',
    detail: '更新本地 ETag / Last-Modified'
  }
]
