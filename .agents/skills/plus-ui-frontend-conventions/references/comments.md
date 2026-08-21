# 注释约定（观察性）

针对每个模块/能力的具体描述，如不明确，必须直接根据文中给出的仓库路径读取对应源码确认，不得凭空推断。

仓库没有独立「注释规范」文档（无 `CONTRIBUTING*` / `STYLE*`，无 `plus-ui-namewta/docs/`）。下列是真实代码与 gen 模板中的主导实践，不是 linter 强制，不要写成 Google/TSDoc 完整风格指南。

## 标准 API：块级中文 JSDoc

- 手写示例：`plus-ui-namewta/src/api/demo/demo/index.ts` — 一行中文摘要 + `@param` + 偶发 `@returns {*}`。
- 生成模板：`plus-ui-namewta/gen/api.ts.ftl` 同模式（`查询${functionName}列表` + `@param query` + `@returns {*}`）。
- 新标准 CRUD API 可跟随 demo/gen。不要要求每个函数都有完整 JSDoc。
- 反例（不要推广为「必须无注释」）：`plus-ui-namewta/src/api/menu.ts` 仅 `// 获取路由`；`plus-ui-namewta/src/api/login.ts` 的 `getInfo` 仅 `// 获取用户详细信息`，无 `@param`/`@returns` 块。

## 页面 handler：单行中文 JSDoc

- Vue SFC `<script setup>` 中，操作函数普遍使用 `/** 查询xx列表 */`、`/** 新增按钮操作 */` 等单行中文 JSDoc，无 `@param`。
- 样本：`plus-ui-namewta/src/views/demo/demo/index.vue`（`/** 查询测试单列表 */` 等）、`plus-ui-namewta/src/views/system/post/index.vue`（`/** 查询岗位列表 */`）、`plus-ui-namewta/src/views/monitor/operlog/index.vue`（`/** 查询登录日志 */`）。
- 生成模板：`plus-ui-namewta/gen/index.vue.ftl`、`plus-ui-namewta/gen/index-tree.vue.ftl`。
- 复杂页会夹杂 `//` 与少量块注释。跟随当前文件现状，不要为统一风格重写无关注释。

## 模板 HTML：分区注释

- 用于区块标记，如 `<!-- 部门树 -->`、`<!-- 添加或修改用户配置对话框 -->`（`plus-ui-namewta/src/views/system/user/index.vue`）。
- 样本：`plus-ui-namewta/src/views/system/user/index.vue`、`plus-ui-namewta/src/views/demo/demo/index.vue`、`plus-ui-namewta/src/views/system/post/index.vue`。

## 真实例外：dropdown 不用权限指令

- `plus-ui-namewta/src/views/system/user/index.vue`：模板注释原文为「注意 由于el-dropdown-item标签是延迟加载的 所以v-has-permi自定义标签不生效 需要使用v-if调用方法执行」。同文件用 `v-if="checkPermi(['system:user:import'])"` / `checkPermi(['system:user:export'])`，并从 `plus-ui-namewta/src/utils/permission.ts` 导入 `checkPermi`。该页还混用 `v-has-permi` 与 `v-hasPermi`。
- 保留该例外。不要在 dropdown 上强行套指令。CRUD 页默认指令实践见 `.agents/skills/engineering-standards/references/typescript/crud-api-and-pages.md`（FE-CRUD-007），不要复制其 MUST 条文。

## 无版权头 / 无 TODO 文化

- 绝大多数 TS/Vue 文件没有版权头或 `@author` 文件头。不要要求新文件加版权头。
- 例外：`plus-ui-namewta/src/directive/common/copyText.ts` 有 `v-copyText` + `Copyright (c) 2022 ruoyi`。`plus-ui-namewta/src/views/login.vue` 的 `Copyright © 2018-… 疯狂的狮子Li` 是 UI 文案，不是源码头。
- `src/` 下几乎不使用 `TODO` / `FIXME` / `HACK` / `XXX`。「待办」出现在 workflow 业务文案，不是代码债注释。不要发明 TODO/FIXME 规范。

## 框架自述，不是全仓风格

- `plus-ui-namewta/src/router/index.ts` 顶部有路由配置项说明块（`hidden` / `alwaysShow` / `roles` / `permissions` / `meta`）。这是该文件的框架自述，不要当成全仓注释模板。
- 字段实际用途读 [permission-routing.md](permission-routing.md)，不要只信这段注释。

## 已知未知（回源码，禁止发明）

- 未统计全部 Vue 文件的注释密度；上列为主导样本，不是全仓审计。
- 未逐文件审计全部 `src/` 的版权头 / `@author`。
- TODO/FIXME 检索覆盖 `plus-ui-namewta/src/`；未覆盖 `.codex/` 与 `gen/` 以外的全部非 src 文本。
