---
schema_version: 3
artifact: ticket
change: 2026-08-20-namewta-client-rbac-review
id: T-04
title: 更新长期合同、父仓库快照并完成集成验收
status: blocked
planning_depth: deep
planning_depth_reason: 跨两个子模块、文档、数据库和 E2E Gate，决定最终可交付性。
ready: false
risk: high
blocked_by: [T-02, T-03]
contract_ids: [AC-001, AC-002, AC-003, AC-004, AC-005, AC-006]
owner: codex-root
expected_changes: ["<Path>plan/update.md</Path>", "<Path>docs/upstream/customization-map.md</Path>", "<Path>ruoyi-vue-plus-namewta</Path>", "<Path>plus-ui-namewta</Path>"]
writable_paths: ["<Path>plan/update.md</Path>", "<Path>docs/upstream/customization-map.md</Path>", "<Path>ruoyi-vue-plus-namewta</Path>", "<Path>plus-ui-namewta</Path>"]
read_only_paths: ["<Path>ruoyi-vue-plus-namewta/script/sql/**</Path>"]
shared_paths: ["<Path>plan/update.md</Path>", "<Path>docs/upstream/customization-map.md</Path>"]
shared_path_owners: ["<Path>plan/update.md</Path> => codex-root", "<Path>docs/upstream/customization-map.md</Path> => codex-root"]
---

# Ticket T-04: 更新长期合同、父仓库快照并完成集成验收

- **Ticket 文件：** `<Path>{roots.state}/specdev/changes/2026-08-20-namewta-client-rbac-review/ticket/04-integrate-and-verify.md</Path>`
- **总体 Map：** `<Path>{roots.state}/specdev/changes/2026-08-20-namewta-client-rbac-review/tickets-map.md</Path>`
- **上游 Spec：** `<Path>{roots.state}/specdev/changes/2026-08-20-namewta-client-rbac-review/spec.md</Path>`
- **完成 Evidence：** `<Path>{roots.state}/specdev/changes/2026-08-20-namewta-client-rbac-review/evidence/T-04.md</Path>`

## 1. 战略与来源

- **目标：** 固化新合同、验证集成候选并使父仓库精确记录 child commits。
- **可观察产出：** 文档与代码一致，双端/SQL/人工矩阵可复现，父 gitlinks 指向通过验证的最终提交。
- **来源：** 全部 AC、CR-001、用户批准计划。
- **当前事实：** 父仓库 gitlinks 落后，主机当前无 MySQL server/Docker。
- **Planning Depth 原因：** 最终发布 Gate 和外部环境依赖。

## 2. 决策状态

### 已锁定决策

- 文档只记录长期不变量；父仓库 pointer commit 独立；不能把未运行验收写为通过。

### 已采用的低影响假设

- 若 MySQL/浏览器环境不可用，代码与构建可完成，但 Ticket 保持 blocked 而非伪完成。

### 未决问题

无。

## 3. 范围边界

| IN（本 Ticket 构建） | REUSE（复用且不改变契约） | OUT（明确不做） |
|---|---|---|
| plan/map 文档、双端 Gate、SQL/E2E、gitlinks | 现有 SQL 和验收矩阵 | push、deploy、生产迁移 |

## 4. 要构建什么

发布人员从父仓库可以定位并验证唯一的前后端组合；任何缺失数据库或人工证据都会明确阻断交付。

## 5. 实现契约

- **入口或接缝：** 文档、子模块 commits、父 git tree、构建和运行环境。
- **输入与输出：** T-02/T-03 已验证 commits -> 父仓库 pointer commit和 Evidence。
- **公共接口变化：** 仅文档同步，不新增接口。
- **不变量：** 父指针只指向已验证 child HEAD；Speculo 状态不混入 pointer commit。
- **状态或数据流：** child 验证/commit -> docs -> parent pointers -> integrated verification。
- **错误与失败行为：** 任一 Gate 失败不更新完成状态。
- **兼容要求：** 发布顺序前端后端协调；无 schema 迁移。
- **安全与隐私要求：** Evidence 不含 secret、Token 或个人数据。

## 6. 执行路线

1. 更新 plan 与 customization map。
2. 重跑双端真实门禁、diff/lock audit 和 CR-002。
3. 在可用环境运行 fresh SQL、004 幂等和认证权限矩阵。
4. 提交 child 最终文档指针后更新父 gitlinks并核对 tree。
5. 写 Evidence；未满足外部 Gate 时保持 blocked。

## 7. 路径访问契约

- **预计修改点：** 两份父文档与两个 gitlinks。
- **可写范围：** frontmatter 所列路径。
- **只读上下文：** SQL 脚本。
- **共享路径：** 两份文档由 codex-root 独占。
- **保留或不动：** `.agents/**`、依赖、SQL、生产环境。

## 8. 验证矩阵

| 行为或风险 | 验证接缝 | 命令或步骤 | 预期结果 | Evidence |
|---|---|---|---|---|
| 双端质量 | Maven/pnpm | package/test/lint/build | active gates pass | `<Path>{roots.state}/specdev/changes/2026-08-20-namewta-client-rbac-review/evidence/T-04.md</Path>` |
| SQL | disposable MySQL | fresh install + 004 twice | 成功且无重复 | 同上 |
| 安全矩阵 | HTTP/Token/browser | plan 场景与负向输入 | 严格隔离/失效 | 同上 |
| 可复现快照 | git tree | child HEAD vs gitlinks | 精确一致 | 同上 |

- **Workspace checks：** current workspace，双端全量 Gate 和 parent status/tree。
- **E2E disposition：** required：跨 HTTP、数据库、Token、浏览器和发布快照。
- **E2E owner/environment：** Lead/current-workspace；disposable MySQL/Redis/backend/browser。
- **Integration evidence：** child commits、parent before/result SHA、截图/命令摘要。

## 9. 发布、迁移与恢复

- **迁移顺序：** 前端发布 -> 后端发布 -> 父快照；本 Ticket 不执行发布。
- **兼容窗口：** 协调窗口内完成，禁止长期混用旧前端与严格后端。
- **监控信号：** 登录/注册拒绝、角色接口 4xx、Token 和路由集合。
- **回滚或前向恢复：** revert child commits并恢复上一组 gitlinks；无 schema 回滚。
- **不可逆操作与批准点：** push/deploy/生产迁移均未授权。
- **收缩条件：** CR-002 无 blocker且全部 Gate有 Evidence。

## 10. 验收标准

- [ ] 全部 AC 满足并有 Evidence。
- [ ] 双端、SQL、人工矩阵全部执行；未执行则 Ticket blocked。
- [x] 修改路径和 shared owner 合法。
- [x] child 与父 pointer commits 非空且 direct-parent 验证通过。
- [ ] required E2E 由 Lead 在 current workspace 完成。
- [x] 无未批准偏差。
- [x] Ticket、Map、Goal Plan、Evidence 和 change 状态一致。
