# Archive And Consolidate Dry-run

> 生成时间：2026-08-29T09:15:05+08:00
> Workflow：specdev
> 模式：archive-single / dry-run
> Change：2026-08-28-plus-ui-shared-navigation-permission-runtime

## 路径上下文

| 名称 | 路径 |
|---|---|
| Project root | `<Path>.</Path>` |
| Workflow root | `<Path>{roots.workflows}/specdev</Path>` |
| State root | `<Path>{roots.state}/specdev</Path>` |
| Changes root | `<Path>{roots.state}/specdev/changes</Path>` |
| Archive root | `<Path>{roots.state}/specdev/archive</Path>` |
| Commands root | `<Path>{roots.commands}</Path>` |
| 永久 ADR store | `<Path>{roots.state}/specdev/adr</Path>` |
| 永久 Context store | `<Path>{roots.state}/specdev/context</Path>` |
| 永久 Research store | `<Path>{roots.state}/specdev/research</Path>` |

## 摘要

| 项目 | 数量 | 结论 |
|---|---:|---|
| 待归档 change | 1 | ready |
| 待提升永久 ADR | 3 | create |
| 待合并领域术语 | 5 | merge |
| Ephemeral 知识项组 | 5 | 留在归档 change |
| 待执行知识清理 | 0 | 无删除、合并或改写 |
| 冲突或需单项裁决 | 0 | 无 |

## 阶段一：归档计划

### 预检摘要

| 检查项 | 状态 | 证据 |
|---|---|---|
| Change 名称 | pass | 日期 kebab 格式合法 |
| Source directory | pass | `<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime</Path>` 存在 |
| Archive target | pass | `<Path>{roots.state}/specdev/archive/2026-08/2026-08-28-plus-ui-shared-navigation-permission-runtime</Path>` 不存在 |
| Change status | pass | `change_status=completed`，`completed_at=2026-08-28T23:19:58+08:00` |
| Completion blockers | pass | `blockers=[]`、`deviations=[]` |
| External reconcile | pass | `triage.external_action=not-applicable` |
| Ticket/worktree lifecycle | pass | T-01 至 T-08 全部 `removed`，集成与 E2E Evidence 保留 |
| Global index | pass | Change 在 `active` 中恰好一次，未出现在 `archived` |
| SpecDev complete validator | pass | `0 error(s), 0 warning(s)` |
| Product result | pass | `plus-ui-namewta/main@07962c7cad9ca4db168b3c423b9e3675f312a874` 包含全部 source/result |

### 移动与状态变更

| # | 来源 | 目标 | 动作 | 风险 | 状态 |
|---|---|---|---|---|---|
| 1 | `<Path>{roots.state}/specdev/changes/2026-08-28-plus-ui-shared-navigation-permission-runtime</Path>` | `<Path>{roots.state}/specdev/archive/2026-08/2026-08-28-plus-ui-shared-navigation-permission-runtime</Path>` | 原子移动整个 change 目录 | medium：移动后 active 路径失效，必须与索引更新同批验证 | ready |
| 2 | `<Path>{roots.state}/specdev/status.json</Path>` | 同文件 | 从 `active` 移除 change，向 `archived` 去重追加 change 名称 | medium：全局索引权威变更 | ready |
| 3 | 归档后的 `.status.json` | 同文件 | 设置 `change_status=archived`、`archived=true`、`archive_path`，清空 `current_work`，向 `works_run` 去重追加 `specdev/archive-and-consolidate` | medium：归档状态终态 | ready |

## 阶段一：知识提升计划

扫描来源包括 Change ADR、CONTEXT、LOG、Spec、Goal Plan、8 份 Evidence、CR-001、CR-002、Triage 和 ELI5 文档。现有永久 ADR-0012、ADR-0013、ADR-0015 是只读基线；以下候选补充其尚未覆盖的稳定边界，不 supersede 既有 ADR。

### ADR

#### [NEW] `0018-vue-web-permission-host.md`

- **来源：** Change ADR-001、LOG-004、T-02/T-06 Evidence。
- **毕业判定：** stable-mechanism + must-know。
- **内容摘要：** 跨终端权限算法保持无 Vue/DOM/Store；独立 Web Kit 通过注入 `AccessEvaluator` 提供 Vue 权限指令；具体 App 负责安装和会话接线。非法绑定或 evaluator 缺失时先移除 DOM，再显式抛错。
- **关系：** 补充 ADR-0013，不取代它。

