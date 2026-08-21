# 编码风格（观察性）

针对每个模块/能力的具体描述，如不明确，必须直接根据文中给出的仓库路径读取对应源码确认，不得凭空推断。MUST、Ratchet 与质量门禁裁决见 `.agents/skills/engineering-standards`，不要把下列事实升格为新规范。

## 静态检查：Oxlint，不是 ESLint

- `plus-ui-namewta/package.json`：`lint` = `oxlint src`，`lint:fix` = `oxlint --fix src`。无 `eslint`、`prettier`、`stylelint`、`typecheck`、`test`、`format`/`fmt:check` script。`packageManager` 为 `pnpm@10.34.5`；`engines.node` 为 `>=20.19.0`。devDependencies 含 `oxlint` `^1.75.0`、`oxfmt` `^0.60.0`、`vue-tsc`、`vitest`；版本以该文件为准。
- `plus-ui-namewta/.oxlintrc.json`：`$schema` 指向 oxc 官方 schema。plugins 为 `eslint`（Oxlint 的 ESLint 兼容规则集，不是独立 ESLint 工程）、`typescript`、`unicorn`、`oxc`、`import`、`vue`。categories：`correctness` 与 `suspicious` 均为 `error`。显式 `off`（未枚举 Oxlint 默认规则全集）：`typescript/no-empty-function`、`typescript/no-explicit-any`、`typescript/no-unused-vars`、`typescript/no-this-alias`、`typescript/no-empty-object-type`、`typescript/no-unused-expressions`、`prefer-rest-params`、`import/no-unassigned-import`、`import/no-named-as-default-member`、`import/no-named-as-default`、`no-shadow`、`unicorn/prefer-add-event-listener`、`unicorn/consistent-function-scoping`、`unicorn/no-instanceof-builtins`。ignorePatterns：`.ai_state`、`.claude`、`.codex`、`doc`、`dist/**`、`dist-ssr/**`、`coverage/**`。
- 当前 ratchet 事实：`any` 被 lint 允许（`typescript/no-explicit-any` 为 `off`）。不要宣称仓库禁止 any。新代码类型边界的裁决读 `.agents/skills/engineering-standards/references/typescript/core.md`（TS-001）。

## 格式化：Oxfmt，不是 Prettier

- `plus-ui-namewta/package.json`：`fmt` = `oxfmt .`（写入式格式化，不是 CI check）。无非写入式 format-check script。
- `plus-ui-namewta/.oxfmtrc.json`：`printWidth` 120、`singleQuote` true、`trailingComma` none、`arrowParens` avoid、`htmlWhitespaceSensitivity` ignore；`sortImports.newlinesBetween` 为 false；`groups` 为 type-import → value-builtin/value-external → type-internal → value-internal → type-parent/sibling/index → value-parent/sibling/index → unknown。另有 `experimentalSortPackageJson.sortScripts: true`。忽略 `src/types/components.d.ts`、`src/types/auto-imports.d.ts`、`.ai_state`、`.claude`、`.codex`、`doc`。
- 新代码按上述选项书写。不要引入 Prettier 配置。format-check 是否落地见 `.agents/skills/engineering-standards/references/project/02-decisions-and-exceptions.md`（`PENDING-FE-001`）。

## EditorConfig

- `plus-ui-namewta/.editorconfig`：根文件（`root = true`）。`[*]` UTF-8、LF、2 空格缩进、trim trailing whitespace、insert final newline。`[*.md]` 关闭末尾空行与尾空白修剪。
- 仓库无 `.vscode/`。编辑器是否强制执行取决于本机插件。缩进/换行以 EditorConfig + oxfmt 为准。

## TypeScript 编译选项

- `plus-ui-namewta/tsconfig.json`：`module` ESNext、`moduleResolution` Bundler、`lib` ESNext+DOM、`strict` true、`noEmit` true、`paths` `@/*` → `./src/*`。同时关闭 `noImplicitAny`、`strictFunctionTypes`、`strictNullChecks`；开启 `allowJs`、`removeComments`、`experimentalDecorators`、`forceConsistentCasingInFileNames`。
- include：`src/**/*.ts`、`src/**/*.vue`、`src/**/*.d.ts`、`vite.config.ts`、`vitest.config.ts`。exclude：`node_modules`、`dist`、`src/**/__tests__/*`。
- 不要把 `strict: true` 解释为严格空值/隐式 any 已开启。`removeComments` 只影响 emit；因 `noEmit` true，对运行产物无实际注释剥离。
- ratchet 迁移读 `.agents/skills/engineering-standards/references/project/02-decisions-and-exceptions.md`（`MIG-TS-STRICT`）。

