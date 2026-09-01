# 基座全量迁移 SOP

本 SOP 将当前 RuoYi-Vue-Plus / Plus-UI 聚合基座复制为一个可继续业务开发的新 monorepo。迁移读取基座当前工作树，但任何重命名、构建和修复都只能发生在 staging 中。

## 1. 冻结迁移合同

执行前形成并向用户展示一张确定映射表。不得只确认显示名称。

| 字段 | 示例 | 规则 |
|---|---|---|
| 源仓库根目录 | `/workspace/ruoyi-vue-plus-docs` | 当前基座根目录，只读 |
| 目标路径 | `/workspace/cde` | 必须不存在，不能位于源仓库内 |
| 项目键 | `cde` | 小写 kebab-case，用于目录与 artifact 前缀 |
| 显示名称 | `CDE` | UI、README、应用标题 |
| 产品短标识 | `CDE` | Logo 紧凑文字、favicon 备用内容、短标题 |
| 品牌资产 | `/workspace/brand/cde/` | 用户提供的主 Logo、紧凑 Logo、favicon；缺项必须显式决定 |
| 法律主体 | `CDE Team` | 版权主体、SpringDoc 联系人、package 作者 |
| 公开地址 | 无 | 官网、文档、支持、公开仓库；无地址时删除旧入口，不虚构 |
| 上游可见性 | 隐藏 | 默认不在产品 UI、默认 README、package 元数据中暴露旧基座入口 |
| 前端目录 | `cde-frontend` | 默认 `<project-key>-frontend` |
| 后端目录 | `cde-backend` | 默认 `<project-key>-backend` |
| Java 包名 | `com.cde` | 合法 Java package，不从带连字符的项目键直接猜测 |
| Maven group ID | `com.cde` | 通常与 Java 包名相同，但必须显式记录 |
| pnpm 作用域 | `@cde` | 合法 npm scope |
| 应用启动类 | `CDEApplication` | 合法 Java 标识符 |
| 运行命名空间策略 | 重命名已提交默认值 | 明确数据库、bucket、容器、网络和服务名的提交模板如何迁移 |
| 真实中间件策略 | 保留 | 默认保留本机/环境地址、账号、密码和未跟踪运行状态 |

品牌合同的完整字段与默认值见 [brand-migration.md](brand-migration.md)。若项目键不能无歧义转换为 Java/npm 标识符，或 Logo、公开地址、运行命名空间策略尚未决定，先向用户确认。禁止在写入后再决定包名或品牌。

## 2. 只读盘点与停止条件

1. 确认 source、两个产品目录、前端 lockfile、后端 POM/Maven Wrapper 存在。
2. 记录 source 根仓、前端和后端的 Git dirty 状态，仅作证据；不得 reset、clean、checkout、stash、commit 或更新 Submodule 指针。
3. 盘点 `.git` 目录、Submodule `.git` 文件、`.gitmodules` 和 disposable worktree。它们都不能进入目标。
4. 盘点项目自有 Java package、Maven reactor artifact、pnpm workspace scope、品牌 token、品牌图片/hash、SQL 增量 marker、CI 和启动脚本。
5. 盘点第三方 `org.dromara` 依赖。当前必须至少识别：
   - `org.dromara.warm` / Warm-Flow；
   - `org.dromara.sms4j`；
   - `org.dromara.mica.mqtt` 与 group `org.dromara.mica-mqtt`；
   - `org.dromara.easyes` 与 group `org.dromara.easy-es`。
6. 按 [brand-migration.md](brand-migration.md) 盘点前端、后端、数据、发布资产、生成产物和文档中的品牌面，并建立旧品牌 token/URL 清单。
7. target 已存在、target 位于 source 内、品牌合同未确认、source 发生并发重叠修改、所有权无法判断或空间不足时停止。

## 3. 创建 staging 副本

staging 使用 target 同级隐藏目录，确保最终可在同一文件系统原子改名。例如 `/workspace/.cde-migration`。

```bash
node .agents/skills/full-project-migration/scripts/stage-project-copy.mjs \
  --source /workspace/ruoyi-vue-plus-docs \
  --staging /workspace/.cde-migration
```

脚本复制当前工作树中的项目文件和有意义的未提交文件，但排除：

