# Archive And Consolidate Dry-run

> 生成时间：2026-09-02T11:29:18+08:00
> Workflow：specdev
> 模式：archive-batch / dry-run
> 范围：仅用户指定的 5 个 completed change

- `2026-08-31-optional-nacos-dynamic-config`
- `2026-09-01-admin-runtime-capability-reconciliation`
- `2026-09-01-harden-namewta-full-stack-deployment-skill`
- `2026-09-01-release-artifacts-mysql-baseline-consolidation`
- `2026-08-30-openapi-common-module`

## 路径上下文

| 名称 | 路径 |
|---|---|
| Project root | `<Path>.</Path>` |
| Workflow root | `<Path>{roots.workflows}/specdev/</Path>` |
| State root | `<Path>{roots.state}/specdev/</Path>` |
| Changes root | `<Path>{roots.state}/specdev/changes/</Path>` |
| Archive root | `<Path>{roots.state}/specdev/archive/</Path>` |
| Commands root | `<Path>{roots.commands}/</Path>` |
| 永久 ADR store | `<Path>{roots.state}/specdev/adr/</Path>` |
| 永久 Context store | `<Path>{roots.state}/specdev/context/</Path>` |
| 永久 Research store | `<Path>{roots.state}/specdev/research/</Path>` |

所有受管真实路径均位于项目根和 SpecDev state root 内；没有符号链接逃逸。永久 ADR、Context、Research store 均存在。

## Dry-run 状态写入说明

本轮未移动 change、未写永久知识、未删除或改写 Git ref/worktree，也未修改产品源码。调用方只执行了以下可恢复的工作流管理写入：

1. 为 5 个 change 在全局和 change 状态中登记 `current_work=specdev/archive-and-consolidate`。
2. 根据已提交的 completed change 状态、Goal Plan、Evidence 和 commit `75eb2aca3506e7d2fbf518a57f61984cb9c08ca0`，将此前漏记的 `2026-09-01-release-artifacts-mysql-baseline-consolidation` 恢复到全局 `active` 索引；没有补造或改写其完成结论。
3. 持久化本 dry-run 报告。

现有用户修改 `2026-08-24-login-register-client-dynamic-routing-eli5.current_work=specdev/implement` 原样保留。

## 摘要

| 项目 | 数量 | 结论 |
|---|---:|---|
| 待归档 change | 5 | 4 ready、1 blocked；批量原子执行当前 blocked |
| 完成态校验 | 5 | 每项 `0 error(s), 0 warning(s)` |
| 待新建永久 ADR | 17 | ADR-0026 至 ADR-0042 |
| 待新建 Context 文件 | 3 | Nacos、OpenAPI、MySQL 发布基线，共 39 个术语 |
| Ephemeral 知识组 | 8 | 随归档 change 保留，不提升 |
| 永久知识删除/改写 | 0 | 不删除、不改写现有知识 |
| Git 清理前置 | 19 个子仓分支 + 1 个父候选 worktree/branch | 需显式确认 |
| 需确认动作组 | 3 | Git 清理、归档移动、永久知识写入 |

## 阶段一：归档计划

### 共同预检

| 检查项 | 状态 | 证据 |
|---|---|---|
| Changes/archive roots | pass | 可访问，归档月目录可创建 |
| `status.json` | pass after index repair | schema v5 可解析；5 项均在 `active` 中恰好一次，均不在 `archived` |
| Change 名称 | pass | 5 项均符合日期 kebab 格式 |
| Archive targets | pass | 5 个目标均不存在 |
| Change completion | pass | 均为 `completed`，有 `completed_at`，blockers 为空 |
| Ticket/Goal/Evidence | pass | Ticket 全 done，Goal Plan/Map completed，integration/full-suite/E2E disposition 完整 |
| Completion validator | pass | 5 项 `--stage complete` 均为 `0 error(s), 0 warning(s)` |
| External reconcile | pass | 部署 Skill change 的 `external_action=not-applicable`；其余无远程 source/triage 工件 |
| Workflow self-check | pass | `0 error(s), 0 warning(s)` |
| OpenAPI source cleanup | **blocked** | required worktree 记录仍为 `integrated`；19 个已合并子仓分支和 1 个父候选 worktree/branch 尚未清理，`source_cleanup` 仍为 `not-authorized` |

