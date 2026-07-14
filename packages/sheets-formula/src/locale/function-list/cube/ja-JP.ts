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
    CUBEKPIMEMBER: {
        description: '主要業績評価指標 (KPI) のプロパティを返し、KPI 名をセルに表示します。 KPI は、月間粗利益や四半期従業員退職率など、定量化が可能な測定値であり、組織の業績をモニタリングするために使用されます。',
        abstract: '主要業績評価指標 (KPI) のプロパティを返し、KPI 名をセルに表示します。 KPI は、月間粗利益や四半期従業員退職率など、定量化が可能な測定値であり、組織の業績をモニタリングするために使用されます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/cubekpimember-function',
            },
        ],
        functionParameter: {
            connection: { name: '接続', detail: '必須。 キューブへの接続名を表す文字列です。' },
            kpiName: { name: 'Kpi_name', detail: '必須。 キューブ内の KPI の名前を表す文字列です。' },
            kpiProperty: { name: 'Kpi_property', detail: '必須。 返される KPI コンポーネントです。次のいずれかを指定できます。' },
            caption: { name: 'キャプション', detail: 'オプション。 KPI 名および KPI のプロパティの代わりにセルに表示される代替テキストです。' },
        },
    },
    CUBEMEMBER: {
        description: 'キューブのメンバーまたは組を返します。 キューブ内にメンバーまたは組が存在することを確認するために使用します。',
        abstract: 'キューブのメンバーまたは組を返します。 キューブ内にメンバーまたは組が存在することを確認するために使用します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/cubemember-function',
            },
        ],
        functionParameter: {
            connection: { name: '接続', detail: '必須。 キューブへの接続名を表す文字列です。' },
            memberExpression: { name: 'Member_expression', detail: '必須。 キューブの一意のメンバーを表す多次元式 (MDX) の文字列です。 セル範囲または配列定数として指定された組をメンバー式に指定できます。' },
            caption: { name: 'キャプション', detail: 'オプション。 定義されている場合、キューブのキャプションの代わりにセルに表示される文字列です。 組が返される場合、組の最後のメンバーのキャプションが使用されます。' },
        },
    },
    CUBEMEMBERPROPERTY: {
        description: 'Excel の Cube 関数の 1 つである CUBEMEMBERPROPERTY 関数 は、キューブからメンバー プロパティの値を返します。 メンバー名がキューブ内に存在することを確認し、このメンバーの特定のプロパティを取得するために使用します。',
        abstract: 'Excel の Cube 関数の 1 つである CUBEMEMBERPROPERTY 関数 は、キューブからメンバー プロパティの値を返します。 メンバー名がキューブ内に存在することを確認し、このメンバーの特定のプロパティを取得するために使用します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/cubememberproperty-function',
            },
        ],
        functionParameter: {
            connection: { name: '接続', detail: '必須。 キューブへの接続名を表す文字列です。' },
            memberExpression: { name: 'Member_expression', detail: '必須。 キューブのメンバーを表す多次元式 (MDX) の文字列です。' },
            property: { name: 'プロパティ', detail: '必須。 返されるプロパティ名を表す文字列またはプロパティ名を含むセルへの参照を指定します。' },
        },
    },
    CUBERANKEDMEMBER: {
        description: 'セット内の n 番目の (ランクされている) メンバーを返します。 売り上げトップの販売員、成績上位 10 位までの生徒など、セット内の 1 つ以上の要素を取得するために使用します。',
        abstract: 'セット内の n 番目の (ランクされている) メンバーを返します。 売り上げトップの販売員、成績上位 10 位までの生徒など、セット内の 1 つ以上の要素を取得するために使用します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/cuberankedmember-function',
            },
        ],
        functionParameter: {
            connection: { name: '接続', detail: '必須。 キューブへの接続名を表す文字列です。' },
            setExpression: { name: 'Set_expression', detail: '必須。 "{[アイテム 1].子供}" などのセット式を表す文字列です。 CUBESET 関数、または CUBESET 関数を格納するセルへの参照も指定できます。' },
            rank: { name: 'ランク', detail: '必須。 返される 1 番上の値を指定する整数値です。 ランクの値が 1 の場合、1 番上の値が返されます。ランクの値が 2 の場合、上から 2 番目の値が返されます。 上位 5 番目までの値を返す場合は、CUBERANKEDMEMBER 関数を 5 回使い、それぞれに 1 から 5 の異なるランクを指定します。' },
            caption: { name: 'キャプション', detail: 'オプション。 定義されている場合、キューブのキャプションの代わりにセルに表示される文字列です。' },
        },
    },
    CUBESET: {
        description: 'セット式をサーバー上のキューブに送信して、計算されたメンバーまたは組のセットを定義します。サーバー上のキューブによってセットが作成され、Microsoft Excel に返されます。',
        abstract: 'セット式をサーバー上のキューブに送信して、計算されたメンバーまたは組のセットを定義します。サーバー上のキューブによってセットが作成され、Microsoft Excel に返されます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/cubeset-function',
            },
        ],
        functionParameter: {
            connection: { name: '接続', detail: '必須。 キューブへの接続名を表す文字列です。' },
            setExpression: { name: 'Set_expression', detail: '必須。 メンバーまたは組のセットを表すセット式の文字列です。 セット内の 1 つ以上のメンバー、組、またはセットを含む Excel 範囲へのセル参照を指定することもできます。' },
            caption: { name: 'キャプション', detail: 'オプション。 定義されている場合、キューブのキャプションの代わりにセルに表示される文字列です。' },
            sortOrder: { name: 'Sort_order', detail: 'オプション。 実行する並べ替えの種類です (存在する場合)。次のいずれかを指定できます。' },
            sortBy: { name: 'Sort_by', detail: 'オプション。 並べ替えの基準となる値を表す文字列です。 たとえば、最も販売額の多い都市を見つけるには、セット式を都市のセットに設定し、並べ替えキーを販売メジャーに設定します。 最も人口の多い都市を見つけるには、セット式を都市のセットに設定し、並べ替えキーを人口メジャーに設定します。 並べ替え順序に並べ替えキーが必要で、並べ替えキーが省略されている場合は、エラー値 #VALUE! が返されます。' },
        },
    },
    CUBESETCOUNT: {
        description: 'セット内のアイテムの数を返します。',
        abstract: 'セット内のアイテムの数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/cubesetcount-function',
            },
        ],
        functionParameter: {
            set: { name: '設定', detail: '必須。 CUBESET 関数で定義されたセットを表す Microsoft Office Excel の式を表す文字列です。 CUBESET 関数、または CUBESET 関数を格納するセルへの参照も指定できます。' },
        },
    },
    CUBEVALUE: {
        description: 'キューブの集計値を返します。',
        abstract: 'キューブの集計値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/cubevalue-function',
            },
        ],
        functionParameter: {
            connection: { name: '接続', detail: '必須。 キューブへの接続名を表す文字列です。' },
            memberExpression: { name: 'Member_expression', detail: 'オプション。 キューブ内のメンバーまたは組を表す多次元式 (MDX) の文字列です。 または、メンバー式は CUBESET 関数で定義したセットでもかまいません。 メンバー式をスライサーとして使用して、合計値が返されるキューブの部分を定義します。 メンバー式でメジャーが指定されない場合は、そのキューブの既定のメジャーが使用されます。' },
        },
    },
};

export default locale;
