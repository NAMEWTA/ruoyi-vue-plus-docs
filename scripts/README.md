# scripts 目录说明

该目录存放父仓库级别的自动化脚本。目前所有脚本都位于 `ci/` 目录，用于支撑
`.github/workflows/quality-gates.yml` 中的质量门禁，也可以在满足前置条件时从仓库根目录手动执行。

## 目录结构

```text
scripts/
├── README.md
├── start-dev.sh
└── ci/
    ├── run-external-services.sh
    ├── verify-admin-bundle.sh
    └── verify-submodules.sh
```

| 目录 | 作用 |
| --- | --- |
| `scripts/` | 父仓库自动化脚本的统一入口及说明文档。 |
| `scripts/ci/` | CI 质量门禁脚本，负责子模块快照、后端打包内容和真实外部服务集成测试的验收。 |

## start-dev.sh

### 作用

开发完成后，从父仓库根目录通过两个选项启动本地人工测试环境：

1. 启动前端；
2. 启动后端。

脚本不创建后台进程，也不重定向服务日志。依赖准备完成后，Vite 或 Spring Boot 会直接接管脚本进程，
持续在当前终端输出实时日志；按 `Ctrl+C` 停止服务后返回调用脚本的终端。

### 使用方式

```bash
./scripts/start-dev.sh
```

前端选项使用 lockfile 固定的 pnpm 版本安装依赖，然后运行固定端口且不自动打开浏览器的 `pnpm dev`。
后端选项先通过 Maven Wrapper
执行跳过自动测试的本地 reactor install，再以 `dev,local` profiles 启动 `ruoyi-admin`。该脚本用于启动
人工测试环境，不能替代前后端自动测试和质量门禁。

### 前置条件与保护

- 前端需要可用的 Node.js、Corepack，以及完整的 `plus-ui-namewta/package.json` 和 lockfile。
- 后端需要 Git、Java 21、可执行的 Maven Wrapper，以及非空且被 Git 忽略的
  `ruoyi-vue-plus-namewta/ruoyi-admin/src/main/resources/application-local.yml`。
- 若本机提供 `lsof`，脚本会在启动前检查前端 `80` 或后端 `8080` 端口；端口被占用时只报告进程并退出，
  不会自动终止任何现有服务。
- 脚本不会读取或输出本地配置中的账号、密码等敏感值。

四个 Shell 脚本都启用了 `set -euo pipefail`：命令失败、使用未定义变量或管道中的任一命令失败时，
脚本都会立即以非零状态退出，使 CI 能够准确判定门禁失败。

## ci/verify-submodules.sh

### 作用

校验父仓库记录的 Git Submodule 快照与当前检出的子模块完全一致，避免 CI 使用错误、未初始化、
发生冲突或带有本地修改的前后端代码。

### 校验内容

1. 执行 `git submodule status --recursive`，确认仓库配置了子模块。
2. 拒绝以下状态标记：
   - `-`：子模块尚未初始化；
   - `+`：检出的提交与父仓库记录的 gitlink 不一致；
   - `U`：子模块存在合并冲突。
3. 分别比较父仓库 gitlink、`git submodule status` 输出和子模块当前 `HEAD`。
4. 检查每个子模块工作树，存在已跟踪修改或未跟踪文件时失败。
5. 全部通过后输出子模块状态。

### 使用方式

```bash
scripts/ci/verify-submodules.sh
```

该脚本被 GitHub Actions 的 `snapshot` job 调用。它要求在父仓库的 Git 工作树内执行；脚本会自动定位
仓库根目录。开发中的本地子模块通常包含未提交修改或尚未更新父仓库指针，此时失败属于预期行为。

## ci/verify-admin-bundle.sh

### 作用

检查后端最终生成的 Spring Boot 可执行 JAR 是否符合 `full` 或 `core` 组装契约，防止 Maven profile
配置错误或上一次构建残留导致模块被漏打包、误打包。

### 参数

| 参数 | 必须包含 | 业务模块要求 |
| --- | --- | --- |
| `full` | `ruoyi-system`、`ruoyi-common-notify`、`ruoyi-common-oss` | 必须包含 `ruoyi-job`、`ruoyi-ai`、`ruoyi-demo`、`ruoyi-workflow`、`ruoyi-gen`。 |
| `core` | `ruoyi-system`、`ruoyi-common-notify`、`ruoyi-common-oss` | 必须排除上述五个业务模块。 |

