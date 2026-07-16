# 方案三：Nginx 服务端缓存配置

本目录提供了一个完整的 `nginx.conf` 示例，演示如何为前端项目配置分级缓存策略。

## 文件说明

| 文件 | 说明 |
|------|------|
| `nginx.conf` | Nginx 完整配置，含分级缓存、gzip、代理缓存 |
| `src/App.tsx` | React 应用，可视化展示缓存响应头、nginx.conf、缓存流程 |
| `vite.config.ts` | Vite 配置（端口 5227） |

## nginx.conf 关键配置解读

### 1. HTML 入口：禁止强缓存

```nginx
location ~* \.html$ {
    add_header Cache-Control "no-cache, must-revalidate" always;
    expires off;
}
```

**原因**：HTML 文件引用了带 hash 的 JS/CSS。如果 HTML 被强缓存，用户将永远拿不到新的 hash 引用，导致更新无法生效。`no-cache` 表示每次都要向服务器验证（协商缓存），确保拿到最新 HTML。

### 2. 带 hash 的 JS/CSS：一年强缓存 + immutable

```nginx
location ~* \.[a-f0-9]{8,}\.js$ {
    add_header Cache-Control "public, max-age=31536000, immutable" always;
}
```

**原因**：文件名包含内容哈希，内容变化时哈希变化、文件名变化，因此可以安全地长期强缓存。`immutable` 告诉浏览器该资源永远不会变，即使用户主动刷新（F5）也不必重新请求。

### 3. 图片/字体：中等时长缓存

```nginx
location ~* \.(png|jpg|jpeg|gif|webp|avif)$ {
    add_header Cache-Control "public, max-age=2592000";  # 30 天
}
location ~* \.(woff2?|ttf|eot|otf)$ {
    add_header Cache-Control "public, max-age=31536000, immutable";  # 一年
}
```

**原因**：图片更新频率较低，30 天缓存平衡命中率与及时性；字体极少变化，可一年强缓存。

### 4. API 接口：代理缓存

```nginx
proxy_cache_path /var/cache/nginx/api levels=1:2
    keys_zone=api_cache:10m max_size=1g inactive=60m;

location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    add_header X-Cache-Status $upstream_cache_status;
    proxy_pass http://backend:3000;
}
```

**原因**：对 API 响应使用代理缓存，减少回源请求。`X-Cache-Status` 响应头暴露缓存命中状态，便于调试。

### 5. gzip 压缩

```nginx
gzip on;
gzip_comp_level 6;
gzip_types text/css application/javascript image/svg+xml font/woff2;
```

**原因**：压缩减小传输体积，配合缓存可进一步降低带宽消耗。

## 如何使用

### 方式一：本地直接使用 Nginx

```bash
# 1. 构建前端
npm install && npm run build

# 2. 将 dist 复制到 nginx 目录
cp -r dist/* /usr/share/nginx/html/

# 3. 复制配置
cp nginx.conf /etc/nginx/nginx.conf

# 4. 重载 nginx
nginx -s reload
```

### 方式二：使用 Docker

```bash
# 构建前端
npm run build

# 使用 nginx 镜像
docker run -d \
  -p 8080:80 \
  -v $(pwd)/dist:/usr/share/nginx/html:ro \
  -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro \
  nginx:alpine
```

## 验证缓存配置

```bash
# 查看响应头
curl -I http://localhost:8080/assets/js/main.a1b2c3d4.js

# 预期输出：
# HTTP/1.1 200 OK
# Cache-Control: public, max-age=31536000, immutable
# ETag: "abc123"
# Content-Encoding: gzip

# 模拟协商缓存
curl -I -H 'If-None-Match: "abc123"' http://localhost:8080/assets/js/main.a1b2c3d4.js
# 预期：HTTP/1.1 304 Not Modified
```

## X-Cache-Status 状态说明

| 状态 | 含义 |
|------|------|
| HIT | 命中代理缓存 |
| MISS | 未命中，已回源 |
| EXPIRED | 缓存已过期，已回源 |
| STALE | 后端异常，使用旧缓存兜底 |
| UPDATING | 缓存正在更新，返回旧内容 |
| REVALIDATED | 启用 proxy_cache_revalidate 时验证通过 |
