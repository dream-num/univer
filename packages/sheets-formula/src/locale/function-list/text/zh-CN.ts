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
    ASC: {
        description: '将字符串中的全角（双字节）英文字母或片假名更改为半角（单字节）字符',
        abstract: '将字符串中的全角（双字节）英文字母或片假名更改为半角（单字节）字符',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/asc-%E5%87%BD%E6%95%B0-0b6abf1c-c663-4004-a964-ebc00b723266',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    ARRAYTOTEXT: {
        description: 'ARRAYTOTEXT 函数返回任意指定区域内的文本值的数组。',
        abstract: 'ARRAYTOTEXT 函数返回任意指定区域内的文本值的数组。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/arraytotext-%E5%87%BD%E6%95%B0-9cdcad46-2fa5-4c6b-ac92-14e7bc862b8b',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    BAHTTEXT: {
        description: '使用 ß（泰铢）货币格式将数字转换为文本',
        abstract: '使用 ß（泰铢）货币格式将数字转换为文本',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/bahttext-%E5%87%BD%E6%95%B0-5ba4d0b4-abd3-4325-8d22-7a92d59aab9c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CHAR: {
        description: '返回由代码数字指定的字符',
        abstract: '返回由代码数字指定的字符',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/char-%E5%87%BD%E6%95%B0-bbd249c8-b36e-4a91-8017-1c133f9b837a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CLEAN: {
        description: '删除文本中所有非打印字符',
        abstract: '删除文本中所有非打印字符',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/clean-%E5%87%BD%E6%95%B0-26f3d7c5-475f-4a9c-90e5-4b8ba987ba41',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CODE: {
        description: '返回文本字符串中第一个字符的数字代码',
        abstract: '返回文本字符串中第一个字符的数字代码',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/code-%E5%87%BD%E6%95%B0-c32b692b-2ed0-4a04-bdd9-75640144b928',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CONCAT: {
        description: '将多个区域和/或字符串的文本组合起来，但不提供分隔符或 IgnoreEmpty 参数。',
        abstract: '将多个区域和/或字符串的文本组合起来，但不提供分隔符或 IgnoreEmpty 参数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/concat-%E5%87%BD%E6%95%B0-9b1a9a3f-94ff-41af-9736-694cbd6b4ca2',
            },
        ],
        functionParameter: {
            text1: { name: '文本 1', detail: '要联接的文本项。 字符串或字符串数组，如单元格区域。' },
            text2: { name: '文本 2', detail: '要联接的其他文本项。 文本项最多可以有 253 个文本参数。 每个参数可以是一个字符串或字符串数组，如单元格区域。' },
        },
    },
    CONCATENATE: {
        description: '将几个文本项合并为一个文本项',
        abstract: '将几个文本项合并为一个文本项',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/concatenate-%E5%87%BD%E6%95%B0-8f8ae884-2ca8-4f7a-b093-75d702bea31d',
            },
        ],
        functionParameter: {
            text1: { name: '文本 1', detail: '要联接的第一个项目。 项目可以是文本值、数字或单元格引用。' },
            text2: { name: '文本 2', detail: '要联接的其他文本项目。 最多可以有 255 个项目，总共最多支持 8,192 个字符。' },
        },
    },
    DBCS: {
        description: '将字符串中的半角（单字节）英文字母或片假名更改为全角（双字节）字符',
        abstract: '将字符串中的半角（单字节）英文字母或片假名更改为全角（双字节）字符',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/dbcs-%E5%87%BD%E6%95%B0-a4025e73-63d2-4958-9423-21a24794c9e5',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    DOLLAR: {
        description: '使用 ￥（人民币）货币格式将数字转换为文本',
        abstract: '使用 ￥（人民币）货币格式将数字转换为文本',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/dollar-%E5%87%BD%E6%95%B0-a6cd05d9-9740-4ad3-a469-8109d18ff611',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    EXACT: {
        description: '检查两个文本值是否相同',
        abstract: '检查两个文本值是否相同',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/exact-%E5%87%BD%E6%95%B0-d3087698-fc15-4a15-9631-12575cf29926',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FIND: {
        description: '在一个文本值中查找另一个文本值（区分大小写）',
        abstract: '在一个文本值中查找另一个文本值（区分大小写）',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/find-findb-%E5%87%BD%E6%95%B0-c7912941-af2a-4bdf-a553-d0d89b0a0628',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FINDB: {
        description: '在一个文本值中查找另一个文本值（区分大小写）',
        abstract: '在一个文本值中查找另一个文本值（区分大小写）',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/find-findb-%E5%87%BD%E6%95%B0-c7912941-af2a-4bdf-a553-d0d89b0a0628',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FIXED: {
        description: '将数字格式设置为具有固定小数位数的文本',
        abstract: '将数字格式设置为具有固定小数位数的文本',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/fixed-%E5%87%BD%E6%95%B0-ffd5723c-324c-45e9-8b96-e41be2a8274a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LEFT: {
        description: '返回文本值中最左边的字符',
        abstract: '返回文本值中最左边的字符',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/left-leftb-%E5%87%BD%E6%95%B0-9203d2d2-7960-479b-84c6-1ea52b99640c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LEFTB: {
        description: '返回文本值中最左边的字符',
        abstract: '返回文本值中最左边的字符',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/left-leftb-%E5%87%BD%E6%95%B0-9203d2d2-7960-479b-84c6-1ea52b99640c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    LEN: {
        description: '返回文本字符串中的字符个数',
        abstract: '返回文本字符串中的字符个数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/len-lenb-%E5%87%BD%E6%95%B0-29236f94-cedc-429d-affd-b5e33d2c67cb',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: '要查找其长度的文本。 空格将作为字符进行计数。' },
        },
    },
    LENB: {
        description: '返回文本字符串中用于代表字符的字节数。',
        abstract: '返回文本字符串中用于代表字符的字节数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/len-lenb-%E5%87%BD%E6%95%B0-29236f94-cedc-429d-affd-b5e33d2c67cb',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: ' 要查找其长度的文本。 空格将作为字符进行计数。' },
        },
    },
    LOWER: {
        description: '将文本转换为小写。',
        abstract: '将文本转换为小写',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/lower-%E5%87%BD%E6%95%B0-3f21df02-a80c-44b2-afaf-81358f9fdeb4',
            },
        ],
        functionParameter: {
            text: {
                name: '文本',
                detail: '要转换为小写字母的文本。 LOWER 不改变文本中的非字母字符。',
            },
        },
    },
    MID: {
        description: '从文本字符串中的指定位置起返回特定个数的字符',
        abstract: '从文本字符串中的指定位置起返回特定个数的字符',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/mid-midb-%E5%87%BD%E6%95%B0-d5f9e25c-d7d6-472e-b568-4ecb12433028',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    MIDB: {
        description: '从文本字符串中的指定位置起返回特定个数的字符',
        abstract: '从文本字符串中的指定位置起返回特定个数的字符',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/mid-midb-%E5%87%BD%E6%95%B0-d5f9e25c-d7d6-472e-b568-4ecb12433028',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    NUMBERVALUE: {
        description: '以与区域设置无关的方式将文本转换为数字',
        abstract: '以与区域设置无关的方式将文本转换为数字',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/numbervalue-%E5%87%BD%E6%95%B0-1b05c8cf-2bfa-4437-af70-596c7ea7d879',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PHONETIC: {
        description: '提取文本字符串中的拼音（汉字注音）字符',
        abstract: '提取文本字符串中的拼音（汉字注音）字符',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/phonetic-%E5%87%BD%E6%95%B0-9a329dac-0c0f-42f8-9a55-639086988554',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    PROPER: {
        description: '将文本值的每个字的首字母大写',
        abstract: '将文本值的每个字的首字母大写',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/proper-%E5%87%BD%E6%95%B0-52a5a283-e8b2-49be-8506-b2887b889f94',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    REPLACE: {
        description: '替换文本中的字符',
        abstract: '替换文本中的字符',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/replace-replaceb-%E5%87%BD%E6%95%B0-8d799074-2425-4a8a-84bc-82472868878a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    REPLACEB: {
        description: '替换文本中的字符',
        abstract: '替换文本中的字符',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/replace-replaceb-%E5%87%BD%E6%95%B0-8d799074-2425-4a8a-84bc-82472868878a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    REPT: {
        description: '按给定次数重复文本',
        abstract: '按给定次数重复文本',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/rept-%E5%87%BD%E6%95%B0-04c4d778-e712-43b4-9c15-d656582bb061',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '需要重复显示的文本。' },
            numberTimes: { name: '重复次数', detail: '用于指定文本重复次数的正数。' },
        },
    },
    RIGHT: {
        description: '返回文本值中最右边的字符',
        abstract: '返回文本值中最右边的字符',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/right-rightb-%E5%87%BD%E6%95%B0-240267ee-9afa-4639-a02b-f19e1786cf2f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    RIGHTB: {
        description: '返回文本值中最右边的字符',
        abstract: '返回文本值中最右边的字符',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/right-rightb-%E5%87%BD%E6%95%B0-240267ee-9afa-4639-a02b-f19e1786cf2f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    SEARCH: {
        description: '在一个文本值中查找另一个文本值（不区分大小写）',
        abstract: '在一个文本值中查找另一个文本值（不区分大小写）',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/search-searchb-%E5%87%BD%E6%95%B0-9ab04538-0e55-4719-a72e-b6f54513b495',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    SEARCHB: {
        description: '在一个文本值中查找另一个文本值（不区分大小写）',
        abstract: '在一个文本值中查找另一个文本值（不区分大小写）',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/search-searchb-%E5%87%BD%E6%95%B0-9ab04538-0e55-4719-a72e-b6f54513b495',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    SUBSTITUTE: {
        description: '在文本字符串中用新文本替换旧文本',
        abstract: '在文本字符串中用新文本替换旧文本',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/substitute-%E5%87%BD%E6%95%B0-6434944e-a904-4336-a9b0-1e58df3bc332',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    T: {
        description: '将参数转换为文本',
        abstract: '将参数转换为文本',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/t-%E5%87%BD%E6%95%B0-fb83aeec-45e7-4924-af95-53e073541228',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TEXT: {
        description: '设置数字格式并将其转换为文本',
        abstract: '设置数字格式并将其转换为文本',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/text-%E5%87%BD%E6%95%B0-20d5ac4d-7b94-49fd-bb38-93d29371225c',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '要转换为文本的数值。' },
            formatText: { name: '数字格式', detail: '一个文本字符串，定义要应用于所提供值的格式。' },
        },
    },
    TEXTAFTER: {
        description: '返回给定字符或字符串之后出现的文本',
        abstract: '返回给定字符或字符串之后出现的文本',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/textafter-%E5%87%BD%E6%95%B0-c8db2546-5b51-416a-9690-c7e6722e90b4',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '你要在其中搜索的文本。不允许使用通配符。' },
            delimiter: { name: '分隔符', detail: '标记要在其中提取的点的文本。' },
            instanceNum: { name: '实例编号', detail: '要在其中提取文本的分隔符的实例。' },
            matchMode: { name: '匹配模式', detail: '确定文本搜索是否区分大小写。 默认为区分大小写。' },
            matchEnd: { name: '末尾匹配', detail: '将文本结尾视为分隔符。默认情况下，文本完全匹配。' },
            ifNotFound: { name: '未匹配到的值', detail: '未找到匹配项时返回的值。默认情况下，返回 #N/A。' },
        },
    },
    TEXTBEFORE: {
        description: '返回出现在给定字符或字符串之前的文本',
        abstract: '返回出现在给定字符或字符串之前的文本',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/textbefore-%E5%87%BD%E6%95%B0-d099c28a-dba8-448e-ac6c-f086d0fa1b29',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '你要在其中搜索的文本。不允许使用通配符。' },
            delimiter: { name: '分隔符', detail: '标记要在其中提取的点的文本。' },
            instanceNum: { name: '实例编号', detail: '要在其中提取文本的分隔符的实例。' },
            matchMode: { name: '匹配模式', detail: '确定文本搜索是否区分大小写。 默认为区分大小写。' },
            matchEnd: { name: '末尾匹配', detail: '将文本结尾视为分隔符。默认情况下，文本完全匹配。' },
            ifNotFound: { name: '未匹配到的值', detail: '未找到匹配项时返回的值。默认情况下，返回 #N/A。' },
        },
    },
    TEXTJOIN: {
        description: '合并来自多个区域和/或字符串的文本',
        abstract: '合并来自多个区域和/或字符串的文本',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/textjoin-%E5%87%BD%E6%95%B0-357b449a-ec91-49d0-80c3-0e8fc845691c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    TEXTSPLIT: {
        description: '使用列分隔符和行分隔符拆分文本字符串',
        abstract: '使用列分隔符和行分隔符拆分文本字符串',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/textsplit-%E5%87%BD%E6%95%B0-b1ca414e-4c21-4ca0-b1b7-bdecace8a6e7',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '要拆分的文本。' },
            colDelimiter: { name: '列分隔符', detail: '要拆分列依据的字符或字符串。' },
            rowDelimiter: { name: '行分隔符', detail: '要拆分行依据的字符或字符串。' },
            ignoreEmpty: { name: '忽略空单元格', detail: '是否忽略空单元格。默认为 FALSE。' },
            matchMode: { name: '匹配模式', detail: '搜索文本中的分隔符匹配。默认情况下，会进行区分大小写的匹配。' },
            padWith: { name: '填充值', detail: '用于填充的值。默认情况下，使用 #N/A。' },
        },
    },
    TRIM: {
        description: '删除文本中的空格',
        abstract: '删除文本中的空格',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/trim-%E5%87%BD%E6%95%B0-410388fa-c5df-49c6-b16c-9e5630b479f9',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    UNICHAR: {
        description: '返回给定数值引用的 Unicode 字符',
        abstract: '返回给定数值引用的 Unicode 字符',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/unichar-%E5%87%BD%E6%95%B0-ffeb64f5-f131-44c6-b332-5cd72f0659b8',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    UNICODE: {
        description: '返回对应于文本的第一个字符的数字（代码点）',
        abstract: '返回对应于文本的第一个字符的数字（代码点）',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/unicode-%E5%87%BD%E6%95%B0-adb74aaa-a2a5-4dde-aff6-966e4e81f16f',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    UPPER: {
        description: '将文本转换为大写形式',
        abstract: '将文本转换为大写形式',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/upper-%E5%87%BD%E6%95%B0-c11f29b3-d1a3-4537-8df6-04d0049963d6',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    VALUE: {
        description: '将文本参数转换为数字',
        abstract: '将文本参数转换为数字',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/value-%E5%87%BD%E6%95%B0-257d0108-07dc-437d-ae1c-bc2d3953d8c2',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    VALUETOTEXT: {
        description: '从任意指定值返回文本',
        abstract: '从任意指定值返回文本',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/valuetotext-%E5%87%BD%E6%95%B0-5fff61a2-301a-4ab2-9ffa-0a5242a08fea',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    CALL: {
        description: '调用动态链接库或代码源中的过程',
        abstract: '调用动态链接库或代码源中的过程',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/call-%E5%87%BD%E6%95%B0-32d58445-e646-4ffd-8d5e-b45077a5e995',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    EUROCONVERT: {
        description:
            '用于将数字转换为欧元形式，将数字由欧元形式转换为欧元成员国货币形式，或利用欧元作为中间货币将数字由某一欧元成员国货币转化为另一欧元成员国货币形式（三角转换关系）',
        abstract:
            '用于将数字转换为欧元形式，将数字由欧元形式转换为欧元成员国货币形式，或利用欧元作为中间货币将数字由某一欧元成员国货币转化为另一欧元成员国货币形式（三角转换关系）',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/euroconvert-%E5%87%BD%E6%95%B0-79c8fd67-c665-450c-bb6c-15fc92f8345c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    REGISTER_ID: {
        description: '返回已注册过的指定动态链接库 (DLL) 或代码源的注册号',
        abstract: '返回已注册过的指定动态链接库 (DLL) 或代码源的注册号',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/office/register-id-%E5%87%BD%E6%95%B0-f8f0af0f-fd66-4704-a0f2-87b27b175b50',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
};
