# 文档与注释

### DOC-001 注释解释非直观原因

Scope: `repository`

Level: SHOULD

Source: `repository-fact` + `builder-baseline`

Rule: 注释用于解释代码无法自证的兼容限制、协议/安全权衡、资源生命周期、事务/并发不变量、生成约束、历史原因和临时例外。不得逐行翻译实现，也不得用注释掩盖模糊命名或职责混合。

Verification: review 新增/修改注释是否提供 WHY、约束或删除条件；删除实现已自证的重复旁白；语言和框架的具体注释形式读取对应 reference。

### DOC-002 Public contract 按生态记录

Scope: public HTTP/JSON contract, `public-api:ruoyi-api`, extension points, shared frontend adapters

Level: SHOULD

Source: `repository-fact` + `builder-baseline`

Rule: 对调用方不可从类型或签名直接得知的输入、输出、失败、副作用、取消、生命周期、安全与兼容要求，使用该语言生态的 JSDoc/Javadoc 或项目合同文档记录。显而易见的 getter、字段和类型信息不重复成文档噪声。

Verification: public API review；对照 controller/BO/VO、TypeScript transport type、Javadoc/JSDoc 与调用方；相关契约测试或构建。

### DOC-003 文档随边界变化同步

Scope: `repository`

Level: MUST

Source: `repository-fact` (`docs/upstream/customization-map.md`, SpecDev ADR/context) + `builder-baseline`

Rule: 模块边界、public API/协议、数据模型/迁移、部署拓扑、质量门禁、支持版本或长期例外发生变化时，同步对应权威文档、ADR、规范或 customization map。实现注释不得成为跨模块合同的唯一权威。

Verification: diff 检查代码、测试和权威文档同步；运行文档/Skill 链接与 schema 校验；交付报告列出未更新项及原因。

### DOC-004 TODO 与文件头不凭偏好新增

Scope: `repository`

Level: SHOULD

Source: `repository-fact` + `builder-baseline`

Rule: 不新增无上下文 TODO/FIXME、统一版权头或 `@author` 文件头。确需 TODO 时关联 owner/issue，写明原因和完成/删除条件；既有第三方或生成文件头按所有权保留。

Verification: review 新增 `TODO|FIXME|HACK|XXX|@author|Copyright`；确认来源、owner 和删除条件；不为统一外观重写无关文件。
