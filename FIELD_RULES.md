# 精品日报字段规则与来源

> 3.5.0：VCPO兼容“月份”、缺日期列和旧35列格式；日期明确到日则保留，仅月份或空白且归属明确时补为该月1日。缺转换列时默认SPU/范围资格回退原AA，不编造料号转换。金额I/销量J口径不变，原日期和补齐依据保留。详见 [十文件兼容核查](VCPO_COMPATIBILITY_20261022.md)。

> 3.4.0月份：主表/VCPO的businessMonth由有效业务日期派生；费用由确认报表月份派生，原费用日期不变。月比率按月汇总分子分母重算，月份行复用单月计算，实时文本特殊TOTAL保留；按月多选不混入未选月份。详见 [说明4.1及7.1节](精品日报原理以及使用说明.md)。

> 3.3.1费用表头修复：旧版缺少新旧料号转换时保留空字段，仍按原SPU计算；Original balance兼容读取原I金额，并在数据质量说明未显式标USD、不自动换汇。空表与缺表区分；日期及特殊TOTAL行为保留。具体四文件证据见 [促销来源调查](PROMOTION_SOURCE_AUDIT_20261021.md)。

> 3.3.0现行字段与参数规则在 [完整说明](精品日报原理以及使用说明.md)：VCPO I按日期月份除该月默认/已设置参数，J件数直接汇总。费用报表月份逐行确认，原日期类型不变；缺表/空表整月归零、历史可追溯。下文旧版描述不覆盖这些新规则。

> 版本提示：以下为3.0时期字段记录。3.2.0现版以 [精品日报原理以及使用说明.md](精品日报原理以及使用说明.md) 和 [四来源TOTAL核对](FOUR_SOURCE_TOTAL_RECONCILIATION.md) 为准：四来源按表头映射、独立增量；主表AZ/VCPO AJ默认SPU，费用保留原SPU条件；缺源依赖显示参考标记，站外固定0，三项库存移除。完整说明10.1—10.4包含四表所有规范字段来历及用途。

更新日期：2026-10-16；适用版本：3.0.0。此文档解释当前代码规则；原Excel证据和异常保留在 [精品日报解构与可视化系统设计](精品日报解构与可视化系统设计.md) 第2—6章及第10章。

## 来源与原则

- 主来源是原日报的“发货-进入系统-广告合并报表”；`数据源-案例.xlsx`是该报表的52列独立导出，Sheet名称不决定口径。
- 固定位置A:AZ，按数组读取。H与AC均名为ASIN，G与AD均为SellerSKU相关字段，不能按重名表头去重覆盖。
- 网页读取Excel保存值；不会重新运行匹配表、外链或TODAY。原始52列保留用于追溯和源数据回导。
- AQ经营SPU、AC经营ASIN是已确认规则；不拿E、H或AZ偷偷补成经营商品标识。
- 动态计算不能冒充原表特殊合计；原表错误、空白和错引用结果保留在对账模式。

代码依据：[schema.ts](src/domain/schema.ts)、[normalization.ts](src/domain/normalization.ts)、[metricRegistry.ts](src/analytics/metricRegistry.ts)、[legacy.ts](src/domain/legacy.ts)、[legacyMetrics.ts](src/analytics/legacyMetrics.ts)。

## 52列逐项说明

