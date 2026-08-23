# ADR-0001: Client 是认证授权上下文

- **Status:** Accepted
- **Date:** 2026-08-23
- **Source:** `2026-08-21-oss-direct-unified-notification` ADR-001

## Context

多个 APP 前端共用后端、用户和业务数据，但通过不同 Client 获得登录域、角色、菜单、权限字符、数据权限和动态路由。把 Client 建模为 tenant 会错误引入数据分区和跨 Client 所有权。

## Decision

Client 与 userType 只属于认证授权上下文，不构成 tenant 或通用业务数据所有权。`sys_client.id` Long 主键可作为 `client_pk` 记录调用来源，但不得参与 OSS/通知隔离、Provider 路由或幂等作用域。OAuth `clientId` 字符串与 `client_pk` 不可混用；后台任务不伪造 SYSTEM scope。

## Consequences

共享资源的访问必须由当前 Client 下的权限字符、数据权限和业务对象授权决定，不能依赖 Client 行级过滤兜底。新增 `client_pk` 数据隔离需要独立领域决定。
