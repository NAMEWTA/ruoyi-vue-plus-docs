# 项目画像

## 身份

- Project: `ruoyi-vue-plus-docs`
- Repository root: 当前包含本 Skill 的 Git 工作区根目录
- Topology: 多根、多语言聚合仓库；父仓库通过 Git Submodule 管理两个独立产品仓库
- Inventory schema: `1.0.0`
- Discovery baseline: Builder 确定性扫描访问 2338 个文件、识别 964 个源码文件，未截断

## 事实来源

- `README.md`、`.gitmodules`：父仓库只聚合 `plus-ui-namewta` 与 `ruoyi-vue-plus-namewta`，两个子模块独立开发和发布。
- `docs/upstream/customization-map.md`：NAMEWTA 相对上游的认证、权限、Client、菜单、SQL 和前端契约权威清单。
- `plus-ui-namewta/package.json`、`pnpm-lock.yaml`、`tsconfig.json`、`vite.config.ts`、`.oxlintrc.json`：Vue 3.5.40、TypeScript 6、Vite 8、Pinia 4、pnpm 10、Node `>=20.19.0`、浏览器运行时。
- `plus-ui-namewta/src/main.ts`、`src/views/**`、`src/api/**`、`src/store/**`：Vue 3 Composition API、`<script setup lang="ts">`、API/type 分离、Pinia 和 Element Plus 的主导实践。
- `plus-ui-namewta/src/hooks/**`、`src/views/demo/{demo,tree}/index.vue`：loading、dialog、搜索重置、表格选择、日期范围、树表展开和页面生命周期的当前复用合同。
- `ruoyi-vue-plus-namewta/ruoyi-modules/ruoyi-gen/src/main/resources/fm/{java,vue}/**`：标准 CRUD、树结构、状态/排序和前后端合同的当前生成基线。
- `ruoyi-vue-plus-namewta/pom.xml`、`mvnw`、各模块 `pom.xml`：Java 21、Spring Boot 4.1.0、Maven Wrapper、41 个 POM 描述符；根 reactor 始终构建 41 projects，`bundle-full/core` 控制最终 admin fat jar 的业务模块集合。
- `ruoyi-vue-plus-namewta/ruoyi-admin/src/main/java/org/dromara/DromaraApplication.java`、`ruoyi-modules/ruoyi-demo/**` 及 `ruoyi-modules/ruoyi-system/**`：Spring MVC、BO/VO/entity、service、mapper、Bean Validation、数据权限、事务和 Sa-Token 主导实践。
- `ruoyi-vue-plus-namewta/pom.xml`、`ruoyi-common/ruoyi-common-mybatis/**`：dynamic-datasource 4.5.0、`@DSTransactional`、`BaseEntity` 自动填充字段、VO mapper 与链式查询的公共基础设施合同。
- `ruoyi-vue-plus-namewta/script/sql/ry_vue.sql` 的 `test_demo`、`ruoyi-modules/ruoyi-demo/**/TestDemo*`：新建项目自有业务表的乐观锁、审计字段、逻辑删除及 entity 映射基线。
- `ruoyi-vue-plus-namewta/ruoyi-common/ruoyi-common-translation/**`：批量翻译和 JSON 响应增强的公共基础设施合同。
- `plan/update.md`：当前端到端构建命令、提交拆分、前后端顺序和禁止全仓无关格式化的项目决策证据。
- `.github/workflows/quality-gates.yml`、`scripts/ci/**`：父仓库配置子模块快照校验、前端静态/单元/E2E/构建、后端测试与双 bundle 打包，以及 Redis/MySQL/MinIO 真实服务验收。远程运行记录需在提交推送后由 GitHub Actions 产生。

## 工具链与质量门禁

