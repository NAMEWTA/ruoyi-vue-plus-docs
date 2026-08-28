# 领域能力与终端实现

## 新增或迁移领域能力

1. 确认唯一后端 Maven 模块、Controller 类和 `@RequestMapping` base path。
2. 如需生成传输类型，更新 `packages/api-contracts` 与 `tooling/openapi` 的来源、快照和生成结果；生成 transport 进入 domain 时映射为 domain-owned model。
3. 在 `packages/domains/<module>/src/<resource>` 放置领域模型、映射器、服务和注入端口；`module` 去掉 `ruoyi-` 前缀，`resource` 由稳定 base path 转为 kebab-case。
4. Web 能力放入 `packages/web-domains/<module>/src/<resource>`，通过类型化 runtime 端口获取字典、反馈、弹窗、下载和导航等宿主能力。
5. 从包根或明确资源子路径导出必要合同；禁止 catch-all exports、深层导入和跨工作区相对导入。
6. 更新包 README 中的职责、后端模块、Controller 映射和验证命令。
7. 在目标 App 的组合入口显式选择，禁止通过副作用自动注册。
8. 验证未选择的能力不可见，重复键、缺失 domain 和未知 manifest registration 均失败关闭。

## 新增 App

新 App 必须独立拥有：

- 包清单和入口；
- ClientId、ClientContext、环境变量与会话存储命名空间；
- 所选 domain/web-domain 及 manifest 组合；
- 路由、布局、主题、运行时适配器、构建和部署合同。

新终端只组合所需能力，不复制 Admin 全量 API、Store 或页面。启用 Client Web、移动 Web 或小程序前，先通过独立规格确定框架版本、目标平台、安全能力、领域选择和不可用的 Web/DOM 依赖，再把 README 占位转换为工作区包。

## 验证选择

先使用 `pnpm --filter <package-name> <script>` 取得快速反馈，再执行工程规范项目画像中适用的根级命令。涉及认证、动态菜单、权限或终端隔离时追加对应 Playwright 场景；第二个 App 激活后，E2E 必须覆盖 App 间隔离，不能只验证 Admin。
