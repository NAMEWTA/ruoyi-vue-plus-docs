# 后端 CRUD、查询与公共设施实现规范

适用 `module:ruoyi-vue-plus-namewta` 中业务 CRUD、MyBatis 查询、树结构、翻译、缓存和导入导出。生成器定义标准骨架，demo 展示完整链路，system/workflow 展示复杂领域约束。

### BE-CRUD-001 标准分层与实现基线

Scope: `path:ruoyi-vue-plus-namewta/ruoyi-modules/**`

Level: MUST

Source: `repository-fact` (`ruoyi-gen/src/main/resources/fm/java/**`, `ruoyi-demo/**/TestDemo*`)

Rule: 标准业务 CRUD 保持 entity、BO、VO、mapper、service/interface、service/impl、controller 的职责分离。生成器只建立骨架；修改 system/workflow 等成熟模块时，保留同模块已有的关系维护、权限、缓存、事务、导入导出和条件装配，不把复杂用例退化成模板 CRUD。

Verification: 全链路文件与同模块最近实现对照；controller/service/mapper 职责 review；受影响 Maven reactor build/test。

### BE-CRUD-002 Entity、BO、VO 与映射

Scope: `path:ruoyi-vue-plus-namewta/ruoyi-modules/**/domain/**`

Level: MUST

Source: `repository-fact` (`TestDemo`, `TestDemoBo`, `TestDemoVo`, Java generator templates)

Rule: 项目自有业务 entity 映射表并继承 `BaseEntity` 取得 `createDept/createBy/createTime/updateBy/updateTime` 自动填充字段；表中 `version`、`del_flag` 分别映射为显式 `@Version`、`@TableLogic` 字段，完整 schema 基线遵循[数据源事务与建表](persistence-transactions-and-ddl.md)。BO 使用 `@AutoMapper(target=..., reverseConvertGenerate=false)`、Serializable 和 Add/Edit validation groups；VO 使用面向响应的 `@AutoMapper`，只在确有导出或翻译需求时添加 Excel/Translation 注解。跨层转换沿用 `MapstructUtils`，不得把持久化 entity 直接作为外部合同。

Verification: 表 schema/entity/BO/VO 字段对照；mapping/validation 测试；编译并 review 安全字段和 nullable 语义。

### BE-CRUD-003 Mapper 与数据权限

Scope: MyBatis mapper interfaces and XML under `ruoyi-vue-plus-namewta`

Level: MUST

Source: `repository-fact` (`BaseMapperPlus`, `TestDemoMapper`, `SysUserMapper`, `SysRoleMapper`)

Rule: 标准 mapper 继承 `BaseMapperPlus<Entity, Vo>` 并优先使用其 VO、batch 和 lambda API。数据权限必须覆盖真实执行查询/更新/删除的方法；`@DataColumn.value` 与 SQL 中实际列或 alias 完全一致，join SQL 使用带 alias 的字段。只有 wrapper/API 不能清晰表达的查询才增加 XML，并保持参数名和 `${ew.customSqlSegment}` 等合同准确。

Verification: mapper 方法到最终 SQL 追踪；不同权限范围负向测试；SQL/alias review；相关集成测试。

### BE-CRUD-004 查询条件与 fresh wrapper

Scope: service query builders and `ruoyi-common-mybatis`

Level: MUST

Source: `repository-fact` (`QueryBuilder`, `BaseMapperPlus.lambda()`, `LambdaCrudChainWrapper`, Java service template)

Rule: 动态查询使用 `QueryBuilder.lambda`、`Wrappers.lambdaQuery` 或 mapper 的 fresh `lambda()`，根据类型选择 `eqIfPresent`、`eqIfText`、`likeIfText`、`betweenParams` 等条件，并给出确定排序。链式 wrapper 有可变查询/更新状态，不得跨请求、线程或独立操作缓存复用；每个操作取得新实例，复用同一实例时必须先明确 `clear()` 能否完整清除所用状态。

Verification: 空字符串/null/日期范围/排序测试；review wrapper 创建位置和 Bean 字段；并发与重复调用测试。

### BE-CRUD-005 Service 不变量、唯一性与删除校验

Scope: service implementations under `ruoyi-vue-plus-namewta/ruoyi-modules/**`

Level: MUST

Source: `repository-fact` (`TestDemoServiceImpl`, Java service template, system service implementations)

Rule: service 负责 `buildQueryWrapper`、映射、领域不变量、唯一性和删除前校验。insert 成功后按合同回填生成主键；update/status/sort 只更新允许字段；唯一性检查在编辑时排除当前主键；无权限或违反不变量使用现有 `ServiceException` 合同失败，不以 mapper 返回 0 静默掩盖关键业务失败。

Verification: insert/update/duplicate/delete forbidden 测试；review `validEntityBeforeSave` 和 checkUnique；事务集成测试。

