---
artifact: archive-and-consolidate-report
workflow: specdev
changes:
  - 2026-08-25-plus-ui-multi-app-domain-architecture
  - 2026-08-26-current-log-system-eli5
  - 2026-08-27-plus-ui-backend-aligned-domains
mode: executed
scope: archive-batch
confirmation: confirmed
created_at: 2026-08-28T09:34:56+08:00
updated_at: 2026-08-28T09:51:07+08:00
---

# Archive And Consolidate 执行报告

## 路径上下文

| 名称 | 路径 |
|---|---|
| workflow root | `<Path>{roots.workflows}/specdev/</Path>` |
| state root | `<Path>{roots.state}/specdev/</Path>` |
| changes root | `<Path>{roots.state}/specdev/changes/</Path>` |
| archive root | `<Path>{roots.state}/specdev/archive/</Path>` |
| command report root | `<Path>{roots.state}/commands/archive-and-consolidate/</Path>` |

## 归档前整改结果

| Change | 原状态 | 整改与最终证据 | 最终判定 |
|---|---|---|---|
| `2026-08-25-plus-ui-multi-app-domain-architecture` | completed，但缺 source/triage 且历史停止 deviation 仍标 blocked | 补齐 conversation source 和 reconcile triage；将 `DEV-T13-005` 按后续用户授权及成功的 `DEV-T13-006` 归一为 approved | complete validator 0 error / 0 warning |
| `2026-08-26-current-log-system-eli5` | blocked；Ticket ready；全量 test、clean full/core package 未闭合 | 接受已发布合并 checkpoint 偏差；修复 reactor Surefire JUnit engine；41 模块 clean test、full/core package 和两类 bundle verify 通过；补齐三份九段 Evidence | completed；complete validator 0 error / 0 warning |
| `2026-08-27-plus-ui-backend-aligned-domains` | completed，但缺 source/triage | 补齐 conversation source 和 reconcile triage；确认当前前端 `main` 包含 result | complete validator 0 error / 0 warning |

后端整改提交为 `f88012eae14374bb6f59b0389e3e937345ccde7e`，本地 backend `main` 比 `origin/main` ahead 1。此 dry-run 与后续归档计划不包含 push；远程动作对三项 source 均为 `not-applicable`。

## 阶段一：归档移动

| # | Change | 源 | 目标 | 文件/大小 | 状态 | 风险 |
|---|---|---|---|---|---|---|
| 1 | `2026-08-25-plus-ui-multi-app-domain-architecture` | `<Path>{roots.state}/specdev/changes/2026-08-25-plus-ui-multi-app-domain-architecture/</Path>` | `<Path>{roots.state}/specdev/archive/2026-08/2026-08-25-plus-ui-multi-app-domain-architecture/</Path>` | 48 files / 712 KiB | ready | medium：原子目录移动与索引改写 |
| 2 | `2026-08-26-current-log-system-eli5` | `<Path>{roots.state}/specdev/changes/2026-08-26-current-log-system-eli5/</Path>` | `<Path>{roots.state}/specdev/archive/2026-08/2026-08-26-current-log-system-eli5/</Path>` | 21 files / 272 KiB | ready | medium：原子目录移动与索引改写 |
| 3 | `2026-08-27-plus-ui-backend-aligned-domains` | `<Path>{roots.state}/specdev/changes/2026-08-27-plus-ui-backend-aligned-domains/</Path>` | `<Path>{roots.state}/specdev/archive/2026-08/2026-08-27-plus-ui-backend-aligned-domains/</Path>` | 8 files / 52 KiB | ready | medium：原子目录移动与索引改写 |

共同预检：三个源目录存在，三个目标目录均不存在；change 均为 completed、`completed_at` 非空、blocker 为 0、未批准 deviation 为 0、未集成 worktree 为 0；全局 active/archived 各自唯一且无重叠；`external_action: not-applicable`。

确认后的精确动作：

