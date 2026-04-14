# 线程决策归档（DECISIONS）

## 2026-04-14 | 已确认稳定决策

1. 暗色模式导航选中态规范
- 顶部导航、一级标签、二级标签统一使用“底部绿线高亮”。
- 禁止继续使用暗色下的大面积绿色背景块作为 active 背景。

2. Pages 发布路径规范
- 前端发布必须从 `pages` 目录执行 `wrangler pages deploy`，保证 `pages/functions/_middleware.js` 一并生效。
- 若直接只传前端静态目录，可能导致 `/open_api/*` 代理链路失效，进而影响后台登录与设置接口。

3. 执行稳定性规范
- 执行 `wrangler` 相关命令前，优先清空 `HTTP_PROXY / HTTPS_PROXY / ALL_PROXY`，降低授权和发布异常概率。
- Cloudflare Token 仅用于授权，不应写入仓库文件；建议仅保存在本地环境变量或 `wrangler` 登录态。
