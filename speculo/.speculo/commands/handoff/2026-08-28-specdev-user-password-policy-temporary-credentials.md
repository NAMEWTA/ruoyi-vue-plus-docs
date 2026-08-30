# Handoff: 用户密码策略与临时凭据变更

## 交接范围

- Change：`2026-08-28-user-password-policy-temporary-credentials`
- 当前状态：`completed`，完成时间为 `2026-08-28T19:08:06+08:00`；`current_work` 为 `null`，尚未归档。
- 已完成 Work：`specdev/grill-with-docs`、`specdev/spec`、`specdev/tickets`、`specdev/goal-plan`、`specdev/implement`。
- 当前 owning 工件：`<Path>{roots.state}/specdev/changes/2026-08-28-user-password-policy-temporary-credentials/goal-plan.md</Path>`。
- 本地实现与集成没有 blocker 或 deviation；`external_action` 未登记，不能推断存在获授权的远程关闭动作。
- 接手重点：不要重做已经闭合的实现。仅在用户确认后进入 Archive；若要执行生产发布、DML、角色授权、远程推送或 worktree 清理，必须先取得对应的独立授权。

## 权威恢复入口

按以下顺序恢复事实，不从历史对话重新推导已经锁定的合同：

1. `<Path>{roots.state}/specdev/changes/2026-08-28-user-password-policy-temporary-credentials/.status.json</Path>`
2. `<Path>{roots.state}/specdev/changes/2026-08-28-user-password-policy-temporary-credentials/goal-plan.md</Path>`
3. `<Path>{roots.state}/specdev/changes/2026-08-28-user-password-policy-temporary-credentials/tickets-map.md</Path>`
4. `<Path>{roots.state}/specdev/changes/2026-08-28-user-password-policy-temporary-credentials/spec.md</Path>`
5. `<Path>{roots.state}/specdev/changes/2026-08-28-user-password-policy-temporary-credentials/ticket/</Path>`
6. `<Path>{roots.state}/specdev/changes/2026-08-28-user-password-policy-temporary-credentials/evidence/</Path>`
7. `<Path>{roots.state}/specdev/changes/2026-08-28-user-password-policy-temporary-credentials/ADR.md</Path>`、`<Path>{roots.state}/specdev/changes/2026-08-28-user-password-policy-temporary-credentials/CONTEXT.md</Path>` 与 `<Path>{roots.state}/specdev/changes/2026-08-28-user-password-policy-temporary-credentials/LOG.md</Path>`

该 change 没有 `<Path>{roots.state}/specdev/changes/2026-08-28-user-password-policy-temporary-credentials/source.md</Path>` 和 `<Path>{roots.state}/specdev/changes/2026-08-28-user-password-policy-temporary-credentials/triage.md</Path>`：它由用户对话直接进入 Grill，而不是由 intake/triage 建立。不要为了归档或交接补造这两个工件；来源、决定与审计轨迹由上述 ADR、CONTEXT、LOG 和 `<Path>{roots.state}/specdev/changes/2026-08-28-user-password-policy-temporary-credentials/design-tree.json</Path>` 承载。

## 已交付结果

- 8 张 Deep Ticket 全部为 `done`，`AC-001` 至 `AC-024` 已由代码、自动测试或隔离环境演练闭合；完整实现范围与行为合同只以 Spec、Ticket、Tickets Map 和 Goal Plan 为准。
- 后端已交付跨 JVM 缓存失效、Client 精确授权会话失效、统一密码策略、五个密码写入口收敛、一次性临时密码认证及迁移/发布合同。
- 前端已交付公开密码策略上下文、注册与个人改密策略采用、管理员重置密码和临时密码工作流，并同步 OpenAPI 与长期定制文档。
- Evidence 不保存明文凭据、Token 或其他 secret；详细命令、场景、结果和残余风险位于各 Ticket Evidence，最终汇总以 `<Path>{roots.state}/specdev/changes/2026-08-28-user-password-policy-temporary-credentials/evidence/T-08.md</Path>` 为准。

## Git 固定点与当前工作树

- 本 change 的前端结果：`plus-ui-namewta@8aa184b353c5a37ee555feb8be808fe9ba885297`。
- 本 change 的后端结果：`ruoyi-vue-plus-namewta@42e06c0f713e0d724813800505e5bb5b40ab563b`。
- 记录上述两个 gitlink 的父仓结果：`ed5ebb9058d5ab461319b30f385887bbee0b9c6d`；其父仓 tree 为 `18de5723f4b5808f1b3b1363d518c270ac679d45`。
- T-04 的提交祖先补正已完成：source `29cf4dce083afe18aa59d68b44ae41885ee62cd9` 经 candidate `94b0fb7c61307bab073a6a273c1d2b4eba9e4f94` 纳入最终 backend result；不要恢复为旧的 sibling-only 拓扑。
- 当前前端 `main` 已由另一个 active change 推进到 `720bcdafc487846b1260584d9ec2fd324f8db728`；已确认本 change 的 `8aa184b...` 是其祖先。当前后端 `main` 仍为 `42e06c0...`。
- 父仓及两个子仓当前都有其他并行任务留下的 staged/unstaged 变化。它们不属于本 change；不得 reset、checkout、暂存、提交或回退。父仓 working tree 中前端 gitlink 相对 `ed5ebb...` 的推进同样属于后续 change。