| Scope | Working directory | Command | Responsibility | Source | Status |
|---|---|---|---|---|---|
| `module:plus-ui-namewta` | `plus-ui-namewta` | `pnpm lint` | Oxlint 检查 `src`、`e2e` 与 Playwright 配置 | `package.json` | active local/CI gate |
| `module:plus-ui-namewta` | `plus-ui-namewta` | `pnpm typecheck` | TypeScript/Vue 非写入式类型检查 | `package.json`, `tsconfig.json` | active local/CI gate |
| `module:plus-ui-namewta` | `plus-ui-namewta` | `pnpm test` | Vitest 单元测试（当前 4 个） | `package.json`, `src/**/*.test.ts` | active local/CI gate |
| `module:plus-ui-namewta` | `plus-ui-namewta` | `pnpm test:e2e` | Playwright Chromium 登录上下文验收（当前 2 个） | `playwright.config.ts`, `e2e/**` | active local/CI gate |
| `module:plus-ui-namewta` | `plus-ui-namewta` | `pnpm build:prod` | Vite 生产构建 | `package.json`, `plan/update.md` | active local gate |
| `module:plus-ui-namewta` | `plus-ui-namewta` | `pnpm fmt` | Oxfmt 写入式格式化 | `package.json` | active tool, not a check gate |
| `module:ruoyi-vue-plus-namewta` | `ruoyi-vue-plus-namewta` | `./mvnw test` | 默认执行 JUnit/Surefire 测试 | `pom.xml`, Maven Wrapper | active local/CI gate |
| `module:ruoyi-vue-plus-namewta` | `ruoyi-vue-plus-namewta` | `./mvnw clean package -DskipTests` | `bundle-full` 全量组合打包 | `pom.xml`, `ruoyi-admin/pom.xml` | active local/CI gate |
| `module:ruoyi-vue-plus-namewta` | `ruoyi-vue-plus-namewta` | `./mvnw clean package -Pbundle-core -Dmaven.test.skip=true` | 核心平台组合打包；clean 防止 profile 产物污染，测试由前置 `./mvnw test` 承担 | `ruoyi-admin/pom.xml` | active local/CI gate |
| `workspace-parent` | `.` | `scripts/ci/verify-admin-bundle.sh full\|core` | 断言最终 admin jar 的必需/可选模块集合 | `.github/workflows/quality-gates.yml` | active local/CI gate |
| `workspace-parent` | `.` | `scripts/ci/verify-submodules.sh` | 校验父仓库 gitlink 与检出子模块 SHA 一致 | `.github/workflows/quality-gates.yml` | active CI gate; local dirty tree预期失败 |
| `workspace-parent` | `.` | `scripts/ci/run-external-services.sh` | Docker 启动 Redis 8、MySQL 8.4、MinIO 并运行真实集成测试 | `.github/workflows/quality-gates.yml` | active CI gate; local Docker unavailable |

父仓库已有 GitHub Actions 工作流候选，但只有提交、推送并在仓库分支保护中设为 required check 后，才能称为远程合并门禁。当前本地可执行门禁与 CI 命令保持同源；外部服务 job 因本机无 Docker 尚未本地实跑。

## 排除与冻结区域

- 依赖/缓存/构建输出：`.git/**`、`.pnpm-store/**`、`**/node_modules/**`、`**/dist/**`、`**/target/**`、`**/.flattened-pom.xml`、coverage 和工具缓存。
- 生成声明：`plus-ui-namewta/src/types/auto-imports.d.ts` 及由 Vite 插件生成的同类声明；修改生成器配置后重新生成，不手改结果。
- 代码生成器源码不是生成物：`plus-ui-namewta/gen/**`、`src/api/tool/gen/**`、`src/views/tool/gen/**` 与后端 `ruoyi-modules/ruoyi-gen/**` 均为可编辑的模板/功能源码。Builder 扫描器对这些含 `gen` 路径的 generated 推断已由人工证据覆盖。
- 上游冻结分支：后端 `6.X`、前端 `6.X-Vue` 只允许 fast-forward，不承载业务提交；产品变更进入各自 `main`。
- 上游基线标签 `namewta-base-upstream-6x`、`namewta-base-upstream-6x-vue` 不移动。
- `ruoyi-vue-plus-namewta/script/sql/ry_vue.sql` 是上游初始化脚本；NAMEWTA 增量写入 `script/sql/namewta/**`，不得回写上游脚本。
- SnailJob、WarmFlow、AI 等上游或第三方拥有的 schema 不是 NAMEWTA 表结构整治目标；只在项目明确接管其 schema 时应用项目自有建表规则。

## 未知与冲突

- `pending-decision`: GitHub Actions 工作流尚未通过提交后的远程运行验证，也尚未确认分支保护 required checks；在此之前不得报告为已强制的远程合并门禁。
- `pending-decision`: 前端仍缺少非写入式 format-check 与统一覆盖率阈值；现有 lint/typecheck/unit/E2E/build 已形成可执行基线。
- `verification-gap`: 外部服务验收脚本需要 Docker；本机未安装 Docker，当前只完成脚本语法、测试编译和属性门控验证。
- `ratchet`: `tsconfig.json` 开启 `strict`，但关闭 `noImplicitAny`、`strictFunctionTypes`、`strictNullChecks`；`.oxlintrc.json` 同时关闭显式 any 等规则。新/修改边界收紧，存量不全仓重写。
- 当前没有声明统一覆盖率、ArchUnit、Java formatter、Checkstyle/SpotBugs；不得假装这些工具已启用。E2E 已覆盖 Client 上下文真假值边界，但不是全业务回归套件。
