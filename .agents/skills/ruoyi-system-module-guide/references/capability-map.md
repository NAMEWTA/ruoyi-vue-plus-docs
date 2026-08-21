# ruoyi-system 调用面与事件

条目描述不够明确时，按路径读取源码，不得凭空推断。路径相对工作区，前缀 `ruoyi-vue-plus-namewta/`。

## 目录

1. [模块位置](#模块位置)
2. [稳定跨模块 API（ruoyi-api）](#稳定跨模块-apiruoyi-api)
3. [模块内 ISys*（仅 system / admin）](#模块内-isys仅-system--admin)
4. [common SPI（system 实现）](#common-spisystem-实现)
5. [HTTP 管理面（仅前端）](#http-管理面仅前端)
6. [事件 / 监听器 / Runner](#事件--监听器--runner)
7. [非稳定面](#非稳定面)

## 模块位置

| 项 | 路径 / 事实 |
|---|---|
| Maven 模块 | `ruoyi-modules/ruoyi-system/pom.xml`（`org.dromara:ruoyi-system`，父模块 `ruoyi-modules`） |
| 直接 POM 依赖方 | 仅 `ruoyi-admin/pom.xml` 声明 `ruoyi-system` |
| 自身依赖 | 仅 common 能力 + `ruoyi-api`，见 `ruoyi-modules/ruoyi-system/pom.xml`：`ruoyi-common-core`、`ruoyi-api`、`ruoyi-common-doc`、`ruoyi-common-mybatis`、`ruoyi-common-translation`、`ruoyi-common-oss`、`ruoyi-common-log`、`ruoyi-common-excel`、`ruoyi-common-sms`、`ruoyi-common-security`、`ruoyi-common-web`、`ruoyi-common-sensitive`、`ruoyi-common-encrypt`、`ruoyi-common-push` |
| 包根 | `ruoyi-modules/ruoyi-system/src/main/java/org/dromara/system/`：`controller/system`、`controller/monitor`、`service`、`service/impl`、`domain`、`domain/bo`、`domain/vo`、`domain/constant`、`mapper`、`event`、`listener`、`runner` |
| Mapper XML | `ruoyi-modules/ruoyi-system/src/main/resources/mapper/system/` |
| 租户 | 无 `tenant` 包或类 |

其他业务模块 POM 不要依赖 `ruoyi-system` 来换取上列 common 能力。

## 稳定跨模块 API（ruoyi-api）

接口在 `ruoyi-api/src/main/java/org/dromara/system/api/`。system 实现类同时实现模块内 `I*Service` 与 api 接口（`TaskAssigneeService` 例外：只实现 api）。调用方式：同一 JVM Spring 注入，无 `@Dubbo` / `@FeignClient`。

| 接口 | 实现 | 方法（以接口为准） |
|---|---|---|
| `UserService.java` | `ruoyi-modules/ruoyi-system/src/main/java/org/dromara/system/service/impl/SysUserServiceImpl.java`（`implements ISysUserService, UserService`） | `selectUserNameById(Long)` / `selectNicknameById(Long)` / `selectPhonenumberById(Long)` / `selectEmailById(Long)` → `String`；`selectNicknameByIds(String)` 逗号分隔 ID → 昵称串；`selectById(Long)` → `UserDTO`；`selectListByIds(Collection<Long>)` → `List<UserDTO>`；`selectUserIdsByRoleIds` → `List<Long>`；`selectUsersByRoleIds` / `selectUsersByDeptIds` / `selectUsersByPostIds` → `List<UserDTO>`；`selectUserNicksByIds` → `Map<Long,String>` |
| `DeptService.java` | `service/impl/SysDeptServiceImpl.java`（`implements ISysDeptService, DeptService`） | `selectDeptNameByIds(String)` 逗号分隔 ID → 名称串；`selectDeptLeaderById(Long)` → 负责人用户 ID；`selectDeptsByList()` → `List<DeptDTO>`；`selectDeptNamesByIds` → `Map<Long,String>` |
| `RoleService.java` | `service/impl/SysRoleServiceImpl.java`（`implements ISysRoleService, RoleService`） | 仅 `selectRoleNamesByIds(Collection<Long>)` → `Map<Long,String>` |
| `PostService.java` | `service/impl/SysPostServiceImpl.java`（`implements ISysPostService, PostService`） | 仅 `selectPostNamesByIds(Collection<Long>)` → `Map<Long,String>` |
| `ConfigService.java` | `service/impl/SysConfigServiceImpl.java`（`implements ISysConfigService, ConfigService`） | `getConfigValue(String)`；接口 default：`getConfigBool/Int/Long/Decimal`；`getConfigMap` → Hutool `Dict`；`getConfigArrayMap` → `List<Dict>`；`getConfigObject(key, Class)`；`getConfigArray(key, Class)`。system 外注入点未找到。 |
| `OssService.java` | `service/impl/SysOssServiceImpl.java`（`implements ISysOssService, OssService`） | `selectUrlByIds(String)` 逗号分隔 ossId → url 串；`selectByIds(String)` → `List<OssDTO>` |
| `MessageService.java` | `service/impl/SysMessageServiceImpl.java`（`implements ISysMessageService, MessageService`） | `sendMessage(userId, text\|payload)` 指定用户；`sendMessage(text\|payload)` 广播；`publishMessage(List<Long>, PushPayloadDTO)`；`publishAll(text\|payload)` |
| `TaskAssigneeService.java` | `service/impl/SysTaskAssigneeServiceImpl.java`（只实现 api，不实现 `ISys*`） | `selectRoles/Posts/Depts/UsersByTaskAssigneeList(TaskAssigneeBody)` → `TaskAssigneeDTO` |

配套类型：

- DTO：`ruoyi-api/src/main/java/org/dromara/system/api/domain/` — `UserDTO`、`DeptDTO`、`RoleDTO`、`PostDTO`、`OssDTO`、`TaskAssigneeDTO`、`PushPayloadDTO`、`UserOnlineDTO`
- 模型：`ruoyi-api/src/main/java/org/dromara/system/api/model/` — `LoginUser`（含 `userType` / `userTypeId` / `clientPk`）、`XcxLoginUser`、`PasswordLoginBody`、`SmsLoginBody`、`EmailLoginBody`、`SocialLoginBody`、`XcxLoginBody`、`RegisterBody`、`TaskAssigneeBody`

## 模块内 ISys*（仅 system / admin）

路径：`ruoyi-modules/ruoyi-system/src/main/java/org/dromara/system/service/`。主要供 system Controller 与 `ruoyi-admin` 登录链路使用，不是 workflow/demo 等业务模块的稳定合同。未列出的方法以接口源码为准。

| 接口 | 职责要点 |
|---|---|
| `ISysUserService.java` | 分页 `selectPageUserList`；导出 `selectUserExportList`；已/未分配角色用户 `selectAllocatedList` / `selectUnallocatedList`；按用户名/手机/ID 查；唯一性校验；`insertUser` / `registerUser` / `updateUser`；按客户端授权角色 `insertUserAuth(userId, roleIds, clientId)`（只替换该客户端显式角色）；`updateUserProfile` / `resetUserPwd` / `updateUserStatus` |
| `ISysRoleService.java` | 角色 CRUD；`selectRolesByUserId(userId, clientId)` / `selectRolePermissionByUserId(userId, clientId)`；`updateRoleBaseInfo` 与 `updateRolePermission` 分开；踢在线用户 `cleanOnlineUserByRole(Long)` / `cleanOnlineUser(Collection<Long>)` |
| `ISysMenuService.java` | `selectMenuPermsByUserId(userId, clientId)`；`selectMenuTreeByUserId(userId, clientId)`；`buildMenus(List<SysMenu>)` → `List<RouterVo>` |
| `ISysDeptService.java` | 部门树 CRUD；`checkDeptDataScope(Long)` |
| `ISysDictTypeService.java` | 字典类型 CRUD；`selectDictDataByType`；`resetDictCache()`（缓存重置只在此接口） |
| `ISysDictDataService.java` | 字典数据 CRUD；`selectDictLabel(dictType, dictValue)`；无 `resetDictCache` |
| `ISysConfigService.java` | 参数 CRUD、`selectConfigByKey`、`resetConfigCache` |
| `ISysOssService.java` | `queryPageList`、`listByIds`、`getById`、`upload(MultipartFile\|File, SysOssExt)`、`download`、`deleteWithValidByIds` |
| `ISysOssConfigService.java` | 配置 CRUD；启动 `init()`；`updateOssConfigStatus` |
| `ISysNoticeService.java` | 通知公告 CRUD：`selectPageNoticeList` / `insertNotice` / `updateNotice` / `deleteNoticeByIds` |
| `ISysPostService.java` | 岗位 CRUD；`selectPostsByUserId` / `selectPostListByUserId` |
| `ISysClientService.java` | 客户端 CRUD、`queryByClientId(String)` |
| `ISysSocialService.java` | 社交绑定：`queryListByUserId` / `selectByAuthId` / `insertByBo` |
| `ISysPermissionService.java` | `getRolePermission(userId, clientId)` / `getMenuPermission(userId, clientId)`、`getDataScopeRoleMap(List<RoleDTO>)` |
| `ISysDataScopeService.java` | `getRoleCustom(roleId)` / `getDeptAndChild(deptId)` → 逗号分隔部门 id 串 |
| `ISysMessageService.java` | 与 api `MessageService` 同名推送方法，另加 `queryMessageBox(userId)`、`storeAll` / `storeUsers`（落库） |
| `ISysOperLogService.java` | 操作日志分页/清空；落库入口是实现类的 `@EventListener recordOper` |
| `ISysLoginInfoService.java` | 登录日志分页/清空；落库入口是实现类的 `@EventListener recordLoginInfo` |
| `ISysUserTypeService.java` | 登录域 CRUD：`queryById` / `queryByCode` / `insertByBo` / `updateByBo` / `optionselect`。实现 `service/impl/SysUserTypeServiceImpl.java` |
| `ISysUserTypeRelService.java` | 用户-登录域：`hasUserType`、`getActiveUserType`、`coverUserTypes`、`grantUserType`、`deleteByUserIds` |

无 `I*` 前缀的内部服务（具体类，跨模块引用会硬耦合 system 实现）：

- `service/ClientSessionService.java`：`kickoutUserType(userId, userTypeCode)`（userId 可空则踢该登录域全部 Token）、`kickoutClient(clientId)`、`kickoutUserClient(userId, clientId)`
- `service/ClientUserTypeAccessService.java`：`requireLoginAccess(userId, SysClientVo)` → 活动 `SysUserTypeVo`；客户端未配登录域、登录域停用、用户无该登录域时抛 `ServiceException`

## common SPI（system 实现）

这些不是 `ruoyi-api`，但由 system 实现、供 common 层调用：

| SPI | 声明 | 实现 |
|---|---|---|
| `DictService` | `ruoyi-common/ruoyi-common-core/src/main/java/org/dromara/common/core/service/DictService.java` | `service/impl/SysDictTypeServiceImpl.java`（`implements ISysDictTypeService, DictService`）。方法：`getDictLabel` / `getDictValue`（含分隔符重载）、`getAllDictByDictType`、`getDictType`、`getDictData` |
| `PermissionService` | `ruoyi-common/ruoyi-common-core/src/main/java/org/dromara/common/core/service/PermissionService.java` | `service/impl/SysPermissionServiceImpl.java`（`implements ISysPermissionService, PermissionService`）。方法：`getRolePermission(userId, clientId)`、`getMenuPermission(userId, clientId)` |
| `SensitiveService` | `ruoyi-common/ruoyi-common-sensitive/src/main/java/org/dromara/common/sensitive/core/SensitiveService.java` | `service/impl/SysSensitiveServiceImpl.java`。`isSensitive(roleKey[], perms[])`：未登录要脱敏；角色/权限命中或超管则不脱敏 |

字典校验：`ruoyi-common/ruoyi-common-core/src/main/java/org/dromara/common/core/validate/dicts/DictPatternValidator.java` 经 `SpringUtils.getBean(DictService.class).getDictLabel(...)` 判断值是否合法。注解 `DictPattern.java` 同目录。

数据权限：`service/impl/SysDataScopeServiceImpl.java` 以 `@Service("sdss")` 注册。`ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/enums/DataScopeType.java` 的 SpEL：

- `CUSTOM`：`#{@sdss.getRoleCustom(#roleId)}`
- `DEPT_AND_CHILD` / `DEPT_AND_CHILD_OR_SELF`：`#{@sdss.getDeptAndChild(#user.deptId)}`

改 Bean 名会静默破坏数据权限 SQL。

## HTTP 管理面（仅前端）

认证登录不在 system，而在 `ruoyi-admin/src/main/java/org/dromara/web/controller/AuthController.java`（`@RequestMapping("/auth")`）。未逐方法枚举全部 REST 动作。

| 前缀 | Controller | 路径 |
|---|---|---|
| `/system/user` | `SysUserController` | `controller/system/SysUserController.java` |
| `/system/user/profile` | `SysProfileController` | `controller/system/SysProfileController.java`（注入 `ISysUserService`） |
| `/system/role` | `SysRoleController` | `controller/system/SysRoleController.java` |
| `/system/menu` | `SysMenuController` | `controller/system/SysMenuController.java` |
| `/system/dept` | `SysDeptController` | `controller/system/SysDeptController.java` |
| `/system/dict/type` | `SysDictTypeController` | `controller/system/SysDictTypeController.java` |
| `/system/dict/data` | `SysDictDataController` | `controller/system/SysDictDataController.java` |
| `/system/config` | `SysConfigController` | `controller/system/SysConfigController.java` |
| `/system/post` | `SysPostController` | `controller/system/SysPostController.java` |
| `/system/client` | `SysClientController` | `controller/system/SysClientController.java` |
| `/system/social` | `SysSocialController` | `controller/system/SysSocialController.java` |
| `/system/notice` | `SysNoticeController` | `controller/system/SysNoticeController.java`（同时注入 `DictService` 与 `MessageService`，新增公告后广播） |
| `/system/userType` | `SysUserTypeController` | `controller/system/SysUserTypeController.java` |
| `/resource/oss` | `SysOssController` | `controller/system/SysOssController.java` |
| `/resource/oss/config` | `SysOssConfigController` | `controller/system/SysOssConfigController.java` |
| `/resource/message` | `SysMessageController` | `controller/system/SysMessageController.java` |
| `/monitor/online` | `SysUserOnlineController` | `controller/monitor/SysUserOnlineController.java`（无 Service 字段；用 Sa-Token `StpUtil` 与 Redis） |
| `/monitor/loginInfo` | `SysLoginInfoController` | `controller/monitor/SysLoginInfoController.java` |
| `/monitor/operlog` | `SysOperlogController` | `controller/monitor/SysOperlogController.java` |
| `/monitor/cache` | `CacheController` | `controller/monitor/CacheController.java`（注入 `RedissonConnectionFactory`，直连 Redis，无 Service） |

## 事件 / 监听器 / Runner

| 类型 | 路径 | 行为 |
|---|---|---|
| `OssConfigChangeEvent` | `event/OssConfigChangeEvent.java` | record；工厂 `save/remove/useDefault`。由 `service/impl/SysOssConfigServiceImpl.java` `publishEvent` |
| `OssConfigChangeListener` | `listener/OssConfigChangeListener.java` | `@TransactionalEventListener(AFTER_COMMIT, fallbackExecution=true)` 的 `refreshOssConfig`：刷新 OSS 缓存与 `OssFactory` |
| `OnlineUserCleanEvent` | `event/OnlineUserCleanEvent.java` | record；工厂 `byRole/byUsers`。已索引源码中无 `publishEvent`（工厂方法本身不算发布） |
| `OnlineUserCleanListener` | `listener/OnlineUserCleanListener.java` | `@Async @TransactionalEventListener(AFTER_COMMIT, fallbackExecution=true)` 调 `ISysRoleService.cleanOnlineUser*` |
| `OperLogEvent` | 定义 `ruoyi-common/ruoyi-common-log/src/main/java/org/dromara/common/log/event/OperLogEvent.java`；发布 `ruoyi-common/ruoyi-common-log/src/main/java/org/dromara/common/log/aspect/LogAspect.java`；落库 `service/impl/SysOperLogServiceImpl.java` 的 `recordOper`（`@Async @EventListener`） | 操作日志 |
| `LoginInfoEvent` | 定义 `ruoyi-common/ruoyi-common-log/src/main/java/org/dromara/common/log/event/LoginInfoEvent.java`；由 `ruoyi-admin/src/main/java/org/dromara/web/service/SysLoginService.java`、`SysRegisterService.java` 发布；落库 `service/impl/SysLoginInfoServiceImpl.java` 的 `recordLoginInfo`（`@Async @EventListener`） | 登录日志 |
| `SystemApplicationRunner` | `runner/SystemApplicationRunner.java` | `ApplicationRunner`；启动时 `ossConfigService.init()` |
| 非 Spring 事件 | `listener/SysUserImportListener.java`（Excel `AnalysisEventListener`，内部用 `ISysConfigService.selectConfigByKey("sys.user.initPassword")`）；`listener/DeptExcelConverter.java` | 不要当领域事件 |

## 非稳定面

禁止新业务模块依赖：全部 `controller.*`、`service.impl.*`、`mapper.*`、`resources/mapper/system/*.xml`、`domain`/`bo`/`vo`、`ClientSessionService`、`ClientUserTypeAccessService`、`CacheController`、Excel listener/converter。
