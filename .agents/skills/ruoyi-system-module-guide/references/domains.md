# ruoyi-system 域能力

条目描述不够明确时，按路径读取对应接口与实现，不得凭空推断。路径相对工作区，前缀 `ruoyi-vue-plus-namewta/`。未列出的方法以接口源码为准。

业务模块只使用「跨模块」列；CRUD/权限管理走 ISys* 仅限 system Controller 与 admin。

## 目录

1. [用户 / 角色 / 菜单 / 部门 / 岗位 / 权限](#用户--角色--菜单--部门--岗位--权限)
2. [客户端 / 社交 / 个人信息 / 公告](#客户端--社交--个人信息--公告)
3. [登录域（非租户）](#登录域非租户)
4. [字典 / 参数配置](#字典--参数配置)
5. [OSS / 消息](#oss--消息)
6. [监控与日志](#监控与日志)
7. [脱敏](#脱敏)

## 用户 / 角色 / 菜单 / 部门 / 岗位 / 权限

### 用户

- 跨模块：`ruoyi-api/src/main/java/org/dromara/system/api/UserService.java` → 按 ID 查账号/昵称/手机/邮箱/`UserDTO`，按角色/部门/岗位查用户。实现 `ruoyi-modules/ruoyi-system/src/main/java/org/dromara/system/service/impl/SysUserServiceImpl.java`。
- 管理面：`service/ISysUserService.java` — 分页、导入导出、注册、改密、`insertUserAuth(userId, roleIds, clientId)`（只替换该客户端显式角色；空 `roleIds` 撤销该客户端全部显式角色）。HTTP `controller/system/SysUserController.java` `/system/user`。
- 翻译样例：`ruoyi-common/ruoyi-common-translation/src/main/java/org/dromara/common/translation/core/impl/UserNameTranslationImpl.java`；`ruoyi-common/ruoyi-common-translation/src/main/java/org/dromara/common/translation/core/impl/NicknameTranslationImpl.java`。

### 角色

- 跨模块：`ruoyi-api/src/main/java/org/dromara/system/api/RoleService.java` 仅 `selectRoleNamesByIds`。实现 `service/impl/SysRoleServiceImpl.java`。
- 管理面：`service/ISysRoleService.java` — CRUD；`selectRolesByUserId(userId, clientId)` / `selectRolePermissionByUserId(userId, clientId)`；基础信息与权限分开更新（`updateRoleBaseInfo` / `updateRolePermission`）；踢在线用户 `cleanOnlineUserByRole` / `cleanOnlineUser`。HTTP `controller/system/SysRoleController.java` `/system/role`。
- 外部名称回显目前集中在 `ruoyi-modules/ruoyi-workflow/src/main/java/org/dromara/workflow/service/impl/FlwTaskAssigneeServiceImpl.java`。

### 菜单

- 无 ruoyi-api 菜单接口。菜单树与路由只在 system/admin。
- 管理面：`service/ISysMenuService.java` — `selectMenuPermsByUserId(userId, clientId)`、`selectMenuTreeByUserId(userId, clientId)`、`buildMenus`。HTTP `controller/system/SysMenuController.java` `/system/menu`。
- 权限聚合：`service/ISysPermissionService.java` 的 `getMenuPermission(userId, clientId)`；common SPI `PermissionService` 由 `service/impl/SysPermissionServiceImpl.java` 实现（超管会写入 `superadmin` / `*:*:*`，再叠加当前 Client 权限；读实现确认）。

### 部门

- 跨模块：`ruoyi-api/src/main/java/org/dromara/system/api/DeptService.java` — 部门名串、负责人 ID、部门列表、ID→名称 Map。实现 `service/impl/SysDeptServiceImpl.java`。
- 管理面：`service/ISysDeptService.java` — 树 CRUD、`checkDeptDataScope`。HTTP `controller/system/SysDeptController.java` `/system/dept`。
- 样例：`ruoyi-modules/ruoyi-workflow/src/main/java/org/dromara/workflow/rule/SpelRuleComponent.java` 调 `selectDeptLeaderById`；翻译 `ruoyi-common/ruoyi-common-translation/src/main/java/org/dromara/common/translation/core/impl/DeptNameTranslationImpl.java`。

### 岗位

- 跨模块：`ruoyi-api/src/main/java/org/dromara/system/api/PostService.java` 仅 `selectPostNamesByIds`。实现 `service/impl/SysPostServiceImpl.java`。
- 管理面：`service/ISysPostService.java` — CRUD 与用户岗位（`selectPostsByUserId` / `selectPostListByUserId`）。HTTP `controller/system/SysPostController.java` `/system/post`。

### 数据权限

- `service/ISysDataScopeService.java`：`getRoleCustom`、`getDeptAndChild`。
- 实现 `service/impl/SysDataScopeServiceImpl.java` `@Service("sdss")`。注释写明：此 Service 内不允许调用带数据权限注解的方法，否则循环解析。
- SpEL 模板 `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/enums/DataScopeType.java`。新增范围必须保持 Bean 名 `sdss`，或同步改枚举模板。

### 流程办理人

- 跨模块：`ruoyi-api/src/main/java/org/dromara/system/api/TaskAssigneeService.java`，实现 `service/impl/SysTaskAssigneeServiceImpl.java`（内部再调 ISysUser/Role/Dept/Post）。调用方 `ruoyi-modules/ruoyi-workflow/src/main/java/org/dromara/workflow/service/impl/FlwTaskAssigneeServiceImpl.java`。

## 客户端 / 社交 / 个人信息 / 公告

| 域 | 管理接口 | HTTP | 说明 |
|---|---|---|---|
| 客户端 | `service/ISysClientService.java`（`queryByClientId(String)`） | `controller/system/SysClientController.java` `/system/client` | 登录组装由 admin 使用；无 ruoyi-api ClientService |
| 社交绑定 | `service/ISysSocialService.java`（`queryListByUserId` / `selectByAuthId`） | `controller/system/SysSocialController.java` `/system/social` | admin `AuthController` / `SysLoginService` 注入 |
| 个人信息 | `ISysUserService` 的 `updateUserProfile` / `resetUserPwd` | `controller/system/SysProfileController.java` `/system/user/profile` | 当前登录用户；Controller 只注入 `ISysUserService` |
| 通知公告 | `service/ISysNoticeService.java` | `controller/system/SysNoticeController.java` `/system/notice` | Controller 同时注入 `DictService` 与 `MessageService`；`add` 成功后向在线用户广播公告摘要 |

会话踢出：`service/ClientSessionService.java`（具体类）。在线用户监控 HTTP `controller/monitor/SysUserOnlineController.java` `/monitor/online`，直连 Sa-Token/Redis，无独立 Service 字段。

## 登录域（非租户）

本 fork 无 tenant。NAMEWTA 用「登录域 UserType + Client」替代单值 `user_type` 枚举。不要把登录域写成租户。

| 能力 | 路径 |
|---|---|
| 登录域 CRUD | `service/ISysUserTypeService.java`；实现 `service/impl/SysUserTypeServiceImpl.java`；HTTP `controller/system/SysUserTypeController.java` `/system/userType` |
| 用户-登录域关系 | `service/ISysUserTypeRelService.java`（`hasUserType`、`getActiveUserType`、`coverUserTypes(userId, userTypeIds, grantSource)`、`grantUserType`） |
| 登录准入 | `service/ClientUserTypeAccessService.java` `requireLoginAccess(userId, client)`：校验客户端存在、已配 `userTypeId`、登录域启用、用户拥有该登录域。admin `service/impl/PasswordAuthStrategy.java` 等策略调用 |
| 会话模型 | `ruoyi-api/src/main/java/org/dromara/system/api/model/LoginUser.java` 持有 `userType`（登录域编码）、`userTypeId`、`clientPk` |

部分登录域文件可能不被 glob/grep 索引。描述不清时直接 Read 上列路径，不要只依赖检索。

## 字典 / 参数配置

### 字典

- 跨模块/翻译：注入 `org.dromara.common.core.service.DictService`（`ruoyi-common/ruoyi-common-core/src/main/java/org/dromara/common/core/service/DictService.java`），不是 ISysDict*。实现 `service/impl/SysDictTypeServiceImpl.java`。
- 方法：`getDictLabel` / `getDictValue`、`getAllDictByDictType`、`getDictType`、`getDictData`。
- 管理面：`service/ISysDictTypeService.java`（含 `resetDictCache`）、`ISysDictDataService.java`。HTTP `/system/dict/type`、`/system/dict/data`。
- 使用方：`ruoyi-common/ruoyi-common-translation/src/main/java/org/dromara/common/translation/core/impl/DictTypeTranslationImpl.java`；`ruoyi-common/ruoyi-common-excel/src/main/java/org/dromara/common/excel/convert/ExcelDictConvert.java`；`ruoyi-common/ruoyi-common-excel/src/main/java/org/dromara/common/excel/core/ExcelDownHandler.java`；`ruoyi-common/ruoyi-common-core/src/main/java/org/dromara/common/core/validate/dicts/DictPatternValidator.java`。

### 参数配置

- 跨模块：`ruoyi-api/src/main/java/org/dromara/system/api/ConfigService.java` — `getConfigValue` 及类型化 default 方法、`getConfigMap/ArrayMap/Object/Array`。实现 `service/impl/SysConfigServiceImpl.java`。
- 管理面：`service/ISysConfigService.java`（`selectConfigByKey`、`resetConfigCache`）。HTTP `controller/system/SysConfigController.java` `/system/config`。
- 缺口：system 外未找到 `ConfigService` 注入点。模块内导入用户用 `ISysConfigService.selectConfigByKey("sys.user.initPassword")`：`listener/SysUserImportListener.java`。

## OSS / 消息

### OSS

- 跨模块：`ruoyi-api/src/main/java/org/dromara/system/api/OssService.java` — `selectUrlByIds`、`selectByIds`。实现 `service/impl/SysOssServiceImpl.java`。翻译 `ruoyi-common/ruoyi-common-translation/src/main/java/org/dromara/common/translation/core/impl/OssUrlTranslationImpl.java`。
- 管理面：`service/ISysOssService.java` 上传下载列表；`ISysOssConfigService.java` `init()`。HTTP `/resource/oss`、`/resource/oss/config`。
- 启动：`runner/SystemApplicationRunner.java` 调 `ossConfigService.init()`。
- 配置变更：`event/OssConfigChangeEvent.java` + `listener/OssConfigChangeListener.java`，发布于 `service/impl/SysOssConfigServiceImpl.java`。

### 消息

- 跨模块：`ruoyi-api/src/main/java/org/dromara/system/api/MessageService.java`。实现 `service/impl/SysMessageServiceImpl.java`（落库 + `PushHelper`）。DTO `api/domain/PushPayloadDTO.java`。
- 管理面：`service/ISysMessageService.java` `queryMessageBox`（按系统消息、通知公告、工作流消息分类）；另有 `storeAll` / `storeUsers` 只落库。HTTP `controller/system/SysMessageController.java` `/resource/message`。
- 样例：`ruoyi-modules/ruoyi-demo/src/main/java/org/dromara/demo/controller/WebSocketController.java`；admin `AuthController` 也注入 `MessageService`；workflow `service/impl/FlwCommonServiceImpl.java` 注入 `MessageService`。

## 监控与日志

| 能力 | 路径 | 说明 |
|---|---|---|
| 在线用户 | `controller/monitor/SysUserOnlineController.java` `/monitor/online` | 无独立 Service；用 Sa-Token 与 Redis |
| 缓存监控 | `controller/monitor/CacheController.java` `/monitor/cache` | 直连 Redis（`RedissonConnectionFactory`），无 Service |
| 操作日志 | `service/ISysOperLogService.java`；HTTP `controller/monitor/SysOperlogController.java` `/monitor/operlog` | 监听 `OperLogEvent`：`service/impl/SysOperLogServiceImpl.java` `recordOper` |
| 登录日志 | `service/ISysLoginInfoService.java`；HTTP `controller/monitor/SysLoginInfoController.java` `/monitor/loginInfo` | 监听 `LoginInfoEvent`：`service/impl/SysLoginInfoServiceImpl.java` `recordLoginInfo` |

在线用户清理事件：`event/OnlineUserCleanEvent.java` + `listener/OnlineUserCleanListener.java`。发布方未在已索引源码中找到；需要踢人时可直接走 `ISysRoleService.cleanOnlineUser*`（仅 system/admin），或 `ClientSessionService` 按登录域/客户端踢 Token。

## 脱敏

- SPI：`ruoyi-common/ruoyi-common-sensitive/src/main/java/org/dromara/common/sensitive/core/SensitiveService.java` `isSensitive(roleKey[], perms[])`。
- 实现：`service/impl/SysSensitiveServiceImpl.java`。未登录返回要脱敏；角色与权限同时配置时需两者都命中才不脱敏；超管（`LoginHelper.isSuperAdmin()`）不脱敏。
- 业务模块不要直接注入该实现；走 common-sensitive 注解链路。
