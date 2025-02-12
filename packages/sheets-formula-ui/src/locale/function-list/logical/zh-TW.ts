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
    AND: {
        description: '如果其所有參數均為 TRUE，則傳回 TRUE',
        abstract: '如果其所有參數均為 TRUE，則傳回 TRUE',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/and-%E5%87%BD%E6%95%B0-5f19b2e8-e1df-4408-897a-ce285a19e9d9',
            },
        ],
        functionParameter: {
            logical1: { name: '邏輯值 1', detail: '第一個想要測試且計算結果可為 TRUE 或 FALSE 的條件。 ' },
            logical2: { name: '邏輯值 2', detail: '其他想要測試且計算結果可為 TRUE 或 FALSE 的條件（最多 255 個條件）。 ' },
        },
    },
    BYCOL: {
        description: '將 LAMBDA 套用至每個欄位並傳回結果陣列',
        abstract: '將 LAMBDA 套用至每個欄位並傳回結果陣列',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/bycol-%E5%87%BD%E6%95%B0-58463999-7de5-49ce-8f38-b7f7a2192bfb',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '以欄分隔的陣列。' },
            lambda: { name: 'lambda', detail: '採用欄作為單一參數並計算一個結果的 LAMBDA。LAMBDA 採用單一參數：陣列中的欄位。' },
        },
    },
    BYROW: {
        description: '將 LAMBDA 套用到每一列，並傳回結果陣列。',
        abstract: '將 LAMBDA 套用到每一列，並傳回結果陣列。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/byrow-%E5%87%BD%E6%95%B0-2e04c677-78c8-4e6b-8c10-a4602f2602bb',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '以列分隔的陣列。' },
            lambda: { name: 'lambda', detail: '採用資料列作為單一參數並計算一個結果的 LAMBDA。 LAMBDA 接受單一參數：陣列中的一列。' },
        },
    },
    FALSE: {
        description: '傳回邏輯值 FALSE',
        abstract: '傳回邏輯值 FALSE',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/false-%E5%87%BD%E6%95%B0-2d58dfa5-9c03-4259-bf8f-f0ae14346904',
            },
        ],
        functionParameter: {
        },
    },
    IF: {
        description: '指定要執行的邏輯檢測',
        abstract: '指定要執行的邏輯偵測',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/if-%E5%87%BD%E6%95%B0-69aed7c9-4e8a-4755-a9bc-aa8bbff73be2',
            },
        ],
        functionParameter: {
            logicalTest: { name: '布林表達式', detail: '要測試的條件。 ' },
            valueIfTrue: { name: '如果值為 true', detail: 'logical_test 的結果為 TRUE 時，希望傳回的值。 ' },
            valueIfFalse: { name: '如果值為 false', detail: 'logical_test 的結果為 FALSE 時，希望傳回的值。 ' },
        },
    },
    IFERROR: {
        description: '如果公式的計算結果錯誤，則傳回指定的值；否則傳回公式的結果',
        abstract: '如果公式的計算結果錯誤，則傳回指定的值；否則傳回公式的結果',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/iferror-%E5%87%BD%E6%95%B0-c526fd07-caeb-47b8-8bb6-63f3e417f611',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: ' 檢查是否有錯誤的參數。 ' },
            valueIfError: { name: '錯誤時傳回值', detail: '公式計算結果為錯誤時要傳回的值。 評估以下錯誤類型：#N/A、#VALUE!、#REF!、#DIV/0!、#NUM!、#NAME? 或 #NULL!。 ' },
        },
    },
    IFNA: {
        description: '如果該表達式解析為 #N/A，則傳回指定值；否則傳回該表達式的結果',
        abstract: '如果該表達式解析為 #N/A，則傳回指定值；否則傳回該表達式的結果',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/ifna-%E5%87%BD%E6%95%B0-6626c961-a569-42fc-a49d-79b4951fd461',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '已核取 #N/A 錯誤值的自變數。' },
            valueIfNa: { name: '如果為#N/A的值', detail: '如果公式評估為 #N/A 錯誤值，要傳回的值。' },
        },
    },
    IFS: {
        description: ' 檢查是否符合一個或多個條件，是否傳回與第一個 TRUE 條件對應的值。 ',
        abstract: ' 檢查是否滿足一個或多個條件，是否傳回與第一個 TRUE 條件對應的值。 ',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/ifs-%E5%87%BD%E6%95%B0-36329a26-37b2-467c-972b-4a39bd951d45',
            },
        ],
        functionParameter: {
            logicalTest1: { name: '條件1', detail: '要評估的第一個條件，可以是布林值、數值、陣列或指向這些值的參考。' },
            valueIfTrue1: { name: '值1', detail: '“條件1”為“TRUE”的情況下傳回的值。' },
            logicalTest2: { name: '條件2', detail: '之前的條件為“FALSE”的情況下，要評估的其他條件。' },
            valueIfTrue2: { name: '值2', detail: '對應條件為“TRUE”的情況下傳回的其他值。' },
        },
    },
    LAMBDA: {
        description:
            '使用 LAMBDA 函數建立可重複使用的自訂函數，並使用易記名稱呼叫它們。 新函數在整個工作簿中可用，其呼叫類似本機 Excel 函數。 ',
        abstract: '建立自訂、可重用的函數，並透過友善名稱呼叫它們',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/lambda-%E5%87%BD%E6%95%B0-bd212d27-1cd1-4321-a34a-ccbf254b8b67',
            },
        ],
        functionParameter: {
            parameter: {
                name: '參數',
                detail: '要傳遞給函數的值，例如儲存格參考、字串或數字。 最多可以輸入 253 個參數。 此參數可選。 ',
            },
            calculation: {
                name: '計算',
                detail: '要作為函數結果執行並傳回的公式。 其必須為最後一個參數，且必須傳回結果。 此參數是必需項。 ',
            },
        },
    },
    LET: {
        description: '將名稱分配給計算結果',
        abstract: '將名稱分配給計算結果',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/let-%E5%87%BD%E6%95%B0-34842dd8-b92b-4d3f-b325-b8b8f9908999',
            },
        ],
        functionParameter: {
            name1: { name: '名稱1', detail: '第一個指派的名稱。必須以字母開頭。不能是公式的輸出結果，或與範圍語法衝突。' },
            nameValue1: { name: '值1', detail: '指派給名稱1(name 1)的值。' },
            calculationOrName2: { name: '計算或名稱2', detail: '下列其中一項：\n1.使用 LET 函數中所有名稱的計算。這必須是 LET 函數中的最後一個引數。\n2.指派給第二個 name_value 的第二個名稱。若有指定名稱，則必須要有 name_value2 和 calculation_ 或 _name3。' },
            nameValue2: { name: '值2', detail: '指派給 calculation_or_name2 的值。' },
            calculationOrName3: { name: '計算或名稱3', detail: '下列其中一項：\n1.使用 LET 函數中所有名稱的計算。LET 函數中的最後一個引數必須是計算。\n2.指派給第三個 name_value 的第三個名稱。若有指定名稱，則必須要有 name_value3 和 calculation_ 或 _name4。' },
        },
    },
    MAKEARRAY: {
        description: '透過應用 LAMBDA 傳回指定行和列大小的計算數組',
        abstract: '透過應用 LAMBDA 傳回指定行和列大小的計算數組',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/makearray-%E5%87%BD%E6%95%B0-b80da5ad-b338-4149-a523-5b221da09097',
            },
        ],
        functionParameter: {
            number1: { name: '行數', detail: '陣列中的行數。 必須大於零' },
            number2: { name: '列數', detail: '陣列中的列數。 必須大於零' },
            value3: {
                name: 'lambda',
                detail: '呼叫 LAMBDA 來建立陣列。 LAMBDA 接受兩個參數:row數組的行索引, col數組的列索引',
            },
        },
    },
    MAP: {
        description: '透過套用 LAMBDA 建立新值，傳回將陣列中每個值對應到新值所形成的陣列。',
        abstract: '透過套用 LAMBDA 建立新值，傳回將陣列中每個值對應到新值所形成的陣列。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/map-%E5%87%BD%E6%95%B0-48006093-f97c-47c1-bfcc-749263bb1f01',
            },
        ],
        functionParameter: {
            array1: { name: '陣列1', detail: '要對應的陣列1。' },
            array2: { name: '陣列2', detail: '要對應的陣列2。' },
            lambda: { name: 'lambda', detail: 'LAMBDA 必須是最後一個引數，也必須為每個陣列傳遞一個參數。' },
        },
    },
    NOT: {
        description: '對其參數的邏輯求反',
        abstract: '對其參數的邏輯求反',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/not-%E5%87%BD%E6%95%B0-9cfc6011-a054-40c7-a140-cd4ba2d87d77',
            },
        ],
        functionParameter: {
            logical: { name: '邏輯表達式', detail: '要反轉邏輯的條件，可評估為 TRUE 或 FALSE。' },
        },
    },
    OR: {
        description: '如果 OR 函數的任意參數計算為 TRUE，則其傳回 TRUE；如果其所有參數均計算機為 FALSE，則傳回 FALSE。 ',
        abstract: '若任一參數為 TRUE，則傳回 TRUE',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/or-%E5%87%BD%E6%95%B0-7d17a​​d14-8700-4281-b308-00b131e22af0',
            },
        ],
        functionParameter: {
            logical1: { name: '邏輯表達式 1', detail: '第一個想要測試且計算結果可為 TRUE 或 FALSE 的條件。 ' },
            logical2: { name: '邏輯表達式 2', detail: '其他想要測試且計算結果可為 TRUE 或 FALSE 的條件（最多 255 個條件）。 ' },
        },
    },
    REDUCE: {
        description: '透過將 LAMBDA 套用至每個值並傳回累加器中的總值，將陣列減少為累積值',
        abstract: '透過將 LAMBDA 套用至每個值並傳回累加器中的總值，將陣列減少為累積值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/reduce-%E5%87%BD%E6%95%B0-42e39910-b345-45f3-84b8-0642b568b7cb',
            },
        ],
        functionParameter: {
            initialValue: { name: '起始值', detail: '設定累計值的起始值。' },
            array: { name: '陣列', detail: '要縮減的陣列。' },
            lambda: { name: 'lambda', detail: '呼叫用於縮減陣列的 LAMBDA。 LAMBDA 需要三個參數：1.值已加總且傳回為最終結果。2.陣列的目前值。3.計算套用至陣列中每個元素。' },
        },
    },
    SCAN: {
        description: '透過將 LAMBDA 應用於每個值來掃描數組，並傳回具有每個中間值的數組',
        abstract: '透過將 LAMBDA 套用至每個值來掃描數組，並傳回具有每個中間值的陣列',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/scan-%E5%87%BD%E6%95%B0-d58dfd11-9969-4439-b2dc-e7062724de29',
            },
        ],
        functionParameter: {
            initialValue: { name: '起始值', detail: '設定累計值的起始值。' },
            array: { name: '陣列', detail: '要掃描的陣列。' },
            lambda: { name: 'lambda', detail: '呼叫用於掃描陣列的 LAMBDA。 LAMBDA 需要三個參數：1.值已加總且傳回為最終結果。2.陣列的目前值。3.計算套用至陣列中每個元素。' },
        },
    },
    SWITCH: {
        description: '根據值列表計算表達式，並傳回與第一個匹配值對應的結果。 如果不匹配，則可能傳回可選預設值。 ',
        abstract: '根據值列表計算表達式，並傳回與第一個符合值對應的結果。 如果不匹配，則可能傳回可選預設值。 ',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/switch-%E5%87%BD%E6%95%B0-47ab33c0-28ce-4530-8a45-d532ec4aa25e',
            },
        ],
        functionParameter: {
            expression: { name: '表達式', detail: '表達式是將要與 值1…值126 進行比較的值（例如數字、日期或一些文字）。' },
            value1: { name: '值1', detail: '值N 是將要與表達式進行比較的值。' },
            result1: { name: '結果1', detail: '結果N 是對應的值N 參數與表達式匹配時要傳回的值。必須為每個對應的值N 參數提供結果N。' },
            defaultOrValue2: { name: '預設或值2', detail: '預設是在值N 表達式中找不到匹配項時要傳回的值。預設參數透過沒有對應的結果N 表達式來識別（請參閱範例）。預設必須是函數中的最後一個參數。' },
            result2: { name: '結果2', detail: '結果N 是對應的值N 參數與表達式匹配時要傳回的值。必須為每個對應的值N 參數提供結果N。' },
        },
    },
    TRUE: {
        description: '傳回邏輯值 TRUE',
        abstract: '傳回邏輯值 TRUE',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/true-%E5%87%BD%E6%95%B0-7652c6e3-8987-48d0-97cd-ef223246b3fb',
            },
        ],
        functionParameter: {
        },
    },
    XOR: {
        description: '傳回所有參數的邏輯「異或」值',
        abstract: '傳回所有參數的邏輯「異或」值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/xor-%E5%87%BD%E6%95%B0-1548d4c2-5e47-4f77-9a92-0533bba14f37',
            },
        ],
        functionParameter: {
            logical1: { name: '邏輯表達式 1', detail: '第一個想要測試且計算結果可為 TRUE 或 FALSE 的條件。 ' },
            logical2: { name: '邏輯表達式 2', detail: '其他想要測試且計算結果可為 TRUE 或 FALSE 的條件（最多 255 個條件）。 ' },
        },
    },
};
