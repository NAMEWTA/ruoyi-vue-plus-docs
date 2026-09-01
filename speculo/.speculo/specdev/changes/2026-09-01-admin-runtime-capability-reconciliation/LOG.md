# Change Log

## 2026-09-01

- 用户报告 OpenAPI 路由 404、OpenAPI 菜单缺失、Nacos 菜单名称/位置错误，以及已退役生成器仍显示。
- D-diagnose-bugs 通过真实双实例 HTTP、DBX 权威查询、OpenAPI 组装测试和前端 manifest 测试确认根因。
- 用户明确要求按诊断计划执行。
- 接受 ADR-001 至 ADR-004。ADR-003 在当前 change 中覆盖旧 Nacos/OpenAPI 菜单显示合同；旧工件不改写。
- 本次授权包含本地实现 commit、当前父分支集成和计划内开发数据库修复；不包含远端 push、生产环境或同机 CDE。
- 发布两张 Ready/Deep Ticket 与 current/direct-parent Goal Plan；固定数据库先于双实例启用，开发环境写入受备份、0-row、恢复步骤和逐实例 Gate 约束。
- T-01 反向验证发现既有 OpenAPI SQL 前缀常量已落后于 backend HEAD 的后续 OSS SQL；将该 contract test 纳入 T-01，以实施前完整 HEAD 重建哈希门，历史 SQL 本身保持不变。
- T-01 全量 reactor 又暴露密码迁移测试的 15,370 字节 DML 前缀常量已在实施前 backend HEAD 失真；HEAD 与工作树前缀均为 `698675a3a16598df7313b90a5b267bb3cbfe9fe1a8e489737752189b3f58a81f`，只同步期望哈希，不改密码 SQL、固定长度或算法。
- T-01 标准轴审查发现 DDL 仅凭同名列即可删除生成器表、DML 对生成器固定菜单身份验证偏宽；新增“同名列非主键表”和“固定 ID 非历史菜单”两个隔离 MySQL 负向用例，确认修复前均红灯。
- T-01 将 DDL 前置收紧为 `BASE TABLE` 且冻结 ID 列必须为 `PRI`，并用历史名称、路径、client、component/permission 补齐九个生成器菜单身份验证；隔离 MySQL 静态加数据库矩阵 `9/9` 通过，其中数据库场景 `7/7` 通过。
- T-01 完成标准轴与 Spec 轴固定点审查：未发现剩余阻塞 finding；最终 `./mvnw -pl ruoyi-admin -am test` 为 `328` 项、`0` 失败、`23` 项环境型跳过，`git diff --check` 通过。
