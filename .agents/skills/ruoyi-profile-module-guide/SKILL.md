---
name: ruoyi-profile-module-guide
description: 为 ruoyi-profile person/enterprise 后端提供强制五层架构、公共 API、工作流/system/common 接入、并发与测试导航。处理 ruoyi-profile 的 controller、usecase、service、dao、mapper、domain、Gateway/Provider/Store 重构或新增能力时使用。
---

# ruoyi-profile 模块导航

本 Skill 是 profile 事实导航；工程规范由 `engineering-standards` 裁决，通用后端实现由 `ruoyi-backend-development` 裁决。当前 profile layered 模式强制以下主调用链：

```text
Controller / Listener / ruoyi-api Adapter
  -> UseCase
  -> Service
  -> DAO
  -> Mapper
  -> Mapper XML
```

## 必须遵守

- 编排层包名使用 `usecase`，不使用 `buz`/`biz`。
- 所有入口只依赖 UseCase 合同；UseCase 只编排 Service；Service 只调用自己的 DAO 和明确的外部端口；DAO 只能调用 Mapper；Mapper 只负责 SQL。
- UseCase 不得直连 DAO、Mapper、Gateway、Store、Provider 或外部 API。
- Service 不得调用另一个 Service，不得 import MyBatis/Mapper，不得继承 `IService`/`ServiceImpl`。
- DAO 不得调用另一个 DAO、UseCase、Service、Gateway、Store、Provider 或跨模块 API，不得继承 `IService`/`ServiceImpl`。
- 每个涉及数据库的用例必须能验证完整 `Entry -> UseCase -> Service -> DAO -> Mapper -> XML` 链路。
- `domain` 类型、纯 `policy/codec/converter` 和局部 `support` 只能作为辅助，不得绕过主链路；`support` 不容纳 Spring Bean、数据库或远程调用。
- `domain/vo` 只承载 HTTP 输出；Mapper 查询结果统一放在 `domain/model/read`，使用 `<Capability>Row` 或 `<Capability>Projection` 命名。Row/Projection 不得直接作为 Controller 返回值。
- `domain/model/read` 是读模型目录，不是第六层；Mapper 可以映射它，DAO 可以组合它，Service 可以消费它，Controller 和 UseCase 不得直接依赖 Mapper 读模型。
- person 与 enterprise 不得互相依赖实现类、Mapper、Entity、domain 或表；企业转移使用 `ruoyi-api` 的 `PersonIdentityLookupService`。
- system 能力只注入 `ruoyi-api`/common SPI；工作流只注入 `org.dromara.workflow.api.WorkflowService`/事件合同，POM 不依赖实现模块。
- 事务使用 `@DSTransactional`；锁查询必须由 UseCase 经 Service 在事务内调用。
- 生产代码中的自有类、接口、枚举、record 和显式声明的方法必须使用简明中文 Javadoc；对外方法补充参数、返回值、异常和副作用说明，纯 Lombok/record 自动生成方法可免重复注释。

## 目录路由

- 事实和公共合同：[`references/capability-map.md`](references/capability-map.md)
- 五层依赖、命名和迁移护栏：[`references/layered-boundaries.md`](references/layered-boundaries.md)
- Controller 访问面：`controller/admin`、`controller/self`、`controller/anonymous`
- UseCase：`usecase/<Capability>UseCase.java` 与 `usecase/impl/<Capability>UseCaseImpl.java`
- Service：`service/<Capability>Service.java`；默认使用语义明确的具体类
- DAO：`dao/<Capability>Dao.java`；默认使用具体 `@Repository` 类
- Mapper/XML：`mapper/<Capability>Mapper.java` 与 `resources/mapper/person|enterprise/`
- 读模型：`domain/model/read/<Capability>Row.java`；只用于 Mapper/DAO/Service 查询边界
- 外部适配：`gateway/`、`provider/`、`store/` 只由 owning Service 使用

## 公共接入

- profile POM 只依赖 `ruoyi-api` 和必要的 common 模块。
- `ProfileService`、`ProfileMaterialPort`、`PersonIdentityLookupService` 是跨模块合同，重构实现时保持方法、批量、锁内复核、脱敏和错误语义。
- workflow 使用 `WorkflowService` 及 `ProcessEvent` 等 API 事件；不查 workflow 内部表，不导入 Warm-Flow 服务。
- system 使用 `UserService`、`ConfigService`、`OssService`、`MessageService` 等 API；不得注入 `ISys*`、system Mapper 或 Entity。

## 交付顺序

1. 先记录 profile 当前基线、路由、API、Mapper/XML、Bean 和配置。
2. 先更新 Skill/FM 和架构测试，再迁移 person，最后迁移 enterprise。
3. 按垂直切片迁移：DAO 查询 -> Service 规则/端口 -> UseCase 编排/事务 -> Entry 切换 -> 行为回归。
4. 完成前确认 system/workflow/job/demo/ai 相对基线没有本次新增 diff。