### 逐项移动

| # | 来源 | 目标 | 动作 | 风险 | 状态 |
|---|---|---|---|---|---|
| 1 | `<Path>{roots.state}/specdev/changes/2026-08-31-optional-nacos-dynamic-config/</Path>` | `<Path>{roots.state}/specdev/archive/2026-08/2026-08-31-optional-nacos-dynamic-config/</Path>` | 原子移动整个 change | medium | ready |
| 2 | `<Path>{roots.state}/specdev/changes/2026-09-01-admin-runtime-capability-reconciliation/</Path>` | `<Path>{roots.state}/specdev/archive/2026-09/2026-09-01-admin-runtime-capability-reconciliation/</Path>` | 原子移动整个 change | medium | ready |
| 3 | `<Path>{roots.state}/specdev/changes/2026-09-01-harden-namewta-full-stack-deployment-skill/</Path>` | `<Path>{roots.state}/specdev/archive/2026-09/2026-09-01-harden-namewta-full-stack-deployment-skill/</Path>` | 原子移动整个 change | medium | ready |
| 4 | `<Path>{roots.state}/specdev/changes/2026-09-01-release-artifacts-mysql-baseline-consolidation/</Path>` | `<Path>{roots.state}/specdev/archive/2026-09/2026-09-01-release-artifacts-mysql-baseline-consolidation/</Path>` | 原子移动整个 change | medium | ready after index repair |
| 5 | `<Path>{roots.state}/specdev/changes/2026-08-30-openapi-common-module/</Path>` | `<Path>{roots.state}/specdev/archive/2026-08/2026-08-30-openapi-common-module/</Path>` | 清理 Git 生命周期后原子移动 | high | blocked pending explicit cleanup approval |

批量原子性：当前不移动任何一项。只有 OpenAPI Git 生命周期清理完成并重跑全部预检后，5 项才共同进入 ready。

### OpenAPI Git 清理前置计划

所有列出的 source/integration commit 均已验证为对应子仓当前 `main` 的祖先；父候选 commit `41d2a30cb4b9ea24a00d870d319fd4ad59f2ebf3` 已验证为父仓当前 `main` 的祖先。12 个 source worktree 和 Ticket candidate worktree 均已不存在；现存父候选 worktree clean，未发现未提交内容。

| 仓库 | 动作 | 精确范围 | 状态 |
|---|---|---|---|
| `<Path>plus-ui-namewta/</Path>` | 删除已合并本地分支 | source T-10/T-11；integration T-10/T-11，共 4 个 | needs-confirmation |
| `<Path>ruoyi-vue-plus-namewta/</Path>` | 删除已合并本地分支 | source T-01..T-09/T-12；integration T-06..T-09/T-12，共 15 个 | needs-confirmation |
| 父仓 Git worktree | 移除 clean 父候选 worktree | branch `speculo/integration/2026-08-30-openapi-common-module/parent` | needs-confirmation |
| 父仓 Git branch | 删除已合并父候选分支 | commit `41d2a30cb4b9ea24a00d870d319fd4ad59f2ebf3` | needs-confirmation |
| OpenAPI change 状态 | 更新清理授权与生命周期 | `source_cleanup=authorized`；T-01..T-12 `status=removed`；保留全部 integration/Evidence 字段 | needs-confirmation |

只删除上表精确列出的本地分支和 clean worktree；不触碰远端 ref、当前 `main`、其他 Speculo worktree/branch 或两个子仓当前脏工作树。

### 归档状态变更

- 从 `<Path>{roots.state}/specdev/status.json</Path>` 的 `active` 移除 5 项，向 `archived` 去重追加 5 个名称。
- 归档后的 5 个 `.status.json` 设置 `change_status=archived`、`archived=true`、`current_work=null` 和正确 `archive_path`。
- 5 项 `works_run` 去重追加 `specdev/archive-and-consolidate`；保留原 `completed_at`、deviations、worktree integration 和 Evidence。
- 除计划内 Work 登记、OpenAPI cleanup lifecycle 和 archive 字段外，不改写历史工件。

