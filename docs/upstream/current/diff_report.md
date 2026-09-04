# 上游增量 Diff 报告

- 运行 ID：`2026-09-05T073158+0800-current`
- 生成时间：`2026-09-05T07:31:58+08:00`
- 主题：`upstream-sync-2026-09-05`
- 口径：已确认集成上游点到本次观测上游点；不以镜像分支位置替代集成点。

## backend

| 固定项 | 值 |
|---|---|
| 产品 SHA | `751ecd43917211744402bbb00e003369dbcde62f` |
| 已集成上游 SHA | `387c4f0a20e9232f44e762ef5a46c462f54bd464` |
| 集成识别方式 | `recorded_merge` |
| 产品 merge commit | `af4bf65c71087c6080f52fed6155c542a162419b` |
| 观测上游 SHA | `bffc39a89fd6ed196031e71cbceefd9986eecce8` |
| merge-base | `387c4f0a20e9232f44e762ef5a46c462f54bd464` |
| mirror SHA | `79bd1db16fe52595099dfe34da53dc026a620843` |
| freshness | `fresh` |

### 上游新增提交（8）

- `2933badb9` 2026-08-21 update 优化 sql输出性能 去掉锁
- `629e344af` 2026-08-24 fix 修复 数据权限对union语句不兼容问题
- `b37db3fd0` 2026-08-24 update 优化 增加 groupby 函数(感谢 喃风 贡献)
- `13e8ac5f8` 2026-08-26 update 优化 对mybatis游标查询 进行加解密支持
- `e3e4c0abc` 2026-08-28 update 优化 校验当前登录用户是否可以读取任务信息
- `79bd1db16` 2026-08-28 fix 修复 多节点提交任务 变量覆盖问题
- `d577ad28c` 2026-09-04 fix 修复 云oss cdn域名使用问题
- `bffc39a89` 2026-09-04 update 优化 EnumPattern 支持任意类型校验

### 文件 Diff

统计：9 files changed, 230 insertions(+), 34 deletions(-)

| 状态 | 文件 | 新增 | 删除 | 风险分类 |
|---|---|---:|---:|---|
| `M` | `ruoyi-common/ruoyi-common-core/src/main/java/org/dromara/common/core/validate/enums/EnumPatternValidator.java` | 33 | 7 | - |
| `M` | `ruoyi-common/ruoyi-common-encrypt/src/main/java/org/dromara/common/encrypt/interceptor/MybatisDecryptInterceptor.java` | 58 | 5 | - |
| `M` | `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/aspect/DataPermissionAdvice.java` | 7 | 2 | Client/RBAC/menu |
| `M` | `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/core/query/LambdaJoinQueryBuilder.java` | 38 | 0 | - |
| `M` | `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/handler/PlusDataPermissionHandler.java` | 5 | 3 | Client/RBAC/menu |
| `M` | `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/interceptor/SqlLogInterceptor.java` | 2 | 14 | - |
| `M` | `ruoyi-common/ruoyi-common-oss/src/main/java/org/dromara/common/oss/config/OssClientConfig.java` | 27 | 1 | Client/RBAC/menu, OSS/upload |
| `M` | `ruoyi-modules/ruoyi-workflow/src/main/java/org/dromara/workflow/listener/WorkflowGlobalListener.java` | 2 | 1 | workflow |
| `M` | `ruoyi-modules/ruoyi-workflow/src/main/java/org/dromara/workflow/service/impl/FlwTaskServiceImpl.java` | 58 | 1 | workflow |

### 产品重叠面

- `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/interceptor/SqlLogInterceptor.java`
- `ruoyi-common/ruoyi-common-oss/src/main/java/org/dromara/common/oss/config/OssClientConfig.java`
- `ruoyi-modules/ruoyi-workflow/src/main/java/org/dromara/workflow/listener/WorkflowGlobalListener.java`
- `ruoyi-modules/ruoyi-workflow/src/main/java/org/dromara/workflow/service/impl/FlwTaskServiceImpl.java`

### 高风险上游路径

