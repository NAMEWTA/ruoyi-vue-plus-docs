# 架构边界

## 目录职责

| 目录 | 职责 | 不负责 |
|---|---|---|
| `apps/*` | 独立终端入口、ClientContext、布局、品牌、路由装配、运行时适配器、部署 | 可复用业务规则 |
| `packages/domains/*` | 领域模型、服务、映射器、端口和无界面工具 | Vue 页面、DOM、具体请求库 |
| `packages/web-domains/*` | 对应领域的 Vue 页面、组件、组合式函数、语言资源和 manifest | App 布局、全局单例、终端选择 |
| `packages/platform/*` | 跨领域最小合同和组合运行时 | 业务领域模型、浏览器实现 |
| `packages/adapters/*` | HTTP、存储、加密等运行时实现 | 领域策略和页面 |
| `packages/web-kit/*` | 被多个真实消费者证明稳定的 Web 共享机制 | 领域流程、App 品牌 |
| `packages/api-contracts` | OpenAPI 生成的传输合同 | 领域模型和页面模型 |
| `tooling/*` | 架构、OpenAPI 和仓库工具 | 产品运行时代码 |

## 依赖方向

```text
apps
  -> web-domains -> domains -> platform
  -> web-kit      -> platform（仅需要时）
  -> adapters     -> platform

api-contracts -> 在 domain 边界映射后使用
tooling       -> 不进入产品运行时
```

领域之间默认不直接依赖。共享语义必须属于某个领域公开合同，或已经小到足以成为稳定的 `platform` 合同；不要建立无 owner 的公共业务包。

## 后端定位

- 一级目录固定对应后端模块：`admin/system/gen/workflow/demo/ai`。
- 二级资源目录对应 Controller 的稳定 base path，使用 kebab-case，不复制 `Sys`、`Flw` 等 Java 实现前缀。
- `/system/dict/data` 对应 `packages/domains/system/src/dict-data`；存在页面时对应 `packages/web-domains/system/src/dict-data`。
- `/monitor/loginInfo` 等监控资源归 `system/src/monitor/*`。
- domain 资源拥有 API、领域类型、映射器和服务；web-domain 同名资源拥有页面。没有页面的 headless 资源不创建空 Web 目录。
- 跨模块流程通过公开端口注入组合，各 domain 只拥有本模块 HTTP。

## 当前组合

- `admin-web` 当前选择 admin、system、workflow、demo、ai、gen；唯一组合入口是 `apps/admin-web/src/router/adminManifestRegistry.ts`。
- `client-web`、`mobile-web`、`miniapp-taro` 尚未进入工作区，只保留 README。
- `taro-request`、`taro-storage` 只保留 README，尚无包清单、依赖和实现。

未来终端必须拥有独立领域选择、ClientId、会话命名空间和组合入口，不继承 Admin 全量能力。
