---
name: NAMEWTA 多 APP 权限改造
overview: 在 ruoyi-vue-plus-docs 父仓库的两个 submodule 上,把 RuoYi-Vue-Plus 的固定 UserType 枚举改造为数据库驱动的登录域,并把角色、菜单、注册策略下沉到 Client 维度,同时建立可长期跟随上游的分支与文档体系。
todos:
  - id: git-baseline
    content: 两个 submodule 配置 upstream remote、rerere,把 6.X / 6.X-Vue 对齐为上游纯镜像,main 保持产品分支,打基线标签;GitHub 保护镜像分支
    status: completed
  - id: sql-scripts
    content: 编写 script/sql/namewta/ 下的 001_user_type.sql、002_client_rbac.sql、003_initial_data.sql 与 README(仅 MySQL),不修改上游 ry_vue.sql
    status: completed
  - id: be-usertype-model
    content: 阶段1:新增 SysUserType / SysUserTypeRel 的 domain/bo/vo/mapper/service/controller
    status: completed
  - id: be-remove-enum
    content: 阶段2:删除 UserType 枚举与各处 userType 字段(排除 ruoyi-workflow 的 warm-flow 同名枚举),清理 ParamUnitTest
    status: completed
  - id: be-client
    content: 阶段3:SysClient 增加 userTypeId / registerEnabled / defaultRoleId 及校验与 Token 清理
    status: completed
  - id: be-role
    content: 阶段4:角色 Client 化,查询签名改为带 clientId,取消单参重载,处理 SysUserController 未过滤的角色列表
    status: completed
  - id: be-menu
    content: 阶段5:菜单与动态路由 Client 化,含 SysMenuServiceImpl 两处超管旁路与 roleMenuTreeselect
    status: completed
  - id: be-permission
    content: 阶段6:LoginUser 增 userTypeId/clientPk,buildLoginUser 吸收 clientKey/deviceType,权限接口改 userId+clientId,SaPermissionImpl 去除全局兜底
    status: completed
  - id: be-login
    content: 阶段7:新增 ClientUserTypeAccessService,五个 AuthStrategy 统一接入登录准入
    status: completed
  - id: be-register
    content: 阶段8:删除全局注册开关,新增 GET /auth/client/context,注册改为 Client 策略驱动并同事务写 rel
    status: completed
  - id: be-user-mgmt
    content: 阶段9-10:用户管理登录域授权(同事务)与 Client 默认角色生效逻辑
    status: completed
  - id: be-session
    content: 阶段11:ClientSessionService 与各变更点的 Token 清理触发
    status: completed
  - id: fe-usertype-page
    content: 阶段12:前端新增 userType 管理 API 与页面
    status: completed
  - id: fe-client-page
    content: 阶段13:Client 管理页增加登录域、注册开关、默认角色
    status: completed
  - id: fe-role-menu
    content: 阶段14-15:角色与菜单管理 Client 化,建立 src/views/business/ 四个 APP 目录
    status: completed
  - id: fe-user-page
    content: 阶段16:用户管理登录域多选与按 Client 分组的角色分配
    status: completed
  - id: fe-auth
    content: 阶段17-18:登录/注册页接入 client context,删除前端 userType,动态路由不做前端过滤
    status: completed
  - id: verify
    content: 全新数据库初始化 + 后端打包 + 前端 lint/build + 走完人工验收矩阵
    status: completed
  - id: docs-tag
    content: 父仓库补 docs/upstream/customization-map.md,提交 submodule 指针,打第一个 NAMEWTA 产品标签
    status: completed
isProject: false
---

ും# NAMEWTA 多 APP 登录域与 Client 级 RBAC 改造(定稿）

## 0. 相对原计划的关键修正

原计划的技术目标和阶段划分全部保留,以下几点按仓库实际情况修正:

