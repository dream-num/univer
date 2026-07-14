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
    ASC: {
        description: '将字符串中的全角（双字节）英文字母或片假名更改为半角（单字节）字符',
        abstract: '将字符串中的全角（双字节）英文字母或片假名更改为半角（单字节）字符',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/asc-function',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '文本或对包含要更改文本的单元格的引用。 如果文本不包含任何全角字母，则不会对文本进行转换。' },
        },
    },
    ARRAYTOTEXT: {
        description: 'ARRAYTOTEXT 函数返回任意指定区域内的文本值的数组。',
        abstract: 'ARRAYTOTEXT 函数返回任意指定区域内的文本值的数组。',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/arraytotext-function',
            },
        ],
        functionParameter: {
            array: { name: '数组', detail: '要返回为文本的数组。' },
            format: { name: '数据格式', detail: '返回的数据的格式。它可以是两个值之一：\n0 默认。 易于阅读的简明格式。\n1 包含转义字符和行定界符的严格格式。 生成一条可在输入编辑栏时被解析的字符串。 将返回的字符串（布尔值、数字和错误除外）封装在引号中。' },
        },
    },
    BAHTTEXT: {
        description: '使用 ß（泰铢）货币格式将数字转换为文本',
        abstract: '使用 ß（泰铢）货币格式将数字转换为文本',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/bahttext-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '要转换成文本的数字、对包含数字的单元格的引用或结果为数字的公式。' },
        },
    },
    CHAR: {
        description: '返回由代码数字指定的字符',
        abstract: '返回由代码数字指定的字符',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/char-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '介于 1 到 255 之间的数字，指定所需的字符。 使用的是当前计算机字符集中的字符。' },
        },
    },
    CLEAN: {
        description: '删除文本中所有非打印字符',
        abstract: '删除文本中所有非打印字符',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/clean-function',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '要从中删除非打印字符的任何工作表信息。' },
        },
    },
    CODE: {
        description: '返回文本字符串中第一个字符的数字代码',
        abstract: '返回文本字符串中第一个字符的数字代码',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/code-function',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '要为其获取第一个字符的代码的文本。' },
        },
    },
    CONCAT: {
        description: '将多个区域和/或字符串的文本组合起来，但不提供分隔符或 IgnoreEmpty 参数。',
        abstract: '将多个区域和/或字符串的文本组合起来，但不提供分隔符或 IgnoreEmpty 参数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/concat-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/concatenate-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/dbcs-function',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '文本或包含要转换的文本的单元格的引用。 如果文本中不包含任何半角英文字母或片假名，则不会对文本进行转换。' },
        },
    },
    DOLLAR: {
        description: '使用货币格式将数字转换为文本',
        abstract: '使用货币格式将数字转换为文本',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/dollar-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '数字、对包含数字的单元格的引用或是计算结果为数字的公式。' },
            decimals: { name: '小数位数', detail: '小数点右边的位数。 如果这是负数，则数字将舍入到小数点的左侧。 如果省略 decimals，则假设其值为 2。' },
        },
    },
    EXACT: {
        description: '检查两个文本值是否相同',
        abstract: '检查两个文本值是否相同',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/exact-function',
            },
        ],
        functionParameter: {
            text1: { name: '文本1', detail: '第一个文本字符串。' },
            text2: { name: '文本2', detail: '第二个文本字符串。' },
        },
    },
    FIND: {
        description: '在一个文本值中查找另一个文本值（区分大小写）',
        abstract: '在一个文本值中查找另一个文本值（区分大小写）',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/this-article-has-been-retired',
            },
        ],
        functionParameter: {
            findText: { name: '搜索字符串', detail: '要在“要搜索的文本”中查找的字符串。' },
            withinText: { name: '要搜索的文本', detail: '要搜索“搜索字符串”的首次出现的文本。' },
            startNum: { name: '开始位置', detail: '要在“要搜索的文本”中开始搜索的字符位置。如果省略则假定其值为 1。' },
        },
    },
    FINDB: {
        description: '在一个文本值中查找另一个文本值（区分大小写）',
        abstract: '在一个文本值中查找另一个文本值（区分大小写）',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/this-article-has-been-retired',
            },
        ],
        functionParameter: {
            findText: { name: '搜索字符串', detail: '要在“要搜索的文本”中查找的字符串。' },
            withinText: { name: '要搜索的文本', detail: '要搜索“搜索字符串”的首次出现的文本。' },
            startNum: { name: '开始位置', detail: '要在“要搜索的文本”中开始搜索的字符位置。如果省略则假定其值为 1。' },
        },
    },
    FIXED: {
        description: '将数字格式设置为具有固定小数位数的文本',
        abstract: '将数字格式设置为具有固定小数位数的文本',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/fixed-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '要进行舍入并转换为文本的数字。' },
            decimals: { name: '小数位数', detail: '小数点右边的位数。 如果这是负数，则数字将舍入到小数点的左侧。 如果省略 decimals，则假设其值为 2。' },
            noCommas: { name: '禁用分隔符', detail: '一个逻辑值，如果为 TRUE，则会禁止 FIXED 在返回的文本中包含逗号。' },
        },
    },
    LEFT: {
        description: '返回文本值中最左边的字符',
        abstract: '返回文本值中最左边的字符',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/left-function',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '包含要提取字符的文本字符串。' },
            numChars: { name: '字符数', detail: '指定希望 LEFT 提取的字符数。' },
        },
    },
    LEFTB: {
        description: '返回文本值中最左边的字符。',
        abstract: '返回文本值中最左边的字符',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/left-function',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '包含要提取字符的文本字符串。' },
            numBytes: { name: '字节数', detail: '按字节指定要由 LEFTB 提取的字符的数量。' },
        },
    },
    LEN: {
        description: '返回文本字符串中的字符个数',
        abstract: '返回文本字符串中的字符个数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/len-function',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '要查找其长度的文本。 空格将作为字符进行计数。' },
        },
    },
    LENB: {
        description: '返回文本字符串中用于代表字符的字节数。',
        abstract: '返回文本字符串中用于代表字符的字节数',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/len-function',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '要查找其长度的文本。 空格将作为字符进行计数。' },
        },
    },
    LOWER: {
        description: '将文本转换为小写。',
        abstract: '将文本转换为小写',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/lower-function',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '要转换为小写字母的文本。' },
        },
    },
    MID: {
        description: '从文本字符串中的指定位置起返回特定个数的字符',
        abstract: '从文本字符串中的指定位置起返回特定个数的字符',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/mid-function',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '包含要提取字符的文本字符串。' },
            startNum: { name: '开始位置', detail: '文本中要提取的第一个字符的位置。' },
            numChars: { name: '字符数', detail: '指定希望 MID 提取的字符数。' },
        },
    },
    MIDB: {
        description: '从文本字符串中的指定位置起返回特定个数的字符',
        abstract: '从文本字符串中的指定位置起返回特定个数的字符',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/mid-function',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '包含要提取字符的文本字符串。' },
            startNum: { name: '开始位置', detail: '文本中要提取的第一个字符的位置。' },
            numBytes: { name: '字节数', detail: '按字节指定要由 MIDB 提取的字符的数量。' },
        },
    },
    NUMBERSTRING: {
        description: '将数字转换为中文字符串',
        abstract: '将数字转换为中文字符串',
        links: [
            {
                title: '教学',
                url: 'https://www.wps.cn/learning/course/detail/id/340.html?chan=pc_kdocs_function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '被转化为中文字符串的数值。' },
            type: { name: '类型', detail: '返回结果的类型。\n1. 汉字小写 \n2. 汉字大写 \n3. 汉字读写' },
        },
    },
    NUMBERVALUE: {
        description: '以与区域设置无关的方式将文本转换为数字',
        abstract: '以与区域设置无关的方式将文本转换为数字',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/numbervalue-function',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '要转换为数字的文本。' },
            decimalSeparator: { name: '小数分隔符', detail: '用于分隔结果的整数和小数部分的字符。' },
            groupSeparator: { name: '分组分隔符', detail: '用于分隔数字分组的字符。' },
        },
    },
    PHONETIC: {
        description: '提取文本字符串中的拼音（汉字注音）字符',
        abstract: '提取文本字符串中的拼音（汉字注音）字符',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/phonetic-function',
            },
        ],
        functionParameter: {
            reference: { name: '引用', detail: '包含要提取的拼音文本的文本、区域或引用。' },
        },
    },
    PROPER: {
        description: '将文本值的每个字的首字母大写',
        abstract: '将文本值的每个字的首字母大写',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/proper-function',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '用引号括起来的文本、返回文本值的公式，或者对包含要进行部分大写转换文本的单元格的引用。' },
        },
    },
    REGEXEXTRACT: {
        description: '根据正则表达式提取第一个匹配的子字符串。',
        abstract: '根据正则表达式提取第一个匹配的子字符串。',
        links: [
            {
                title: '教学',
                url: 'https://support.google.com/docs/answer/3098244?hl=zh-Hans',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '提示 ：上面的示例将返回两列数据：第一列中的“extract”，第二列为“values”。' },
            regularExpression: { name: '正则表达式', detail: '此函数将返回 text 中符合此表达式的第一个字符串。' },
        },
    },
    REGEXMATCH: {
        description: '判断一段文本是否与正则表达式相匹配。',
        abstract: '判断一段文本是否与正则表达式相匹配。',
        links: [
            {
                title: '教学',
                url: 'https://support.google.com/docs/answer/3098292?hl=zh-Hans',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '要用正则表达式测试的文本。' },
            regularExpression: { name: '正则表达式', detail: '用来测试文本的正则表达式。' },
        },
    },
    REGEXREPLACE: {
        description: '使用正则表达式将文本字符串中的一部分替换为其他文本字符串。',
        abstract: '使用正则表达式将文本字符串中的一部分替换为其他文本字符串。',
        links: [
            {
                title: '教学',
                url: 'https://support.google.com/docs/answer/3098245?hl=zh-Hans',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '其中一部分将被替换的文本。' },
            regularExpression: { name: '正则表达式', detail: '正则表达式。text 中所有匹配的实例都将被替换。' },
            replacement: { name: '替换内容', detail: '要插入到原有文本中的文本。' },
        },
    },
    REPLACE: {
        description: '替换文本中的字符',
        abstract: '替换文本中的字符',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/replace-function',
            },
        ],
        functionParameter: {
            oldText: { name: '旧文本', detail: '要替换其部分字符的文本。' },
            startNum: { name: '开始位置', detail: '文本中要替换的第一个字符的位置。' },
            numChars: { name: '字符数', detail: '指定希望 REPLACE 替换的字符数。' },
            newText: { name: '替换文本', detail: '将替换旧文本中字符的文本。' },
        },
    },
    REPLACEB: {
        description: '替换文本中的字符',
        abstract: '替换文本中的字符',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/replace-function',
            },
        ],
        functionParameter: {
            oldText: { name: '旧文本', detail: '要替换其部分字符的文本。' },
            startNum: { name: '开始位置', detail: '文本中要替换的第一个字符的位置。' },
            numBytes: { name: '字节数', detail: '按字节指定要由 REPLACEB 替换的字符的数量。' },
            newText: { name: '替换文本', detail: '将替换旧文本中字符的文本。' },
        },
    },
    REPT: {
        description: '按给定次数重复文本',
        abstract: '按给定次数重复文本',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/rept-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/right-function',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '包含要提取字符的文本字符串。' },
            numChars: { name: '字符数', detail: '指定希望 RIGHT 提取的字符数。' },
        },
    },
    RIGHTB: {
        description: '返回文本值中最右边的字符',
        abstract: '返回文本值中最右边的字符',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/right-function',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '包含要提取字符的文本字符串。' },
            numBytes: { name: '字节数', detail: '按字节指定要由 RIGHTB 提取的字符的数量。' },
        },
    },
    SEARCH: {
        description: '在一个文本值中查找另一个文本值（不区分大小写）',
        abstract: '在一个文本值中查找另一个文本值（不区分大小写）',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/search-function',
            },
        ],
        functionParameter: {
            findText: { name: '搜索字符串', detail: '要在“要搜索的文本”中查找的字符串。' },
            withinText: { name: '要搜索的文本', detail: '要搜索“搜索字符串”的首次出现的文本。' },
            startNum: { name: '开始位置', detail: '要在“要搜索的文本”中开始搜索的字符位置。如果省略则假定其值为 1。' },
        },
    },
    SEARCHB: {
        description: '在一个文本值中查找另一个文本值（不区分大小写）',
        abstract: '在一个文本值中查找另一个文本值（不区分大小写）',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/search-function',
            },
        ],
        functionParameter: {
            findText: { name: '搜索字符串', detail: '要在“要搜索的文本”中查找的字符串。' },
            withinText: { name: '要搜索的文本', detail: '要搜索“搜索字符串”的首次出现的文本。' },
            startNum: { name: '开始位置', detail: '要在“要搜索的文本”中开始搜索的字符位置。如果省略则假定其值为 1。' },
        },
    },
    SUBSTITUTE: {
        description: '在文本字符串中用新文本替换旧文本',
        abstract: '在文本字符串中用新文本替换旧文本',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/substitute-function',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '需要替换其中字符的文本，或对含有文本（需要替换其中字符）的单元格的引用。' },
            oldText: { name: '搜索文本', detail: '需要替换的文本。' },
            newText: { name: '替换文本', detail: '用于替换 old_text 的文本。' },
            instanceNum: { name: '指定替换对象', detail: '指定要将第几个 old_text 替换为 new_text。 如果指定了 instance_num，则只有满足要求的 old_text 被替换。 否则，文本中出现的所有 old_text 都会更改为 new_text。' },
        },
    },
    T: {
        description: '将参数转换为文本',
        abstract: '将参数转换为文本',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/t-function',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '要测试的值。' },
        },
    },
    TEXT: {
        description: '设置数字格式并将其转换为文本',
        abstract: '设置数字格式并将其转换为文本',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/text-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/textafter-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/textbefore-function',
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/textjoin-function',
            },
        ],
        functionParameter: {
            delimiter: { name: '分隔符', detail: '文本字符串，或者为空，或用双引号引起来的一个或多个字符，或对有效文本字符串的引用。' },
            ignoreEmpty: { name: '忽略空白', detail: '如果为 TRUE，则忽略空白单元格。' },
            text1: { name: '文本1', detail: '要联接的文本项。 文本字符串或字符串数组，如单元格区域中。' },
            text2: { name: '文本2', detail: '要联接的其他文本项。 文本项最多可以包含 252 个文本参数 text1。 每个参数可以是一个文本字符串或字符串数组，如单元格区域。' },
        },
    },
    TEXTSPLIT: {
        description: '使用列分隔符和行分隔符拆分文本字符串',
        abstract: '使用列分隔符和行分隔符拆分文本字符串',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/textsplit-function',
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
        description: '除了单词之间的单个空格之外，删除文本中的所有空格。',
        abstract: '删除文本中的空格',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/trim-function',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '要从中删除空格的文本。' },
        },
    },
    UNICHAR: {
        description: '返回给定数值引用的 Unicode 字符',
        abstract: '返回给定数值引用的 Unicode 字符',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/unichar-function',
            },
        ],
        functionParameter: {
            number: { name: '数值', detail: '是表示字符的 Unicode 编号。' },
        },
    },
    UNICODE: {
        description: '返回对应于文本的第一个字符的数字（代码点）',
        abstract: '返回对应于文本的第一个字符的数字（代码点）',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/unicode-function',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '是需要 Unicode 值的字符。' },
        },
    },
    UPPER: {
        description: '将文本转换为大写形式',
        abstract: '将文本转换为大写形式',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/upper-function',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '要转换为大写字母的文本。' },
        },
    },
    VALUE: {
        description: '将文本参数转换为数字',
        abstract: '将文本参数转换为数字',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/value-function',
            },
        ],
        functionParameter: {
            text: { name: '文本', detail: '用引号括起来的文本或包含要转换文本的单元格的引用。' },
        },
    },
    VALUETOTEXT: {
        description: '从任意指定值返回文本',
        abstract: '从任意指定值返回文本',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/valuetotext-function',
            },
        ],
        functionParameter: {
            value: { name: '值', detail: '以文本形式返回的值。' },
            format: { name: '数据格式', detail: '返回的数据的格式。它可以是两个值之一：\n0 默认。 易于阅读的简明格式。\n1 包含转义字符和行定界符的严格格式。 生成一条可在输入编辑栏时被解析的字符串。 将返回的字符串（布尔值、数字和错误除外）封装在引号中。' },
        },
    },
    CALL: {
        description: '调用动态链接库或代码源中的过程',
        abstract: '调用动态链接库或代码源中的过程',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/call-function',
            },
        ],
        functionParameter: {
            moduleText: { name: '模块文本', detail: '包含过程的动态链接库 (DLL) 名称。' },
            procedure: { name: '过程', detail: 'DLL 中的过程名称或序号。' },
            typeText: { name: '类型文本', detail: '指定参数和返回值数据类型的文本。' },
            argument1: { name: '参数 1', detail: '可选。传递给过程的第一个参数。' },
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
                url: 'https://support.microsoft.com/zh-cn/excel/functions/euroconvert-function',
            },
        ],
        functionParameter: {
            number: { name: '数字', detail: '要换算的货币值。' },
            source: { name: '源货币', detail: '源货币代码。' },
            target: { name: '目标货币', detail: '目标货币代码。' },
            fullPrecision: { name: '完整精度', detail: '控制是否按货币特定规则舍入的逻辑值。' },
            triangulationPrecision: { name: '三角换算精度', detail: '可选。通过欧元进行中间换算时使用的有效位数。' },
        },
    },
    REGISTER_ID: {
        description: '返回已注册过的指定动态链接库 (DLL) 或代码源的注册号',
        abstract: '返回已注册过的指定动态链接库 (DLL) 或代码源的注册号',
        links: [
            {
                title: '教学',
                url: 'https://support.microsoft.com/zh-cn/excel/functions/register-id-function',
            },
        ],
        functionParameter: {
            moduleText: { name: '模块文本', detail: '包含过程的 DLL 或代码资源名称。' },
            procedure: { name: '过程', detail: '过程名称或序号。' },
            typeText: { name: '类型文本', detail: '可选。指定参数和返回值数据类型的文本。' },
        },
    },
};

export default locale;
