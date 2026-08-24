# 变更评审清单

只检查与当前 scope 和风险相关的条目。

- [ ] 变更映射到模块地图中的明确 scope；子模块内提交与父仓库指针更新没有混淆。
- [ ] 实现选择遵循同模块成熟实现、公共能力、生成模板的证据优先级；复杂模块没有被模板化简化。
- [ ] 前端分页/树表返回类型、VO/Form/Query、请求 `params`/`data`、ID 和日期范围合同与后端一致。
- [ ] CRUD 只读查询使用 GET，变更操作使用 POST，不使用 PUT/PATCH/DELETE；每个 POST 业务方法均有 `@Log`，`title`、`BusinessType` 和敏感数据保存配置准确；各操作 URL 无冲突且前后端一致。
- [ ] 前端 loading、dialog、搜索重置、选择、树展开等状态优先复用现有 hooks；请求失败或取消后状态可恢复。
- [ ] 后端 entity/BO/VO/mapper/service/controller 职责未混用；查询条件、排序、唯一性、删除前校验和树不变量完整。
- [ ] 数据权限字段与实际 SQL/alias 一致；新建/实质修改的业务事务使用 `@DSTransactional`，未与 Spring `@Transactional` 混用；事务事件使用匹配的 `@DsTxEventListener`；缓存写后失效，翻译避免逐项 N+1。
- [ ] 依赖只通过允许的 public contract，未产生循环、前后端源码耦合或跨 Maven 模块深依赖。
- [ ] 触及认证、权限、Client、用户类型、菜单、注册或会话时，逐项核对 `docs/upstream/customization-map.md`。
- [ ] OAuth 字符串 `clientId` 与数据库 Long PK `clientId/clientPk` 没有混用。
- [ ] 外部输入、权限、secret、日志和敏感数据边界已处理；前端可见性未替代后端授权。
- [ ] 错误、超时、取消、事务、资源和并发生命周期完整，原始 cause 与中断语义保留。
- [ ] public API、JSON、数据库 schema、SQL 初始化顺序和持久化兼容影响已说明；每个新建项目自有表均包含 `version/create_dept/create_time/create_by/update_time/update_by/del_flag` 并与 entity 映射一致。
- [ ] 测试层级匹配风险；前端 lint/typecheck/unit/E2E/build 与后端 default test/双 bundle package 已按适用范围执行，属性门控测试的 skipped/真实服务状态未被掩盖。
- [ ] `target/**`、`.flattened-pom.xml`、自动导入声明等生成物未被手改；代码生成器源码未被错误排除。
- [ ] 实际运行的 lint/compile/test/build 命令、working directory、退出码和未验证项已记录。
- [ ] 未混入 `pnpm fmt` 全仓改写、依赖升级、lockfile 漂移或无关大文件拆分。
- [ ] 上游镜像分支和基线标签保持冻结；SQL 定制仍位于 `script/sql/namewta/**`。
- [ ] 当前状态、目标状态、Ratchet、pending decision 与例外没有混写。
- [ ] UI 变化提供截图/交互证据；数据库/部署变化说明迁移、回滚和可观测性。
