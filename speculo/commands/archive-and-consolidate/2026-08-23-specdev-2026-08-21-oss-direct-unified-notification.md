# Archive And Consolidate Dry-Run

> 生成时间：2026-08-23 13:13 +0800
> Workflow：specdev
> 模式：archive-single / dry-run
> Change：2026-08-21-oss-direct-unified-notification

## Path Context

| 名称 | 路径 |
|---|---|
| project_root | `<Path>.</Path>` |
| workflow_root | `<Path>{roots.workflows}/specdev</Path>` |
| state_root | `<Path>{roots.state}/specdev</Path>` |
| changes_root | `<Path>{roots.state}/specdev/changes</Path>` |
| archive_root | `<Path>{roots.state}/specdev/archive</Path>` |
| commands_root | `<Path>{roots.commands}</Path>` |

永久知识 stores：`<Path>{roots.state}/specdev/adr</Path>`、`<Path>{roots.state}/specdev/context</Path>`、`<Path>{roots.state}/specdev/research</Path>`；三者均存在，当前只含 `.gitkeep`。

## Archive Plan

### 预检摘要

| 检查项 | 状态 | 证据 |
|---|---|---|
| changes_root / archive_root 可访问且真实路径未逃逸 | pass | 两者均位于 project root 的 SpecDev state root 内 |
| change 名称 | pass | 符合 `YYYY-MM-DD-kebab-topic` |
| change `.status.json` | pass | 可解析；`change_status=completed`、`completed_at=2026-08-23T11:19:24+08:00`、无 blocker |
| 完成合同 | pass | 22 个 Ticket 均 done；22 条 worktree 记录均 integrated/passed；全部 deviation approved |
| complete validator | pass | `validate-specdev.mjs --stage complete`：0 error / 0 warning |
| 目标目录 | pass | `<Path>{roots.state}/specdev/archive/2026-08/2026-08-21-oss-direct-unified-notification</Path>` 不存在 |
| 全局 active 索引一致性 | **blocked** | completed change 已提前从 `status.json#active` 移除，违反 archive precheck 的“移动前仍唯一在 active”合同 |
| external reconcile gate | **blocked** | change 不存在 `triage.md/source.md`，无法从权威字段确认 `external_action=closed|waived|not-applicable` |
| 候选 / 通过 / 阻塞 | 1 / 0 / 1 | archive-single 原子预检未关闭 |

### 逐项归档计划

| # | Change | 源路径 | 目标路径 | 状态 | 备注 |
|---|---|---|---|---|---|
| 1 | `2026-08-21-oss-direct-unified-notification` | `<Path>{roots.state}/specdev/changes/2026-08-21-oss-direct-unified-notification</Path>` | `<Path>{roots.state}/specdev/archive/2026-08/2026-08-21-oss-direct-unified-notification</Path>` | blocked | 先关闭两项状态门；源含 57 个工件文件，移动必须整体原子完成 |

### 确认后先执行的状态修复

1. 根据用户确认，将本地对话/路径输入记录为本地来源，补齐 `source.md` 与 `triage.md`，令 `external_action=not-applicable`；若实际存在远程 Issue/PR，则停止并改走 T-triage reconcile。
2. 修复全局索引：将该 completed change 以唯一条目恢复到 `status.json#active`，重跑 archive precheck；不改变 change 的 `completed` 状态。
3. 预检通过后才执行移动。移动后从 `active` 移除、去重追加到 `archived`，并将归档 `.status.json` 更新为 `change_status=archived`、`archived=true`、`archive_path=<Path>{roots.state}/specdev/archive/2026-08/2026-08-21-oss-direct-unified-notification</Path>`。

上述修复与移动均是待确认写操作；本次 dry-run 未执行。

## Consolidation Plan

扫描知识产物：change `ADR.md`、`CONTEXT.md`、`LOG.md`、Spec、Goal Plan、22 个 Ticket、24 个 Evidence 文件、CR-001 与架构审查。现有永久 ADR/context 无正文，因此无序号、定义或 supersede 冲突。

### 提取摘要

| 目标 Store | 新建 | 合并 | 冲突 | 跳过 |
|---|---:|---:|---:|---:|
| `adr/` | 10 | 0 | 0 | 0 |
| `context/` | 1 个文件 / 23 个术语 | 0 | 0 | 0 |
| `research/` | 0 | 0 | 0 | 1 类 |

