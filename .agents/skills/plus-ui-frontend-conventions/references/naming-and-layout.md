# 文件、目录与命名

## 所有权目录

- `apps/<app>/src`：终端入口、Client、组合、路由、布局、主题和 App 私有页面/组件。
- `packages/domains/<domain>/src`：模型、服务、映射器、端口和无界面工具。
- `packages/web-domains/<domain>/src`：Vue 页面、局部组件、组合式函数、语言资源和 manifest。
- `packages/platform/<capability>/src`：跨领域最小合同。
- `packages/adapters/<runtime>/src`：平台合同的具体运行时实现。
- `packages/web-kit/<capability>/src`：经多个真实消费者证明稳定的 Web 机制。
- `tooling/<tool>/src`：构建期或仓库检查工具，不进入产品运行时。

根级没有产品 `src` 或前端模板 `gen`。

已激活 App 不得建立 `src/api` 复制后端接口或包装 domain 返回值。App 在 `src/application` 中装配所选 domain service、终端适配器和宿主行为；共享接口与模型进入 domain，共享 Vue 表现进入 web-domain。

## 命名

- 工作区包使用 `@namewta/<role-name>`，目录使用 kebab-case。
- Vue 组件文件遵循所在包既有模式；公开组件优先 PascalCase，页面入口可使用 `index.vue`，不要为统一大小写批量重命名。
- 组合式函数使用 `useXxx.ts`，测试与被测模块相邻使用 `*.test.ts`，浏览器测试使用 `e2e/**/*.spec.ts`。
- domain 与 web-domain 使用相同领域标识；manifest 的组件键必须保持后端菜单合同精确一致。
- 包只公开必要根入口或明确子路径，禁止 catch-all barrel 和深层导入。

## 新增文件决策

先判断代码是否依赖 Vue/DOM、是否只服务单一 App、是否属于单一业务领域、是否已有多个消费者。不能因为“可能复用”就提前放入 `platform` 或 `web-kit`。

移动 Web、小程序和 Taro 适配器在激活前只允许 README；真实包命名、源码与构建脚本必须在独立规格内确定。
