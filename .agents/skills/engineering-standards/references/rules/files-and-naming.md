# 文件、目录与命名

### FILES-001 按模块与文件角色命名

Scope: `repository`

Level: SHOULD

Source: `repository-fact` + `builder-baseline`

Rule: 名称表达业务、职责和边界，并在同一模块的同一文件角色内保持一致。不得用一套跨语言大小写规则覆盖 TypeScript、Java、SQL 和文档；具体文件、类型、函数、组件与测试命名由对应语言 reference 收窄。

Verification: review 新路径能映射到模块地图和语言规则；同一 scope 出现第二套命名时记录证据、迁移或例外；检查含义模糊的新增 `helpers/common/misc/manager`。

### FILES-002 保持目录主轴与公开边界

Scope: `module:plus-ui-namewta`, `module:ruoyi-vue-plus-namewta`

Level: MUST

Source: `repository-fact` + `user-decision` (`DEC-003`)

Rule: 前端保持 `apps`、`packages/domains`、`packages/web-domains`、`packages/platform`、`packages/adapters`、`packages/web-kit`、`packages/api-contracts` 与 `tooling` 的所有权主轴。后端标准业务模块保持以下主轴，不能为单个用例任意发明平级 `application/repository/manager/facade` 等目录：

```text
src/main/java/org/dromara/<module>/<business>/
  controller/
    admin/          # 真实管理端受保护接口
    anonymous/      # 真实 @SaIgnore 匿名接口
  domain/
    <Entity>.java
    bo/
    vo/
  mapper/
  service/
    impl/
src/main/resources/mapper/<module>/
```

只有真实存在并有独立合同的其他客户端才建立 `controller/<actual-client>`；不要预建未来客户端目录。已登录自服务接口若不属于管理端，先在业务规格中裁决访问面。只有形成稳定职责、独立生命周期、所有权或依赖方向时新增目录/模块；`index`/barrel 只用于已有公开入口或框架/生成器合同。

Verification: module map review；检查新增目录的 owner、依赖和导航价值；扫描 controller 路径与 `@SaIgnore` 是否一致；前端运行 `pnpm lint`、`pnpm typecheck`、`pnpm build:prod`，后端运行适用 Maven 门禁。

### FILES-003 保留生成器、框架与大小写合同

Scope: `path:plus-ui-namewta/**`, `path:ruoyi-vue-plus-namewta/**`

Level: MUST

Source: `repository-fact` (`tsconfig.json`, `TemplateEngineUtils.getFileName`, Maven/package layout)

Rule: 生成器和框架要求的 `index.ts`、`types.ts`、`index.vue`、`package-info.java` 等特殊文件名必须保留；import、package、模板输出和磁盘路径大小写完全一致。重命名 public API、序列化字段、路由、数据库对象或生成路径前先处理兼容影响。

Verification: `git diff --check`；大小写敏感路径 review；运行对应 typecheck/build；生成路径变化时对照生成器源码与代表输出，确认没有只在默认不区分大小写文件系统上成立的 import。

### FILES-004 文件大小只触发职责审查

Scope: `repository`

Level: SHOULD

Source: `repository-fact` + `builder-baseline`

Rule: 大文件触发职责、依赖数和修改频率审查，不按行数机械拆分。提取必须形成可命名、可测试或有明确生命周期的解析、验证、I/O、领域、状态、视图或平台边界。

Verification: review 提取前后的职责与依赖方向；新增文件名能准确描述被提取能力；执行相关行为测试，避免只移动代码。
