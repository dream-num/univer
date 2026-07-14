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
    CELL: {
        description: '返回有关单元格格式、位置或内容的信息',
        abstract: '返回有关单元格格式、位置或内容的信息',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/cell-function',
            },
        ],
        functionParameter: {
            infoType: { name: '信息类型', detail: '一个文本值，指定要返回的单元格信息的类型。' },
            reference: { name: '引用', detail: '需要其相关信息的单元格。' },
        },
    },
    ERROR_TYPE: {
        description: '返回对应于错误类型的数字',
        abstract: '返回对应于错误类型的数字',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/error-type-function',
            },
        ],
        functionParameter: {
            errorVal: { name: '错误值', detail: '要查找其标识号的错误值。' },
        },
    },
    INFO: {
        description: '返回有关当前操作环境的信息',
        abstract: '返回有关当前操作环境的信息',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/info-function',
            },
        ],
        functionParameter: {
            typeText: { name: '类型文本', detail: '指定要返回的信息类型的文本。' },
        },
    },
    ISBETWEEN: {
        description: '检查所提供的数值是否介于其他两个数字之间（含端值，还是不含端值）。',
        abstract: '检查所提供的数值是否介于其他两个数字之间（含端值，还是不含端值）。',
        links: [
            {
                title: '教学',
                url: 'https://support.google.com/docs/answer/10538337?hl=zh-Hans',
            },
        ],
        functionParameter: {
            valueToCompare: { name: '比较值', detail: '要测试的值，看是否介于“lower_value”和“upper_value”之间。' },
            lowerValue: { name: '最小值', detail: '范围的下限值，“value_to_compare”的值可能落入这个范围内。' },
            upperValue: { name: '最大值', detail: '范围的上限值，“value_to_compare”的值可能落入这个范围内。' },
            lowerValueIsInclusive: { name: '包括最小值', detail: '用于指定值的范围是否包含“lower_value”。默认情况下为“TRUE”' },
            upperValueIsInclusive: { name: '包括最大值', detail: '用于指定值的范围是否包含“upper_value”。默认情况下为“TRUE”' },
        },
    },
    ISBLANK: {
        description: '这些函数统称为 IS 函数，此类函数可检验指定值并根据结果返回 TRUE 或 FALSE。 例如，如果参数 value 引用的是空单元格，则 ISBLANK 函数返回逻辑值 TRUE；否则，返回 FALSE。',
        abstract: '这些函数统称为 IS 函数，此类函数可检验指定值并根据结果返回 TRUE 或 FALSE。 例如，如果参数 value 引用的是空单元格，则 ISBLANK 函数返回逻辑值 TRUE；否则，返回 FALSE。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '必填。 指的是要测试的值。 参数 value 可以是空白（空单元格）、错误值、逻辑值、文本、数字、引用值，或者引用要测试的以上任意值的名称。' },
        },
    },
    ISDATE: {
        description: 'ISDATE 函数会返回某个值是否为日期。',
        abstract: 'ISDATE 函数会返回某个值是否为日期。',
        links: [
            {
                title: '教学',
                url: 'https://support.google.com/docs/answer/9061381?hl=zh-Hans',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '要验证其是否为日期的值。' },
        },
    },
    ISEMAIL: {
        description: '如需检查某个值是否为有效的邮箱，请使用 ISEMAIL 函数。此函数会检查该值是否符合常见的邮箱格式，但不会验证该地址是否实际存在。',
        abstract: '如需检查某个值是否为有效的邮箱，请使用 ISEMAIL 函数。此函数会检查该值是否符合常见的邮箱格式，但不会验证该地址是否实际存在。',
        links: [
            {
                title: '教学',
                url: 'https://support.google.com/docs/answer/3256503?hl=zh-Hans',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '要验证其是否为电子邮件地址的值。' },
        },
    },
    ISERR: {
        description: '这些函数统称为 IS 函数，此类函数可检验指定值并根据结果返回 TRUE 或 FALSE。 例如，如果参数 value 引用的是空单元格，则 ISBLANK 函数返回逻辑值 TRUE；否则，返回 FALSE。',
        abstract: '这些函数统称为 IS 函数，此类函数可检验指定值并根据结果返回 TRUE 或 FALSE。 例如，如果参数 value 引用的是空单元格，则 ISBLANK 函数返回逻辑值 TRUE；否则，返回 FALSE。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '必填。 指的是要测试的值。 参数 value 可以是空白（空单元格）、错误值、逻辑值、文本、数字、引用值，或者引用要测试的以上任意值的名称。' },
        },
    },
    ISERROR: {
        description: '这些函数统称为 IS 函数，此类函数可检验指定值并根据结果返回 TRUE 或 FALSE。 例如，如果参数 value 引用的是空单元格，则 ISBLANK 函数返回逻辑值 TRUE；否则，返回 FALSE。',
        abstract: '这些函数统称为 IS 函数，此类函数可检验指定值并根据结果返回 TRUE 或 FALSE。 例如，如果参数 value 引用的是空单元格，则 ISBLANK 函数返回逻辑值 TRUE；否则，返回 FALSE。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '必填。 指的是要测试的值。 参数 value 可以是空白（空单元格）、错误值、逻辑值、文本、数字、引用值，或者引用要测试的以上任意值的名称。' },
        },
    },
    ISEVEN: {
        description: '如果数字为偶数，则返回 TRUE',
        abstract: '如果数字为偶数，则返回 TRUE',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/iseven-function',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '要测试的值。如果值不是整数，将被截尾取整。' },
        },
    },
    ISFORMULA: {
        description: '如果有对包含公式的单元格的引用，则返回 TRUE',
        abstract: '如果有对包含公式的单元格的引用，则返回 TRUE',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/isformula-function',
            },
        ],
        functionParameter: {
            reference: { name: '引用', detail: '是对要测试的单元格的引用。' },
        },
    },
    ISLOGICAL: {
        description: '这些函数统称为 IS 函数，此类函数可检验指定值并根据结果返回 TRUE 或 FALSE。 例如，如果参数 value 引用的是空单元格，则 ISBLANK 函数返回逻辑值 TRUE；否则，返回 FALSE。',
        abstract: '这些函数统称为 IS 函数，此类函数可检验指定值并根据结果返回 TRUE 或 FALSE。 例如，如果参数 value 引用的是空单元格，则 ISBLANK 函数返回逻辑值 TRUE；否则，返回 FALSE。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '必填。 指的是要测试的值。 参数 value 可以是空白（空单元格）、错误值、逻辑值、文本、数字、引用值，或者引用要测试的以上任意值的名称。' },
        },
    },
    ISNA: {
        description: '这些函数统称为 IS 函数，此类函数可检验指定值并根据结果返回 TRUE 或 FALSE。 例如，如果参数 value 引用的是空单元格，则 ISBLANK 函数返回逻辑值 TRUE；否则，返回 FALSE。',
        abstract: '这些函数统称为 IS 函数，此类函数可检验指定值并根据结果返回 TRUE 或 FALSE。 例如，如果参数 value 引用的是空单元格，则 ISBLANK 函数返回逻辑值 TRUE；否则，返回 FALSE。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '必填。 指的是要测试的值。 参数 value 可以是空白（空单元格）、错误值、逻辑值、文本、数字、引用值，或者引用要测试的以上任意值的名称。' },
        },
    },
    ISNONTEXT: {
        description: '这些函数统称为 IS 函数，此类函数可检验指定值并根据结果返回 TRUE 或 FALSE。 例如，如果参数 value 引用的是空单元格，则 ISBLANK 函数返回逻辑值 TRUE；否则，返回 FALSE。',
        abstract: '这些函数统称为 IS 函数，此类函数可检验指定值并根据结果返回 TRUE 或 FALSE。 例如，如果参数 value 引用的是空单元格，则 ISBLANK 函数返回逻辑值 TRUE；否则，返回 FALSE。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '必填。 指的是要测试的值。 参数 value 可以是空白（空单元格）、错误值、逻辑值、文本、数字、引用值，或者引用要测试的以上任意值的名称。' },
        },
    },
    ISNUMBER: {
        description: '这些函数统称为 IS 函数，此类函数可检验指定值并根据结果返回 TRUE 或 FALSE。 例如，如果参数 value 引用的是空单元格，则 ISBLANK 函数返回逻辑值 TRUE；否则，返回 FALSE。',
        abstract: '这些函数统称为 IS 函数，此类函数可检验指定值并根据结果返回 TRUE 或 FALSE。 例如，如果参数 value 引用的是空单元格，则 ISBLANK 函数返回逻辑值 TRUE；否则，返回 FALSE。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '必填。 指的是要测试的值。 参数 value 可以是空白（空单元格）、错误值、逻辑值、文本、数字、引用值，或者引用要测试的以上任意值的名称。' },
        },
    },
    ISODD: {
        description: '如果数字为奇数，则返回 TRUE',
        abstract: '如果数字为奇数，则返回 TRUE',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/isodd-function',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '要测试的值。如果值不是整数，将被截尾取整。' },
        },
    },
    ISOMITTED: {
        description: '检查 LAMBDA 中的值是否缺失，并返回 TRUE 或 FALSE',
        abstract: '检查 LAMBDA 中的值是否缺失，并返回 TRUE 或 FALSE',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/isomitted-function',
            },
        ],
        functionParameter: {
            argument: { name: '参数', detail: '要检查是否被省略的值，例如 LAMBDA 参数。' },
        },
    },
    ISREF: {
        description: '这些函数统称为 IS 函数，此类函数可检验指定值并根据结果返回 TRUE 或 FALSE。 例如，如果参数 value 引用的是空单元格，则 ISBLANK 函数返回逻辑值 TRUE；否则，返回 FALSE。',
        abstract: '这些函数统称为 IS 函数，此类函数可检验指定值并根据结果返回 TRUE 或 FALSE。 例如，如果参数 value 引用的是空单元格，则 ISBLANK 函数返回逻辑值 TRUE；否则，返回 FALSE。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '必填。 指的是要测试的值。 参数 value 可以是空白（空单元格）、错误值、逻辑值、文本、数字、引用值，或者引用要测试的以上任意值的名称。' },
        },
    },
    ISTEXT: {
        description: '这些函数统称为 IS 函数，此类函数可检验指定值并根据结果返回 TRUE 或 FALSE。 例如，如果参数 value 引用的是空单元格，则 ISBLANK 函数返回逻辑值 TRUE；否则，返回 FALSE。',
        abstract: '这些函数统称为 IS 函数，此类函数可检验指定值并根据结果返回 TRUE 或 FALSE。 例如，如果参数 value 引用的是空单元格，则 ISBLANK 函数返回逻辑值 TRUE；否则，返回 FALSE。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '必填。 指的是要测试的值。 参数 value 可以是空白（空单元格）、错误值、逻辑值、文本、数字、引用值，或者引用要测试的以上任意值的名称。' },
        },
    },
    ISURL: {
        description: '检查某个值是否为有效网址。',
        abstract: '检查某个值是否为有效网址。',
        links: [
            {
                title: '教学',
                url: 'https://support.google.com/docs/answer/3256501?hl=zh-Hans',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '要验证其是否为网址的值。' },
        },
    },
    N: {
        description: '返回转换为数字的值',
        abstract: '返回转换为数字的值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/n-function',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '要转换的值。' },
        },
    },
    NA: {
        description: '返回错误值 #N/A',
        abstract: '返回错误值 #N/A',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/na-function',
            },
        ],
        functionParameter: {
        },
    },
    SHEET: {
        description: '返回引用工作表的工作表编号',
        abstract: '返回引用工作表的工作表编号',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/sheet-function',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '需要其工作表编号的工作表或引用的名称。 如果省略值，SHEET 返回包含 函数的工作表编号。' },
        },
    },
    SHEETS: {
        description: '返回工作簿中的工作表数',
        abstract: '返回工作簿中的工作表数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/sheets-function',
            },
        ],
        functionParameter: {
        },
    },
    TYPE: {
        description: '返回表示值的数据类型的数字',
        abstract: '返回表示值的数据类型的数字',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/type-function',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '可以为任意值，如数字、文本以及逻辑值等等。' },
        },
    },
};

export default locale;
