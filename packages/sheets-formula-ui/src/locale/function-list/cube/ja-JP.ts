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
    CUBEKPIMEMBER: {
        description: '主要業績評価指標 (KPI) のプロパティを返し、KPI 名をセルに表示します。 KPI は、月間粗利益や四半期従業員退職率など、定量化が可能な測定値であり、組織の業績をモニタリングするために使用されます。',
        abstract: '主要業績評価指標 (KPI) のプロパティを返し、KPI 名をセルに表示します。 KPI は、月間粗利益や四半期従業員退職率など、定量化が可能な測定値であり、組織の業績をモニタリングするために使用されます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/cubekpimember-%E9%96%A2%E6%95%B0-744608bf-2c62-42cd-b67a-a56109f4b03b',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CUBEMEMBER: {
        description: 'キューブのメンバーまたは組を返します。 キューブ内にメンバーまたは組が存在することを確認するために使用します。',
        abstract: 'キューブのメンバーまたは組を返します。 キューブ内にメンバーまたは組が存在することを確認するために使用します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/cubemember-%E9%96%A2%E6%95%B0-0f6a15b9-2c18-4819-ae89-e1b5c8b398ad',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CUBEMEMBERPROPERTY: {
        description: 'キューブ内のメンバー プロパティの値を返します。 メンバー名がキューブ内に存在することを確認し、このメンバーの特定のプロパティを取得するために使用します。',
        abstract: 'キューブ内のメンバー プロパティの値を返します。 メンバー名がキューブ内に存在することを確認し、このメンバーの特定のプロパティを取得するために使用します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/cubememberproperty-%E9%96%A2%E6%95%B0-001e57d6-b35a-49e5-abcd-05ff599e8951',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CUBERANKEDMEMBER: {
        description: 'セット内の n 番目の (ランクされている) メンバーを返します。 売り上げトップの販売員、成績上位 10 位までの生徒など、セット内の 1 つ以上の要素を取得するために使用します。',
        abstract: 'セット内の n 番目の (ランクされている) メンバーを返します。 売り上げトップの販売員、成績上位 10 位までの生徒など、セット内の 1 つ以上の要素を取得するために使用します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/cuberankedmember-%E9%96%A2%E6%95%B0-07efecde-e669-4075-b4bf-6b40df2dc4b3',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CUBESET: {
        description: 'セット式をサーバー上のキューブに送信して、計算されたメンバーまたは組のセットを定義します。サーバー上のキューブによってセットが作成され、Microsoft Excel に返されます。',
        abstract: 'セット式をサーバー上のキューブに送信して、計算されたメンバーまたは組のセットを定義します。サーバー上のキューブによってセットが作成され、Microsoft Excel に返されます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/cubeset-%E9%96%A2%E6%95%B0-5b2146bd-62d6-4d04-9d8f-670e993ee1d9',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CUBESETCOUNT: {
        description: 'セット内のアイテムの数を返します。',
        abstract: 'セット内のアイテムの数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/cubesetcount-%E9%96%A2%E6%95%B0-c4c2a438-c1ff-4061-80fe-982f2d705286',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CUBEVALUE: {
        description: 'キューブの集計値を返します。',
        abstract: 'キューブの集計値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/cubevalue-%E9%96%A2%E6%95%B0-8733da24-26d1-4e34-9b3a-84a8f00dcbe0',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
};