### BE-CRUD-006 Controller transport 与安全注解

Scope: Spring MVC controllers under `ruoyi-vue-plus-namewta/ruoyi-modules/**`

Level: MUST

Source: `repository-fact` (`TestDemoController`, Java controller template, system controllers)

Rule: controller 继承/复用现有 Web 响应合同，使用 `R`/`PageResult`、Bean Validation groups 和准确的 path/body 参数；list/detail/add/edit/remove/export 的 method、URL 与前端一致。写操作按风险使用 `@SaCheckPermission`、`@Log`、`@RepeatSubmit`，controller 不承载核心事务或多表编排；前端隐藏按钮不能替代这里及数据层的授权。

Verification: MockMvc/集成测试 status/body/validation/permission；前端 API 对照；annotation 与 permission string review。

### BE-CRUD-007 多表写入、缓存与副作用

Scope: service methods that modify relations, cached data or external state

Level: MUST

Source: `repository-fact` (`SysUserServiceImpl`, system cache-bearing services, workflow services)

Rule: 用户-角色、用户-岗位、角色-菜单等关联更新和主体写入位于覆盖完整用例的 `@DSTransactional` 中，并先校验引用、Client/用户类型等不变量。`@DSTransactional` 默认对 `Exception` 回滚，不为模仿 Spring 写法重复参数；改变 rollback/noRollback 或 propagation 时必须有用例证据。写后失效所有受影响缓存；提交阶段事件使用 `@DsTxEventListener`，外部会话踢出、通知或其他副作用说明发生在提交前后何处以及失败补偿，不能留下数据库、缓存和会话互相矛盾的状态。

Verification: 中途失败回滚、关联清空/替换、跨 Client 拒绝和缓存失效测试；review `@DSTransactional` 代理边界、`@DsTxEventListener` phase 与副作用顺序。

### BE-CRUD-008 树结构不变量

Scope: tree entities and services under `ruoyi-vue-plus-namewta/ruoyi-modules/**`

Level: MUST

Source: `repository-fact` (Java tree service template and demo tree implementation)

Rule: 树节点保存时统一处理 root value、parent existence、self-parent、ancestor path 和排序。移动节点必须拒绝选择自身或后代为父节点，并在同一一致性边界更新后代 ancestors；删除前检查或明确处理子节点。前后端对 root、id、parentId、children 的表示必须一致。

Verification: root/child insert、move、cycle rejection、descendant ancestors、delete-with-children 测试；事务回滚；前后端树合同 review。

### BE-CRUD-009 翻译使用批量合同

Scope: `ruoyi-common-translation` implementations and VO `@Translation` usage

Level: MUST

Source: `repository-fact` (`TranslationInterface`, `TranslationJsonFieldProcessor`, `UserNameTranslationImpl`)

Rule: 新翻译实现使用 `@TranslationType` 注册，并为列表型响应实现 `translationBatch`，保持输入 key 到结果的映射以及逗号 ID 的原顺序语义。JSON 增强按 collect、prepare、process 三阶段工作；实现不得在逐字段 process 中制造可避免的 N+1。批量失败或缺失翻译按现有回退合同处理，不改变原字段所有权。

Verification: 单 key、批量、重复 key、逗号 ID、缺失值与失败回退测试；查询次数断言或日志/SQL 观察。

### BE-CRUD-010 导入导出与条件装配

Scope: Excel import/export and optional workflow/module beans

Level: MUST

Source: `repository-fact` (`TestDemoController`, Excel infrastructure, workflow `@ConditionalOnEnable` usage)

Rule: 导入先解析并执行现有校验，再转换和持久化，响应返回可理解的分析结果；批量写入的原子性与部分失败语义必须明确。导出使用 VO 与现有 Excel builder，不泄露未声明字段。可选 workflow 能力的 controller、service、listener、rule/config 等入口保持同一条件装配合同，禁用时不得残留依赖缺失的孤立 Bean。

Verification: 合法/非法/部分失败导入、导出字段与权限测试；启用/禁用两种 application context 测试；Maven build/test。

### BE-CRUD-011 生成模板演进

Scope: `path:ruoyi-vue-plus-namewta/ruoyi-modules/ruoyi-gen/src/main/resources/fm/**`

Level: SHOULD

Source: `repository-fact` (Java, Vue, XML and SQL generator templates)

Rule: 会重复污染新模块的缺陷在生成模板修复，一次性领域行为留在业务模块。模板变化同时检查 Java/Vue/API/types/XML/SQL 关联输出，以及 CRUD/tree、unique、status、sort、between、dict、permission 分支；生成结果必须能编译并保持前后端合同一致。

Verification: 用覆盖受影响条件的生成元数据产出样例并 diff；前端 lint/type diagnostic/build；后端 compile/test；检查未选择分支无回归。
