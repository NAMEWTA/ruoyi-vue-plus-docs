# Archive And Consolidate Dry-run

> 生成时间：2026-08-31T15:29:40+08:00
> Workflow：specdev
> 模式：archive-batch / dry-run
> 范围：仅下列两个用户指定 change

- `2026-08-29-login-password-policy-runtime-and-http-log-redaction`
- `2026-08-29-ruoyi-admin-system-classpath-build-failure`

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

所有真实路径均位于项目根和 SpecDev state root 内；未发现符号链接逃逸。

## 摘要

| 项目 | 数量 | 结论 |
|---|---:|---|
| 待归档 change | 2 | ready；批量原子执行 |
| 待新建永久 ADR | 1 | create ADR-0025 |
| 待标记 superseded ADR | 1 | ADR-0017 |
| 待合并 Context 来源 | 1 | system runtime log terms |
| 待改写 Context 术语 | 1 | needs-confirmation |
| Ephemeral 知识项组 | 6 | 留在各归档 change |
| 独立清理候选 | 0 | 无删除、额外合并或额外改写 |
| 需确认项 | 2 | ADR 替代关系与 Context 实质改写 |

## 阶段一：归档计划

### 共同预检

| 检查项 | 状态 | 证据 |
|---|---|---|
| Changes/archive roots | pass | 目录可访问，真实路径位于 state root 内 |
| `status.json` | pass | schema v5 可解析；active 与 archived 各自唯一且无重叠 |
| Change 名称 | pass | 两项均符合日期 kebab 格式 |
| Archive targets | pass | 两个 `<Path>{roots.state}/specdev/archive/2026-08/{change}</Path>` 均不存在 |
| Change completion | pass | 两项均为 `change_status=completed`，有 `completed_at`，blockers/deviations 为空 |
| Completion validator | pass | 两项 `--stage complete` 均为 `0 error(s), 0 warning(s)` |
| External reconcile | pass | 两项均无 `triage.md` 或远程来源；Spec sources 是本地 user report/decision 与 diagnosis，按 `not-applicable` 处理 |
| Ticket/worktree lifecycle | pass | Direct Spec；无 Ticket、Goal Plan、candidate 或 worktree；Evidence 明确未获 commit/push/merge/deploy 授权 |
| Global index | pass | 两项在 `active` 中各恰好一次，均不在 `archived` |
| Product verification | pass | 两份 Direct Spec Evidence 均为 done；合同全 pass；实现目录 `git diff --check` 为 pass |
| Workflow self-check | pass | `0 error(s), 0 warning(s)` |

### 逐项移动

| # | 来源 | 目标 | 动作 | 风险 | 状态 |
|---|---|---|---|---|---|
| 1 | `<Path>{roots.state}/specdev/changes/2026-08-29-login-password-policy-runtime-and-http-log-redaction</Path>` | `<Path>{roots.state}/specdev/archive/2026-08/2026-08-29-login-password-policy-runtime-and-http-log-redaction</Path>` | 原子移动整个 change 目录 | medium：移动后 active 路径失效，必须与索引同批验证 | ready |
| 2 | `<Path>{roots.state}/specdev/changes/2026-08-29-ruoyi-admin-system-classpath-build-failure</Path>` | `<Path>{roots.state}/specdev/archive/2026-08/2026-08-29-ruoyi-admin-system-classpath-build-failure</Path>` | 原子移动整个 change 目录 | medium：同批任一预检 drift 会阻塞两项 | ready |

### 状态变更

- 从 `<Path>{roots.state}/specdev/status.json</Path>` 的 `active` 移除两个目标，向 `archived` 去重追加两个名称；保留所有其他条目及现有 `2026-08-30-openapi-common-module` 工作状态。
- 两个归档 `.status.json` 设置 `change_status=archived`、`archived=true`、正确的项目相对 `archive_path`、`current_work=null`。
- 两个归档 `.status.json` 的 `works_run` 去重追加 `specdev/archive-and-consolidate`；不改写完成时间与既有 Evidence。
- 执行前比较 dry-run 后的来源工件摘要；除预期 Archive Work 登记外出现 drift 时停止，不进行部分移动。

## 阶段一：知识提升计划

扫描来源包括两项 change 的 Diagnosis、Spec、Direct Spec Evidence 与状态。两项 change 均无独立 ADR、CONTEXT、LOG、Ticket、Goal Plan、Review、Prototype 或 Questionnaire。

### [NEW] ADR-0025：HTTP 运行日志凭据脱敏与失败关闭

