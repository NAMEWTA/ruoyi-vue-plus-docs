# Handoff: NAMEWTA 全栈与 Nacos 中间件部署

## 交接目标

接手并维护 2026-09-01 已在远端服务器完成的 NAMEWTA 全栈部署：在既有 `/data/namewta-data` 持久化根目录中加入官方 Nacos，启动后端双实例、Monitor、SnailJob、SnailAI、管理前端与统一 Nginx 入口，并将本次创建的开发/运行服务、容器、镜像和 Compose project 全部统一为 `namewta` 前缀。

这是运行部署交接，不要求接手者重复实现已经完成的 SpecDev change。后续操作前应重新读取现场状态；本文中的运行结论表示 2026-09-01 最后一次验证时的检查点。

## 安全与授权边界

- 远端定位：`172.16.105.9:22`，SSH 用户为 `root`，授权操作根目录为 `/data/namewta-data`。
- 本文不保存 SSH 密码、Nacos 密码、数据库密码、JWT、token、密钥、哈希口令或环境变量实际值。凭据从用户或获批的秘密渠道取得。
- `/data/namewta-data/.env` 与 `/data/namewta-data/namewta-release.env` 是敏感文件，权限已设为 `0600`；不要打印、提交或粘贴其内容。
- 不得停止、改名、重建或迁移同机既有 CDE 容器。CDE 已占用宿主机 `8848/9848`，NAMEWTA Nacos 因而故意不直接发布这两个宿主机端口。
- 所有 Docker build、Compose、临时产物和持久化操作均应限制在远端 `/data/namewta-data` 内。
- 本轮没有获得删除 SpecDev source 分支/worktree 的授权；不要借部署维护清理用户工作树或其他并行改动。

## SpecDev 权威入口

- Change：`2026-08-31-optional-nacos-dynamic-config`
- 状态：`completed`，`current_work: null`，无 blocker，尚未归档。
- 状态入口：`<Path>{roots.state}/specdev/changes/2026-08-31-optional-nacos-dynamic-config/.status.json</Path>`
- 当前完成/验收 owning 工件：`<Path>{roots.state}/specdev/changes/2026-08-31-optional-nacos-dynamic-config/evidence/T-06.md</Path>`
- 执行计划：`<Path>{roots.state}/specdev/changes/2026-08-31-optional-nacos-dynamic-config/goal-plan.md</Path>`
- 规范与 Ticket 映射：`<Path>{roots.state}/specdev/changes/2026-08-31-optional-nacos-dynamic-config/spec.md</Path>`、`<Path>{roots.state}/specdev/changes/2026-08-31-optional-nacos-dynamic-config/tickets-map.md</Path>`
- 各 Ticket 证据：`<Path>{roots.state}/specdev/changes/2026-08-31-optional-nacos-dynamic-config/evidence/</Path>`
- 使用说明：`<Path>{roots.state}/specdev/changes/2026-08-31-optional-nacos-dynamic-config/01_Nacos配置与启动.md</Path>`
- 完整改动讲解：`<Path>{roots.state}/specdev/changes/2026-08-31-optional-nacos-dynamic-config/02_Nacos完整改动全景.md</Path>`
- 设计上下文：`<Path>{roots.state}/specdev/changes/2026-08-31-optional-nacos-dynamic-config/ADR.md</Path>`、`<Path>{roots.state}/specdev/changes/2026-08-31-optional-nacos-dynamic-config/CONTEXT.md</Path>`、`<Path>{roots.state}/specdev/changes/2026-08-31-optional-nacos-dynamic-config/LOG.md</Path>`

