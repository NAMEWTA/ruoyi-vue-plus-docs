---
name: engineering-standards
description: 为 ruoyi-vue-plus-docs 聚合工作区及其 Vue/TypeScript 前端、Java/Spring Boot 后端提供按模块路由的工程规范。处理代码、目录、测试、构建、依赖、API、数据库、权限、上游同步或交付变化前使用。
---

# ruoyi-vue-plus-docs Engineering Standards

本 Skill 只描述本工作区已确认的规范。先确定变更 scope，再加载最小充分 references；不要把一个子模块的语言或框架规则扩散到另一个子模块。

## 每次执行

1. 读取[项目画像](references/project/00-project-profile.md)和[模块地图](references/project/01-module-map.md)。
2. 将任务映射到 `repository`、`module:*`、`language:*`、`framework:*`、`runtime:*` 或具体 `path:*` scope。
3. 按风险读取相关通用规则：[架构与边界](references/rules/architecture-and-boundaries.md)、[API/错误/资源](references/rules/api-errors-resources.md)、[测试](references/rules/testing.md)、[安全与数据](references/rules/security-and-data.md)、[质量门禁](references/rules/quality-gates.md)、[评审与交付](references/rules/review-and-delivery.md)。
4. 修改 `plus-ui-namewta/**` 时读取 [TypeScript 核心](references/typescript/core.md)、[Vue](references/typescript/frameworks/vue.md)和[Browser](references/typescript/runtimes/browser.md)；涉及 `src/api/**`、CRUD 页面、树表、表单或生成模板时再读取[前端 CRUD/API 实现规范](references/typescript/crud-api-and-pages.md)。
5. 修改 `ruoyi-vue-plus-namewta/**` 时读取 [Java 核心](references/java/core.md)；涉及 Spring 应用、Web、配置或 Bean 生命周期时再读取 [Spring Boot](references/java/frameworks/spring-boot.md)；涉及事务、`@DS`、数据源切换、事务事件、DDL、建表或 schema 迁移时必须读取[数据源事务与建表](references/java/persistence-transactions-and-ddl.md)；涉及 entity/BO/VO、mapper、查询封装、CRUD、树结构、翻译、缓存或导入导出时再读取[后端 CRUD/查询实现规范](references/java/crud-query-and-common.md)。
6. 读取[决策、迁移与例外](references/project/02-decisions-and-exceptions.md)，确认 current、target、Ratchet、`pending-decision` 和未到期例外。
7. 实现前检查 public API、依赖方向、安全、错误/取消/资源、数据库兼容和测试影响。
8. 实现后运行项目画像中该 scope 的真实质量门禁，并按[评审清单](references/project/review-checklist.md)报告命令、退出码、未验证项和残余风险。

## 约束

- MUST 规则只有在 `Verification` 可执行或给出精确 review 证据时成立。
- 不适用规则不加载；依赖、构建输出、生成声明和冻结 scope 不手工修改。
- 不通过删除测试、关闭核心规则、放宽编译配置或扩大例外获得通过。
- 新代码遵循 Target；存量偏差按 Migration/Ratchet 处理，不发动无关全仓重写。
- 前后端是独立 Git Submodule；在各自仓库完成变更与验证后，再单独更新父仓库指针。
- 项目事实变化时先更新 Project Profile/Module Map，再更新规则，不静默猜测。
