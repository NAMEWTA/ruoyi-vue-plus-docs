# Admin Web 登录失败：菜单可选字段 `null` 合同不兼容事故复盘

> 调查与修复日期：2026-09-01
>
> CDE 状态：已修复并通过真实登录验证，改动当前位于 CDE 工作树
>
> 基座状态：同源风险已确认，`plus-ui-namewta` 尚待同步修复
>
> 影响范围：Admin Web 登录后身份恢复、动态菜单解析、路由注册、失败关闭与验证码刷新

## 1. 结论

用户看到的错误是：

```text
IdentityAccessError: 客户端认证配置不可用，无法登录
```

但 Client 配置和登录认证本身均正常。真实故障发生在登录成功后的动态菜单恢复阶段：后端 `/system/menu/getRouters` 返回的菜单元数据包含合法 JSON 空值：

```json
{
  "meta": {
    "activeMenu": null,
    "link": null
  }
}
```

前端将这些属性定义为可选字段，却只接受字段缺失（`undefined`），不接受显式 `null`。菜单解析因此抛出 `invalid-menu-response`，权限恢复守卫按失败关闭原则执行登出。登出清空 Client 上下文后，登录页再次刷新验证码，最终才抛出“客户端认证配置不可用”。

本次修复在前端传输边界把可选字段的 `null` 规范化为“缺失”，同时继续严格拒绝必填字段为空和错误类型。登录页也收敛了验证码刷新失败，避免产生未处理 Promise。

真实环境验证结果：

- 成功登录并进入 `/index`。
- 登录恢复期间意外 `/auth/logout` 请求数为 `0`。
- 浏览器 `pageerror` 数为 `0`。
- 验证结束后执行了一次显式注销，没有遗留测试会话。

## 2. 用户可见现象

典型控制台输出：

```text
index.ts:158 Uncaught (in promise) IdentityAccessError: 客户端认证配置不可用，无法登录
    at clientContextError (index.ts:158:3)
    at Object.loadVerification [as getVerification] (index.ts:350:25)
    at getCode (login.vue:231:52)
```

同时存在一组看似矛盾的后端证据：

1. `/auth/client/context` 返回 `200`，`clientEnabled: true`。
2. `/auth/code` 返回 `200`，验证码可正常获取。
3. `/auth/login` 返回 `200`，服务端记录“登录成功”并签发 token。
4. `/system/user/getInfo` 返回 `200`，用户、角色和权限均正常。
5. `/system/menu/getRouters` 返回 `200`，菜单数据完整。
6. 随后前端主动请求 `/auth/logout`，用户又回到登录状态。

因此，HTTP 成功并不代表前端登录恢复已经完成。故障位于菜单响应进入领域模型之后、动态路由注册之前。

## 3. 完整故障链

```text
/auth/login 成功，token 写入会话
        |
        v
/system/user/getInfo 成功
        |
        v
/system/menu/getRouters 成功
        |
        v
菜单 meta.activeMenu/link 为 null
        |
        v
menuString() 只接受 undefined，将 null 判为非法类型
        |
        v
抛出 invalid-menu-response
        |
        v
permission.ts 捕获身份恢复失败并调用 logout()
        |
        v
/auth/logout + session.clear() + Client context 清空
        |
        v
登录页再次调用 getVerification()
        |
        v
因 Client context 已不存在，抛出 client-context-unavailable
        |
        v
用户看到“客户端认证配置不可用，无法登录”
```

真正的第一现场异常是：

```text
IdentityAccessError:
服务端菜单响应格式无效: menus[0].children[0].meta.activeMenu
```

“客户端认证配置不可用”属于清理会话后的二次异常，它遮蔽了更早、更准确的菜单合同错误。

## 4. 根因分析

### 4.1 可选字段的两种空值表达没有在传输边界统一

修复前的核心逻辑位于：

```text
cde-frontend/packages/domains/admin/src/index.ts
```

```ts
const value = menu[key];
if (value === undefined && !options.required) return undefined;
if (typeof value !== 'string' || (options.nonBlank && !value.trim())) {
  throw invalidMenu(`${path}.${key}`);
}
```

该实现把 TypeScript 的“可选”解释为“只能缺失”，而后端 JSON 使用 `null` 表达“该可选属性当前无值”。两者语义相同，传输表示不同。

