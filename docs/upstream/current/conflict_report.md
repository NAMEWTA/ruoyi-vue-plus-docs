# 上游合并冲突客观报告

- 运行 ID：`2026-09-05T081250+0800-current`
- 生成时间：`2026-09-05T08:12:50+08:00`
- 模拟方式：`git merge-tree --write-tree --messages <product-sha> <upstream-sha>`
- 工作树说明：模拟只使用提交固定点；未提交修改不进入 merge-tree。

## backend

| 固定项 | 值 |
|---|---|
| 产品 SHA | `751ecd43917211744402bbb00e003369dbcde62f` |
| 上游 SHA | `bffc39a89fd6ed196031e71cbceefd9986eecce8` |
| merge-base | `387c4f0a20e9232f44e762ef5a46c462f54bd464` |
| merge-tree 状态 | `clean` |
| merge-tree exit code | `0` |
| 结果 tree | `2c4188e52f88b5cde29969780df79982fcf4b902` |
| Git 确认冲突数 | `0` |

### Git 确认冲突

- Git 未报告文本或树冲突。

merge-tree 消息：

```text
Auto-merging ruoyi-common/ruoyi-common-oss/src/main/java/org/dromara/common/oss/config/OssClientConfig.java
Auto-merging ruoyi-modules/ruoyi-workflow/src/main/java/org/dromara/workflow/listener/WorkflowGlobalListener.java
Auto-merging ruoyi-modules/ruoyi-workflow/src/main/java/org/dromara/workflow/service/impl/FlwTaskServiceImpl.java
```

### 可自动合并的双方重叠

- `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/interceptor/SqlLogInterceptor.java`
- `ruoyi-common/ruoyi-common-oss/src/main/java/org/dromara/common/oss/config/OssClientConfig.java`
- `ruoyi-modules/ruoyi-workflow/src/main/java/org/dromara/workflow/listener/WorkflowGlobalListener.java`
- `ruoyi-modules/ruoyi-workflow/src/main/java/org/dromara/workflow/service/impl/FlwTaskServiceImpl.java`

### 定制合同风险

- `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/aspect/DataPermissionAdvice.java`: Client/RBAC/menu
- `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/handler/PlusDataPermissionHandler.java`: Client/RBAC/menu
- `ruoyi-common/ruoyi-common-oss/src/main/java/org/dromara/common/oss/config/OssClientConfig.java`: Client/RBAC/menu, OSS/upload
- `ruoyi-modules/ruoyi-workflow/src/main/java/org/dromara/workflow/listener/WorkflowGlobalListener.java`: workflow
- `ruoyi-modules/ruoyi-workflow/src/main/java/org/dromara/workflow/service/impl/FlwTaskServiceImpl.java`: workflow

### 未提交工作树重叠

- 未提交路径与本次上游增量无交集。

### 工作树状态

- 工作树 clean。

### 复现命令

```bash
git -C ruoyi-vue-plus-namewta merge-tree --write-tree --messages 751ecd43917211744402bbb00e003369dbcde62f bffc39a89fd6ed196031e71cbceefd9986eecce8
```

## frontend

| 固定项 | 值 |
|---|---|
| 产品 SHA | `cc6a6f22e1c3ee246426d4b75a7926a2a079aec0` |
| 上游 SHA | `a85fa0aee44f6f12dc35198126914ce722ee8622` |
| merge-base | `0870ce17514895854ccff03600e102546d8c5046` |
| merge-tree 状态 | `conflicted` |
| merge-tree exit code | `1` |
| 结果 tree | `8cc067caf946bde8c4f011e67f3f8e86f9b52422` |
| Git 确认冲突数 | `2` |

### Git 确认冲突

- `src/api/monitor/logininfo/index.ts`
- `src/api/monitor/logininfo/types.ts`

merge-tree 消息：

```text
CONFLICT (rename/delete): src/api/monitor/loginInfo/index.ts renamed to src/api/monitor/logininfo/index.ts in a85fa0aee44f6f12dc35198126914ce722ee8622, but deleted in cc6a6f22e1c3ee246426d4b75a7926a2a079aec0.
CONFLICT (rename/delete): src/api/monitor/loginInfo/types.ts renamed to src/api/monitor/logininfo/types.ts in a85fa0aee44f6f12dc35198126914ce722ee8622, but deleted in cc6a6f22e1c3ee246426d4b75a7926a2a079aec0.
```

### 可自动合并的双方重叠

- 没有双方同时修改但可自动合并的路径。

### 定制合同风险

- 未命中内置热点分类；仍须核对 customization map。

### 未提交工作树重叠

- 未提交路径与本次上游增量无交集。

### 工作树状态

- 工作树 clean。

### 复现命令

```bash
git -C plus-ui-namewta merge-tree --write-tree --messages cc6a6f22e1c3ee246426d4b75a7926a2a079aec0 a85fa0aee44f6f12dc35198126914ce722ee8622
```

## 局限

`merge-tree` 只能描述冻结提交的 Git 文本/树合并结果。零文本冲突不代表编译、运行时、API、权限、SQL 迁移或业务语义安全；必须继续执行 customization map 复核与项目质量门禁。

## 实际集成结果

- backend 已由 `9b66010d29a37b577eb29e48ba7790ad04906119` 合并上游 `bffc39a89fd6ed196031e71cbceefd9986eecce8`，并保留工作流通知副作用适配。
- frontend 已由 `d1748f3506259fa75eced87d6983dd14292b9a68` 处理两个 rename/delete 冲突，保留产品 domain 路径和外部契约。
