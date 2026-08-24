# 上游增量 Diff 报告

- 运行 ID：`2026-08-24T122943+0800-2026-08-24_current-upstream-merge-backfill`
- 生成时间：`2026-08-24T12:29:43+08:00`
- 主题：`current-upstream-merge-backfill`
- 口径：已确认集成上游点到本次观测上游点；不以镜像分支位置替代集成点。

## backend

| 固定项 | 值 |
|---|---|
| 产品 SHA | `58aaf342100a2cfc2988e01b257f7468bb2bbad9` |
| 已集成上游 SHA | `387c4f0a20e9232f44e762ef5a46c462f54bd464` |
| 集成识别方式 | `graph_merge` |
| 产品 merge commit | `af4bf65c71087c6080f52fed6155c542a162419b` |
| 观测上游 SHA | `629e344af50cfc5163f0b5905d47328382b7cc1c` |
| merge-base | `387c4f0a20e9232f44e762ef5a46c462f54bd464` |
| mirror SHA | `2933badb9182aaecfd5a45ce09444b8ac59576bb` |
| freshness | `fresh` |

### 历史 merge 回填

- 产品 merge commit：`af4bf65c71087c6080f52fed6155c542a162419b`，提交时间 `2026-08-20T16:01:17+08:00`，主题 `merge(upstream): sync 6.X 20260820`。
- 第一父节点（当时产品线）：`a426d5f7aab841442f93864a8277a96155a7fbb6`。
- 第二父节点（实际集成上游点）：`387c4f0a20e9232f44e762ef5a46c462f54bd464`，对应提交 `!880 [fix]修复 启用本地缓存`。
- 表格中的 `graph_merge` 是首次初始化时的发现方式；随后已在 `upstream-sync-state.json` 写入 `recorded_merge` integration event。该事件只确认父节点与 `main` 可达性，原始合并时的质量门禁证据不可从 Git 历史恢复，状态中明确记录为 unavailable。
- 当前联网观测上游 `629e344af50cfc5163f0b5905d47328382b7cc1c` 尚不是产品 `main` 的祖先，因此不能把本地镜像或远端最新点登记为已集成点。
- 本地镜像 `6.X=2933badb9` 比联网观测 `upstream/6.X=629e344af` 落后 1 个提交；本次只初始化状态和报告，没有移动镜像分支。

### 上游新增提交（2）

- `2933badb9` 2026-08-21 update 优化 sql输出性能 去掉锁
- `629e344af` 2026-08-24 fix 修复 数据权限对union语句不兼容问题

### 文件 Diff

统计：3 files changed, 14 insertions(+), 19 deletions(-)

| 状态 | 文件 | 新增 | 删除 | 风险分类 |
|---|---|---:|---:|---|
| `M` | `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/aspect/DataPermissionAdvice.java` | 7 | 2 | Client/RBAC/menu |
| `M` | `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/handler/PlusDataPermissionHandler.java` | 5 | 3 | Client/RBAC/menu |
| `M` | `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/interceptor/SqlLogInterceptor.java` | 2 | 14 | - |

### 产品重叠面

- 上游增量与产品自集成点后的文件变化无路径重叠。

### 高风险上游路径

- `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/aspect/DataPermissionAdvice.java`: Client/RBAC/menu
- `ruoyi-common/ruoyi-common-mybatis/src/main/java/org/dromara/common/mybatis/handler/PlusDataPermissionHandler.java`: Client/RBAC/menu

### 变更解读

- `2933badb9` 删除 `SqlLogInterceptor` 的进程内 `ReentrantLock`，把两次 `System.err.println` 调整为一次 `System.err.print`。当前未提交工作树中的该文件 blob 为 `d17ab7810f4dc71ca7f44de0b3b921ac9a4d21b9`，与联网观测上游完全一致，说明代码内容已经在工作树中吸收，但尚未进入产品提交历史。
- `629e344af` 将数据权限上下文的清理由内部 SQL handler 移回 Advice 生命周期：进入嵌套 Mapper 前保存上一层 `DataPermission`，退出时恢复；handler 在上下文缺失时失败关闭，并不再自行清除上下文。该变化针对 UNION/嵌套调用中的数据权限生命周期。
- 产品固定点 `58aaf3421` 中上述两个数据权限文件仍与已集成上游点 `387c4f0a2` 相同，因此这是尚未进入产品提交历史的新行为。虽然 Git 路径无双方提交重叠，仍需用数据权限 UNION、嵌套 Mapper 和缺失上下文负向用例验证权限不会扩大或泄漏。
- 前端上游没有新增提交，本轮不存在前端同步 diff。

### 复现命令

```bash
git -C ruoyi-vue-plus-namewta log --oneline 387c4f0a20e9232f44e762ef5a46c462f54bd464..629e344af50cfc5163f0b5905d47328382b7cc1c
git -C ruoyi-vue-plus-namewta diff --name-status 387c4f0a20e9232f44e762ef5a46c462f54bd464..629e344af50cfc5163f0b5905d47328382b7cc1c
git -C ruoyi-vue-plus-namewta diff 387c4f0a20e9232f44e762ef5a46c462f54bd464..629e344af50cfc5163f0b5905d47328382b7cc1c -- <path>
```

## frontend

| 固定项 | 值 |
|---|---|
| 产品 SHA | `f7d116f6e2b6b61239afc86cbcb860a07530abad` |
| 已集成上游 SHA | `0870ce17514895854ccff03600e102546d8c5046` |
| 集成识别方式 | `derived_merge_base` |
| 产品 merge commit | `null` |
| 观测上游 SHA | `0870ce17514895854ccff03600e102546d8c5046` |
| merge-base | `0870ce17514895854ccff03600e102546d8c5046` |
| mirror SHA | `0870ce17514895854ccff03600e102546d8c5046` |
| freshness | `fresh` |

### 上游新增提交（0）

- 无新增上游提交。

### 文件 Diff

统计：0 files changed

无文件变化。

### 产品重叠面

- 上游增量与产品自集成点后的文件变化无路径重叠。

### 高风险上游路径

- 未命中内置热点分类；仍需按 customization map 复核长期不变量。

### 复现命令

```bash
git -C plus-ui-namewta log --oneline 0870ce17514895854ccff03600e102546d8c5046..0870ce17514895854ccff03600e102546d8c5046
git -C plus-ui-namewta diff --name-status 0870ce17514895854ccff03600e102546d8c5046..0870ce17514895854ccff03600e102546d8c5046
git -C plus-ui-namewta diff 0870ce17514895854ccff03600e102546d8c5046..0870ce17514895854ccff03600e102546d8c5046 -- <path>
```

## 结论边界

本报告提供完整文件清单与可复现固定点，不内嵌无限制完整 patch。代码级结论必须使用上述固定 SHA 的路径级 diff 补证。