### ADR 提升

| 目标 | 来源 | 内容摘要 | 毕业判定 |
|---|---|---|---|
| `<Path>{roots.state}/specdev/adr/0001-client-authorization-context.md</Path>` | change ADR-001 | Client/userType 是认证授权上下文，不是 tenant 或业务数据分区 | stable-mechanism / must-know |
| `<Path>{roots.state}/specdev/adr/0002-oss-control-data-plane-separation.md</Path>` | change ADR-002 | 后端只拥有控制面，浏览器经预签名 URL 直连 OSS 数据面 | stable-mechanism / must-know |
| `<Path>{roots.state}/specdev/adr/0003-redis-upload-ticket-and-cleanup.md</Path>` | change ADR-003 | Redis UploadTicket、Multipart 续传、应用主动 Abort 与 Bucket Lifecycle 兜底 | stable-mechanism |
| `<Path>{roots.state}/specdev/adr/0004-static-named-upload-policy.md</Path>` | change ADR-004 | 服务端命名上传策略是直传安全边界，客户端限制不可信 | stable-mechanism / must-know |
| `<Path>{roots.state}/specdev/adr/0005-oss-temp-and-business-references.md</Path>` | change ADR-005 | TEMP 对象、真实表主键引用、多引用删除保护与两阶段清理 | stable-mechanism / must-know |
| `<Path>{roots.state}/specdev/adr/0006-thin-common-notify-contract.md</Path>` | change ADR-006 | common-notify 只承载渠道契约/SPI，原子 Adapter 保留且 common 不反向依赖 system | stable-mechanism |
| `<Path>{roots.state}/specdev/adr/0007-sync-notify-and-redis-idempotency.md</Path>` | change ADR-007 | Provider 同步发送、typed partial failure 与可选 Redis 幂等 | stable-mechanism |
| `<Path>{roots.state}/specdev/adr/0008-best-effort-notification-monitoring.md</Path>` | change ADR-008 | Event 只做 best-effort 全局监控；敏感通知强制最小化审计 | stable-mechanism / must-know |
| `<Path>{roots.state}/specdev/adr/0009-pre-send-attachment-snapshot.md</Path>` | change ADR-009 | Provider 调用前复制通知附件快照，并绑定真实 notify log 主键 | stable-mechanism |
| `<Path>{roots.state}/specdev/adr/0010-business-owned-oss-reference-lifecycle.md</Path>` | change ADR-010 | Business OSS Owner 同事务 fail-closed，显式 manifest/合同测试只作交付 ratchet | stable-mechanism / must-know |

每个文件将采用永久 ADR 格式（Accepted、日期、上下文、决定、后果）并标注来源 change；不创建重复 LOG 提升项，不 supersede 现有 ADR。

### Context 提升

目标文件：`<Path>{roots.state}/specdev/context/oss-direct-notification-terms.md</Path>`，动作 `create`。

计划合并 23 个项目专有术语：Platform Client、Client Authorization、Client Identifier、UserType Login Domain、OSS Control Plane、OSS Data Plane、UploadTicket、Upload Policy、Temporary OSS Object、OSS Business Reference、Global OSS Metadata、Business OSS Owner、Notify Channel、Notify Provider、Physical Target、Notify Delivery Exception、Notification Idempotency Key、Notify Context Resolver、Notification Log、Delivery Log、Notification Client Audit、Notification Monitor、Notification Attachment Snapshot。

定义与 `_Avoid_` 直接取自 change `CONTEXT.md`，标注来源 change 与日期。毕业理由为 stable-mechanism/must-know；永久 context 当前为空，无定义冲突。

### Ephemeral

| 知识项 | 处理 | 理由 |
|---|---|---|
| 64 条设计访谈 LOG、design tree、question history | 随 change 归档 | 决策过程已由 10 个 ADR 去重提炼 |
| Spec、Ticket、Map、Goal Plan、Evidence、CR-001、architecture review | 随 change 归档 | 属于本 change 的合同、实现与审计历史，脱离 change 提升会重复权威知识 |
| 具体 commit SHA、测试数量、临时偏差与校验器限制 | 随 change 归档 | 单次交付证据，不是长期领域机制 |
| 发布前 SQL/Bucket/Provider/浏览器验收条件 | 随 change 归档并保留 | 是尚未获授权的发布边界，不能改写为已完成长期事实 |
| research store | 无写入 | change 没有独立、经验证且跨 change 有用的研究产物 |