## 阶段一：知识提升计划

扫描了 5 个 change 的 105 个文件，包括 ADR、CONTEXT、LOG、Diagnosis、Spec、Ticket、Map、Goal Plan、Evidence、诊断脚本、ELI5 与实施计划；以当前代码、后续 change 和永久知识裁决旧结论。

### 永久 ADR 新建计划

| ADR | 来源 | 动作与内容摘要 | 毕业判定 |
|---|---|---|---|
| ADR-0026 `optional-nacos-overlay-lifecycle` | Nacos ADR-001/009/012 | Nacos 默认关闭、显式启用，只作本地完整 YAML 上的稀疏覆盖；删除回退本地，运行失联保留上一有效覆盖，离线重启禁用持久快照 | stable-mechanism + must-know |
| ADR-0027 `thin-common-nacos-and-official-server` | Nacos ADR-002 | `ruoyi-common-nacos` 只拥有客户端/刷新能力；Server 使用固定官方镜像，不进入业务模块或仓库内嵌 Server | stable-mechanism |
| ADR-0028 `deployment-priority-and-nacos-bootstrap-protection` | Nacos ADR-004 | 命令行/环境变量高于 Nacos；Nacos 高于 profile/base YAML；保护 Nacos 自身和 profile 引导键 | stable-mechanism + must-know |
| ADR-0029 `secured-standalone-nacos-baseline` | Nacos ADR-005/011 | 固定 Nacos 2.5.4 standalone、独立 MySQL 最小权限、鉴权、本机端口、健康门与同源控制台；不宣称生产 HA | stable-mechanism |
| ADR-0030 `nacos-live-and-restart-configuration-classes` | Nacos ADR-006 | 只有明确清单且经验证的属性即时生效，其余合法配置重启生效，状态必须区分 | stable-mechanism + must-know |
| ADR-0031 `official-nacos-console-management-boundary` | Nacos ADR-007 + Admin ADR-003 | 复用 official console external iframe 和 Nacos 独立认证，不建设 RuoYi CRUD/SSO；当前入口为“系统监控 > Nacos配置中心” | stable-mechanism |
| ADR-0032 `accepted-plaintext-nacos-secret-storage` | Nacos ADR-008 | 明确接受敏感配置在 Nacos/MySQL 中明文静态存储，依赖网络、鉴权、最小权限和禁止输出降低风险 | must-know |
| ADR-0033 `per-instance-nacos-subscription-and-status` | Nacos ADR-010 | 每个 admin 实例直接订阅并独立报告版本摘要、校验与应用状态，不引入 Bus 或返回正文 | stable-mechanism |
| ADR-0034 `versioned-openapi-hmac-ingress-security` | OpenAPI ADR-002/017 + LOG-027 | 版本化 HMAC-SHA256 canonical request；nonce 只防重放；AppKey/接口双限流；Redis 不可用失败关闭；TLS 推荐但不作为验签前置 | stable-mechanism + must-know |
| ADR-0035 `typed-openapi-runtime-system-ownership` | OpenAPI ADR-003 | common 拥有注解、协议、注册表和窄 SPI；system 拥有凭据、用户授权与持久化；admin 只装配，不引入通用 CommandBus | stable-mechanism |
| ADR-0036 `global-openapi-identity-for-client-independent-endpoints` | OpenAPI ADR-008/018/019 | AppKey 只绑定 userId；聚合用户合法 Client 的当前权限；机器请求不发送/猜测 Client；仅 Client 无关方法可开放 | stable-mechanism + must-know |
| ADR-0037 `satoken-openapi-machine-session-invalidation` | OpenAPI ADR-005/009/010/016 | 每次先验签，再以服务端内部 TokenSession 缓存标准 LoginUser；授权变化复用集群确认注销，miss 时只读重建 | stable-mechanism + must-know |
| ADR-0038 `single-encrypted-openapi-credential` | OpenAPI ADR-006/007 | 每用户最多一个有效 AppKey/加密 secret；secret 只显示一次；重置立即切换，禁用/删除使旧凭据失效 | stable-mechanism |
| ADR-0039 `separate-openapi-management-and-invocation-authorization` | OpenAPI ADR-004/011/012 | 管理面使用当前 Client 的菜单/按钮权限，调用面恢复目标用户权限；目录预览与调用共享授权解析器且不借用查看者权限 | stable-mechanism + must-know |
| ADR-0040 `dual-openapi-ui-entry-shared-system-domain` | OpenAPI ADR-013/014/020 + Admin ADR-003 | 当前“系统管理 > OpenAPI管理”和个人“开放应用”Tab 复用同一 system domain/web-domain，只改变 owner scope | stable-mechanism |
| ADR-0041 `default-off-managed-openapi-enablement` | Admin ADR-001 + 部署 Skill profile v2 Evidence | OpenAPI 代码/公开发布样例默认关闭；受管环境显式提供 enable/version/KEK；启用但安全配置无效时启动失败 | stable-mechanism + must-know |
| ADR-0042 `release-artifacts-owned-mysql-baseline` | MySQL baseline DEC-001..008 | `<Path>release-artifacts/</Path>` 唯一拥有 6 份可直接迭代的 MySQL 完整基座；fresh 顺序导入，upgrade 以 Git Tag 差异、备份和隔离演练执行，不重放完整基座 | stable-mechanism + must-know |

