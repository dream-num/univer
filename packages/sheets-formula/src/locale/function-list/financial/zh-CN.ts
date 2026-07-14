/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type enUS from './en-US';

const locale: typeof enUS = {
    ACCRINT: {
        description: '返回定期支付利息的债券的应计利息',
        abstract: '返回定期支付利息的债券的应计利息',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/accrint-function',
            },
        ],
        functionParameter: {
            issue: { name: '发行日', detail: '有价证券的发行日。' },
            firstInterest: { name: '首次计息日', detail: '有价证券的首次计息日。' },
            settlement: { name: '到期日', detail: '有价证券的到期日。' },
            rate: { name: '利率', detail: '有价证券的年息票利率。' },
            par: { name: '面值', detail: '有价证券的票面值。' },
            frequency: { name: '频次', detail: '年付息次数。' },
            basis: { name: '基准', detail: '要使用的日计数基准类型。' },
            calcMethod: { name: '计算方法', detail: '是一个逻辑值：从发行日期开始的应计利息 = TRUE 或忽略；从最后票息支付日期开始计算 = FALSE。' },
        },
    },
    ACCRINTM: {
        description: '返回在到期日支付利息的债券的应计利息',
        abstract: '返回在到期日支付利息的债券的应计利息',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/accrintm-function',
            },
        ],
        functionParameter: {
            issue: { name: '发行日', detail: '有价证券的发行日。' },
            settlement: { name: '到期日', detail: '有价证券的到期日。' },
            rate: { name: '利率', detail: '有价证券的年息票利率。' },
            par: { name: '面值', detail: '有价证券的票面值。' },
            basis: { name: '基准', detail: '要使用的日计数基准类型。' },
        },
    },
    AMORDEGRC: {
        description: '使用折旧系数返回每个记帐期的折旧值',
        abstract: '使用折旧系数返回每个记帐期的折旧值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/amordegrc-function',
            },
        ],
        functionParameter: {
            cost: { name: '成本', detail: '资产原值。' },
            datePurchased: { name: '购买日期', detail: '购入资产的日期。' },
            firstPeriod: { name: '首个期间', detail: '第一个期间结束时的日期。' },
            salvage: { name: '残值', detail: '资产在使用寿命结束时的残值。' },
            period: { name: '期间', detail: '期间。' },
            rate: { name: '折旧率', detail: '折旧率。' },
            basis: { name: '基准', detail: '要使用的年基准。' },
        },
    },
    AMORLINC: {
        description: '返回每个记帐期的折旧值',
        abstract: '返回每个记帐期的折旧值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/amorlinc-function',
            },
        ],
        functionParameter: {
            cost: { name: '成本', detail: '资产原值。' },
            datePurchased: { name: '购买日期', detail: '购入资产的日期。' },
            firstPeriod: { name: '首个期间', detail: '第一个期间结束时的日期。' },
            salvage: { name: '残值', detail: '资产在使用寿命结束时的残值。' },
            period: { name: '期间', detail: '期间。' },
            rate: { name: '折旧率', detail: '折旧率。' },
            basis: { name: '基准', detail: '要使用的年基准。' },
        },
    },
    COUPDAYBS: {
        description: '返回从票息期开始到结算日之间的天数',
        abstract: '返回从票息期开始到结算日之间的天数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/coupdaybs-function',
            },
        ],
        functionParameter: {
            settlement: { name: '结算日', detail: '有价证券的结算日。' },
            maturity: { name: '到期日', detail: '有价证券的到期日。' },
            frequency: { name: '频次', detail: '年付息次数。' },
            basis: { name: '基准', detail: '要使用的日计数基准类型。' },
        },
    },
    COUPDAYS: {
        description: '返回包含结算日的票息期天数',
        abstract: '返回包含结算日的票息期天数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/coupdays-function',
            },
        ],
        functionParameter: {
            settlement: { name: '结算日', detail: '有价证券的结算日。' },
            maturity: { name: '到期日', detail: '有价证券的到期日。' },
            frequency: { name: '频次', detail: '年付息次数。' },
            basis: { name: '基准', detail: '要使用的日计数基准类型。' },
        },
    },
    COUPDAYSNC: {
        description: '返回从结算日到下一票息支付日之间的天数',
        abstract: '返回从结算日到下一票息支付日之间的天数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/coupdaysnc-function',
            },
        ],
        functionParameter: {
            settlement: { name: '结算日', detail: '有价证券的结算日。' },
            maturity: { name: '到期日', detail: '有价证券的到期日。' },
            frequency: { name: '频次', detail: '年付息次数。' },
            basis: { name: '基准', detail: '要使用的日计数基准类型。' },
        },
    },
    COUPNCD: {
        description: '返回结算日之后的下一个票息支付日',
        abstract: '返回结算日之后的下一个票息支付日',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/coupncd-function',
            },
        ],
        functionParameter: {
            settlement: { name: '结算日', detail: '有价证券的结算日。' },
            maturity: { name: '到期日', detail: '有价证券的到期日。' },
            frequency: { name: '频次', detail: '年付息次数。' },
            basis: { name: '基准', detail: '要使用的日计数基准类型。' },
        },
    },
    COUPNUM: {
        description: '返回结算日与到期日之间可支付的票息数',
        abstract: '返回结算日与到期日之间可支付的票息数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/coupnum-function',
            },
        ],
        functionParameter: {
            settlement: { name: '结算日', detail: '有价证券的结算日。' },
            maturity: { name: '到期日', detail: '有价证券的到期日。' },
            frequency: { name: '频次', detail: '年付息次数。' },
            basis: { name: '基准', detail: '要使用的日计数基准类型。' },
        },
    },
    COUPPCD: {
        description: '返回结算日之前的上一票息支付日',
        abstract: '返回结算日之前的上一票息支付日',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/couppcd-function',
            },
        ],
        functionParameter: {
            settlement: { name: '结算日', detail: '有价证券的结算日。' },
            maturity: { name: '到期日', detail: '有价证券的到期日。' },
            frequency: { name: '频次', detail: '年付息次数。' },
            basis: { name: '基准', detail: '要使用的日计数基准类型。' },
        },
    },
    CUMIPMT: {
        description: '返回两个付款期之间累积支付的利息',
        abstract: '返回两个付款期之间累积支付的利息',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/cumipmt-function',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '利率。' },
            nper: { name: '总期数', detail: '总付款期数。' },
            pv: { name: '现值', detail: '现值。' },
            startPeriod: { name: '首期', detail: '计算中的首期。付款期数从1开始计数。' },
            endPeriod: { name: '末期', detail: '计算中的末期。' },
            type: { name: '类型', detail: '付款时间类型。' },
        },
    },
    CUMPRINC: {
        description: '返回两个付款期之间为贷款累积支付的本金',
        abstract: '返回两个付款期之间为贷款累积支付的本金',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/cumprinc-function',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '利率。' },
            nper: { name: '总期数', detail: '总付款期数。' },
            pv: { name: '现值', detail: '现值。' },
            startPeriod: { name: '首期', detail: '计算中的首期。付款期数从1开始计数。' },
            endPeriod: { name: '末期', detail: '计算中的末期。' },
            type: { name: '类型', detail: '付款时间类型。' },
        },
    },
    DB: {
        description: '使用固定余额递减法，返回一笔资产在给定期间内的折旧值',
        abstract: '使用固定余额递减法，返回一笔资产在给定期间内的折旧值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/db-function',
            },
        ],
        functionParameter: {
            cost: { name: '成本', detail: '资产原值。' },
            salvage: { name: '残值', detail: '折旧末尾时的值（有时也称为资产残值）。' },
            life: { name: '使用寿命', detail: '资产的折旧期数（有时也称作资产的使用寿命）。' },
            period: { name: '期间', detail: '要计算折旧的时期。' },
            month: { name: '月份', detail: '第一年的月份数。如果省略月份，则假定其值为12。' },
        },
    },
    DDB: {
        description: '使用双倍余额递减法或其他指定方法，返回一笔资产在给定期间内的折旧值',
        abstract: '使用双倍余额递减法或其他指定方法，返回一笔资产在给定期间内的折旧值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/ddb-function',
            },
        ],
        functionParameter: {
            cost: { name: '成本', detail: '资产原值。' },
            salvage: { name: '残值', detail: '折旧末尾时的值（有时也称为资产残值）。' },
            life: { name: '使用寿命', detail: '资产的折旧期数（有时也称作资产的使用寿命）。' },
            period: { name: '期间', detail: '要计算折旧的时期。' },
            factor: { name: '速率', detail: '余额递减速率。如果省略影响因素，则假定为2（双倍余额递减法）。' },
        },
    },
    DISC: {
        description: '返回债券的贴现率',
        abstract: '返回债券的贴现率',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/disc-function',
            },
        ],
        functionParameter: {
            settlement: { name: '结算日', detail: '有价证券的结算日。' },
            maturity: { name: '到期日', detail: '有价证券的到期日。' },
            pr: { name: '价格', detail: '有价证券的价格（按面值为￥100计算）。' },
            redemption: { name: '清偿价', detail: '面值￥100的有价证券的清偿价值。' },
            basis: { name: '基准', detail: '要使用的日计数基准类型。' },
        },
    },
    DOLLARDE: {
        description: '将以分数表示的价格转换为以小数表示的价格',
        abstract: '将以分数表示的价格转换为以小数表示的价格',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/dollarde-function',
            },
        ],
        functionParameter: {
            fractionalDollar: { name: '分数', detail: '以整数部份和分数部分表示的数字，用小数点隔开。' },
            fraction: { name: '分母', detail: '用作分数中的分母的整数。' },
        },
    },
    DOLLARFR: {
        description: '将以小数表示的价格转换为以分数表示的价格',
        abstract: '将以小数表示的价格转换为以分数表示的价格',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/dollarfr-function',
            },
        ],
        functionParameter: {
            decimalDollar: { name: '小数', detail: '小数。' },
            fraction: { name: '分母', detail: '用作分数中的分母的整数。' },
        },
    },
    DURATION: {
        description: '返回定期支付利息的债券的每年期限',
        abstract: '返回定期支付利息的债券的每年期限',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/duration-function',
            },
        ],
        functionParameter: {
            settlement: { name: '结算日', detail: '有价证券的结算日。' },
            maturity: { name: '到期日', detail: '有价证券的到期日。' },
            coupon: { name: '年息票利率', detail: '有价证券的年息票利率。' },
            yld: { name: '年收益率', detail: '有价证券的年收益率。' },
            frequency: { name: '频次', detail: '年付息次数。' },
            basis: { name: '基准', detail: '要使用的日计数基准类型。' },
        },
    },
    EFFECT: {
        description: '返回年有效利率',
        abstract: '返回年有效利率',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/effect-function',
            },
        ],
        functionParameter: {
            nominalRate: { name: '名义利率', detail: '名义利率。' },
            npery: { name: '期数', detail: '每年的复利期数。' },
        },
    },
    FV: {
        description: '返回一笔投资的未来值',
        abstract: '返回一笔投资的未来值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/fv-function',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '各期利率。' },
            nper: { name: '总期数', detail: '年金的付款总期数。' },
            pmt: { name: '金额', detail: '各期所应支付的金额，在整个年金期间保持不变。' },
            pv: { name: '现值', detail: '现值，或一系列未来付款的当前值的累积和。' },
            type: { name: '类型', detail: '数字0或1，用以指定各期的付款时间是在期初还是期末。' },
        },
    },
    FVSCHEDULE: {
        description: '返回应用一系列复利率计算的初始本金的未来值。 使用 FVSCHEDULE 通过变量或可调节利率计算某项投资未来的价值。',
        abstract: '返回应用一系列复利率计算的初始本金的未来值。 使用 FVSCHEDULE 通过变量或可调节利率计算某项投资未来的价值。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/fvschedule-function',
            },
        ],
        functionParameter: {
            principal: { name: '本金', detail: '必填。 现值。' },
            schedule: { name: '利率数组', detail: '必填。 要应用的利率数组。' },
        },
    },
    INTRATE: {
        description: '返回完全投资型证券的利率。',
        abstract: '返回完全投资型证券的利率。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/intrate-function',
            },
        ],
        functionParameter: {
            settlement: { name: '结算日', detail: '必填。 有价证券的结算日。 有价证券结算日是在发行日之后，有价证券卖给购买者的日期。' },
            maturity: { name: '到期日', detail: '必填。 有价证券的到期日。 到期日是有价证券有效期截止时的日期。' },
            investment: { name: '投资额', detail: '必填。 有价证券的投资额。' },
            redemption: { name: '清偿价', detail: '必填。 有价证券到期时的兑换值。' },
            basis: { name: '基准', detail: '选。 要使用的日计数基准类型。' },
        },
    },
    IPMT: {
        description: '返回一笔投资在给定期间内支付的利息',
        abstract: '返回一笔投资在给定期间内支付的利息',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/ipmt-function',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '各期利率。' },
            per: { name: '期数', detail: '用于计算其利息数额的期数，必须在1到nper之间。' },
            nper: { name: '总期数', detail: '年金的付款总期数。' },
            pv: { name: '现值', detail: '现值，或一系列未来付款的当前值的累积和。' },
            fv: { name: '余额', detail: '未来值，或在最后一次付款后希望得到的现金余额。' },
            type: { name: '类型', detail: '数字0或1，用以指定各期的付款时间是在期初还是期末。' },
        },
    },
    IRR: {
        description: '返回一系列现金流的内部收益率',
        abstract: '返回一系列现金流的内部收益率',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/irr-function',
            },
        ],
        functionParameter: {
            values: { name: '现金流', detail: '数组或单元格的引用，这些单元格包含用来计算内部收益率的数字。\n1.Values 必须包含至少一个正值和一个负值，以计算返回的内部收益率。\n2.IRR 使用值的顺序来说明现金流的顺序。 一定要按需要的顺序输入支出值和收益值。\n3.如果数组或引用包含文本、逻辑值或空白单元格，这些数值将被忽略。' },
            guess: { name: '估计值', detail: '对函数 IRR 计算结果的估计值。' },
        },
    },
    ISPMT: {
        description: '计算特定投资期内要支付的利息',
        abstract: '计算特定投资期内要支付的利息',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/ispmt-function',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '投资的利率。' },
            per: { name: '期数', detail: '要查找兴趣的时间段，并且必须介于1和Nper之间。' },
            nper: { name: '总期数', detail: '投资的总支付期数。' },
            pv: { name: '现值', detail: '投资的现值。对于贷款，Pv是贷款金额。' },
        },
    },
    MDURATION: {
        description: '返回假设面值为 ￥100 的有价证券的 Macauley 修正期限',
        abstract: '返回假设面值为 ￥100 的有价证券的 Macauley 修正期限',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/mduration-function',
            },
        ],
        functionParameter: {
            settlement: { name: '结算日', detail: '有价证券的结算日。' },
            maturity: { name: '到期日', detail: '有价证券的到期日。' },
            coupon: { name: '年息票利率', detail: '有价证券的年息票利率。' },
            yld: { name: '年收益率', detail: '有价证券的年收益率。' },
            frequency: { name: '频次', detail: '年付息次数。' },
            basis: { name: '基准', detail: '要使用的日计数基准类型。' },
        },
    },
    MIRR: {
        description: '返回正和负现金流以不同利率进行计算的内部收益率',
        abstract: '返回正和负现金流以不同利率进行计算的内部收益率',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/mirr-function',
            },
        ],
        functionParameter: {
            values: { name: '现金流', detail: '数组或对包含数字的单元格的引用。 这些数值代表一系列定期支出（负值）和收益（正值）。\n1.Values 必须至少包含一个正值和一个负值，才能计算修改后的内部回报率。 否则，MIRR 返回 #DIV/0！ 。\n2.如果数组或引用参数包含文本、逻辑值或空白单元格，则这些值将被忽略；但包含零值的单元格将计算在内。' },
            financeRate: { name: '融资利率', detail: '现金流中使用的资金支付的利率。' },
            reinvestRate: { name: '再投资收益率', detail: '将现金流再投资的收益率。' },
        },
    },
    NOMINAL: {
        description: '返回年度的名义利率',
        abstract: '返回年度的名义利率',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/nominal-function',
            },
        ],
        functionParameter: {
            effectRate: { name: '实际利率', detail: '实际利率。' },
            npery: { name: '期数', detail: '每年的复利期数。' },
        },
    },
    NPER: {
        description: '返回投资的期数',
        abstract: '返回投资的期数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/nper-function',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '各期利率。' },
            pmt: { name: '金额', detail: '各期所应支付的金额，在整个年金期间保持不变。' },
            pv: { name: '现值', detail: '现值，或一系列未来付款的当前值的累积和。' },
            fv: { name: '余额', detail: '未来值，或在最后一次付款后希望得到的现金余额。' },
            type: { name: '类型', detail: '数字0或1，用以指定各期的付款时间是在期初还是期末。' },
        },
    },
    NPV: {
        description: '返回基于一系列定期的现金流和贴现率计算的投资的净现值',
        abstract: '返回基于一系列定期的现金流和贴现率计算的投资的净现值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/npv-function',
            },
        ],
        functionParameter: {
            rate: { name: '贴现率', detail: '某一期间的贴现率。' },
            value1: { name: '现金流1', detail: '这些是代表支出及收入的 1 到 254 个参数。' },
            value2: { name: '现金流2', detail: '这些是代表支出及收入的 1 到 254 个参数。' },
        },
    },
    ODDFPRICE: {
        description: '返回每张票面为 ￥100 且第一期为奇数的债券的现价',
        abstract: '返回每张票面为 ￥100 且第一期为奇数的债券的现价',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/oddfprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: '结算日', detail: '有价证券的结算日。' },
            maturity: { name: '到期日', detail: '有价证券的到期日。' },
            issue: { name: '发行日', detail: '有价证券的发行日。' },
            firstCoupon: { name: '首期付息日', detail: '有价证券的首期付息日。' },
            rate: { name: '利率', detail: '有价证券的利率。' },
            yld: { name: '年收益率', detail: '有价证券的年收益率。' },
            redemption: { name: '清偿价', detail: '面值 ￥100 的有价证券的清偿价值。' },
            frequency: { name: '频次', detail: '年付息次数。 如果按年支付，frequency = 1；按半年期支付，frequency = 2；按季支付，frequency = 4。' },
            basis: { name: '基准', detail: '要使用的日计数基准类型。' },
        },
    },
    ODDFYIELD: {
        description: '返回第一期为奇数的债券的收益',
        abstract: '返回第一期为奇数的债券的收益',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/oddfyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: '结算日', detail: '有价证券的结算日。' },
            maturity: { name: '到期日', detail: '有价证券的到期日。' },
            issue: { name: '发行日', detail: '有价证券的发行日。' },
            firstCoupon: { name: '首期付息日', detail: '有价证券的首期付息日。' },
            rate: { name: '利率', detail: '有价证券的利率。' },
            pr: { name: '价格', detail: '有价证券的价格。' },
            redemption: { name: '清偿价', detail: '面值 ￥100 的有价证券的清偿价值。' },
            frequency: { name: '频次', detail: '年付息次数。 如果按年支付，frequency = 1；按半年期支付，frequency = 2；按季支付，frequency = 4。' },
            basis: { name: '基准', detail: '要使用的日计数基准类型。' },
        },
    },
    ODDLPRICE: {
        description: '返回每张票面为 ￥100 且最后一期为奇数的债券的现价',
        abstract: '返回每张票面为 ￥100 且最后一期为奇数的债券的现价',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/oddlprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: '结算日', detail: '有价证券的结算日。' },
            maturity: { name: '到期日', detail: '有价证券的到期日。' },
            lastInterest: { name: '末期付息日', detail: '有价证券的末期付息日。' },
            rate: { name: '利率', detail: '有价证券的利率。' },
            yld: { name: '年收益率', detail: '有价证券的年收益率。' },
            redemption: { name: '清偿价', detail: '面值 ￥100 的有价证券的清偿价值。' },
            frequency: { name: '频次', detail: '年付息次数。 如果按年支付，frequency = 1；按半年期支付，frequency = 2；按季支付，frequency = 4。' },
            basis: { name: '基准', detail: '要使用的日计数基准类型。' },
        },
    },
    ODDLYIELD: {
        description: '返回最后一期为奇数的债券的收益',
        abstract: '返回最后一期为奇数的债券的收益',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/oddlyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: '结算日', detail: '有价证券的结算日。' },
            maturity: { name: '到期日', detail: '有价证券的到期日。' },
            lastInterest: { name: '末期付息日', detail: '有价证券的末期付息日。' },
            rate: { name: '利率', detail: '有价证券的利率。' },
            pr: { name: '价格', detail: '有价证券的价格。' },
            redemption: { name: '清偿价', detail: '面值 ￥100 的有价证券的清偿价值。' },
            frequency: { name: '频次', detail: '年付息次数。 如果按年支付，frequency = 1；按半年期支付，frequency = 2；按季支付，frequency = 4。' },
            basis: { name: '基准', detail: '要使用的日计数基准类型。' },
        },
    },
    PDURATION: {
        description: '返回投资到达指定值所需的期数',
        abstract: '返回投资到达指定值所需的期数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/pduration-function',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '每个周期的利率。' },
            pv: { name: '现值', detail: '投资的现值。' },
            fv: { name: '未来价值', detail: '投资的预期未来价值。' },
        },
    },
    PMT: {
        description: '返回年金的定期支付金额',
        abstract: '返回年金的定期支付金额',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/pmt-function',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '各期利率。' },
            nper: { name: '总期数', detail: '年金的付款总期数。' },
            pv: { name: '现值', detail: '现值，或一系列未来付款的当前值的累积和。' },
            fv: { name: '余额', detail: '未来值，或在最后一次付款后希望得到的现金余额。' },
            type: { name: '类型', detail: '数字0或1，用以指定各期的付款时间是在期初还是期末。' },
        },
    },
    PPMT: {
        description: '返回一笔投资在给定期间内偿还的本金',
        abstract: '返回一笔投资在给定期间内偿还的本金',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/ppmt-function',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '各期利率。' },
            per: { name: '期数', detail: '用于计算其利息数额的期数，必须在1到nper之间。' },
            nper: { name: '总期数', detail: '年金的付款总期数。' },
            pv: { name: '现值', detail: '现值，或一系列未来付款的当前值的累积和。' },
            fv: { name: '余额', detail: '未来值，或在最后一次付款后希望得到的现金余额。' },
            type: { name: '类型', detail: '数字0或1，用以指定各期的付款时间是在期初还是期末。' },
        },
    },
    PRICE: {
        description: '返回每张票面为 ￥100 且定期支付利息的债券的现价',
        abstract: '返回每张票面为 ￥100 且定期支付利息的债券的现价',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/price-function',
            },
        ],
        functionParameter: {
            settlement: { name: '结算日', detail: '有价证券的结算日。' },
            maturity: { name: '到期日', detail: '有价证券的到期日。' },
            rate: { name: '利率', detail: '有价证券的利率。' },
            yld: { name: '年收益率', detail: '有价证券的年收益率。' },
            redemption: { name: '清偿价', detail: '面值 ￥100 的有价证券的清偿价值。' },
            frequency: { name: '频次', detail: '年付息次数。 如果按年支付，frequency = 1；按半年期支付，frequency = 2；按季支付，frequency = 4。' },
            basis: { name: '基准', detail: '要使用的日计数基准类型。' },
        },
    },
    PRICEDISC: {
        description: '返回每张票面为 ￥100 的已贴现债券的现价',
        abstract: '返回每张票面为 ￥100 的已贴现债券的现价',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/pricedisc-function',
            },
        ],
        functionParameter: {
            settlement: { name: '结算日', detail: '有价证券的结算日。' },
            maturity: { name: '到期日', detail: '有价证券的到期日。' },
            discount: { name: '贴现率', detail: '有价证券的贴现率。' },
            redemption: { name: '清偿价', detail: '面值 ￥100 的有价证券的清偿价值。' },
            basis: { name: '基准', detail: '要使用的日计数基准类型。' },
        },
    },
    PRICEMAT: {
        description: '返回每张票面为 ￥100 且在到期日支付利息的债券的现价',
        abstract: '返回每张票面为 ￥100 且在到期日支付利息的债券的现价',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/pricemat-function',
            },
        ],
        functionParameter: {
            settlement: { name: '结算日', detail: '有价证券的结算日。' },
            maturity: { name: '到期日', detail: '有价证券的到期日。' },
            issue: { name: '发行日', detail: '有价证券的发行日。' },
            rate: { name: '利率', detail: '有价证券的利率。' },
            yld: { name: '年收益率', detail: '有价证券的年收益率。' },
            basis: { name: '基准', detail: '要使用的日计数基准类型。' },
        },
    },
    PV: {
        description: '返回投资的现值',
        abstract: '返回投资的现值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/pv-function',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '各期利率。' },
            nper: { name: '总期数', detail: '年金的付款总期数。' },
            pmt: { name: '金额', detail: '各期所应支付的金额，在整个年金期间保持不变。' },
            fv: { name: '余额', detail: '未来值，或在最后一次付款后希望得到的现金余额。' },
            type: { name: '类型', detail: '数字0或1，用以指定各期的付款时间是在期初还是期末。' },
        },
    },
    RATE: {
        description: '返回年金的各期利率',
        abstract: '返回年金的各期利率',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/rate-function',
            },
        ],
        functionParameter: {
            nper: { name: '总期数', detail: '年金的付款总期数。' },
            pmt: { name: '金额', detail: '各期所应支付的金额，在整个年金期间保持不变。' },
            pv: { name: '现值', detail: '现值，或一系列未来付款的当前值的累积和。' },
            fv: { name: '余额', detail: '未来值，或在最后一次付款后希望得到的现金余额。' },
            type: { name: '类型', detail: '数字0或1，用以指定各期的付款时间是在期初还是期末。' },
            guess: { name: '猜测值', detail: '预期利率。' },
        },
    },
    RECEIVED: {
        description: '返回完全投资型债券在到期日收回的金额',
        abstract: '返回完全投资型债券在到期日收回的金额',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/received-function',
            },
        ],
        functionParameter: {
            settlement: { name: '结算日', detail: '有价证券的结算日。' },
            maturity: { name: '到期日', detail: '有价证券的到期日。' },
            investment: { name: '投资额', detail: '有价证券的投资额。' },
            discount: { name: '贴现率', detail: '有价证券的贴现率。' },
            basis: { name: '基准', detail: '要使用的日计数基准类型。' },
        },
    },
    RRI: {
        description: '返回某项投资增长的等效利率',
        abstract: '返回某项投资增长的等效利率',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/rri-function',
            },
        ],
        functionParameter: {
            nper: { name: '总期数', detail: '投资的周期数。' },
            pv: { name: '现值', detail: '投资的现值。' },
            fv: { name: '未来价值', detail: '投资的未来价值。' },
        },
    },
    SLN: {
        description: '返回固定资产的每期线性折旧费',
        abstract: '返回固定资产的每期线性折旧费',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/sln-function',
            },
        ],
        functionParameter: {
            cost: { name: '资产原值', detail: '资产原值。' },
            salvage: { name: '资产残值', detail: '折旧末尾时的值（有时也称为资产残值）。' },
            life: { name: '资产使用寿命', detail: '资产的折旧期数（有时也称作资产的使用寿命）。' },
        },
    },
    SYD: {
        description: '返回某项固定资产按年限总和折旧法计算的每期折旧金额',
        abstract: '返回某项固定资产按年限总和折旧法计算的每期折旧金额',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/syd-function',
            },
        ],
        functionParameter: {
            cost: { name: '资产原值', detail: '资产原值。' },
            salvage: { name: '资产残值', detail: '折旧末尾时的值（有时也称为资产残值）。' },
            life: { name: '资产使用寿命', detail: '资产的折旧期数（有时也称作资产的使用寿命）。' },
            per: { name: '期间', detail: '期间。' },
        },
    },
    TBILLEQ: {
        description: '返回国库券的等价债券收益',
        abstract: '返回国库券的等价债券收益',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/tbilleq-function',
            },
        ],
        functionParameter: {
            settlement: { name: '结算日', detail: '国库券的结算日。' },
            maturity: { name: '到期日', detail: '国库券的到期日。' },
            discount: { name: '贴现率', detail: '国库券的贴现率。' },
        },
    },
    TBILLPRICE: {
        description: '返回面值 ￥100 的国库券的价格',
        abstract: '返回面值 ￥100 的国库券的价格',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/tbillprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: '结算日', detail: '国库券的结算日。' },
            maturity: { name: '到期日', detail: '国库券的到期日。' },
            discount: { name: '贴现率', detail: '国库券的贴现率。' },
        },
    },
    TBILLYIELD: {
        description: '返回国库券的收益率',
        abstract: '返回国库券的收益率',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/tbillyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: '结算日', detail: '国库券的结算日。' },
            maturity: { name: '到期日', detail: '国库券的到期日。' },
            pr: { name: '价格', detail: '面值 ￥100 的国库券的价格。' },
        },
    },
    VDB: {
        description: '使用余额递减法，返回一笔资产在给定期间或部分期间内的折旧值',
        abstract: '使用余额递减法，返回一笔资产在给定期间或部分期间内的折旧值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/vdb-function',
            },
        ],
        functionParameter: {
            cost: { name: '成本', detail: '资产原值。' },
            salvage: { name: '残值', detail: '折旧末尾时的值（有时也称为资产残值）。' },
            life: { name: '使用寿命', detail: '资产的折旧期数（有时也称作资产的使用寿命）。' },
            startPeriod: { name: '起始时期', detail: '要计算折旧的起始时期。' },
            endPeriod: { name: '终止时期', detail: '要计算折旧的终止时期。' },
            factor: { name: '速率', detail: '余额递减速率。如果省略影响因素，则假定为2（双倍余额递减法）。' },
            noSwitch: { name: '不切换', detail: '逻辑值，指定当折旧值大于余额递减计算值时，是否转用直线折旧法。' },
        },
    },
    XIRR: {
        description: '返回一组现金流的内部收益率，这些现金流不一定定期发生',
        abstract: '返回一组现金流的内部收益率，这些现金流不一定定期发生',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/xirr-function',
            },
        ],
        functionParameter: {
            values: { name: '现金流', detail: '与 dates 中的支付时间相对应的一系列现金流。 首期支付是可选的，并与投资开始时的成本或支付有关。 如果第一个值是成本或支付，则它必须是负值。 所有后续支付都基于 365 天/年贴现。 值系列中必须至少包含一个正值和一个负值。' },
            dates: { name: '日期表', detail: '与现金流支付相对应的支付日期表。 日期可以按任意顺序出现。' },
            guess: { name: '估计值', detail: '对函数 XIRR 计算结果的估计值。' },
        },
    },
    XNPV: {
        description: '返回一组现金流的净现值，这些现金流不一定定期发生',
        abstract: '返回一组现金流的净现值，这些现金流不一定定期发生',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/xnpv-function',
            },
        ],
        functionParameter: {
            rate: { name: '贴现率', detail: '应用于现金流的贴现率。' },
            values: { name: '现金流', detail: '与 dates 中的支付时间相对应的一系列现金流。 首期支付是可选的，并与投资开始时的成本或支付有关。 如果第一个值是成本或支付，则它必须是负值。 所有后续支付都基于 365 天/年贴现。 值系列中必须至少包含一个正值和一个负值。' },
            dates: { name: '日期表', detail: '与现金流支付相对应的支付日期表。 日期可以按任意顺序出现。' },
        },
    },
    YIELD: {
        description: '返回定期支付利息的债券的收益',
        abstract: '返回定期支付利息的债券的收益',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/yield-function',
            },
        ],
        functionParameter: {
            settlement: { name: '结算日', detail: '有价证券的结算日。' },
            maturity: { name: '到期日', detail: '有价证券的到期日。' },
            rate: { name: '利率', detail: '有价证券的利率。' },
            pr: { name: '价格', detail: '有价证券的价格（按面值为 ￥100 计算）。' },
            redemption: { name: '清偿价', detail: '面值 ￥100 的有价证券的清偿价值。' },
            frequency: { name: '频次', detail: '年付息次数。 如果按年支付，frequency = 1；按半年期支付，frequency = 2；按季支付，frequency = 4。' },
            basis: { name: '基准', detail: '要使用的日计数基准类型。' },
        },
    },
    YIELDDISC: {
        description: '返回已贴现债券的年收益；例如，短期国库券',
        abstract: '返回已贴现债券的年收益；例如，短期国库券',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/yielddisc-function',
            },
        ],
        functionParameter: {
            settlement: { name: '结算日', detail: '有价证券的结算日。' },
            maturity: { name: '到期日', detail: '有价证券的到期日。' },
            pr: { name: '价格', detail: '有价证券的价格（按面值为 ￥100 计算）。' },
            redemption: { name: '清偿价', detail: '面值 ￥100 的有价证券的清偿价值。' },
            basis: { name: '基准', detail: '要使用的日计数基准类型。' },
        },
    },
    YIELDMAT: {
        description: '返回在到期日支付利息的债券的年收益',
        abstract: '返回在到期日支付利息的债券的年收益',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/yieldmat-function',
            },
        ],
        functionParameter: {
            settlement: { name: '结算日', detail: '有价证券的结算日。' },
            maturity: { name: '到期日', detail: '有价证券的到期日。' },
            issue: { name: '发行日', detail: '有价证券的发行日。' },
            rate: { name: '利率', detail: '有价证券的利率。' },
            pr: { name: '价格', detail: '有价证券的价格（按面值为 ￥100 计算）。' },
            basis: { name: '基准', detail: '要使用的日计数基准类型。' },
        },
    },
};

export default locale;