## Worktree 与清理状态

- 本 change 的前端 T-06、T-07 source 与 integration worktree/branch 仍存在于 `specdev-worktree/2026-08-28-user-password-policy-temporary-credentials/` 和 `specdev-worktree/.integration/2026-08-28-user-password-policy-temporary-credentials/`。
- 本 change 的后端 T-01、T-02、T-03、T-04、T-05、T-08 source 与 integration worktree/branch 仍存在于同样的 source/integration 根下。
- `<Path>{roots.state}/specdev/changes/2026-08-28-user-password-policy-temporary-credentials/.status.json</Path>` 中所有 Ticket 均为 `integrated`，不是 `removed`；`source_cleanup` 明确为 `not-authorized`。不得因 change 已完成而自行删除这些 worktree 或 branch。
- 若用户之后授权清理，先重新读取 `git worktree list --porcelain`、branch refs 和上述 change status 中每张 Ticket 的 worktree 记录，逐项确认没有其他 active change 复用路径或引用，再按 SpecDev 生命周期更新状态。

## 已验证门禁

最终 Evidence 记录以下结果：

- 后端 `./mvnw test`：190 tests，0 failure/error，11 项条件型外部集成 skip。
- 后端 `./mvnw clean package -Pbundle-full -DskipTests`：通过。
- 后端 `./mvnw clean package -Pbundle-core -Dmaven.test.skip=true`：通过。
- 前端 OpenAPI 漂移检查：通过，快照 SHA-256 为 `7b0a6405d4eee0d61e10056e14eebe566ad0cabc444f960424629939b45f2186`。
- 前端 architecture check、99 项 architecture test、lint、typecheck、workspace test、dev/prod build 与最终 48 项 Playwright：通过。
- 真实 Redis/MySQL、双 JVM、多 Client、并发 CAS、HTTP 五入口及 fresh/upgrade/重复/冲突/补偿迁移矩阵：通过。
- SpecDev complete validator：0 errors、0 warnings。多仓 SHA/祖先关系必须分别在前端、后端仓库核对，不能把父仓 `--repo .` 当作唯一产品仓验证。

命令细节、cwd、结果边界和条件型 skip 的解释只以 `<Path>{roots.state}/specdev/changes/2026-08-28-user-password-policy-temporary-credentials/evidence/</Path>` 为准；接手者不要把本交接摘要替代为新的 Evidence。

## 未授权动作与恢复条件

- 未执行：生产 DML、部署、独立角色授权、push/PR/remote merge、远程 Issue 关闭，以及 source branch/worktree cleanup。
- 生产发布必须重新冻结部署 SHA、备份数据库并完成 preflight，严格遵循 DML -> backend -> frontend -> permission grant 顺序；失败时使用已演练补偿，绝不修改用户密码。
- 仅归档时，在用户明确确认后进入 `<Path>{roots.workflows}/specdev/A-archive-and-consolidate/A-archive-and-consolidate.md</Path>`，先核对 change completion、毕业评估和永久知识提升范围。归档不自动授权任何生产、远程或清理动作。
- 若用户要求上线或迁移，先重读 `<Path>{roots.state}/specdev/changes/2026-08-28-user-password-policy-temporary-credentials/evidence/T-08.md</Path>`、`ruoyi-vue-plus-namewta/script/sql/namewta/README.md` 与 `docs/upstream/customization-map.md`，并把它作为新的、有明确授权边界的执行任务处理。

## 建议 skills

- `engineering-standards`：聚合仓库、子模块固定点、验证和交付裁决。
- `plus-ui-frontend-conventions`：前端密码策略上下文、Admin 工作流、OpenAPI 和多 App 边界。
- `ruoyi-backend-development`：后端认证、迁移、Maven 门禁与发布导航。
- `ruoyi-system-module-guide`：用户、Client、权限、会话和 system 对外能力边界。
- `ruoyi-common-modules-guide`：Redis、Sa-Token/LoginHelper 及跨模块公共能力定位。

## 恢复校验

```bash
node speculo/workflows/specdev/common/tools/validate-specdev.mjs \
  --stage complete \
  speculo/.speculo/specdev/changes/2026-08-28-user-password-policy-temporary-credentials
```

接手时还应分别读取父仓、`plus-ui-namewta` 与 `ruoyi-vue-plus-namewta` 的 HEAD、status、worktree 和 refs；当前 dirty 状态包含并行工作，不能通过清理工作树来“恢复”本 change。
