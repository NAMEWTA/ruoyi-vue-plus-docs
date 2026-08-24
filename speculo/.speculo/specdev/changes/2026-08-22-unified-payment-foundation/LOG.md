# 统一支付底座设计日志

## LOG-001 — 2026-08-22T20:53:27+08:00 — 统一支付底座目标
- **设计树节点：** D-001
- **轮次与依赖：** round 1 / 无
- **状态：** confirmed
- **问题：** 当前底座要补齐什么支付能力。
- **事实与来源：** USER-DECISION:2026-08-22 用户要求为不同 App 提供可配置的支付宝、微信等支付方式，并形成账单支付闭环。
- **选项：** 单一渠道接入 / 通用支付底座 / 完整钱包与资金平台。
- **推荐：** 先建立与业务解耦、按应用配置渠道的统一支付底座。
- **结论：** 建立通用支付底座，支持不同 App 配置各自允许的支付方式，并围绕金额账单形成从支付发起、获得支付链接或商家码、渠道支付到结果记录的闭环；同时研究资金清结算模式和成熟开源实现。
- **原因：** 当前仓库没有真实支付订单、退款、钱包或对账域，新增能力应成为可复用底座而非某个业务的专用接口。
- **影响工件：** CONTEXT / Spec / Ticket
- **约束或不变量：** 不在设计访谈阶段实现产品代码。
- **后续：** 关闭资金角色、首期场景、钱包边界和开源采用方式四项前沿决策。
- **替代/被替代：** 无

## LOG-002 — 2026-08-22T20:53:27+08:00 — 仓库与开源支付方案研究
- **设计树节点：** 不适用
- **轮次与依赖：** round 2 / D-001
- **状态：** confirmed
- **问题：** 当前仓库与主流开源项目能否直接提供所需的统一支付闭环。
- **事实与来源：** 仓库只存在支付宝社交登录配置及 SnailJob 模拟账单任务；外部项目事实来自各项目仓库、官方文档及支付监管规则。
- **选项：** 嵌入支付 SDK / 迁入同类 RuoYi 支付模块 / 独立部署完整支付中心 / 从官方 SDK 自建全部能力。
- **推荐：** 当前阶段采用“原生支付领域模块 + 可替换渠道适配器”，以 RuoYi-Vue-Pro 支付模块为主要领域参考，以 IJPay 或官方 SDK 作为渠道实现候选；Jeepay/DaxPay 保留为独立支付中心候选，而不是直接嵌入当前应用。
- **结论：** 现有开源方案分为 SDK 与完整支付系统两类，均不能在不设计本地账单、状态机、幂等、回调、对账和 Client 隔离合同的情况下直接形成闭环。
- **原因：** SDK 只解决渠道协议；完整支付系统会引入独立商户、应用、权限、部署与许可证边界。当前底座已有 Client 隔离模型，最接近的架构参考是同为 Spring Boot/MyBatis-Plus 模块化体系的 RuoYi-Vue-Pro。
- **影响工件：** Spec / Ticket
- **约束或不变量：** 第三方热度不等于生产适配度；许可证、安全、版本兼容和监管边界必须单独评估。
- **后续：** 用户确认 D-002 至 D-005 后继续细化数据、状态机、回调、退款、对账和安全节点。
- **替代/被替代：** 无

### Research: 聚合支付开源方案与支付闭环
- Decision / target: 支持 D-005 的开源采用方式，并为后续支付闭环设计提供事实。
- Scope / version: 2026-08-22；Java/Spring Boot；中国境内支付宝、微信等渠道；当前 change 工件为 `<Path>{roots.state}/specdev/changes/2026-08-22-unified-payment-foundation/LOG.md</Path>`。
- Stop condition: 已区分 SDK 与完整支付系统，覆盖多应用/多渠道、支付/退款/回调/对账、许可证、技术兼容和资金监管边界。

