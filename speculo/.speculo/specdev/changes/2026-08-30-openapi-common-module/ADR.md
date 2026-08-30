# Change Architecture Decisions

## ADR-001: 开放凭据绑定 Client 身份

**Status:** superseded
**Source:** LOG-002
**Supersedes:** none
**Superseded by:** ADR-008

### Context
NAMEWTA 的角色、菜单、登录域和数据权限都受 `sys_client.id` 约束；只绑定 userId 会让开放调用缺少唯一权限解释上下文。

### Decision
每个 AppKey 固定绑定 `userId + clientPk`。调用身份、角色、菜单权限和数据权限均按该 Client 解析，缺失或失效时失败关闭。

### Trade-off
独立服务账号更适合纯机器身份，但会引入第二套账号生命周期；只绑定 userId 更简单，却会破坏 Client 隔离。当前接受一个用户在不同 Client 使用不同凭据的管理成本。

### Consequences
密钥表、缓存键、审计记录、唯一性约束和撤销逻辑都必须携带 clientPk；调用方不能在请求中选择或覆盖 Client。

### Verification / Migration
自动测试覆盖相同 userId 的不同 Client、错误 clientid、缺失 clientPk、角色变化和跨 Client 越权。

## ADR-002: 使用版本化 HMAC 请求签名且不强制 TLS

**Status:** accepted
**Source:** LOG-003
**Supersedes:** none

### Context
来源 MD5 签名未绑定 method、path、query 和 body，无法证明签名针对的是当前请求。部署环境同时需要支持 HTTP 与 HTTPS。

### Decision
定义不兼容来源方案的 NAMEWTA 版本化 HMAC-SHA256 协议，签名覆盖凭据、时间、nonce 和规范化请求语义。服务端不以 HTTPS 作为验签前置条件。

### Trade-off
采用标准 HTTP Message Signatures 可减少自定义协议，但客户端实现复杂度更高；兼容 MD5 更易迁移但继承安全弱点。允许 HTTP 提升内网和开发部署灵活性，但不提供请求与响应机密性，也不能防止被动监听。

### Consequences
文档和示例必须区分认证完整性与传输机密性并推荐生产使用 HTTPS；签名版本进入请求合同，未来升级不得静默改变 canonicalization。

### Verification / Migration
使用固定测试向量验证跨语言签名；对 method、path、query、body、timestamp、nonce 任一篡改均拒绝；HTTP 和 HTTPS 代理场景采用相同 canonical request。

## ADR-003: system 拥有业务并通过类型化端口接入 common 运行时

**Status:** accepted
**Source:** LOG-007
**Supersedes:** none

### Context
`@OpenApi`、签名和拦截属于可复用运行时，但凭据表、用户、Client、权限和管理 API 属于 system。common 直接查询 system 表会反转 Maven 依赖；仓库现有 common SPI 与 system Bean 实现已经提供了清晰的本地分层范式。

### Decision
新增 `ruoyi-common-openapi` 承载方法级注解、协议运行时、开放接口注册表、配置和窄类型化 SPI。`ruoyi-system` 拥有持久化、密钥生命周期、身份权限构建、管理 API 和审计实现；`ruoyi-admin` 只负责依赖装配。common 运行时不持有 system Mapper/domain；内部使用明确的接口和直接应用服务调用，不引入或借鉴 MQ、requestCode、CommandBus 或通用 Command 分发器。

### Trade-off
全部放 system 文件更少但无法形成用户要求的 common 通用模块；将持久化放 common 看似自包含，却把 system 领域泄漏到基础层。类型化端口会增加少量 DTO/SPI，但保留编译期合同与可替换测试实现。

### Consequences
必需 SPI 必须唯一且在启用时可用；system 写用例由明确的应用服务和类型化方法直接处理。开放运行时与数据库实现可独立测试。

### Verification / Migration
增加 Maven 依赖方向检查、缺失/重复 SPI 启动测试、common 纯运行时测试和 system adapter 集成测试。

## ADR-004: 管理端复用 Client-scoped RBAC

**Status:** accepted
**Source:** LOG-010, LOG-016
**Supersedes:** none

### Context
来源方案另设 ALL、ROLES、ADMIN、SUPER_ADMIN 模式，但 NAMEWTA 已有按 Client 隔离的角色、菜单和按钮权限。并存两套准入会产生冲突和不可解释的授权结果。

