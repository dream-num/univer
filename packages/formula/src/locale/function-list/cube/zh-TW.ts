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
        description: '傳回關鍵效能指標 (KPI) 屬性，並在儲存格中顯示 KPI 名稱。 KPI 是一個可量化的度量，例如用來監控組織績效的每月毛利或每季員工流動率。',
        abstract: '傳回關鍵效能指標 (KPI) 屬性，並在儲存格中顯示 KPI 名稱。 KPI 是一個可量化的度量，例如用來監控組織績效的每月毛利或每季員工流動率。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/cubekpimember-function',
            },
        ],
        functionParameter: {
            connection: { name: '連結', detail: '必須。 連線到 Cube 之連線名稱的文字字串。' },
            kpiName: { name: 'Kpi_name', detail: '必須。 Cube 中 KPI 名稱的文字字串。' },
            kpiProperty: { name: 'Kpi_property', detail: '必須。 傳回的 KPI 元件，可以為下列其中一項：' },
            caption: { name: '說明', detail: '可選的。 取代 kpi_name 及 kpi_property 而顯示在儲存格中的文字字串。' },
        },
    },
    CUBEMEMBER: {
        description: '傳回 Cube 中的成員或 Tuple。 用來驗證 Cube 中有成員或 Tuple 存在。',
        abstract: '傳回 Cube 中的成員或 Tuple。 用來驗證 Cube 中有成員或 Tuple 存在。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/cubemember-function',
            },
        ],
        functionParameter: {
            connection: { name: '連結', detail: '必須。 連線到 Cube 之連線名稱的文字字串。' },
            memberExpression: { name: 'Member_expression', detail: '必須。 多維度運算式 (MDX) 的文字字串，會估算出 Cube 中的唯一成員。 member_expression 也可以是指定為儲存格範圍或常數陣列的 Tuple。' },
            caption: { name: '說明', detail: '可選的。 取代 Cube 中的標題 (如果已定義) 而顯示在儲存格中的文字字串。 當傳回 Tuple 時，所使用的標題是 Tuple 中最後一個成員的標題。' },
        },
    },
    CUBEMEMBERPROPERTY: {
        description: 'CUBEMEMBERPROPERTY 函式是 Excel 中的 立方體函式 之一，會從立方體回傳成員屬性的值。 使用它來驗證成員名稱是否存在於該立方體內，並傳回此成員的指定屬性。',
        abstract: 'CUBEMEMBERPROPERTY 函式是 Excel 中的 立方體函式 之一，會從立方體回傳成員屬性的值。 使用它來驗證成員名稱是否存在於該立方體內，並傳回此成員的指定屬性。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/cubememberproperty-function',
            },
        ],
        functionParameter: {
            connection: { name: '連結', detail: '必須。 連線到 Cube 之連線名稱的文字字串。' },
            memberExpression: { name: 'Member_expression', detail: '必須。 Cube 內成員的多維度運算式 (MDX) 文字字串。' },
            property: { name: '財產', detail: '必須。 傳回之屬性名稱的文字字串，或包含屬性名稱之儲存格的參照。' },
        },
    },
    CUBERANKEDMEMBER: {
        description: '傳回一個集合中的第 N 個或已排序的成員。 用來傳回集合中的一個或多個元素，例如最頂尖的銷售人員或前 10 名的學生。',
        abstract: '傳回一個集合中的第 N 個或已排序的成員。 用來傳回集合中的一個或多個元素，例如最頂尖的銷售人員或前 10 名的學生。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/cuberankedmember-function',
            },
        ],
        functionParameter: {
            connection: { name: '連結', detail: '必須。 連線到 Cube 之連線名稱的文字字串。' },
            setExpression: { name: 'Set_expression', detail: '必須。 這是一組運算式的文字字串，如 "{[Item1].兒童}"。 Set_expression 也可以是 CUBESET 函數，或包含 CUBESET 函數之儲存格的參照。' },
            rank: { name: '軍階', detail: '必須。 這是指定要傳回之頂端數值的整數值。 如果 rank 值是 1，會傳回頂端值；如果 rank 值是 2，則會傳回第二位頂端數值，依此類推。 若要傳回頂端的 5 個數值，請使用 CUBERANKEDMEMBER 五次，每次指定從 1 到 5 的不同排名。' },
            caption: { name: '說明', detail: '可選的。 取代 Cube 中的標題 (如果已定義) 而顯示在儲存格中的文字字串。' },
        },
    },
    CUBESET: {
        description: '將集合運算式傳送至伺服器上的 Cube，藉以定義成員或 Tuple 的已計算集合，從而建立集合，然後將該集合傳回給 Microsoft Excel。',
        abstract: '將集合運算式傳送至伺服器上的 Cube，藉以定義成員或 Tuple 的已計算集合，從而建立集合，然後將該集合傳回給 Microsoft Excel。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/cubeset-function',
            },
        ],
        functionParameter: {
            connection: { name: '連結', detail: '必須。 連線到 Cube 之連線名稱的文字字串。' },
            setExpression: { name: 'Set_expression', detail: '必須。 會產生一組成員或 Tuple 之集合運算式的文字字串。 Set_expression 也可以是包含該集合中一個或多個成員、Tuple 或集合之 Excel 範圍的儲存格參照。' },
            caption: { name: '說明', detail: '可選的。 取代 Cube 中的標題 (如果已定義) 而顯示在儲存格中的文字字串。' },
            sortOrder: { name: 'Sort_order', detail: '可選的。 要執行的排序類型 (如果有的話)，並且可以為下列其中一項：' },
            sortBy: { name: 'Sort_by', detail: '可選的。 排序依據之值的文字字串。 例如，若要計算出銷售量最高的縣市，set_expression 應為一組縣市，而 sort_by 則應為銷售量值。 或者，若要計算出人口最多的縣市，set_expression 應為一組縣市，而 sort_by 則應為人口量值。 如果 sort_order 需要 sort_by，而已省略 sort_by，則 CUBESET 會傳回 #VALUE! 錯誤訊息。' },
        },
    },
    CUBESETCOUNT: {
        description: '傳回集合中的項目數。',
        abstract: '傳回集合中的項目數。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/cubesetcount-function',
            },
        ],
        functionParameter: {
            set: { name: '場景', detail: '必須。 這是 Microsoft Excel 運算式的文字字串，會估算出 CUBESET 函數所定義的集合。 Set 也可以是 CUBESET 函數，或包含 CUBESET 函數之儲存格的參照。' },
        },
    },
    CUBEVALUE: {
        description: '會從 Cube 傳回彙總值。',
        abstract: '會從 Cube 傳回彙總值。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/cubevalue-function',
            },
        ],
        functionParameter: {
            connection: { name: '連結', detail: '必須。 連線到 Cube 之連線名稱的文字字串。' },
            memberExpression: { name: 'Member_expression', detail: '可選的。 多維度運算式 (MDX) 的文字字串，會估算出 Cube 中的成員或 Tuple。 member_expression 也可以是以 CUBESET 函數定義的集合。 使用 member_expression 做為交叉分析篩選器以定義會傳回其彙總值之 Cube 的一部分。 如果沒有在 member_expression 中指定量值，則會使用該 Cube 的預設量值。' },
        },
    },
};

export default locale;
