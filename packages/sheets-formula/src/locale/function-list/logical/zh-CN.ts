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
    AND: {
        description: '如果其所有参数均为 TRUE，则返回 TRUE',
        abstract: '如果其所有参数均为 TRUE，则返回 TRUE',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/and-%E5%87%BD%E6%95%B0-5f19b2e8-e1df-4408-897a-ce285a19e9d9',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    BYCOL: {
        description: '将 LAMBDA 应用于每个列并返回结果数组',
        abstract: '将 LAMBDA 应用于每个列并返回结果数组',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/bycol-%E5%87%BD%E6%95%B0-58463999-7de5-49ce-8f38-b7f7a2192bfb',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    BYROW: {
        description: '将 LAMBDA 应用于每一行并返回结果数组',
        abstract: '将 LAMBDA 应用于每一行并返回结果数组',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/byrow-%E5%87%BD%E6%95%B0-2e04c677-78c8-4e6b-8c10-a4602f2602bb',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FALSE: {
        description: '返回逻辑值 FALSE',
        abstract: '返回逻辑值 FALSE',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/false-%E5%87%BD%E6%95%B0-2d58dfa5-9c03-4259-bf8f-f0ae14346904',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IF: {
        description: '指定要执行的逻辑检测',
        abstract: '指定要执行的逻辑检测',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/if-%E5%87%BD%E6%95%B0-69aed7c9-4e8a-4755-a9bc-aa8bbff73be2',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IFERROR: {
        description: '如果公式的计算结果错误，则返回您指定的值；否则返回公式的结果',
        abstract: '如果公式的计算结果错误，则返回您指定的值；否则返回公式的结果',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/iferror-%E5%87%BD%E6%95%B0-c526fd07-caeb-47b8-8bb6-63f3e417f611',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IFNA: {
        description: '如果该表达式解析为 #N/A，则返回指定值；否则返回该表达式的结果',
        abstract: '如果该表达式解析为 #N/A，则返回指定值；否则返回该表达式的结果',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/ifna-%E5%87%BD%E6%95%B0-6626c961-a569-42fc-a49d-79b4951fd461',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    IFS: {
        description: ' 检查是否满足一个或多个条件，且是否返回与第一个 TRUE 条件对应的值。',
        abstract: ' 检查是否满足一个或多个条件，且是否返回与第一个 TRUE 条件对应的值。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/ifs-%E5%87%BD%E6%95%B0-36329a26-37b2-467c-972b-4a39bd951d45',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LAMBDA: {
        description: '创建自定义、可重用的函数，并通过友好名称调用它们',
        abstract: '创建自定义、可重用的函数，并通过友好名称调用它们',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/lambda-%E5%87%BD%E6%95%B0-bd212d27-1cd1-4321-a34a-ccbf254b8b67',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LET: {
        description: '将名称分配给计算结果',
        abstract: '将名称分配给计算结果',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/let-%E5%87%BD%E6%95%B0-34842dd8-b92b-4d3f-b325-b8b8f9908999',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    MAKEARRAY: {
        description: '通过应用 LAMBDA 返回指定行和列大小的计算数组',
        abstract: '通过应用 LAMBDA 返回指定行和列大小的计算数组',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/makearray-%E5%87%BD%E6%95%B0-b80da5ad-b338-4149-a523-5b221da09097',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    MAP: {
        description: '返回一个数组，该数组通过应用 LAMBDA 创建新值，将数组 () 映射到新值',
        abstract: '返回一个数组，该数组通过应用 LAMBDA 创建新值，将数组 () 映射到新值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/map-%E5%87%BD%E6%95%B0-48006093-f97c-47c1-bfcc-749263bb1f01',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    NOT: {
        description: '对其参数的逻辑求反',
        abstract: '对其参数的逻辑求反',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/not-%E5%87%BD%E6%95%B0-9cfc6011-a054-40c7-a140-cd4ba2d87d77',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    OR: {
        description: '如果任一参数为 TRUE，则返回 TRUE',
        abstract: '如果任一参数为 TRUE，则返回 TRUE',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/or-%E5%87%BD%E6%95%B0-7d17ad14-8700-4281-b308-00b131e22af0',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    REDUCE: {
        description: '通过将 LAMBDA 应用于每个值并返回累加器中的总值，将数组减少为累积值',
        abstract: '通过将 LAMBDA 应用于每个值并返回累加器中的总值，将数组减少为累积值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/reduce-%E5%87%BD%E6%95%B0-42e39910-b345-45f3-84b8-0642b568b7cb',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    SCAN: {
        description: '通过将 LAMBDA 应用于每个值来扫描数组，并返回具有每个中间值的数组',
        abstract: '通过将 LAMBDA 应用于每个值来扫描数组，并返回具有每个中间值的数组',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/scan-%E5%87%BD%E6%95%B0-d58dfd11-9969-4439-b2dc-e7062724de29',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    SWITCH: {
        description: '根据值列表计算表达式，并返回与第一个匹配值对应的结果。 如果不匹配，则可能返回可选默认值。',
        abstract: '根据值列表计算表达式，并返回与第一个匹配值对应的结果。 如果不匹配，则可能返回可选默认值。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/switch-%E5%87%BD%E6%95%B0-47ab33c0-28ce-4530-8a45-d532ec4aa25e',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TRUE: {
        description: '返回逻辑值 TRUE',
        abstract: '返回逻辑值 TRUE',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/true-%E5%87%BD%E6%95%B0-7652c6e3-8987-48d0-97cd-ef223246b3fb',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    XOR: {
        description: '返回所有参数的逻辑“异或”值',
        abstract: '返回所有参数的逻辑“异或”值',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/xor-%E5%87%BD%E6%95%B0-1548d4c2-5e47-4f77-9a92-0533bba14f37',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
};
