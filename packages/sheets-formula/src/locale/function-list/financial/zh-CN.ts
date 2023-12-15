/**
 * Copyright 2023-present DreamNum Inc.
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

export default {
    ACCRINT: {
        description: '返回定期支付利息的债券的应计利息',
        abstract: '返回定期支付利息的债券的应计利息',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/accrint-%E5%87%BD%E6%95%B0-fe45d089-6722-4fb3-9379-e1f911d8dc74',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ACCRINTM: {
        description: '返回在到期日支付利息的债券的应计利息',
        abstract: '返回在到期日支付利息的债券的应计利息',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/accrintm-%E5%87%BD%E6%95%B0-f62f01f9-5754-4cc4-805b-0e70199328a7',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    AMORDEGRC: {
        description: '使用折旧系数返回每个记帐期的折旧值',
        abstract: '使用折旧系数返回每个记帐期的折旧值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/amordegrc-%E5%87%BD%E6%95%B0-a14d0ca1-64a4-42eb-9b3d-b0dededf9e51',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    AMORLINC: {
        description: '返回每个记帐期的折旧值',
        abstract: '返回每个记帐期的折旧值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/amorlinc-%E5%87%BD%E6%95%B0-7d417b45-f7f5-4dba-a0a5-3451a81079a8',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    COUPDAYBS: {
        description: '返回从票息期开始到结算日之间的天数',
        abstract: '返回从票息期开始到结算日之间的天数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/coupdaybs-%E5%87%BD%E6%95%B0-eb9a8dfb-2fb2-4c61-8e5d-690b320cf872',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    COUPDAYS: {
        description: '返回包含结算日的票息期天数',
        abstract: '返回包含结算日的票息期天数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/coupdays-%E5%87%BD%E6%95%B0-cc64380b-315b-4e7b-950c-b30b0a76f671',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    COUPDAYSNC: {
        description: '返回从结算日到下一票息支付日之间的天数',
        abstract: '返回从结算日到下一票息支付日之间的天数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/coupdaysnc-%E5%87%BD%E6%95%B0-5ab3f0b2-029f-4a8b-bb65-47d525eea547',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    COUPNCD: {
        description: '返回结算日之后的下一个票息支付日',
        abstract: '返回结算日之后的下一个票息支付日',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/coupncd-%E5%87%BD%E6%95%B0-fd962fef-506b-4d9d-8590-16df5393691f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    COUPNUM: {
        description: '返回结算日与到期日之间可支付的票息数',
        abstract: '返回结算日与到期日之间可支付的票息数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/coupnum-%E5%87%BD%E6%95%B0-a90af57b-de53-4969-9c99-dd6139db2522',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    COUPPCD: {
        description: '返回结算日之前的上一票息支付日',
        abstract: '返回结算日之前的上一票息支付日',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/couppcd-%E5%87%BD%E6%95%B0-2eb50473-6ee9-4052-a206-77a9a385d5b3',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CUMIPMT: {
        description: '返回两个付款期之间累积支付的利息',
        abstract: '返回两个付款期之间累积支付的利息',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/cumipmt-%E5%87%BD%E6%95%B0-61067bb0-9016-427d-b95b-1a752af0e606',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CUMPRINC: {
        description: '返回两个付款期之间为贷款累积支付的本金',
        abstract: '返回两个付款期之间为贷款累积支付的本金',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/cumprinc-%E5%87%BD%E6%95%B0-94a4516d-bd65-41a1-bc16-053a6af4c04d',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    DB: {
        description: '使用固定余额递减法，返回一笔资产在给定期间内的折旧值',
        abstract: '使用固定余额递减法，返回一笔资产在给定期间内的折旧值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/db-%E5%87%BD%E6%95%B0-354e7d28-5f93-4ff1-8a52-eb4ee549d9d7',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    DDB: {
        description: '使用双倍余额递减法或其他指定方法，返回一笔资产在给定期间内的折旧值',
        abstract: '使用双倍余额递减法或其他指定方法，返回一笔资产在给定期间内的折旧值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/ddb-%E5%87%BD%E6%95%B0-519a7a37-8772-4c96-85c0-ed2c209717a5',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    DISC: {
        description: '返回债券的贴现率',
        abstract: '返回债券的贴现率',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/disc-%E5%87%BD%E6%95%B0-71fce9f3-3f05-4acf-a5a3-eac6ef4daa53',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    DOLLARDE: {
        description: '将以分数表示的价格转换为以小数表示的价格',
        abstract: '将以分数表示的价格转换为以小数表示的价格',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/dollarde-%E5%87%BD%E6%95%B0-db85aab0-1677-428a-9dfd-a38476693427',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    DOLLARFR: {
        description: '将以小数表示的价格转换为以分数表示的价格',
        abstract: '将以小数表示的价格转换为以分数表示的价格',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/dollarfr-%E5%87%BD%E6%95%B0-0835d163-3023-4a33-9824-3042c5d4f495',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    DURATION: {
        description: '返回定期支付利息的债券的每年期限',
        abstract: '返回定期支付利息的债券的每年期限',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/duration-%E5%87%BD%E6%95%B0-b254ea57-eadc-4602-a86a-c8e369334038',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    EFFECT: {
        description: '返回年有效利率',
        abstract: '返回年有效利率',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/effect-%E5%87%BD%E6%95%B0-910d4e4c-79e2-4009-95e6-507e04f11bc4',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FV: {
        description: '返回一笔投资的未来值',
        abstract: '返回一笔投资的未来值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/fv-%E5%87%BD%E6%95%B0-2eef9f44-a084-4c61-bdd8-4fe4bb1b71b3',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FVSCHEDULE: {
        description: '返回应用一系列复利率计算的初始本金的未来值',
        abstract: '返回应用一系列复利率计算的初始本金的未来值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/fvschedule-%E5%87%BD%E6%95%B0-bec29522-bd87-4082-bab9-a241f3fb251d',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    INTRATE: {
        description: '返回完全投资型债券的利率',
        abstract: '返回完全投资型债券的利率',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/intrate-%E5%87%BD%E6%95%B0-5cb34dde-a221-4cb6-b3eb-0b9e55e1316f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IPMT: {
        description: '返回一笔投资在给定期间内支付的利息',
        abstract: '返回一笔投资在给定期间内支付的利息',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/ipmt-%E5%87%BD%E6%95%B0-5cce0ad6-8402-4a41-8d29-61a0b054cb6f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IRR: {
        description: '返回一系列现金流的内部收益率',
        abstract: '返回一系列现金流的内部收益率',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/irr-%E5%87%BD%E6%95%B0-64925eaa-9988-495b-b290-3ad0c163c1bc',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ISPMT: {
        description: '计算特定投资期内要支付的利息',
        abstract: '计算特定投资期内要支付的利息',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/ispmt-%E5%87%BD%E6%95%B0-fa58adb6-9d39-4ce0-8f43-75399cea56cc',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    MDURATION: {
        description: '返回假设面值为 ￥100 的有价证券的 Macauley 修正期限',
        abstract: '返回假设面值为 ￥100 的有价证券的 Macauley 修正期限',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/mduration-%E5%87%BD%E6%95%B0-b3786a69-4f20-469a-94ad-33e5b90a763c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    MIRR: {
        description: '返回正和负现金流以不同利率进行计算的内部收益率',
        abstract: '返回正和负现金流以不同利率进行计算的内部收益率',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/mirr-%E5%87%BD%E6%95%B0-b020f038-7492-4fb4-93c1-35c345b53524',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    NOMINAL: {
        description: '返回年度的名义利率',
        abstract: '返回年度的名义利率',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/nominal-%E5%87%BD%E6%95%B0-7f1ae29b-6b92-435e-b950-ad8b190ddd2b',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    NPER: {
        description: '返回投资的期数',
        abstract: '返回投资的期数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/nper-%E5%87%BD%E6%95%B0-240535b5-6653-4d2d-bfcf-b6a38151d815',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    NPV: {
        description: '返回基于一系列定期的现金流和贴现率计算的投资的净现值',
        abstract: '返回基于一系列定期的现金流和贴现率计算的投资的净现值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/npv-%E5%87%BD%E6%95%B0-8672cb67-2576-4d07-b67b-ac28acf2a568',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ODDFPRICE: {
        description: '返回每张票面为 ￥100 且第一期为奇数的债券的现价',
        abstract: '返回每张票面为 ￥100 且第一期为奇数的债券的现价',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/oddfprice-%E5%87%BD%E6%95%B0-d7d664a8-34df-4233-8d2b-922bcf6a69e1',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ODDFYIELD: {
        description: '返回第一期为奇数的债券的收益',
        abstract: '返回第一期为奇数的债券的收益',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/oddfyield-%E5%87%BD%E6%95%B0-66bc8b7b-6501-4c93-9ce3-2fd16220fe37',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ODDLPRICE: {
        description: '返回每张票面为 ￥100 且最后一期为奇数的债券的现价',
        abstract: '返回每张票面为 ￥100 且最后一期为奇数的债券的现价',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/oddlprice-%E5%87%BD%E6%95%B0-fb657749-d200-4902-afaf-ed5445027fc4',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ODDLYIELD: {
        description: '返回最后一期为奇数的债券的收益',
        abstract: '返回最后一期为奇数的债券的收益',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/oddlyield-%E5%87%BD%E6%95%B0-c873d088-cf40-435f-8d41-c8232fee9238',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PDURATION: {
        description: '返回投资到达指定值所需的期数',
        abstract: '返回投资到达指定值所需的期数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/pduration-%E5%87%BD%E6%95%B0-44f33460-5be5-4c90-b857-22308892adaf',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PMT: {
        description: '返回年金的定期支付金额',
        abstract: '返回年金的定期支付金额',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/pmt-%E5%87%BD%E6%95%B0-0214da64-9a63-4996-bc20-214433fa6441',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PPMT: {
        description: '返回一笔投资在给定期间内偿还的本金',
        abstract: '返回一笔投资在给定期间内偿还的本金',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/ppmt-%E5%87%BD%E6%95%B0-c370d9e3-7749-4ca4-beea-b06c6ac95e1b',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PRICE: {
        description: '返回每张票面为 ￥100 且定期支付利息的债券的现价',
        abstract: '返回每张票面为 ￥100 且定期支付利息的债券的现价',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/price-%E5%87%BD%E6%95%B0-3ea9deac-8dfa-436f-a7c8-17ea02c21b0a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PRICEDISC: {
        description: '返回每张票面为 ￥100 的已贴现债券的现价',
        abstract: '返回每张票面为 ￥100 的已贴现债券的现价',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/pricedisc-%E5%87%BD%E6%95%B0-d06ad7c1-380e-4be7-9fd9-75e3079acfd3',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PRICEMAT: {
        description: '返回每张票面为 ￥100 且在到期日支付利息的债券的现价',
        abstract: '返回每张票面为 ￥100 且在到期日支付利息的债券的现价',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/pricemat-%E5%87%BD%E6%95%B0-52c3b4da-bc7e-476a-989f-a95f675cae77',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PV: {
        description: '返回投资的现值',
        abstract: '返回投资的现值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/pv-%E5%87%BD%E6%95%B0-23879d31-0e02-4321-be01-da16e8168cbd',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    RATE: {
        description: '返回年金的各期利率',
        abstract: '返回年金的各期利率',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/rate-%E5%87%BD%E6%95%B0-9f665657-4a7e-4bb7-a030-83fc59e748ce',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    RECEIVED: {
        description: '返回完全投资型债券在到期日收回的金额',
        abstract: '返回完全投资型债券在到期日收回的金额',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/received-%E5%87%BD%E6%95%B0-7a3f8b93-6611-4f81-8576-828312c9b5e5',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    RRI: {
        description: '返回某项投资增长的等效利率',
        abstract: '返回某项投资增长的等效利率',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/rri-%E5%87%BD%E6%95%B0-6f5822d8-7ef1-4233-944c-79e8172930f4',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    SLN: {
        description: '返回固定资产的每期线性折旧费',
        abstract: '返回固定资产的每期线性折旧费',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/sln-%E5%87%BD%E6%95%B0-cdb666e5-c1c6-40a7-806a-e695edc2f1c8',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    SYD: {
        description: '返回某项固定资产按年限总和折旧法计算的每期折旧金额',
        abstract: '返回某项固定资产按年限总和折旧法计算的每期折旧金额',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/syd-%E5%87%BD%E6%95%B0-069f8106-b60b-4ca2-98e0-2a0f206bdb27',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TBILLEQ: {
        description: '返回国库券的等价债券收益',
        abstract: '返回国库券的等价债券收益',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/tbilleq-%E5%87%BD%E6%95%B0-2ab72d90-9b4d-4efe-9fc2-0f81f2c19c8c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TBILLPRICE: {
        description: '返回面值 ￥100 的国库券的价格',
        abstract: '返回面值 ￥100 的国库券的价格',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/tbillprice-%E5%87%BD%E6%95%B0-eacca992-c29d-425a-9eb8-0513fe6035a2',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TBILLYIELD: {
        description: '返回国库券的收益率',
        abstract: '返回国库券的收益率',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/tbillyield-%E5%87%BD%E6%95%B0-6d381232-f4b0-4cd5-8e97-45b9c03468ba',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    VDB: {
        description: '使用余额递减法，返回一笔资产在给定期间或部分期间内的折旧值',
        abstract: '使用余额递减法，返回一笔资产在给定期间或部分期间内的折旧值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/vdb-%E5%87%BD%E6%95%B0-dde4e207-f3fa-488d-91d2-66d55e861d73',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    XIRR: {
        description: '返回一组现金流的内部收益率，这些现金流不一定定期发生',
        abstract: '返回一组现金流的内部收益率，这些现金流不一定定期发生',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/xirr-%E5%87%BD%E6%95%B0-de1242ec-6477-445b-b11b-a303ad9adc9d',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    XNPV: {
        description: '返回一组现金流的净现值，这些现金流不一定定期发生',
        abstract: '返回一组现金流的净现值，这些现金流不一定定期发生',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/xnpv-%E5%87%BD%E6%95%B0-1b42bbf6-370f-4532-a0eb-d67c16b664b7',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    YIELD: {
        description: '返回定期支付利息的债券的收益',
        abstract: '返回定期支付利息的债券的收益',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/yield-%E5%87%BD%E6%95%B0-f5f5ca43-c4bd-434f-8bd2-ed3c9727a4fe',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    YIELDDISC: {
        description: '返回已贴现债券的年收益；例如，短期国库券',
        abstract: '返回已贴现债券的年收益；例如，短期国库券',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/yielddisc-%E5%87%BD%E6%95%B0-a9dbdbae-7dae-46de-b995-615faffaaed7',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    YIELDMAT: {
        description: '返回在到期日支付利息的债券的年收益',
        abstract: '返回在到期日支付利息的债券的年收益',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/yieldmat-%E5%87%BD%E6%95%B0-ba7d1809-0d33-4bcb-96c7-6c56ec62ef6f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
};
