# ruoyi-vue-plus-docs

本仓库是 **RuoYi-Vue-Plus** 前后端工程的聚合仓库，通过 Git Submodule 管理两个独立仓库，便于统一查看、克隆与文档整理。

## 仓库关系

| 仓库 | 角色 | 说明 |
|------|------|------|
| [ruoyi-vue-plus-docs](https://github.com/NAMEWTA/ruoyi-vue-plus-docs) | 父仓库 | 聚合入口，以 submodule 引用前后端 |
| [ruoyi-vue-plus-namewta](https://github.com/NAMEWTA/ruoyi-vue-plus-namewta) | 后端 | Spring Boot / RuoYi-Vue-Plus 服务端 |
| [plus-ui-namewta](https://github.com/NAMEWTA/plus-ui-namewta) | 前端 | Vue 管理端（plus-ui） |

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