#### [NEW] `0019-app-owned-navigation-and-shared-menu-runtime.md`

- **来源：** Change ADR-002、LOG-005/006、T-03/T-04/T-07 Evidence。
- **毕业判定：** stable-mechanism + must-know。
- **内容摘要：** 服务端菜单递归缩窄、纯转换和稳定诊断归 Platform App Runtime；Router、Pinia、布局、manifest 选择和诊断呈现归具体 App。共享层不建立公共 Router 或公共 navigation Store。
- **关系：** 补充 ADR-0012/0013，不取代它们。

#### [NEW] `0020-manifest-only-dynamic-page-resolution.md`

- **来源：** Change ADR-003、LOG-002/007、T-01/T-05/T-08 Evidence。
- **毕业判定：** stable-mechanism + must-know。
- **内容摘要：** 服务端动态页面只能解析为显式特殊宿主组件或当前 App 已选择的 `WebDomainManifest`；禁止 App 本地 views glob、空动态路由和兼容双轨兜底；未知键稳定诊断并失败关闭。
- **关系：** 强化 ADR-0015 的运行时约束，不取代它。

### Context

目标文件：`<Path>{roots.state}/specdev/context/plus-ui-multi-app-architecture-terms.md</Path>`。保留现有 Sources、术语和 `_Avoid_`，将来源 change 去重加入 Sources，并合并以下项目特有术语：

| 术语 | 定义摘要 | _Avoid_ | 毕业判定 |
|---|---|---|---|
| 应用导航装配 | App 将共享身份、权限和服务端菜单流程连接到自己的 Router、Store、布局和导航容器的薄层 | 公共 Router、公共 Admin Store | must-know |
| 权限宿主合同 | Web Domain 依赖、由宿主 App 提供的统一权限可见性接口，不替代后端鉴权 | 后端安全边界、Admin 私有权限算法 | must-know |
| Web 权限指令适配器 | 将跨终端权限求值器连接为 Vue 全局权限指令且不读取 App Store 的 Web Kit 能力 | Admin 权限指令、Platform 中的 Vue 指令 | stable-mechanism |
| 导航状态 Store | 由具体 App 拥有的侧栏、顶栏、默认路由和动态注册投影，不计算后端授权 | Permission Store、公共 Pinia Store | must-know |
| Manifest-only 动态页面 | 动态组件键仅解析为特殊宿主组件或当前 App 已选择的 WebDomainManifest 注册项 | App 本地 views 兜底、任意包路径加载 | stable-mechanism |

### Ephemeral

| 知识项 | 处理 | 原因 |
|---|---|---|
| 五个迁移阶段、Ticket Wave 与 candidate 编排 | 留在归档 change | 单次 change 的实施顺序 |
| CR-001 到 CR-002 的整改过程 | 留在归档 change | 历史评审轨迹，结论已由最终 ADR/Evidence 吸收 |
| Playwright overlay locator 的具体修复步骤 | 留在归档 change | 单次测试稳定性修复细节 |
| Worktree/branch 清理数量与路径 | 留在归档 change | 生命周期审计，不是永久架构知识 |
| Vite ineffective dynamic import warning | 留在归档 change | 既有局部限制，脱离当前 Evidence 会误导 |

## 阶段二：永久知识清理候选

扫描 `<Path>{roots.state}/specdev/adr</Path>`、`<Path>{roots.state}/specdev/context</Path>` 和 `<Path>{roots.state}/specdev/research</Path>`。

| 分类 | 数量 | 结果 |
|---|---:|---|
| delete | 0 | 无超过 30 天且无引用的 superseded ADR、退役术语或重复副本 |
| merge | 0 | 除本次明确的 Context 增量外，无现存知识副本需要合并 |
| rewrite | 0 | 未发现需要改写的相对时间或格式问题 |
| needs-confirmation | 0 | 无术语冲突、ADR 冲突或规则变更 |
| keep | 21 | 17 个 ADR、3 个 Context 文件和空 Research store 的 `.gitkeep` 均保留 |

### Keep 说明

- ADR-0001 至 ADR-0017 均创建不足 30 天，且仍被 active change、归档或项目文档引用。
- 3 个 Context 文件均描述当前术语并仍被引用。
- Research store 当前为空，按规则保留 `.gitkeep`。

## Confirmed 执行顺序

