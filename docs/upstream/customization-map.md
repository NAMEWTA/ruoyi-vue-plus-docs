# NAMEWTA 上游定制边界

本文件只维护当前长期有效的产品边界。单次上游 SHA、文件清单、冲突和验证结果属于 `docs/upstream/current/`，旧结果通过 Git 历史查看。

## 仓库责任

| 仓库 | 产品分支 | 上游镜像 | 本地责任 |
|---|---|---|---|
| 父仓库 | `main` | 无 | 文档、工程规范、Speculo 状态和两个子模块 gitlink |
| 后端 | `main` | `6.X` | Spring Boot 服务、权限、数据与迁移脚本 |
| 前端 | `main` | `6.X-Vue` | 多 App monorepo、领域包、终端适配与界面组合 |

镜像分支只允许快进；产品变更只进入 `main`；`namewta-base-upstream-6x` 与 `namewta-base-upstream-6x-vue` 不移动。

## 前端边界

| 层级 | 当前 owner | 必须保持的不变量 |
|---|---|---|
| App | `apps/admin-web`；`apps/{client-web,mobile-web,miniapp-taro}` 为占位 | 激活 App 显式选择领域 manifest 与 Client，拥有布局、品牌、启动和终端组合；占位目录保持 README-only |
| Domain | `packages/domains/{admin,system,workflow,demo,gen,ai}` | 按后端模块及 Controller 资源组织 `api.ts`、`types.ts`；headless，不依赖 Vue、DOM 或具体 adapter |
| Web-domain | `packages/web-domains/{admin,system,workflow,demo,gen,ai}` | 拥有领域页面、Web hooks、组件、语言与 manifest；不拥有 App 壳层，不深层导入 domain |
| Platform | `packages/platform/{contracts,auth,http,permission,app-runtime}` | 提供跨领域端口和运行时合同；不反向依赖 App/domain，不实现具体浏览器技术 |
| Adapter | `packages/adapters/{axios-browser,storage-browser,crypto-browser}` | 只实现 platform port，不承载业务规则；Taro adapter 未激活前保持说明占位 |
| Web kit | `packages/web-kit/*` | 提供跨领域 Web 壳层机制、基础组件和 token，不拥有领域流程或后端 API |
| API contracts | `packages/api-contracts` | OpenAPI transport 可追溯且只读；生成模型不得替代手写 domain model |
| Tooling | `tooling/{architecture,openapi}` | 依赖边界与接口漂移检查不进入产品运行时 |

未来移动端和小程序继续使用相同 domain/platform 合同；终端特有 UI、存储、请求与生命周期进入对应 App、web-domain 或 adapter，不把浏览器假设带入 headless domain。

## 跨端关键不变量

- 登录、注册、Token、菜单和动态路由始终绑定当前 Client 上下文；缺失上下文时关闭访问，不跨 Client 回退。
- 后端返回菜单后，由 App 组合的访问服务完成组件解析、路由注册和权限状态更新；按钮权限统一消费同一权限源。
- 字典、OSS、加密、通知、下载等可复用能力进入 domain、platform、adapter 或 web-kit；App 只做终端组合和定制展示。
- 跨领域调用只通过公开导出或 port，不使用包内部路径；领域资源与后端模块、Controller 命名保持可定位。
- 浏览器凭据、密钥、Token、用户输入和提示词不得进入日志；外部 URL、iframe、下载和 OSS 地址必须验证后使用。

## 后端关键不变量

