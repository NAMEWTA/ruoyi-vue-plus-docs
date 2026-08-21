---
artifact: evidence
change: 2026-08-21-module-knowledge-skills
id: skills-created
lead: cursor-agent
updated_at: 2026-08-21T16:10:00+08:00
---

# Evidence: 模块知识 Skill 创建与校验

本 change 为知识/Skill 作者，不是生产实现。未授权 git commit，未运行 `package_skill.py`。

## 研究工件

| 主题 | Investigation Ticket |
|---|---|
| plus-ui 前端约定与动态权限路由 | `<Path>{roots.state}/specdev/changes/2026-08-21-module-knowledge-skills/investigation/INV-01-plus-ui-conventions.md</Path>` |
| ruoyi-system 对外能力与调用方式 | `<Path>{roots.state}/specdev/changes/2026-08-21-module-knowledge-skills/investigation/INV-02-ruoyi-system.md</Path>` |
| ruoyi-workflow 对外能力与业务接入 | `<Path>{roots.state}/specdev/changes/2026-08-21-module-knowledge-skills/investigation/INV-03-ruoyi-workflow.md</Path>` |
| ruoyi-common 子模块与工具类 | `<Path>{roots.state}/specdev/changes/2026-08-21-module-knowledge-skills/investigation/INV-04-ruoyi-common.md</Path>` |

关闭评论：

- `<Path>{roots.state}/specdev/changes/2026-08-21-module-knowledge-skills/investigation/comments/INV-01/01-solution.md</Path>`
- `<Path>{roots.state}/specdev/changes/2026-08-21-module-knowledge-skills/investigation/comments/INV-02/01-solution.md</Path>`
- `<Path>{roots.state}/specdev/changes/2026-08-21-module-knowledge-skills/investigation/comments/INV-03/01-solution.md</Path>`
- `<Path>{roots.state}/specdev/changes/2026-08-21-module-knowledge-skills/investigation/comments/INV-04/01-solution.md</Path>`

## Skill 路径

| Skill | 目录 |
|---|---|
| plus-ui-frontend-conventions | `<Path>.agents/skills/plus-ui-frontend-conventions/</Path>` |
| ruoyi-system-module-guide | `<Path>.agents/skills/ruoyi-system-module-guide/</Path>` |
| ruoyi-workflow-module-guide | `<Path>.agents/skills/ruoyi-workflow-module-guide/</Path>` |
| ruoyi-common-modules-guide | `<Path>.agents/skills/ruoyi-common-modules-guide/</Path>` |

## quick_validate 结果

命令：对每个 Skill 目录运行 skill-creator 的 `quick_validate.py`（未运行 `package_skill.py`）。

| Skill 目录 | 退出码 | 输出 |
|---|---|---|
| `<Path>.agents/skills/plus-ui-frontend-conventions/</Path>` | 0 | Skill is valid! |
| `<Path>.agents/skills/ruoyi-system-module-guide/</Path>` | 0 | Skill is valid! |
| `<Path>.agents/skills/ruoyi-workflow-module-guide/</Path>` | 0 | Skill is valid! |
| `<Path>.agents/skills/ruoyi-common-modules-guide/</Path>` | 0 | Skill is valid! |

## Wayfinder 校验

命令：`node <Path>{roots.workflows}/specdev/common/tools/validate-specdev.mjs</Path> --stage wayfinder <Path>{roots.state}/specdev/changes/2026-08-21-module-knowledge-skills</Path>`

结果：exit 0；`Summary: 0 error(s), 0 warning(s)`。

## 偏差与残余

- 未把研究正文从 Ticket 移入 solution comment 全文；评论只保留一句话答案与资产指针，详细声明仍在 Ticket 正文。
- 未授权 git 提交；Skill 与 change 工件仍为工作区未提交变更。
- 未归档、未提升永久 `<Path>{roots.state}/specdev/research/</Path>`；需用户确认后由 A-archive 处理。
- 不修改 `<Path>plus-ui-namewta/</Path>` 与 `<Path>ruoyi-vue-plus-namewta/</Path>`。