- 后端仓库名是 `ruoyi-vue-plus-namewta`(全小写),不是 `RuoYi-Vue-Plus-namewta`,原计划的 clone 命令不可用。
- 已存在父仓库 [ruoyi-vue-plus-docs](README.md),通过 submodule 聚合前后端。原计划"不引入 submodule"作废,改为保留并利用它承载跨仓库文档与里程碑指针。
- 两个子仓库的 `main` 与 `6.X`/`6.X-Vue` 指向同一 commit 且均已推到 origin。定为:`main` = 产品主分支(已是默认分支,无需改动),`6.X`/`6.X-Vue` = 上游纯镜像。不再新建 `namewta/*` 分支。
- 两个 fork 目前与上游 **完全一致**(后端 `a16f249` = `dromara/RuoYi-Vue-Plus@6.X`,前端 `0870ce1` = `CrazyLionCat/plus-ui@6.X-Vue`),零分叉,镜像分支建立是 no-op。
- DDL 只维护 MySQL(`script/sql/ry_vue.sql` 对应体系),postgres/oracle/sqlserver 三套不同步。
- 权限查询 **不在 XML 里**。`SysRoleMapper.xml`/`SysMenuMapper.xml` 是空壳,真实实现是 mapper 接口里的 MPJ `default` 方法。改造面比原计划小,但集中在 [SysMenuMapper.java](ruoyi-vue-plus-namewta/ruoyi-modules/ruoyi-system/src/main/java/org/dromara/system/mapper/SysMenuMapper.java) 和 `SysRoleMapper.java`。
- `ruoyi-workflow` 里的 `UserType` 是 warm-flow 第三方枚举(`org.dromara.warm.flow.core.enums.UserType`),**禁止**被全局清理误伤。
- 前端没有 `VITE_APP_THEME`,实际是 `VITE_APP_TITLE` / `VITE_APP_LOGO_TITLE`;多 APP 部署变量清单按实际改写。
- 前端 `userType` 全仓库只有 3 处引用,改造量极小。

---

## 1. 事实基线(已核实)

后端关键落点:

- `UserType` 枚举: `ruoyi-common/ruoyi-common-core/.../enums/UserType.java`,仅 `sys_user`/`app_user`,用 `StringUtils.contains` 解析。
- `LoginUser` 在 `ruoyi-api/.../system/api/model/LoginUser.java`,已有 `userType`、`clientKey`、`deviceType`,`getLoginId()` 返回 `userType + ":" + userId`。
- `buildLoginUser(user)` 在 `SysLoginService` 只设 `userType`,**不设** `clientKey`/`deviceType`——这两行分散在 5 个 `*AuthStrategy` 里。
- Sa-Token extra 的唯一写入点是 `IAuthStrategy.buildLoginParameter(client)`,已写入 `clientid`/`clientAccessPath`/`clientIpWhitelist`。
- `SecurityConfig` 已校验请求头/参数的 `clientid` 与 token extra 一致,可直接复用为跨 Client 越权的第一道闸。
- 超管旁路有两处必须 Client 化:`SysPermissionServiceImpl` 返回 `*:*:*`,`SysMenuServiceImpl.selectMenuTreeByUserId` 走 `selectMenuTreeAll()`。
- `sys.account.registerUser` 默认值为 `false`,由 `SysConfigServiceImpl.selectRegisterEnabled()` 读取。

前端关键落点:

- pnpm@10.34.5 + oxlint/oxfmt,脚本 `dev`/`lint`/`fmt`/`build:prod` 齐备。
- `clientId` 来源:`src/api/login.ts` 读 `import.meta.env.VITE_APP_CLIENT_ID` 注入登录体;`src/utils/request.ts` 另设 `axios.defaults.headers['clientid']`。
- `userType` 仅出现在 `src/api/types.ts`(RegisterForm)、`src/api/system/user/types.ts`(UserVO)、`src/views/register.vue`(硬编码 `'sys_user'`)。
- 无 `src/views/business/`;`auto-imports.d.ts`/`components.d.ts` 已 gitignore,不会产生冲突。

---

## 2. 数据模型(冻结)

```text
sys_user                唯一用户实体(删除 user_type 列)
sys_user_type           动态登录域定义
sys_user_type_rel       用户拥有哪些登录域
sys_client.user_type_id 本 APP 要求的登录域
sys_client.register_enabled  本 APP 是否开放公开注册
sys_client.default_role_id   本 APP 的默认角色
sys_role.client_id      角色归属 APP
sys_menu.client_id      菜单/动态路由归属 APP
当前登录权限 = userId + activeUserType + clientId
```

不引入 `appCode`/`domainCode`/`sys_user.user_type` JSON/旧枚举兼容/双开关/userId-only 兜底。

SQL 采用旁路文件,**不改上游 `ry_vue.sql`**:

