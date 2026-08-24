# Handoff: scripts 文档与 OSS 启动诊断

## 交接范围

- 本报告压缩最近两项用户请求：说明父仓 `scripts/` 中的脚本并维护目录 README；解释应用启动时的 OSS Direct Upload Bucket CORS/Lifecycle 告警。
- 相关活跃 change：`2026-08-24-upstream-fork-upgrade-remediation`。
- 当前 Work：`specdev/implement`；T-01 至 T-04 均处于 review，T-03 是本交接主题的 owning Ticket。
- 用户没有为本次 handoff 提供额外参数，也没有在最近两项请求中授权新的代码修改、提交、推送、部署或远程配置变更。
- 外部动作状态为 not-applicable，没有待关闭的远程 Issue。

## 权威恢复入口

先读取以下工件，不要从对话重新推导已锁定范围：

1. `speculo/.speculo/specdev/changes/2026-08-24-upstream-fork-upgrade-remediation/source.md`
2. `speculo/.speculo/specdev/changes/2026-08-24-upstream-fork-upgrade-remediation/triage.md`
3. `speculo/.speculo/specdev/changes/2026-08-24-upstream-fork-upgrade-remediation/.status.json`
4. `speculo/.speculo/specdev/changes/2026-08-24-upstream-fork-upgrade-remediation/ticket/03-ci-and-real-service-acceptance.md`
5. `speculo/.speculo/specdev/changes/2026-08-24-upstream-fork-upgrade-remediation/evidence/T-03.md`
6. `speculo/.speculo/commands/handoff/2026-08-24-specdev-oss-upload-remediation.md`

第 6 项是更早的完整 OSS 实现交接；本报告只补充后续脚本文档和启动告警解释，并覆盖其中已过时的工作区状态描述。

## scripts 文档现状

- `scripts/README.md` 已被父仓跟踪，当前覆盖 `scripts/`、`scripts/ci/`、`scripts/start-dev.sh` 和三个 CI 脚本。
- `scripts/ci/verify-submodules.sh` 校验父仓 gitlink、子模块实际 HEAD、初始化/冲突标记和子模块工作树清洁度。
- `scripts/ci/verify-admin-bundle.sh` 在 Maven 打包后校验 `full`/`core` 两种 `ruoyi-admin.jar` 的模块集合。
- `scripts/ci/run-external-services.sh` 创建一次性 Redis、MySQL、MinIO，运行指定真实集成测试，并用 EXIT trap 清理容器和网络。
- `scripts/start-dev.sh` 提供前端/后端两个前台启动选项；准确合同和验证结果引用 T-03 Ticket/Evidence，不在此重复。
- 最近一次针对三个 CI 脚本执行的 `bash -n` 通过；README 文件枚举与 `scripts/ci/*.sh` 一致。完整父仓脚本状态以 `scripts/README.md` 和 T-03 Evidence 为准。

## OSS 告警结论

- 用户提供的日志同时包含“初始化OSS配置成功”和应用启动成功；告警不是 OSS 初始化失败。
- `ruoyi-vue-plus-namewta/ruoyi-modules/ruoyi-system/src/main/java/org/dromara/system/oss/upload/OssUploadDiagnostics.java` 在 `ApplicationReadyEvent` 后只读检查默认 Bucket，不修改 Bucket policy。
- `ruoyi-vue-plus-namewta/ruoyi-common/ruoyi-common-oss/src/main/java/org/dromara/common/oss/client/AbstractOssClientImpl.java` 分别调用 S3 Bucket CORS 和 Lifecycle 查询 API；查询失败时相关布尔值保持 false，并附加根因，所以日志先显示四项“未配置”，再显示两个 404。
- 四项通用 S3 直传前置条件是：明确的前端 Origin、允许 PUT、向浏览器暴露 ETag、配置 `AbortIncompleteMultipartUpload`。ETag 用于浏览器 Multipart Complete；未完成分片清理用于避免长期占用存储。
- 这些是对象存储 Bucket/服务端配置，不是 `ruoyi-vue-plus-namewta/ruoyi-admin/src/main/resources/application.yml` 中的 OSS 账号、Bucket 名称或上传策略字段。

