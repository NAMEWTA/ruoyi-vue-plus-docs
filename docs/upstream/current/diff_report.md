# 上游增量 Diff 报告

- 运行 ID：`2026-09-03T211257+0800-current`
- 生成时间：`2026-09-03T21:12:57+08:00`
- 主题：`latest-status`
- 口径：已确认集成上游点到本次观测上游点；不以镜像分支位置替代集成点。

## backend

| 固定项 | 值 |
|---|---|
| 产品 SHA | `e5cef5a616cea273d52fd57d510983b37f29144c` |
| 已集成上游 SHA | `387c4f0a20e9232f44e762ef5a46c462f54bd464` |
| 集成识别方式 | `recorded_merge` |
| 产品 merge commit | `af4bf65c71087c6080f52fed6155c542a162419b` |
| 观测上游 SHA | `79bd1db16fe52595099dfe34da53dc026a620843` |
| merge-base | `387c4f0a20e9232f44e762ef5a46c462f54bd464` |
| mirror SHA | `79bd1db16fe52595099dfe34da53dc026a620843` |
| freshness | `fresh` |

### 上游新增提交（6）

- `2933badb9` 2026-08-21 update 优化 sql输出性能 去掉锁
- `629e344af` 2026-08-24 fix 修复 数据权限对union语句不兼容问题
- `b37db3fd0` 2026-08-24 update 优化 增加 groupby 函数(感谢 喃风 贡献)
- `13e8ac5f8` 2026-08-26 update 优化 对mybatis游标查询 进行加解密支持
- `e3e4c0abc` 2026-08-28 update 优化 校验当前登录用户是否可以读取任务信息
- `79bd1db16` 2026-08-28 fix 修复 多节点提交任务 变量覆盖问题

### 文件 Diff

统计：7 files changed, 170 insertions(+), 26 deletions(-)

| 状态 | 文件 | 新增 | 删除 | 风险分类 |
|---|---|---:|---:|---|
| `M` | `ruoyi-common/ruoyi-common-encrypt/src/main/java/org/dromara/common/encrypt/interceptor/MybatisDecryptInterceptor.java` | 58 | 5 | - |
| `M` | `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/aspect/DataPermissionAdvice.java` | 7 | 2 | Client/RBAC/menu |
| `M` | `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/core/query/LambdaJoinQueryBuilder.java` | 38 | 0 | - |
| `M` | `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/handler/PlusDataPermissionHandler.java` | 5 | 3 | Client/RBAC/menu |
| `M` | `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/interceptor/SqlLogInterceptor.java` | 2 | 14 | - |
| `M` | `ruoyi-modules/ruoyi-workflow/src/main/java/org/dromara/workflow/listener/WorkflowGlobalListener.java` | 2 | 1 | workflow |
| `M` | `ruoyi-modules/ruoyi-workflow/src/main/java/org/dromara/workflow/service/impl/FlwTaskServiceImpl.java` | 58 | 1 | workflow |

### 产品重叠面

- `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/interceptor/SqlLogInterceptor.java`
- `ruoyi-modules/ruoyi-workflow/src/main/java/org/dromara/workflow/service/impl/FlwTaskServiceImpl.java`

### 高风险上游路径

- `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/aspect/DataPermissionAdvice.java`: Client/RBAC/menu
- `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/handler/PlusDataPermissionHandler.java`: Client/RBAC/menu
- `ruoyi-modules/ruoyi-workflow/src/main/java/org/dromara/workflow/listener/WorkflowGlobalListener.java`: workflow
- `ruoyi-modules/ruoyi-workflow/src/main/java/org/dromara/workflow/service/impl/FlwTaskServiceImpl.java`: workflow

### 复现命令

```bash
git -C ruoyi-vue-plus-namewta log --oneline 387c4f0a20e9232f44e762ef5a46c462f54bd464..79bd1db16fe52595099dfe34da53dc026a620843
git -C ruoyi-vue-plus-namewta diff --name-status 387c4f0a20e9232f44e762ef5a46c462f54bd464..79bd1db16fe52595099dfe34da53dc026a620843
git -C ruoyi-vue-plus-namewta diff 387c4f0a20e9232f44e762ef5a46c462f54bd464..79bd1db16fe52595099dfe34da53dc026a620843 -- <path>
```

## frontend

| 固定项 | 值 |
|---|---|
| 产品 SHA | `381918e7c2c3e023c043adcdaf94b0476c501a2d` |
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
| backend | 6 commits / 7 files | 0 | 4 | 待按路径级 diff 完成语义复核与质量门禁 |
| frontend | 1 commits / 2 files | 2 | 0 | 待按路径级 diff 完成语义复核与质量门禁 |

### 路径级复核结论（基于上述固定 SHA）

- backend：`DataPermissionAdvice` 改为恢复嵌套调用前的权限上下文，`PlusDataPermissionHandler` 在上下文缺失时直接失败并交由 Advice 管理生命周期；这两个改动涉及数据权限边界，需覆盖嵌套 Mapper 和缺失上下文场景。
- backend：`WorkflowGlobalListener` 使用 `putIfAbsent` 保留显式抄送名单；`FlwTaskServiceImpl` 新增任务读取授权（任务关系人、发起人或管理权限）并逐项校验任务 ID。该路径同时存在产品侧事务与 OSS 历史改动，自动合并不等于授权语义已验证。
- backend：`SqlLogInterceptor` 删除控制台输出锁并改为单次 `print`，与产品侧日志脱敏改动存在路径重叠；需复核并发日志完整性与现有日志测试。
- frontend：上游仅将 `src/api/monitor/loginInfo/{index,types}.ts` 重命名为小写目录；产品在 `3fc3a68` 的根 App 契约迁移中已删除旧 `src/api` 树，因此不能按普通重命名恢复文件，应以当前 domain/web-domain 入口为准确认无消费者。

## 结论边界

本报告提供完整文件清单与可复现固定点，不内嵌无限制完整 patch。代码级结论必须使用上述固定 SHA 的路径级 diff 补证。
