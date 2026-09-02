---
command: retro
mode: issue-retro
scope: workspace
workflows: [specdev]
changes: [2026-08-31-account-profile-verification]
generated_at: 2026-09-02T14:39:31+08:00
---

# Speculo Retro Report

## 复盘范围

本次复盘覆盖 `2026-08-31-account-profile-verification` 完成后的 Git 历史收敛需求。用户希望把指定提交到当前完成节点之间的全部提交压缩为一个需求完成节点，并询问该操作的名称、边界和安全执行方式。

## 信号来源

- 当前对话：用户指定后端提交 `672268b2fa18b4cdd0d6ee19be1cb1615252e040` 到当前 HEAD，希望压缩成一个 `account-profile` 完成提交。
- 只读 Git 诊断：目标提交本身是 merge commit；其第一父节点是 `6927ee9786ba87f432127f4feda61c0f43c01849`。目标区间有 17 个 first-parent 节点、35 个可达提交和 16 个 merge commit，直接执行 `git rebase -i 672268b...` 还会错误地把目标提交保留在压缩范围之外。
- `<Path>{roots.state}/specdev/changes/2026-08-31-account-profile-verification/.status.json</Path>`：该 change 跨父仓库、前端子模块和后端子模块执行 T-01 到 T-14，包含 merge-commit、fast-forward、candidate branch、source worktree 和 integration worktree 等多种历史引用。
- `<Path>{roots.workflows}/specdev/INDEX.md</Path>`：SpecDev 为实现和集成保留细粒度 Ticket、checkpoint、candidate 与 Evidence，但没有面向 change 完成后历史收敛的受控 command。
- `<Path>{roots.commands}/git-repository-audit.md</Path>`：现有 Git command 负责只读仓库审计，不负责指定区间 squash 或已发布历史重写。

## 改进提案

### feature: 增加受控压缩指定 Git 提交区间的 command

- **类型：** `feature-request`（missing-capability）
- **优先级：** `priority:medium`
- **领域：** `area:commands`
- **处置：** `file-issue`
- **影响面 / 频率：** `partial / occasional`
- **根因：** Speculo 能以 Ticket/worktree/candidate 方式生成可审计的细粒度实现历史，但没有在需求完成后将用户指定区间安全收敛为单一发布节点的生命周期能力。该操作同时涉及范围包含语义、merge 拓扑、dirty tree、子模块、备份引用、已发布远端和恢复路径，依赖临时手工命令容易产生不可逆误操作。
- **建议改动：** 新增一个专用 command（候选名 `git-history-squash`），默认仅生成 dry-run 计划。用户显式指定 repository、起点、终点和起点是否包含；command 固定不可变 SHA 后完成 ancestry、merge、dirty tree/index、worktree/branch、submodule/gitlink、remote publication 和 branch protection 预检。执行前创建可恢复 backup ref；压缩后证明新 HEAD 与旧 HEAD 的 tree 等价、指定基线后恰好只有一个提交。远端更新必须单独展示 old/new SHA 并再次确认，只允许带精确 lease 的 `--force-with-lease`，禁止普通 `--force`。多仓库/子模块模式按子仓库先、父仓库后执行，并为部分成功提供恢复报告；旧 worktree/branch 的清理不隐式包含在压缩操作中。
- **受影响资产：**
  - `<Path>{roots.commands}/git-history-squash.md</Path>`（候选新增）
  - `<Path>{roots.skills}/git-history-squash/</Path>`（若将 Git 原语拆为可复用 skill）
  - `<Path>{roots.commands}/INDEX.md</Path>` 或实际 command 索引
  - Git 临时仓库测试夹具与 command 自检
- **去重结论：** 2026-09-02 使用“压缩提交 重写 Git 历史 command”“squash commits history rewrite command”“git history squash rebase”“提交区间 历史重写”检索 `NAMEWTA/Speculo` 全部 open/closed Issue，均无候选；`dup_of: null`。

#### Issue 正文

## 问题

Speculo 缺少一个受控 command，用于把用户指定的 Git 提交区间压缩为单一需求完成节点，并在需要时安全重写已经发布的分支历史。

当前只能临时拼接 `rebase -i`、`reset --soft` 和强制推送命令。这里至少存在以下容易误判的边界：

- 起点提交是包含还是排除；例如 `git rebase -i <start>` 默认不会改写 `<start>` 本身。
- 区间包含 merge commit 时，交互式 rebase 可能丢失拓扑、重复回放或产生大量冲突。
- dirty working tree/index、未跟踪文件和已有 stash 可能导致当前工作被混入或难以恢复。
- 聚合仓库与 Git submodule 是独立历史，不能用一个 SHA 跨仓库压缩，且父仓库 gitlink 必须最后更新。
- SpecDev source/integration worktree 和 branch 仍可能引用旧提交，导致历史图继续显示旧节点，也承担恢复用途。
- 已发布分支需要重写远端；普通 `--force` 可能覆盖协作者的新提交。

## 证据

`2026-08-31-account-profile-verification` 完成后，用户要求把后端 `672268b2fa18b4cdd0d6ee19be1cb1615252e040` 到当前完成节点压缩成一个 `account-profile` 提交。

