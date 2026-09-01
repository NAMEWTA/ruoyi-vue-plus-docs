# API、数据与 SQL 实现

## 分层与取样

标准业务保持 entity、BO、VO、mapper、service、service implementation、controller 分工：

- controller 负责传输、校验、权限、日志和返回映射；
- service 负责业务规则、事务、缓存和关系维护；
- mapper 负责查询与持久化，并沿用当前数据权限模式；
- BO/VO/entity 字段、校验和映射与真实 HTTP、数据库合同一致。

生成器模板只提供标准 CRUD 起点。system、workflow 等复杂模块优先保持同模块成熟实现中的权限、关系、缓存、事务、删除校验、导入导出和条件装配。

## HTTP 与安全

- 列表、分页、详情、树和下拉等只读操作使用 GET。
- 新增、修改、删除、批量删除、状态和排序等业务变更使用 POST。
- 每个 POST 业务方法使用语义准确的 `@Log`，不记录凭据、Token、密钥或不受控敏感正文。
- `@SaCheckPermission`、数据权限和 Client 范围沿用同模块合同；前端隐藏不能替代接口鉴权。

## 数据与事务

- 查询优先复用当前 `QueryBuilder`、`BaseMapperPlus`、MPJ 和数据权限方式，每次构建 fresh wrapper。
- 新建或实质修改的业务事务使用 `@DSTransactional`；事务事件使用匹配的 `@DsTxEventListener`。
- 数据写入成功后按 owner 失效缓存；删除前校验、唯一性和关系维护在同一业务事务中保持一致。
- 翻译使用公共批量合同，避免逐项查询；导入导出保持校验、权限和错误反馈。

## SQL

父仓库 `release-artifacts/docker/infrastructure/mysql/init/` 是唯一 SQL 事实源。项目只支持 MySQL 8.4，六份文件均为可直接修改的当前完整基座；`50-namewta-ddl.sql` 只管理 NAMEWTA 结构，`60-namewta-dml.sql` 只管理初始化、回填和其他数据。禁止在后端仓库恢复 `script/`、创建 SQL 副本或新增其他方言。

全新库按 `10 -> 20 -> 30 -> 40 -> 50 -> 60` 执行。已有库不得重放基座，必须指定源/目标 Git Tag、备份现场、生成并评审差异 SQL，并在隔离副本演练；详细合同读取工程规范的持久化 reference 与父仓库 `release-artifacts/README.md`。
