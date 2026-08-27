# ruoyi-vue-plus-docs

## 相较上游的增强

- **动态登录域**：以 Client 与 UserType 的关联关系替代用户单值类型，支持登录域的独立维护、启停和用户多域归属。
- **Client 级认证与注册策略**：密码、短信、邮件、社交和小程序登录统一校验当前 Client 的登录域准入；注册开关由各 Client 独立控制，并通过严格布尔类型的公开上下文驱动登录、注册页面失败关闭。
- **Client 级 RBAC 隔离**：权限、角色、默认角色、菜单和动态路由均按 `userId + sys_client.id` 计算，超管也限定在当前 Client，禁止无 Client 上下文或跨 Client 兜底授权。
- **Client 会话安全**：Token 同时携带 Client 主键与登录域，严格区分 OAuth `clientId` 和数据库 Client 主键；用户、Client 或登录域状态变化时按域清理相关会话。
- **前端权限管理闭环**：提供登录域 CRUD，并在 Client、用户、角色、菜单和用户授权页面中显式传递 Client 上下文，只有 scoped 数据完整加载后才开放编辑。
- **多 APP 共用主线**：通过 `VITE_APP_CLIENT_ID` 区分不同 APP 的 OAuth Client，同一套前端 `main` 可服务多个入口，无需长期维护 APP 专属分支。
- **OSS 直传与生命周期管理**：浏览器直传对象存储，支持单文件、分片、断点续传、失败恢复和上传会话隔离；补充对象引用、临时文件清理、可恢复删除及授权下载能力。
- **统一通知基础设施**：提供渠道无关的通知分发与邮件、短信适配，支持 Redis 幂等、OSS 附件快照、调用上下文审计、敏感信息脱敏和全局投递监控。
- **增量 SQL 管理**：保留上游 `ry_vue.sql` 不变，NAMEWTA 的结构与数据变更分别通过 append-only 的 `script/sql/namewta/DDL.sql` 和 `DML.sql` 管理。
- **可审计的上游同步**：前后端产品分支与上游镜像分离，固定已集成检查点和不可移动基线，并通过 [定制边界](docs/upstream/customization-map.md)及当前 Diff/冲突报告复核认证、权限、Client、OSS 等高风险改造面；历史报告由 Git 保存。

本仓库是 **RuoYi-Vue-Plus** 前后端工程的聚合仓库，通过 Git Submodule 管理两个独立仓库，便于统一查看、克隆与文档整理。

## 仓库关系

| 仓库 | 角色 | 说明 |
|------|------|------|
| [ruoyi-vue-plus-docs](https://github.com/NAMEWTA/ruoyi-vue-plus-docs) | 父仓库 | 聚合入口，以 submodule 引用前后端 |
| [ruoyi-vue-plus-namewta](https://github.com/NAMEWTA/ruoyi-vue-plus-namewta) | 后端 | Spring Boot / RuoYi-Vue-Plus 服务端 |
| [plus-ui-namewta](https://github.com/NAMEWTA/plus-ui-namewta) | 前端 | Vue 多 App 领域化 monorepo |

```
ruoyi-vue-plus-docs/                 # 父仓库（本仓库）
├── ruoyi-vue-plus-namewta/          # submodule → 后端仓库
└── plus-ui-namewta/                 # submodule → 前端仓库
```

- **父仓库** 只记录各 submodule 当前指向的 commit，不复制前后端完整历史。
- **后端 / 前端** 仍是独立 Git 仓库，可各自开发、发版；在本仓库中作为子模块被引用。
- 三个仓库默认分支均为 `main`（产品）。后端 `6.X`、前端 `6.X-Vue` 是上游纯镜像，只允许 fast-forward，禁止业务提交。
- NAMEWTA 相对上游的改造热点与合并约束见 [docs/upstream/customization-map.md](docs/upstream/customization-map.md)。

## 克隆

递归克隆本仓库及全部 submodule：

```bash
git clone --recurse-submodules https://github.com/NAMEWTA/ruoyi-vue-plus-docs.git
```

若已克隆父仓库但未拉取子模块：

```bash
git submodule update --init --recursive
```
