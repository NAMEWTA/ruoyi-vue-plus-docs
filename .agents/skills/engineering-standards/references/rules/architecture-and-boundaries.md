# 架构、目录与依赖边界

### ARCH-001 Submodule 所有权

Scope: `repository`, `module:plus-ui-namewta`, `module:ruoyi-vue-plus-namewta`

Level: MUST

Source: `repository-fact` (`README.md`, `.gitmodules`)

Rule: 前后端变更在各自 Submodule 中实现、验证和形成独立逻辑提交；父仓库只记录文档与经过选择的 Submodule commit 指针。不得把子模块源码复制进父仓库或跨目录建立隐式构建依赖。

Verification: 分别检查父仓库及两个子模块 `git status`; review 父仓库 diff 只含预期文档/指针；在对应子模块工作目录运行门禁。

### ARCH-002 后端依赖方向

Scope: `module:ruoyi-vue-plus-namewta`

Level: MUST

Source: `repository-fact` (root and child `pom.xml`)

Rule: 可部署应用负责组装，业务模块依赖 `ruoyi-api` 与最小 `ruoyi-common-*` 能力，`ruoyi-api` 只依赖稳定基础合同，common 不反向依赖业务模块。跨模块使用公开类型/服务合同，不深用对方 implementation、mapper 或内部实体。

Verification: `./mvnw clean package`; review 变更模块的 `pom.xml` 与 import；新增依赖说明方向、必要性和替代方案。

### ARCH-003 前端边界

Scope: `module:plus-ui-namewta`

Level: MUST

Source: `repository-fact` (`apps/**`, `packages/domains/**`, `packages/web-domains/**`, `packages/platform/**`, `packages/adapters/**`, `tooling/architecture/**`)

Rule: App 拥有终端 Client、布局、路由装配和部署；domain 拥有无界面模型/服务并只依赖抽象端口；web-domain 拥有 Vue 表现但不拥有 App 全局单例；adapter 实现平台端口。工作区内部只经公开 exports 导入，禁止 App 互相导入、包深层导入、跨包相对导入和通过 alias 绕过依赖方向。

Verification: `pnpm architecture:check`; `pnpm architecture:test`; `pnpm lint`; `pnpm typecheck`; `pnpm build:prod`; review App composition、import graph、runtime port 与状态所有权。

### ARCH-004 Public contract 与跨端顺序

Scope: `public-api:ruoyi-api`, HTTP/JSON, SQL/schema, `path:plus-ui-namewta/packages/api-contracts/**`, `path:plus-ui-namewta/packages/domains/**`

Level: MUST

Source: `repository-fact` (`plan/update.md`, `docs/upstream/customization-map.md`)

Rule: JSON 字段、HTTP 路径、认证 header、数据库 schema 和初始化 SQL 都是兼容合同。跨端变更先形成向后兼容或同步可交付的后端合同，再更新前端消费者；破坏性变更必须给出迁移和回滚。

Verification: 对照 BO/VO/controller 与前端 types/API；运行两端构建；执行相关契约/人工验收；review SQL 顺序和兼容窗口。

### ARCH-005 目录与命名保持局部一致

Scope: `repository`

Level: SHOULD

Source: `repository-fact` + `builder-baseline`

Rule: 保持模块地图中的稳定主轴。命名表达业务和边界；只有形成独立生命周期、依赖方向或明显导航价值时新增目录/模块。大文件是职责 review 触发器，不是机械拆分阈值。

Verification: review 新路径能映射到模块职责；检查是否新增含义模糊的 `utils/helpers/common`；触及大文件时说明保留或提取职责的理由。

### ARCH-006 生成器与生成物分离

Scope: `path:plus-ui-namewta/**`, `path:ruoyi-vue-plus-namewta/**`

Level: MUST

Source: `repository-fact` + manual discovery correction

Rule: 前端根级 `gen/**` 已退役；`tooling/generators` 当前只是 README 占位。标准模板资产统一位于父仓库 `docs/fm/**`；后端 `ruoyi-modules/ruoyi-gen/**` 是待退役的可编辑运行实现，不再拥有模板。`target/**`、`.flattened-pom.xml`、App 自动导入声明和 `packages/api-contracts` 生成结果是生成物，应通过源配置、OpenAPI 快照或生成器修复，不直接手改。

Verification: review 文件头、插件配置和生成来源；`git diff` 不含意外 build output；修改生成结果时同时指出源模板和生成命令。