### Decision
密钥管理 API 使用当前前端 Client 的现有菜单/按钮权限，owner 范围校验始终在 service 层执行。接口目录和开放调用不继承当前前端 Client，而使用 ADR-008 定义的 OpenAPI 全局权限快照，并继续校验目标方法原有 `@SaCheckPermission`。

### Trade-off
配置模式可快速全局开放，但绕开菜单治理。复用 RBAC 需要初始化菜单和角色关系，却保持单一权限来源、审计路径和管理习惯。

### Consequences
需要为个人密钥与平台管理设计清晰的权限码和 owner 范围；普通管理请求仍受当前 Client 边界约束，OpenAPI 调用权限按全局身份单独解释。

### Verification / Migration
测试无菜单权限、有自助权限、管理员权限、超管、跨 owner、跨 Client、目标接口权限缺失和权限撤销场景。

## ADR-005: 使用请求内机器身份桥接现有权限链

**Status:** accepted
**Source:** LOG-011, LOG-016, LOG-017
**Supersedes:** none

### Context
开放调用必须复用现有 `@SaCheckPermission`、`LoginHelper` 和数据权限，但第三方不应获取或维护浏览器式 Sa-Token。

### Decision
普通 Sa-Token 请求保持单 Client 行为不变。签名请求先验证开放凭据，再创建或取得标记为 OpenAPI 通道的内部机器 Token，仅写入当前请求 Storage；该 Token 不进入响应、文档或日志。全局 `LoginUser` 快照保存于该 TokenSession 并通过现有 Sa-Token Redis DAO 复用；缓存不存在或版本过期时重建，请求结束只清理请求 Storage，不删除仍有效的机器 Session。

### Trade-off
独立改造全部权限组件支持第二种 ThreadLocal 身份会扩大公共安全面的修改范围；内部请求 Token 增加少量会话管理成本，但能复用现有权限与数据权限链。

### Consequences
凭据禁用、过期、删除或 owner 失效必须在内部 Token 注入前拒绝；内部 Token 不能绕过每次验签，也不能返回给第三方。权限缓存 miss 只能触发从 system 权威数据重建，不能把当前请求所需权限自动写入授权集合。

### Verification / Migration
测试普通 Token、仅签名请求、双认证冲突、权限即时撤销、上下文清理和内部 Token 不泄漏。

## ADR-006: Secret 单版本加密保存并立即切换

**Status:** accepted
**Source:** LOG-012
**Supersedes:** none

### Context
AppSecret 需要在验签时可用，但数据库泄露时不能直接暴露明文；每个用户只保留一个有效开放凭据。

### Decision
使用 CSPRNG 生成 secret，以外部注入、带版本的 KEK 执行 AES-256-GCM 加密保存。secret 仅创建或重置成功时显示一次；一条凭据同一时刻只有一个有效 secret，重置后旧 secret 立即失效。

### Trade-off
立即失效不支持无停机双 secret 轮换，但状态和撤销语义简单，符合每用户单凭据约束。

### Consequences
KEK 缺失或无效时启用 OpenAPI 必须启动失败；密文记录携带 key version、nonce 和认证标签，任何接口与日志不得回显 secret。

### Verification / Migration
测试一次性展示、密文篡改、错误 KEK、KEK 版本读取、并发重置和旧 secret 立即拒绝。

## ADR-007: 每个用户最多一个有效开放凭据

**Status:** accepted
**Source:** LOG-015
**Supersedes:** ADR-001 中“一个用户可在不同 Client 使用不同凭据”的管理结论

### Context
开放凭据代表用户的机器调用入口，而不是每个应用或每个 Client 的独立集成实例。用户要求一个用户只能创建一个类似 API key/token 的凭据。

### Decision
每个用户最多拥有一条有效开放凭据，由一个公开 AppKey 和一个仅展示一次的 AppSecret 组成。重复创建返回现有凭据状态并提示重置，不生成第二条；超级管理员也只能代建、重置、禁用或删除这条凭据。

### Trade-off
单凭据无法为多个第三方集成独立撤销或分摊限流，也不支持双 secret 平滑轮换，但所有权和使用体验更简单。

### Consequences
数据库必须对 owner userId 建立有效凭据唯一约束；凭据只绑定 userId，不携带 clientPk，不能用新增第二条凭据绕过。

### Verification / Migration
测试用户与管理员并发创建、删除后重建、禁用后行为、重置立即切换及唯一约束冲突处理。

## ADR-008: OpenAPI 使用跨前端 Client 的全局授权身份

**Status:** accepted
**Source:** LOG-016
**Supersedes:** ADR-001