ADR-0042 与 ADR-0011 互补：ADR-0011 继续表达 MySQL-only 产品支持面，ADR-0042 表达发布资产 owner 和基座演进合同；不建立 supersede 关系。

### Context 新建计划

| 目标 | 来源 | 动作 | 当前术语 |
|---|---|---|---|
| `<Path>{roots.state}/specdev/context/nacos-dynamic-config-terms.md</Path>` | Nacos CONTEXT + Admin 最终菜单 Evidence | create，13 项 | Nacos 配置覆盖层、本地配置基线、ruoyi-common-nacos、Nacos 配置管理入口、部署层强制值、环境配置单元、Nacos 单机持久化基线、即时生效配置清单、重启生效配置、上一有效覆盖、Nacos 普通敏感配置、实例配置状态、Nacos 显式启用 |
| `<Path>{roots.state}/specdev/context/openapi-platform-terms.md</Path>` | OpenAPI CONTEXT + Admin runtime Evidence | create，22 项 | 开放凭据、开放接口、NAMEWTA 签名协议、OpenAPI 管理面、开放应用 Tab、双入口单能力、管理面与调用面、OpenAPI 运行时端口、开放接口目录、OpenAPI 全局身份、OpenAPI 机器会话、调用期权限缓存、授权快照重建、可调用接口预览、复用优先适配层、OpenAPI 授权会话失效、前端承接位置、OpenAPI 防重放、OpenAPI 两级限流、合法 OpenAPI Client 集合、Client 无关开放接口、受管 OpenAPI 启用态 |
| `<Path>{roots.state}/specdev/context/mysql-release-baseline-terms.md</Path>` | MySQL baseline Spec/Evidence | create，4 项 | MySQL 发布基座、全新初始化、已有数据库升级、NAMEWTA DDL/DML 分层 |

合并时使用当前真相：旧“Nacos 位于系统管理”和“应用开放管理”名称不提升，分别收敛为“系统监控 > Nacos配置中心”和“系统管理 > OpenAPI管理”。OpenAPI 的前端 Client 身份、HTTP 安全正文审计和首期轻量门禁不复制到新 Context，分别由现有 Client/权限术语、ADR-0025/系统运行日志术语和历史 Evidence 持有。

### Ephemeral：不提升，随归档保留

