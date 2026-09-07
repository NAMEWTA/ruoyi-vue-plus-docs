# 品牌与作者转换规则

profile 必须明确 `brand`、`javaPackage`、`author`。品牌生成小写 slug、显示名和前端作用域（如 `CDE`、`cde`、`@cde/*`），并按最长字符串优先替换第一方标识：仓库名、模块名、镜像/网络/数据库、文档链接、页面标题、Logo 与 favicon。Java 路径和包名同步迁移到 `org/<brand>`；扫描路径、Mapper、Spring 资源、测试字符串和启动类必须一起更新。

第三方保护清单至少包括 `org.dromara.sms4j`、Warm-Flow、Mica、Easy-ES 及其许可证、NOTICE、法定版权和上游作者。保护项按文件归属和坐标识别，不能用全局 `dromara` 替换；原始来源名称和路径只写入映射档案用于溯源。

第一方 Java/Kotlin `@author`、文件头维护者、Docker `maintainer`、前端 `package.json` author、模板默认作者、SQL/Markdown/脚本署名统一为 `author`（默认 `wta`）。第三方源码、许可证及法定版权不改写。

删除第一方官网、旧仓库入口、GitHub/Gitee 角标和宣传链接；删除“PLUS官网”菜单及 URL，管理员账号仍为 `admin`、显示名为“超管”。二进制文件不做文本替换；Logo 必须由 profile 提供或使用目标品牌资产。哈希、签名向量和生成代码通过声明的生成命令更新，脚本不得机械改写期望值。
