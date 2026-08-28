# NAMEWTA 增强说明

NAMEWTA 是 RuoYi-Vue-Plus / Plus-UI 的增强发行线。上游仍是基础能力与修复的重要来源，但 NAMEWTA 的产品分支、目录所有权和安全不变量以本工作区当前实现为准。

## 前端增强

### 多 App 领域化 monorepo

前端从单 App 源码树调整为以下所有权分层：

| 层级 | 当前职责 |
|---|---|
| `apps/*` | 独立 Client、入口、布局、品牌、主题、路由组合、会话命名空间和部署配置 |
| `packages/domains/*` | 无 Vue/DOM 的 API、领域类型、查询/命令服务和传输映射 |
| `packages/web-domains/*` | Vue 页面、领域组件、Web hooks、语言资源和动态路由 manifest |
| `packages/platform/*` | 认证、权限、HTTP、运行时等跨领域端口和合同 |
| `packages/adapters/*` | Axios、浏览器存储、浏览器加密及未来终端适配实现 |
| `packages/web-kit/*` | 多个 Web 消费者共同使用的壳层、基础组件和设计 token |
| `packages/api-contracts` | 可追溯、确定性生成的 OpenAPI 传输合同 |

当前只激活 `admin-web`。`client-web`、移动 Web 和小程序仅保留 README 规划入口，不属于工作区包；多 App 分层是可扩展架构边界，不表示所有占位终端已经实现。

domain 与后端模块一一对应为 `admin`、`system`、`workflow`、`demo`、`gen`、`ai`；包内第二层按 Controller 的稳定 HTTP 资源命名。由此可以从 `/system/client` 直接定位到 `domains/system/src/client`，再定位到 `web-domains/system/src/client` 的 Web 表现层。

App 不重新实现后端接口和数据模型。新增 App 时只选择需要的公开 domain/web-domain，并实现该终端自己的适配和界面组合。未来移动端、小程序可以复用 headless domain 与 platform 合同，同时替换终端特有 UI、请求、存储和生命周期。

### Client 级认证、动态路由与权限

每个 App 使用显式 ClientId 和独立会话命名空间。登录前先获取服务端 ClientContext；注册开关、登录域、请求加密和认证方式均由服务端上下文约束，失败或畸形数据按关闭处理。

Admin 登录后恢复用户信息，按当前 Client 获取后端菜单，由 `packages/platform/app-runtime` 生成确定导航投影，再使用 App 已选择的 web-domain manifest 解析组件键并通过 Vue Router `addRoute` 注册。Admin 自有 `navigation` Store 维护 sidebar、topbar、default 和 Router 投影；`packages/web-kit/permission` 安装的 `v-hasPermi`、`v-hasRoles` 与命令式检查消费同一实时 evaluator。后端仍负责最终授权。

### 工程质量

前端使用 pnpm workspace/catalog 管理依赖，并以架构检查、OpenAPI 漂移检查、Oxlint、Oxfmt、TypeScript、Vitest、工作区构建和 Playwright 验证包边界及关键流程。跨 App 导入、包深层导入、跨工作区相对导入和未声明依赖由门禁阻止；第二个 App 激活时必须恢复真实跨 App Client 与会话隔离验收。

## 后端增强

### Client 登录域、RBAC 与会话隔离

用户类型由可维护的登录域及用户关联表达，不再依赖用户表上的单值类型。Client 可配置允许的登录域、注册开关和默认角色；密码、短信、邮件、社交和小程序登录都必须通过当前 Client 准入。

Token 明确区分 OAuth `clientId`、数据库 Client 主键和登录域。角色、菜单、按钮权限、动态路由、默认角色和超级管理员查询按 `userId + Client 主键` 计算；缺失 Client 上下文时拒绝跨域兜底。用户、Client、登录域或角色状态变化时，相关 Client 会话会被定向清理。

### OSS 直传与对象生命周期

后端提供浏览器直传控制面，支持单文件和 Multipart 上传、断点续传、服务端分片校验、过期会话清理及 Client/用户归属校验。对象完成上传后继续通过业务引用、临时状态、授权下载、可恢复删除和物理清理管理生命周期。

### 统一通知

通知基础设施通过渠道标识和适配器解耦业务与邮件/短信实现，补充 Redis 幂等状态机、请求上下文、OSS 附件快照、逻辑通知与投递记录、敏感字段脱敏、清理策略及全局监控。业务模块不再直接绑定具体发送工具。

### 完整 HTTP 系统日志

`ruoyi-common-web` 在 Servlet Filter 边界生成一对可由 `requestId` 关联的请求与响应结构化事件，覆盖同步、异步和异常完成路径。正文采集具有大小上限和媒体类型策略，不可记录或无法采集时输出明确原因；日志输出失败不会改变业务响应。

### 模块和数据治理

`ruoyi-admin` 保持组合入口，业务能力位于 `ruoyi-modules`，跨模块服务与 DTO 通过 `ruoyi-api` 或 common SPI 暴露。默认 full bundle 和 `bundle-core` 都有明确的 Maven profile 与验证方式。

NAMEWTA 当前只验收 MySQL 8.4。上游 `script/sql/ry_vue.sql` 保持不变，本地结构和数据增量分别维护在 append-only 的 `script/sql/namewta/DDL.sql`、`DML.sql`，从而保持上游基线与本地迁移边界。

## 上游能力吸收

后端 `6.X`、前端 `6.X-Vue` 只作为上游镜像。每次上游变化先识别能力、修复或安全语义，再映射到当前模块和包所有者，形成 `adopt`、`adapt`、`reject` 或 `defer` 结论。上游路径可参考，但不会为了目录同构而恢复已移除的兼容门面或破坏 NAMEWTA 的 Client 隔离和多 App 架构。

更细的长期不变量见 [定制边界](upstream/customization-map.md)。
