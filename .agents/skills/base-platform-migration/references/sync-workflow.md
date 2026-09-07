# 操作与恢复

profile 示例：

```json
{"brand":"CDE","javaPackage":"org.cde","author":"wta","targetRoot":"D:/projects/cde","frontendDir":"frontend","backendDir":"backend","persistenceRoot":"temp/base-sync","source":{"parent":"D:/base","frontend":"D:/base/plus-ui-namewta","backend":"D:/base/ruoyi-vue-plus-namewta"},"verification":{"commands":[]},"deployment":null}
```

`create` 从三个来源冻结并生成 staging 单仓库，移除 `.git`、`.gitmodules` 和嵌套 Git 元数据，复制未提交内容并记录哈希；目标已存在时必须使用 `adopt`。`adopt` 只采集事实，无法由 Git 证明的历史字段标记 `pending`。`compare` 读取旧快照、更新来源和目标，写报告但不改变 `integrated`。`sync` 只把属于基座的更新合入可恢复候选，保留业务定制；删除/重命名冲突、二进制、权限和数据兼容变化逐项停留在报告中。

验证命令必须全部成功后才推进 `integrated`，失败候选保留并可从 run 继续。已有数据库走备份和增量迁移；部署 profile 必须显式提供服务器，脚本只生成参数化计划或在获授权时执行独立网络/端口/卷，绝不使用基座资源。禁止自动 push、后台任务和 `--force` 绕过 SQL 错误。
