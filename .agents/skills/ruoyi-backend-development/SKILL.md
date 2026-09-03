---
name: ruoyi-backend-development
description: 为 NAMEWTA RuoYi-Vue-Plus 后端提供 Maven 子模块、规范目录、Controller 访问面、CRUD/API、Mapper 查询与 XML、数据权限、事务、MySQL 基座、测试和交付导航。处理 ruoyi-admin、ruoyi-api、ruoyi-common、ruoyi-modules、新建或重构后端模块、controller/admin、controller/anonymous、@SaIgnore、service、mapper、注解 SQL、BO/VO/entity、docs/fm 模板、GET/POST、@Log、@DSTransactional 或 release-artifacts MySQL SQL 时使用；具体 system/common/workflow 能力再路由到对应模块 Skill。
---

# NAMEWTA 后端开发导航

本 Skill 是 `ruoyi-vue-plus-namewta` 的项目级后端开发入口。强制规范、Ratchet 和质量门禁由 [engineering-standards](../engineering-standards/SKILL.md) 裁决；当前源码、POM、测试和公开合同与本 Skill 冲突时，以工作树证据为准并同步修正本 Skill。

## 强制工作流

1. 先读取工程规范的[项目画像](../engineering-standards/references/project/00-project-profile.md)、[模块地图](../engineering-standards/references/project/01-module-map.md)、[决策与例外](../engineering-standards/references/project/02-decisions-and-exceptions.md)，再加载命中的 Java、Spring、持久化、安全和测试规则。
2. 确定 Maven 模块、业务 owner、访问面、数据库 owner 和跨模块合同。先判断是标准 CRUD、复杂系统能力、公开 API/common SPI、工作流接入还是 SQL 基座变化。
3. 按以下证据顺序取样：同 owner 且已确认规范的成熟实现 -> `ruoyi-system` 同类实现 -> 下表职责对应的精确 `docs/fm` 模板 -> `ruoyi-api`/`ruoyi-common` 公开合同 -> 框架通用做法。已知待重构模块不得成为规范样例。
4. 按任务读取最小充分 reference：
   - Maven 职责、依赖和组装：[architecture.md](references/architecture.md)
   - 标准目录、文件职责和 Controller 分区：[module-layout.md](references/module-layout.md)
   - 模板映射、HTTP、业务层和事务：[implementation.md](references/implementation.md)
   - Mapper 查询阶梯、XML、数据权限和 SQL 基座：[mapper-and-sql.md](references/mapper-and-sql.md)
   - Maven、模板、静态合同与交付验证：[verification.md](references/verification.md)
5. 修改前建立受影响映射：POM、Java、resources、SQL、测试、`ruoyi-api`、admin bundle、前端调用方和部署资产。结构重构先记录旧路径到新路径与行为 owner，不能边移动边猜职责。
6. 先运行受影响模块或测试类，再按风险执行根级门禁；准确记录通过、失败、跳过和环境限制。

## 架构模式

后端新模块必须在规格中声明 `classic` 或 `layered`：

- `classic`：存量基础模块兼容模式，保持 `Controller -> Service -> Mapper`，沿用当前 ServiceImpl 模板。
- `layered`：新增复杂模块模式，强制 `Controller/Listener/API Adapter -> UseCase -> Service -> DAO -> Mapper -> XML`。

`ruoyi-profile` 的 person/enterprise 统一使用 `layered`。`ruoyi-system`、`ruoyi-workflow`、`ruoyi-job`、`ruoyi-demo`、`ruoyi-ai` 本次保持 `classic`，不得借重构之名扩散改造。

layered 模式的依赖边界：入口只注入 UseCase；UseCase 只编排 Service；Service 只调用自己的 DAO 和明确外部端口；DAO 只能调用 Mapper；Mapper 只负责数据库语句。UseCase 不直连 DAO，Service 不调用 Service，DAO 不调用 DAO。涉及数据库的每条业务路径都必须经过完整五层。
Controller、Listener、API Adapter 不注入具体 `*ServiceImpl`；layered 模式禁止 `IService` 和 `ServiceImpl`。
分层模式禁止 `IService` 和 `ServiceImpl`，Profile 的 Service 只通过 DAO 持久化。

## 精确模板索引

标准 CRUD 逐层读取对应模板，禁止只看一个 Controller 或 Service 后自由发挥目录与职责：