1. 按表中顺序把三个 change 原子移动到 `archive/2026-08/`。
2. 在每个归档 `.status.json` 写入 `change_status: archived`、`current_work: null`、`archived: true` 和对应 rooted `archive_path`；把 `specdev/archive-and-consolidate` 去重加入 `works_run`。
3. 从全局 `active` 移除三个 change，只把名称去重追加到 `archived`；其他 active/archived 项保持不变。
4. 不删除或清理 plus-ui source branch/worktree；实际 worktree 清单仅有当前 `main`，相关 source branch 已不存在。

## 阶段一：知识毕业与合并

现有最大永久 ADR 序号为 0011。以下目标名与动作在确认后固定执行：

| 来源知识 | 判定 | 目标 | 动作与理由 |
|---|---|---|---|
| 2026-08-25 ADR-001 | stable mechanism | `adr/0012-compile-time-modular-monorepo.md` | create；多 App 使用 pnpm 编译期模块化单体而非微前端/多仓复制 |
| 2026-08-25 ADR-002 | stable mechanism | `adr/0013-cross-terminal-domain-and-web-domain-separation.md` | create；跨终端无头领域与 Vue Web 表现层保持依赖方向 |
| 2026-08-27 Spec DEC-001..005，取代 2026-08-25 ADR-003 | current stable mechanism | `adr/0014-backend-module-aligned-frontend-domains.md` | create；一后端模块一 domain 包、一 Controller HTTP 资源一包内目录；旧能力领域决定仅保留历史 |
| 2026-08-25 ADR-004 | stable mechanism | `adr/0015-web-domain-manifest-routing.md` | create；App 显式选择 WebDomainManifest，component key 是业务键而非物理路径 |
| 2026-08-25 ADR-005 | consistent existing decision | `adr/0001-client-authorization-context.md` | append；补充共享认证核心由 App 注入 ClientContext/Navigation/终端适配器，非法 Client fail-close，不重写既有内容 |
| 2026-08-25 ADR-007 | handoff-critical | `adr/0016-selective-upstream-capability-adoption.md` | create；产品 main 以本地多 App 架构为权威，上游按能力映射选择性吸收 |
| 2026-08-26 ADR-001 | surprising security trade-off | `adr/0017-raw-http-credential-runtime-logging.md` | create；专用 HTTP logger 在 1 MiB 和媒体排除边界内原样持久化凭证，例外不得外扩 |
| 两项前端 change 的当前术语 | project-specific context | `context/plus-ui-multi-app-architecture-terms.md` | create；写入 App、Client Context、Platform Kernel、Runtime Adapter、当前 Domain/Web Domain、Controller Resource、Web Shell、Composition、Manifest、Public Entry、Source-first、Placeholder、Selective Upstream Adoption 等定义 |
| 2026-08-26 CONTEXT | project-specific context | `context/system-runtime-log-terms.md` | create；写入 System Runtime Log、HTTP Exchange Pair、Filter-observed Payload、Single Runtime Log、Synchronous Write、Loggable Payload 等定义 |

跳过项：

- 2026-08-25 ADR-003 不作为现行 ADR 提升；其“前端能力可跨多个后端模块”决定已被 2026-08-27 的后端模块一级对齐取代，历史原文随 change 归档。
- 2026-08-25 ADR-006 兼容入口渐进迁移已完成且兼容入口已删除，属于过渡机制，只留归档历史。
- MapStruct 瞬时生成损坏、MySQL 不可用重复探针、候选尝试过程与 Maven 命令故障属于交付过程，不提升。
- 不创建 research 条目；当前事实已由 ADR、context、工程 Skill 和归档 Evidence 承载。

毕业摘要：新建 ADR 6，现有 ADR append 1，新建 context 2，冲突 0，needs-confirmation 0。

## 阶段二：清理候选