只读诊断发现：

- `672268b...` 本身是 merge commit，第一父节点为 `6927ee978...`。
- 若需要包含 `672268b...`，真正的压缩基线应是它的第一父节点；直接执行 `git rebase -i 672268b...` 会留下两个节点。
- 该后端区间包含 17 个 first-parent 节点、35 个可达提交和 16 个 merge commit。
- 同一 change 还跨前端子模块和父聚合仓库产生独立提交；三个仓库当时都存在未提交改动。
- `<Path>{roots.state}/specdev/changes/2026-08-31-account-profile-verification/.status.json</Path>` 同时记录了 merge-commit、fast-forward、candidate branch、source worktree 和 integration worktree，说明简单的单仓库线性 rebase 指引不足以覆盖真实 Speculo 工作流。

## 根因

SpecDev 的实现阶段以 Ticket、checkpoint、candidate 和集成 Evidence 为中心，正确保留了细粒度可恢复历史；但 change 完成后的“发布历史收敛”没有对应 command 和副作用合同。

Git 历史重写属于高风险、可能影响远端协作者的独立生命周期动作，不能只靠一段固定 rebase 示例覆盖。

## 建议改动

新增专用 command，候选名为 `git-history-squash`，至少提供以下合同：

1. 用户显式选择 repository、起点、终点，并明确起点是 `inclusive` 还是 `exclusive`；执行前将所有 ref 固定为不可变 SHA。
2. 默认只输出 dry-run 计划，展示旧/新拓扑、将被替换的提交数量、merge 数量、受影响本地/远端 refs 和预计提交信息。
3. 预检 ancestry、merge-base、detached HEAD、dirty working tree/index、未跟踪文件、进行中的 rebase/merge/cherry-pick、关联 worktree、submodule/gitlink、目标分支发布状态和保护状态；条件不满足时失败关闭。
4. 根据“最终只保留一个节点”的目标选择不会重复回放 merge 历史的策略；执行前创建唯一、可定位的 backup ref，并记录 old HEAD/old tree/remote lease。
5. 压缩后强制验证新 HEAD tree 与旧 HEAD tree 等价，并验证基线到新 HEAD 的提交数为 1；验证失败自动停止在本地，不触碰远端。
6. 远端更新作为第二个显式确认门，准确展示 repo、branch、old SHA、new SHA；只允许精确 lease 的 `--force-with-lease`，禁止普通 `--force`。
7. 多仓库/子模块模式先压缩并发布子仓库，再更新父仓库 gitlink；部分成功时记录已完成仓库、未完成仓库和恢复步骤，不伪装原子成功。
8. 不自动删除 source/integration worktree、branch、backup ref 或 reflog；清理必须是独立、明确授权的后续动作。
9. 将执行计划、验证结果、远端结果和恢复信息写入 command 自有状态报告，正文不包含 token、机器绝对路径或其他敏感值。

## 验收标准

- 使用临时 Git 仓库测试线性历史、起点包含/排除、merge 区间、dirty tree、远端 lease 变化和 submodule 聚合场景。
- dry-run 模式不移动任何 ref、不创建提交、不推送远端。
- `inclusive` 场景不会意外保留起点提交；非法或非祖先区间明确拒绝。
- 压缩成功后，旧 HEAD 与新 HEAD 的 tree 完全一致，基线到新 HEAD 恰好一个提交，并存在可恢复 backup ref。
- 远端在确认前零写入；远端分支已被他人更新时，精确 `--force-with-lease` 必须拒绝推送。
- 多仓库/子模块报告能证明子仓库新 SHA 已可达后才允许父仓库提交新 gitlink。
- 旧 worktree/branch/ref 不会被压缩 command 隐式删除。

## 受影响资产

- `<Path>{roots.commands}/git-history-squash.md</Path>`（候选新增）
- `<Path>{roots.skills}/git-history-squash/</Path>`（候选新增）
- command 索引、状态报告 schema 和 Git 临时仓库测试夹具

## 丢弃与降级项

- “只补一段 interactive rebase 使用文档”并入本提案，不单独提交。原因是本次真实区间包含大量 merge commit、三个独立 Git 仓库、dirty tree 和已发布主分支，文档示例无法提供必要的预检、备份、等价验证和远端并发保护。
- “自动删除 SpecDev source/integration worktree 和 branch”不纳入本提案。历史压缩与来源清理具有不同授权和恢复风险，必须保持独立副作用边界。

## 目标仓库

`NAMEWTA/Speculo`

## 用户确认记录

- 用户已明确请求针对本次压缩提交需求向 Speculo 提交 Issue。
- 按 `retro.md` 的二次确认合同展示准确 Issue 清单后，用户于 2026-09-02 回复“确认提交”，授权向 `NAMEWTA/Speculo` 创建本条 Issue。

## 提交结果

- 已创建 [NAMEWTA/Speculo#44](https://github.com/NAMEWTA/Speculo/issues/44)：`feature: 增加受控压缩指定 Git 提交区间的 command`。
- 创建后远端重读通过：状态为 `OPEN`，标签为 `enhancement`、`needs-triage`，标题和正文与确认草案一致。
