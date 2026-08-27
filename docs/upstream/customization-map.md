# NAMEWTA 上游能力映射

本地产品架构是合并目标，上游仓库是能力发现来源。评估 `6.X` 或 `6.X-Vue` 时，先说明上游增加或优化了什么能力，再把该能力映射到本地 app、domain、web-domain、platform、adapter、web-kit 或 tooling 边界；不得以恢复旧目录、复制同名文件或保持路径同构作为完成标准。

本文件是长期治理账本，不记录某次同步的临时工作树状态。当前同步指针见 [upstream-sync-state.json](./upstream-sync-state.json)，每次实际差异、冲突和结果保存在对应日期目录的 `state.json`、`diff_report.md` 与 `conflict_report.md`。

## 1. 决策流程

```text
upstream source
  -> capability observation
  -> local owner boundary
  -> invariant and security review
  -> adopt | adapt -> implementation -> verification -> completed
  -> reject -> rationale -> rejected
  -> defer -> owner + risk treatment + review trigger -> deferred -> re-triage
```

1. `source` 必须能定位到上游仓库、分支/tag 和 commit、PR、release note 或安全公告；本地基线记录必须写明本地 commit。
2. `capability` 描述行为、合同或风险修复，不写“同步某文件”。路径只能作为发现线索或 evidence。
3. `local_owner_boundary` 必须指向一个本地责任边界；跨边界能力要拆分记录或明确主 owner 与协作边界。
4. 先写必须保持的 `invariants`，再做 decision。上游实现与本地架构不一致时，优先 `adapt`。
5. 只有实际命令、测试、构建、人工审查或运行证据完成后才能写 `status=completed`。

## 2. 记录合同

每条记录必须包含以下字段，字段名是稳定合同：

| 字段 | 必填 | 合同 |
|---|---|---|
| `source` | 是 | 可定位的上游来源；baseline 可使用本地 commit，但必须明确标注 `baseline` |
| `capability` | 是 | 行为、接口、修复或维护能力，不是文件列表 |
| `priority` | 是 | `security-critical`、`high`、`normal`、`low` |
| `local_owner_boundary` | 是 | `apps/*`、`packages/domains/*`、`packages/web-domains/*`、`packages/platform/*`、`packages/adapters/*`、`packages/web-kit/*`、`tooling/*` 或后端模块 |
| `invariants` | 是 | 吸收后仍必须成立的本地合同和禁止项 |
| `decision` | 是 | `adopt`、`adapt`、`reject`、`defer` |
| `status` | 是 | `observed`、`triaged`、`planned`、`in-progress`、`blocked`、`deferred`、`completed`、`rejected` |
| `actual_verification` | 是 | 已执行的真实验证；未执行时写 `not-run` 和原因，不能写计划命令冒充结果 |
| `evidence` | 是 | commit、测试报告、Evidence、issue、PR 或同步报告的可追踪位置 |
| `issue_change` | 是 | 承载实现/风险接受的 issue、change 或 ticket；没有则显式写 `unassigned` |

### 完成与安全门禁

- `status=completed` 时，十个字段都必须非空，`actual_verification` 不得为 `not-run`，`evidence` 必须可定位到真实结果，`issue_change` 不得为 `unassigned`。
- `decision=reject` 必须写兼容性、产品边界或风险依据，最终状态使用 `rejected`。
- `decision=defer` 只允许使用 `status=deferred`，并必须写 owner、复审日期/触发条件和当前风险处置；`blocked` 表示尚不能完成决策或执行，不是 `defer` 的终态别名。
- `priority=security-critical` 不允许静默 `defer`。必须在同一记录中给出威胁影响、临时缓解、责任人、截止时间和追踪 issue/change；缺任一项即为 Gate 失败。
- source、owner、invariants 或 evidence 缺失的记录不能进入 `planned` 或 `completed`。

### 完整样例

| source | capability | priority | local_owner_boundary | invariants | decision | status | actual_verification | evidence | issue_change |
|---|---|---|---|---|---|---|---|---|---|
| `baseline: plus-ui main@22c10d2` | OpenAPI transport 漂移检查 | high | `tooling/openapi` + `packages/api-contracts` + `packages/domains/* mapper` | 生成 transport 不替代 domain model；source/provenance 原子激活；错误不泄露凭据 | adapt | completed | 30 workspace frozen install；OpenAPI 7/7；architecture 30/0 + 94/94；lint/type/unit；双 App build | [T-16 Evidence](../../speculo/.speculo/specdev/changes/2026-08-25-plus-ui-multi-app-domain-architecture/evidence/T-16.md) | `2026-08-25-plus-ui-multi-app-domain-architecture/T-16` |

