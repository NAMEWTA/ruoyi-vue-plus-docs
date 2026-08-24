# Handoff: OSS 直传整改与 SpecDev 实施收口

## 交接范围

- 活跃 change：`2026-08-24-upstream-fork-upgrade-remediation`
- 当前 Work：`specdev/implement`
- 当前状态：active；T-01 至 T-04 均为 review
- 接手重点：复核用户的本地文件上传重试结果，并在取得明确授权后推进提交、集成和剩余外部服务验收
- 外部动作：not-applicable；没有待关闭的远程 Issue

## 权威入口

按以下顺序恢复，不要从对话重新推导已经锁定的范围：

1. `speculo/.speculo/specdev/changes/2026-08-24-upstream-fork-upgrade-remediation/source.md`
2. `speculo/.speculo/specdev/changes/2026-08-24-upstream-fork-upgrade-remediation/triage.md`
3. `speculo/.speculo/specdev/changes/2026-08-24-upstream-fork-upgrade-remediation/.status.json`
4. `speculo/.speculo/specdev/changes/2026-08-24-upstream-fork-upgrade-remediation/spec.md`
5. `speculo/.speculo/specdev/changes/2026-08-24-upstream-fork-upgrade-remediation/tickets-map.md`
6. `speculo/.speculo/specdev/changes/2026-08-24-upstream-fork-upgrade-remediation/ticket/03-ci-and-real-service-acceptance.md`
7. `speculo/.speculo/specdev/changes/2026-08-24-upstream-fork-upgrade-remediation/evidence/T-03.md`

T-03 Ticket 和 Evidence 是当前 owning 工件。OSS 问题的根因、获批偏差、修改路径、red/green 过程、完整门禁和真实票据验证都已记录其中，不要在新产物中复制正文。

## 当前实现状态

- Complete 响应已避免字符串重载，成功的 `ossId` 位于 `data`：`ruoyi-vue-plus-namewta/ruoyi-modules/ruoyi-system/src/main/java/org/dromara/system/controller/system/SysOssUploadController.java`。
- 完成态 Resume 返回同一 ID 且不再签发上传请求：`ruoyi-vue-plus-namewta/ruoyi-modules/ruoyi-system/src/main/java/org/dromara/system/oss/upload/OssUploadService.java` 和 `ruoyi-vue-plus-namewta/ruoyi-modules/ruoyi-system/src/main/java/org/dromara/system/oss/upload/OssUploadContracts.java`。
- 前端恢复完成票据后清理本地恢复记录、复用原 ID，并区分本地错误与 request adapter 已提示错误：`plus-ui-namewta/src/hooks/oss/useDirectOssUpload.ts`。
- 文件、图片和头像上传入口已经接入同一错误处理；回归测试位于 `plus-ui-namewta/src/hooks/oss/useDirectOssUpload.test.ts`、`ruoyi-vue-plus-namewta/ruoyi-admin/src/test/java/org/dromara/test/oss/upload/OssUploadHttpContractUnitTest.java` 和 `ruoyi-vue-plus-namewta/ruoyi-admin/src/test/java/org/dromara/test/oss/upload/OssUploadServiceUnitTest.java`。
- 真实登录会话对既有完成票据的 Resume/Complete 验证已通过，准确结果见 `speculo/.speculo/specdev/changes/2026-08-24-upstream-fork-upgrade-remediation/evidence/T-03.md`。
- 前端开发服务当前监听端口 80，后端修复后进程监听端口 8080；接手时先只读检查进程是否仍在，不要假设会话永久存活。

## 重复文件语义

当前是基于 SHA-256 文件指纹的断点恢复和同票据幂等，不是跨用户、跨浏览器或永久性的全局内容去重。指纹由文件名、大小、修改时间和首尾样本摘要组成，见 `plus-ui-namewta/src/utils/oss/fingerprint.ts`；恢复键还包含 Client、登录令牌和上传策略，见 `plus-ui-namewta/src/hooks/oss/useDirectOssUpload.ts`。

用户认可“同一文件不要无意义重复上传”的方向，但本 change 明确将全局内容去重排除在范围外。若用户要求永久禁止相同内容，必须先建立新的行为合同，不能把当前恢复机制描述成全局去重。

## 验证与未完成门禁

- 已执行门禁和结果统一以 `speculo/.speculo/specdev/changes/2026-08-24-upstream-fork-upgrade-remediation/evidence/T-03.md` 第 5 节为准。
- SpecDev implement validator 最近结果为 0 errors、0 warnings；父仓和两个子仓的 diff whitespace 检查通过。
- T-03 仍是 partial：一次性 Docker external-services Maven suite 和首次 GitHub Actions run 未执行。
- `.status.json` 中 T-03 的 full suite/E2E 仍保持 pending，这是剩余 disposable-suite/CI 门，不要因手工真实服务 smoke 通过而擅自改成 passed。
- 未获 implementation commit、local candidate integration、source cleanup、push 或远程 CI 配置授权；因此 Ticket 不得标记 done，change 不得完成或归档。

## 工作区注意事项

- 父仓、`plus-ui-namewta` 和 `ruoyi-vue-plus-namewta` 均为 dirty，且混有本 change 早期修改和用户已有修改。不得 reset、checkout、清理或回退未明确归属的内容。
- 本地 middleware 账密位于 Git 忽略的配置中。不要读取到日志、handoff、Evidence 或回复中，也不要提交该配置。
- 指定 middleware 环境及部署细节只通过 `speculo/.speculo/specdev/changes/2026-08-24-upstream-fork-upgrade-remediation/evidence/T-03.md` 和 `ruoyi-vue-plus-namewta/script/docker/README.md` 恢复；不得在新报告中复制 secret。
- 后端本地运行依赖 `dev,local` profile 顺序。前后端无需部署为容器。

## 建议下一步

1. 重新执行 Speculo 初始化和迁移检查，并确认 active change/current Work 未被其他会话改变。
2. 只读确认端口 80、8080；若进程退出，按 T-03 Evidence 中已验证的方式恢复，不打印敏感配置。
3. 请用户从页面重新选择原文件，确认不再弹出“完成 OSS 上传失败”，并核对返回 ID/列表行为；把新的观测追加到 T-03 Evidence。
4. 若用户授权 commit/integration，再按 `speculo/workflows/specdev/I-implement/I-implement.md` 的门禁收口四个 review Ticket。授权前不要提交或推进父仓 gitlink。
5. disposable external-services suite 和首次 CI run 完成后，更新 `.status.json`、Ticket、Tickets Map 与 Evidence；任何 skipped external test 都不能计作通过。

## 建议 Skills

- `engineering-standards`：父仓、前端和后端工程规范及质量门禁。
- `plus-ui-frontend-conventions`：前端 TypeScript/Vue、格式化和动态权限现状。
- `ruoyi-system-module-guide`：OSS HTTP/Service 边界和 ruoyi-system 模块定位。

## 恢复校验

```bash
node speculo/workflows/specdev/common/tools/validate-specdev.mjs \
  --stage implement \
  --repo . \
  speculo/.speculo/specdev/changes/2026-08-24-upstream-fork-upgrade-remediation
```

不要在未获得用户明确授权时执行 commit、push、部署、清理数据、删除 worktree 或归档 change。