| 来源 | 知识组 | 跳过原因 |
|---|---|---|
| Nacos | 已被 official console 取代的自建配置 CRUD ADR-003 | superseded 历史 |
| Nacos | ELI5 叙事、具体端口探针迭代、测试 harness 修正 | 单 change 实施与调试证据 |
| OpenAPI | 已被全局身份取代的 clientPk 凭据 ADR-001；被后续范围修正的旧首期 UI 范围 | superseded 历史 |
| OpenAPI | 安全正文审计 ADR-015 | 已由永久 ADR-0025 和现有 Context 持有 |
| OpenAPI | 首期轻量模块门禁 ADR-021 与具体测试数量 | 阶段性验收策略，不是长期架构 |
| Admin runtime | append-only 尾部块、菜单迁移步骤、开发库无备份 ADR-005 和现场故障过程 | 后续 MySQL baseline 已替代旧 SQL 合同；备份 waiver 仅适用一次开发环境 |
| Deployment Skill | profile/state v2 字段细节、工具/模板结构和测试数量 | 现役权威已在 `<Path>.agents/skills/deploy-namewta-environment/</Path>`，重复提升会漂移；该 change Spec 明确 ADR 不适用 |
| MySQL baseline | 87 表现场计数、MySQL warning、临时容器路径和迁移中间步骤 | 验收/现场细节；稳定 owner 与 fresh/upgrade 合同已进入 ADR-0042/Context |

## 阶段二：永久知识清理候选

已扫描 25 个现有 ADR、5 个现有 Context 文件和 Research store 的 `.gitkeep`，并交叉检查代码、文档、active changes 和 archive 引用。

| 分类 | 数量 | 结果 |
|---|---:|---|
| delete | 0 | 没有超过 30 天且无引用的 superseded ADR、空知识文件或无引用退役术语 |
| merge | 0 | 除本计划新增并去重的 ADR/Context 外，无额外相似知识需要合并 |
| rewrite | 0 | 不改写现有 ADR/Context；当前内容无必须修复的相对时间或格式问题 |
| needs-confirmation | 0 | 永久知识内无定义冲突；Git 清理和新增知识的确认在本计划其他章节 |
| keep | 31 | 25 个 ADR、5 个 Context 文件和 Research `.gitkeep` 全部保留 |

不修改工程 Skill 或产品文档；这些位置已经由各 change 的实现提交同步到当前事实。

## Confirmed 执行顺序

1. 重新检查 5 个 source/target、全局索引、完成 validator、外部 reconcile、永久 store 和来源摘要；未计划 drift 立即停止。
2. 按“OpenAPI Git 清理前置计划”删除精确列出的已合并本地分支与 clean 父候选 worktree/branch，更新 cleanup authorization 和 12 条 worktree lifecycle，然后重跑完整批量预检。
3. 预检全部 ready 后创建 2026-09 月目录，并将 5 个 change 原子移动到各自月份；任一步失败停止并报告实际状态，不继续知识写入。
4. 更新归档状态和全局索引，重读 source 不存在、target 完整、active/archived 无重叠。
5. 创建 ADR-0026 至 ADR-0042 和 3 个 Context 文件；每项写入当前日期、来源 change 与归档路径，不改写现有 ADR/Context。
6. 不执行任何永久知识删除、额外合并或改写。
7. 重跑归档 JSON/状态检查、`--stage complete`、workflow self-check、Git ref/worktree 检查、永久知识唯一性和 `git diff --check`。
8. 把执行结果、命令退出码、drift 和未执行项作为补遗追加到本报告。

## 明确不执行

- 不归档用户未指定的其他 completed/active change。
- 不修改产品源码、数据库、Redis、服务器、远端分支或 submodule pointer。
- 不提交、不推送、不部署、不发布、不关闭远程事项。
- 不删除 OpenAPI 之外的 branch/worktree，也不清理两个子仓当前工作树中的用户改动。
- 不删除或改写现有永久 ADR、Context、Research、工程 Skill 或产品文档。

## 验证记录

| 验证 | 结果 |
|---|---|
| 5 个 change `--stage complete` | 全部 `0 errors / 0 warnings` |
| Workflow `--self-check` | `0 errors / 0 warnings` |
| 全局与 5 个 change 状态 JSON parse | pass |
| Archive target 不存在 | 5/5 pass |
| External reconcile | 5/5 pass |
| OpenAPI source/candidate commit 已进入当前产品 `main` | 12/12 Ticket pass；父候选 pass |
| OpenAPI 遗留 worktree dirtiness | 现存父候选 clean；Ticket source/candidate worktree 均不存在 |
| Dry-run 管理改动 `git diff --check` | pass |

