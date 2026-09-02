# 子模块目录与代码职责

## 目录主轴

以 `ruoyi-modules/ruoyi-system/src/main/java/org/dromara/system` 的 `controller/domain/mapper/service` 分层和 `src/main/resources/mapper/system` 资源布局为规范证据。新业务子模块使用以下标准形态：

```text
ruoyi-modules/<artifact>/
  pom.xml
  src/main/java/org/dromara/<module>/<business>/
    controller/
      admin/
        <Business>Controller.java
      anonymous/
        <Business>AnonymousController.java
    domain/
      <Entity>.java
      bo/
        <Business>Bo.java
      vo/
        <Business>Vo.java
    mapper/
      <Business>Mapper.java
    service/
      I<Business>Service.java
      impl/
        <Business>ServiceImpl.java
  src/main/resources/mapper/<module>/
    <Business>Mapper.xml
  src/test/java/org/dromara/<module>/<business>/
```

`admin` 或 `anonymous` 只在存在对应接口时创建，不保留空目录。没有自定义 SQL 时不需要创建空 XML；若模块已有框架要求的空 XML 兼容文件，保留但不要把它当作新模块必须复制的样例。

## 访问面分区

| 访问面 | 目录 | 必需控制 |
|---|---|---|
| 受保护管理端 | `controller/admin` | 登录、`@SaCheckPermission`、数据范围、Client 隔离、写操作 `@RepeatSubmit`/`@Log` |
| 匿名公网入口 | `controller/anonymous` | 明确 `@SaIgnore`，并保留签名、时间戳、nonce/重放、幂等、限流、审计和脱敏 |
| 已存在的其他客户端 | `controller/<actual-client>` | 真实客户端合同、认证主体、权限与测试；名称来自项目事实 |
| 已登录自服务 | 由业务规格裁决 | 不默认塞入 admin，也不擅自创造 client/user/mobile 目录 |

- 不按“一个接口一个目录”拆分 controller。
- 不把 `@SaIgnore` 方法与管理端方法放进同一个 Controller。
- 不为未来可能出现的 Web、App、小程序预建目录。
- `ruoyi-system/controller/system` 与 `controller/monitor` 是现有 system 所有权划分，重构 system 时保留其公开路由与成熟合同；新业务模块的访问面按上表执行，不机械复制名称。

## 各层职责

### Controller

- 只处理 HTTP mapping、输入绑定、Bean Validation、认证/权限、操作日志和响应包装。
- 使用 `R`、`PageResult`、项目 Excel 响应等现有 transport 合同。
- 不编排多表事务，不直接调用 mapper，不在 controller 构造 SQL/wrapper。
- 类名表达资源与访问面；匿名 Controller 建议显式包含 `Anonymous`，避免 import 和日志中边界不清。

### Domain

- Entity 映射数据库表并继承 `BaseEntity`；`version` 与 `del_flag` 分别使用 `@Version`、`@TableLogic`。
- BO 承载查询/新增/编辑输入及 validation groups，不继承 Entity，不作为数据库返回值。
- VO 承载 Mapper 查询投影、HTTP 响应与导出合同，不把 Entity 直接暴露给 HTTP 或跨模块调用；含敏感或仅供持久化编排的内部查询投影不得被 Controller 直接返回。
- 只为稳定子领域建立 `domain/<subdomain>`；不能因为文件多就按任意技术动作分散 BO/VO。

### Mapper

- interface 继承 `BaseMapperPlus<Entity, Vo>`；确有类型化 join 时再实现 `MPJBaseMapper<Entity>`。
- 简单查询优先 wrapper/`QueryBuilder`，复杂自定义 SQL 放 resources 下对应 XML。
- mapper 只拥有数据访问，不承担业务状态机、权限策略选择、缓存编排和外部副作用。

### Service

- interface 描述业务用例，不机械暴露 mapper 的每个方法。
- implementation 负责查询条件、映射、唯一性、领域不变量、删除前校验、事务、关系维护、缓存失效和提交后副作用。
- `service/impl` 是唯一标准实现目录；不要并列创建 `manager`、`handler`、`repository` 来转发同一调用。
- 标准业务包的 `service` 根目录只放业务服务接口和确有替代实现的稳定端口，生产代码子目录只允许 `service/impl`；禁止建立 `service/application`、`service/material`、`service/provider`、`service/verification`、`service/workflow` 等按功能横切的实现目录。
- Controller、Listener 和 ServiceImpl 之间的业务调用面向 `service` 根接口；不要跨类注入或导入具体 `*ServiceImpl`。同一个实现类内的私有步骤不为此拆成伪接口。
- `ServiceImpl` 直接依赖一个或多个 Mapper。禁止增加 `dao`，也禁止用 `*DataSupport`、`*Repository`、`*Manager` 包装单一 Mapper 或转发同一组调用。
- 只有外部系统、缓存存储或提供者确有多个真实 adapter 时才保留 Gateway、Store、Provider、Policy 一类端口；端口不是 DAO，具体实现仍落在 `service/impl`，`@ConfigurationProperties` 落在模块根 `config`。

## 何时允许额外目录

`ruoyi-system` 的 `notify`、`openapi`、`oss`、`password` 等子树证明：当能力具有稳定 owner、多个协作类型、独立生命周期或明确依赖边界时，可以在模块内形成命名子领域。建立前必须回答：

1. 它拥有哪个业务合同和数据？
2. 哪些调用方只依赖其公开入口？
3. 为什么标准 controller/domain/mapper/service 不能清晰容纳？
4. 是否有独立测试、配置或生命周期证明，而非仅因文件数量多？

只为缩短目录列表、包装一个 mapper 或容纳单个 helper，不构成新目录理由。

稳定能力若确需独立子领域，必须提升到模块根目录并形成自己的 `controller/domain/mapper/service` 纵向主轴；不能只在 `service` 下建立功能子包制造第二套组织方式。

## 命名与文件数量

- Java package 全小写；类型使用 PascalCase；方法/字段 lowerCamelCase；数据库字段 snake_case。
- 标准名为 `<Entity>`、`<Business>Bo`、`<Business>Vo`、`<Business>Mapper`、`I<Business>Service`、`<Business>ServiceImpl`、`<Business>Controller`。
- 一个文件聚焦一个主要类型/职责；文件多不是问题，职责无 owner、重复转发和跨层混放才是问题。
- 大文件只触发职责审查，不按行数机械拆分。提取后必须形成可命名、可测试的真实边界。
- 测试包镜像被测 owner；按行为和风险组织测试，不要求生产类与测试类一一对应。

## 结构重构前置映射

移动存量模块前先列出：旧文件 -> 新 owner/路径 -> public API/route -> mapper/XML/表 -> 调用方 -> 测试 -> SQL/配置。逐项标记“仅移动”“重命名兼容”“行为修改”；第一类不得混入行为变化，后两类必须有契约和回归测试。不要删除仍被前端、Spring 扫描、MyBatis namespace、反射、配置或 bundle 使用的路径。
