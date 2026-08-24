# 上游合并冲突客观报告

- 运行 ID：`2026-08-24T122943+0800-2026-08-24_current-upstream-merge-backfill`
- 生成时间：`2026-08-24T12:29:43+08:00`
- 模拟方式：`git merge-tree --write-tree --messages <product-sha> <upstream-sha>`
- 工作树说明：模拟只使用提交固定点；未提交修改不进入 merge-tree。

## backend

| 固定项 | 值 |
|---|---|
| 产品 SHA | `58aaf342100a2cfc2988e01b257f7468bb2bbad9` |
| 上游 SHA | `629e344af50cfc5163f0b5905d47328382b7cc1c` |
| merge-base | `387c4f0a20e9232f44e762ef5a46c462f54bd464` |
| merge-tree 状态 | `clean` |
| merge-tree exit code | `0` |
| 结果 tree | `8ff482f019ca54497acb7ff863f0b61b53c47b0f` |
| Git 确认冲突数 | `0` |

### 客观判读

- 冻结提交 `58aaf3421` 与 `629e344af` 的 `merge-tree` 结果为 clean，三个上游变化文件均不存在提交级文本或树冲突。
- `DataPermissionAdvice.java` 与 `PlusDataPermissionHandler.java` 没有产品提交重叠，但属于权限边界变化；零 Git 冲突不能替代权限回归测试。
- `SqlLogInterceptor.java` 出现在未提交重叠列表中，但当前工作树 blob 与上游 blob 均为 `d17ab7810f4dc71ca7f44de0b3b921ac9a4d21b9`。它不是内容分歧，风险在于该吸收结果尚未形成可追踪提交；真实 merge 前必须先明确保留/提交策略，不能直接在当前 dirty 工作树操作。

### Git 确认冲突

- Git 未报告文本或树冲突。

### 可自动合并的双方重叠

- 没有双方同时修改但可自动合并的路径。

### 定制合同风险

- `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/aspect/DataPermissionAdvice.java`: Client/RBAC/menu
- `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/handler/PlusDataPermissionHandler.java`: Client/RBAC/menu

### 未提交工作树重叠

- `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/interceptor/SqlLogInterceptor.java`

### 工作树状态

- `README.md`
- `mvnw`
- `pom.xml`
- `ruoyi-admin/pom.xml`
- `ruoyi-admin/src/test/java/org/dromara/test/migration/BusinessMenuRetirementMySqlIntegrationTest.java`
- `ruoyi-admin/src/test/java/org/dromara/test/oss/client/MinioOssClientIntegrationTest.java`
- `ruoyi-admin/src/test/java/org/dromara/test/oss/upload/OssUploadHttpContractUnitTest.java`
- `ruoyi-admin/src/test/java/org/dromara/test/oss/upload/OssUploadServiceUnitTest.java`
- `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/interceptor/SqlLogInterceptor.java`
- `ruoyi-modules/ruoyi-system/src/main/java/org/dromara/system/controller/system/SysOssUploadController.java`
- `ruoyi-modules/ruoyi-system/src/main/java/org/dromara/system/oss/upload/OssUploadContracts.java`
- `ruoyi-modules/ruoyi-system/src/main/java/org/dromara/system/oss/upload/OssUploadService.java`
- `script/docker/.env.example`
- `script/docker/README.md`
- `script/docker/docker-compose.yml`
- `script/docker/mysql/`
- `script/docker/redis/conf/redis.conf`
- `script/sql/namewta/DSL.sql`
- `script/sql/namewta/README.md`

### 复现命令

```bash
git -C ruoyi-vue-plus-namewta merge-tree --write-tree --messages 58aaf342100a2cfc2988e01b257f7468bb2bbad9 629e344af50cfc5163f0b5905d47328382b7cc1c
```

## frontend

| 固定项 | 值 |
|---|---|
| 产品 SHA | `f7d116f6e2b6b61239afc86cbcb860a07530abad` |
| 上游 SHA | `0870ce17514895854ccff03600e102546d8c5046` |
| merge-base | `0870ce17514895854ccff03600e102546d8c5046` |
| merge-tree 状态 | `clean` |
| merge-tree exit code | `0` |
| 结果 tree | `ee7d40b45f95ce94238c8283f6ebf16b5ee4398e` |
| Git 确认冲突数 | `0` |

### Git 确认冲突

- Git 未报告文本或树冲突。

### 可自动合并的双方重叠

- 没有双方同时修改但可自动合并的路径。

### 定制合同风险

- 未命中内置热点分类；仍须核对 customization map。

### 未提交工作树重叠

- 未提交路径与本次上游增量无交集。

### 工作树状态

- `e2e/`
- `package.json`
- `playwright.config.ts`
- `pnpm-lock.yaml`
- `src/api/system/oss/types.ts`
- `src/components/FileUpload/index.vue`
- `src/components/ImageUpload/index.vue`
- `src/hooks/oss/useDirectOssUpload.test.ts`
- `src/hooks/oss/useDirectOssUpload.ts`
- `src/views/business/admin-console/.gitkeep`
- `src/views/business/admin-console/index.vue`
- `src/views/business/data-collection/.gitkeep`
- `src/views/business/data-collection/index.vue`
- `src/views/business/data-competition/.gitkeep`
- `src/views/business/data-competition/index.vue`
- `src/views/business/token-relay/.gitkeep`
- `src/views/business/token-relay/index.vue`
- `src/views/monitor/logininfo/index.vue`
- `src/views/system/user/profile/userAvatar.vue`

### 复现命令

```bash
git -C plus-ui-namewta merge-tree --write-tree --messages f7d116f6e2b6b61239afc86cbcb860a07530abad 0870ce17514895854ccff03600e102546d8c5046
```

## 局限

`merge-tree` 只能描述冻结提交的 Git 文本/树合并结果。零文本冲突不代表编译、运行时、API、权限、SQL 迁移或业务语义安全；必须继续执行 customization map 复核与项目质量门禁。