| 路径/集合 | 分类 | 理由 | 动作 |
|---|---|---|---|
| 现有 `adr/0001`..`0011` | keep | 均创建于 2026-08-24，未满 30 天且仍被代码、文档或 archive 引用 | 无 |
| `context/oss-direct-notification-terms.md` | keep | 仍是 OSS/通知领域当前词汇表 | 无 |
| `research/.gitkeep` | keep | research store 仍为空，需要占位 | 无 |
| 计划新建 ADR/context | keep | 新毕业的当前架构和领域知识 | 无 |

清理摘要：delete 0，merge 0，rewrite 0，needs-confirmation 0，keep 14 个现有项及 8 个计划新项。不会删除任何知识文件。

## 执行前摘要与确认边界

- 待归档 change：3，ready 3，blocked 0。
- 待提升知识：新建 8 个文件、append 1 个现有 ADR；待清理动作 0；冲突 0。
- 破坏性动作是三个 change 目录移动和全局/归档状态改写；永久知识写入均为 create/append，不覆盖现有内容。
- 不执行 Git push、PR、远程 merge、部署、发布、source branch/worktree cleanup 或生产日志操作。
- **执行前状态记录：当时仅写入 dry-run 报告，尚未移动源目录、创建永久知识或执行清理，并要求独立确认。**

## 执行后补遗

### 确认与执行

- 确认来源：用户于 2026-08-28 明确回复“确认执行该 dry-run 归档计划”。
- 执行时间：2026-08-28T09:51:07+08:00。
- 三个 change 已按计划移动至 `speculo/.speculo/specdev/archive/2026-08/`；原始 change 路径均已不存在。
- 归档目录文件数保持不变：架构 change 48 个、日志 change 21 个、后端对齐 change 8 个。
- 三个归档 `.status.json` 均已更新为 `change_status: archived`、`archived: true`，并记录归档路径和 `specdev/archive-and-consolidate`。
- 全局 `specdev/status.json` 已从 active 移除三项并加入 archived，active/archived 无重复、无交集。

### 知识沉淀

- 新增 6 个 ADR：`0012` 至 `0017`。
- 在 `0001-client-authorization-context.md` 追加 Multi-App Assembly 决策。
- 新增 2 个 context：plus-ui 多 App 架构术语、系统运行日志术语。
- 按 dry-run 计划未执行知识删除、合并或重写；`research/.gitkeep` 保留。

### 执行后验证

- 移动前对三个 change 执行 `--stage complete`：均为 0 errors、0 warnings。
- 移动后按实际代码仓库执行 `--stage implement`（两个前端 change 使用 `plus-ui-namewta`，日志 change 使用 `ruoyi-vue-plus-namewta`）：均为 0 errors、1 warning；唯一 warning 为归档目录就地验证的位置提示，属于预期行为。
- 归档后的 `.status.json` 已是 `archived`，因此 `--stage complete` 不再适用；`--stage review` 要求 CR 报告。本次未虚构 CR 报告，采用归档状态可适用的最高验证阶段 `implement`。
- `validate-specdev.mjs --self-check`：0 errors、0 warnings。
- JSON 解析、全局状态一致性、源/目标目录、文件计数、永久知识文件非空和 `git diff --check` 均通过。
- 执行后归档内容摘要：
  - `2026-08-25-plus-ui-multi-app-domain-architecture`: `c9429a267f16b27572a92391a53290e49bb2a656f49742726a62339f8646aec6`
  - `2026-08-26-current-log-system-eli5`: `98cfe4660ef666f7e1d02bcbdeeef788fc9e38871a08223dddd4507fdfcd38c7`
  - `2026-08-27-plus-ui-backend-aligned-domains`: `ce81d5900bf463edb2625d32ebbcaa96350da7d135183f0697c28a9a9cb6ecb7`
- 最终结论：归档内容完整，状态一致，永久知识落盘完成，未发现不一致项。

### 未执行项

- 未执行 push、部署或其他远端操作。
- 后端修复提交 `f88012eae14374bb6f59b0389e3e937345ccde7e` 保留在本地 `main`，相对 `origin/main` ahead 1。
