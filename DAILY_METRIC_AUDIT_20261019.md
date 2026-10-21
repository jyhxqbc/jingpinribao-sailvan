# 每日集合指标与毛利复核（2026-10-19）

> 本文是3.1时期只读调查证据。3.2现已支持四来源表头识别与费用增量、缺源参考标记、站外固定0，并按用户最终要求移除三项库存。当前36项TOTAL结果见 [四来源核对](FOUR_SOURCE_TOTAL_RECONCILIATION.md)，操作以 [完整说明](精品日报原理以及使用说明.md) 为准。

只读核对 `D:/赛维操作/9月精品日报.xlsx`，用真实 Excel Explorer `explorer.read_range` API 同时读取公式及保存值。原文件、业务代码均未修改。完整旧字段规则见 `TWO_SHEET_RECONCILIATION.md`；本报告补充当前实现状态及新发现。

## 主表 AB 与每日 AH 不是同一字段

- 实际主表名：`发货-进入系统-广告合并报表`。`AB1=发货毛利USD（不扣除推广费）`；`AB2=(P2+Q2)/'每日销售数据-集合'!$AQ$1`。
- 主表 `AH1=站点&新料号SPU&销售`；`AH2=B2&AZ2&AJ2`，缓存 `CASPC000273销售-孙远哲`，不是毛利。
- 每日页实际名：`每日销售数据-集合`。`AH2=发货毛利(USD)`；`AH3=IFERROR(SUMIFS(主表!AB:AB,日期/组织/站点/转换SPU/平台/链接/账号条件)-R3-U3-T3,"-")`，保存值 `15891.0459054915`。
- R为广告花费，U为已入账促销，T为站外；未入账S另外用于AM预估毛利率，不扣在AH内。

## 九月保存总计

| 指标 | 每日单元格 | 保存值 |
| --- | --- | --- |
| 广告 | R34 | 595495.4588072 |
| 已入账促销 | U34 | 23902.96 |
| 站外 | T34 | 0 |
| 未入账促销（特殊总计） | S34 | 14952.3224539764 |
| 正式毛利 | AH34 | 356146.196917778 |
| 仅扣广告参考毛利（反推） | AH34+U34+T34 | 380049.156917778 |
| 仅扣广告与正式毛利差额 | U34+T34 | 23902.96 |
| 正式毛利率 | AL34 | 8.92874999507346% |
| 总推广占比 | AE34 | 15.9265150340778% |

总推广占比原式：`(S+U+T+R)/(G+AR)`。除了广告，需未入账、已入账、站外；分母需不含PO收入、VCPO和确认的欧洲换算参数。主表+VCPO不足以完整计算。

## 当前每日指标完整映射

“默认”指 `metricRegistry.ts` 的 defaultMetrics；用户自己保存的列选择可能不同。已实现不代表缺源时可以计算。

| 每日列 | 当前key | 默认 | 实现及来源 |
| --- | --- | --- | --- |
| G | revenueNoPo | 是 | 已实现；主表S扣Amazonvc |
| H | revenue | 是 | 已实现；主表S |
| I | usVcShare | 否 | 已实现；US/VCB2B特殊筛选 |
| J | revenueLocal | 否 | 已实现；单币种+期间换算参数 |
| K | systemOrders | 是 | 已实现；主表T，原义PCS |
| L | organicOrders | 是 | 已实现；K-M |
| M | adOrders | 是 | 已实现；主表Y |
| N | impressions | 是 | 已实现；主表Z |
| O | clicks | 是 | 已实现；主表AA |
| P | adRevenue | 是 | 已实现；主表W |
| Q | adRevenueLocal | 否 | 已实现；单币种+参数 |
| R | adSpend | 是 | 已实现；主表U |
| S | unbookedPromotion | 否 | 已实现但日期/特殊总计有差异；当月实时促销费用 |
| T | offsiteSpend | 否 | 已实现；站外推广；特殊总计不能简单等价日求和 |
| U | bookedPromotion | 否 | 已实现；已入账单促销费用 |
| V | adSpendLocal | 否 | 已实现；单币种+参数 |
| W | cpc | 是 | 已实现；R/O |
| X | cpcLocal | 否 | 已实现；单币种+参数 |
| Y | ctr | 是 | 已实现；O/N |
| Z | cvr | 是 | 已实现；M/O |
| AA | acos | 是 | 已实现；R/P |
| AB | cpcShare | 是 | 已实现；R/(G+AR)，需VCPO+参数 |
| AC | offsiteShare | 否 | 已实现；T/(G+AR)，需站外+VCPO+参数 |
| AD | promotionShare | 否 | 已实现；(S+U)/(G+AR)，需两促销+VCPO+参数 |
| AE | totalPromotionShare | 否 | 已实现；四推广/(G+AR)，需完整费用+VCPO+参数 |
| AF | unitPrice | 否 | 已实现；AI/AG，发货单件均价 |
| AG | shippedUnits | 是 | 已实现；主表M |
| AH | officialProfit | 是 | 已实现；主AB-R-U-T，正式口径 |
| AI | shippedRevenue | 是 | 已实现；主表N |
| AJ | refundUsd | 否 | 已实现；主表R/确认CNY参数 |
| AK | refundRate | 否 | 已实现；AJ/AI |
| AL | officialMargin | 是 | 已实现；AH/AI |
| AM | estimatedMargin | 否 | 已实现；(AH-S)/AI，受S日期/总计问题影响 |
| AN | skuEstimatedMargin | 否 | 已实现；AL-确认费用比例 |
| AO | inventory | 否 | 仅注册占位；缺库存&日均解析及快照聚合 |
| AP | dailyDemand | 否 | 仅注册占位；缺库存&日均解析及快照聚合 |
| AQ | inventoryDays | 否 | 仅注册占位；依赖AO/AP |
| AR | vcpoRevenue | 是 | 已实现；VCPO I/欧洲参数 |
| AS | vcpoUnits | 是 | 已实现；VCPO J |

