# 文件、目录与命名

## 落位判断

先判断代码是否依赖 Vue/DOM、是否只服务单一 App、是否属于单一业务领域、是否已有多个真实消费者。完整目录职责与依赖方向见 [architecture.md](architecture.md)。不能因为“可能复用”就提前放入 `platform` 或 `web-kit`。

根级没有产品 `src` 或前端模板 `gen`。

已激活 App 不得建立 `src/api` 复制后端接口或包装 domain 返回值。App 在 `src/application` 中装配所选 domain service、终端适配器和宿主行为；共享接口与模型进入 domain，共享 Vue 表现进入 web-domain。

## 命名

- 工作区包使用 `@namewta/<role-name>`，目录使用 kebab-case。
- Vue 组件文件遵循所在包既有模式；公开组件优先 PascalCase，页面入口可使用 `index.vue`，不要为统一大小写批量重命名。
- 组合式函数使用 `useXxx.ts`，测试与被测模块相邻使用 `*.test.ts`，浏览器测试使用 `e2e/**/*.spec.ts`。
- domain 与 web-domain 使用相同领域标识；manifest 的组件键必须保持后端菜单合同精确一致。
- 包只公开必要根入口或明确子路径，禁止 catch-all barrel 和深层导入。

## 新增文件决策

移动 Web、小程序和 Taro 适配器在激活前只允许 README；真实包命名、源码与构建脚本必须在独立规格内确定。