## 当前 MinIO 供应商差异

- 当前 Compose 使用开源 MinIO，服务级 CORS 入口是 `ruoyi-vue-plus-namewta/script/docker/docker-compose.yml` 中的 `MINIO_API_CORS_ALLOW_ORIGIN`；示例值位于 `ruoyi-vue-plus-namewta/script/docker/.env.example`。
- 该值必须匹配浏览器实际 Origin，例如默认前端端口 80 对应 `http://localhost`；若域名、协议或非默认端口变化，应修改部署环境变量并按部署流程重建服务，不要把 secret 写入仓库或回复。
- T-03 Evidence 已记录实际浏览器预检通过。当前 MinIO 版本不实现这里使用的桶级 CORS 查询，也不接受标准 S3 Bucket `AbortIncompleteMultipartUpload` 规则；它使用服务级 CORS 和内置陈旧分片清理，因此这两个 404 可属于 provider-specific warning。
- 不要仅为消除日志而修改 OSS 密钥、关闭直传诊断或伪造合规结果。若用户后续要求消除告警，应先决定并测试 provider-aware 诊断语义，例如区分“明确缺失”与“供应商不支持查询”。
- 如果切换到支持标准桶级 API 的 AWS S3 或兼容供应商，应在 Bucket 侧配置明确 Origin、PUT、Expose `ETag` 和未完成 Multipart 自动终止规则。

## 当前工作区状态

- 父仓 HEAD 为 `017add4d48e10cf3f3ec4c32d48482a14e08616d`，已包含 `.github/workflows/quality-gates.yml`、`scripts/**`、SpecDev change 工件和旧 handoff。
- 当前 `git status --short` 仅显示 `plus-ui-namewta` 与 `ruoyi-vue-plus-namewta` 两个 gitlink 为修改状态；两个子模块自身工作树均干净。
- 当前检出的前端 HEAD 为 `1dfdbe94c32c0c2200c340074dbc20eb6bb0c455`，后端 HEAD 为 `8f92807b37a892900e6e222825d5f08dfe40620f`；父仓尚未记录这两个当前指针。
- `.status.json` 中 implementation commit、local candidate integration、source cleanup 仍标记为未授权。不要据工作树已干净或子模块已有提交推断父仓集成已获授权，也不要擅自更新 gitlink、推送、清理或完成 change。
- 本地 ignored 配置包含 middleware 凭据。不得读取到日志、Evidence、handoff、回复或提交中；本报告未记录任何敏感值。

## 建议下一步

1. 新会话先重新执行 Speculo 初始化/迁移检查，确认 active change 和 current Work 未变化。
2. 若用户继续问配置，先确认浏览器实际 Origin 与部署环境中的 `MINIO_API_CORS_ALLOW_ORIGIN` 是否一致，再用真实 OPTIONS/PUT 行为判断，不以桶级查询 404 单独判失败。
3. 若用户要求修改诊断代码，将其视为 T-03 范围变化，先明确期望行为并补充 provider-specific 回归测试；不要把 warning 简单静默掉。
4. 若用户要求收口 change，先核对 T-03/T-04 剩余 disposable external-services、首次 GitHub Actions 和父 gitlink 门禁，并取得 SpecDev 所要求的提交/集成授权。

## 建议 skills

- `engineering-standards`：父仓、前端、后端质量门禁与交付规范。
- `ruoyi-system-module-guide`：OSS 管理面、直传服务和 system 模块边界。
- `ruoyi-common-modules-guide`：`OssFactory`、`OssClient` 与 `ruoyi-common-oss` 能力边界。
- `plus-ui-frontend-conventions`：后续若修改浏览器上传 hook、组件或前端测试时使用。

## 恢复校验

```bash
node speculo/workflows/specdev/common/tools/validate-specdev.mjs \
  --stage implement \
  --repo . \
  speculo/.speculo/specdev/changes/2026-08-24-upstream-fork-upgrade-remediation
```

未经用户明确授权，不执行 commit、push、部署、父仓 gitlink 更新、数据清理、worktree 删除或 change 归档。
