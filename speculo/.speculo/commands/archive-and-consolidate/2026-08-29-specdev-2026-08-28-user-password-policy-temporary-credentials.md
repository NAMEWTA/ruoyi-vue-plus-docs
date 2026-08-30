---
artifact: archive-and-consolidate-report
workflow: specdev
changes:
  - 2026-08-28-user-password-policy-temporary-credentials
mode: executed
scope: archive-single
confirmation: confirmed
verification: verified
created_at: 2026-08-29T09:17:03+08:00
updated_at: 2026-08-29T12:05:16+08:00
---

# Archive And Consolidate Dry-run：用户密码策略与临时凭据

## 路径上下文

| 名称 | 路径 |
|---|---|
| workflow root | `<Path>{roots.workflows}/specdev/</Path>` |
| state root | `<Path>{roots.state}/specdev/</Path>` |
| changes root | `<Path>{roots.state}/specdev/changes/</Path>` |
| archive root | `<Path>{roots.state}/specdev/archive/</Path>` |
| command report root | `<Path>{roots.state}/commands/archive-and-consolidate/</Path>` |
| permanent ADR store | `<Path>{roots.state}/specdev/adr/</Path>` |
| permanent context store | `<Path>{roots.state}/specdev/context/</Path>` |
| permanent research store | `<Path>{roots.state}/specdev/research/</Path>` |

## 完成与来源门审计

| 检查项 | 结果 | 证据 |
|---|---|---|
| Change 状态 | pass | `change_status: completed`，`completed_at: 2026-08-28T19:08:06+08:00`，blocker/deviation 均为 0 |
| Ticket 状态 | pass | T-01 至 T-08 全部 `done` |
| Required 集成 | pass | 8 条 source/candidate 均有 passed verification、applied promotion 和 result SHA |
| Worktree 生命周期 | pass | 8 条记录均为 `removed`；前后端各只剩 main worktree，相关 source/integration branch 为 0 |
| Git 祖先 | pass | 所有 Ticket source/candidate 是当前对应子仓 main 的祖先；父仓 result `ed5ebb9058d5ab461319b30f385887bbee0b9c6d` 是当前父仓 HEAD 的祖先 |
| Lead Evidence | pass | `<Path>{roots.state}/specdev/changes/2026-08-28-user-password-policy-temporary-credentials/evidence/</Path>` 含 T-01 至 T-08 共 8 份 Evidence |
| SpecDev 校验 | pass | triage 与 complete validator 均为 0 errors、0 warnings |
| 外部动作 | pass | 对话来源无远程 locator，`external_action: not-applicable` |
| 全局索引 | pass | change 唯一位于 active，不在 archived |
| 归档目标 | pass | 目标目录不存在，不会覆盖历史归档 |

归档前缺失的 conversation Source 与 reconcile Triage 已按当前用户请求补齐：

- `<Path>{roots.state}/specdev/changes/2026-08-28-user-password-policy-temporary-credentials/source.md</Path>`
- `<Path>{roots.state}/specdev/changes/2026-08-28-user-password-policy-temporary-credentials/triage.md</Path>`

该补正只冻结来源并明确远程关闭不适用，不改写产品完成事实。目标 change 已登记 `current_work: specdev/archive-and-consolidate`；另一个 active change 也处于 Archive Work，confirmed 执行前必须重新读取全局索引并做 drift 检查，不能覆盖或带入其状态。

## 阶段一：归档移动计划

| # | Change | 源 | 目标 | 文件/大小 | 状态 | 风险 |
|---|---|---|---|---|---|---|
| 1 | `2026-08-28-user-password-policy-temporary-credentials` | `<Path>{roots.state}/specdev/changes/2026-08-28-user-password-policy-temporary-credentials/</Path>` | `<Path>{roots.state}/specdev/archive/2026-08/2026-08-28-user-password-policy-temporary-credentials/</Path>` | 26 files / 322330 bytes | ready | medium：原子目录移动与两个状态文件改写 |

用户确认后固定执行以下动作：

1. 重新验证源、目标、全局索引、知识 store、Git worktree/branch 和本报告计划未漂移。
2. 原子移动整个 change 目录到上表归档目标，不复制后删除，不覆盖既有目录。
3. 在归档后的 `<Path>{roots.state}/specdev/archive/2026-08/2026-08-28-user-password-policy-temporary-credentials/.status.json</Path>` 写入 `change_status: archived`、`current_work: null`、`archived: true` 和 rooted `archive_path`，并把 `specdev/archive-and-consolidate` 去重加入 `works_run`。
4. 从 `<Path>{roots.state}/specdev/status.json</Path>` 的 active 数组只移除本 change，把名称去重追加到 archived；其他 active/archived 条目逐字保持。
5. 不创建 Git commit，不修改前后端代码或 submodule pointer，不清理其他 change，不执行 push、PR、部署、生产 DML 或角色授权。

