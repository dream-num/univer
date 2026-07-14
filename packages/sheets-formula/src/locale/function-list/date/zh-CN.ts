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
        description: '采用三个单独的值并将它们合并为一个日期。',
        abstract: '返回特定日期的序列号',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/date-function',
            },
        ],
        functionParameter: {
            year: { name: '年', detail: '可以包含 1 到 4 位数字。 Excel 根据计算机使用的日期系统解释 year 参数。 默认情况下，Univer 使用 1900 日期系统，这意味着第一个日期是 1900 年 1 月 1 日。' },
            month: { name: '月', detail: '一个正整数或负整数，表示一年中从 1 月至 12 月（一月到十二月）的各个月。' },
            day: { name: '日', detail: '一个正整数或负整数，表示一月中从 1 日到 31 日的各天。' },
        },
    },
    DATEDIF: {
        description: '计算两个日期之间的天数、月数或年数。 此函数在用于计算年龄的公式中很有用。',
        abstract: '计算两个日期之间的天数、月数或年数。 此函数在用于计算年龄的公式中很有用。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/datedif-function',
            },
        ],
        functionParameter: {
            startDate: { name: '开始日期', detail: '表示给定时间段的第一个或开始日期的日期。 日期值有多种输入方式：带引号的文本字符串（例如 "2001/1/30"）、序列号（例如 36921，在商用 1900 日期系统时表示 2001 年 1 月 30 日）或其他公式或函数的结果（例如 DATEVALUE("2001/1/30")）。' },
            endDate: { name: '结束日期', detail: '用于表示时间段的最后一个（即结束）日期的日期。' },
            unit: { name: 'Unit', detail: '要返回的信息类型，其中： Unit****返回 “ Y ”期间内的完整年数。” M “期间内的完整月数。 D “时间段中的天数”。 MD “start_date和end_date中的天数差异。 忽略日期中的月份和年份。 重要： 我们不建议使用“MD”参数，因为存在已知的限制。 请参阅下面的已知问题部分。” YM “start_date和end_date月份之间的差异。 忽略日期的天数和年份“ YD ”start_date和end_date的天数之差。 忽略日期中的年份。' },
        },
    },
    DATEVALUE: {
        description: '将文本格式的日期转换为序列号。',
        abstract: '将文本格式的日期转换为序列号',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/datevalue-function',
            },
        ],
        functionParameter: {
            dateText: { name: '日期文本', detail: '表示 Excel 日期格式的日期的文本，或对包含表示 Excel 日期格式的日期的文本的单元格的引用。 例如，“1/30/2008”或“30-Jan-2008”是表示日期的引号内的文本字符串。\n使用 Microsoft Excel for Windows 中的默认日期系统， date_text 参数必须表示 1900 年 1 月 1 日至 9999 年 12 月 31 日的日期。 DATEVALUE 函数返回 #VALUE！ 如果 date_text 参数的值超出此范围，则为 error 值。\n如果省略参数 date_text 中的年份部分，则 DATEVALUE 函数会使用计算机内置时钟的当前年份。 参数 date_text 中的时间信息将被忽略。' },
        },
    },
    DAY: {
        description: '返回以序列数表示的某日期的天数。天数是介于 1 到 31 之间的整数。',
        abstract: '将序列号转换为月份日期',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/day-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: '日期序列号', detail: '要查找的日期。 应使用 DATE 函数输入日期，或者将日期作为其他公式或函数的结果输入。 例如，使用函数 DATE(2008,5,23) 输入 2008 年 5 月 23 日。' },
        },
    },
    DAYS: {
        description: '返回两个日期之间的天数',
        abstract: '返回两个日期之间的天数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/days-function',
            },
        ],
        functionParameter: {
            endDate: { name: '结束日期', detail: '是用于计算期间天数的起止日期。' },
            startDate: { name: '开始日期', detail: '是用于计算期间天数的起止日期。' },
        },
    },
    DAYS360: {
        description: '以一年 360 天为基准计算两个日期间的天数',
        abstract: '以一年 360 天为基准计算两个日期间的天数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/days360-function',
            },
        ],
        functionParameter: {
            startDate: { name: '开始日期', detail: '是用于计算期间天数的起止日期。' },
            endDate: { name: '结束日期', detail: '是用于计算期间天数的起止日期。' },
            method: { name: '方法', detail: '逻辑值，用于指定在计算中是采用美国方法 还是欧洲方法。' },
        },
    },
    EDATE: {
        description: '返回表示某个日期的序列号，该日期与指定日期 (start_date) 相隔（之前或之后）指示的月份数。 使用函数 EDATE 可以计算与发行日处于一月中同一天的到期日的日期。',
        abstract: '返回用于表示开始日期之前或之后月数的日期的序列号',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/edate-function',
            },
        ],
        functionParameter: {
            startDate: { name: '开始日期', detail: '一个代表开始日期的日期。 应使用 DATE 函数输入日期，或者将日期作为其他公式或函数的结果输入。 例如，使用函数 DATE(2008,5,23) 输入 2008 年 5 月 23 日。' },
            months: { name: '月份', detail: 'Start Date 之前或之后的月份数。 Months 为正值将生成未来日期；为负值将生成过去日期。' },
        },
    },
    EOMONTH: {
        description: '返回指定月数之前或之后的月份的最后一天的序列号',
        abstract: '返回指定月数之前或之后的月份的最后一天的序列号',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/eomonth-function',
            },
        ],
        functionParameter: {
            startDate: { name: '开始日期', detail: '表示开始日期的日期。' },
            months: { name: '月份数', detail: '开始日期之前或之后的月份数。' },
        },
    },
    EPOCHTODATE: {
        description: '将 Unix 纪元时间戳（以秒、毫秒或微秒为单位）转换为世界协调时间 (UTC) 的日期时间。',
        abstract: '将 Unix 纪元时间戳（以秒、毫秒或微秒为单位）转换为世界协调时间 (UTC) 的日期时间。',
        links: [
            {
                title: '教学',
                url: 'https://support.google.com/docs/answer/13193461?hl=zh-Hans',
            },
        ],
        functionParameter: {
            timestamp: { name: '时间戳', detail: '：Unix 纪元时间戳（以秒、毫秒或微秒为单位）。' },
            unit: { name: '时间单位', detail: '[可选：默认情况为 – 1 ]：表示时间戳的时间单位。' },
        },
    },
    HOUR: {
        description: '返回时间值的小时数。 小时数是介于 0 (12:00 A.M.) 到 23 (11:00 P.M.) 之间的整数。',
        abstract: '返回时间值的小时数。 小时数是介于 0 (12:00 A.M.) 到 23 (11:00 P.M.) 之间的整数。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/hour-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: '日期序列号', detail: '必填。 时间值，其中包含要查找的小时数。 时间值有多种输入方式：带引号的文本字符串（例如 "6:45 PM"）、十进制数（例如 0.78125 表示 6:45 PM）或其他公式或函数的结果（例如 TIMEVALUE("6:45 PM")）。' },
        },
    },
    ISOWEEKNUM: {
        description: '返回给定日期在全年中的 ISO 周数。',
        abstract: '返回给定日期在全年中的 ISO 周数。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/isoweeknum-function',
            },
        ],
        functionParameter: {
            date: { name: '日期', detail: '必填。 Date 是 Excel 用于日期和时间计算的日期时间代码。' },
        },
    },
    MINUTE: {
        description: '返回时间值中的分钟。 分钟是一个介于 0 到 59 之间的整数。',
        abstract: '返回时间值中的分钟。 分钟是一个介于 0 到 59 之间的整数。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/minute-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: '日期序列号', detail: '必填。 一个时间值，其中包含要查找的分钟。 时间值有多种输入方式：带引号的文本字符串（例如 "6:45 PM"）、十进制数（例如 0.78125 表示 6:45 PM）或其他公式或函数的结果（例如 TIMEVALUE("6:45 PM")）。' },
        },
    },
    MONTH: {
        description: '返回日期（以序列数表示）中的月份。 月份是介于 1（一月）到 12（十二月）之间的整数。',
        abstract: '返回日期（以序列数表示）中的月份。 月份是介于 1（一月）到 12（十二月）之间的整数。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/month-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: '日期序列号', detail: '必填。 要查找的月份的日期。 应使用 DATE 函数输入日期，或者将日期作为其他公式或函数的结果输入。 例如，使用函数 DATE(2008,5,23) 输入 2008 年 5 月 23 日。 如果 日期以文本形式输入 ，则会出现问题。' },
        },
    },
    NETWORKDAYS: {
        description: '返回参数 start_date 和 end_date 之间完整的工作日数值。 工作日不包括周末和专门指定的假期。 可以使用函数 NETWORKDAYS，根据某一特定时期内雇员的工作天数，计算其应计的报酬。',
        abstract: '返回参数 start_date 和 end_date 之间完整的工作日数值。 工作日不包括周末和专门指定的假期。 可以使用函数 NETWORKDAYS，根据某一特定时期内雇员的工作天数，计算其应计的报酬。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/networkdays-function',
            },
        ],
        functionParameter: {
            startDate: { name: '开始日期', detail: '必填。 一个代表开始日期的日期。' },
            endDate: { name: '终止日期', detail: '必填。 一个代表终止日期的日期。' },
            holidays: { name: '假期', detail: '选。 不在工作日历中的一个或多个日期所构成的可选区域，例如：省/市/自治区和国家/地区的法定假日以及其他非法定假日。 该列表可以是包含日期的单元格区域，或是表示日期的序列号的数组常量。' },
        },
    },
    NETWORKDAYS_INTL: {
        description: '返回两个日期之间的所有工作日数，使用参数指示哪些天是周末，以及有多少天是周末。 周末和任何指定为假期的日期不被视为工作日。',
        abstract: '返回两个日期之间的所有工作日数，使用参数指示哪些天是周末，以及有多少天是周末。 周末和任何指定为假期的日期不被视为工作日。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/networkdays-intl-function',
            },
        ],
        functionParameter: {
            startDate: { name: '开始日期', detail: '一个代表开始日期的日期。' },
            endDate: { name: '终止日期', detail: '一个代表终止日期的日期。' },
            weekend: { name: '周末', detail: '是一个用于指定周末日的周末数字或字符串。' },
            holidays: { name: '假期', detail: '不在工作日历中的一个或多个日期所构成的可选区域。' },
        },
    },
    NOW: {
        description: '返回当前日期和时间的序列号。 如果在输入该函数前，单元格格式为 “常规” ，Excel 会更改单元格格式，使其与区域设置的日期和时间格式匹配。 可以在功能区 “开始” 选项卡上的 “数字” 组中使用命令来更改日期和时间格式。',
        abstract: '返回当前日期和时间的序列号。 如果在输入该函数前，单元格格式为 “常规” ，Excel 会更改单元格格式，使其与区域设置的日期和时间格式匹配。 可以在功能区 “开始” 选项卡上的 “数字” 组中使用命令来更改日期和时间格式。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/now-function',
            },
        ],
        functionParameter: {
        },
    },
    SECOND: {
        description: '将序列号转换为秒',
        abstract: '将序列号转换为秒',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/second-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: '日期序列号', detail: '要查找的日期。 应使用 DATE 函数输入日期，或者将日期作为其他公式或函数的结果输入。 例如，使用函数 DATE(2008,5,23) 输入 2008 年 5 月 23 日。' },
        },
    },
    TIME: {
        description: '返回特定时间的序列号。',
        abstract: '返回特定时间的序列号',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/time-function',
            },
        ],
        functionParameter: {
            hour: { name: '小时', detail: '0（零）到 32767 之间的数字，代表小时。 任何大于 23 的值都会除以 24，余数将作为小时值。 例如，TIME(27,0,0) = TIME(3,0,0) = .125 或 3:00 AM。' },
            minute: { name: '分钟', detail: ' 0 到 32767 之间的数字，代表分钟。 任何大于 59 的值将转换为小时和分钟。 例如，TIME(0,750,0) = TIME(12,30,0) = .520833 或 12:30 PM。' },
            second: { name: '秒', detail: '0 到 32767 之间的数字，代表秒。 任何大于 59 的值将转换为小时、分钟和秒。 例如，TIME(0,0,2000) = TIME(0,33,22) = .023148 或 12:33:20 AM。' },
        },
    },
    TIMEVALUE: {
        description: '将文本格式的时间转换为序列号。',
        abstract: '将文本格式的时间转换为序列号',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/timevalue-function',
            },
        ],
        functionParameter: {
            timeText: { name: '时间文本', detail: '一个文本字符串，代表以任一时间格式表示的时间（例如，代表时间的具有引号的文本字符串 "6:45 PM" 和 "18:45"）。' },
        },
    },
    TO_DATE: {
        description: '将提供的数字转换为日期。',
        abstract: '将提供的数字转换为日期。',
        links: [
            {
                title: '教学',
                url: 'https://support.google.com/docs/answer/3094239?hl=zh-Hans',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: 'TO_DATE(A2)' },
        },
    },
    TODAY: {
        description: '返回今天日期的序列号',
        abstract: '返回今天日期的序列号',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/today-function',
            },
        ],
        functionParameter: {
        },
    },
    WEEKDAY: {
        description: '将序列号转换为星期日期',
        abstract: '将序列号转换为星期日期',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/weekday-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: '日期序列号', detail: '一个序列号，代表尝试查找的那一天的日期。' },
            returnType: { name: '返回值类型', detail: '用于确定返回值类型的数字。' },
        },
    },
    WEEKNUM: {
        description: '将序列号转换为代表该星期为一年中第几周的数字',
        abstract: '将序列号转换为代表该星期为一年中第几周的数字',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/weeknum-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: '日期序列号', detail: '代表一周中的日期。' },
            returnType: { name: '返回值类型', detail: '一数字，确定星期从哪一天开始。 默认值为 1。' },
        },
    },
    WORKDAY: {
        description: '返回指定的若干个工作日之前或之后的日期的序列号',
        abstract: '返回指定的若干个工作日之前或之后的日期的序列号',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/workday-function',
            },
        ],
        functionParameter: {
            startDate: { name: '开始日期', detail: '一个代表开始日期的日期。' },
            days: { name: '天数', detail: '开始日期之前或之后不含周末及节假日的天数。为正值将生成未来日期；为负值生成过去日期。' },
            holidays: { name: '假期', detail: '不在工作日历中的一个或多个日期所构成的可选区域。' },
        },
    },
    WORKDAY_INTL: {
        description: '返回日期在指定的工作日天数之前或之后的序列号（使用参数指明周末有几天并指明是哪几天）',
        abstract: '返回日期在指定的工作日天数之前或之后的序列号（使用参数指明周末有几天并指明是哪几天）',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/workday-intl-function',
            },
        ],
        functionParameter: {
            startDate: { name: '开始日期', detail: '一个代表开始日期的日期。' },
            days: { name: '天数', detail: '开始日期之前或之后不含周末及节假日的天数。为正值将生成未来日期；为负值生成过去日期。' },
            weekend: { name: '周末', detail: '是一个用于指定周末日的周末数字或字符串' },
            holidays: { name: '假期', detail: '不在工作日历中的一个或多个日期所构成的可选区域。' },
        },
    },
    YEAR: {
        description: '返回对应于某个日期的年份。 Year 作为 1900 - 9999 之间的整数返回。',
        abstract: '将序列号转换为年',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/year-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: '日期序列号', detail: '要查找的年份的日期。 应使用 DATE 函数输入日期，或者将日期作为其他公式或函数的结果输入。 例如，使用函数 DATE(2008,5,23) 输入 2008 年 5 月 23 日。' },
        },
    },
    YEARFRAC: {
        description: '返回代表 start_date 和 end_date 之间整天天数的年分数',
        abstract: '返回代表 start_date 和 end_date 之间整天天数的年分数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/yearfrac-function',
            },
        ],
        functionParameter: {
            startDate: { name: '开始日期', detail: '一个代表开始日期的日期。' },
            endDate: { name: '结束日期', detail: '一个代表终止日期的日期。' },
            basis: { name: '基准类型', detail: '要使用的日计数基准类型。' },
        },
    },
};

export default locale;
