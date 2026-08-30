# OpenAPI Platform

**开放凭据**：每个用户最多拥有一条只绑定 userId 的全局 AppKey/AppSecret 组合，用于机器调用而不是替代浏览器 Token；secret 仅创建或重置时显示一次。
_Avoid_: 绑定 clientPk、每 Client 多密钥、Bearer Token、可重复查看的 secret

**开放接口**：Controller 方法上显式标注 `@OpenApi` 后进入开放注册表的 HTTP 接口；类级注解不产生开放语义。
_Avoid_: 开放 Controller、类级批量开放

**NAMEWTA 签名协议**：不兼容来源 MD5 方案的版本化 HMAC-SHA256 请求认证协议，签名覆盖请求语义并使用 nonce 防重放；HTTP 与 HTTPS 均可承载，TLS 只负责可选的传输机密性。
_Avoid_: MD5 签名、URL 参数认证、把签名等同于加密

**应用开放管理**：归属 `ruoyi-system` 的 OpenAPI 管理菜单与后端 API；当前前端 Client 的既有菜单/按钮权限决定谁能进入和执行管理操作，service 层仍校验 owner 范围。超级管理员可管理全部用户的唯一凭据，并可按目标用户查看可调用接口。
_Avoid_: 独立 ALL/ROLES 准入配置、仅靠页面隐藏授权

**管理面与调用面**：管理面负责创建、重新创建/重置、禁用、删除和查看凭据；调用面只处理已经创建的凭据，以 AppKey/HMAC 验证后恢复调用用户身份。两者共享领域服务与授权解析器，但管理菜单权限绝不等于开放接口调用权限。
_Avoid_: 创建凭据时固化一份永久权限、用管理者权限执行目标用户调用

**OpenAPI 运行时端口**：由 `ruoyi-common-openapi` 声明、由 `ruoyi-system` 提供唯一实现的窄类型化 SPI，用于解析凭据、构建调用身份和发布调用事件。
_Avoid_: common 直连 Mapper、MQ/Command 分发、通用 Object 调用

**开放接口目录**：从实际 Spring MVC 映射和 SpringDoc 模型生成、按用户 OpenAPI 全局权限并集过滤的开放接口列表与详情合同。
_Avoid_: 独立类路径扫描结果、手写参数模型

**OpenAPI 全局身份**：独立于 `sys_client` 的机器调用身份；调用方无需登录、无需发送 `clientid`，服务端聚合用户在所有合法 Client 下的当前有效角色、权限字符和数据权限，但不加载动态路由树。
_Avoid_: 伪装前端 Client、复用某个前端 clientPk、聚合所有启用 Client 的默认权限

**前端 Client 身份**：普通 Sa-Token 登录使用的单 Client 身份，负责约束动态路由、菜单树、Token 请求头一致性、访问路径和 IP 等规则；OpenAPI 全局身份不改变它。
_Avoid_: 因 OpenAPI 特例取消普通请求的 Client 校验

**OpenAPI 机器会话**：AppKey 验签后由服务端关联的内部 Sa-Token TokenSession；其中仍保存标准 `LoginUser`，通过现有 Redis DAO 复用，并把内部 Token 仅写入当前请求 Storage 以驱动既有注解链。
_Avoid_: 返回内部 Token、绕过每次验签、另建权限注解、缓存 miss 时自动授权

**调用期权限缓存**：凭据已经创建后的 cache-aside 身份恢复机制。Redis 中存在有效 `LoginUser` 就直接复用；不存在或授权版本失效时，才从 system 权威用户、角色、菜单和数据权限关系重新组装并写回 TokenSession，随后执行同一套权限注解判断。
_Avoid_: 把“自动获取权限”解释为申请、授予或补写权限

**授权快照重建**：调用期权限缓存未命中或失效时的只读装载动作；它只能复制权威数据中已经存在的授权，目标权限不在结果中时保持 403。
_Avoid_: 根据当前请求路径补写权限、把 Redis 缓存当授权事实源

**可调用接口预览**：使用目标用户 ID、运行时同一授权快照解析器和同一开放接口注册表计算出的只读目录；超级管理员查看某用户时不继承管理员自己的权限，也不创建机器会话。
_Avoid_: 单独编写管理端过滤 SQL、按查看者权限过滤目标用户目录

**复用优先适配层**：位于 `ruoyi-common-openapi`、只编排现有 Sa-Token 公共 API 与窄类型化 system SPI 的薄桥接层；标准 `LoginUser` 继续作为权限快照，OpenAPI 专属信息优先放 Token extra/TokenSession sidecar。
_Avoid_: 重写普通登录主链、修改 LoginUser 以承载凭据领域、平行 Redis 权限缓存、通用 CommandBus
