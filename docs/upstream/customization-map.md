# NAMEWTA 上游跟随热点清单

本表只记录相对上游必须保留的改造面。同步 `6.X` / `6.X-Vue` 到产品 `main` 时，先看重叠文件，再解冲突；通用缺陷回馈上游，业务特有逻辑留在 NAMEWTA。

分支模型：`main` = 产品；后端 `6.X`、前端 `6.X-Vue` = 上游纯镜像（只允许 fast-forward）。基线标签 `namewta-base-upstream-6x` / `namewta-base-upstream-6x-vue` 不要移动。

## 同步前重叠面

```bash
# 后端
git log --oneline main..upstream/6.X
git diff --name-status "$(git merge-base main upstream/6.X)" upstream/6.X

# 前端
git log --oneline main..upstream/6.X-Vue
git diff --name-status "$(git merge-base main upstream/6.X-Vue)" upstream/6.X-Vue
```

## 后端（ruoyi-vue-plus-namewta）

| 区域 | 目的 | 关键文件 | 合并后必须保持的约束 |
|------|------|----------|----------------------|
| UserType | 登录域来自 Client 关联的动态类型，而不是用户单值字段或枚举 | 已删 `enums/UserType.java`；`LoginUser.java`；`LoginHelper.java`；`SysUserType*` | 禁止恢复 `sys_user.user_type` / `UserType` 枚举（`ruoyi-workflow` 的 warm-flow `UserType` 除外） |
| 登录准入 | 用户必须拥有当前 Client 要求的登录域 | `AuthController.java`；`IAuthStrategy.java`；五个 `*AuthStrategy`；`ClientUserTypeAccessService` | 五个策略都走准入；Token extra 必须写 `clientPk`（`sys_client.id`） |
| 注册 | 后端按 Client 开关校验，不再读全局配置 | `AuthController.java`；`SysRegisterService.java` | 使用 `client.registerEnabled`（Java/JSON **boolean**，库列为 tinyint）；禁止 `sys.account.registerUser`；已存在账号只提示登录，不隐式追加登录域 |
| Client 公开上下文 | 登录/注册页拉取是否开放注册 | `AuthController.clientContext`；`AuthClientContextVo.java` | `GET /auth/client/context` 接受 query `clientId` **或** header `clientid`（OAuth 字符串）；不得泄露 secret / IP 白名单 / accessPath |
| 权限 | 有效权限 = `userId + clientId` | `PermissionService.java`；`SysPermissionServiceImpl.java`；`SaPermissionImpl.java`；`SysLoginService.java`；`SysRoleMapper.java` | `SaPermissionImpl` 无 Token 上下文返回空集合，禁止 userId-only 兜底；默认角色运行时合并，**不写入** `sys_user_role` |
| 动态路由 | 菜单与路由不得跨 Client，含超管 | `SysMenuMapper.java`；`SysMenuServiceImpl.java`；`SysMenuController.java` | `getRouters` 缺 `clientPk` 必须拒绝，不得返回全局菜单；超管旁路也只查当前 Client |
| 会话 | 当前 Token 必须带 Client 主键 | `LoginUser.java`；`LoginHelper.java`；`IAuthStrategy.buildLoginParameter`；`ClientSessionService` | extra `clientPk` 与 JSON 角色/菜单字段 `clientId` 都是 `sys_client.id`（Long PK）；登录体 `clientId` 仍是 OAuth 字符串 |
| 下拉别名 | 前端 options 契约 | `SysUserTypeController.java` | 保留 `GET /system/userType/options`（`optionselect` 别名） |
| SQL | 旁路增量，不改上游脚本 | `script/sql/namewta/{001,002,003,README.md}` | 初始化顺序：`ry_vue.sql` → `001` → `002` → `003`；不修改 `script/sql/ry_vue.sql` |

## 前端（plus-ui-namewta）

| 区域 | 目的 | 关键文件 | 合并后必须保持的约束 |
|------|------|----------|----------------------|
| 认证页 | 不硬编码 UserType，按 Client 上下文显示注册 | `login.vue`；`register.vue`；`api/login.ts`；`api/types.ts` | 登录+注册都调用 `/auth/client/context`；`RegisterForm` 无 `userType`；注册只提交 `clientId`/`username`/`password`/`captcha` |
| 权限管理 | Client 不可跨域关联角色/菜单/用户 | `views/system/{client,user,role,menu}/index.vue` 及对应 `api/system/*` | 角色/菜单查询与表单的 `clientId` = `sys_client.id` PK（不是 OAuth 字符串）；禁止默认混合全部 Client 后授权 |
| 登录域管理 | 动态登录域 CRUD | `api/system/userType/`；`views/system/userType/index.vue` | 下拉走 `/system/userType/options`；编码创建后只读 |
| 动态路由 | 后端已按 Client 过滤 | `permission` store / `loadView` | 前端继续 `addRoute`，不再做跨 Client 菜单过滤 |
| 多 APP 部署 | 同一 `main` + 环境变量 | `.env*` | 用 `VITE_APP_CLIENT_ID`（OAuth 字符串）区分 APP，不为每个 APP 长期分叉 |

## 字段别名（容易在合并时写错）

| 场景 | 字段 | 含义 |
|------|------|------|
| 登录/注册请求体、`clientid` 头 | `clientId` | OAuth 客户端标识字符串 |
| Token extra、角色/菜单 JSON、RBAC 查询 | `clientId` / `clientPk` | `sys_client.id` Long 主键 |
| Client.registerEnabled | JSON boolean | 库列 tinyint；不要再当成 `'0'`/`'1'` 字符 |

## 初始化注意

全新库：`ry_vue.sql` → `001_user_type.sql` → `002_client_rbac.sql` → `003_initial_data.sql`。若某环境已经执行过旧版 `003`，不要整份重跑；后来新增的用户端菜单执行 `004_app_client_menus.sql`（幂等）。
