# 决策、迁移与例外

## 决策

### DEC-000 实现证据优先级

- Scope: `path:plus-ui-namewta/src/**`, `path:ruoyi-vue-plus-namewta/ruoyi-modules/**`
- Decision: 实现选择按“同模块、同形态的成熟实现 -> 当前公共 hooks/common API -> 当前生成模板 -> 框架通用做法”排序。生成模板是标准 CRUD 起点，不得覆盖 system/workflow 等复杂模块已经存在的权限、事务、缓存、关系和交互合同。
- Source: `repository-fact`
- Rationale: 当前成熟模块包含模板没有覆盖的 Client 隔离、数据权限、关联写入、缓存失效、导入导出和条件装配。
- Migration: 新建标准 CRUD 可从模板建立骨架；修改现有复杂功能只做满足需求的增量变化，除非另有经验证的重构任务。
- Verification: diff 对照同模块最近实现和生成模板；评审中说明保留的领域行为、权限、事务与状态语义。

### DEC-001 Canonical 与作用域

- Scope: `repository`
- Decision: 唯一工程规范位于 `.agents/skills/engineering-standards/`，覆盖父仓库与两个子模块；规则按路径路由。
- Source: `user-decision` + `repository-fact`
- Rationale: 用户明确指定 canonical 输出；仓库以 Submodule 聚合两个独立技术栈。
- Migration: create；不创建旧 TypeScript 或 Claude 兼容入口。
- Verification: Builder strict validator；检查 canonical 外不存在重复正文。

### DEC-002 存量采用 Ratchet

- Scope: `repository`
- Decision: 新代码与实质修改代码立即遵循 Target；存量偏差不得扩大，触及高风险边界时同步收紧。
- Source: `builder-baseline` + `repository-fact`
- Rationale: 前端类型规则宽松、测试门禁稀疏且存在大文件；全量迁移会制造无关变更。
- Migration: 按模块/变更文件推进，不发动全仓格式化或目录重写。
- Verification: PR diff 不增加 `any`/深依赖/无测试高风险逻辑；实际门禁结果记录。

### DEC-003 保留项目目录主轴

- Scope: `module:plus-ui-namewta`, `module:ruoyi-vue-plus-namewta`
- Decision: 前端保持 `api/views/components/hooks/store` 与业务域子目录；后端保持 Maven 模块和模块内 controller/domain/mapper/service 主轴。
- Source: `repository-fact`
- Rationale: 两个子模块已形成稳定、可导航结构；没有证据支持全量 package-by-feature 迁移。
- Migration: 新能力放入最接近的业务 scope；只有独立生命周期/依赖边界出现时新增模块。
- Verification: module map review；Maven build；Vite build。

### DEC-004 上游与产品分支隔离

- Scope: `repository`, both submodules
- Decision: `main` 承载产品；后端 `6.X`、前端 `6.X-Vue` 是只允许 fast-forward 的上游镜像；基线标签不移动。
- Source: `repository-fact`
- Rationale: `README.md` 与 customization map 明确规定同步模型。
- Migration: 上游更新先检查重叠面，再将必要提交同步到产品分支；父仓库最后更新指针。
- Verification: branch/ref review；按 customization map 逐项核对。

### DEC-005 NAMEWTA 安全合同优先

- Scope: authentication, authorization, Client, user type, menu, session and registration paths
- Decision: `docs/upstream/customization-map.md` 中“合并后必须保持”的约束均作为 MUST 合同。
- Source: `repository-fact`
- Rationale: 这些规则防止跨 Client 权限泄漏、身份混淆和上游同步回归。
- Migration: 触及热点时执行前后端和 SQL 契约测试/人工矩阵；不以 UI 隐藏替代服务端授权。
- Verification: customization map 路径 review；相关回归测试；认证验收矩阵。

### DEC-006 CRUD 查询 GET、变更 POST 并追踪日志

- Scope: 前后端 HTTP CRUD 接口及其生成模板
- Decision: 列表/分页、详情、树和下拉等只读查询使用 HTTP `GET`；新增、修改、删除、批量删除、状态变更和排序更新等变更操作使用 HTTP `POST`，每个 POST 业务接口必须使用安全、准确的 `@Log` 记录调用追踪；CRUD 不使用 PUT/PATCH/DELETE，非 CRUD 协议按自身合同处理。
- Source: `user-decision`
- Rationale: 统一查询与变更的接口语义，并通过操作日志保留 POST 调用的操作者、方法、URL、结果、耗时与失败状态等追踪信息。
- Migration: 新增 CRUD 立即执行；实质修改存量 CRUD 合同时，同步迁移该合同内受影响的前端请求、controller mapping、`@Log`、测试和文档，禁止继续新增 PUT/PATCH/DELETE CRUD 路由或无 `@Log` 的 POST 业务接口。生成器迁移后才能作为新 CRUD 骨架。
- Verification: 执行 `API-005` 的前后端静态搜索与契约/集成测试；生成分页和树表代表样例，确认 Java/Vue 两端查询为 GET、变更为 POST，且每个 POST controller 方法均有准确、安全的 `@Log`。

