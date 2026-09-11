# Archive Plan

> 生成时间：2026-09-10 17:55
> Workflow：specdev
> 模式：archive-single

## 预检摘要

| 检查项 | 状态 |
|--------|------|
| changes_root 可访问 | pass |
| archive_root 可访问 | pass |
| status.json 可解析 | pass |
| 候选 change 数量 | 1 |
| 预检通过数 | 1 |
| 预检阻塞数 | 0 |

## 逐项归档计划

| # | Change | 源路径 | 目标路径 | 状态 | 备注 |
|---|--------|--------|---------|------|------|
| 1 | 2026-09-08-richtext-third-oss | speculo/.speculo/specdev/changes/2026-09-08-richtext-third-oss/ | speculo/.speculo/specdev/archive/2026-09/2026-09-08-richtext-third-oss/ | ready | change_status completed；triage external_action not-applicable |

## 状态变更

归档执行后将对 `status.json` 做如下变更：

- `active` 数组移除 `2026-09-08-richtext-third-oss`
- `archived` 数组去重追加该名称
- 归档 `.status.json` 更新：`change_status: archived`, `archived: true`, `archive_path` 指向 2026-09 目录

## 知识合并

| 目标 Store | 动作 | 项 | 毕业判定 |
|---|---|---|---|
| adr/ | create | `0043-local-minio-cors-star-default.md` | stable-mechanism / must-know |
| context/ | merge | Local MinIO CORS Default → `oss-direct-notification-terms.md` | must-know |
| adr/ context/ | skip | providerCode 可选语义、富文本 catch 细节、缺测 | ephemeral |

## 清理候选

无 delete/merge/rewrite。现役 ADR-0002 保留；新 ADR-0043 创建不足 30 天 keep。

## 破坏性动作

- 移动 change 目录
- 写入永久 adr/context
- 更新全局 `status.json`

用户已明确要求审查后归档；本报告对应 confirmed 执行。

## 执行后验证

| 检查 | 结果 |
|---|---|
| 源 `changes/2026-09-08-richtext-third-oss/` | 不存在 |
| 目标 `archive/2026-09/2026-09-08-richtext-third-oss/` | 完整（spec、tickets、evidence、CR、triage） |
| 全局 active | 仅 `2026-09-10-notify-channel-config` |
| 全局 archived | 已追加 `2026-09-08-richtext-third-oss`，与 active 无重叠 |
| 归档 `.status.json` | `change_status: archived`，`archived: true`，`archive_path` 正确 |
| ADR-0043 | 已写入 |
| context Local MinIO CORS Default | 已合并到 `oss-direct-notification-terms.md` |
| `validate-specdev --stage complete`（移动前） | 0 error |
| `validate-specdev --self-check` | 0 error |
| `validate-specdev --stage complete`（归档目录） | 1 expected error：archived 不是 completed |

**verdict:** verified