```text
ruoyi-vue-plus-namewta/script/sql/namewta/
├── 001_user_type.sql      建 sys_user_type / sys_user_type_rel,DROP sys_user.user_type
├── 002_client_rbac.sql    sys_client 三列 + sys_role.client_id + sys_menu.client_id
├── 003_initial_data.sql   两个登录域、四个 Client、菜单/角色 client_id 回填
└── README.md              执行顺序
```

`003` 内用 `DELETE FROM sys_config WHERE config_key = 'sys.account.registerUser';` 清理旧全局开关,而不是去编辑上游文件。初始化顺序:`ry_vue.sql` → `001` → `002` → `003`。

---

## 3. Git 与 submodule 工作流

一次性初始化(两个子仓库各做一遍):

```bash
cd ruoyi-vue-plus-namewta
git remote add upstream https://github.com/dromara/RuoYi-Vue-Plus.git
git fetch upstream --prune
git switch 6.X && git merge --ff-only upstream/6.X && git push origin 6.X
git switch main
git config rerere.enabled true && git config rerere.autoupdate false
git tag namewta-base-upstream-6x && git push origin namewta-base-upstream-6x
```

前端同理,upstream 为 `https://github.com/CrazyLionCat/plus-ui.git`,镜像分支 `6.X-Vue`,标签 `namewta-base-upstream-6x-vue`。

GitHub 侧:保护 `6.X` / `6.X-Vue` 禁止业务提交;`main` 保持默认分支。

父仓库配套:每完成一个里程碑,在 `ruoyi-vue-plus-docs` 提一次 submodule 指针 bump,提交信息形如 `chore(submodule): bump backend to <阶段名>`,让父仓库成为可回溯的联调快照。

后续每次同步上游:

```bash
git fetch upstream --prune
git switch 6.X && git merge --ff-only upstream/6.X && git push origin 6.X
git switch main && git switch -c sync/upstream-YYYYMMDD
git merge --no-ff 6.X    # 解冲突 → 编译 → 人工验证 → PR 合回 main
```

产品分支只 merge 不 rebase;镜像分支只允许 fast-forward;未共享的 feature 分支可 rebase。前后端使用同一同步编号。

---

## 4. 硬性约束

- 不做兼容层:直接删列、删枚举、改接口签名、改前端模型,不留废弃字段、不双写、不加 Feature Flag、不写迁移器。
- 不做模糊兜底:Client 不存在/停用、Client 无登录域、登录域停用、用户无对应登录域、缺 `clientPk`、角色跨 Client、菜单跨 Client、无 Client 上下文查路由——一律拒绝。尤其禁止 `SaPermissionImpl` 退回 `getPermission(userId)` 查全局权限,无 Token 上下文时返回空权限。
- 复用现有栈:Entity/BO/VO、`BaseMapperPlus`、MyBatis-Plus/MPJ、MapStruct Plus、Spring Cache、`@SaCheckPermission`、`@Log`、`@RepeatSubmit`、现有 Token Session 与 Client 缓存、前端现有 API/Store/动态路由/oxlint。不新增 ORM、权限框架、状态库、UI 库、任何依赖,不动 `pnpm-lock.yaml`。
- 不写测试代码,但每阶段必须过:后端 `./mvnw clean package`、前端 `pnpm lint` + `pnpm build:prod`、数据库全新初始化、人工场景验证。
- 不移动上游文件、不全仓库格式化(只格式化改动文件)、不重命名仍合理的字段(保留 `LoginUser.userType`/`clientKey`,只新增 `userTypeId`/`clientPk`)。

---

## 5. 后端实施

### 阶段 1 — UserType 持久化模型

在 `ruoyi-modules/ruoyi-system/.../system/` 下新增 `SysUserType`/`SysUserTypeRel` 的 domain、bo、vo、mapper、service、impl,以及 `controller/system/SysUserTypeController.java`。

范围:分页、下拉、新增、改名/状态/排序/备注、编码创建后只读、未被引用才可删、用户登录域查询/覆盖更新/是否拥有。授权来源用 Java 常量(`SELF_REGISTER`/`ADMIN_CREATE`/`ADMIN_GRANT`/`SYSTEM_INIT`)。不做类型继承/树/优先级/表达式/配置 JSON。

### 阶段 2 — 删除旧 UserType 模型

