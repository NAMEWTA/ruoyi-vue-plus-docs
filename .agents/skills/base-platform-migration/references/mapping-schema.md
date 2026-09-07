# 映射档案 schema

`temp/base-sync/current.json` 是事实源，`mapping.md` 从它生成。状态至少包含：

```json
{
  "schema_version": 1,
  "mapping_version": "rules-v1",
  "status": "created",
  "base": {"parent": {}, "frontend": {}, "backend": {}},
  "observed": {}, "integrated": null,
  "target": {"root": "", "brand": "", "java_package": "", "frontend_scope": ""},
  "files": [{"source_repo":"backend","source_path":"","target_path":"","relation":"copied","source_sha256":"","target_sha256":"","owner":"first-party","status":"unchanged"}],
  "customizations": [], "runs": [], "deployment": null
}
```

每个来源仓库记录完整 SHA、工作区树 SHA、未提交补丁摘要和采集时间；`observed` 表示本次发现，`integrated` 只表示已验证集成。逐文件关系允许 `copied|renamed|split|merged|added|deleted|protected-third-party`，状态允许 `unchanged|transformed|customized|conflict|excluded`。新增业务文件、主动删除和拆分/合并必须显式登记。

每次运行写入 `runs/<id>/`，来源快照写入 `snapshots/<sha>/`，先写临时文件再原子替换，并保留上一份有效 `current.json`。档案不入 Git；完整复制项目时随工作区复制，单独 Git clone 不会获得历史映射。
