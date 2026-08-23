---
name: plus-ui-frontend-conventions
description: 为 plus-ui-namewta 提供前端编码风格、注释实践、Oxlint/Oxfmt 工具链与动态权限路由的模块知识地图。处理 plus-ui-namewta 的前端编码风格、注释、Oxlint、Oxfmt、EditorConfig、tsconfig、动态路由、filterAsyncRouter、addRoute、v-hasPermi、v-hasRoles、checkPermi、菜单 getRouters、permission 守卫或按钮权限时使用。规范裁决与质量门禁见 engineering-standards；本 Skill 只描述仓库现状与源码路径。
---

# plus-ui-namewta 前端约定地图

把本 Skill 当作 `plus-ui-namewta` 当前工作树的观察性约定地图使用；不要当成 MUST 裁决层。

## 源码确认

针对每个模块/能力的具体描述，如不明确，必须直接根据文中给出的仓库路径读取对应源码确认，不得凭空推断。

不要用上游 RuoYi 文档、注释示例或本 Skill 摘要覆盖源码。未知项标为「回源码确认」，不要发明统一规则。

## 分工

- **规范裁决**（MUST / 质量门禁 / Ratchet / pending-decision）：读取 `.agents/skills/engineering-standards/SKILL.md`，按任务加载其 References。不要复制其条文到本 Skill。
- **本 Skill**：plus-ui 模块知识与约定地图；每条能力带真实仓库路径。
- **CRUD 生成细节**：`plus-ui-namewta/.codex/skills/frontend-crud-coding/SKILL.md`（几乎不覆盖动态路由与注释）。
- **NAMEWTA Client 菜单契约**：`docs/upstream/customization-map.md`。

## 执行

1. 确认变更落在 `plus-ui-namewta/`。
2. 只加载当前主题的一份 reference：
   - 编码风格、Oxlint、Oxfmt、tsconfig、auto-import → [coding-style.md](references/coding-style.md)
   - 注释实践 → [comments.md](references/comments.md)
   - 动态路由、v-hasPermi、getRouters、守卫 → [permission-routing.md](references/permission-routing.md)
3. 条目不够明确时，按该条目给出的路径读源码。
4. 需要 MUST 或门禁命令时转到 engineering-standards，不要在本 Skill 发明门禁。
5. `v-hasRoles` vs `v-hasRole`、`superadmin` vs `admin`、空 `dynamicRoutes` 等已知冲突：并列记录并回源码，不要静默统一。

## 仓库锚点

| 能力 | 路径 |
|---|---|
| 工具链脚本 | `plus-ui-namewta/package.json`（`pnpm lint` 是只读检查；`pnpm fmt` 是写入式格式化工具，不是门禁；`pnpm build:prod` 是构建验证） |
| Oxlint / Oxfmt / EditorConfig / tsconfig | `plus-ui-namewta/.oxlintrc.json`、`plus-ui-namewta/.oxfmtrc.json`、`plus-ui-namewta/.editorconfig`、`plus-ui-namewta/tsconfig.json` |
| 守卫与常量路由 | `plus-ui-namewta/src/permission.ts`、`plus-ui-namewta/src/router/index.ts`（`dynamicRoutes = []`） |
| getRouters → addRoute | `plus-ui-namewta/src/api/menu.ts`、`plus-ui-namewta/src/store/modules/permission.ts` |
| v-hasPermi / v-hasRoles | `plus-ui-namewta/src/directive/permission/index.ts` |
| 超管键冲突 | 后端 `superadmin`：`ruoyi-vue-plus-namewta/ruoyi-common/ruoyi-common-core/src/main/java/org/dromara/common/core/constant/SystemConstants.java`；前端 `admin`：`plus-ui-namewta/src/plugins/auth.ts` |

## 已知未知

完整列表在 [coding-style.md](references/coding-style.md)、[comments.md](references/comments.md)、[permission-routing.md](references/permission-routing.md)。禁止用推断填补。
