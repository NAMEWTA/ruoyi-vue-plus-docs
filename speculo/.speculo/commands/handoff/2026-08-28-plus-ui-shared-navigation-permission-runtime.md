# Handoff: Plus UI 共享导航与权限运行时实施准备

## 交接范围

- 活跃 change：`2026-08-28-plus-ui-shared-navigation-permission-runtime`
- 已完成 Work：`specdev/grill-with-docs`、`specdev/spec`、`specdev/tickets`、`specdev/goal-plan`
- 当前 owning 工件：`<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/goal-plan.md</Path>`
- 当前状态：`blocked`；设计、Spec、5 个 Ticket 和 Goal Plan 已就绪，仅因实现与集成尚未授权而阻塞
- 接手重点：取得明确授权后进入 `<Path>{roots.workflows}/specdev/I-implement/I-implement.md</Path>`，严格按 Goal Plan 的 required worktree 与 candidate-merge 合同执行
- 外部动作：not-applicable；没有待关闭的远程 Issue、PR 或其他 external action

## 权威入口

按以下顺序恢复，不要从历史对话重新推导已经锁定的边界：

1. `<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/.status.json</Path>`
2. `<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/goal-plan.md</Path>`
3. `<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/tickets-map.md</Path>`
4. `<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/spec.md</Path>`
5. `<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/ticket/</Path>`
6. `<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/ADR.md</Path>` 与 `<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/CONTEXT.md</Path>`

本 change 没有 `<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/source.md</Path>` 和 `<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/triage.md</Path>`：它由用户对话直接进入 Grill，而非由 intake/triage 建立。不要补造这两个工件；其等价来源与决定已经由同目录的 `<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/ADR.md</Path>`、`<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/CONTEXT.md</Path>`、`<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/LOG.md</Path>` 和 `<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/design-tree.json</Path>` 承载。

## 已锁定执行合同

- Ticket 顺序为 T-01 -> T-02/T-03 -> T-04 -> T-05；T-02 与 T-03 可并行实现，但候选集成顺序固定为 T-02 后 T-03。
- 每个前端 Ticket 必须使用 `plus-ui-namewta` 的独立 source worktree；父 docs 仓库不建立产品 worktree。
- Lead 唯一拥有 Speculo 状态、Evidence、required E2E、candidate 集成、前端父分支推进和最终父仓库 pointer/result 更新。
- 最终行为必须保持后端 Client 裁剪、`getInfo -> getRouters -> addRoute -> replace` 顺序、manifest-only 动态页面和失败关闭规则。
- 不使用功能开关、兼容门面、公共 Store、公共 Router 或双路径；不激活其他终端 App。
- implementation agent 上限为 3，实际规划并行峰值为 2；每 Ticket integration attempt 上限为 7。

完整验收标准、路径 owner、Gate、恢复协议和 Evidence 规则只以 `<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/goal-plan.md</Path>`、`<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/tickets-map.md</Path>` 及 `<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/ticket/</Path>` 为准。

## 授权与阻塞

`<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/.status.json</Path>` 当前记录：

- `implementation_commit: not-authorized`：不得修改 Ticket 路径或创建 source commit。
- `local_candidate_integration: not-authorized`：不得创建临时候选、合并候选、推进 `plus-ui-namewta/main` 或更新父仓库 pointer/result。
- `source_cleanup: not-authorized`：即使后续成功集成，也不得自动删除 source branch/worktree。
- push、PR、远程合并、部署、迁移和生产动作均不在本 change 的授权范围内。

恢复执行前需要用户明确授权前两项。只有授权状态写入 `.status.json`、两个授权 blocker 被关闭且 Goal Plan 进入可执行状态后，才能创建 T-01 worktree。清理授权可在集成完成后另行取得，不阻止实施本身。

## Git 与验证检查点

- 最近实测前端基线：`plus-ui-namewta/main@d2961dbb444b9f036ad84c26ee8bcd69d973955c`，工作树干净；接手时必须重新读取，不得把该 SHA 当作永久基线。
- 规划阶段已实测通过：`pnpm architecture:check`、`pnpm architecture:test`（98/98）、`@namewta/platform-app-runtime` test（18/18）、`@namewta/platform-permission` test（13/13）。这只是实施前基线，不是 Ticket 完成证据。
- 本 change 尚未创建 source/candidate worktree、branch、commit 或 Evidence。
- 父仓库当前含其他并行归档、SpecDev change 和后端 submodule pointer 改动。它们不属于本 change；不得 reset、checkout、暂存、提交或回退。T-05 处理父仓库时只允许暂存明确归属于本 change 的文档与前端 pointer。
- `ruoyi-vue-plus-namewta/` 不在本 change 的实现范围内。

## 建议下一步

1. 重新读取 `speculo/.speculo/workspace.json`、`speculo/config.json` 和 `speculo/workflows/specdev/INDEX.md`，再核对 change/global 状态是否被其他会话更新。
2. 重读上述权威入口，以及 `plus-ui-namewta` 的 branch、HEAD、dirty 状态、现有 worktrees 和 refs。
3. 若授权仍缺失，保持 `blocked`，只向用户请求 implementation/source commit 与 Lead-owned local candidate integration/parent update 授权。
4. 授权后按 `<Path>{roots.workflows}/specdev/I-implement/I-implement.md</Path>` 做 execution preflight，更新授权和 blocker 状态，再从最新 `plus-ui-namewta/main` 创建 T-01 source worktree。
5. 每阶段先保持绿色再进入下一阶段；source worktree 不声明 E2E 通过，required E2E 只由 Lead 在 parent-candidate 接缝执行并写入 `<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/evidence/</Path>`。

## 建议 skills

- `engineering-standards`：聚合仓库、Vue/TypeScript 前端、质量门禁与交付规范。
- `plus-ui-frontend-conventions`：Plus UI monorepo、动态菜单、权限、App 显式组合和架构源码地图。
- `dev-worktree`：按 required 策略创建、恢复、候选集成及获批后的来源 worktree 生命周期管理。
- `subagent-delivery`：仅在 Lead 决定派单时构造不可变 Packet，并验收 implementation owner 的 source checkpoint。

## 恢复校验

```bash
node speculo/workflows/specdev/common/tools/validate-specdev.mjs \
  --stage goal-plan \
  --repo . \
  speculo/.speculo/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime
```

上次 Goal Plan 校验结果为 0 errors、0 warnings。接手时应重新运行；未获明确授权前不要执行实现、commit、candidate 集成、父分支推进、worktree 清理或任何远程动作。
