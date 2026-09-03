---
name: plus-ui-frontend-conventions
description: 为 plus-ui-namewta 多 App monorepo 提供架构边界、领域资源纵切片、Vue/TypeScript 目录命名、App 显式组合、动态菜单路由和权限源码导航。处理 apps、domains、web-domains、platform、adapters、web-kit、OpenAPI、CRUD 页面、package exports、projectServerRoutes、addRoute、v-hasPermi、v-hasRoles 或新增终端时使用。
---

# plus-ui-namewta 前端开发导航

本 Skill 是 `plus-ui-namewta` 的唯一项目级前端开发导航。MUST、Ratchet 与质量门禁由 `engineering-standards` 裁决；具体行为不明确时读取当前源码、包 README、`package.json` 和架构检查，不用摘要替代证据。

## 使用流程

1. 确认变更归属 `plus-ui-namewta/`，先按父级 `engineering-standards` 读取适用规范，再读取受影响包 README、`package.json#exports`、相邻测试和 App 消费入口。
2. 先读取变更路径最近的 `AGENTS.md`。它只提供包/应用用途、组成、公开入口、验证命令和下一步索引；具体规范仍以本 Skill、父级工程规范和源码为准。根 `AGENTS.md` 适用于整个前端仓库，含 `package.json` 的工作区目录必须有自己的短索引，子目录规则优先于父目录。
3. 按主题加载引用：
   - 架构边界、依赖方向和当前 App 组合：[architecture.md](references/architecture.md)
   - 目录与命名：[naming-and-layout.md](references/naming-and-layout.md)
   - 新增领域能力或终端：[implementation.md](references/implementation.md)
   - 新增、迁移或审查 CRUD/Controller 资源：[crud-resource-slices.md](references/crud-resource-slices.md)
   - 工具链与编码：[coding-style.md](references/coding-style.md)
   - 注释：[comments.md](references/comments.md)
   - 动态路由与权限：[permission-routing.md](references/permission-routing.md)
4. 涉及前端 CRUD、树表、资源目录或 domain/web-domain 纵切片时，必须读取父仓库 `docs/fm/README.md`、`docs/fm/catalog.json`、`docs/fm/context-contract.md` 和相关 `docs/fm/vue/*.ftl`。模板是当前结构与合同基线，但同 owner、同形态的成熟源码及当前公开合同优先；发现模板滞后时同步修正模板，不能在业务代码中复制偏差。
5. 先由后端 Maven 模块确定一级 domain，再由实际消费的 Controller base path 确定 `src` 下的 kebab-case 资源目录；回调或没有前端消费者的接口不创建空资源目录。
6. 只从包 `exports` 公开入口导入；资源目录与 `package.json#exports` 同步，禁止深层导入、跨工作区相对导入和 App 互相导入。
7. App 在编译期同时显式选择服务、web-domain manifest 和工作区依赖。缺失 runtime/domain、未选择能力、重复 registration 或未知组件键必须失败关闭。
8. 修改后先跑受影响包测试，再按工程规范运行适用的根级架构、lint、typecheck、test、E2E 和 build 门禁。

## 硬边界

- `apps/*` 拥有 ClientContext、布局、品牌、路由装配、运行时适配器和部署配置。
- `packages/domains/*` 不依赖 Vue、DOM、浏览器存储或具体请求实现。
- `packages/web-domains/*` 不拥有 App 布局、全局路由器、请求单例或后端授权。
- `platform` 只承载跨领域最小合同和组合运行时；`web-kit` 只承载已被多个真实消费者验证的 Web 机制。
- `index.ts` 的“薄”按职责判断，不按行数判断：只做显式导出、资源元数据或 module/manifest 组合，不实现 HTTP、模型集合、页面状态或顶层副作用。
- 后端是最终授权者；前端菜单、路由和按钮权限只负责当前 App 的投影、可见性与失败关闭。
- `client-web`、`mobile-web`、`miniapp-taro` 和 Taro 适配器在独立规格激活前保持 README-only。
- 前端不套用后端 `Controller -> UseCase -> Service -> DAO -> Mapper` 五层；前端保持 `App -> web-domain -> domain -> platform`，`adapters` 和 `web-kit` 只能通过公开平台合同参与组合。
- `AGENTS.md` 是渐进式索引，不复制本 Skill 的完整规则。新增或移动含 `package.json` 的包时同步创建/更新短索引，并保持公开入口、README 和实际源码一致。

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
| 资源目录与 exports 检查 | `tooling/architecture/test/domain-layout.test.mjs` |
| 其他架构检查 | `tooling/architecture/src/**`、`tooling/architecture/baseline.json` |
| OpenAPI 合同 | `packages/api-contracts/**`、`tooling/openapi/**` |

当前标准 CRUD 静态模板资产位于父仓库 `docs/fm/vue`。它生成资源局部文件，不替代包根 `index.ts`、`package.json#exports`、包级 manifest/runtime 或 App 组合；这些集成点必须按当前源码显式完成。后端 `ruoyi-gen` 运行模块和前端 `gen` domain/web-domain 已从基座物理删除。
