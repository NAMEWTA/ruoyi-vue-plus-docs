# Archive And Consolidate Dry-Run

> 生成时间：2026-08-24 15:34 +0800
> Workflow：specdev
> 模式：archive-single / dry-run
> Change：2026-08-24-upstream-fork-upgrade-assessment

## Path Context

| 名称 | 路径 |
|---|---|
| project_root | `<Path>.</Path>` |
| workflow_root | `<Path>{roots.workflows}/specdev</Path>` |
| state_root | `<Path>{roots.state}/specdev</Path>` |
| changes_root | `<Path>{roots.state}/specdev/changes</Path>` |
| archive_root | `<Path>{roots.state}/specdev/archive</Path>` |
| commands_root | `<Path>{roots.commands}</Path>` |

永久知识 stores：`<Path>{roots.state}/specdev/adr</Path>`、`<Path>{roots.state}/specdev/context</Path>`、`<Path>{roots.state}/specdev/research</Path>`；三者均存在。

## Archive Plan

### 预检摘要

| 检查项 | 状态 | 证据 |
|---|---|---|
| changes_root / archive_root 可访问且未逃逸 | pass | 均解析到项目根内的 SpecDev state root |
| change 名称 | pass | 符合 `YYYY-MM-DD-kebab-topic` |
| change `.status.json` | pass | `change_status=completed`，`completed_at=2026-08-24T15:04:25+08:00`，0 blocker，0 未批准 deviation |
| 完成合同 | pass | direct Evidence 为 done；review validator 0 error / 0 warning；complete validator 0 error / 1 个缺少 Spec 的预期 warning |
| external reconcile gate | pass | `triage.md#external_action=not-applicable` |
| 全局 active 索引 | pass | 唯一位于 `status.json#active`，不在 archived |
| 目标目录 | pass | `<Path>{roots.state}/specdev/archive/2026-08/2026-08-24-upstream-fork-upgrade-assessment</Path>` 不存在 |
| 候选 / 通过 / 阻塞 | 1 / 1 / 0 | archive-single ready |

### 逐项归档计划

| # | Change | 源路径 | 目标路径 | 状态 | 备注 |
|---|---|---|---|---|---|
| 1 | `2026-08-24-upstream-fork-upgrade-assessment` | `<Path>{roots.state}/specdev/changes/2026-08-24-upstream-fork-upgrade-assessment</Path>` | `<Path>{roots.state}/specdev/archive/2026-08/2026-08-24-upstream-fork-upgrade-assessment</Path>` | ready | 7 个文件；确认后整体原子移动 |

确认后将从全局 `active` 移除该 change、去重追加到 `archived`，并在归档 `.status.json` 写入 `change_status=archived`、`archived=true` 和目标 `archive_path`。

## Consolidation Plan

扫描最终 assessment、CR-001、CR-002、triage 与 direct Evidence。所有结论都绑定父/子仓固定 SHA；整改事实已由独立 remediation change 承接。

| 目标 Store | 新建 | 合并 | 冲突 | 跳过 |
|---|---:|---:|---:|---:|
| `adr/` | 0 | 0 | 0 | 1 类 |
| `context/` | 0 | 0 | 0 | 0 |
| `research/` | 0 | 0 | 0 | 1 类 |

### Ephemeral

| 知识项 | 处理 | 理由 |
|---|---|---|
| 固定点 fork 评估、风险清单和 review findings | 随 change 归档 | 依赖特定 commit SHA；提升为永久当前知识会随上游和整改推进失真 |
| 验证命令、差异数量、P1/P2 路由 | 随 change 归档 | 单次评估与交付证据，不是稳定领域机制 |

不写永久 store，不创建 ADR/context/research 文件。

## Cleanup Candidates

| 分类 | 数量 |
|---|---:|
| delete | 0 |
| merge | 0 |
| rewrite | 0 |
| keep | 12 |
| needs-confirmation | 0 |

现有 ADR-0001 至 ADR-0010 均为 2026-08-23 创建的现役决策且仍被归档引用，保留；现有 context 术语文件仍为 current，保留；空 research store 的 `.gitkeep` 保留。未发现 superseded ADR、重复术语、相对时间或会话副本。

## Destructive Actions Requiring Confirmation

1. 原子移动整个 assessment change 目录到 2026-08 archive。
2. 改写全局 `status.json` 与归档后的 `.status.json`。

不包含永久知识写入、文件删除、Git commit/push、远程关闭、部署或生产迁移。

## Summary

- 待归档 change：1，ready
- 待提升知识：0
- 待清理动作：0
- 需冲突裁决：0

**未移动、删除或改写任何 change 与永久知识文件。本文件仅持久化 dry-run 计划，请用户明确确认后执行。**

## Confirmed Execution Addendum

> 确认：用户明确回复“确认执行两份 dry-run 归档计划”。
> 执行完成：2026-08-24T15:44:59+08:00
> Verdict：verified

### 已执行动作

| 动作 | 结果 |
|---|---|
| 原子移动 assessment change | pass；源路径不存在，归档目标存在并完整保留 7 个文件 |
| 更新归档 `.status.json` | pass；`change_status=archived`、`archived=true`、archive path 与 works_run 正确 |
| 更新全局 `status.json` | pass；从 active 移除并去重追加到 archived，active/archived 无重叠 |
| 永久知识处理 | pass；assessment 无毕业项，未写入或清理永久知识 |

### 执行后验证

| 检查 | 结果 |
|---|---|
| 归档前 `--stage complete` | pass；0 error / 1 个预期 warning：非实现型 assessment 无 Spec |
| 归档后普通 change 校验 | pass；0 error / 1 个 archived-location warning |
| 归档后 `--stage complete` | 工具限制；校验器只接受 `change_status=completed`，正确的 archived 状态产生 1 error；未为获得绿色回退归档状态 |
| SpecDev package `--self-check` | pass；0 error / 0 warning |
| JSON、全局索引、归档状态与文件数断言 | pass |
| `git diff --check` | pass |

### 未执行与边界

未创建永久知识，未删除文件，未部署，未执行生产 SQL，未修改远程环境或 source worktree。Git commit/push 按用户既有明确授权在归档验证后执行。
