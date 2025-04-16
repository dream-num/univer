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
    CELL: {
        description: '傳回有關儲存格格式、位置或內容的資訊',
        abstract: '傳回有關儲存格格式、位置或內容的資訊',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/cell-%E5%87%BD%E6%95%B0-51bd39a5-f338-4dbe-a33f-955d67c2b2cf',
            },
        ],
        functionParameter: {
            infoType: { name: '資訊類型', detail: '指定所要傳回何種儲存格資訊類型的文字值。' },
            reference: { name: '參考', detail: '要取得其相關資訊的儲存格。' },
        },
    },
    ERROR_TYPE: {
        description: '傳回對應於錯誤類型的數字',
        abstract: '傳回對應於錯誤類型的數字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/error-type-%E5%87%BD%E6%95%B0-10958677-7c8d-44f7-ae77-b9a9ee6eefaa',
            },
        ],
        functionParameter: {
            errorVal: { name: '錯誤值', detail: '要尋找之識別數字的錯誤值。' },
        },
    },
    INFO: {
        description: '傳回有關目前操作環境的資訊',
        abstract: '傳回目前操作環境的資訊',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/info-%E5%87%BD%E6%95%B0-725f259a-0e4b-49b3-8b52-58815c69acae',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ISBETWEEN: {
        description: '檢查提供的數字是否介於另外兩個值之間',
        abstract: '檢查提供的數字是否介於另外兩個值之間',
        links: [
            {
                title: '教導',
                url: 'https://support.google.com/docs/answer/10538337?hl=zh-Hant&sjid=7730820672019533290-AP',
            },
        ],
        functionParameter: {
            valueToCompare: { name: '比較值', detail: '要比較的值，以查看該值是否介於「最小值」和「最大值」之間。' },
            lowerValue: { name: '最小值', detail: '範圍的下限值，「比較值」可能落在這個範圍內。' },
            upperValue: { name: '最大值', detail: '範圍的上限值，「比較值」可能落在這個範圍內。' },
            lowerValueIsInclusive: { name: '包括最小值', detail: '用於指定「最小值」這個值是否包含在範圍中 (預設是 TRUE)。' },
            upperValueIsInclusive: { name: '包括最大值', detail: '用於指定「最大值」這個值是否包含在範圍中 (預設是 TRUE)。' },
        },
    },
    ISBLANK: {
        description: '如果值為空，則傳回 TRUE',
        abstract: '若值為空，則傳回 TRUE',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/is-%E5%87%BD%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '指的是要測試的值。參數值可以是空白（空白儲存格）、錯誤值、邏輯值、文字、數字、參考值，或引用要測試的以上任意值的名稱。' },
        },
    },
    ISDATE: {
        description: '針對特定值是否可轉換為日期傳回結果',
        abstract: '針對特定值是否可轉換為日期傳回結果',
        links: [
            {
                title: '教導',
                url: 'https://support.google.com/docs/answer/9061381?hl=zh-Hant&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '要驗證是否為日期的值。' },
        },
    },
    ISEMAIL: {
        description: '檢查某個值是否為有效的電子郵件地址',
        abstract: '檢查某個值是否為有效的電子郵件地址',
        links: [
            {
                title: '教導',
                url: 'https://support.google.com/docs/answer/3256503?hl=zh-Hant&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '要驗證是否為電子郵件地址的值。' },
        },
    },
    ISERR: {
        description: '如果值為 #N/A 以外的任何錯誤值，則傳回 TRUE',
        abstract: '如果值為 #N/A 以外的任何錯誤值，則傳回 TRUE',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/is-%E5%87%BD%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '指的是要測試的值。參數值可以是空白（空白儲存格）、錯誤值、邏輯值、文字、數字、參考值，或引用要測試的以上任意值的名稱。' },
        },
    },
    ISERROR: {
        description: '如果值為任何錯誤值，則傳回 TRUE',
        abstract: '如果值為任何錯誤值，則傳回 TRUE',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/is-%E5%87%BD%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '指的是要測試的值。參數值可以是空白（空白儲存格）、錯誤值、邏輯值、文字、數字、參考值，或引用要測試的以上任意值的名稱。' },
        },
    },
    ISEVEN: {
        description: '若數字為偶數，則傳回 TRUE',
        abstract: '若數字為偶數，則傳回 TRUE',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/iseven-%E5%87%BD%E6%95%B0-aa15929a-d77b-4fbb-92f4-2f479af55356',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '要測試的值。如果值不是整數，將被截尾取整。' },
        },
    },
    ISFORMULA: {
        description: '檢查是否有參照包含公式的儲存格，並傳回 TRUE 或 FALSE。',
        abstract: '檢查是否有參照包含公式的儲存格，並傳回 TRUE 或 FALSE。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/isformula-%E5%87%BD%E6%95%B0-e4d1355f-7121-4ef2-801e-3839bfd6b1e5',
            },
        ],
        functionParameter: {
            reference: { name: '參照', detail: '是要測試之儲存格的參照。' },
        },
    },
    ISLOGICAL: {
        description: '如果值為邏輯值，則傳回 TRUE',
        abstract: '如果值為邏輯值，則傳回 TRUE',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/is-%E5%87%BD%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '指的是要測試的值。參數值可以是空白（空白儲存格）、錯誤值、邏輯值、文字、數字、參考值，或引用要測試的以上任意值的名稱。' },
        },
    },
    ISNA: {
        description: '如果值為錯誤值 #N/A，則傳回 TRUE',
        abstract: '如果值為錯誤值 #N/A，則傳回 TRUE',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/is-%E5%87%BD%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '指的是要測試的值。參數值可以是空白（空白儲存格）、錯誤值、邏輯值、文字、數字、參考值，或引用要測試的以上任意值的名稱。' },
        },
    },
    ISNONTEXT: {
        description: '如果值不是文本，則傳回 TRUE',
        abstract: '如果值不是文本，則傳回 TRUE',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/is-%E5%87%BD%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '指的是要測試的值。參數值可以是空白（空白儲存格）、錯誤值、邏輯值、文字、數字、參考值，或引用要測試的以上任意值的名稱。' },
        },
    },
    ISNUMBER: {
        description: '如果值為數字，則傳回 TRUE',
        abstract: '如果值為數字，則傳回 TRUE',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/is-%E5%87%BD%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '指的是要測試的值。參數值可以是空白（空白儲存格）、錯誤值、邏輯值、文字、數字、參考值，或引用要測試的以上任意值的名稱。' },
        },
    },
    ISODD: {
        description: '若數字為奇數，則傳回 TRUE',
        abstract: '若數字為奇數，則傳回 TRUE',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/isodd-%E5%87%BD%E6%95%B0-1208a56d-4f10-4f44-a5fc-648cafd6c07a',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '要測試的值。如果值不是整數，將被截尾取整。' },
        },
    },
    ISOMITTED: {
        description: '檢查 LAMBDA 中的值是否缺失，並傳回 TRUE 或 FALSE',
        abstract: '檢查 LAMBDA 中的值是否缺失，並傳回 TRUE 或 FALSE',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/isomitted-%E5%87%BD%E6%95%B0-831d6fbc-0f07-40c4-9c5b-9c73fd1d60c1',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ISREF: {
        description: '如果值為參考值，則傳回 TRUE',
        abstract: '如果值為參考值，則傳回 TRUE',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/is-%E5%87%BD%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: ' 指的是要測試的值。參數值可以是空白（空白儲存格）、錯誤值、邏輯值、文字、數字、參考值，或引用要測試的以上任意值的名稱。' },
        },
    },
    ISTEXT: {
        description: '如果值為文本，則傳回 TRUE',
        abstract: '如果值為文本，則傳回 TRUE',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/is-%E5%87%BD%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '指的是要測試的值。參數值可以是空白（空白儲存格）、錯誤值、邏輯值、文字、數字、參考值，或引用要測試的以上任意值的名稱。' },
        },
    },
    ISURL: {
        description: '檢查特定值是否為有效的網址',
        abstract: '檢查特定值是否為有效的網址',
        links: [
            {
                title: '教導',
                url: 'https://support.google.com/docs/answer/3256501?hl=zh-Hant&sjid=7312884847858065932-AP',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '要驗證是否為網址的值。' },
        },
    },
    N: {
        description: '返回轉換為數字的值',
        abstract: '返回轉換為數字的值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/n-%E5%87%BD%E6%95%B0-a624cad1-3635-4208-b54a-29733d1278c9',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '要轉換的值。' },
        },
    },
    NA: {
        description: '傳回錯誤值 #N/A',
        abstract: '傳回錯誤值 #N/A',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/na-%E5%87%BD%E6%95%B0-5469c2d1-a90c-4fb5-9bbc-64bd9bb6b47c',
            },
        ],
        functionParameter: {
        },
    },
    SHEET: {
        description: '傳回引用工作表的工作表編號',
        abstract: '傳回引用工作表的工作表編號',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/sheet-%E5%87%BD%E6%95%B0-44718b6f-8b87-47a1-a9d6-b701c06cff24',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '要輸入工作表編號的工作表名稱或參照。 如果省略，SHEET 會傳回包含該函數的工作表編號。' },
        },
    },
    SHEETS: {
        description: '傳回工作簿中的工作表數',
        abstract: '傳回工作簿中的工作表數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/sheets-%E5%87%BD%E6%95%B0-770515eb-e1e8-45ce-8066-b557e5e4b80b',
            },
        ],
        functionParameter: {
        },
    },
    TYPE: {
        description: '傳回表示值的資料型別的數字',
        abstract: '傳回表示值的資料型別的數字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/type-%E5%87%BD%E6%95%B0-45b4e688-4bc3-48b3-a105-ffa892995899',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '這可以是任何值，如數字、文字、邏輯值等。' },
        },
    },
};
