# TypeScript 工程规范

适用 `module:plus-ui-namewta`。版本事实：TypeScript `^6.0.3`、ESM、pnpm 10、Vite 8；`tsconfig.json` 使用 Bundler resolution、DOM/ESNext、`noEmit` 和 `@/* -> ./src/*`。

### TS-001 类型严格度 Ratchet

Scope: `language:typescript`, `module:plus-ui-namewta`

Level: MUST

Source: `repository-fact` (`tsconfig.json`, `.oxlintrc.json`) + `builder-baseline`

Rule: 不为局部问题继续放宽全局 compiler/lint。新建或实质修改的 API、env、storage、DOM dataset、JSON 和第三方 response 边界从 `unknown` 验证/缩窄；`any` 只留在有说明的兼容 adapter，不能扩散到业务合同。

Verification: `pnpm lint`; `pnpm build:prod`; review 变更中的 `any`、双重断言、非空断言和宽泛索引签名；遵循 EX-001。

### TS-002 API 类型与 transport 分离

Scope: `path:plus-ui-namewta/src/api/**`, `path:plus-ui-namewta/src/utils/request.ts`

Level: MUST

Source: `repository-fact`

Rule: API request/response 类型与后端 BO/VO JSON 合同一致，使用 `import type`、`AxiosPromise`/精确 Promise 结果；分页、ID、boolean 和 nullable 语义明确。页面不重复定义同一 transport shape，也不把 HTTP wrapper 类型泄漏为领域状态。

Verification: 对照后端 controller/BO/VO；`pnpm lint`; `pnpm build:prod`; 跨端契约 review。

### TS-003 模块与 import

Scope: `module:plus-ui-namewta`

Level: SHOULD

Source: `repository-fact` + `builder-baseline`

Rule: 使用 ESM 与现有 `@/` alias；类型依赖使用 `import type`。`index.ts` 只在现有 feature/API 公开入口有价值时使用，不为每个目录机械创建 barrel；顶层副作用限定在 `main.ts`、插件注册和明确启动入口。

Verification: `pnpm lint`; `pnpm build:prod`; review 循环依赖、运行时 type import 和隐式初始化顺序。

### TS-004 Promise、错误与取消

Scope: `language:typescript`

Level: MUST

Source: `repository-fact` + `builder-baseline`

Rule: Promise 必须 await、return、批量等待或由有监督 owner 接管；catch 值按 `unknown` 处理。网络/搜索/组件异步任务定义过期响应和卸载行为；并发批处理说明上限、顺序和部分失败。

Verification: review floating Promise、catch 和 lifecycle；失败/超时/重复响应测试或人工步骤；`pnpm lint`。

### TS-005 公共类型表达真实语义

Scope: `language:typescript`

Level: SHOULD

Source: `repository-fact` + `builder-baseline`

Rule: 沿用 scope 内 `interface`/`type` 主导实践，不把风格偏好升为硬规则。用字面量联合、可选字段和领域类型表达协议；不要用 magic number/string、`Record<string, any>` 或假枚举抹去已知字段。

Verification: public type review；后端 JSON 对照；构建与相关行为验证。