- **来源 change：** `2026-08-29-login-password-policy-runtime-and-http-log-redaction`。
- **目标：** `<Path>{roots.state}/specdev/adr/0025-http-runtime-log-credential-redaction.md</Path>`。
- **动作：** create。
- **毕业判定：** stable-mechanism + must-know。
- **决策上下文：** ADR-0017 曾显式允许专用 HTTP logger 原样持久化认证凭据；真实登录故障日志确认 Authorization、Cookie 与 JSON 凭据进入日志，当前实现与测试已经撤销该安全例外。
- **决策内容：** 请求/响应敏感头与请求参数按归一化名称替换为 `[REDACTED]`；JSON 日志副本递归脱敏密码、token、secret、session、captcha 等字段；非法或截断 JSON 整段失败关闭；只处理日志副本，不改变 Servlet 业务正文、认证或加解密行为；普通元数据和非敏感字段继续保留。
- **后果：** 凭据不再作为运行日志排障材料；敏感/不可可靠解析的正文可见性降低，换取不可重放的持久日志。普通调用关联、状态、耗时和非敏感字段仍可观测。
- **风险：** medium；这是对现役安全决策的替换，需要用户随归档计划明确确认。

### [SUPERSEDE] ADR-0017

- **目标：** `<Path>{roots.state}/specdev/adr/0017-raw-http-credential-runtime-logging.md</Path>`。
- **动作：** 在文件开头按永久 ADR 规则增加 `Superseded by ADR-0025` 指针，保留原文作为历史，不删除。
- **理由：** ADR-0017 的“凭据原样记录”与当前已验证实现相反；继续标为现役会误导接手者恢复敏感日志。
- **风险：** medium；实质 ADR 状态关系变更，随本计划确认。

### [MERGE/REWRITE] 系统运行日志术语

- **目标：** `<Path>{roots.state}/specdev/context/system-runtime-log-terms.md</Path>`。
- **动作 1：** Sources 去重追加本次登录日志 change 的归档来源指针。
- **动作 2：** 将现有“业务正文原值”术语改为“受控业务正文日志副本（Sanitized Business Payload Copy）”。
- **新定义：** 普通 JSON/文本的日志副本保留非敏感字段；认证、会话、密码、token、secret、captcha 等凭据字段必须脱敏；非法或截断 JSON 整段隐藏；真实 request/response 正文不被改写。
- **`_Avoid_`：** 把日志副本等同于业务正文、持久化可重放凭据、脱敏失败后回退输出原文。
- **毕业判定：** stable-mechanism + must-know。
- **冲突：** 现有定义要求凭据原样记录；推荐以当前代码、16-test suite 与 ADR-0025 为权威改写，不保留双现役定义。
- **风险：** medium；Context 实质改写，随本计划确认。

### 不提升：密码策略运行态恢复

| 知识项 | 处理 | 原因 |
|---|---|---|
| 当前本地库缺少密码策略行 | ephemeral | 单一开发环境漂移，迁移后已消失 |
| 应用既有 DML 并清理精确配置缓存 | ephemeral | 单次运行态恢复步骤；永久 ADR-0022 已覆盖 `sys_config` 策略权威与迁移要求 |
| Live HTTP probe 与具体 row count/version | ephemeral | 验收证据，不是长期领域术语或架构决定 |

### 不提升：classpath 构建故障

| 知识项 | 处理 | 原因 |
|---|---|---|
| 不完整 `ruoyi-system` JAR 的事故时间线与 class 数 | ephemeral | 单次诊断过程；完整证据随归档保留 |
| 开发构建锁、JAR class-set guard 与 VS Code autobuild 设置 | ephemeral | Change Spec 已明确 ADR/CONTEXT 不适用；当前脚本、README、CI 门禁和工程画像是现役权威 |
| Maven/JDT 并发写共享 `target` 的恢复命令 | ephemeral | 具体开发工具恢复手册已在 `<Path>scripts/README.md</Path>`，不复制到永久知识 store |

## 阶段二：永久知识清理候选

已扫描 24 个 ADR、5 个 Context 文件和 Research store 的 `.gitkeep`，并交叉检查当前代码、文档、active changes 与 archive 引用。

| 分类 | 数量 | 结果 |
|---|---:|---|
| delete | 0 | 无超过 30 天且无引用的 superseded ADR、空知识文件或无引用退役术语 |
| merge | 0 | 除本次计划内 Context 合并外，无额外重复知识 |
| rewrite | 0 | 除本次计划内冲突改写外，无相对时间或格式问题 |
| needs-confirmation | 0 | 除 ADR-0017/ADR-0025 与 Context 的两项计划内裁决外，无额外冲突 |
| keep | 30 | 24 个现有 ADR、5 个 Context 文件与 Research `.gitkeep` 均保留；ADR-0017 保留为 superseded 历史 |

不执行永久知识删除，不改写其他 ADR、Context、Research、工程 Skill 或产品文档。

## Confirmed 执行顺序