修复目标不是允许任意宽松输入，而是只完成以下规范化：

| 传输输入 | 可选字段 | 必填字段 |
|---|---|---|
| 缺失 / `undefined` | 省略 | 拒绝 |
| `null` | 省略 | 拒绝 |
| 正确类型 | 接受 | 接受 |
| 错误类型 | 拒绝 | 拒绝 |
| 空白必填字符串 | 不适用 | 拒绝 |

### 4.2 后端能够稳定输出 `null`

后端菜单元数据位于：

```text
cde-backend/cde-modules/cde-system/src/main/java/com/cde/system/domain/vo/MetaVo.java
```

`MetaVo` 的 `link`、`activeMenu` 等字段在普通菜单没有对应值时保持 `null`。真实 `/system/menu/getRouters` 响应已经证明这些字段会以显式 JSON `null` 返回。

这不是数据库脏数据，也不是单个菜单配置错误，而是可稳定复现的跨端序列化合同差异。

### 4.3 静态合同与运行时 JSON 存在漂移

生成的 TypeScript 合同通常表达为：

```ts
link?: string;
activeMenu?: string;
```

它表达“字段可以缺失”，但没有表达“字段存在且值为 `null`”。因此各层事实不一致：

| 层次 | 表达 |
|---|---|
| Java 运行时对象 | 可为 `null` |
| 真实 JSON | 字段可能存在且为 `null` |
| OpenAPI 生成类型 | 可缺失，但不可为 `null` |
| 前端领域对象 | 可缺失，但不可为 `null` |
| 修复前解析器 | 只规范化缺失，不规范化 `null` |

前端传输边界是最适合兼容新旧后端响应的位置：它接受 transport 层的 nullish 表达，输出稳定、非 nullable 的领域对象。

### 4.4 测试夹具过于理想化

修复前的领域测试和 E2E 菜单 mock 都省略了没有值的 `activeMenu`、`link` 等字段。这只覆盖了“后端省略空属性”的理想响应，没有覆盖真实后端“属性存在且为 `null`”的响应。

因此，单元测试、E2E 和构建都可能通过，但真实环境登录仍会失败。

## 5. 排查过程

### 5.1 先确认认证链路没有失败

从后端请求日志逐项确认：

- Client context 查询命中有效 Client。
- 验证码接口正常返回。
- 用户名、登录域、角色、权限和岗位查询正常。
- `/auth/login` 成功签发 token。
- `/system/user/getInfo` 与 `/system/menu/getRouters` 均返回成功。

这一步排除了中间件、数据库初始化、Client 记录、账号密码和验证码服务是主因的假设。

### 5.2 通过请求顺序识别前端主动登出

日志显示 `/system/menu/getRouters` 成功后立即出现：

```text
POST /auth/logout
GET  /resource/message/close
```

这说明 token 不是服务端拒绝或自然失效，而是前端恢复流程主动进入失败关闭分支。

### 5.3 捕获被二次异常遮蔽的首个错误

在真实浏览器运行链路中记录菜单解析异常，得到精确字段路径：

```text
menus[0].children[0].meta.activeMenu
```

随后对照真实菜单响应，确认 `activeMenu` 和 `link` 的值为 `null`，而不是字符串。

### 5.4 对照前后端合同与同源基座

检查前端 `menuString()`、`parseMenuMeta()`、`parseMenuNode()` 与后端 `MetaVo` 后确认：

- 前端可选字段只接受 `undefined`。
- 后端可选字段会输出 `null`。
- 基座 `plus-ui-namewta` 中存在同源解析逻辑。
- 问题属于跨端合同兼容缺口，而非 CDE 单一环境配置问题。

## 6. 已实施修复

### 6.1 菜单传输边界规范化 nullish 可选值

修改文件：

```text
cde-frontend/packages/domains/admin/src/index.ts
```

实施内容：

- 可选字符串同时接受 `undefined` 和 `null`，输出时省略属性。
- 可选布尔值同时接受 `undefined` 和 `null`。
- 可选字符串数组同时接受 `undefined` 和 `null`。
- `meta: null` 规范化为没有 `meta`。
- `children: null` 规范化为没有子菜单。
- 正确值（包括 `false`）继续保留。
- 数字、对象、字符串布尔值等错误类型继续抛出 `invalid-menu-response`。
- 必填 `path` 仍拒绝 `null`、缺失、空白和非字符串类型。