- `clientId` 登录标识、Client 主键和会话/RBAC 上下文语义不得混用；所有登录策略执行 Client 准入。
- 角色、菜单、动态路由和超级管理员查询均受当前 Client 约束；缺失 Client 上下文时拒绝访问。
- 角色菜单/数据权限或用户角色关系变化后，只注销受影响 Client 范围内的授权会话；Redis 与所有 JVM 本地 Token/权限缓存必须同步失效，清理失败不得静默成功。
- `sys.user.passwordPolicy` 是所有新密码生成与写入的唯一策略源，服务端负责最终裁决；公开端点只投影长度和字符类别等非敏感约束，存量弱 BCrypt 密码保持登录兼容并在下一次写入时收敛。
- 临时密码使用独立权限、用户级 60 秒覆盖语义和 Redis 不可逆校验值；错误尝试不消费，正确认证只能原子消费一次，成功后签发普通会话且不改变永久密码，业务审计不得保存凭据明文。
- 模块间优先通过 `ruoyi-api`、common SPI 或公开 Service 合同协作，不跨模块依赖 Controller 或实现细节。
- NAMEWTA 数据库增量仅维护 `script/sql/namewta/DDL.sql` 与 `DML.sql`，保持历史前缀不变并追加幂等增量；初始化顺序为 `ry_vue.sql -> DDL.sql -> DML.sql`。密码能力发布先执行并验证 DML，再发布后端、前端和角色授权；回滚只补偿配置、菜单及授权关系，绝不改写用户密码，配置变化后显式刷新缓存。
- OSS、通知、工作流与权限修改必须同时验证 API 合同、数据隔离、失败语义和对应集成测试。
- 完整 HTTP 系统日志必须保留 requestId 关联、同步/异步/异常终态、正文大小与媒体类型策略；日志采集失败不得改变业务响应。
- OpenAPI 机器身份只有同时具备服务端验签 request attribute、`openapi` userType 和空 Client 字段时，才可跳过浏览器 Client 校验；普通 Token、伪造 header 和泄漏的内部 Token 均不得触发该分支。

## OpenAPI 定制边界

| 定制点 | 当前落位 | 上游同步必须保持的不变量 |
|---|---|---|
| 协议与装配 | `ruoyi-common-openapi`、`OpenApiAutoConfiguration`、`application.yml` | full/core 使用同一 common artifact；`openapi.enabled` 在所有环境默认 `false`；启用时 KEK、Redis、Sa-Token、MVC mapping、唯一 credential/authorization SPI 任一缺失或无效都必须阻止启动，不得回退到本地状态或空权限 |
| 凭据、目录与失效 | `ruoyi-system` 的 OpenAPI credential/catalog Controller、Service、Mapper 和 RBAC/身份写后失效调用点 | secret 仅创建/重置时返回一次并以 KEK 加密保存；self/admin scope 在后端裁决；权限或身份写入成功前完成机器 Session 注销，失败不得静默成功 |
| 数据与菜单 | `script/sql/namewta/{DDL,DML}.sql` | 只维护 additive、幂等的凭据表/索引、权限与菜单增量，不改写上游初始化 SQL；生产 DDL/DML 不随代码集成自动执行 |
| 前端入口 | system domain `open-api`、system web-domain 的 `OpenApiWorkspace`/manifest、admin `system/openApi/index` 动态页和 profile 静态 tab | admin 入口显式选择目标用户，个人入口固定当前用户；权限隐藏不能替代后端授权；一次性 secret 在所有弹窗关闭路径清空，不写 storage、URL、缓存或日志 |
| 发布与恢复 | common-openapi README、部署环境变量与发布 Evidence | 顺序固定为备份、批准并执行 additive SQL、部署默认关闭代码、配置 Redis/KEK、另行批准启用；恢复先置 `OPENAPI_ENABLED=false`。KEK 下发、生产启用、真实迁移和远程发布均不是代码集成动作 |

## 上游评估热点

| 上游变化 | 本地复核范围 | 最低验证 |
|---|---|---|
| 登录、Token、Client、菜单、权限 | 后端 auth/system；前端 admin/system、platform/auth、permission、App access | 后端定向测试；前端 architecture、unit、E2E |
| Controller、DTO、OpenAPI | 对应 domain 资源、mapper、`api-contracts` | OpenAPI drift、typecheck、相关 API/unit |
| Vue、Router、Axios、状态管理 | App 组合、web-domain、browser adapter | lint、typecheck、unit、激活工作区 build |
| SQL、ORM、数据权限 | 后端模块与 NAMEWTA DDL/DML | 模块测试、全量 test、full/core package |
| OSS、通知、工作流、外部 URL | 后端公开合同与前端对应 domain/web-domain | 安全定向测试、unit、E2E |
| Web Filter、异常处理、日志配置 | `ruoyi-common-web` 系统日志、`ruoyi-common-security` 验签通道、应用 Logback、敏感信息边界 | 日志/网关定向测试、后端全量 test |
| 构建和依赖 | 三仓库工具链、架构检查与发布门禁 | frozen install、全量构建、子模块校验 |

评估结果只能基于冻结 SHA 和实际命令。文本可自动合并不代表业务语义安全；未执行的验证必须明确记为未执行。
