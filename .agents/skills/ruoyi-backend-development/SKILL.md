---
name: ruoyi-backend-development
description: 为 NAMEWTA RuoYi-Vue-Plus 后端提供当前 Maven 模块、CRUD/API、数据权限、事务、MySQL 基座、测试与交付导航。处理 ruoyi-admin、ruoyi-api、ruoyi-common、ruoyi-modules、controller、service、mapper、BO/VO/entity、GET/POST、@Log、@DSTransactional 或 release-artifacts MySQL SQL 时使用；具体 system/common/workflow 能力再路由到对应模块 Skill。
---

# NAMEWTA 后端开发导航

本 Skill 是 `ruoyi-vue-plus-namewta` 的项目级后端开发入口。强制规范、Ratchet 和质量门禁由 [engineering-standards](../engineering-standards/SKILL.md) 裁决；当前源码、POM、测试和公开合同始终优先于摘要。

## 工作流程

1. 读取工程规范的项目画像、模块地图及本任务命中的 Java/Spring/持久化 reference。
2. 确定 Maven 模块和业务 owner，按“同模块同形态成熟实现 -> 公开 `ruoyi-api`/common 能力 -> 父仓库 `docs/fm/java` 标准模板 -> 框架通用做法”取样。
3. 按任务读取引用：
   - 模块职责与依赖边界：[architecture.md](references/architecture.md)
   - API、CRUD、事务与 SQL 实现导航：[implementation.md](references/implementation.md)
   - Maven 验证与交付选择：[verification.md](references/verification.md)
4. 需要具体能力时加载最小充分的模块 Skill：
   - `ruoyi-common-*` 选型、工具和 SPI：[ruoyi-common-modules-guide](../ruoyi-common-modules-guide/SKILL.md)
   - system 对外 API、用户、部门、字典、OSS、消息和权限：[ruoyi-system-module-guide](../ruoyi-system-module-guide/SKILL.md)
   - Warm-Flow、流程启动/办理、事件和待办：[ruoyi-workflow-module-guide](../ruoyi-workflow-module-guide/SKILL.md)
5. 先运行受影响模块或测试类，再按风险执行 Maven 根级门禁，并准确记录未运行项。

## 硬边界

- 跨业务模块只使用 `ruoyi-api` 或明确 common SPI，不依赖其他模块的 mapper、entity、domain、VO 或实现类。
- CRUD 只读查询使用 GET，业务变更使用 POST；每个 POST 业务接口使用准确、安全的 `@Log`。
- 新建或实质修改的业务事务使用 `@DSTransactional`，事务事件使用匹配的 `@DsTxEventListener`。
- 保留现有权限、数据范围、Client 隔离、缓存失效、关系维护、删除前校验、导入导出和翻译语义。
- 数据库只支持 MySQL 8.4；六份完整基座只由父仓库 `release-artifacts/docker/infrastructure/mysql/init/` 拥有并直接修改，后端仓库不得恢复 `script/` 或 SQL 副本。
- `main` 承载产品；`6.X` 只做上游镜像。前端 API、模型、页面与 App 组合只在 `plus-ui-namewta` 维护。