修复后的关键语义：

```ts
if ((value === undefined || value === null) && !options.required) {
  return undefined;
}
```

这保持了失败关闭原则，只兼容后端合同中代表“无值”的 nullish 输入。

### 6.2 收敛验证码刷新失败

修改文件：

```text
cde-frontend/apps/admin-web/src/views/login.vue
```

`getCode()` 增加显式失败处理：

- 将认证上下文状态切换为不可用。
- 禁用注册与登录提交。
- 清空验证码图片、验证码文本和 UUID。
- 显示稳定错误消息。
- 不再产生 `Unhandled error during execution of native event handler` 或未处理 Promise。

该加固不会掩盖菜单主故障；它用于保证任何验证码刷新失败都能进入可预测、不可继续认证的 UI 状态。

### 6.3 增加领域回归测试

修改文件：

```text
cde-frontend/packages/domains/admin/src/index.test.ts
```

新增或扩展的合法响应覆盖：

- 菜单节点的 `name`、`redirect`、`alwaysShow`、`permissions` 为 `null`。
- `meta.activeMenu`、`meta.link` 为 `null`。
- 子节点的 `query`、`meta`、`children` 为 `null`。
- 解析结果省略这些空值属性并保持递归冻结。

失败关闭回归继续覆盖：

| 输入 | 预期 |
|---|---|
| `path: null` | `invalid-menu-response` |
| `path: "   "` | `invalid-menu-response` |
| `noCache: "false"` | `invalid-menu-response` |
| `children: {}` | `invalid-menu-response` |
| 子菜单 `path: 42` | `invalid-menu-response` |

### 6.4 增加登录链路 E2E

修改文件：

```text
cde-frontend/e2e/app-runtime-baseline.spec.ts
```

回归场景现在使用与真实后端一致的菜单：

```ts
meta: {
  activeMenu: null,
  link: null,
  title: '迁移基线路由',
  icon: 'dashboard',
  noCache: false
}
```

并断言：

- 登录、用户信息和菜单请求各执行一次。
- 动态路由成功恢复并进入目标页面。
- 登录恢复期间 `/auth/logout` 请求数为 `0`。
- 验证码第二次刷新失败时登录被禁用。
- 验证码失败场景没有浏览器 `pageerror`。

## 7. 验证证据

### 7.1 领域与 App 定向门禁

工作目录：`cde-frontend`

| 命令 | 结果 |
|---|---|
| `pnpm --filter @cde/domain-admin test` | 通过，3 个测试文件、41 个测试 |
| `pnpm --filter @cde/domain-admin typecheck` | 通过 |
| `pnpm --filter @cde/domain-admin lint` | 通过 |
| `pnpm --filter @cde/admin-web typecheck` | 通过 |
| `pnpm --filter @cde/admin-web lint` | 通过 |
| 定向执行 `app-runtime-baseline.spec.ts` | 通过，6/6 |

### 7.2 工作区门禁

工作目录：`cde-frontend`

| 命令 | 结果 |
|---|---|
| `pnpm architecture:check` | 通过，24 个包、0 个基线违规 |
| `pnpm architecture:test` | 通过，100/100 |
| `pnpm lint` | 通过 |
| `pnpm typecheck` | 通过 |
| `pnpm test` | 通过 |
| `pnpm build:dev` | 通过 |
| `pnpm build:prod` | 通过 |

开发与生产构建均存在既有 Vite `INEFFECTIVE_DYNAMIC_IMPORT` 警告，但没有构建失败。

### 7.3 完整浏览器回归

完整 Playwright 回归共 46 个场景：

- 45 个通过。
- 本次登录、菜单 nullish 兼容和验证码异常场景全部通过。
- 唯一失败为既有 OSS 文件下载场景：页面和 `proof.txt` 已正常显示，但点击“下载”后 Playwright 没有收到 `download` 事件，等待 30 秒超时。
- 该 OSS 场景单独重跑后仍在相同位置超时，确认不是并发偶发，也与本次认证菜单修改没有调用或文件关联。

因此不能把完整 E2E 记录为全绿；OSS 下载测试仍是独立待处理项。