该 change 没有 `<Path>{roots.state}/specdev/changes/2026-08-31-optional-nacos-dynamic-config/source.md</Path>` 或 `<Path>{roots.state}/specdev/changes/2026-08-31-optional-nacos-dynamic-config/triage.md</Path>`，因为它由用户对话直接进入 Grill/Spec 流程，而不是 intake/triage。不要补造这两个工件；来源和决策由 `<Path>{roots.state}/specdev/changes/2026-08-31-optional-nacos-dynamic-config/CONTEXT.md</Path>`、`<Path>{roots.state}/specdev/changes/2026-08-31-optional-nacos-dynamic-config/ADR.md</Path>`、`<Path>{roots.state}/specdev/changes/2026-08-31-optional-nacos-dynamic-config/LOG.md</Path>` 与 `<Path>{roots.state}/specdev/changes/2026-08-31-optional-nacos-dynamic-config/design-tree.json</Path>` 承载。没有待关闭的远程 issue/PR，也没有 `pending-close` 或 `close-failed` external action。

## 最终运行拓扑

### Compose projects

| Project | 职责 |
|---|---|
| `namewta-data` | MySQL、Redis、MinIO、Nacos |
| `namewta-backend` | 两个 admin 实例、SnailJob、SnailAI |
| `namewta-observability` | Monitor 及观测组件 |
| `namewta-frontend` | 管理前端与统一 Nginx LB |

### 关键容器

| 范围 | 容器 |
|---|---|
| 基础设施 | `namewta-data-mysql`、`namewta-data-redis`、`namewta-data-minio`、`namewta-data-nacos` |
| 后端 | `namewta-server1`、`namewta-server2`、`namewta-snailjob-server`、`namewta-snailai-server` |
| 管理与入口 | `namewta-monitor-admin`、`namewta-nginx-admin-web`、`namewta-nginx-lb` |

观测栈其余容器也已使用 `namewta-*` 前缀。应用镜像为：

- `namewta/namewta-admin:6.0.0`
- `namewta/namewta-monitor-admin:6.0.0`
- `namewta/namewta-snailjob-server:6.0.0`
- `namewta/namewta-snailai-server:6.0.0`

外部基础镜像继续使用固定版本，例如 Nginx `nginx:1.31.1` 和 Nacos `nacos/nacos-server:v2.5.4`，无需改成私有 `namewta` 镜像名。

旧的 `ruoyi-namewta-backend`、`ruoyi-namewta-observability`、`ruoyi-namewta-frontend` project 已停止，旧容器和旧 `ruoyi-namewta/*` 镜像标签已清理，空的旧网络也已删除。不要把历史发布包目录或 Nacos Data ID 中的 `ruoyi-namewta` 当成运行服务命名问题：它们是兼容合同，未被迁移。

## 对外访问与前端接入

统一入口是宿主机 `40080`：

| 功能 | URL |
|---|---|
| 管理前端 | `http://172.16.105.9:40080/namewta/` |
| Monitor | `http://172.16.105.9:40080/admin/applications` |
| SnailJob | `http://172.16.105.9:40080/snail-job/` |
| SnailAI | `http://172.16.105.9:40080/snail-ai/` |
| Nacos | `http://172.16.105.9:40080/nacos/` |
| 后端开发代理目标 | `http://172.16.105.9:48080` |

开发环境地址落在 `plus-ui-namewta/apps/admin-web/.env.development`；生产构建使用 `plus-ui-namewta/apps/admin-web/.env.production` 中的同源相对路径 `/admin/applications`、`/snail-job`、`/snail-ai` 和 `/nacos/`。

前端没有连接 Nacos SDK，也不会代填 Nacos 凭据。系统管理菜单解析到 `monitor/nacos/index`，由 `plus-ui-namewta/apps/admin-web/src/router/adminManifestRegistry.ts` 注册为外部监控页；`plus-ui-namewta/apps/admin-web/src/views/monitor/external/index.vue` 读取 `VITE_APP_NACOS_ADMIN`，经过既有 external intent/URL 校验后嵌入 iframe。菜单权限只控制入口可见性，Nacos Console 仍执行自己的登录认证，不是 SSO。

Nginx 在统一入口把 `/nacos/` 转发到 Docker 网络内的 `nacos:8848` 服务别名。不要使用宿主机 `127.0.0.1:8848` 验证 NAMEWTA Nacos，那是同机既有 CDE Nacos。

## Nacos 运行合同

