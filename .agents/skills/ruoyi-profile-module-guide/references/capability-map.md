# Profile capability map

## Modules

- `ruoyi-profile` 是聚合 POM，包含 `ruoyi-profile-person`、`ruoyi-profile-enterprise` 和 BOM。
- person 拥有个人申请、认证、材料、档案投影、重新绑定和通知。
- enterprise 拥有企业申请、认证、材料、档案投影和转移。
- enterprise transfer 只能通过 `ruoyi-api` 的 `PersonIdentityLookupService` 查个人精确匹配，不读取 person 实现或数据库。

## Public contracts

- `org.dromara.profile.api.ProfileService`
- `org.dromara.profile.api.ProfileProjectionContributor`
- `org.dromara.profile.api.material.ProfileMaterialPort`
- `org.dromara.profile.api.person.PersonIdentityLookupService`

重构只能替换实现内部结构；方法、返回字段、批量语义、锁内复核和敏感字段最小化保持不变。

## External contracts

- system：`org.dromara.system.api.UserService`、`ConfigService`、`OssService`、`MessageService` 及 common SPI。
- workflow：`org.dromara.workflow.api.WorkflowService`、`ProcessEvent`、`ProcessTaskEvent`、`ProcessDeleteEvent`。
- Redis challenge：`EnterpriseTransferChallengeStore` 是 Store，不是 DAO；实现不得调用 Mapper。
- verification：`<Person|Enterprise>VerificationProvider` 只负责 provider 认证和规范化证据，不直接发布档案或修改绑定。

## Entry surfaces

- `controller/admin`：登录管理端。
- `controller/self`：已登录自服务。
- `controller/anonymous`：回调/公网入口，保留 `@SaIgnore`、签名、nonce、重放、幂等、限流和审计。
- Listener 和公共 API Adapter 同样走 UseCase，不直接调用 Service/DAO。