### 无效样例

下面记录缺 source、owner、invariants、实际验证和 evidence，且把 `decision=defer` 错配为 `status=blocked`。它是反例，不能作为有效记录保存：

| source | capability | priority | local_owner_boundary | invariants | decision | status | actual_verification | evidence | issue_change |
|---|---|---|---|---|---|---|---|---|---|
| 缺失 | 修复认证漏洞 | security-critical | 缺失 | 缺失 | defer | blocked | not-run：无环境 | 缺失 | unassigned |

## 3. 本地边界索引

| 层级 | 本地 owner | 接收的上游能力 | 必须保持的边界 |
|---|---|---|---|
| App | `apps/admin-web`、`apps/client-web` | 布局、品牌、Client 选择、终端组合、宿主运行时 | App 显式选择 domain/web-domain；不同 Client 不共享会话、菜单或隐式注册 |
| Domain | `packages/domains/{identity-access,system-admin,workflow,demo,ai,devtools,operations}` | 后端 API、业务模型、use case、校验、权限元数据 | headless；不依赖 Vue/DOM/具体 adapter；generated transport 必须映射到 domain model |
| Web-domain | `packages/web-domains/{identity-access,system-admin,workflow,demo,ai,devtools,operations}` | 页面、交互、manifest、Web-only hooks/components/lang | 不拥有 App 布局/品牌；不 deep-import domain；浏览器副作用由 runtime port 注入 |
| Platform | `packages/platform/{contracts,auth,http,permission,app-runtime}` | 跨领域端口、认证协调、HTTP 错误、权限求值、manifest registry | 不反向依赖 domain/App；不实现 Axios、Router、DOM 或业务 endpoint |
| Adapter | `packages/adapters/{axios-browser,storage-browser,crypto-browser}` | 浏览器 HTTP、存储、加解密实现 | 只实现 platform port；不拥有业务规则；Taro adapter 未激活前保持 README-only |
| Web kit | `packages/web-kit/{design-tokens,shell-element,ui-element}` | 跨领域 Web 组件、壳层机制、设计 token | 不拥有领域流程、后端 API、App 品牌或路由选择 |
| Contracts | `packages/api-contracts` | 固定 OpenAPI 生成 transport | 不依赖 domain/App；生成物只读；source/provenance 可审计 |
| Tooling | `tooling/{architecture,openapi}` | 依赖边界 Ratchet、合同生成/漂移检查 | 工具不进入产品运行时；例外必须精确、可反向测试 |
| Terminal placeholders | `apps/{mobile-web,miniapp-taro}`、`packages/adapters/{taro-request,taro-storage}` | 未来移动端/小程序能力发现 | 当前 README-only、无 package manifest；激活必须另立 change 与终端 Gate |

## 4. 当前前端基线

以下记录描述 `plus-ui-namewta main@22c10d2` 的本地权威能力边界。它们是以后评估上游差异的目标，不要求上游路径与本地路径一致。

