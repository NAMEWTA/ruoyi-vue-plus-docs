# 验证与交付

先运行受影响模块或测试类取得快速反馈，再从后端根目录执行与风险匹配的聚合门禁：

```bash
./mvnw test
./mvnw clean package -DskipTests
./mvnw clean package -Pbundle-core -Dmaven.test.skip=true
```

默认全量与 core bundle 都从 clean 构建。core 跳过测试编译只允许建立在本次完整测试已通过的基础上；Redis、MySQL、MinIO 等属性门控测试必须区分 skipped、真实服务已验证和未运行。

交付前检查：

- 未无意修改 Maven Wrapper、BOM、无关 POM、profile 或依赖版本；
- `target`、`.flattened-pom.xml`、外部服务数据和敏感配置未进入变更；
- SQL 文件、Docker 初始化顺序、测试和当前文档一致；
- 实际命令、工作目录、退出码、跳过项和环境限制均被准确记录。

根级命令和 CI 状态以工程规范的[项目画像](../../engineering-standards/references/project/00-project-profile.md)为权威；本页只说明后端任务的选择顺序。
