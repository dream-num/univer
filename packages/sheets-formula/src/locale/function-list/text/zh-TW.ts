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
    ASC: {
        description: '將字串中的全角（雙位元組）英文字母或片假名改為半角（單字節）字元',
        abstract: '將字串中的全角（雙位元組）英文字母或片假名更改為半角（單字節）字元',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/asc-%E5%87%BD%E6%95%B0-0b6abf1c-c663-4004-a964-ebc00b723266',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ARRAYTOTEXT: {
        description: 'ARRAYTOTEXT 函數傳回任意指定區域內的文字值的陣列。 ',
        abstract: 'ARRAYTOTEXT 函數傳回任意指定區域內的文字值的陣列。 ',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/arraytotext-%E5%87%BD%E6%95%B0-9cdcad46-2fa5-4c6b-ac92-14e7bc862b8b',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    BAHTTEXT: {
        description: '使用 ß（泰銖）貨幣格式將數字轉換為文本',
        abstract: '使用 ß（泰銖）貨幣格式將數字轉換為文本',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/bahttext-%E5%87%BD%E6%95%B0-5ba4d0b4-abd3-4325-8d22-7a92d59aab9c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CHAR: {
        description: '傳回由代碼數字指定的字元',
        abstract: '傳回由代碼數字指定的字元',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/char-%E5%87%BD%E6%95%B0-bbd249c8-b36e-4a91-8017-1c133f9b837a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CLEAN: {
        description: '刪除文字中所有非列印字元',
        abstract: '刪除文字中所有非列印字元',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/clean-%E5%87%BD%E6%95%B0-26f3d7c5-475f-4a9c-90e5-4b8ba987ba41',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CODE: {
        description: '傳回文字字串中第一個字元的數字代碼',
        abstract: '傳回文字字串中第一個字元的數字代碼',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/code-%E5%87%BD%E6%95%B0-c32b692b-2ed0-4a04-bdd9-75640144b928',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CONCAT: {
        description: '將多個區域和/或字串的文字組合起來，但不提供分隔符號或 IgnoreEmpty 參數。 ',
        abstract: '將多個區域和/或字串的文字組合起來，但不提供分隔符號或 IgnoreEmpty 參數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/concat-%E5%87%BD%E6%95%B0-9b1a9a3f-94ff-41af-9736-694cbd6b4ca2',
            },
        ],
        functionParameter: {
            text1: { name: '文字 1', detail: '要聯結的文字項目。 字串或字串數組，如單元格區域。 ' },
            text2: { name: '文字 2', detail: '要聯結的其他文字項目。 文本項最多可以有 253 個文字參數。 每個參數可以是一個字串或字串數組，如單元格區域。 ' },
        },
    },
    CONCATENATE: {
        description: '將幾個文​​本項合併為一個文本項',
        abstract: '將幾個文​​本項合併為一個文本項',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/concatenate-%E5%87%BD%E6%95%B0-8f8ae884-2ca8-4f7a-b093-75d702bea31d',
            },
        ],
        functionParameter: {
            text1: { name: '文字 1', detail: '要聯結的第一個項目。 項目可以是文字值、數字或儲存格引用。 ' },
            text2: { name: '文本 2', detail: '要聯結的其他文字項目。 最多可以有 255 個項目，總共最多支援 8,192 個字元。 ' },
        },
    },
    DBCS: {
        description: '將字串中的半角（單字節）英文字母或片假名更改為全角（雙字節）字元',
        abstract: '將字串中的半角（單字節）英文字母或片假名更改為全角（雙字節）字元',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/dbcs-%E5%87%BD%E6%95%B0-a4025e73-63d2-4958-9423-21a24794c9e5',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    DOLLAR: {
        description: '使用 ￥（人民幣）貨幣格式將數字轉換為文本',
        abstract: '使用 ￥（人民幣）貨幣格式將數字轉換為文本',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/dollar-%E5%87%BD%E6%95%B0-a6cd05d9-9740-4ad3-a469-8109d18ff611',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    EXACT: {
        description: '檢查兩個文字值是否相同',
        abstract: '檢查兩個文字值是否相同',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/exact-%E5%87%BD%E6%95%B0-d3087698-fc15-4a15-9631-12575cf29926',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FIND: {
        description: '在一個文字值中找另一個文字值（區分大小寫）',
        abstract: '在一個文字值中找另一個文字值（區分大小寫）',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/find-findb-%E5%87%BD%E6%95%B0-c7912941-af2a-4bdf-a553-d0d89b0a0628',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FINDB: {
        description: '在一個文字值中找另一個文字值（區分大小寫）',
        abstract: '在一個文字值中找另一個文字值（區分大小寫）',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/find-findb-%E5%87%BD%E6%95%B0-c7912941-af2a-4bdf-a553-d0d89b0a0628',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FIXED: {
        description: '將數字格式設定為具有固定小數位數的文字',
        abstract: '將數字格式設定為具有固定小數位數的文字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/fixed-%E5%87%BD%E6%95%B0-ffd5723c-324c-45e9-8b96-e41be2a8274a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LEFT: {
        description: '傳回文字值中最左邊的字元',
        abstract: '傳回文字值中最左邊的字元',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/left-leftb-%E5%87%BD%E6%95%B0-9203d2d2-7960-479b-84c6-1ea52b99640c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LEFTB: {
        description: '傳回文字值中最左邊的字元',
        abstract: '傳回文字值中最左邊的字元',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/left-leftb-%E5%87%BD%E6%95%B0-9203d2d2-7960-479b-84c6-1ea52b99640c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LEN: {
        description: '傳回文字字串中的字元數',
        abstract: '傳回文字字串中的字元數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/len-lenb-%E5%87%BD%E6%95%B0-29236f94-cedc-429d-affd-b5e33d2c67cb',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '要找出其長度的文字。 空格將作為字元進行計數。 ' },
        },
    },
    LENB: {
        description: '傳回文字字串中用於代表字元的位元組數。 ',
        abstract: '返回文字字串中用於代表字元的位元組數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/len-lenb-%E5%87%BD%E6%95%B0-29236f94-cedc-429d-affd-b5e33d2c67cb',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: ' 要找出其長度的文字。 空格將作為字元進行計數。 ' },
        },
    },
    LOWER: {
        description: '將文字轉換為小寫。 ',
        abstract: '將文字轉換為小寫',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/lower-%E5%87%BD%E6%95%B0-3f21df02-a80c-44b2-afaf-81358f9fdeb4',
            },
        ],
        functionParameter: {
            text: {
                name: '文本',
                detail: '要轉換為小寫字母的文字。 LOWER 不會改變文字中的非字母字元。 ',
            },
        },
    },
    MID: {
        description: '從文字字串中的指定位置起傳回特定個數的字元',
        abstract: '從文字字串中的指定位置起傳回特定個數的字元',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/mid-midb-%E5%87%BD%E6%95%B0-d5f9e25c-d7d6-472e-b568-4ecb12433028',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    MIDB: {
        description: '從文字字串中的指定位置起傳回特定個數的字元',
        abstract: '從文字字串中的指定位置起傳回特定個數的字元',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/mid-midb-%E5%87%BD%E6%95%B0-d5f9e25c-d7d6-472e-b568-4ecb12433028',
            }],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    NUMBERVALUE: {
        description: '以與區域設定無關的方式將文字轉換為數字',
        abstract: '以與區域設定無關的方式將文字轉換為數字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/numbervalue-%E5%87%BD%E6%95%B0-1b05c8cf-2bfa-4437-af70-596c7ea7d879',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PHONETIC: {
        description: '提取文字字串中的拼音（漢字注音）字元',
        abstract: '提取文字字串中的拼音（漢字註音）字元',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/phonetic-%E5%87%BD%E6%95%B0-9a329dac-0c0f-42f8-9a55-639086988554',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PROPER: {
        description: '將文字值的每個字的首字母大寫',
        abstract: '將文字值的每個字的首字母大寫',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/proper-%E5%87%BD%E6%95%B0-52a5a283-e8b2-49be-8506-b2887b889f94',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    REPLACE: {
        description: '替換文字中的字元',
        abstract: '替換文字中的字元',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/replace-replaceb-%E5%87%BD%E6%95%B0-8d799074-2425-4a8a-84bc-82472868878a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    REPLACEB: {
        description: '替換文字中的字元',
        abstract: '替換文字中的字元',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/replace-replaceb-%E5%87%BD%E6%95%B0-8d799074-2425-4a8a-84bc-82472868878a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    REPT: {
        description: '按給定次數重複文字',
        abstract: '按給定次數重複文字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/rept-%E5%87%BD%E6%95%B0-04c4d778-e712-43b4-9c15-d656582bb061',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '這是要重複的文字。' },
            numberTimes: { name: '重複次數', detail: '這是指定文字重複次數的正數。' },
        },
    },
    RIGHT: {
        description: '傳回文字值中最右邊的字元',
        abstract: '傳回文字值中最右邊的字元',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/right-rightb-%E5%87%BD%E6%95%B0-240267ee-9afa-4639-a02b-f19e1786cf2f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    RIGHTB: {
        description: '傳回文字值中最右邊的字元',
        abstract: '傳回文字值中最右邊的字元',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/right-rightb-%E5%87%BD%E6%95%B0-240267ee-9afa-4639-a02b-f19e1786cf2f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    SEARCH: {
        description: '在一個文字值中找另一個文字值（不區分大小寫）',
        abstract: '在一個文字值中找另一個文字值（不區分大小寫）',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/search-searchb-%E5%87%BD%E6%95%B0-9ab04538-0e55-4719-a72e-b6f54513b495',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    SEARCHB: {
        description: '在一個文字值中找另一個文字值（不區分大小寫）',
        abstract: '在一個文字值中找另一個文字值（不區分大小寫）',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/search-searchb-%E5%87%BD%E6%95%B0-9ab04538-0e55-4719-a72e-b6f54513b495',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    SUBSTITUTE: {
        description: '在文字字符串中以新文字取代舊文字',
        abstract: '在文字字串中用新文字取代舊文字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/substitute-%E5%87%BD%E6%95%B0-6434944e-a904-4336-a9b0-1e58df3bc332',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    T: {
        description: '將參數轉換為文字',
        abstract: '將參數轉換為文字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/t-%E5%87%BD%E6%95%B0-fb83aeec-45e7-4924-af95-53e073541228',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TEXT: {
        description: '設定數字格式並將其轉換為文字',
        abstract: '設定數字格式並將其轉換為文字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/text-%E5%87%BD%E6%95%B0-20d5ac4d-7b94-49fd-bb38-93d29371225c',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '要轉換為文字的數值。 ' },
            formatText: { name: '數字格式', detail: '一個文字字串，定義要套用於所提供值的格式。 ' },
        },
    },
    TEXTAFTER: {
        description: '傳回給定字元或字串之後出現的文字',
        abstract: '傳回給定字元或字串之後出現的文字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/textafter-%E5%87%BD%E6%95%B0-c8db2546-5b51-416a-9690-c7e6722e90b4',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '您在此搜尋的文字。不允許萬用字元。' },
            delimiter: { name: '分隔符號', detail: '標記要擷取之點之後的文字。' },
            instanceNum: { name: '實例編號', detail: '要解壓縮文字的分隔符號實例。' },
            matchMode: { name: '匹配模式', detail: '判斷文字搜尋是否區分大小寫。預設值會區分大小寫。' },
            matchEnd: { name: '結尾匹配', detail: '將文字結尾視為分隔符號。根據預設，文字是完全相符項目。' },
            ifNotFound: { name: '未匹配到的值', detail: '找不到相符項目時傳回的值。根據預設，會傳回 #N/A。' },
        },
    },
    TEXTBEFORE: {
        description: '傳回出現在給定字元或字串之前的文字',
        abstract: '傳回出現在給定字元或字串之前的文字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/textbefore-%E5%87%BD%E6%95%B0-d099c28a-dba8-448e-ac6c-f086d0fa1b29',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '您在此搜尋的文字。不允許萬用字元。' },
            delimiter: { name: '分隔符號', detail: '標記要擷取之點之後的文字。' },
            instanceNum: { name: '實例編號', detail: '要解壓縮文字的分隔符號實例。' },
            matchMode: { name: '匹配模式', detail: '判斷文字搜尋是否區分大小寫。預設值會區分大小寫。' },
            matchEnd: { name: '結尾匹配', detail: '將文字結尾視為分隔符號。根據預設，文字是完全相符項目。' },
            ifNotFound: { name: '未匹配到的值', detail: '找不到相符項目時傳回的值。根據預設，會傳回 #N/A。' },
        },
    },
    TEXTJOIN: {
        description: '合併來自多個區域和/或字串的文字',
        abstract: '合併來自多個區域和/或字串的文字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/textjoin-%E5%87%BD%E6%95%B0-357b449a-ec91-49d0-80c3-0e8fc845691c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TEXTSPLIT: {
        description: '使用列分隔符號和行分隔符號拆分文字字串',
        abstract: '使用列分隔符號和行分隔符號拆分文字字串',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/textsplit-%E5%87%BD%E6%95%B0-b1ca414e-4c21-4ca0-b1b7-bdecace8a6e7',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TRIM: {
        description: '刪除文字中的空格',
        abstract: '刪除文字中的空格',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/trim-%E5%87%BD%E6%95%B0-410388fa-c5df-49c6-b16c-9e5630b479f9',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    UNICHAR: {
        description: '傳回給定數值所引用的 Unicode 字元',
        abstract: '傳回給定數值所引用的 Unicode 字元',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/unichar-%E5%87%BD%E6%95%B0-ffeb64f5-f131-44c6-b332-5cd72f0659b8',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    UNICODE: {
        description: '傳回對應於文字的第一個字元的數字（代碼點）',
        abstract: '傳回對應於文字的第一個字元的數字（代碼點）',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/unicode-%E5%87%BD%E6%95%B0-adb74aaa-a2a5-4dde-aff6-966e4e81f16f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    UPPER: {
        description: '將文字轉換為大寫形式',
        abstract: '將文字轉換為大寫形式',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/upper-%E5%87%BD%E6%95%B0-c11f29b3-d1a3-4537-8df6-04d0049963d6',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    VALUE: {
        description: '將文字參數轉換為數字',
        abstract: '將文字參數轉換為數字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/value-%E5%87%BD%E6%95%B0-257d0108-07dc-437d-ae1c-bc2d3953d8c2',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    VALUETOTEXT: {
        description: '從任意指定值返回文字',
        abstract: '從任意指定值返回文字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/valuetotext-%E5%87%BD%E6%95%B0-5fff61a2-301a-4ab2-9ffa-0a5242a08fea',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CALL: {
        description: '呼叫動態連結函式庫或程式碼來源中的過程',
        abstract: '呼叫動態連結函式庫或程式碼來源中的過程',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/call-%E5%87%BD%E6%95%B0-32d58445-e646-4ffd-8d5e-b45077a5e995',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    EUROCONVERT: {
        description:
            '用於將數字轉換為歐元形式，將數字由歐元形式轉換為歐元成員國貨幣形式，或利用歐元作為中間貨幣將數字由某一歐元成員國貨幣轉化為另一歐元成員國貨幣形式（三角轉換關係）',
        abstract:
            '用於將數字轉換為歐元形式，將數字由歐元形式轉換為歐元成員國貨幣形式，或利用歐元作為中間貨幣將數字由某一歐元成員國貨幣轉化為另一歐元成員國貨幣形式（三角轉換關係）',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/euroconvert-%E5%87%BD%E6%95%B0-79c8fd67-c665-450c-bb6c-15fc92f8345c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    REGISTER_ID: {
        description: '傳回已註冊過的指定動態連結程式庫 (DLL) 或程式碼來源的註冊號碼',
        abstract: '傳回已註冊的指定動態連結程式庫 (DLL) 或程式碼來源的註冊號碼',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/register-id-%E5%87%BD%E6%95%B0-f8f0af0f-fd66-4704-a0f2-87b27b175b50',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
};