## 阶段一：知识毕业与合并计划

当前永久 ADR 最大序号为 0017。Change 的 4 项 ADR 和 12 个领域术语均经过稳定机制、接手者必知与反毕业标准评估。

| 来源知识 | 毕业判定 | 目标 | 动作与理由 | 风险 |
|---|---|---|---|---|
| `<Path>{roots.state}/specdev/archive/2026-08/2026-08-28-user-password-policy-temporary-credentials/ADR.md</Path>` ADR-001 | stable mechanism / must-know | `<Path>{roots.state}/specdev/adr/0022-unified-password-policy-configuration.md</Path>` | create；统一策略由类型化 `sys_config` 对象承载，服务端校验并只公开非敏感投影；confirmed 执行时因并发序号协调落位 ADR-0022 | low |
| 同一工件 ADR-002 | stable mechanism / security-critical | `<Path>{roots.state}/specdev/adr/0023-redis-single-use-temporary-password.md</Path>` | create；临时密码只存不可逆校验值，60 秒 TTL，用户级覆盖并在成功认证时原子消费；confirmed 执行时落位 ADR-0023 | low |
| 同一工件 ADR-003 | surprising trade-off / must-know | `<Path>{roots.state}/specdev/adr/0024-ordinary-session-after-temporary-authentication.md</Path>` | create；临时凭据只替代认证阶段，成功后签发无特殊标记的普通 Client 会话；confirmed 执行时落位 ADR-0024 | low |
| 同一工件 ADR-004 | consistent existing decision | `<Path>{roots.state}/specdev/adr/0001-client-authorization-context.md</Path>` | append；新增 Client 作用域授权快照失效章节，明确角色/用户权限变化后的精确强制重新登录和跨 JVM 分层清理 | medium：追加现有永久 ADR，但与当前决定一致且无冲突 |
| `<Path>{roots.state}/specdev/changes/2026-08-28-user-password-policy-temporary-credentials/CONTEXT.md</Path>` | project-specific context / must-know | `<Path>{roots.state}/specdev/context/user-password-policy-temporary-credentials-terms.md</Path>` | create；提升密码强度、临时凭据、普通会话、重置候选、策略投影、存量兼容、独立权限及授权失效等 12 个当前术语 | low |

知识合并摘要：新建 ADR 3，append 现有 ADR 1，新建 context 1，research 0，冲突 0，needs-confirmation 0。

以下内容保留为 ephemeral，只随 change 归档，不提升：

- Ticket 级实现顺序、候选尝试、提交祖先补正过程和 worktree 清理审计；它们是可追溯历史，不是永久架构合同。
- 测试数量、当前 SHA、OpenAPI 快照 hash、DML 前缀 hash 和临时环境命令；它们属于 Evidence 固定点。
- 生产发布步骤、补偿脚本和迁移矩阵细节；当前权威已位于 `<Path>ruoyi-vue-plus-namewta/script/sql/namewta/README.md</Path>` 与 `<Path>docs/upstream/customization-map.md</Path>`，不在永久知识 store 复制第二份正文。

## 阶段二：知识清理候选

| 路径/集合 | 分类 | 数量 | 理由 | 计划动作 |
|---|---|---:|---|---|
| `<Path>{roots.state}/specdev/adr/</Path>` 现有 ADR-0001 至 ADR-0017 | keep | 17 | 均不足 30 天且仍为当前决定或被代码、文档、active/archive 引用 | 无 |
| `<Path>{roots.state}/specdev/context/</Path>` 现有术语文件 | keep | 3 | OSS/通知、多 App 架构和系统运行日志术语仍为当前知识 | 无 |
| `<Path>{roots.state}/specdev/research/.gitkeep</Path>` | keep | 1 | research store 为空，保留占位 | 无 |
| 本次计划新建的 ADR/context | keep | 4 | 新毕业的当前安全与认证知识 | 创建后保留 |

清理摘要：delete 0，merge 0，rewrite 0，needs-confirmation 0，现有 keep 21，计划新建 keep 4。不会删除、合并或改写任何其他知识文件。

## 当前 Git 与验证固定点

