# NAMEWTA FreeMarker 模板

本目录是项目代码模板的唯一权威位置，保存当前有效的 Java、Vue、React、MyBatis XML 与菜单 SQL 模板。历史版本通过 Git 查询，不在目录内保留副本。

## 状态

- 本目录是独立静态模板资产，不属于任何运行时 classpath 资源。
- 运行时代码生成器已从基座物理删除；AI 与开发者直接参考本目录完成 CRUD 实现和审查。
- 使用模板时必须显式读取 [catalog.json](./catalog.json)，按 [context-contract.md](./context-contract.md) 提供上下文。
- 模板只生成资源切片，不覆盖已有模块的共享入口、包清单或 App 组合文件。

## Vue 输出

Vue 模板面向 `plus-ui-namewta` 当前多 App 架构：

```text
packages/domains/<module>/src/<resource>/
  index.ts
  service.ts
  transport.ts
  types.ts

packages/web-domains/<module>/src/<resource>/
  <BusinessName>Page.vue
  composables.ts
  index.ts
  registration.ts
  runtime.ts
```

domain 保持无界面并通过 `HttpClient` 端口访问 HTTP；web-domain 通过类型化 runtime 获得 service、确认、反馈、字典、下载以及可选宿主组件。资源 registration 仍需由所属 web-domain manifest 汇总，并由目标 App 显式选择。

具体的薄入口、共享类型、树语义、异步生命周期、package exports 与 App 人工接入清单见 [vue/README.md](./vue/README.md)。

## HTTP 合同

- 列表、详情、树和选项等只读操作使用 GET。
- 新增、修改、删除、状态和排序等业务变更使用 POST。
- Java POST 业务接口生成准确的 `@Log`；修改与删除使用 `/edit`、`/remove/{ids}` 避免与新增和详情路径冲突。

## 后端模板映射

标准 CRUD 必须按职责使用对应模板，不能把多层职责压进自定义文件：

| 目标职责 | 模板 |
|---|---|
| Entity | `java/domain.java.ftl` |
| BO | `java/bo.java.ftl` |
| VO | `java/vo.java.ftl` |
| Mapper | `java/mapper.java.ftl` |
| Service 接口 | `java/service.java.ftl` |
| Service 实现 | `java/serviceImpl.java.ftl` |
| Controller | `java/controller.java.ftl` |
| 自定义 Mapper XML | `xml/mapper.xml.ftl` |

`sql/mysql.sql.ftl` 只提供菜单 DML 片段。NAMEWTA 不生成 Oracle、PostgreSQL 或 SQL Server 脚本，也不生成模块私有 SQL 文件：表结构变更合并到 `release-artifacts/docker/infrastructure/mysql/init/50-namewta-ddl.sql`，初始化数据、菜单和回填合并到 `release-artifacts/docker/infrastructure/mysql/init/60-namewta-dml.sql`。

## 校验

```bash
node docs/fm/scripts/validate.mjs
```

校验模板清单、Vue 架构边界、CRUD method 和 Java POST 日志的静态合同。完整验收还必须使用代表性普通表与树表上下文渲染，再在目标前后端工程执行类型检查、测试和构建。