- `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/aspect/DataPermissionAdvice.java`: Client/RBAC/menu
- `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/handler/PlusDataPermissionHandler.java`: Client/RBAC/menu
- `ruoyi-common/ruoyi-common-oss/src/main/java/org/dromara/common/oss/config/OssClientConfig.java`: Client/RBAC/menu, OSS/upload
- `ruoyi-modules/ruoyi-workflow/src/main/java/org/dromara/workflow/listener/WorkflowGlobalListener.java`: workflow
- `ruoyi-modules/ruoyi-workflow/src/main/java/org/dromara/workflow/service/impl/FlwTaskServiceImpl.java`: workflow

### 复现命令

```bash
git -C ruoyi-vue-plus-namewta log --oneline 387c4f0a20e9232f44e762ef5a46c462f54bd464..bffc39a89fd6ed196031e71cbceefd9986eecce8
git -C ruoyi-vue-plus-namewta diff --name-status 387c4f0a20e9232f44e762ef5a46c462f54bd464..bffc39a89fd6ed196031e71cbceefd9986eecce8
git -C ruoyi-vue-plus-namewta diff 387c4f0a20e9232f44e762ef5a46c462f54bd464..bffc39a89fd6ed196031e71cbceefd9986eecce8 -- <path>
```

## frontend

| 固定项 | 值 |
|---|---|
| 产品 SHA | `cc6a6f22e1c3ee246426d4b75a7926a2a079aec0` |
| 已集成上游 SHA | `0870ce17514895854ccff03600e102546d8c5046` |
| 集成识别方式 | `derived_merge_base` |
| 产品 merge commit | `null` |
| 观测上游 SHA | `a85fa0aee44f6f12dc35198126914ce722ee8622` |
| merge-base | `0870ce17514895854ccff03600e102546d8c5046` |
| mirror SHA | `a85fa0aee44f6f12dc35198126914ce722ee8622` |
| freshness | `fresh` |

### 上游新增提交（1）

- `a85fa0a` 2026-09-01 fix 修复 文件包名错误

### 文件 Diff

统计：2 files changed, 0 insertions(+), 0 deletions(-)

| 状态 | 文件 | 新增 | 删除 | 风险分类 |
|---|---|---:|---:|---|
| `R100` | `src/api/monitor/loginInfo/index.ts -> src/api/monitor/logininfo/index.ts` | 0 | 0 | - |
| `R100` | `src/api/monitor/loginInfo/types.ts -> src/api/monitor/logininfo/types.ts` | 0 | 0 | - |

### 产品重叠面

- 上游增量与产品自集成点后的文件变化无路径重叠。

### 高风险上游路径

- 未命中内置热点分类；仍需按 customization map 复核长期不变量。

### 复现命令

```bash
git -C plus-ui-namewta log --oneline 0870ce17514895854ccff03600e102546d8c5046..a85fa0aee44f6f12dc35198126914ce722ee8622
git -C plus-ui-namewta diff --name-status 0870ce17514895854ccff03600e102546d8c5046..a85fa0aee44f6f12dc35198126914ce722ee8622
git -C plus-ui-namewta diff 0870ce17514895854ccff03600e102546d8c5046..a85fa0aee44f6f12dc35198126914ce722ee8622 -- <path>
```

## 现状 Merge 清单

| 仓库 | 上游增量 | Git 冲突 | 定制风险路径 | 当前处置 |
|---|---:|---:|---:|---|
| backend | 8 commits / 9 files | 0 | 5 | 已完成固定点语义复核，待候选分支集成与质量门禁 |
| frontend | 1 commits / 2 files | 2 | 0 | 已完成冲突处置复核，待候选分支集成与质量门禁 |

### 产品基线变化

