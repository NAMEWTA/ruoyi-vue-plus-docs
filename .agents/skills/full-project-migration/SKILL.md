---
name: full-project-migration
description: "仅在用户显式调用 $full-project-migration 时使用的基座全量迁移流程：在不修改源基座的前提下，将完整的 RuoYi-Vue-Plus/Plus-UI 复制为已重命名、无 Git 元数据并采用用户品牌的业务 monorepo；覆盖包与路径迁移、Logo/favicon、产品文案、运行元数据、种子数据、上游入口清理和品牌残留验证。"
---

# 基座全量迁移

本 Skill 只能由用户手动触发。除非用户显式调用 `$full-project-migration`，否则不得使用。

## 必须确认的迁移合同

写入任何文件前，先确定完整映射并展示给用户：

- 源仓库根目录；
- 最终目标路径和项目键；
- 产品显示名称；
- 前端和后端目录名；
- Java 根包名和 Maven group ID；
- Maven artifact 前缀和 pnpm 包作用域；
- 应用启动类名称；
- 品牌显示名称和简短产品标识；
- 用户提供的 Logo/favicon 资产路径，或经用户明确批准的备用资产策略；
- 法律/版权主体和产品自有公开地址；
- 是否在全部产品界面隐藏上游仓库和文档链接，默认隐藏；
- 已提交数据库、bucket、容器、网络和服务默认值的运行命名空间策略；
- 中间件连接值是否保持不变，默认保持不变。

创建暂存副本前，用户必须显式确认品牌合同。不得虚构 Logo、法律主体、支持地址或公开仓库。只询问无法从仓库安全推断的值。最终目标路径必须尚不存在。

## 执行流程

1. 完整读取 [migration-sop.md](references/migration-sop.md) 和 [brand-migration.md](references/brand-migration.md)。
2. 使用 [stage-project-copy.mjs](scripts/stage-project-copy.mjs) 创建与目标同级的暂存目录。迁移期间不得修改源仓库。
3. 只在暂存目录内执行路径、命名空间和品牌调整。分别处理项目自有名称、第三方包、法律/上游归属、不可变历史和真实中间件配置。
4. 在目标项目中加入品牌残留门禁和浏览器回归测试。执行 SOP 规定的后端、前端、发布、品牌和结构门禁。
5. 删除验证产生的临时输出，运行 [verify-migration-layout.mjs](scripts/verify-migration-layout.mjs)；所有必需门禁通过后，才将暂存目录原子改名为最终目标目录。
6. 不初始化 Git。明确报告未执行或跳过的外部服务测试和浏览器测试。

## 不可突破的边界

- 复制当前工作树及有意义的未提交项目文件，同时排除全部 Git 元数据、依赖缓存、构建产物、日志和一次性工作树。
- 产出单一 monorepo。前端和后端必须是普通目录，不得为 Submodule 或嵌套仓库。
- 禁止盲目替换全部 `dromara` 或 `ruoyi` 文本。
- 保持 Dromara 生态第三方依赖坐标和 import 不变。只在已批准的法律/来源范围内保留上游地址和归属说明。
- 必需的上游归属只能保留在边界清晰的法律或来源文档中，不得继续作为迁移后产品的 Logo、导航项、仪表盘卡片、登录方式、帮助链接、包仓库、SpringDoc 联系人或默认 README 身份。
- 当前产品界面仍有未分类的旧品牌命中时，不得发布暂存项目。每项保留内容都必须记录准确路径、所有者类别、保留原因，以及其不可见或不可变的证据。
- 对已提交示例和部署模板应用用户批准的运行命名空间策略。除非用户显式授权迁移真实配置，否则保留中间件地址、数据库/bucket 名、用户名、密码和未跟踪运行状态。
- 目标已存在、所有权有歧义、依赖恢复不完整、必需门禁失败或源工作树发生变化时，立即停止。
- 不得自动删除失败的暂存目录；保留现场用于诊断，清理前征得用户同意。

## 工具维护

修改迁移脚本后，执行：

```bash
node --test .agents/skills/full-project-migration/scripts/migration-tools.test.mjs
node .agents/skills/full-project-migration/scripts/verify-migration-layout.mjs --help
```
