---
schema_version: 3
artifact: tickets-map
change: 2026-08-28-plus-ui-shared-navigation-permission-runtime
status: completed
---

# Tickets Map: Plus UI 共享导航与权限运行时收口

- **Map：** `<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/tickets-map.md</Path>`
- **Spec：** `<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/spec.md</Path>`
- **Ticket 目录：** `<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/ticket/</Path>`
- **Evidence 目录：** `<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/evidence/</Path>`
- **Goal Plan：** `<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/goal-plan.md</Path>`（completed）

## 1. 目标与拆分策略

五个 Ticket 共同交付 `US-001` 至 `US-007` 和 `AC-001` 至 `AC-015`。拆分遵循已接受的五阶段迁移：T-01 是解除高风险迁移阻碍的行为冻结 prefactor；T-02 与 T-03 分别拥有 Web 权限宿主和菜单纯运行时两个独立共享合同；T-04 是将二者接入 Admin 的生产纵向切片；T-05 是零兼容 contract 阶段与最终全量 Gate。

本 change 不采用 expand-contract：用户已确认当前为基座，不需要兼容窗口。阶段 checkpoint 只用于保持绿色和 Git 恢复，不构成双轨生产入口。

## 2. 执行清单

| ID | Ticket | 可观察产出 | Blocked By | Depth | Risk | Ready | Owner | Contract IDs | Wave/Gate | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| T-01 | `<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/ticket/01-freeze-permission-navigation-behavior.md</Path>` | Admin 浏览器行为基线不依赖 legacy fallback | — | deep | high | yes | codex:leadership-epoch-1 | AC-005/006/008/009/011/012/014 | Wave 0 / Baseline | done |
| T-02 | `<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/ticket/02-build-web-permission-host.md</Path>` | 任意 Vue Web App 可注入 evaluator 安装权限指令 | T-01 | deep | high | yes | codex:leadership-epoch-1 | AC-001/002/003/004/012/014 | Wave 1 / Shared contract | done |
| T-03 | `<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/ticket/03-extract-server-menu-runtime.md</Path>` | App Runtime 提供确定菜单投影与诊断 | T-01 | deep | high | yes | codex:leadership-epoch-1 | AC-006/007/010/012/014 | Wave 1 / Shared contract | done |
| T-04 | `<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/ticket/04-migrate-admin-navigation-composition.md</Path>` | Admin 完成新宿主、navigation Store 和 manifest-only 迁移 | T-02, T-03 | deep | critical | yes | codex:leadership-epoch-1 | AC-001..012/014 | Wave 2 / Admin migration | done |
| T-05 | `<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/ticket/05-contract-legacy-and-validate.md</Path>` | legacy 零匹配、架构 Ratchet、文档同步、全量验收 | T-04 | deep | high | yes | codex:leadership-epoch-1 | AC-009/013/014/015 | Wave 3 / Contract + Final | done |

Ticket frontmatter 是状态、依赖、深度和路径访问契约的权威；本表是同步投影。

## 3. 依赖 DAG

```text
T-01 [DONE: behavior-freeze prefactor]
  ├─→ T-02 [READY: Web permission shared contract]
  └─→ T-03 [READY: server-menu shared contract]
        ╲
T-02 ────╲
           → T-04 [DONE: Admin migration convergence]
                    → T-05 [DONE: zero-compat contract + final gate]
```

- 根 Ticket：T-01。
- 并行扇出：T-02 与 T-03，仅在 Goal Plan 选择 required worktree 时可并行实现；current 策略下仍严格串行。
- 汇合点：T-04 必须消费两个已集成公共合同。
- 收缩点：T-05 只有在 T-04 证明正式消费者已迁移后才能删除 legacy。

## 4. 合同覆盖矩阵