A星期/B日期为行信息；C:F四会话字段已排除。除库存三项外均有动态计算代码。推广费用及占比等默认未选，缺源指标又默认隐藏，所以视觉上可能像缺功能。正式毛利在默认透视列中，但未加入顶部固定KPI条。

## 已确认的实现差异与下钻限制（修复前调查）

### 未入账日期改变了原保存行为

原 `当月实时促销费用!AN2` 缓存是文本 `2026-09-17T23:45:00-07:00[US/Pacific]`；AN11为 `Sep 26, 2026, 11:45 PM`，AN12为 `Oct 3, 2026, 11:45 PM`。这些文本都不等于每日行的Excel日期数值。

原S3:S33合计0；S34专门使用 `AN:AN,$AT$1`（AT1为文本通配符`*`），累计包括上述字符串为14952.3224539764。当前 `extractLegacy` 把ISO字串截前10位归一为日期，9月范围会累计13583.293882547863；英文两笔240与1129.02857142857未解析。此行为同时改变原每日S和总计S，不只是缺少来源。

`T34`也为独立SUMIFS且无日期限制；不能承诺所有TOTAL都等于日值之和。正式AH34本身则是日AH求和。

### 原SPU分析支持检查有遗漏

`src/domain/legacy.ts`附表mapping没有保存 `analysisSpu`。`enrichDaily`的supported集合从原辅助对象keys构造；选择原AQ独立SPU筛选/分组时，会在查询前直接跳过费用来源。加载DuckDB时虽后来补了analysisSpu，前面的supported判断依旧不认。当前页面没有开放listingKey链接维度，不能将其描述为已存在的链接筛选故障；链接单元格的文本资格仍参与原日报范围判断。

### 转换SPU与原费用SPU存在原表本身的错位

主表默认SPU取AZ转换值；每日费用条件分别用未入账X和已入账L原SPU。已入账第22行：L=`SPC000080`，AG转换=`SPC000168`，费用730，日期2026-09-27。当前费用分组按L，选择SPC000168会漏这笔；原日报O1直接选转换SPU也会漏。是保留原公式还是统一转换SPU必须明确决定，不能静默宣称完全对账。

### 日期错转换缓存应单独呈现

已入账AB2保存为2026-12-09，AB20为2027-12-09，其他行亦有远期值。严格复现时不能因为文件名是9月就自动改为9月。当前日分析沿用缓存日期，九月正式毛利参考保存口径。

### 可用状态不等价当前范围就绪

`getMetricAvailability`对站外/促销/总推广占比只检查费用表存在，没有同时检查VCPO/参数；因此可能标为可计算而实际结果为`--`。来源覆盖、支持维度和参数仍由enrichDaily实际判断。后续应让状态说明对应当前筛选范围及全部依赖。

以上为只读调查时的证据，原Excel未修改。3.1.1已修复文本日期归一偏差、S/T特殊总计、原SPU维度支持检查和当前范围的状态说明。原费用SPU与主表转换SPU错位、远期缓存日期继续保留原行为；不增加费用/库存补充入口。39项每日指标始终可选，三层毛利明确区分。

只读调查脚本保留在临时目录：`C:/Users/admin/AppData/Local/Temp/jingpin-audit-20261019/read_profit.py`，不属于扩展发布代码。