删除 `enums/UserType.java`;清理 `SysUser.userType`、`SysUserBo.userType`、`SysUserVo.userType`、`ProfileUserVo.userType`、`UserDTO.userType`(ruoyi-api)、`RegisterBody.userType`;`SysUserServiceImpl` 导入导出列清单(约 652/674 行)去掉 `SysUser::getUserType`;`LoginHelper.getUserType()` 改为从 token extra 读字符串;清理 `ParamUnitTest.java` 中的 `@EnumSource(UserType.class)` 用例。

排查命令(注意排除 workflow 的 warm-flow 枚举):

```bash
rg "UserType|userType" --glob '!**/ruoyi-workflow/**'
```

### 阶段 3 — 扩展 Client

`SysClient`/`Bo`/`Vo`/`Service`/`Impl`/`Controller` 增加 `userTypeId`、`registerEnabled`、`defaultRoleId`;VO 增只读的 `userTypeCode`/`userTypeName`/`defaultRoleName`。

校验:`userTypeId` 必须存在且启用;`defaultRoleId` 非空时必须存在、启用且属于本 Client;改 `userTypeId` 或停用 Client 需清空该 Client 全部在线 Token;改 `registerEnabled` 不清 Token。

### 阶段 4 — 角色 Client 化

`SysRole` 系列加 `clientId`。查询入口全部改签名:`selectRolesByUserId(userId, clientId)`、`selectRolePermissionByUserId(userId, clientId)`、`selectRoleList(clientId, ...)`,**不保留** 单参重载。

规则:`role_key` 改为 Client 内唯一;角色创建后 `client_id` 只读;用户不具备该 Client 登录域时拒绝分配其角色;菜单树只返回同 Client 菜单。同步处理 `SysUserController.getInfo`/`authRole` 中未过滤 Client 的 `selectRoleList`。

### 阶段 5 — 菜单与动态路由 Client 化

`SysMenu` 系列加 `clientId`,mapper `default` 方法改为 `selectMenuTreeByUserId(userId, clientId)`、`selectMenuListByRoleId(roleId, clientId)`、`selectMenuTreeAll(clientId)`、`selectMenuPermsByUserId(userId, clientId)`。

两处超管旁路必须 Client 化:`SysMenuServiceImpl.selectMenuTreeByUserId` 与 `selectMenuList` 的 `isSuperAdmin` 分支改为查当前 Client 全量菜单,**不返回跨 Client 并集**。`SysMenuController.roleMenuTreeselect` 按角色所属 Client 加载。

规则:父子菜单同 Client;菜单创建后 Client 只读;路由名与同级路径改为 Client 内唯一。

`getRouters` 改为:

```java
LoginUser loginUser = LoginHelper.getLoginUser();
List<SysMenu> menus = menuService.selectMenuTreeByUserId(
    loginUser.getUserId(), loginUser.getClientPk());
return R.ok(menuService.buildMenus(menus));
```

### 阶段 6 — 权限服务改造

`PermissionService`/`ISysPermissionService` 改为 `getMenuPermission(userId, clientId)`、`getRolePermission(userId, clientId)`;`SysPermissionServiceImpl` 的超管分支仍可返回 `*:*:*`,但角色/菜单加载与 `getDataScopeRoleMap` 均按 Client 收敛。

`LoginUser` 新增 `userTypeId`、`clientPk`,保留 `userType`/`clientKey`/`deviceType` 原名。`LoginHelper` 新增 `CLIENT_PK_KEY`,在 `IAuthStrategy.buildLoginParameter(client)` 这一唯一入口写入 extra——五个策略零改动即可获得 clientPk 上下文。

`buildLoginUser` 改签名并 **吸收** 目前散落在 5 个策略里的 `setClientKey`/`setDeviceType`:

```java
public LoginUser buildLoginUser(SysUserVo user, SysClientVo client, SysUserTypeVo activeUserType)
```

这样每个 `*AuthStrategy` 的 diff 从"改 1 行 + 留 2 行"缩成"改 1 行 + 删 2 行",显著降低未来上游冲突面。

`SaPermissionImpl` 去掉 `resolveUserId` + 全局权限兜底:有 Token 上下文就用快照,没有就返回空集合。离线场景显式调用 `permissionService.getMenuPermission(userId, clientId)`。

### 阶段 7 — 登录准入

新增 `ClientUserTypeAccessService`,单一职责:

