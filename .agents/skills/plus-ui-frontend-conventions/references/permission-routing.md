# 动态菜单、路由与权限

## Admin 端到端路径

```text
apps/admin-web/src/main.ts
  -> permission.ts 恢复受保护导航
  -> user.getInfo()
  -> permission store 调用 admin domain 的 identityAccessService.getMenus()
  -> filterAsyncRouter / assembleServerRoutes
  -> adminManifestRegistry 解析所选 Web 领域组件键
  -> router.addRoute()
  -> replace 当前目标
```

后端菜单已经按 Client 和服务端权限裁剪。前端只组合当前 App 已选择的 domain/web-domain，不再进行跨 Client 菜单补偿。未知组件键、未选择领域、重复注册和缺少依赖均应失败关闭。

## 真实入口

- 守卫：`apps/admin-web/src/permission.ts`
- 领域服务装配：`apps/admin-web/src/application/services.ts`
- 认证与菜单服务：`@namewta/domain-admin` 的公开入口，由 `apps/admin-web/src/application/services.ts` 注入 system identity port
- 路由转换：`apps/admin-web/src/store/modules/permission.ts`
- 组件清单：`apps/admin-web/src/router/adminManifestRegistry.ts`
- 未来终端领域选择：由激活规格创建的 App 组合入口；当前不存在第二个 App 源码入口

Admin 本地 `views` glob 只为 App 自有静态页面兜底；领域页面必须来自 web-domain 的公开 manifest。

## 按钮与命令式权限

- `v-hasPermi`、`v-hasRoles`：`apps/admin-web/src/directive/permission/**`
- 命令式权限：`apps/admin-web/src/application/access.ts`
- 统一访问评估：`@namewta/platform-permission` 与 admin domain 公开能力

指令与命令式检查必须保持同一角色/权限语义。缺少会话、空值、未知角色或不匹配时失败关闭。前端隐藏按钮不是安全边界，后端接口必须独立鉴权。

## 修改检查清单

- 后端组件键与 manifest 注册是否完全一致。
- App 是否同时选择对应 domain 和 web-domain。
- 未选择 App 是否无法解析该能力并提供稳定诊断。
- 登录恢复顺序、addRoute 和 replace 是否避免循环与空白页。
- 权限指令、动态路由与页面内检查是否调用 `createAdminAccessEvaluator`。
- 畸形 ClientContext、菜单或权限响应是否不会默认放行。