### Context
`sys_client` 用于区分同一后端的不同前端登录入口、动态路由和请求策略。OpenAPI 直接调用后端方法，不需要前端路由，也不应要求同一用户为不同前端维护多套凭据。

### Decision
OpenAPI 是独立认证通道，不创建或伪装一条专用 `sys_client`。每个 AppKey 只绑定 userId；每次调用从所有该用户具有持久合法身份的 Client 中聚合当前有效角色、权限字符和数据权限，构建 `OpenApiPrincipal`/内部 `LoginUser` 快照。调用方不发送 `clientid`，快照不加载动态路由树，也不设置可被业务误认为某个前端的单一 clientPk。

### Trade-off
绑定单 Client 能直接复用现有登录快照，但会迫使同一用户管理多套 key 或重复授权。全局身份符合统一后端调用体验，却需要专用聚合查询、安全拦截分支，并要求明确处理不同 Client 数据范围的合并及依赖单一 clientPk 的业务接口。

### Consequences
普通前端 Token、菜单树、动态路由、Client 请求头一致性、访问路径和 IP 规则完全保持原样。只有完成 OpenAPI 签名验证且目标方法显式标注 `@OpenApi` 的请求进入全局身份通道。接口目录与实际调用共享同一全局权限判定。

### Verification / Migration
测试 A 有/B 无、A 无/B 有、A+B 均有、全部撤销、禁用 Client/角色/菜单、重复权限字符、数据范围合并、无 `clientid`、伪造普通 Token 和 Client 相关下游能力。

## ADR-009: 用 Sa-Token TokenSession 缓存 OpenAPI LoginUser

**Status:** accepted
**Source:** LOG-017
**Supersedes:** none

### Context
现有 `LoginHelper`、`SaPermissionImpl`、`@SaCheckPermission`、`@SaCheckRole`、数据权限和敏感字段判断都依赖 TokenSession 中的 `LoginUser`。另建一套 Principal 和权限注解会重复现有安全链。

### Decision
每个有效 OpenAPI 凭据关联一个仅服务端可见的 Sa-Token 机器 Token。首次有效签名请求或 TokenSession 缺失时，common 通过类型化 SPI 请求 system 组装全局 `LoginUser`，写入现有 `LoginHelper.LOGIN_USER_KEY`；`PlusSaTokenDao` 负责 Redis 持久化。后续每次请求仍先验签，再取得内部 Token，将其仅写入当前 Sa-Token request Storage，使现有权限、角色、数据权限和脱敏链无需分叉即可执行。

### Trade-off
逐请求重建权限最及时但数据库成本高；独立权限缓存更容易定制却形成第二套事实源。复用 TokenSession 减少代码和行为分叉，但需要专门处理机器 Token 生命周期、并发首次创建、权限变更失效和多节点本地缓存窗口。

### Consequences
缓存 miss 表示重建已有授权快照，不是授予权限；目标权限不在 system 权威结果中时返回 403。内部 Token 与 AppKey/AppSecret 完全不同，不作为调用协议字段。机器 Session 创建必须关闭响应头写 Token，并在分布式锁内双重检查，避免 `is-share=false` 下并发生成多个 Session。

### Verification / Migration
测试首次创建、Redis 命中、Session 丢失重建、并发首调、内部 Token 不泄漏、普通 Token 不受影响、无权限不写入、权限撤销、凭据重置和多节点缓存失效。

## ADR-010: 以薄会话桥接层复用现有安全主链

**Status:** accepted
**Source:** LOG-019
**Supersedes:** ADR-008 中新建独立 `OpenApiPrincipal` 的可选表述

### Context
OpenAPI 需要组织不同于普通登录的内部 Token、Session ID 和认证通道信息，但权限、角色、数据权限及脱敏判断已经统一依赖 TokenSession 中的标准 `LoginUser`。直接重写登录主链或创建第二套 Principal 会扩大与上游的冲突面，并产生双重安全语义。

### Decision
在 `ruoyi-common-openapi` 内增加最薄的 OpenAPI 会话桥接层，使用 Sa-Token 1.45.0 已有公共 API 创建/取得机器 TokenSession、写入 `LoginHelper.LOGIN_USER_KEY` 并仅向当前 request Storage 注入内部 Token。common 通过窄类型化授权快照端口请求 system 返回标准 `LoginUser`；不得新增平行 Principal、权限注解或独立 Redis 权限缓存。`credentialId`、授权 revision、认证通道等 OpenAPI 专属信息优先保存为 Token extra 或 TokenSession sidecar，不污染 `LoginUser` 领域字段。