```java
SysUserTypeVo requireLoginAccess(Long userId, SysClientVo client);
```

流程:Client 有 `userTypeId` → 登录域正常 → 用户存在正常的 `sys_user_type_rel` → 返回活动登录域。`AuthController` 现有的 Client 查询与 grantType 校验直接复用,不动。五个策略(`Password`/`Sms`/`Email`/`Social`/`Xcx`)在各自凭据认证后统一调用该服务再 `buildLoginUser`,不允许只改密码登录。

### 阶段 8 — 注册改造

删除 `sys.account.registerUser`、`ISysConfigService.selectRegisterEnabled()`、其实现及 `AuthController` 的 `configService` 依赖。

新增 `GET /auth/client/context`,只返回 `{ clientEnabled, registerEnabled }`,严禁泄露 `clientSecret`/IP 白名单/`accessPath`/超时策略。

注册流程:按 `RegisterBody.clientId` 查 Client → Client 正常 → `registerEnabled` 开启 → 登录域正常 → 验证码 → 用户名/手机/邮箱唯一性 → 同事务创建 `sys_user` + `sys_user_type_rel`。`RegisterBody` 删除 `userType`(它继承 `LoginBody`,`clientId` 天然具备),授予的登录域只能来自 `client.userTypeId`。已存在账号一律提示"请登录",**绝不**自动追加登录域。

### 阶段 9 — 用户管理

用户接口与表单增加 `userTypeIds`/`userTypeCodes`/`userTypeNames`。新增用户 = 建 `sys_user` + 批量建 rel + 分配角色;编辑 = 更新 user + 覆盖 rel + 更新角色,必须同事务。分配角色时若用户不具备该角色 Client 要求的登录域,直接拒绝,不做隐式授权。

### 阶段 10 — 默认角色

有效角色 = 当前 Client 的 `default_role_id` + 用户在当前 Client 的显式角色。默认角色必须属于本 Client、只给基础页面、**不写入** `sys_user_role`;管理后台可不配。这样新增第四个 APP_USER Client 时只需建 Client、关联登录域、配默认角色和菜单,历史用户无需批量补角色。

### 阶段 11 — 会话失效

新增 `ClientSessionService`,只提供 `kickoutUserType(userId, userTypeCode)`、`kickoutClient(clientId)`、`kickoutUserClient(userId, clientId)`。

触发规则:全局停用用户清全部 Token;删除用户某登录域清该域 Token;停用登录域清该类型全部用户 Token;停用 Client 或改 `userTypeId` 清该 Client 全部 Token;改用户在某 Client 的角色、改角色菜单、改菜单权限串清对应 Client Token;改 `registerEnabled` 不清 Token。保持 `is-share=false`,隔离由"每个 Token 的 LoginUser 按当前 Client 构建"保证。

---

## 6. 前端实施

- **阶段 12** 新增 `src/api/system/userType/{index.ts,types.ts}` 与 `src/views/system/userType/index.vue`,照抄现有 client/post 模块的 CRUD 范式(`useLoading`/`useFormDialog`/`useSearchReset`/`v-hasPermi`)。编码新增可填、编辑只读。
- **阶段 13** 改造 `src/api/system/client/types.ts` 与 `src/views/system/client/index.vue`,增加登录域选择、公开注册开关、默认角色选择(按当前 Client 过滤),列表增列展示。
- **阶段 14** 角色管理:列表顶部加 Client 筛选,新增必选 Client,编辑时 Client 只读,菜单树按 Client 加载,用户分配按 Client 过滤。禁止默认混合全部 Client 角色后直接授权。
- **阶段 15** 菜单管理:加 Client 选择器,切换即重载菜单树,新增继承当前 Client,父菜单选择器只显示同 Client。业务页面按 APP 分目录 `src/views/business/{admin-console,data-competition,data-collection,token-relay}/`,公共页面留在 `src/views/system/`。现有 `loadView` 用 `import.meta.glob('../../views/**/*.vue')`,新目录零配置生效。
- **阶段 16** 用户管理:表单加登录域多选;角色分配先选 Client 再列角色;展示上区分"拥有的登录域""显式角色""Client 默认角色"。
- **阶段 17** 新增 `getClientAuthContext()`,登录页与注册页初始化都要调用(不能只在登录页隐藏按钮)。删除 `src/views/register.vue` 的 `userType: 'sys_user'`、`src/api/types.ts` 的 `RegisterForm.userType`、`src/api/system/user/types.ts` 的 `UserVO.userType`。注册只提交 `clientId`/`username`/`password`/`captcha`。
- **阶段 18** 动态路由不重写:后端已按 Client 返回,前端继续转换组件并 `addRoute`,不再前端过滤。权限边界只在后端。

