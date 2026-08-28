# NAMEWTA Release Artifacts

本目录是 `ruoyi-vue-plus-docs` 前后端的发布事实源，包含可复现构建、四类 Docker Compose、Nginx 多 App 入口、运行配置样例、可观测配置与配套 Skill。

## 目录职责

- `builds/`：`current_dev`、`current_prod` 与日期备份；构建产物不提交。
- `bundles/`：可传输部署包；不提交。
- `scripts/release-manage.sh`：构建前端、后端或全部服务，并执行备份、Docker 上下文准备与部署包生成。
- `scripts/docker-manage.sh`：按 `infrastructure`、`observability`、`backend`、`frontend` 四类管理 Compose。
- `docker/`：镜像、Compose、Nginx、基础设施和可观测配置。
- `docker/frontend/nginx/html/nginx-lb/`：统一 LB 的内部静态维护页；上游返回 404 或常见 5xx 时保留原状态码展示。
- `skills/ruoyi-namewta-nginx-config/`：新增前端 App 与维护 LB/Nginx 的项目内动态 Skill。

## 配置

真实密码和私有路径前缀只写入未纳入版本管理的 env 文件。先复制变量名并替换全部占位值：

```bash
cp release-artifacts/.env.example release-artifacts/.env
```

`ADMIN_WEB_PREFIX` 不含首尾斜杠。构建脚本会将其转换为 Vite 的 `/<prefix>/` 和 `/<prefix>/<env>-api`，不修改前端源码环境文件。

当前项目只有 `apps/admin-web` 是可构建 App；`client-web`、`mobile-web` 和 `miniapp-taro` 仍是占位目录，不会进入发布产物。

## 构建

```bash
# 完整生产构建，默认使用后端 bundle-full
bash release-artifacts/scripts/release-manage.sh build \
  --target all --env prod --env-file release-artifacts/.env

# 仅构建前端或后端
bash release-artifacts/scripts/release-manage.sh build --target frontend --env prod
bash release-artifacts/scripts/release-manage.sh build --target backend --env prod

# 备份所有 current_<env>
bash release-artifacts/scripts/release-manage.sh backup

# 将 current_prod 投放到 Docker 构建上下文与 Nginx 静态目录
bash release-artifacts/scripts/release-manage.sh stage --env prod

# 只准备六份有序 MySQL 初始化 SQL
bash release-artifacts/scripts/release-manage.sh stage-mysql

# 生成独立部署包
bash release-artifacts/scripts/release-manage.sh bundle --env prod
```

构建目录内的 `release-manifest.json` 记录父仓库及两个子模块 SHA、环境、产物和 SHA-256，便于追溯。

提交或交付前执行发布目录自检；本机有 Docker Compose 时会额外解析四份 Compose：

```bash
bash release-artifacts/scripts/verify-release.sh
```

## Docker Compose 分类

| 分类 | Compose | 主要服务 |
|---|---|---|
| 基础设施 | `docker-compose-infrastructure.yml` | MySQL、Redis、MinIO；可选 Elasticsearch |
| 日志监控 | `docker-compose-observability.yml` | Monitor Admin、Loki、Alloy、Grafana；可选 Prometheus/exporters |
| 后端 | `docker-compose-backend.yml` | 双实例 Admin、SnailJob、SnailAI |
| 前端 | `docker-compose-frontend.yml` | Nginx LB、各 App 独立 Nginx、可选 LB TLS |

四类 Compose 共享 external bridge network `ruoyi-namewta-network`，管理脚本会在启动前幂等创建。默认宿主机端口只绑定 `127.0.0.1`；需要内网访问时显式设置 `NAMEWTA_BIND_HOST`。

```bash
# 校验全部配置
bash release-artifacts/scripts/docker-manage.sh config all

# 准备产物、构建应用镜像并按顺序启动
bash release-artifacts/scripts/release-manage.sh stage --env prod
bash release-artifacts/scripts/docker-manage.sh build-images
bash release-artifacts/scripts/docker-manage.sh up all

# 启用统一入口 TLS
bash release-artifacts/scripts/docker-manage.sh up frontend --profile tls

# Linux 主机指标与容器指标
bash release-artifacts/scripts/docker-manage.sh up observability --profile metrics
```

不要使用 `docker compose down -v`。MySQL、Redis、MinIO、Loki、Grafana 和 Prometheus 数据均需按 `NAMEWTA_DATA_ROOT` 单独备份。

## MySQL 单库初始化

RuoYi、SnailJob、WarmFlow、AI 与 NAMEWTA 增量统一初始化到 `ry-namewta`，不按模块拆库。初始化顺序固定为：

```text
10-ruoyi-base.sql
20-ry-job.sql
30-ry-workflow.sql
40-ry-ai.sql
50-namewta-ddl.sql
60-namewta-dml.sql
```

已有共享 MySQL 容器时，先准备 SQL，再运行受保护的初始化脚本。脚本拒绝已存在的数据库或应用账号，失败时只清理本次新建的 `ry-namewta` 和 `namewta_app`：

```bash
bash release-artifacts/scripts/release-manage.sh stage-mysql
bash release-artifacts/scripts/init-mysql-container.sh \
  --container namewta-data-mysql \
  --env-file release-artifacts/.env
```

运行密钥只进入被忽略且权限为 `0600` 的 `.env`，不会写回六份 SQL。共享 MySQL 的其他数据库及其 entrypoint 初始化文件不属于该脚本的操作范围。

## Nginx 请求链路

```text
浏览器 /<app-prefix>/
  -> nginx-lb 剥离 App 前缀
  -> nginx-<app> 根路径静态资源
  -> /dev-api 或 /prod-api 再剥离
  -> ruoyi-server1 / ruoyi-server2
```

每个 App Nginx 也映射独立宿主机端口，可直接访问 `http://<host>:<app-port>/<app-prefix>/`。证书只允许运维投放到 `docker/frontend/nginx/cert/`，不得提交私钥。

## 外部依赖

SnailAI 的 Docling 与 PaddleOCR 地址通过 env 注入，本目录不伪造未在当前仓库维护的镜像。SMTP、短信、第三方 OSS 等集成同样由目标环境配置提供。