- 任意层级 `.git`、`.gitmodules`；
- `node_modules`、`target`、`dist`、coverage、测试报告和工具缓存；
- `.flattened-pom.xml`、日志、`.DS_Store`；
- `specdev-worktree` 等 disposable worktree；
- Speculo backup 与机器本地 Codex 配置。

复制失败时保留 partial staging，不自动删除。确认 source 的 Git 状态与复制前一致。

## 4. 展平为 monorepo

1. 将 `plus-ui-namewta` 改为合同中的 frontend dir。
2. 将 `ruoyi-vue-plus-namewta` 改为合同中的 backend dir。
3. 删除 Submodule 治理语义：`.gitmodules` 不存在，前后端无 `.git`，Git index 未来不得出现 mode `160000`。
4. README、AGENTS、工程规范、CI 和脚本文档统一描述一个 Git monorepo。
5. 将 `verify-submodules` 类门禁替换为 monorepo layout 门禁。普通构建脚本尽量通过自身路径解析根目录，避免在用户 `git init` 前无意义失败；只有 Git 结构门禁可以要求 Git。

## 5. 物理路径迁移

所有路径自底向上改名，避免父目录先改名导致遗漏。至少覆盖：

- 根、前端、后端项目目录；
- 后端 `ruoyi-admin/api/common/modules/extend` 及其子 artifact；
- `src/main/java`、`src/test/java` 下项目自有 package 目录；
- 应用启动类、Servlet initializer、测试类；
- 项目自有 Skill、模板、SQL 增量目录、发布制品和脚本名称；
- 前端项目自有组件、CLI 或配置文件中带旧品牌的物理名称。

完成后用 `find`/`rg --files` 审计旧 project key、`namewta`、项目自有 `ruoyi`/`dromara` 物理路径。保留的上游 SQL 文件名或第三方名称必须逐项解释。

## 6. 内容与命名空间迁移

按结构化边界分批修改并在每批后扫描：

1. Maven reactor：根 `groupId/artifactId/name`、parent、dependencyManagement、modules、profile 和最终 JAR 名。
2. Java：项目自有 `package/import`、注解扫描路径、反射字符串、MyBatis mapper、Spring 配置、启动类和测试。
3. 前端：root package name、`@scope/*`、workspace dependency、lockfile importer、architecture/OpenAPI CLI、环境标题和品牌展示。
4. SQL/发布：项目增量目录、marker、发布脚本、Docker/Compose 制品引用和说明文本。
5. 文档/治理：README、模块地图、工程 Skill、CI、启动脚本及 monorepo 约束。
6. 品牌：按 [brand-migration.md](brand-migration.md) 替换资产、可见文案、运行元数据、种子数据和公开入口，并建立可重复执行的残留门禁。

优先使用 XML/JSON/YAML/Java/TypeScript 对应的结构化工具或可审查的局部替换。批量替换只用于边界已经证明同质的文件集合。

### `org.dromara` 所有权规则

- 项目 reactor 的根 group、项目源码根 `org/dromara` 及其项目内 import 迁移为目标 Maven group/Java package。
- 第三方 Dromara group/import 必须保持原值；不要把其源码或 artifact 冒充为本项目包。
- `gitee.com/dromara/RuoYi-*`、Dromara 文档和上游署名只在法律要求、许可证、迁移映射或专用上游同步文档中保留。产品 UI、登录/注册、导航、首页、默认 README、package repository、SpringDoc contact 和帮助入口不得继续把它们作为产品链接。
- 替换后从 POM 提取第三方 groupId，并以编译结果验证白名单，不只依赖固定字符串列表。

### 配置保留规则

“真实中间件策略”为“保留”时，不改未跟踪运行状态、真实 JDBC/Redis/MinIO/MQTT 地址、账号、密码或 CI 临时凭据。提交的示例值、数据库/bucket/container/network/service 名是否迁移，由单独的“运行命名空间策略”决定。禁止为追求字符串归零而改写真实环境秘密或破坏既有连接。

### 品牌迁移规则

- 必须用用户确认的资产替换 Logo、紧凑 Logo、favicon 和登录/注册视觉；不得只改 `<title>`。
- 必须清理旧基座的导航按钮、首页卡片、外部仓库/文档链接、社交登录入口、作者和联系信息。
- 必须同步后端 Banner、SpringDoc、应用描述、默认账号展示名以及发布模板中的产品标识。
- 必须处理数据库基座与升级路径中的可见菜单、外链、用户展示名、社会化平台和产品自有资源配置。当前六文件基座直接修改；已有环境通过源/目标 Git Tag 差异形成升级 SQL。
- 必须扫描源码和实际生产构建产物；仅源码 `rg` 通过不构成品牌验收。
- 必须将保留命中限制在第三方坐标、许可证/NOTICE、不可变历史或用户明确保留的 runtime state，并为每项记录证据。