- 本 change 前端 result：`8aa184b353c5a37ee555feb8be808fe9ba885297`；当前 `<Path>plus-ui-namewta/</Path>` main 为 `f0ea5706362af7a69f2af9ad8edb8f38ba49f081`，祖先检查通过。
- 本 change 后端 result：`42e06c0f713e0d724813800505e5bb5b40ab563b`；当前 `<Path>ruoyi-vue-plus-namewta/</Path>` main 为 `8d401907b6be81c36f92cf88e73e1dee61fd26a4`，全部 source/candidate 祖先检查通过。
- 父仓记录本 change 双 gitlink 的 result：`ed5ebb9058d5ab461319b30f385887bbee0b9c6d`；当前父仓 HEAD 为 `67000ae7c37f41dada3a825b6e4c3712423e1dc6`，祖先检查通过。
- 最终 Evidence 记录 backend 190 tests、full/core package、真实 MySQL/Redis，frontend OpenAPI/architecture/lint/type/test/dev+prod build 与 48/48 Playwright 均通过。
- 本次归档审计没有在当前 dirty 产品工作树重跑全量产品测试；归档判断依赖不可变 result、祖先关系、Lead Evidence 和重新通过的 SpecDev triage/complete validator。父仓与两个子仓的其他 dirty 内容属于并行工作，不纳入本计划。

## Dry-run 摘要与确认边界

- 待归档 change：1，ready 1，blocked 0。
- 待提升知识：新建 4 个文件、append 1 个现有 ADR。
- 待清理动作：0；语义冲突：0。
- 破坏性动作：1 个 change 目录移动，以及全局/归档状态改写。
- Archive dry-run 未移动源目录、未创建归档目标、未写入永久知识、未执行清理或任何 Git/远程/生产动作；只完成了前置 conversation Source/Triage 补正、Archive current_work 登记和本报告持久化。
- **此为 dry-run 计划。只有用户明确确认这份具体计划后，才能以 `confirmed` 模式执行；初始归档请求不替代该确认。**

建议确认语句：`确认执行该 dry-run 归档计划`。

## 执行后补遗：并发 ADR 序号碰撞

### 确认与已完成动作

- **确认来源：** 用户于 2026-08-29 明确回复“执行”，批准上述 dry-run 计划。
- **执行时间：** 2026-08-29T11:56:12+08:00 起。
- Change 已从 `<Path>{roots.state}/specdev/changes/2026-08-28-user-password-policy-temporary-credentials/</Path>` 原子移动到 `<Path>{roots.state}/specdev/archive/2026-08/2026-08-28-user-password-policy-temporary-credentials/</Path>`；源已不存在，目标保留 26 个文件。
- 归档 `<Path>{roots.state}/specdev/archive/2026-08/2026-08-28-user-password-policy-temporary-credentials/.status.json</Path>` 已是 `change_status: archived`、`archived: true`、`current_work: null`，并记录 `specdev/archive-and-consolidate`。
- `<Path>{roots.state}/specdev/status.json</Path>` 已从 active 移除本 change，并在 archived 中唯一追加；active/archived 无交集。
- `<Path>{roots.state}/specdev/adr/0001-client-authorization-context.md</Path>` 已按计划追加 Client-scoped Authorization Snapshot Invalidation。
- `<Path>{roots.state}/specdev/context/user-password-policy-temporary-credentials-terms.md</Path>` 已按完整来源创建。源 CONTEXT 实际有 13 个术语，dry-run 中“12 个”是计数错误；提升范围始终是完整 CONTEXT，没有增加目标或来源。
- 未执行任何知识删除、Git commit/push、PR、远程写入、部署、生产 DML 或角色授权。

### Drift 与当前阻塞

Confirmed preflight 时永久 ADR 最大序号为 0017，计划目标均不存在。归档执行期间，另外两个已确认的 Archive Work 并发写入同一永久 ADR store：

| 序号 | 当前文件 | 来源 |
|---|---|---|
| 0018 | `<Path>{roots.state}/specdev/adr/0018-static-crud-templates-over-runtime-generator.md</Path>` | runtime generator retirement；最早写入 |
| 0018 | 历史冲突文件名 `0018-vue-web-permission-host.md` | shared navigation/permission runtime |
| 0018 | 历史冲突文件名 `0018-unified-password-policy-configuration.md` | 本 change |
| 0019 | 历史冲突文件名 `0019-app-owned-navigation-and-shared-menu-runtime.md` | shared navigation/permission runtime |
| 0019 | 历史冲突文件名 `0019-redis-single-use-temporary-password.md` | 本 change |
| 0020 | 历史冲突文件名 `0020-manifest-only-dynamic-page-resolution.md` | shared navigation/permission runtime |
| 0020 | 历史冲突文件名 `0020-ordinary-session-after-temporary-authentication.md` | 本 change |

没有文件被覆盖或删除，但 ADR 序号不再唯一。根据 Archive drift 合同，永久知识验证为 `blocked`，不能把本次执行误报为完全 verified。

