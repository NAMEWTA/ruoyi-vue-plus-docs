---
name: engineering-standards
description: 为 ruoyi-vue-plus-docs 聚合工作区及其 Vue/TypeScript 前端、Java/Spring Boot 后端提供按模块路由的工程规范。处理代码、目录、测试、构建、依赖、API、数据库、权限、上游同步或交付变化前使用。
---

# ruoyi-vue-plus-docs Engineering Standards

本 Skill 只描述本工作区已确认的规范。先确定变更 scope，再加载最小充分 references；不要把一个子模块的语言或框架规则扩散到另一个子模块。

## 每次执行

1. 读取[项目画像](references/project/00-project-profile.md)和[模块地图](references/project/01-module-map.md)。
2. 将任务映射到 `repository`、`module:*`、`language:*`、`framework:*`、`runtime:*` 或具体 `path:*` scope。
3. 命中下列领域时，根据实际任务调用最小充分的原子 Skill；跨领域任务可以组合调用，不相关领域不加载。
4. 按风险读取相关通用规则：[架构与边界](references/rules/architecture-and-boundaries.md)、[API/错误/资源](references/rules/api-errors-resources.md)、[测试](references/rules/testing.md)、[安全与数据](references/rules/security-and-data.md)、[质量门禁](references/rules/quality-gates.md)、[评审与交付](references/rules/review-and-delivery.md)；涉及 HTTP API 或 CRUD 时必须读取 API 规则，并执行其中“查询 GET、变更 POST、POST 使用 `@Log`”的传输与追踪约束。
5. 修改 `plus-ui-namewta/**` 时读取 [TypeScript 核心](references/typescript/core.md)、[Vue](references/typescript/frameworks/vue.md)和[Browser](references/typescript/runtimes/browser.md)；涉及 `src/api/**`、CRUD 页面、树表、表单或生成模板时再读取[前端 CRUD/API 实现规范](references/typescript/crud-api-and-pages.md)。
6. 修改 `ruoyi-vue-plus-namewta/**` 时读取 [Java 核心](references/java/core.md)；涉及 Spring 应用、Web、配置或 Bean 生命周期时再读取 [Spring Boot](references/java/frameworks/spring-boot.md)；涉及事务、`@DS`、数据源切换、事务事件、DDL、建表或 schema 迁移时必须读取[数据源事务与建表](references/java/persistence-transactions-and-ddl.md)；涉及 entity/BO/VO、mapper、查询封装、CRUD、树结构、翻译、缓存或导入导出时再读取[后端 CRUD/查询实现规范](references/java/crud-query-and-common.md)。
7. 读取[决策、迁移与例外](references/project/02-decisions-and-exceptions.md)，确认 current、target、Ratchet、`pending-decision` 和未到期例外。
8. 实现前检查 public API、依赖方向、安全、错误/取消/资源、数据库兼容和测试影响。
9. 实现后运行项目画像中该 scope 的真实质量门禁，并按[评审清单](references/project/review-checklist.md)报告命令、退出码、未验证项和残余风险。

## 领域知识路由

`engineering-standards` 是 MUST、质量门禁、Ratchet 和交付裁决层；下列原子 Skill 是当前仓库事实、能力与调用面的知识地图，不能替代本 Skill 的规范裁决。原子 Skill 的描述不够明确或与当前工作树冲突时，以其引用的源码、配置和 POM 为证据，不把摘要当成永久事实。

| 实际任务领域 | 原子 Skill |
|---|---|
| `plus-ui-namewta` 编码风格、注释实践、Oxlint/Oxfmt、动态路由、菜单或按钮权限 | [plus-ui-frontend-conventions](../plus-ui-frontend-conventions/SKILL.md) |
| `ruoyi-system` 对外能力、`ruoyi-api`、system 实现边界、字典/部门/用户/OSS/消息调用 | [ruoyi-system-module-guide](../ruoyi-system-module-guide/SKILL.md) |
| `ruoyi-workflow`、Warm-Flow、流程启动/办理、`businessId`、事件、待办或业务审批接入 | [ruoyi-workflow-module-guide](../ruoyi-workflow-module-guide/SKILL.md) |
| `ruoyi-common` 子模块选择、BOM、Maven 依赖、Utils/Helper、Redis/Login/JSON/Excel/OSS 等公共入口 | [ruoyi-common-modules-guide](../ruoyi-common-modules-guide/SKILL.md) |

## 约束

- MUST 规则只有在 `Verification` 可执行或给出精确 review 证据时成立。
- CRUD 只读查询使用 HTTP `GET`，产生业务状态变化的操作使用 HTTP `POST`，每个 POST 业务接口使用 `@Log` 记录调用追踪；具体范围、迁移与验证以 `API-005` 为准。
- 不适用规则不加载；依赖、构建输出、生成声明和冻结 scope 不手工修改。
- 不通过删除测试、关闭核心规则、放宽编译配置或扩大例外获得通过。
- 新代码遵循 Target；存量偏差按 Migration/Ratchet 处理，不发动无关全仓重写。
- 前后端是独立 Git Submodule；在各自仓库完成变更与验证后，再单独更新父仓库指针。
- 项目事实变化时先更新 Project Profile/Module Map，再更新规则，不静默猜测。