### SQL 历史摘要测试

品牌/marker 重命名会改变历史 DML 字节数和 SHA-256。若测试固定保护迁移 marker 前的历史前缀：

1. 重新定位新 marker 的准确 byte offset；
2. 保持与旧测试相同的语义边界（例如 marker 前空行），不要继续使用旧固定字节数；
3. 计算新边界的 SHA-256；
4. 同时更新 byte count 与 hash；
5. 运行定向测试和完整 Reactor 测试。

禁止仅把失败输出中的 hash 粘贴进测试，而不验证边界。

## 7. 静态审计

至少检查：

- 无 `.git`、`.gitmodules`、gitlink 或嵌套仓库；
- 无旧根/前端/后端路径和旧 pnpm scope；
- 项目自有 Java 源均位于目标 package；
- 剩余 `org.dromara` 只属于已证明的第三方依赖或上游引用；
- 当前产品面无旧 Logo、旧 favicon、旧作者、旧基座名称、旧仓库/文档链接或旧品牌社交入口；
- 剩余 RuoYi/Dromara/GitHub/Gitee 命中均已按品牌保留清单分类，不存在未解释命中；
- README、CI、工程规范不再宣称三仓/Submodule；
- 启动和发布脚本引用新的 module、JAR、class sentinel 与目录；
- middleware 值与迁移合同一致。

结构检查命令示例：

```bash
node <source>/.agents/skills/full-project-migration/scripts/verify-migration-layout.mjs \
  --root <staging> \
  --frontend <frontend-dir> \
  --backend <backend-dir> \
  --forbid-name ruoyi-vue-plus-docs \
  --forbid-name plus-ui-namewta \
  --forbid-name ruoyi-vue-plus-namewta \
  --forbid-name namewta
```

该脚本只裁决结构不变量；文本命中仍需语义审查，并由迁移后仓库内的品牌残留 guard 独立裁决。

## 8. 构建与测试

在 staging 中安装依赖。不得复用 source 的 `node_modules`、`target` 或本地构建输出。

后端最低门禁：

```bash
./mvnw test
./mvnw clean package -DskipTests
./mvnw clean package -Pbundle-core -Dmaven.test.skip=true
```

同时运行仓库已有的 full/core admin bundle 内容检查。单模块 Maven 测试若依赖未 install 的新 group artifact，应使用 `-am` 或完整 Reactor，不能把公共仓库找不到新内部 artifact 误报为源码失败。

前端最低门禁：

```bash
pnpm install --frozen-lockfile
pnpm architecture:check
pnpm architecture:test
pnpm lint
pnpm typecheck
pnpm test
pnpm build:dev
pnpm build:prod
pnpm test:e2e
```

仓库级门禁：

```bash
node --test release-artifacts/tests/release-config.test.mjs
node --test .agents/skills/full-project-migration/scripts/migration-tools.test.mjs
```

品牌迁移必须运行 Playwright：至少验证登录/注册、登录后首页、导航栏、document title、favicon、Logo、外部链接和旧品牌零可见；同时保存桌面与移动 viewport 截图并检查无重叠、空白资源或破图。Docker 外部服务测试仍按风险运行。未运行或按条件 skipped 必须单独报告，不能写成 passed。

## 9. 清理、发布与交接

1. 只清理 staging 中本轮生成的 `node_modules`、`target`、`dist`、coverage、测试报告和 `.flattened-pom.xml`。
2. 重跑结构审计、旧标识审计、品牌残留 guard、生产构建产物扫描和 Shell/Node 语法检查。
3. 确认 source 状态与执行前一致。
4. 确认 final target 仍不存在后，在同一文件系统将 staging 原子改名为 target。
5. 不执行 `git init`、commit、remote 配置、push、部署或数据库迁移。
6. 交接报告包含映射、品牌合同、资产来源、旧品牌保留白名单、数据升级说明、实际命令/结果、截图、skipped 项、目标大小和 Git-free 证明。

任一必需门禁失败时不得发布最终目标。保留暂存目录并报告精确失败，等待修复或用户授权清理。
