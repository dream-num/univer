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
        description: '定期的に利息が支払われる証券の未収利息額を返します。',
        abstract: '定期的に利息が支払われる証券の未収利息額を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/accrint-%E9%96%A2%E6%95%B0-fe45d089-6722-4fb3-9379-e1f911d8dc74',
            },
        ],
        functionParameter: {
            issue: { name: '発行日', detail: '証券の発行日を指定します。' },
            firstInterest: { name: '初回利払日', detail: '証券の利息が最初に支払われる日付を指定します。' },
            settlement: { name: '受渡日', detail: '証券の満期日を指定します。' },
            rate: { name: '利率', detail: '証券の年利を指定します。' },
            par: { name: '額面', detail: '証券の額面価格を指定します。' },
            frequency: { name: '頻度', detail: '年間の利息支払回数を指定します。' },
            basis: { name: '基準', detail: '計算に使用する基準日数を示す数値を指定します。' },
            calcMethod: { name: '計算方式', detail: '論理値です: 発行日からの未払い利息 = TRUE、または最後のクーポン支払日から計算 = FALSE。' },
        },
    },
    ACCRINTM: {
        description: '満期日に利息が支払われる証券の未収利息額を返します。',
        abstract: '満期日に利息が支払われる証券の未収利息額を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/accrintm-%E9%96%A2%E6%95%B0-f62f01f9-5754-4cc4-805b-0e70199328a7',
            },
        ],
        functionParameter: {
            issue: { name: '発行日', detail: '証券の発行日を指定します。' },
            settlement: { name: '受渡日', detail: '証券の満期日を指定します。' },
            rate: { name: '利率', detail: '証券の年利を指定します。' },
            par: { name: '額面', detail: '証券の額面価格を指定します。' },
            basis: { name: '基準', detail: '計算に使用する基準日数を示す数値を指定します。' },
        },
    },
    AMORDEGRC: {
        description: '減価償却係数を使用して、各会計期における減価償却費を返します。',
        abstract: '減価償却係数を使用して、各会計期における減価償却費を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/amordegrc-%E9%96%A2%E6%95%B0-a14d0ca1-64a4-42eb-9b3d-b0dededf9e51',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    AMORLINC: {
        description: '各会計期における減価償却費を返します。',
        abstract: '各会計期における減価償却費を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/amorlinc-%E9%96%A2%E6%95%B0-7d417b45-f7f5-4dba-a0a5-3451a81079a8',
            },
        ],
        functionParameter: {
            cost: { name: '取得価額', detail: '資産を購入した時点での価格を指定します。' },
            datePurchased: { name: '購入日', detail: '資産を購入した日付を指定します。' },
            firstPeriod: { name: '開始期', detail: '最初の会計期が終了する日付を指定します。' },
            salvage: { name: '残存価額', detail: '耐用年数が終了した時点での資産の価格を指定します。' },
            period: { name: '期', detail: '会計期 (会計年度) を指定します。' },
            rate: { name: '率', detail: '減価償却率を指定します。' },
            basis: { name: '基準', detail: '1 年を何日として計算するかを表す数値を指定します。' },
        },
    },
    COUPDAYBS: {
        description: '利払期間の第 1 日目から受渡日までの日数を返します。',
        abstract: '利払期間の第 1 日目から受渡日までの日数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/coupdaybs-%E9%96%A2%E6%95%B0-eb9a8dfb-2fb2-4c61-8e5d-690b320cf872',
            },
        ],
        functionParameter: {
            settlement: { name: '受渡日', detail: '証券の受渡日を指定します。' },
            maturity: { name: '満期日', detail: '証券の満期日を指定します。' },
            frequency: { name: '頻度', detail: '年間の利息支払回数を指定します。' },
            basis: { name: '基準', detail: '計算に使用する基準日数を示す数値を指定します。' },
        },
    },
    COUPDAYS: {
        description: '受渡日を含む利払期間内の日数を返します。',
        abstract: '受渡日を含む利払期間内の日数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/coupdays-%E9%96%A2%E6%95%B0-cc64380b-315b-4e7b-950c-b30b0a76f671',
            },
        ],
        functionParameter: {
            settlement: { name: '受渡日', detail: '証券の受渡日を指定します。' },
            maturity: { name: '満期日', detail: '証券の満期日を指定します。' },
            frequency: { name: '頻度', detail: '年間の利息支払回数を指定します。' },
            basis: { name: '基準', detail: '計算に使用する基準日数を示す数値を指定します。' },
        },
    },
    COUPDAYSNC: {
        description: '受渡日から次の利払日までの日数を返します。',
        abstract: '受渡日から次の利払日までの日数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/coupdaysnc-%E9%96%A2%E6%95%B0-5ab3f0b2-029f-4a8b-bb65-47d525eea547',
            },
        ],
        functionParameter: {
            settlement: { name: '受渡日', detail: '証券の受渡日を指定します。' },
            maturity: { name: '満期日', detail: '証券の満期日を指定します。' },
            frequency: { name: '頻度', detail: '年間の利息支払回数を指定します。' },
            basis: { name: '基準', detail: '計算に使用する基準日数を示す数値を指定します。' },
        },
    },
    COUPNCD: {
        description: '受領日後の次の利息支払日を返します。',
        abstract: '受領日後の次の利息支払日を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/coupncd-%E9%96%A2%E6%95%B0-fd962fef-506b-4d9d-8590-16df5393691f',
            },
        ],
        functionParameter: {
            settlement: { name: '受渡日', detail: '証券の受渡日を指定します。' },
            maturity: { name: '満期日', detail: '証券の満期日を指定します。' },
            frequency: { name: '頻度', detail: '年間の利息支払回数を指定します。' },
            basis: { name: '基準', detail: '計算に使用する基準日数を示す数値を指定します。' },
        },
    },
    COUPNUM: {
        description: '受領日と満期日の間に利息が支払われる回数を返します。',
        abstract: '受領日と満期日の間に利息が支払われる回数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/coupnum-%E9%96%A2%E6%95%B0-a90af57b-de53-4969-9c99-dd6139db2522',
            },
        ],
        functionParameter: {
            settlement: { name: '受渡日', detail: '証券の受渡日を指定します。' },
            maturity: { name: '満期日', detail: '証券の満期日を指定します。' },
            frequency: { name: '頻度', detail: '年間の利息支払回数を指定します。' },
            basis: { name: '基準', detail: '計算に使用する基準日数を示す数値を指定します。' },
        },
    },
    COUPPCD: {
        description: '受領日の直前の利息支払日を返します。',
        abstract: '受領日の直前の利息支払日を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/couppcd-%E9%96%A2%E6%95%B0-2eb50473-6ee9-4052-a206-77a9a385d5b3',
            },
        ],
        functionParameter: {
            settlement: { name: '受渡日', detail: '証券の受渡日を指定します。' },
            maturity: { name: '満期日', detail: '証券の満期日を指定します。' },
            frequency: { name: '頻度', detail: '年間の利息支払回数を指定します。' },
            basis: { name: '基準', detail: '計算に使用する基準日数を示す数値を指定します。' },
        },
    },
    CUMIPMT: {
        description: '指定した期間に、貸付金に対して支払われる利息の累計を返します。',
        abstract: '指定した期間に、貸付金に対して支払われる利息の累計を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/cumipmt-%E9%96%A2%E6%95%B0-61067bb0-9016-427d-b95b-1a752af0e606',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '貸付期間を通じて一定の利率を指定します。' },
            nper: { name: '期間内支払回数', detail: '貸付期間全体での支払回数の合計を指定します。' },
            pv: { name: '現在価値', detail: '現在の貸付額、つまり将来行われる一連の支払いを、現時点で一括支払いした場合の合計金額を指定します。' },
            startPeriod: { name: '開始期', detail: '計算の対象となる最初の期を指定します。 最初の期から順に、1 から始まる番号が割り当てられます。' },
            endPeriod: { name: '終了期', detail: '計算の対象となる最後の期を指定します。' },
            type: { name: '支払期日', detail: '支払いがいつ行われるかを、数値の 0 または 1 で指定します。' },
        },
    },
    CUMPRINC: {
        description: '指定した期間に、貸付金に対して支払われる元金の累計を返します。',
        abstract: '指定した期間に、貸付金に対して支払われる元金の累計を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/cumprinc-%E9%96%A2%E6%95%B0-94a4516d-bd65-41a1-bc16-053a6af4c04d',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '貸付期間を通じて一定の利率を指定します。' },
            nper: { name: '期間内支払回数', detail: '貸付期間全体での支払回数の合計を指定します。' },
            pv: { name: '現在価値', detail: '現在の貸付額、つまり将来行われる一連の支払いを、現時点で一括支払いした場合の合計金額を指定します。' },
            startPeriod: { name: '開始期', detail: '計算の対象となる最初の期を指定します。 最初の期から順に、1 から始まる番号が割り当てられます。' },
            endPeriod: { name: '終了期', detail: '計算の対象となる最後の期を指定します。' },
            type: { name: '支払期日', detail: '支払いがいつ行われるかを、数値の 0 または 1 で指定します。' },
        },
    },
    DB: {
        description: '定率法 (Fixed-declining Balance Method) を使用して、特定の期における資産の減価償却費を返します。',
        abstract: '定率法 (Fixed-declining Balance Method) を使用して、特定の期における資産の減価償却費を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/db-%E9%96%A2%E6%95%B0-354e7d28-5f93-4ff1-8a52-eb4ee549d9d7',
            },
        ],
        functionParameter: {
            cost: { name: '取得価額', detail: '資産を購入した時点での価格を指定します。' },
            salvage: { name: '残存価額', detail: '耐用年数が終了した時点での資産の価格 (資産の救済価額) を指定します。' },
            life: { name: '耐用年数', detail: '資産を使用できる年数 (資産の寿命年数) を指定します。' },
            period: { name: '期間', detail: '減価償却費を計算する期間を指定します。' },
            month: { name: '月', detail: '資産を購入した期 (年度) の月数を指定します。 省略すると、12 を指定したと見なされます。' },
        },
    },
    DDB: {
        description: '倍額定率法 (Double-declining Balance Method) を使用して、特定の期における資産の減価償却費を返します。',
        abstract: '倍額定率法 (Double-declining Balance Method) を使用して、特定の期における資産の減価償却費を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/ddb-%E9%96%A2%E6%95%B0-519a7a37-8772-4c96-85c0-ed2c209717a5',
            },
        ],
        functionParameter: {
            cost: { name: '取得価額', detail: '資産を購入した時点での価格を指定します。' },
            salvage: { name: '残存価額', detail: '耐用年数が終了した時点での資産の価格 (資産の救済価額) を指定します。' },
            life: { name: '耐用年数', detail: '資産を使用できる年数 (資産の寿命年数) を指定します。' },
            period: { name: '期間', detail: '減価償却費を計算する期間を指定します。' },
            factor: { name: '率', detail: '減価償却率を指定します。率を省略すると、2 を指定したと見なされ、倍額定率法で計算が行われます。' },
        },
    },
    DISC: {
        description: '証券に対する割引率を返します。',
        abstract: '証券に対する割引率を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/disc-%E9%96%A2%E6%95%B0-71fce9f3-3f05-4acf-a5a3-eac6ef4daa53',
            },
        ],
        functionParameter: {
            settlement: { name: '受渡日', detail: '証券の受渡日を指定します。' },
            maturity: { name: '満期日', detail: '証券の満期日を指定します。' },
            pr: { name: '現在価値', detail: '額面 $100 に対する証券の価値を指定します。' },
            redemption: { name: '償還価額', detail: '額面 $100 に対する証券の償還額を指定します。' },
            basis: { name: '基準', detail: '計算に使用する基準日数を示す数値を指定します。' },
        },
    },
    DOLLARDE: {
        description: '分数で表されたドル単位の価格を、小数表示に変換します。',
        abstract: '分数で表されたドル単位の価格を、小数表示に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/dollarde-%E9%96%A2%E6%95%B0-db85aab0-1677-428a-9dfd-a38476693427',
            },
        ],
        functionParameter: {
            fractionalDollar: { name: '分数表現', detail: '整数部と小数部を小数点で区切って表現した数値です。' },
            fraction: { name: '分母', detail: '分数の分母となる整数を指定します。' },
        },
    },
    DOLLARFR: {
        description: '小数で表されたドル単位の価格を、分数表示に変換します。',
        abstract: '小数で表されたドル単位の価格を、分数表示に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/dollarfr-%E9%96%A2%E6%95%B0-0835d163-3023-4a33-9824-3042c5d4f495',
            },
        ],
        functionParameter: {
            decimalDollar: { name: '小数値', detail: '小数で表された数値を指定します。' },
            fraction: { name: '分母', detail: '分数の分母となる整数を指定します。' },
        },
    },
    DURATION: {
        description: '定期的に利子が支払われる証券の年間のマコーレー デュレーションを返します。',
        abstract: '定期的に利子が支払われる証券の年間のマコーレー デュレーションを返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/duration-%E9%96%A2%E6%95%B0-b254ea57-eadc-4602-a86a-c8e369334038',
            },
        ],
        functionParameter: {
            settlement: { name: '受渡日', detail: '証券の受渡日を指定します。' },
            maturity: { name: '満期日', detail: '証券の満期日を指定します。' },
            coupon: { name: '年利率', detail: '証券の年利を指定します。' },
            yld: { name: '利回り', detail: '証券の年間配当を指定します。' },
            frequency: { name: '頻度', detail: '年間の利息支払回数を指定します。' },
            basis: { name: '基準', detail: '計算に使用する基準日数を示す数値を指定します。' },
        },
    },
    EFFECT: {
        description: '実効年利率を返します。',
        abstract: '実効年利率を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/effect-%E9%96%A2%E6%95%B0-910d4e4c-79e2-4009-95e6-507e04f11bc4',
            },
        ],
        functionParameter: {
            nominalRate: { name: '名目利率', detail: '名目年利率を指定します。' },
            npery: { name: '複利計算回数', detail: '1 年あたりの複利計算回数を指定します。' },
        },
    },
    FV: {
        description: '投資の将来価値を返します。',
        abstract: '投資の将来価値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/fv-%E9%96%A2%E6%95%B0-2eef9f44-a084-4c61-bdd8-4fe4bb1b71b3',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '投資期間を通じて一定の利率を指定します。' },
            nper: { name: '期間内支払回数', detail: '投資期間全体での支払回数の合計を指定します。' },
            pmt: { name: '定期支払額', detail: '各期間に行われた支払い。それは年金の生活の中で変わることはできません' },
            pv: { name: '現在価値', detail: '投資の現在価値、つまり将来行われる一連の支払いを、現時点で一括払いした場合の合計金額を指定します。' },
            type: { name: '支払期日', detail: 'いつ支払いが行われるかを、数値の 0 または 1 で指定します。' },
        },
    },
    FVSCHEDULE: {
        description: '投資期間内の一連の金利を複利計算することにより、初期投資の元金の将来価値を返します。',
        abstract: '投資期間内の一連の金利を複利計算することにより、初期投資の元金の将来価値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/fvschedule-%E9%96%A2%E6%95%B0-bec29522-bd87-4082-bab9-a241f3fb251d',
            },
        ],
        functionParameter: {
            principal: { name: '元金', detail: '現在の貸付額、つまり将来行われる一連の支払いを、現時点で一括支払いした場合の合計金額を指定します。' },
            schedule: { name: '利率配列', detail: '投資期間内の変動金利を配列として指定します。' },
        },
    },
    INTRATE: {
        description: '全額投資された証券の利率を返します。',
        abstract: '全額投資された証券の利率を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/intrate-%E9%96%A2%E6%95%B0-5cb34dde-a221-4cb6-b3eb-0b9e55e1316f',
            },
        ],
        functionParameter: {
            settlement: { name: '受渡日', detail: '証券の受渡日を指定します。' },
            maturity: { name: '満期日', detail: '証券の満期日を指定します。' },
            investment: { name: '投資額', detail: '証券への投資額を指定します。' },
            redemption: { name: '償還価額', detail: '満期日における証券の償還額を指定します。' },
            basis: { name: '基準', detail: '計算に使用する基準日数を示す数値を指定します。' },
        },
    },
    IPMT: {
        description: '投資期間内の指定された期に支払われる金利を返します。',
        abstract: '投資期間内の指定された期に支払われる金利を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/ipmt-%E9%96%A2%E6%95%B0-5cce0ad6-8402-4a41-8d29-61a0b054cb6f',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '投資期間を通じて一定の利率を指定します。' },
            per: { name: '期', detail: '金利支払額を求める期を 1 ～ "期間" の範囲で指定します。' },
            nper: { name: '期間', detail: '投資期間全体での支払回数の合計を指定します。' },
            pv: { name: '現在価値', detail: '投資の現在価値、つまり将来行われる一連の支払いを、現時点で一括払いした場合の合計金額を指定します。' },
            fv: { name: '将来価値', detail: '投資の将来価値、つまり最後の支払いを行った後に残る現金の収支を指定します。' },
            type: { name: '支払期日', detail: 'いつ支払いが行われるかを、数値の 0 または 1 で指定します。' },
        },
    },
    IRR: {
        description: '一連の定期的なキャッシュ フローに対する内部利益率を返します。',
        abstract: '一連の定期的なキャッシュ フローに対する内部利益率を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/irr-%E9%96%A2%E6%95%B0-64925eaa-9988-495b-b290-3ad0c163c1bc',
            },
        ],
        functionParameter: {
            values: { name: 'キャッシュフロー', detail: '内部収益率を計算する数値を含む配列またはセルへの参照。\n1.内部利益率を計算するには、正の値と負の値が範囲に少なくとも 1 つずつ含まれている必要があります。\n2.IRR 関数では、値の順序がキャッシュ フローの順序であると見なされます。 支払額と収益額を入力する際は、その順序に注意してください。\n3.範囲に文字列、論理値、または空白セルが含まれる場合、これらは無視されます。' },
            guess: { name: '推測値', detail: 'IRR 関数の計算結果に近いと思われる数値を指定します。' },
        },
    },
    ISPMT: {
        description: '投資期間内の指定された期に支払われる金利を返します。',
        abstract: '投資期間内の指定された期に支払われる金利を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/ispmt-%E9%96%A2%E6%95%B0-fa58adb6-9d39-4ce0-8f43-75399cea56cc',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '投資の利率を指定します。' },
            per: { name: '期', detail: '関心を見つける期間であり、1 から Nper の間である必要があります。' },
            nper: { name: '期間', detail: '投資期間全体での支払回数の合計を指定します。' },
            pv: { name: '現在価値', detail: '投資の現在価値を指定します。ローンの場合、Pv はローン金額です。' },
        },
    },
    MDURATION: {
        description: '額面価格を $100 と仮定して、証券に対する修正マコーレー デュレーションを返します。',
        abstract: '額面価格を $100 と仮定して、証券に対する修正マコーレー デュレーションを返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/mduration-%E9%96%A2%E6%95%B0-b3786a69-4f20-469a-94ad-33e5b90a763c',
            },
        ],
        functionParameter: {
            settlement: { name: '受渡日', detail: '証券の受渡日を指定します。' },
            maturity: { name: '満期日', detail: '証券の満期日を指定します。' },
            coupon: { name: '年利率', detail: '証券の年利を指定します。' },
            yld: { name: '利回り', detail: '証券の年間配当を指定します。' },
            frequency: { name: '頻度', detail: '年間の利息支払回数を指定します。' },
            basis: { name: '基準', detail: '計算に使用する基準日数を示す数値を指定します。' },
        },
    },
    MIRR: {
        description: '定期的に発生する一連の支払い (負の値) と収益 (正の値) に基づいて、修正内部利益率を返します。',
        abstract: '定期的に発生する一連の支払い (負の値) と収益 (正の値) に基づいて、修正内部利益率を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/mirr-%E9%96%A2%E6%95%B0-b020f038-7492-4fb4-93c1-35c345b53524',
            },
        ],
        functionParameter: {
            values: { name: 'キャッシュフロー', detail: '数値を含む配列またはセル参照を指定します。 これらの数値は、定期的に発生する一連の支払い (負の値) とその収益 (正の値) を表しています。\n1.修正内部収益率を計算するには、正の値と負の値が範囲に少なくとも 1 つずつ含まれている必要があります。 そうでない場合は、エラー値 #DIV/0! が返されます。\n2.引数として指定した配列またはセル範囲に文字列、論理値、空白セルが含まれている場合、これらは無視されます。ただし、数値として 0 (ゼロ) を含むセルは計算の対象となります。' },
            financeRate: { name: '融資利率', detail: '支払額 (負のキャッシュ フロー) に対する利率を指定します。' },
            reinvestRate: { name: '再投資収益率', detail: '収益額 (正のキャッシュ フロー) に対する利率を指定します。' },
        },
    },
    NOMINAL: {
        description: '名目年利率を返します。',
        abstract: '名目年利率を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/nominal-%E9%96%A2%E6%95%B0-7f1ae29b-6b92-435e-b950-ad8b190ddd2b',
            },
        ],
        functionParameter: {
            effectRate: { name: '実効利率', detail: '実効年利率を指定します。' },
            npery: { name: '複利計算回数', detail: '1 年あたりの複利計算回数を指定します。' },
        },
    },
    NPER: {
        description: '投資に必要な期間を返します。',
        abstract: '投資に必要な期間を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/nper-%E9%96%A2%E6%95%B0-240535b5-6653-4d2d-bfcf-b6a38151d815',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '投資期間を通じて一定の利率を指定します。' },
            pmt: { name: '定期支払額', detail: '各期間に行われた支払い。それは年金の生活の中で変わることはできません' },
            pv: { name: '現在価値', detail: '投資の現在価値、つまり将来行われる一連の支払いを、現時点で一括払いした場合の合計金額を指定します。' },
            fv: { name: '将来価値', detail: '投資の将来価値、つまり最後の支払いを行った後に残る現金の収支を指定します。' },
            type: { name: '支払期日', detail: 'いつ支払いが行われるかを、数値の 0 または 1 で指定します。' },
        },
    },
    NPV: {
        description: '定期的に発生する一連の支払い (負の値) と収益 (正の値)、および割引率を指定して、投資の正味現在価値を算出します。',
        abstract: '定期的に発生する一連の支払い (負の値) と収益 (正の値)、および割引率を指定して、投資の正味現在価値を算出します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/npv-%E9%96%A2%E6%95%B0-8672cb67-2576-4d07-b67b-ac28acf2a568',
            },
        ],
        functionParameter: {
            rate: { name: '割引率', detail: '投資期間を通じて一定の利率を指定します。' },
            value1: { name: 'キャッシュフロー1', detail: '支払いと収入を表す 1 から 254 の引数。' },
            value2: { name: 'キャッシュフロー2', detail: '支払いと収入を表す 1 から 254 の引数。' },
        },
    },
    ODDFPRICE: {
        description: '1 期目の日数が半端な証券に対して、額面 $100 あたりの価格を返します。',
        abstract: '1 期目の日数が半端な証券に対して、額面 $100 あたりの価格を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/oddfprice-%E9%96%A2%E6%95%B0-d7d664a8-34df-4233-8d2b-922bcf6a69e1',
            },
        ],
        functionParameter: {
            settlement: { name: '受渡日', detail: '証券の受渡日を指定します。' },
            maturity: { name: '満期日', detail: '証券の満期日を指定します。' },
            issue: { name: '発行日', detail: '証券の発行日を指定します。' },
            firstCoupon: { name: '初回利払日', detail: '証券の最初の利払日を指定します。' },
            rate: { name: '利率', detail: '証券の利率を指定します。' },
            yld: { name: '利回り', detail: '証券の年間配当を指定します。' },
            redemption: { name: '償還価額', detail: '額面 $100 に対する証券の償還額を指定します。' },
            frequency: { name: '頻度', detail: '年間の利息支払回数を指定します。 年 1 回の場合は頻度 = 1、年 2 回の場合は頻度 = 2、四半期ごとの場合は頻度 = 4 を指定します。' },
            basis: { name: '基準', detail: '計算に使用する基準日数を示す数値を指定します。' },
        },
    },
    ODDFYIELD: {
        description: '1 期目の日数が半端な証券の利回りを返します。',
        abstract: '1 期目の日数が半端な証券の利回りを返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/oddfyield-%E9%96%A2%E6%95%B0-66bc8b7b-6501-4c93-9ce3-2fd16220fe37',
            },
        ],
        functionParameter: {
            settlement: { name: '受渡日', detail: '証券の受渡日を指定します。' },
            maturity: { name: '満期日', detail: '証券の満期日を指定します。' },
            issue: { name: '発行日', detail: '証券の発行日を指定します。' },
            firstCoupon: { name: '初回利払日', detail: '証券の最初の利払日を指定します。' },
            rate: { name: '利率', detail: '証券の利率を指定します。' },
            pr: { name: '価格', detail: '証券の価格を指定します。' },
            redemption: { name: '償還価額', detail: '額面 $100 に対する証券の償還額を指定します。' },
            frequency: { name: '頻度', detail: '年間の利息支払回数を指定します。 年 1 回の場合は頻度 = 1、年 2 回の場合は頻度 = 2、四半期ごとの場合は頻度 = 4 を指定します。' },
            basis: { name: '基準', detail: '計算に使用する基準日数を示す数値を指定します。' },
        },
    },
    ODDLPRICE: {
        description: '最終期の日数が半端な証券に対して、額面 $100 あたりの価格を返します。',
        abstract: '最終期の日数が半端な証券に対して、額面 $100 あたりの価格を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/oddlprice-%E9%96%A2%E6%95%B0-fb657749-d200-4902-afaf-ed5445027fc4',
            },
        ],
        functionParameter: {
            settlement: { name: '受渡日', detail: '証券の受渡日を指定します。' },
            maturity: { name: '満期日', detail: '証券の満期日を指定します。' },
            lastInterest: { name: '最終利払日', detail: '証券の最後の利払日を指定します。' },
            rate: { name: '利率', detail: '証券の利率を指定します。' },
            yld: { name: '利回り', detail: '証券の年間配当を指定します。' },
            redemption: { name: '償還価額', detail: '額面 $100 に対する証券の償還額を指定します。' },
            frequency: { name: '頻度', detail: '年間の利息支払回数を指定します。 年 1 回の場合は頻度 = 1、年 2 回の場合は頻度 = 2、四半期ごとの場合は頻度 = 4 を指定します。' },
            basis: { name: '基準', detail: '計算に使用する基準日数を示す数値を指定します。' },
        },
    },
    ODDLYIELD: {
        description: '最終期の日数が半端な証券の利回りを返します。',
        abstract: '最終期の日数が半端な証券の利回りを返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/oddlyield-%E9%96%A2%E6%95%B0-c873d088-cf40-435f-8d41-c8232fee9238',
            },
        ],
        functionParameter: {
            settlement: { name: '受渡日', detail: '証券の受渡日を指定します。' },
            maturity: { name: '満期日', detail: '証券の満期日を指定します。' },
            lastInterest: { name: '最終利払日', detail: '証券の最後の利払日を指定します。' },
            rate: { name: '利率', detail: '証券の利率を指定します。' },
            pr: { name: '価格', detail: '証券の価格を指定します。' },
            redemption: { name: '償還価額', detail: '額面 $100 に対する証券の償還額を指定します。' },
            frequency: { name: '頻度', detail: '年間の利息支払回数を指定します。 年 1 回の場合は頻度 = 1、年 2 回の場合は頻度 = 2、四半期ごとの場合は頻度 = 4 を指定します。' },
            basis: { name: '基準', detail: '計算に使用する基準日数を示す数値を指定します。' },
        },
    },
    PDURATION: {
        description: '投資が指定した価値に達するまでの投資に必要な期間を返します。',
        abstract: '投資が指定した価値に達するまでの投資に必要な期間を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/pduration-%E9%96%A2%E6%95%B0-44f33460-5be5-4c90-b857-22308892adaf',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '利率は投資の利率を指定します。' },
            pv: { name: '現在価値', detail: '投資の現在価値を指定します。' },
            fv: { name: '将来価値', detail: '投資の目標とする将来価値を指定します。' },
        },
    },
    PMT: {
        description: '定期支払額を算出します。',
        abstract: '定期支払額を算出します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/pmt-%E9%96%A2%E6%95%B0-0214da64-9a63-4996-bc20-214433fa6441',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '投資期間を通じて一定の利率を指定します。' },
            nper: { name: '期間内支払回数', detail: '投資期間全体での支払回数の合計を指定します。' },
            pv: { name: '現在価値', detail: '投資の現在価値、つまり将来行われる一連の支払いを、現時点で一括払いした場合の合計金額を指定します。' },
            fv: { name: '将来価値', detail: '投資の将来価値、つまり最後の支払いを行った後に残る現金の収支を指定します。' },
            type: { name: '支払期日', detail: 'いつ支払いが行われるかを、数値の 0 または 1 で指定します。' },
        },
    },
    PPMT: {
        description: '指定した期に支払われる元金を返します。',
        abstract: '指定した期に支払われる元金を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/ppmt-%E9%96%A2%E6%95%B0-c370d9e3-7749-4ca4-beea-b06c6ac95e1b',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '投資期間を通じて一定の利率を指定します。' },
            per: { name: '期', detail: '金利支払額を求める期を 1 ～ "期間" の範囲で指定します。' },
            nper: { name: '期間', detail: '投資期間全体での支払回数の合計を指定します。' },
            pv: { name: '現在価値', detail: '投資の現在価値、つまり将来行われる一連の支払いを、現時点で一括払いした場合の合計金額を指定します。' },
            fv: { name: '将来価値', detail: '投資の将来価値、つまり最後の支払いを行った後に残る現金の収支を指定します。' },
            type: { name: '支払期日', detail: 'いつ支払いが行われるかを、数値の 0 または 1 で指定します。' },
        },
    },
    PRICE: {
        description: '定期的に利息が支払われる証券に対して、額面 $100 あたりの価格を返します。',
        abstract: '定期的に利息が支払われる証券に対して、額面 $100 あたりの価格を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/price-%E9%96%A2%E6%95%B0-3ea9deac-8dfa-436f-a7c8-17ea02c21b0a',
            },
        ],
        functionParameter: {
            settlement: { name: '受渡日', detail: '証券の受渡日を指定します。' },
            maturity: { name: '満期日', detail: '証券の満期日を指定します。' },
            rate: { name: '利率', detail: '証券の利率を指定します。' },
            yld: { name: '利回り', detail: '証券の年間配当を指定します。' },
            redemption: { name: '償還価額', detail: '額面 $100 に対する証券の償還額を指定します。' },
            frequency: { name: '頻度', detail: '年間の利息支払回数を指定します。 年 1 回の場合は頻度 = 1、年 2 回の場合は頻度 = 2、四半期ごとの場合は頻度 = 4 を指定します。' },
            basis: { name: '基準', detail: '計算に使用する基準日数を示す数値を指定します。' },
        },
    },
    PRICEDISC: {
        description: '割引証券の額面 $100 あたりの価格を返します。',
        abstract: '割引証券の額面 $100 あたりの価格を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/pricedisc-%E9%96%A2%E6%95%B0-d06ad7c1-380e-4be7-9fd9-75e3079acfd3',
            },
        ],
        functionParameter: {
            settlement: { name: '受渡日', detail: '証券の受渡日を指定します。' },
            maturity: { name: '満期日', detail: '証券の満期日を指定します。' },
            discount: { name: '割引率', detail: '証券の割引率を指定します。' },
            redemption: { name: '償還価額', detail: '額面 $100 に対する証券の償還額を指定します。' },
            basis: { name: '基準', detail: '計算に使用する基準日数を示す数値を指定します。' },
        },
    },
    PRICEMAT: {
        description: '満期日に利息が支払われる証券に対して、額面 $100 あたりの価格を返します。',
        abstract: '満期日に利息が支払われる証券に対して、額面 $100 あたりの価格を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/pricemat-%E9%96%A2%E6%95%B0-52c3b4da-bc7e-476a-989f-a95f675cae77',
            },
        ],
        functionParameter: {
            settlement: { name: '受渡日', detail: '証券の受渡日を指定します。' },
            maturity: { name: '満期日', detail: '証券の満期日を指定します。' },
            issue: { name: '発行日', detail: '証券の発行日を指定します。' },
            rate: { name: '利率', detail: '証券の利率を指定します。' },
            yld: { name: '利回り', detail: '証券の年間配当を指定します。' },
            basis: { name: '基準', detail: '計算に使用する基準日数を示す数値を指定します。' },
        },
    },
    PV: {
        description: '投資の現在価値を返します。',
        abstract: '投資の現在価値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/pv-%E9%96%A2%E6%95%B0-23879d31-0e02-4321-be01-da16e8168cbd',
            },
        ],
        functionParameter: {
            rate: { name: '利率', detail: '投資期間を通じて一定の利率を指定します。' },
            nper: { name: '期間内支払回数', detail: '投資期間全体での支払回数の合計を指定します。' },
            pmt: { name: '定期支払額', detail: '各期間に行われた支払い。それは年金の生活の中で変わることはできません' },
            fv: { name: '将来価値', detail: '投資の将来価値、つまり最後の支払いを行った後に残る現金の収支を指定します。' },
            type: { name: '支払期日', detail: 'いつ支払いが行われるかを、数値の 0 または 1 で指定します。' },
        },
    },
    RATE: {
        description: '投資の利率を返します。',
        abstract: '投資の利率を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/rate-%E9%96%A2%E6%95%B0-9f665657-4a7e-4bb7-a030-83fc59e748ce',
            },
        ],
        functionParameter: {
            nper: { name: '期間内支払回数', detail: '投資期間全体での支払回数の合計を指定します。' },
            pmt: { name: '定期支払額', detail: '各期間に行われた支払い。それは年金の生活の中で変わることはできません' },
            pv: { name: '現在価値', detail: '投資の現在価値、つまり将来行われる一連の支払いを、現時点で一括払いした場合の合計金額を指定します。' },
            fv: { name: '将来価値', detail: '投資の将来価値、つまり最後の支払いを行った後に残る現金の収支を指定します。' },
            type: { name: '支払期日', detail: 'いつ支払いが行われるかを、数値の 0 または 1 で指定します。' },
            guess: { name: '推定値', detail: '利率がおよそどれくらいになるかを推定した値を指定します。' },
        },
    },
    RECEIVED: {
        description: '全額投資された証券に対して、満期日に支払われる金額を返します。',
        abstract: '全額投資された証券に対して、満期日に支払われる金額を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/received-%E9%96%A2%E6%95%B0-7a3f8b93-6611-4f81-8576-828312c9b5e5',
            },
        ],
        functionParameter: {
            settlement: { name: '受渡日', detail: '証券の受渡日を指定します。' },
            maturity: { name: '満期日', detail: '証券の満期日を指定します。' },
            investment: { name: '投資額', detail: '証券への投資額を指定します。' },
            discount: { name: '割引率', detail: '証券の割引率を指定します。' },
            basis: { name: '基準', detail: '計算に使用する基準日数を示す数値を指定します。' },
        },
    },
    RRI: {
        description: '投資の成長に対する等価利率を返します。',
        abstract: '投資の成長に対する等価利率を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/rri-%E9%96%A2%E6%95%B0-6f5822d8-7ef1-4233-944c-79e8172930f4',
            },
        ],
        functionParameter: {
            nper: { name: '期間', detail: '投資期間の期間数を指定します。' },
            pv: { name: '現在価値', detail: '投資の現在価値を指定します。' },
            fv: { name: '将来価値', detail: 'Fvは投資の将来価値です。' },
        },
    },
    SLN: {
        description: '定額法 (Straight-line Method) を使用して、資産の 1 期あたりの減価償却費を返します。',
        abstract: '定額法 (Straight-line Method) を使用して、資産の 1 期あたりの減価償却費を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/sln-%E9%96%A2%E6%95%B0-cdb666e5-c1c6-40a7-806a-e695edc2f1c8',
            },
        ],
        functionParameter: {
            cost: { name: '取得価額', detail: '資産を購入した時点での価格を指定します。' },
            salvage: { name: '残存価額', detail: '耐用年数が終了した時点での資産の価格 (資産の救済価額) を指定します。' },
            life: { name: '耐用年数', detail: '資産を使用できる年数、つまり償却の対象となる資産の寿命年数を指定します。' },
        },
    },
    SYD: {
        description: '級数法 (Sum-of-Year\'s Digits Method) を使用して、特定の期における減価償却費を返します。',
        abstract: '級数法 (Sum-of-Year\'s Digits Method) を使用して、特定の期における減価償却費を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/syd-%E9%96%A2%E6%95%B0-069f8106-b60b-4ca2-98e0-2a0f206bdb27',
            },
        ],
        functionParameter: {
            cost: { name: '取得価額', detail: '資産を購入した時点での価格を指定します。' },
            salvage: { name: '残存価額', detail: '耐用年数が終了した時点での資産の価格 (資産の救済価額) を指定します。' },
            life: { name: '耐用年数', detail: '資産を使用できる年数、つまり償却の対象となる資産の寿命年数を指定します。' },
            per: { name: '期間', detail: '期間 と は、有効期間と同じ単位を使用する必要があります。' },
        },
    },
    TBILLEQ: {
        description: '米国財務省短期証券 (TB) の債券換算利回りを返します。',
        abstract: '米国財務省短期証券 (TB) の債券換算利回りを返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/tbilleq-%E9%96%A2%E6%95%B0-2ab72d90-9b4d-4efe-9fc2-0f81f2c19c8c',
            },
        ],
        functionParameter: {
            settlement: { name: '受渡日', detail: '財務省証券の受渡日を指定します。' },
            maturity: { name: '満期日', detail: '財務省証券の満期日を指定します。' },
            discount: { name: '割引率', detail: '財務省証券の割引率を指定します。' },
        },
    },
    TBILLPRICE: {
        description: '米国財務省短期証券 (TB) の額面 $100 あたりの価格を返します。',
        abstract: '米国財務省短期証券 (TB) の額面 $100 あたりの価格を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/tbillprice-%E9%96%A2%E6%95%B0-eacca992-c29d-425a-9eb8-0513fe6035a2',
            },
        ],
        functionParameter: {
            settlement: { name: '受渡日', detail: '財務省証券の受渡日を指定します。' },
            maturity: { name: '満期日', detail: '財務省証券の満期日を指定します。' },
            discount: { name: '割引率', detail: '財務省証券の割引率を指定します。' },
        },
    },
    TBILLYIELD: {
        description: '米国財務省短期証券 (TB) の利回りを返します。',
        abstract: '米国財務省短期証券 (TB) の利回りを返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/tbillyield-%E9%96%A2%E6%95%B0-6d381232-f4b0-4cd5-8e97-45b9c03468ba',
            },
        ],
        functionParameter: {
            settlement: { name: '受渡日', detail: '財務省証券の受渡日を指定します。' },
            maturity: { name: '満期日', detail: '財務省証券の満期日を指定します。' },
            pr: { name: '価値', detail: '額面 $100 に対する財務省証券の価値を指定します。' },
        },
    },
    VDB: {
        description: '倍額定率法または指定した方法を使用して、指定した期間における資産の減価償却費を返します。',
        abstract: '倍額定率法または指定した方法を使用して、指定した期間における資産の減価償却費を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/vdb-%E9%96%A2%E6%95%B0-dde4e207-f3fa-488d-91d2-66d55e861d73',
            },
        ],
        functionParameter: {
            cost: { name: '取得価額', detail: '資産を購入した時点での価格を指定します。' },
            salvage: { name: '残存価額', detail: '耐用年数が終了した時点での資産の価格 (資産の救済価額) を指定します。' },
            life: { name: '耐用年数', detail: '資産を使用できる年数 (資産の寿命年数) を指定します。' },
            startPeriod: { name: '開始期', detail: '減価償却費の計算の対象となる最初の期を指定します。' },
            endPeriod: { name: '終了期', detail: '減価償却費の計算の対象となる最後の期を指定します。' },
            factor: { name: '率', detail: '減価償却率を指定します。率を省略すると、2 を指定したと見なされ、倍額定率法で計算が行われます。' },
            noSwitch: { name: '切り替えなし', detail: '減価償却費が定率法による計算の結果より大きくなったときに、自動的に定額法に切り替えるかどうかを、論理値で指定します。' },
        },
    },
    XIRR: {
        description: '定期的でないキャッシュ フローに対する内部利益率を返します。',
        abstract: '定期的でないキャッシュ フローに対する内部利益率を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/xirr-%E9%96%A2%E6%95%B0-de1242ec-6477-445b-b11b-a303ad9adc9d',
            },
        ],
        functionParameter: {
            values: { name: 'キャッシュフロー', detail: '収支明細表の日付に対応する一覧のキャッシュ フローを指定します。 最初の支払いは投資の最初に発生する原価や支払いに対応し、省略できます。 最初のキャッシュ フローが原価や支払いの場合、負の値を指定する必要があります。 それ以降の支払いは、1 年の日数を 365 日として割り引かれます。 値には、正の値と負の値が少なくとも 1 つずつ含まれている必要があります。' },
            dates: { name: '日付テーブル', detail: 'キャッシュ フローに対応する一連の支払日を指定します。 指定順序は自由です。' },
            guess: { name: '推測値', detail: 'XIRR 関数の計算結果に近いと思われる数値を指定します。' },
        },
    },
    XNPV: {
        description: '定期的でないキャッシュ フローに対する正味現在価値を返します。',
        abstract: '定期的でないキャッシュ フローに対する正味現在価値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/xnpv-%E9%96%A2%E6%95%B0-1b42bbf6-370f-4532-a0eb-d67c16b664b7',
            },
        ],
        functionParameter: {
            rate: { name: '割引率', detail: '対象となるキャッシュ フローに適用する割引率を指定します。' },
            values: { name: 'キャッシュフロー', detail: '収支明細表の日付に対応する一覧のキャッシュ フローを指定します。 最初の支払いは投資の最初に発生する原価や支払いに対応し、省略できます。 最初のキャッシュ フローが原価や支払いの場合、負の値を指定する必要があります。 それ以降の支払いは、1 年の日数を 365 日として割り引かれます。 値には、正の値と負の値が少なくとも 1 つずつ含まれている必要があります。' },
            dates: { name: '日付テーブル', detail: 'キャッシュ フローに対応する一連の支払日を指定します。 指定順序は自由です。' },
        },
    },
    YIELD: {
        description: '利息が定期的に支払われる証券の利回りを返します。',
        abstract: '利息が定期的に支払われる証券の利回りを返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/yield-%E9%96%A2%E6%95%B0-f5f5ca43-c4bd-434f-8bd2-ed3c9727a4fe',
            },
        ],
        functionParameter: {
            settlement: { name: '受渡日', detail: '証券の受渡日を指定します。' },
            maturity: { name: '満期日', detail: '証券の満期日を指定します。' },
            rate: { name: '利率', detail: '証券の利率を指定します。' },
            pr: { name: '価格', detail: '額面 $100 に対する証券の価値を指定します。' },
            redemption: { name: '償還価額', detail: '額面 $100 に対する証券の償還額を指定します。' },
            frequency: { name: '頻度', detail: '年間の利息支払回数を指定します。 年 1 回の場合は頻度 = 1、年 2 回の場合は頻度 = 2、四半期ごとの場合は頻度 = 4 を指定します。' },
            basis: { name: '基準', detail: '計算に使用する基準日数を示す数値を指定します。' },
        },
    },
    YIELDDISC: {
        description: '米国財務省短期証券 (TB) などの割引債の年利回りを返します。',
        abstract: '米国財務省短期証券 (TB) などの割引債の年利回りを返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/yielddisc-%E9%96%A2%E6%95%B0-a9dbdbae-7dae-46de-b995-615faffaaed7',
            },
        ],
        functionParameter: {
            settlement: { name: '受渡日', detail: '証券の受渡日を指定します。' },
            maturity: { name: '満期日', detail: '証券の満期日を指定します。' },
            pr: { name: '価格', detail: '額面 $100 に対する証券の価値を指定します。' },
            redemption: { name: '償還価額', detail: '額面 $100 に対する証券の償還額を指定します。' },
            basis: { name: '基準', detail: '計算に使用する基準日数を示す数値を指定します。' },
        },
    },
    YIELDMAT: {
        description: '満期日に利息が支払われる証券の利回りを返します。',
        abstract: '満期日に利息が支払われる証券の利回りを返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/yieldmat-%E9%96%A2%E6%95%B0-ba7d1809-0d33-4bcb-96c7-6c56ec62ef6f',
            },
        ],
        functionParameter: {
            settlement: { name: '受渡日', detail: '証券の受渡日を指定します。' },
            maturity: { name: '満期日', detail: '証券の満期日を指定します。' },
            issue: { name: '発行日', detail: '証券の発行日を指定します。' },
            rate: { name: '利率', detail: '証券の利率を指定します。' },
            pr: { name: '価格', detail: '額面 $100 に対する証券の価値を指定します。' },
            basis: { name: '基準', detail: '計算に使用する基準日数を示す数値を指定します。' },
        },
    },
};