- 版本固定为官方稳定镜像 `nacos/nacos-server:v2.5.4`，standalone 模式。
- 配置、日志持久化到 `/data/namewta-data/runtime/nacos/data` 与 `/data/namewta-data/runtime/nacos/logs`。
- 配置元数据持久化到 MySQL 独立 `nacos` 数据库，数据库账号仅授予所需 CRUD 权限。
- Nacos auth 已开启；user-agent 白名单关闭；认证缓存通过 `NACOS_AUTH_CACHE_ENABLE=false` 和 `JAVA_OPT=-Dnacos.core.auth.caching.enabled=false` 关闭。
- 管理账号保留管理员角色；应用使用单独的只读配置账号，只能读取 `prod` namespace 的配置范围。账号名和密码不在本文保存。
- 应用的固定定位是 namespace `prod`、group `DEFAULT_GROUP`、Data ID `ruoyi-namewta.yml`。该 Data ID 是既有配置合同，不要仅为名称统一而改名。
- 2026-09-01 最后验证时，原始配置正文为 99 bytes，SHA-256 为 `8a92880823f803facf9f283f988701c43fd53ebbea82bfe99633facb945cd9ce`；两个后端实例均 `UP`、`nacosConfig.connected=true` 且报告相同 digest。
- Nacos 动态配置不是“任意 YAML 都立刻热更新”。合法配置先整份校验，受保护键或非法候选整份拒绝；已注册的即时参与者热更新，其他合法键标记为需重启。准确白名单、优先级、回退、离线重启和拒绝合同以 `<Path>{roots.state}/specdev/changes/2026-08-31-optional-nacos-dynamic-config/spec.md</Path>` 与 `<Path>{roots.state}/specdev/changes/2026-08-31-optional-nacos-dynamic-config/evidence/T-06.md</Path>` 为准。
- 当前部署通过 `release-artifacts/docker/overrides/nacos-enabled.yml` 对两个 admin 实例都启用 Nacos，而不是只启用其中一个。

## 远端持久化布局

| 路径 | 作用 |
|---|---|
| `/data/namewta-data/docker-compose.yml` | 服务器基础设施现场 Compose；含 NAMEWTA Nacos |
| `/data/namewta-data/.env` | 基础设施敏感变量，`0600` |
| `/data/namewta-data/namewta-release.env` | 应用/发布敏感变量与镜像变量，`0600` |
| `/data/namewta-data/release-current` | 当前发布包符号链接 |
| `/data/namewta-data/runtime/nacos/` | Nacos data/logs |
| `/data/namewta-data/runtime/logs/` | 应用日志 |
| `/data/namewta-data/runtime/snailai/upload/` | SnailAI 上传持久化 |

MySQL、Redis、MinIO 的数据也都位于 `/data/namewta-data/runtime/` 下的既有目录。最后验证时 `ry-namewta` 有 89 张表，Nacos 的 users/roles/permissions/config_info 记录数分别为 2/2/2/1。

当前发布包仍位于历史目录 `/data/namewta-data/releases/ruoyi-namewta-prod-20260901120341`，由 `/data/namewta-data/release-current` 指向。该目录名是已发布工件标识，不要直接重命名；运行时服务命名已经独立完成 `namewta` 收敛。

## 通用发布模板改动

以下是项目内可复用配置，远端现场 Compose 在端口和容器名上有明确覆盖：