脚本使用 JDK 的 `jar tf` 读取
`ruoyi-vue-plus-namewta/ruoyi-admin/target/ruoyi-admin.jar` 中的 `BOOT-INF/lib/` 条目。
它只校验已经生成的产物，不负责执行 Maven 打包；产物不存在、参数无效或模块集合不符合契约时均会失败。

### 使用方式

```bash
# 全量业务组合
(cd ruoyi-vue-plus-namewta && ./mvnw clean package -DskipTests)
scripts/ci/verify-admin-bundle.sh full

# 核心平台组合
(cd ruoyi-vue-plus-namewta && ./mvnw clean package -Pbundle-core -Dmaven.test.skip=true)
scripts/ci/verify-admin-bundle.sh core
```

两次打包都使用 `clean`，用于避免前一种 profile 的产物污染后一种 profile 的校验。该脚本被 GitHub Actions
的 `backend` job 在两次打包后分别调用。

## ci/run-external-services.sh

### 作用

创建一套一次性的真实外部服务环境，等待服务健康后运行后端指定的集成测试。它用于验证代码确实能够与
Redis、MySQL 和兼容 S3 协议的 MinIO 协作，而不只是通过 mock 或纯单元测试。

### 执行流程

1. 以 `GITHUB_RUN_ID`（本地执行时使用进程 ID）生成唯一的 Docker 网络名和容器名。
2. 启动以下固定版本的容器：

   | 服务 | 镜像 | 默认宿主机端口 | 用途 |
   | --- | --- | --- | --- |
   | Redis | `redis:8.6.3` | `16379` | 通知幂等存储、OSS 上传票据存储集成测试。 |
   | MySQL | `mysql:8.4.9` | `13306` | 通知监控、业务菜单退役集成测试。 |
   | MinIO | `pgsty/minio:RELEASE.2026-08-04T00-00-00Z` | `19000` | OSS/S3 客户端集成测试。 |

3. 分别使用 `redis-cli ping`、`mysqladmin ping` 和 MinIO readiness endpoint 等待服务就绪；超时或健康检查
   失败时脚本退出。
4. 在后端子模块中通过 Maven Wrapper 运行以下测试：
   - `RedisNotifyIdempotencyStoreIntegrationTest`
   - `RedisOssUploadTicketStoreIntegrationTest`
   - `NotifyMonitorMySqlIntegrationTest`
   - `MinioOssClientIntegrationTest`
   - `BusinessMenuRetirementMySqlIntegrationTest`
5. 无论测试成功还是中途失败，`EXIT` trap 都会删除本次创建的三个容器和 Docker 网络。

### 可配置端口

| 环境变量 | 默认值 | 含义 |
| --- | --- | --- |
| `NAMEWTA_CI_REDIS_PORT` | `16379` | Redis 映射到宿主机的端口。 |
| `NAMEWTA_CI_MYSQL_PORT` | `13306` | MySQL 映射到宿主机的端口。 |
| `NAMEWTA_CI_MINIO_PORT` | `19000` | MinIO API 映射到宿主机的端口。 |

端口被占用时，可以在单次命令前覆盖：

```bash
NAMEWTA_CI_REDIS_PORT=26379 \
NAMEWTA_CI_MYSQL_PORT=23306 \
NAMEWTA_CI_MINIO_PORT=29000 \
scripts/ci/run-external-services.sh
```

### 前置条件与注意事项

- 需要 Bash、Git、curl、Java 21、可用的 Docker CLI/daemon，以及后端 Maven Wrapper 所需的网络和依赖。
- 脚本使用的数据库和对象存储凭据仅属于一次性 CI 容器，不应复用于共享环境或生产环境。
- 脚本会删除与本次运行生成名称相同的容器和网络；不要手工复用 `namewta-*-<run-id>` 命名。
- 该脚本被 GitHub Actions 的 `external-services` job 调用，本地没有 Docker 时无法执行完整验收。

## 与 GitHub Actions 的对应关系

| GitHub Actions job | 脚本 | 门禁目标 |
| --- | --- | --- |
| `snapshot` | `verify-submodules.sh` | 确保父仓库与前后端子模块快照一致且工作树干净。 |
| `backend` | `verify-admin-bundle.sh full\|core` | 确保两种后端分发包具有正确的模块边界。 |
| `external-services` | `run-external-services.sh` | 使用真实 Redis、MySQL、MinIO 验证关键集成路径。 |
