# Archive And Consolidate Dry-Run

> 生成时间：2026-08-24 15:34 +0800
> Workflow：specdev
> 模式：archive-single / dry-run
> Change：2026-08-24-upstream-fork-upgrade-remediation

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
| change `.status.json` | pass | `change_status=completed`，`completed_at=2026-08-24T15:22:40+08:00`，0 blocker，0 未批准 deviation |
| 完成合同 | pass | T-01 至 T-04 均 done；4 条 direct-parent 记录 integrated/passed；implement/complete validator 均 0 error / 0 warning |
| Git / 远程验证 | pass | 产品 checkpoint `e623b9e2e9381f39721b15bcb779d260d03a84e4`；GitHub Actions run `32700795886` 四 job 全绿 |
| external reconcile gate | pass | `triage.md#external_action=not-applicable` |
| 全局 active 索引 | pass | 唯一位于 `status.json#active`，不在 archived |
| 目标目录 | pass | `<Path>{roots.state}/specdev/archive/2026-08/2026-08-24-upstream-fork-upgrade-remediation</Path>` 不存在 |
| 候选 / 通过 / 阻塞 | 1 / 1 / 0 | archive-single ready |

### 逐项归档计划

| # | Change | 源路径 | 目标路径 | 状态 | 备注 |
|---|---|---|---|---|---|
| 1 | `2026-08-24-upstream-fork-upgrade-remediation` | `<Path>{roots.state}/specdev/changes/2026-08-24-upstream-fork-upgrade-remediation</Path>` | `<Path>{roots.state}/specdev/archive/2026-08/2026-08-24-upstream-fork-upgrade-remediation</Path>` | ready | 13 个文件；确认后整体原子移动 |

确认后将从全局 `active` 移除该 change、去重追加到 `archived`，并在归档 `.status.json` 写入 `change_status=archived`、`archived=true` 和目标 `archive_path`。

## Consolidation Plan

扫描 Spec、4 个 Ticket、Tickets Map、4 个 Evidence、triage、source 与项目实现事实。现有永久 ADR/context 未包含数据库支持矩阵决策。

| 目标 Store | 新建 | 合并 | 冲突 | 跳过 |
|---|---:|---:|---:|---:|
| `adr/` | 1 | 0 | 0 | 5 类 |
| `context/` | 0 | 0 | 0 | 0 |
| `research/` | 0 | 0 | 0 | 1 类 |

### [NEW] ADR-0011: NAMEWTA MySQL-only 数据库合同

- **目标：** `<Path>{roots.state}/specdev/adr/0011-namewta-mysql-only-database-contract.md</Path>`
- **来源：** remediation Spec DEC-001、T-02 Evidence，以及后端 README/SQL README 的当前实现合同
- **毕业判定：** stable-mechanism / must-know
- **内容摘要：** NAMEWTA 业务扩展只支持并自动验证 MySQL 8.4；上游框架具备其他数据库能力不代表 Client/RBAC、OSS、通知或 NAMEWTA migration 已支持对应方言。需要其他方言时应新建立项、迁移和完整 CI 合同，而不是维持未经验证的兼容表象。
- **权衡：** 放弃表面可移植性，换取 schema、MyBatis、迁移和外部服务测试的单一可信支持矩阵。
- **Supersedes / conflict：** 无；现有 ADR-0001 至 ADR-0010 无数据库支持主题。

### Ephemeral

| 知识项 | 处理 | 理由 |
|---|---|---|
| 三轮 CI 失败/修复、commit SHA 与测试数量 | 随 change 归档 | 单次交付证据 |
| generated declarations 与 MyBatis bare-test 修复 | 随 change 归档 | 工具链/测试夹具实现细节，已由代码固化 |
| 远程 middleware 地址、端口、恢复目录与手工验收日志 | 随 change 归档 | 环境相关且脱离 change 会误导 |
| full/core profile、四 job CI、启动脚本 | 随 change 归档 | 已在项目 README、scripts 和 engineering skill 中形成更直接的工程权威 |
| 上游固定点与热点数量 | 随 change 归档 | 时效性强，由 upstream sync 工件和 customization map 承接 |
| research store | 无写入 | 没有独立于 change 且仍为当前真相的研究产物 |

## Cleanup Candidates

| 分类 | 数量 |
|---|---:|
| delete | 0 |
| merge | 0 |
| rewrite | 0 |
| keep | 12 |
| needs-confirmation | 0 |

现有 ADR-0001 至 ADR-0010 均为 2026-08-23 创建的现役决策且仍被归档引用，保留；现有 context 术语文件仍为 current，保留；空 research store 的 `.gitkeep` 保留。新增 ADR 后 `adr/` 本就非空，不涉及 `.gitkeep` 清理。

## Destructive Actions Requiring Confirmation

1. 原子移动整个 remediation change 目录到 2026-08 archive。
2. 改写全局 `status.json` 与归档后的 `.status.json`。
3. 新建永久 ADR-0011。

不包含其他知识改写或删除、source cleanup、部署、生产 SQL、远程 middleware 变更或分支保护修改。Git commit/push 仅在归档动作完成并验证后，沿用用户本轮已明确授予的权限执行。

## Summary

- 待归档 change：1，ready
- 待提升知识：1 个 ADR
- 待清理动作：0
- 需冲突裁决：0

**未移动、删除或改写任何 change 与永久知识文件。本文件仅持久化 dry-run 计划，请用户明确确认后执行。**