- `release-artifacts/docker/docker-compose-infrastructure.yml`：加入可选 Nacos profile、官方 2.5.4 镜像、MySQL 外部存储、认证开关、健康检查和 data/logs 持久化。通用模板默认容器为 `namewta-nacos`，可绑定回环 `8848/9848`；远端根 Compose 因 CDE 端口冲突改为 `namewta-data-nacos` 且不发布端口。
- `release-artifacts/docker/docker-compose-backend.yml`：服务键、容器名、镜像变量、Spring application name、内部 DNS 和网络统一为 `namewta`。
- `release-artifacts/docker/docker-compose-observability.yml`：Monitor 与观测容器统一为 `namewta`。
- `release-artifacts/docker/docker-compose-frontend.yml`：管理前端、HTTP/TLS LB 服务统一为 `namewta`。
- `release-artifacts/docker/overrides/nacos-enabled.yml`：为 `namewta-server1`、`namewta-server2` 注入显式 Nacos 启用配置。
- `release-artifacts/docker/frontend/nginx/lb/nginx-lb-http.conf.template`、`release-artifacts/docker/frontend/nginx/lb/nginx-lb-tls.conf.template`、`release-artifacts/docker/frontend/nginx/apps/nginx-admin-web.conf.template`：更新 upstream 名称并加入 `/nacos/` 同源代理。
- `release-artifacts/.env.example`：加入 `NAMEWTA_NETWORK`、`NAMEWTA_*_IMAGE` 与 Nacos 示例变量。
- `release-artifacts/scripts/docker-manage.sh`、`release-artifacts/scripts/release-manage.sh`、`release-artifacts/scripts/init-nacos-mysql-container.sh`：适配 NAMEWTA 命名、Nacos 初始化与发布编排。
- `release-artifacts/scripts/verify-release.sh`、`release-artifacts/tests/release-config.test.mjs`：同时支持源码工作区和打包后的 release 布局，并校验运行前缀。
- `release-artifacts/skills/ruoyi-namewta-nginx-config/scripts/add_app.py`：生成 `namewta` 服务/容器名，兼容直接 release bundle 布局与 Python 3.8。
- `release-artifacts/docker/backend/images/ruoyi-admin/Dockerfile`、`release-artifacts/docker/backend/images/ruoyi-monitor-admin/Dockerfile`、`release-artifacts/docker/backend/images/ruoyi-snailjob-server/Dockerfile`、`release-artifacts/docker/backend/images/ruoyi-snailai-server/Dockerfile`：OCI title 改为 `namewta`。
- `release-artifacts/docker/observability/alloy/config.alloy`：日志 service/job label 改为 `namewta`；日志目录中的历史 `ruoyi` 字样是容器内兼容路径，不代表服务名。

## 最后验证结果

- 管理前端、Monitor、SnailJob、SnailAI、Nacos 五个入口均返回 HTTP 200。
- Nacos 管理账号和只读应用账号均可通过统一 `/nacos/` 代理登录；匿名读取配置被拒绝。
- 两个后端实例均健康并连接 Nacos，配置 digest 一致；重启 Nacos 后原配置继续存在并重新收敛。
- Spring Boot Admin 注册结果：`namewta-admin` 2 个实例，`namewta-monitor-admin`、`namewta-snailjob-server`、`namewta-snailai-server` 各 1 个实例。
- 本地 `release-artifacts/scripts/verify-release.sh` 为 16/16 通过；本机没有 Docker，因此 Compose 运行验证按设计跳过。
- 远端同脚本为 15 pass、1 skip；唯一 skip 是发布包不含后端源码，无法执行 source-only 的 stage-mysql 检查。四套 Compose 解析与 Nginx skill 检查通过。
- `git diff --check` 通过；远端旧运行前缀容器数量为 0；MySQL `general_log=OFF`。

完整 SpecDev 隔离环境 E2E 已通过，证据在 `<Path>{roots.state}/specdev/changes/2026-08-31-optional-nacos-dynamic-config/evidence/T-06.md</Path>`。生产式现场验证与隔离 E2E 拓扑不同，不要混用结果。

## 已知陷阱