### 建议的确定性修订计划

按各 Archive 的实际执行顺序保留最早写入的 generator ADR-0018，并对随后两组文件执行纯序号协调；正文决定与来源不变：

| 当前路径 | 修订目标 | 附带修改 |
|---|---|---|
| 原文件名 `0018-vue-web-permission-host.md` | `<Path>{roots.state}/specdev/adr/0019-vue-web-permission-host.md</Path>` | 标题 ADR-0018 -> ADR-0019 |
| 原文件名 `0019-app-owned-navigation-and-shared-menu-runtime.md` | `<Path>{roots.state}/specdev/adr/0020-app-owned-navigation-and-shared-menu-runtime.md</Path>` | 标题 ADR-0019 -> ADR-0020 |
| 原文件名 `0020-manifest-only-dynamic-page-resolution.md` | `<Path>{roots.state}/specdev/adr/0021-manifest-only-dynamic-page-resolution.md</Path>` | 标题 ADR-0020 -> ADR-0021 |
| 原文件名 `0018-unified-password-policy-configuration.md` | `<Path>{roots.state}/specdev/adr/0022-unified-password-policy-configuration.md</Path>` | 标题 ADR-0018 -> ADR-0022 |
| 原文件名 `0019-redis-single-use-temporary-password.md` | `<Path>{roots.state}/specdev/adr/0023-redis-single-use-temporary-password.md</Path>` | 标题 ADR-0019 -> ADR-0023 |
| 原文件名 `0020-ordinary-session-after-temporary-authentication.md` | `<Path>{roots.state}/specdev/adr/0024-ordinary-session-after-temporary-authentication.md</Path>` | 标题 ADR-0020 -> ADR-0024 |

该修订会修改另一个已归档 change 生成的 3 个知识文件，超出原 dry-run 的单 change 路径范围，因此需要独立确认。确认前不会执行这些 rename 或标题更新。

### 当前验证

- 归档后 `--stage complete` 按 validator 合同拒绝 `change_status: archived`：1 个预期 error、1 个归档位置 warning。
- 归档路径适用的 `--stage implement`：0 errors、1 个预期归档位置 warning。
- SpecDev package self-check：0 errors、0 warnings。
- 前端、后端和父仓结果祖先检查仍通过；两个子仓均只有 main worktree，相关 source/integration branch 为 0。
- JSON 解析、源/目标、归档状态、全局索引、13 项 context 对照和 `git diff --check` 均通过。
- **Verification verdict：blocked，仅剩上述永久 ADR 序号碰撞。**

## ADR 序号冲突修订执行

- **确认来源：** 用户于 2026-08-29 明确回复“确认执行”，批准上述 6 个文件的序号协调计划。
- **执行时间：** 2026-08-29T12:04:24+08:00 至 2026-08-29T12:05:16+08:00。
- 保留最早写入的 `<Path>{roots.state}/specdev/adr/0018-static-crud-templates-over-runtime-generator.md</Path>`；其余 6 个文件严格按修订表重命名并同步首行标题，正文、来源和日期未改。
- 当前永久 ADR-0001 至 ADR-0024 每个序号恰好一份；ADR-0018 至 ADR-0024 的文件名序号与首行标题全部一致，6 个旧冲突路径均不存在。
- 本 change 最终毕业 ADR：
  - `<Path>{roots.state}/specdev/adr/0022-unified-password-policy-configuration.md</Path>`，SHA-256 `bea6bc938a61b33aa5cca5096f7816b246105dc40e17c4a77b6d14b8cb0f5a31`
  - `<Path>{roots.state}/specdev/adr/0023-redis-single-use-temporary-password.md</Path>`，SHA-256 `e6a7e8de21a540720a3c13b768a620659d41ce0dd363de84c58bc455c8cec2c3`
  - `<Path>{roots.state}/specdev/adr/0024-ordinary-session-after-temporary-authentication.md</Path>`，SHA-256 `f0ddd1c2fad133eaa3d3924b15e4eb1f3a01cf0c37e3d65387264e09a093c8b6`
- 本 change 的永久 context 为 `<Path>{roots.state}/specdev/context/user-password-policy-temporary-credentials-terms.md</Path>`，SHA-256 `69f86f25a72fb6f466e76d904289d8b92229d5afcee07bfc62b457e9701a8cb7`。
- 归档内容摘要保持 `783d0e5fa8e9a22083e78ef6f87b7fc8428edf1244f0298dd26078af62575275`；没有修改归档正文来适配永久 ADR 序号。
- **Verification verdict：verified。并发 ADR 序号碰撞已消除，没有剩余 Archive blocker。**
