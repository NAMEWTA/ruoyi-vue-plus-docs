# TypeScript / JavaScript：文件、目录、命名与注释

## 先按角色取证

不要为整个 TypeScript scope 直接选择一种文件名大小写。先按角色抽样并记录当前、目标、迁移和例外：

- 应用入口、路由、store、plugin、utility 与 adapter；
- framework component、page、layout 与 page-local component；
- composable、hook、directive 与类型声明；
- API client、transport type、schema 与生成模板；
- unit/component test、browser/E2E test 与 fixture；
- 构建配置、工具脚本和框架保留文件。

证据优先级为：编译/生成器硬约束、同 scope 成熟实现、已生效 lint/命名检查、框架约定、Builder 默认。混合命名必须按角色解释；无法解释的冲突进入 Ratchet 或项目决策，不以简单多数静默覆盖。

## 文件与标识符

项目规范至少明确适用角色的映射，而不是只写“保持一致”：

- component、class、type、interface 与 enum 通常使用 PascalCase；
- variable、function、method 与非组件模块通常使用 camelCase；
- composable/hook 使用框架或项目已有前缀，例如 Vue `useXxx`；
- constant 是否使用 UPPER_SNAKE_CASE 取决于当前 scope，不把所有 `const` 机械改名；
- framework、bundler、test runner 和 generator 的特殊文件名原样保留；
- 文件名、import specifier 和磁盘大小写完全一致，并在大小写敏感环境验证。

以上只是适用默认。React/Vue component 文件、feature 目录、route 文件和公开入口必须由框架适配器与项目事实收窄。

## 目录与公开入口

- 目录表达 feature、生命周期、所有权或依赖边界，不按文件类型数量机械加层；
- package/feature 的公开入口只在形成稳定 surface 时使用 `index.ts`，不为每个目录生成 barrel；
- API、page、component、composable 和 test 的放置跟随当前模块主轴；
- generator 输出路径是强证据，但生成模板不能覆盖同模块成熟实现中的额外业务边界；
- generated declaration、build output 和 Vendor 不作为手写命名样本。

生成项目规则时给出实际路径示例，并明确哪些是 MUST 的兼容路径、哪些只是新代码 Target。

## 测试与相邻文件

从 test runner、CI 和源码确认：

- colocated 或独立 test root；
- `.test.*`、`.spec.*`、E2E 后缀和 fixture 命名；
- 测试名与被测 public behavior 的对应关系；
- 大小写重命名在 macOS/Windows 与 Linux CI 上是否可见。

不要在同一 scope 无理由新增第二套测试后缀或目录策略。

## 注释与公共文档

- 注释解释类型与命名无法表达的 WHY：兼容限制、安全/性能权衡、生命周期、竞态、生成约束和临时例外；
- public API、扩展点和复杂边界按项目生态使用 JSDoc/TSDoc，说明输入、输出、失败、副作用、取消或生命周期；
- TypeScript 类型已经准确表达的信息不重复成 `@returns {*} `、字段名翻译或逐行旁白；
- framework template 注释只用于有导航价值的区域或非直观限制，不为每个 DOM 区块增加噪声；
- 文件头、版权头、TODO/FIXME 形式只能来自仓库事实或用户决策，不凭 Builder 偏好新增；
- 存量低价值注释不做无关全仓重写，触及代码时按 Ratchet 修正。

## 生成输出合同

检测到 TypeScript/JavaScript adapter 时，生成规范必须包含一份入口直接路由的 `references/typescript/code-organization-and-comments.md`。该文件至少包含：

1. 角色化文件与目录命名表；
2. component、composable、API、type 和 test 的实际路径证据；
3. 注释与 public contract 的目标规则；
4. 存量冲突、Ratchet 与禁止批量改名边界；
5. 可执行工具或精确 review Verification。

不得只在通用架构规则中写“保持局部一致”，也不得把 TypeScript 专属大小写和框架目录硬编码进通用 rules。
