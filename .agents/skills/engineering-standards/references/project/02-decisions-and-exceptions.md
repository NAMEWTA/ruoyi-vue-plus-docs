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

## 当前状态与目标状态

| ID | Current | Target | Migration / Verification |
|---|---|---|---|
| `MIG-TS-STRICT` | `strict: true` 但 `noImplicitAny`、`strictNullChecks`、`strictFunctionTypes` 关闭；lint 允许多类 any | 新/修改的 API、存储、环境变量和第三方响应边界使用精确类型、`unknown` + narrowing，不新增无理由 any | 变更文件 Ratchet；review 与 `pnpm lint`，待独立 typecheck gate 落地后接入 |
| `MIG-FE-TEST` | Vitest 仅为依赖信号，无 test script/config/test files | 新增纯逻辑、状态、权限或复杂交互时配套适合层级测试 | 在测试 harness 决策前，关键变更必须记录人工/集成验证；不得报告“测试通过” |
| `MIG-BE-TEST` | 有少量 JUnit 测试，但 root package 默认 `maven.test.skip=true` | 认证、权限、事务、SQL 和公共 API 变更有回归测试，并在合并门禁执行 | 可用 opt-in test 命令验证；是否取消默认 skip 见 pending decision |
| `MIG-BE-DS-TX` | 业务代码同时存在 Spring `@Transactional` 与 dynamic-datasource `@DSTransactional` | 新建或实质修改的业务事务统一使用 `@DSTransactional`，事务事件使用匹配的 `@DsTxEventListener` | 按变更文件 Ratchet；迁移时验证代理调用、回滚、数据源切换和提交阶段事件；不发动无需求证据的全仓替换 |
| `MIG-BE-DDL-BASE` | 历史、上游、第三方及部分 NAMEWTA 表未统一具备 `version/create_dept/create_time/create_by/update_time/update_by/del_flag` | 每个新建项目自有表均具备七个基础字段，并与 `BaseEntity`、`@Version`、`@TableLogic` 映射一致 | 新表立即执行；触及存量项目自有表时评估兼容迁移，未经迁移设计不直接补列；上游冻结和第三方 schema 不做无关整治 |
| `MIG-CI` | 未检测到 CI | PR 至少稳定执行非写入式 lint/compile/test/build 组合 | 先确认门禁与运行成本，再新增 CI；当前只记录本地命令结果 |
| `MIG-LARGE-FILES` | 前后端存在多个 700-1400 行文件 | 新功能避免继续混合职责，触及文件时提取可命名且可测试的边界 | 文件大小只作 review 触发器；不得为行数机械拆分 |

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

### EX-002 Maven 默认打包跳过测试

- Scope: `module:ruoyi-vue-plus-namewta`
- Rule: 打包门禁通常应执行测试。
- Owner: `ruoyi-vue-plus-namewta` maintainers
- Reason: root `pom.xml` 当前明确设置 `maven.test.skip=true`，且项目文档以此为当前构建事实。
- Risk: `./mvnw clean package` 不能证明测试通过。
- Compensation: 高风险变更另行运行 `./mvnw -Dmaven.test.skip=false test` 并记录结果。
- Created: existing repository state
- Expires/removal condition: 团队确认默认测试策略并调整 root POM/CI。
- Verification: 检查 `pom.xml` 属性；交付报告不得把 package 结果写成 test passed。

## 待确认

- `PENDING-CI-001`: PR/主分支是否建立 CI，以及前后端门禁、缓存、运行时版本和失败责任。
- `PENDING-FE-001`: 是否新增非写入式 format-check、独立 `vue-tsc` typecheck 与 Vitest test script；在确认前均不是 active gate。
- `PENDING-BE-001`: 是否移除 `maven.test.skip=true`，或只在 CI/高风险 profile 强制测试。
- `PENDING-ARCH-001`: 是否为 Client 隔离、Maven 依赖方向增加自动架构测试；当前以 build 和精确 review 验证。
