# Profile layered 边界

## 依赖矩阵

| 调用方 | 允许调用 | 禁止调用 |
|---|---|---|
| Controller/Listener/API Adapter | UseCase、domain 输入/输出类型 | Service、DAO、Mapper、具体 Impl、外部 API |
| UseCase | 一个或多个 Service、domain 类型、事务/事件声明 | DAO、Mapper、Gateway、Store、Provider、另一个 UseCase |
| Service | 自己的 DAO、domain policy、自己的 Gateway/Provider/Store、ruoyi-api 端口 | 另一个 Service、Mapper、Controller、具体 UseCase、MyBatis |
| DAO | 一个或多个本 owner Mapper、domain 持久化类型 | 其他 DAO、Service、UseCase、外部 API、Gateway、Store、Provider |
| Mapper | Entity/`domain/model/read` 类型和 MyBatis 声明 | 上层组件、其他 Mapper、业务规则 |

UseCase 可以编排多个 Service；Service 之间禁止互调。每个 Service 至少承担输入规范化、状态规则、外部端口适配或持久化策略中的一项职责，禁止 `forward/delegate` 空壳。DAO 可以组合多个 Mapper，但这些 Mapper 必须属于同一持久化 owner；跨能力组合上移到 UseCase。

## 命名

- `<Capability>UseCase` / `<Capability>UseCaseImpl`
- `<Capability>Service`，默认具体类；只有稳定多实现才增加接口
- `<Capability>Dao`，默认具体 `@Repository` 类；不创建 DAO/Repository 同义双套
- `<Capability>Mapper` 与同名 XML
- `<Capability>Gateway`、`<Capability>Provider`、`<Capability>Store`
- `<Concept>Policy`、`<Concept>Codec`、`<Concept>Converter`

不得使用 `buz`、泛化 `Manager`/`Helper`/`Util`/`DataSupport` 或 `ServiceImpl extends ServiceImpl`。

## 查询与事务

- Wrapper、`QueryBuilder`、分页和条件更新只在 DAO。
- 复杂 SQL、锁、聚合、批量写入放 Mapper XML；namespace 和 statement id 与接口一致。
- UseCase 在完整场景边界使用 `@DSTransactional`；DAO 不拥有业务事务。
- `FOR UPDATE` 只能由 UseCase 经 Service 调用；状态和版本条件必须与更新在同一 SQL 中。
- 外部远程调用不在数据库锁内执行；现有通知/workflow/Redis/OSS 时序第一阶段不改变。

## 模型

- `domain/entity`：MyBatis 表实体。
- `domain/bo`：入口命令/查询输入，维持 HTTP 合同。
- `domain/vo`：只承载 HTTP 响应和导出合同，不承载 Mapper Row。
- `domain/model/read`：Mapper 查询读模型，命名为 `<Capability>Row` 或 `<Capability>Projection`；只允许 Mapper、DAO、Service 使用，禁止 Controller/UseCase 直接依赖。
- `domain/model`、`domain/policy`、`domain/event`：框架无关模型、规则和事件。
- `support`：只允许局部纯函数/无状态辅助；有稳定语义的代码提升为 Policy/Codec/Converter/Gateway/Provider。

## 注释

- Profile 生产类型和显式方法统一使用中文 Javadoc，优先写职责、业务边界和非直观约束；Controller、UseCase、Service、DAO、Mapper 的 public 方法补充调用方需要的参数、返回值、异常和副作用说明。
- Lombok 生成的 accessor、record 自动 accessor，以及接口已经完整说明且未改变语义的纯覆盖方法，不重复堆叠相同注释。