## 结构化结论

```json
{
  "mode": "dry-run",
  "scope": "archive-batch-user-selected",
  "archive_plan": {
    "selected": 5,
    "ready": 4,
    "blocked": 1,
    "atomic_verdict": "blocked-pending-openapi-git-cleanup-approval"
  },
  "consolidation_plan": {
    "create_adr": 17,
    "create_context_files": 3,
    "context_terms": 39,
    "rewrite_existing": 0,
    "delete_existing": 0
  },
  "verification": {
    "re_read_passed": true,
    "verdict": "blocked"
  }
}
```

## 确认门

**尚未移动任何 change，未写永久知识，未删除任何 branch/worktree。当前只持久化本 dry-run 报告、登记当前 Work，并修复 MySQL baseline 的漏记 active 索引。请明确确认后，才能执行 OpenAPI 本地 Git 清理、5 项原子归档和上述永久知识创建。**

建议确认语句：`确认执行 2026-09-02 specdev batch dry-run 计划：清理计划内 OpenAPI 已合并本地分支和 clean 父候选 worktree/branch，原子归档这 5 个 change，并创建 ADR-0026 至 ADR-0042 及 3 个 Context 文件。`

---

## Confirmed 执行中断补遗

> 用户确认：2026-09-02，`执行`
> 检查时间：2026-09-02T11:51:30+08:00
> 当前 verdict：blocked-pending-expanded-source-worktree-cleanup-approval

执行前重跑 5 个完成态校验、source/target、全局索引和 Git 祖先检查，均通过。开始计划内 Git 清理后发现 dry-run 的“12 个 source worktree 和 Ticket candidate worktree 均已不存在”判断错误：这些 worktree 不位于父仓 `<Path>specdev-worktree/</Path>`，而分别位于两个子仓自己的 `specdev-worktree` 下。

### 已执行

| 动作 | 结果 |
|---|---|
| 移除父仓 OpenAPI parent-candidate worktree | pass；执行前 clean，commit 已进入父仓当前 `main` |
| 删除父仓 `speculo/integration/2026-08-30-openapi-common-module/parent` | pass；已合并分支，使用安全 `git branch -d` |

### 安全拒绝且未产生删除

| 动作 | 结果 |
|---|---|
| 删除 19 个子仓 OpenAPI 分支 | Git 全部拒绝，因为分支仍被对应子仓 worktree 使用；没有任何子仓分支被删除 |

### 新发现的精确范围

| 子仓 | Clean source worktree | Clean candidate worktree | 合计 |
|---|---:|---:|---:|
| `<Path>plus-ui-namewta/</Path>` | T-10、T-11，共 2 | T-10、T-11，共 2 | 4 |
| `<Path>ruoyi-vue-plus-namewta/</Path>` | T-01..T-09、T-12，共 10 | T-06..T-09、T-12，共 5 | 15 |

19 个 worktree 的 `git status --porcelain` 均为空，HEAD 与计划列出的 branch commit 一致，且均为对应子仓当前 `main` 的祖先。删除它们不会修改两个子仓当前 `main` 工作树，但 worktree 目录移除属于 dry-run 未精确列出的破坏性动作，必须取得新增确认。

### 尚未执行

- 未移除 19 个子仓 OpenAPI source/candidate worktree，未删除其 19 个分支。
- 未更新 OpenAPI `source_cleanup` authorization 或 12 条 worktree lifecycle。
- 未移动任何 change，未修改全局 archived 索引。
- 未创建 ADR-0026 至 ADR-0042 或 3 个 Context 文件。
- 未修改或清理两个子仓当前用户工作树。

Archive Work 保持可恢复；取得新增确认后，从逐个移除上述 19 个 clean worktree 开始，随后使用安全 `git branch -d` 删除其已合并分支，再重跑批量预检并继续原计划。

---