### 7.4 真实前后端登录冒烟

使用当前本地 Admin Web、真实后端、真实数据库/Redis 和真实验证码执行登录：

```json
{
  "loginSucceeded": true,
  "authenticatedPath": "/index",
  "automaticLogoutRequests": 0,
  "explicitLogoutRequests": 1,
  "pageErrors": 0
}
```

其中 `explicitLogoutRequests: 1` 是验证结束后的主动清理，不是故障复现中的自动退出。

### 7.5 差异检查

```text
git diff --check
```

结果通过。本次修复涉及 4 个前端文件，共 78 行新增、21 行删除；未创建或保留临时 Playwright 配置。

## 8. 为什么选择前端兼容，而不是只改后端

可以进一步评估让后端 `MetaVo` 省略空属性，但它不能替代前端兼容：

- 已部署旧后端仍可能返回显式 `null`。
- 滚动升级期间新旧响应可能并存。
- 其他兼容后端或网关转换仍可能保留 `null`。
- 前端传输边界本来就负责把 transport 表达投影为稳定领域模型。

推荐顺序仍是：

```text
前端先兼容 nullish 响应
        |
        v
后端再统一空值序列化策略
        |
        v
根据最终策略校正 OpenAPI nullable/optional 表达
```

## 9. 未采用的方案

以下做法均没有采用：

- 修改数据库，把空字段批量填成空字符串。
- 在登录页面或单个菜单上写字段特例。
- 删除菜单严格校验或吞掉所有解析错误。
- 只隐藏“客户端认证配置不可用”的提示。
- 取消路由守卫的失败关闭登出。
- 只修改当前后端序列化，不兼容旧响应。
- 手工修改生成的 OpenAPI TypeScript 文件。

这些方案要么掩盖根因，要么削弱安全边界，要么无法保证环境和版本切换后的兼容性。

## 10. 影响与兼容性

### 10.1 已改变的行为

- transport 层的可选菜单字段现在接受 `null`，并规范化为领域对象中的缺失属性。
- 验证码刷新失败不再形成未处理 Promise，而是进入明确的不可登录状态。

### 10.2 未改变的行为

- 后端仍是认证、授权与菜单裁剪的最终权威。
- 未选择或未知的菜单组件仍失败关闭。
- 必填路径和错误类型仍失败关闭。
- 路由恢复顺序仍为 `getInfo -> getRouters -> addRoute -> replace`。
- 本次没有修改后端、数据库、配置、依赖、OpenAPI 生成文件或部署拓扑。

### 10.3 回滚风险

若回滚菜单传输边界修复，任何返回显式 nullable 菜单元数据的后端都会重新触发登录后自动退出。若只回滚登录页异常收敛，主登录链路仍可成功，但验证码失败会重新出现未处理 Promise。

## 11. 基座同步状态

已确认基座存在同源实现：

```text
plus-ui-namewta/packages/domains/admin/src/index.ts
plus-ui-namewta/packages/domains/admin/src/index.test.ts
ruoyi-vue-plus-namewta/ruoyi-modules/ruoyi-system/src/main/java/org/dromara/system/domain/vo/MetaVo.java
```

当前仅 CDE 完成了实现和验证。基座仍应执行等价修复与回归，至少包含：

1. 可选字符串、布尔值、数组、`meta` 和 `children` 的 nullish 规范化。
2. 必填 `path` 和错误类型的失败关闭测试。
3. 使用 `activeMenu: null`、`link: null` 的登录 E2E。
4. 登录恢复期间 `/auth/logout` 为 `0` 的断言。
5. 基座自身的 lint、typecheck、单测、E2E 和构建验证。

在基座修复完成前，可以认定“CDE 当前故障已修复”，但不能认定“同源基座风险已全局关闭”。

## 12. 后续建议

1. 将 CDE 四个相关文件作为一个聚焦提交交付，避免混入当前工作树的其他改动。
2. 在基座实施等价修复，并记录基座提交与 CDE 吸收关系。
3. 决定后端空值策略：省略空属性，或在 OpenAPI 中明确 nullable。
4. 增加运行时 JSON 与 OpenAPI 的合同测试，防止 optional/nullable 再次漂移。
5. 单独处理 OSS 下载 E2E 的 `download` 事件缺失，不与本次登录修复混为一个问题。
