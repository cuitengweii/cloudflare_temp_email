# 线程架构归档（ARCHITECTURE）

## 2026-04-21 | 员工邮箱模式职责边界

### 公开前台
- 根入口进入员工门户。
- 未登录用户只看到：
  - 员工登录
  - 忘记密码
- 前台不再承担：
  - 公开注册
  - 匿名/临时邮箱创建
  - 员工自助创建邮箱地址

### 管理后台
- Admin 继续保留完整后台能力：
  - 用户管理
  - 用户地址分配/解绑
  - 发件权限管理
  - 邮件查看与发送
  - 系统配置、统计、维护
- 员工账号生命周期由后台主导：
  - 创建员工用户
  - 自动生成初始密码
  - 后台分配邮箱地址

### 用户与邮箱关系
- “用户账号”与“邮箱地址”仍是两层结构：
  - `users`：员工登录账号
  - `address`：实际邮箱地址
  - `users_address`：绑定关系
- 结论：
  - 创建员工账号不等于自动创建邮箱地址
  - 邮箱地址仍由管理员后续绑定

### 验证码与密码重置链路
- 验证码能力依赖：
  - 生产 Worker 绑定 `KV`
  - `enableMailVerify = true`
  - 合法的 `verifyMailSender`
- 当前密码重置通过 `/user_api/verify_code` + `/user_api/register` 完成。
- 当前 `register` 接口兼具两种职责：
  - 公开注册（现在线上通过 `enable = false` 关闭）
  - 验证码重置密码（保留）

### 部署链路
1. `frontend` 构建静态资源。
2. `pages` 负责 Cloudflare Pages + Functions 发布。
3. `worker` 提供后端 API、D1、KV、发信逻辑。
4. 正式域名 `mail.gasgx.com` 通过 Pages 对外提供前端，并通过 Functions/Service Binding 代理到 Worker。
