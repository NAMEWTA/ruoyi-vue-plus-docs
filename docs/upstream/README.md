# 上游能力治理

NAMEWTA 以本地产品架构为权威，上游仓库用于发现新能力、缺陷修复和安全变化。上游文件路径只是发现线索，不是本地合并目标。

## 维护入口

- [上游能力映射](./customization-map.md)：长期 schema、本地边界、当前 baseline、decision 和验证合同。
- [当前同步指针](./upstream-sync-state.json)：已持久化的上游 checkpoint。
- [最近一次同步报告](./2026-08-24_current-upstream-merge-backfill/diff_report.md)：某次实际差异与结果；同目录保存结构化 state 和 conflict report。

## 使用顺序

1. 从上游 release、commit、PR 或安全公告提取 capability，并记录精确 source。
2. 在 customization map 中选择本地 owner boundary，先写 invariants 和 priority，再选择 `adopt/adapt/reject/defer`。
3. `adopt/adapt` 通过独立 issue/change 实施；安全项不得无 owner、期限和风险处置地 defer。
4. 只有实际验证和 evidence 齐全后才能标记 completed。
5. 单次同步 SHA、冲突与命令结果写入日期报告目录，长期能力决策写入 customization map。

实际 upstream refresh/merge 继续使用仓库的受控同步工作流；本目录不授权 push、发布或自动吸收上游代码。