1. 对 Nacos 单服务执行 Compose 时必须使用 `--no-deps`。一次未带该参数的 recreate 曾连带重启 `namewta-data-mysql`；持久化数据、89 张业务表与 Nacos 记录随后均已验证完好，但后续不可重复该操作。
2. `/data/namewta-data/namewta-release.env` 中 `JAVA_OPTS` 含空格，不能把整个文件直接 `source` 到 shell；应交给 Docker Compose `--env-file` 解析，或只用不会打印值的安全方式读取单项。
3. 不要直接重跑旧的“第一实例关闭、第二实例开启”完整现场矩阵。当前 override 有意让两个实例都开启，旧脚本曾因此在预期 `[true,false]`、实际 `[false,false]` 处提前失败。测试配置当场删除并恢复基线，随后做了针对性的双实例验证。若要重跑，先把矩阵参数化为 both-enabled。
4. 通用 infrastructure 模板与远端根 Compose 不完全相同：远端不发布 Nacos `8848/9848`，容器名是 `namewta-data-*`，网络是 `namewta-data-network`。不要用模板覆盖现场文件。
5. 浏览器 iframe 能打开不代表绕过 Nacos 认证；用户仍需在嵌入页面登录 Nacos。
6. 本地聚合仓库当前有大量不属于本次交接的用户改动和 SpecDev 状态变化。不得 reset、checkout、暂存、提交或回退未列入本 handoff 的路径。

## 备份与恢复点

- 部署前备份：`/data/namewta-data/backups/deploy-20260901120104`
- 命名前缀迁移备份：`/data/namewta-data/backups/namewta-prefix-20260901`
- 清理重建前的 Nacos 本地 Raft 状态：`/data/namewta-data/backups/namewta-prefix-20260901/nacos-data-before-clean-rebuild`
- 原生产配置备份：`/data/namewta-data/backups/deploy-20260901120104/nacos-ruoyi-namewta-prod-original.yml`
- 服务器部署记录：`/data/namewta-data/DEPLOYMENT-20260901.md`

原配置已按字节恢复。需要回退时先做只读盘点并读取服务器部署记录，不要删除 volume，也不要用 `down -v`。

## 接手检查清单

先取得获批凭据，然后只读确认现场：

```bash
ssh root@172.16.105.9
cd /data/namewta-data
docker compose ls
docker ps --format '{{.Names}}\t{{.Status}}\t{{.Ports}}'
docker network ls --format '{{.Name}}'
readlink -f release-current
```

Nacos 单服务需要重建时，确认现场 service key 仍为 `nacos` 后使用：

```bash
cd /data/namewta-data
docker compose -p namewta-data --env-file .env \
  -f docker-compose.yml up -d --no-deps nacos
```

随后通过 `http://172.16.105.9:40080/nacos/` 和两个应用的 health/info 做验证。不要用宿主机 8848，也不要输出 auth 响应、环境变量或配置正文。若需要重新 build，先核对 `/data/namewta-data/release-current` 与 `/data/namewta-data/namewta-release.env`，所有 build context、缓存和产物仍放在 `/data/namewta-data` 内，镜像标签继续使用 `namewta/namewta-*`。

## Git 状态与交付边界

- Nacos 动态配置 SpecDev change 本身已完成，提交和验收定位以 `<Path>{roots.state}/specdev/changes/2026-08-31-optional-nacos-dynamic-config/.status.json</Path>` 与 `<Path>{roots.state}/specdev/changes/2026-08-31-optional-nacos-dynamic-config/evidence/</Path>` 为准。
- 服务器部署、发布模板的 `namewta` 命名收敛和开发环境地址调整尚未在本轮创建新的聚合仓库提交。
- `release-artifacts/`、`plus-ui-namewta/` 及其他目录存在用户或并行任务改动；提交前必须按本文列出的路径重新审查 diff，不能把整个 dirty worktree 一次性加入。
- 远端现场源文件不是 Git 权威来源；应先在项目模板中完成受控改动，再同步到 `/data/namewta-data`，同时保留现场端口覆盖。

## 建议 skills

- `engineering-standards`：聚合工作区、文件、验证和交付边界。
- `plus-ui-frontend-conventions`：管理端动态菜单、external 页面、环境变量和 iframe 路由。
- `ruoyi-backend-development`：后端双实例、Spring 配置、构建与运行验证。
- `ruoyi-common-modules-guide`：`ruoyi-common-nacos` 的依赖与公共模块边界。
- `ruoyi-system-module-guide`：系统管理菜单、权限与 Nacos 菜单入口。

若接手任务只是远端运行维护，先读 `engineering-standards` 并使用本文的远端检查清单即可；若修改代码，再按涉及模块加载最小充分 skill。