- backend 当前产品 `main` 为 `751ecd43917211744402bbb00e003369dbcde62f`，自已集成点以来有 170 个产品提交、1153 个文件变化（约 `+71727/-27960`）。最近提交集中在 `ruoyi-third` 的 Provider/Endpoint、凭据、缓存失效、出站审计和外部服务验证；这些产品能力不属于本次上游增量。
- frontend 当前产品 `main` 为 `cc6a6f22e1c3ee246426d4b75a7926a2a079aec0`，自已集成点以来有 188 个产品提交、941 个文件变化（约 `+60487/-14299`）。`third` domain、架构基线和管理端 E2E 已在产品历史中完成，不应误判为待集成的上游内容。
- 本次评估之后两个产品 `main` 均已快进推送到各自 `origin/main`；后端本地 `6.X` 仍为上游目标的前两提交之前，前端 `6.X-Vue` 已与上游目标一致。镜像分支没有作为产品推送的一部分处理。

### 路径级语义复核结论（基于上述固定 SHA）

- `EnumPatternValidator` 从 `String` 扩展为 `Object`，按枚举字段实际类型转换，覆盖字符串、数字和布尔值；当前产品没有发现 `@EnumPattern` 消费者，但仍需增加通用 Bean Validation 回归。
- `MybatisDecryptInterceptor` 新增 `handleCursorResultSets` 和惰性 `DecryptCursor`；必须验证逐项解密、关闭/消费状态、重复迭代和异常透传，不能把游标提前物化。
- `DataPermissionAdvice` 与 `PlusDataPermissionHandler` 必须成对集成：恢复嵌套权限上下文，并让 UNION/缺失上下文显式失败；需覆盖 Client/RBAC 隔离、异常恢复和请求结束清理。
- `LambdaJoinQueryBuilder` 新增普通及别名 `groupBy` 公共方法，需进行调用方扫描、别名校验、SQL 输出和 API 契约验证。
- `SqlLogInterceptor` 去掉静态 `ReentrantLock` 并改为单次输出；产品已有日志脱敏/请求关联定制，自动合并不等于并发日志语义已验证。
- `OssClientConfig` 只应采纳“默认 bucket + 非 path-style + 自定义域名使用 CDN”分支；产品私有默认 ACL、访问策略及 `getDomainUrl/getAccessBaseUrl` 必须保留，非默认 bucket 仍回退 endpoint。
- `WorkflowGlobalListener` 的 `putIfAbsent` 不能覆盖产品显式抄送名单、`finish` null-safe `flowParams` 和现有事件变量清理；`FlwTaskServiceImpl` 的任务读取授权还必须与产品 OSS owner、附件处理和事务边界一起验证。
- `FlwTaskServiceImpl` 的新授权会影响 `WorkflowSideEffectListener -> FlwCommonServiceImpl.sendMessage -> currentTaskAllUser` 通知链。普通提交人或无登录事件不能因读取保护而丢失下一节点通知；应在 workflow 模块内部使用不暴露到 `ruoyi-api` 的受信任务收件人解析器，禁止捕获吞掉拒绝异常或模拟登录。
- 前端上游只有旧 `src/api/monitor/loginInfo/**` 的大小写重命名。产品已迁移到 `packages/domains/system/src/monitor/login-info/**` 和 `packages/web-domains/system/src/monitor/login-info/**`，因此两个 rename/delete 冲突均保留产品删除；`/monitor/loginInfo`、`monitor:logininfo:*` 和 `monitor/logininfo/index` 等外部契约不变。

### 本次评估与基线验证

- 评估命令：`node .agents/skills/upstream-fork-sync/scripts/upstream-sync.mjs assess --root . --topic upstream-sync-2026-09-05 --fetch`，退出码 0，两个仓库 freshness 均为 `fresh`。
- 前端已推送 HEAD 上运行 `pnpm architecture:check`：退出码 0，31 个 workspace package、0 个 baseline violation；`pnpm architecture:test`：退出码 0，101/101 通过、0 失败/跳过。
- 本次仅刷新报告和产品推送，尚未在候选合并树执行上游集成；后端 `mvn` 全量门禁、前端 lint/typecheck/unit/build/E2E 仍属于下一阶段集成验证，不得从本报告推断为已通过。

## 结论边界

本报告提供完整文件清单与可复现固定点，不内嵌无限制完整 patch。代码级结论必须使用上述固定 SHA 的路径级 diff 补证。
