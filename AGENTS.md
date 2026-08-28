# AGENTS.md

<SPECULO>
## Speculo 运行时配置

### 初始化状态检查

运行时必须读取以下文件以确认 Speculo 初始化状态：

- ./speculo/.speculo/workspace.json — 工作区根别名配置
- ./speculo/config.json — 项目配置文件

若上述文件不存在或内容为空，说明项目尚未完成 Speculo 初始化。
此时必须提示用户：请先运行 speculo init 完成初始化配置。

`speculo init` 会直接替换受管理静态资产，并依据 refresh contract 保留用户 runtime state、合并持久配置。
结构化状态不兼容时初始化会在替换前停止，当前安装保持不变。

### 工作流入口（强制读取）

初始化时已选择以下工作流，运行时必须强制读取对应入口文件：

- ./speculo/workflows/specdev/INDEX.md
</SPECULO>

<PROJECT_SKILLS>
## 项目开发 Skill

- 项目开发 Skill 的唯一根目录是 `./.agents/skills/`；两个子仓库不维护 `.claude` 或 `.codex` Skill/Agent 副本。
- 处理代码、目录、测试、构建、依赖、API、数据库、权限、上游同步或交付变化前，先读取 `./.agents/skills/engineering-standards/SKILL.md`。
- 再按任务加载最小充分的前端、后端、system、workflow、common 或 upstream Skill，不加载无关内容。
- Skill 摘要与当前源码、配置、POM 或测试冲突时，以当前工作树证据为准，并同步修正父级 Skill。
</PROJECT_SKILLS>
