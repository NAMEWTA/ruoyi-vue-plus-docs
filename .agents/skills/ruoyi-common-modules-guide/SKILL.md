---
name: ruoyi-common-modules-guide
description: 映射 ruoyi-common 子模块与工具类索引：27 个 artifact（BOM + 26 jar）、按需 Maven 依赖、OpenAPI 机器调用、RedisUtils、LoginHelper、JsonUtils、ExcelBuilder、OssFactory、NotifyDispatcher、PushHelper、DataPermissionHelper。处理 ruoyi-common、该依赖哪个 common 模块、OpenAPI、统一通知、RedisUtils、LoginHelper、core utils、跨模块 Utils/Helper、找不到 ExcelUtil、或判断 job/ai/ES 是否只是第三方 starter 包装时使用。规范裁决不走本 Skill。
---

# ruoyi-common 模块与工具类地图

本 Skill 只描述本 fork 中 `ruoyi-common` 提供什么、依赖哪个子 artifact、公开入口类型在哪。不要把父模块当 jar 依赖，不要发明 `ExcelUtil`。

## 源码确认

针对每个模块/能力的具体描述，如不明确，必须直接根据文中给出的仓库路径读取对应源码确认，不得凭空推断。职责以子 POM `<description>` 与类 JavaDoc 首句为准。

路径相对工作区，前缀 `ruoyi-vue-plus-namewta/`（磁盘目录亦可能显示为 `RuoYi-Vue-Plus-namewta`）。

## 分工

- 工程规范、依赖方向、质量门禁：读取 [engineering-standards](../engineering-standards/SKILL.md)。不要把规范条文复制进本 Skill。
- 字典/权限/脱敏的 **system 实现** 与跨模块 `ruoyi-api`：读取统一的 [ruoyi-module-guide](../ruoyi-module-guide/SKILL.md) system reference。本 Skill 只标 SPI 接口位置。
- common 子模块选择、工具类 FQN：用本 Skill。

新业务模块的五层边界由 [engineering-standards](../engineering-standards/SKILL.md) 和 [ruoyi-backend-development](../ruoyi-backend-development/SKILL.md) 裁决；本 Skill 不新增业务层，也不允许用 common 工具绕过 `UseCase -> Service -> DAO -> Mapper`。工具调用位置、事务和外部副作用必须同时遵守后端[框架公共入口与分层用法](../ruoyi-backend-development/references/framework-usage.md)。

## 硬约束

- 父模块 `ruoyi-common` 的 `packaging=pom`，不是 jar。业务 POM 不要依赖父 `ruoyi-common`；按需声明子 artifact（`groupId=org.dromara`，版本走 BOM `${revision}`）。
- 引入 `ruoyi-common-bom` 只锁版本，不会把 26 个 jar 传进 classpath。
- 本仓库无 `ExcelUtil`。导入导出用 `ExcelBuilder` / `ExcelWriterWrapper`。
- `DictService`、`PermissionService`、`SensitiveService` 只在 common 定义接口；实现在 `ruoyi-system`。注入 SPI，不要在 common 里找实现类。
- `JsonUtils`、`RedisUtils`、`LoginHelper`、`OssFactory/OssClient`、`NotifyDispatcher/NotifyClient`、`PushHelper`、`ExcelBuilder` 和 `@Log` 等公共入口必须复用源码中的准确 FQN；不要直接引入底层 Jackson、Redisson、OSS/通知渠道 SDK 或自行创建同义包装。
- `JsonUtils`、`IdGeneratorUtil` 在无 Spring 测试上下文时提供内部 fallback，但这不改变业务层的调用约束；业务代码仍不得自行创建 `JsonMapper`/`ObjectMapper`、直连 `IdWorker` 或缓存容器 Bean。
- layered 业务模块中，DAO 只持有 Mapper；Redis/OSS/Notify 等外部能力只能由 Service 使用明确的 Gateway/Provider/Store 端口，或由提交后 support listener 适配，不能由 UseCase 直连实现类，也不能由 DAO 绕过 Mapper 调用。
- 多数 core `*Utils` 继承 Hutool / Commons Lang。项目约定优先用这些 FQN，不要直接调 Hutool 同名类（除非本仓库没有对应封装）。
- `job` / `ai` / `elasticsearch` 是第三方 starter 的薄包装。业务 API 在 SnailJob / SnailAi / Easy-Es，不要把本模块 1–2 个 `@Configuration` 当成完整 API。

## 先选依赖

1. 只要 `R` / `ServiceException` / `StringUtils` / `SpringUtils`：显式依赖 `ruoyi-common-core`。
2. JSON：`ruoyi-common-json`（会带 core）。
3. 缓存 / 锁 / 限流 / 防重复提交：`ruoyi-common-redis`，用 `RedisUtils` 与 `@RepeatSubmit` / `@RateLimiter`。
4. 登录态：`ruoyi-common-satoken` 的 `LoginHelper`（会带 core + redis）。Web CRUD 通常再加 `ruoyi-common-mybatis` + `ruoyi-common-web` + `ruoyi-common-security`。
5. 文件：业务模块优先注入 `ruoyi-api` 的 `OssService`；只有 OSS 基础设施实现才使用 `OssFactory` / `OssClient`（`ruoyi-common-oss`）。统一通知：`NotifyDispatcher` / `NotifyClient`（`ruoyi-common-notify`）；邮件与短信是通知渠道适配，不在业务中直连渠道 SDK。推送：`PushHelper`。Excel：`ExcelBuilder`。
6. 先看目标业务模块 POM 的显式 `ruoyi-common-*`，再谈传递。不要假设 `ruoyi-workflow/pom.xml` 写了 `ruoyi-common-core`（它没有；mybatis/web/security 会带进来）。

27 个子模块、内部依赖分层、system/workflow/admin 消费方见 [module-map.md](references/module-map.md)。

## 按需加载

| 任务 | 读取 |
|---|---|
| 选哪个 `ruoyi-common-*`、BOM、消费方 POM、SPI 实现落点 | [module-map.md](references/module-map.md) |
| `org.dromara.common.core.utils` 21 个工具、`R`/`PageResult`/`ServiceException`、core SPI | [core-utils.md](references/core-utils.md) |
| RedisUtils / LoginHelper / JsonUtils / ExcelBuilder / OssFactory / PushHelper 等跨模块入口 | [other-utils.md](references/other-utils.md) |

## 已知缺口

下列项研究未闭合。需要时读标注路径，不要用训练数据或上游文档补全：

- 未执行 `mvn dependency:tree`：admin 运行时 common 并集是 POM 图推断。个别 optional/profile 边界未用 Maven 解析交叉验证。
- `ruoyi-common-excel` POM description 仅为 `ruoyi-common-excel`；职责以 `ExcelBuilder` JavaDoc 与 fesod 依赖为准。
- `ruoyi-common-job` / `ruoyi-common-ai` 各仅 1 个配置类；SnailJob / SnailAi 的外部方法表未展开。
- Easy-Es 如何与本工程数据源对齐未在本模块 2 个 Java 类中展开。
- oss / excel 无 `AutoConfiguration.imports`。Oss 配置类是否另被包扫描拾取未逐文件确认。
