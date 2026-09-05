# 上游增量 Diff 报告

- 运行 ID：`2026-09-05T081250+0800-current`
- 生成时间：`2026-09-05T08:12:50+08:00`
- 主题：`upstream-sync-2026-09-05`
- 口径：已确认集成上游点到本次观测上游点；不以镜像分支位置替代集成点。

## backend

| 固定项 | 值 |
|---|---|
| 产品 SHA | `34766a607210873dd36af9a02effb0b49f5bb9f1` |
| 已集成上游 SHA | `bffc39a89fd6ed196031e71cbceefd9986eecce8` |
| 集成识别方式 | `recorded_merge` |
| 产品 merge commit | `9b66010d29a37b577eb29e48ba7790ad04906119` |
| 观测上游 SHA | `bffc39a89fd6ed196031e71cbceefd9986eecce8` |
| merge-base | `387c4f0a20e9232f44e762ef5a46c462f54bd464` |
| mirror SHA | `bffc39a89fd6ed196031e71cbceefd9986eecce8` |
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
| 产品 SHA | `d1748f3506259fa75eced87d6983dd14292b9a68` |
| 已集成上游 SHA | `a85fa0aee44f6f12dc35198126914ce722ee8622` |
| 集成识别方式 | `derived_merge_base` |
| 产品 merge commit | `d1748f3506259fa75eced87d6983dd14292b9a68` |
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
| backend | 8 commits / 9 files | 0 | 5 | 已合并并完成后端测试、打包和 bundle 内容校验 |
| frontend | 1 commits / 2 files | 2 | 0 | 已合并并完成架构、lint、类型、测试和生产构建 |

### 本次集成结果

- backend merge：`9b66010d29a37b577eb29e48ba7790ad04906119`，产品第一父线保留 `ruoyi-notify`，第二父线为 `bffc39a89fd6ed196031e71cbceefd9986eecce8`。
- frontend merge：`d1748f3506259fa75eced87d6983dd14292b9a68`，两个 rename/delete 冲突均保留产品删除及现有 domain owner。
- 后端全量测试：365 tests，0 failures，27 skipped；完整包与核心包内容校验通过。前端 `architecture:test` 101/101 通过，其他质量门禁通过。

## 结论边界

本报告提供完整文件清单与可复现固定点，不内嵌无限制完整 patch。代码级结论必须使用上述固定 SHA 的路径级 diff 补证。