1. 重跑所有路径、状态、目标不存在性、Git/worktree 和 complete validator 预检；任何 drift 立即停止。
2. 创建归档月目录并原子移动 change。
3. 更新归档 `.status.json` 和全局 `status.json`，重读确认 active/archived 无重叠。
4. 创建 ADR-0018、ADR-0019、ADR-0020。
5. 合并 5 个术语及来源到 Plus UI 永久术语表。
6. 不执行任何永久知识删除、重写或清理。
7. 重跑归档状态重读、`--stage complete`、workflow self-check、JSON 和 Git diff 检查，并将结果补遗追加到本报告。

## 明确不执行

- 不归档密码策略或其他 completed change。
- 不修改产品源码、前后端 `main` 或 submodule pointer。
- 不提交、不推送、不关闭远程事项、不部署或执行生产动作。
- 不删除或改写任何现有永久 ADR、Context 或 Research 内容。

## 确认门

**未修改任何归档目标、永久知识或业务文件。此为 dry-run 计划；仅持久化了本报告并登记当前 Archive Work。请明确确认后再执行上述移动与知识写入。**

建议确认语句：`确认执行该 dry-run 计划，仅归档 2026-08-28-plus-ui-shared-navigation-permission-runtime。`

---

## Confirmed 执行补遗

> 用户确认：2026-08-29，`执行`
> 执行完成时间：2026-08-29T11:58:52+08:00
> 模式：executed
> Verification verdict：verified

### 实际执行

| 项目 | 结果 | 证据 |
|---|---|---|
| Change 原子移动 | moved | Source 已不存在；Archive target 完整存在 |
| 全局索引 | updated | 目标从 `active` 移除并在 `archived` 中恰好出现一次；两者无重叠 |
| 归档状态 | updated | `change_status=archived`、`archived=true`、`current_work=null`、archive path 正确 |
| Work 历史 | updated | `specdev/archive-and-consolidate` 去重追加一次 |
| ADR-0018 | created | Vue Web 权限宿主与跨终端权限算法分层 |
| ADR-0019 | created | App 自有导航状态与共享菜单纯运行时分层 |
| ADR-0020 | created | 服务端动态页面仅使用 Manifest 显式解析 |
| Plus UI Context | merged | 5 个术语各出现一次，Sources 已加入来源 change |
| 永久知识清理 | skipped as planned | 无删除、改写或额外合并候选 |

### 并发状态保护

执行期间，全局索引中的密码策略和运行时代码生成器 change 被其他流程完成归档。首次状态补丁因索引漂移被 `apply_patch` 保护性拒绝，未产生部分文件修改；重读最新索引后，仅移除本目标 active 条目并追加本目标 archived 名称，完整保留两项并发归档结果。

运行时代码生成器流程还将 frontend `main` 从本 change 固定结果 `07962c7cad9ca4db168b3c423b9e3675f312a874` 推进到 `f0ea5706362af7a69f2af9ad8edb8f38ba49f081`，将 backend `main` 从 `42e06c0f713e0d724813800505e5bb5b40ab563b` 推进到 `8d401907b6be81c36f92cf88e73e1dee61fd26a4`。两个旧结果分别仍是新 `main` 的祖先，因此本 change 的集成事实未失效；本归档流程没有修改两个产品仓库。

### 重读验证

| 检查 | 结果 |
|---|---|
| Source 不存在、target 完整 | pass |
| 8 个 Ticket、8 份 Evidence、Spec、Goal Plan、CR-002 完整 | pass |
| 全局 active/archived 唯一性与无重叠 | pass |
| 归档 `.status.json` JSON 与终态字段 | pass |
| 3 个 ADR 非空且编号唯一 | pass |
| 5 个 Context 术语和来源唯一 | pass |
| `git diff --check` | pass |
| 归档前 `--stage complete` | `0 errors / 0 warnings` |
| 归档目录无 stage 校验 | `0 errors / 1 warning`；warning 仅说明正在 archive root 校验 archived change |
| Workflow `--self-check` | `0 errors / 0 warnings` |

### 校验器限制

归档后再次指定 `--stage complete` 会得到 `complete stage requires change_status=completed`。该参数当前不接受正确的 `archived` 终态，因此执行后改用无 stage 校验并取得 0 errors；归档前已在 `completed` 状态对同一 change 运行 `--stage complete` 且为 0/0。此限制不代表归档状态不一致。

### 未执行项

- 未修改产品源码、前后端分支或 submodule pointer。
- 未提交、推送、部署、关闭远程事项或执行生产动作。
- 未归档除本计划目标外的 change；并发归档由其他流程拥有，本执行仅予以保留。