| 列 | 原表字段 | 当前用途与取值规则 | 规则来历 |
|---|---|---|---|
| A | 平台-合 | platform；已知平台名称统一大小写，保留platformRaw | 合并表平台，原表Amazon/Amazonvc等条件 |
| B | 站点-合 | site；trim并转大写 | 原表站点，国家域名与区域映射依据 |
| C | 日期-合 | businessDate；ISO日期/Excel serial，异常不进入有效事实 | 原表业务日期；不使用网页当天 |
| D | 账号-合 | account | 原表账号；不能用ASIN代替账号维度 |
| E | SPU-合 | sourceSpu；原始SPU，仅保留 | 原始导出标识，不覆盖AQ |
| F | SKU-合 | sku | 原始SKU，不与SellerSKU混用 |
| G | Sellersku-合 | sourceSellerSku；AD为空时的SellerSKU回退 | 保留原始SKU与解析字段差异 |
| H | ASIN | sourceAsin；原始ASIN，不回退填充AC | 第一个ASIN，与AC不同 |
| I | 部门-合 | sourceDepartment；AK空时回退 | 原始归属与匹配后归属分别保存 |
| J | 团队-合 | sourceTeam；AI空时回退 | 同上 |
| K | 销售-合 | sourceSales；AJ空时回退 | 同上 |
| L | 发货-订单数 | shippedOrders | 原始订单数，可求和 |
| M | 发货-PCS | shippedUnits | 发货件数，可求和 |
| N | 发货-付款金额-不含税（USD） | shippedRevenueUsd | 发货销售额、毛利率分母，不是S系统销售额 |
| O | 发货-付款金额-不含税(CNY) | shippedRevenueCny | 人民币源值，批次汇率配对采样 |
| P | 发货-sku毛利 | skuProfitRaw | 保存原值，参与原Excel AB公式 |
| Q | 发货-站内推广费(CNY) | onsitePromotionCostCny | 原Excel AB公式P+Q；不再自行从AB扣一次Q |
| R | 发货-预估退款(CNY) | refundEstimateCny | 预估退款，按可靠或原日报固定汇率换算USD |
| S | 进入系统-付款金额-不含税（USD） | systemRevenueUsd | 经营销售额、默认趋势与Top饼图指标 |
| T | 进入系统-PCS | systemUnits | 页面“进入系统订单*”实际为件数，不是真实独立订单 |
| U | 广告-Spend(USD) | adSpendUsd | 广告花费；仅扣广告参考毛利从AB中扣此列 |
| V | 广告-Spend(CNY) | adSpendCny | 人民币花费，汇率采样 |
| W | 广告销售额(USD)-聚合 | adRevenueUsd | 广告收入，ACOS分母 |
| X | 广告销售额(CNY)-聚合 | adRevenueCny | 保留人民币源值 |
| Y | 广告订单-聚合 | adOrders | 广告订单；与系统件数T粒度不同 |
| Z | 展示数 | impressions | CTR分母 |
| AA | 点击数 | clicks | CPC和广告CVR分母、CTR分子 |
| AB | 发货毛利USD（不扣除推广费） | grossBeforeMarketingUsd | 读取缓存；原Excel为(P+Q)/每日集合AQ1，原例汇率6.6 |
| AC | ASIN | asin；唯一经营ASIN来源，空时记录质量问题 | 原表解析后的第二个ASIN，用户确认 |
| AD | Sellersku | sellerSku优先来源 | 解析值优先，空时回退G并记录来源 |
| AE | 站点&新料号SPU | 原始行保留，不作为数据库复合主键 | 原Excel拼接键；网页使用结构化维度 |
| AF | 账号&站点&SPU | 同上 | 同上 |
| AG | 账号&站点&ASIN | 同上 | 同上 |
| AH | 站点&新料号SPU&销售 | 同上 | 同上 |
| AI | 团队 | resolvedTeam；团队优先来源 | 原表匹配后的团队 |
| AJ | 销售 | resolvedSales；销售优先来源 | 原表按ASIN匹配后的销售；不重做VLOOKUP |
| AK | 部门 | resolvedDepartment；部门优先来源 | 原表组织解析结果 |
| AL | 站点&销售 | 仅保留原始拼接文本 | 网页按site和sales独立分组 |
| AM | 站点&团队 | 同上 | 网页按site和team独立分组 |
| AN | 站点&部门 | 同上 | 网页按site和department独立分组 |
| AO | 匹配链接（若链接更改，需更新） | listingKey；保存原字段 | 原Excel链接匹配结果；不当作任意可执行URL |
| AP | 链接包含的SPU | listingSpus | 原表链接范围信息 |
| AQ | SPU | spu；唯一经营SPU来源，缺失保持null | 原Excel解析SPU与用户确认；E/AZ不覆盖 |
| AR | 小组 | group | 原表小组归属 |
| AS | 是否一致 | isConsistent | 原表一致性标签，保留原值；另检查归属差异 |
| AT | 产品系列 | productSeries | 原表花名册匹配结果 |
| AU | 产品类型 | productType | 独立于产品系列、细化分支 |
| AV | 细化分支 | productBranch | 原表分类层级 |
| AW | 尺寸 | size | 原表尺寸 |
| AX | 尺寸系列 | sizeSeries | 原表组合分类结果，不重新猜测拆分 |
| AY | 尺寸系列分支 | sizeSeriesBranch | 同上 |
| AZ | 新旧料号转换 | oldNewSpuMapping；辅助维度 | 原表新旧料号转换保存值，不替代AQ |