## 无 ESLint / Prettier 工程

- 工作树中不存在 `.eslintrc*`、`eslint.config.*`、`.prettierrc*`、`prettier.config.*`、`.eslintignore`、`.prettierignore`、`.stylelintrc*`、`.husky/`、lint-staged、`.vscode/`。`package.json` 无 eslint/prettier 依赖。
- `.oxlintrc.json` 的 `"plugins": ["eslint"]` 不是遗留 ESLint 工程。
- Prettier/ESLint 遗留仅出现在：`plus-ui-namewta/src/utils/request.ts`（401 分支与 `download`）与 `plus-ui-namewta/src/plugins/tab.ts` 的 `// prettier-ignore`。生成声明：`plus-ui-namewta/src/types/auto-imports.d.ts` 头含 `/* eslint-disable */`、`/* prettier-ignore */`；`plus-ui-namewta/src/types/components.d.ts` 头含 `/* eslint-disable */`、`// oxlint-disable`、`/* prettier-ignore */`。二者均被 oxfmt ignorePatterns 排除。
- 新代码不要为“兼容 Prettier”新增 ignore。不要手改生成 dts。

## Vite 插件与别名

- `plus-ui-namewta/vite/plugins/index.ts`：vue / unocss / auto-import / components / compression / svg-icons / setup-extend / check-transition。不含 eslint 或 oxlint 插件。
- `plus-ui-namewta/vite.config.ts`：`resolve.tsconfigPaths: true`，与 `tsconfig.json` 的 `@/*` 共同生效。
- `plus-ui-namewta/vite/plugins/auto-import.ts`：自动导入 vue / vue-router / `@vueuse/core` / pinia 及 Element Plus resolver（`importStyle: false`，`vueTemplate: true`）；dts 写入 `plus-ui-namewta/src/types/auto-imports.d.ts`。业务代码可省略这些显式 import（如 `plus-ui-namewta/src/utils/auth.ts` 的 `useStorage` 无 import），也可显式导入（如 `plus-ui-namewta/src/store/modules/app.ts` 的 `import { useStorage } from '@vueuse/core'`）。两种写法并存；以生成 dts 为准，不要强制每个文件显式导入 Vue API。

## 脚本与门禁（交叉链接，不复制 MUST）

在 `plus-ui-namewta/` 工作目录。栈版本（Vue 3.5.40、TypeScript ^6.0.3、Vite ^8.1.5、Pinia 4.0.2）与 `engines.node` 以 `plus-ui-namewta/package.json` 为准，不要凭记忆写版本号。

| 命令 | 源 | 本 Skill 事实 |
|---|---|---|
| `pnpm lint` | `package.json` scripts.lint | Oxlint 静态检查（`oxlint src`） |
| `pnpm lint:fix` | `package.json` scripts.lint:fix | Oxlint 自动修复 |
| `pnpm fmt` | `package.json` scripts.fmt | Oxfmt 写入式格式化（`oxfmt .`），不等于 format-check |
| `pnpm build:prod` | `package.json` scripts.build:prod | Vite 生产构建（`vite build --mode production`；`build` 同命令） |

`vue-tsc` 与 `vitest` 在 `package.json` devDependencies，但无对应 script。不要把 typecheck/test 写成已启用门禁。active gate 列表读 `.agents/skills/engineering-standards/references/project/00-project-profile.md` 与 `.agents/skills/engineering-standards/references/rules/quality-gates.md`。

## 不要当作约定来源

- oxlint/oxfmt 都 ignore `doc`，但 `plus-ui-namewta/docs/` 与 `plus-ui-namewta/doc/` 均不存在。不要把它们写成约定来源。
- `plus-ui-namewta/.codex/skills/frontend-crud-coding/` 覆盖 CRUD 生成，不替代本文件的工具链事实。

## 已知未知（回源码，禁止发明）

- `tsconfig.json` include 列出 `vitest.config.ts`，工作树中未找到该文件；Vitest 启用计划未知。
- `// prettier-ignore` 对 oxfmt 是否生效未验证。路径：`plus-ui-namewta/src/utils/request.ts`、`plus-ui-namewta/src/plugins/tab.ts`。
