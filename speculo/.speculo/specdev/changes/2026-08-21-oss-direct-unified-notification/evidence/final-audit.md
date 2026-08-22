# Final Implementation Audit

- **Change:** `2026-08-21-oss-direct-unified-notification`
- **Backend checkpoint:** `a56a6f907dc1fad2bde4daa92adfeafbcea3613f`
- **Frontend checkpoint:** `866e5ba1a75c9d308ce752f32fa6b4158763feed`
- **Workspace:** current workspace / direct-parent
- **E2E:** not-required，遵循用户明确决定，未建设或运行 E2E

## Findings Closed

1. ruoyi-admin 未提供生产 `NotifyContextResolver`，common fallback 会令 `userId/clientPk/traceId` 永久为空。已在应用装配层修复并用 3 个集中测试覆盖认证请求、后台无 Token 和 Bean 覆盖关系。
2. 本 change 新增的生命周期、TEMP 元数据和通知监控事务使用了 Spring `@Transactional`。已按工程规范切换为 `@DSTransactional`。
3. 前端 Multipart retry/resume 只有静态审查。已增加 2 个 Vitest，验证失败 Part 独立重新签名和 ListParts 缺失段续传。
4. Goal Plan 误置于 `evidence/goal-plan.md`，T-03/T-10 的完成勾选未同步。已归位并修正工件状态。
5. T-03 完整 SHA 被误录为不可解析对象，短 SHA 未暴露该问题。已按后端真实 commit `2a94b4dfa7a0f0031ff111c4eb534abf7f930c57` 同步修正状态、T-03 Evidence 和 T-07 基线。

## Verification

| Gate | Result |
|---|---|
| `sh mvnw -pl ruoyi-admin -am -Dmaven.test.skip=false test` | pass；93 tests，0 failure/error，3 个外部环境条件测试 skip |
| `sh mvnw -pl ruoyi-admin -am package -DskipTests` | pass；36-module reactor，生成 ruoyi-admin jar |
| `pnpm exec vitest run` | pass；2 files / 4 tests |
| `pnpm lint` | pass；0 error |
| `pnpm build:prod` | pass |
| 旧 OSS 字节协议扫描 | pass；旧 upload/download 路由和 OSS byte proxy 为零 |
| 通知直调与 Client 边界扫描 | pass；Adapter 外发送直调为零（Demo SMS 黑名单管理例外）；无 client_pk 隐式隔离/路由/幂等 |
| Speculo implement 结构校验 | pass；0 error / 0 warning |
| Git Evidence 逐子仓校验 | pass；状态记录的 backend/frontend 组件 SHA 均可解析，且分别是最终 checkpoint 的祖先 |
| `git diff --check` | pass |

校验器的 `--repo` Git 模式只能把所有 SHA 交给一个仓库，并要求每个历史 Ticket 的 `result_sha` 同时等于当前 HEAD；它无法表达本 change 的 backend/frontend submodule 组件 SHA 与串行历史 checkpoint。因此最终使用同一校验器完成全部结构/语义校验，并对 Git Evidence 按实际所属子仓执行 `cat-file` 与 `merge-base --is-ancestor`。未改写真实 SHA，也未通过清理用户 dirty 文件规避检查。

## Review Axes

- **标准轴:** 请求上下文在同步发送线程快照；后台无登录保持 null；事务注解符合动态数据源规范；前端仅重试/续传缺失 Part；测试未通过放宽配置或删除断言获得绿色。
- **规范轴:** Client 仍仅属于认证授权体系，日志仅记录请求来源；`ref_type` 是实际物理表名且仅用于反向定位/生命周期；后端不代理 OSS 字节；Event 只做 best-effort 监控；E2E 保持 not-required。

## Residual Release Conditions

本地实现完成不等于生产发布已验收。生产 SQL、Bucket CORS、Expose ETag、Multipart Lifecycle、真实 Provider 和浏览器矩阵均未获授权且未执行；TEMP 主动清理继续默认关闭并保持 dry-run，启用前必须单独审核。
