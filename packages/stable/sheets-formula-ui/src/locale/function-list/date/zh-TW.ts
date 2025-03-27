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
    DATE: {
        description: '採用三個單獨的值並將它們合併為一個日期。 ',
        abstract: '傳回特定日期的序號',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/date-%E5%87%BD%E6%95%B0-e36c0c8c-4104-49da-ab83-82328b832349',
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
                url: 'https://support.microsoft.com/zh-tw/office/datedif-%E5%87%BD%E6%95%B0-25dba1a4-2812-480b-84dd-8b32a451b35c',
            },
        ],
        functionParameter: {
            startDate: { name: '開始日期', detail: '代表指定期間的第一個或開始日期的日期。' },
            endDate: { name: '結束日期', detail: '代表期間最後一個或結束日期的日期。' },
            method: { name: '資訊類型', detail: '要傳回的資訊類型' },
        },
    },
    DATEVALUE: {
        description: '將文字格式的日期轉換為序號。 ',
        abstract: '將文字格式的日期轉換為序號',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/datevalue-%E5%87%BD%E6%95%B0-df8b07d4-7761-4a93-bc33-b7471bbff252',
            },
        ],
        functionParameter: {
            dateText: { name: '日期文本', detail: '表示 Excel 日期格式的日期的文本，或對包含表示 Excel 日期格式的日期的文本的單元格的引用。 例如，「1/30/2008」或「30-Jan-2008」是表示日期的引號內的文字字串。 \n使用 Microsoft Excel for Windows 中的預設日期系統， date_text 參數必須表示 1900 年 1 月 1 日至 9999 年 12 月 31 日的日期。 DATEVALUE 函數回傳 #VALUE！ 如果 date_text 參數的值超出此範圍，則為 error 值。 \n如果省略參數 date_text 中的年份部分，則 DATEVALUE 函數會使用電腦內建時鐘的目前年份。 參數 date_text 中的時間資訊將被忽略。 ' },
        },
    },
    DAY: {
        description: '傳回以序列數表示的某日期的天數。天數是介於 1 到 31 之間的整數。 ',
        abstract: '將序號轉換為月份日期',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/day-%E5%87%BD%E6%95%B0-8a7d1cbb-6c7d-4ba1-8aea-25c134d03101',
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
                url: 'https://support.microsoft.com/zh-tw/office/days-%E5%87%BD%E6%95%B0-57740535-d549-4395-8728-0f07bff0b9df',
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
                url: 'https://support.microsoft.com/zh-tw/office/days360-%E5%87%BD%E6%95%B0-b9a509fd-49ef-407e-94df-0cbda5718c2a',
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
                url: 'https://support.microsoft.com/zh-tw/office/edate-%E5%87%BD%E6%95%B0-3c920eb2-6e66-44e7-a1f5-753ae47ee4f5',
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
                url: 'https://support.microsoft.com/zh-tw/office/eomonth-%E5%87%BD%E6%95%B0-7314ffa1-2bc9-4005-9d66-f49db127d628',
            },
        ],
        functionParameter: {
            startDate: { name: '開始日期', detail: '此為代表開始日期的日期。' },
            months: { name: '月份數', detail: '開始日期之前或之後的月份數。' },
        },
    },
    EPOCHTODATE: {
        description: '將 Unix Epoch 紀元時間戳記 (以秒、毫秒或微秒為單位) 轉換為世界標準時間 (UTC) 的日期時間格式',
        abstract: '將 Unix Epoch 紀元時間戳記 (以秒、毫秒或微秒為單位) 轉換為世界標準時間 (UTC) 的日期時間格式',
        links: [
            {
                title: '教導',
                url: 'https://support.google.com/docs/answer/13193461?hl=zh-Hant&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            timestamp: { name: '時間戳記', detail: '以秒、毫秒或微秒為單位的 Unix Epoch 紀元時間戳記。' },
            unit: { name: '時間單位', detail: '時間戳記的表示單位。預設值是 1: \n1 表示以秒為單位。\n2 表示以毫秒為單位。\n3 表示以微秒為單位。' },
        },
    },
    HOUR: {
        description: '將序號轉換為小時',
        abstract: '將序號轉換為小時',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/hour-%E5%87%BD%E6%95%B0-a3afa879-86cb-4339-b1b5-2dd2d7310ac7',
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
                url: 'https://support.microsoft.com/zh-tw/office/isoweeknum-%E5%87%BD%E6%95%B0-1c2d0afe-d25b-4ab1-8894-8d0520e90e0e',
            },
        ],
        functionParameter: {
            date: { name: '日期', detail: '用於日期和時間計算的日期時間代碼。' },
        },
    },
    MINUTE: {
        description: '將序號轉換為分鐘',
        abstract: '將序號轉換為分鐘',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/minute-%E5%87%BD%E6%95%B0-af728df0-05c4-4b07-9eed-a84801a60589',
            },
        ],
        functionParameter: {
            serialNumber: { name: '日期序號', detail: '要找的日期。 應使用 DATE 函數輸入日期，或將日期輸入為其他公式或函數的結果。 例如，使用函數 DATE(2008,5,23) 輸入 2008 年 5 月 23 日。 ' },
        },
    },
    MONTH: {
        description: '傳回日期（以序列數表示）中的月份。 月份是介於 1（一月）到 12（十二月）之間的整數。 ',
        abstract: '將序號轉換為月',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/month-%E5%87%BD%E6%95%B0-579a2881-199b-48b2-ab90-ddba0eba86e8',
            },
        ],
        functionParameter: {
            serialNumber: { name: '日期序號', detail: '要找的月份的日期。 應使用 DATE 函數輸入日期，或將日期輸入為其他公式或函數的結果。 例如，使用函數 DATE(2008,5,23) 輸入 2008 年 5 月 23 日。 ' },
        },
    },
    NETWORKDAYS: {
        description: '傳回兩個日期間的完整工作日的天數',
        abstract: '返回兩個日期間的完整工作日的天數',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/networkdays-%E5%87%BD%E6%95%B0-48e717bf-a7a3-495f-969e-5005e3eb18e7',
            },
        ],
        functionParameter: {
            startDate: { name: '開始日期', detail: '代表開始日期的日期。' },
            endDate: { name: '結束日期', detail: '代表結束日期的日期。' },
            holidays: { name: '假日', detail: '要從工作行事曆中排除之一個或多個日期的選擇性範圍。' },
        },
    },
    NETWORKDAYS_INTL: {
        description: '傳回兩個日期之間的完整工作日的天數（使用參數指明週末有幾天並指明是哪幾天）',
        abstract: '傳回兩個日期之間的完整工作日的天數（使用參數指明週末有幾天並指明是哪幾天）',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/networkdays-intl-%E5%87%BD%E6%95%B0-a9b26239-4f20-46a1-9ab8-4e925bfd5e28',
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
        description: '傳回目前日期和時間的序號。 ',
        abstract: '傳回目前日期和時間的序號',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/now-%E5%87%BD%E6%95%B0-3337fd29-145a-4347-b2e6-2​​0c904739c46',
            },
        ],
        functionParameter: {
        },
    },
    SECOND: {
        description: '將序號轉換為秒',
        abstract: '將序號轉換為秒',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/second-%E5%87%BD%E6%95%B0-740d1cfc-553c-4099-b668-80eaa24e8af1',
            },
        ],
        functionParameter: {
            serialNumber: { name: '日期序號', detail: '要找的日期。 應使用 DATE 函數輸入日期，或將日期輸入為其他公式或函數的結果。 例如，使用函數 DATE(2008,5,23) 輸入 2008 年 5 月 23 日。 ' },
        },
    },
    TIME: {
        description: '傳回特定時間的序號。 ',
        abstract: '傳回特定時間的序號',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/time-%E5%87%BD%E6%95%B0-9a5aff99-8f7d-4611-845e-747d0b8d5457',
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
                url: 'https://support.microsoft.com/zh-tw/office/timevalue-%E5%87%BD%E6%95%B0-0b615c12-33d8-4431-bf3d-f3eb6d186645',
            },
        ],
        functionParameter: {
            timeText: { name: '時間文字', detail: '以任何一種時間格式表示的文字字串；例如，"6:45 PM" 和 "18:45"，引號中的文字字串表示時間。' },
        },
    },
    TO_DATE: {
        description: '將指定數字轉換成日期',
        abstract: '將指定數字轉換成日期',
        links: [
            {
                title: '教導',
                url: 'https://support.google.com/docs/answer/3094239?hl=zh-Hant&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '要轉換成日期的引數或儲存格參照。' },
        },
    },
    TODAY: {
        description: '傳回今天日期的序號',
        abstract: '傳回今天日期的序號',
        links: [
            {
                title: '教導',
                url: 'https://support.microsoft.com/zh-tw/office/today-%E5%87%BD%E6%95%B0-5eb3078d-a82c-4736-8930-2f51a028fdd9',
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
                url: 'https://support.microsoft.com/zh-tw/office/weekday-%E5%87%BD%E6%95%B0-60e44483-2ed1-439f-8bd0-e404c190949a',
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
                url: 'https://support.microsoft.com/zh-tw/office/weeknum-%E5%87%BD%E6%95%B0-e5c43a03-b4ab-426c-b411-b18c13c75340',
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
                url: 'https://support.microsoft.com/zh-tw/office/workday-%E5%87%BD%E6%95%B0-f764a5b7-05fc-4494-9486-60d494efbf33',
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
                url: 'https://support.microsoft.com/zh-tw/office/workday-intl-%E5%87%BD%E6%95%B0-a378391c-9ba7-4678-8a39-39611a9bf81d',
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
                url: 'https://support.microsoft.com/zh-tw/office/year-%E5%87%BD%E6%95%B0-c64f017a-1354-490d-981f-578e8ec8d3b9',
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
                url: 'https://support.microsoft.com/zh-tw/office/yearfrac-%E5%87%BD%E6%95%B0-3844141e-c76d-4143-82b6-208454ddc6a8',
            },
        ],
        functionParameter: {
            startDate: { name: '开始日期', detail: '代表開始日期的日期。' },
            endDate: { name: '结束日期', detail: '代表結束日期的日期。' },
            basis: { name: '基礎類型', detail: '要使用的日計數基礎類型。' },
        },
    },
};
