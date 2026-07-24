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
    ADDRESS: {
        description: '根據指定列號和欄號獲得工作表中的某個儲存格的位址。 例如，ADDRESS(2,3) 傳回 $C$2。 再例如，ADDRESS(77,300) 回傳 $KN$77。 可以使用其他函數（如 ROW 和 COLUMN 函數）為 ADDRESS 函數提供列號和欄號參數。 ',
        abstract: '以文字形式將參考值傳回工作表的單一儲存格',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/address-function',
            },
        ],
        functionParameter: {
            row_num: { name: '列號', detail: '一個數值，指定要使用儲存格的列號。 ' },
            column_num: { name: '欄號', detail: '一個數值，指定要在儲存格參考中使用的欄號。 ' },
            abs_num: { name: '引用型別', detail: '一個數值，指定要傳回的參考型別。 ' },
            a1: {
                name: '引用樣式',
                detail: '一個邏輯值，指定 A1 或 R1C1 引用樣式。 在 A1 樣式中，欄和列將分別按字母和數字順序新增標籤。 在 R1C1 引用樣式中，欄和列均會依數字順序新增標籤。 如果參數 A1 為 TRUE 或省略，則 ADDRESS 函數傳回 A1 樣式參考；如果為 FALSE，則 ADDRESS 函數傳回 R1C1 樣式參考。 ',
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
                url: 'https://support.microsoft.com/zh-tw/excel/functions/areas-function',
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
                url: 'https://support.microsoft.com/zh-tw/excel/functions/choose-function',
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
                url: 'https://support.microsoft.com/zh-tw/excel/functions/choosecols-function',
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
                url: 'https://support.microsoft.com/zh-tw/excel/functions/chooserows-function',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '包含要在新陣列中傳回之欄的陣列。' },
            rowNum1: { name: '列數1', detail: '要返回的第一列數。' },
            rowNum2: { name: '列數2', detail: '要返回的其他列數。' },
        },
    },
    COLUMN: {
        description: '傳回給定儲存格引用的欄號。 ',
        abstract: '傳回引用的欄號',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/column-function',
            },
        ],
        functionParameter: {
            reference: { name: '引用', detail: '要傳回其欄號的儲存格或儲存格範圍。 ' },
        },
    },
    COLUMNS: {
        description: '傳回陣列或引用的欄數。 ',
        abstract: '傳回引用中包含的欄數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/columns-function',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '要計算欄數的陣列、陣列公式或是對儲存格區域的參考。 ' },
        },
    },
    DROP: {
        description: '從陣列的開頭或結尾排除指定數量的行或列',
        abstract: '從陣列的開頭或結尾排除指定數量的行或列',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/drop-function',
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
                url: 'https://support.microsoft.com/zh-tw/excel/functions/expand-function',
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
                url: 'https://support.microsoft.com/zh-tw/excel/functions/filter-function',
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
                url: 'https://support.microsoft.com/zh-tw/excel/functions/formulatext-function',
            },
        ],
        functionParameter: {
            reference: { name: '引用', detail: '單元格或儲存格範圍的參照。' },
        },
    },
    GETPIVOTDATA: {
        description: 'GETPIVOTDATA 函數會傳回樞紐分析表中的可見資料。',
        abstract: 'GETPIVOTDATA 函數會傳回樞紐分析表中的可見資料。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/getpivotdata-function',
            },
        ],
        functionParameter: {
            dataField: { name: 'dataField', detail: '樞紐分析表欄位名稱，該欄位包含您要擷取的資料。 這必須以引號括住。 範例： =GETPIVOTDATA (「銷售」，A3) 。 這裡，「銷售」是我們想要取得的價值欄位。 由於未指定其他欄位，GETPIVOTDATA 會回傳總銷售金額。' },
            pivotTable: { name: 'pivotTable', detail: '這是樞紐分析表中之任何儲存格、儲存格範圍或已命名儲存格範圍的參照。 此資訊是用來判斷哪個樞紐分析表含有所要擷取的資料。 範例： =GETPIVOTDATA (「銷售」，A3) 。 這裡，A3 是樞紐分析表內的參考，並告訴公式該使用哪個樞紐分析表。' },
            field1: { name: 'field1', detail: '這是 1 至 126 對的欄位名稱和項目名稱，用以描述所要擷取的資料。 這些配對組合可以依任意次序排列。 欄位名稱以及非日期和數字的項目名稱都必須以引號括住。 範例： =GETPIVOTDATA (「銷售」、A3、「月份」、「三月」) 。 這裡，「月份」是欄位，「Mar」是項目。 若要指定欄位中的多個項目，請將它們包圍在捲括 (例如：{“Mar”， “Apr”}) 。 若是 OLAP 樞紐分析表 ，項目可以包含維度的來源名稱，也可以包含項目的來源名稱。 OLAP 樞紐分析表的欄位和項目配對看起來可能像這樣： "[產品]","[產品].[所有產品].[食物].[烘培食物]"' },
            item1: { name: 'item1', detail: '這是 1 至 126 對的欄位名稱和項目名稱，用以描述所要擷取的資料。 這些配對組合可以依任意次序排列。 欄位名稱以及非日期和數字的項目名稱都必須以引號括住。 範例： =GETPIVOTDATA (「銷售」、A3、「月份」、「三月」) 。 這裡，「月份」是欄位，「Mar」是項目。 若要指定欄位中的多個項目，請將它們包圍在捲括 (例如：{“Mar”， “Apr”}) 。 若是 OLAP 樞紐分析表 ，項目可以包含維度的來源名稱，也可以包含項目的來源名稱。 OLAP 樞紐分析表的欄位和項目配對看起來可能像這樣： "[產品]","[產品].[所有產品].[食物].[烘培食物]"' },
        },
    },
    HLOOKUP: {
        description: '在表格的首列或數值陣列中搜尋值，然後傳回表格或陣列中指定列的所在欄中的值。 ',
        abstract: '找出陣列的首列，並傳回指定儲存格的值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/hlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: '查找值',
                detail: '要尋找的值。 要尋找的值必須位於 table_array 參數中指定的儲存格區域的第一列中。 ',
            },
            tableArray: {
                name: '範圍',
                detail: 'VLOOKUP 在其中搜尋 lookup_value 和傳回值的儲存格區域。在其中尋找資料的資訊表。 使用區域或區域名稱的引用。 ',
            },
            rowIndexNum: {
                name: '列號',
                detail: '列號table_array符合值將傳回的列號（row_index_num為 1，則傳回 table_array 中的第一列值，row_index_num 2 傳回 table_array 中的第二列值）。 ',
            },
            rangeLookup: {
                name: '查詢類型',
                detail: '指定希望查找精確匹配值還是近似匹配值：預設近似匹配 - 1/TRUE, 完全匹配 - 0/FALSE',
            },
        },
    },
    HSTACK: {
        description: '水平並按順序附加陣列，以傳回較大的陣列。',
        abstract: '水平並按順序附加陣列，以傳回較大的陣列。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/hstack-function',
            },
        ],
        functionParameter: {
            array1: { name: '陣列', detail: '每個陣列參數的列數最大值。' },
            array2: { name: '陣列', detail: '每個陣列參數中所有欄位的總和。' },
        },
    },
    HYPERLINK: {
        description: '在儲存格內建立超連結。',
        abstract: '在儲存格內建立超連結。',
        links: [
            {
                title: '教導',
                url: 'https://support.google.com/docs/answer/3093313?hl=zh-Hant',
            },
        ],
        functionParameter: {
            url: { name: '網址', detail: '連結位置的完整網址 (括在引號中)，或是包含這類網址的儲存格參照。' },
            linkLabel: { name: '連結標籤', detail: '要顯示在儲存格中做為連結的文字，括在引號中，或者為包含此標籤的儲存格參照。' },
        },
    },
    IMAGE: {
        description: '從給定來源返回圖像',
        abstract: '從給定來源返回映像',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/image-function',
            },
        ],
        functionParameter: {
            source: { name: 'source', detail: '使用 「HTTP」 通訊協定之影像檔案的 URL 路徑。' },
            altText: { name: 'alt_text', detail: '描述協助工具影像的替代文字。' },
            sizing: { name: 'sizing', detail: '指定影像維度。' },
            height: { name: 'height', detail: '影像的自訂高度 (像素)。' },
            width: { name: 'width', detail: '影像的自訂寬度 (像素)。' },
        },
    },
    INDEX: {
        description: '傳回指定的列與欄交叉處的儲存格參考。 如果引用由不連續的選取區域組成，可以選擇某一選取區域。 ',
        abstract: '使用索引從引用或陣列中選擇值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/index-function',
            },
        ],
        functionParameter: {
            reference: { name: '引用', detail: '對一個或多個儲存格區域的引用。' },
            rowNum: { name: '列號', detail: '引用中某列的列號，函數從該列傳回一個引用。 ' },
            columnNum: { name: '欄號', detail: '引用中某欄的欄標，函數從該欄傳回一個引用。 ' },
            areaNum: { name: '區域編號', detail: '選擇要傳回列號和欄號的交叉點的參考區域。' },
        },
    },
    INDIRECT: {
        description: '傳回由文字字串指定的引用。 此函數立即對引用進行計算，並顯示其內容。 ',
        abstract: '傳回由文字值指定的參考',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/indirect-function',
            },
        ],
        functionParameter: {
            refText: { name: '引用文字', detail: '對包含 A1 樣式引用、R1C1 樣式引用、定義為引用的名稱或作為文字字串引用的儲存格的引用的引用。' },
            a1: { name: '引用類型', detail: '一個邏輯值，用於指定包含在儲存格引用文字中的引用的類型。' },
        },
    },
    LOOKUP: {
        description: '當需要查詢一行或一列並查找另一行或列中的相同位置的值時使用',
        abstract: '在向量或陣列中找出值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/lookup-function',
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
                url: 'https://support.microsoft.com/zh-tw/excel/functions/match-function',
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
                url: 'https://support.microsoft.com/zh-tw/excel/functions/offset-function',
            },
        ],
        functionParameter: {
            reference: { name: '引用', detail: '要基於偏移量的參考。' },
            rows: { name: '列數', detail: '需要左上角儲存格引用的向上或向下列數。' },
            cols: { name: '欄數', detail: '需要結果的左上角儲存格引用的從左到右的欄數。' },
            height: { name: '列高', detail: '需要傳回的引用的列高。列高必須為正數。' },
            width: { name: '欄寬', detail: '需要傳回的引用的欄寬。欄寬必須為正數。' },
        },
    },
    ROW: {
        description: '傳回給定儲存格引用的列號。 ',
        abstract: '傳回引用的列號',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/row-function',
            },
        ],
        functionParameter: {
            reference: { name: '引用', detail: '需要取得其列號的儲存格或儲存格區域。 ' },
        },
    },
    ROWS: {
        description: '傳回陣列或引用的列數。 ',
        abstract: '傳回引用中的列數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/rows-function',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '需要取得其列數的陣列、陣列公式或對儲存格區域的參考。 ' },
        },
    },
    RTD: {
        description: '從支援 COM 自動化的程式中擷取即時資料',
        abstract: '從支援 COM 自動化的程式中擷取即時資料',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/rtd-function',
            },
        ],
        functionParameter: {
            progId: { name: '程式識別碼', detail: '本機安裝之 COM 自動化增益集的程式識別碼。' },
            server: { name: '伺服器', detail: '執行增益集的伺服器名稱；本機伺服器請使用空字串。' },
            topic1: { name: '主題 1', detail: '指定要擷取之即時資料的第一個文字。' },
            topic2: { name: '主題 2', detail: '選用。指定即時資料的其他文字。' },
        },
    },
    SORT: {
        description: '將區域或陣列的內容排序',
        abstract: '將區域或陣列的內容排序',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/sort-function',
            },
        ],
        functionParameter: {
            array: { name: '陣列', detail: '要排序的範圍或陣列。' },
            sortIndex: { name: '排序索引', detail: '表示排序依據(按列或按欄)的數字。' },
            sortOrder: { name: '排序順序', detail: '表示所需排序順序的數字；1表示順序(預設)，-1表示降序。' },
            byCol: { name: '排序方向', detail: '表示所需排序方向的邏輯值；FALSE指依列排序(預設)，TRUE指依欄排序。' },
        },
    },
    SORTBY: {
        description: '根據對應區域或陣列中的值對區域或陣列的內容進行排序',
        abstract: '根據對應區域或陣列中的值對區域或陣列的內容進行排序',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/sortby-function',
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
                url: 'https://support.microsoft.com/zh-tw/excel/functions/take-function',
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
                url: 'https://support.microsoft.com/zh-tw/excel/functions/tocol-function',
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
                url: 'https://support.microsoft.com/zh-tw/excel/functions/torow-function',
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
                url: 'https://support.microsoft.com/zh-tw/excel/functions/transpose-function',
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
                url: 'https://support.microsoft.com/zh-tw/excel/functions/unique-function',
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
            '需要在表格或區域中按列查找內容時，請使用 VLOOKUP。 例如，按零件號碼找出汽車零件的價格，或根據員工 ID 尋找員工姓名。 ',
        abstract: '在陣列第一欄中查找，然後在列之間移動以返回儲存格的值',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/vlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: '查找值',
                detail: '要尋找的值。 要尋找的值必須位於 table_array 參數中指定的儲存格區域的第一欄。 ',
            },
            tableArray: {
                name: '範圍',
                detail: 'VLOOKUP 在其中搜尋 lookup_value 和傳回值的儲存格區域。 可以使用命名區域或表，並且可以在參數中使用名稱，而不是儲存格參考。 ',
            },
            colIndexNum: {
                name: '欄號',
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
                url: 'https://support.microsoft.com/zh-tw/excel/functions/vstack-function',
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
                url: 'https://support.microsoft.com/zh-tw/excel/functions/wrapcols-function',
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
                url: 'https://support.microsoft.com/zh-tw/excel/functions/wraprows-function',
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
                url: 'https://support.microsoft.com/zh-tw/excel/functions/xlookup-function',
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
                detail: '指定符合類型： 0 - 完全符合。 如果未找到，則傳回 #N/A。預設選項。 -1 - 完全匹配。 如果沒有找到，則傳回下一個較小的項。 1 - 完全匹配。 如果沒有找到，則傳回下一個較大的項。 2 - 萬用字元匹配，其中 *, ? 和 ~ 有特殊意義。 ',
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
                url: 'https://support.microsoft.com/zh-tw/excel/functions/xmatch-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: '找值', detail: '找值' },
            lookupArray: { name: '搜尋區域', detail: '要搜尋的陣列或區域' },
            matchMode: { name: '匹配類型', detail: '指定匹配類型：\n0 - 完全匹配（預設值）\n-1 - 完全匹配或下一個最小項\n1 - 完全匹配或下一個最大項\n2 - 萬用字元匹配，其中*, ? 和~ 有特殊意義。 ' },
            searchMode: { name: '搜尋類型', detail: '指定搜尋類型：\n1 - 搜尋從第一到最後一個（預設值）\n-1 - 搜尋從最後到第一個（反向搜尋）。 \n2 - 執行依賴 lookup_array 按升序排序的二進位搜尋。 如果未排序，將傳回無效結果。 \n2 - 執行依賴 lookup_array 按降序排序的二進位搜尋。 如果未排序，將傳回無效結果。 ' },
        },
    },
};

export default locale;
