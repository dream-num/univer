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

export default {
    ACCRINT: {
        description: '返回定期支付利息的債券的應計利息',
        abstract: '返回定期支付利息的債券的應計利息',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/accrint-%E5%87%BD%E6%95%B0-fe45d089-6722-4fb3-9379-e1f911d8dc74',
            },
        ],
        functionParameter: {
            issue: { name: '發行日', detail: '證券的發行日期。' },
            firstInterest: { name: '首次計息日', detail: '證券的第一個利率日期。' },
            settlement: { name: '到期日', detail: '證券的到期日期。' },
            rate: { name: '利率', detail: '證券的年度票息率。' },
            par: { name: '面值', detail: '證券的票面價值。' },
            frequency: { name: '頻次', detail: '每年票息付款的次數。' },
            basis: { name: '基礎', detail: '要使用的日計數基礎類型。' },
            calcMethod: { name: '計算方法', detail: '是一個邏輯值：從發行日期開始的應計利息 = TRUE 或忽略；從最後票據支付日期開始計算 = FALSE。' },
        },
    },
    ACCRINTM: {
        description: '返回在到期日支付利息的債券的應計利息',
        abstract: '返回在到期日支付利息的債券的應計利息',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/accrintm-%E5%87%BD%E6%95%B0-f62f01f9-5754-4cc4-805b-0e70199328a7',
            },
        ],
        functionParameter: {
            issue: { name: '發行日', detail: '證券的發行日期。' },
            settlement: { name: '到期日', detail: '證券的到期日期。' },
            rate: { name: '利率', detail: '證券的年度票息率。' },
            par: { name: '面值', detail: '證券的票面價值。' },
            basis: { name: '基礎', detail: '要使用的日計數基礎類型。' },
        },
    },
    AMORDEGRC: {
        description: '使用折舊係數傳回每個記帳期間的折舊值',
        abstract: '使用折舊係數傳回每個記帳期間的折舊值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/amordegrc-%E5%87%BD%E6%95%B0-a14d0ca1-64a4-42eb-9b3d-b0dededf9e51',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    AMORLINC: {
        description: '傳回每個記帳期間的折舊值',
        abstract: '傳回每個記帳期間的折舊值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/amorlinc-%E5%87%BD%E6%95%B0-7d417b45-f7f5-4dba-a0a5-3451a81079a8',
            },
        ],
        functionParameter: {
            cost: { name: '成本', detail: '資產的成本。' },
            datePurchased: { name: '購買日期', detail: '資產的購買日期。' },
            firstPeriod: { name: '首個週期', detail: '第一個週期結束的日期。' },
            salvage: { name: '殘值', detail: '資產耐用年限終了時的殘餘價值。' },
            period: { name: '週期', detail: '週期。' },
            rate: { name: '折舊率', detail: '折舊率。' },
            basis: { name: '基礎', detail: '要使用的年計數基礎。' },
        },
    },
    COUPDAYBS: {
        description: '傳回從票息期間開始到結算日之間的天數',
        abstract: '傳回從票息期間開始到結算日之間的天數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/coupdaybs-%E5%87%BD%E6%95%B0-eb9a8dfb-2fb2-4c61-8e5d-690b320cf872',
            },
        ],
        functionParameter: {
            settlement: { name: '結算日期', detail: '證券的結算日期。' },
            maturity: { name: '到期日期', detail: '證券的到期日期。' },
            frequency: { name: '頻次', detail: '每年票息付款的次數。' },
            basis: { name: '基礎', detail: '要使用的日計數基礎類型。' },
        },
    },
    COUPDAYS: {
        description: '傳回包含結算日的票息期天數',
        abstract: '傳回包含結算日的票息期天數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/coupdays-%E5%87%BD%E6%95%B0-cc64380b-315b-4e7b-950c-b30b0a76f671',
            },
        ],
        functionParameter: {
            settlement: { name: '結算日期', detail: '證券的結算日期。' },
            maturity: { name: '到期日期', detail: '證券的到期日期。' },
            frequency: { name: '頻次', detail: '每年票息付款的次數。' },
            basis: { name: '基礎', detail: '要使用的日計數基礎類型。' },
        },
    },
    COUPDAYSNC: {
        description: '傳回從結算日到下一票息支付日之間的天數',
        abstract: '傳回從結算日到下一票息支付日之間的天數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/coupdaysnc-%E5%87%BD%E6%95%B0-5ab3f0b2-029f-4a8b-bb65-47d525eea547',
            },
        ],
        functionParameter: {
            settlement: { name: '結算日期', detail: '證券的結算日期。' },
            maturity: { name: '到期日期', detail: '證券的到期日期。' },
            frequency: { name: '頻次', detail: '每年票息付款的次數。' },
            basis: { name: '基礎', detail: '要使用的日計數基礎類型。' },
        },
    },
    COUPNCD: {
        description: '返回結算日之後的下一個票息支付日',
        abstract: '返回結算日之後的下一個票息支付日',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/coupncd-%E5%87%BD%E6%95%B0-fd962fef-506b-4d9d-8590-16df5393691f',
            },
        ],
        functionParameter: {
            settlement: { name: '結算日期', detail: '證券的結算日期。' },
            maturity: { name: '到期日期', detail: '證券的到期日期。' },
            frequency: { name: '頻次', detail: '每年票息付款的次數。' },
            basis: { name: '基礎', detail: '要使用的日計數基礎類型。' },
        },
    },
    COUPNUM: {
        description: '返回結算日與到期日之間可支付的票息數',
        abstract: '返回結算日與到期日之間可支付的票息數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/coupnum-%E5%87%BD%E6%95%B0-a90af57b-de53-4969-9c99-dd6139db2522',
            },
        ],
        functionParameter: {
            settlement: { name: '結算日期', detail: '證券的結算日期。' },
            maturity: { name: '到期日期', detail: '證券的到期日期。' },
            frequency: { name: '頻次', detail: '每年票息付款的次數。' },
            basis: { name: '基礎', detail: '要使用的日計數基礎類型。' },
        },
    },
    COUPPCD: {
        description: '返回結算日之前的上一票息支付日',
        abstract: '返回結算日之前的上一票息支付日',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/couppcd-%E5%87%BD%E6%95%B0-2eb50473-6ee9-4052-a206-77a9a385d5b3',
            },
        ],
        functionParameter: {
            settlement: { name: '結算日期', detail: '證券的結算日期。' },
            maturity: { name: '到期日期', detail: '證券的到期日期。' },
            frequency: { name: '頻次', detail: '每年票息付款的次數。' },
            basis: { name: '基礎', detail: '要使用的日計數基礎類型。' },
        },
    },
    CUMIPMT: {
        description: '傳回兩個付款期間之間累積支付的利息',
        abstract: '返回兩個付款期之間累積支付的利息',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/cumipmt-%E5%87%BD%E6%95%B0-61067bb0-9016-427d-b95b-1a752af0e606',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '利率。' },
            nper: { name: '總期數', detail: '總付款期數。' },
            pv: { name: '現值', detail: '現值。' },
            startPeriod: { name: '首期', detail: '計算中的第一個週期。付款週期的編號由1開始。' },
            endPeriod: { name: '末期', detail: '計算中的最後一個週期。' },
            type: { name: '類型', detail: '付款的時機。' },
        },
    },
    CUMPRINC: {
        description: '返回兩個付款期之間為貸款累積支付的本金',
        abstract: '返回兩個付款期之間為貸款累積支付的本金',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/cumprinc-%E5%87%BD%E6%95%B0-94a4516d-bd65-41a1-bc16-053a6af4c04d',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '利率。' },
            nper: { name: '總期數', detail: '總付款期數。' },
            pv: { name: '現值', detail: '現值。' },
            startPeriod: { name: '首期', detail: '計算中的第一個週期。付款週期的編號由1開始。' },
            endPeriod: { name: '末期', detail: '計算中的最後一個週期。' },
            type: { name: '類型', detail: '付款的時機。' },
        },
    },
    DB: {
        description: '使用固定餘額遞減法，傳回一筆資產在給定期間內的折舊值',
        abstract: '使用固定餘額遞減法，傳回一筆資產在給定期間內的折舊值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/db-%E5%87%BD%E6%95%B0-354e7d28-5f93-4ff1-8a52-eb4ee549d9d7',
            },
        ],
        functionParameter: {
            cost: { name: '成本', detail: '資產的原始成本。' },
            salvage: { name: '殘值', detail: '折舊最後的值 (有時稱為資產的殘餘價值)。' },
            life: { name: '使用年限', detail: '資產折舊的期數 (有時稱為資產的使用年限)。' },
            period: { name: '期間', detail: '要計算折舊的期間。' },
            month: { name: '月份', detail: '第一年的月份數。如果省略 month，則假設其值為12。' },
        },
    },
    DDB: {
        description: '使用雙倍餘額遞減法或其他指定方法，傳回一筆資產在給定期間內的折舊值',
        abstract: '使用雙倍餘額遞減法或其他指定方法，傳回一筆資產在給定期間內的折舊值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/ddb-%E5%87%BD%E6%95%B0-519a7a37-8772-4c96-85c0-ed2c209717a5',
            },
        ],
        functionParameter: {
            cost: { name: '成本', detail: '資產的原始成本。' },
            salvage: { name: '殘值', detail: '折舊最後的值 (有時稱為資產的殘餘價值)。' },
            life: { name: '使用年限', detail: '資產折舊的期數 (有時稱為資產的使用年限)。' },
            period: { name: '期間', detail: '要計算折舊的期間。' },
            factor: { name: '速率', detail: '餘額遞減的速率。如果省略factor，將假設其值為2(倍率遞減法)。' },
        },
    },
    DISC: {
        description: '返回債券的折現率',
        abstract: '返回債券的折現率',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/disc-%E5%87%BD%E6%95%B0-71fce9f3-3f05-4acf-a5a3-eac6ef4daa53',
            },
        ],
        functionParameter: {
            settlement: { name: '結算日期', detail: '證券的結算日期。' },
            maturity: { name: '到期日期', detail: '證券的到期日期。' },
            pr: { name: '價格', detail: '證券每$100面額的價格。' },
            redemption: { name: '贖回價', detail: '證券每$100面額的贖回價值。' },
            basis: { name: '基礎', detail: '要使用的日計數基礎類型。' },
        },
    },
    DOLLARDE: {
        description: '將以分數表示的價格轉換為以小數表示的價格',
        abstract: '將以分數表示的價格轉換為以小數表示的價格',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/dollarde-%E5%87%BD%E6%95%B0-db85aab0-1677-428a-9dfd-a38476693427',
            },
        ],
        functionParameter: {
            fractionalDollar: { name: '分數', detail: '以整數部分和分數部分表示，並以小數點符號分隔的數字。' },
            fraction: { name: '分母', detail: '用於分數之分母的整數。' },
        },
    },
    DOLLARFR: {
        description: '將以小數表示的價格轉換為以分數表示的價格',
        abstract: '將以小數表示的價格轉換為以分數表示的價格',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/dollarfr-%E5%87%BD%E6%95%B0-0835d163-3023-4a33-9824-3042c5d4f495',
            },
        ],
        functionParameter: {
            decimalDollar: { name: '小數', detail: '小數。' },
            fraction: { name: '分母', detail: '用於分數之分母的整數。' },
        },
    },
    DURATION: {
        description: '返回定期支付利息的債券的每​​年期限',
        abstract: '返回定期支付利息的債券的每​​年期限',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/duration-%E5%87%BD%E6%95%B0-b254ea57-eadc-4602-a86a-c8e369334038',
            },
        ],
        functionParameter: {
            settlement: { name: '結算日期', detail: '證券的結算日期。' },
            maturity: { name: '到期日期', detail: '證券的到期日期。' },
            coupon: { name: '年度票息率', detail: '證券的年度票息率。' },
            yld: { name: '年收益率', detail: '證券的年收益。' },
            frequency: { name: '頻次', detail: '每年票息付款的次數。' },
            basis: { name: '基礎', detail: '要使用的日計數基礎類型。' },
        },
    },
    EFFECT: {
        description: '返回年度有效利率',
        abstract: '返回年有效利率',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/effect-%E5%87%BD%E6%95%B0-910d4e4c-79e2-4009-95e6-507e04f11bc4',
            },
        ],
        functionParameter: {
            nominalRate: { name: '名義利率', detail: '名義利率。' },
            npery: { name: '期數', detail: '每年以複利計算之期數。' },
        },
    },
    FV: {
        description: '傳回一筆投資的未來值',
        abstract: '傳回一筆投資的未來值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/fv-%E5%87%BD%E6%95%B0-2eef9f44-a084-4c61-bdd8-4fe4bb1b71b3',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '各期的利率。' },
            nper: { name: '總期數', detail: '年金的總付款期數。' },
            pmt: { name: '金額', detail: '各期給付的金額；不得在年金期限內變更。' },
            pv: { name: '現值', detail: '一系列未來付款的現值或目前總額。' },
            type: { name: '類型', detail: '數字0或1，指出付款期限。' },
        },
    },
    FVSCHEDULE: {
        description: '傳回應用一系列複利率計算的初始本金的未來值',
        abstract: '傳回應用一系列複利率計算的初始本金的未來值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/fvschedule-%E5%87%BD%E6%95%B0-bec29522-bd87-4082-bab9-a241f3fb251d',
            },
        ],
        functionParameter: {
            principal: { name: '初始資金', detail: '現值。' },
            schedule: { name: '利率陣列', detail: '要套用的利率陣列。' },
        },
    },
    INTRATE: {
        description: '返回完全投資型債券的利率',
        abstract: '返回完全投資型債券的利率',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/intrate-%E5%87%BD%E6%95%B0-5cb34dde-a221-4cb6-b​​3eb-0b9e55e1316f',
            },
        ],
        functionParameter: {
            settlement: { name: '結算日期', detail: '證券的結算日期。' },
            maturity: { name: '到期日期', detail: '證券的到期日期。' },
            investment: { name: '投資額', detail: '證券的投資額。' },
            redemption: { name: '贖回價', detail: '證券到期時的贖回價值。' },
            basis: { name: '基礎', detail: '要使用的日計數基礎類型。' },
        },
    },
    IPMT: {
        description: '返回一筆投資在給定期間內支付的利息',
        abstract: '返回一筆投資在給定期間內支付的利息',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/ipmt-%E5%87%BD%E6%95%B0-5cce0ad6-8402-4a41-8d29-61a0b054cb6f',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '各期的利率。' },
            per: { name: '期數', detail: '求算利息的期次，其值必須介於1到nper之間。' },
            nper: { name: '總期數', detail: '年金的總付款期數。' },
            pv: { name: '現值', detail: '一系列未來付款的現值或目前總額。' },
            fv: { name: '餘額', detail: '最後一次付款完成後，所能獲得的未來值或現金餘額。' },
            type: { name: '類型', detail: '數字0或1，指出付款期限。' },
        },
    },
    IRR: {
        description: '返回一系列現金流的內部收益率',
        abstract: '返回一系列現金流的內部收益率',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/irr-%E5%87%BD%E6%95%B0-64925eaa-9988-495b-b290-3ad0c163c1bc',
            },
        ],
        functionParameter: {
            values: { name: '現金流', detail: '陣列或儲存格參照，其中包含要計算內部報酬率的數字。\n1.Values 必須至少包含一個正數和一個負數，以計算內部報酬率。\n2.IRR 使用 values 的順序來表示現金流量的順序。 請務必依所要的順序輸入支出及收入的值。\n3.如果陣列或參照引數中包含文字、邏輯值或空白儲存格，則這些值將會略過。' },
            guess: { name: '猜測值', detail: '猜測接近 IRR 結果的數字。' },
        },
    },
    ISPMT: {
        description: '計算特定投資期間內要支付的利息',
        abstract: '計算特定投資期間內要支付的利息',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/ispmt-%E5%87%BD%E6%95%B0-fa58adb6-9d39-4ce0-8f43-75399cea56cc',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '投資的利率。' },
            per: { name: '期數', detail: '要尋找利息的期間，其值必須介於1到Nper之間。' },
            nper: { name: '總期數', detail: '投資的總付款期數。' },
            pv: { name: '現值', detail: '投資的現值。若為貸款，Pv為貸款金額。' },
        },
    },
    MDURATION: {
        description: '傳回假設面值為 ￥100 的有價證券的 Macauley 修正期限',
        abstract: '傳回假設面值為 ￥100 的有價證券的 Macauley 修正期限',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/mduration-%E5%87%BD%E6%95%B0-b3786a69-4f20-469a-94ad-33e5b90a763c',
            },
        ],
        functionParameter: {
            settlement: { name: '結算日期', detail: '證券的結算日期。' },
            maturity: { name: '到期日期', detail: '證券的到期日期。' },
            coupon: { name: '年度票息率', detail: '證券的年度票息率。' },
            yld: { name: '年收益率', detail: '證券的年收益。' },
            frequency: { name: '頻次', detail: '每年票息付款的次數。' },
            basis: { name: '基礎', detail: '要使用的日計數基礎類型。' },
        },
    },
    MIRR: {
        description: '返回正和負現金流以不同利率進行計算的內部收益率',
        abstract: '返回正和負現金流以不同利率進行計算的內部收益率',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/mirr-%E5%87%BD%E6%95%B0-b020f038-7492-4fb4-93c1-35c345b53524',
            },
        ],
        functionParameter: {
            values: { name: '現金流', detail: '陣列或儲存格參照，其中包含數字。 這些數字代表定期發生的一系列支出 (負值) 和收入 (正值)。\n1.Values 必須至少包含一個正值和一個負值，以計算經修改的內部報酬率。 否則，MIRR 會傳回 #DIV/0! 的錯誤值。\n2.如果陣列或參照引數包含文字、邏輯值或空白儲存格，則忽略這些數值；但包含零值儲存格。' },
            financeRate: { name: '融資利率', detail: '投入資金的融資利率。' },
            reinvestRate: { name: '轉投資報酬率', detail: '各期收入淨額的轉投資報酬率。' },
        },
    },
    NOMINAL: {
        description: '返回年度的名目利率',
        abstract: '返回年度的名目利率',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/nominal-%E5%87%BD%E6%95%B0-7f1ae29b-6b92-435e-b950-ad8b190ddd2b',
            },
        ],
        functionParameter: {
            effectRate: { name: '實質利率', detail: '實質利率。' },
            npery: { name: '期數', detail: '每年以複利計算之期數。' },
        },
    },
    NPER: {
        description: '返回投資的期數',
        abstract: '返回投資的期數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/nper-%E5%87%BD%E6%95%B0-240535b5-6653-4d2d-bfcf-b6a38151d815',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '各期的利率。' },
            pmt: { name: '金額', detail: '各期給付的金額；不得在年金期限內變更。' },
            pv: { name: '現值', detail: '一系列未來付款的現值或目前總額。' },
            fv: { name: '餘額', detail: '最後一次付款完成後，所能獲得的未來值或現金餘額。' },
            type: { name: '類型', detail: '數字0或1，指出付款期限。' },
        },
    },
    NPV: {
        description: '傳回以一系列定期的現金流量和折現率計算的投資的淨現值',
        abstract: '傳回以一系列定期的現金流量和折現率計算的投資的淨現值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/npv-%E5%87%BD%E6%95%B0-8672cb67-2576-4d07-b67b-ac28acf2a568',
            },
        ],
        functionParameter: {
            rate: { name: '貼現率', detail: '一段期間內的貼現率。' },
            value1: { name: '現金流1', detail: '1 到 254 個代表支出和收入的引數。' },
            value2: { name: '現金流2', detail: '1 到 254 個代表支出和收入的引數。' },
        },
    },
    ODDFPRICE: {
        description: '返回每張票面為 ￥100 且第一期為奇數的債券的現價',
        abstract: '返回每張票面為 ￥100 且第一期為奇數的債券的現價',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/oddfprice-%E5%87%BD%E6%95%B0-d7d664a8-34df-4233-8d2b​​-922bcf6a69e1',
            },
        ],
        functionParameter: {
            settlement: { name: '結算日期', detail: '證券的結算日期。' },
            maturity: { name: '到期日期', detail: '證券的到期日期。' },
            issue: { name: '發行日期', detail: '證券的發行日期。' },
            firstCoupon: { name: '首次付息日期', detail: '證券的首次付息日期。' },
            rate: { name: '利率', detail: '證券的年度票息率。' },
            yld: { name: '年收益率', detail: '證券的年收益。' },
            redemption: { name: '贖回價', detail: '證券到期時的贖回價值。' },
            frequency: { name: '頻次', detail: '每年票息付款的次數。' },
            basis: { name: '基礎', detail: '要使用的日計數基礎類型。' },
        },
    },
    ODDFYIELD: {
        description: '傳回第一期為奇數的債券的收益',
        abstract: '返回第一期為奇數的債券的收益',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/oddfyield-%E5%87%BD%E6%95%B0-66bc8b7b-6501-4c93-9ce3-2fd16220fe37',
            },
        ],
        functionParameter: {
            settlement: { name: '結算日期', detail: '證券的結算日期。' },
            maturity: { name: '到期日期', detail: '證券的到期日期。' },
            issue: { name: '發行日期', detail: '證券的發行日期。' },
            firstCoupon: { name: '首次付息日期', detail: '證券的首次付息日期。' },
            rate: { name: '利率', detail: '證券的年度票息率。' },
            pr: { name: '價格', detail: '證券的價格。' },
            redemption: { name: '贖回價', detail: '證券到期時的贖回價值。' },
            frequency: { name: '頻次', detail: '每年票息付款的次數。' },
            basis: { name: '基礎', detail: '要使用的日計數基礎類型。' },
        },
    },
    ODDLPRICE: {
        description: '返回每張票面為 ￥100 且最後一期為奇數的債券的現價',
        abstract: '返回每張票面為 ￥100 且最後一期為奇數的債券的現價',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/oddlprice-%E5%87%BD%E6%95%B0-fb657749-d200-4902-afaf-ed5445027fc4',
            },
        ],
        functionParameter: {
            settlement: { name: '結算日期', detail: '證券的結算日期。' },
            maturity: { name: '到期日期', detail: '證券的到期日期。' },
            lastInterest: { name: '最後票息日期', detail: '證券的最後票息日期。' },
            rate: { name: '利率', detail: '證券的年度票息率。' },
            yld: { name: '年收益率', detail: '證券的年收益。' },
            redemption: { name: '贖回價', detail: '證券到期時的贖回價值。' },
            frequency: { name: '頻次', detail: '每年票息付款的次數。' },
            basis: { name: '基礎', detail: '要使用的日計數基礎類型。' },
        },
    },
    ODDLYIELD: {
        description: '傳回最後一期為奇數的債券的收益',
        abstract: '返回最後一期為奇數的債券的收益',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/oddlyield-%E5%87%BD%E6%95%B0-c873d088-cf40-435f-8d41-c8232fee9238',
            },
        ],
        functionParameter: {
            settlement: { name: '結算日期', detail: '證券的結算日期。' },
            maturity: { name: '到期日期', detail: '證券的到期日期。' },
            lastInterest: { name: '最後票息日期', detail: '證券的最後票息日期。' },
            rate: { name: '利率', detail: '證券的年度票息率。' },
            pr: { name: '價格', detail: '證券的價格。' },
            redemption: { name: '贖回價', detail: '證券到期時的贖回價值。' },
            frequency: { name: '頻次', detail: '每年票息付款的次數。' },
            basis: { name: '基礎', detail: '要使用的日計數基礎類型。' },
        },
    },
    PDURATION: {
        description: '傳回投資到達指定值所需的期數',
        abstract: '返回投資到達指定值所需的期數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/pduration-%E5%87%BD%E6%95%B0-44f33460-5be5-4c90-b857-22308892adaf',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '每期的利率。' },
            pv: { name: '現值', detail: '投資的現值。' },
            fv: { name: '未來價值', detail: '投資所需的未來值。' },
        },
    },
    PMT: {
        description: '返回年金的定期支付金額',
        abstract: '返回年金的定期支付金額',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/pmt-%E5%87%BD%E6%95%B0-0214da64-9a63-4996-bc20-214433fa6441',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '各期的利率。' },
            nper: { name: '總期數', detail: '年金的總付款期數。' },
            pv: { name: '現值', detail: '一系列未來付款的現值或目前總額。' },
            fv: { name: '餘額', detail: '最後一次付款完成後，所能獲得的未來值或現金餘額。' },
            type: { name: '類型', detail: '數字0或1，指出付款期限。' },
        },
    },
    PPMT: {
        description: '返回一筆投資在給定期間內償還的本金',
        abstract: '返回一筆投資在給定期間內償還的本金',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/ppmt-%E5%87%BD%E6%95%B0-c370d9e3-7749-4ca4-beea-b06c6ac95e1b',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '各期的利率。' },
            per: { name: '期數', detail: '求算利息的期次，其值必須介於1到nper之間。' },
            nper: { name: '總期數', detail: '年金的總付款期數。' },
            pv: { name: '現值', detail: '一系列未來付款的現值或目前總額。' },
            fv: { name: '餘額', detail: '最後一次付款完成後，所能獲得的未來值或現金餘額。' },
            type: { name: '類型', detail: '數字0或1，指出付款期限。' },
        },
    },
    PRICE: {
        description: '返回每張票面為 ￥100 且定期支付利息的債券的現價',
        abstract: '返回每張票面為 ￥100 且定期支付利息的債券的現價',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/price-%E5%87%BD%E6%95%B0-3ea9deac-8dfa-436f-a7c8-17ea02c21b0a',
            },
        ],
        functionParameter: {
            settlement: { name: '結算日期', detail: '證券的結算日期。' },
            maturity: { name: '到期日期', detail: '證券的到期日期。' },
            rate: { name: '利率', detail: '證券的年度票息率。' },
            yld: { name: '年收益率', detail: '證券的年收益。' },
            redemption: { name: '贖回價', detail: '證券到期時的贖回價值。' },
            frequency: { name: '頻次', detail: '每年票息付款的次數。' },
            basis: { name: '基礎', detail: '要使用的日計數基礎類型。' },
        },
    },
    PRICEDISC: {
        description: '返回每張票面為 ￥100 的已折現債券的現價',
        abstract: '返回每張票面為 ￥100 的已折現債券的現價',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/pricedisc-%E5%87%BD%E6%95%B0-d06ad7c1-380e-4be7-9fd9-75e3079acfd3',
            },
        ],
        functionParameter: {
            settlement: { name: '結算日期', detail: '證券的結算日期。' },
            maturity: { name: '到期日期', detail: '證券的到期日期。' },
            discount: { name: '貼現率', detail: '證券的貼現率。' },
            redemption: { name: '贖回價', detail: '證券到期時的贖回價值。' },
            basis: { name: '基礎', detail: '要使用的日計數基礎類型。' },
        },
    },
    PRICEMAT: {
        description: '返回每張票面為 ￥100 且在到期日支付利息的債券的現價',
        abstract: '返回每張票面為 ￥100 且在到期日支付利息的債券的現價',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/pricemat-%E5%87%BD%E6%95%B0-52c3b4da-bc7e-476a-989f-a95f675cae77',
            },
        ],
        functionParameter: {
            settlement: { name: '結算日期', detail: '證券的結算日期。' },
            maturity: { name: '到期日期', detail: '證券的到期日期。' },
            issue: { name: '發行日期', detail: '證券的發行日期。' },
            rate: { name: '利率', detail: '證券的年度票息率。' },
            yld: { name: '年收益率', detail: '證券的年收益。' },
            basis: { name: '基礎', detail: '要使用的日計數基礎類型。' },
        },
    },
    PV: {
        description: '返回投資的現值',
        abstract: '返回投資的現值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/pv-%E5%87%BD%E6%95%B0-23879d31-0e02-4321-be01-da16e8168cbd',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '各期的利率。' },
            nper: { name: '總期數', detail: '年金的總付款期數。' },
            pmt: { name: '金額', detail: '各期給付的金額；不得在年金期限內變更。' },
            fv: { name: '餘額', detail: '最後一次付款完成後，所能獲得的未來值或現金餘額。' },
            type: { name: '類型', detail: '數字0或1，指出付款期限。' },
        },
    },
    RATE: {
        description: '返回年金的各期利率',
        abstract: '返回年金的各期利率',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/rate-%E5%87%BD%E6%95%B0-9f665657-4a7e-4bb7-a030-83fc59e748ce',
            },
        ],
        functionParameter: {
            nper: { name: '總期數', detail: '年金的總付款期數。' },
            pmt: { name: '金額', detail: '各期給付的金額；不得在年金期限內變更。' },
            pv: { name: '現值', detail: '一系列未來付款的現值或目前總額。' },
            fv: { name: '餘額', detail: '最後一次付款完成後，所能獲得的未來值或現金餘額。' },
            type: { name: '類型', detail: '數字0或1，指出付款期限。' },
            guess: { name: '猜測值', detail: '對利率的猜測值。' },
        },
    },
    RECEIVED: {
        description: '返回完全投資型債券在到期日收回的金額',
        abstract: '返回完全投資型債券在到期日收回的金額',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/received-%E5%87%BD%E6%95%B0-7a3f8b93-6611-4f81-8576-828312c9b5e5',
            },
        ],
        functionParameter: {
            settlement: { name: '結算日期', detail: '證券的結算日期。' },
            maturity: { name: '到期日期', detail: '證券的到期日期。' },
            investment: { name: '投資額', detail: '證券的投資額。' },
            discount: { name: '貼現率', detail: '證券的貼現率。' },
            basis: { name: '基礎', detail: '要使用的日計數基礎類型。' },
        },
    },
    RRI: {
        description: '返回某項投資成長的等效利率',
        abstract: '返回某項投資成長的等效利率',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/rri-%E5%87%BD%E6%95%B0-6f5822d8-7ef1-4233-944c-79e8172930f4',
            },
        ],
        functionParameter: {
            nper: { name: '總期數', detail: '投資的期數。' },
            pv: { name: '現值', detail: '投資的現值。' },
            fv: { name: '未來值', detail: '投資的未來值。' },
        },
    },
    SLN: {
        description: '傳回固定資產的每期線性折舊費',
        abstract: '返回固定資產的每期線性折舊費',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/sln-%E5%87%BD%E6%95%B0-cdb666e5-c1c6-40a7-806a-e695edc2f1c8',
            },
        ],
        functionParameter: {
            cost: { name: '資產原始成本', detail: '資產的原始成本。' },
            salvage: { name: '資產殘餘價值', detail: '折舊最後的值 (有時稱為資產的殘餘價值)。' },
            life: { name: '資產使用年限', detail: '固定資產折舊的期數 (有時稱為固定資產的使用年限)。' },
        },
    },
    SYD: {
        description: '傳回某項固定資產以年限總和折舊法計算的每期折舊金額',
        abstract: '返回某項固定資產以年限總和折舊法計算的每期折舊金額',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/syd-%E5%87%BD%E6%95%B0-069f8106-b60b-4ca2-98e0-2a0f206bdb27',
            },
        ],
        functionParameter: {
            cost: { name: '資產原始成本', detail: '資產的原始成本。' },
            salvage: { name: '資產殘餘價值', detail: '折舊最後的值 (有時稱為資產的殘餘價值)。' },
            life: { name: '資產使用年限', detail: '固定資產折舊的期數 (有時稱為固定資產的使用年限)。' },
            per: { name: '週期', detail: '週期。' },
        },
    },
    TBILLEQ: {
        description: '返回國庫券的等價債券收益',
        abstract: '返回國庫券的等價債券收益',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/tbilleq-%E5%87%BD%E6%95%B0-2ab72d90-9b4d-4efe-9fc2-0f81f2c19c8c',
            },
        ],
        functionParameter: {
            settlement: { name: '結算日期', detail: '國庫券的結算日期。' },
            maturity: { name: '到期日期', detail: '國庫券的到期日期。' },
            discount: { name: '貼現率', detail: '國庫券的貼現率。' },
        },
    },
    TBILLPRICE: {
        description: '傳回面額 ￥100 的國庫券的價格',
        abstract: '傳回面額 ￥100 的國庫券的價格',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/tbillprice-%E5%87%BD%E6%95%B0-eacca992-c29d-425a-9eb8-0513fe6035a2',
            },
        ],
        functionParameter: {
            settlement: { name: '結算日期', detail: '國庫券的結算日期。' },
            maturity: { name: '到期日期', detail: '國庫券的到期日期。' },
            discount: { name: '貼現率', detail: '國庫券的貼現率。' },
        },
    },
    TBILLYIELD: {
        description: '返回國庫券的收益率',
        abstract: '返回國庫券的收益率',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/tbillyield-%E5%87%BD%E6%95%B0-6d381232-f4b0-4cd5-8e97-45b9c03468ba',
            },
        ],
        functionParameter: {
            settlement: { name: '結算日期', detail: '國庫券的結算日期。' },
            maturity: { name: '到期日期', detail: '國庫券的到期日期。' },
            pr: { name: '價格', detail: '國庫債券每 $100 美元面額的價格。' },
        },
    },
    VDB: {
        description: '使用餘額遞減法，傳回一筆資產在給定期間或部分期間內的折舊值',
        abstract: '使用餘額遞減法，傳回一筆資產在給定期間或部分期間內的折舊值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/vdb-%E5%87%BD%E6%95%B0-dde4e207-f3fa-488d-91d2-66d55e861d73',
            },
        ],
        functionParameter: {
            cost: { name: '成本', detail: '資產的原始成本。' },
            salvage: { name: '殘值', detail: '折舊最後的值 (有時稱為資產的殘餘價值)。' },
            life: { name: '使用年限', detail: '資產折舊的期數 (有時稱為資產的使用年限)。' },
            startPeriod: { name: '開始期間', detail: '要計算折舊的開始期間。' },
            endPeriod: { name: '結束期間', detail: '要計算折舊的結束期間。' },
            factor: { name: '速率', detail: '餘額遞減的速率。如果省略factor，將假設其值為2(倍率遞減法)。' },
            noSwitch: { name: '不切換', detail: '用於指定當折舊大於遞減餘額計算時，是否切換到直線折舊法的邏輯值。' },
        },
    },
    XIRR: {
        description: '返回一組現金流的內部收益率，這些現金流不一定會定期發生',
        abstract: '返回一組現金流的內部收益率，這些現金流不一定會定期發生',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/xirr-%E5%87%BD%E6%95%B0-de1242ec-6477-445b-b11b-a303ad9adc9d',
            },
        ],
        functionParameter: {
            values: { name: '現金流', detail: '一系列與 dates 的付款日期對應的現金流。第一次付款是選擇性的，而且與投資開始時的成本和付款對應。如果第一個值是成本或付款，則它必須是負值。而之後的付款都會以一年 365 天為基礎來折算。序列值必須至少包括一個正值和一個負值。' },
            dates: { name: '日期表', detail: '一系列與現金流對應的付款日期。日期可能會以任何順序發生。' },
            guess: { name: '猜測值', detail: '所猜測接近 XIRR 結果的數字。' },
        },
    },
    XNPV: {
        description: '傳回一組現金流的淨現值，這些現金流不一定會定期發生',
        abstract: '傳回一組現金流的淨現值，這些現金流不一定會定期發生',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/xnpv-%E5%87%BD%E6%95%B0-1b42bbf6-370f-4532-a0eb-d67c16b664b7',
            },
        ],
        functionParameter: {
            rate: { name: '貼現率', detail: '要套用到現金流的貼現率。' },
            values: { name: '現金流', detail: '一系列與 dates 的付款日期對應的現金流。第一次付款是選擇性的，而且與投資開始時的成本和付款對應。如果第一個值是成本或付款，則它必須是負值。而之後的付款都會以一年 365 天為基礎來折算。序列值必須至少包括一個正值和一個負值。' },
            dates: { name: '日期表', detail: '一系列與現金流對應的付款日期。日期可能會以任何順序發生。' },
        },
    },
    YIELD: {
        description: '返回定期支付利息的債券的收益',
        abstract: '返回定期支付利息的債券的收益',
        links: [{
            title: '教導',
            url: 'https://support.microsoft.com/zh-tw/office/yield-%E5%87%BD%E6%95%B0-f5f5ca43-c4bd-434f-8bd2-ed3c9727a4fe',
        }],
        functionParameter: {
            settlement: { name: '結算日期', detail: '證券的結算日期。' },
            maturity: { name: '到期日期', detail: '證券的到期日期。' },
            rate: { name: '利率', detail: '證券的年度票息率。' },
            pr: { name: '價格', detail: '證券每 $100 面額的價格。' },
            redemption: { name: '贖回價', detail: '證券到期時的贖回價值。' },
            frequency: { name: '頻次', detail: '每年票息付款的次數。' },
            basis: { name: '基礎', detail: '要使用的日計數基礎類型。' },
        },
    },
    YIELDDISC: {
        description: '返回已折現債券的年收益；例如，短期國庫券',
        abstract: '返回已折現債券的年收益；例如，短期國庫券',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/yielddisc-%E5%87%BD%E6%95%B0-a9dbdbae-7dae-46de-b995-615faffaaed7',
            },
        ],
        functionParameter: {
            settlement: { name: '結算日期', detail: '證券的結算日期。' },
            maturity: { name: '到期日期', detail: '證券的到期日期。' },
            pr: { name: '價格', detail: '證券每 $100 面額的價格。' },
            redemption: { name: '贖回價', detail: '證券到期時的贖回價值。' },
            basis: { name: '基礎', detail: '要使用的日計數基礎類型。' },
        },
    },
    YIELDMAT: {
        description: '返回在到期日支付利息的債券的年收益',
        abstract: '返回在到期日支付利息的債券的年收益',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/yieldmat-%E5%87%BD%E6%95%B0-ba7d1809-0d33-4bcb-96c7-6c56ec62ef6f',
            },
        ],
        functionParameter: {
            settlement: { name: '結算日期', detail: '證券的結算日期。' },
            maturity: { name: '到期日期', detail: '證券的到期日期。' },
            issue: { name: '發行日期', detail: '證券的發行日期。' },
            rate: { name: '利率', detail: '證券的年度票息率。' },
            pr: { name: '價格', detail: '證券每 $100 面額的價格。' },
            basis: { name: '基礎', detail: '要使用的日計數基礎類型。' },
        },
    },
};
