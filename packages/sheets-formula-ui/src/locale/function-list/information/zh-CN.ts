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
    CELL: {
        description: '返回有关单元格格式、位置或内容的信息',
        abstract: '返回有关单元格格式、位置或内容的信息',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/cell-%E5%87%BD%E6%95%B0-51bd39a5-f338-4dbe-a33f-955d67c2b2cf',
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
                url: 'https://support.microsoft.com/zh-cn/office/error-type-%E5%87%BD%E6%95%B0-10958677-7c8d-44f7-ae77-b9a9ee6eefaa',
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
                url: 'https://support.microsoft.com/zh-cn/office/info-%E5%87%BD%E6%95%B0-725f259a-0e4b-49b3-8b52-58815c69acae',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ISBETWEEN: {
        description: '检查所提供的数值是否介于其他两个数字之间',
        abstract: '检查所提供的数值是否介于其他两个数字之间',
        links: [
            {
                title: '教学',
                url: 'https://support.google.com/docs/answer/10538337?hl=zh-Hans&sjid=7730820672019533290-AP',
            },
        ],
        functionParameter: {
            valueToCompare: { name: '比较值', detail: '要测试的值，看是否介于“最小值”和“最大值”之间。' },
            lowerValue: { name: '最小值', detail: '范围的下限值，“比较值”的值可能落入这个范围内。' },
            upperValue: { name: '最大值', detail: '范围的上限值，“比较值”的值可能落入这个范围内。' },
            lowerValueIsInclusive: { name: '包括最小值', detail: '用于指定值的范围是否包含“最小值”。默认情况下为“TRUE”。' },
            upperValueIsInclusive: { name: '包括最大值', detail: '用于指定值的范围是否包含“最大值”。默认情况下为“TRUE”。' },
        },
    },
    ISBLANK: {
        description: '如果值为空，则返回 TRUE',
        abstract: '如果值为空，则返回 TRUE',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/is-%E5%87%BD%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '指的是要测试的值。参数值可以是空白（空单元格）、错误值、逻辑值、文本、数字、引用值，或者引用要测试的以上任意值的名称。' },
        },
    },
    ISDATE: {
        description: '返回某个值是否为日期',
        abstract: '返回某个值是否为日期',
        links: [
            {
                title: '教学',
                url: 'https://support.google.com/docs/answer/9061381?hl=zh-Hans&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '要验证其是否为日期的值。' },
        },
    },
    ISEMAIL: {
        description: '检查输入的值是否为有效的电子邮件地址',
        abstract: '检查输入的值是否为有效的电子邮件地址',
        links: [
            {
                title: '教学',
                url: 'https://support.google.com/docs/answer/3256503?hl=zh-Hans&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '要验证其是否为电子邮件地址的值。' },
        },
    },
    ISERR: {
        description: '如果值为除 #N/A 以外的任何错误值，则返回 TRUE',
        abstract: '如果值为除 #N/A 以外的任何错误值，则返回 TRUE',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/is-%E5%87%BD%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '指的是要测试的值。参数值可以是空白（空单元格）、错误值、逻辑值、文本、数字、引用值，或者引用要测试的以上任意值的名称。' },
        },
    },
    ISERROR: {
        description: '如果值为任何错误值，则返回 TRUE',
        abstract: '如果值为任何错误值，则返回 TRUE',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/is-%E5%87%BD%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '指的是要测试的值。参数值可以是空白（空单元格）、错误值、逻辑值、文本、数字、引用值，或者引用要测试的以上任意值的名称。' },
        },
    },
    ISEVEN: {
        description: '如果数字为偶数，则返回 TRUE',
        abstract: '如果数字为偶数，则返回 TRUE',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/iseven-%E5%87%BD%E6%95%B0-aa15929a-d77b-4fbb-92f4-2f479af55356',
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
                url: 'https://support.microsoft.com/zh-cn/office/isformula-%E5%87%BD%E6%95%B0-e4d1355f-7121-4ef2-801e-3839bfd6b1e5',
            },
        ],
        functionParameter: {
            reference: { name: '引用', detail: '是对要测试的单元格的引用。' },
        },
    },
    ISLOGICAL: {
        description: '如果值为逻辑值，则返回 TRUE',
        abstract: '如果值为逻辑值，则返回 TRUE',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/is-%E5%87%BD%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '指的是要测试的值。参数值可以是空白（空单元格）、错误值、逻辑值、文本、数字、引用值，或者引用要测试的以上任意值的名称。' },
        },
    },
    ISNA: {
        description: '如果值为错误值 #N/A，则返回 TRUE',
        abstract: '如果值为错误值 #N/A，则返回 TRUE',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/is-%E5%87%BD%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '指的是要测试的值。参数值可以是空白（空单元格）、错误值、逻辑值、文本、数字、引用值，或者引用要测试的以上任意值的名称。' },
        },
    },
    ISNONTEXT: {
        description: '如果值不是文本，则返回 TRUE',
        abstract: '如果值不是文本，则返回 TRUE',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/is-%E5%87%BD%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '指的是要测试的值。参数值可以是空白（空单元格）、错误值、逻辑值、文本、数字、引用值，或者引用要测试的以上任意值的名称。' },
        },
    },
    ISNUMBER: {
        description: '如果值为数字，则返回 TRUE',
        abstract: '如果值为数字，则返回 TRUE',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/is-%E5%87%BD%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '指的是要测试的值。参数值可以是空白（空单元格）、错误值、逻辑值、文本、数字、引用值，或者引用要测试的以上任意值的名称。' },
        },
    },
    ISODD: {
        description: '如果数字为奇数，则返回 TRUE',
        abstract: '如果数字为奇数，则返回 TRUE',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/isodd-%E5%87%BD%E6%95%B0-1208a56d-4f10-4f44-a5fc-648cafd6c07a',
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
                url: 'https://support.microsoft.com/zh-cn/office/isomitted-%E5%87%BD%E6%95%B0-831d6fbc-0f07-40c4-9c5b-9c73fd1d60c1',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ISREF: {
        description: '如果值为引用值，则返回 TRUE',
        abstract: '如果值为引用值，则返回 TRUE',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/is-%E5%87%BD%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '指的是要测试的值。参数值可以是空白（空单元格）、错误值、逻辑值、文本、数字、引用值，或者引用要测试的以上任意值的名称。' },
        },
    },
    ISTEXT: {
        description: '如果值为文本，则返回 TRUE',
        abstract: '如果值为文本，则返回 TRUE',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/is-%E5%87%BD%E6%95%B0-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '指的是要测试的值。参数值可以是空白（空单元格）、错误值、逻辑值、文本、数字、引用值，或者引用要测试的以上任意值的名称。' },
        },
    },
    ISURL: {
        description: '检查某个值是否为有效网址',
        abstract: '检查某个值是否为有效网址',
        links: [
            {
                title: '教学',
                url: 'https://support.google.com/docs/answer/3256501?hl=zh-Hans&sjid=7312884847858065932-AP',
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
                url: 'https://support.microsoft.com/zh-cn/office/n-%E5%87%BD%E6%95%B0-a624cad1-3635-4208-b54a-29733d1278c9',
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
                url: 'https://support.microsoft.com/zh-cn/office/na-%E5%87%BD%E6%95%B0-5469c2d1-a90c-4fb5-9bbc-64bd9bb6b47c',
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
                url: 'https://support.microsoft.com/zh-cn/office/sheet-%E5%87%BD%E6%95%B0-44718b6f-8b87-47a1-a9d6-b701c06cff24',
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
                url: 'https://support.microsoft.com/zh-cn/office/sheets-%E5%87%BD%E6%95%B0-770515eb-e1e8-45ce-8066-b557e5e4b80b',
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
                url: 'https://support.microsoft.com/zh-cn/office/type-%E5%87%BD%E6%95%B0-45b4e688-4bc3-48b3-a105-ffa892995899',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '可以为任意值，如数字、文本以及逻辑值等等。' },
        },
    },
};
