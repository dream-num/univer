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
    ADDRESS: {
        description:
            '根據指定行號和列號獲得工作表中的某個儲存格的位址。 例如，ADDRESS(2,3) 傳回 $C$2。 再例如，ADDRESS(77,300) 回傳 $KN$77。 可以使用其他函數（如 ROW 和 COLUMN 函數）為 ADDRESS 函數提供行號和列號參數。 ',
        abstract: '以文字形式將參考值傳回工作表的單一儲存格',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/address-%E5%87%BD%E6%95%B0-d0c26c0d-3991-446b-8de4-ab46431d4f89',
            },
        ],
        functionParameter: {
            row_num: { name: '行號', detail: '一個數值，指定要使用儲存格的行號。 ' },
            column_num: { name: '列號', detail: '一個數值，指定要在儲存格參考中使用的列號。 ' },
            abs_num: { name: '引用型別', detail: '一個數值，指定要傳回的參考型別。 ' },
            a1: {
                name: '引用樣式',
                detail: '一個邏輯值，指定 A1 或 R1C1 引用樣式。 在 A1 樣式中，列和行將分別按字母和數字順序新增標籤。 在 R1C1 引用樣式中，列和行均會依數字順序新增標籤。 如果參數 A1 為 TRUE 或省略，則 ADDRESS 函數傳回 A1 樣式參考；如果為 FALSE，則 ADDRESS 函數傳回 R1C1 樣式參考。 ',
            },
            sheet_text: {
                name: '工作表名稱',
                detail: '一個文字值，指定要用作外部參考的工作表的名稱。 例如，公式=ADDRESS (1，1,,,"Sheet2") 回傳 Sheet2！ $A$1。 如果 sheet_text 參數，則不使用工作表名稱，函數傳回的位址會引用目前工作表上的儲存格。 ',
            },
        },
    },
    AREAS: {
        description: '傳回引用中涉及的區域個數',
        abstract: '傳回引用中涉及的區域數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/areas-%E5%87%BD%E6%95%B0-8392ba32-7a41-43b3-96b0-3695d2ec6152',
            },
        ],
        functionParameter: {
            reference: { name: '引用', detail: '儲存格或儲存格範圍的參照，而且可參照多個區域。' },
        },
    },
    CHOOSE: {
        description: '從值的清單中選擇值。 ',
        abstract: '從值的清單中選擇值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/choose-%E5%87%BD%E6%95%B0-fc5c184f-cb62-4ec7-a46e-38653b98f5bc',
            },
        ],
        functionParameter: {
            indexNum: { name: '索引', detail: '用於指定所選取的數值參數。 index_num 必須是介於 1 到 254 之間的數字，或是包含 1 到 254 之間的數字的公式或儲存格參考。 \n如果 index_num 為 1，則 CHOOSE 傳回 value1；如果為 2，則 CHOOSE 傳回 value2，以此類推。 \n如果 index_num 小於 1 或大於清單中最後一個值的索引號，則 CHOOSE 傳回 #VALUE! 錯誤值。 \n如果 index_num 為小數，則在使用前會被截尾取整。 ' },
            value1: { name: '值 1', detail: 'CHOOSE 將根據 index_num 從中選擇一個數值或一項要執行的操作。 參數可以是數字、儲存格引用、定義的名稱、公式、函數或文字。 ' },
            value2: { name: '值 2', detail: '1 到 254 個值參數。 ' },
        },
    },
    CHOOSECOLS: {
        description: '傳回數組中的指定列',
        abstract: '傳回數組中的指定列',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/choosecols-%E5%87%BD%E6%95%B0-bf117976-2722-4466-9b9a-1c01ed9aebff',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '包含要在新陣列中傳回之欄的陣列。' },
            colNum1: { name: '欄數1', detail: '要返回的第一欄。' },
            colNum2: { name: '欄數2', detail: '要返回的其他欄。' },
        },
    },
    CHOOSEROWS: {
        description: '傳回數組中的指定行',
        abstract: '傳回數組中的指定行',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/chooserows-%E5%87%BD%E6%95%B0-51ace882-9bab-4a44-9625-7274ef7507a3',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '包含要在新陣列中傳回之欄的陣列。' },
            rowNum1: { name: '列數1', detail: '要返回的第一列數。' },
            rowNum2: { name: '列數2', detail: '要返回的其他列數。' },
        },
    },
    COLUMN: {
        description: '傳回給定單元格引用的列號。 ',
        abstract: '傳回引用的列號',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/column-%E5%87%BD%E6%95%B0-44e8c754-711c-4df3-9da4-47a55042554b',
            },
        ],
        functionParameter: {
            reference: { name: '引用', detail: '要傳回其列號的儲存格或儲存格範圍。 ' },
        },
    },
    COLUMNS: {
        description: '傳回數組或引用的列數。 ',
        abstract: '傳回引用中包含的列數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/columns-%E5%87%BD%E6%95%B0-4e8e7b4e-e603-43e8-b177-956088fa48ca',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '要計算列數的陣列、陣列公式或是對儲存格區域的參考。 ' },
        },
    },
    DROP: {
        description: '從陣列的開頭或結尾排除指定數量的行或列',
        abstract: '從陣列的開頭或結尾排除指定數量的行或列',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/drop-%E5%87%BD%E6%95%B0-1cb4e151-9e17-4838-abe5-9ba48d8c6a34',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '要排除列或欄的陣列。' },
            rows: { name: '列數', detail: '要排除的列數。負值會從陣列結尾排除。' },
            columns: { name: '欄數', detail: '要排除的欄數。負值會從陣列結尾排除。' },
        },
    },
    EXPAND: {
        description: '將陣列展開或填入指定的行和列維度',
        abstract: '將陣列展開或填入指定的行和列維度',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/expand-%E5%87%BD%E6%95%B0-7433fba5-4ad1-41da-a904-d5d95808bc38',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '要展開的陣列。' },
            rows: { name: '列數', detail: '展開陣列中的列數。 如果遺失，將不會展開列。' },
            columns: { name: '欄數', detail: '展開陣列中的欄數。 如果遺失，欄將不會展開。' },
            padWith: { name: '填塞值', detail: '要填塞的值。 預設值為 #N/A。' },
        },
    },
    FILTER: {
        description: 'FILTER 函數可以基於定義的條件篩選一系列資料。 ',
        abstract: 'FILTER 函數可以基於定義的條件篩選一系列資料。 ',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/filter-%E5%87%BD%E6%95%B0-f4f7cb66-82eb-4767-8f7c-4877ad80c759',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '要篩選的區域或陣列。' },
            include: { name: '布林值數組', detail: '布林值數組，其中 TRUE 表示要保留的一行或一列。' },
            ifEmpty: { name: '空值返回', detail: '如果未保留任何項，則傳回。' },
        },
    },
    FORMULATEXT: {
        description: '將給定引用的公式傳回為文字',
        abstract: '將給定引用的公式傳回為文字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/formulatext-%E5%87%BD%E6%95%B0-0a786771-54fd-4ae2-96ee-09cda35439c8',
            },
        ],
        functionParameter: {
            reference: { name: '引用', detail: '單元格或儲存格範圍的參照。' },
        },
    },
    GETPIVOTDATA: {
        description: '傳回儲存在資料透視表中的資料',
        abstract: '傳回儲存在資料透視表中的資料',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/getpivotdata-%E5%87%BD%E6%95%B0-8c083b99-a922-4ca0-af5e-3af55960761f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    HLOOKUP: {
        description: '在表格的首行或數值數組中搜尋值，然後傳回表格或陣列中指定行的所在列中的值。 ',
        abstract: '找出陣列的首行，並傳回指定儲存格的值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/hlookup-%E5%87%BD%E6%95%B0-a3034eec-b719-4ba3-bb65-e1ad662ed95f',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: '查找值',
                detail: '要尋找的值。 要尋找的值必須位於 table_array 參數中指定的儲存格區域的第一行中。 ',
            },
            tableArray: {
                name: '範圍',
                detail: 'VLOOKUP 在其中搜尋 lookup_value 和傳回值的儲存格區域。在其中尋找資料的資訊表。 使用區域或區域名稱的引用。 ',
            },
            rowIndexNum: {
                name: '行號',
                detail: '行號table_array符合值將傳回的行號（row_index_num為 1，則傳回 table_array 中的第一行值，row_index_num 2 傳回 table_array 中的第二行值）。 ',
            },
            rangeLookup: {
                name: '查詢類型',
                detail: '指定希望查找精確匹配值還是近似匹配值：預設近似匹配 - 1/TRUE, 完全匹配 - 0/FALSE',
            },
        },
    },
    HSTACK: {
        description: '水平和順序追加數組以傳回較大的陣列',
        abstract: '水平和順序追加數組以傳回較大的陣列',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/hstack-%E5%87%BD%E6%95%B0-98c4ab76-10fe-4b4f-8d5f-af1c125fe8c2',
            },
        ],
        functionParameter: {
            array1: { name: '陣列', detail: '要附加的陣列。' },
            array2: { name: '陣列', detail: '要附加的陣列。' },
        },
    },
    HYPERLINK: {
        description: '建立捷徑或跳轉，以開啟儲存在網頁伺服器、Intranet 或 Internet 上的文件',
        abstract: '建立捷徑或跳轉，以開啟儲存在網頁伺服器、Intranet 或 Internet 上的文件',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/hyperlink-%E5%87%BD%E6%95%B0-333c7ce6-c5ae-4164-9c47-7de9b76f577f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IMAGE: {
        description: '從給定來源返回圖像',
        abstract: '從給定來源返回映像',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/image-%E5%87%BD%E6%95%B0-7e112975-5e52-4f2a-b9da-1d913d51f5d5',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    INDEX: {
        description: '傳回指定的行與列交叉處的儲存格參考。 如果引用由不連續的選取區域組成，可以選擇某一選取區域。 ',
        abstract: '使用索引從引用或陣列中選擇值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/index-%E5%87%BD%E6%95%B0-a5dcf0dd-996d-40a4-a822-b56b061328bd',
            },
        ],
        functionParameter: {
            reference: { name: '引用', detail: '對一個或多個儲存格區域的引用。' },
            rowNum: { name: '行號', detail: '引用中某行的行號，函數從該行傳回一個引用。 ' },
            columnNum: { name: '列號', detail: '引用中某列的列標，函數從該列傳回一個引用。 ' },
            areaNum: { name: '區域編號', detail: '選擇要傳回行號和列號的交叉點的參考區域。' },
        },
    },
    INDIRECT: {
        description: '傳回由文字字串指定的引用。 此函數立即對引用進行計算，並顯示其內容。 ',
        abstract: '傳回由文字值指定的參考',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/indirect-%E5%87%BD%E6%95%B0-474b3a3a-8a26-4f44-b491-92b6306fa261',
            },
        ],
        functionParameter: {
            refText: { name: '引用文本', detail: '對包含 A1 樣式引用、R1C1 樣式引用、定義為引用的名稱或作為文本字符串引用的單元格的引用的引用。' },
            a1: { name: '引用類型', detail: '一個邏輯值，用於指定包含在單元格引用文本中的引用的類型。' },
        },
    },
    LOOKUP: {
        description: '當需要查詢一行或一列並查找另一行或列中的相同位置的值時使用',
        abstract: '在向量或陣列中找出值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/lookup-%E5%87%BD%E6%95%B0-446d94af-663b-451d-8251-369d5e3864cb',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: '查找值',
                detail: '在第一個向量中搜尋的值。可以是數字、文字、邏輯值、名稱或對值的引用。 ',
            },
            lookupVectorOrArray: { name: '查詢範圍或陣列', detail: '只包含一行或一列的區域。 ' },
            resultVector: {
                name: '結果範圍',
                detail: ' 只包含一行或一列的區域。參數必須與 lookup_vector 參數大小相同。 其大小必須相同。 ',
            },
        },
    },
    MATCH: {
        description: '使用 MATCH 函數在 範圍 儲存格中搜尋特定的項，然後傳回該項在此區域中的相對位置。',
        abstract: '在參考或陣列中尋找值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/match-%E5%87%BD%E6%95%B0-e8dffd45-c762-47d6-bf89-533f4a37673a',
            },
        ],
        functionParameter: {
            lookupValue: { name: '尋找值', detail: '要在 lookup_array 中符合的值。' },
            lookupArray: { name: '搜尋區域', detail: '要搜尋的儲存格區域。' },
            matchType: { name: '符合類型', detail: '數字 -1、0 或 1。' },
        },
    },
    OFFSET: {
        description: '從給定參考傳回引用偏移量',
        abstract: '從給定引用返回引用偏移',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/offset-%E5%87%BD%E6%95%B0-c8de19ae-dd79-4b9b-a14e-b4d906d11b66',
            },
        ],
        functionParameter: {
            reference: { name: '引用', detail: '要基於偏移量的參考。' },
            rows: { name: '行數', detail: '需要左上角單元格引用的向上或向下行數。' },
            cols: { name: '列數', detail: '需要結果的左上角單元格引用的從左到右的列數。' },
            height: { name: '行高', detail: '需要傳回的引用的行高。行高必須為正數。' },
            width: { name: '列寬', detail: '需要傳回的引用的列寬。列寬必須為正數。' },
        },
    },
    ROW: {
        description: '傳回給定單元格引用的行號。 ',
        abstract: '傳回引用的行號',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/row-%E5%87%BD%E6%95%B0-3a63b74a-c4d0-4093-b49a-e76eb49a6d8d',
            },
        ],
        functionParameter: {
            reference: { name: '引用', detail: '需要取得其行號的儲存格或儲存格區域。 ' },
        },
    },
    ROWS: {
        description: '傳回數組或引用的行數。 ',
        abstract: '傳回引用中的行數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/rows-%E5%87%BD%E6%95%B0-b592593e-3fc2-47f2-bec1-bda493811597',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '需要取得其行數的陣列、陣列公式或對儲存格區域的參考。 ' },
        },
    },
    RTD: {
        description: '從支援 COM 自動化的程式中擷取即時資料',
        abstract: '從支援 COM 自動化的程式中擷取即時資料',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/rtd-%E5%87%BD%E6%95%B0-e0cc001a-56f0-470a-9b19-9455dc0eb593',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    SORT: {
        description: '將區域或陣列的內容排序',
        abstract: '將區域或陣列的內容排序',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/sort-%E5%87%BD%E6%95%B0-22f63bd0-ccc8-492f-953d-c20e8e44b86c',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '要排序的範圍或陣列。' },
            sortIndex: { name: '排序索引', detail: '表示排序依據(按行或按列)的數字。' },
            sortOrder: { name: '排序順序', detail: '表示所需排序順序的數字；1表示順序(預設)，-1表示降序。' },
            byCol: { name: '排序方向', detail: '表示所需排序方向的邏輯值；FALSE指依行排序(預設)，TRUE指依列排序。' },
        },
    },
    SORTBY: {
        description: '根據對應區域或陣列中的值對區域或陣列的內容進行排序',
        abstract: '根據對應區域或陣列中的值對區域或陣列的內容進行排序',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/sortby-%E5%87%BD%E6%95%B0-cd2d7a62-1b93-435c-b561-d6a35134f28f',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '要排序的範圍或陣列。' },
            byArray1: { name: '排序數組1', detail: '若要基於其進行排序的範圍或陣列。' },
            sortOrder1: { name: '排序順序1', detail: '表示所需排序順序的數字；1表示順序(預設)，-1表示降序。' },
            byArray2: { name: '排序數組2', detail: '若要基於其進行排序的範圍或陣列。' },
            sortOrder2: { name: '排序順序2', detail: '表示所需排序順序的數字；1表示順序(預設)，-1表示降序。' },
        },
    },
    TAKE: {
        description: '從陣列的開頭或結尾傳回指定數量的連續行或列',
        abstract: '從陣列的開頭或結尾傳回指定數量的連續行或列',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/take-%E5%87%BD%E6%95%B0-25382ff1-5da1-4f78-ab43-f33bd2e4e003',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '要取用列或欄的陣列。' },
            rows: { name: '列數', detail: '要取用的列數。負值會從陣列結尾取用。' },
            columns: { name: '欄數', detail: '要取用的欄數。負值會從陣列結尾取用。' },
        },
    },
    TOCOL: {
        description: '傳回單一欄中的陣列。',
        abstract: '傳回單一欄中的陣列。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/tocol-%E5%87%BD%E6%95%B0-22839d9b-0b55-4fc1-b4e6-2761f8f122ed',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '要以欄返回的陣列或參照。' },
            ignore: { name: '忽略值', detail: '是否要忽略特定類型的值。 根據預設，不會忽略任何值。 指定下列其中一項動作：\n0 保留所有值 (預設)\n1 略過空白\n2 略過錯誤\n3 略過空白和錯誤' },
            scanByColumn: { name: '依欄掃描陣列', detail: '依欄掃描陣列。 根據預設，陣列會以列掃描。 掃描會決定值是依列或欄排序。' },
        },
    },
    TOROW: {
        description: '傳回單一列中的陣列。',
        abstract: '傳回單一列中的陣列。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/torow-%E5%87%BD%E6%95%B0-b90d0964-a7d9-44b7-816b-ffa5c2fe2289',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '要以列返回的陣列或參照。' },
            ignore: { name: '忽略值', detail: '是否要忽略特定類型的值。 根據預設，不會忽略任何值。 指定下列其中一項動作：\n0 保留所有值 (預設)\n1 略過空白\n2 略過錯誤\n3 略過空白和錯誤' },
            scanByColumn: { name: '依欄掃描陣列', detail: '依欄掃描陣列。 根據預設，陣列會以列掃描。 掃描會決定值是依列或欄排序。' },
        },
    },
    TRANSPOSE: {
        description: '傳回數組的轉置',
        abstract: '傳回陣列的轉置',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/transpose-%E5%87%BD%E6%95%B0-ed039415-ed8a-4a81-93e9-4b6dfac76027',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '工作表中的儲存格區域或陣列。' },
        },
    },
    UNIQUE: {
        description: '傳回清單或區域的唯一值清單',
        abstract: '傳回清單或區域的唯一值清單',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/unique-%E5%87%BD%E6%95%B0-c5ab87fd-30a3-4ce9-9d1a-40204fb85e1e',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '從中傳回唯一行或列的範圍或陣列。' },
            byCol: { name: '依據列', detail: '是一個邏輯值：將行彼此比較並傳回唯一值 = FALSE，或已省略；將列彼此比較並傳回唯一值 = TRUE。' },
            exactlyOnce: { name: '僅一次', detail: '是邏輯值：從陣列傳回只出現一次的行或列 = TRUE；從陣列傳回所有不同的行或列 = FALSE，或已省略。' },
        },
    },
    VLOOKUP: {
        description:
            '需要在表格或區域中按行查找內容時，請使用 VLOOKUP。 例如，按零件號碼找出汽車零件的價格，或根據員工 ID 尋找員工姓名。 ',
        abstract: '在數組第一列中查找，然後在行之間移動以返回單元格的值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/vlookup-%E5%87%BD%E6%95%B0-0bbc8083-26fe-4963-8ab8-93a18ad188a1',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: '查找值',
                detail: '要尋找的值。 要尋找的值必須位於 table_array 參數中指定的儲存格區域的第一列。 ',
            },
            tableArray: {
                name: '範圍',
                detail: 'VLOOKUP 在其中搜尋 lookup_value 和傳回值的儲存格區域。 可以使用命名區域或表，並且可以在參數中使用名稱，而不是單元格參考。 ',
            },
            colIndexNum: {
                name: '行號',
                detail: '其中包含傳回值的儲存格的編號（table_array 最左側儲存格為 1 開始編號）。 ',
            },
            rangeLookup: {
                name: '查詢類型',
                detail: '一個邏輯值，該值指定希望 VLOOKUP 查找近似匹配還是精確匹配：近似匹配 - 1/TRUE, 完全匹配 - 0/FALSE',
            },
        },
    },
    VSTACK: {
        description: '依序垂直追加陣列以傳回更大的陣列',
        abstract: '依序垂直追加陣列以傳回更大的陣列',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/vstack-%E5%87%BD%E6%95%B0-a4b86897-be0f-48fc-adca-fcc10d795a9c',
            },
        ],
        functionParameter: {
            array1: { name: '陣列', detail: '要附加的陣列。' },
            array2: { name: '陣列', detail: '要附加的陣列。' },
        },
    },
    WRAPCOLS: {
        description: '在指定的元素數之後，將提供的列或欄的值以欄換行，以形成新陣列。',
        abstract: '在指定的元素數之後，將提供的列或欄的值以欄換行，以形成新陣列。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/wrapcols-%E5%87%BD%E6%95%B0-d038b05a-57b7-4ee0-be94-ded0792511e2',
            },
        ],
        functionParameter: {
            vector: { name: '向量', detail: '要換行的向量或參照。' },
            wrapCount: { name: '換行數目', detail: '每一欄的最大值數目。' },
            padWith: { name: '填塞值', detail: '要填塞的值。 預設值為 #N/A。' },
        },
    },
    WRAPROWS: {
        description: '在指定的元素數之後，將提供的列或欄的值以列換行，以形成新陣列。',
        abstract: '在指定的元素數之後，將提供的列或欄的值以列換行，以形成新陣列。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/wraprows-%E5%87%BD%E6%95%B0-796825f3-975a-4cee-9c84-1bbddf60ade0',
            },
        ],
        functionParameter: {
            vector: { name: '向量', detail: '要換行的向量或參照。' },
            wrapCount: { name: '換行數目', detail: '每一列的最大值數目。' },
            padWith: { name: '填塞值', detail: '要填塞的值。 預設值為 #N/A。' },
        },
    },
    XLOOKUP: {
        description:
            '函數搜尋區域或數組，然後傳回與它找到的第一個匹配項對應的項。 如果不存在匹配項，則 XLOOKUP 可以傳回最接近的 (近似) 匹配項',
        abstract: '搜尋區域或陣列，並傳回與之找到的第一個符合項目對應的項目。 ',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/xlookup-%E5%87%BD%E6%95%B0-b7fd680e-6d10-43e6-84f9-88eae8bf5929',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: '查找值',
                detail: '要搜尋的值，如果省略，XLOOKUP 將會傳回在 lookup_array 中找到的空白儲存格。 ',
            },
            lookupArray: { name: '搜尋區域', detail: '要搜尋的陣列或區域' },
            returnArray: { name: '傳回區域', detail: '要傳回的陣列或區域' },
            ifNotFound: {
                name: '預設顯示值',
                detail: '如果未找到有效的匹配項，則返回你提供的 [if_not_found] 文本，否則返回#N/A ',
            },
            matchMode: {
                name: '符合類型',
                detail: '指定符合類型： 0 - 完全符合。 如果未找到，則傳回 #N/A。預設選項。 -1 - 完全匹配。 如果沒有找到，則傳回下一個較小的項。 1 - 完全匹配。 如果沒有找到，則傳回下一個較大的項。 2 - 通配符匹配，其中 *, ? 和 ~ 有特殊意義。 ',
            },
            searchMode: {
                name: '搜尋模式',
                detail: '指定要使用的搜尋模式：1 從第一項開始執行搜索，預設選項。 -1 從最後一項開始執行反向搜尋。 2 執行依賴 lookup_array 按升序排序的二進位搜尋, -2執行依賴於 lookup_array 按降序排序的二進位搜尋',
            },
        },
    },
    XMATCH: {
        description: '在陣列或儲存格區域中搜尋指定項，然後傳回項的相對位置。 ',
        abstract: '傳回項目在陣列或儲存格區域中的相對位置。 ',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/xmatch-%E5%87%BD%E6%95%B0-d966da31-7a6b-4a13-a1c6-5a33ed6a0312',
            },
        ],
        functionParameter: {
            lookupValue: { name: '找值', detail: '找值' },
            lookupArray: { name: '搜尋區域', detail: '要搜尋的陣列或區域' },
            matchMode: { name: '匹配類型', detail: '指定匹配類型：\n0 - 完全匹配（預設值）\n-1 - 完全匹配或下一個最小項\n1 - 完全匹配或下一個最大項\n2 - 通配符匹配，其中*, ? 和~ 有特殊意義。 ' },
            searchMode: { name: '搜尋類型', detail: '指定搜尋類型：\n1 - 搜尋從第一到最後一個（預設值）\n-1 - 搜尋從最後到第一個（反向搜尋）。 \n2 - 執行依賴 lookup_array 按升序排序的二進位搜尋。 如果未排序，將傳回無效結果。 \n2 - 執行依賴 lookup_array 按降序排序的二進位搜尋。 如果未排序，將傳回無效結果。 ' },
        },
    },
};
