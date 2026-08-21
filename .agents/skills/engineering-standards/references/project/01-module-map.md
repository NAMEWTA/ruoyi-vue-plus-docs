# 模块地图

## 顶层 Scope

| ID | Path | Language / framework / runtime | Build | Source / test roots | Public entrypoint | Quality gates | Evidence |
|---|---|---|---|---|---|---|---|
| `workspace-parent` | `.` | Markdown、Git/Submodule 治理 | Git | `docs/**`, `plan/**` | `README.md` | none | `README.md`, `.gitmodules`; high |
| `plus-ui` | `plus-ui-namewta` | TypeScript, Vue 3, Pinia, Browser | pnpm, Vite, Oxlint | `src/**`; tests absent | `src/main.ts` | `pnpm lint`, `pnpm build:prod` | `package.json`, `src/App.vue`; high |
| `backend-root` | `ruoyi-vue-plus-namewta` | Java 21, Spring Boot 4, JVM | Maven Wrapper | Maven modules below | `ruoyi-admin` and three extension applications | `./mvnw clean package`; opt-in tests | root `pom.xml`; high |

## 后端 Maven 模块

下表每一行都是唯一 `module:<path>` scope。未另行标注时，语言为 Java、运行时为 JVM、构建为 Maven，源码根为 `src/main/java`（存在资源时同时含 `src/main/resources`），测试根为空，generated path 为空，证据为该路径 `pom.xml` 与源码，置信度 high。

| ID / path suffix under `ruoyi-vue-plus-namewta/` | Role / framework | Public entrypoint | Test / generated notes |
|---|---|---|---|
| `ruoyi-admin` | Spring Boot 可部署主应用，组装 api/common/modules | `org.dromara.DromaraApplication` | `src/test/java`; JUnit 示例/基础测试 |
| `ruoyi-api` | 跨业务模块公开 API/DTO 合同 | `org.dromara.system.api.*` | none |
| `ruoyi-common` | common 聚合 POM | none | no source root |
| `ruoyi-common/ruoyi-common-bom` | common 版本/BOM 合同 | none | no source root |
| `ruoyi-common/ruoyi-common-ai` | AI 公共配置/适配 | package surface | none |
| `ruoyi-common/ruoyi-common-core` | Spring 核心类型、配置、通用合同 | package surface | none |
| `ruoyi-common/ruoyi-common-doc` | SpringDoc/Javadoc 适配 | package surface | none |
| `ruoyi-common/ruoyi-common-elasticsearch` | Elasticsearch 适配 | package surface | none |
| `ruoyi-common/ruoyi-common-encrypt` | Spring/MyBatis 加解密适配 | package surface | none |
| `ruoyi-common/ruoyi-common-excel` | Excel 公共 API | package surface | none |
| `ruoyi-common/ruoyi-common-job` | Spring 调度集成 | package surface | none |
| `ruoyi-common/ruoyi-common-json` | Spring/Jackson JSON 合同 | package surface | none |
| `ruoyi-common/ruoyi-common-liteflow` | Spring LiteFlow 集成 | package surface | none |
| `ruoyi-common/ruoyi-common-log` | 日志/审计切面 | package surface | none |
| `ruoyi-common/ruoyi-common-mail` | 邮件适配 | package surface | none |
| `ruoyi-common/ruoyi-common-mcp` | MCP 集成 | package surface | none |
| `ruoyi-common/ruoyi-common-mqtt` | Spring MQTT 集成 | package surface | none |
| `ruoyi-common/ruoyi-common-mybatis` | Spring/MyBatis 数据访问基础 | package surface | none |
| `ruoyi-common/ruoyi-common-oss` | 对象存储适配 | package surface | none |
| `ruoyi-common/ruoyi-common-push` | Spring 推送/WebSocket/SSE 基础 | package surface | none |
| `ruoyi-common/ruoyi-common-redis` | Spring/Redis 缓存、锁与限流 | package surface | none |
| `ruoyi-common/ruoyi-common-satoken` | Spring/Sa-Token 认证基础 | package surface | none |
| `ruoyi-common/ruoyi-common-security` | 安全注解/权限合同 | package surface | none |
| `ruoyi-common/ruoyi-common-sensitive` | 敏感数据处理 | package surface | none |
| `ruoyi-common/ruoyi-common-sms` | Spring SMS 集成 | package surface | none |
| `ruoyi-common/ruoyi-common-social` | 社交登录适配 | package surface | none |
| `ruoyi-common/ruoyi-common-translation` | 翻译/字典适配 | package surface | none |
| `ruoyi-common/ruoyi-common-web` | Spring MVC、错误映射、Actuator 基础 | package surface | none |
| `ruoyi-extend` | 独立应用聚合 POM | none | no source root |
| `ruoyi-extend/ruoyi-monitor-admin` | Spring Boot Monitor 可部署应用 | `MonitorAdminApplication` | none |
| `ruoyi-extend/ruoyi-snailai-server` | Spring Boot SnailAI 可部署应用 | `SnailAiServerApplication` | none |
| `ruoyi-extend/ruoyi-snailjob-server` | Spring Boot SnailJob 可部署应用 | `SnailJobServerApplication` | none |
| `ruoyi-modules` | 业务模块聚合 POM | none | no source root |
| `ruoyi-modules/ruoyi-ai` | AI 业务能力 | package surface | none |
| `ruoyi-modules/ruoyi-demo` | 示例/集成演示能力 | package surface | none |
| `ruoyi-modules/ruoyi-gen` | 代码生成器实现与模板处理 | package surface | 名称含 gen，但为手写可编辑源码，不是 generated path |
| `ruoyi-modules/ruoyi-job` | 业务任务执行器 | package surface | none |
| `ruoyi-modules/ruoyi-system` | 用户、Client、角色、菜单、权限等核心系统能力 | controller/service/mapper contracts | none |
| `ruoyi-modules/ruoyi-workflow` | WarmFlow 工作流能力 | controller/service contracts | none |

