# API、错误、资源与并发

### API-001 边界验证与可信模型

Scope: HTTP/JSON, browser storage, environment configuration, database and third-party integration boundaries

Level: MUST

Source: `repository-fact` + `builder-baseline`

Rule: 外部输入先验证、标准化并转换为 BO/DTO/VO 或精确 TypeScript 类型，再进入业务逻辑。类型断言、Bean 映射和前端 interface 不能替代运行时验证；非法状态不得靠 magic string 或宽泛 map 隐藏。

Verification: review controller validation groups、service invariants、前端 response narrowing 和错误分支；相关边界测试；两端构建。

### API-002 错误合同

Scope: `repository`

Level: MUST

Source: `repository-fact` (`GlobalExceptionHandler`, `src/utils/request.ts`) + `builder-baseline`

Rule: 只在能恢复、映射协议或增加边界上下文时捕获错误；保留原始 cause。用户消息、机器错误码和运维日志分离，不吞异常、不把日志当成功返回，也不在多层重复记录同一失败。

Verification: 失败路径测试；review catch/Promise rejection/exception mapping；检查日志不含 secret、SQL、Token 或过量个人数据。

### API-003 超时、取消与重复响应

Scope: HTTP clients, async tasks, schedulers, listeners and batch operations

Level: MUST

Source: `repository-fact` + `builder-baseline`

Rule: 异步 I/O 明确超时、取消、幂等、重试和部分失败语义；前端避免卸载后写入和过期响应覆盖；后端不吞中断，不无界重试，不在事务中等待无界远程 I/O。

Verification: 超时/取消/重复提交测试或精确人工步骤；review Abort/cleanup、retry 上限、事务范围与 interrupt 处理。

### API-004 资源所有权

Scope: database transactions, streams, files, executors, schedulers, listeners, observers, timers, object URLs and subscriptions

Level: MUST

Source: `builder-baseline`

Rule: 每项资源都有创建者、所有者、关闭/取消路径和部分初始化失败清理；Spring singleton 不保存请求可变状态，Vue 生命周期资源在 unmount/scope dispose 时释放。

Verification: review try-with-resources/Bean lifecycle/Vue cleanup；资源失败和重复关闭测试；检查线程池、timer、listener 未在请求或重复 mount 中泄漏。