| source | capability | priority | local_owner_boundary | invariants | decision | status | actual_verification | evidence | issue_change |
|---|---|---|---|---|---|---|---|---|---|
| `baseline: main@22c10d2` | 双 App 组合与独立 Client 上下文 | high | `apps/admin-web`、`apps/client-web` | 显式选择 manifests；Client 会话/菜单隔离；根仓库只编排 workspace | adapt | completed | 双 App build；Playwright 47/47 | [T-15 Evidence](../../speculo/.speculo/specdev/changes/2026-08-25-plus-ui-multi-app-domain-architecture/evidence/T-15.md) | `2026-08-25-plus-ui-multi-app-domain-architecture/T-06,T-15` |
| `baseline: main@22c10d2` | 认证、注册、会话、动态路由与权限 | security-critical | `packages/domains/identity-access` + `packages/web-domains/identity-access` | Client context 严格 Boolean；401 单飞；菜单只信后端 Client 范围；无跨 Client fallback | adapt | completed | auth/router unit；多 Client/401 E2E | [T-07 Evidence](../../speculo/.speculo/specdev/changes/2026-08-25-plus-ui-multi-app-domain-architecture/evidence/T-07.md) | `2026-08-25-plus-ui-multi-app-domain-architecture/T-07` |
| `baseline: main@22c10d2` | 用户、Client、角色、菜单、组织与资源治理 | high | `packages/domains/system-admin` + `packages/web-domains/system-admin` | 跨域只走 public port；OSS URL 在 domain 校验；admin 显式选择、client 不选择 | adapt | completed | transport/manifest tests；双 App Gate | [T-10](../../speculo/.speculo/specdev/changes/2026-08-25-plus-ui-multi-app-domain-architecture/evidence/T-10.md)、[T-11](../../speculo/.speculo/specdev/changes/2026-08-25-plus-ui-multi-app-domain-architecture/evidence/T-11.md) | `2026-08-25-plus-ui-multi-app-domain-architecture/T-10,T-11` |
| `baseline: main@22c10d2` | 流程定义、任务、实例、请假与用户选择 | high | `packages/domains/workflow` + `packages/web-domains/workflow` | system user 只经 public query port；宿主上传/导航由 runtime 注入；任务 transport 字段级投影 | adapt | completed | workflow unit/API；Playwright 11/11；Gate H 47/47 | [T-09 Evidence](../../speculo/.speculo/specdev/changes/2026-08-25-plus-ui-multi-app-domain-architecture/evidence/T-09.md) | `2026-08-25-plus-ui-multi-app-domain-architecture/T-08,T-09` |
| `baseline: main@22c10d2` | Demo table/tree 领域试点 | normal | `packages/domains/demo` + `packages/web-domains/demo` | domain headless；manifest 显式注册；generated transport 投影 | adapt | completed | manifest/transport/unit；双 App build | [T-05 Evidence](../../speculo/.speculo/specdev/changes/2026-08-25-plus-ui-multi-app-domain-architecture/evidence/T-05.md) | `2026-08-25-plus-ui-multi-app-domain-architecture/T-05` |
| `baseline: main@22c10d2` | Snail AI 注册与嵌入聊天生命周期 | high | `packages/domains/ai` + `packages/web-domains/ai` | 不虚构已删除的流式协议；credential URL 清理；不记录 token/prompt | adapt | completed | lifecycle/security unit；双 App build | [T-12 Evidence](../../speculo/.speculo/specdev/changes/2026-08-25-plus-ui-multi-app-domain-architecture/evidence/T-12.md) | `2026-08-25-plus-ui-multi-app-domain-architecture/T-12` |
| `baseline: main@22c10d2` | 代码生成与开发工具 | high | `packages/domains/devtools` + `packages/web-domains/devtools` | 复用 system 公开合同；下载/ZIP 错误显式；client 不注册 | adapt | completed | unit/API；targeted 5/5；full E2E 47/47 | [T-13 Evidence](../../speculo/.speculo/specdev/changes/2026-08-25-plus-ui-multi-app-domain-architecture/evidence/T-13.md) | `2026-08-25-plus-ui-multi-app-domain-architecture/T-13` |
| `baseline: main@22c10d2` | 监控、日志、通知与外部运维入口 | security-critical | `packages/domains/operations` + `packages/web-domains/operations` | URL/权限 fail-closed；iframe/download 只消费批准 intent；client 不注册 | adapt | completed | URL/permission/API unit；strict unknown E2E；双 build | [T-14 Evidence](../../speculo/.speculo/specdev/changes/2026-08-25-plus-ui-multi-app-domain-architecture/evidence/T-14.md) | `2026-08-25-plus-ui-multi-app-domain-architecture/T-14` |
| `baseline: main@22c10d2` | 跨领域 auth/http/permission/manifest contracts | security-critical | `packages/platform/*` | 无 domain/App 反向依赖；无浏览器全局；权限不二次过滤服务端菜单 | adapt | completed | architecture 30/0 + 94/94；platform unit；Gate H E2E | [T-03](../../speculo/.speculo/specdev/changes/2026-08-25-plus-ui-multi-app-domain-architecture/evidence/T-03.md)、[T-15](../../speculo/.speculo/specdev/changes/2026-08-25-plus-ui-multi-app-domain-architecture/evidence/T-15.md) | `2026-08-25-plus-ui-multi-app-domain-architecture/T-03,T-04,T-07,T-15` |
| `baseline: main@22c10d2` | Axios、storage、crypto 浏览器实现 | security-critical | `packages/adapters/axios-browser`、`packages/adapters/storage-browser`、`packages/adapters/crypto-browser` | 只实现注入端口；namespace 隔离；密钥/credential 不进入日志；不承载业务规则 | adapt | completed | adapter unit/security；type/lint；双 App Gate | [T-04 Evidence](../../speculo/.speculo/specdev/changes/2026-08-25-plus-ui-multi-app-domain-architecture/evidence/T-04.md) | `2026-08-25-plus-ui-multi-app-domain-architecture/T-04,T-07` |
| `baseline: main@22c10d2` | 共享 Web shell、组件机制与设计 token | normal | `packages/web-kit/*` | App 保留品牌/布局选择；web-kit 不拥有业务、路由或 backend API | adapt | completed | component/unit；architecture；双 App visual/E2E | [T-06 Evidence](../../speculo/.speculo/specdev/changes/2026-08-25-plus-ui-multi-app-domain-architecture/evidence/T-06.md) | `2026-08-25-plus-ui-multi-app-domain-architecture/T-06,T-15` |
| `baseline: main@22c10d2` | workspace 边界 Ratchet 与 OpenAPI bundle drift | high | `tooling/architecture`、`tooling/openapi`、`packages/api-contracts` | 工具不进 runtime；例外精确；bundle 绑定 raw+provenance；domain model 不被生成物替代 | adapt | completed | OpenAPI 7/7；architecture 30/0 + 94/94；full Gate I | [T-16 Evidence](../../speculo/.speculo/specdev/changes/2026-08-25-plus-ui-multi-app-domain-architecture/evidence/T-16.md) | `2026-08-25-plus-ui-multi-app-domain-architecture/T-03,T-16` |