| 职责 | 必须读取的模板 |
|---|---|
| Entity | [`docs/fm/java/domain.java.ftl`](../../../docs/fm/java/domain.java.ftl) |
| BO | [`docs/fm/java/bo.java.ftl`](../../../docs/fm/java/bo.java.ftl) |
| VO | [`docs/fm/java/vo.java.ftl`](../../../docs/fm/java/vo.java.ftl) |
| Mapper Read Model | [`docs/fm/java/read.java.ftl`](../../../docs/fm/java/read.java.ftl) |
| Mapper | [`docs/fm/java/mapper.java.ftl`](../../../docs/fm/java/mapper.java.ftl)；layered 使用 [`docs/fm/java/layered/mapper.java.ftl`](../../../docs/fm/java/layered/mapper.java.ftl) |
| Service 接口 | [`docs/fm/java/service.java.ftl`](../../../docs/fm/java/service.java.ftl) |
| Service 实现 | [`docs/fm/java/serviceImpl.java.ftl`](../../../docs/fm/java/serviceImpl.java.ftl) |
| Controller | [`docs/fm/java/controller.java.ftl`](../../../docs/fm/java/controller.java.ftl) |
| 自定义 Mapper XML | [`docs/fm/xml/mapper.xml.ftl`](../../../docs/fm/xml/mapper.xml.ftl) |
| MySQL 菜单 DML 片段 | [`docs/fm/sql/mysql.sql.ftl`](../../../docs/fm/sql/mysql.sql.ftl) |

layered 模式额外读取 `docs/fm/java/layered/` 下的 UseCase、Service、DAO 模板；这些模板通过 `architectureMode=layered` 显式选择，不能改变 classic 默认产物。

模板定义标准骨架，不替代业务规格。`ruoyi-system` 提供关系维护、Client、缓存、数据权限、MPJ/XML、导入导出等复杂实现证据；只复制与当前用例同形态的部分。

## 模块 Skill 路由

- `ruoyi-common-*` 选型、工具和 SPI：读取 [ruoyi-common-modules-guide](../ruoyi-common-modules-guide/SKILL.md)。
- system 对外 API、用户、部门、字典、OSS、消息和权限：读取 [ruoyi-system-module-guide](../ruoyi-system-module-guide/SKILL.md)。
- Warm-Flow、流程启动/办理、事件和待办：读取 [ruoyi-workflow-module-guide](../ruoyi-workflow-module-guide/SKILL.md)。
- 修改 Java 公共 API、共享 DTO 或兼容桥：追加读取 [java-api-compatibility](../java-api-compatibility/SKILL.md)。

## 不可突破的边界

- classic 模块保持 `controller`、`domain/{bo,vo}`、`mapper`、`service/impl` 主轴；Mapper XML 放 `src/main/resources/mapper/<module>/`。不要为存量模块强行增加 layered 层。
- layered 模块使用 `controller`、`usecase/impl`、`service`、`dao`、`mapper` 主轴；Service/UseCase 不直接依赖 Mapper 或 MyBatis，DAO 是唯一业务持久化入口。不得用 `*DataSupport`、同义 Repository/Manager 或空壳转发类替代真实 owner。
- layered 模块不继承/实现 MyBatis-Plus `IService` 或 `ServiceImpl`；使用 `BaseMapperPlus` 的基础能力由 DAO 组合。
- layered Mapper 查询结果使用 `domain/model/read` 下的 `<Capability>Row` 或 `<Capability>Projection`，`domain/vo` 只保留 HTTP 输出，Controller/UseCase 不得直接引用读模型。
- classic ServiceImpl 可按现有模板直接依赖 Mapper；该规则不适用于 layered profile。
- 受保护管理端放 `controller/admin`；`@SaIgnore` 匿名接口放 `controller/anonymous`。只为真实存在的客户端建立目录，不预建未来端；已登录自服务接口先由业务规格裁决访问面。
- `@SaIgnore` 不免除签名、时间戳、重放防护、幂等、审计与日志脱敏。
- 跨业务模块只使用 `ruoyi-api` 或明确 common SPI，不依赖其他模块的 mapper、entity、domain、VO 或实现类。
- CRUD 查询使用 GET，业务变更使用 POST；每个 POST 业务接口使用准确、安全的 `@Log`。
- Mapper 遵循 `BaseMapperPlus -> wrapper/QueryBuilder -> MPJ -> XML` 查询阶梯；禁止在 Mapper 注解中堆叠长 SQL、复杂 join、动态条件或子查询。
- 新建或实质修改的业务事务使用 `@DSTransactional`，事务事件使用匹配的 `@DsTxEventListener`。
- 数据库只支持 MySQL 8.4。NAMEWTA DDL 合并到 `50-namewta-ddl.sql`，初始化数据、菜单和回填合并到 `60-namewta-dml.sql`；后端不得恢复 `script/`、模块私有 SQL 或其他方言。
- `main` 承载产品；`6.X` 只做上游镜像。前端 API、模型、页面与 App 组合只在 `plus-ui-namewta` 维护。

## Skill 自检

修改本 Skill 或 `docs/fm` 后运行：

```bash
node .agents/skills/ruoyi-backend-development/scripts/validate-skill.mjs
node docs/fm/scripts/validate.mjs
```