| Contract ID | 覆盖 Ticket | 验证接缝 | 状态 | 说明 |
|---|---|---|---|---|
| AC-001 | T-02, T-04 | Web Kit Vue test + Admin composition | covered | 指令宿主与真实 App 组合 |
| AC-002 | T-02, T-04 | 指令特征 test + Admin E2E | covered | 匹配、拒绝、超管、通配和非法绑定 |
| AC-003 | T-02, T-04 | evaluator 组合 test | covered | 指令与命令式语义一致 |
| AC-004 | T-02 | dependency/architecture test | covered | Platform 维持非 Web 纯度 |
| AC-005 | T-01, T-04 | navigation recovery test + Playwright | covered | 固定恢复顺序和请求次数 |
| AC-006 | T-01, T-03, T-04 | 菜单纯函数、Store、Client E2E | covered | 后端菜单权威 |
| AC-007 | T-03, T-04 | App Runtime 表驱动 test | covered | 特殊组件、ParentView、children、外链 |
| AC-008 | T-01, T-04 | manifest registry + Playwright | covered | 已选 manifest 与静态页面 |
| AC-009 | T-01, T-04, T-05 | 未知键 test、零匹配扫描、E2E | covered | manifest-only 失败关闭 |
| AC-010 | T-03, T-04 | 结构化诊断 + Admin 呈现 test | covered | 重复 route name 无 UI 反依赖 |
| AC-011 | T-01, T-04 | navigation Store、布局、Playwright | covered | 导航投影行为不变 |
| AC-012 | T-01, T-02, T-03, T-04 | 各层失败测试 + E2E | covered | 全链路失败关闭 |
| AC-013 | T-05 | legacy 扫描 + architecture tests | covered | 零兼容且阻止回流 |
| AC-014 | T-01..T-05 | 阶段 Evidence 与 checkpoint | covered | 每阶段绿色后推进 |
| AC-015 | T-05 | 根静态/单元/双构建/Playwright | covered | 最终全量 Gate |

不存在 uncovered 或 deferred 合同。

## 5. 并行与路径所有权

- implementation subagent 上限来自 `<Path>{roots.state}/specdev/config.json</Path>`，当前为 3；Goal Plan 可降低且不含 Lead。
- T-02 唯一拥有 Admin package manifest 与 lockfile；T-03 唯一拥有 Platform App Runtime。
- T-04 唯一拥有 Admin 迁移源码，但明确不写 Router 静态表；T-05 唯一拥有 Router legacy 收缩、架构工具和长期文档/Skill。
- Lead 始终拥有 SpecDev 状态、Evidence、父分支集成和父仓库 submodule pointer。

| Ticket A | Ticket B | Writable 交集 | 真实依赖 | 处理 |
|---|---|---|---|---|
| T-02 | T-03 | 无 | 否 | required 可并行；current 串行 |
| T-01 | T-02/T-03 | 无 | 是 | 先完成行为冻结 |
| T-02/T-03 | T-04 | 无，但公共 exports 被消费 | 是 | 两者均集成后开始 T-04 |
| T-04 | T-05 | 无；T-05 只读 T-04 生产源码 | 是 | 先迁移消费者，再 contract |

## 6. Gate、Wave 与集成点

- **Wave 0 / Baseline Gate：** T-01 E2E 绿色。
- **Wave 1 / Shared Contract Gate：** T-02、T-03 包级与架构验证分别绿色，并在 T-04 前都已进入父状态。
- **Wave 2 / Admin Migration Gate：** T-04 定向测试、静态门禁和 required E2E 绿色。
- **Wave 3 / Contract Gate：** T-05 legacy 零匹配、架构反向验证、文档同步和全量 Gate 绿色。

Goal Plan 使用 `required + candidate-merge`：前端 Ticket 使用独立 source worktree，Lead 串行集成 candidate。T-01 至 T-05 已全部集成，G-40 由完整根门禁、Playwright `39/39`、前端 result 与父仓库 pointer/docs commit 关闭；后续授权的 source branch/worktree 清理也已完成。

## 7. 横切契约与风险

- 后端按 Client 裁剪的身份、权限与菜单始终是权威；前端不重新授权。
- 恢复顺序固定为 `getInfo -> getRouters -> addRoute -> replace`，任一步失败不得继续。
- 当前为零兼容基座：不引入 alias、转发、功能开关、dual path 或弃用期。
- source-worktree 不运行或声明 E2E；required E2E 只能由 Lead 在 parent-candidate 执行。
- 前端子仓库先完成源码 commit 与验证，父仓库后同步 submodule pointer 和长期文档；后端子仓库不在范围内。
- 每个阶段失败都停止推进并按 Git checkpoint 恢复，不通过放宽门禁制造绿色。

## 8. 同步规则

- Ticket 状态变化后同步执行清单；Ticket frontmatter 是权威。
- Goal Plan 建立后，Wave、Gate、workspace、owner 和集成顺序以 `<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime/goal-plan.md</Path>` 为编排权威。
- 依赖、合同或路径所有权变化后重新运行 `<Path>{roots.workflows}/specdev/common/tools/validate-specdev.mjs</Path>`。
- 任一 Ticket 发现需修改其他 owner 路径时必须停止并按偏差流程修订，不能先改后报。