## 清洗、区域与质量

字符串trim；空值与空白为null。数值允许千分位、常见币种符号和括号负数；无法解析的数值保留原单元格并记invalid_number，分析数值为null。零值不转为缺失。

日期支持明确年月日及Excel序列；1904日期系统按1462天偏移处理。不能把含糊的日/月字符串自动猜成业务日期。重复表头需关键位置命中且至少42列相符；空行、重复表头不写入有效事实。源行号和原值仍用于追溯。

区域规则：DE/FR/IT/ES/BE/NL/PL/SE/AT为EU；US、CA、UK独立；其他为OTHER。该规则是网页明确映射，不复制原表“其他都为EU”的假设。商城链接支持的国家多于当前经营区域分类，二者独立。

缺失AQ、AC、销售、团队、部门及原始/解析归属不同分别记录质量问题。T−Y为负时保留，并提示件数与订单粒度差异，不自动归零。

## 主表指标与公式

以下SUM均在当前有效事实、日期和筛选范围内计算；分母为0返回null，各层先汇总分子分母再相除。

| key | 名称 | 公式 / 来源 |
|---|---|---|
| revenue | 进入系统销售额 | SUM(S) |
| revenueNoPo | 不含PO系统销售额 | SUM(S)，排除忽略大小写后的Amazonvc |
| systemOrders | 进入系统订单* | SUM(T)，实为PCS |
| organicOrders | 自然单* | SUM(T)−SUM(Y)，允许负数 |
| adSpend / adRevenue / adOrders | 广告花费/收入/订单 | SUM(U) / SUM(W) / SUM(Y)，三项分别求和 |
| impressions / clicks | 曝光/点击 | SUM(Z) / SUM(AA)，分别求和 |
| cpc | CPC | SUM(U)/SUM(AA) |
| ctr | CTR | SUM(AA)/SUM(Z) |
| cvr | 广告CVR | SUM(Y)/SUM(AA) |
| acos | ACOS | SUM(U)/SUM(W) |
| shippedOrders / shippedUnits / shippedRevenue | 发货订单/件数/收入 | SUM(L) / SUM(M) / SUM(N)，分别求和 |
| unitPrice | 客单价* | SUM(N)/SUM(M)，实际为每件发货均价 |
| grossBeforeMarketing | 发货毛利（未扣推广） | SUM(AB) |
| adOnlyProfit | 参考毛利（仅扣广告） | SUM(AB)−SUM(U)，未扣促销和站外 |
| adOnlyMargin | 参考毛利率（仅扣广告） | (SUM(AB)−SUM(U))/SUM(N) |
| refundUsd | 预估退款USD | 每条R按对应批次汇率换算后汇总；任一有效退款缺汇率则整体null |
| refundRate | 预估退款率 | 预估退款USD/SUM(N) |

单独52列的汇率来自O/N和V/U的有效正数配对中位数，至少5个样本，MAD/中位数≤2%，至少90%样本在中位数±5%内；不可靠时须设置手动汇率。完整原日报使用其固定参数，手动设置不会改写原日报缓存。

## 附表指标、参数与毛利证据

