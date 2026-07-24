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
    AND: {
        description: '如果其所有参数均为 TRUE，则返回 TRUE',
        abstract: '如果其所有参数均为 TRUE，则返回 TRUE',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/and-function',
            },
        ],
        functionParameter: {
            logical1: { name: '逻辑值 1', detail: '第一个想要测试且计算结果可为 TRUE 或 FALSE 的条件。' },
            logical2: { name: '逻辑值 2', detail: '其他想要测试且计算结果可为 TRUE 或 FALSE 的条件（最多 255 个条件）。' },
        },
    },
    BYCOL: {
        description: '将 LAMBDA 应用于每个列并返回结果数组',
        abstract: '将 LAMBDA 应用于每个列并返回结果数组',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/bycol-function',
            },
        ],
        functionParameter: {
            array: { name: '数组', detail: '用列分隔的数组。' },
            lambda: { name: 'lambda', detail: '将列作为单个参数并计算一个结果的 LAMBDA。 LAMBDA 接受单个参数：数组中的列。' },
        },
    },
    BYROW: {
        description: '将 LAMBDA 应用于每一行并返回结果数组',
        abstract: '将 LAMBDA 应用于每一行并返回结果数组',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/byrow-function',
            },
        ],
        functionParameter: {
            array: { name: '数组', detail: '用行分隔的数组。' },
            lambda: { name: 'lambda', detail: '将行作为单个参数并计算结果的 LAMBDA。 LAMBDA 接受单个参数：数组中的行。' },
        },
    },
    FALSE: {
        description: '返回逻辑值 FALSE。',
        abstract: '返回逻辑值 FALSE。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/false-function',
            },
        ],
        functionParameter: {},
    },
    IF: {
        description: '指定要执行的逻辑检测',
        abstract: '指定要执行的逻辑检测',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/if-function',
            },
        ],
        functionParameter: {
            logicalTest: { name: '布尔表达式', detail: '要测试的条件。' },
            valueIfTrue: { name: '如果值为 true', detail: 'logical_test 的结果为 TRUE 时，希望返回的值。' },
            valueIfFalse: { name: '如果值为 false', detail: 'logical_test 的结果为 FALSE 时，希望返回的值。' },
        },
    },
    IFERROR: {
        description: '如果公式的计算结果错误，则返回指定的值；否则返回公式的结果',
        abstract: '如果公式的计算结果错误，则返回指定的值；否则返回公式的结果',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/iferror-function',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: ' 检查是否存在错误的参数。' },
            valueIfError: { name: '错误时返回值', detail: '公式计算结果为错误时要返回的值。 评估以下错误类型：#N/A、#VALUE!、#REF!、#DIV/0!、#NUM!、#NAME? 或 #NULL!。' },
        },
    },
    IFNA: {
        description: '如果表达式的结果为 #N/A，则返回指定的值，否则返回表达式的结果',
        abstract: '如果表达式的结果为 #N/A，则返回指定的值，否则返回表达式的结果',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/ifna-function',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '检查是否存在 #N/A 错误值的参数。' },
            valueIfNa: { name: '如果为#N/A的值', detail: '如果公式结果为 #N/A 错误值，则返回的值。' },
        },
    },
    IFS: {
        description: '检查一个或多个条件是否满足，并返回第一个为 TRUE 的条件对应的值。',
        abstract: '检查一个或多个条件是否满足，并返回第一个为 TRUE 的条件对应的值。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/ifs-function',
            },
        ],
        functionParameter: {
            logicalTest1: { name: '条件1', detail: '要评估的第一个条件，可以是布尔值、数值、数组或指向这些值的引用。' },
            valueIfTrue1: { name: '值1', detail: '“条件1”为“TRUE”的情况下返回的值。' },
            logicalTest2: { name: '条件2', detail: '之前的条件为“FALSE”的情况下，要评估的其他条件。' },
            valueIfTrue2: { name: '值2', detail: '相应条件为“TRUE”的情况下返回的其他值。' },
        },
    },
    LAMBDA: {
        description:
            '使用 LAMBDA 函数创建可重用的自定义函数，并使用易记名称调用它们。 新函数在整个工作簿中可用，其调用类似本机 Excel 函数。',
        abstract: '创建自定义、可重用的函数，并通过友好名称调用它们',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/lambda-function',
            },
        ],
        functionParameter: {
            parameter: {
                name: '参数',
                detail: '要传递给函数的值，例如单元格引用、字符串或数字。 最多可以输入 253 个参数。 此参数可选。',
            },
            calculation: {
                name: '计算',
                detail: '要作为函数结果执行并返回的公式。 其必须为最后一个参数，且必须返回结果。 此参数是必需项。',
            },
        },
    },
    LET: {
        description: '将名称分配给计算结果',
        abstract: '将名称分配给计算结果',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/let-function',
            },
        ],
        functionParameter: {
            name1: { name: '名称1', detail: '要分配的第一个名称。必须以字母开头。不能是公式的输出，也不能与范围语法冲突。' },
            nameValue1: { name: '值1', detail: '分配给 name1 的值。' },
            calculationOrName2: { name: '计算或名称2', detail: '下列任一项：\n1.使用 LET 函数中的所有名称的计算。这必须是 LET 函数中的最后一个参数。\n2.分配给第二个 name_value 的第二个名称。如果指定了名称，则 name_value2 和 calculation_or_name3 是必需的。' },
            nameValue2: { name: '值2', detail: '分配给 calculation_or_name2 的值。' },
            calculationOrName3: { name: '计算或名称3', detail: '下列任一项：\n1.使用 LET 函数中的所有名称的计算。LET 函数中的最后一个参数必须是一个计算。\n2.分配给第三个 name_value 的第三个名称。如果指定了名称，则 name_value3 和 calculation_or_name4 是必需的。' },
        },
    },
    MAKEARRAY: {
        description: '通过应用 LAMBDA 返回指定行和列大小的计算数组',
        abstract: '通过应用 LAMBDA 返回指定行和列大小的计算数组',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/makearray-function',
            },
        ],
        functionParameter: {
            number1: { name: '行数', detail: '数组中的行数。 必须大于零' },
            number2: { name: '列数', detail: '数组中的列数。 必须大于零' },
            value3: {
                name: 'lambda',
                detail: '调用 LAMBDA 来创建数组。 LAMBDA 接受两个参数:row数组的行索引, col数组的列索引',
            },
        },
    },
    MAP: {
        description: '通过应用 LAMBDA 来创建新值，返回将数组中每个值映射到新值而形成的数组。',
        abstract: '通过应用 LAMBDA 来创建新值，返回将数组中每个值映射到新值而形成的数组。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/map-function',
            },
        ],
        functionParameter: {
            array1: { name: '数组1', detail: '要映射的数组1。' },
            array2: { name: '数组2', detail: '要映射的数组2。' },
            lambda: { name: 'lambda', detail: '一个 LAMBDA，必须是最后一个参数，并且必须具有传递的每个数组的参数。' },
        },
    },
    NOT: {
        description: '反转其参数的逻辑值。',
        abstract: '反转其参数的逻辑值。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/not-function',
            },
        ],
        functionParameter: {
            logical: { name: '逻辑表达式', detail: '要反转逻辑的条件，可评估为 TRUE 或 FALSE。' },
        },
    },
    OR: {
        description: '如果 OR 函数的任意参数计算为 TRUE，则其返回 TRUE；如果其所有参数均计算机为 FALSE，则返回 FALSE。',
        abstract: '如果任一参数为 TRUE，则返回 TRUE',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/or-function',
            },
        ],
        functionParameter: {
            logical1: { name: '逻辑表达式 1', detail: '第一个想要测试且计算结果可为 TRUE 或 FALSE 的条件。' },
            logical2: { name: '逻辑表达式 2', detail: '其他想要测试且计算结果可为 TRUE 或 FALSE 的条件（最多 255 个条件）。' },
        },
    },
    REDUCE: {
        description: '通过将 LAMBDA 应用于每个值并返回累加器中的总值，将数组减少为累积值',
        abstract: '通过将 LAMBDA 应用于每个值并返回累加器中的总值，将数组减少为累积值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/reduce-function',
            },
        ],
        functionParameter: {
            initialValue: { name: '起始值', detail: '设置累加器的起始值。' },
            array: { name: '数组', detail: '要减小的数组。' },
            lambda: { name: 'lambda', detail: '调用 LAMBDA 来减小数组。 LAMBDA 采用三个参数：1.该值累加后作为最终结果返回。2.数组中的当前值。3.应用于数组中每个元素的计算。' },
        },
    },
    SCAN: {
        description: '通过将 LAMBDA 应用于每个值来扫描数组，并返回具有每个中间值的数组',
        abstract: '通过将 LAMBDA 应用于每个值来扫描数组，并返回具有每个中间值的数组',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/scan-function',
            },
        ],
        functionParameter: {
            initialValue: { name: '起始值', detail: '设置累加器的起始值。' },
            array: { name: '数组', detail: '要扫描的数组。' },
            lambda: { name: 'lambda', detail: '调用 LAMBDA 来扫描数组。 LAMBDA 采用三个参数：1.该值累加后作为最终结果返回。2.数组中的当前值。3.应用于数组中每个元素的计算。' },
        },
    },
    SWITCH: {
        description: '将表达式与值列表进行比较，并返回与第一个匹配值对应的结果。如果没有匹配项，可以返回一个可选的默认值。',
        abstract: '将表达式与值列表进行比较，并返回与第一个匹配值对应的结果。如果没有匹配项，可以返回一个可选的默认值。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/switch-function',
            },
        ],
        functionParameter: {
            expression: { name: '表达式', detail: '表达式是将要与 值1…值126 进行比较的值（例如数字、日期或一些文本）。' },
            value1: { name: '值1', detail: '值N 是将要与表达式进行比较的值。' },
            result1: { name: '结果1', detail: '结果N 是当对应的值N 参数与表达式匹配时要返回的值。必须为每个对应的值N 参数提供结果N。' },
            defaultOrValue2: { name: '默认或值2', detail: '默认是在值N 表达式中找不到匹配项时要返回的值。默认参数通过没有对应的结果N 表达式来识别（参见示例）。默认必须是函数中的最后一个参数。' },
            result2: { name: '结果2', detail: '结果N 是当对应的值N 参数与表达式匹配时要返回的值。必须为每个对应的值N 参数提供结果N。' },
        },
    },
    TRUE: {
        description: '返回逻辑值 TRUE。',
        abstract: '返回逻辑值 TRUE。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/true-function',
            },
        ],
        functionParameter: {},
    },
    XOR: {
        description: '如果参数中计算结果为 TRUE 的数量为奇数，则返回 TRUE；如果计算结果为 TRUE 的数量为偶数，则返回 FALSE。',
        abstract: '如果参数中 TRUE 的数量为奇数，则返回 TRUE',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/xor-function',
            },
        ],
        functionParameter: {
            logical1: { name: '逻辑表达式 1', detail: '第一个想要测试且计算结果可为 TRUE 或 FALSE 的条件。' },
            logical2: { name: '逻辑表达式 2', detail: '其他想要测试且计算结果可为 TRUE 或 FALSE 的条件（最多 255 个条件）。' },
        },
    },
};

export default locale;
