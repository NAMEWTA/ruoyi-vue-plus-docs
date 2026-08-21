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

Source: `repository-fact` (`src/api`, `src/views`, `src/store`, `src/utils/request.ts`)

Rule: HTTP transport 与 DTO 位于 `src/api/**`，页面/组件不直接拼装重复 request 配置；全局状态只承载跨页面生命周期状态，瞬时表单和请求状态留在 feature/component；`@/` alias 不能绕过业务边界或制造循环。

Verification: `pnpm lint`; `pnpm build:prod`; review import graph、API 调用位置和 Pinia state 所有权。

### ARCH-004 Public contract 与跨端顺序

Scope: `public-api:ruoyi-api`, HTTP/JSON, SQL/schema, `path:plus-ui-namewta/src/api/**`

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

Rule: `gen/**`、`src/**/tool/gen/**` 和 `ruoyi-modules/ruoyi-gen/**` 是可编辑生成器源码；`target/**`、`.flattened-pom.xml`、自动导入声明等才是生成物。生成物通过其源配置/模板修复，不直接手改。

Verification: review 文件头、插件配置和生成来源；`git diff` 不含意外 build output；修改生成结果时同时指出源模板和生成命令。
