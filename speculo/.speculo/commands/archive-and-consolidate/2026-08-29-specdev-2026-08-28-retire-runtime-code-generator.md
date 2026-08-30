---
artifact: archive-and-consolidate-report
workflow: specdev
change: 2026-08-28-retire-runtime-code-generator
mode: executed
scope: archive-single
confirmation: confirmed
created_at: 2026-08-29T09:15:44+08:00
updated_at: 2026-08-29T11:57:12+08:00
---

# Archive And Consolidate Dry-run

## 路径上下文

| 名称 | 路径 |
|---|---|
| workflow root | `<Path>{roots.workflows}/specdev/</Path>` |
| state root | `<Path>{roots.state}/specdev/</Path>` |
| changes root | `<Path>{roots.state}/specdev/changes/</Path>` |
| archive root | `<Path>{roots.state}/specdev/archive/</Path>` |
| command report root | `<Path>{roots.state}/commands/archive-and-consolidate/</Path>` |

## 阶段一：归档移动

| 检查项 | 状态 | 证据 |
|---|---|---|
| change 名称 | pass | 符合 `YYYY-MM-DD-kebab-topic` 规则 |
| change 状态 | pass | `change_status: completed`，`completed_at: 2026-08-29T02:36:34+08:00` |
| 完成校验 | pass | `--stage complete` 为 0 errors / 0 warnings |
| workflow 自检 | pass | `--self-check` 为 0 errors / 0 warnings |
| external reconcile | pass | 无 source/triage、远程 Issue、PR 或 URL；来源为本地用户对话，判定 `not-applicable` |
| blocker / deviation | pass | 两者均为空 |
| Ticket/workspace | pass | T-01 至 T-05 均为 `integrated`，integration/verification 均为 `passed`；current 模式未创建 source/candidate worktree |
| 全局索引 | pass | change 唯一位于 `active`，不在 `archived`，两数组无重叠 |
| 源路径 | pass | `<Path>{roots.state}/specdev/changes/2026-08-28-retire-runtime-code-generator/</Path>` 存在，18 个文件，约 212 KiB |
| 目标路径 | pass | `<Path>{roots.state}/specdev/archive/2026-08/2026-08-28-retire-runtime-code-generator/</Path>` 不存在 |

| # | Change | 源 | 目标 | 状态 | 风险 |
|---|---|---|---|---|---|
| 1 | `2026-08-28-retire-runtime-code-generator` | `<Path>{roots.state}/specdev/changes/2026-08-28-retire-runtime-code-generator/</Path>` | `<Path>{roots.state}/specdev/archive/2026-08/2026-08-28-retire-runtime-code-generator/</Path>` | ready | medium：原子目录移动并改写全局与归档状态 |

确认后的精确动作：

1. 原子移动上述 change 目录到归档目标，不复制后删除，不覆盖已有目标。
2. 将归档 `.status.json` 更新为 `change_status: archived`、`current_work: null`、`archived: true`，写入 rooted `archive_path`，并把 `specdev/archive-and-consolidate` 去重加入 `works_run`。
3. 从全局 `status.json#active` 移除该 change，将名称去重追加到 `archived`；其他 active/archived 项逐字保留。
4. 不执行 source branch/worktree cleanup；本 change 使用 current workspace，且 `source_cleanup` 未授权。

## 阶段一：知识毕业与合并

已扫描永久 stores：`adr/`（17 个文件）、`context/`（3 个文件）、`research/`（仅 `.gitkeep`）。现有最大 ADR 序号为 `0017`，计划目标均不存在。

| 来源知识 | 判定 | 目标 | 动作与理由 |
|---|---|---|---|
| change ADR-001 | stable mechanism + must-know | `<Path>{roots.state}/specdev/adr/0018-static-crud-templates-over-runtime-generator.md</Path>` | create；记录产品不再维护运行时生成器，`docs/fm` 是 AI/开发者使用的静态 CRUD 标准资产，以及在线低代码体验与维护/漂移成本之间的取舍 |
| change CONTEXT 的“CRUD 标准模板资产”“运行时代码生成器” | project-specific context + must-know | `<Path>{roots.state}/specdev/context/crud-development-terms.md</Path>` | create；定义静态模板资产，并把运行时代码生成器明确标为已退役历史能力，避免与 OpenAPI/tooling 的通用生成语义混淆 |
| change ADR-002 | ephemeral | 无写入 | 一次性的基座元数据永久删除决定已执行完成；离开本 change 上下文会误导为通用生产数据策略，随归档保留 |
| CONTEXT 的“基座硬退役” | ephemeral | 无写入 | 仅描述本次无生产兼容义务的处置条件，不是项目长期通用迁移术语 |
| LOG、Ticket、Evidence 中的命令、失败重跑与 owner-return 过程 | ephemeral | 无写入 | 属于本 change 的实施和审计历史，完整随归档保留 |

计划新建 ADR 的内容边界：

- **Context：** `docs/fm` 已承载完整 CRUD 静态模板；继续保留后端模块、前端 UI、元数据表、菜单权限和在线接口会形成第二套模板解释与维护面。
- **Decision：** 产品运行时不提供代码生成器；CRUD 开发由 AI/开发者参考 `docs/fm` 与工程规范完成。重新引入在线生成能力必须形成新的架构决定和完整 owner。
- **Consequences：** `docs/fm` 必须保持可校验、与当前 HTTP/数据合同一致；产品构建图、API、UI、schema、菜单权限和当前 OpenAPI 不得重新引入旧生成器。
- **Source：** `2026-08-28-retire-runtime-code-generator` ADR-001 与 T-01 至 T-05 Evidence。

