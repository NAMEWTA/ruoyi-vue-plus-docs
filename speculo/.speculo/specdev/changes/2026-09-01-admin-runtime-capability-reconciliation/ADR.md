# Change ADR: Admin 运行能力收敛

## ADR-001：OpenAPI 保持默认关闭，由受管环境显式启用

- **状态：** accepted
- **决定：** `openapi.enabled` 的代码与公开发布样例默认值继续为 `false`。发布 Compose 必须显式透传 `OPENAPI_ENABLED`、`OPENAPI_KEK_VERSION`、`OPENAPI_KEK`；目标开发环境通过被忽略且权限受限的配置提供合法值。
- **原因：** OpenAPI 包含机器身份、长期凭据和全局权限聚合，不能因修复开发环境而扩大所有安装的默认攻击面。
- **后果：** 未配置环境继续没有管理 Controller；显式启用但安全配置无效时应用启动失败。
- **来源：** `DIAG-001`、`USER-DECISION:2026-09-01-execute-confirmed-plan`。

## ADR-002：以新的幂等尾部块收敛 fresh 与 upgrade

- **状态：** accepted
- **决定：** 不修改已经提交或执行过的历史 SQL。只在 `<Path>ruoyi-vue-plus-namewta/script/sql/namewta/DDL.sql</Path>` 和 `<Path>ruoyi-vue-plus-namewta/script/sql/namewta/DML.sql</Path>` 末尾追加新的能力收敛块，并让其同时处理全新初始化和当前混合状态升级。
- **原因：** PERSIST-006 要求双文件 append-only；当前环境证明仅依赖历史块执行顺序不足以保证 upgrade 最终态。
- **后果：** 新块必须有固定 ID 前置校验、可重复执行合同、隔离 MySQL fresh/upgrade/replay 验证和部署后最终态查询。
- **来源：** `DIAG-001`、工程规范 `PERSIST-006`。

## ADR-003：菜单名称与位置覆盖历史 change

- **状态：** accepted
- **决定：** OpenAPI 系统管理菜单显示为“OpenAPI管理”；Nacos 固定菜单显示为“Nacos配置中心”，父菜单改为“系统监控”，排序在现有 AI 控制台之后。component、path 和 permission 保持不变。
- **原因：** 用户最新明确决定高于历史 change 的“应用开放管理”和“系统管理 > 配置中心”合同。
- **后果：** 新 DML 在固定 ID 上前向更新，不创建别名或第二个菜单；历史 change 保留为旧决策证据。
- **来源：** `USER-DECISION:2026-09-01-menu-corrections`。

## ADR-004：生成器数据库面完成物理退役

- **状态：** accepted
- **决定：** 在确认两表当前为空并取得可验证备份后，删除固定九条生成器菜单及角色关系，物理删除 `gen_table_column` 和 `gen_table`。不保留兼容表、页面或恢复入口。
- **原因：** 运行代码和前端已经物理退役，残留数据面继续制造不可用导航和虚假产品能力。
- **后果：** 数据库写入属于破坏性批准点；应用回滚不自动恢复表，只能使用已验证备份。
- **来源：** `USER-DECISION:2026-09-01-execute-confirmed-plan`、历史 generator retirement Spec。
