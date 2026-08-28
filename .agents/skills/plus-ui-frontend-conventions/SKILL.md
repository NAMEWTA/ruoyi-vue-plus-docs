---
name: plus-ui-frontend-conventions
description: 为 plus-ui-namewta 多 App monorepo 提供当前架构、实现落位、目录命名、Vue/TypeScript 工具链、App 显式组合、动态菜单路由和权限源码导航。处理 apps、domains、web-domains、platform、adapters、web-kit、OpenAPI、projectServerRoutes、addRoute、v-hasPermi、v-hasRoles 或新增终端时使用。
---

# plus-ui-namewta 前端开发导航

本 Skill 是 `plus-ui-namewta` 的唯一项目级前端开发导航。MUST、Ratchet 与质量门禁由 `engineering-standards` 裁决；具体行为不明确时读取当前源码、包 README、`package.json` 和架构检查，不用摘要替代证据。

## 使用流程

1. 确认变更归属 `plus-ui-namewta/`，读取受影响包 README，并用源码确认真实入口。
2. 按主题加载引用：
   - 架构边界、依赖方向和当前 App 组合：[architecture.md](references/architecture.md)
   - 目录与命名：[naming-and-layout.md](references/naming-and-layout.md)
   - 新增领域能力或终端：[implementation.md](references/implementation.md)
   - 工具链与编码：[coding-style.md](references/coding-style.md)
   - 注释：[comments.md](references/comments.md)
   - 动态路由与权限：[permission-routing.md](references/permission-routing.md)
3. 先由后端 Maven 模块确定一级 domain，再由 Controller base path 确定 `src` 下的 kebab-case 资源目录。
4. 只从包 `exports` 公开入口导入；禁止深层导入、跨工作区相对导入和 App 互相导入。
5. App 在编译期显式选择 domain/web-domain；未选择、重复注册、未知组件或缺失依赖必须失败关闭。
6. 修改后先跑受影响包测试，再按工程规范运行适用的根级架构、lint、typecheck、test、E2E 和 build 门禁。

## 硬边界

- `apps/*` 拥有 ClientContext、布局、品牌、路由装配、运行时适配器和部署配置。
- `packages/domains/*` 不依赖 Vue、DOM、浏览器存储或具体请求实现。
- `packages/web-domains/*` 不拥有 App 布局、全局路由器、请求单例或后端授权。
- `platform` 只承载跨领域最小合同和组合运行时；`web-kit` 只承载已被多个真实消费者验证的 Web 机制。
- 后端是最终授权者；前端菜单、路由和按钮权限只负责当前 App 的投影、可见性与失败关闭。
- `client-web`、`mobile-web`、`miniapp-taro` 和 Taro 适配器在独立规格激活前保持 README-only。

## 当前仓库锚点

| 能力 | 源码路径 |
|---|---|
| Admin 入口与组合 | `apps/admin-web/src/main.ts`、`apps/admin-web/src/application/services.ts`、`apps/admin-web/src/router/adminManifestRegistry.ts` |
| 未来终端占位 | `apps/client-web/README.md`、`apps/mobile-web/README.md`、`apps/miniapp-taro/README.md`；当前无源码入口 |
| 动态菜单 | `apps/admin-web/src/permission.ts`、`apps/admin-web/src/store/modules/navigation.ts`、`apps/admin-web/src/router/adminManifestRegistry.ts`、`packages/platform/app-runtime` |
| 请求、会话与权限装配 | `apps/admin-web/src/application/http.ts`、`apps/admin-web/src/application/session.ts`、`apps/admin-web/src/application/access.ts` |
| 权限指令 | `packages/web-kit/permission`；Admin provider 装配在 `apps/admin-web/src/directive/index.ts` |
| 无界面业务 | `packages/domains/*/src/**` |
| Vue 领域表现 | `packages/web-domains/*/src/**` |
| 端口与组合运行时 | `packages/platform/*/src/**` |
| 浏览器适配器 | `packages/adapters/*/src/**` |
| 架构检查 | `tooling/architecture/src/**`、`tooling/architecture/baseline.json` |
| OpenAPI 合同 | `packages/api-contracts/**`、`tooling/openapi/**` |

当前标准 CRUD 静态模板资产位于父仓库 `docs/fm`，供 AI 与开发者参考实现。后端 `ruoyi-gen` 运行模块和前端 `gen` domain/web-domain 已从基座物理删除，不存在生成器页面、service 或 manifest 注册。