计划新建 context 的条目边界：

- **CRUD 标准模板资产：** `<Path>docs/fm/</Path>` 中供 AI 与开发者参考的 Java、Vue、React、XML 和 SQL 静态模板；不进入产品 classpath，不提供在线生成接口。`_Avoid_`: 运行时模板、在线低代码生成器。
- **运行时代码生成器（已退役）：** 曾由后端 `ruoyi-gen`、前端 gen domain/web-domain、`/tool/gen`、菜单权限和 `gen_table*` 元数据组成的在线能力；只用于解释历史记录，不是当前模块或可复用入口。`_Avoid_`: CRUD 标准模板资产、OpenAPI 合同生成工具。

毕业摘要：新建 ADR 1，新建 context 1，append/merge 0，冲突 0，needs-confirmation 0，ephemeral 3 类。

## 阶段二：清理候选

| 路径/集合 | 分类 | 理由 | 动作 |
|---|---|---|---|
| 现有 `<Path>{roots.state}/specdev/adr/</Path>` 0001 至 0017 | keep | 均创建不足 30 天，仍是当前决定或被代码、文档、active/archive 引用 | 无 |
| 现有三个 `<Path>{roots.state}/specdev/context/</Path>` 文件 | keep | 仍是 OSS/通知、多 App 和运行日志领域的当前术语 | 无 |
| `<Path>{roots.state}/specdev/research/.gitkeep</Path>` | keep | 空的永久 research store 需要占位 | 无 |
| 计划新建 ADR/context | keep | 新毕业的当前架构决定与项目术语 | 无 |

清理摘要：delete 0，merge 0，rewrite 0，needs-confirmation 0；keep 21 个现有知识文件与 2 个计划新文件。不会删除、合并或改写已有永久知识。

## 摘要与确认边界

- 待归档 change：1，ready 1，blocked 0。
- 待提升知识：新建 2 个文件；待清理动作 0；冲突与需确认知识项 0。
- 破坏性动作：移动 1 个 change 目录，改写全局状态与归档状态。
- 非破坏性知识动作：新建 1 个 ADR 和 1 个 context 文件，不覆盖已有内容。
- 不执行 Git commit、push、PR、remote merge、部署、生产数据库、source branch/worktree cleanup 或其他 change 修改。
- **除本 dry-run 报告外，尚未移动归档源、创建永久知识或执行清理。此为 dry-run 计划，请明确确认后执行。**

## 执行后补遗

### 确认与执行

- **确认来源：** 用户于 2026-08-29 明确回复“执行”。
- **执行模式：** `confirmed` / `archive-single`。
- **执行时间：** 2026-08-29T11:55:58+08:00。
- **执行前重验：** complete validator 0 errors / 0 warnings；源、目标、全局索引和两个知识目标均与 dry-run 一致。
- **移动完整性：** 移动前后均为 18 个文件、约 212 KiB，内容清单 SHA256 均为 `8e389b59e7b7050f4b0ff12c5f384d9d38b43fa4d7ded573c6d967929911f43a`。

### 动作结果

| 动作 | 结果 | 证据 |
|---|---|---|
| 原子移动 change | moved | 源路径不存在；归档目标存在且移动前后清单一致 |
| 更新归档状态 | pass | `change_status: archived`、`current_work: null`、`archived: true`，Archive Work 已加入 `works_run` |
| 更新全局索引 | pass | 目标 change 已从 `active` 移除并去重加入 `archived`，目标名称无重叠 |
| 知识毕业 ADR | created | `<Path>{roots.state}/specdev/adr/0018-static-crud-templates-over-runtime-generator.md</Path>`；SHA256 `2ec1ffab8d8a5eb2c01af2b1560a9a1276d0727f1489dee731aa1cf35b35779b` |
| 知识毕业 context | created | `<Path>{roots.state}/specdev/context/crud-development-terms.md</Path>`；SHA256 `bf34c58867598b8c2fea19972fa839587a6f44fec43c2c6a8407e9f1ddeaef48` |
| 知识清理 | skipped-as-planned | delete/merge/rewrite 均为 0；已有永久知识未改写 |
| Git 副作用 | not-run | 未执行 commit、push、merge 或 submodule 更新 |

### 重读验证

- 源路径不存在，目标路径完整存在；归档最终状态写入后的 18 文件清单 SHA256 为 `48b7958ae7bc53d78b74dde0329b54c7215c42e04919c73e8f46e4ab589a1434`。
- `jq empty`、目标 active/archived 唯一性、归档 `.status.json` 字段、两个知识文件非空和 `git diff --check`：exit 0。
- 归档后的 `--stage complete` 返回预期的 `complete stage requires change_status=completed`；该阶段不适用于已经转换为 `archived` 的工件，未将其冒充通过。
- `--stage implement` 对归档目录为 0 errors / 1 个“archived change in place”预期 warning；`--self-check` 为 0 errors / 0 warnings。
- **verification verdict：** `verified`；本目标 change 无不一致项。

### 并行工作树说明

执行期间观察到 `2026-08-28-user-password-policy-temporary-credentials` 与 `2026-08-28-plus-ui-shared-navigation-permission-runtime` 的独立归档变更。它们不属于本计划，本次没有修改、回退或纳入这些目录与报告；全局索引只对本目标 change 做定向变更。

### 未执行项

- 未执行 Git commit、push、PR、remote merge、部署、生产数据库或 source branch/worktree cleanup。
- 未删除、合并或改写既有永久 ADR/context/research 内容。
