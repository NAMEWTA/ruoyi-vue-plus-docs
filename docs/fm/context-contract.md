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
| `dicts`、`dictsNoSymbol` | Vue/React 字典参数表达式及无引号名称列表 |

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
