# 上游合并冲突客观报告

- 运行 ID：`2026-09-03T211257+0800-current`
- 生成时间：`2026-09-03T21:12:57+08:00`
- 模拟方式：`git merge-tree --write-tree --messages <product-sha> <upstream-sha>`
- 工作树说明：模拟只使用提交固定点；未提交修改不进入 merge-tree。

## backend

| 固定项 | 值 |
|---|---|
| 产品 SHA | `e5cef5a616cea273d52fd57d510983b37f29144c` |
| 上游 SHA | `79bd1db16fe52595099dfe34da53dc026a620843` |
| merge-base | `387c4f0a20e9232f44e762ef5a46c462f54bd464` |
| merge-tree 状态 | `clean` |
| merge-tree exit code | `0` |
| 结果 tree | `3b87b28f2393d9e803f7c5c642c78f18d8e4a48d` |
| Git 确认冲突数 | `0` |

### Git 确认冲突

- Git 未报告文本或树冲突。

merge-tree 消息：

```text
Auto-merging ruoyi-modules/ruoyi-workflow/src/main/java/org/dromara/workflow/service/impl/FlwTaskServiceImpl.java
```

### 可自动合并的双方重叠

- `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/interceptor/SqlLogInterceptor.java`
- `ruoyi-modules/ruoyi-workflow/src/main/java/org/dromara/workflow/service/impl/FlwTaskServiceImpl.java`

### 定制合同风险

- `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/aspect/DataPermissionAdvice.java`: Client/RBAC/menu
- `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/handler/PlusDataPermissionHandler.java`: Client/RBAC/menu
- `ruoyi-modules/ruoyi-workflow/src/main/java/org/dromara/workflow/listener/WorkflowGlobalListener.java`: workflow
- `ruoyi-modules/ruoyi-workflow/src/main/java/org/dromara/workflow/service/impl/FlwTaskServiceImpl.java`: workflow

### 未提交工作树重叠

- 未提交路径与本次上游增量无交集。

### 工作树状态

- `ruoyi-admin/src/test/java/org/dromara/test/logging/SysConsoleLoggingUnitTest.java`
- `ruoyi-admin/src/test/java/org/dromara/test/migration/password/PasswordMigrationUnitTest.java`
- `ruoyi-admin/src/test/java/org/dromara/test/oss/owner/BusinessOssOwnerArchitectureUnitTest.java`

### 复现命令

```bash
git -C ruoyi-vue-plus-namewta merge-tree --write-tree --messages e5cef5a616cea273d52fd57d510983b37f29144c 79bd1db16fe52595099dfe34da53dc026a620843
```

### 路径级语义复核

- `FlwTaskServiceImpl` 的 Git 合并结果为 clean，但产品侧已在同一文件加入 `DSTransactional` 与 `WorkflowHistoryOssOwner`；上游新增的任务读取授权必须与这两个现有边界一起做工作流授权和回归验证。
- `SqlLogInterceptor` 的自动合并只解决文本冲突；上游移除 `ReentrantLock`，产品侧已有日志脱敏测试，需单独验证并发控制台输出不会破坏 requestId 关联或正文策略。

## frontend

| 固定项 | 值 |
|---|---|
| 产品 SHA | `381918e7c2c3e023c043adcdaf94b0476c501a2d` |
| 上游 SHA | `a85fa0aee44f6f12dc35198126914ce722ee8622` |
| merge-base | `0870ce17514895854ccff03600e102546d8c5046` |
| merge-tree 状态 | `conflicted` |
| merge-tree exit code | `1` |
| 结果 tree | `40079b206c7d2414a00f77da392ff940889ac3bb` |
| Git 确认冲突数 | `2` |

### Git 确认冲突

- `src/api/monitor/logininfo/index.ts`
- `src/api/monitor/logininfo/types.ts`

merge-tree 消息：

```text
CONFLICT (rename/delete): src/api/monitor/loginInfo/index.ts renamed to src/api/monitor/logininfo/index.ts in a85fa0aee44f6f12dc35198126914ce722ee8622, but deleted in 381918e7c2c3e023c043adcdaf94b0476c501a2d.
CONFLICT (rename/delete): src/api/monitor/loginInfo/types.ts renamed to src/api/monitor/logininfo/types.ts in a85fa0aee44f6f12dc35198126914ce722ee8622, but deleted in 381918e7c2c3e023c043adcdaf94b0476c501a2d.
```

### 可自动合并的双方重叠

- 没有双方同时修改但可自动合并的路径。

### 定制合同风险

- 未命中内置热点分类；仍须核对 customization map。

### 未提交工作树重叠

- 未提交路径与本次上游增量无交集。

### 工作树状态

- `apps/admin-web/vite.config.ts`
- `package.json`
- `packages/domains/admin/src/index.test.ts`
- `packages/domains/admin/src/index.ts`

### 复现命令

```bash
git -C plus-ui-namewta merge-tree --write-tree --messages 381918e7c2c3e023c043adcdaf94b0476c501a2d a85fa0aee44f6f12dc35198126914ce722ee8622
```

### 路径级语义复核

- 两个冲突都是 rename/delete：产品在 `3fc3a68` 已删除旧根应用 `src/api/monitor/loginInfo` 文件，上游提交只把同一文件改名为小写目录。解决时应保留产品的 domain/web-domain 迁移边界，先确认当前入口无消费者，再决定是否需要兼容别名；不能直接恢复旧根目录文件。

## 局限

`merge-tree` 只能描述冻结提交的 Git 文本/树合并结果。零文本冲突不代表编译、运行时、API、权限、SQL 迁移或业务语义安全；必须继续执行 customization map 复核与项目质量门禁。