## Cleanup Candidates

| 分类 | 数量 |
|---|---:|
| delete | 2 |
| merge | 0 |
| rewrite | 0 |
| keep | 1 |
| needs-confirmation | 0 |

| 路径 | 分类 | 理由 | 风险 |
|---|---|---|---|
| `<Path>{roots.state}/specdev/adr/.gitkeep</Path>` | delete | ADR 写入后目录不再为空 | low |
| `<Path>{roots.state}/specdev/context/.gitkeep</Path>` | delete | context 写入后目录不再为空 | low |
| `<Path>{roots.state}/specdev/research/.gitkeep</Path>` | keep | research 仍为空，需保留目录骨架 | none |

未发现 superseded ADR、重复术语、相对时间、会话副本或可安全删除的长期知识。

## Destructive Actions Requiring Confirmation

1. 原子移动整个 change 目录到 2026-08 archive。
2. 修复并改写全局 `status.json`；改写归档 `.status.json`。
3. 新建 10 个永久 ADR 和 1 个 context 文件。
4. 删除 `adr/.gitkeep` 与 `context/.gitkeep`。
5. 为关闭 external reconcile 门补齐本地来源/triage 记录。

不包含 Git commit、push、PR、部署、生产迁移、Bucket 配置、远程关闭或用户 `ruoyi-admin/pom.xml` 修改。

## Summary

- 待归档 change：1（当前 blocked）
- 待提升知识：10 个 ADR + 23 个术语
- 待清理候选：2 delete + 1 keep
- 需用户确认/澄清：2 项归档前置状态门
- 验证：change complete validator 0 error / 0 warning

**未移动、删除、改写任何 change 或永久知识文件。本文件仅持久化 dry-run 计划。只有用户明确确认本计划，并确认该 change 无需关闭远程 Issue/PR 后，才进入 confirmed 执行。**

## Confirmed Execution Addendum

> 确认：用户于 2026-08-23 明确回复“确认执行，该 change 无远程 Issue/PR 需要关闭”。
> 执行完成：2026-08-23T17:08:34+08:00
> Verdict：verified

### 已执行动作

| 动作 | 结果 |
|---|---|
| 补录本地 conversation `source.md` 与 `triage.md` | pass；`external_action=not-applicable`，triage stage 0 error / 0 warning |
| 修复移动前全局 active 索引 | pass；目标 change 唯一 active 且不在 archived，archive precheck ready |
| 原子移动 change | pass；源路径不存在，归档目标存在；最终包含 59 个文件、22 个 Ticket、24 个 Evidence 文件 |
| 更新归档 `.status.json` | pass；`change_status=archived`、`archived=true`、archive path 与 works_run 正确 |
| 更新全局 `status.json` | pass；目标不在 active，去重存在于 archived，active/archived 无重叠 |
| 提升永久 ADR | pass；创建 `0001..0010` 共 10 个 Accepted ADR |
| 提升永久 context | pass；创建 1 个术语文件，包含 23 个项目术语及 `_Avoid_` 约束 |
| 清理 `.gitkeep` | pass；删除 `adr/.gitkeep`、`context/.gitkeep`，保留空 research store 的 `.gitkeep` |

### 执行后验证

| 检查 | 结果 |
|---|---|
| 归档前 `--stage complete` | pass；0 error / 0 warning |
| 归档后无 stage change 校验 | pass；0 error / 1 expected warning：校验器提示 archived change 通常位于 archive root |
| 归档后 `--stage complete` | 工具限制；1 error / 1 warning，因为校验器硬编码 complete stage 只接受 `change_status=completed`，没有 archive stage；未为获得绿色而回退正确 archived 状态 |
| SpecDev package `--self-check` | pass；0 error / 0 warning |
| JSON、全局索引和归档状态断言 | pass |
| `git diff --check` | pass |
| 永久知识重读 | pass；10 个 ADR、23 个术语、无额外 research 写入 |

### 未执行与边界

未创建 Git commit、未 push、未关闭远程对象、未部署、未执行生产 SQL 或 Bucket 配置，也未修改用户 `ruoyi-admin/pom.xml`。发布前 SQL、真实 Bucket/Provider 和浏览器角色矩阵条件继续保留在归档 Evidence 中；TEMP 主动清理继续 disabled/dry-run。
