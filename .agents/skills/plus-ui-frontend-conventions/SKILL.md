---
name: plus-ui-frontend-conventions
description: 为 plus-ui-namewta 多 App monorepo 提供目录命名、Vue/TypeScript 风格、Oxlint/Oxfmt、App 显式组合、动态菜单路由和权限源码地图。处理 apps、domains、web-domains、platform、adapters、web-kit、OpenAPI、filterAsyncRouter、addRoute、v-hasPermi、v-hasRoles 或新增终端时使用。
---

# plus-ui-namewta 前端约定地图

本 Skill 只描述当前前端仓库的真实结构和源码入口。MUST、Ratchet 与质量门禁由 `engineering-standards` 裁决；具体行为不明确时必须读取源码，不得用旧上游单体目录推断。

## 使用流程

1. 确认变更归属 `plus-ui-namewta/`，并读取受影响包 README。
2. 按主题加载引用：
   - 目录与命名：[naming-and-layout.md](references/naming-and-layout.md)
   - 工具链与编码：[coding-style.md](references/coding-style.md)
   - 注释：[comments.md](references/comments.md)
   - 动态路由与权限：[permission-routing.md](references/permission-routing.md)
3. 涉及新增领域、App 组合或移动端占位时，再读取前端仓库 `.codex/skills/plus-ui-domain-development/SKILL.md`。
4. 只从包 `exports` 公开入口导入；禁止深层导入、跨工作区相对导入和 App 互相导入。
5. 修改后先跑包级检查，再按工程规范运行根级架构、lint、typecheck、test 和 build。

## 当前仓库锚点

| 能力 | 源码路径 |
|---|---|
| Admin 入口与组合 | `apps/admin-web/src/main.ts`、`apps/admin-web/src/application/services.ts`、`apps/admin-web/src/router/adminManifestRegistry.ts` |
| Client 入口与组合 | `apps/client-web/src/main.ts`、`apps/client-web/src/composition.ts` |
| 动态菜单 | `apps/admin-web/src/permission.ts`、`apps/admin-web/src/application/services.ts`、`apps/admin-web/src/store/modules/permission.ts` |
| 请求、会话与权限装配 | `apps/admin-web/src/application/http.ts`、`apps/admin-web/src/application/session.ts`、`apps/admin-web/src/application/access.ts` |
| 权限指令 | `apps/admin-web/src/directive/permission/**` |
| 无界面业务 | `packages/domains/*/src/**` |
| Vue 领域表现 | `packages/web-domains/*/src/**` |
| 端口与组合运行时 | `packages/platform/*/src/**` |
| 浏览器适配器 | `packages/adapters/*/src/**` |
| 架构检查 | `tooling/architecture/src/**`、`tooling/architecture/baseline.json` |
| OpenAPI 合同 | `packages/api-contracts/**`、`tooling/openapi/**` |

后端代码生成能力归后端 `ruoyi-gen`；前端 `gen` domain/web-domain 只负责调用和呈现该能力。