多 APP 部署用同一个 `main` 分支 + 不同环境变量(实际存在的变量):`VITE_APP_CLIENT_ID`、`VITE_APP_TITLE`、`VITE_APP_LOGO_TITLE`、`VITE_APP_BASE_API`、`VITE_APP_CONTEXT_PATH`。不为每个 APP fork 前端仓库、不维护四条长期分支。

---

## 7. 提交拆分

后端顺序:`chore(upstream): establish namewta baseline` → `feat(user-type)` → `refactor(user): remove single userType field and enum` → `feat(client)` → `feat(role)` → `feat(menu)` → `refactor(permission)` → `refactor(auth)` → `refactor(register)` → `feat(session)` → `feat(user): manage user type relations`。

前端顺序:`feat(user-type)` → `feat(client)` → `feat(role)` → `feat(menu)` → `feat(user)` → `feat(auth): load public client authentication context` → `refactor(register)`。

每个提交可编译、不混入无关格式化、不升依赖、不改 lockfile;后端接口提交先于前端对应提交;上游同步提交不夹带业务功能。

---

## 8. 人工验收矩阵

- 用户 A 同时拥有两个登录域:两端登录成功、Token 不同、`userType` 与 `clientPk` 不同、动态路由与权限集不同、退出互不影响。
- 用户 B 从数超大赛注册:只产生 `B → APP_USER`;三个用户端均可登录、管理后台登录失败、三端路由互不相同。
- 管理员为 B 开通管理域后:管理后台可登录,原有用户端不受影响,权限不串。
- 注册开关:开启端显示按钮且后端放行;关闭端不显示按钮且直接调接口被拒;关闭后已有用户仍能登录。
- 越权:跨 Client Token 请求被 `SecurityConfig` 的 clientid 校验或权限拒绝;跨 Client 分配角色/菜单被拒;缺 `clientPk` 查路由不返回全局菜单;前端伪造 userType 无效(字段已不存在)。

构建命令:后端 `./mvnw clean package`(根 pom 已 `maven.test.skip=true`);前端 `pnpm install --frozen-lockfile && pnpm lint && pnpm build:prod`。禁止每次提交跑 `pnpm fmt` 全仓格式化。

---

## 9. 上游跟随与文档

在父仓库新增 `docs/upstream/customization-map.md`,前后端各留一行指针说明。清单只记录区域、目的、关键文件、合并后必须保持的约束:

- UserType:类型来自 Client 而非用户单值字段 —— `UserType.java`(已删)、`LoginUser`、`LoginHelper`
- 登录准入:用户必须拥有 Client 要求的登录域 —— `AuthController`、`IAuthStrategy`、五个 `*AuthStrategy`
- 注册:后端权威校验 Client 开关 —— `AuthController`、`SysRegisterService`
- 权限:必须 `userId + clientId` —— `PermissionService`、`SysPermissionServiceImpl`、`SaPermissionImpl`、`SysLoginService`
- 动态路由:不得跨 Client,含超管 —— `SysMenuMapper`、`SysMenuServiceImpl`、`SysMenuController`
- 会话:当前 Token 必须有 clientPk —— `LoginUser`、`LoginHelper`、`IAuthStrategy.buildLoginParameter`
- 前端认证:不硬编码 UserType —— `login.vue`、`register.vue`、`api/login.ts`、`api/types.ts`
- 前端权限:Client 不可跨域关联 —— client/user/role/menu 四个管理页

同步节奏:上游每次 Release 评估一次;涉及认证/权限/菜单/Client 的提交优先同步;其余并入常规窗口。同步前先看重叠面:

```bash
git log --oneline main..upstream/6.X
git diff --name-status "$(git merge-base main upstream/6.X)" upstream/6.X
```

通用缺陷修复尽量回馈上游 PR,业务特有改造留在 NAMEWTA。未来 7.X 大版本按同样的小提交顺序逐项移植到新的 `main`,而不是直接把 7.X 合进现有产品分支。