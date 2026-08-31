---
name: ruoyi-system-module-guide
description: 映射 ruoyi-system 对外能力与调用边界：ruoyi-api 的 UserService、DeptService、RoleService、PostService、ConfigService、OssService、MessageService、TaskAssigneeService；common SPI（含 OpenAPI 授权/凭据）；以及仅供前端的 /system、/resource、/monitor HTTP。处理 ruoyi-system、UserService、OpenAPI、字典、部门、OSS、角色菜单、或其他模块如何调用 system 时使用。规范裁决不走本 Skill。
---

# ruoyi-system 能力地图

本 Skill 只描述本 fork 中 `ruoyi-system` 提供什么、谁可以调用、怎么调用。不要发明接口、远程客户端或租户模块。

## 源码确认

针对每个模块/能力的具体描述，如不明确，必须直接根据文中给出的仓库路径读取对应源码确认，不得凭空推断。方法语义以接口 JavaDoc 与实现为准。路径均相对工作区，前缀 `ruoyi-vue-plus-namewta/`（磁盘目录亦可能显示为 `RuoYi-Vue-Plus-namewta`）。

登录域相关部分文件可能不被 glob/grep 索引。描述不清时直接 Read 给出的路径，不要只依赖检索。

## 分工

- 工程规范、依赖方向、质量门禁：读取 [engineering-standards](../engineering-standards/SKILL.md)。不要把规范条文复制进本 Skill。
- system 能力、调用面、域职责：用本 Skill。

## 先选调用面

1. 其他业务模块（workflow / demo / ai / job / gen 及新建模块）：依赖 `ruoyi-api`，Spring 注入 `org.dromara.system.api.*`。需要字典翻译时注入 `org.dromara.common.core.service.DictService`。
2. `ruoyi-admin` 组装层（登录/注册）：可注入 `ISys*`、Mapper、domain VO。这是组装例外，禁止新业务模块仿效。
3. 前端管理页：走 Controller 的 `/system`、`/resource`、`/monitor`。这些不是模块间稳定 Java API。
4. 数据权限 SQL：走 MyBatis SpEL Bean `sdss`，不要改名。
5. 认证登录 HTTP：在 admin 的 `/auth`，不在 system controller。

详细清单见 [capability-map.md](references/capability-map.md)。Maven 与注入范式见 [how-other-modules-call.md](references/how-other-modules-call.md)。按域展开见 [domains.md](references/domains.md)。

## 硬约束

- 禁止新业务模块 POM 依赖 `ruoyi-system`，禁止注入 `ISys*`、Mapper、`domain`/`bo`/`vo`、Controller、`ClientSessionService`、`ClientUserTypeAccessService`。
- 本仓库无 Dubbo/Feign；跨模块调用是同一 JVM 内 Spring 注入。
- 本 fork 无 tenant 模块。登录隔离是 Client + 登录域 UserType，不要写成租户。
- 运行时 `ruoyi-admin` 把 system 与其他模块装进同一容器，因此「POM 不依赖 ruoyi-system」与「能注入 api 实现 Bean」同时成立。

## 按需加载

| 任务 | 读取 |
|---|---|
| 选 ISys* 还是 ruoyi-api、查事件/监听器、HTTP 前缀 | [capability-map.md](references/capability-map.md) |
| 给其他模块接用户/部门/OSS/消息/办理人 | [how-other-modules-call.md](references/how-other-modules-call.md) |
| 改用户、角色、菜单、字典、配置、OSS、消息、登录域 | [domains.md](references/domains.md) |

## 已知缺口

- `org.dromara.system.api.ConfigService` 在 system 外未找到注入点；接口存在，外部使用未证实。
- `OnlineUserCleanEvent` 与 `OnlineUserCleanListener` 已存在，已索引源码中未找到 `publishEvent`。直接调用 `ISysRoleService.cleanOnlineUser*` 仍可生效（仅 system/admin）。
- 若拆成微服务，当前接口没有远程适配层。
- 未统计每个 api 方法的全部调用点；代表性路径见 [how-other-modules-call.md](references/how-other-modules-call.md)。
