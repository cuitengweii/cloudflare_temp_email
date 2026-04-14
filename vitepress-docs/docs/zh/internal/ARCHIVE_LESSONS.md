# 线程经验归档（LESSONS）

## 2026-04-14 | 踩坑与规避

1. OAuth 回调跳到 `localhost:8976` 且无法访问
- 现象：浏览器授权后跳转本地地址报 `ERR_CONNECTION_REFUSED`。
- 根因：本机没有监听该端口，或登录回调流程未在同一终端会话完成。
- 规避：在执行登录命令的同一终端完成浏览器授权，确保本地回调监听进程处于运行中。

2. 发布后“看起来没更新”
- 现象：本地文件已改但线上无变化，或后台接口异常。
- 根因：只发布了静态目录，未带上 `pages/functions` 中间件。
- 规避：固定从 `pages` 目录执行 `wrangler pages deploy ../frontend/dist ...`。

3. Cloudflare Token 反复失败
- 现象：同一 token 有时可用、有时报 Missing Authorization 或权限不足。
- 根因：命令环境不一致（代理影响、旧环境变量覆盖、权限范围不完整）。
- 规避：
  - 每次执行前先验证 token：`/user/tokens/verify`。
  - 明确 token 权限至少覆盖 Pages/Workers/D1/KV 所需范围。
  - 保持“清空代理再执行 wrangler”的稳定流程。