#### R-001
- Claim: 当前仓库没有生产支付域；支付宝相关配置属于社交登录，`AlipayBillTask`、`WechatBillTask` 和 `SummaryBillTask` 只是 SnailJob 示例数据，不能复用为支付或对账实现。
- Type: code fact
- Source: `CODE:<Path>ruoyi-vue-plus-namewta/ruoyi-admin/src/main/resources/application-dev.yml</Path>`；`CODE:<Path>ruoyi-vue-plus-namewta/ruoyi-modules/ruoyi-job/src/main/java/org/dromara/job/snailjob/AlipayBillTask.java</Path>`。
- Confidence: high
- Limits: 只扫描了项目源码和配置，未把依赖缓存或构建输出视为实现。
- Artifact impact: 新建独立 payment 业务域，不能在 job 或 social 模块上扩展。

#### R-002
- Claim: RuoYi-Vue-Pro 的 `yudao-module-pay` 已形成支付应用、渠道、支付单、退款单、回调通知与钱包流水模型；支付应用用于隔离不同业务的回调、订单号和允许渠道，是当前项目最接近的领域参考。
- Type: official fact
- Source: <Url>https://doc.iocoder.cn/pay/build/</Url>；<Url>https://doc.iocoder.cn/pay/wallet/</Url>；<Url>https://github.com/YunaiV/ruoyi-vue-pro</Url>。
- Confidence: high
- Limits: 该项目的租户、安全与框架版本不等于当前仓库，适合借鉴领域模型，不应整模块复制。
- Artifact impact: 后续设计 PayApplication、PayChannel、PayOrder、PayRefund、PayNotify 和可选 Wallet 边界。

#### R-003
- Claim: IJPay 是 Apache-2.0 的多渠道 Java SDK，支持微信和支付宝的多商户、多应用及多类支付接口；它不提供本地支付订单、业务账单、回调投递、对账差异和钱包闭环。
- Type: official fact
- Source: <Url>https://github.com/Javen205/IJPay</Url>。
- Confidence: high
- Limits: GitHub 页面显示约 6.6k stars 只用于社区活跃度参考，不能证明生产质量；具体渠道 API 覆盖需在选型阶段按锁定版本验证。
- Artifact impact: 可作为渠道 adapter 候选，不能成为 payment 领域模型本身。

#### R-004
- Claim: pay-java-parent 是约 3.1k stars 的轻量多渠道 SDK，明确自述仅为 SDK 和简单 Web 示例；它同样不能替代完整支付生命周期。
- Type: official fact
- Source: <Url>https://github.com/egzosn/pay-java-parent</Url>。
- Confidence: high
- Limits: README 示例版本为 2.14.13；依赖安全、Spring Boot 4/JDK 21 兼容性与渠道新 API 覆盖尚未验证。
- Artifact impact: 作为 IJPay 的备选 adapter 做后续原型对比。

#### R-005
- Claim: Jeepay 是 LGPL-3.0 的完整独立支付系统，约 6.3k stars，支持普通商户、服务商、多商户多应用、微信/支付宝/云闪付、聚合码和统一开放 API；其技术栈为 JDK 17、Spring Boot 3.3.7，并带独立管理端、商户体系和 MQ。
- Type: official fact
- Source: <Url>https://github.com/jeequan/jeepay</Url>。
- Confidence: high
- Limits: 这是独立支付中心而非当前底座的嵌入式 starter；采用前必须评估 LGPL、部署、身份映射、运维与二次开发成本。
- Artifact impact: 若目标升级为运营多商户支付中台，可作为独立部署候选或完整流程参考。

#### R-006
- Claim: DaxPay 开源版是 LGPL-3.0-or-later 的独立支付系统，约 873 stars，采用 Spring Boot 4.1/JDK 25，提供统一 HTTP API、支付/退款/转账/回调/同步/关闭、多商户与直连通道；部分聚合通道和收银小程序属于商业扩展包。
- Type: official fact
- Source: <Url>https://github.com/dromara/dax-pay</Url>。
- Confidence: high
- Limits: 当前项目是 Java 21/Spring Boot 4.1，仍不能直接嵌入；4.0 分支和商业/开源交付边界需要在选型时锁定。
- Artifact impact: 适合作为通道隔离、统一 HTTP、风控与运维架构参考，不能假定全部渠道开源可用。