| key | 公式 | 必需来源 |
|---|---|---|
| bookedPromotion | 已入账促销USD汇总 | 已入账单促销费用I |
| unbookedPromotion | 未入账促销USD汇总 | 当月实时促销费用U |
| offsiteSpend | 站外费用USD汇总 | 站外推广H |
| vcpoRevenue | VCPO批发价收入 | VCPO销量I / 原文件保存的换汇参数 |
| cpcShare | 默认组织动态口径为广告花费/系统销售额 | 主表；原表其他分母、特殊总计见对账 |
| officialProfit | AB−广告−已入账促销−站外 | 主表及已入账、站外附表 |
| officialMargin | 正式毛利/发货收入 | 同上 |
| estimatedMargin | (正式毛利−未入账促销)/发货收入 | 再加实时促销来源 |
| skuEstimatedMargin | 正式毛利率−原费用比例 | 正式费用来源及固定参数，原例0.03为3个百分点 |

动态默认组织参数地址：欧元换汇 `部门数据!Q1`、费用比例 `部门数据!U1`、人民币退款换汇 `部门数据!O1`。原工作簿还保留其他视图各自参数和分母；顶部选择条移除后不在普通页面切换这些profile，原始公式仍可对账。各来源先分别聚合，再计算指标，不直接多对多连接。

附表日期/维度从各Sheet固定位置读取，详见 `src/domain/legacy.ts` 的configs：VCPO金额I/日期A、实时促销金额U/日期AN、已入账金额I/日期AB、站外金额H/日期C。原日期文本和公式缓存同时保留，动态费用按完整日报主表覆盖期间关联；九月来源不借给十月，不擅自分摊到每日。维度不支持、期间不完整、重叠或源金额错误时保留null。

原 `每日销售数据-集合!AH3` 为合并表AB条件汇总−R3−U3−T3。这里R3是广告、U3是已入账促销、T3是站外；**不是只依赖主表**。该示例费用为0，不意味着所有日期费用为0。完整原值、公式链和十月案例复算见 [毛利核对](PROFIT_RECONCILIATION.md)。

## 系统字段与重复规则

| 字段 | 生成与用途 |
|---|---|
| id / rawRowId / batchId | 系统UUID和追溯关系，不写入52列源数据导出 |
| fileSha256 | 文件字节SHA-256，相同文件跳过或仅补齐来源 |
| fullRowHash | 日期、数值、空白标准化后的全部52列SHA-256；原值另存 |
| businessIdentityHash | 日期、平台小写、站点大写、账号、E优先否则AQ的身份SPU、F、G优先否则AD、H优先否则AC组成候选身份；只用于发现修订，不改变经营AQ/AC分组 |
| active | 有效事实状态，旧修订和未采纳记录不进入经营汇总 |
| supersededBy | 指向替代旧版本的新原始行 |
| sourceRowNumber | 原Sheet行号，包括表头偏移，用于定位来源 |
| datasetVersion | 导入、来源补齐、汇率等改变时递增，使缓存失效 |
| warehouseState | 完整恢复校验通过后生成的本地完成标记；导入时忽略备份内同名标记，再重新校验生成，未完成库不可切换 |
| _level / _path / _parent / _hasChildren | 分析结果中的层级元数据，控制父子展开与同层排序 |

增量使用多重集合：保留合法重复的次数，只添加新文件多出的出现次数。单旧行/单新行变化为可能修订，多行组存在新指纹则为歧义冲突；需要用户选策略。不会把“日期+ASIN”武断当成唯一键。

## 展示、链接与分析解释

比率内部保存小数，显示为百分比；金额显示USD两位小数，运算保留原始精度。null显示为--，不等于真实0。

ASIN列表选择的指标按当前对象、站点和筛选范围聚合，排序覆盖全部搜索结果后再分页，null始终置后；导出同列同序。链接只从站点白名单与10位ASIN生成，不直接执行原表任意链接文本。多ASIN限制同站点，URL保留用户要求的 `%3A` 和 `%257C`。

饼图默认Top10 SPU，可选Top N，无“其他”；百分比只占所选Top内正贡献。双轴不同刻度不表示金额相等。文字分析基于本地数据模板，期间分段比较不冒充同比环比，不因ACOS高或销售低直接判定亏损。
