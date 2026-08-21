# Browser 运行时规范

### BROWSER-001 浏览器边界

Scope: `runtime:browser`, `module:plus-ui-namewta`

Level: MUST

Source: `repository-fact` + `official-guidance`

Rule: DOM、storage、cookie、URL、postMessage、环境变量和第三方脚本视为平台/不可信边界；DOM 操作留在组件/明确 adapter。进入客户端 bundle 的配置均公开，不能包含 secret。

Verification: review `window/document/storage/import.meta.env` 使用；输入消毒/URL 测试；production build 抽查配置暴露。

### BROWSER-002 网络生命周期

Scope: `runtime:browser`, `path:plus-ui-namewta/src/utils/request.ts`, `path:plus-ui-namewta/src/api/**`

Level: MUST

Source: `repository-fact` + `builder-baseline`

Rule: 网络请求统一经过现有 request adapter，并定义认证、超时、错误映射和重复提交语义。新异步交互必须防止过期响应覆盖；有取消能力时由发起方传播取消并在页面/组件销毁时清理。

Verification: request adapter review；超时、401、重复提交、快速切换/卸载人工或自动测试；`pnpm build:prod`。

### BROWSER-003 性能与国际化

Scope: `runtime:browser`

Level: SHOULD

Source: `repository-fact` (`src/lang`, Vite) + `builder-baseline`

Rule: 用户文案进入既有 i18n 系统，日期/数字按区域 API；性能优化先以 bundle、网络和交互指标测量，大列表、图片、异步路由和缓存策略按证据采用，不以微优化破坏正确性。

Verification: locale 切换与文案 review；Vite build 输出/浏览器 profile；大数据交互验证。
