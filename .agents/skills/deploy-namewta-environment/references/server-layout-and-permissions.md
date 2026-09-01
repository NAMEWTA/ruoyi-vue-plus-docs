# 服务器目录与权限

建议在 `/data/namewta-data` 下使用以下独占布局：

```text
/data/namewta-data/
  .env                         0600
  namewta-release.env          0600
  compose/                     版本化运行 Compose
  releases/                    不可变发布目录
  release-current -> releases/<release-id>
  mysql/data/                  持久化
  redis/data/                  持久化
  minio/data/                  持久化
  minio/config/                持久化
  nacos/data/                  持久化
  nacos/logs/                  持久化
  loki/ grafana/ prometheus/   启用时持久化
  backups/<timestamp>/         配置、发布与数据备份
  staging/                     未完成传输
```

目录由部署用户或已记录的容器 UID/GID 持有。敏感文件为 `0600`，普通配置为 `0640` 或更严格，目录为 `0750` 或更严格；容器确有要求时才记录例外。

每次写操作前解析并验证服务器根目录的规范路径。拒绝空值、`/`、`/root`、`/home`、用户主目录展开、未解析的 `$VARIABLE` 或逃逸出授权根目录的路径。禁止对根目录递归修改所有者，只处理明确需要的单个服务目录。

备份必须包含校验值和恢复命令。配置备份含有敏感信息，必须加密或限制访问。生产环境的保留周期和异机备份决策必须写入报告。
