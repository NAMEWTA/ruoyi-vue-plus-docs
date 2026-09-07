---
name: base-platform-migration
description: 手动触发基座派生、单仓库迁移与三方持续同步，安全替换品牌和作者并维护不入 Git 的映射档案。
---

# 基座派生与持续同步

仅在用户明确输入 `$base-platform-migration` 时运行；不得隐式触发、定时轮询、推送远程仓库或复用基座部署资源。开始前读取父仓库的 `AGENTS.md`、Speculo 状态和 `engineering-standards`，把用户提供的品牌、Java 包名、目标目录、作者和可选部署参数写入 profile。

按“盘点 → 冻结来源 → 转换清单 → 候选 → 验证修复 → 交付建档”执行。`create` 只写入不存在或明确为空的目标，`adopt` 为已有项目建档，`compare` 只生成报告，`sync` 在候选和验证成功后才推进 integrated 检查点。遇到路径冲突、缺失来源、归属不明、二进制无法处理或验证失败时停止并记录阻塞，不能猜测或无限重试。

第一方映射、第三方保护、作者替换和初始化数据规则见 [brand-transform.md](references/brand-transform.md)；状态事实源、逐文件关系和快照见 [mapping-schema.md](references/mapping-schema.md)。操作参数和恢复流程见 [sync-workflow.md](references/sync-workflow.md)，质量门禁及浏览器点击矩阵见 [verification.md](references/verification.md)。

运行脚本：

```powershell
node .agents/skills/base-platform-migration/scripts/base-migration.mjs create --profile migration.json
node .agents/skills/base-platform-migration/scripts/base-migration.mjs adopt --profile migration.json
node .agents/skills/base-platform-migration/scripts/base-migration.mjs compare --profile migration.json
node .agents/skills/base-platform-migration/scripts/base-migration.mjs sync --profile migration.json --verify "pnpm lint; ./mvnw test"
```

映射默认写入目标 `temp/base-sync/`，该目录必须被 Git 忽略。JSON 是唯一事实源，Markdown 由脚本从 JSON 生成；档案缺失或损坏时先恢复/重新核验，不能静默覆盖。凭据只允许出现在被忽略的私密 profile 中，状态与报告不得保存密码、令牌或带凭据 URL。