1. 重跑路径包含、源/目标、状态、索引唯一性、来源摘要、`--stage complete` 与 self-check；任一 drift 阻塞整批。
2. 创建归档月目录（已存在则复用），依次原子移动两个 change；任一步失败立即停止并报告实际状态。
3. 更新两个归档状态与全局索引，重读确认 source 不存在、target 完整、active/archived 无重叠。
4. 创建 ADR-0025，向 ADR-0017 添加 superseded 指针，并按上述唯一版本合并运行日志 Context。
5. 不执行任何知识删除或额外清理。
6. 重跑 JSON 解析、归档无 stage 校验、workflow self-check、`git diff --check` 与永久知识内容检查。
7. 把实际结果、命令退出码、drift/未执行项作为执行补遗追加到本报告。

## 明确不执行

- 不归档用户未指定的其他 completed/active change。
- 不修改产品源码、前后端分支、submodule pointer、运行时数据库或 Redis。
- 不提交、不推送、不合并、不部署、不关闭远程事项。
- 不删除来源 branch/worktree；两个 change 均没有登记的 branch/worktree。
- 不覆盖或回退工作区中既有的 `2026-08-30-openapi-common-module` 状态修改。

## 确认门

**尚未移动任何 change，未修改永久知识或业务文件。当前只持久化本 dry-run 报告，并为两个目标登记 `specdev/archive-and-consolidate` 当前 Work。请明确确认后执行上述整批移动、ADR 替代和 Context 改写。**

建议确认语句：`确认执行 2026-08-31 specdev batch dry-run 计划，归档这两个 change，并按计划创建 ADR-0025、supersede ADR-0017、改写运行日志术语。`

---

## Confirmed 执行补遗

> 用户确认：2026-08-31，`执行`
> 执行完成时间：2026-08-31T15:38:22+08:00
> 模式：executed
> Verification verdict：verified

### 实际执行

| 项目 | 结果 | 证据 |
|---|---|---|
| 登录密码策略与日志脱敏 change | moved | Source 已不存在；Archive target 的 4 个文件完整存在 |
| admin/system classpath 构建故障 change | moved | Source 已不存在；Archive target 的 4 个文件完整存在 |
| 非状态归档内容 | verified | 两项 Diagnosis、Spec、Evidence 的 SHA-256 与移动前完全一致 |
| 全局索引 | updated | 两项目标从 `active` 移除并在 `archived` 中各恰好出现一次；active/archived 无重叠 |
| 两项归档状态 | updated | `change_status=archived`、`archived=true`、`current_work=null`、archive path 正确 |
| Work 历史 | updated | 两项 `works_run` 均去重追加一次 `specdev/archive-and-consolidate` |
| ADR-0025 | created | HTTP 运行日志凭据脱敏与失败关闭成为当前安全决策 |
| ADR-0017 | superseded | 增加指向 ADR-0025 的替代关系，原文保留为历史 |
| System Runtime Log Context | rewritten | “业务正文原值”收敛为“受控业务正文日志副本”，来源指向本次归档 |
| 永久知识清理 | skipped as planned | 未删除、额外合并或改写其他 ADR、Context、Research |

### 并发状态保护

执行前发现 `2026-08-30-openapi-common-module` 已新增 6 个 Ticket 文件；该变化不位于本次两个归档源、目标或永久知识写入路径内，也没有改变两个目标的来源摘要。执行完整保留其 `current_work=specdev/tickets`、状态文件和全部 Ticket，不将其纳入归档或知识提升。

### 重读验证

| 检查 | 结果 |
|---|---|
| 两个 source 不存在、两个 target 完整 | pass |
| 归档非状态文件 SHA-256 与移动前一致 | pass |
| 全局 JSON、两个归档状态 JSON 可解析 | pass |
| active/archived 唯一性与无重叠 | pass |
| 两项 archived 状态、路径、Work 历史 | pass |
| ADR 总数 25、ADR-0017 到 ADR-0025 替代链唯一 | pass |
| 新 Context 术语唯一、旧冲突术语不存在 | pass |
| 登录日志归档无 stage 校验 | `0 errors / 1 warning` |
| classpath 归档无 stage 校验 | `0 errors / 1 warning` |
| Workflow `--self-check` | `0 errors / 0 warnings` |
| `git diff --check` | pass |

两个归档校验的唯一 warning 均为 `validating an archived change in place; normally it lives under the archive root`。目标实际正位于 archive root，且校验结果没有 error；归档前两项 `--stage complete` 已各自通过 `0 errors / 0 warnings`。

### 未执行项

- 未修改产品源码、前后端分支、submodule pointer、运行时数据库或 Redis。
- 未提交、推送、合并、部署、关闭远程事项或清理 branch/worktree。
- 未归档用户未指定的 change，未覆盖并行的 OpenAPI Ticket 工作。
- 未重跑产品 Maven/HTTP 测试；本次只移动已验证工件并更新 SpecDev 永久知识，产品验证结果保留在两项归档 Evidence 中。