## 当前状态与目标状态

| ID | Current | Target | Migration / Verification |
|---|---|---|---|
| `MIG-TS-STRICT` | `strict: true` 但 `noImplicitAny`、`strictNullChecks`、`strictFunctionTypes` 关闭；lint 允许多类 any | 新/修改的 API、存储、环境变量和第三方响应边界使用精确类型、`unknown` + narrowing，不新增无理由 any | 变更文件 Ratchet；review、`pnpm lint` 与完整 `pnpm typecheck` 已是 active gate |
| `MIG-FE-TEST` | 已有 `pnpm test` 的 4 个 Vitest 与 `pnpm test:e2e` 的 2 个 Chromium 用例，覆盖 Client 上下文严格 Boolean 边界 | 新增纯逻辑、状态、权限或复杂交互时持续扩展对应层级测试 | 本地与 CI 同时运行 lint/typecheck/unit/E2E/build；覆盖率阈值仍待决策 |
| `MIG-BE-TEST` | 44 个 JUnit 测试源码文件；root 默认执行测试，Redis/MySQL/MinIO 用例通过属性门控接入真实服务 job | 认证、权限、事务、SQL 和公共 API 变更有回归测试，并在合并门禁执行 | `./mvnw test` 为默认门禁；core 产物因排除 demo/workflow 而在已测试后用 `-Dmaven.test.skip=true` 组装；真实服务由 CI 补证 |
| `MIG-BE-DS-TX` | 业务代码同时存在 Spring `@Transactional` 与 dynamic-datasource `@DSTransactional` | 新建或实质修改的业务事务统一使用 `@DSTransactional`，事务事件使用匹配的 `@DsTxEventListener` | 按变更文件 Ratchet；迁移时验证代理调用、回滚、数据源切换和提交阶段事件；不发动无需求证据的全仓替换 |
| `MIG-BE-DDL-BASE` | 历史、上游、第三方及部分 NAMEWTA 表未统一具备 `version/create_dept/create_time/create_by/update_time/update_by/del_flag` | 每个新建项目自有表均具备七个基础字段，并与 `BaseEntity`、`@Version`、`@TableLogic` 映射一致 | 新表立即执行；触及存量项目自有表时评估兼容迁移，未经迁移设计不直接补列；上游冻结和第三方 schema 不做无关整治 |
| `MIG-CI` | 已配置 `.github/workflows/quality-gates.yml`，含快照、前端、后端与真实服务四个 job | PR 稳定执行同源 lint/typecheck/test/build，并由分支保护设为 required checks | 本地完成静态验证；提交推送后观察首次 Actions 运行，再配置分支保护并记录远程证据 |
| `MIG-LARGE-FILES` | 前后端存在多个 700-1400 行文件 | 新功能避免继续混合职责，触及文件时提取可命名且可测试的边界 | 文件大小只作 review 触发器；不得为行数机械拆分 |
| `MIG-CRUD-METHOD-LOG` | 现有前端 API、后端 controller 和生成模板仍混用 GET/POST/PUT/DELETE，POST 日志约束尚未统一 | CRUD 只读查询使用 GET，变更使用 POST；CRUD 不使用 PUT/PATCH/DELETE；每个 POST 业务接口使用安全、准确的 `@Log` | 新增立即执行；存量按 CRUD 合同触及范围迁移，前后端、日志注解、测试、文档和生成模板同步收敛；按 `API-005` 验证 |

## 例外

### EX-001 前端 axios TypeScript 6 兼容断言

- Scope: `path:plus-ui-namewta/src/utils/request.ts`
- Rule: 边界不得使用无约束 `any`。
- Owner: `plus-ui-namewta` maintainers
- Reason: 当前源码记录 axios 1.x 默认导出与 TypeScript 6 的 `export=` 解析兼容问题。
- Risk: request/response/interceptor 类型错误可能被隐藏。
- Compensation: 将 `any` 限制在 axios adapter 文件；业务 API 必须使用 `AxiosPromise` 和明确 DTO；修改时审查所有断言。
- Created: existing repository state
- Expires/removal condition: axios/typescript 类型兼容方式允许删除 adapter 断言，或项目建立精确本地类型包装。
- Verification: `pnpm lint`, `pnpm build:prod`, review `src/utils/request.ts` 中 any 的扩散。

## 待确认

- `PENDING-CI-001`: 首次 GitHub Actions 远程运行通过后，将哪些 job 设为 PR/主分支 required checks，以及失败责任与重跑权限。
- `PENDING-FE-001`: 是否新增非写入式 format-check 与覆盖率阈值；typecheck、Vitest、Playwright 已成为 active gate。
- `PENDING-ARCH-001`: 是否为 Client 隔离、Maven 依赖方向增加自动架构测试；当前以 build 和精确 review 验证。
