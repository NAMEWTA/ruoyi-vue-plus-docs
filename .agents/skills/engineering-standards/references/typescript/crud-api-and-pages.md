# 前端 CRUD、API 与页面实现规范

适用 `module:plus-ui-namewta` 的 `src/api/**`、`src/views/**` 和相关生成模板。当前分页 CRUD、树表 CRUD、system 复杂页面及 `src/hooks/**` 共同定义实现基线。

### FE-CRUD-001 先判定页面形态与实现基线

Scope: `path:plus-ui-namewta/src/api/**`, `path:plus-ui-namewta/src/views/**`

Level: MUST

Source: `repository-fact` (`src/views/demo/**`, `src/views/system/**`, backend Vue generator templates)

Rule: 开始实现前判定是标准分页 CRUD、树表 CRUD、已有复杂页面、工作流页面还是仅 API/type 变更。新建标准功能可用当前生成模板作骨架；已有 system/workflow/复杂页面按同模块最近成熟实现增量修改，不得为套模板删除既有权限、联动、全高布局、缓存状态或流程语义。

Verification: 记录选用的同形态代码路径；diff review 页面既有行为与新增需求；UI 交互回归。

### FE-CRUD-002 API 文件与 transport 合同

Scope: `path:plus-ui-namewta/src/api/**`

Level: MUST

Source: `repository-fact` (`src/api/demo/demo/**`, `src/api/demo/tree/**`, `src/utils/api-types.ts`, `src/api/types.ts`)

Rule: 标准业务 API 使用同目录 `index.ts` 与 `types.ts` 分离调用和合同。请求/响应类型使用 `import type`；`AxiosPromise` 从 `@/utils/api-types` 导入，分页结果使用 `@/api/types` 的 `PageResult<VO>`。查询放 `params`，新增/修改/状态变化放 `data`；函数名沿用 `list/get/add/update/del/changeStatus/updateSort + BusinessName`，URL、HTTP method 和后端 controller 一致。

Verification: 对照后端 controller、BO、VO；review import 来源、request config 和返回泛型；`pnpm lint`; `pnpm build:prod`。

### FE-CRUD-003 VO、Form 与 Query 分离

Scope: `path:plus-ui-namewta/src/api/**/types.ts`

Level: MUST

Source: `repository-fact` (`src/api/demo/demo/types.ts`, `src/api/demo/tree/types.ts`, backend Vue types template)

Rule: `VO` 表达服务端返回，`Form extends BaseEntity` 表达新增/修改草稿，`Query` 表达筛选条件；分页 Query 继承 `PageQuery`，树列表 Query 不继承分页类型。主键和跨端 Long 使用 `string | number`；字段可选性、数组、boolean/null 与后端 JSON 保持一致；日期区间放入项目约定的 `params`，不虚构独立 transport 字段。

Verification: 前后端字段逐项对照；分页与树表响应 shape review；`pnpm exec vue-tsc --noEmit`; 构建。

### FE-CRUD-004 页面状态复用现有 hooks

Scope: `path:plus-ui-namewta/src/views/**`

Level: SHOULD

Source: `repository-fact` (`src/hooks/**`, `src/views/demo/**`, backend Vue generator templates)

Rule: loading、dialog/form reset、搜索显隐与重置、表格选择、日期范围、排序、树展开/折叠和全高表格优先复用相应 `useXxx`。调用方遵守 hook 所有权：异步任务经 `withLoading` 的 `finally` 复位；dialog 打开前得到独立初始表单副本并清理校验；搜索重置同步复位分页和额外日期状态；observer/listener/timer 由 hook 或组件在卸载时释放。

Verification: 对照 hook 参数/返回合同；失败路径、重复打开、reset、mount/unmount 人工或自动测试；review 不重复造状态机。

### FE-CRUD-005 分页与树表数据流

Scope: `path:plus-ui-namewta/src/views/**`

Level: MUST

Source: `repository-fact` (`src/views/demo/demo/index.vue`, `src/views/demo/tree/index.vue`)

Rule: 分页列表在新查询时复位 `pageNum`，从 `res.data.rows/total` 更新列表和总数，并由 pagination 触发同一 `getList`。树表使用数组响应、稳定 `row-key`、明确 id/parentId 转换和非分页 Query；新增子节点、根节点、父节点下拉和展开状态必须保持各自语义，修改时不得把当前节点或错误字段当父节点。

Verification: 搜索、重置、翻页、空结果与加载失败测试；树根/子节点新增、修改、删除和展开回归；响应合同对照。

### FE-CRUD-006 表单提交、状态开关与错误恢复

Scope: `path:plus-ui-namewta/src/views/**`

Level: MUST

Source: `repository-fact` (`src/views/demo/**`, `src/views/system/client/index.vue`, backend Vue generator templates)

Rule: 提交必须先通过 Element Plus form validation，再按主键是否存在选择 add/update，并在所有成功或失败路径恢复按钮 loading。成功后关闭 dialog、提示并刷新；失败不伪报成功。乐观状态开关须在取消或请求失败时恢复旧值；排序更新失败至少重新拉取权威列表。

Verification: validation failure、API rejection、确认取消、重复提交与刷新回归；review `finally`/catch 恢复分支；lint/build。

### FE-CRUD-007 权限、字典、导出与页面骨架

Scope: `path:plus-ui-namewta/src/views/**`

Level: MUST

Source: `repository-fact` (`src/views/demo/**`, `src/views/system/**`, backend Vue generator templates)

Rule: 操作权限沿用后端 permission string 并用 `v-hasPermi` 控制呈现，但服务端仍必须授权。字典值使用现有 `useDict`/`dict-tag` 合同。导出使用 request 模块的 `download` 别名并传递当前查询条件。标准页沿用现有 search panel、toolbar、data table、pagination 与 dialog 结构；复杂页面保留其既有布局和交互，不机械重排。

Verification: permission string 与 controller/menu 对照；无权限负向测试；字典空值/多值显示与导出筛选回归；UI 截图和构建。

### FE-CRUD-008 生成模板与实际代码同步

Scope: `path:ruoyi-vue-plus-namewta/ruoyi-modules/ruoyi-gen/src/main/resources/fm/vue/**`, generated front-end CRUD output

Level: SHOULD

Source: `repository-fact` (Vue generator templates and demo output)

Rule: 反复出现在新生成页面的缺陷应修正模板并用代表性分页/树表生成结果验证；一次性领域逻辑留在业务页面。模板变化必须同时检查 API/types、分页/树表分支、状态/排序、日期范围、字典与权限条件，避免只修单一输出片段。

Verification: 生成至少一个受影响形态并 diff；对生成结果执行 lint、补充 typecheck 和 build；检查未影响不相关模板分支。
