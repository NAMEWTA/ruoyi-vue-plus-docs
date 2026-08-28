---
name: ruoyi-workflow-module-guide
description: 提供 ruoyi-workflow（Warm-Flow）模块能力地图与业务接入范式，包括公开门面 WorkflowService、businessId 绑定、流程启动与任务办理、ProcessEvent 状态回写、待办 REST 和请假 leave1 样例。接入或修改工作流审批、注入 WorkflowService、监听流程事件、复制请假样例、查询待办或处理 ruoyi-modules/ruoyi-workflow 时使用。
---

# ruoyi-workflow 能力地图

本 Skill 只描述 `ruoyi-workflow` 当前工作树已确认的能力与接入面。规范裁决交给 `.agents/skills/engineering-standards`；不要把本模块内部 `IFlw*`、LiteFlow chain 或 Warm-Flow 引擎类型扩散为其他业务模块的依赖。

## 源码确认

针对每个模块/能力的具体描述，如不明确，必须直接根据文中给出的仓库路径读取对应源码确认，不得凭空推断。不要用训练数据或 Warm-Flow 官方文档覆盖本仓库调用点。

路径相对工作区，前缀 `ruoyi-vue-plus-namewta/`。

## 每次执行

1. 按任务加载最小 references：
   - 模块结构、`IFlw*` vs 公开 API、REST 边界 → [capability-map.md](references/capability-map.md)
   - 其他模块如何接入（`WorkflowService` + 事件；禁止 Maven 依赖 `ruoyi-workflow`）→ [integration-guide.md](references/integration-guide.md)
   - 仓库内唯一完整样例请假 leave1 → [leave-sample.md](references/leave-sample.md)
2. 条目不够明确时，按该条目给出的路径读源码。
3. 修改 Java/Spring 代码时同时加载 `engineering-standards` 的 Java / Spring Boot 规则。不要把规范条文复制进本 Skill。

## 默认接入面

- 业务模块：依赖 `ruoyi-api`，注入 `org.dromara.workflow.api.WorkflowService`，用 `@EventListener` 订阅 `ProcessEvent` / `ProcessTaskEvent` / `ProcessDeleteEvent`。
- 不要 Maven 依赖 `ruoyi-workflow`，不要 import `IFlw*`，不要实现 Warm-Flow `GlobalListener` 或 `PermissionHandler`（模块已占用）。
- 人的待办 / 已办 / 抄送走 REST `/workflow/task/*`（当前用户待办 `GET /workflow/task/pageByTaskWait`），不要在业务模块重查 `flow_task`。
- 表单是定义上的 `formPath` 路由到业务页，不是独立表单引擎。
- `ruoyi-demo` / `ruoyi-system` / `ruoyi-ai` 当前无 `WorkflowService` 调用；复制请假样例到目标业务模块。引擎 Warm-Flow `1.8.9`，由 `ruoyi-admin` 装配本模块。

## 未知项（必须回读源码）

下列项研究未闭合。需要时读标注路径，不要用训练数据补全：

- Warm-Flow `InsService` / `TaskService` / `DefService` 的 jar 内部契约（跳转、会签、权限校验）→ 只观察本仓库调用点，不反编译推断。
- 示例定义 `leave1` 的完整节点图 → 预期在库表或导入 JSON，源码树无独立定义文件。
- 本模块 `TaskAssigneeType`（`"1"` 审批 / `"2"` 转办 / `"3"` 委托 / `"4"` 抄送）与 Warm-Flow jar 内部枚举是否逐值等同 → `ruoyi-vue-plus-namewta/ruoyi-modules/ruoyi-workflow/src/main/java/org/dromara/workflow/common/enums/TaskAssigneeType.java`
- Warm-Flow UI 是否另有在线表单设计器 → 本模块无 Form Service / Form Controller。
- `businessCode` 生成 TODO → `ruoyi-vue-plus-namewta/ruoyi-modules/ruoyi-workflow/src/main/java/org/dromara/workflow/liteflow/start/StartPrepareInstanceComponent.java`
- `warm-flow.enabled=false` 时硬注入 `WorkflowService` 的启动失败形态 → 未实测；按 `@ConditionalOnEnable` 视为 Bean 不存在。
- 模块无 `src/test/java`；待办过滤、事件时序、锁与事务边界无自动化证据。
