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
    DATE: {
        description: '採用三個單獨的值並將它們合併為一個日期。 ',
        abstract: '傳回特定日期的序號',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/date-function',
            },
        ],
        functionParameter: {
            year: { name: '年', detail: '可以包含 1 到 4 位數字。 Excel 會根據電腦使用的日期系統解釋 year 參數。 預設情況下，Univer 使用 1900 日期系統，這表示第一個日期是 1900 年 1 月 1 日。 ' },
            month: { name: '月', detail: '一個正整數或負整數，表示一年中從 1 月至 12 月（一月到十二月）的各個月。 ' },
            day: { name: '日', detail: '一個正整數或負整數，表示一月中從 1 日到 31 日的各天。 ' },
        },
    },
    DATEDIF: {
        description: '計算兩個日期之間的天數、月數或年數。 此函數在用於計算年齡的公式中很有用。 ',
        abstract: '計算兩個日期之間的天數、月數或年數。 此函數在用於計算年齡的公式中很有用。 ',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/datedif-function',
            },
        ],
        functionParameter: {
            startDate: { name: '開始日期', detail: '代表某一時期的第一個或起始日期的日期。 日期可以以引號內的文字字串輸入，例如「2001/1/30」 () ，序號 (例如36921（代表2001年1月30日），如果你使用1900日期系統) ，也可以作為其他公式或函式的結果，例如DATEVALUE (「2001/1/30」) ) (。' },
            endDate: { name: '結束日期', detail: '代表該時期的最後或結束日期的日期。' },
            unit: { name: 'Unit', detail: '您希望回傳的資訊類型，其中： 單位****回傳 「 Y 」「該期間的完整年數。」 M 「該期間內的完整月份數。」 D 「該期間的天數。」 MD：「 start_date和end_date天的差別。 日期中的月和年都會被忽略。 重要： 我們不建議使用「多元醫學博士」這個論點，因為已知有其限制。 請參考下方已知問題章節。」 YM 「start_date月和end_date月的差異。 日期的日期和年份被忽略」「 YD 」start_date日與end_date日的差異。 日期中的年會被忽略。' },
        },
    },
    DATEVALUE: {
        description: '將文字格式的日期轉換為序號。 ',
        abstract: '將文字格式的日期轉換為序號',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/datevalue-function',
            },
        ],
        functionParameter: {
            dateText: { name: '日期文字', detail: '表示 Excel 日期格式的日期的文字，或對包含表示 Excel 日期格式的日期的文字的儲存格的引用。 例如，「1/30/2008」或「30-Jan-2008」是表示日期的引號內的文字字串。 \n使用 Microsoft Excel for Windows 中的預設日期系統， date_text 參數必須表示 1900 年 1 月 1 日至 9999 年 12 月 31 日的日期。 DATEVALUE 函數回傳 #VALUE！ 如果 date_text 參數的值超出此範圍，則為 error 值。 \n如果省略參數 date_text 中的年份部分，則 DATEVALUE 函數會使用電腦內建時鐘的目前年份。 參數 date_text 中的時間資訊將被忽略。 ' },
        },
    },
    DAY: {
        description: '傳回以序列數表示的某日期的天數。天數是介於 1 到 31 之間的整數。 ',
        abstract: '將序號轉換為月份日期',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/day-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: '日期序號', detail: '要找的日期。 應使用 DATE 函數輸入日期，或將日期輸入為其他公式或函數的結果。 例如，使用函數 DATE(2008,5,23) 輸入 2008 年 5 月 23 日。 ' },
        },
    },
    DAYS: {
        description: '傳回兩個日期之間的天數',
        abstract: '傳回兩個日期之間的天數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/days-function',
            },
        ],
        functionParameter: {
            endDate: { name: '結束日期', detail: '為欲求其相距天數的兩個日期。' },
            startDate: { name: '開始日期', detail: '為欲求其相距天數的兩個日期。' },
        },
    },
    DAYS360: {
        description: '以一年 360 天為基準計算兩個日期間的天數',
        abstract: '以一年 360 天為基準計算兩個日期間的天數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/days360-function',
            },
        ],
        functionParameter: {
            startDate: { name: '開始日期', detail: '為欲求其相距天數的兩個日期。' },
            endDate: { name: '結束日期', detail: '為欲求其相距天數的兩個日期。' },
            method: { name: '方法', detail: '用來指定是否要使用美制 或歐制之計算方法的邏輯值。' },
        },
    },
    EDATE: {
        description: '傳回表示某個日期的序號，該日期與指定日期 (start_date) 相隔（之前或之後）所指示的月份數。 使用函數 EDATE 可以計算與發行日處於一月中同一天的到期日的日期。 ',
        abstract: '傳回用於表示開始日期之前或之後月數的日期的序號',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/edate-function',
            },
        ],
        functionParameter: {
            startDate: { name: '開始日期', detail: '一個代表開始日期的日期。 應使用 DATE 函數輸入日期，或將日期輸入為其他公式或函數的結果。 例如，使用函數 DATE(2008,5,23) 輸入 2008 年 5 月 23 日。 ' },
            months: { name: '月份數', detail: 'Start Date 之前或之後的月份數。 Months 為正值將產生未來日期；為負值將產生過去日期。 ' },
        },
    },
    EOMONTH: {
        description: '傳回指定月數之前或之後的月份的最後一天的序號',
        abstract: '傳回指定月數之前或之後的月份的最後一天的序號',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/eomonth-function',
            },
        ],
        functionParameter: {
            startDate: { name: '開始日期', detail: '此為代表開始日期的日期。' },
            months: { name: '月份數', detail: '開始日期之前或之後的月份數。' },
        },
    },
    EPOCHTODATE: {
        description: '將 Unix Epoch 紀元時間戳記 (以秒、毫秒或微秒為單位) 轉換為世界標準時間 (UTC) 的日期時間格式。',
        abstract: '將 Unix Epoch 紀元時間戳記 (以秒、毫秒或微秒為單位) 轉換為世界標準時間 (UTC) 的日期時間格式。',
        links: [
            {
                title: '教導',
                url: 'https://support.google.com/docs/answer/13193461?hl=zh-Hant',
            },
        ],
        functionParameter: {
            timestamp: { name: '時間戳記', detail: 'EPOCHTODATE(1655908429662,2)' },
            unit: { name: '時間單位', detail: 'EPOCHTODATE(1655906710)' },
        },
    },
    HOUR: {
        description: '將序號轉換為小時',
        abstract: '將序號轉換為小時',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/hour-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: '日期序號', detail: '要找的日期。 應使用 DATE 函數輸入日期，或將日期輸入為其他公式或函數的結果。 例如，使用函數 DATE(2008,5,23) 輸入 2008 年 5 月 23 日。 ' },
        },
    },
    ISOWEEKNUM: {
        description: '返回給定日期在全年中的 ISO 週數',
        abstract: '返回給定日期在全年中的 ISO 週數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/isoweeknum-function',
            },
        ],
        functionParameter: {
            date: { name: '日期', detail: '用於日期和時間計算的日期時間代碼。' },
        },
    },
    MINUTE: {
        description: '傳回時間值的分鐘數。 分鐘必須以整數指定，範圍從 0 到 59。',
        abstract: '傳回時間值的分鐘數。 分鐘必須以整數指定，範圍從 0 到 59。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/minute-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: '日期序號', detail: '必須。 這是包含要尋找之分鐘的時間。 時間可以在引號之內以文字字串輸入 (例如，"6:45 PM")，或以小數輸入 (例如 0.78125，表示 6:45 PM)，也能夠以其他公式或函數的結果輸入 (例如，TIMEVALUE("6:45 PM"))。' },
        },
    },
    MONTH: {
        description: '傳回以序號代表的日期月份。 月份數必須以整數指定，範圍從 1 (1 月) 到 12 (12 月)。',
        abstract: '傳回以序號代表的日期月份。 月份數必須以整數指定，範圍從 1 (1 月) 到 12 (12 月)。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/month-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: '日期序號', detail: '必須。 這是您要嘗試尋找的月份日期。 日期應該使用 DATE 函數來輸入，或是從其他公式或函數導出。 例如，使用 DATE(2008,5,23) 表示 2008 年 5 月 23 日。 如果 以文字格式輸入日期 ，則可能發生問題。' },
        },
    },
    NETWORKDAYS: {
        description: '傳回 start_date 與 end_date 間的全部工作日數。 工作天不包括週末與任何假日。 使用 NETWORKDAYS，根據某段期間內的工作天數來計算員工累積的酬勞。',
        abstract: '傳回 start_date 與 end_date 間的全部工作日數。 工作天不包括週末與任何假日。 使用 NETWORKDAYS，根據某段期間內的工作天數來計算員工累積的酬勞。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/networkdays-function',
            },
        ],
        functionParameter: {
            startDate: { name: '開始日期', detail: '必須。 這是代表開始日期的日期。' },
            endDate: { name: '結束日期', detail: '必須。 這是代表結束日期的日期。' },
            holidays: { name: '假日', detail: '可選的。 這是要從工作行事曆中排除之一個或多個日期的選擇性範圍，例如州假日和聯邦假日以及彈性假日。 此清單可以是包含日期的儲存格範圍，或是代表日期之序列值的陣列常數。' },
        },
    },
    NETWORKDAYS_INTL: {
        description: '使用參數指出哪幾天和多少天是週末，以傳回兩個日期之間的所有工作日數。 週末和指定為假日的任何日子都不視為工作日。',
        abstract: '使用參數指出哪幾天和多少天是週末，以傳回兩個日期之間的所有工作日數。 週末和指定為假日的任何日子都不視為工作日。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/networkdays-intl-function',
            },
        ],
        functionParameter: {
            startDate: { name: '開始日期', detail: '代表開始日期的日期。' },
            endDate: { name: '結束日期', detail: '代表結束日期的日期。' },
            weekend: { name: '週末', detail: '是指定何時是週末的數字或字串。' },
            holidays: { name: '假日', detail: '要從工作行事曆中排除之一個或多個日期的選擇性範圍。' },
        },
    },
    NOW: {
        description: '傳回目前日期和時間的序列值。 如果在輸入函數之前，儲存格格式為 [通用格式] ，則 Excel 會將儲存格格式變更為符合地區選項的日期與時間格式。 您可以使用功能區上 [常用] 索引標籤 [數值] 群組中的命令來變更儲存格的日期和時間格式。',
        abstract: '傳回目前日期和時間的序列值。 如果在輸入函數之前，儲存格格式為 [通用格式] ，則 Excel 會將儲存格格式變更為符合地區選項的日期與時間格式。 您可以使用功能區上 [常用] 索引標籤 [數值] 群組中的命令來變更儲存格的日期和時間格式。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/now-function',
            },
        ],
        functionParameter: {
        },
    },
    SECOND: {
        description: '傳回時間值的秒數。 秒是介於 0 (零) 到 59 之間的整數。',
        abstract: '傳回時間值的秒數。 秒是介於 0 (零) 到 59 之間的整數。',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/second-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: '日期序號', detail: '必須。 這是包含要尋找之秒鐘的時間。 時間可以在引號之內以文字字串輸入 (例如，"6:45 PM")，或以小數輸入 (例如 0.78125，表示 6:45 PM)，也能夠以其他公式或函數的結果輸入 (例如，TIMEVALUE("6:45 PM"))。' },
        },
    },
    TIME: {
        description: '傳回特定時間的序號。 ',
        abstract: '傳回特定時間的序號',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/time-function',
            },
        ],
        functionParameter: {
            hour: { name: '小時', detail: '0（零）到 32767 之間的數字，代表小時。 任何大於 23 的值都會除以 24，餘數將作為小時值。 例如，TIME(27,0,0) = TIME(3,0,0) = .125 或 3:00 AM。 ' },
            minute: { name: '分鐘', detail: ' 0 到 32767 之間的數字，代表分鐘。 任何大於 59 的值將轉換為小時和分鐘。 例如，TIME(0,750,0) = TIME(12,30,0) = .520833 或 12:30 PM。 ' },
            second: { name: '秒', detail: '0 到 32767 之間的數字，代表秒。 任何大於 59 的值將轉換為小時、分鐘和秒。 例如，TIME(0,0,2000) = TIME(0,33,22) = .023148 或 12:33:20 AM。 ' },
        },
    },
    TIMEVALUE: {
        description: '將文字格式的時間轉換為序號。 ',
        abstract: '將文字格式的時間轉換為序號',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/timevalue-function',
            },
        ],
        functionParameter: {
            timeText: { name: '時間文字', detail: '以任何一種時間格式表示的文字字串；例如，"6:45 PM" 和 "18:45"，引號中的文字字串表示時間。' },
        },
    },
    TO_DATE: {
        description: '將指定數字轉換成日期。',
        abstract: '將指定數字轉換成日期。',
        links: [
            {
                title: '教導',
                url: 'https://support.google.com/docs/answer/3094239?hl=zh-Hant',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '要轉換成日期的引數或儲存格參照。 日期 IF 值 is a number or a reference to a cell containing a numeric value, TO_DATE returns 值 converted to a date, 解讀中… 值 as number of days since 30 December, Negative values are interpreted as days before this date, and fractional values indicate time of day past midnight. IF 值 is not a number or a reference to a cell containing a numeric value, TO_DATE returns 值 without modification.' },
        },
    },
    TODAY: {
        description: '傳回今天日期的序號',
        abstract: '傳回今天日期的序號',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/today-function',
            },
        ],
        functionParameter: {
        },
    },
    WEEKDAY: {
        description: '將序號轉換為星期日期',
        abstract: '將序號轉換為星期日期',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/weekday-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: '日期序列值', detail: '代表要尋找之該天日期的序列值。' },
            returnType: { name: '傳回值類型', detail: '決定傳回值類型的數字。' },
        },
    },
    WEEKNUM: {
        description: '將序號轉換為代表該星期為一年中第幾週的數字',
        abstract: '將序號轉換為代表該星期為一年中第幾週的數字',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/weeknum-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: '日期序列值', detail: '一週中的日期。' },
            returnType: { name: '傳回值類型', detail: '決定一週從星期幾開始的數字。 預設值為 1。' },
        },
    },
    WORKDAY: {
        description: '傳回指定的若干個工作天之前或之後的日期的序號',
        abstract: '傳回指定的若干個工作天之前或之後的日期的序號',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/workday-function',
            },
        ],
        functionParameter: {
            startDate: { name: '開始日期', detail: '代表開始日期的日期。' },
            days: { name: '天數', detail: '開始日期之前或之後的非週末和非假日的天數。正值代表未來的日期；負值代表過去的日期。' },
            holidays: { name: '假日', detail: '要從工作行事曆中排除之一個或多個日期的選擇性範圍。' },
        },
    },
    WORKDAY_INTL: {
        description: '傳回日期在指定的工作日天數之前或之後的序號（使用參數指明週末有幾天並指明是哪幾天）',
        abstract: '返回日期在指定的工作日天數之前或之後的序號（使用參數指明週末有幾天並指明是哪幾天）',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/workday-intl-function',
            },
        ],
        functionParameter: {
            startDate: { name: '開始日期', detail: '代表開始日期的日期。' },
            days: { name: '天數', detail: '開始日期之前或之後的非週末和非假日的天數。正值代表未來的日期；負值代表過去的日期。' },
            weekend: { name: '週末', detail: '是指定何時是週末的數字或字串。' },
            holidays: { name: '假日', detail: '要從工作行事曆中排除之一個或多個日期的選擇性範圍。' },
        },
    },
    YEAR: {
        description: '傳回對應於某個日期的年份。 Year 以 1900 - 9999 之間的整數傳回。 ',
        abstract: '將序號轉換為年',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/year-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: '日期序號', detail: '要找的年份的日期。 應使用 DATE 函數輸入日期，或將日期輸入為其他公式或函數的結果。 例如，使用函數 DATE(2008,5,23) 輸入 2008 年 5 月 23 日。 ' },
        },
    },
    YEARFRAC: {
        description: '傳回代表 start_date 和 end_date 之間整天天數的年分數',
        abstract: '傳回代表 start_date 和 end_date 之間整天天數的年分數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/excel/functions/yearfrac-function',
            },
        ],
        functionParameter: {
            startDate: { name: '開始日期', detail: '代表開始日期的日期。' },
            endDate: { name: '結束日期', detail: '代表結束日期的日期。' },
            basis: { name: '基礎類型', detail: '要使用的日計數基礎類型。' },
        },
    },
};

export default locale;