## 5. 后端协同基线

这些能力不是前端路径迁移目标，但任何认证、权限、动态路由或 API 上游变更都必须同时复核：

| source | capability | priority | local_owner_boundary | invariants | decision | status | actual_verification | evidence | issue_change |
|---|---|---|---|---|---|---|---|---|---|
| `baseline: backend product main` | Client 登录域、注册准入、Token 与会话 | security-critical | `ruoyi-admin` + `ruoyi-system` auth/session | 登录体 `clientId` 是 OAuth 字符串；Token `clientPk` 与 RBAC `clientId` 是 Long PK；五类登录策略都做 Client 准入；无 userId-only fallback | adapt | observed | not-run：T17 仅固化既有维护合同 | [latest sync report](./2026-08-24_current-upstream-merge-backfill/diff_report.md) | `unassigned` |
| `baseline: backend product main` | Client-scoped 角色、菜单与动态路由 | security-critical | `ruoyi-system` permission/menu | 超管也只查询当前 Client；缺 Client 上下文 fail-closed；默认角色运行时合并且不写 `sys_user_role` | adapt | observed | not-run：T17 不修改后端 | [latest sync report](./2026-08-24_current-upstream-merge-backfill/diff_report.md) | `unassigned` |
| `baseline: backend product main` | NAMEWTA 增量 SQL | high | `script/sql/namewta/{DDL.sql,DML.sql,README.md}` | 初始化顺序 `ry_vue.sql -> DDL.sql -> DML.sql`；两个本地 SQL 只末尾追加；不改上游 `ry_vue.sql` | adapt | observed | not-run：T17 不执行数据库迁移 | [latest sync report](./2026-08-24_current-upstream-merge-backfill/diff_report.md) | `unassigned` |

## 6. 每次上游评估

1. 只读更新镜像和同步报告，先从 release notes、commits 与 diff 提取 capability。
2. 在本文件新增记录或更新已有记录；不要恢复已退役的旧根 `src/**` 热点清单。
3. 按边界索引定位 owner，写 invariants、priority 和 decision。安全项先走安全门禁。
4. `adopt/adapt` 必须进入独立 issue/change；实现仍使用来源 worktree、双轴审查和候选集成。
5. 执行与风险相称的 architecture、lint、typecheck、unit、build、E2E 或后端测试，把真实结果写入 `actual_verification` 和 `evidence`。
6. 最后复核 completed 字段完整性；同步 SHA、冲突和报告仍写入日期目录，不把临时状态混入本账本。

分支模型保持：产品在 `main`；后端 `6.X`、前端 `6.X-Vue` 是只允许 fast-forward 的上游镜像；基线标签 `namewta-base-upstream-6x` / `namewta-base-upstream-6x-vue` 不移动。
