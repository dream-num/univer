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
    ASC: {
        description: '將字串中的全角（雙位元組）英文字母或片假名改為半角（單字節）字元',
        abstract: '將字串中的全角（雙位元組）英文字母或片假名更改為半角（單字節）字元',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/asc-function',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '文字或儲存格參照，其中包含所要變更的文字。 如果文字中不包含任何全形字母，則文字不會變更。' },
        },
    },
    ARRAYTOTEXT: {
        description: 'ARRAYTOTEXT 函數傳回任意指定區域內的文字值的陣列。 ',
        abstract: 'ARRAYTOTEXT 函數傳回任意指定區域內的文字值的陣列。 ',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/arraytotext-function',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '要傳回做為文字的陣列。' },
            format: { name: '資料格式', detail: '傳回資料的格式。它可以是兩個值的其中之一：\n0 預設。 易於閱讀的精簡格式。\n1 包含逸出字元和列分隔符號的限定格式。 產生可在輸入至資料編輯列時進行剖析的字串。 封裝會以引號傳回字串，除了布林值、數字和錯誤以外。' },
        },
    },
    BAHTTEXT: {
        description: '使用 ß（泰銖）貨幣格式將數字轉換為文本',
        abstract: '使用 ß（泰銖）貨幣格式將數字轉換為文本',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/bahttext-function',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '為要轉換成文字的數字，或包含數字的儲存格參照，或結果為數字的公式。' },
        },
    },
    CHAR: {
        description: '傳回由代碼數字指定的字元',
        abstract: '傳回由代碼數字指定的字元',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/char-function',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '介於 1 和 255 之間的數字，用以指定所需的字元。' },
        },
    },
    CLEAN: {
        description: '刪除文字中所有非列印字元',
        abstract: '刪除文字中所有非列印字元',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/clean-function',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '要從中移除無法列印之字元的任何工作表資訊。' },
        },
    },
    CODE: {
        description: '傳回文字字串中第一個字元的數字代碼',
        abstract: '傳回文字字串中第一個字元的數字代碼',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/code-function',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '欲求其第一個字元代碼的文字。' },
        },
    },
    CONCAT: {
        description: '將多個區域和/或字串的文字組合起來，但不提供分隔符號或 IgnoreEmpty 參數。 ',
        abstract: '將多個區域和/或字串的文字組合起來，但不提供分隔符號或 IgnoreEmpty 參數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/concat-function',
            },
        ],
        functionParameter: {
            text1: { name: '文字 1', detail: '要聯結的文字項目。 字串或字串陣列，如儲存格範圍。 ' },
            text2: { name: '文字 2', detail: '要聯結的其他文字項目。 文本項最多可以有 253 個文字參數。 每個參數可以是一個字串或字串陣列，如儲存格範圍。 ' },
        },
    },
    CONCATENATE: {
        description: '將幾個文​​本項合併為一個文本項',
        abstract: '將幾個文​​本項合併為一個文本項',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/concatenate-function',
            },
        ],
        functionParameter: {
            text1: { name: '文字 1', detail: '要聯結的第一個項目。 項目可以是文字值、數字或儲存格引用。 ' },
            text2: { name: '文字 2', detail: '要聯結的其他文字項目。 最多可以有 255 個項目，總共最多支援 8,192 個字元。 ' },
        },
    },
    DBCS: {
        description: '將字串中的半角（單字節）英文字母或片假名更改為全角（雙字節）字元',
        abstract: '將字串中的半角（單字節）英文字母或片假名更改為全角（雙字節）字元',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/dbcs-function',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '文字或儲存格參照，其中包含所要變更的文字。 如果文字中不包含任何半形英文字母或片假名，文字就不會變更。' },
        },
    },
    DOLLAR: {
        description: '使用貨幣格式將數字轉換為文本',
        abstract: '使用貨幣格式將數字轉換為文本',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/dollar-function',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '一個數字、一個含有數字之儲存格的參照，或一個評估為數字的公式。' },
            decimals: { name: '小數位數', detail: '小數點右邊的小數位數。 如果是負數，則會將數位四捨五入到小數點的左邊。 如果省略 decimals，則假設為 2。' },
        },
    },
    EXACT: {
        description: '檢查兩個文字值是否相同',
        abstract: '檢查兩個文字值是否相同',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/exact-function',
            },
        ],
        functionParameter: {
            text1: { name: '文字1', detail: '第一個文字字串。' },
            text2: { name: '文字2', detail: '第二個文字字串。' },
        },
    },
    FIND: {
        description: '在一個文字值中找另一個文字值（區分大小寫）',
        abstract: '在一個文字值中找另一個文字值（區分大小寫）',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/this-article-has-been-retired',
            },
        ],
        functionParameter: {
            findText: { name: '搜尋字串', detail: '要在“要搜尋的文字”中尋找的字串。' },
            withinText: { name: '要搜尋的文字', detail: '要搜尋“搜尋字串”的首次出現的文字。' },
            startNum: { name: '開始位置', detail: '要在“要搜尋的文字”中開始搜尋的字元位置。若省略則假定其值為 1。' },
        },
    },
    FINDB: {
        description: '在一個文字值中找另一個文字值（區分大小寫）',
        abstract: '在一個文字值中找另一個文字值（區分大小寫）',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/this-article-has-been-retired',
            },
        ],
        functionParameter: {
            findText: { name: '搜尋字串', detail: '要在“要搜尋的文字”中尋找的字串。' },
            withinText: { name: '要搜尋的文字', detail: '要搜尋“搜尋字串”的首次出現的文字。' },
            startNum: { name: '開始位置', detail: '要在“要搜尋的文字”中開始搜尋的字元位置。若省略則假定其值為 1。' },
        },
    },
    FIXED: {
        description: '將數字格式設定為具有固定小數位數的文字',
        abstract: '將數字格式設定為具有固定小數位數的文字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/fixed-function',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '要四捨五入並轉換為文字的數字。' },
            decimals: { name: '小數位數', detail: '小數點右邊的小數位數。 如果是負數，則會將數位四捨五入到小數點的左邊。 如果省略 decimals，則假設為 2。' },
            noCommas: { name: '禁用分隔符', detail: '邏輯值，如果為 TRUE，會阻止 FIXED 在傳回的文字中包含逗號。' },
        },
    },
    LEFT: {
        description: '傳回文字值中最左邊的字元',
        abstract: '傳回文字值中最左邊的字元',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/left-function',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '包含想擷取之字元的文字字串。' },
            numChars: { name: '字元數', detail: '指定要 LEFT 擷取的字元數目。' },
        },
    },
    LEFTB: {
        description: '傳回文字值中最左邊的字元',
        abstract: '傳回文字值中最左邊的字元',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/left-function',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '包含想擷取之字元的文字字串。' },
            numBytes: { name: '字節數', detail: '指定要 LEFTB 擷取的字元數目，以位元組為單位。' },
        },
    },
    LEN: {
        description: '傳回文字字串中的字元數',
        abstract: '傳回文字字串中的字元數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/len-function',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '要找出其長度的文字。 空格將作為字元進行計數。' },
        },
    },
    LENB: {
        description: '傳回文字字串中用於代表字元的位元組數。 ',
        abstract: '返回文字字串中用於代表字元的位元組數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/len-function',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '要找出其長度的文字。 空格將作為字元進行計數。' },
        },
    },
    LOWER: {
        description: '將文字轉換為小寫。',
        abstract: '將文字轉換為小寫',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/lower-function',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '要轉換成小寫的文字。' },
        },
    },
    MID: {
        description: '從文字字串中的指定位置起傳回特定個數的字元',
        abstract: '從文字字串中的指定位置起傳回特定個數的字元',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/mid-function',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '包含想擷取之字元的文字字串。' },
            startNum: { name: '開始位置', detail: '要在文字中擷取之第一個字元的位置。' },
            numChars: { name: '字元數', detail: '指定要 MID 擷取的字元數目。' },
        },
    },
    MIDB: {
        description: '從文字字串中的指定位置起傳回特定個數的字元',
        abstract: '從文字字串中的指定位置起傳回特定個數的字元',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/mid-function',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '包含想擷取之字元的文字字串。' },
            startNum: { name: '開始位置', detail: '要在文字中擷取之第一個字元的位置。' },
            numBytes: { name: '字節數', detail: '指定要 MIDB 擷取的字元數目，以位元組為單位。' },
        },
    },
    NUMBERSTRING: {
        description: '將數字轉換為中文字符串',
        abstract: '將數字轉換為中文字符串',
        links: [
            {
                title: '教導',
                url: 'https://www.wps.cn/learning/course/detail/id/340.html?chan=pc_kdocs_function',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '被轉換為中文字符串的數值。' },
            type: { name: '類型', detail: '傳回結果的類型。\n1. 漢字小寫 \n2. 漢字大寫 \n3. 漢字讀寫' },
        },
    },
    NUMBERVALUE: {
        description: '以與區域設定無關的方式將文字轉換為數字',
        abstract: '以與區域設定無關的方式將文字轉換為數字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/numbervalue-function',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '要轉換成數位的文字。' },
            decimalSeparator: { name: '小數分隔符', detail: '用來分隔結果整數和小數部分的字元。' },
            groupSeparator: { name: '群組分隔符', detail: '用來分隔數位群組的字元。' },
        },
    },
    PHONETIC: {
        description: '提取文字字串中的拼音（漢字注音）字元',
        abstract: '提取文字字串中的拼音（漢字註音）字元',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/phonetic-function',
            },
        ],
        functionParameter: {
            reference: { name: '參照', detail: '包含要擷取之注音文字的文字、範圍或參照。' },
        },
    },
    PROPER: {
        description: '將文字值的每個字的首字母大寫',
        abstract: '將文字值的每個字的首字母大寫',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/proper-function',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '以引號括住的文字、傳回文字的公式，或包含要將部分變為大寫之文字的儲存格參照。' },
        },
    },
    REGEXEXTRACT: {
        description: '根據規則運算式擷取第一個符合規則的子字串。',
        abstract: '根據規則運算式擷取第一個符合規則的子字串。',
        links: [
            {
                title: '教導',
                url: 'https://support.google.com/docs/answer/3098244?hl=zh-Hant',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '輸入文字。' },
            regularExpression: { name: '規則運算式', detail: '指定規則運算式，系統就會傳回 text 中第一個符合此運算式的子字串。' },
        },
    },
    REGEXMATCH: {
        description: '某段文字是否符合規則運算式。',
        abstract: '某段文字是否符合規則運算式。',
        links: [
            {
                title: '教導',
                url: 'https://support.google.com/docs/answer/3098292?hl=zh-Hant',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '系統會根據規則運算式測試此文字。' },
            regularExpression: { name: '規則運算式', detail: '用來測試文字的規則運算式。' },
        },
    },
    REGEXREPLACE: {
        description: '利用規則運算式將文字字串的一部分取代成其他文字字串。',
        abstract: '利用規則運算式將文字字串的一部分取代成其他文字字串。',
        links: [
            {
                title: '教導',
                url: 'https://support.google.com/docs/answer/3098245?hl=zh-Hant',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '系統會取代這段文字的部分區段。' },
            regularExpression: { name: '規則運算式', detail: '規則運算式。系統將替換 text 中所有相符的項目。' },
            replacement: { name: '取代文字', detail: '系統會將這段文字插入原來的文字。' },
        },
    },
    REPLACE: {
        description: '替換文字中的字元',
        abstract: '替換文字中的字元',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/replace-function',
            },
        ],
        functionParameter: {
            oldText: { name: '舊文字', detail: '要替換其中某些字元的文字。' },
            startNum: { name: '開始位置', detail: '要在文字中替換的第一個字元的位置。' },
            numChars: { name: '字元數', detail: '指定要 REPLACE 替換的字元數目。' },
            newText: { name: '替換文字', detail: '在舊文字中要替換字元的文字。' },
        },
    },
    REPLACEB: {
        description: '替換文字中的字元',
        abstract: '替換文字中的字元',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/replace-function',
            },
        ],
        functionParameter: {
            oldText: { name: '舊文字', detail: '要替換其中某些字元的文字。' },
            startNum: { name: '開始位置', detail: '要在文字中替換的第一個字元的位置。' },
            numBytes: { name: '字節數', detail: '指定要 REPLACEB 替換的字元數目，以位元組為單位。' },
            newText: { name: '替換文字', detail: '在舊文字中要替換字元的文字。' },
        },
    },
    REPT: {
        description: '按給定次數重複文字',
        abstract: '按給定次數重複文字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/rept-function',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '要重複的文字。' },
            numberTimes: { name: '重複次數', detail: '指定文字重複次數的正數。' },
        },
    },
    RIGHT: {
        description: '傳回文字值中最右邊的字元',
        abstract: '傳回文字值中最右邊的字元',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/right-function',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '包含想擷取之字元的文字字串。' },
            numChars: { name: '字元數', detail: '指定要 RIGHT 擷取的字元數目。' },
        },
    },
    RIGHTB: {
        description: '傳回文字值中最右邊的字元',
        abstract: '傳回文字值中最右邊的字元',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/right-function',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '包含想擷取之字元的文字字串。' },
            numBytes: { name: '字節數', detail: '指定要 RIGHTB 擷取的字元數目，以位元組為單位。' },
        },
    },
    SEARCH: {
        description: '在一個文字值中找另一個文字值（不區分大小寫）',
        abstract: '在一個文字值中找另一個文字值（不區分大小寫）',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/search-function',
            },
        ],
        functionParameter: {
            findText: { name: '搜尋字串', detail: '要在“要搜尋的文字”中尋找的字串。' },
            withinText: { name: '要搜尋的文字', detail: '要搜尋“搜尋字串”的首次出現的文字。' },
            startNum: { name: '開始位置', detail: '要在“要搜尋的文字”中開始搜尋的字元位置。若省略則假定其值為 1。' },
        },
    },
    SEARCHB: {
        description: '在一個文字值中找另一個文字值（不區分大小寫）',
        abstract: '在一個文字值中找另一個文字值（不區分大小寫）',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/search-function',
            },
        ],
        functionParameter: {
            findText: { name: '搜尋字串', detail: '要在“要搜尋的文字”中尋找的字串。' },
            withinText: { name: '要搜尋的文字', detail: '要搜尋“搜尋字串”的首次出現的文字。' },
            startNum: { name: '開始位置', detail: '要在“要搜尋的文字”中開始搜尋的字元位置。若省略則假定其值為 1。' },
        },
    },
    SUBSTITUTE: {
        description: '在文字字符串中以新文字取代舊文字',
        abstract: '在文字字串中用新文字取代舊文字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/substitute-function',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '包含要以字元取代文字的文字或參照。' },
            oldText: { name: '搜尋文字', detail: '要取代的文字。' },
            newText: { name: '取代文字', detail: '要用來取代 old_text 的文字。' },
            instanceNum: { name: '指定取代對象', detail: '指定要將第幾個 old_text 取代為 new_text。 如果指定 instance_num，則只會取代該 old_text。 否則，text 中的每一個 old_text 都會變更為 new_text。' },
        },
    },
    T: {
        description: '將參數轉換為文字',
        abstract: '將參數轉換為文字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/t-function',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '要檢定的值。' },
        },
    },
    TEXT: {
        description: '設定數字格式並將其轉換為文字',
        abstract: '設定數字格式並將其轉換為文字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/text-function',
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
                url: 'https://support.microsoft.com/zh-tw/excel/functions/textafter-function',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '在此搜尋的文字。不允許萬用字元。' },
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
                url: 'https://support.microsoft.com/zh-tw/excel/functions/textbefore-function',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '在此搜尋的文字。不允許萬用字元。' },
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
                url: 'https://support.microsoft.com/zh-tw/excel/functions/textjoin-function',
            },
        ],
        functionParameter: {
            delimiter: { name: '分隔符號', detail: '文字字串，可以是空白、雙引號括起來的一或多個字元，或是有效文字字串的參照。' },
            ignoreEmpty: { name: '忽略空白', detail: '如果為 TRUE，則會忽略空白儲存格。' },
            text1: { name: '文字1', detail: '要加入的文字項目。 文字字串或字串陣列，例如儲存格範圍。' },
            text2: { name: '文字2', detail: '要加入的其他文字項目。 文字項目最多可有 252 個文字引數，包含 text1。 每個項目可以是文字字串或字串陣列，例如儲存格範圍。' },
        },
    },
    TEXTSPLIT: {
        description: '使用欄分隔符號和列分隔符號拆分文字字串',
        abstract: '使用欄分隔符號和列分隔符號拆分文字字串',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/textsplit-function',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '要拆分的文字。' },
            colDelimiter: { name: '欄分隔符', detail: '若要拆分欄依據的字元或字串。' },
            rowDelimiter: { name: '列分隔符', detail: '若要拆分列依據的字元或字串。' },
            ignoreEmpty: { name: '忽略空白儲存格', detail: '是否忽略空白儲存格。預設為 FALSE。' },
            matchMode: { name: '匹配模式', detail: '搜尋文字中的分隔符號匹配。預設情況下，會進行區分大小寫的匹配。' },
            padWith: { name: '填充值', detail: '用於填充的值。預設情況下，使用 #N/A。' },
        },
    },
    TRIM: {
        description: '刪除文字的所有空格，僅保留單字之間的單個空格。',
        abstract: '刪除文字中的空格',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/trim-function',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '要從中刪除空格的文字。' },
        },
    },
    UNICHAR: {
        description: '傳回給定數值所引用的 Unicode 字元',
        abstract: '傳回給定數值所引用的 Unicode 字元',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/unichar-function',
            },
        ],
        functionParameter: {
            number: { name: '數值', detail: '是代表字元的 Unicode 數位。' },
        },
    },
    UNICODE: {
        description: '傳回對應於文字的第一個字元的數字（代碼點）',
        abstract: '傳回對應於文字的第一個字元的數字（代碼點）',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/unicode-function',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '是要使用 Unicode 值的字元。' },
        },
    },
    UPPER: {
        description: '將文字轉換為大寫形式',
        abstract: '將文字轉換為大寫形式',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/upper-function',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '要轉換成大寫的文字。' },
        },
    },
    VALUE: {
        description: '將文字參數轉換為數字',
        abstract: '將文字參數轉換為數字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/value-function',
            },
        ],
        functionParameter: {
            text: { name: '文字', detail: '以引號括住的文字或包含要轉換之文字的儲存格參照。' },
        },
    },
    VALUETOTEXT: {
        description: '從任意指定值返回文字',
        abstract: '從任意指定值返回文字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/valuetotext-function',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '要以文字格式返回的值。' },
            format: { name: '資料格式', detail: '傳回資料的格式。它可以是兩個值的其中之一：\n0 預設。 易於閱讀的精簡格式。\n1 包含逸出字元和列分隔符號的限定格式。 產生可在輸入至資料編輯列時進行剖析的字串。 封裝會以引號傳回字串，除了布林值、數字和錯誤以外。' },
        },
    },
    CALL: {
        description: '呼叫動態連結函式庫或程式碼來源中的過程',
        abstract: '呼叫動態連結函式庫或程式碼來源中的過程',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/call-function',
            },
        ],
        functionParameter: {
            moduleText: { name: '模組文字', detail: '包含程序的動態連結程式庫 (DLL) 名稱。' },
            procedure: { name: '程序', detail: 'DLL 中的程序名稱或序號。' },
            typeText: { name: '類型文字', detail: '指定引數與傳回值資料類型的文字。' },
            argument1: { name: '引數 1', detail: '選用。傳遞給程序的第一個引數。' },
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
                url: 'https://support.microsoft.com/zh-tw/excel/functions/euroconvert-function',
            },
        ],
        functionParameter: {
            number: { name: '數字', detail: '要換算的貨幣值。' },
            source: { name: '來源貨幣', detail: '來源貨幣代碼。' },
            target: { name: '目標貨幣', detail: '目標貨幣代碼。' },
            fullPrecision: { name: '完整精確度', detail: '控制是否依貨幣特定規則四捨五入的邏輯值。' },
            triangulationPrecision: { name: '三角換算精確度', detail: '選用。透過歐元進行中間換算時使用的有效位數。' },
        },
    },
    REGISTER_ID: {
        description: '傳回已註冊過的指定動態連結程式庫 (DLL) 或程式碼來源的註冊號碼',
        abstract: '傳回已註冊的指定動態連結程式庫 (DLL) 或程式碼來源的註冊號碼',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/register-id-function',
            },
        ],
        functionParameter: {
            moduleText: { name: '模組文字', detail: '包含程序的 DLL 或程式碼資源名稱。' },
            procedure: { name: '程序', detail: '程序名稱或序號。' },
            typeText: { name: '類型文字', detail: '選用。指定引數與傳回值資料類型的文字。' },
        },
    },
};

export default locale;
