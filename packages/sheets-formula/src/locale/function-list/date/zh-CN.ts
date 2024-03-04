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
    DATE: {
        description: '采用三个单独的值并将它们合并为一个日期。',
        abstract: '返回特定日期的序列号',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/date-%E5%87%BD%E6%95%B0-e36c0c8c-4104-49da-ab83-82328b832349',
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
                url: 'https://support.microsoft.com/zh-cn/office/datedif-%E5%87%BD%E6%95%B0-25dba1a4-2812-480b-84dd-8b32a451b35c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    DATEVALUE: {
        description: '将文本格式的日期转换为序列号',
        abstract: '将文本格式的日期转换为序列号',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/datevalue-%E5%87%BD%E6%95%B0-df8b07d4-7761-4a93-bc33-b7471bbff252',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    DAY: {
        description: '返回以序列数表示的某日期的天数。天数是介于 1 到 31 之间的整数。',
        abstract: '将序列号转换为月份日期',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/day-%E5%87%BD%E6%95%B0-8a7d1cbb-6c7d-4ba1-8aea-25c134d03101',
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
                url: 'https://support.microsoft.com/zh-cn/office/days-%E5%87%BD%E6%95%B0-57740535-d549-4395-8728-0f07bff0b9df',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    DAYS360: {
        description: '以一年 360 天为基准计算两个日期间的天数',
        abstract: '以一年 360 天为基准计算两个日期间的天数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/days360-%E5%87%BD%E6%95%B0-b9a509fd-49ef-407e-94df-0cbda5718c2a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    EDATE: {
        description: '返回表示某个日期的序列号，该日期与指定日期 (start_date) 相隔（之前或之后）指示的月份数。 使用函数 EDATE 可以计算与发行日处于一月中同一天的到期日的日期。',
        abstract: '返回用于表示开始日期之前或之后月数的日期的序列号',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/edate-%E5%87%BD%E6%95%B0-3c920eb2-6e66-44e7-a1f5-753ae47ee4f5',
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
                url: 'https://support.microsoft.com/zh-cn/office/eomonth-%E5%87%BD%E6%95%B0-7314ffa1-2bc9-4005-9d66-f49db127d628',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    HOUR: {
        description: '将序列号转换为小时',
        abstract: '将序列号转换为小时',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/hour-%E5%87%BD%E6%95%B0-a3afa879-86cb-4339-b1b5-2dd2d7310ac7',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ISOWEEKNUM: {
        description: '返回给定日期在全年中的 ISO 周数',
        abstract: '返回给定日期在全年中的 ISO 周数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/isoweeknum-%E5%87%BD%E6%95%B0-1c2d0afe-d25b-4ab1-8894-8d0520e90e0e',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    MINUTE: {
        description: '将序列号转换为分钟',
        abstract: '将序列号转换为分钟',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/minute-%E5%87%BD%E6%95%B0-af728df0-05c4-4b07-9eed-a84801a60589',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    MONTH: {
        description: '返回日期（以序列数表示）中的月份。 月份是介于 1（一月）到 12（十二月）之间的整数。',
        abstract: '将序列号转换为月',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/month-%E5%87%BD%E6%95%B0-579a2881-199b-48b2-ab90-ddba0eba86e8',
            },
        ],
        functionParameter: {
            serialNumber: { name: '日期序列号', detail: '要查找的月份的日期。 应使用 DATE 函数输入日期，或者将日期作为其他公式或函数的结果输入。 例如，使用函数 DATE(2008,5,23) 输入 2008 年 5 月 23 日。' },
        },
    },
    NETWORKDAYS: {
        description: '返回两个日期间的完整工作日的天数',
        abstract: '返回两个日期间的完整工作日的天数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/networkdays-%E5%87%BD%E6%95%B0-48e717bf-a7a3-495f-969e-5005e3eb18e7',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    NETWORKDAYS_INTL: {
        description: '返回两个日期之间的完整工作日的天数（使用参数指明周末有几天并指明是哪几天）',
        abstract: '返回两个日期之间的完整工作日的天数（使用参数指明周末有几天并指明是哪几天）',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/networkdays-intl-%E5%87%BD%E6%95%B0-a9b26239-4f20-46a1-9ab8-4e925bfd5e28',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    NOW: {
        description: '返回当前日期和时间的序列号',
        abstract: '返回当前日期和时间的序列号',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/now-%E5%87%BD%E6%95%B0-3337fd29-145a-4347-b2e6-20c904739c46',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    SECOND: {
        description: '将序列号转换为秒',
        abstract: '将序列号转换为秒',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/second-%E5%87%BD%E6%95%B0-740d1cfc-553c-4099-b668-80eaa24e8af1',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TIME: {
        description: '返回特定时间的序列号',
        abstract: '返回特定时间的序列号',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/time-%E5%87%BD%E6%95%B0-9a5aff99-8f7d-4611-845e-747d0b8d5457',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TIMEVALUE: {
        description: '将文本格式的时间转换为序列号',
        abstract: '将文本格式的时间转换为序列号',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/timevalue-%E5%87%BD%E6%95%B0-0b615c12-33d8-4431-bf3d-f3eb6d186645',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TODAY: {
        description: '返回今天日期的序列号',
        abstract: '返回今天日期的序列号',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/today-%E5%87%BD%E6%95%B0-5eb3078d-a82c-4736-8930-2f51a028fdd9',
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
                url: 'https://support.microsoft.com/zh-cn/office/weekday-%E5%87%BD%E6%95%B0-60e44483-2ed1-439f-8bd0-e404c190949a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    WEEKNUM: {
        description: '将序列号转换为代表该星期为一年中第几周的数字',
        abstract: '将序列号转换为代表该星期为一年中第几周的数字',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/weeknum-%E5%87%BD%E6%95%B0-e5c43a03-b4ab-426c-b411-b18c13c75340',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    WORKDAY: {
        description: '返回指定的若干个工作日之前或之后的日期的序列号',
        abstract: '返回指定的若干个工作日之前或之后的日期的序列号',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/workday-%E5%87%BD%E6%95%B0-f764a5b7-05fc-4494-9486-60d494efbf33',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    WORKDAY_INTL: {
        description: '返回日期在指定的工作日天数之前或之后的序列号（使用参数指明周末有几天并指明是哪几天）',
        abstract: '返回日期在指定的工作日天数之前或之后的序列号（使用参数指明周末有几天并指明是哪几天）',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/workday-intl-%E5%87%BD%E6%95%B0-a378391c-9ba7-4678-8a39-39611a9bf81d',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    YEAR: {
        description: '返回对应于某个日期的年份。 Year 作为 1900 - 9999 之间的整数返回。',
        abstract: '将序列号转换为年',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/year-%E5%87%BD%E6%95%B0-c64f017a-1354-490d-981f-578e8ec8d3b9',
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
                url: 'https://support.microsoft.com/zh-cn/office/yearfrac-%E5%87%BD%E6%95%B0-3844141e-c76d-4143-82b6-208454ddc6a8',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
};