## 依赖方向

- 父仓库只依赖子模块 commit 指针；前后端源码不能通过父仓库路径形成隐式构建依赖。
- 前端依赖后端 HTTP/JSON 合同，不深耦合 Java 类型或数据库 schema；API transport 类型集中在 `src/api/**`。
- 后端 Maven 方向为：聚合/可部署应用 -> `ruoyi-modules`/`ruoyi-api`/`ruoyi-common-*`；业务模块可依赖 `ruoyi-api` 和所需 common 能力，common 不反向依赖业务模块。
- `ruoyi-api` 是跨业务模块合同面；`ruoyi-common-*` 只承载可复用基础能力，禁止成为绕过业务边界的容器。
- `ruoyi-admin` 负责组装，不承载可复用领域实现；`ruoyi-gen` 仅在 `gen` Maven profile 中接入主应用。
- 认证/权限/菜单跨层契约以 `docs/upstream/customization-map.md` 为额外硬边界。

## 实现基线与成熟样例

| Scope | Baseline | Mature implementation evidence | Usage |
|---|---|---|---|
| 前端标准分页 CRUD | 后端 `ruoyi-gen/fm/vue/{api,types,index}.ftl` | `plus-ui-namewta/src/views/demo/demo/index.vue`、`src/api/demo/demo/**` | 新建常规 CRUD 时建立 API、类型、页面骨架，再按同模块能力修正 |
| 前端树表 CRUD | 后端 `ruoyi-gen/fm/vue/index-tree.vue.ftl` | `plus-ui-namewta/src/views/demo/tree/index.vue`、`src/api/demo/tree/**` | 保持非分页列表、树转换、父节点选择和展开状态语义 |
| 前端复用状态 | 无单一模板替代 | `plus-ui-namewta/src/hooks/**` | loading、dialog、搜索重置、选择、日期范围、高度和树状态先复用现有 composable |
| 后端标准 CRUD | `ruoyi-gen/fm/java/**` | `ruoyi-modules/ruoyi-demo/**/TestDemo*` | 对照 entity/BO/VO/mapper/service/controller 全链路及数据权限覆盖 |
| 后端复杂系统能力 | 生成器只提供起点 | `ruoyi-modules/ruoyi-system/**`、`ruoyi-modules/ruoyi-workflow/**` | 关系表、缓存、Client、事务、条件装配和工作流逻辑按同模块成熟实现增量修改 |
| 数据访问与翻译 | 公共 API 本身 | `ruoyi-common-mybatis`、`ruoyi-common-translation` | 复用 `BaseMapperPlus`、`QueryBuilder`、fresh chain wrapper 与批量翻译合同 |

## 路由

- `path:plus-ui-namewta/**` -> 通用相关规则 + TypeScript core + Vue + Browser。
- `path:plus-ui-namewta/src/api/**`、`src/views/**`、前端生成模板 -> 追加前端 CRUD/API 实现规范。
- `path:ruoyi-vue-plus-namewta/**` -> 通用相关规则 + Java core；Spring 应用/配置/Web scope 再加 Spring Boot；事务、数据源切换和 DDL/schema scope 追加数据源事务与建表规范。
- `path:ruoyi-vue-plus-namewta/ruoyi-modules/**` 中的 CRUD/mapper/service/controller，以及 `ruoyi-common-mybatis`、`ruoyi-common-translation` -> 追加后端 CRUD/查询实现规范。
- `path:docs/upstream/**`、Submodule 指针或上游同步 -> 架构边界 + 安全数据 + 评审交付。
- SQL/表结构变化 -> 安全数据 + Java/Spring contract + 数据源事务与建表 + customization map；新建项目自有表应用基础字段基线，同时保持 `ry_vue.sql` 冻结。
- 跨前后端 API 变化 -> 同时加载 TypeScript、Java、测试、安全和交付规则，并以后端兼容合同先行。
