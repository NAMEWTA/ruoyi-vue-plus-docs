---
name: ruoyi-module-guide
description: 为 RuoYi 新增或接入业务模块提供渐进式事实导航；按模块索引 Profile、System、Workflow 的公共合同、目录和集成边界。通用工程规范与五层依赖规则分别由 engineering-standards 和 ruoyi-backend-development 裁决。
---

# RuoYi 模块导航

本 Skill 是模块事实和接入面路由器，不是第二套架构规范。处理新增模块、跨模块 API、Profile 业务、System 能力或 Workflow 审批时，先读取本入口，再按目标模块加载一个最小 reference。若模块没有专用 reference，则读取该模块根部的 `AGENTS.md`，并回到通用后端/前端 Skill。

## 使用顺序

1. 确认任务目标模块和运行面（后端、前端或跨模块）。
2. 读取对应 `references/modules/<module>/index.md`。
3. 只读取 index 按当前问题指向的 capability、integration 或 domain reference；条目不清楚时直接按路径回读源码。
4. 架构、目录、命名、注释、框架和质量门禁以 `engineering-standards`、`ruoyi-backend-development` 或 `plus-ui-frontend-conventions` 为准；本 Skill 不复制这些通用规则。

## 模块路由

| 模块 | 当前定位 | 首读入口 |
|---|---|---|
| `ruoyi-profile` | 新模块五层架构试点；person/enterprise 资料、认证、材料、绑定和转移 | [`profile/index.md`](references/modules/profile/index.md) |
| `ruoyi-system` | 存量基础模块；本轮保持 classic 目录和实现不变，只描述稳定 API 与内部边界 | [`system/index.md`](references/modules/system/index.md) |
| `ruoyi-workflow` | 存量 Warm-Flow 模块；本轮保持内部实现不变，只通过 `ruoyi-api` 提供审批接入 | [`workflow/index.md`](references/modules/workflow/index.md) |

新模块不能因为没有专用地图而复制 `ruoyi-system`/`ruoyi-workflow` 的内部实现。先在模块根 `AGENTS.md` 中确认职责、POM/package 组成、入口和本地验证命令；跨模块能力只能使用已公开的 API 或 common SPI。

## 新模块与存量模块

- 新增模块或新能力默认采用 `Controller -> UseCase -> Service -> DAO -> Mapper -> XML`；辅助的 listener、event、gateway、provider、store、domain policy 不得绕过主链路。完整的层级和 `IService` 使用边界见通用后端规则。
- `ruoyi-profile` 是当前参考实现；继续保持 person 与 enterprise 的实现、Mapper、Entity、domain 和表隔离，跨子域查询使用公开身份合同。
- `ruoyi-system`、`ruoyi-workflow`、`ruoyi-job`、`ruoyi-demo`、`ruoyi-ai` 等存量模块本轮不做架构迁移。修改存量实现时先遵守其本地事实和兼容合同，不把 classic 代码复制成新模块模板。
- 新模块需要 System 能力时注入 `ruoyi-api`/common SPI；需要 Workflow 时只使用 `org.dromara.workflow.api.WorkflowService` 和事件合同，并优先在 `adapter/gateway` 封装为本模块 Port，Service 只注入该 Port；禁止依赖实现模块 POM。

## 公开边界

模块 reference 只记录当前工作树已核实的合同、路径、行为和例外。它不创造远程客户端、租户模型、表单引擎或未在源码中确认的 API。涉及旧模块的内部 `I*Service`、Mapper、Entity、Controller 或 Warm-Flow 类型时，除 `ruoyi-admin` 组装例外外，均视为非稳定实现面。

## AGENTS.md 协同

每个包含 Maven `pom.xml` 或前端 `package.json` 的模块/包根应有一份简短 `AGENTS.md`，只说明职责、组成、入口、依赖边界、验证命令和下一步索引；细节仍由源码和本 Skill references 提供。嵌套文件遵循最近目录优先，不在多个 Skill 中重复维护同一事实。

## 按需索引

- Profile：person/enterprise 能力、公开合同和五层试点例外 → [`profile/index.md`](references/modules/profile/index.md)
- System：`ruoyi-api`、common SPI、HTTP 管理面和存量内部服务 → [`system/index.md`](references/modules/system/index.md)
- Workflow：`WorkflowService`、事件、businessId、待办 REST 和请假样例 → [`workflow/index.md`](references/modules/workflow/index.md)
