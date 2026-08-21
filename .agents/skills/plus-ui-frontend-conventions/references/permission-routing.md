# 动态权限路由

针对每个模块/能力的具体描述，如不明确，必须直接根据文中给出的仓库路径读取对应源码确认，不得凭空推断。指令只控制呈现，不能替代后端鉴权；裁决层见 `.agents/skills/engineering-standards/references/typescript/frameworks/vue.md`（VUE-004）。

## 目录

- [端到端路径](#端到端路径)
- [启动与守卫](#启动与守卫)
- [Token 与用户信息](#token-与用户信息)
- [常量路由与本地动态路由](#常量路由与本地动态路由)
- [后端菜单 getRouters](#后端菜单-getrouters)
- [组件映射与 addRoute](#组件映射与-addroute)
- [按钮/角色校验三套 API](#按钮角色校验三套-api)
- [侧栏、缓存与登录回跳](#侧栏缓存与登录回跳)
- [冲突与已知未知](#冲突与已知未知)

## 端到端路径

```text
main.ts 副作用 import './permission' + app.use(router) + directive(app) + $auth
    → permission.ts 全局 beforeEach
    → 有 Token 且 roles.length === 0 → user.getInfo()
    → permission.generateRoutes()
    → GET /system/menu/getRouters（服务端已按 Client 裁剪）
    → filterAsyncRouter / loadView
    → generateRoutes 内部对 filterDynamicRoutes(dynamicRoutes) router.addRoute（当前空数组）
    → 守卫对返回的 rewriteRoutes 非 http path 再 router.addRoute
    → Sidebar/TopBar 按 hidden 过滤
    → 模板 v-hasPermi 或 checkPermi 控制按钮呈现
```

NAMEWTA 要点：菜单已在服务端按 Client 过滤，前端只 `addRoute`，不再做跨 Client 菜单过滤。读 `docs/upstream/customization-map.md` 前端「动态路由」行，不要复制长文。

## 启动与守卫

- 入口：`plus-ui-namewta/src/main.ts` — `import './permission'`（副作用注册守卫）、`app.use(router)`、`directive(app)`、`app.use(plugins)`（挂 `$auth`）。插件安装：`plus-ui-namewta/src/plugins/index.ts`。指令注册：`plus-ui-namewta/src/directive/index.ts`（`hasPermi` / `hasRoles`）。
- 守卫：`plus-ui-namewta/src/permission.ts`。匹配器：`plus-ui-namewta/src/utils/validate.ts` 的 `isPathMatch` / `isHttp`。
- 白名单：`/login`、`/register`、`/social-callback`、`/register*`、`/register/*`。
- 分支（按源码原样，不要简化成「无 Token 一律登录」）：
  - 有 Token 且访问 `/login` → `{ path: '/' }`
  - 有 Token 且白名单 → 放行
  - 有 Token 且 `userStore.roles.length === 0` → `getInfo()`；成功则 `generateRoutes()`，对非 http path `router.addRoute`，再 replace 回当前 `to`（携带 `params`/`query`/`hash`/`name`）；失败则 `logout`，若 `!isHandledRequestError(err)` 则 `ElMessage.error`，并 `{ path: '/' }`
  - 无 Token：白名单放行，否则 `/login?redirect=${encodeURIComponent(to.fullPath || '/')}`

`roles.length === 0` 是「是否已拉取用户信息」的哨兵，不是「无角色用户」。

## Token 与用户信息

- Token 键 `Admin-Token`，经 VueUse `useStorage` 持久化：`plus-ui-namewta/src/utils/auth.ts`。storage 引擎（localStorage vs sessionStorage）未打开 VueUse 默认实现再确认，不要发明。
- 登录写 `access_token`；`getInfo` 填充 `roles` / `permissions`；若 roles 为空数组则 roles 设为 `['ROLE_DEFAULT']`（该分支不赋值 permissions）。logout 调后端后清空 token/roles/permissions。路径：`plus-ui-namewta/src/store/modules/user.ts`。
- 用户信息接口：`plus-ui-namewta/src/api/login.ts` 的 `GET /system/user/getInfo`。前端类型 `UserInfo { user, roles, permissions }`：`plus-ui-namewta/src/api/system/user/types.ts`。
- 后端：`ruoyi-vue-plus-namewta/ruoyi-modules/ruoyi-system/src/main/java/org/dromara/system/controller/system/SysUserController.java` 的 `getInfo` 返回 `UserInfoVo`（`ruoyi-vue-plus-namewta/ruoyi-modules/ruoyi-system/src/main/java/org/dromara/system/domain/vo/UserInfoVo.java`）：`user` + `permissions=loginUser.menuPermission` + `roles=loginUser.rolePermission`。权限组装：`ruoyi-vue-plus-namewta/ruoyi-modules/ruoyi-system/src/main/java/org/dromara/system/service/impl/SysPermissionServiceImpl.java`。
- 超管菜单权限含 `*:*:*`；超管角色键是 `superadmin`（`SystemConstants.SUPER_ADMIN_ROLE_KEY`）：`ruoyi-vue-plus-namewta/ruoyi-common/ruoyi-common-core/src/main/java/org/dromara/common/core/constant/SystemConstants.java`。不要把它写成 `admin`。`SysPermissionServiceImpl.getRolePermission` / `getMenuPermission`：`LoginHelper.isSuperAdmin(userId)` 时先写入 `superadmin` / `*:*:*`，再叠加当前 Client 的角色/菜单权限。路径：`ruoyi-vue-plus-namewta/ruoyi-modules/ruoyi-system/src/main/java/org/dromara/system/service/impl/SysPermissionServiceImpl.java`。

请求头带 `Authorization: Bearer` 与 `clientid: VITE_APP_CLIENT_ID`：`plus-ui-namewta/src/utils/request.ts` 的 `globalHeaders`。多 APP 用 `VITE_APP_CLIENT_ID`，见 `docs/upstream/customization-map.md`。

## 常量路由与本地动态路由

- `plus-ui-namewta/src/router/index.ts`：history 基路径 `import.meta.env.VITE_APP_CONTEXT_PATH`。
- `constantRoutes` 含：`/redirect`、`/social-callback`、`/login`、`/register`、catch-all `/:pathMatch(.*)*` → 404、`/401`、`''` 重定向 `/index`（首页）、隐藏的 `/user/profile`。登录/错误页 `hidden: true`，不进侧栏。404/401 是 constant 隐藏路由，不是动态生成。
- `export const dynamicRoutes: RouteRecordRaw[] = []`。本地 permissions/roles 动态路由机制仍在，但当前无条目；侧栏路由来自后端 `getRouters`。是否刻意清空，前端无注释；需要历史意图时读子模块 git log，不要发明原因。
- `permissions` / `roles` 定义在 `_RouteRecordBase`，不在 `RouteMeta`：`plus-ui-namewta/src/types/router.d.ts`。后端 `RouterVo` 不含这两字段（见下节）。前端 router 文件头注释仍描述它们，仅服务本地 `dynamicRoutes`。

## 后端菜单 getRouters

- 前端：`plus-ui-namewta/src/api/menu.ts` — `getRouters()` → `GET /system/menu/getRouters`。
- 后端：`ruoyi-vue-plus-namewta/ruoyi-modules/ruoyi-system/src/main/java/org/dromara/system/controller/system/SysMenuController.java` 的 `getRouters`。`loginUser == null || loginUser.getClientPk() == null` 则失败「当前登录缺少客户端上下文」；然后 `selectMenuTreeByUserId(userId, clientPk)` + `buildMenus`。
- `SysMenuServiceImpl.selectMenuTreeByUserId`：`clientId == null` 返回空列表；`LoginHelper.isSuperAdmin(userId)` 则 `menuMapper.selectMenuTreeAll(clientId)`；否则 `mergeMenus(selectMenuTreeByUserId, selectMenuTreeByRoleId(resolveDefaultRoleId(clientId), clientId))`。前端不再做跨 Client 过滤。路径：`ruoyi-vue-plus-namewta/ruoyi-modules/ruoyi-system/src/main/java/org/dromara/system/service/impl/SysMenuServiceImpl.java`。
- `RouterVo` 字段：name、path、hidden、redirect、component、query、ext、alwaysShow、meta、children。路径：`ruoyi-vue-plus-namewta/ruoyi-modules/ruoyi-system/src/main/java/org/dromara/system/domain/vo/RouterVo.java`。`MetaVo`：title、icon、noCache、link、activeMenu。路径：`ruoyi-vue-plus-namewta/ruoyi-modules/ruoyi-system/src/main/java/org/dromara/system/domain/vo/MetaVo.java`。
- `hidden` 来自菜单 `visible == "1"`（`router.setHidden("1".equals(menu.getVisible()))`，字段名直觉相反，以 `buildMenus` 源码为准）。目录类型设 `alwaysShow=true` 且 `redirect=noRedirect`。路由 name 为实现 `menu.getRouteName() + menu.getMenuId()`（`buildMenus` 注释写「path 首字母转大写 + id」）。
- **RouterVo 不含 permissions/roles** — 后端已按用户裁剪菜单树。不要说后端菜单靠前端 `filterDynamicRoutes` 过滤。

## 组件映射与 addRoute

- `plus-ui-namewta/src/store/modules/permission.ts`：
  - `generateRoutes` 调 `getRouters()`，`filterAsyncRouter` 映射组件。本地 `filterDynamicRoutes(dynamicRoutes)` 的结果在本函数内 `router.addRoute`（空数组时为空操作）。返回的 `rewriteRoutes` 由 `plus-ui-namewta/src/permission.ts` 守卫对非 http path 再 `router.addRoute`。末尾 `duplicateRouteChecker` 在 name 重复时 `console.error` + `ElNotification`「会造成 404」。
  - `filterAsyncRouter`：`Layout` / `ParentView` / `InnerLink` 走固定组件，其余 `loadView(view, name)`。
  - `loadView` 用 `import.meta.glob('./../../views/**/*.vue')` 预建 Map（key 为 `/views/` 之后、不含 `.vue` 的相对路径），再 `plus-ui-namewta/src/utils/createCustomNameComponent.tsx` 包装以固定组件 name（keep-alive）。找不到组件时返回 `undefined`（无用户提示；load 失败时 `createCustomNameComponent` `console.error`）。用户实际看到什么（空白/404）未做运行时验证。
  - rewrite 模式会 `filterChildren` 展平 ParentView 子路径。http(s) 外链在守卫里不 `addRoute`（`plus-ui-namewta/src/permission.ts` 的 `isHttp`）。
- 新页面必须落在 `plus-ui-namewta/src/views/**/*.vue`，且菜单 component 与相对路径一致（不含 `views/` 前缀与 `.vue`）。
- `filterDynamicRoutes`：路由有 `permissions` 则 `auth.hasPermiOr`；否则若有 `roles` 则 `auth.hasRoleOr`；两者都没有则丢弃。这是本地隐藏路由扩展点，当前因空数组无运行效果。路径：同 store 文件 + `plus-ui-namewta/src/plugins/auth.ts`。

## 按钮/角色校验三套 API

仓库真实指令名是 `hasPermi` 与 **`hasRoles`（复数）**，不是用户口中的 `v-hasRole`。无任何业务模板使用 `v-hasRole` / `v-hasRoles`（仅 directive 源文件的 throw 文案举例 `v-has-roles`）。回源码确认，不要把 `v-hasRole` 当成仓库 API。

| 能力 | 路径 | 行为 |
|---|---|---|
| 指令 `v-hasPermi` / `v-hasRoles` | `plus-ui-namewta/src/directive/permission/index.ts`；注册 `plus-ui-namewta/src/directive/index.ts` | `mounted` 时无权限则 `removeChild`；值必须是非空数组否则 throw。`*:*:*` 视为全部权限。`hasRoles` 将 `superadmin` **或** `admin` 视为放行。模板主流 camel：`plus-ui-namewta/src/views/demo/demo/index.vue` 的 `v-hasPermi="['demo:demo:add']"`。`plus-ui-namewta/src/views/system/user/index.vue` 混用 `v-has-permi` 与 `v-hasPermi`；Vue 将 camel/kebab 视为同一指令。 |
| `$auth` 插件 | `plus-ui-namewta/src/plugins/auth.ts`；挂载 `plus-ui-namewta/src/plugins/index.ts` 的 `app.config.globalProperties.$auth` | `hasPermi` / `hasPermiOr` / `hasPermiAnd`、`hasRole` / `hasRoleOr` / `hasRoleAnd`。角色超管键为 **`admin`**。对 `plus-ui-namewta/src/**/*.{vue,ts,tsx}` 检索 `$auth.` 无业务调用（模板字符串用法可能漏检）。 |
| `checkPermi` / `checkRole` | `plus-ui-namewta/src/utils/permission.ts` | 角色超管键亦为 **`admin`**。`checkPermi` 实际用于 `plus-ui-namewta/src/views/system/user/index.vue` dropdown。同范围检索 `checkRole(` 无业务调用。 |

CRUD 页默认 `v-hasPermi`、已混用则保持文件现状：`plus-ui-namewta/.codex/skills/frontend-crud-coding/`。规范裁决读 FE-CRUD-007，不要复制。

## 侧栏、缓存与登录回跳

Route 相关字段（对照源码，不要只信 router 文件头注释）：

| 字段 | 位置 | 路径与用途 |
|---|---|---|
| `hidden` | `_RouteRecordBase` | 类型 `boolean \| string \| number`（`plus-ui-namewta/src/types/router.d.ts`）。`plus-ui-namewta/src/layout/components/Sidebar/SidebarItem.vue` 根节点 `v-if="!item.hidden"`；子节点 `item.hidden` 不计入 showingChildren。`plus-ui-namewta/src/layout/components/TopBar/index.vue` 对 `sidebarRouters` `filter(f => !f.hidden)`。真值判断依赖 JS truthiness。 |
| `alwaysShow` | `_RouteRecordBase` | 后端目录类型写入；见 `SysMenuServiceImpl.buildMenus`。 |
| `permissions` / `roles` | `_RouteRecordBase` | 仅本地 `dynamicRoutes`；当前为空。 |
| `query` / `ext` / `parentPath` | `_RouteRecordBase` | 前端类型：`plus-ui-namewta/src/types/router.d.ts`。后端 `RouterVo` 含 `query`、`ext`，不含 `parentPath`。 |
| `meta.title` / `icon` / `affix` | `RouteMeta` | 侧栏/面包屑/首页固定标签。首页示例：`plus-ui-namewta/src/router/index.ts` 的 `/index`。 |
| `meta.noCache` | `RouteMeta` | true 时 tagsView 不写入 `cachedViews`：`plus-ui-namewta/src/store/modules/tagsView.ts`（`if (!view.meta?.noCache)`）。`plus-ui-namewta/src/layout/components/AppMain.vue` 用 `<keep-alive :include="tagsViewStore.cachedViews">`。 |
| `meta.activeMenu` | `RouteMeta` | 侧栏与顶栏高亮：`plus-ui-namewta/src/layout/components/Sidebar/index.vue`、`plus-ui-namewta/src/layout/components/TopBar/index.vue`（`if (meta.activeMenu)`）。 |
| `meta.link` | `RouteMeta` | 外链；http path 不 `addRoute`。 |
| `meta.breadcrumb` | `RouteMeta` | 前端类型有此字段（`plus-ui-namewta/src/types/router.d.ts`）；`MetaVo` 不含。用途以实际消费点为准，不要只信 router 文件头。 |

登录回跳：

- 登录成功 `router.push(redirectUrl)`，`redirect` 来自 query.redirect 的 `decodeURIComponent`：`plus-ui-namewta/src/views/login.vue`。
- HTTP 业务码 401 弹 `ElMessageBox.confirm`（正文「登录状态已过期…」，确认按钮「重新登录」），logout 后 `router.replace({ path: '/login', query: { redirect: encodeURIComponent(current fullPath) } })`：`plus-ui-namewta/src/utils/request.ts`。
- 守卫已 `encodeURIComponent`，login 再 decode；401 路径把已编码字符串放进 query 对象，Vue Router 可能二次编码。不要承诺双重编解码一定正确。

社交回调：

- `/social-callback` 在白名单且 `constantRoutes`。组件：`plus-ui-namewta/src/layout/components/SocialCallback/index.vue`。无 Token 走 `loginByCode`（调 `plus-ui-namewta/src/api/login.ts` 的 `login()` → `POST /auth/login`，`grantType: 'social'`）；有 Token 走 `callbackByCode`（同文件 `callback()` → `POST /auth/social/callback`）。成功或失败均 `setTimeout` 后 `location.href = VITE_APP_CONTEXT_PATH + 'index'`（整页跳转，不是 `router.push`）。不要把它当成普通 Vue 内导航。

## 冲突与已知未知

**冲突（源码并列，不裁决，禁止静默统一成 admin 或 hasRole）**

1. 超管角色键：`superadmin`（后端 `SystemConstants` + `hasRoles` 指令）vs `admin`（`plus-ui-namewta/src/plugins/auth.ts` 与 `plus-ui-namewta/src/utils/permission.ts` 的 `checkRole`）。前端 `hasRoles` 额外把 `admin` 也当超管。`getInfo` 按后端返回 `superadmin`，因此 `hasRole`/`checkRole` 对超管可能失效，除非某角色编码恰好是 `admin`。未登录超管账号验证 roles 数组实际内容。
2. 指令示例文案使用 kebab `v-has-permi` / `v-has-roles`，页面主流 camel `v-hasPermi`；Vue 两者等价。注册名是 `hasRoles` 不是 `hasRole`。
3. `RouterVo` 无 permissions/roles，但前端 router 注释与 `_RouteRecordBase` 仍描述这两字段（仅本地空 `dynamicRoutes` 使用）。

**已知未知（以后重读源码或运行时验证，禁止发明）**

1. `getInfo` 失败后 `return { path: '/' }` 在 logout 抛错时的导航结果。路径：`plus-ui-namewta/src/permission.ts`。
2. `login?redirect=` 与 401 `query.redirect` 是否双重编码。路径：`plus-ui-namewta/src/permission.ts`、`plus-ui-namewta/src/views/login.vue`、`plus-ui-namewta/src/utils/request.ts`。
3. catch-all 404 注册顺序与动态 `addRoute` 的运行时匹配，未做浏览器验证。路径：`plus-ui-namewta/src/router/index.ts`。
4. `dynamicRoutes = []` 是 NAMEWTA 有意清空还是上游已改。路径：`plus-ui-namewta/src/router/index.ts`。
5. `loadView` 找不到组件时用户看到什么。路径：`plus-ui-namewta/src/store/modules/permission.ts`。
6. `$auth` 是否在 Options API 模板中使用（检索仅覆盖脚本）。路径：`plus-ui-namewta/src/plugins/auth.ts`。
7. Token storage 引擎。路径：`plus-ui-namewta/src/utils/auth.ts` 与 VueUse `useStorage` 默认实现。
