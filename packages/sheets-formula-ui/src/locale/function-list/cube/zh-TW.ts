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
        description:
            '傳回重要效能指示器 (KPI) 屬性，並在儲存格中顯示 KPI 名稱。 KPI 是一種用於監控單位績效的可計量度量值，例如每月總利潤或季度員工調整。 ',
        abstract:
            '傳回重要效能指示器 (KPI) 屬性，並在儲存格中顯示 KPI 名稱。 KPI 是一種用於監控單位績效的可計量度量值，例如每月總利潤或季度員工調整。 ',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/cubekpimember-%E5%87%BD%E6%95%B0-744608bf-2c62-42cd-b67a-a56109f4b03b',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CUBEMEMBER: {
        description: '傳回多維資料集中的成員或元組。 用於驗證多維資料集內是否存在成員或元組。 ',
        abstract: '傳回多維資料集中的成員或元組。 用於驗證多維資料集內是否存在成員或元組。 ',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/cubemember-%E5%87%BD%E6%95%B0-0f6a15b9-2c18-4819-ae89-e1b5c8b398ad',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CUBEMEMBERPROPERTY: {
        description: '傳回多維資料集中成員屬性的值。 用於驗證多維資料集內是否存在某個成員名並傳回此成員的指定屬性。 ',
        abstract: '傳回多維資料集中成員屬性的值。 用於驗證多維資料集內是否存在某個成員名並傳回此成員的指定屬性。 ',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/cubememberproperty-%E5%87%BD%E6%95%B0-001e57d6-b35a-49e5-abcd-05ff599e8951',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CUBERANKEDMEMBER: {
        description:
            '傳回集合中的第 n 個或排在一定名次的成員。 用來傳回集合中的一個或多個元素，如業績最好的銷售人員或前 10 名的學生。 ',
        abstract:
            '傳回集合中的第 n 個或排在一定名次的成員。 用來傳回集合中的一個或多個元素，如業績最好的銷售人員或前 10 名的學生。 ',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/cuberankedmember-%E5%87%BD%E6%95%B0-07efecde-e669-4075-b4bf-6b40df2dc4b3',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CUBESET: {
        description:
            '定義成員或元組的計算集。方法是向伺服器上的多維資料集傳送集合表達式，此表達式會建立集合，並隨後將該集合傳回 Microsoft Excel。 ',
        abstract:
            '定義成員或元組的計算集。方法是向伺服器上的多維資料集傳送集合表達式，此表達式會建立集合，並隨後將該集合傳回 Microsoft Excel。 ',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/cubeset-%E5%87%BD%E6%95%B0-5b2146bd-62d6-4d04-9d8f-670e9993ee1d9',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CUBESETCOUNT: {
        description: '傳回集合中的項目數。 ',
        abstract: '傳回集合中的項目數。 ',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/cubesetcount-%E5%87%BD%E6%95%B0-c4c2a438-c1ff-4061-80fe-982f2d705286',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CUBEVALUE: {
        description: '從多維資料集中傳回匯總值。 ',
        abstract: '從多維資料集中傳回匯總值。 ',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/cubevalue-%E5%87%BD%E6%95%B0-8733da24-26d1-4e34-9b3a-84a8f00dcbe0',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
};
