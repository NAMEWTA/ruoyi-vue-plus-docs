---
name: deploy-namewta-environment
description: 为 NAMEWTA RuoYi-Vue-Plus 全栈提供审计、接管、开发环境初始化、生产部署、迭代升级与回滚流程。处理开发服务器、生产服务器、/data/namewta-data、Docker Compose 中间件、MySQL/Redis/MinIO/Nacos、前后端发布交付，或需要在 temp/relase 下生成私密的端口账密部署文档时使用。
---

# NAMEWTA 全栈环境部署

以仓库内发布资产为事实源，在不覆盖既有现场、不泄露凭据的前提下完成部署和交接。

## 加载项目规范

1. 读取 `../../../AGENTS.md` 与 `../engineering-standards/SKILL.md`。
2. 构建后端或调整运行配置时读取 `../ruoyi-backend-development/SKILL.md`。
3. 构建前端或调整路由时读取 `../plus-ui-frontend-conventions/SKILL.md`。
4. 涉及 OSS 或 system 公共能力时，按需读取 system/common 模块 Skill。
5. 文档与当前源码、Compose、POM 或测试冲突时，以工作树证据为准。

## 选择部署模式

从 [环境模式](references/environment-modes.md) 中只选择一个模式：`audit`、`takeover`、`fresh-dev`、`release-prod`、`upgrade` 或 `rollback`。

只要服务器根目录、Compose 项目、容器或持久化数据已经存在，就默认使用 `takeover`。盘点不完整时不得推断为全新环境。

## 准备输入

1. 将 `assets/templates/deployment-profile.json.template` 复制到 Skill 目录之外，只填写非敏感拓扑；新发布使用 schema v2，并在现场身份核对后显式设置 `release.compose.identityConfirmed=true`。现场状态从 v2 `assets/templates/deployment-state.json.template` 创建。
2. 只有托管凭据工具无法提供值时，才将 `assets/templates/deployment-secrets.json.template` 复制到被忽略的本地目录。
3. 敏感输入和包含账密的报告一律设置为 `0600`。
4. 连接服务器前执行校验：

```bash
node .agents/skills/deploy-namewta-environment/scripts/validate-profile.mjs \
  --profile temp/relase/deployment-profile.json
```

不得提交密码、令牌、私钥、`.env`、`*local.yml` 或生成的报告；不得将它们粘贴到 SpecDev 文档、终端输出、对话或日志中。

## 先盘点再写入

按 [既有环境接管](references/existing-site-takeover.md) 盘点主机、目录、Compose 项目、容器、网络、端口、镜像、挂载、数据库、Redis、MinIO、Nacos、入口路由和健康状态。目录落位与文件模式必须符合 [服务器目录与权限](references/server-layout-and-permissions.md)。

先将现场与配置档案比较，形成变更清单和备份方案，再执行外部写操作。目标主机或根目录不明确、凭据不完整、发现不属于 NAMEWTA 的资源时必须停止。

已知开发服务器的授权根目录是 `/data/namewta-data`。同机 CDE 系统不在操作范围内。NAMEWTA Nacos 只在内部网络使用，并通过统一入口访问；存在冲突时不得绑定宿主机 `8848` 或 `9848`。

## 生成本地开发配置

```bash
node .agents/skills/deploy-namewta-environment/scripts/render-local-config.mjs \
  --profile temp/relase/deployment-profile.json \
  --secrets temp/relase/deployment-secrets.json \
  --output temp/relase/rendered
```

只检查脚本输出的路径和权限，不回显敏感文件内容。仅安装当前模式需要的文件。中间件初始化顺序与 OSS 不变量见 [中间件、数据库与 OSS](references/middleware-database-oss.md)。

## 构建与部署

`takeover`、`upgrade` 和 `release-prod` 先读取[全栈滚动发布运行手册](references/rolling-full-stack-release.md)，再按[构建、传输与发布](references/build-transfer-release.md)执行专题步骤：

1. 运行发布校验；开发环境构建指定目标，生产环境同时构建前后端。
2. 生成发布清单和 SHA-256 校验值。
3. 备份当前版本、配置、数据库和持久化服务元数据；受限开发库 waiver 只能按安全边界使用。
4. 传输到授权根目录下的新暂存目录，并在服务器端校验文件。
5. 按基础设施、可选 Nacos、可观测、后端实例 1、后端实例 2、前端的顺序启动；每一步通过门禁后才继续。
6. 接管模式必须沿用现场版本化 Compose 文件，不得用通用模板覆盖服务器根 Compose。

禁止执行 `docker compose down -v`。单独重建 Nacos 必须使用 `--no-deps`。Nacos 始终是可选的稀疏覆盖，具体见 [Nacos 运行契约](references/nacos-runtime-contract.md)。

## 验证与交接

执行 [验证与排障](references/verification-and-troubleshooting.md) 中的全部门禁。必须保证启用的默认 OSS 配置恰好一个且为 `PRIVATE`（`access_policy=0`）；验证 MinIO 私有探针、匿名拒绝以及签名链接过期。启用 Nacos 或 OpenAPI 时，两套后端实例必须收敛到相同非敏感配置摘要。

发布前校验前端产物，滚动完成后校验组合候选：

```bash
node .agents/skills/deploy-namewta-environment/scripts/verify-frontend-artifact.mjs \
  --profile temp/relase/deployment-profile.json \
  --index plus-ui-namewta/apps/admin-web/dist/index.html
node .agents/skills/deploy-namewta-environment/scripts/verify-release-candidate.mjs \
  --profile temp/relase/deployment-profile.json \
  --state temp/relase/deployment-state.json
```

```bash
node .agents/skills/deploy-namewta-environment/scripts/generate-deployment-report.mjs \
  --profile temp/relase/deployment-profile.json \
  --secrets temp/relase/deployment-secrets.json \
  --state temp/relase/deployment-state.json \
  --output temp/relase/namewta-deployment.md
```

托管凭据不可读取时，报告应注明其保管位置和状态，不得编造值。报告必须包含入口、端口、账号、持久化路径、版本、验证证据、升级流程、回滚流程与未决风险。后续迭代按 [升级与回滚](references/upgrade-and-rollback.md) 执行。

## 安全边界

- 修改远程主机、数据库、对象存储、DNS、证书、防火墙或外部服务前，必须取得明确授权。
- 只使用配置档案中服务器根目录下的绝对路径；拒绝 `/`、用户主目录、空路径和未解析变量。
- 数据库迁移、配置替换、数据移动或版本提升前必须完成可验证备份。只有精确目标为开发环境、用户明确批准且零行/对象身份/冲突 preflight 与 `forward-only` 恢复边界完整时，才允许一次性数据库备份 waiver；生产环境不接受 waiver。
- 不得伪造凭据、版本、健康状态或部署证据。
- 校验值不一致、备份失败、资源归属异常、Schema 不兼容、私桶可匿名访问或健康检查失败时必须停止。
- 保留失败暂存目录、旧镜像、rollback 资产和脱敏日志用于排障；清理需要独立授权。
