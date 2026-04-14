# 线程架构归档（ARCHITECTURE）

## 2026-04-14 | 发布与路由链路补充

### 发布链路（当前有效）

1. `frontend` 负责构建静态资源（`pnpm build`）。
2. `pages` 负责 Cloudflare Pages Functions 与 Worker Service 绑定（`pages/wrangler.toml`）。
3. 前端线上访问域名（如 `mail.gasgx.com`）通过 Pages 项目 `cloudflare-temp-email-pages-20260406` 对外提供。

### 关键结构约束

- `pages/functions/_middleware.js` 是前端到 Worker 的代理中间层关键节点。
- 若发布流程绕开 `pages` 项目上下文，中间件不会随构建一起生效，`/open_api/*` 请求会异常。
- 因此该仓库的前端发布属于“静态资源 + functions”组合发布，不是纯静态托管模型。
