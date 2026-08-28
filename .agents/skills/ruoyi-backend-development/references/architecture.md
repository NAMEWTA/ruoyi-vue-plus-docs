# 模块与依赖边界

| 模块 | 当前职责 |
|---|---|
| `ruoyi-admin` | 部署入口和模块组装，不承载可复用业务实现 |
| `ruoyi-api` | 跨业务模块公开服务与 DTO 合同 |
| `ruoyi-common/ruoyi-common-*` | 按能力拆分的基础设施、工具和稳定 SPI |
| `ruoyi-modules/ruoyi-system` | 用户、Client、角色、菜单、权限、组织、资源和监控 |
| `ruoyi-modules/ruoyi-workflow` | 流程定义、任务、实例和业务审批 |
| `ruoyi-modules/ruoyi-gen` | 待退役的代码生成器运行实现，不再拥有模板资产 |
| `ruoyi-modules/{ruoyi-demo,ruoyi-ai,ruoyi-job}` | 对应业务能力 |
| `ruoyi-extend` | Monitor、SnailJob、SnailAI 等独立部署应用 |

依赖方向为部署应用到业务模块、公开 API 和所需 common 能力。common 不反向依赖业务模块；业务模块不深用其他模块内部实现；`ruoyi-admin` 的组装便利不能成为新业务模块的依赖范式。

跨模块调用在同一 JVM 内通过 Spring 注入 `ruoyi-api` 或 common SPI。本仓库没有通用 Feign/Dubbo 远程层，不得发明远程客户端。

认证、权限、Client 和菜单属于跨端安全合同。前端可见性不是授权边界，最终认证、鉴权、数据范围和 Client 隔离由后端完成。