## Confirmed 执行完成补遗

> 用户追加确认：2026-09-02，`确定`
> 完成时间：2026-09-02T12:19:16+08:00
> 最终 verdict：verified

追加确认后，逐一复核 19 个子仓 OpenAPI worktree：全部 clean，HEAD 与对应分支一致，分支提交均为各自子仓当前 `main` 的祖先。随后只对确认范围执行清理，并继续原 dry-run 的归档与知识提升计划。

### 实际执行结果

| 动作 | 结果 |
|---|---|
| 父仓 OpenAPI candidate 清理 | pass；1 个 clean worktree 与 1 个已合并本地分支已移除 |
| 前端子仓 OpenAPI 清理 | pass；4 个 clean source/candidate worktree 与 4 个已合并本地分支已移除 |
| 后端子仓 OpenAPI 清理 | pass；15 个 clean source/candidate worktree 与 15 个已合并本地分支已移除 |
| OpenAPI lifecycle | pass；`source_cleanup=authorized`，T-01..T-12 worktree 状态均为 `removed`，integration/Evidence 保留 |
| 5 项归档移动 | pass；分别保留 24、14、14、18、35 个文件，移动前后逐文件 SHA-1 汇总一致 |
| 全局与 change 状态 | pass；5 项从 `active` 移除并在 `archived` 各出现一次，归档状态、路径和 Work 字段一致 |
| 永久 ADR | pass；创建 ADR-0026 至 ADR-0042，共 17 条，编号唯一；现有 ADR 未改写 |
| 永久 Context | pass；创建 3 个文件，Nacos 13 项、OpenAPI 22 项、MySQL 4 项，共 39 个术语 |
| 永久知识清理 | pass；删除 0、改写 0、额外合并 0 |

### 执行后验证

| 验证 | 结果 |
|---|---|
| 归档前 5 项 `--stage complete` | 5/5 pass，均为 `0 error(s), 0 warning(s)` |
| 源/目标与文件完整性重读 | pass；5 个源路径均不存在，5 个归档目标完整，文件数与移动前一致 |
| 全局索引与 5 个归档 `.status.json` | pass；JSON 可解析，active/archived 无重叠，`change_status=archived`、`archived=true`、`archive_path` 正确 |
| OpenAPI Git 生命周期残留 | pass；父 candidate、19 个子仓 worktree 及其 20 个计划内本地分支均不存在；其他 worktree 保留 |
| ADR/Context store | pass；ADR 总数 42，新增编号唯一；3 个 Context 的术语总数为 39 |
| Workflow `--self-check` | pass，`0 error(s), 0 warning(s)` |
| `git diff --check` 与新增知识尾随空白 | pass |
| 归档后再次运行 `--stage complete` | 工具阶段不适用：验证器固定要求 `change_status=completed`，因此每个正确归档目录均报告 1 个该状态错误和 1 个 archived 位置警告；归档前同内容已 5/5 通过，执行后改用 archive-rules 状态重读完成验证 |

未执行产品源码修改、数据库写入、服务器部署、远端 ref 操作、提交或推送。未清理 OpenAPI 范围之外的 branch/worktree，也未改写用户已有工作树修改。

## 最终结构化结论

```json
{
  "mode": "executed",
  "scope": "archive-batch-user-selected",
  "archive_plan": {
    "selected": 5,
    "moved": 5,
    "failed": 0
  },
  "source_cleanup": {
    "parent_worktrees_removed": 1,
    "child_worktrees_removed": 19,
    "merged_local_branches_removed": 20,
    "unexpected_targets_removed": 0
  },
  "consolidation": {
    "created_adr": 17,
    "created_context_files": 3,
    "context_terms": 39,
    "rewritten_existing": 0,
    "deleted_existing": 0
  },
  "verification": {
    "pre_archive_complete_validator_passed": 5,
    "archive_state_re_read_passed": true,
    "workflow_self_check_passed": true,
    "inconsistencies": [],
    "tooling_notes": [
      "validate-specdev --stage complete only accepts pre-archive change_status=completed"
    ],
    "verdict": "verified"
  }
}
```