只有经实现验证确认现有公共扩展点不足时，才允许在 `common-satoken` 或 `common-security` 增加一个最小、通用、隔离的认证通道扩展；该变化必须附 WHY 注释、回归普通登录，并登记到上游定制映射。不得重写 `LoginHelper`、`SaPermissionImpl`、`PlusSaTokenDao` 或普通登录流程。

### Trade-off
直接修改现有工具类看似代码更少，却会把 OpenAPI 特例散布到上游高频变更文件。薄桥接层增加少量适配代码，但把定制集中在新模块，保持现有安全链和升级路径稳定。

### Consequences
实现应优先组合而非继承或复制现有工具；任何扩展都必须证明现有 API 无法满足。普通前端 Token 的 Client 约束完全不变，OpenAPI 例外只能从显式验签入口触发。

### Verification / Migration
建立普通登录全量回归、OpenAPI Session 创建/恢复、request Storage 清理、Token 不写响应、序列化兼容和上游差异审查；代码评审禁止重复实现权限读取或 Redis Session DAO。

## ADR-011: 分离应用开放管理与开放接口调用

**Status:** accepted
**Source:** LOG-020
**Supersedes:** none

### Context
凭据创建与管理发生在已登录的系统管理场景；开放接口调用发生在第三方已经取得凭据之后。两者若混成同一权限模型，会把菜单权限错误地当作接口权限，或让调用权限绕过管理入口。

### Decision
`ruoyi-system` 提供“应用开放管理”菜单对应的管理 API。它继续使用当前前端 Client 的既有菜单/按钮权限和 service owner 校验；超级管理员可管理所有用户的唯一凭据，并可代建、重新创建/重置、禁用、删除和查看目标用户的可调用接口。

开放调用运行时只接受已经创建且有效的凭据：每次先校验 AppKey、HMAC、时间/重放和凭据状态，再按 ADR-009/ADR-010 从 Redis 复用或从 system 权威关系装载 `LoginUser`，最后由目标方法原有权限注解决定是否允许。管理权限与调用权限互不推导。

### Trade-off
共享一个入口会减少 Controller 数量，却混淆浏览器身份与机器身份。分离两条入口增加清晰的 API 边界，同时仍共享凭据领域服务、授权快照解析器和开放接口注册表。

### Consequences
管理 API 不接受 AppKey 作为管理身份；开放调用不读取动态路由，也不要求第三方登录。凭据创建完成并不授予任何接口权限，接口权限始终来自用户当前权威角色、菜单和数据权限关系。

### Verification / Migration
测试无管理菜单权限、用户自助、跨 owner、超级管理员代管、凭据未创建、凭据禁用/重置，以及“有管理权限但无目标接口权限”和“有目标接口权限但无管理权限”两条负向路径。

## ADR-012: 目录预览与真实调用共享授权解析器

**Status:** accepted
**Source:** LOG-021
**Supersedes:** none

### Context
超级管理员需要点开任意用户查看其能调用的 OpenAPI 接口。若管理页面使用管理员自己的会话，或另写一套角色菜单过滤 SQL，显示结果会与目标用户真实调用不一致。

### Decision
定义一个以 `targetUserId` 为输入的窄类型化 OpenAPI 授权快照解析器，由 system 基于权威关系实现；真实调用的 Session cache miss、用户自助目录和超级管理员目标用户预览均复用该解析器。目录过滤和运行时暴露判断共享同一开放接口注册表及权限匹配函数。

预览是只读计算：它不切换为目标用户登录态、不继承查看者的接口权限、不创建机器 TokenSession，也不向 Redis 写入调用期缓存。管理 Controller 只负责校验查看权限和目标用户范围。

### Trade-off
直接复用机器 Session 可以命中缓存，但会让只读管理操作产生登录副作用。显式目标用户解析可能增加一次查询，却保证语义清晰且可单测；必要时可复用授权 revision 对应的只读缓存，但不能改变事实源。

### Consequences
开放接口列表中的 method、path、说明、原始权限要求和可调用结果都来自同一注册表/解析器组合。新增 `@OpenApi` 方法后，无需维护第二份管理目录规则。

### Verification / Migration
对同一 targetUserId 比较管理员预览、用户自助目录和真实签名调用的允许/拒绝矩阵；覆盖管理员自身权限更高/更低、目标用户无凭据、权限变更及禁用接口。