#### R-007
- Claim: dromara/payment-spring-boot 聚焦微信支付 V3，支持多个服务商/商户及微信分账等能力，但不是支付宝、微信统一聚合层。
- Type: official fact
- Source: <Url>https://github.com/dromara/payment-spring-boot</Url>。
- Confidence: high
- Limits: 只覆盖微信，文档部分链接已标记不可用；不能单独完成多渠道闭环。
- Artifact impact: 若微信深度能力优先，可作为微信专用 adapter 候选。

#### R-008
- Claim: 微信 Native 下单返回 `code_url` 供商户生成二维码；支付成功以验签回调为主，长时间未收到通知时应主动查单。微信交易/资金账单需在 T+1 申请下载并校验文件哈希。
- Type: official fact
- Source: <Url>https://pay.wechatpay.cn/doc/v3/merchant/4012791877</Url>；<Url>https://pay.wechatpay.cn/doc/v3/merchant/4013071218</Url>。
- Confidence: high
- Limits: 不同支付产品、普通商户与服务商接口参数不同，需按实际商户模式锁定文档。
- Artifact impact: MVP 必须包含预下单凭证、回调、主动查询和 T+1 对账，而不只是生成二维码。

#### R-009
- Claim: 支付宝当面付支持商家扫用户条码与用户扫商家二维码，完整链路还包含异步通知、查单、撤销、退款和账单；支付宝区分交易账单、资金账单和费用账单。
- Type: official fact
- Source: <Url>https://developer.alibaba.com/docs/doc.htm?articleId=850&amp;docType=4&amp;treeId=180</Url>；<Url>https://developer.alibaba.com/docs/doc.htm?articleId=121793&amp;docType=1&amp;treeId=826</Url>。
- Confidence: medium
- Limits: 当前公开检索落到阿里开发者文档镜像；实现时必须回到锁定产品的支付宝开放平台最新 API 文档与官方 SDK。
- Artifact impact: 对账模型不能把渠道订单和资金流水混成一张表。

#### R-010
- Claim: 在中国境内，未取得支付业务许可的系统不应自行从事资金转移、归集或以平台内部“钱包”沉淀客户资金；首期应让资金由银行、支付宝、微信或持牌收单机构直接结算到真实商户，平台只做技术编排和内部账本。该结论是面向架构风险的建议，不是针对具体经营模式的法律意见。
- Type: recommendation
- Source: <Url>https://app.www.gov.cn/govdata/gov/202312/17/510339/article.html</Url>；<Url>https://www.pbc.gov.cn/zhengwugongkai/attachDir/2025/11/2025111915174857578.pdf</Url>。
- Confidence: high
- Limits: 是否构成支付业务取决于实际合同、资金流、商户主体、分账和运营模式，上线前仍需支付机构及专业法务确认。
- Artifact impact: D-002 与 D-004 必须在进入 Spec 前关闭；默认排除无牌资金池和可提现储值钱包。

### Conflicts and Unknowns
- Jeepay、DaxPay 的完整度高，但会引入第二套商户/应用/权限/部署边界；是否值得采用取决于目标是“底座内支付模块”还是“独立支付产品”。
- IJPay、pay-java-parent 接入轻，但不会替代订单状态机、幂等、通知、对账、风控和内部账本。
- 具体经营主体、商户号类型、服务商资质、资金最终收款方和是否需要分账尚未确认。
- 尚未通过依赖原型验证任何候选 SDK 对 Java 21、Spring Boot 4.1、Jackson/MyBatis-Plus 与当前安全基线的兼容性。

### Recommendation
首期采用原生 payment 模块，先形成“Client -> PayApplication -> PayChannelAccount -> Bill -> PayOrder/Attempt -> Refund -> Notify -> Reconciliation”的本地合同；渠道侧通过 adapter 隔离 IJPay或官方 SDK。Jeepay/DaxPay 作为未来独立支付中台候选，只有在多商户运营、服务商进件、复杂路由和独立运维成为明确目标时再进行原型决策。
