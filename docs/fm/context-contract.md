# FreeMarker 上下文合同

未来模板运行器必须一次性构造下列上下文。字段缺失时应在渲染前失败，不允许以空字符串静默生成不完整代码。

## 表级字段

| 变量 | 含义 |
|---|---|
| `table` | 完整生成表对象，提供 `crud`、`tree`、`menuIds` 等属性 |
| `columns` | 按数据库字段顺序排列的列集合 |
| `pkColumn` | 主键列 |
| `tableName`、`functionName` | 表名与界面功能名 |
| `ClassName`、`className` | Java 类名及首字母小写形式 |
| `BusinessName`、`businessName` | 资源公开名及目录/变量名 |
| `moduleName` | 后端模块与前端一级 domain 标识 |
| `packageName`、`basePackage` | Java 包与其父包 |
| `packagePath` | `packageName` 将 `.` 替换为 `/` 后的 Java 输出目录片段 |
| `author`、`datetime` | 生成署名与日期 |
| `permissionPrefix` | 权限前缀，通常为 `<module>:<business>` |
| `parentMenuId` | 菜单父节点 ID |
| `clientPk` | `sys_client.id` 的数据库主键；不要与 OAuth `clientId` 字符串混用 |
| `dicts`、`dictsNoSymbol` | Vue/React 字典参数表达式及无引号名称列表 |
| `architectureMode` | 后端模板模式：`classic` 或 `layered`；缺省为 `classic`，layered 必须显式选择 |
| `controllerSurface` | layered Controller 访问面：`admin`、`self` 或 `anonymous` |
| `transactionalCommands` | layered UseCase 中需要 `@DSTransactional` 的命令方法集合 |
| `generateService` | layered 是否生成语义明确的 Service，强制为 `true` |

读模型模板使用同一组 `packageName`、`packagePath`、`ClassName`、`functionName`、`tableName`、`columns` 上下文，输出到 `domain/model/read/${ClassName}Row.java`。列别名必须与 `javaField` 对应，读模型只作为 Mapper/DAO/Service 查询边界，不属于 HTTP 输出合同。

## 列字段

每个列对象至少提供 `columnName`、`columnComment`、`columnLabel`、`javaField`、`capJavaField`、`javaType`、`tsType`、`htmlType`、`queryType`、`dictType`，以及 `pk`、`list`、`query`、`insert`、`edit`、`required`、`dictColumn` 等布尔属性。

## 功能开关

| 变量 | 关联字段 |
|---|---|
| `enableExport` | 是否生成导出入口 |
| `enableStatus` | `statusColumn`、`statusField` |
| `enableSort` | `sortColumn`、`sortField` |
| `enableUnique` | `uniqueColumns` |
| `hasBetween`、`needAddDateRange`、`needDateRange` | 日期范围查询 |
| `needDict` | 字典 runtime |
| `needImagePreview`、`needImageUpload` | 图片宿主组件 |
| `needFileUpload`、`needEditor` | 文件与编辑器宿主组件 |
| `needCheckbox`、`needSelect`、`needTextArea` | 表单控件分支 |
| `needDigit`、`needDateField`、`needSwitchField` | 数字、日期与开关分支 |
| `needParseTime` | 时间格式化 runtime |

## 树表字段

树表额外要求 `treeCode`、`treeParentCode`、`treeName`、`treeParentColumn`、`treeRootValue`、`treeRootValueTsLiteral`、`treeRootValueJavaLiteral`、`treeAncestorsField`、`treeOrderField` 与 `expandColumn`。运行器必须在渲染前验证父字段、根值和主键类型一致。

## 输出集成

模板运行器依据 [catalog.json](./catalog.json) 选择模板和目标路径。Vue resource 输出后仍需由所属 domain/web-domain 的公开 exports、service 组合、manifest 与目标 App 显式接入；模板不得通过副作用修改这些共享文件。

`sql/mysql.sql.ftl` 是待合并片段，不生成独立部署脚本。表结构变更合并到 `release-artifacts/docker/infrastructure/mysql/init/50-namewta-ddl.sql`；初始化数据、菜单和回填合并到 `release-artifacts/docker/infrastructure/mysql/init/60-namewta-dml.sql`。

当 `architectureMode=layered` 时，生成结果必须满足：Controller 只注入 UseCase；UseCase 只注入 Service；Service 只注入 DAO 和明确外部端口；DAO 只注入 Mapper。不得生成 `IService`、`ServiceImpl` 继承、`DataSupport` 或 DAO/Repository 双套结构。
